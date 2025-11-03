# Troubleshooting Guide

Common issues and their solutions for Mini Gather.

---

## ✅ **RESOLVED: JWT TypeScript Compilation Error**

### Error Message:
```
TSError: ⨯ Unable to compile TypeScript:
src/services/auth.service.ts(110,16): error TS2769: No overload matches this call.
```

### Status: **FIXED** ✅

The JWT signing function has been updated with proper type casting.

---

## 🐛 Common Issues

### 1. Module Resolution Errors

#### ❌ Error: "Cannot find module '@mini-gather/shared'"

**Solution:**
```bash
cd shared
npm run build
cd ..
```

The shared package must be built before running client or server.

---

#### ❌ Error: "Cannot find module '@livekit/components-styles'"

**Solution:**
```bash
cd client
npm install @livekit/components-styles
cd ..
```

Already installed in the current project. ✅

---

### 2. Database Issues

#### ❌ Error: "role root does not exist"

**Problem:** Windows PostgreSQL uses `postgres` user, not `root`.

**Solutions:**

**Option A - Use pgAdmin 4:**
1. Open pgAdmin 4
2. Connect to server (use your postgres password)
3. Right-click "Databases" → Create → Database
4. Name: `minigather`
5. Save

**Option B - Use psql:**
```bash
psql -U postgres
CREATE DATABASE minigather;
\q
```

**Option C - WSL:**
```bash
sudo service postgresql start
sudo -u postgres psql
CREATE DATABASE minigather;
\q
```

---

#### ❌ Error: "database minigather does not exist"

**Solution:**
```bash
# Create the database
psql -U postgres -c "CREATE DATABASE minigather;"

# Or use pgAdmin 4 to create it manually
```

---

#### ❌ Error: "connect ECONNREFUSED" / Cannot connect to PostgreSQL

**Solutions:**

1. **Check PostgreSQL is running:**
   ```bash
   # Windows - Check Services
   # Press Win+R, type: services.msc
   # Find: postgresql-x64-16 (or your version)
   # Status should be "Running"

   # Or start it:
   net start postgresql-x64-16
   ```

2. **Verify DATABASE_URL:**
   Edit `server\.env`:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/minigather?schema=public"
   ```
   Make sure the password is correct!

3. **Test connection:**
   ```bash
   psql -U postgres -d minigather
   # Should connect successfully
   \q
   ```

---

#### ❌ Error: Prisma migration fails

**Solution:**
```bash
cd server

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Regenerate client
npm run prisma:generate

# Run migrations again
npm run prisma:migrate

cd ..
```

---

### 3. Port Issues

#### ❌ Error: "Port 3001 already in use"

**Solution:**

**Find and kill the process:**
```bash
# Windows - Find process on port 3001
netstat -ano | findstr :3001

# Kill it (replace PID with actual number)
taskkill /PID <PID> /F

# Or change the port in server/.env:
PORT=3002
```

---

#### ❌ Error: "Port 5173 already in use"

**Solution:**

**Kill the process:**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or the client will auto-increment to 5174
```

---

### 4. Build & Compilation Issues

#### ❌ Error: TypeScript compilation errors

**Solution:**
```bash
# Check for errors in each package
cd server
npx tsc --noEmit

cd ../client
npx tsc --noEmit

cd ../shared
npx tsc --noEmit

cd ..
```

If errors persist, try:
```bash
# Clean and reinstall
npm run clean
npm install

# Rebuild shared
cd shared
npm run build
cd ..
```

---

#### ❌ Error: "Module not found" after installing package

**Solution:**

1. **Restart dev server** (Ctrl+C, then `npm run dev`)
2. **Clear cache:**
   ```bash
   # Client
   cd client
   rm -rf node_modules/.vite

   # Server
   cd ../server
   rm -rf dist

   cd ..
   ```

---

### 5. Runtime Errors

#### ❌ Error: "JWT_SECRET is not defined"

**Solution:**

Edit `server\.env` and add:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

Generate a secure random secret:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or use any long random string
```

---

#### ❌ Error: Socket connection failed

**Symptoms:**
- Client can't connect to server
- "connect_error" in browser console

**Solutions:**

1. **Check server is running:**
   - Open: http://localhost:3001/health
   - Should see: `{"status":"ok",...}`

2. **Check CORS settings:**
   Edit `server\.env`:
   ```env
   CLIENT_URL=http://localhost:5173
   ```

3. **Check Socket URL in client:**
   Edit `client\.env`:
   ```env
   VITE_SOCKET_URL=http://localhost:3001
   ```

4. **Check browser console (F12)** for specific error messages

---

#### ❌ Error: Video not working

**Possible causes & solutions:**

1. **LiveKit not configured:**
   - Sign up at https://cloud.livekit.io
   - Get API Key, Secret, and WebSocket URL
   - Update both `server\.env` and `client\.env`

2. **Browser permissions:**
   - Allow camera/microphone when prompted
   - Check browser settings → Privacy → Camera/Microphone

3. **Wrong WebSocket URL:**
   - Must start with `wss://` (not `ws://`)
   - Must be the same in both .env files

4. **Test LiveKit credentials:**
   ```bash
   # Check server logs for LiveKit errors
   # Should not see: "LiveKit credentials not configured"
   ```

---

### 6. Windows-Specific Issues

#### ❌ Error: 'psql' is not recognized

**Solution:**

