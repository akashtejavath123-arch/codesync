import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { auth, googleProvider } from "../firebase/config";
import { createUserIfNotExists } from "../firestore/userService";

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuth, setisAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({});
    const [rooms, setRooms] = useState([]);
    

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setisAuth(currentUser ? true : false);
            setLoading(false);
        });

        return () => unsub();
    }, []);


    useEffect(() => {
        if (!user) return;

        const fetchUserAndRooms = async () => {
            try {
                //fetchuser
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) return;
                const data = userSnap.data();
                setUserData(data);
                const roomIds = data.roomsJoined || [];

                //fetch all rooms of user
                const roomDocs = await Promise.all(
                    roomIds.map(async (id) => {
                        const roomRef = doc(db, "rooms", id);
                        const roomSnap = await getDoc(roomRef);

                        if (!roomSnap.exists()) return null;
                        const r = roomSnap.data();

                        //fetch room creator name using userID
                        let creatorName = "Unknown";
                        if (r.createdBy) {
                            const cRef = doc(db, "users", r.createdBy);
                            const cSnap = await getDoc(cRef);
                            if (cSnap.exists()) creatorName = cSnap.data().name || creatorName;
                        }

                        return { id, creatorName, ...r };
                    })
                );

                //sorting by updatetime
                const allRooms = roomDocs.filter(Boolean);
                allRooms.sort((a, b) => {
                    const d1 = a.updatedAt?.toDate() || new Date(0);
                    const d2 = b.updatedAt?.toDate() || new Date(0);
                    return d2 - d1;
                });

                setRooms(allRooms);
            }
            catch (err) {
                toast.error("Error loading activity");
                console.error(err);
            }
        }

        fetchUserAndRooms();

    }, [user])


    async function login() {
        const result = await signInWithPopup(auth, googleProvider);
        const firebaseUser = result.user;

        await createUserIfNotExists(firebaseUser);

        setUser(firebaseUser);
        setisAuth(true);
    }

    async function logout() {
        if (confirm("Are you sure? Want to logout ?")) {
            await signOut(auth);
            setUser(null);
            setisAuth(false);
        }
    }


    return (
        <AuthContext.Provider value={{ user, isAuth, login, logout, loading, userData, rooms }}>
            {children}
            <Toaster />
        </AuthContext.Provider>
    );
}

export const AuthData = () => useContext(AuthContext);