import { AccessToken } from 'livekit-server-sdk';

export class LiveKitService {
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.apiKey = process.env.LIVEKIT_API_KEY || '';
    this.apiSecret = process.env.LIVEKIT_API_SECRET || '';

    if (!this.apiKey || !this.apiSecret) {
      console.warn('⚠️  LiveKit credentials not configured. Video features will be disabled.');
    }
  }

  async createToken(roomName: string, participantName: string, participantId: string): Promise<string> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('LiveKit not configured');
    }

    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: participantId,
      name: participantName,
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    return await at.toJwt();
  }

  async createProximityToken(userId: string, username: string): Promise<string> {
    return this.createToken('proximity-space', username, userId);
  }

  async createRoomToken(roomId: string, userId: string, username: string): Promise<string> {
    return this.createToken(`room-${roomId}`, username, userId);
  }
}

export const liveKitService = new LiveKitService();
