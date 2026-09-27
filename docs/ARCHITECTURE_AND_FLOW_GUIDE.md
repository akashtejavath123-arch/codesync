# CodeSync: Complete System Architecture, Lifecycle Flows & Engineering Solutions

This document is the definitive master architectural and operational guide for **CodeSync**. It covers the complete end-to-end system design, low-level data flows (authentication, cryptographic token generation, UUID creation, real-time WebSocket multiplexing), and an exhaustive analysis of the real-world distributed systems challenges and bugs encountered—along with their exact engineering mitigations.

---

## Table of Contents
1. [Global System Architecture & Topology](#1-global-system-architecture--topology)
2. [Deep Dive: Authentication & Cryptographic Token Generation](#2-deep-dive-authentication--cryptographic-token-generation)
3. [Deep Dive: Room Creation & UUID v4 Cryptographic ID Generation](#3-deep-dive-room-creation--uuid-v4-cryptographic-id-generation)
4. [Deep Dive: Real-Time Networking & WebSocket Orchestration](#4-deep-dive-real-time-networking--websocket-orchestration)
5. [Deep Dive: Dual-Path State Synchronization & Debounced Cloud Persistence](#5-deep-dive-dual-path-state-synchronization--debounced-cloud-persistence)
6. [Critical Engineering Problems Faced & Solutions Implemented](#6-critical-engineering-problems-faced--solutions-implemented)
7. [End-to-End System Execution Trace (The Complete Lifecycle)](#7-end-to-end-system-execution-trace-the-complete-lifecycle)

---

## 1. Global System Architecture & Topology

CodeSync is built using a **Decoupled Client-Server-BaaS Architecture**. Rather than routing all data through a single monolithic backend, the system separates ephemeral high-frequency networking from durable long-term storage and identity.

```
                                  +---------------------------------------+
                                  |         Client Browser (React 19)     |
                                  |  - CodeMirror Editor (Dracula Theme)  |
                                  |  - Auth Context & Protected Routing   |
                                  |  - Socket.io Client (WS Transport)    |
                                  +---------------------------------------+
                                        /                       \
                      (WebSockets: Port 9000)             (HTTPS / gRPC Web Channel)
                                      /                           \
                                     v                             v
       +---------------------------------------------+     +-------------------------------+
       |       Node.js + Express WebSocket Engine     |     |       Google Firebase Cloud   |
       |  - Socket.io Room Multiplexing              |     |  - Firebase Authentication    |
       |  - In-Memory User Socket Mapping            |     |    (Google OAuth 2.0 / JWT)   |
       |  - Event Broadcast & Peer-to-Peer Relay     |     |  - Cloud Firestore            |
       +---------------------------------------------+     |    (Document Collections:     |
                                                           |     users, rooms, chats)      |
                                                           +-------------------------------+
```

### Architectural Division of Labor:
1. **Frontend Client (React 19 + CodeMirror 5 + TailwindCSS)**:
   * Direct DOM virtualization and syntax highlighting.
   * State management using React Context and mutable `useRef` containers.
   * Route guarding and presence avatar rendering.
2. **WebSocket Engine (Node.js + Express + Socket.io)**:
   * Zero-durability, ultra-low-latency event broker.
   * Room-based pub/sub multiplexing and peer-to-peer relay.
   * Ephemeral presence registry (`userSocketMap`).
3. **Cloud BaaS Layer (Google Firebase Auth + Cloud Firestore)**:
   * Identity verification and Google OAuth 2.0 token minting.
   * Document-oriented persistence for workspaces, profiles, and chats.
   * Atomic array mutations (`arrayUnion`) and server-timestamp generation.

---

## 2. Deep Dive: Authentication & Cryptographic Token Generation

Authentication in CodeSync is decentralized and delegated to Google's Identity Provider (IdP) via Firebase Authentication.

```
+-------------------------------------------------------------------------------------------------------+
|                                    AUTHENTICATION & TOKEN FLOW                                        |
+-------------------------------------------------------------------------------------------------------+

  Client Browser                  Firebase Auth SDK                  Google OAuth 2.0 Server
        |                                 |                                     |
   (1)  | --- signInWithPopup() --------> |                                     |
        |                                 | --- Open Consent Window (OAuth) --> |
   (2)  |                                 | <== User Grants Consent =========== |
        |                                 |                                     |
   (3)  |                                 | --- Exchange Auth Code -----------> |
        |                                 | <== Mint & Return ID Token (JWT) == |
        |                                 |                                     |
   (4)  | <== onAuthStateChanged Event == | (Stores JWT securely in IndexedDB)  |
        |     (Emits currentUser Object)  |                                     |
        |                                                                       |
   (5)  +---> Updates AuthContext: setUser(user), setIsAuth(true), setLoading(false)
        |
   (6)  +---> Calls createUserIfNotExists(user) in Cloud Firestore
```

### Step 1: OAuth 2.0 Handshake & Consent
When the user clicks "Login with Google" in [`Navbar.jsx`](file:///c:/Users/SANDEEP/Desktop/codesync/frontend/src/components/Navbar.jsx) or [`Login.jsx`](file:///c:/Users/SANDEEP/Desktop/codesync/frontend/src/pages/Login.jsx), the application invokes:
```javascript
// frontend/src/context/Authcontext.jsx
const result = await signInWithPopup(auth, googleProvider);
```
This opens a secure browser popup window directed to Google's OAuth 2.0 endpoint (`accounts.google.com/o/oauth2/v2/auth`) with the client application's credentials.

### Step 2: JWT Token Generation & Cryptographic Structure
Upon user consent, Google's authorization server issues an authorization code, which the Firebase client SDK exchanges with Google's token endpoint (`securetoken.googleapis.com/v1/token`) for an **OpenID Connect (OIDC) JSON Web Token (JWT)**.

The minted token consists of three base64url-encoded parts:
```
eyJhbGciOiJSUzI1NiIsImtpZCI6IjFhMmIzYyJ9.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY29kZXN5bmMiLCJhdWQiOiJjb2Rlc3luYyIsInN1YiI6IldrOVg4ekxwMCIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImV4cCI6MTc0MDAwMzYwMH0.K9xZ_vP1...
\___________________ ___________________/\_______________________________________ _______________________________________/\___________ ___________/
                    v                                                                    v                                                  v
              Header (Algorithm)                                                 Payload (User Claims)                               Signature (RSA-256)
```

1. **Header**: Declares the cryptographic signing algorithm (RSA-256 / `RS256`) and the Key ID (`kid`).
2. **Payload**: Contains standard claims:
   * `sub` / `uid`: Unique, immutable Google User ID.
   * `email`: User's primary email address.
   * `email_verified`: Boolean verifying account legitimacy.
   * `iss`: Issuer URI (`https://securetoken.google.com/<projectId>`).
   * `aud`: Audience matching the project ID.
   * `iat` / `exp`: Issued-at and expiration timestamps (1-hour lifespan).
3. **Signature**: Cryptographically signed by Google's private key. Anyone (Firestore or custom backend) can verify this signature against Google's public JSON Web Key Set (JWKS) at `https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`.

### Step 3: Local Session Persistence & Token Rotation
* The Firebase SDK persists the JWT and refresh token in the browser's `IndexedDB` under the `firebase:authUser:<apiKey>` key.
* A background worker transparently executes a silent token refresh before the 1-hour expiration, preventing unexpected session disconnects during active coding sessions.

### Step 4: React Context State Binding & Idempotent Profile Initialization
In [`Authcontext.jsx`](file:///c:/Users/SANDEEP/Desktop/codesync/frontend/src/context/Authcontext.jsx#L21-L29), the `onAuthStateChanged` daemon detects the initialized session, sets `isAuth = true`, and invokes `createUserIfNotExists()` in [`userService.js`](file:///c:/Users/SANDEEP/Desktop/codesync/frontend/src/firestore/userService.js#L5-L19):
```javascript
// frontend/src/firestore/userService.js
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
```
* **Idempotency Guarantee**: If the document already exists, no write is executed, protecting the user's existing `roomsCreated` and `roomsJoined` arrays from being wiped.

---

## 3. Deep Dive: Room Creation & UUID v4 Cryptographic ID Generation

Collaboration workspaces in CodeSync require globally unique, unguessable identifiers.

```
+-------------------------------------------------------------------------------------------------------+
|                                      ROOM GENERATION & ROUTING                                        |
+-------------------------------------------------------------------------------------------------------+

   Collaboration.jsx               UUID Generator                  Cloud Firestore
          |                              |                                |
     (1)  | --- generateNewRoom() -----> |                                |
          | <== Returns UUID v4 String = | (Crypto-Random 128-bit String) |
          |                                                               |
     (2)  | --- User fills Name & Description                             |
          |                                                               |
     (3)  | --- createRoomHandler() ------------------------------------> | (Creates /rooms/{uuid})
          | --- addRoomToUser() ----------------------------------------> | (Updates /users/{uid})
          |                                                               |
     (4)  | === navigate('/project/' + uuid) ===> Dynamic Route Mounted in React Router
```

### Step 1: Cryptographic Entropy of UUID v4
In [`Collaboration.jsx`](file:///c:/Users/SANDEEP/Desktop/codesync/frontend/src/pages/Collaboration.jsx#L21-L25), room IDs are generated using the `uuid` package (`uuidV4()`):
```javascript
// frontend/src/pages/Collaboration.jsx
const generateNewRoom = () => {
    const id = uuidV4();
    setNewRoomId(id);
    toast.success("Generated Room ID");
};
```

* **Mathematical Collision Probability**:
  * UUID v4 adheres to **RFC 4122**, utilizing 122 bits of cryptographically secure random entropy:
    $$\text{Total Possible UUIDs} = 2^{122} \approx 5.3 \times 10^{36}$$
  * To have a $50\%$ probability of a single collision (the Birthday Paradox), the system would need to generate approximately $2.71 \times 10^{18}$ rooms ($2.71\text{ quintillion}$).
  * This guarantees that client-side generation has zero practical probability of collision, removing the need for a centralized ID-allocator database.

### Step 2: Atomic Workspace Initialization in Firestore
When the user submits the form, two atomic operations execute in [`Collaboration.jsx`](file:///c:/Users/SANDEEP/Desktop/codesync/frontend/src/pages/Collaboration.jsx#L40-L45):
```javascript
// 1. Create the room document with empty code buffer and owner UID
await createRoom(cleanRoomId, {
    roomName: cleanRoomName,
    description: cleanRoomDesc,
    createdBy: user.uid,
});

// 2. Atomically push roomId to user's created and joined arrays via arrayUnion
await addRoomToUser(user.uid, cleanRoomId, true);
```

### Step 3: Dynamic Route Capture
The user is routed to `/project/:roomId`. In [`App.jsx`](file:///c:/Users/SANDEEP/Desktop/codesync/frontend/src/App.jsx#L37), React Router matches this pattern and mounts [`Project.jsx`](file:///c:/Users/SANDEEP/Desktop/codesync/frontend/src/pages/Project.jsx), extracting `roomId` via `useParams()`.

---

## 4. Deep Dive: Real-Time Networking & WebSocket Orchestration

Once a user lands on `/project/:roomId`, the application initiates the low-latency WebSocket connection.

```
+-------------------------------------------------------------------------------------------------------+
|                                    WEBSOCKET REAL-TIME DATA FLOW                                      |
+-------------------------------------------------------------------------------------------------------+

  Client A (Typing)              Node.js Socket Server               Client B (Collaborator)
        |                                  |                                    |
   (1)  | === TCP + WS Handshake ========> | <=== TCP + WS Handshake ========== |
        |                                  |                                    |
   (2)  | --- ACTIONS.JOIN (roomId) -----> |                                    |
        |     [userSocketMap[id] = user]   |                                    |
        |     [socket.join(roomId)]        |                                    |
        | <== ACTIONS.JOINED ============= | ================= ACTIONS.JOINED =>|
        |                                  |                                    |
   (3)  |                                  | <--- ACTIONS.SYNC_CODE ------------|
        |                                  |      (Push active buffer to B)     |
        | <== ACTIONS.CODE_CHANGE ======== |                                    |
        |     (Hydrates initial editor)    |                                    |
        |                                  |                                    |
   (4)  | --- ACTIONS.CODE_CHANGE -------> |                                    |
        |     (Keystroke: origin !='setVal')|                                   |
        |                                  | --- ACTIONS.CODE_CHANGE ---------> |
        |                                  |     (socket.to(roomId).emit)       |
        |                                  |     (Updates Client B CodeMirror)  |
```

### Step 1: WebSocket Upgrade & Connection Policy
In [`socket.js`](file:///c:/Users/SANDEEP/Desktop/codesync/frontend/src/socketio/socket.js#L3-L12), the client connects using strictly WebSocket transport:
```javascript
// frontend/src/socketio/socket.js
export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: ['websocket'], // Bypasses HTTP long-polling handshake
    };
    return io(import.meta.env.VITE_BACKEND_URL, options);
};
```
The browser sends an HTTP request with `Upgrade: websocket` and `Connection: Upgrade` headers. The Node.js server responds with HTTP status code `101 Switching Protocols`, establishing a persistent, full-duplex TCP connection.

### Step 2: Channel Multiplexing & Presence Tracking
When [`Project.jsx`](file:///c:/Users/SANDEEP/Desktop/codesync/frontend/src/pages/Project.jsx#L34-L37) mounts, it emits `ACTIONS.JOIN`:
```javascript
// backend/index.js (Lines 43-55)
socket.on(ACTIONS.JOIN, ({ roomId, newuser }) => {
  userSocketMap[socket.id] = newuser;
  socket.join(roomId);

  const clients = getAllConnectedClients(roomId);

  io.to(roomId).emit(ACTIONS.JOINED, {
    clients,
    newuser,
    socketId: socket.id,
  });
});
```
* `socket.join(roomId)`: Enrolls the socket in Socket.io's internal `adapter.rooms` graph.
* `userSocketMap[socket.id]`: Associates the socket ID with the user's display name.
* `io.to(roomId).emit(ACTIONS.JOINED)`: Broadcasts the updated user list to all sockets in that room.

### Step 3: Peer-to-Peer Initial State Catch-Up Handshake
When an existing user in the room receives `ACTIONS.JOINED`, they check if the joiner is someone else (`socketId !== socketRef.current.id`). If so, they immediately emit `ACTIONS.SYNC_CODE` targeting that specific socket ID:
```javascript
// frontend/src/pages/Project.jsx (Lines 39-48)
socketRef.current.on(ACTIONS.JOINED, ({ clients, newuser, socketId }) => {
    if (socketId !== socketRef.current.id) {
        toast.success(`${newuser} joined the room.`);
        socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current, // Latest in-memory code buffer
            socketId
        });
    }
    setClients(clients);
});
```
The server forwards this payload directly to the newcomer using `io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code })`, ensuring the new collaborator's editor immediately mirrors the current live session.

---

## 5. Deep Dive: Dual-Path State Synchronization & Debounced Cloud Persistence

A core architectural strength of CodeSync is its **Dual-Path Synchronization Model**:
1. **Fast Path (WebSockets)**: Operates at sub-millisecond speeds directly between client memory buffers for fluid real-time typing.
2. **Slow Path (Firestore Write-Behind)**: Operates asynchronously with debounced batching to ensure durability without exhausting cloud quotas.

```
                           [ User Types Keystroke ]
                                      |
                                      v
                        [ CodeMirror 'change' Event ]
                                      |
                   +------------------+------------------+
                   |                                     |
                   v (Fast Path: ~5ms)                   v (Slow Path: 1500ms Quiescence)
        [ Emit ACTIONS.CODE_CHANGE ]           [ saveToFirestoreDebounced() ]
                   |                                     |
                   v                                     +---> clearTimeout(saveTimeout)
        [ Node.js Socket Server ]                        +---> setTimeout(1500ms)
                   |                                     |
                   v                                     v (After 1.5s idle)
        [ In-Room Peer Broadcast ]             [ updateRoomCode() in Firestore ]
```

### The Debouncing Logic
In [`Editor.jsx`](file:///c:/Users/SANDEEP/Desktop/codesync/frontend/src/components/Editor.jsx#L39-L45):
```javascript
const saveToFirestoreDebounced = (code) => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        updateRoomCode(roomId, code);
    }, 1500);
};
```
* Every keystroke cancels the pending timer.
* Only when all typing stops for 1.5 seconds does the client make a single network request to update `lastUpdatedCode` and `updatedAt` in Firestore.

---

## 6. Critical Engineering Problems Faced & Solutions Implemented

Building a real-time collaborative text editor involves several distributed systems and frontend engineering challenges. Below is an exhaustive breakdown of the problems encountered and their architectural solutions.

---

### Problem 1: The Infinite Echo Broadcast Storm

#### Root Cause:
When User A types a character, CodeMirror fires an `on("change")` event, emitting `ACTIONS.CODE_CHANGE` over the socket. When User B receives this event and calls `editorInstance.current.setValue(code)`, that programmatic update *also* fires CodeMirror's `on("change")` event on User B's machine.

Without intervention, User B would re-broadcast the exact same code back to the server, which would forward it back to User A, creating an infinite ping-pong broadcast loop that floods the network and crashes the browser.

```
[User A Types] -> Emits Socket Event -> [User B Receives] -> Calls setValue()
      ^                                                              |
      |                                                              v
      +<-- Receives Duplicate Event <-- Emits Socket Event <---------+
```

#### Engineering Solution:
CodeMirror assigns an `origin` property to every change event:
* User typing produces `origin: "+input"` or `origin: "+delete"`.
* Programmatic updates via `setValue()` produce `origin: "setValue"`.

In [`Editor.jsx`](file:///c:/Users/SANDEEP/Desktop/codesync/frontend/src/components/Editor.jsx#L64-L78), the application explicitly filters events by origin:

```javascript
// frontend/src/components/Editor.jsx (Lines 64-78)
editorInstance.current.on("change", (instance, changes) => {
    const { origin } = changes;
    const code = instance.getValue();
    onCodeChange(code);

    // CRITICAL: Suppress broadcast if the change was programmatic (setValue)
    if (origin !== "setValue") {
        socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code
        });

        saveToFirestoreDebounced(code);
    }
});
```

---

### Problem 2: The Cursor Jump to Line 0, Column 0

#### Root Cause:
In CodeMirror 5, invoking `setValue(newCode)` is a destructive full-buffer replacement. It discards the existing document tree and instantiates a new one. A side effect is that the editor resets the active selection and cursor coordinates to the start of the file (`Line 0, Column 0`).

If User B is editing a function on Line 85 and User A types a single character anywhere in the file, User B's cursor would jump to the top of the file, disrupting their workflow.

#### Engineering Solution:
1. **Buffer Equality Guard**: Before applying incoming socket updates, [`Editor.jsx`](file:///c:/Users/SANDEEP/Desktop/codesync/frontend/src/components/Editor.jsx#L89-L95) checks if the incoming string is already identical to the local buffer:
   ```javascript
   socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
       if (code !== editorInstance.current.getValue()) {
           editorInstance.current.setValue(code);
       }
   });
   ```
2. **Sender Echo Suppression**: On the backend ([`backend/index.js`](file:///c:/Users/SANDEEP/Desktop/codesync/backend/index.js#L58-L60)), the server uses `socket.to(roomId).emit(...)` instead of `io.to(roomId).emit(...)`. This ensures the sender never receives their own keystrokes back over the network, eliminating cursor jumps for the active typist.

---

### Problem 3: React 19 / StrictMode Double-Mount Connection Duplication

#### Root Cause:
In React 19 development mode (and under `StrictMode`), React intentionally mounts, unmounts, and re-mounts every component on startup (`mount -> cleanup -> mount`) to detect side-effect bugs.

If socket instantiation and CodeMirror attachment are executed inside a raw `useEffect` without guards:
* Two independent WebSocket connections are created for the same user.
* Two overlapping CodeMirror DOM instances are attached to the same `<textarea>`, causing layout duplication and rendering bugs.

#### Engineering Solution:
Mutable `useRef` guards were implemented to ensure initialization happens exactly once:

* In [`Project.jsx`](file:///c:/Users/SANDEEP/Desktop/codesync/frontend/src/pages/Project.jsx#L21-L23):
  ```javascript
  useEffect(() => {
      if (socketRef.current) return; // Guard: skip duplicate execution
      // ... socket initialization ...
  }, []);
  ```
* In [`Editor.jsx`](file:///c:/Users/SANDEEP/Desktop/codesync/frontend/src/components/Editor.jsx#L47-L50):
  ```javascript
  useEffect(() => {
      if (editorInstance.current) return; // Guard: skip duplicate instantiation
      // ... CodeMirror fromTextArea instantiation ...
  }, []);
  ```
* Proper teardown hooks clean up socket listeners when the component is unmounted:
  ```javascript
  return () => {
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.disconnect();
  };
  ```

---

### Problem 4: The Latecomer Stale State Window

#### Root Cause:
Because writes to Cloud Firestore are debounced by 1,500ms to save costs, the database often lags behind the live code during active typing sessions. If User A is actively typing and User B joins the room:
1. User B reads the initial code from Firestore (`loadInitialCode()`).
2. The Firestore document contains code from 10 seconds ago.
3. User B's editor mounts with outdated code, creating a desynchronized state.

#### Engineering Solution:
The **Peer-to-Peer WebSocket Sync Handshake** bridges this window:
1. User B's arrival emits `ACTIONS.JOIN`.
2. The server broadcasts `ACTIONS.JOINED` with User B's `socketId`.
3. User A receives `ACTIONS.JOINED`, notes `socketId !== socketRef.current.id`, and immediately transmits their live in-memory buffer (`codeRef.current`) via `ACTIONS.SYNC_CODE`.
4. The server relays this directly to User B, overwriting the stale Firestore data with the current live buffer.

---

### Problem 5: The $N+1$ Database Read Amplification on Dashboards

#### Root Cause:
When loading the user's dashboard in [`Activity.jsx`](file:///c:/Users/SANDEEP/Desktop/codesync/frontend/src/pages/Activity.jsx) or [`Authcontext.jsx`](file:///c:/Users/SANDEEP/Desktop/codesync/frontend/src/context/Authcontext.jsx#L46-L65):
1. The app reads the user's profile document ($1\text{ read}$).
2. For every `roomId` in `roomsJoined` ($N$), it reads the room document ($N\text{ reads}$).
3. For every room, it reads the creator's user profile document to display their name ($N\text{ reads}$).

$$\text{Total Reads} = 1 + 2N$$
For a user in 50 rooms, loading the dashboard generates 101 separate Firestore reads, increasing latency and cost.

#### Recommended Production Solution:
1. **Denormalization on Room Creation**: Store `{ creatorName: user.displayName }` directly inside the `rooms` document during `createRoom()`.
2. **Chunked Field-Path Queries**: Replace the `Promise.all` map with chunked `in` queries (up to 30 IDs per round-trip):
   ```javascript
   const q = query(collection(db, "rooms"), where(documentId(), "in", roomIds.slice(0, 30)));
   const snap = await getDocs(q);
   ```
   This reduces total operations to $\lceil N / 30 \rceil + 1$.

---

### Problem 6: Zombie Connections & Ghost Presence on Network Flaps

#### Root Cause:
If a user closes their laptop lid or experiences an abrupt Wi-Fi drop, no TCP `FIN` packet is sent to the server. If the server only listened for standard client-side `leave` messages, the user's socket would remain in `userSocketMap`, causing their avatar to linger indefinitely as a "ghost" collaborator.

#### Engineering Solution:
* The backend relies on Socket.io's built-in **Heartbeat Protocol** (`pingInterval: 25000ms`, `pingTimeout: 20000ms`).
* If the client fails to respond to a ping within the timeout window, the server triggers the `"disconnecting"` event:
```javascript
// backend/index.js (Lines 66-77)
socket.on("disconnecting", () => {
  const rooms = [...socket.rooms];
  rooms.forEach((roomId) => {
    socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
      socketId: socket.id,
      username: userSocketMap[socket.id],
    });
  });

  delete userSocketMap[socket.id];
  socket.leave();
});
```
* The departed socket ID is deleted from memory, and all peers in the room remove the user from their active presence sidebar.

---

### Problem 7: High-Frequency React Re-rendering during Typing

#### Root Cause:
If the live code string or socket instance were stored in standard React state (`useState`), every keystroke (up to 10 per second across multiple collaborators) would trigger a re-render of the entire `Project`, `Sidebar`, and `Navbar` component subtrees. This causes dropped frames and typing lag.

#### Engineering Solution:
CodeSync stores high-frequency, non-visual state inside **React Mutable Refs (`useRef`)**:
* `socketRef`: Holds the active Socket.io instance.
* `codeRef`: Holds the current raw code string in memory without triggering re-renders.
* `editorInstance`: Holds the CodeMirror 5 instance.

React state (`useState`) is reserved exclusively for low-frequency visual mutations, such as updating the collaborator presence list in `Sidebar.jsx` when someone enters or leaves.

---

## 7. End-to-End System Execution Trace (The Complete Lifecycle)

Below is the complete lifecycle of a collaborative session from user login to room departure:

```
+========================================================================================================+
|                                    END-TO-END EXECUTION TRACE                                          |
+========================================================================================================+

1. AUTHENTICATION & SESSION HYDRATION
   [User clicks "Get Started"] 
       ---> signInWithPopup(auth, googleProvider)
       ---> Google issues RS256-signed JWT
       ---> onAuthStateChanged() triggers in AuthContext
       ---> createUserIfNotExists() upserts /users/{uid} in Firestore
       ---> isAuth = true; App renders protected routes

2. WORKSPACE INITIALIZATION
   [User navigates to Collaboration Tab]
       ---> generateNewRoom() executes -> Generates UUID v4: "b8f3e506-..."
       ---> User enters "Room Name" + "Description" -> clicks "Create Room"
       ---> createRoom() writes document to Firestore /rooms/b8f3e506-...
       ---> addRoomToUser() appends roomId to user's roomsCreated & roomsJoined
       ---> React Router navigates to /project/b8f3e506-...

3. WORKSPACE BOOTSTRAP & WEBSOCKET HANDSHAKE
   [Project.jsx mounts]
       ---> Extracts roomId from URL params
       ---> initSocket() opens WebSocket connection to Node.js backend (Port 9000)
       ---> Emits ACTIONS.JOIN ({ roomId, newuser })
       ---> Server adds socket to userSocketMap & executes socket.join(roomId)
       ---> Server broadcasts ACTIONS.JOINED with full client presence list
       ---> Sidebar renders active user avatars

4. EDITOR MOUNT & BUFFER HYDRATION
   [Editor.jsx mounts]
       ---> Codemirror.fromTextArea() attaches to DOM with Dracula theme
       ---> loadInitialCode() reads lastUpdatedCode from Firestore
       ---> editorInstance.setValue(savedCode) populates initial text
       ---> (If existing peers are in room): Peer detects new joiner and emits ACTIONS.SYNC_CODE
       ---> Newcomer editor receives latest in-memory code over WebSocket

5. LIVE COLLABORATIVE EDITING
   [User A types code character]
       ---> CodeMirror triggers 'change' event with origin: "+input"
       ---> Origin check passes (origin !== "setValue")
       ---> Client A emits ACTIONS.CODE_CHANGE to server
       ---> Client A starts 1,500ms debounce timer for Firestore write
       ---> Node.js server broadcasts ACTIONS.CODE_CHANGE to room peers via socket.to(roomId)
       ---> Client B receives ACTIONS.CODE_CHANGE
       ---> Client B checks buffer equality (code !== editor.getValue())
       ---> Client B executes editorInstance.setValue(code) with origin: "setValue"
       ---> Client B's change listener detects origin === "setValue" and suppresses re-broadcast

6. DURABLE CLOUD COMMIT
   [User stops typing for 1.5 seconds]
       ---> saveTimeout timer resolves in Editor.jsx
       ---> updateRoomCode(roomId, code) executes
       ---> Firestore document /rooms/b8f3e506-... updated with lastUpdatedCode & updatedAt

7. GRACEFUL EXIT & CLEANUP
   [User clicks "Leave Room" or closes browser tab]
       ---> Socket.io detects disconnection (or triggers "disconnecting" hook)
       ---> Server broadcasts ACTIONS.DISCONNECTED to remaining room peers
       ---> Server removes socket ID from userSocketMap and leaves room channel
       ---> Remaining peers receive event and filter departed user from presence sidebar
       ---> React unmount hook calls socketRef.current.disconnect()
```
