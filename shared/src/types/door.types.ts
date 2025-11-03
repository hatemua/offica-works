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
  type: 'desk' | 'table' | 'chair' | 'bookshelf' | 'plant' | 'computer' | 'cabinet' | 'sofa';
  x: number;
  y: number;
  width: number;
  height: number;
  collidable: boolean;
  rotation?: number;
}
