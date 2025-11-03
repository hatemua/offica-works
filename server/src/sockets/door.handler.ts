import { Server, Socket } from 'socket.io';
import { doorService } from '../services/door.service.js';
import { SOCKET_EVENTS, DoorInteraction, DoorUpdate } from '@mini-gather/shared';

export function setupDoorHandlers(io: Server, socket: Socket) {
  console.log(`🚪 Setting up door handlers for ${socket.data.username}`);

  // Send initial list of all doors when player connects
  const allDoors = doorService.getAllDoors();
  socket.emit(SOCKET_EVENTS.DOORS_LIST, allDoors);
  console.log(`📋 Sent ${allDoors.length} doors to ${socket.data.username}`);

  // Handle door interaction (open/close/toggle)
  socket.on(SOCKET_EVENTS.DOOR_INTERACT, (interaction: DoorInteraction) => {
    console.log(
      `🚪 ${socket.data.username} interacting with door ${interaction.doorId}: ${interaction.action}`
    );

    let updatedDoor = null;

    switch (interaction.action) {
      case 'toggle':
      case 'open':
      case 'close':
        updatedDoor = doorService.interactWithDoor(
          interaction.doorId,
          socket.id
        );
        break;

      case 'lock':
        updatedDoor = doorService.lockDoor(interaction.doorId);
        break;

      case 'unlock':
        if (interaction.key) {
          // TODO: Verify key/permission
          updatedDoor = doorService.unlockDoor(interaction.doorId);
        }
        break;

      case 'knock':
        // Emit knock event to players in the room
        const door = doorService.getDoor(interaction.doorId);
        if (door) {
          io.emit(SOCKET_EVENTS.DOOR_KNOCK, {
            doorId: interaction.doorId,
            knockedBy: socket.data.username,
            roomId: door.roomId,
          });
          console.log(
            `🚪 ${socket.data.username} knocked on door ${interaction.doorId}`
          );
        }
        return; // Don't broadcast door update for knock
    }

    // Broadcast door state update to all connected clients
    if (updatedDoor) {
      const update: DoorUpdate = {
        doorId: updatedDoor.id,
        state: updatedDoor.state,
        interactedBy: socket.data.username,
      };

      io.emit(SOCKET_EVENTS.DOOR_UPDATE, update);
      console.log(
        `📢 Broadcasted door update: ${updatedDoor.id} is now ${updatedDoor.state}`
      );
    }
  });

  // Handle door knock (players knocking on closed doors)
  socket.on(SOCKET_EVENTS.DOOR_KNOCK, (doorId: string) => {
    const door = doorService.getDoor(doorId);
    if (!door) {
      console.warn(`❌ Door not found for knock: ${doorId}`);
      return;
    }

    // Notify all players about the knock
    io.emit(SOCKET_EVENTS.DOOR_KNOCK, {
      doorId: doorId,
      knockedBy: socket.data.username,
      roomId: door.roomId,
    });

    console.log(
      `🚪 ${socket.data.username} knocked on door ${doorId} (room: ${door.roomId})`
    );
  });

  // Cleanup on disconnect (optional)
  socket.on('disconnect', () => {
    // No specific cleanup needed for doors
    // Auto-close timers continue even if player disconnects
  });
}
