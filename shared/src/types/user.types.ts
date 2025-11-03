import { AvatarType } from '../constants/game.constants';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: AvatarType;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends UserCredentials {
  username: string;
  avatar: AvatarType;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: AvatarType;
}
