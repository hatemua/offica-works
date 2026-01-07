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
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const userId = await authService.verifyToken(token);
      const user = await authService.getUserById(userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.userId = user.id;
      socket.data.username = user.username;
      socket.data.avatar = user.avatar;

      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on(SOCKET_EVENTS.CONNECTION, (socket: Socket) => {
    console.log(`✅ Player connected: ${socket.data.username} (${socket.id})`);

    // Add player to game
    const player = gameService.addPlayer(
      socket.id,
      socket.data.userId,
      socket.data.username,
      socket.data.avatar
    );

    // Send authenticated event
    console.log(`🔐 Sending AUTHENTICATED event to ${socket.data.username}`);
    socket.emit(SOCKET_EVENTS.AUTHENTICATED, { userId: socket.data.userId });

    // Send current game state to new player
    const allPlayers = gameService.getAllPlayers();
    console.log(`📋 Sending PLAYERS_LIST with ${Object.keys(allPlayers).length} players`);
    socket.emit(SOCKET_EVENTS.PLAYERS_LIST, allPlayers);

    // Notify all other players
    socket.broadcast.emit(SOCKET_EVENTS.PLAYER_JOINED, player);

    // Setup handlers
    setupMovementHandlers(io, socket);
    setupRoomHandlers(io, socket);
    setupChatHandlers(io, socket);
    setupDoorHandlers(io, socket);

    // Handle disconnect
    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log(`❌ Player disconnected: ${socket.data.username} (${socket.id})`);
      gameService.removePlayer(socket.id);
      socket.broadcast.emit(SOCKET_EVENTS.PLAYER_LEFT, socket.id);
    });
  });
}
