import React, { useState } from 'react'
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AuthData } from '../context/Authcontext';

import { createRoom, addCollaborator } from "../firestore/roomService";
import { addRoomToUser } from "../firestore/userService";


const Collaboration = () => {

    const { user } = AuthData();
    const [joinRoomId, setJoinRoomId] = useState("");
    const [newRoomId, setNewRoomId] = useState("");
    const [roomName, setRoomName] = useState("");
    const [roomDesc, setRoomDesc] = useState("");
    const navigate = useNavigate();


    const generateNewRoom = () => {
        const id = uuidV4();
        setNewRoomId(id);
        toast.success("Generated Room ID");
    }

    const createRoomHandler = async (e) => {
        e.preventDefault();

        const cleanRoomId = newRoomId.trim();
        const cleanRoomName = roomName.trim();
        const cleanRoomDesc = roomDesc.trim();

        if (!cleanRoomId || !cleanRoomName || !cleanRoomDesc) {
            toast.error("Room ID & Name required");
            return;
        }

        try {
            await createRoom(cleanRoomId, {
                roomName: cleanRoomName,
                description: cleanRoomDesc,
                createdBy: user.uid,
            });
            await addRoomToUser(user.uid, cleanRoomId, true);

            toast.success("Room created successfully!");
            navigate(`/project/${cleanRoomId}`, {
                state: { 
                    roomName: cleanRoomName, 
                    description: cleanRoomDesc 
                },
            });
        }
        catch (err) {
            toast.error("Error creating room");
            console.log(err);
        }
    }

    const joinRoomHandler = async (e) => {
        e.preventDefault();

        const cleanRoomId = joinRoomId.trim();
        if (!cleanRoomId) {
            toast.error("Enter room ID");
            return;
        }
        try {
            await addCollaborator(cleanRoomId, user.uid);
            await addRoomToUser(user.uid, cleanRoomId, false);

            toast.success("Joined room successfully");
            navigate(`/project/${cleanRoomId}`);
        }
        catch (err) {
            toast.error("Invalid room ID or error joining room");
            console.log(err);
        }
    }


    return (
        <div className='flex items-center justify-center h-[calc(100vh-70px)] p-2'>

            <div className='bg-[#15161f] p-4 sm:p-8 rounded-lg w-md max-w-[90vw] shadow-md shadow-gray-500 border-t-2 border-gray-500/50'>

                <h2 className='text-2xl text-[#4aed88] font-bold text-center mb-6'>Collaboration Rooms</h2>

                {/* join a room */}
                <form onSubmit={joinRoomHandler} className='flex flex-col
                gap-4'>

                    <h3 className='text-md font-semibold'>Enter an invite room ID</h3>

                    <div className="flex gap-2">
                        <input type="text" placeholder='Room ID' value={joinRoomId} onChange={(e) => setJoinRoomId(e.target.value)} required />

                        <button type='submit' className='bg-indigo-500 hover:bg-indigo-600  px-3 py-1 rounded text-white cursor-pointer'>Join</button>
                    </div>

                </form>

                <hr className="border-gray-600 my-8" />

                {/* create new room */}
                <form onSubmit={createRoomHandler} className='flex flex-col
                gap-4'>

                    <h3 className='text-md font-semibold'>Create New Room</h3>

                    <div className="flex gap-2">
                        <input type="text" placeholder='Room ID will be auto-generated' value={newRoomId} disabled required />

                        <button type="button" onClick={generateNewRoom} className="bg-indigo-500 hover:bg-indigo-600  px-3 py-1 rounded text-white cursor-pointer">Generate</button>
                    </div>

                    <input type="text" placeholder='Room name' value={roomName} onChange={(e) => setRoomName(e.target.value)} required />

                    <textarea placeholder='Room description' value={roomDesc} onChange={(e) => setRoomDesc(e.target.value)} required />

                    <button type='submit' className="w-full bg-indigo-500 hover:bg-indigo-600 py-1 rounded-md text-white cursor-pointer">Create Room</button>

                </form>
            </div>

        </div>
    )
}

export default Collaboration;