# Quick Fix Guide - Common Issues

## Issue 1: "@mini-gather/shared" module not found ✅ FIXED

**Solution:** Build the shared package first!

```bash
cd shared
npm run build
cd ..
```

This creates the compiled JavaScript and type definitions that both client and server need.

---

## Issue 2: PostgreSQL "role root does not exist"

**Problem:** Windows PostgreSQL uses `postgres` user, not `root`.

### Solution A: Use pgAdmin 4 (Easiest for Windows)

1. **Open pgAdmin 4** (search in Start menu)
2. **Connect** to your local PostgreSQL server
   - It will ask for the password you set during installation
3. **Right-click "Databases"** → Create → Database
4. **Name:** `minigather`
5. **Click Save**

### Solution B: Use psql Command Line

```cmd
# Open PowerShell or Command Prompt
psql -U postgres

# Enter your password when prompted
# Then type:
CREATE DATABASE minigather;

# Exit
\q
```

### Solution C: If PostgreSQL is in WSL

```bash
# In WSL terminal
sudo service postgresql start
sudo -u postgres psql
CREATE DATABASE minigather;
\q
```

---

## Step-by-Step Quick Start (Windows)

### 1️⃣ Build Shared Package (IMPORTANT!)

```cmd
cd C:\Users\hatem\mini-gather\shared
npm run build
cd ..
```

**✅ This should complete without errors**

### 2️⃣ Create PostgreSQL Database

**Using pgAdmin 4:**
- Open pgAdmin 4
- Create database named `minigather`

**OR using psql:**
```cmd
psql -U postgres
CREATE DATABASE minigather;
\q
```

### 3️⃣ Update Server .env

Edit `server\.env` with your PostgreSQL password:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/minigather?schema=public"
```

Replace `YOUR_PASSWORD` with your actual PostgreSQL password.

### 4️⃣ Run Database Migrations

```cmd
cd server
npm run prisma:generate
npm run prisma:migrate
```

When prompted for migration name, type: `init` and press Enter.

### 5️⃣ Setup LiveKit (Free Video Service)

1. Go to https://cloud.livekit.io
2. Sign up (free)
3. Create new project
4. Copy your credentials:
   - API Key
   - API Secret
   - WebSocket URL (wss://...)

5. Update **both** .env files:

**server\.env:**
```env
LIVEKIT_API_KEY=your-api-key-here
LIVEKIT_API_SECRET=your-api-secret-here
LIVEKIT_WS_URL=wss://your-project.livekit.cloud
```

**client\.env:**
```env
VITE_LIVEKIT_WS_URL=wss://your-project.livekit.cloud
```

### 6️⃣ Start the Application

```cmd
cd C:\Users\hatem\mini-gather
npm run dev
```

This starts both server and client!

### 7️⃣ Open Browser

Go to: http://localhost:5173

---

## Verify Each Step

### ✅ Check Shared Package Built

```cmd
dir shared\dist
```

Should show compiled files.

### ✅ Check Database Created

```cmd
psql -U postgres -l
```

Should list `minigather` database.

### ✅ Check Server Starts

Server terminal should show:
```
✅ Database connected successfully
🚀 Server running on port 3001
```

### ✅ Check Client Opens

Browser should show login/register page.

---

## Common Errors & Solutions

### ❌ "Cannot find module '@mini-gather/shared'"

```cmd
cd shared
npm run build
cd ..
```

### ❌ "role root does not exist"

Use `postgres` user instead of `root`:
```cmd
psql -U postgres
```

### ❌ "database minigather does not exist"

Create it:
```cmd
psql -U postgres
CREATE DATABASE minigather;
\q
```

### ❌ "Port 3001 already in use"

```cmd
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### ❌ "connect ECONNREFUSED"

PostgreSQL isn't running. Start it:
1. Open Services (Win + R, type `services.msc`)
2. Find "postgresql-x64-16"
3. Right-click → Start

### ❌ Prisma migration fails

```cmd
cd server
npx prisma migrate reset
npm run prisma:generate
npm run prisma:migrate
```

---

## Full Reset (If Everything Breaks)

```cmd
# 1. Clean everything
npm run clean
npm install

# 2. Build shared
cd shared
npm run build
cd ..

# 3. Reset database
cd server
npx prisma migrate reset
npm run prisma:generate
npm run prisma:migrate
cd ..

# 4. Start fresh
npm run dev
```

---

## Test Everything Works

### Test 1: Server Health

Open: http://localhost:3001/health

Should see:
```json
{"status":"ok","timestamp":"2025-11-02T..."}
```

### Test 2: Client Loads

Open: http://localhost:5173

Should see login page.

### Test 3: Registration

1. Click "Sign Up"
2. Enter email, username, password
3. Choose avatar color
4. Click "Sign Up"
5. Should enter game world

### Test 4: Movement

Press WASD or arrow keys - avatar should move!

### Test 5: Multiplayer

1. Open another browser tab
2. Register different user
3. Both should see each other moving

---

## Still Having Issues?

### Check PostgreSQL Password

Your DATABASE_URL in `server\.env` needs the correct password:

```env
# Wrong (no password or wrong password)
DATABASE_URL="postgresql://postgres@localhost:5432/minigather"

# Correct (with your actual password)
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/minigather?schema=public"
```

### Check PostgreSQL is Running

```cmd
# Check status
sc query postgresql-x64-16

# Start if not running (as Administrator)
net start postgresql-x64-16
```

### Check Node Version

```cmd
node --version
```

Should be v18 or higher.

---

## Quick Commands Summary

```cmd
# Build shared (do this first!)
cd shared && npm run build && cd ..

# Create database
psql -U postgres -c "CREATE DATABASE minigather;"

# Setup
cd server
npm run prisma:generate
npm run prisma:migrate
cd ..

# Run
npm run dev

# Access
# http://localhost:5173
```

---

## Need LiveKit for Video?

Free tier: 50GB/month

1. https://cloud.livekit.io → Sign up
2. Create project
3. Copy credentials to .env files
4. Restart server

Without LiveKit, everything works except video chat!

---

**You're almost there! The main issues are:**
1. ✅ Build shared package first
2. ✅ Use `postgres` user (not `root`)
3. ✅ Make sure PostgreSQL is running
4. ✅ Use correct password in DATABASE_URL

Follow the steps above and you'll be up and running! 🚀
