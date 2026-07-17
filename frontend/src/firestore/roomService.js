import { doc, setDoc, updateDoc, collection, addDoc, arrayUnion, serverTimestamp as timestamp } from "firebase/firestore";
import { db } from "../firebase/config";


export async function createRoom(roomId, data) {
  const roomRef = doc(db, "rooms", roomId);

  await setDoc(roomRef, {
    roomName: data.roomName,
    description: data.description,
    createdBy: data.createdBy, 
    createdAt: timestamp(),
    lastUpdatedCode: "",
    updatedAt: timestamp(),
    collaborators: [data.createdBy]
  });
}


export async function updateRoomCode(roomId, code) {
  const roomRef = doc(db, "rooms", roomId);

  await updateDoc(roomRef, {
    lastUpdatedCode: code,
    updatedAt: timestamp()
  });
}


export async function addCollaborator(roomId, userId) {
  const roomRef = doc(db, "rooms", roomId);

  await updateDoc(roomRef, {
    collaborators: arrayUnion(userId)
  });
}


export async function sendChat(roomId, userId, message) {
  const chatRef = collection(db, "rooms", roomId, "chats");

  await addDoc(chatRef, {
    userId,
    message,
    timestamp: timestamp()
  });
}