import { Server, Socket } from 'socket.io';
import { gameService } from '../services/game.service.js';
import { SOCKET_EVENTS, JoinRoomData } from '@mini-gather/shared';

export function setupRoomHandlers(io: Server, socket: Socket) {
  socket.on(SOCKET_EVENTS.ROOM_JOIN, (data: JoinRoomData) => {
    const room = gameService.getRoom(data.roomId);

    if (!room) {
      socket.emit(SOCKET_EVENTS.ROOM_UPDATE, { error: 'Room not found' });
      return;
    }

    // Check password if private
    if (room.isPrivate && room.password !== data.password) {
      socket.emit(SOCKET_EVENTS.ROOM_UPDATE, { error: 'Invalid password' });
      return;
    }

    // Join room
    const success = gameService.joinRoom(socket.id, data.roomId);

    if (success) {
      // Join socket.io room
      socket.join(data.roomId);

      const players = gameService.getRoomPlayers(data.roomId);

      // Notify player
      socket.emit(SOCKET_EVENTS.ROOM_JOINED, {
        roomId: data.roomId,
        players: players.map(p => p.id)
      });

      // Notify others in room
      socket.to(data.roomId).emit(SOCKET_EVENTS.ROOM_UPDATE, {
        roomId: data.roomId,
        players: players.map(p => p.id)
      });

      console.log(`🚪 ${socket.data.username} joined room: ${room.name}`);
    }
  });

  socket.on(SOCKET_EVENTS.ROOM_LEAVE, (roomId: string) => {
    const room = gameService.getRoom(roomId);
    if (!room) return;

    gameService.leaveRoom(socket.id, roomId);
    socket.leave(roomId);

    const players = gameService.getRoomPlayers(roomId);

    socket.emit(SOCKET_EVENTS.ROOM_LEFT, { roomId });
    socket.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATE, {
      roomId,
      players: players.map(p => p.id)
    });

    console.log(`🚪 ${socket.data.username} left room: ${room.name}`);
  });
}
