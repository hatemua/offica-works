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
}
