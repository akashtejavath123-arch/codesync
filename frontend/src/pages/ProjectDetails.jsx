import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import toast from "react-hot-toast";

const ProjectDetails = () => {
  const { roomId } = useParams();
  const navigate= useNavigate();

  const [room, setRoom] = useState(null);
  const [owner, setOwner] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const roomRef = doc(db, "rooms", roomId);
        const roomSnap = await getDoc(roomRef);

        if (!roomSnap.exists()) {
          toast.error("Room not found");
          setLoading(false);
          return;
        }

        const roomData = roomSnap.data();
        setRoom(roomData);

        // Fetch owner
        const ownerRef = doc(db, "users", roomData.createdBy);
        const ownerSnap = await getDoc(ownerRef);
        setOwner(ownerSnap.exists() ? ownerSnap.data() : null);

        // Fetch collaborators
        const collaboratorList = await Promise.all(
          (roomData.collaborators || []).map(async (userId) => {
            const uRef = doc(db, "users", userId);
            const uSnap = await getDoc(uRef);
            return uSnap.exists() ? uSnap.data() : null;
          })
        );

        setCollaborators(collaboratorList.filter(Boolean));
        setLoading(false);
      }
      catch (err) {
        console.error(err);
        toast.error("Failed to load project details");
      }
    };

    fetchRoom();
  }, [roomId]);


  const formatDate = (dateLike) => {
    if (!dateLike) return "Unknown";
    const d = typeof dateLike.toDate === "function" ? dateLike.toDate() : new Date(dateLike);
    return d.toLocaleString();
  };


  if (loading) return <div className="text-center text-white mt-2">Loading...</div>;

  return (
    <div className="p-4">

      {/* Room Header */}
      <div className="p-4 border border-gray-600 rounded-xl bg-[#15161f] mb-5">

        <h1 className="flex justify-between">
          <span className="text-2xl font-bold text-[#4aed88] ">{room.roomName}</span>
          <button onClick={() => navigate(`/project/${roomId}`)} className="px-3 py-1 bg-[#4aed88] text-black font-semibold rounded-lg hover:bg-[#3ecd70] transition cursor-pointer">
            Join Room
          </button>
        </h1>

        <p className="mt-2">{room.description}</p>

        <div className="mt-4 text-sm flex flex-col gap-1 text-gray-400">
          <p>
            <span className="font-semibold text-gray-200">Room ID:</span> {roomId}
          </p>
          <p>
            <span className="font-semibold text-gray-200">Created By: </span>{" "}
            {owner?.name || "Unknown"}
          </p>
          <p>
            <span className="font-semibold text-gray-200">Created At: </span>{" "}
            {formatDate(room.createdAt)}
          </p>
        </div>
      </div>

      {/* Collaborators */}
      <div className="p-4 border border-gray-600 rounded-xl bg-[#15161f] mb-5">
        <h2 className="text-xl font-semibold mb-3 text-[#4aed88]">Collaborators</h2>

        {collaborators.length === 0 ? (
          <p className="text-gray-400">No collaborators yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {collaborators.map((c, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#1a1b26] p-2 rounded-lg">
                <img key={c.photo || "https://ui-avatars.com/api/?name=User"}
                  src={c.photo || "https://ui-avatars.com/api/?name=User"}
                  className="w-10 h-10 rounded-full object-cover border border-gray-600"
                />
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-gray-400 text-sm">{c.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Code Information */}
      <div className="p-4 border border-gray-600 rounded-xl bg-[#15161f] mb-5">
        <h2 className="text-xl font-semibold mb-3 text-[#4aed88]">Activity</h2>

        <p className="text-gray-400 text-sm mb-1">
          <span className="font-semibold text-gray-200">Last Updated At:</span>{" "}
          {formatDate(room.updatedAt)}
        </p>

        <p className="text-gray-300 mb-1">
          <span className="font-semibold text-gray-200">Last Updated Code:</span>
        </p>

        <div className="bg-[#1a1b26] p-2 rounded-lg mb-2 text-gray-400">
          {room.lastUpdatedCode || "No updates yet"}
        </div>
      </div>

      
    </div>
  );
};

export default ProjectDetails;
