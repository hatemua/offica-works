import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Furniture } from '../entities/Furniture';
import { Door } from '../entities/Door';
import { GraphicsGenerator } from '../utils/GraphicsGenerator';
import { socketService } from '../../services/socket';
import { useGameStore } from '../../store/gameStore';
import {
  SOCKET_EVENTS,
  PlayerMovement,
  Direction,
  Player as PlayerData,
  GAME_CONFIG,
  Furniture as FurnitureData,
  Door as DoorData
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
  private furniture: Furniture[] = [];
  private doors: Door[] = [];
  private eKey?: Phaser.Input.Keyboard.Key;

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
    // Generate enhanced graphics (furniture, tiles, decorations)
    const graphicsGen = new GraphicsGenerator(this, GAME_CONFIG.TILE_SIZE);
    graphicsGen.generateAll();
    console.log('✅ Enhanced graphics loaded');
  }

  private createPixelArtAvatar(key: string) {
    // Create a sprite sheet texture with 4 rows (down, left, right, up) × 3 frames each
    const frameWidth = 32;
    const frameHeight = 32;
    const cols = 3;
    const rows = 4;

    const graphics = this.make.graphics({ x: 0, y: 0 });

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

    // Create furniture
    this.createFurniture();

    // Create doors
    this.createDoors();

    // Setup input
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.eKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
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
    // Create floor with different textures for different areas
    for (let y = 0; y < GAME_CONFIG.MAP_HEIGHT; y++) {
      for (let x = 0; x < GAME_CONFIG.MAP_HEIGHT; x++) {
        const worldX = x * GAME_CONFIG.TILE_SIZE;
        const worldY = y * GAME_CONFIG.TILE_SIZE;

        // Determine floor type based on position
        let floorType = 'floor-carpet'; // Default corridor

        // Meeting rooms (gray tile)
        if ((x >= 5 && x <= 15 && y >= 5 && y <= 15) ||
            (x >= 35 && x <= 45 && y >= 5 && y <= 15)) {
          floorType = 'floor-tile';
        }
        // Offices (wood floors)
        else if ((x >= 5 && x <= 12 && y >= 25 && y <= 35) ||
                 (x >= 20 && x <= 28 && y >= 25 && y <= 35) ||
                 (x >= 35 && x <= 45 && y >= 25 && y <= 35)) {
          floorType = 'floor-wood';
        }

        this.add.image(
          worldX + GAME_CONFIG.TILE_SIZE / 2,
          worldY + GAME_CONFIG.TILE_SIZE / 2,
          floorType
        );
      }
    }
  }

  private createWalls() {
    const tile = GAME_CONFIG.TILE_SIZE;
    const wallPositions: { x: number; y: number }[] = [];

    // Outer boundary walls
    // Top wall
    for (let i = 0; i < GAME_CONFIG.MAP_WIDTH; i++) wallPositions.push({ x: i, y: 0 });
    // Bottom wall
    for (let i = 0; i < GAME_CONFIG.MAP_WIDTH; i++) wallPositions.push({ x: i, y: GAME_CONFIG.MAP_HEIGHT - 1 });
    // Left wall
    for (let i = 0; i < GAME_CONFIG.MAP_HEIGHT; i++) wallPositions.push({ x: 0, y: i });
    // Right wall
    for (let i = 0; i < GAME_CONFIG.MAP_HEIGHT; i++) wallPositions.push({ x: GAME_CONFIG.MAP_WIDTH - 1, y: i });

    // Meeting Room 1 (top-left) - walls
    for (let x = 5; x <= 15; x++) {
      wallPositions.push({ x, y: 5 }); // Top wall
      wallPositions.push({ x, y: 15 }); // Bottom wall
    }
    for (let y = 5; y <= 15; y++) {
      wallPositions.push({ x: 5, y }); // Left wall
      wallPositions.push({ x: 15, y }); // Right wall
    }
    // Door opening at y=10, x=15
    wallPositions.splice(wallPositions.findIndex(p => p.x === 15 && p.y === 10), 1);

    // Meeting Room 2 (top-right) - walls
    for (let x = 35; x <= 45; x++) {
      wallPositions.push({ x, y: 5 }); // Top wall
      wallPositions.push({ x, y: 15 }); // Bottom wall
    }
    for (let y = 5; y <= 15; y++) {
      wallPositions.push({ x: 35, y }); // Left wall
      wallPositions.push({ x: 45, y }); // Right wall
    }
    // Door opening at y=10, x=35
    wallPositions.splice(wallPositions.findIndex(p => p.x === 35 && p.y === 10), 1);

    // Bureau 1 (bottom-left) - small office
    for (let x = 5; x <= 12; x++) {
      wallPositions.push({ x, y: 25 }); // Top wall
      wallPositions.push({ x, y: 32 }); // Bottom wall
    }
    for (let y = 25; y <= 32; y++) {
      wallPositions.push({ x: 5, y }); // Left wall
      wallPositions.push({ x: 12, y }); // Right wall
    }
    // Door opening at y=28, x=12
    wallPositions.splice(wallPositions.findIndex(p => p.x === 12 && p.y === 28), 1);

    // Bureau 2 (bottom-middle)
    for (let x = 16; x <= 23; x++) {
      wallPositions.push({ x, y: 25 }); // Top wall
      wallPositions.push({ x, y: 32 }); // Bottom wall
    }
    for (let y = 25; y <= 32; y++) {
      wallPositions.push({ x: 16, y }); // Left wall
      wallPositions.push({ x: 23, y }); // Right wall
    }
    // Door opening at y=28, x=23
    wallPositions.splice(wallPositions.findIndex(p => p.x === 23 && p.y === 28), 1);

    // Bureau 3 (bottom-right)
    for (let x = 35; x <= 42; x++) {
      wallPositions.push({ x, y: 25 }); // Top wall
      wallPositions.push({ x, y: 32 }); // Bottom wall
    }
    for (let y = 25; y <= 32; y++) {
      wallPositions.push({ x: 35, y }); // Left wall
      wallPositions.push({ x: 42, y }); // Right wall
    }
    // Door opening at y=28, x=35
    wallPositions.splice(wallPositions.findIndex(p => p.x === 35 && p.y === 28), 1);

    // Create wall sprites
    wallPositions.forEach(({ x, y }) => {
      const wall = this.add.rectangle(
        x * tile + tile / 2,
        y * tile + tile / 2,
        tile,
        tile,
        0x5C6A7D
      );
      wall.setStrokeStyle(1, 0x4A5668);
      this.physics.add.existing(wall, true);
    });

    console.log(`✅ Created ${wallPositions.length} wall tiles`);
  }

  private createRoomZones() {
    const tile = GAME_CONFIG.TILE_SIZE;
    const rooms = [
      { x: 6 * tile, y: 6 * tile, width: 9 * tile, height: 9 * tile, color: 0x3498db, name: 'Meeting Room 1' },
      { x: 36 * tile, y: 6 * tile, width: 9 * tile, height: 9 * tile, color: 0x2ecc71, name: 'Meeting Room 2' },
      { x: 6 * tile, y: 26 * tile, width: 6 * tile, height: 6 * tile, color: 0xe74c3c, name: 'Bureau 1' },
      { x: 17 * tile, y: 26 * tile, width: 6 * tile, height: 6 * tile, color: 0xf39c12, name: 'Bureau 2' },
      { x: 36 * tile, y: 26 * tile, width: 6 * tile, height: 6 * tile, color: 0x9b59b6, name: 'Bureau 3' },
      { x: 18 * tile, y: 6 * tile, width: 14 * tile, height: 10 * tile, color: 0x1abc9c, name: 'Open Workspace' },
    ];

    rooms.forEach((room) => {
      const zone = this.add.rectangle(
        room.x + room.width / 2,
        room.y + room.height / 2,
        room.width,
        room.height,
        room.color,
        0.05
      );
      zone.setStrokeStyle(2, room.color, 0.3);

      // Add room label
      this.add.text(room.x + 10, room.y + 10, room.name, {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#00000080',
        padding: { x: 6, y: 3 },
      });

      this.roomZones.push(zone);
    });

    console.log(`✅ Created ${rooms.length} room zones`);
  }

  private createFurniture() {
    const tile = GAME_CONFIG.TILE_SIZE;
    const furnitureItems: FurnitureData[] = [];

    // ===== MEETING ROOM 1 (top-left) =====
    // Large conference table in center
    furnitureItems.push({ id: 'mr1-table', type: 'table', x: 10 * tile, y: 10 * tile, width: 128, height: 96, collidable: true });
    // Chairs around table (8 chairs)
    furnitureItems.push({ id: 'mr1-c1', type: 'chair', x: 7.5 * tile, y: 9 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr1-c2', type: 'chair', x: 7.5 * tile, y: 11 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr1-c3', type: 'chair', x: 12.5 * tile, y: 9 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr1-c4', type: 'chair', x: 12.5 * tile, y: 11 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr1-c5', type: 'chair', x: 9 * tile, y: 7.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr1-c6', type: 'chair', x: 11 * tile, y: 7.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr1-c7', type: 'chair', x: 9 * tile, y: 12.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr1-c8', type: 'chair', x: 11 * tile, y: 12.5 * tile, width: 32, height: 32, collidable: false });
    // Whiteboard
    furnitureItems.push({ id: 'mr1-wb', type: 'table', x: 10 * tile, y: 6.5 * tile, width: 96, height: 64, collidable: true });
    // Plants in corners
    furnitureItems.push({ id: 'mr1-p1', type: 'plant', x: 6.5 * tile, y: 6.5 * tile, width: 32, height: 48, collidable: false });
    furnitureItems.push({ id: 'mr1-p2', type: 'plant', x: 13.5 * tile, y: 6.5 * tile, width: 32, height: 48, collidable: false });

    // ===== MEETING ROOM 2 (top-right) =====
    // Conference table
    furnitureItems.push({ id: 'mr2-table', type: 'table', x: 40 * tile, y: 10 * tile, width: 128, height: 96, collidable: true });
    // Chairs (8 chairs)
    furnitureItems.push({ id: 'mr2-c1', type: 'chair', x: 37.5 * tile, y: 9 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr2-c2', type: 'chair', x: 37.5 * tile, y: 11 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr2-c3', type: 'chair', x: 42.5 * tile, y: 9 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr2-c4', type: 'chair', x: 42.5 * tile, y: 11 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr2-c5', type: 'chair', x: 39 * tile, y: 7.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr2-c6', type: 'chair', x: 41 * tile, y: 7.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr2-c7', type: 'chair', x: 39 * tile, y: 12.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr2-c8', type: 'chair', x: 41 * tile, y: 12.5 * tile, width: 32, height: 32, collidable: false });
    // Whiteboard
    furnitureItems.push({ id: 'mr2-wb', type: 'table', x: 40 * tile, y: 6.5 * tile, width: 96, height: 64, collidable: true });
    // Sofa
    furnitureItems.push({ id: 'mr2-sofa', type: 'sofa', x: 40 * tile, y: 13.5 * tile, width: 96, height: 48, collidable: true });

    // ===== BUREAU 1 (bottom-left private office) =====
    furnitureItems.push({ id: 'b1-desk', type: 'desk', x: 8.5 * tile, y: 28.5 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'b1-chair', type: 'chair', x: 7.5 * tile, y: 28.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'b1-filing', type: 'filing-cabinet', x: 10.5 * tile, y: 26.5 * tile, width: 64, height: 96, collidable: true });
    furnitureItems.push({ id: 'b1-shelf', type: 'bookshelf', x: 6.5 * tile, y: 26.5 * tile, width: 64, height: 96, collidable: true });
    furnitureItems.push({ id: 'b1-plant', type: 'plant', x: 10.5 * tile, y: 30.5 * tile, width: 32, height: 48, collidable: false });

    // ===== BUREAU 2 (bottom-middle office) =====
    furnitureItems.push({ id: 'b2-desk', type: 'desk', x: 19.5 * tile, y: 28.5 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'b2-chair', type: 'chair', x: 18.5 * tile, y: 28.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'b2-filing', type: 'filing-cabinet', x: 21.5 * tile, y: 26.5 * tile, width: 64, height: 96, collidable: true });
    furnitureItems.push({ id: 'b2-shelf', type: 'bookshelf', x: 17.5 * tile, y: 30.5 * tile, width: 64, height: 96, collidable: true });
    furnitureItems.push({ id: 'b2-plant', type: 'plant', x: 21.5 * tile, y: 30.5 * tile, width: 32, height: 48, collidable: false });

    // ===== BUREAU 3 (bottom-right office) =====
    furnitureItems.push({ id: 'b3-desk', type: 'desk', x: 38.5 * tile, y: 28.5 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'b3-chair', type: 'chair', x: 37.5 * tile, y: 28.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'b3-filing', type: 'filing-cabinet', x: 40.5 * tile, y: 26.5 * tile, width: 64, height: 96, collidable: true });
    furnitureItems.push({ id: 'b3-shelf', type: 'bookshelf', x: 36.5 * tile, y: 26.5 * tile, width: 64, height: 96, collidable: true });
    furnitureItems.push({ id: 'b3-sofa', type: 'sofa', x: 38.5 * tile, y: 30.5 * tile, width: 96, height: 48, collidable: true });

    // ===== OPEN WORKSPACE (center area with desk clusters) =====
    // Desk cluster 1 (4 desks facing each other)
    furnitureItems.push({ id: 'ws-d1', type: 'desk', x: 20 * tile, y: 8 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'ws-d2', type: 'desk', x: 23 * tile, y: 8 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'ws-d3', type: 'desk', x: 20 * tile, y: 10.5 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'ws-d4', type: 'desk', x: 23 * tile, y: 10.5 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'ws-c1', type: 'chair', x: 19 * tile, y: 8 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'ws-c2', type: 'chair', x: 22 * tile, y: 8 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'ws-c3', type: 'chair', x: 19 * tile, y: 10.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'ws-c4', type: 'chair', x: 22 * tile, y: 10.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'ws-m1', type: 'computer', x: 20.5 * tile, y: 7.8 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'ws-m2', type: 'computer', x: 23.5 * tile, y: 7.8 * tile, width: 32, height: 32, collidable: false });

    // Desk cluster 2
    furnitureItems.push({ id: 'ws-d5', type: 'desk', x: 27 * tile, y: 8 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'ws-d6', type: 'desk', x: 30 * tile, y: 8 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'ws-d7', type: 'desk', x: 27 * tile, y: 10.5 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'ws-d8', type: 'desk', x: 30 * tile, y: 10.5 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'ws-c5', type: 'chair', x: 26 * tile, y: 8 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'ws-c6', type: 'chair', x: 29 * tile, y: 8 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'ws-c7', type: 'chair', x: 26 * tile, y: 10.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'ws-c8', type: 'chair', x: 29 * tile, y: 10.5 * tile, width: 32, height: 32, collidable: false });

    // Plants and decorations
    furnitureItems.push({ id: 'ws-p1', type: 'plant', x: 25.5 * tile, y: 14 * tile, width: 32, height: 48, collidable: false });
    furnitureItems.push({ id: 'ws-p2', type: 'plant', x: 18.5 * tile, y: 14 * tile, width: 32, height: 48, collidable: false });
    furnitureItems.push({ id: 'ws-p3', type: 'plant', x: 31.5 * tile, y: 14 * tile, width: 32, height: 48, collidable: false });

    // ===== CORRIDOR DECORATIONS =====
    furnitureItems.push({ id: 'cor-p1', type: 'plant', x: 3 * tile, y: 18 * tile, width: 32, height: 48, collidable: false });
    furnitureItems.push({ id: 'cor-p2', type: 'plant', x: 47 * tile, y: 18 * tile, width: 32, height: 48, collidable: false });
    furnitureItems.push({ id: 'cor-p3', type: 'plant', x: 25 * tile, y: 3 * tile, width: 32, height: 48, collidable: false });
    furnitureItems.push({ id: 'cor-p4', type: 'plant', x: 25 * tile, y: 36 * tile, width: 32, height: 48, collidable: false });

    furnitureItems.forEach((data) => {
      const furniture = new Furniture(this, data);
      this.furniture.push(furniture);
    });

    console.log(`✅ Created ${furnitureItems.length} furniture objects`);
  }

  private createDoors() {
    const tile = GAME_CONFIG.TILE_SIZE;
    // Initial doors - will sync with server
    const doorData: DoorData[] = [
      // Meeting Room 1 door
      {
        id: 'door-meeting-1',
        x: 15 * tile + tile / 2,
        y: 10 * tile + tile / 2,
        width: 32,
        height: 64,
        state: 'closed',
        roomId: 'meeting-room-1',
        autoClose: true,
        autoCloseDelay: GAME_CONFIG.DOOR_AUTO_CLOSE_DELAY,
      },
      // Meeting Room 2 door
      {
        id: 'door-meeting-2',
        x: 35 * tile + tile / 2,
        y: 10 * tile + tile / 2,
        width: 32,
        height: 64,
        state: 'closed',
        roomId: 'meeting-room-2',
        autoClose: true,
        autoCloseDelay: GAME_CONFIG.DOOR_AUTO_CLOSE_DELAY,
      },
      // Bureau 1 door
      {
        id: 'door-bureau-1',
        x: 12 * tile + tile / 2,
        y: 28 * tile + tile / 2,
        width: 32,
        height: 64,
        state: 'closed',
        roomId: 'bureau-1',
        autoClose: true,
        autoCloseDelay: GAME_CONFIG.DOOR_AUTO_CLOSE_DELAY,
      },
      // Bureau 2 door
      {
        id: 'door-bureau-2',
        x: 23 * tile + tile / 2,
        y: 28 * tile + tile / 2,
        width: 32,
        height: 64,
        state: 'closed',
        roomId: 'bureau-2',
        autoClose: true,
        autoCloseDelay: GAME_CONFIG.DOOR_AUTO_CLOSE_DELAY,
      },
      // Bureau 3 door
      {
        id: 'door-bureau-3',
        x: 35 * tile + tile / 2,
        y: 28 * tile + tile / 2,
        width: 32,
        height: 64,
        state: 'closed',
        roomId: 'bureau-3',
        autoClose: true,
        autoCloseDelay: GAME_CONFIG.DOOR_AUTO_CLOSE_DELAY,
      },
    ];

    doorData.forEach((data) => {
      const door = new Door(this, data);
      this.doors.push(door);

      // Add collision with local player (will be setup when player is created)
      if (this.localPlayer) {
        this.physics.add.collider(this.localPlayer, door);
      }
    });

    console.log(`✅ Created ${doorData.length} doors`);
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

    // Door state updates
    socket.on('door:updated', (doorData: DoorData) => {
      const door = this.doors.find(d => d.getDoorId() === doorData.id);
      if (door) {
        door.updateState(doorData.state);
        console.log(`🚪 Door ${doorData.id} updated: ${doorData.state}`);
      }
    });

    // Initial doors list
    socket.on('doors:list', (doorsData: DoorData[]) => {
      doorsData.forEach((doorData) => {
        const door = this.doors.find(d => d.getDoorId() === doorData.id);
        if (door) {
          door.updateState(doorData.state);
        }
      });
      console.log(`🚪 Synced ${doorsData.length} door states`);
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

    // Setup collisions with furniture
    this.furniture.forEach(furn => {
      if (this.localPlayer) {
        this.physics.add.collider(this.localPlayer, furn);
      }
    });

    // Setup collisions with doors
    this.doors.forEach(door => {
      if (this.localPlayer) {
        this.physics.add.collider(this.localPlayer, door);
      }
    });

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
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: any[], _deltaX: number, deltaY: number) => {
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

    // Check door proximity and handle interaction
    this.updateDoorInteraction();

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

  private updateDoorInteraction() {
    if (!this.localPlayer) return;

    // Check proximity for all doors
    this.doors.forEach(door => {
      door.checkPlayerProximity(this.localPlayer!.x, this.localPlayer!.y);
    });

    // Handle E key press for door interaction
    if (Phaser.Input.Keyboard.JustDown(this.eKey!)) {
      const nearestDoor = this.doors.find(door => door.canInteract());
      if (nearestDoor) {
        this.interactWithDoor(nearestDoor.getDoorId());
      }
    }
  }

  private interactWithDoor(doorId: string) {
    const socket = socketService.getSocket();
    if (!socket) return;

    console.log(`🚪 Interacting with door: ${doorId}`);
    socket.emit('door:interact', doorId);
  }
}
