import Phaser from 'phaser';

/**
 * Graphics Generator - Creates beautiful procedural graphics
 * This provides placeholder graphics until real tileset assets are added
 */
export class GraphicsGenerator {
  private scene: Phaser.Scene;
  private tileSize: number = 32;

  constructor(scene: Phaser.Scene, tileSize: number = 32) {
    this.scene = scene;
    this.tileSize = tileSize;
  }

  /**
   * Create enhanced floor tiles with texture
   */
  createFloorTiles(): void {
    const size = this.tileSize;

    // Carpet Floor (Blue - for corridors)
    const carpetGraphics = this.scene.make.graphics({ x: 0, y: 0 });
    carpetGraphics.fillStyle(0x4A90E2, 1);
    carpetGraphics.fillRect(0, 0, size, size);
    // Add subtle pattern
    carpetGraphics.fillStyle(0x3A7BC2, 0.3);
    for (let i = 0; i < size; i += 4) {
      carpetGraphics.fillRect(i, 0, 2, size);
    }
    carpetGraphics.lineStyle(1, 0x3A7BC2, 0.5);
    carpetGraphics.strokeRect(0, 0, size, size);
    carpetGraphics.generateTexture('floor-carpet', size, size);
    carpetGraphics.destroy();

    // Wood Floor (Brown - for offices)
    const woodGraphics = this.scene.make.graphics({ x: 0, y: 0 });
    woodGraphics.fillStyle(0x8B4513, 1);
    woodGraphics.fillRect(0, 0, size, size);
    // Wood grain effect
    carpetGraphics.fillStyle(0x654321, 0.2);
    for (let i = 0; i < size; i += 8) {
      woodGraphics.fillRect(0, i, size, 2);
    }
    woodGraphics.lineStyle(1, 0x654321, 0.3);
    woodGraphics.strokeRect(0, 0, size, size);
    woodGraphics.generateTexture('floor-wood', size, size);
    woodGraphics.destroy();

    // Tile Floor (Gray - for meeting rooms)
    const tileGraphics = this.scene.make.graphics({ x: 0, y: 0 });
    // Checkered pattern
    tileGraphics.fillStyle(0xCCCCCC, 1);
    tileGraphics.fillRect(0, 0, size / 2, size / 2);
    tileGraphics.fillRect(size / 2, size / 2, size / 2, size / 2);
    tileGraphics.fillStyle(0xAAAAAA, 1);
    tileGraphics.fillRect(size / 2, 0, size / 2, size / 2);
    tileGraphics.fillRect(0, size / 2, size / 2, size / 2);
    tileGraphics.lineStyle(1, 0x888888, 0.5);
    tileGraphics.strokeRect(0, 0, size, size);
    tileGraphics.generateTexture('floor-tile', size, size);
    tileGraphics.destroy();

    console.log('✅ Enhanced floor tiles created');
  }

