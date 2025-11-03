import { Player, PlayerMovement, ProximityData } from './game.types';
import { Door, DoorInteraction, DoorUpdate } from './door.types';
import { UserProfile } from './user.types';

export interface ServerToClientEvents {
  // Authentication
  authenticated: (data: { userId: string }) => void;
  auth_error: (error: string) => void;

  // Players
  'player:joined': (player: Player) => void;
  'player:left': (playerId: string) => void;
  'player:position': (data: { playerId: string; movement: PlayerMovement }) => void;
  'players:list': (players: Record<string, Player>) => void;

  // Rooms
  'room:joined': (data: { roomId: string; players: string[] }) => void;
  'room:left': (data: { roomId: string }) => void;
  'room:users': (data: { roomId: string; users: UserProfile[] }) => void;
  'room:update': (data: { roomId: string; players: string[] }) => void;

  // Proximity
  'proximity:enter': (data: ProximityData) => void;
  'proximity:leave': (data: ProximityData) => void;
  'proximity:update': (data: ProximityData[]) => void;

  // Chat
  'chat:message': (message: ChatMessage) => void;
  'chat:history': (messages: ChatMessage[]) => void;

  // Doors
  'door:update': (update: DoorUpdate) => void;
  'door:knock': (data: { doorId: string; knockedBy: string; roomId: string }) => void;
  'doors:list': (doors: Door[]) => void;

  // Game State
  'game:state': (state: any) => void;
  'game:state:update': (update: any) => void;
}

export interface ClientToServerEvents {
  // Authentication
  authenticate: (token: string) => void;

  // Movement
  'player:move': (movement: PlayerMovement) => void;

  // Rooms
  'room:join': (data: { roomId: string; password?: string }) => void;
  'room:leave': (roomId: string) => void;

  // Doors
  'door:interact': (interaction: DoorInteraction) => void;
  'door:knock': (doorId: string) => void;

  // Chat
  'chat:message': (message: { content: string; channel: ChatChannel }) => void;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  channel: ChatChannel;
  roomId?: string;
  timestamp: Date;
}

export enum ChatChannel {
  GLOBAL = 'global',
  ROOM = 'room',
  PROXIMITY = 'proximity',
}

export interface SocketData {
  userId: string;
  username: string;
  avatar: string;
}
