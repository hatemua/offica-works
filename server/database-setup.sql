-- =====================================================
-- Mini-Gather PostgreSQL Database Setup Script
-- =====================================================
-- This script creates the database and all required tables
-- for the Mini-Gather application.
--
-- Usage:
--   1. Create database (run as postgres user):
--      CREATE DATABASE minigather;
--
--   2. Connect to database:
--      \c minigather
--
--   3. Run this script:
--      \i database-setup.sql
--
-- Or run everything at once:
--   psql -U postgres -f database-setup.sql
-- =====================================================

-- Create database (if running as superuser)
-- DROP DATABASE IF EXISTS minigather;
-- CREATE DATABASE minigather;

-- Connect to the database
\c minigather

-- =====================================================
-- TABLE: users
-- =====================================================
-- Stores user account information and authentication data

DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    avatar TEXT NOT NULL DEFAULT 'avatar1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users table
CREATE UNIQUE INDEX users_email_key ON users(email);
CREATE UNIQUE INDEX users_username_key ON users(username);

-- Create trigger to update updatedAt automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE users IS 'User accounts and authentication';
COMMENT ON COLUMN users.id IS 'UUID primary key';
COMMENT ON COLUMN users.email IS 'User email address (unique)';
COMMENT ON COLUMN users.username IS 'Username for display (unique)';
COMMENT ON COLUMN users.password IS 'Hashed password (bcrypt)';
COMMENT ON COLUMN users.avatar IS 'Avatar identifier (avatar1-avatar6)';

-- =====================================================
-- TABLE: rooms
-- =====================================================
-- Stores virtual room/space definitions

DROP TABLE IF EXISTS rooms CASCADE;

CREATE TABLE rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    "boundsX" INTEGER NOT NULL,
    "boundsY" INTEGER NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 20,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    password TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for rooms updatedAt
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE rooms IS 'Virtual rooms/spaces in the game world';
COMMENT ON COLUMN rooms.type IS 'Room type: social, meeting, presentation, private';
COMMENT ON COLUMN rooms."boundsX" IS 'X coordinate of room boundary';
COMMENT ON COLUMN rooms."boundsY" IS 'Y coordinate of room boundary';
COMMENT ON COLUMN rooms.width IS 'Room width in pixels';
COMMENT ON COLUMN rooms.height IS 'Room height in pixels';
COMMENT ON COLUMN rooms.capacity IS 'Maximum number of players allowed';
COMMENT ON COLUMN rooms."isPrivate" IS 'Whether room requires password';

-- =====================================================
-- TABLE: chat_messages
-- =====================================================
-- Stores chat message history

DROP TABLE IF EXISTS chat_messages CASCADE;

CREATE TABLE chat_messages (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    username TEXT NOT NULL,
    content TEXT NOT NULL,
    channel TEXT NOT NULL,
    "roomId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for chat_messages table
CREATE INDEX chat_messages_roomId_idx ON chat_messages("roomId");
CREATE INDEX chat_messages_createdAt_idx ON chat_messages("createdAt");
CREATE INDEX chat_messages_channel_idx ON chat_messages(channel);

COMMENT ON TABLE chat_messages IS 'Chat message history';
COMMENT ON COLUMN chat_messages.channel IS 'Message channel: global, room, proximity';
COMMENT ON COLUMN chat_messages."roomId" IS 'Room ID if channel is room';

-- =====================================================
-- SEED DATA (Optional)
-- =====================================================
-- Uncomment to insert sample data

-- Insert sample rooms
INSERT INTO rooms (id, name, type, "boundsX", "boundsY", width, height, capacity, "isPrivate", "createdAt", "updatedAt")
VALUES
    ('meeting-room-1', 'Conference Room A', 'meeting', 200, 200, 300, 200, 8, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('lounge', 'Lounge Area', 'social', 600, 200, 400, 300, 20, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('presentation-room', 'Presentation Hall', 'presentation', 200, 500, 400, 250, 50, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Display table information

\echo '\n====================================='
\echo 'Database Setup Complete'
\echo '=====================================\n'

\echo 'Tables created:'
\dt

\echo '\n====================================='
\echo 'Table Sizes:'
\echo '=====================================\n'

SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

\echo '\n====================================='
\echo 'Users Table Structure:'
\echo '=====================================\n'
\d users

\echo '\n====================================='
\echo 'Rooms Table Structure:'
\echo '=====================================\n'
\d rooms

\echo '\n====================================='
\echo 'Chat Messages Table Structure:'
\echo '=====================================\n'
\d chat_messages

\echo '\n====================================='
\echo 'Setup Summary:'
\echo '=====================================\n'

SELECT
    'users' as table_name,
    COUNT(*) as record_count
FROM users
UNION ALL
SELECT
    'rooms' as table_name,
    COUNT(*) as record_count
FROM rooms
UNION ALL
SELECT
    'chat_messages' as table_name,
    COUNT(*) as record_count
FROM chat_messages;

\echo '\n====================================='
\echo 'Next Steps:'
\echo '====================================='
\echo '1. Update .env file with:'
\echo '   DATABASE_URL="postgresql://user:password@localhost:5432/minigather?schema=public"'
\echo ''
\echo '2. Generate Prisma client:'
\echo '   npx prisma generate'
\echo ''
\echo '3. Start the server:'
\echo '   npm run dev'
\echo ''
\echo '4. Access database:'
\echo '   psql minigather'
\echo '====================================='
