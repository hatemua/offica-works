# Windows Setup Guide for Mini Gather

## PostgreSQL Setup on Windows

### Option 1: Using Windows PostgreSQL Installation (Recommended)

#### Step 1: Install PostgreSQL

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation:
   - Remember the password you set for the `postgres` user
   - Default port: 5432
   - Install all components including pgAdmin 4

#### Step 2: Create Database Using pgAdmin

1. Open **pgAdmin 4** (installed with PostgreSQL)
2. Connect to your local server (use the password you set)
3. Right-click on "Databases" → "Create" → "Database"
4. Name it: `minigather`
5. Click "Save"

#### Step 3: Update Server .env File

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with the correct Windows PostgreSQL connection:

```env
# Use the postgres user (default on Windows)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/minigather?schema=public"
```

Replace `YOUR_PASSWORD` with the password you set during PostgreSQL installation.

### Option 2: Using Command Line (psql)

```cmd
# Open Command Prompt or PowerShell

# Connect to PostgreSQL as postgres user
psql -U postgres

# Enter your password when prompted

# Create database
CREATE DATABASE minigather;

# Exit
\q
```

### Option 3: Using WSL (Windows Subsystem for Linux)

If you're using WSL, PostgreSQL needs to be installed in WSL:

```bash
# In WSL terminal
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo service postgresql start

# Switch to postgres user
sudo -u postgres psql

# Create database
CREATE DATABASE minigather;

# Create user (optional)
CREATE USER minigather WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE minigather TO minigather;

# Exit
\q
```

Then use this DATABASE_URL:
```env
DATABASE_URL="postgresql://minigather:password@localhost:5432/minigather?schema=public"
```

## Complete Windows Setup Steps

### 1. Install Prerequisites

- ✅ Node.js 18+ - https://nodejs.org/
- ✅ PostgreSQL - https://www.postgresql.org/download/windows/
- ✅ Git (optional) - https://git-scm.com/download/win

### 2. Clone/Extract Project

```cmd
cd C:\Users\hatem\mini-gather
```

### 3. Install Dependencies

```cmd
npm install
```

### 4. Build Shared Package (IMPORTANT - Do This First!)

```cmd
cd shared
npm run build
cd ..
```

### 5. Setup PostgreSQL Database

Using pgAdmin 4 (easiest):
1. Open pgAdmin 4
2. Connect to server
3. Create database: `minigather`

OR using psql:
```cmd
psql -U postgres
CREATE DATABASE minigather;
\q
```

### 6. Configure Environment Variables

**Server Configuration:**

```cmd
cd server
copy .env.example .env
```

Edit `server\.env` (use Notepad or VS Code):

```env
PORT=3001
NODE_ENV=development

# Update with YOUR PostgreSQL password
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD_HERE@localhost:5432/minigather?schema=public"

# Generate a random secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# LiveKit credentials (get from https://cloud.livekit.io)
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
LIVEKIT_WS_URL=wss://your-livekit-server.livekit.cloud

CLIENT_URL=http://localhost:5173
```

**Client Configuration:**

```cmd
cd ..\client
copy .env.example .env
```

Edit `client\.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
VITE_LIVEKIT_WS_URL=wss://your-livekit-server.livekit.cloud
```

### 7. Initialize Database

```cmd
cd ..\server
npm run prisma:generate
npm run prisma:migrate
```

When prompted for migration name, type: `init`

### 8. Start Development Servers

**Option A: Run both together (recommended):**

```cmd
cd ..
npm run dev
```

**Option B: Run separately (two terminals):**

Terminal 1 (Server):
```cmd
cd server
npm run dev
```

Terminal 2 (Client):
```cmd
cd client
npm run dev
```

### 9. Access Application

- Client: http://localhost:5173
- Server: http://localhost:3001/health

## Troubleshooting Windows Issues

### Error: "createdb: role root does not exist"

**Solution:** Windows PostgreSQL uses `postgres` user by default, not `root`.

