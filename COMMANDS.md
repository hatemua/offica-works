# Mini Gather - Command Reference

Quick reference for all available commands in the project.

## 🚀 Installation & Setup

```bash
# Install all dependencies (client, server, shared)
npm install

# Clean installation (removes all node_modules)
npm run clean
npm install

# Setup PostgreSQL database
cd server
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run database migrations
npm run prisma:studio      # Open Prisma Studio (DB GUI)
```

## 🔧 Development Commands

### Run Everything

```bash
# From project root - runs both client and server
npm run dev
```

### Run Separately

```bash
# Terminal 1 - Run server only
cd server
npm run dev

# Terminal 2 - Run client only
cd client
npm run dev
```

### Build for Production

```bash
# Build everything
npm run build

# Build client only
npm run build:client

# Build server only
npm run build:server

# Build shared package
cd shared
npm run build
```

## 🗄️ Database Commands

```bash
cd server

# Generate Prisma Client (after schema changes)
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Apply migrations
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (visual database editor)
npm run prisma:studio

# Seed database (if you create a seed file)
npx prisma db seed
```

## 🧪 Package Management

```bash
# Install new package in client
npm install <package-name> --workspace=client

# Install new package in server
npm install <package-name> --workspace=server

# Install dev dependency
npm install <package-name> -D --workspace=client

# Update all packages
npm update

# Check for outdated packages
npm outdated
```

## 🔍 Useful Development Commands

### Server Commands

```bash
cd server

# Start with hot reload
npm run dev

# Build TypeScript
npm run build

# Run built version
npm start

# Check TypeScript errors
npx tsc --noEmit
```

### Client Commands

```bash
cd client

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Shared Commands

```bash
cd shared

# Build shared package
npm run build

# Watch mode (auto-rebuild on changes)
npm run dev
```

## 🐛 Debugging Commands

### Check Ports

```bash
# Windows - Check if port is in use
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# Mac/Linux - Check if port is in use
lsof -ti:3001
lsof -ti:5173
```

### Kill Process on Port

```bash
# Windows
taskkill /PID <PID> /F

# Mac/Linux
kill -9 <PID>
# or
lsof -ti:3001 | xargs kill -9
```

### Check PostgreSQL

```bash
# Check if PostgreSQL is running
# Mac
brew services list

# Linux
sudo systemctl status postgresql

# Windows - Check Services app or run:
pg_isready
```

### Connect to Database

```bash
# Using psql
psql -U postgres -d minigather

# Common psql commands:
\dt          # List tables
\d users     # Describe users table
\q           # Quit
```

## 🧹 Cleanup Commands

```bash
# Remove all node_modules and build folders
npm run clean

# Remove client build
cd client
rm -rf dist node_modules

# Remove server build
cd server
rm -rf dist node_modules

# Clear npm cache (if having issues)
npm cache clean --force
```

## 📦 Git Commands (For Version Control)

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit"

# Create .gitignore (already provided)
# Files already ignored: node_modules, .env, dist, etc.

# View status
git status

# View changes
git diff
```

## 🔒 Environment Setup

```bash
# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Edit environment files (use your preferred editor)
# Windows
notepad server/.env

# Mac/Linux
nano server/.env
# or
vim server/.env
```

## 🚀 Deployment Commands

### Build for Production

```bash
# Build all packages
npm run build

# The outputs will be:
# - client/dist/          (static files)
# - server/dist/          (compiled JavaScript)
# - shared/dist/          (compiled types)
```

### Server Deployment

```bash
cd server

# Install production dependencies only
npm ci --only=production

# Run migrations on production DB
npm run prisma:migrate deploy

# Start production server
npm start
```

### Client Deployment

```bash
cd client

# Build static files
npm run build

# The dist/ folder can be deployed to:
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
# - Any static hosting
```

## 🧪 Testing Commands (Future)

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- <filename>
```

## 📊 Monitoring & Logs

```bash
# View server logs
cd server
npm run dev
# Logs appear in terminal

# View client logs
# Open browser DevTools (F12)
# Check Console tab

# Database query logs
# Set in prisma/schema.prisma:
# log: ["query", "error", "warn"]
```

## 🔧 Common Workflows

### Adding a New Feature

```bash
# 1. Update shared types if needed
cd shared/src/types
# Edit type files
cd ../..
npm run build

# 2. Update server
cd ../server/src
# Add/edit files
cd ../..
# Server auto-reloads

# 3. Update client
cd ../client/src
# Add/edit files
# Client auto-reloads (Vite HMR)
```

### Database Schema Changes

```bash
cd server

# 1. Edit prisma/schema.prisma
# 2. Generate migration
npm run prisma:migrate

# 3. Regenerate client
npm run prisma:generate

# 4. Restart server
npm run dev
```

### Fixing TypeScript Errors

```bash
# Check all TypeScript errors
cd server
npx tsc --noEmit

cd ../client
npx tsc --noEmit

cd ../shared
npx tsc --noEmit
```

## 🆘 Emergency Commands

### Server Won't Start

```bash
# Clean and reinstall
cd server
rm -rf node_modules dist
npm install
npm run prisma:generate
npm run dev
```

### Client Won't Build

```bash
# Clean Vite cache
cd client
rm -rf node_modules dist .vite
npm install
npm run dev
```

### Database Connection Issues

```bash
# Check connection
cd server
npx prisma db pull

# Reset database (WARNING: deletes data)
npx prisma migrate reset

# Reconnect
npm run prisma:generate
```

### Port Already in Use

```bash
# Change ports in .env files
# Server: PORT=3002 (instead of 3001)
# Client: change in vite.config.ts

# Or kill existing process (see above)
```

## 📚 Help Commands

```bash
# npm help
npm help
npm help install
npm help run

# Prisma help
npx prisma --help
npx prisma migrate --help

# Git help
git --help
git commit --help
```

## 🎯 Quick Start Checklist

```bash
# ✅ Complete setup in order:
1. npm install
2. cd server && npm run prisma:generate
3. npm run prisma:migrate
4. cp .env.example .env
5. # Edit .env with your credentials
6. cd ..
7. cp client/.env.example client/.env
8. # Edit client/.env
9. npm run dev
10. # Open http://localhost:5173
```

---

**💡 Pro Tips:**

- Use `npm run dev` from root to run everything
- Keep Prisma Studio open for database inspection
- Use browser DevTools for client debugging
- Check server terminal for backend errors
- Run `npm run build` before deploying

**🔗 Quick Links:**

- Client: http://localhost:5173
- Server: http://localhost:3001
- Health Check: http://localhost:3001/health
- Prisma Studio: Run `npm run prisma:studio` in server/
