import { doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp as timestamp } from "firebase/firestore";
import { db } from "../firebase/config";


export async function createUserIfNotExists(user) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      name: user.displayName,
      email: user.email,
      photo: user.photoURL,
      createdAt: timestamp(),
      roomsCreated: [],
      roomsJoined: []
    });
  }
}


export async function addRoomToUser(userId, roomId, created = false) {
  const userRef = doc(db, "users", userId);

  if (created) {
    await updateDoc(userRef, {
      roomsCreated: arrayUnion(roomId),
      roomsJoined: arrayUnion(roomId)
    });
  }
  else{
     await updateDoc(userRef, {
      roomsJoined: arrayUnion(roomId)
    });
  }
}