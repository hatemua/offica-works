# Mini Gather - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   React UI   │  │  Phaser Game │  │   LiveKit Video      │  │
│  │  Components  │  │    Engine    │  │   Audio Streams      │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                       │              │
│         └─────────┬───────┴───────────────────────┘              │
│                   │                                              │
│         ┌─────────▼──────────┐                                  │
│         │   Socket.io Client │                                  │
│         │   Zustand Store    │                                  │
│         └─────────┬──────────┘                                  │
└───────────────────┼─────────────────────────────────────────────┘
                    │
                    │ WebSocket (Socket.io)
                    │
┌───────────────────▼─────────────────────────────────────────────┐
│                      Server (Node.js)                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Socket.io Server                        │   │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────────┐   │   │
│  │  │ Connection │  │  Movement  │  │   Room & Chat    │   │   │
│  │  │  Handler   │  │  Handler   │  │     Handler      │   │   │
│  │  └─────┬──────┘  └─────┬──────┘  └────────┬─────────┘   │   │
│  └────────┼───────────────┼──────────────────┼─────────────┘   │
│           │               │                  │                  │
│  ┌────────▼───────────────▼──────────────────▼─────────────┐   │
│  │              Game Service (In-Memory)                    │   │
│  │  - Players Map                                           │   │
│  │  - Rooms Map                                             │   │
│  │  - Proximity Detection                                   │   │
│  │  - Movement Validation                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Auth Service │  │    Prisma    │  │  LiveKit Service     │  │
│  │  (JWT)       │  │     ORM      │  │  (Token Generation)  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────────┘  │
│         │                 │                                     │
└─────────┼─────────────────┼─────────────────────────────────────┘
          │                 │
          │        ┌────────▼────────┐
          │        │   PostgreSQL    │
          │        │    Database     │
          │        └─────────────────┘
          │
          │        ┌──────────────────┐
          └────────▶   LiveKit Cloud  │
                   │   (WebRTC SFU)   │
                   └──────────────────┘
```

## Data Flow

### 1. Authentication Flow

```
User Input → React Form → API Service → Server Auth Route
                                          ↓
                                    Auth Service
                                          ↓
                                    Prisma (DB)
                                          ↓
                            JWT Token ← Response
                                          ↓
                            Store in localStorage
                                          ↓
                            Socket.io Connection
```

### 2. Movement Flow

```
Keyboard Input → Phaser Scene → Update Player Position
                                          ↓
                            Socket.emit('player:move')
                                          ↓
                            Server Movement Handler
                                          ↓
                            Game Service.updatePlayerMovement()
                                          ↓
                Socket.broadcast('player:position') to all others
                                          ↓
                    Other Clients receive update
                                          ↓
                    Update remote player position
```

### 3. Proximity Video Flow

```
Player Movement → Server calculates distances
                        ↓
                Proximity Update Event
                        ↓
                Client receives proximity list
                        ↓
            Request LiveKit token from server
                        ↓
            Server generates LiveKit JWT
                        ↓
            Client connects to LiveKit room
                        ↓
            WebRTC P2P connection established
                        ↓
            Video/Audio streams exchanged
```

### 4. Room System Flow

```
Player enters room zone → Position update
                              ↓
                    Server detects room boundary
                              ↓
                    Auto room:join event
                              ↓
                Game Service.joinRoom()
                              ↓
        Socket joins Socket.io room (for events)
                              ↓
        Request LiveKit room token
                              ↓
        Connect to LiveKit room
                              ↓
        All room participants connected
