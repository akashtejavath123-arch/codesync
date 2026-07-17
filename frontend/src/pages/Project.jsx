import React, { useEffect, useRef, useState } from 'react'
import Editor from '../components/Editor';
import Sidebar from '../components/Sidebar';
import { initSocket } from '../socketio/socket';
import ACTIONS from '../socketio/actions';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthData } from '../context/Authcontext';


const Project = () => {

    const socketRef = useRef(null);
    const codeRef= useRef(null);
    const navigate = useNavigate();
    const { roomId } = useParams();
    const {user} = AuthData();
    const [clients, setClients] = useState([]);


    useEffect(() => {
        if (socketRef.current) return;

        const init = async () => {
            socketRef.current = await initSocket();

            socketRef.current.on("connect_error", () => handleError());
            socketRef.current.on("connect_failed", () => handleError());
            function handleError() {
                toast.error("Socket connection failed");
                navigate("/collaboration");
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                newuser: user.displayName,
            });

            socketRef.current.on(ACTIONS.JOINED, ({ clients, newuser, socketId }) => {
                if (socketId !== socketRef.current.id) {
                    toast.success(`${newuser} joined the room.`)
                    socketRef.current.emit(ACTIONS.SYNC_CODE,{
                        code: codeRef.current,
                        socketId
                    });
                }
                setClients(clients);
            });

            socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
                toast.success(`${username} disconnected from the room.`)
                setClients((prev) => prev.filter((c) => c.socketId !== socketId));
            });
        }

        init();

        return () => {
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
            socketRef.current.disconnect();
        }
    }, []);
    


    return (
        <div className='h-[calc(100vh-70px)] flex gap-1 p-2'>

            <Sidebar clients={clients} roomId={roomId}/>

            <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code)=>codeRef.current=code} />

        </div>
    )
}

export default Project