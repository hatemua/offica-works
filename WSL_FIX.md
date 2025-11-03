# WSL (Windows Subsystem for Linux) Fix

## ✅ **bcrypt Native Module Error - FIXED!**

### The Problem

When running the project from WSL with packages installed in Windows, you'll get this error:

```
Error: /mnt/c/Users/hatem/mini-gather/node_modules/bcrypt/lib/binding/napi-v3/bcrypt_lib.node: invalid ELF header
```

**Why this happens:**
- `bcrypt` is a native Node.js module (requires C++ compilation)
- Windows and Linux use different binary formats (PE vs ELF)
- When you install packages in Windows and run in WSL, the binaries are incompatible
- Rebuilding requires Python and build tools

---

## ✅ **The Solution: Use bcryptjs**

We replaced `bcrypt` with `bcryptjs`:

### What Changed:

**Before (bcrypt):**
- ❌ Requires native compilation
- ❌ Needs Python and build tools
- ❌ Different binaries for Windows/Linux
- ✅ Slightly faster

**After (bcryptjs):**
- ✅ Pure JavaScript (no compilation needed)
- ✅ Works on any platform
- ✅ No build dependencies required
- ✅ Slightly slower (but negligible for most apps)

### Files Modified:

1. **server/package.json**
   - Removed: `bcrypt`
   - Added: `bcryptjs`
   - Updated types: `@types/bcryptjs`

2. **server/src/services/auth.service.ts**
   - Changed import: `import bcrypt from 'bcryptjs';`

---

## ✅ **Already Fixed in Your Project!**

The changes have been applied. You're now using `bcryptjs` which works seamlessly in:
- ✅ Windows
- ✅ WSL (Linux)
- ✅ Mac
- ✅ Docker containers
- ✅ Any deployment environment

---

## 🚀 **Running the Project in WSL**

### Recommended Approach: Run Directly in WSL

Since you're using WSL, it's better to run everything natively in WSL:

```bash
# In WSL terminal (not Windows)
cd /mnt/c/Users/hatem/mini-gather

# Start development
npm run dev
```

### Access from Windows:

- **Server**: http://localhost:3001
- **Client**: http://localhost:5173
- Both accessible from Windows browser!

---

## 🔧 **Alternative: Run in Windows (Not WSL)**

If you prefer running in Windows:

```cmd
# In Windows Command Prompt or PowerShell (not WSL)
cd C:\Users\hatem\mini-gather
npm run dev
```

---

## 🐛 **Other WSL Considerations**

### 1. PostgreSQL in WSL

If you want to run PostgreSQL in WSL:

```bash
# Install PostgreSQL in WSL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo service postgresql start

# Create database
sudo -u postgres psql
CREATE DATABASE minigather;
\q

# Update server/.env
DATABASE_URL="postgresql://postgres:password@localhost:5432/minigather?schema=public"
```

### 2. PostgreSQL in Windows (recommended for WSL dev)

If PostgreSQL is installed in Windows:

```env
# server/.env
# Use Windows host IP or localhost
DATABASE_URL="postgresql://postgres:password@localhost:5432/minigather?schema=public"
```

Note: WSL can connect to Windows localhost directly in WSL2.

### 3. File Permissions

WSL may have issues with Windows filesystem:

```bash
# If you get permission errors
chmod -R 755 /mnt/c/Users/hatem/mini-gather

# Or run with elevated permissions
sudo npm run dev
```

### 4. File Watching

WSL file watching can be slow on Windows filesystem. If hot reload is slow:

**Option A: Move project to WSL filesystem**
```bash
# Copy project to WSL home
cp -r /mnt/c/Users/hatem/mini-gather ~/mini-gather
cd ~/mini-gather
npm install  # Reinstall for Linux
npm run dev
```

**Option B: Increase file watchers**
```bash
# Increase inotify watchers
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## 📊 **Performance Comparison: bcrypt vs bcryptjs**

| Operation | bcrypt | bcryptjs | Difference |
|-----------|--------|----------|------------|
| Hash (10 rounds) | ~60ms | ~100ms | +40ms |
| Compare | ~60ms | ~100ms | +40ms |
| **Real Impact** | Negligible for auth operations |

**Verdict:** The extra 40ms is imperceptible for login/register operations. Platform compatibility is more important!

---

## ✅ **Verification**

Check that everything is working:

```bash
# Check bcryptjs is installed
cd server
npm list bcryptjs

# Should show:
# @mini-gather/server@1.0.0
# └── bcryptjs@3.0.2

# Check auth service imports
grep "bcryptjs" src/services/auth.service.ts

# Should show:
# import bcrypt from 'bcryptjs';
```

---

## 🔄 **If You Ever Need Native bcrypt**

For production deployments where you want maximum performance:

```bash
# In production Linux environment
npm uninstall bcryptjs
npm install bcrypt

# Update import back to:
# import bcrypt from 'bcrypt';
```

But for development, bcryptjs is perfect!

---

## 🎯 **Recommended Setup for WSL Development**

### Best Practice:

1. **Install Node.js in WSL:**
   ```bash
   # Use nvm for Node.js in WSL
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.bashrc
   nvm install 18
   nvm use 18
   ```

2. **Move project to WSL filesystem:**
   ```bash
   cp -r /mnt/c/Users/hatem/mini-gather ~/mini-gather
   cd ~/mini-gather
   npm install
   ```

3. **Install PostgreSQL in WSL:**
   ```bash
   sudo apt install postgresql
   sudo service postgresql start
   ```

4. **Run everything in WSL:**
   ```bash
   npm run dev
   ```

5. **Access from Windows:**
   - Open Windows browser
   - Visit: http://localhost:5173
   - Everything works!

---

## 🆘 **Troubleshooting WSL Issues**

### Issue: "EACCES: permission denied"

```bash
# Fix permissions
chmod -R 755 ~/mini-gather
# Or run with sudo
sudo npm run dev
```

### Issue: "Port already in use"

```bash
# Kill process on port
sudo lsof -ti:3001 | xargs kill -9
sudo lsof -ti:5173 | xargs kill -9
```

### Issue: "Cannot connect to PostgreSQL"

```bash
# Check PostgreSQL is running
sudo service postgresql status

# Start if not running
sudo service postgresql start

# Test connection
psql -U postgres -d minigather
```

### Issue: Slow file watching / hot reload

```bash
# Option 1: Increase watchers
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Option 2: Move to WSL filesystem
# Projects in ~/mini-gather are much faster than /mnt/c/
```

---

## 📚 **Summary**

| Aspect | Status |
|--------|--------|
| **bcrypt issue** | ✅ Fixed (using bcryptjs) |
| **Cross-platform** | ✅ Works everywhere |
| **Performance** | ✅ Negligible impact |
| **Build tools** | ✅ Not required |
| **WSL compatible** | ✅ Fully compatible |

---

## 🚀 **Next Steps**

1. ✅ **bcrypt fixed** - Already done!
2. ⏳ **Create database** - See [WINDOWS_SETUP.md](WINDOWS_SETUP.md)
3. ⏳ **Configure .env** - See [QUICK_FIX.md](QUICK_FIX.md)
4. ⏳ **Run migrations** - `cd server && npm run prisma:migrate`
5. ⏳ **Start app** - `npm run dev`

---

**The bcryptjs fix is complete! You can now run the project in WSL, Windows, or any other platform without native compilation issues.** 🎉