```

## Key Components

### Frontend Components

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `Auth.tsx` | Login/Register | Form validation, JWT storage |
| `GameCanvas.tsx` | Phaser wrapper | Game lifecycle management |
| `MainScene.ts` | Main game scene | Movement, rendering, physics |
| `Player.ts` | Player entity | Animations, name tags |
| `VideoPanel.tsx` | LiveKit video | Auto-connect on proximity |
| `ChatBox.tsx` | Messaging | Multiple channels |
| `UserList.tsx` | Online users | Real-time player list |
| `Controls.tsx` | User controls | Mute, camera, screen share |

### Backend Services

| Service | Purpose | Key Methods |
|---------|---------|-------------|
| `auth.service.ts` | Authentication | register(), login(), verifyToken() |
| `game.service.ts` | Game state | addPlayer(), updateMovement(), getProximity() |
| `livekit.service.ts` | Video tokens | createProximityToken(), createRoomToken() |

### Socket Handlers

| Handler | Events | Purpose |
|---------|--------|---------|
| `connection.handler.ts` | connect, disconnect | Player join/leave |
| `movement.handler.ts` | player:move | Position sync |
| `room.handler.ts` | room:join, room:leave | Room management |
| `chat.handler.ts` | chat:message | Message broadcast |

## State Management

### Client State (Zustand)

```typescript
{
  // Authentication
  user: User | null
  isAuthenticated: boolean

  // Game state
  players: Record<string, Player>
  currentPlayerId: string | null
  currentRoomId: string | null

  // UI state
  isChatOpen: boolean
  isUserListOpen: boolean

  // Video state
  proximityPlayers: string[]
}
```

### Server State (In-Memory)

```typescript
GameService {
  players: Map<socketId, Player>
  rooms: Map<roomId, RoomState>
}
```

### Database State (PostgreSQL)

```sql
-- Persistent data
users (id, email, username, password, avatar)
rooms (id, name, type, bounds, capacity)
chat_messages (id, userId, content, channel)
```

## Performance Optimizations

### Network

- **Position updates**: Throttled to 15 updates/second
- **Delta compression**: Only send changed data
- **Proximity culling**: Only send nearby player updates

### Rendering

- **Sprite pooling**: Reuse player sprites
- **Camera bounds**: Only render visible area
- **Interpolation**: Smooth movement between updates

### Video/Audio

- **Mesh topology**: P2P for < 5 users
- **SFU**: LiveKit handles routing for larger groups
- **Simulcast**: Multiple quality streams
- **Proximity audio**: Distance-based volume

## Security

### Authentication

- JWT tokens with expiration
- Password hashing with bcrypt (10 rounds)
- Token validation on socket connection

### Data Validation

- Input sanitization on all endpoints
- Type checking with TypeScript
- Prisma parameterized queries

### Rate Limiting

- Position update throttling
- Chat message cooldown
- API request limits (recommended for production)

## Scalability Considerations

### Current Implementation (Single Server)

- In-memory game state
- Good for ~100 concurrent users
- Simple deployment

### Scaling Path

1. **Redis for state**: Share game state across servers
2. **Socket.io adapter**: Multi-server socket connections
3. **Database for rooms**: Persistent room configuration
4. **Microservices**: Separate game/chat/video services
5. **Load balancer**: Distribute connections

## Technology Decisions

### Why Phaser 3?

- ✅ Battle-tested 2D game engine
- ✅ Great performance
- ✅ Built-in physics
- ✅ Easy sprite management

### Why LiveKit?

- ✅ Free tier (50GB/month)
- ✅ Open source (can self-host)
- ✅ Handles WebRTC complexity
- ✅ Built-in SFU for scaling

### Why Socket.io?

- ✅ Automatic reconnection
- ✅ Room system built-in
- ✅ Fallback transports
- ✅ TypeScript support

### Why PostgreSQL?

- ✅ Relational data (users, rooms)
- ✅ ACID compliance
- ✅ Excellent with Prisma
- ✅ Easy to scale vertically

### Why Zustand?

- ✅ Simpler than Redux
- ✅ No boilerplate
- ✅ TypeScript friendly
- ✅ Hook-based API

## File Organization

```
Separation of Concerns:

client/
  ├── components/     → React UI (presentation)
  ├── game/          → Phaser logic (game engine)
  ├── services/      → External APIs (data)
  └── store/         → State management (state)

server/
  ├── routes/        → HTTP endpoints (API)
  ├── sockets/       → WebSocket events (real-time)
  ├── services/      → Business logic (domain)
  ├── middleware/    → Request processing (validation)
  └── config/        → Configuration (setup)

shared/
  ├── types/         → TypeScript interfaces
  └── constants/     → Shared values
```

## Development Workflow

```
1. Change shared types → npm run build in shared/
2. Server changes → Auto-reload with nodemon
3. Client changes → Hot reload with Vite HMR
4. Database changes → Create Prisma migration
```

## Testing Strategy (Future)

- **Unit tests**: Services and utilities
- **Integration tests**: API endpoints
- **E2E tests**: User flows (Playwright)
- **Load tests**: Concurrent connections (k6)

---

This architecture provides a solid foundation for a real-time multiplayer virtual space with video/audio capabilities.
