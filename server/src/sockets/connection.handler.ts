import { Server, Socket } from 'socket.io';
import { authService } from '../services/auth.service.js';
import { gameService } from '../services/game.service.js';
import { SOCKET_EVENTS } from '@mini-gather/shared';
import { setupMovementHandlers } from './movement.handler.js';
import { setupRoomHandlers } from './room.handler.js';
import { setupChatHandlers } from './chat.handler.js';
import { setupDoorHandlers } from './door.handler.js';

export function setupSocketHandlers(io: Server) {
  io.use(async (socket, next) => {
    console.log(`\n🔍 [AUTH MIDDLEWARE] Processing connection for socket ${socket.id}`);
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        console.error(`❌ [AUTH MIDDLEWARE] No token provided for socket ${socket.id}`);
        return next(new Error('Authentication required'));
      }

      console.log(`🔑 [AUTH MIDDLEWARE] Verifying token for socket ${socket.id}`);
      const userId = await authService.verifyToken(token);
      const user = await authService.getUserById(userId);

      if (!user) {
        console.error(`❌ [AUTH MIDDLEWARE] User not found for socket ${socket.id}`);
        return next(new Error('User not found'));
      }

      socket.data.userId = user.id;
      socket.data.username = user.username;
      socket.data.avatar = user.avatar;

      console.log(`✅ [AUTH MIDDLEWARE] Authentication successful for ${user.username} (${socket.id})`);
      next();
    } catch (error) {
      console.error(`❌ [AUTH MIDDLEWARE] Authentication failed for socket ${socket.id}:`, error);
      next(new Error('Authentication failed'));
    }
  });

  io.on(SOCKET_EVENTS.CONNECTION, (socket: Socket) => {
    try {
      console.log(`\n========================================`);
      console.log(`🎮 [CONNECTION HANDLER] NEW CONNECTION`);
      console.log(`========================================`);
      console.log(`Player: ${socket.data.username}`);
      console.log(`Socket ID: ${socket.id}`);
      console.log(`Socket connected: ${socket.connected}`);
      console.log(`Total sockets: ${io.sockets.sockets.size}`);
      console.log(`========================================\n`);

      // Add player to game
      console.log(`📝 [CONNECTION HANDLER] Adding player to game service...`);
      const player = gameService.addPlayer(
        socket.id,
        socket.data.userId,
        socket.data.username,
        socket.data.avatar
      );
      console.log(`✅ [CONNECTION HANDLER] Player added to game:`, player);

      // Send authenticated event
      console.log(`\n🔐 [CONNECTION HANDLER] Emitting AUTHENTICATED event to ${socket.data.username} (${socket.id})`);
      console.log(`   Event name: "${SOCKET_EVENTS.AUTHENTICATED}"`);
      console.log(`   Event data:`, { userId: socket.data.userId });
      console.log(`   Socket connected: ${socket.connected}`);

      try {
        socket.emit(SOCKET_EVENTS.AUTHENTICATED, { userId: socket.data.userId });
        console.log(`✅ [CONNECTION HANDLER] AUTHENTICATED event emitted successfully`);
      } catch (emitError) {
        console.error(`❌ [CONNECTION HANDLER] Failed to emit AUTHENTICATED:`, emitError);
      }

      // Send current game state to new player
      const allPlayers = gameService.getAllPlayers();
      console.log(`\n📋 [CONNECTION HANDLER] Emitting PLAYERS_LIST to ${socket.data.username} (${socket.id})`);
      console.log(`   Event name: "${SOCKET_EVENTS.PLAYERS_LIST}"`);
      console.log(`   Total players: ${Object.keys(allPlayers).length}`);
      console.log(`   Player IDs:`, Object.keys(allPlayers));
      console.log(`   Socket connected: ${socket.connected}`);

      try {
        socket.emit(SOCKET_EVENTS.PLAYERS_LIST, allPlayers);
        console.log(`✅ [CONNECTION HANDLER] PLAYERS_LIST event emitted successfully`);
      } catch (emitError) {
        console.error(`❌ [CONNECTION HANDLER] Failed to emit PLAYERS_LIST:`, emitError);
      }

      // Send initial proximity update to new player
      console.log(`\n🎯 [CONNECTION HANDLER] Calculating initial proximity for ${socket.data.username}`);
      const initialProximity = gameService.getPlayersInProximity(socket.id);
      console.log(`   Found ${initialProximity.length} players in proximity`);
      socket.emit(SOCKET_EVENTS.PROXIMITY_UPDATE, initialProximity);
      console.log(`✅ [CONNECTION HANDLER] Initial proximity update sent\n`);

      // Notify all other players
      console.log(`\n📢 [CONNECTION HANDLER] Broadcasting PLAYER_JOINED to other players`);
      console.log(`   Event name: "${SOCKET_EVENTS.PLAYER_JOINED}"`);
      console.log(`   Player data:`, player);
      socket.broadcast.emit(SOCKET_EVENTS.PLAYER_JOINED, player);
      console.log(`✅ [CONNECTION HANDLER] PLAYER_JOINED broadcast complete\n`);

      // Trigger proximity updates for all existing players (new player might be near them)
      console.log(`\n🔄 [CONNECTION HANDLER] Updating proximity for all existing players`);
      const allPlayerIds = Object.keys(allPlayers);
      let proximityUpdateCount = 0;
      allPlayerIds.forEach(playerId => {
        if (playerId !== socket.id) {
          const otherSocket = io.sockets.sockets.get(playerId);
          if (otherSocket) {
            const proximity = gameService.getPlayersInProximity(playerId);
            otherSocket.emit(SOCKET_EVENTS.PROXIMITY_UPDATE, proximity);
            proximityUpdateCount++;
          }
        }
      });
      console.log(`✅ [CONNECTION HANDLER] Sent proximity updates to ${proximityUpdateCount} existing players\n`);

      // Setup handlers
      console.log(`⚙️ [CONNECTION HANDLER] Setting up event handlers...`);
      setupMovementHandlers(io, socket);
      setupRoomHandlers(io, socket);
      setupChatHandlers(io, socket);
      setupDoorHandlers(io, socket);
      console.log(`✅ [CONNECTION HANDLER] All handlers setup complete\n`);

      // Handle disconnect
      socket.on(SOCKET_EVENTS.DISCONNECT, () => {
        console.log(`\n❌ [DISCONNECT] Player disconnected: ${socket.data.username} (${socket.id})`);
        gameService.removePlayer(socket.id);
        socket.broadcast.emit(SOCKET_EVENTS.PLAYER_LEFT, socket.id);
        console.log(`✅ [DISCONNECT] Cleanup complete for ${socket.data.username}\n`);
      });

      console.log(`\n🎉 [CONNECTION HANDLER] Connection setup complete for ${socket.data.username} (${socket.id})\n`);
    } catch (error) {
      console.error(`\n❌ [CONNECTION HANDLER] CRITICAL ERROR during connection setup:`, error);
      console.error(`   Socket ID: ${socket.id}`);
      console.error(`   Username: ${socket.data?.username}`);
      console.error(`   Stack:`, error instanceof Error ? error.stack : 'No stack trace');
      console.log(`\n`);
    }
  });
}