Add PostgreSQL to PATH:
1. Find PostgreSQL bin folder (e.g., `C:\Program Files\PostgreSQL\16\bin`)
2. Search "Environment Variables" in Windows
3. Edit "Path" variable
4. Add PostgreSQL bin directory
5. Restart terminal

---

#### ❌ Error: Permission denied / EACCES

**Solution:**

Run terminal as Administrator:
1. Right-click PowerShell or Command Prompt
2. Select "Run as administrator"
3. Try command again

Or close all file explorers and editors, then retry.

---

#### ❌ Error: npm install fails with permission errors

**Solution:**

1. **Close VS Code and all terminals**
2. **Run as Administrator**
3. **Delete node_modules:**
   ```bash
   npm run clean
   ```
4. **Reinstall:**
   ```bash
   npm install
   ```

---

### 7. Browser Issues

#### ❌ Error: Blank page / White screen

**Solutions:**

1. **Check browser console (F12):**
   - Look for red errors
   - Common issues:
     - Module not found → Rebuild shared package
     - Network error → Check server is running

2. **Hard refresh:**
   - Press: Ctrl + Shift + R
   - Or: Ctrl + F5

3. **Clear browser cache:**
   - Settings → Privacy → Clear browsing data
   - Or use incognito/private mode

---

#### ❌ Error: "Cannot connect to server"

**Checklist:**

- [ ] Server is running (`npm run dev` in root or `npm run dev` in server/)
- [ ] Server health check works: http://localhost:3001/health
- [ ] No firewall blocking ports 3001 or 5173
- [ ] VITE_SOCKET_URL in client/.env is correct
- [ ] Browser console shows specific error (F12)

---

### 8. Development Workflow Issues

#### ❌ Changes not reflecting

**Solutions:**

1. **Client changes:**
   - Vite HMR should auto-reload
   - If not, hard refresh (Ctrl + Shift + R)
   - Check terminal for Vite errors

2. **Server changes:**
   - Nodemon should auto-restart
   - Check for compilation errors in terminal
   - If stuck, restart manually (Ctrl+C, then `npm run dev`)

3. **Shared package changes:**
   ```bash
   cd shared
   npm run build
   cd ..
   # Restart both client and server
   ```

---

#### ❌ Hot reload not working

**Solution:**

1. **Check file watchers:**
   - Windows has a limit on file watchers
   - Close unused applications
   - Restart VS Code

2. **Restart dev server:**
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

---

## 🔍 Debugging Checklist

When something goes wrong, check in this order:

### 1. Environment Setup
- [ ] PostgreSQL is running
- [ ] Database `minigather` exists
- [ ] `server\.env` configured correctly
- [ ] `client\.env` configured correctly
- [ ] Shared package is built (`shared\dist` exists)

### 2. Dependencies
- [ ] `npm install` completed successfully
- [ ] No missing packages errors
- [ ] Node version is 18+ (`node --version`)

### 3. Services Running
- [ ] Server health check: http://localhost:3001/health
- [ ] Client accessible: http://localhost:5173
- [ ] No port conflicts
- [ ] No compilation errors in terminals

### 4. Database Connection
- [ ] Prisma client generated
- [ ] Migrations completed
- [ ] Can connect with psql: `psql -U postgres -d minigather`
- [ ] Tables exist: `\dt` in psql

### 5. Browser / Client
- [ ] No red errors in console (F12)
- [ ] Network tab shows successful connections
- [ ] Camera/microphone permissions granted (if using video)

---

## 🆘 Emergency Reset

If everything is broken and you want to start fresh:

```bash
# 1. Stop all servers (Ctrl+C)

# 2. Clean everything
npm run clean

# 3. Reinstall dependencies
npm install

# 4. Build shared package
cd shared
npm run build
cd ..

# 5. Reset database
cd server
npx prisma migrate reset
npm run prisma:generate
npm run prisma:migrate
cd ..

# 6. Verify .env files are configured
# Edit server\.env and client\.env if needed

# 7. Start fresh
npm run dev
```

---

## 📞 Getting Help

### Check logs:

1. **Server logs:**
   - Look at the terminal running the server
   - Check for red error messages
   - Look for database connection errors

2. **Client logs:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Database logs:**
   - Run: `cd server && npm run prisma:studio`
   - Visual interface to check data

### Test components individually:

1. **Test PostgreSQL:**
   ```bash
   psql -U postgres -l
   # Should list databases including 'minigather'
   ```

2. **Test Server:**
   ```bash
   curl http://localhost:3001/health
   # Should return: {"status":"ok",...}
   ```

3. **Test Client:**
   - Open: http://localhost:5173
   - Should see login page

---

## 📚 Additional Resources

- **README.md** - Full documentation
- **WINDOWS_SETUP.md** - Windows-specific setup
- **QUICK_FIX.md** - Common quick fixes
- **SETUP.md** - Complete setup guide
- **ARCHITECTURE.md** - System architecture
- **COMMANDS.md** - All available commands
- **STATUS.md** - Current project status

---

## ✅ Verification Commands

Run these to verify everything is working:

```bash
# 1. Check Node version (should be 18+)
node --version

# 2. Check PostgreSQL connection
psql -U postgres -c "SELECT version();"

# 3. Check database exists
psql -U postgres -l | grep minigather

# 4. Check server health
curl http://localhost:3001/health

# 5. Check if ports are available
netstat -ano | findstr :3001
netstat -ano | findstr :5173
```

---

**Still stuck?** Check the [STATUS.md](STATUS.md) file for the current state of the project and what remains to be configured.
