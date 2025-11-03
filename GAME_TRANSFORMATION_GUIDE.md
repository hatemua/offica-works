# 🎮 Mini Gather - Beautiful Office Game Transformation Guide

This guide will help you transform Mini Gather into a beautiful pixel-art office game with advanced features like doors, furniture collision, smart video disconnect, and different room types.

## 📋 Overview of Changes

We've started implementing the foundation. Here's what has been added and what remains:

### ✅ Completed (Foundation)

1. **Enhanced Game Constants** (`shared/src/constants/game.constants.ts`):
   - Door configuration (auto-close delay, interaction distance)
   - Room types: Corridor, Meeting, Small Office, Bureau
   - Proximity thresholds for auto-disconnect
   - Collision layers
   - Audio fade distances

2. **Door Types** (`shared/src/types/door.types.ts`):
   - Door interface with states (open/closed/locked)
   - Door interactions (open, close, toggle, knock, lock, unlock)
   - Furniture interface for collision objects

3. **Enhanced Room Types** (`shared/src/types/game.types.ts`):
   - Door IDs linked to rooms
   - Video modes (proximity/all/none)
   - Screen sharing flags
   - Door entry requirements

4. **Door Socket Events** (`shared/src/constants/socket.events.ts`):
   - `DOOR_INTERACT` - Player interacts with door
   - `DOOR_UPDATE` - Door state changed
   - `DOOR_KNOCK` - Player knocks on door
   - `DOORS_LIST` - Initial door list

5. **Door Entity Class** (`client/src/game/entities/Door.ts`):
   - Visual representation with colors based on state
   - Lock icons for locked doors
   - Proximity detection
   - Interaction hints ("Press E to open")
   - Physics collision

## 🚀 Next Steps - What You Need to Implement

### Step 1: Create Beautiful Office Assets (High Priority)

You have two options:

#### Option A: Use Tiled Map Editor (Recommended)

1. **Download Tiled**: https://www.mapeditor.org/
2. **Create Tileset** (32x32 pixels per tile):
   ```
   tiles/office-tileset.png:
   - Floor tiles: carpet (blue, red, gray), wood, tile
   - Walls: office walls, glass walls, doors
   - Furniture: desks, chairs, tables, computers
   - Decorations: plants, paintings, windows
   ```

3. **Design Office Layout**:
   - Create `client/public/assets/maps/office-map.json`
   - Layers:
     - `ground` - Floor tiles
     - `walls` - Collision layer
     - `furniture` - Desks, tables (with collision)
     - `decorations` - Non-collidable decorations
     - `doors` - Door positions (object layer)

4. **Example Office Layout**:
   ```
   +-----------------------------------+
   |  Reception  | Corridor            |
   |  [Desk]     |                     |
   |-------------|    [Plant]  [Sofa]  |
   | Meeting Rm  |                     |
   | [Table]     |                     |
   | [Chairs]    |--+----+-------------|
   |-------------|  |Door|  Office 1   |
   | Small Rm    |  +----+  [Desk]     |
   | [2 Desks]   |        [Chair]      |
   +-----------------------------------+
   ```

#### Option B: Procedural Generation (Simpler, Less Beautiful)

Keep current system but enhance with:
- Better color schemes
- Furniture sprites (created with Graphics API)
- Room decorations

**I recommend Option A** for a truly beautiful game.

### Step 2: Load Tilemap in Phaser (If using Tiled)

Update `client/src/game/scenes/MainScene.ts`:

