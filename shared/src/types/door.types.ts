import { DoorState } from '../constants/game.constants.js';

export interface Door {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  state: DoorState;
  roomId: string;
  requiresKey?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export interface DoorInteraction {
  doorId: string;
  playerId: string;
  action: 'open' | 'close' | 'toggle' | 'knock' | 'lock' | 'unlock';
  key?: string; // For locked doors
}

export interface DoorUpdate {
  doorId: string;
  state: DoorState;
  interactedBy?: string;
}

export interface Furniture {
  id: string;
  type:
    // Office furniture
    | 'desk' | 'chair' | 'table' | 'bookshelf' | 'filing-cabinet' | 'cabinet' | 'computer'
    // Lounge furniture
    | 'sofa' | 'beanbag' | 'coffee-table'
    // Kitchen furniture
    | 'fridge' | 'counter' | 'dining-table'
    // Meeting room
    | 'whiteboard' | 'tv'
    // Decorations
    | 'plant'
    // Outdoor
    | 'tree' | 'bush';
  x: number;
  y: number;
  width: number;
  height: number;
  collidable: boolean;
  rotation?: number;
}
