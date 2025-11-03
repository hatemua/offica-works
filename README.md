# Mini Gather - Virtual Space Clone

A 2D virtual space where users can move avatars, have proximity-based video calls, and join room-based conversations. Built with React, Phaser 3, Express, Socket.io, and LiveKit.

## 🎮 Features

### ✅ Implemented
- **Authentication System**: JWT-based user registration and login
- **2D Game World**: Top-down view with Phaser 3
- **Real-time Movement**: WASD/Arrow keys with Socket.io synchronization
- **Collision System**: Wall boundaries and world limits
- **Room System**: Multiple room zones (Conference, Lounge, Presentation)
- **Proximity Detection**: Server-side distance calculation
- **Video/Audio**: LiveKit integration for proximity and room-based calls
- **Chat System**: Global, Room, and Proximity channels
- **UI Components**: User list, video panel, chat, controls

### 🚀 Tech Stack

**Frontend:**
- React 18 + TypeScript
- Phaser 3 (2D game engine)
- Socket.io Client
- LiveKit React Components
- Zustand (state management)
- Tailwind CSS
- Vite

**Backend:**
- Express.js + Node.js
- Socket.io
- Prisma ORM
- PostgreSQL
- JWT Authentication
- LiveKit Server SDK

## 📦 Project Structure

```
mini-gather/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Auth.tsx     # Login/Register
│   │   │   ├── GameCanvas.tsx
│   │   │   ├── VideoPanel.tsx
│   │   │   ├── ChatBox.tsx
│   │   │   ├── Controls.tsx
│   │   │   └── UserList.tsx
│   │   ├── game/            # Phaser game logic
│   │   │   ├── scenes/
│   │   │   │   └── MainScene.ts
│   │   │   ├── entities/
│   │   │   │   └── Player.ts
│   │   │   └── config.ts
│   │   ├── services/        # API and Socket services
│   │   │   ├── api.ts
│   │   │   └── socket.ts
│   │   ├── store/
│   │   │   └── gameStore.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── server/                   # Express backend
│   ├── src/
│   │   ├── routes/          # API routes
│   │   │   ├── auth.routes.ts
│   │   │   └── livekit.routes.ts
│   │   ├── sockets/         # Socket.io handlers
│   │   │   ├── connection.handler.ts
│   │   │   ├── movement.handler.ts
│   │   │   ├── room.handler.ts
│   │   │   └── chat.handler.ts
│   │   ├── services/        # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── game.service.ts
│   │   │   └── livekit.service.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── config/
│   │   │   └── database.ts
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
└── shared/                   # Shared types/constants
    ├── src/
    │   ├── types/
    │   └── constants/
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** database
- **LiveKit** account (free tier available)

### 1. Clone and Install

```bash
cd mini-gather
npm install
```

This will install dependencies for all workspaces (client, server, shared).

### 2. Database Setup

```bash
# Install PostgreSQL (if not already installed)
# On Windows: Download from https://www.postgresql.org/download/windows/
# On Mac: brew install postgresql
# On Linux: sudo apt-get install postgresql

# Create database
createdb minigather

# Or using psql
psql -U postgres
CREATE DATABASE minigather;
\q
```

### 3. LiveKit Setup

**Option A: Use LiveKit Cloud (Recommended for Development)**

1. Sign up at [https://cloud.livekit.io](https://cloud.livekit.io)
2. Create a new project
3. Copy your credentials:
   - API Key
   - API Secret
   - WebSocket URL (wss://your-project.livekit.cloud)

**Option B: Self-Host LiveKit**

```bash
# Using Docker
docker run -d \
  --name livekit \
  -p 7880:7880 \
  -p 7881:7881 \
  -p 7882:7882/udp \
  livekit/livekit-server \
  --dev
```

### 4. Environment Configuration

**Server (.env)**

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/minigather?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# LiveKit
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
LIVEKIT_WS_URL=wss://your-livekit-server.livekit.cloud

# CORS
CLIENT_URL=http://localhost:5173
```

**Client (.env)**

```bash
cd client
cp .env.example .env
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
VITE_LIVEKIT_WS_URL=wss://your-livekit-server.livekit.cloud
```

