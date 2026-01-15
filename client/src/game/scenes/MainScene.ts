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
  private pendingRemotePlayers: PlayerData[] = [];

  // Tilemap support (WorkAdventure assets)
  private useTilemap: boolean = false;
  private tilemap?: Phaser.Tilemaps.Tilemap;

  // Logging throttle for proximity updates
  private lastProximityLogTime: number = 0;
  private proximityLogThrottle: number = 2000; // Log every 2 seconds max

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    console.log('🎮 Preloading assets...');

    // Try to load WorkAdventure tilemap (professional mode)
    this.load.on('loaderror', (file: any) => {
      console.warn(`⚠️ Asset not found: ${file.key} - will use procedural graphics as fallback`);
    });

    // Load WorkAdventure tilemap and tilesets
    this.load.tilemapTiledJSON('office-map', '/assets/maps/office.json');

    // Load WorkAdventure tileset images explicitly
    // These must match the names in the tilemap JSON file
    this.load.image('WA_Special_Zones', '/assets/tilesets/WA_Special_Zones.png');
    this.load.image('WA_Decoration', '/assets/tilesets/WA_Decoration.png');
    this.load.image('WA_Miscellaneous', '/assets/tilesets/WA_Miscellaneous.png');
    this.load.image('WA_Other_Furniture', '/assets/tilesets/WA_Other_Furniture.png');
    this.load.image('WA_Room_Builder', '/assets/tilesets/WA_Room_Builder.png');
    this.load.image('WA_Seats', '/assets/tilesets/WA_Seats.png');
    this.load.image('WA_Tables', '/assets/tilesets/WA_Tables.png');
    this.load.image('WA_Logo_Long', '/assets/tilesets/WA_Logo_Long.png');
    this.load.image('WA_Exterior', '/assets/tilesets/WA_Exterior.png');
    this.load.image('WA_User_Interface', '/assets/tilesets/WA_User_Interface.png');

    // Always generate procedural graphics as fallback
    const graphicsGen = new GraphicsGenerator(this, GAME_CONFIG.TILE_SIZE);
    graphicsGen.generateAll();
    console.log('✅ Assets preloaded (tilemap + procedural fallback)');
  }

  private createPixelArtAvatar(key: string) {
    console.log(`🎨 Creating avatar texture: ${key}`);

    // Create a sprite sheet texture with 4 rows (down, left, right, up) × 3 frames each
    const frameWidth = 32;
    const frameHeight = 32;
    const cols = 3;
    const rows = 4;

    const graphics = this.make.graphics({ x: 0, y: 0 }, false);

    // Professional avatar color schemes (matching WorkAdventure style)
    const colorSchemes = {
      avatar1: {
        skin: 0xFFDBAC,
        hair: 0x3D2817,
        shirt: 0x4A90E2,
        pants: 0x2C3E50,
        shoes: 0x1A1A1A,
        outline: 0x000000
      },
      avatar2: {
        skin: 0xF4C2A0,
        hair: 0xFFD700,
        shirt: 0xE74C3C,
        pants: 0x34495E,
        shoes: 0x2C3E50,
        outline: 0x000000
      },
      avatar3: {
        skin: 0xD4A57A,
        hair: 0x8B4513,
        shirt: 0x27AE60,
        pants: 0x7F8C8D,
        shoes: 0x34495E,
        outline: 0x000000
      },
      avatar4: {
        skin: 0xFFE4C4,
        hair: 0xFF6B9D,
        shirt: 0x9B59B6,
        pants: 0x2C3E50,
        shoes: 0x1A1A1A,
        outline: 0x000000
      },
      avatar5: {
        skin: 0xE8B898,
        hair: 0x000000,
        shirt: 0xF39C12,
        pants: 0x16A085,
        shoes: 0x34495E,
        outline: 0x000000
      },
      avatar6: {
        skin: 0xFFDBAC,
        hair: 0x8E44AD,
        shirt: 0x1ABC9C,
        pants: 0x95A5A6,
        shoes: 0x2C3E50,
        outline: 0x000000
      },
    };

    const colors = colorSchemes[key as keyof typeof colorSchemes] || colorSchemes.avatar1;
    console.log(`🎨 Using color scheme for ${key}:`, colors);

    // Draw all frames (4 directions × 3 animation frames)
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * frameWidth;
        const y = row * frameHeight;
        const direction = row; // 0=down, 1=left, 2=right, 3=up

        // Animation offset for walk cycle
        const walkOffset = col === 1 ? 0 : (col === 0 ? -1 : 1);

        // HEAD (round, centered)
        graphics.fillStyle(colors.skin, 1);
        graphics.fillRect(x + 11, y + 7, 10, 10); // Head square
        // Head shadow
        graphics.fillStyle(0x000000, 0.15);
        graphics.fillRect(x + 11, y + 14, 10, 3);

        // HAIR (different styles based on direction)
        graphics.fillStyle(colors.hair, 1);
        if (direction === 3) { // Up - show back of head
          graphics.fillRect(x + 10, y + 6, 12, 6);
        } else {
          graphics.fillRect(x + 10, y + 6, 12, 5); // Top of hair
        }

        // EYES (only visible when not looking up)
        if (direction !== 3) {
          graphics.fillStyle(0x000000, 1);
          if (direction === 1) { // Looking left
            graphics.fillRect(x + 13, y + 11, 2, 2);
          } else if (direction === 2) { // Looking right
            graphics.fillRect(x + 17, y + 11, 2, 2);
          } else { // Looking down
            graphics.fillRect(x + 13, y + 11, 2, 2);
            graphics.fillRect(x + 17, y + 11, 2, 2);
          }
        }

        // SHIRT/BODY
        graphics.fillStyle(colors.shirt, 1);
        graphics.fillRect(x + 10, y + 17, 12, 7);
        // Body shading
        graphics.fillStyle(0x000000, 0.2);
        graphics.fillRect(x + 10, y + 21, 12, 3);

        // ARMS (side arms for walking animation)
        graphics.fillStyle(colors.skin, 1);
        if (direction === 1 || direction === 2) { // Left/Right - arms visible
          graphics.fillRect(x + 8 + walkOffset, y + 18, 2, 6);
          graphics.fillRect(x + 22 - walkOffset, y + 18, 2, 6);
        }

        // PANTS/LEGS
        graphics.fillStyle(colors.pants, 1);
        // Legs with walking animation
        graphics.fillRect(x + 12 + walkOffset, y + 24, 3, 6);
        graphics.fillRect(x + 17 - walkOffset, y + 24, 3, 6);

        // SHOES
        graphics.fillStyle(colors.shoes, 1);
        graphics.fillRect(x + 12 + walkOffset, y + 29, 3, 2);
        graphics.fillRect(x + 17 - walkOffset, y + 29, 3, 2);

        // OUTLINE (crisp black outline for pixel art style)
        graphics.lineStyle(1, colors.outline, 1);
        // Head outline
        graphics.strokeRect(x + 11, y + 7, 10, 10);
        // Hair outline
        if (direction === 3) {
          graphics.strokeRect(x + 10, y + 6, 12, 6);
        } else {
          graphics.strokeRect(x + 10, y + 6, 12, 5);
        }
        // Body outline
        graphics.strokeRect(x + 10, y + 17, 12, 7);
        // Legs outline
        graphics.strokeRect(x + 12 + walkOffset, y + 24, 3, 6);
        graphics.strokeRect(x + 17 - walkOffset, y + 24, 3, 6);
      }
    }

    // Generate texture
    const textureWidth = frameWidth * cols;
    const textureHeight = frameHeight * rows;
    console.log(`🎨 Generating texture for ${key} (${textureWidth}x${textureHeight})...`);

    try {
      graphics.generateTexture(key, textureWidth, textureHeight);
      graphics.destroy();

      // Verify texture was created
      if (!this.textures.exists(key)) {
        console.error(`❌ FAILED to create texture: ${key}`);
        return;
      }

      // Configure as sprite sheet with individual frames
      const texture = this.textures.get(key);
      const source = texture.source[0];
      console.log(`📦 Texture ${key} created: ${source.width}x${source.height}px`);

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

      console.log(`✅ Created sprite sheet for ${key} with ${rows * cols} frames (total frames: ${texture.frameTotal})`);
    } catch (error) {
      console.error(`❌ Error creating texture ${key}:`, error);
    }
  }

  create() {
    console.log('🏗️ Creating game world...');

    // Create pixel art avatars programmatically
    console.log('🎨 Creating avatar sprite sheets...');
    for (let i = 1; i <= 6; i++) {
      const key = `avatar${i}`;
      if (!this.textures.exists(key)) {
        this.createPixelArtAvatar(key);
        console.log(`✅ Avatar texture created: ${key}, exists: ${this.textures.exists(key)}`);
      } else {
        console.log(`⚠️ Avatar texture already exists: ${key}`);
      }
    }
    console.log('✅ All avatar textures ready!');

    // Check if WorkAdventure tilemap loaded successfully
    this.useTilemap = this.cache.tilemap.exists('office-map');

    // Create world bounds (use tilemap dimensions if available)
    if (this.useTilemap) {
      // Will set bounds after tilemap is created
      console.log('⏳ World bounds will be set from tilemap dimensions');
    } else {
      // Fallback to config dimensions
      this.physics.world.setBounds(
        0,
        0,
        GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE,
        GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE
      );
    }

    if (this.useTilemap) {
      console.log('✨ Using professional WorkAdventure tilemap');
      this.createWorldFromTilemap();
      // DON'T create zones - tilemap has its own zones without colorful overlays
    } else {
      console.log('🎨 Using procedural graphics (download WorkAdventure starter kit for better quality)');
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
    }

    // Setup input
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.eKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.wasd = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Camera will be setup after world creation (see createWorldFromTilemap or after procedural creation)
    if (!this.useTilemap) {
      // Setup camera for procedural mode immediately
      this.cameras.main.setBounds(
        0,
        0,
        GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE,
        GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE
      );
      this.cameras.main.setZoom(0.6);
      this.cameras.main.centerOn(
        (GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE) / 2,
        (GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE) / 2
      );
    }

    // Setup camera pan and zoom controls
    this.setupCameraControls();

    // CRITICAL: Setup socket listeners BEFORE scene is marked ready
    // This ensures we catch ALL socket events (especially PLAYERS_LIST)
    // that arrive while the scene is still initializing
    console.log('📡 Setting up socket listeners (before scene ready)...');
    this.setupSocketListeners();

    // IMPORTANT: Wait for next frame to ensure scene systems are fully initialized
    // This prevents the "Cannot read properties of null (reading 'queueDepthSort')" error
    this.time.delayedCall(0, () => {
      // Mark scene as ready
      this.isSceneReady = true;
      console.log('✅ Scene fully initialized and ready');

      // Process pending player creation if any
      if (this.pendingPlayerCreation) {
        const { playerId, username, avatar } = this.pendingPlayerCreation;
        this.createLocalPlayer(playerId, username, avatar);
        this.pendingPlayerCreation = undefined;
      }

      // SMART PLAYER CREATION: Try to create player immediately if socket is ready
      this.tryCreatePlayerFromSocketAndStore();

      // Process any pending remote players that were queued before scene was ready
      this.processPendingRemotePlayers();

      // FALLBACK: If player still not created after 2 seconds, force creation
      this.time.delayedCall(2000, () => {
        if (!this.localPlayer) {
          console.warn('⚠️ FALLBACK: Player not created after 2s, forcing creation...');
          this.tryCreatePlayerFromSocketAndStore();
        }
      });
    });
  }

  /**
   * Process any remote players that were queued before the scene was ready
   */
  private processPendingRemotePlayers() {
    if (this.pendingRemotePlayers.length === 0) {
      return;
    }

    console.log(`📦 Processing ${this.pendingRemotePlayers.length} pending remote players...`);

    // Process each pending remote player
    this.pendingRemotePlayers.forEach((playerData) => {
      console.log(`   → Adding queued player: ${playerData.username}`);
      this.addRemotePlayer(playerData);
    });

    // Clear the queue
    this.pendingRemotePlayers = [];
    console.log(`✅ All pending remote players processed`);
  }

  private createGround() {
    const tile = GAME_CONFIG.TILE_SIZE;

    // Create floor with different textures for different zones (like reference image)
    for (let y = 0; y < GAME_CONFIG.MAP_HEIGHT; y++) {
      for (let x = 0; x < GAME_CONFIG.MAP_WIDTH; x++) {
        const worldX = x * tile;
        const worldY = y * tile;
        let floorType = 'floor-wood'; // Default is wood planks

        // ===== OUTDOOR AREAS (grass) =====
        // Left side outdoor
        if (x < 4 || x > GAME_CONFIG.MAP_WIDTH - 5) {
          floorType = 'floor-grass';
        }
        // Top and bottom outdoor strips
        else if (y < 4 || y > GAME_CONFIG.MAP_HEIGHT - 5) {
          floorType = 'floor-grass';
        }

        // ===== MEETING ROOMS (carpet) =====
        // Meeting room 1 (top-left)
        else if (x >= 6 && x <= 14 && y >= 6 && y <= 14) {
          floorType = 'floor-carpet';
        }
        // Meeting room 2 (top-right)
        else if (x >= 36 && x <= 44 && y >= 6 && y <= 14) {
          floorType = 'floor-carpet';
        }

        // ===== KITCHEN (tile floor) =====
        else if (x >= 36 && x <= 44 && y >= 18 && y <= 24) {
          floorType = 'floor-tile';
        }

        // ===== SILENT ZONE (chevron pattern) =====
        else if (x >= 22 && x <= 32 && y >= 18 && y <= 24) {
          floorType = 'floor-chevron';
        }

        // ===== LOUNGE AREA (carpet - warm) =====
        else if (x >= 6 && x <= 14 && y >= 18 && y <= 28) {
          floorType = 'floor-carpet';
        }

        // ===== BUREAUX/OFFICES (wood) =====
        else if ((x >= 6 && x <= 11 && y >= 26 && y <= 31) ||
                 (x >= 17 && x <= 22 && y >= 26 && y <= 31) ||
                 (x >= 36 && x <= 41 && y >= 26 && y <= 31)) {
          floorType = 'floor-wood';
        }

        // ===== POND AREA (water) =====
        else if (x >= 46 && x <= 48 && y >= 20 && y <= 25) {
          floorType = 'floor-water';
        }

        // Place the floor tile
        this.add.image(
          worldX + tile / 2,
          worldY + tile / 2,
          floorType
        );
      }
    }

    console.log('✅ Ground created with zone-based flooring');
  }

  private createWalls() {
    const tile = GAME_CONFIG.TILE_SIZE;
    const solidWalls: { x: number; y: number }[] = [];
    const glassWalls: { x: number; y: number }[] = [];

    // ===== OUTER BOUNDARY (solid walls) =====
    for (let i = 4; i < GAME_CONFIG.MAP_WIDTH - 4; i++) {
      solidWalls.push({ x: i, y: 4 }); // Top
      solidWalls.push({ x: i, y: GAME_CONFIG.MAP_HEIGHT - 5 }); // Bottom
    }
    for (let i = 4; i < GAME_CONFIG.MAP_HEIGHT - 4; i++) {
      solidWalls.push({ x: 4, y: i }); // Left
      solidWalls.push({ x: GAME_CONFIG.MAP_WIDTH - 5, y: i }); // Right
    }

    // ===== MEETING ROOM 1 (top-left) - GLASS WALLS =====
    // Top and bottom - glass
    for (let x = 6; x <= 14; x++) {
      glassWalls.push({ x, y: 6 }); // Top wall (glass)
      glassWalls.push({ x, y: 14 }); // Bottom wall (glass)
    }
    // Left - solid wall
    for (let y = 6; y <= 14; y++) {
      solidWalls.push({ x: 6, y }); // Left wall (solid)
    }
    // Right - glass with door opening
    for (let y = 6; y <= 14; y++) {
      if (y !== 10) { // Door at y=10
        glassWalls.push({ x: 14, y }); // Right wall (glass except door)
      }
    }

    // ===== MEETING ROOM 2 (top-right) - GLASS WALLS =====
    // Top and bottom - glass
    for (let x = 36; x <= 44; x++) {
      glassWalls.push({ x, y: 6 }); // Top wall (glass)
      glassWalls.push({ x, y: 14 }); // Bottom wall (glass)
    }
    // Right - solid wall
    for (let y = 6; y <= 14; y++) {
      solidWalls.push({ x: 44, y }); // Right wall (solid)
    }
    // Left - glass with door opening
    for (let y = 6; y <= 14; y++) {
      if (y !== 10) { // Door at y=10
        glassWalls.push({ x: 36, y }); // Left wall (glass except door)
      }
    }

    // ===== LOUNGE AREA (left) - partial walls =====
    // Top separator
    for (let x = 6; x <= 14; x++) {
      solidWalls.push({ x, y: 18 });
    }
    // Bottom separator
    for (let x = 6; x <= 9; x++) {
      solidWalls.push({ x, y: 28 });
    }

    // ===== KITCHEN AREA (top-right) - walls =====
    // Left wall
    for (let y = 18; y <= 24; y++) {
      solidWalls.push({ x: 36, y });
    }
    // Top wall
    for (let x = 36; x <= 44; x++) {
      solidWalls.push({ x, y: 18 });
    }
    // Right wall
    for (let y = 18; y <= 24; y++) {
      solidWalls.push({ x: 44, y });
    }

    // ===== SILENT ZONE - no walls, just floor pattern =====

    // ===== BUREAUX (bottom offices) - SOLID WALLS =====
    // Bureau 1 (bottom-left)
    for (let x = 6; x <= 11; x++) {
      solidWalls.push({ x, y: 26 }); // Top
      solidWalls.push({ x, y: 31 }); // Bottom
    }
    for (let y = 26; y <= 31; y++) {
      solidWalls.push({ x: 6, y }); // Left
      if (y !== 29) solidWalls.push({ x: 11, y }); // Right (door at 29)
    }

    // Bureau 2 (bottom-middle)
    for (let x = 17; x <= 22; x++) {
      solidWalls.push({ x, y: 26 }); // Top
      solidWalls.push({ x, y: 31 }); // Bottom
    }
    for (let y = 26; y <= 31; y++) {
      solidWalls.push({ x: 17, y }); // Left
      if (y !== 29) solidWalls.push({ x: 22, y }); // Right (door at 29)
    }

    // Bureau 3 (bottom-right)
    for (let x = 36; x <= 41; x++) {
      solidWalls.push({ x, y: 26 }); // Top
      solidWalls.push({ x, y: 31 }); // Bottom
    }
    for (let y = 26; y <= 31; y++) {
      if (y !== 29) solidWalls.push({ x: 36, y }); // Left (door at 29)
      solidWalls.push({ x: 41, y }); // Right
    }

    // Create solid wall sprites
    solidWalls.forEach(({ x, y }) => {
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

    // Create glass wall sprites (semi-transparent, non-collidable)
    glassWalls.forEach(({ x, y }) => {
      const glassWall = this.add.image(
        x * tile + tile / 2,
        y * tile + tile / 2,
        'wall-glass'
      );
      glassWall.setAlpha(0.6); // More transparent
      // Glass walls are visual only, no collision
    });

    console.log(`✅ Created ${solidWalls.length} solid walls and ${glassWalls.length} glass walls`);
  }

  private createRoomZones() {
    // Skip zone rectangles when using tilemap - tilemap has its own zones
    if (this.useTilemap) {
      console.log('✅ Using tilemap zones (no overlay rectangles)');
      return;
    }

    const tile = GAME_CONFIG.TILE_SIZE;
    const rooms = [
      // Meeting rooms with glass walls
      { x: 6 * tile, y: 6 * tile, width: 9 * tile, height: 9 * tile, color: 0x3498db, name: 'Meeting Room 1' },
      { x: 36 * tile, y: 6 * tile, width: 9 * tile, height: 9 * tile, color: 0x2ecc71, name: 'Meeting Room 2' },

      // Lounge area (left side, comfortable seating)
      { x: 6 * tile, y: 18 * tile, width: 9 * tile, height: 11 * tile, color: 0xE67E22, name: 'Lounge' },

      // Silent zone (center, special chevron floor)
      { x: 22 * tile, y: 18 * tile, width: 11 * tile, height: 7 * tile, color: 0x95A5A6, name: 'Silent Zone' },

      // Kitchen/dining (top-right)
      { x: 36 * tile, y: 18 * tile, width: 9 * tile, height: 7 * tile, color: 0x16A085, name: 'Kitchen' },

      // Bureaux (private offices)
      { x: 6 * tile, y: 26 * tile, width: 6 * tile, height: 6 * tile, color: 0xE74C3C, name: 'Bureau 1' },
      { x: 17 * tile, y: 26 * tile, width: 6 * tile, height: 6 * tile, color: 0xF39C12, name: 'Bureau 2' },
      { x: 36 * tile, y: 26 * tile, width: 6 * tile, height: 6 * tile, color: 0x9B59B6, name: 'Bureau 3' },

      // Open workspace (center top)
      { x: 16 * tile, y: 6 * tile, width: 18 * tile, height: 10 * tile, color: 0x1ABC9C, name: 'Open Workspace' },
    ];

    rooms.forEach((room) => {
      const zone = this.add.rectangle(
        room.x + room.width / 2,
        room.y + room.height / 2,
        room.width,
        room.height,
        room.color,
        0.02 // Very subtle color overlay
      );
      zone.setStrokeStyle(1, room.color, 0.15);

      // Add room label
      this.add.text(room.x + 10, room.y + 10, room.name, {
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: '#00000060',
        padding: { x: 5, y: 2 },
      }).setDepth(1);

      this.roomZones.push(zone);
    });

    console.log(`✅ Created ${rooms.length} room zones (meeting rooms, lounge, kitchen, silent zone, bureaux, workspace)`);
  }

  private createFurniture() {
    const tile = GAME_CONFIG.TILE_SIZE;
    const furnitureItems: FurnitureData[] = [];

    // ===== MEETING ROOM 1 (top-left) with glass walls =====
    furnitureItems.push({ id: 'mr1-table', type: 'table', x: 10 * tile, y: 10 * tile, width: 128, height: 96, collidable: true });
    // 8 chairs around table
    furnitureItems.push({ id: 'mr1-c1', type: 'chair', x: 7.5 * tile, y: 9 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr1-c2', type: 'chair', x: 7.5 * tile, y: 11 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr1-c3', type: 'chair', x: 12.5 * tile, y: 9 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr1-c4', type: 'chair', x: 12.5 * tile, y: 11 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr1-c5', type: 'chair', x: 9 * tile, y: 7.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr1-c6', type: 'chair', x: 11 * tile, y: 7.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr1-c7', type: 'chair', x: 9 * tile, y: 12.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr1-c8', type: 'chair', x: 11 * tile, y: 12.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr1-tv', type: 'tv', x: 10 * tile, y: 7 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'mr1-p1', type: 'plant', x: 7 * tile, y: 7 * tile, width: 32, height: 48, collidable: false });
    furnitureItems.push({ id: 'mr1-p2', type: 'plant', x: 13 * tile, y: 13 * tile, width: 32, height: 48, collidable: false });

    // ===== MEETING ROOM 2 (top-right) with glass walls =====
    furnitureItems.push({ id: 'mr2-table', type: 'table', x: 40 * tile, y: 10 * tile, width: 128, height: 96, collidable: true });
    // 8 chairs
    furnitureItems.push({ id: 'mr2-c1', type: 'chair', x: 37.5 * tile, y: 9 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr2-c2', type: 'chair', x: 37.5 * tile, y: 11 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr2-c3', type: 'chair', x: 42.5 * tile, y: 9 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr2-c4', type: 'chair', x: 42.5 * tile, y: 11 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr2-c5', type: 'chair', x: 39 * tile, y: 7.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr2-c6', type: 'chair', x: 41 * tile, y: 7.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr2-c7', type: 'chair', x: 39 * tile, y: 12.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr2-c8', type: 'chair', x: 41 * tile, y: 12.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'mr2-tv', type: 'tv', x: 40 * tile, y: 7 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'mr2-p1', type: 'plant', x: 43 * tile, y: 13 * tile, width: 32, height: 48, collidable: false });

    // ===== LOUNGE AREA (left side) - like reference image =====
    // Sofas
    furnitureItems.push({ id: 'lg-sofa1', type: 'sofa', x: 8 * tile, y: 20 * tile, width: 96, height: 48, collidable: true });
    furnitureItems.push({ id: 'lg-sofa2', type: 'sofa', x: 12 * tile, y: 22 * tile, width: 96, height: 48, collidable: true });
    furnitureItems.push({ id: 'lg-sofa3', type: 'sofa', x: 8 * tile, y: 25 * tile, width: 96, height: 48, collidable: true });
    // Bean bags (like in reference - green)
    furnitureItems.push({ id: 'lg-bean1', type: 'beanbag', x: 7 * tile, y: 22 * tile, width: 48, height: 48, collidable: true });
    furnitureItems.push({ id: 'lg-bean2', type: 'beanbag', x: 10 * tile, y: 23 * tile, width: 48, height: 48, collidable: true });
    furnitureItems.push({ id: 'lg-bean3', type: 'beanbag', x: 13 * tile, y: 25 * tile, width: 48, height: 48, collidable: true });
    furnitureItems.push({ id: 'lg-bean4', type: 'beanbag', x: 7 * tile, y: 26.5 * tile, width: 48, height: 48, collidable: true });
    // Coffee tables
    furnitureItems.push({ id: 'lg-coffee1', type: 'coffee-table', x: 10 * tile, y: 21 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'lg-coffee2', type: 'coffee-table', x: 9.5 * tile, y: 24.5 * tile, width: 96, height: 64, collidable: true });
    // Plants
    furnitureItems.push({ id: 'lg-p1', type: 'plant', x: 6.5 * tile, y: 19 * tile, width: 32, height: 48, collidable: false });
    furnitureItems.push({ id: 'lg-p2', type: 'plant', x: 13.5 * tile, y: 27 * tile, width: 32, height: 48, collidable: false });
    furnitureItems.push({ id: 'lg-p3', type: 'plant', x: 7 * tile, y: 23.5 * tile, width: 32, height: 48, collidable: false });

    // ===== KITCHEN/DINING AREA (top-right) =====
    // Kitchen appliances
    furnitureItems.push({ id: 'kit-fridge', type: 'fridge', x: 37 * tile, y: 19.5 * tile, width: 64, height: 96, collidable: true });
    furnitureItems.push({ id: 'kit-counter1', type: 'counter', x: 39 * tile, y: 19 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'kit-counter2', type: 'counter', x: 42 * tile, y: 19 * tile, width: 96, height: 64, collidable: true });
    // Dining tables with chairs
    furnitureItems.push({ id: 'kit-table1', type: 'dining-table', x: 38.5 * tile, y: 22 * tile, width: 128, height: 96, collidable: true });
    furnitureItems.push({ id: 'kit-table2', type: 'dining-table', x: 41.5 * tile, y: 22 * tile, width: 128, height: 96, collidable: true });
    // Chairs around dining tables (8 chairs total)
    furnitureItems.push({ id: 'kit-c1', type: 'chair', x: 37.5 * tile, y: 21.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'kit-c2', type: 'chair', x: 39.5 * tile, y: 21.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'kit-c3', type: 'chair', x: 37.5 * tile, y: 23 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'kit-c4', type: 'chair', x: 39.5 * tile, y: 23 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'kit-c5', type: 'chair', x: 40.5 * tile, y: 21.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'kit-c6', type: 'chair', x: 42.5 * tile, y: 21.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'kit-c7', type: 'chair', x: 40.5 * tile, y: 23 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'kit-c8', type: 'chair', x: 42.5 * tile, y: 23 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'kit-p1', type: 'plant', x: 43.5 * tile, y: 23.5 * tile, width: 32, height: 48, collidable: false });

    // ===== SILENT ZONE (center) - minimal furniture, chevron floor =====
    furnitureItems.push({ id: 'sil-desk1', type: 'desk', x: 24 * tile, y: 20 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'sil-desk2', type: 'desk', x: 28 * tile, y: 20 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'sil-desk3', type: 'desk', x: 24 * tile, y: 23 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'sil-desk4', type: 'desk', x: 28 * tile, y: 23 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'sil-c1', type: 'chair', x: 23 * tile, y: 20 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'sil-c2', type: 'chair', x: 27 * tile, y: 20 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'sil-c3', type: 'chair', x: 23 * tile, y: 23 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'sil-c4', type: 'chair', x: 27 * tile, y: 23 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'sil-p1', type: 'plant', x: 31 * tile, y: 21 * tile, width: 32, height: 48, collidable: false });

    // ===== OPEN WORKSPACE (center-top) =====
    // Desk clusters
    furnitureItems.push({ id: 'ws-d1', type: 'desk', x: 18 * tile, y: 8 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'ws-d2', type: 'desk', x: 21 * tile, y: 8 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'ws-d3', type: 'desk', x: 18 * tile, y: 11 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'ws-d4', type: 'desk', x: 21 * tile, y: 11 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'ws-c1', type: 'chair', x: 17 * tile, y: 8 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'ws-c2', type: 'chair', x: 20 * tile, y: 8 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'ws-c3', type: 'chair', x: 17 * tile, y: 11 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'ws-c4', type: 'chair', x: 20 * tile, y: 11 * tile, width: 32, height: 32, collidable: false });

    furnitureItems.push({ id: 'ws-d5', type: 'desk', x: 26 * tile, y: 8 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'ws-d6', type: 'desk', x: 29 * tile, y: 8 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'ws-d7', type: 'desk', x: 26 * tile, y: 11 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'ws-d8', type: 'desk', x: 29 * tile, y: 11 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'ws-c5', type: 'chair', x: 25 * tile, y: 8 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'ws-c6', type: 'chair', x: 28 * tile, y: 8 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'ws-c7', type: 'chair', x: 25 * tile, y: 11 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'ws-c8', type: 'chair', x: 28 * tile, y: 11 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'ws-p1', type: 'plant', x: 24 * tile, y: 14 * tile, width: 32, height: 48, collidable: false });
    furnitureItems.push({ id: 'ws-p2', type: 'plant', x: 32 * tile, y: 14 * tile, width: 32, height: 48, collidable: false });

    // ===== BUREAUX (private offices) =====
    // Bureau 1
    furnitureItems.push({ id: 'b1-desk', type: 'desk', x: 8.5 * tile, y: 28.5 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'b1-chair', type: 'chair', x: 7.5 * tile, y: 28.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'b1-filing', type: 'filing-cabinet', x: 10.5 * tile, y: 27 * tile, width: 64, height: 96, collidable: true });
    furnitureItems.push({ id: 'b1-shelf', type: 'bookshelf', x: 7 * tile, y: 27 * tile, width: 64, height: 96, collidable: true });
    furnitureItems.push({ id: 'b1-p1', type: 'plant', x: 10 * tile, y: 30 * tile, width: 32, height: 48, collidable: false });

    // Bureau 2
    furnitureItems.push({ id: 'b2-desk', type: 'desk', x: 19.5 * tile, y: 28.5 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'b2-chair', type: 'chair', x: 18.5 * tile, y: 28.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'b2-filing', type: 'filing-cabinet', x: 21.5 * tile, y: 27 * tile, width: 64, height: 96, collidable: true });
    furnitureItems.push({ id: 'b2-shelf', type: 'bookshelf', x: 18 * tile, y: 30 * tile, width: 64, height: 96, collidable: true });
    furnitureItems.push({ id: 'b2-p1', type: 'plant', x: 21 * tile, y: 30 * tile, width: 32, height: 48, collidable: false });

    // Bureau 3
    furnitureItems.push({ id: 'b3-desk', type: 'desk', x: 38.5 * tile, y: 28.5 * tile, width: 96, height: 64, collidable: true });
    furnitureItems.push({ id: 'b3-chair', type: 'chair', x: 37.5 * tile, y: 28.5 * tile, width: 32, height: 32, collidable: false });
    furnitureItems.push({ id: 'b3-filing', type: 'filing-cabinet', x: 40.5 * tile, y: 27 * tile, width: 64, height: 96, collidable: true });
    furnitureItems.push({ id: 'b3-shelf', type: 'bookshelf', x: 37 * tile, y: 27 * tile, width: 64, height: 96, collidable: true });
    furnitureItems.push({ id: 'b3-sofa', type: 'sofa', x: 38.5 * tile, y: 30 * tile, width: 96, height: 48, collidable: true });

    // ===== OUTDOOR ELEMENTS (perimeter) =====
    // Trees
    furnitureItems.push({ id: 'out-tree1', type: 'tree', x: 2 * tile, y: 8 * tile, width: 48, height: 64, collidable: true });
    furnitureItems.push({ id: 'out-tree2', type: 'tree', x: 2 * tile, y: 20 * tile, width: 48, height: 64, collidable: true });
    furnitureItems.push({ id: 'out-tree3', type: 'tree', x: 47 * tile, y: 8 * tile, width: 48, height: 64, collidable: true });
    furnitureItems.push({ id: 'out-tree4', type: 'tree', x: 47 * tile, y: 28 * tile, width: 48, height: 64, collidable: true });
    furnitureItems.push({ id: 'out-tree5', type: 'tree', x: 15 * tile, y: 2 * tile, width: 48, height: 64, collidable: true });
    furnitureItems.push({ id: 'out-tree6', type: 'tree', x: 35 * tile, y: 2 * tile, width: 48, height: 64, collidable: true });
    // Bushes
    furnitureItems.push({ id: 'out-bush1', type: 'bush', x: 3 * tile, y: 12 * tile, width: 32, height: 24, collidable: false });
    furnitureItems.push({ id: 'out-bush2', type: 'bush', x: 46 * tile, y: 12 * tile, width: 32, height: 24, collidable: false });
    furnitureItems.push({ id: 'out-bush3', type: 'bush', x: 46 * tile, y: 24 * tile, width: 32, height: 24, collidable: false });
    furnitureItems.push({ id: 'out-bush4', type: 'bush', x: 20 * tile, y: 2.5 * tile, width: 32, height: 24, collidable: false });
    furnitureItems.push({ id: 'out-bush5', type: 'bush', x: 30 * tile, y: 2.5 * tile, width: 32, height: 24, collidable: false });

    furnitureItems.forEach((data) => {
      const furniture = new Furniture(this, data);
      this.furniture.push(furniture);
    });

    console.log(`✅ Created ${furnitureItems.length} furniture objects (meeting rooms, lounge, kitchen, silent zone, workspace, bureaux, outdoor)`);
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

  /**
   * Create world from WorkAdventure tilemap (professional graphics)
   */
  private createWorldFromTilemap() {
    try {
      // Create tilemap from loaded JSON
      this.tilemap = this.make.tilemap({ key: 'office-map' });

      if (!this.tilemap) {
        console.error('❌ Failed to create tilemap');
        this.fallbackToProcedural();
        return;
      }

      console.log(`📐 Tilemap loaded: ${this.tilemap.width}x${this.tilemap.height} tiles`);

      // The WorkAdventure map uses embedded tilesets with relative image paths
      // Phaser will automatically load these images relative to the map's location
      // Images are in: /assets/tilesets/WA_*.png
      // Map is at: /assets/maps/office.json
      // So relative path "../tilesets/WA_*.png" should work

      // Get all tilesets from the map
      const tilesets: Phaser.Tilemaps.Tileset[] = [];

      // WorkAdventure maps have multiple tilesets embedded
      for (let i = 0; i < this.tilemap.tilesets.length; i++) {
        const tilesetData = this.tilemap.tilesets[i];
        const tileset = this.tilemap.addTilesetImage(tilesetData.name);

        if (tileset) {
          tilesets.push(tileset);
          console.log(`✅ Loaded tileset: ${tilesetData.name}`);
        } else {
          console.warn(`⚠️ Could not load tileset: ${tilesetData.name}`);
        }
      }

      if (tilesets.length === 0) {
        console.error('❌ No tilesets loaded');
        this.fallbackToProcedural();
        return;
      }

      // Create all tile layers from the map
      const layerNames = this.tilemap.layers.map(l => l.name);
      console.log(`📋 Available layers: ${layerNames.join(', ')}`);

      // Create layers with proper depth sorting
      // Layers named "above" should render ABOVE players (depth 2000+)
      // All other layers should render BELOW players (depth 0-999)
      let belowPlayerDepth = 0;
      let abovePlayerDepth = 2000;

      this.tilemap.layers.forEach((layerData) => {
        // Check if it's a tile layer (not object layer)
        const layer = this.tilemap!.createLayer(layerData.name, tilesets, 0, 0);

        if (layer) {
          const layerName = layerData.name.toLowerCase();

          // Layers with "above" in name render above players
          if (layerName.includes('above')) {
            layer.setDepth(abovePlayerDepth);
            console.log(`✅ Created layer: ${layerData.name} (depth: ${abovePlayerDepth}) [ABOVE PLAYER]`);
            abovePlayerDepth += 10;
          } else {
            // All other layers render below players
            layer.setDepth(belowPlayerDepth);
            console.log(`✅ Created layer: ${layerData.name} (depth: ${belowPlayerDepth}) [BELOW PLAYER]`);
            belowPlayerDepth += 10;
          }

          // Setup collision for layers named "collisions" or "walls"
          if (layerName.includes('collision') || layerName.includes('wall')) {
            // Set collision for all non-zero tiles
            layer.setCollisionByExclusion([-1, 0]);
            console.log(`🚧 Collision enabled for layer: ${layerData.name}`);
          }
        }
      });

      console.log('✨ WorkAdventure tilemap world created successfully!');

      // Set physics world bounds from tilemap dimensions
      this.physics.world.setBounds(0, 0, this.tilemap.widthInPixels, this.tilemap.heightInPixels);
      console.log(`🌍 Physics world bounds set: ${this.tilemap.widthInPixels}x${this.tilemap.heightInPixels}px`);

      // Setup camera for tilemap (NOW that tilemap exists!)
      this.cameras.main.setBounds(0, 0, this.tilemap.widthInPixels, this.tilemap.heightInPixels);
      this.cameras.main.setZoom(0.9); // Good balance for viewing full office
      this.cameras.main.centerOn(this.tilemap.widthInPixels / 2, this.tilemap.heightInPixels / 2);
      console.log(`📷 Camera setup: zoom=0.9, bounds=${this.tilemap.widthInPixels}x${this.tilemap.heightInPixels}px`);

      // Load and visualize zones from the tilemap
      this.loadZonesFromTilemap();

    } catch (error) {
      console.error('❌ Error loading tilemap:', error);
      this.fallbackToProcedural();
    }
  }

  /**
   * Load and optionally visualize zones from Tiled object layers
   * These zones match the server-side zones for audio isolation
   */
  private loadZonesFromTilemap() {
    if (!this.tilemap) return;

    // Get object layers from the tilemap
    const objectLayers = this.tilemap.objects;
    if (!objectLayers || objectLayers.length === 0) {
      console.log('ℹ️  No object layers found in tilemap (zones will still work server-side)');
      return;
    }

    console.log(`\n📍 Loading zones from ${objectLayers.length} object layer(s)...`);

    let zoneCount = 0;

    objectLayers.forEach((layer) => {
      layer.objects.forEach((obj: any) => {
        // Check if this object is a zone (has jitsi, silent properties, or "zone" in name)
        const hasJitsiRoom = obj.properties?.some((p: any) => p.name === 'jitsiRoom');
        const hasSilent = obj.properties?.some((p: any) => p.name === 'silent');
        const isZone = hasJitsiRoom || hasSilent || obj.name.toLowerCase().includes('zone');

        if (isZone) {
          zoneCount++;
          console.log(`   ✓ Found zone: "${obj.name}" at (${Math.round(obj.x)}, ${Math.round(obj.y)}) size ${Math.round(obj.width)}x${Math.round(obj.height)}`);

          // Optional: Draw visual indicator for zones (useful for debugging)
          // Comment out if you don't want to see zone boundaries
          this.drawZoneIndicator(obj);
        }
      });
    });

    console.log(`✅ Loaded ${zoneCount} zones from tilemap\n`);
  }

  /**
   * Draw a visual indicator for a zone (optional, for debugging)
   * Shows semi-transparent colored rectangles over zone areas
   */
  private drawZoneIndicator(zoneObj: any) {
    const graphics = this.add.graphics();

    // Determine color based on zone type/name
    let color = 0x00ff00; // Default: green
    let alpha = 0.15;

    const name = zoneObj.name.toLowerCase();
    if (name.includes('meeting') || name.includes('jitsi')) {
      color = 0x0088ff; // Blue for meeting rooms
    } else if (name.includes('silent')) {
      color = 0x888888; // Gray for silent zones
      alpha = 0.2;
    } else if (name.includes('chill') || name.includes('lounge')) {
      color = 0xff8800; // Orange for chill/lounge areas
    }

    // Draw border
    graphics.lineStyle(2, color, 0.6);
    graphics.strokeRect(zoneObj.x, zoneObj.y, zoneObj.width, zoneObj.height);

    // Draw fill
    graphics.fillStyle(color, alpha);
    graphics.fillRect(zoneObj.x, zoneObj.y, zoneObj.width, zoneObj.height);

    // Set depth to render above floor but below players
    graphics.setDepth(950);

    // Optional: Add zone name label
    const labelText = this.add.text(
      zoneObj.x + zoneObj.width / 2,
      zoneObj.y + zoneObj.height / 2,
      zoneObj.name,
      {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 },
      }
    );
    labelText.setOrigin(0.5, 0.5);
    labelText.setAlpha(0.7);
    labelText.setDepth(951);
  }

  /**
   * Fallback to procedural graphics if tilemap fails
   */
  private fallbackToProcedural() {
    console.log('🔄 Falling back to procedural graphics...');
    this.useTilemap = false;
    this.createGround();
    this.createWalls();
    this.createRoomZones();
    this.createFurniture();
    this.createDoors();
  }

  private setupSocketListeners() {
    const socket = socketService.getSocket();
    if (!socket) {
      console.warn('⚠️ Socket not available in setupSocketListeners');
      return;
    }

    console.log('📡 Setting up socket event listeners...');

    // Player joined - USING LITERAL STRING TO BYPASS TYPESCRIPT
    console.log('🎯 Registering player:joined handler...');
    socket.on('player:joined', (player: PlayerData) => {
      console.log('👥 Remote player joined:', player.username);
      this.addRemotePlayer(player);
    });

    // Player left - USING LITERAL STRING
    console.log('🎯 Registering player:left handler...');
    socket.on('player:left', (playerId: string) => {
      console.log('👋 Remote player left:', playerId);
      this.removeRemotePlayer(playerId);
    });

    // Player position update - USING LITERAL STRING
    socket.on('player:position', (data: { playerId: string; movement: PlayerMovement; player?: PlayerData }) => {
      // FALLBACK: Auto-create remote player if they don't exist yet
      // This handles the case where players:list event failed to arrive
      if (data.player && !this.remotePlayers.has(data.playerId)) {
        console.log(`🔄 Auto-creating remote player from position event: ${data.player.username}`);
        this.addRemotePlayer({
          id: data.player.id,
          username: data.player.username,
          avatar: data.player.avatar,
          userId: data.player.userId,
          position: data.movement.position,
          velocity: data.movement.velocity,
          direction: data.movement.direction,
          isMoving: data.movement.isMoving,
          timestamp: data.movement.timestamp
        });
      }

      this.updateRemotePlayer(data.playerId, data.movement);
    });

    // Initial players list - CRITICAL: USING LITERAL STRING
    console.log(`🎯 Registering players:list handler (CRITICAL - literal string)...`);
    socket.on('players:list', (players: Record<string, PlayerData>) => {
      console.log(`\n========================================`);
      console.log(`📋 PLAYERS_LIST EVENT HANDLER CALLED!`);
      console.log(`========================================`);
      console.log(`Total players: ${Object.keys(players).length}`);
      console.log(`My socket ID: ${socket.id}`);
      console.log(`Player IDs:`, Object.keys(players));
      console.log(`Scene ready: ${this.isSceneReady}`);
      console.log(`Local player exists: ${!!this.localPlayer}`);
      console.log(`Pending remote players count: ${this.pendingRemotePlayers.length}`);
      console.log(`========================================\n`);

      // FALLBACK: Create local player if it doesn't exist yet and we're in the list
      // This handles the case where AUTHENTICATED event might not be received
      if (!this.localPlayer && socket.id && players[socket.id]) {
        const localPlayerData = players[socket.id];
        console.log(`🎮 FALLBACK: Creating local player from PLAYERS_LIST`, localPlayerData);

        if (this.isSceneReady) {
          this.createLocalPlayer(socket.id, localPlayerData.username, localPlayerData.avatar);
        } else {
          this.pendingPlayerCreation = {
            playerId: socket.id,
            username: localPlayerData.username,
            avatar: localPlayerData.avatar,
          };
        }
      }

      // Add ALL players to store (including self)
      console.log(`\n🔄 Processing players from PLAYERS_LIST...`);
      Object.entries(players).forEach(([id, player]) => {
        if (id !== socket.id) {
          console.log(`   → Remote player found: ${player.username} (${id})`);
          this.addRemotePlayer(player);
        } else {
          console.log(`   → Local player (self): ${player.username} (${id})`);
          // Add self to store if local player exists
          if (this.localPlayer) {
            useGameStore.getState().addPlayer(player);
            console.log(`   ✅ Local player added to store from PLAYERS_LIST`);
          }
        }
      });
      console.log(`🔄 Finished processing players\n`);
    });

    // Authenticated - create local player - CRITICAL: USING LITERAL STRING
    console.log('🎯 Registering authenticated handler (CRITICAL - literal string)...');
    socket.on('authenticated', () => {
      console.log('\n========================================');
      console.log('🔐 AUTHENTICATED EVENT RECEIVED!');
      console.log('========================================\n');
      const store = useGameStore.getState();
      console.log('📦 User from store:', store.user);

      if (store.user) {
        // Queue player creation if scene isn't ready yet
        if (!this.isSceneReady) {
          console.log('⏳ Scene not ready, queueing player creation');
          this.pendingPlayerCreation = {
            playerId: socket.id!,
            username: store.user.username,
            avatar: store.user.avatar,
          };
        } else {
          console.log('✅ Scene ready, creating player immediately');
          this.createLocalPlayer(socket.id!, store.user.username, store.user.avatar);
        }
        store.setCurrentPlayerId(socket.id!);
      } else {
        console.error('❌ No user in store after authentication!');
      }
    });

    // Proximity updates - for video/audio chat - USING LITERAL STRING
    socket.on('proximity:update', (proximityData) => {
      const store = useGameStore.getState();

      // Extract player IDs from proximity data
      const playerIds = proximityData.map(data => data.playerId);

      // Update store with nearby players
      store.setProximityPlayers(playerIds);

      // Log proximity changes for debugging (THROTTLED to prevent console spam)
      const now = Date.now();
      if (playerIds.length > 0 && (now - this.lastProximityLogTime) > this.proximityLogThrottle) {
        console.log(`📡 Players in proximity (${playerIds.length}):`, playerIds);
        this.lastProximityLogTime = now;
      }
    });

    // Door state updates - USING LITERAL STRING
    socket.on('door:update', (update: any) => {
      const door = this.doors.find(d => d.getDoorId() === update.doorId);
      if (door && update.state) {
        door.updateState(update.state);
        console.log(`🚪 Door ${update.doorId} updated: ${update.state}`);
      }
    });

    // Initial doors list - USING LITERAL STRING
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

  /**
   * Smart player creation: Try to create player from socket connection and user store
   * This method can be called anytime after scene is ready
   */
  private tryCreatePlayerFromSocketAndStore() {
    console.log('🔍 Trying to create player from socket and store...');

    // Don't create if already exists
    if (this.localPlayer) {
      console.log('⏭️ Player already exists, skipping');
      return;
    }

    // Get socket
    const socket = socketService.getSocket();
    if (!socket || !socket.connected || !socket.id) {
      console.log('⏭️ Socket not ready (connected:', socket?.connected, ', id:', socket?.id, ')');
      return;
    }

    // Get user from store
    const store = useGameStore.getState();
    if (!store.user) {
      console.log('⏭️ No user in store yet');
      return;
    }

    // All conditions met - create player!
    console.log('✅ All conditions met for player creation:');
    console.log(`   Socket ID: ${socket.id}`);
    console.log(`   User: ${store.user.username}`);
    console.log(`   Avatar: ${store.user.avatar}`);

    this.createLocalPlayer(socket.id, store.user.username, store.user.avatar);
    store.setCurrentPlayerId(socket.id);
  }

  private createLocalPlayer(playerId: string, username: string, avatar: string) {
    console.log(`🎮 Creating local player - ID: ${playerId}, username: ${username}, avatar: ${avatar}`);

    // Safety check: ensure scene is ready
    if (!this.isSceneReady) {
      console.warn('❌ Attempted to create player before scene ready - queueing creation');
      return;
    }

    // Prevent duplicate player creation
    if (this.localPlayer) {
      console.warn('⚠️ Local player already exists');
      return;
    }

    // Verify avatar texture exists
    if (!this.textures.exists(avatar)) {
      console.error(`❌ Cannot create player - avatar texture "${avatar}" does not exist!`);
      console.log(`📋 Available textures:`, this.textures.getTextureKeys().filter(k => k.startsWith('avatar')));
      return;
    }

    // Spawn player at center of map (use tilemap dimensions if available)
    let spawnX, spawnY;
    if (this.useTilemap && this.tilemap) {
      spawnX = this.tilemap.widthInPixels / 2;
      spawnY = this.tilemap.heightInPixels / 2;
    } else {
      spawnX = (GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE) / 2;
      spawnY = (GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE) / 2;
    }

    console.log(`📍 Spawning player at (${spawnX}, ${spawnY})`);

    this.localPlayer = new Player(
      this,
      spawnX,
      spawnY,
      playerId,
      username,
      avatar
    );

    // Setup collisions with furniture (procedural mode)
    this.furniture.forEach(furn => {
      if (this.localPlayer) {
        this.physics.add.collider(this.localPlayer, furn);
      }
    });

    // Setup collisions with doors (procedural mode)
    this.doors.forEach(door => {
      if (this.localPlayer) {
        this.physics.add.collider(this.localPlayer, door);
      }
    });

    // Setup collisions with tilemap layers (tilemap mode)
    if (this.useTilemap && this.tilemap) {
      this.tilemap.layers.forEach((layerData) => {
        if (layerData.tilemapLayer) {
          const layerName = layerData.name.toLowerCase();

          // Add collision for layers with "collision" or "wall" in the name
          if (layerName.includes('collision') || layerName.includes('wall')) {
            this.physics.add.collider(this.localPlayer!, layerData.tilemapLayer);
            console.log(`🚧 Player collision added with tilemap layer: ${layerData.name}`);
          }
        }
      });
    }

    // Enable camera follow
    this.cameraFollowEnabled = true;
    this.cameras.main.startFollow(this.localPlayer, true, 0.1, 0.1);
    this.cameras.main.setZoom(1); // Zoom in when player appears

    // CRITICAL: Add local player to game store so it appears in the players list
    const localPlayerData: PlayerData = {
      id: playerId,
      userId: playerId, // Use socket ID as userId for now
      username: username,
      avatar: avatar,
      position: { x: spawnX, y: spawnY },
      velocity: { x: 0, y: 0 },
      direction: Direction.DOWN,
      isMoving: false,
      timestamp: Date.now()
    };
    useGameStore.getState().addPlayer(localPlayerData);
    console.log(`✅ LOCAL PLAYER ADDED TO STORE`);

    console.log(`✅ LOCAL PLAYER CREATED AND READY!`);
    console.log(`   Position: (${spawnX}, ${spawnY})`);
    console.log(`   Visible: ${this.localPlayer.visible}`);
    console.log(`   Alpha: ${this.localPlayer.alpha}`);
    console.log(`   Depth: ${this.localPlayer.depth}`);
    console.log(`   Texture: ${this.localPlayer.texture.key}`);
    console.log(`   Frame: ${this.localPlayer.frame.name}`);
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
    console.log(`👥 addRemotePlayer called for: ${playerData.username} (${playerData.id})`);
    console.log(`   Position: (${playerData.position.x}, ${playerData.position.y})`);
    console.log(`   Avatar: ${playerData.avatar}`);
    console.log(`   Scene ready: ${this.isSceneReady}`);
    console.log(`   Current remote players count: ${this.remotePlayers.size}`);

    // Check if player already exists
    if (this.remotePlayers.has(playerData.id)) {
      console.warn(`⚠️ Remote player ${playerData.username} already exists, skipping`);
      return;
    }

    // Check if scene is ready - if not, queue the player
    if (!this.isSceneReady) {
      console.warn(`⏳ Scene not ready, queueing remote player: ${playerData.username}`);
      this.pendingRemotePlayers.push(playerData);
      return;
    }

    // Check if avatar texture exists
    if (!this.textures.exists(playerData.avatar)) {
      console.error(`❌ Cannot add remote player ${playerData.username} - avatar texture "${playerData.avatar}" does not exist!`);
      console.log(`📋 Available avatars:`, this.textures.getTextureKeys().filter(k => k.startsWith('avatar')));
      return;
    }

    console.log(`✅ Creating remote player sprite for ${playerData.username}...`);

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

    console.log(`✅ Remote player ${playerData.username} added successfully!`);
    console.log(`   Total remote players: ${this.remotePlayers.size}`);
    console.log(`   Player visible: ${player.visible}, depth: ${player.depth}, alpha: ${player.alpha}`);
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
    if (!socket || !socket.id) return;

    console.log(`🚪 Interacting with door: ${doorId}`);
    socket.emit(SOCKET_EVENTS.DOOR_INTERACT, {
      doorId,
      playerId: socket.id,
      action: 'toggle' as const
    });
  }
}
