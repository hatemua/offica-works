import { Server, Socket } from 'socket.io';
import { gameService } from '../services/game.service.js';
import { SOCKET_EVENTS, PlayerMovement } from '@mini-gather/shared';

export function setupMovementHandlers(io: Server, socket: Socket) {
  socket.on(SOCKET_EVENTS.PLAYER_MOVE, (movement: PlayerMovement) => {
    const player = gameService.updatePlayerMovement(socket.id, movement);

    if (player) {
      // Broadcast to all other players
      // IMPORTANT: Include full player data so clients can auto-create missing remote players
      // This is a fallback for when players:list event fails to arrive
      socket.broadcast.emit(SOCKET_EVENTS.PLAYER_POSITION, {
        playerId: socket.id,
        movement,
        // Include full player data for auto-creation fallback
        player: {
          id: player.id,
          username: player.username,
          avatar: player.avatar,
          userId: player.userId
        }
      });

      // Check proximity changes and always emit updates
      // This is important: we emit even when empty so clients know when players leave proximity
      const proximityPlayers = gameService.getPlayersInProximity(socket.id);
      socket.emit(SOCKET_EVENTS.PROXIMITY_UPDATE, proximityPlayers);
    }
  });
}