  /**
   * Create enhanced wall tile
   */
  createWallTile(): void {
    const size = this.tileSize;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });

    // Wall base color
    graphics.fillStyle(0x5C6A7D, 1);
    graphics.fillRect(0, 0, size, size);

    // Wall texture (bricks)
    graphics.lineStyle(1, 0x4A5668, 1);
    graphics.strokeRect(0, 0, size, size / 2);
    graphics.strokeRect(0, size / 2, size, size / 2);

    // Edge shadow
    graphics.fillStyle(0x000000, 0.2);
    graphics.fillRect(0, 0, 2, size);
    graphics.fillRect(0, 0, size, 2);

    graphics.generateTexture('wall', size, size);
    graphics.destroy();

    console.log('✅ Enhanced wall tile created');
  }

  /**
   * Create furniture sprite: Desk
   */
  createDesk(key: string = 'desk'): void {
    const width = 96;
    const height = 64;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });

    // Desk surface
    graphics.fillStyle(0x8B4513, 1);
    graphics.fillRect(0, 0, width, height);

    // Desk shadow (depth)
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillRect(4, 4, width, height);
    graphics.fillRect(0, 0, width, height);

    // Desk drawers
    graphics.fillStyle(0x654321, 1);
    graphics.fillRect(8, height - 20, width / 3, 16);
    graphics.fillRect(width / 3 + 12, height - 20, width / 3, 16);

    // Drawer handles
    graphics.fillStyle(0xC0C0C0, 1);
    graphics.fillCircle(width / 6, height - 12, 2);
    graphics.fillCircle(width / 2, height - 12, 2);

    // Computer monitor
    graphics.fillStyle(0x2C3E50, 1);
    graphics.fillRect(width / 2 - 12, 8, 24, 20);
    graphics.fillStyle(0x3498DB, 1);
    graphics.fillRect(width / 2 - 10, 10, 20, 16);

    // Border
    graphics.lineStyle(2, 0x654321, 1);
    graphics.strokeRect(0, 0, width, height);

    graphics.generateTexture(key, width, height);
    graphics.destroy();

    console.log(`✅ Desk created: ${key}`);
  }

  /**
   * Create furniture sprite: Chair
   */
  createChair(key: string = 'chair'): void {
    const width = 32;
    const height = 32;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });

    // Chair seat
    graphics.fillStyle(0x2C3E50, 1);
    graphics.fillRect(4, 12, 24, 16);

    // Chair back
    graphics.fillStyle(0x34495E, 1);
    graphics.fillRect(8, 0, 16, 16);

    // Legs (shadow)
    graphics.fillStyle(0x1A252F, 1);
    graphics.fillRect(6, 24, 4, 6);
    graphics.fillRect(22, 24, 4, 6);

    graphics.generateTexture(key, width, height);
    graphics.destroy();

    console.log(`✅ Chair created: ${key}`);
  }

  /**
   * Create furniture sprite: Table
   */
  createTable(key: string = 'table'): void {
    const width = 128;
    const height = 96;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });

    // Table surface (glass effect)
    graphics.fillStyle(0xD0D0D0, 0.7);
    graphics.fillRect(0, 0, width, height);

    // Reflection
    graphics.fillStyle(0xFFFFFF, 0.3);
    graphics.fillRect(0, 0, width, height / 4);

    // Table frame
    graphics.lineStyle(3, 0x7F8C8D, 1);
    graphics.strokeRect(0, 0, width, height);

    // Table legs
    graphics.fillStyle(0x95A5A6, 1);
    graphics.fillRect(8, height - 12, 8, 10);
    graphics.fillRect(width - 16, height - 12, 8, 10);
    graphics.fillRect(8, 2, 8, 10);
    graphics.fillRect(width - 16, 2, 8, 10);

    graphics.generateTexture(key, width, height);
    graphics.destroy();

    console.log(`✅ Table created: ${key}`);
  }

  /**
   * Create decoration: Plant
   */
  createPlant(key: string = 'plant'): void {
    const size = 32;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });

    // Pot
    graphics.fillStyle(0x8B4513, 1);
    graphics.fillRect(8, 20, 16, 12);

    // Plant leaves
    graphics.fillStyle(0x27AE60, 1);
    graphics.fillCircle(16, 12, 8);
    graphics.fillCircle(10, 14, 6);
    graphics.fillCircle(22, 14, 6);

    // Highlights
    graphics.fillStyle(0x2ECC71, 0.5);
    graphics.fillCircle(14, 10, 4);

    graphics.generateTexture(key, size, size);
    graphics.destroy();

    console.log(`✅ Plant created: ${key}`);
  }

  /**
   * Create decoration: Filing Cabinet
   */
  createFilingCabinet(key: string = 'filing-cabinet'): void {
    const width = 64;
    const height = 96;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });

    // Cabinet body
    graphics.fillStyle(0x7F8C8D, 1);
    graphics.fillRect(0, 0, width, height);

    // Drawers (4 drawers)
    graphics.lineStyle(2, 0x5C6A7D, 1);
    for (let i = 0; i < 4; i++) {
      graphics.strokeRect(0, i * (height / 4), width, height / 4);
      // Drawer handles
      graphics.fillStyle(0x2C3E50, 1);
      graphics.fillCircle(width / 2, i * (height / 4) + height / 8, 4);
    }

    // Shadow for depth
    graphics.fillStyle(0x000000, 0.2);
    graphics.fillRect(2, 2, width, height);
    graphics.fillRect(0, 0, width, height);

    graphics.generateTexture(key, width, height);
    graphics.destroy();

    console.log(`✅ Filing Cabinet created: ${key}`);
  }

  /**
   * Create decoration: Window
   */
  createWindow(key: string = 'window'): void {
    const width = 64;
    const height = 48;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });

    // Window frame
    graphics.fillStyle(0x34495E, 1);
    graphics.fillRect(0, 0, width, height);

    // Glass panes
    graphics.fillStyle(0x85C1E9, 0.6);
    graphics.fillRect(4, 4, width / 2 - 6, height - 8);
    graphics.fillRect(width / 2 + 2, 4, width / 2 - 6, height - 8);

    // Window grid
    graphics.lineStyle(2, 0x2C3E50, 1);
    graphics.lineBetween(width / 2, 4, width / 2, height - 4);
    graphics.lineBetween(4, height / 2, width - 4, height / 2);

    // Light reflection
    graphics.fillStyle(0xFFFFFF, 0.4);
    graphics.fillRect(8, 8, 12, 8);

    graphics.generateTexture(key, width, height);
    graphics.destroy();

    console.log(`✅ Window created: ${key}`);
  }

  /**
   * Create decoration: Painting
   */
  createPainting(key: string = 'painting', color: number = 0xE74C3C): void {
    const width = 48;
    const height = 32;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });

    // Frame
    graphics.fillStyle(0x8B4513, 1);
    graphics.fillRect(0, 0, width, height);

    // Picture
    graphics.fillStyle(color, 1);
    graphics.fillRect(4, 4, width - 8, height - 8);

    // Abstract art
    graphics.fillStyle(0xF39C12, 0.7);
    graphics.fillCircle(width / 2, height / 2, 8);
    graphics.fillStyle(0x3498DB, 0.5);
    graphics.fillRect(width / 4, height / 4, 12, 12);

    graphics.generateTexture(key, width, height);
    graphics.destroy();

    console.log(`✅ Painting created: ${key}`);
  }

  /**
   * Generate all enhanced graphics
   */
  generateAll(): void {
    console.log('🎨 Generating enhanced procedural graphics...');

    // Floor tiles
    this.createFloorTiles();

    // Walls
    this.createWallTile();

    // Furniture
    this.createDesk('desk');
    this.createChair('chair');
    this.createTable('conference-table');
    this.createTable('meeting-table');

    // Decorations
    this.createPlant('plant');
    this.createFilingCabinet('filing-cabinet');
    this.createFilingCabinet('cabinet'); // Legacy name
    this.createWindow('window');
    this.createPainting('painting-red', 0xE74C3C);
    this.createPainting('painting-blue', 0x3498DB);
    this.createPainting('painting-green', 0x27AE60);

    // New furniture types
    this.createBookshelf('bookshelf');
    this.createSofa('sofa');
    this.createWhiteboard('whiteboard');
    this.createMonitor('monitor');

    console.log('✅ All enhanced graphics generated');
  }

  /**
   * Create furniture: Bookshelf
   */
  createBookshelf(key: string = 'bookshelf'): void {
    const width = 64;
    const height = 96;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });

    // Shelf frame
    graphics.fillStyle(0x654321, 1);
    graphics.fillRect(0, 0, width, height);

    // Shelves (5 levels)
    graphics.fillStyle(0x8B4513, 1);
    for (let i = 0; i < 5; i++) {
      const shelfY = i * (height / 5);
      graphics.fillRect(0, shelfY, width, 4);

      // Books on shelves
      graphics.fillStyle(0xE74C3C, 1);
      graphics.fillRect(4, shelfY + 6, 12, 14);
      graphics.fillStyle(0x3498DB, 1);
      graphics.fillRect(18, shelfY + 6, 10, 14);
      graphics.fillStyle(0x27AE60, 1);
      graphics.fillRect(30, shelfY + 6, 14, 14);
      graphics.fillStyle(0xF39C12, 1);
      graphics.fillRect(46, shelfY + 6, 12, 14);
    }

    // Frame border
    graphics.lineStyle(2, 0x3E2A1A, 1);
    graphics.strokeRect(0, 0, width, height);

    graphics.generateTexture(key, width, height);
    graphics.destroy();

    console.log(`✅ Bookshelf created: ${key}`);
  }

  /**
   * Create furniture: Sofa
   */
  createSofa(key: string = 'sofa'): void {
    const width = 96;
    const height = 48;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });

    // Sofa base
    graphics.fillStyle(0x34495E, 1);
    graphics.fillRect(0, 12, width, height - 12);

    // Cushions
    graphics.fillStyle(0x5D6D7E, 1);
    graphics.fillRect(8, 16, 24, 24);
    graphics.fillRect(36, 16, 24, 24);
    graphics.fillRect(64, 16, 24, 24);

    // Armrests
    graphics.fillStyle(0x2C3E50, 1);
    graphics.fillRect(0, 12, 8, height - 8);
    graphics.fillRect(width - 8, 12, 8, height - 8);

    // Back cushions
    graphics.fillStyle(0x45627E, 1);
    graphics.fillRect(8, 0, 24, 16);
    graphics.fillRect(36, 0, 24, 16);
    graphics.fillRect(64, 0, 24, 16);

    graphics.generateTexture(key, width, height);
    graphics.destroy();

    console.log(`✅ Sofa created: ${key}`);
  }

  /**
   * Create furniture: Whiteboard
   */
  createWhiteboard(key: string = 'whiteboard'): void {
    const width = 96;
    const height = 64;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });

    // Board frame
    graphics.fillStyle(0x2C3E50, 1);
    graphics.fillRect(0, 0, width, height);

    // White surface
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillRect(4, 4, width - 8, height - 8);

    // Some marker drawings
    graphics.lineStyle(2, 0x3498DB, 1);
    graphics.lineBetween(12, 16, 40, 16);
    graphics.lineBetween(12, 28, 50, 28);

    graphics.fillStyle(0xE74C3C, 1);
    graphics.fillCircle(70, 20, 8);

    graphics.lineStyle(2, 0x27AE60, 1);
    graphics.strokeRect(60, 36, 24, 16);

    // Marker tray
    graphics.fillStyle(0x7F8C8D, 1);
    graphics.fillRect(width / 2 - 16, height - 8, 32, 6);

    graphics.generateTexture(key, width, height);
    graphics.destroy();

    console.log(`✅ Whiteboard created: ${key}`);
  }

  /**
   * Create furniture: Computer Monitor
   */
  createMonitor(key: string = 'monitor'): void {
    const width = 32;
    const height = 32;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });

    // Monitor stand
    graphics.fillStyle(0x2C3E50, 1);
    graphics.fillRect(12, 24, 8, 6);
    graphics.fillRect(8, 28, 16, 4);

    // Monitor frame
    graphics.fillStyle(0x1C2833, 1);
    graphics.fillRect(4, 4, 24, 22);

    // Screen
    graphics.fillStyle(0x1F618D, 1);
    graphics.fillRect(6, 6, 20, 18);

    // Screen content (gradient)
    graphics.fillStyle(0x3498DB, 0.6);
    graphics.fillRect(8, 8, 16, 6);

    // Power light
    graphics.fillStyle(0x27AE60, 1);
    graphics.fillCircle(width / 2, 26, 1);

    graphics.generateTexture(key, width, height);
    graphics.destroy();

    console.log(`✅ Monitor created: ${key}`);
  }
}