```typescript
preload() {
  // Load tileset image
  this.load.image('office-tiles', '/assets/tilesets/office-tileset.png');

  // Load tilemap JSON
  this.load.tilemapTiledJSON('office-map', '/assets/maps/office-map.json');
}

create() {
  // Create tilemap
  const map = this.make.tilemap({ key: 'office-map' });
  const tileset = map.addTilesetImage('office-tileset', 'office-tiles');

  // Create layers
  const groundLayer = map.createLayer('ground', tileset, 0, 0);
  const wallsLayer = map.createLayer('walls', tileset, 0, 0);
  const furnitureLayer = map.createLayer('furniture', tileset, 0, 0);
  const decorationsLayer = map.createLayer('decorations', tileset, 0, 0);

  // Set collision
  wallsLayer.setCollisionByProperty({ collides: true });
  furnitureLayer.setCollisionByProperty({ collides: true });

  // Later in create() after creating player:
  this.physics.add.collider(this.localPlayer, wallsLayer);
  this.physics.add.collider(this.localPlayer, furnitureLayer);
}
```

### Step 3: Implement Door System

#### 3.1 Server-Side Door Service

Create `server/src/services/door.service.ts`:

```typescript
import { Door, DoorState, DOOR_STATES, GAME_CONFIG } from '@mini-gather/shared';

export class DoorService {
  private doors: Map<string, Door> = new Map();
  private autoCloseTimers: Map<string, NodeJS.Timeout> = new Map();

  initializeDoors() {
    const defaultDoors: Door[] = [
      {
        id: 'door-meeting-1',
        x: 300, y: 300,
        width: 32, height: 64,
        state: DOOR_STATES.CLOSED,
        roomId: 'meeting-room-1',
        autoClose: true,
        autoCloseDelay: GAME_CONFIG.DOOR_AUTO_CLOSE_DELAY
      },
      {
        id: 'door-office-1',
        x: 600, y: 200,
        width: 32, height: 64,
        state: DOOR_STATES.CLOSED,
        roomId: 'small-office-1',
        autoClose: true
      },
      // Add more doors...
    ];

    defaultDoors.forEach(door => this.doors.set(door.id, door));
  }

  interactWithDoor(doorId: string, playerId: string): Door | null {
    const door = this.doors.get(doorId);
    if (!door) return null;

    if (door.state === DOOR_STATES.LOCKED) {
      return null; // Can't interact with locked doors
    }

    // Toggle door state
    if (door.state === DOOR_STATES.OPEN) {
      door.state = DOOR_STATES.CLOSED;
      this.clearAutoCloseTimer(doorId);
    } else {
      door.state = DOOR_STATES.OPEN;
      if (door.autoClose) {
        this.scheduleAutoClose(doorId, door.autoCloseDelay || GAME_CONFIG.DOOR_AUTO_CLOSE_DELAY);
      }
    }

    return door;
  }

  private scheduleAutoClose(doorId: string, delay: number): void {
    this.clearAutoCloseTimer(doorId);

    const timer = setTimeout(() => {
      const door = this.doors.get(doorId);
      if (door && door.state === DOOR_STATES.OPEN) {
        door.state = DOOR_STATES.CLOSED;
        // Emit door update event here
      }
    }, delay);

    this.autoCloseTimers.set(doorId, timer);
  }

  private clearAutoCloseTimer(doorId: string): void {
    const timer = this.autoCloseTimers.get(doorId);
    if (timer) {
      clearTimeout(timer);
      this.autoCloseTimers.delete(doorId);
    }
  }

  getAllDoors(): Door[] {
    return Array.from(this.doors.values());
  }

  getDoor(doorId: string): Door | undefined {
    return this.doors.get(doorId);
  }
}

export const doorService = new DoorService();
```

#### 3.2 Door Socket Handler

Create `server/src/sockets/door.handler.ts`:

