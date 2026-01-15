import { Player, PlayerMovement, Position, ProximityData, RoomState, InteractionZone, AudioMode } from '@mini-gather/shared';
import { GAME_CONFIG } from '@mini-gather/shared';
import { loadZonesFromMap } from '../utils/mapZoneLoader.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class GameService {
  private players: Map<string, Player> = new Map();
  private rooms: Map<string, RoomState> = new Map();
  private zones: Map<string, InteractionZone> = new Map();

  // Initialize default rooms
  constructor() {
    this.initializeRooms();
    this.loadZonesFromMapFile();
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
        isPrivate: false,
        audioMode: AudioMode.ROOM // Everyone in room can talk
      },
      {
        id: 'lounge',
        name: 'Lounge Area',
        type: 'social',
        bounds: { x: 600, y: 200, width: 400, height: 300 },
        capacity: 20,
        playerIds: [],
        isPrivate: false,
        audioMode: AudioMode.ZONE // Use zones (tables) for audio
      },
      {
        id: 'presentation-room',
        name: 'Presentation Hall',
        type: 'presentation',
        bounds: { x: 200, y: 500, width: 400, height: 250 },
        capacity: 50,
        playerIds: [],
        isPrivate: false,
        audioMode: AudioMode.ROOM // Everyone in room can talk
      }
    ];

    defaultRooms.forEach(room => {
      this.rooms.set(room.id, room);
    });
  }

  /**
   * Load zones from Tiled map JSON file
   * Replaces hardcoded initializeZones() with dynamic loading from map
   */
  private loadZonesFromMapFile() {
    try {
      // Path to the Tiled map JSON file
      // Assumes map is copied to server/public/assets/maps/ during build
      const mapPath = path.join(__dirname, '../../public/assets/maps/office.json');

      console.log(`\n🗺️  Loading zones from Tiled map...`);
      console.log(`   Map path: ${mapPath}`);

      const zones = loadZonesFromMap(mapPath);

      // Add each zone to the zones map
      zones.forEach(zone => {
        this.zones.set(zone.id, zone);
      });

      console.log(`\n✅ Zone loading complete: ${zones.length} zones active`);
      if (zones.length > 0) {
        console.log(`   Active zones:`);
        zones.forEach(zone => {
          console.log(`   - ${zone.name} (${zone.type}, isolate: ${zone.isolateAudio})`);
        });
      }
      console.log('');
    } catch (error) {
      console.warn('⚠️  Failed to load zones from map file, continuing without zones:', error);
      console.warn('   Zones will be disabled. Check that office.json exists in server/public/assets/maps/');
    }
  }

  private initializeZones() {
    const tile = 32; // GAME_CONFIG.TILE_SIZE
    const zones: InteractionZone[] = [
      // Meeting Room 1 - single zone, everyone can talk
      {
        id: 'zone-meeting-1',
        name: 'Meeting Room 1 Table',
        bounds: { x: 7 * tile, y: 7 * tile, width: 7 * tile, height: 7 * tile },
        type: 'meeting-area',
        isolateAudio: true,
        maxParticipants: 8
      },

      // Meeting Room 2 - single zone
      {
        id: 'zone-meeting-2',
        name: 'Meeting Room 2 Table',
        bounds: { x: 37 * tile, y: 7 * tile, width: 7 * tile, height: 7 * tile },
        type: 'meeting-area',
        isolateAudio: true,
        maxParticipants: 8
      },

      // Lounge tables - isolated zones
      {
        id: 'zone-lounge-table-1',
        name: 'Lounge Table 1',
        bounds: { x: 7 * tile, y: 19 * tile, width: 4 * tile, height: 4 * tile },
        type: 'table',
        isolateAudio: true,
        maxParticipants: 4
      },
      {
        id: 'zone-lounge-table-2',
        name: 'Lounge Table 2',
        bounds: { x: 9 * tile, y: 23 * tile, width: 4 * tile, height: 4 * tile },
        type: 'table',
        isolateAudio: true,
        maxParticipants: 4
      },

      // Kitchen/Dining tables
      {
        id: 'zone-dining-table-1',
        name: 'Dining Table 1',
        bounds: { x: 37 * tile, y: 21 * tile, width: 3 * tile, height: 3 * tile },
        type: 'table',
        isolateAudio: true,
        maxParticipants: 4
      },
      {
        id: 'zone-dining-table-2',
        name: 'Dining Table 2',
        bounds: { x: 40 * tile, y: 21 * tile, width: 3 * tile, height: 3 * tile },
        type: 'table',
        isolateAudio: true,
        maxParticipants: 4
      },

      // Silent zone desks - individual isolated zones
      {
        id: 'zone-silent-desk-1',
        name: 'Silent Desk 1',
        bounds: { x: 23 * tile, y: 19 * tile, width: 3 * tile, height: 2 * tile },
        type: 'private-space',
        isolateAudio: true,
        maxParticipants: 1
      },
      {
        id: 'zone-silent-desk-2',
        name: 'Silent Desk 2',
        bounds: { x: 27 * tile, y: 19 * tile, width: 3 * tile, height: 2 * tile },
        type: 'private-space',
        isolateAudio: true,
        maxParticipants: 1
      },

      // Bureaux - private offices with full isolation
      {
        id: 'zone-bureau-1',
        name: 'Bureau 1',
        bounds: { x: 6 * tile, y: 26 * tile, width: 6 * tile, height: 6 * tile },
        type: 'private-space',
        isolateAudio: true,
        maxParticipants: 3
      },
      {
        id: 'zone-bureau-2',
        name: 'Bureau 2',
        bounds: { x: 17 * tile, y: 26 * tile, width: 6 * tile, height: 6 * tile },
        type: 'private-space',
        isolateAudio: true,
        maxParticipants: 3
      },
      {
        id: 'zone-bureau-3',
        name: 'Bureau 3',
        bounds: { x: 36 * tile, y: 26 * tile, width: 6 * tile, height: 6 * tile },
        type: 'private-space',
        isolateAudio: true,
        maxParticipants: 3
      },

      // Open workspace - proximity-based, non-isolated
      {
        id: 'zone-open-workspace',
        name: 'Open Workspace',
        bounds: { x: 16 * tile, y: 6 * tile, width: 18 * tile, height: 10 * tile },
        type: 'open',
        isolateAudio: false, // Proximity-based only
      },
    ];

    zones.forEach(zone => {
      this.zones.set(zone.id, zone);
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

    // Check zone boundaries
    this.updatePlayerZone(socketId);

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

  private updatePlayerZone(socketId: string): void {
    // Skip zone detection if zones are not initialized
    if (this.zones.size === 0) return;

    const player = this.players.get(socketId);
    if (!player) return;

    const currentZoneId = player.currentZone;
    const newZone = this.getZoneAtPosition(player.position);

    if (currentZoneId !== newZone?.id) {
      // Zone changed
      player.currentZone = newZone?.id;
    }
  }

  private getZoneAtPosition(position: Position): InteractionZone | null {
    // Return null if no zones are configured
    if (this.zones.size === 0) return null;

    for (const zone of this.zones.values()) {
      if (this.isPositionInBounds(position, zone.bounds)) {
        return zone;
      }
    }
    return null;
  }

  getPlayersInProximity(socketId: string): ProximityData[] {
    const player = this.players.get(socketId);
    if (!player) return [];

    const proximityData: ProximityData[] = [];

    // Return all players within proximity range for visual rendering
    // Audio isolation is handled by LiveKit room assignment (zone/room-based)
    for (const [otherId, otherPlayer] of this.players.entries()) {
      if (otherId === socketId) continue;

      const distance = this.calculateDistance(player.position, otherPlayer.position);

      // Check if within proximity range for visual rendering
      if (distance <= GAME_CONFIG.PROXIMITY_THRESHOLD) {
        const sameZone = !!(player.currentZone && player.currentZone === otherPlayer.currentZone);
        const sameRoom = !!(player.currentRoom && player.currentRoom === otherPlayer.currentRoom);

        proximityData.push({
          playerId: otherId,
          distance,
          inRange: true,
          sameZone,
          sameRoom
        });
      }
    }

    return proximityData;
  }

  getPlayersInSameZone(socketId: string): string[] {
    const player = this.players.get(socketId);
    if (!player || !player.currentZone) return [];

    const playerIds: string[] = [];
    for (const [otherId, otherPlayer] of this.players.entries()) {
      if (otherId !== socketId && otherPlayer.currentZone === player.currentZone) {
        playerIds.push(otherId);
      }
    }

    return playerIds;
  }

  getZone(zoneId: string): InteractionZone | undefined {
    return this.zones.get(zoneId);
  }

  getAllZones(): Record<string, InteractionZone> {
    const zonesObj: Record<string, InteractionZone> = {};
    this.zones.forEach((zone, id) => {
      zonesObj[id] = zone;
    });
    return zonesObj;
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
