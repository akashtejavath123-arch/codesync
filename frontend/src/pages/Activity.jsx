import React from 'react'
import { AuthData } from '../context/Authcontext';
import { useNavigate } from 'react-router-dom';

const Activity = () => {

  const {user, userData, rooms} = AuthData();
  const navigate = useNavigate();
  

  const formatDate = (dateLike) => {
    if (!dateLike) return "Unknown";
    const d = typeof dateLike.toDate === "function" ? dateLike.toDate() : new Date(dateLike);
    return d.toLocaleString();
  };


  return (
    <div className='flex flex-col items-center min-h-[calc(100vh-70px)] p-2'>

      {/* user card */}
      <div className="w-lg max-w-[95vw]  border-2 border-gray-600 rounded-xl p-4 flex items-center gap-5 md:gap-10 my-3 bg-[#15161f]">

        <img key={userData?.photo || user?.photoURL} src={userData?.photo || user?.photoURL || "https://ui-avatars.com/api/?name=User"}
          alt="avatar" className="size-25 rounded-full object-cover border border-gray-700" />

        <div className="flex flex-col gap-2">
          <div className="font-semibold">Name: {userData?.name || user?.displayName || "Unknown User"}</div>
          <div className="text-sm text-gray-200">Email: {userData?.email || user?.email || "no-email@example.com"}</div>
          <div className="text-sm text-gray-400">User from: {formatDate(userData.createdAt)}</div>
        </div>

      </div>

      {/* room list */}
      <div className="w-full max-w-[95vw] flex flex-col gap-2 mt-4">

        {rooms.length === 0 && (
          <div className="text-gray-200 text-center mt-10">
            No rooms found.
          </div>
        )}

        {rooms.map((room) => (
          <div key={room.id} onClick={() => navigate(`/projectdetails/${room.id}`)} className="cursor-pointer p-4 bg-[#15161f] hover:bg-[#1a1c23] border border-[#4aed88]/20 rounded-lg flex justify-between transition">

            <div className='flex flex-col justify-between'>
              <div className='font-semibold text-lg'>{room.roomName || "Untitled Room"}</div>
              <div className='text-sm text-gray-300'>{room.description || "No description provided."}</div>
            </div>

            {/* Right side */}
            <div className='text-right text-sm flex flex-col justify-between'>
              <div className='text-gray-300'>Created by: {room.creatorName || "unknown"}</div>
              <div className='text-gray-400 text-xs'>Last updated: {formatDate(room.updatedAt)}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  )
}

export default Activity