```typescript
import { Server, Socket } from 'socket.io';
import { doorService } from '../services/door.service.js';
import { SOCKET_EVENTS, DoorInteraction } from '@mini-gather/shared';

export function setupDoorHandlers(io: Server, socket: Socket) {
  // Send initial doors list
  socket.emit(SOCKET_EVENTS.DOORS_LIST, doorService.getAllDoors());

  // Handle door interaction
  socket.on(SOCKET_EVENTS.DOOR_INTERACT, (interaction: DoorInteraction) => {
    const updatedDoor = doorService.interactWithDoor(interaction.doorId, socket.id);

    if (updatedDoor) {
      // Broadcast door update to all players
      io.emit(SOCKET_EVENTS.DOOR_UPDATE, {
        doorId: updatedDoor.id,
        state: updatedDoor.state,
        interactedBy: socket.data.username
      });
    }
  });

  // Handle door knock
  socket.on(SOCKET_EVENTS.DOOR_KNOCK, (doorId: string) => {
    const door = doorService.getDoor(doorId);
    if (door) {
      // Notify players in the room
      io.emit(SOCKET_EVENTS.DOOR_KNOCK, {
        doorId,
        knockedBy: socket.data.username
      });
    }
  });
}
```

#### 3.3 Client-Side Door Management

Update `client/src/game/scenes/MainScene.ts`:

```typescript
export class MainScene extends Phaser.Scene {
  private doors: Map<string, Door> = new Map();
  private eKey?: Phaser.Input.Keyboard.Key;

  create() {
    // ... existing code ...

    // Add E key for door interaction
    this.eKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Listen for door events
    this.setupDoorListeners();
  }

  private setupDoorListeners() {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Receive doors list
    socket.on(SOCKET_EVENTS.DOORS_LIST, (doors: Door[]) => {
      doors.forEach(doorData => {
        const door = new Door(this, doorData);
        this.doors.set(doorData.id, door);
      });
    });

    // Door state update
    socket.on(SOCKET_EVENTS.DOOR_UPDATE, (update: DoorUpdate) => {
      const door = this.doors.get(update.doorId);
      if (door) {
        door.updateState(update.state);
      }
    });
  }

  update() {
    // ... existing movement code ...

    // Check door proximity and interaction
    if (this.localPlayer) {
      let nearestDoor: Door | null = null;

      this.doors.forEach(door => {
        const isNear = door.checkPlayerProximity(
          this.localPlayer!.x,
          this.localPlayer!.y
        );
        if (isNear && door.canInteract()) {
          nearestDoor = door;
        }
      });

      // E key pressed to interact with door
      if (Phaser.Input.Keyboard.JustDown(this.eKey!) && nearestDoor) {
        const socket = socketService.getSocket();
        socket?.emit(SOCKET_EVENTS.DOOR_INTERACT, {
          doorId: nearestDoor.getDoorId(),
          playerId: socket.id,
          action: 'toggle'
        });
      }
    }
  }
}
```

### Step 4: Enhanced Room System with Video Management

#### 4.1 Update Room Service

Update `server/src/services/game.service.ts`:

```typescript
private initializeRooms() {
  const defaultRooms: RoomState[] = [
    {
      id: 'corridor-main',
      name: 'Main Corridor',
      type: ROOM_TYPES.CORRIDOR,
      bounds: { x: 100, y: 100, width: 800, height: 200 },
      capacity: 999, // No limit for corridors
      playerIds: [],
      isPrivate: false,
      requiresDoor: false,
      videoMode: 'proximity', // Only connect to nearby players
      allowScreenShare: false
    },
    {
      id: 'meeting-room-1',
      name: 'Conference Room A',
      type: ROOM_TYPES.MEETING,
      bounds: { x: 200, y: 400, width: 400, height: 300 },
      capacity: GAME_CONFIG.MEETING_ROOM_CAPACITY,
      playerIds: [],
      isPrivate: false,
      requiresDoor: true, // Must enter through door
      doorIds: ['door-meeting-1'],
      videoMode: 'all', // All connected when inside
      allowScreenShare: true
    },
    {
      id: 'small-office-1',
      name: 'Office 101',
      type: ROOM_TYPES.SMALL_OFFICE,
      bounds: { x: 650, y: 150, width: 200, height: 150 },
      capacity: GAME_CONFIG.SMALL_ROOM_CAPACITY,
      playerIds: [],
      isPrivate: false,
      requiresDoor: true,
      doorIds: ['door-office-1'],
      videoMode: 'all',
      allowScreenShare: false
    },
    {
      id: 'bureau-1',
      name: 'Private Office - CEO',
      type: ROOM_TYPES.BUREAU,
      bounds: { x: 900, y: 500, width: 250, height: 200 },
      capacity: GAME_CONFIG.BUREAU_CAPACITY,
      playerIds: [],
      isPrivate: true,
      requiresDoor: true,
      doorIds: ['door-bureau-1'],
      videoMode: 'all',
      allowScreenShare: true,
      password: 'optional-password'
    }
  ];

  defaultRooms.forEach(room => this.rooms.set(room.id, room));
}

joinRoom(socketId: string, roomId: string, enteredThroughDoor: boolean = false): boolean {
  const player = this.players.get(socketId);
  const room = this.rooms.get(roomId);

  if (!player || !room) return false;

  // Check capacity
  if (room.playerIds.length >= room.capacity) {
    return false;
  }

  // Check if door entry is required
  if (room.requiresDoor && !enteredThroughDoor) {
    return false; // Must enter through a door
  }

  // Leave previous room
  if (player.currentRoom) {
    this.leaveRoom(socketId, player.currentRoom);
  }

  room.playerIds.push(socketId);
  player.currentRoom = roomId;

  return true;
}
```

