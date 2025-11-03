import { Door, DoorState, DOOR_STATES, GAME_CONFIG } from '@mini-gather/shared';

export class DoorService {
  private doors: Map<string, Door> = new Map();
  private autoCloseTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeDoors();
  }

  private initializeDoors(): void {
    // Define default doors for the office
    // Coordinates should match your tilemap positions
    const defaultDoors: Door[] = [
      // Meeting Room A
      {
        id: 'door-meeting-1',
        x: 320,
        y: 300,
        width: 32,
        height: 64,
        state: DOOR_STATES.CLOSED,
        roomId: 'meeting-room-1',
        autoClose: true,
        autoCloseDelay: GAME_CONFIG.DOOR_AUTO_CLOSE_DELAY,
      },
      // Small Office 1
      {
        id: 'door-office-1',
        x: 620,
        y: 200,
        width: 32,
        height: 64,
        state: DOOR_STATES.CLOSED,
        roomId: 'small-office-1',
        autoClose: true,
        autoCloseDelay: GAME_CONFIG.DOOR_AUTO_CLOSE_DELAY,
      },
      // Small Office 2
      {
        id: 'door-office-2',
        x: 620,
        y: 400,
        width: 32,
        height: 64,
        state: DOOR_STATES.CLOSED,
        roomId: 'small-office-2',
        autoClose: true,
        autoCloseDelay: GAME_CONFIG.DOOR_AUTO_CLOSE_DELAY,
      },
      // Bureau (Private Office)
      {
        id: 'door-bureau-1',
        x: 200,
        y: 700,
        width: 32,
        height: 64,
        state: DOOR_STATES.CLOSED,
        roomId: 'bureau-1',
        autoClose: true,
        autoCloseDelay: GAME_CONFIG.DOOR_AUTO_CLOSE_DELAY,
      },
      // Lounge Area
      {
        id: 'door-lounge-1',
        x: 800,
        y: 300,
        width: 32,
        height: 64,
        state: DOOR_STATES.CLOSED,
        roomId: 'lounge',
        autoClose: true,
        autoCloseDelay: GAME_CONFIG.DOOR_AUTO_CLOSE_DELAY,
      },
    ];

    defaultDoors.forEach((door) => {
      this.doors.set(door.id, door);
    });

    console.log(`✅ Initialized ${this.doors.size} doors`);
  }

  /**
   * Interact with a door (toggle open/close)
   */
  interactWithDoor(doorId: string, playerId: string): Door | null {
    const door = this.doors.get(doorId);
    if (!door) {
      console.warn(`❌ Door not found: ${doorId}`);
      return null;
    }

    // Can't interact with locked doors
    if (door.state === DOOR_STATES.LOCKED) {
      console.log(`🔒 Door ${doorId} is locked`);
      return null;
    }

    // Toggle door state
    if (door.state === DOOR_STATES.OPEN) {
      // Close the door
      door.state = DOOR_STATES.CLOSED;
      this.clearAutoCloseTimer(doorId);
      console.log(`🚪 Door ${doorId} closed by ${playerId}`);
    } else {
      // Open the door
      door.state = DOOR_STATES.OPEN;
      console.log(`🚪 Door ${doorId} opened by ${playerId}`);

      // Schedule auto-close if enabled
      if (door.autoClose) {
        this.scheduleAutoClose(
          doorId,
          door.autoCloseDelay || GAME_CONFIG.DOOR_AUTO_CLOSE_DELAY
        );
      }
    }

    return door;
  }

  /**
   * Lock a door
   */
  lockDoor(doorId: string): Door | null {
    const door = this.doors.get(doorId);
    if (!door) return null;

    door.state = DOOR_STATES.LOCKED;
    this.clearAutoCloseTimer(doorId);
    console.log(`🔒 Door ${doorId} locked`);

    return door;
  }

  /**
   * Unlock a door
   */
  unlockDoor(doorId: string): Door | null {
    const door = this.doors.get(doorId);
    if (!door) return null;

    if (door.state === DOOR_STATES.LOCKED) {
      door.state = DOOR_STATES.CLOSED;
      console.log(`🔓 Door ${doorId} unlocked`);
    }

    return door;
  }

  /**
   * Schedule automatic door closing
   */
  private scheduleAutoClose(doorId: string, delay: number): void {
    // Clear existing timer if any
    this.clearAutoCloseTimer(doorId);

    const timer = setTimeout(() => {
      const door = this.doors.get(doorId);
      if (door && door.state === DOOR_STATES.OPEN) {
        door.state = DOOR_STATES.CLOSED;
        console.log(`🚪 Door ${doorId} auto-closed after ${delay}ms`);

        // Emit door update event
        // This will be handled by the door handler
      }
      this.autoCloseTimers.delete(doorId);
    }, delay);

    this.autoCloseTimers.set(doorId, timer);
  }

  /**
   * Clear auto-close timer for a door
   */
  private clearAutoCloseTimer(doorId: string): void {
    const timer = this.autoCloseTimers.get(doorId);
    if (timer) {
      clearTimeout(timer);
      this.autoCloseTimers.delete(doorId);
    }
  }

  /**
   * Get all doors
   */
  getAllDoors(): Door[] {
    return Array.from(this.doors.values());
  }

  /**
   * Get a specific door
   */
  getDoor(doorId: string): Door | undefined {
    return this.doors.get(doorId);
  }

  /**
   * Get doors for a specific room
   */
  getRoomDoors(roomId: string): Door[] {
    return Array.from(this.doors.values()).filter(
      (door) => door.roomId === roomId
    );
  }

  /**
   * Check if player is near a door
   */
  isPlayerNearDoor(
    doorId: string,
    playerX: number,
    playerY: number
  ): boolean {
    const door = this.doors.get(doorId);
    if (!door) return false;

    const distance = Math.sqrt(
      Math.pow(playerX - door.x, 2) + Math.pow(playerY - door.y, 2)
    );

    return distance <= GAME_CONFIG.DOOR_INTERACTION_DISTANCE;
  }

  /**
   * Cleanup all timers
   */
  cleanup(): void {
    this.autoCloseTimers.forEach((timer) => clearTimeout(timer));
    this.autoCloseTimers.clear();
    console.log('🧹 Door service cleaned up');
  }
}

export const doorService = new DoorService();
