export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  position: Position;
  velocity: Velocity;
  direction: Direction;
  isMoving: boolean;
  currentRoom?: string;
  currentZone?: string; // Current interaction zone (table, specific area)
  timestamp: number;
}

export enum Direction {
  DOWN = 'down',
  UP = 'up',
  LEFT = 'left',
  RIGHT = 'right',
}

export interface PlayerMovement {
  position: Position;
  velocity: Velocity;
  direction: Direction;
  isMoving: boolean;
  timestamp: number;
}

export interface GameState {
  players: Record<string, Player>;
  rooms: Record<string, RoomState>;
}

export interface RoomState {
  id: string;
  name: string;
  type: string;
  bounds: Rectangle;
  capacity: number;
  playerIds: string[];
  isPrivate: boolean;
  password?: string;
  doorIds?: string[]; // IDs of doors that connect to this room
  requiresDoor?: boolean; // If true, must enter through a door
  audioMode?: AudioMode; // How audio works in this room
  allowScreenShare?: boolean; // Enable screen sharing
  backgroundColor?: number; // Visual background color
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProximityData {
  playerId: string;
  distance: number;
  inRange: boolean;
  sameZone?: boolean; // Whether in same interaction zone
  sameRoom?: boolean; // Whether in same room
}

export interface InteractionZone {
  id: string;
  name: string;
  bounds: Rectangle;
  type: 'table' | 'meeting-area' | 'private-space' | 'open'; // Zone type
  isolateAudio: boolean; // If true, only people in this zone can hear each other
  maxParticipants?: number; // Optional capacity limit
}

export enum AudioMode {
  PROXIMITY = 'proximity', // Distance-based only (corridors)
  ZONE = 'zone', // Zone-based isolation (tables)
  ROOM = 'room', // Room-based (meeting rooms, bureaux)
}
