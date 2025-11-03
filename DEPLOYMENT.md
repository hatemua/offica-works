# 🚀 Mini Gather - Complete Deployment Guide

This guide covers the complete deployment process including database setup, migrations, environment configuration, and deployment options.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup & Migration](#database-setup--migration)
3. [Environment Configuration](#environment-configuration)
4. [Build Process](#build-process)
5. [Deployment Options](#deployment-options)
6. [Starting Server & Client](#starting-server--client)
7. [Post-Deployment](#post-deployment)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Software

- **Node.js**: v18+ and npm
- **PostgreSQL**: v14+ (for database)
- **LiveKit**: Account (cloud or self-hosted)
- **Git**: For version control
- **PM2**: (Optional) For production process management

### Install Node.js

```bash
# Check if installed
node --version
npm --version

# Install via nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### Install PostgreSQL

**Windows:**
```bash
# Download installer from:
https://www.postgresql.org/download/windows/

# Or use Chocolatey
choco install postgresql
```

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## 🗄️ Database Setup & Migration

### Step 1: Create PostgreSQL Database

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Inside psql, create database and user
CREATE DATABASE minigather;
CREATE USER minigather_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE minigather TO minigather_user;

# Exit psql
\q
```

**Alternative (using createdb command):**
```bash
createdb -U postgres minigather
```

### Step 2: Configure Database URL

Edit `server/.env` with your database connection:

```env
DATABASE_URL="postgresql://minigather_user:your_secure_password@localhost:5432/minigather?schema=public"
```

**Connection String Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=public
```

**Examples:**
- Local: `postgresql://postgres:password@localhost:5432/minigather?schema=public`
- Railway: `postgresql://postgres:pass@containers-us-west-123.railway.app:5432/railway?schema=public`
- Heroku: `postgres://user:pass@ec2-123-456.compute-1.amazonaws.com:5432/dbname?schema=public`
- Supabase: `postgresql://postgres:pass@db.projectid.supabase.co:5432/postgres?schema=public`

### Step 3: Generate Prisma Client

```bash
cd server
npm run prisma:generate
```

This reads `prisma/schema.prisma` and generates the Prisma Client based on your data models.

### Step 4: Run Database Migrations

```bash
# Create and apply migrations
npm run prisma:migrate

# Or with custom migration name
npx prisma migrate dev --name init

# For production deployment
npx prisma migrate deploy
```

**What happens during migration:**
1. Creates `users` table with authentication fields
2. Creates `rooms` table for virtual rooms
3. Creates `chat_messages` table with indexes
4. Sets up foreign key relationships

### Step 5: Verify Database Setup

```bash
# Open Prisma Studio (Database GUI)
npm run prisma:studio
# Access at http://localhost:5555

# Or verify using psql
psql -U minigather_user -d minigather -c "\dt"
```

**Expected tables:**
- `users` (id, email, username, password, avatar, createdAt, updatedAt)
- `rooms` (id, name, type, bounds, capacity, isPrivate, password)
- `chat_messages` (id, userId, username, content, channel, roomId)
- `_prisma_migrations` (migration tracking)

---

## 🔐 Environment Configuration

### Server Environment Variables

Create `server/.env`:

```env
# ============================================
# Server Configuration
# ============================================
PORT=3001
NODE_ENV=production

# ============================================
# Database Configuration
# ============================================
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://minigather_user:your_secure_password@localhost:5432/minigather?schema=public"

# ============================================
# JWT Authentication
# ============================================
# Generate secure secret: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# ============================================
# LiveKit Configuration
# ============================================
# Get from: https://cloud.livekit.io/projects
LIVEKIT_API_KEY=APIxxxxxxxxxxxxxxxxx
LIVEKIT_API_SECRET=your-livekit-secret-key
LIVEKIT_WS_URL=wss://your-project.livekit.cloud

# ============================================
# CORS Configuration
# ============================================
# Production client URL (no trailing slash)
CLIENT_URL=https://your-domain.com
```

**Security Notes:**
- **Never commit `.env` files** to version control
- Use strong, unique secrets in production
- Rotate JWT secrets periodically
- Use managed database services with SSL

### Client Environment Variables

Create `client/.env`:

```env
# ============================================
# API Configuration
# ============================================
VITE_API_URL=https://api.your-domain.com
VITE_SOCKET_URL=https://api.your-domain.com

# ============================================
# LiveKit Configuration
# ============================================
VITE_LIVEKIT_WS_URL=wss://your-project.livekit.cloud
```

**Important:**
- Vite requires `VITE_` prefix for client-side variables
- These are embedded at build time (not runtime)
- Do not include sensitive keys in client env

### Environment Templates

Copy example files:
```bash
# Server
cp server/.env.example server/.env

# Client
cp client/.env.example client/.env

# Then edit with your actual values
```

---

## 🔨 Build Process

### Development Build

```bash
# Install dependencies (from root)
npm install

# This installs all workspace dependencies:
# - client/node_modules
# - server/node_modules
# - shared/node_modules

# Build shared types first
cd shared
npm run build

# Build server
cd ../server
npm run build

# Build client
cd ../client
npm run build
```

### Production Build

```bash
# From root directory
npm run build

# Or individually
npm run build:client
npm run build:server
```

**Build Outputs:**
- **Client**: `client/dist/` (static files: HTML, CSS, JS)
- **Server**: `server/dist/` (compiled JavaScript)
- **Shared**: `shared/dist/` (type definitions)

### Build Verification

```bash
# Check build outputs
ls -la client/dist/
ls -la server/dist/

# Test production build locally
cd server
NODE_ENV=production node dist/index.js

# In another terminal
cd client
npx serve dist
```

---

## 🌐 Deployment Options

### Option 1: VPS/Dedicated Server (PM2)

**Best for:** Full control, custom infrastructure, self-hosted

#### 1. Install PM2

```bash
npm install -g pm2
```

#### 2. Create PM2 Ecosystem File

Create `ecosystem.config.js` in project root:

```javascript
module.exports = {
  apps: [
    {
      name: 'mini-gather-server',
      cwd: './server',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
```

#### 3. Deploy Server

```bash
# Start server with PM2
pm2 start ecosystem.config.js

# View status
pm2 status

# View logs
pm2 logs mini-gather-server

# Auto-restart on reboot
pm2 startup
pm2 save
```

#### 4. Setup Nginx Reverse Proxy

Create `/etc/nginx/sites-available/minigather`:

```nginx
# API Server
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Client (Static Files)
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/minigather/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/minigather /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

---

### Option 2: Docker Deployment

**Best for:** Containerized environments, easy scaling

#### 1. Create Dockerfile for Server

Create `server/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY server/package*.json ./server/

# Install dependencies
RUN npm install --workspaces

# Copy source
COPY shared ./shared
COPY server ./server

# Build
RUN npm run build --workspace=shared
RUN npm run build --workspace=server

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built files and production dependencies
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/shared/dist ../shared/dist
COPY --from=builder /app/server/prisma ./prisma

# Install PM2
RUN npm install -g pm2

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

#### 2. Create Dockerfile for Client

Create `client/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY client/package*.json ./client/
COPY shared/package*.json ./shared/

RUN npm install --workspaces

COPY shared ./shared
COPY client ./client

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_SOCKET_URL
ARG VITE_LIVEKIT_WS_URL

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_LIVEKIT_WS_URL=$VITE_LIVEKIT_WS_URL

RUN npm run build --workspace=shared
RUN npm run build --workspace=client

# Production stage
FROM nginx:alpine

COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 3. Create docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: minigather-db
    environment:
      POSTGRES_USER: minigather_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: minigather
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U minigather_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  server:
    build:
      context: .
      dockerfile: server/Dockerfile
    container_name: minigather-server
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: postgresql://minigather_user:${DB_PASSWORD}@postgres:5432/minigather?schema=public
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 7d
      LIVEKIT_API_KEY: ${LIVEKIT_API_KEY}
      LIVEKIT_API_SECRET: ${LIVEKIT_API_SECRET}
      LIVEKIT_WS_URL: ${LIVEKIT_WS_URL}
      CLIENT_URL: ${CLIENT_URL}
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    command: >
      sh -c "
        npx prisma migrate deploy &&
        node dist/index.js
      "

  client:
    build:
      context: .
      dockerfile: client/Dockerfile
      args:
        VITE_API_URL: ${VITE_API_URL}
        VITE_SOCKET_URL: ${VITE_SOCKET_URL}
        VITE_LIVEKIT_WS_URL: ${LIVEKIT_WS_URL}
    container_name: minigather-client
    ports:
      - "80:80"
    depends_on:
      - server

volumes:
  postgres_data:
```

#### 4. Deploy with Docker Compose

```bash
# Create .env file for docker-compose
cat > .env << EOF
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret
LIVEKIT_API_KEY=your_livekit_key
LIVEKIT_API_SECRET=your_livekit_secret
LIVEKIT_WS_URL=wss://your-project.livekit.cloud
CLIENT_URL=https://your-domain.com
VITE_API_URL=https://api.your-domain.com
VITE_SOCKET_URL=https://api.your-domain.com
EOF

# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

### Option 3: Cloud Platform Deployment

#### Railway (Recommended for Server)

1. **Create Railway Account**: https://railway.app
2. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   railway login
   ```

3. **Create New Project**:
   ```bash
   railway init
   ```

4. **Add PostgreSQL**:
   - Dashboard → New → Database → PostgreSQL
   - Copy `DATABASE_URL` from Variables tab

5. **Deploy Server**:
   ```bash
   cd server
   railway up
   ```

6. **Set Environment Variables** (in Railway Dashboard):
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=your_secret
   LIVEKIT_API_KEY=your_key
   LIVEKIT_API_SECRET=your_secret
   LIVEKIT_WS_URL=wss://your-project.livekit.cloud
   CLIENT_URL=https://your-client-domain.vercel.app
   ```

7. **Run Migrations**:
   ```bash
   railway run npx prisma migrate deploy
   ```

#### Vercel (Recommended for Client)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy Client**:
   ```bash
   cd client
   vercel
   ```

3. **Set Environment Variables** (Vercel Dashboard):
   ```
   VITE_API_URL=https://your-api.railway.app
   VITE_SOCKET_URL=https://your-api.railway.app
   VITE_LIVEKIT_WS_URL=wss://your-project.livekit.cloud
   ```

4. **Redeploy**:
   ```bash
   vercel --prod
   ```

#### Render

1. **Create Web Service** for server
2. **Build Command**: `npm run build`
3. **Start Command**: `node server/dist/index.js`
4. **Add PostgreSQL** database
5. **Set Environment Variables**

---

## ▶️ Starting Server & Client

### Development Mode

```bash
# Option 1: Run both together (from root)
npm run dev

# Option 2: Run separately
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

### Production Mode (Local)

```bash
# 1. Build everything
npm run build

# 2. Start server
cd server
NODE_ENV=production node dist/index.js

# 3. Serve client (in another terminal)
cd client
npx serve dist -l 5173
```

### Production Mode (PM2)

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Commands
pm2 status              # View status
pm2 logs                # View logs
pm2 restart all         # Restart all
pm2 stop all            # Stop all
pm2 delete all          # Delete all processes
pm2 monit               # Monitor resources
```

### Production Mode (Docker)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f server
docker-compose logs -f client

# Restart service
docker-compose restart server

# Stop all
docker-compose down
```

---

## ✅ Post-Deployment

### 1. Verify Database Connection

```bash
# Check server logs
pm2 logs mini-gather-server

# Should see:
# ✅ Database connected successfully
```

### 2. Test Health Endpoints

```bash
# Server health
curl https://api.your-domain.com/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-15T12:00:00.000Z"}
```

### 3. Test Authentication

```bash
# Register user
curl -X POST https://api.your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "username": "testuser",
    "avatar": "avatar1"
  }'

# Login
curl -X POST https://api.your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### 4. Test WebSocket Connection

Open browser console at `https://your-domain.com`:

```javascript
const io = require('socket.io-client');
const socket = io('https://api.your-domain.com');
socket.on('connect', () => console.log('Connected!'));
```

### 5. Monitor Performance

```bash
# Server resources (PM2)
pm2 monit

# Database connections
psql -U minigather_user -d minigather -c "SELECT count(*) FROM pg_stat_activity;"

# Nginx access logs
tail -f /var/log/nginx/access.log

# Application logs
pm2 logs --lines 100
```

### 6. Setup Monitoring

**Sentry** (Error Tracking):
```bash
npm install @sentry/node --workspace=server
```

**Uptime Monitoring**:
- UptimeRobot: https://uptimerobot.com
- Pingdom: https://pingdom.com
- StatusCake: https://statuscake.com

---

## 🐛 Troubleshooting

### Database Issues

**Error: Connection refused**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Start if stopped
sudo systemctl start postgresql

# Check connection
psql -U minigather_user -d minigather
```

**Error: Migration failed**
```bash
# Reset migrations (CAUTION: Deletes data)
npx prisma migrate reset

# Or create new migration
npx prisma migrate dev --name fix_migration
```

**Error: Prisma Client not generated**
```bash
cd server
npm run prisma:generate
npm run build
```

### Server Issues

**Error: Port already in use**
```bash
# Find process using port
lsof -i :3001  # Mac/Linux
netstat -ano | findstr :3001  # Windows

# Kill process
kill -9 <PID>
```

**Error: JWT secret not set**
```bash
# Generate secure secret
openssl rand -base64 32

# Add to server/.env
JWT_SECRET=generated_secret_here
```

**Error: LiveKit connection failed**
- Verify credentials in `.env`
- Check LiveKit dashboard for API key status
- Ensure WebSocket URL uses `wss://` (not `ws://`)
- Test at: https://livekit.io/cloud/projects/your-project

### Client Issues

**Error: API connection failed**
- Check `VITE_API_URL` in client `.env`
- Verify CORS settings in server
- Check network tab in browser DevTools
- Ensure server is running

**Error: WebSocket connection failed**
- Check `VITE_SOCKET_URL` matches server URL
- Verify Socket.io CORS configuration
- Check firewall rules
- Ensure nginx WebSocket proxy is configured

**Error: Video not working**
- Grant browser camera/microphone permissions
- Check LiveKit credentials
- Verify `VITE_LIVEKIT_WS_URL` is correct
- Test in incognito mode (disable extensions)

### Build Issues

**Error: Module not found**
```bash
# Clean install
npm run clean
npm install
cd server && npm run prisma:generate
npm run build
```

**Error: TypeScript compilation failed**
```bash
# Check for errors
cd server && npx tsc --noEmit
cd client && npx tsc --noEmit

# Fix errors and rebuild
npm run build
```

---

## 📊 Production Checklist

- [ ] PostgreSQL database created and accessible
- [ ] Database migrations applied successfully
- [ ] Strong JWT secret generated (min 32 characters)
- [ ] LiveKit account created and credentials configured
- [ ] Environment variables set correctly (server + client)
- [ ] Server builds without errors
- [ ] Client builds without errors
- [ ] Health endpoint responding (200 OK)
- [ ] Authentication working (register/login)
- [ ] WebSocket connection established
- [ ] Video/audio working with LiveKit
- [ ] SSL certificates installed (HTTPS)
- [ ] PM2 configured for auto-restart
- [ ] Nginx reverse proxy configured
- [ ] CORS configured for production domains
- [ ] Error monitoring setup (Sentry/etc)
- [ ] Database backups configured
- [ ] Server logs being collected
- [ ] Uptime monitoring enabled

---

## 🔒 Security Recommendations

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, unique secrets
   - Rotate credentials regularly

2. **Database**
   - Use strong passwords
   - Enable SSL connections in production
   - Regular backups (daily recommended)
   - Restrict database access by IP

3. **Server**
   - Keep dependencies updated (`npm audit`)
   - Use HTTPS only in production
   - Implement rate limiting
   - Set up firewall rules

4. **Authentication**
   - Enforce strong password policies
   - Implement password reset flow
   - Consider 2FA for admin accounts
   - Log authentication attempts

5. **Monitoring**
   - Set up error tracking (Sentry)
   - Monitor server resources
   - Track database performance
   - Set up alerts for downtime

---

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Guides](https://www.prisma.io/docs/guides)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [LiveKit Documentation](https://docs.livekit.io/)

---

**Need Help?**
- Check [README.md](README.md) for basic setup
- Review [Troubleshooting](#troubleshooting) section
- Open an issue on GitHub

---

*Last Updated: January 2025*
