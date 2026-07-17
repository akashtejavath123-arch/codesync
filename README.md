# 🚀 CodeSync – Real-Time Collaborative Code Editor

CodeSync is a real-time collaborative code editor where multiple users can join a room, edit code together, and track all connected collaborators instantly.  
It uses **React**, **Socket.io**, **Firebase Authentication**, and **Firestore** to deliver a smooth and scalable live coding experience.

---

## Features

**Authentication**
- Google OAuth using Firebase Authentication  
- Secure login/logout  
- Auto-create user profile on first login  

**Real-Time Collaboration**
- Multiple users can edit simultaneously  
- Live typing sync using Socket.io  
- Automatic code broadcasting to all connected clients  
- Cursor-safe updates (no jumps or overwrite issues)

**Rooms & Collaboration**
- Create new collaboration rooms  
- Join existing rooms using Room ID  
- View list of active collaborators  
- Firestore stores collaborator data

**Code Persistence**
- Last updated code is automatically saved in Firestore  
- When a user enters the room, the latest code is fetched  
- Debounced saving avoids unnecessary writes

**Project Details Page**
- Shows room name, description, owner, room ID  
- Shows all collaborators  
- Displays last updated time & saved code snippet

**UI/UX**
- Responsive interface using TailwindCSS  
- Sidebar with real-time user list  
- Editor built using CodeMirror

---

## 🛠️ Tech Stack

**Frontend**
- React.js  
- React Router  
- CodeMirror Editor  
- Tailwind CSS  
- React Hot Toast  

**Backend**
- Node.js + Express  
- Socket.io WebSocket Server  

**Database / Auth**
- Firebase Authentication  
- Firebase Firestore  

---

## Setup & Installation

1. **Clone the repository**
   - git clone https://github.com/kcs0727/CodeSync.git
   - cd ./CodeSync

2. **Install dependencies** (both frontend & backend)
   - cd ./backend && npm install
   - cd ../frontend && npm install
   
3. **Backend environment variables**
   - PORT=8000
   - FRONTEND_URL=your_frontend_url

4. **Frontend environment variables**
   - VITE_BACKEND_URL=your_backendend_url
   - VITE_apiKey=get_from_firebase
   - VITE_authDomain=get_from_firebase
   - VITE_projectId=get_from_firebase
   - VITE_storageBucket=get_from_firebase
   - VITE_messagingSenderId=get_from_firebase
   - VITE_appId=get_from_firebase
   - VITE_measurementId=get_from_firebase

---

## Upcoming Features

- Chat/Discussion inside room
- Code execution using Judge0 API
- File explorer & multi-file editing
- Light/Dark themes
