import React, { useEffect, useRef } from 'react'

import Codemirror from 'codemirror'
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/theme/dracula.css';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../socketio/actions';

import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { updateRoomCode } from "../firestore/roomService";


const Editor = ({ socketRef, roomId, onCodeChange }) => {

    const editorRef = useRef(null);
    const editorInstance = useRef(null);
    let saveTimeout = null;

    // Load last code from Firestore
    const loadInitialCode = async () => {
        try {
            const roomRef = doc(db, "rooms", roomId);
            const snap = await getDoc(roomRef);

            if (snap.exists()) {
                const savedCode = snap.data().lastUpdatedCode || "";
                editorInstance.current.setValue(savedCode);
                onCodeChange(savedCode);
            }
        } catch (err) {
            console.log("Error loading code:", err);
        }
    };

    // Firestore save
    const saveToFirestoreDebounced = (code) => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            updateRoomCode(roomId, code);
        }, 1500);
    };


    useEffect(() => {

        if (editorInstance.current) return;

        const init = async () => {
            editorInstance.current = Codemirror.fromTextArea(editorRef.current, {
                mode: { name: 'javascript', json: true },
                theme: 'dracula',
                autoCloseTags: true,
                autoCloseBrackets: true,
                lineNumbers: true
            });

            editorInstance.current.setSize("100%", "100%");

            await loadInitialCode();

            editorInstance.current.on("change", (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);
                //origin tells what changes made like type, erase,cut,paste
                // prevent infinite loop
                if (origin !== "setValue") {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code
                    });

                    saveToFirestoreDebounced(code);
                }
            });

        }

        init();
    }, [])


    useEffect(() => {
        if (!socketRef.current) return;

        socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
            if (code !== editorInstance.current.getValue()) {
                // Only update if the code is different (avoid cursor jump)
                editorInstance.current.setValue(code);
            }
        });

        return () => socketRef.current.off(ACTIONS.CODE_CHANGE);
    }, [socketRef.current]);



    return (
        <div className='h-full w-full bg-[#15161f] p-2 rounded-md'>
            <textarea ref={editorRef}></textarea>
        </div>
    )
}

export default Editor




