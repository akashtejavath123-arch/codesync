# CodeSync Technical Documentation Index

Welcome to the comprehensive technical documentation for **CodeSync**, a full-stack real-time collaborative code editor.

## Documentation Modules

The architecture is documented across three comprehensive modules:

1. **[Module 1: Cloud Architecture, Identity Management, Security & Distributed Persistence Engine](file:///c:/Users/SANDEEP/Desktop/codesync/docs/MODULE_1_AUTH_PERSISTENCE_SECURITY.md)**
   * Executive Architectural Overview & Cloud Topology
   * Identity Management & Firebase Authentication Lifecycle (Google OAuth 2.0, JWT Tokens)
   * Database Modeling & NoSQL Schema Architecture (Users, Rooms, Chats Sub-collection)
   * Deep Code Walkthroughs with Full Inline Explanations (`Authcontext.jsx`, `userService.js`, `roomService.js`, `App.jsx`)
   * State Hydration Strategies & Debounced Persistence Engine
   * Design Choices, Tradeoffs & Architectural Comparisons
   * Edge Cases, Failure Modes & Resilience Patterns
   * Staff/Principal-Level Technical Interview Deep Dives (N+1 Query Solutions, Security Rules, `arrayUnion` Concurrency)

2. **[Module 2: Real-Time Synchronization Engine, Low-Latency Networking & WebSocket Orchestration](file:///c:/Users/SANDEEP/Desktop/codesync/docs/MODULE_2_WEBSOCKET_REALTIME_SYNC.md)**
   * Low-Latency Protocol Architecture & Transport Comparison (WebSockets vs Polling vs SSE)
   * Socket.io Protocol Specification & Event Contract Anatomy
   * Backend Lifecycle & In-Memory State Management (`userSocketMap`, Adapter Room Graph)
   * Deep Code Walkthroughs with Full Inline Explanations (`backend/index.js`, `socket.js`, `Project.jsx`, `actions.js`)
   * The Catch-Up Handshake: Peer-to-Peer State Synchronization Mechanics
   * Design Choices, Tradeoffs & Architectural Comparisons
   * Edge Cases, Race Conditions & Distributed Network Faults
   * Staff/Principal-Level Technical Interview Deep Dives (Kubernetes Cluster Scaling with Redis Streams, Bandwidth Sizing Models, HoL Blocking)

3. **[Module 3: Frontend Client Engine, CodeMirror Virtualization, Event Loops & Reactive UI Subsystem](file:///c:/Users/SANDEEP/Desktop/codesync/docs/MODULE_3_FRONTEND_EDITOR_UX.md)**
   * Frontend System Architecture & Component Hierarchy Tree
   * CodeMirror 5 Integration inside React 19 Declarative Tree
   * The Infinite Echo Loop Problem: Mathematical Formalization & Safeguards (`origin !== "setValue"`)
   * The Cursor Jump Dilemma & Conflict Mitigation
   * Deep Code Walkthroughs with Full Inline Explanations (`Editor.jsx`, `Sidebar.jsx`, `Collaboration.jsx`)
   * React 19 Lifecycle, Concurrent Mode & StrictMode Idempotency
   * Design Choices, Tradeoffs & Architectural Comparisons
   * Staff/Principal-Level Technical Interview Deep Dives (CRDTs / Yjs Architecture, Sandboxed Remote Execution via Judge0, DOM Virtualization)

---

## Quick Navigation

```
docs/
├── README.md                                 # Documentation index
├── MODULE_1_AUTH_PERSISTENCE_SECURITY.md     # Module 1 (300+ lines)
├── MODULE_2_WEBSOCKET_REALTIME_SYNC.md       # Module 2 (300+ lines)
└── MODULE_3_FRONTEND_EDITOR_UX.md            # Module 3 (300+ lines)
```
