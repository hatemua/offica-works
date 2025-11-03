# Quick Setup Guide

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL installed and running
- [ ] LiveKit account created (or self-hosted)
- [ ] Git installed

## Step-by-Step Setup

### 1️⃣ Database Setup (PostgreSQL)

**Windows:**
```powershell
# Download and install PostgreSQL from https://www.postgresql.org/download/windows/
# During installation, remember your postgres user password

# Open SQL Shell (psql) and create database
CREATE DATABASE minigather;
\q
```

**Mac:**
```bash
brew install postgresql
brew services start postgresql
createdb minigather
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb minigather
```

### 2️⃣ LiveKit Setup

**Option A: LiveKit Cloud (Easiest)**

1. Go to [https://cloud.livekit.io](https://cloud.livekit.io)
2. Sign up for free account
3. Create new project
4. Copy these values:
   - API Key: `APIxxxxxxxxxx`
   - API Secret: `xxxxxxxxxxxxx`
   - WebSocket URL: `wss://your-project.livekit.cloud`

**Option B: Self-Hosted LiveKit**

```bash
docker run -d \
  --name livekit \
  -p 7880:7880 \
  -p 7881:7881 \
  -p 7882:7882/udp \
  livekit/livekit-server \
  --dev

# Default URL will be: ws://localhost:7880
```

### 3️⃣ Install Dependencies

```bash
cd mini-gather
npm install
```

This installs all packages for client, server, and shared modules.

### 4️⃣ Configure Environment Variables

**Server Configuration:**

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your values:

```env
PORT=3001
NODE_ENV=development

# Update with your PostgreSQL credentials
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/minigather?schema=public"

# Generate a random secret (or use: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-here

# Paste your LiveKit credentials
LIVEKIT_API_KEY=APIxxxxxxxxxx
LIVEKIT_API_SECRET=xxxxxxxxxxxxx
LIVEKIT_WS_URL=wss://your-project.livekit.cloud

CLIENT_URL=http://localhost:5173
```

**Client Configuration:**

```bash
cd ../client
cp .env.example .env
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
# Use the same LiveKit URL from server
VITE_LIVEKIT_WS_URL=wss://your-project.livekit.cloud
```

### 5️⃣ Initialize Database

```bash
cd ../server
npm run prisma:generate
npm run prisma:migrate
```

When prompted for migration name, enter: `init`

### 6️⃣ Start Development Servers

**From project root:**

```bash
cd ..
npm run dev
```

This starts both client and server concurrently.

**Or start separately:**

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

### 7️⃣ Verify Everything Works

1. **Check Server**: [http://localhost:3001/health](http://localhost:3001/health)
   - Should see: `{"status":"ok","timestamp":"..."}`

2. **Check Client**: [http://localhost:5173](http://localhost:5173)
   - Should see login/register page

3. **Test Registration**:
   - Create account with email/password
   - Choose avatar color
   - Click "Sign Up"

4. **Test Movement**:
   - Use WASD or arrow keys to move
   - Your avatar should move around the map

5. **Test Multiplayer** (open 2 browser tabs):
   - Create 2 different accounts
   - Move them close together
   - Video should automatically connect

## Common Issues & Solutions

### ❌ "Database connection failed"

**Check PostgreSQL is running:**
```bash
# Mac
brew services list

# Linux
sudo systemctl status postgresql

# Windows - Check Services app
```

**Test database connection:**
```bash
psql -U postgres -d minigather

# If this fails, check DATABASE_URL in server/.env
```

### ❌ "Port 3001 already in use"

```bash
# Find and kill process on port 3001
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

### ❌ "Module not found" errors

```bash
# Clean install
npm run clean
npm install

# Rebuild Prisma client
cd server
npm run prisma:generate
```

### ❌ Video not working

1. **Check LiveKit credentials** in both `.env` files
2. **Test browser permissions**: Allow camera/microphone when prompted
3. **Verify URL format**: Must be `wss://` (not `ws://`)
4. **Check LiveKit dashboard**: Verify project is active

### ❌ "Cannot find module '@mini-gather/shared'"

```bash
# Build shared package
cd shared
npm run build

# Or from root
npm run build
```

## Testing Checklist

After setup, verify these features work:

- [ ] User registration
- [ ] User login
- [ ] Player movement (WASD/arrows)
- [ ] See other players (open 2 tabs)
- [ ] Chat messages (global channel)
- [ ] Enter/leave rooms (colored zones)
- [ ] Video connection (move players close)
- [ ] Audio works
- [ ] User list shows online players

## Need Help?

1. Check [README.md](README.md) for detailed documentation
2. Verify all environment variables are set correctly
3. Check browser console for errors (F12)
4. Check server terminal for error messages
5. Ensure all prerequisites are installed

## Production Deployment

For production deployment:

1. Use proper PostgreSQL credentials
2. Generate strong JWT_SECRET
3. Use LiveKit Cloud (not self-hosted dev mode)
4. Set NODE_ENV=production
5. Build both client and server:
   ```bash
   npm run build
   ```
6. Deploy server to hosting (Heroku, Railway, etc.)
7. Deploy client to static hosting (Vercel, Netlify, etc.)
8. Update CORS and environment URLs

---

**Ready to build?** Run `npm run dev` and start coding! 🚀
