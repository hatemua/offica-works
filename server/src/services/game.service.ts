import { Player, PlayerMovement, Position, ProximityData, RoomState } from '@mini-gather/shared';
import { GAME_CONFIG } from '@mini-gather/shared';

export class GameService {
  private players: Map<string, Player> = new Map();
  private rooms: Map<string, RoomState> = new Map();

  // Initialize default rooms
  constructor() {
    this.initializeRooms();
  }

  private initializeRooms() {
    const defaultRooms: RoomState[] = [
      {
        id: 'meeting-room-1',
        name: 'Conference Room A',
        type: 'meeting',
        bounds: { x: 200, y: 200, width: 300, height: 200 },
        capacity: 8,
        playerIds: [],
        isPrivate: false
      },
      {
        id: 'lounge',
        name: 'Lounge Area',
        type: 'social',
        bounds: { x: 600, y: 200, width: 400, height: 300 },
        capacity: 20,
        playerIds: [],
        isPrivate: false
      },
      {
        id: 'presentation-room',
        name: 'Presentation Hall',
        type: 'presentation',
        bounds: { x: 200, y: 500, width: 400, height: 250 },
        capacity: 50,
        playerIds: [],
        isPrivate: false
      }
    ];

    defaultRooms.forEach(room => {
      this.rooms.set(room.id, room);
    });
  }

  addPlayer(socketId: string, userId: string, username: string, avatar: string): Player {
    const player: Player = {
      id: socketId,
      userId,
      username,
      avatar,
      position: { x: 400, y: 300 }, // Spawn point
      velocity: { x: 0, y: 0 },
      direction: 'down' as any,
      isMoving: false,
      timestamp: Date.now()
    };

    this.players.set(socketId, player);
    return player;
  }

  removePlayer(socketId: string): void {
    const player = this.players.get(socketId);
    if (player && player.currentRoom) {
      this.leaveRoom(socketId, player.currentRoom);
    }
    this.players.delete(socketId);
  }

  updatePlayerMovement(socketId: string, movement: PlayerMovement): Player | null {
    const player = this.players.get(socketId);
    if (!player) return null;

    player.position = movement.position;
    player.velocity = movement.velocity;
    player.direction = movement.direction;
    player.isMoving = movement.isMoving;
    player.timestamp = movement.timestamp;

    // Check room boundaries
    this.updatePlayerRoom(socketId);

    return player;
  }

  private updatePlayerRoom(socketId: string): void {
    const player = this.players.get(socketId);
    if (!player) return;

    const currentRoomId = player.currentRoom;
    const newRoom = this.getRoomAtPosition(player.position);

    if (currentRoomId !== newRoom?.id) {
      // Leave old room
      if (currentRoomId) {
        this.leaveRoom(socketId, currentRoomId);
      }

      // Join new room
      if (newRoom) {
        this.joinRoom(socketId, newRoom.id);
      }
    }
  }

  private getRoomAtPosition(position: Position): RoomState | null {
    for (const room of this.rooms.values()) {
      if (this.isPositionInBounds(position, room.bounds)) {
        return room;
      }
    }
    return null;
  }

  private isPositionInBounds(position: Position, bounds: { x: number; y: number; width: number; height: number }): boolean {
    return (
      position.x >= bounds.x &&
      position.x <= bounds.x + bounds.width &&
      position.y >= bounds.y &&
      position.y <= bounds.y + bounds.height
    );
  }

  joinRoom(socketId: string, roomId: string): boolean {
    const player = this.players.get(socketId);
    const room = this.rooms.get(roomId);

    if (!player || !room) return false;
    if (room.playerIds.length >= room.capacity) return false;

    room.playerIds.push(socketId);
    player.currentRoom = roomId;
    return true;
  }

  leaveRoom(socketId: string, roomId: string): void {
    const player = this.players.get(socketId);
    const room = this.rooms.get(roomId);

    if (!room) return;

    room.playerIds = room.playerIds.filter(id => id !== socketId);
    if (player) {
      player.currentRoom = undefined;
    }
  }

  getPlayersInProximity(socketId: string): ProximityData[] {
    const player = this.players.get(socketId);
    if (!player) return [];

    const proximityData: ProximityData[] = [];

    for (const [otherId, otherPlayer] of this.players.entries()) {
      if (otherId === socketId) continue;

      const distance = this.calculateDistance(player.position, otherPlayer.position);
      const inRange = distance <= GAME_CONFIG.PROXIMITY_THRESHOLD;

      if (inRange) {
        proximityData.push({
          playerId: otherId,
          distance,
          inRange
        });
      }
    }

    return proximityData;
  }

  private calculateDistance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getPlayer(socketId: string): Player | undefined {
    return this.players.get(socketId);
  }

  getAllPlayers(): Record<string, Player> {
    const playersObj: Record<string, Player> = {};
    this.players.forEach((player, id) => {
      playersObj[id] = player;
    });
    return playersObj;
  }

  getRoom(roomId: string): RoomState | undefined {
    return this.rooms.get(roomId);
  }

  getAllRooms(): Record<string, RoomState> {
    const roomsObj: Record<string, RoomState> = {};
    this.rooms.forEach((room, id) => {
      roomsObj[id] = room;
    });
    return roomsObj;
  }

  getRoomPlayers(roomId: string): Player[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    return room.playerIds
      .map(id => this.players.get(id))
      .filter(p => p !== undefined) as Player[];
  }
}

export const gameService = new GameService();