#### 4.2 Create Video Manager (Client)

Create `client/src/game/systems/VideoManager.ts`:

```typescript
import { useGameStore } from '../../store/gameStore';
import { GAME_CONFIG, RoomState } from '@mini-gather/shared';

export class VideoManager {
  private currentRoomMode: 'proximity' | 'all' | 'none' = 'none';
  private connectedPlayers: Set<string> = new Set();
  private currentRoomId?: string;

  update(
    playerPosition: { x: number; y: number },
    remotePlayers: Map<string, { x: number; y: number; id: string }>,
    currentRoom?: RoomState
  ) {
    if (currentRoom) {
      this.handleRoomMode(currentRoom, remotePlayers);
    } else {
      this.handleProximityMode(playerPosition, remotePlayers);
    }
  }

  private handleRoomMode(room: RoomState, remotePlayers: Map<string, any>) {
    const mode = room.videoMode || 'proximity';

    if (mode === 'all') {
      // Connect to all players in the room
      const playersInRoom = Array.from(remotePlayers.values())
        .filter(p => room.playerIds.includes(p.id));

      playersInRoom.forEach(player => {
        if (!this.connectedPlayers.has(player.id)) {
          this.connectToPlayer(player.id);
        }
      });

      // Disconnect from players not in room
      this.connectedPlayers.forEach(playerId => {
        if (!room.playerIds.includes(playerId)) {
          this.disconnectFromPlayer(playerId);
        }
      });
    } else if (mode === 'proximity') {
      // Use proximity even inside room
      this.handleProximityMode({ x: 0, y: 0 }, remotePlayers);
    }
  }

  private handleProximityMode(
    playerPos: { x: number; y: number },
    remotePlayers: Map<string, any>
  ) {
    remotePlayers.forEach(remotePlayer => {
      const distance = Math.sqrt(
        Math.pow(remotePlayer.x - playerPos.x, 2) +
        Math.pow(remotePlayer.y - playerPos.y, 2)
      );

      // Connect if within threshold
      if (distance <= GAME_CONFIG.PROXIMITY_THRESHOLD) {
        if (!this.connectedPlayers.has(remotePlayer.id)) {
          this.connectToPlayer(remotePlayer.id);
        }
      }

      // Disconnect if beyond disconnect threshold
      if (distance > GAME_CONFIG.PROXIMITY_DISCONNECT_THRESHOLD) {
        if (this.connectedPlayers.has(remotePlayer.id)) {
          this.disconnectFromPlayer(remotePlayer.id);
        }
      }
    });
  }

  onRoomExit() {
    // Disconnect from all players when leaving room
    this.connectedPlayers.forEach(playerId => {
      this.disconnectFromPlayer(playerId);
    });
  }

  private connectToPlayer(playerId: string) {
    console.log(`📹 Connecting video to player: ${playerId}`);
    this.connectedPlayers.add(playerId);
    // TODO: Trigger LiveKit connection
  }

  private disconnectFromPlayer(playerId: string) {
    console.log(`📹 Disconnecting video from player: ${playerId}`);
    this.connectedPlayers.delete(playerId);
    // TODO: Trigger LiveKit disconnection
  }
}
```

