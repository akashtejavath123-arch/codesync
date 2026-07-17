import React, { useEffect, useState } from 'react'
import Avatar from 'react-avatar';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";


const Sidebar = ({ clients, roomId }) => {

    const navigate = useNavigate();
    const [roomDetails, setRoomDetails] = useState(null);

    const fetchRoomData = async () => {
        try {
            const roomRef = doc(db, "rooms", roomId);
            const snap = await getDoc(roomRef);

            if (snap.exists()) {
                const data = snap.data();
                setRoomDetails(data);
            }
        }
        catch (err) {
            console.log("Error fetching room data:", err);
        }
    };

    useEffect(() => {
        fetchRoomData();
    }, [roomId]);


    const copyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success("Room Id copied");
        }
        catch (err) {
            toast.error("could not copy Room Id");
            console.log(err);
        }
    }

    const leaveRoom = () => {
        navigate("/");
    }


    return (
        <div className='flex flex-col justify-between w-[250px] rounded-md bg-[#15161f] p-2 h-[calc(100vh-86px)] overflow-auto'>

            <div >
                <h2 className="text-xl font-bold text-[#4aed88] mb-2">
                    {roomDetails?.roomName || "Room"}
                </h2>

                <p className="text-sm text-gray-300 leading-snug mb-4">
                    {roomDetails?.description || "No description"}
                </p>

                <h3 className='text-lg font-bold py-1 rounded border-b-2 border-[#52545f] mb-2'>Active users</h3>

                <div className='flex flex-col gap-2 h-full'>{
                    clients.map((client) => (
                        <div className='flex items-center gap-1' key={client.socketId} >
                            <Avatar name={client.username} size={30} round='8px' />
                            <span className='text-[12px] wrap-break-words leading-tight'>{client.username}</span>
                        </div>
                    ))
                }</div>
            </div>

            <div className='flex flex-col gap-3 text-black font-semibold mt-8'>
                <button className="flex items-center justify-center gap-2 bg-white/90 border border-white/15 rounded p-1 cursor-pointer" onClick={()=>navigate(`/project/${roomId}/details`)}>
                    <span>More details</span>
                    <svg className="mt-0.5" width="6" height="8" viewBox="0 0 6 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.25.5 4.75 4l-3.5 3.5" stroke="currentColor" strokeOpacity=".4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <button className='bg-[#4aed88]/90 p-1 rounded cursor-pointer' onClick={copyRoomId}>Copy Room Id</button>
                <button className='bg-red-400/90 p-1 rounded cursor-pointer' onClick={leaveRoom}>Leave Room </button>
            </div>
        </div>
    )
}

export default Sidebar