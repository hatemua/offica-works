import { RoomType } from '../constants/game.constants';
import { Rectangle } from './game.types';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  bounds: Rectangle;
  capacity: number;
  isPrivate: boolean;
  password?: string;
  createdAt: Date;
}

export interface RoomConfig {
  id: string;
  name: string;
  type: RoomType;
  bounds: Rectangle;
  capacity?: number;
  isPrivate?: boolean;
  password?: string;
}

export interface JoinRoomData {
  roomId: string;
  password?: string;
}

export interface RoomParticipant {
  userId: string;
  username: string;
  avatar: string;
  joinedAt: Date;
}