### Step 5: Furniture Collision

Add static furniture objects in MainScene:

```typescript
private createFurniture() {
  const furniture: Furniture[] = [
    { id: 'desk1', type: 'desk', x: 300, y: 200, width: 96, height: 64, collidable: true },
    { id: 'table1', type: 'table', x: 500, y: 400, width: 128, height: 96, collidable: true },
    { id: 'plant1', type: 'plant', x: 150, y: 150, width: 32, height: 32, collidable: true },
    // Add more furniture...
  ];

  furniture.forEach(item => {
    // Create visual
    const sprite = this.add.rectangle(
      item.x,
      item.y,
      item.width,
      item.height,
      this.getFurnitureColor(item.type)
    );

    // Add physics
    if (item.collidable) {
      this.physics.add.existing(sprite, true); // true = static body

      // Add collision with player
      if (this.localPlayer) {
        this.physics.add.collider(this.localPlayer, sprite);
      }
    }
  });
}

private getFurnitureColor(type: string): number {
  const colors: Record<string, number> = {
    desk: 0x8B4513,
    table: 0xD2691E,
    chair: 0xA0522D,
    plant: 0x228B22,
    bookshelf: 0x654321,
  };
  return colors[type] || 0x808080;
}
```

## 📊 Testing Checklist

- [ ] Doors appear on the map
- [ ] Can interact with door (Press E when near)
- [ ] Door opens/closes with animation
- [ ] Door auto-closes after 3 seconds
- [ ] Can't walk through closed doors
- [ ] Can walk through open doors
- [ ] Video connects when entering meeting room
- [ ] Video disconnects when leaving meeting room
- [ ] Proximity video works in corridors
- [ ] Furniture blocks movement
- [ ] Room capacity limits enforced
- [ ] Can't enter rooms without opening door first

## 🎨 Asset Creation Resources

**Free Pixel Art Tools**:
- Aseprite: https://www.aseprite.org/ (Paid but worth it)
- Piskel: https://www.piskelapp.com/ (Free online)
- GIMP: https://www.gimp.org/ (Free)

**Free Office Tilesets**:
- OpenGameArt: https://opengameart.org/
- Itch.io: https://itch.io/game-assets/free/tag-tileset
- Kenney Assets: https://kenney.nl/assets

**Example Tilesets to Adapt**:
- Modern Office Tileset: Search "office pixel art tileset 32x32"
- Top-down Interior Pack
- RPG Indoor Tileset (modify colors for modern office)

## 📈 Performance Tips

1. **Use Object Pooling** for doors and furniture
2. **Limit video connections** - max 8 simultaneous
3. **Use Phaser Groups** for collision detection
4. **Optimize tilemap** - use smaller maps or chunking
5. **Lazy load** room decorations

## 🆘 Troubleshooting

**Doors not appearing**:
- Check DOORS_LIST socket event is firing
- Verify doorService.initializeDoors() is called

**Can walk through doors**:
- Ensure physics body is enabled for closed doors
- Check collision layer setup

**Video not disconnecting**:
- Verify VideoManager.update() is called every frame
- Check PROXIMITY_DISCONNECT_THRESHOLD value

**Furniture collision not working**:
- Make sure static bodies are created
- Add collider between player and furniture

## 🎯 Next Priority Features

Once the above is working:
1. Add room occupancy indicators on doors
2. Implement knock feature
3. Add footstep sounds
4. Create lighting effects
5. Add screen sharing in meeting rooms

---

**Questions or Issues?** Check the implementation or create an issue!

*Last Updated: January 2025*
