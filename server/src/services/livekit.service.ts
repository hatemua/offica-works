import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

export class LiveKitService {
  private apiKey: string;
  private apiSecret: string;
  private livekitHost: string;
  private roomClient: RoomServiceClient | null = null;

  constructor() {
    this.apiKey = process.env.LIVEKIT_API_KEY || '';
    this.apiSecret = process.env.LIVEKIT_API_SECRET || '';
    this.livekitHost = process.env.LIVEKIT_HOST || '';

    if (!this.apiKey || !this.apiSecret) {
      console.warn('⚠️  LiveKit credentials not configured. Video features will be disabled.');
    } else if (this.livekitHost) {
      // Initialize RoomServiceClient for room management (self-hosted LiveKit)
      this.roomClient = new RoomServiceClient(this.livekitHost, this.apiKey, this.apiSecret);
      console.log('✅ LiveKit RoomServiceClient initialized for self-hosted:', this.livekitHost);
    } else {
      console.log('ℹ️  LIVEKIT_HOST not set - assuming LiveKit Cloud (auto-creates rooms)');
    }
  }

  /**
   * Ensures a room exists on the LiveKit server before users join
   * This is REQUIRED for self-hosted LiveKit instances
   */
  private async ensureRoomExists(roomName: string): Promise<void> {
    // Skip room creation if using LiveKit Cloud (auto-creates rooms)
    if (!this.roomClient) {
      return;
    }

    try {
      // Try to list rooms - if it exists, we're done
      const rooms = await this.roomClient.listRooms([roomName]);
      if (rooms.length > 0) {
        console.log(`✅ Room "${roomName}" already exists`);
        return;
      }
    } catch (error) {
      // Room lookup failed, try to create it
    }

    // Room doesn't exist, create it
    try {
      await this.roomClient.createRoom({
        name: roomName,
        emptyTimeout: 300, // Close room after 5 minutes of being empty
        maxParticipants: 50,
      });
      console.log(`✅ Created LiveKit room: "${roomName}"`);
    } catch (createError: any) {
      // If error is "room already exists", that's fine (race condition)
      if (!createError.message?.includes('already exists')) {
        console.error(`❌ Failed to create room "${roomName}":`, createError.message);
        throw createError;
      } else {
        console.log(`✅ Room "${roomName}" already exists (created by another request)`);
      }
    }
  }

  async createToken(roomName: string, participantName: string, participantId: string): Promise<string> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('LiveKit not configured');
    }

    // Ensure room exists before creating token (for self-hosted LiveKit)
    console.log(`🔑 Creating token for room: "${roomName}", participant: "${participantName}"`);
    await this.ensureRoomExists(roomName);

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

    const jwt = await at.toJwt();
    console.log(`✅ Token created for "${roomName}"`);
    return jwt;
  }

  async createProximityToken(userId: string, username: string): Promise<string> {
    return this.createToken('proximity-space', username, userId);
  }

  async createRoomToken(roomId: string, userId: string, username: string): Promise<string> {
    return this.createToken(`room-${roomId}`, username, userId);
  }

  async createZoneToken(zoneId: string, userId: string, username: string): Promise<string> {
    return this.createToken(`zone-${zoneId}`, username, userId);
  }
}

export const liveKitService = new LiveKitService();
