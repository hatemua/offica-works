# Mini-Gather Database Setup Guide

Complete guide for setting up PostgreSQL database for the Mini-Gather application on Linux.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Setup (Automated)](#quick-setup-automated)
- [Manual Setup](#manual-setup)
- [Database Schema](#database-schema)
- [Troubleshooting](#troubleshooting)
- [Database Management](#database-management)
- [Backup & Restore](#backup--restore)

---

## Prerequisites

### 1. PostgreSQL Installation

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Fedora/RHEL/CentOS
```bash
sudo dnf install postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

#### Arch Linux
```bash
sudo pacman -S postgresql
sudo -u postgres initdb -D /var/lib/postgres/data
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 2. Verify Installation
```bash
psql --version
# Should output: psql (PostgreSQL) 14.x or higher
```

### 3. Check PostgreSQL Service
```bash
sudo systemctl status postgresql
# Should show: active (running)
```

### 4. Node.js & npm
```bash
node --version  # Should be v16.x or higher
npm --version   # Should be v8.x or higher
```

---

## Quick Setup (Automated)

The easiest way to set up the database is using the automated script:

### Step 1: Make Script Executable
```bash
cd server
chmod +x setup-database.sh
```

### Step 2: Run Setup Script
```bash
./setup-database.sh
```

### Step 3: Follow Interactive Prompts
The script will ask for:
- Database name (default: `minigather`)
- PostgreSQL user (default: `postgres`)
- PostgreSQL password
- Host (default: `localhost`)
- Port (default: `5432`)

### Step 4: Done!
The script will:
- ✅ Create the database
- ✅ Update `.env` file
- ✅ Run Prisma migrations
- ✅ Create all tables
- ✅ Verify setup

### Example Output:
```
🚀 Mini-Gather Database Setup
========================================

✓ PostgreSQL 14.10 is installed
✓ Node.js v18.17.0 and npm 9.6.7 are installed

Database Configuration
========================================
Enter database details (press Enter to use defaults):

Database name [minigather]:
PostgreSQL user [postgres]:
PostgreSQL password: ****
Host [localhost]:
Port [5432]:

✓ Connection successful
✓ Database 'minigather' created
✓ .env file updated
✓ Dependencies installed
✓ Prisma Client generated
✓ Migrations completed
✓ Found 3 table(s) in database

✅ Database setup successful!
```

---

## Manual Setup

For advanced users or troubleshooting, follow these manual steps:

### Step 1: Create Database

#### Switch to postgres user:
```bash
sudo -u postgres psql
```

#### Create database:
```sql
CREATE DATABASE minigather;
\q
```

Or using command line:
```bash
sudo -u postgres createdb minigather
```

### Step 2: Create PostgreSQL User (Optional)

If you want a dedicated user instead of using `postgres`:

```bash
sudo -u postgres psql
```

```sql
CREATE USER minigather_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE minigather TO minigather_user;
\q
```

### Step 3: Run SQL Script

#### Option A: Using psql command
```bash
psql -U postgres -d minigather -f database-setup.sql
```

#### Option B: Inside psql
```bash
psql -U postgres minigather
```
```sql
\i database-setup.sql
```

### Step 4: Configure Environment

Create or update `server/.env`:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/minigather?schema=public"
```

Replace:
- `postgres` with your database username
- `password` with your database password
- `localhost` with your database host
- `5432` with your database port

### Step 5: Install Dependencies
```bash
cd server
npm install
```

### Step 6: Generate Prisma Client
```bash
npx prisma generate
```

### Step 7: Run Migrations
```bash
npx prisma migrate deploy
```

Or for development:
```bash
npx prisma migrate dev
```

### Step 8: Verify Setup
```bash
psql -U postgres -d minigather -c "\dt"
```

Should show:
```
           List of relations
 Schema |     Name      | Type  |  Owner
--------+---------------+-------+----------
 public | chat_messages | table | postgres
 public | rooms         | table | postgres
 public | users         | table | postgres
```

---

## Database Schema

### Table: `users`
Stores user accounts and authentication data.

| Column    | Type      | Description                |
|-----------|-----------|----------------------------|
| id        | TEXT      | UUID primary key           |
| email     | TEXT      | Unique email address       |
| username  | TEXT      | Unique username            |
| password  | TEXT      | Bcrypt hashed password     |
| avatar    | TEXT      | Avatar ID (avatar1-avatar6)|
| createdAt | TIMESTAMP | Account creation time      |
| updatedAt | TIMESTAMP | Last update time           |

**Indexes:**
- `users_email_key` (UNIQUE)
- `users_username_key` (UNIQUE)

---

### Table: `rooms`
Stores virtual room/space definitions.

| Column    | Type      | Description                    |
|-----------|-----------|--------------------------------|
| id        | TEXT      | UUID primary key               |
| name      | TEXT      | Room name                      |
| type      | TEXT      | social/meeting/presentation/private |
| boundsX   | INTEGER   | X coordinate boundary          |
| boundsY   | INTEGER   | Y coordinate boundary          |
| width     | INTEGER   | Room width in pixels           |
| height    | INTEGER   | Room height in pixels          |
| capacity  | INTEGER   | Max players (default: 20)      |
| isPrivate | BOOLEAN   | Requires password (default: false) |
| password  | TEXT      | Room password (optional)       |
| createdAt | TIMESTAMP | Room creation time             |
| updatedAt | TIMESTAMP | Last update time               |

**Default Rooms:**
- `meeting-room-1` - Conference Room A (8 capacity)
- `lounge` - Lounge Area (20 capacity)
- `presentation-room` - Presentation Hall (50 capacity)

---

### Table: `chat_messages`
Stores chat message history.

| Column    | Type      | Description                    |
|-----------|-----------|--------------------------------|
| id        | TEXT      | UUID primary key               |
| userId    | TEXT      | User ID who sent message       |
| username  | TEXT      | Username of sender             |
| content   | TEXT      | Message content                |
| channel   | TEXT      | global/room/proximity          |
| roomId    | TEXT      | Room ID (if channel=room)      |
| createdAt | TIMESTAMP | Message timestamp              |

**Indexes:**
- `chat_messages_roomId_idx`
- `chat_messages_createdAt_idx`
- `chat_messages_channel_idx`

---

## Troubleshooting

### Issue: "Connection refused"

**Cause:** PostgreSQL is not running

**Solution:**
```bash
sudo systemctl start postgresql
sudo systemctl status postgresql
```

---

### Issue: "password authentication failed"

**Cause:** Incorrect password or user doesn't have access

**Solution:**
```bash
# Reset postgres user password
sudo -u postgres psql
\password postgres
# Enter new password
\q
```

Update `.env` with the new password.

---

### Issue: "database does not exist"

**Cause:** Database was not created

**Solution:**
```bash
sudo -u postgres createdb minigather
```

---

### Issue: "peer authentication failed"

**Cause:** PostgreSQL is using peer authentication instead of password

**Solution:**

Edit PostgreSQL configuration:
```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Change:
```
local   all   postgres   peer
```

To:
```
local   all   postgres   md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

---

### Issue: "Port 5432 already in use"

**Cause:** Another PostgreSQL instance or process is using the port

**Solution:**
```bash
# Find process using port 5432
sudo lsof -i :5432

# Stop the process or use a different port
```

---

### Issue: "Permission denied"

**Cause:** User doesn't have permissions on the database

**Solution:**
```bash
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE minigather TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
\q
```

---

### Issue: "relation does not exist"

**Cause:** Migrations haven't been run

**Solution:**
```bash
cd server
npx prisma migrate deploy
# or
npx prisma migrate dev
```

---

## Database Management

### Access Database
```bash
# Using psql
psql -U postgres -d minigather

# or
sudo -u postgres psql minigather
```

### Common psql Commands
```sql
\dt                    -- List all tables
\d users               -- Describe users table
\du                    -- List all users
\l                     -- List all databases
\dn                    -- List all schemas
\q                     -- Quit psql
```

### View Data
```sql
SELECT * FROM users;
SELECT * FROM rooms;
SELECT * FROM chat_messages LIMIT 10;
```

### Count Records
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM rooms;
SELECT COUNT(*) FROM chat_messages;
```

### View Table Sizes
```sql
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Using Prisma Studio

Prisma Studio provides a GUI to view and edit database data:

```bash
cd server
npm run prisma:studio
```

Opens at: http://localhost:5555

---

## Backup & Restore

### Create Backup

#### Full database backup:
```bash
pg_dump -U postgres minigather > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Schema only:
```bash
pg_dump -U postgres --schema-only minigather > schema_backup.sql
```

#### Data only:
```bash
pg_dump -U postgres --data-only minigather > data_backup.sql
```

#### Compressed backup:
```bash
pg_dump -U postgres -Fc minigather > backup.dump
```

### Restore from Backup

#### From SQL file:
```bash
# Drop existing database (CAUTION!)
dropdb -U postgres minigather

# Create new database
createdb -U postgres minigather

# Restore backup
psql -U postgres minigather < backup.sql
```

#### From compressed dump:
```bash
pg_restore -U postgres -d minigather backup.dump
```

### Automated Backups

Create a cron job for daily backups:

```bash
# Edit crontab
crontab -e

# Add line (runs daily at 2 AM):
0 2 * * * pg_dump -U postgres minigather > /backups/minigather_$(date +\%Y\%m\%d).sql
```

---

## Performance Tips

### Enable Query Logging
Edit `postgresql.conf`:
```ini
log_statement = 'all'
log_duration = on
log_min_duration_statement = 100  # Log queries slower than 100ms
```

### Analyze Database
```sql
ANALYZE;
VACUUM;
```

### View Slow Queries
```sql
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Mini-Gather GitHub](https://github.com/yourusername/mini-gather)

---

## Support

If you encounter issues not covered here:

1. Check the server logs: `tail -f /var/log/postgresql/postgresql-*.log`
2. Check Prisma logs in the console
3. Open an issue on GitHub
4. Contact the development team

---

**Last Updated:** January 2025
