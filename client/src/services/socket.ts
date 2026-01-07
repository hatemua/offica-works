import { io, Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents } from '@mini-gather/shared';
import { apiService } from './api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

  connect() {
    const token = apiService.getToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    // Log ALL incoming events for debugging
    this.socket.onAny((eventName, ...args) => {
      console.log(`📨 Socket event received: "${eventName}"`, args);
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
      console.log(`🔌 Socket ID: ${this.socket?.id}`);
      console.log(`🔌 Socket connected: ${this.socket?.connected}`);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
