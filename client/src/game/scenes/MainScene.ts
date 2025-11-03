import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { socketService } from '../../services/socket';
import { useGameStore } from '../../store/gameStore';
import {
  SOCKET_EVENTS,
  PlayerMovement,
  Direction,
  Player as PlayerData,
  GAME_CONFIG
} from '@mini-gather/shared';

export class MainScene extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private localPlayer?: Player;
  private remotePlayers: Map<string, Player> = new Map();
  private lastUpdateTime: number = 0;
  private updateRate: number = 1000 / GAME_CONFIG.POSITION_UPDATE_RATE;
  private roomZones: Phaser.GameObjects.Rectangle[] = [];

  // Camera controls
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private cameraFollowEnabled: boolean = false;
  private spaceKey?: Phaser.Input.Keyboard.Key;

  // Scene initialization state
  private isSceneReady: boolean = false;
  private pendingPlayerCreation?: {
    playerId: string;
    username: string;
    avatar: string;
  };

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // NOTE: Avatar sprites are generated programmatically in create()
    // To use real sprite sheets instead, uncomment the code below and place
    // avatar1.png through avatar6.png in client/public/assets/sprites/

    // const avatarCount = 6;
    // for (let i = 1; i <= avatarCount; i++) {
    //   const spritePath = `/assets/sprites/avatar${i}.png`;
    //   this.load.spritesheet(`avatar${i}`, spritePath, {
    //     frameWidth: 32,
    //     frameHeight: 32
    //   });
    // }

    // Create ground tile
    const groundGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    groundGraphics.fillStyle(0x34495e, 1);
    groundGraphics.fillRect(0, 0, 32, 32);
    groundGraphics.lineStyle(1, 0x2c3e50, 1);
    groundGraphics.strokeRect(0, 0, 32, 32);
    groundGraphics.generateTexture('ground', 32, 32);
    groundGraphics.destroy();

    // Create wall tile
    const wallGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    wallGraphics.fillStyle(0x7f8c8d, 1);
    wallGraphics.fillRect(0, 0, 32, 32);
    wallGraphics.generateTexture('wall', 32, 32);
    wallGraphics.destroy();
  }

  private createPixelArtAvatar(key: string) {
    // Create a sprite sheet texture with 4 rows (down, left, right, up) × 3 frames each
    const frameWidth = 32;
    const frameHeight = 32;
    const cols = 3;
    const rows = 4;

    const graphics = this.make.graphics({ x: 0, y: 0, add: false });

    // Avatar color schemes
    const colorSchemes = {
      avatar1: { body: 0xFF6B6B, hair: 0x8B4513, outline: 0x5C1A1A },
      avatar2: { body: 0x4ECDC4, hair: 0xFFD700, outline: 0x1A5C5C },
      avatar3: { body: 0x45B7D1, hair: 0xFF8C00, outline: 0x1A4A5C },
      avatar4: { body: 0xFFA07A, hair: 0x4B0082, outline: 0x5C2A1A },
      avatar5: { body: 0x98D8C8, hair: 0xFF1493, outline: 0x1A5C4A },
      avatar6: { body: 0xF7DC6F, hair: 0x8A2BE2, outline: 0x5C4A1A },
    };

    const colors = colorSchemes[key as keyof typeof colorSchemes] || colorSchemes.avatar1;

    // Draw all frames
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * frameWidth;
        const y = row * frameHeight;

        // Draw character (simple pixel art person)
        // Head
        graphics.fillStyle(colors.body, 1);
        graphics.fillRect(x + 12, y + 8, 8, 8);

        // Hair
        graphics.fillStyle(colors.hair, 1);
        graphics.fillRect(x + 12, y + 8, 8, 4);

        // Body
        graphics.fillStyle(colors.body, 1);
        graphics.fillRect(x + 10, y + 16, 12, 10);

        // Legs (slightly offset based on frame for walk animation)
        const legOffset = col === 1 ? 0 : (col === 0 ? -1 : 1);
        graphics.fillRect(x + 12 + legOffset, y + 26, 3, 6);
        graphics.fillRect(x + 17 - legOffset, y + 26, 3, 6);

        // Outline
        graphics.lineStyle(1, colors.outline, 1);
        graphics.strokeRect(x + 12, y + 8, 8, 8); // Head outline
        graphics.strokeRect(x + 10, y + 16, 12, 10); // Body outline
      }
    }

    // Generate texture
    graphics.generateTexture(key, frameWidth * cols, frameHeight * rows);
    graphics.destroy();

    // Configure as sprite sheet with individual frames
    const texture = this.textures.get(key);

    // Add all frames to the sprite sheet
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const frameIndex = row * cols + col;
        texture.add(
          frameIndex,              // Frame name/number (0-11)
          0,                       // Source image index
          col * frameWidth,        // x position in source
          row * frameHeight,       // y position in source
          frameWidth,              // frame width
          frameHeight              // frame height
        );
      }
    }

    // Set pixel-perfect rendering
    texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

    console.log(`✅ Created sprite sheet for ${key} with ${rows * cols} frames`);
  }

  create() {
    // Create pixel art avatars programmatically
    for (let i = 1; i <= 6; i++) {
      const key = `avatar${i}`;
      if (!this.textures.exists(key)) {
        this.createPixelArtAvatar(key);
      }
    }

    // Create world bounds
    this.physics.world.setBounds(
      0,
      0,
      GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE,
      GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE
    );

    // Create ground
    this.createGround();

    // Create walls
    this.createWalls();

    // Create room zones
    this.createRoomZones();

    // Setup input
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Add camera controls
    this.cameras.main.setBounds(
      0,
      0,
      GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE,
      GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE
    );

    // Initial camera setup - zoom out and center
    this.cameras.main.setZoom(0.6);
    this.cameras.main.centerOn(
      (GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE) / 2,
      (GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE) / 2
    );

    // Setup camera pan and zoom controls
    this.setupCameraControls();

    // IMPORTANT: Wait for next frame to ensure scene systems are fully initialized
    // This prevents the "Cannot read properties of null (reading 'queueDepthSort')" error
    this.time.delayedCall(0, () => {
      // Mark scene as ready
      this.isSceneReady = true;
      console.log('✅ Scene fully initialized and ready');

      // Setup socket listeners NOW (after scene is ready)
      this.setupSocketListeners();

      // Process pending player creation if any
      if (this.pendingPlayerCreation) {
        const { playerId, username, avatar } = this.pendingPlayerCreation;
        this.createLocalPlayer(playerId, username, avatar);
        this.pendingPlayerCreation = undefined;
      }
    });
  }

  private createGround() {
    for (let y = 0; y < GAME_CONFIG.MAP_HEIGHT; y++) {
      for (let x = 0; x < GAME_CONFIG.MAP_WIDTH; x++) {
        this.add.image(
          x * GAME_CONFIG.TILE_SIZE + 16,
          y * GAME_CONFIG.TILE_SIZE + 16,
          'ground'
        );
      }
    }
  }

  private createWalls() {
    const wallPositions = [
      // Top wall
      ...Array.from({ length: GAME_CONFIG.MAP_WIDTH }, (_, i) => ({ x: i, y: 0 })),
      // Bottom wall
      ...Array.from({ length: GAME_CONFIG.MAP_WIDTH }, (_, i) => ({ x: i, y: GAME_CONFIG.MAP_HEIGHT - 1 })),
      // Left wall
      ...Array.from({ length: GAME_CONFIG.MAP_HEIGHT }, (_, i) => ({ x: 0, y: i })),
      // Right wall
      ...Array.from({ length: GAME_CONFIG.MAP_HEIGHT }, (_, i) => ({ x: GAME_CONFIG.MAP_WIDTH - 1, y: i })),
    ];

    wallPositions.forEach(({ x, y }) => {
      const wall = this.add.rectangle(
        x * GAME_CONFIG.TILE_SIZE + 16,
        y * GAME_CONFIG.TILE_SIZE + 16,
        GAME_CONFIG.TILE_SIZE,
        GAME_CONFIG.TILE_SIZE,
        0x7f8c8d
      );
      this.physics.add.existing(wall, true);
    });
  }

  private createRoomZones() {
    const rooms = [
      { x: 200, y: 200, width: 300, height: 200, color: 0x3498db, name: 'Conference Room A' },
      { x: 600, y: 200, width: 400, height: 300, color: 0x2ecc71, name: 'Lounge Area' },
      { x: 200, y: 500, width: 400, height: 250, color: 0xe74c3c, name: 'Presentation Hall' },
    ];

    rooms.forEach((room) => {
      const zone = this.add.rectangle(
        room.x + room.width / 2,
        room.y + room.height / 2,
        room.width,
        room.height,
        room.color,
        0.1
      );
      zone.setStrokeStyle(2, room.color, 0.5);

      // Add room label
      this.add.text(room.x + 10, room.y + 10, room.name, {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#00000080',
        padding: { x: 8, y: 4 },
      });

      this.roomZones.push(zone);
    });
  }

  private setupSocketListeners() {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Player joined
    socket.on(SOCKET_EVENTS.PLAYER_JOINED, (player: PlayerData) => {
      this.addRemotePlayer(player);
    });

    // Player left
    socket.on(SOCKET_EVENTS.PLAYER_LEFT, (playerId: string) => {
      this.removeRemotePlayer(playerId);
    });

    // Player position update
    socket.on(SOCKET_EVENTS.PLAYER_POSITION, (data) => {
      this.updateRemotePlayer(data.playerId, data.movement);
    });

    // Initial players list
    socket.on(SOCKET_EVENTS.PLAYERS_LIST, (players: Record<string, PlayerData>) => {
      Object.entries(players).forEach(([id, player]) => {
        if (id !== socket.id) {
          this.addRemotePlayer(player);
        }
      });
    });

    // Authenticated - create local player
    socket.on(SOCKET_EVENTS.AUTHENTICATED, () => {
      const store = useGameStore.getState();
      if (store.user) {
        // Queue player creation if scene isn't ready yet
        if (!this.isSceneReady) {
          console.log('Scene not ready, queueing player creation');
          this.pendingPlayerCreation = {
            playerId: socket.id!,
            username: store.user.username,
            avatar: store.user.avatar,
          };
        } else {
          this.createLocalPlayer(socket.id!, store.user.username, store.user.avatar);
        }
        store.setCurrentPlayerId(socket.id!);
      }
    });

    // Proximity updates - for video/audio chat
    socket.on(SOCKET_EVENTS.PROXIMITY_UPDATE, (proximityData) => {
      const store = useGameStore.getState();

      // Extract player IDs from proximity data
      const playerIds = proximityData.map(data => data.playerId);

      // Update store with nearby players
      store.setProximityPlayers(playerIds);

      // Log proximity changes for debugging
      if (playerIds.length > 0) {
        console.log(`📡 Players in proximity (${playerIds.length}):`, playerIds);
      }
    });
  }

  private createLocalPlayer(playerId: string, username: string, avatar: string) {
    // Safety check: ensure scene is ready
    if (!this.isSceneReady) {
      console.warn('Attempted to create player before scene ready');
      return;
    }

    // Prevent duplicate player creation
    if (this.localPlayer) {
      console.warn('Local player already exists');
      return;
    }

    // Spawn player at center of map
    const spawnX = (GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE) / 2;
    const spawnY = (GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE) / 2;

    this.localPlayer = new Player(
      this,
      spawnX,
      spawnY,
      playerId,
      username,
      avatar
    );

    // Enable camera follow
    this.cameraFollowEnabled = true;
    this.cameras.main.startFollow(this.localPlayer, true, 0.1, 0.1);
    this.cameras.main.setZoom(1); // Zoom in when player appears

    console.log(`✅ Player created at (${spawnX}, ${spawnY})`);
  }

  private setupCameraControls() {
    // Add space key for pan mode
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Mouse drag to pan
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown() && this.spaceKey?.isDown) {
        this.isDragging = true;
        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
        this.input.setDefaultCursor('grabbing');

        // Disable camera follow when manually panning
        if (this.cameraFollowEnabled) {
          this.cameras.main.stopFollow();
          this.cameraFollowEnabled = false;
        }
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        const deltaX = (pointer.x - this.dragStartX) / this.cameras.main.zoom;
        const deltaY = (pointer.y - this.dragStartY) / this.cameras.main.zoom;

        this.cameras.main.scrollX -= deltaX;
        this.cameras.main.scrollY -= deltaY;

        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
      }
    });

    this.input.on('pointerup', () => {
      this.isDragging = false;
      this.input.setDefaultCursor('default');
    });

    // Scroll wheel zoom
    this.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: any[], deltaX: number, deltaY: number) => {
      const zoomAmount = deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Phaser.Math.Clamp(
        this.cameras.main.zoom + zoomAmount,
        0.3,  // Min zoom (zoomed out)
        2.0   // Max zoom (zoomed in)
      );

      this.cameras.main.setZoom(newZoom);
    });

    // Double-click to reset camera to follow player
    this.input.on('pointerdblclick', () => {
      if (this.localPlayer && !this.cameraFollowEnabled) {
        this.cameraFollowEnabled = true;
        this.cameras.main.startFollow(this.localPlayer, true, 0.1, 0.1);
        this.cameras.main.setZoom(1);
        console.log('Camera follow re-enabled');
      }
    });

    // Show hand cursor when space is held
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (!this.isDragging) {
        this.input.setDefaultCursor('grab');
      }
    });

    this.input.keyboard?.on('keyup-SPACE', () => {
      if (!this.isDragging) {
        this.input.setDefaultCursor('default');
      }
    });
  }

  private addRemotePlayer(playerData: PlayerData) {
    if (this.remotePlayers.has(playerData.id)) return;

    const player = new Player(
      this,
      playerData.position.x,
      playerData.position.y,
      playerData.id,
      playerData.username,
      playerData.avatar
    );

    this.remotePlayers.set(playerData.id, player);
    useGameStore.getState().addPlayer(playerData);
  }

  private removeRemotePlayer(playerId: string) {
    const player = this.remotePlayers.get(playerId);
    if (player) {
      player.destroy();
      this.remotePlayers.delete(playerId);
      useGameStore.getState().removePlayer(playerId);
    }
  }

  private updateRemotePlayer(playerId: string, movement: PlayerMovement) {
    const player = this.remotePlayers.get(playerId);
    if (player) {
      player.updatePosition(
        movement.position.x,
        movement.position.y,
        movement.isMoving,
        movement.direction
      );
    }
  }

  update(time: number) {
    if (!this.localPlayer || !this.cursors || !this.wasd) return;

    // Skip movement if space key is down (panning mode)
    if (this.spaceKey?.isDown) return;

    // Handle movement
    const speed = GAME_CONFIG.PLAYER_SPEED;
    let velocityX = 0;
    let velocityY = 0;
    let direction: Direction = this.localPlayer.direction;

    if (this.cursors.left?.isDown || this.wasd.left.isDown) {
      velocityX = -speed;
      direction = Direction.LEFT;
    } else if (this.cursors.right?.isDown || this.wasd.right.isDown) {
      velocityX = speed;
      direction = Direction.RIGHT;
    }

    if (this.cursors.up?.isDown || this.wasd.up.isDown) {
      velocityY = -speed;
      direction = Direction.UP;
    } else if (this.cursors.down?.isDown || this.wasd.down.isDown) {
      velocityY = speed;
      direction = Direction.DOWN;
    }

    const body = this.localPlayer.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(velocityX, velocityY);

    const isMoving = velocityX !== 0 || velocityY !== 0;

    // Debug log movement
    if (isMoving && time % 1000 < 20) {
      console.log(`Moving: velocity=(${velocityX}, ${velocityY}), position=(${this.localPlayer.x.toFixed(0)}, ${this.localPlayer.y.toFixed(0)}), direction=${direction}`);
    }

    // Update local player animation
    this.localPlayer.updatePosition(
      this.localPlayer.x,
      this.localPlayer.y,
      isMoving,
      direction
    );

    // Send position to server at fixed rate
    if (time - this.lastUpdateTime >= this.updateRate) {
      this.sendPositionUpdate(velocityX, velocityY, direction, isMoving);
      this.lastUpdateTime = time;
    }
  }

  private sendPositionUpdate(velocityX: number, velocityY: number, direction: Direction, isMoving: boolean) {
    const socket = socketService.getSocket();
    if (!socket || !this.localPlayer) return;

    const movement: PlayerMovement = {
      position: {
        x: this.localPlayer.x,
        y: this.localPlayer.y,
      },
      velocity: {
        x: velocityX,
        y: velocityY,
      },
      direction,
      isMoving,
      timestamp: Date.now(),
    };

    socket.emit(SOCKET_EVENTS.PLAYER_MOVE, movement);
  }
}