Use one of these methods:
1. **pgAdmin 4** (easiest)
2. `psql -U postgres` (command line)
3. Update DATABASE_URL to use `postgres` user

### Error: "psql: command not found"

**Solution:** Add PostgreSQL to PATH:

1. Find PostgreSQL bin directory (usually `C:\Program Files\PostgreSQL\16\bin`)
2. Add to System PATH:
   - Search "Environment Variables" in Windows
   - Edit "Path" variable
   - Add PostgreSQL bin directory
3. Restart terminal

### Error: "Port 3001 already in use"

```cmd
# Find process using port
netstat -ano | findstr :3001

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Error: "Cannot find module '@mini-gather/shared'"

**Solution:** Build the shared package first!

```cmd
cd shared
npm run build
cd ..
```

### Error: "ECONNREFUSED" - Can't connect to PostgreSQL

**Solutions:**
1. Check PostgreSQL is running:
   - Open Services app (Win + R, type `services.msc`)
   - Look for "postgresql-x64-16" (or your version)
   - Make sure it's "Running"

2. Start PostgreSQL service:
   ```cmd
   # Run as Administrator
   net start postgresql-x64-16
   ```

3. Check your DATABASE_URL has correct password

### Error: Prisma migration fails

```cmd
# Reset and try again
cd server
npx prisma migrate reset
npm run prisma:generate
npm run prisma:migrate
```

## Windows-Specific Tips

### Use PowerShell or Command Prompt

Both work fine. PowerShell is recommended:
- Right-click Start → "Windows PowerShell"
- Or search for "PowerShell" in Start menu

### File Paths

Use backslashes for Windows paths:
```cmd
cd C:\Users\hatem\mini-gather
cd server\src
```

### Running Multiple Terminals

Use Windows Terminal (recommended):
- Install from Microsoft Store: "Windows Terminal"
- Supports multiple tabs
- Better than Command Prompt

### Text Editors

Recommended for editing .env files:
- VS Code (best)
- Notepad++
- Regular Notepad (works fine)

Don't use Word or WordPad!

## Quick Checklist for Windows

- [ ] Node.js installed (check: `node --version`)
- [ ] PostgreSQL installed (check: open pgAdmin 4)
- [ ] Project dependencies installed (`npm install`)
- [ ] Shared package built (`cd shared && npm run build`)
- [ ] Database created (using pgAdmin or psql)
- [ ] Server .env configured with correct PostgreSQL password
- [ ] Client .env configured with LiveKit URL
- [ ] Database migrated (`npm run prisma:migrate`)
- [ ] Server starts without errors
- [ ] Client opens in browser

## Get LiveKit Credentials (Free)

1. Go to https://cloud.livekit.io
2. Sign up for free account
3. Create new project
4. Copy credentials:
   - API Key (starts with "API")
   - API Secret (long string)
   - WebSocket URL (starts with "wss://")
5. Paste into both .env files

## Verify Everything Works

1. **Check PostgreSQL:**
   ```cmd
   psql -U postgres -d minigather
   \dt
   \q
   ```
   Should show tables: users, rooms, chat_messages

2. **Check Server:**
   Open http://localhost:3001/health
   Should see: `{"status":"ok","timestamp":"..."}`

3. **Check Client:**
   Open http://localhost:5173
   Should see login/register page

4. **Test Registration:**
   - Create account
   - Login
   - Move with WASD keys

## Need More Help?

1. Check server terminal for error messages
2. Check browser console (F12) for client errors
3. Verify PostgreSQL is running in Services
4. Make sure all .env files are configured
5. Rebuild shared package if needed

---

**Windows-specific commands summary:**

```cmd
# Install
npm install

# Build shared (IMPORTANT!)
cd shared
npm run build
cd ..

# Setup database (use pgAdmin or psql)
# Then configure server\.env with postgres password

# Initialize
cd server
npm run prisma:generate
npm run prisma:migrate
cd ..

# Run
npm run dev

# Access
# http://localhost:5173
```

That's it! You're ready to go! 🚀