### 5. Database Migration

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
```

### 6. Run Development Servers

**Option 1: Run both together (from root)**

```bash
npm run dev
```

**Option 2: Run separately**

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

### 7. Access the Application

- **Client**: [http://localhost:5173](http://localhost:5173)
- **Server**: [http://localhost:3001](http://localhost:3001)
- **API Health**: [http://localhost:3001/health](http://localhost:3001/health)

## 🎮 How to Use

### Registration/Login

1. Open [http://localhost:5173](http://localhost:5173)
2. Create an account or sign in
3. Choose your avatar color

### Navigation

- **Move**: WASD or Arrow keys
- **Chat**: Click "Open Chat" in bottom-left
- **Players**: View online users in top-left
- **Video**: Automatically connects when near other players

### Rooms

The map has 3 predefined rooms:

1. **Conference Room A** (Blue zone, top-left)
   - Capacity: 8 players
   - Type: Meeting room (all participants connected)

2. **Lounge Area** (Green zone, top-right)
   - Capacity: 20 players
   - Type: Social space (proximity-based)

3. **Presentation Hall** (Red zone, bottom)
   - Capacity: 50 players
   - Type: Presentation mode

### Chat Channels

- **Global**: Everyone can see
- **Room**: Only players in the same room
- **Proximity**: Players within range

## 🔧 Development

### Build for Production

```bash
# Build all
npm run build

# Or separately
npm run build:client
npm run build:server
```

### Database Management

```bash
cd server

# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio (Database GUI)
npm run prisma:studio
```

### Clean Installation

```bash
npm run clean
npm install
```

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user (requires auth)

### LiveKit

- `POST /api/livekit/token/proximity` - Get proximity video token
- `POST /api/livekit/token/room` - Get room video token

### Health

- `GET /health` - Server health check

## 🔌 Socket Events

### Client → Server

- `authenticate` - Authenticate socket connection
- `player:move` - Send player movement
- `room:join` - Join a room
- `room:leave` - Leave a room
- `chat:message` - Send chat message

### Server → Client

- `authenticated` - Authentication successful
- `player:joined` - New player joined
- `player:left` - Player disconnected
- `player:position` - Player position update
- `players:list` - List of all players
- `room:joined` - Joined a room
- `room:update` - Room state updated
- `proximity:update` - Proximity players update
- `chat:message` - Received chat message

## 🎨 Customization

### Adding Custom Avatars

Replace the colored squares in [MainScene.ts](client/src/game/scenes/MainScene.ts) preload():

```typescript
// Load sprite sheets instead
this.load.spritesheet('avatar1', '/assets/avatars/avatar1.png', {
  frameWidth: 32,
  frameHeight: 32
});
```

### Adding New Rooms

Edit [game.service.ts](server/src/services/game.service.ts):

```typescript
private initializeRooms() {
  const defaultRooms: RoomState[] = [
    // ... existing rooms
    {
      id: 'new-room',
      name: 'New Room',
      type: 'social',
      bounds: { x: 100, y: 100, width: 200, height: 200 },
      capacity: 10,
      playerIds: [],
      isPrivate: false
    }
  ];
}
```

And update [MainScene.ts](client/src/game/scenes/MainScene.ts) to render the zone.

### Changing Map Size

Edit [shared/src/constants/game.constants.ts](shared/src/constants/game.constants.ts):

```typescript
export const GAME_CONFIG = {
  MAP_WIDTH: 60,  // Change from 50
  MAP_HEIGHT: 50,  // Change from 40
  // ...
};
```

## 🐛 Troubleshooting

### Database Connection Failed

```bash
# Check PostgreSQL is running
# Windows: Check Services
# Mac: brew services list
# Linux: sudo systemctl status postgresql

# Test connection
psql -U postgres -d minigather
```

### Socket Connection Error

- Check server is running on port 3001
- Verify `VITE_SOCKET_URL` in client `.env`
- Check firewall settings

### Video Not Working

- Verify LiveKit credentials in `.env`
- Check browser permissions for camera/mic
- Test LiveKit connection at their dashboard
- Ensure WebSocket URL starts with `wss://`

### Build Errors

```bash
# Clear all node_modules and reinstall
npm run clean
npm install

# Regenerate Prisma client
cd server
npm run prisma:generate
```

## 📝 License

MIT

## 🙏 Acknowledgments

- [Phaser 3](https://phaser.io/) - HTML5 game framework
- [LiveKit](https://livekit.io/) - WebRTC infrastructure
- [Socket.io](https://socket.io/) - Real-time communication
- [Gather.town](https://gather.town/) - Inspiration

## 🔮 Future Enhancements

- [ ] Custom map editor with Tiled
- [ ] Screen sharing in rooms
- [ ] Private 1-on-1 video calls
- [ ] Emoji reactions
- [ ] Player status (away, busy, etc.)
- [ ] Breakout rooms
- [ ] Recording sessions
- [ ] Mobile responsive controls
- [ ] Voice activity detection
- [ ] Spatial audio (distance-based volume)

---

Built with ❤️ using React, Phaser, and LiveKit

# offica-works