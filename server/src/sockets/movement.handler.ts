import { Server, Socket } from 'socket.io';
import { gameService } from '../services/game.service.js';
import { SOCKET_EVENTS, PlayerMovement } from '@mini-gather/shared';

// Track previous zone for each player to detect changes
const playerZones = new Map<string, string | undefined>();

export function setupMovementHandlers(io: Server, socket: Socket) {
  socket.on(SOCKET_EVENTS.PLAYER_MOVE, (movement: PlayerMovement) => {
    const player = gameService.updatePlayerMovement(socket.id, movement);

    if (player) {
      // Check for zone changes
      const previousZone = playerZones.get(socket.id);
      const currentZone = player.currentZone;

      if (previousZone !== currentZone) {
        // Zone changed
        if (previousZone) {
          socket.emit(SOCKET_EVENTS.ZONE_LEAVE, { zoneId: previousZone });
          console.log(`🚪 Player ${player.username} left zone: ${previousZone}`);
        }
        if (currentZone) {
          const zone = gameService.getZone(currentZone);
          socket.emit(SOCKET_EVENTS.ZONE_ENTER, {
            zoneId: currentZone,
            zone
          });
          console.log(`🚪 Player ${player.username} entered zone: ${currentZone}`);
        }
        playerZones.set(socket.id, currentZone);
      }

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

  // Cleanup on disconnect
  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    playerZones.delete(socket.id);
  });
}
