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
   * Create enhanced floor tiles with realistic textures
   */
  createFloorTiles(): void {
    const size = this.tileSize;

    // Realistic Wood Planks (horizontal grain)
    const woodGraphics = this.scene.make.graphics({ x: 0, y: 0 });
    woodGraphics.fillStyle(0xC19A6B, 1); // Light wood color
    woodGraphics.fillRect(0, 0, size, size);

    // Wood planks (3 planks per tile)
    const plankHeight = size / 3;
    for (let i = 0; i < 3; i++) {
      const y = i * plankHeight;
      // Plank variation
      const shade = [0xD4A574, 0xC19A6B, 0xB8936A][i];
      woodGraphics.fillStyle(shade, 1);
      woodGraphics.fillRect(0, y, size, plankHeight);

      // Wood grain lines (horizontal)
      woodGraphics.lineStyle(0.5, 0x8B6F47, 0.3);
      for (let j = 0; j < 3; j++) {
        woodGraphics.lineBetween(0, y + (j + 1) * (plankHeight / 4), size, y + (j + 1) * (plankHeight / 4));
      }

      // Plank border
      woodGraphics.lineStyle(1, 0x8B6F47, 0.6);
      woodGraphics.lineBetween(0, y + plankHeight, size, y + plankHeight);
    }
    woodGraphics.generateTexture('floor-wood', size, size);
    woodGraphics.destroy();

    // Carpet Floor (textured)
    const carpetGraphics = this.scene.make.graphics({ x: 0, y: 0 });
    carpetGraphics.fillStyle(0xB85C5C, 1); // Warm carpet color
    carpetGraphics.fillRect(0, 0, size, size);
    // Carpet texture (small dots pattern)
    for (let x = 0; x < size; x += 4) {
      for (let y = 0; y < size; y += 4) {
        carpetGraphics.fillStyle(0xA84848, 0.3);
        carpetGraphics.fillCircle(x + 2, y + 2, 1);
      }
    }
    carpetGraphics.generateTexture('floor-carpet', size, size);
    carpetGraphics.destroy();

    // Tile Floor (kitchen/bathroom style with grout)
    const tileGraphics = this.scene.make.graphics({ x: 0, y: 0 });
    tileGraphics.fillStyle(0xE8E8E8, 1); // Light gray tile
    tileGraphics.fillRect(0, 0, size, size);
    // Grout lines
    tileGraphics.lineStyle(2, 0xC0C0C0, 1);
    tileGraphics.strokeRect(1, 1, size - 2, size - 2);
    // Subtle shine
    tileGraphics.fillStyle(0xFFFFFF, 0.2);
    tileGraphics.fillRect(2, 2, size / 3, size / 3);
    tileGraphics.generateTexture('floor-tile', size, size);
    tileGraphics.destroy();

    // Chevron/Zigzag Floor (for silent zone - like in reference)
    const chevronGraphics = this.scene.make.graphics({ x: 0, y: 0 });
    chevronGraphics.fillStyle(0xF5F5F5, 1); // White/light gray base
    chevronGraphics.fillRect(0, 0, size, size);
    // Chevron pattern
    chevronGraphics.fillStyle(0xE0E0E0, 1);
    chevronGraphics.beginPath();
    chevronGraphics.moveTo(0, size / 2);
    chevronGraphics.lineTo(size / 2, 0);
    chevronGraphics.lineTo(size, size / 2);
    chevronGraphics.lineTo(size / 2, size);
    chevronGraphics.closePath();
    chevronGraphics.fillPath();
    chevronGraphics.generateTexture('floor-chevron', size, size);
    chevronGraphics.destroy();

    // Grass Floor (for outdoor areas)
    const grassGraphics = this.scene.make.graphics({ x: 0, y: 0 });
    grassGraphics.fillStyle(0x7CB342, 1); // Grass green
    grassGraphics.fillRect(0, 0, size, size);
    // Grass texture (random small strokes)
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      grassGraphics.fillStyle(0x689F38, 0.4);
      grassGraphics.fillRect(x, y, 2, 3);
      grassGraphics.fillStyle(0x8BC34A, 0.3);
      grassGraphics.fillRect(x + 1, y + 1, 1, 2);
    }
    grassGraphics.generateTexture('floor-grass', size, size);
    grassGraphics.destroy();

    // Water/Pond tile
    const waterGraphics = this.scene.make.graphics({ x: 0, y: 0 });
    waterGraphics.fillStyle(0x4FC3F7, 1); // Light blue water
    waterGraphics.fillRect(0, 0, size, size);
    // Water ripples
    waterGraphics.fillStyle(0x81D4FA, 0.4);
    waterGraphics.fillCircle(size / 3, size / 3, size / 4);
    waterGraphics.fillStyle(0x29B6F6, 0.3);
    waterGraphics.fillCircle(2 * size / 3, 2 * size / 3, size / 5);
    waterGraphics.generateTexture('floor-water', size, size);
    waterGraphics.destroy();

    console.log('✅ Enhanced floor tiles created (wood, carpet, tile, chevron, grass, water)');
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
   * Create glass wall tile (semi-transparent for meeting rooms)
   */
  createGlassWall(): void {
    const size = this.tileSize;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });

    // Glass pane (semi-transparent blue)
    graphics.fillStyle(0x87CEEB, 0.3);
    graphics.fillRect(0, 0, size, size);

    // Window frame
    graphics.lineStyle(3, 0x2C3E50, 1);
    graphics.strokeRect(0, 0, size, size);

    // Glass reflection/highlight
    graphics.fillStyle(0xFFFFFF, 0.4);
    graphics.fillRect(2, 2, size / 4, size / 3);

    graphics.generateTexture('wall-glass', size, size);
    graphics.destroy();

    console.log('✅ Glass wall created');
  }

  /**
   * Create outdoor tree
   */
  createTree(): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    const width = 48;
    const height = 64;

    // Tree trunk
    graphics.fillStyle(0x5D4037, 1);
    graphics.fillRect(width / 2 - 6, height - 24, 12, 24);

    // Foliage (layered circles for depth)
    graphics.fillStyle(0x43A047, 1);
    graphics.fillCircle(width / 2, height - 32, 20);
    graphics.fillStyle(0x66BB6A, 1);
    graphics.fillCircle(width / 2 - 8, height - 28, 16);
    graphics.fillCircle(width / 2 + 8, height - 28, 16);
    graphics.fillStyle(0x81C784, 0.8);
    graphics.fillCircle(width / 2, height - 40, 14);

    graphics.generateTexture('tree', width, height);
    graphics.destroy();

    console.log('✅ Tree created');
  }

  /**
   * Create bush/shrub
   */
  createBush(): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    const width = 32;
    const height = 24;

    // Bush (clustered circles)
    graphics.fillStyle(0x66BB6A, 1);
    graphics.fillCircle(width / 2, height / 2, 10);
    graphics.fillCircle(width / 2 - 8, height / 2 + 4, 8);
    graphics.fillCircle(width / 2 + 8, height / 2 + 4, 8);
    graphics.fillStyle(0x81C784, 0.6);
    graphics.fillCircle(width / 2, height / 2 - 4, 6);

    graphics.generateTexture('bush', width, height);
    graphics.destroy();

    console.log('✅ Bush created');
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
    this.createGlassWall();

    // Outdoor elements
    this.createTree();
    this.createBush();

    // Basic furniture
    this.createDesk('desk');
    this.createChair('chair');
    this.createTable('conference-table');
    this.createTable('meeting-table');

    // Office furniture
    this.createBookshelf('bookshelf');
    this.createFilingCabinet('filing-cabinet');
    this.createFilingCabinet('cabinet'); // Legacy name
    this.createMonitor('monitor');

    // Lounge furniture
    this.createSofa('sofa');
    this.createBeanBag('beanbag');
    this.createCoffeeTable('coffee-table');

    // Kitchen furniture
    this.createFridge('fridge');
    this.createCounter('counter');
    this.createDiningTable('dining-table');

    // Meeting room furniture
    this.createWhiteboard('whiteboard');
    this.createTV('tv');

    // Decorations
    this.createPlant('plant');
    this.createWindow('window');
    this.createPainting('painting-red', 0xE74C3C);
    this.createPainting('painting-blue', 0x3498DB);
    this.createPainting('painting-green', 0x27AE60);

    console.log('✅ All enhanced graphics generated (floors, walls, furniture, outdoor)');
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

  /**
   * Create furniture: Bean Bag (like in reference image)
   */
  createBeanBag(key: string = 'beanbag'): void {
    const width = 48;
    const height = 48;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });

    // Bean bag base (round, soft looking)
    graphics.fillStyle(0x66BB6A, 1); // Green color like reference
    graphics.fillEllipse(width / 2, height / 2 + 4, width / 2 - 4, height / 2 - 4);

    // Shading for 3D effect
    graphics.fillStyle(0x43A047, 0.5);
    graphics.fillEllipse(width / 2, height / 2 - 4, width / 2 - 8, height / 2 - 8);

    // Highlight
    graphics.fillStyle(0x81C784, 0.6);
    graphics.fillEllipse(width / 2 - 6, height / 2 - 8, 10, 8);

    graphics.generateTexture(key, width, height);
    graphics.destroy();

    console.log(`✅ Bean bag created: ${key}`);
  }

  /**
   * Create kitchen appliance: Refrigerator
   */
  createFridge(key: string = 'fridge'): void {
    const width = 64;
    const height = 96;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });

    // Fridge body
    graphics.fillStyle(0xECEFF1, 1); // Light gray/silver
    graphics.fillRect(0, 0, width, height);

    // Fridge doors (split)
    graphics.lineStyle(2, 0x90A4AE, 1);
    graphics.lineBetween(width / 2, 0, width / 2, height);
    graphics.lineBetween(0, height * 0.6, width, height * 0.6);

    // Door handles
    graphics.fillStyle(0x607D8B, 1);
    graphics.fillRect(width / 2 - 12, height * 0.3, 4, 16);
    graphics.fillRect(width / 2 + 8, height * 0.3, 4, 16);
    graphics.fillRect(width / 2 - 12, height * 0.75, 4, 12);
    graphics.fillRect(width / 2 + 8, height * 0.75, 4, 12);

    // Border/shadow
    graphics.lineStyle(3, 0xCFD8DC, 1);
    graphics.strokeRect(0, 0, width, height);

    graphics.generateTexture(key, width, height);
    graphics.destroy();

    console.log(`✅ Fridge created: ${key}`);
  }

  /**
   * Create kitchen: Counter
   */
  createCounter(key: string = 'counter'): void {
    const width = 96;
    const height = 64;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });

    // Counter top (marble/granite effect)
    graphics.fillStyle(0x78909C, 1);
    graphics.fillRect(0, 0, width, height / 3);

    // Counter body (wood cabinets)
    graphics.fillStyle(0x5D4037, 1);
    graphics.fillRect(0, height / 3, width, 2 * height / 3);

    // Cabinet doors
    graphics.lineStyle(2, 0x4E342E, 1);
    graphics.strokeRect(4, height / 3 + 4, width / 2 - 6, 2 * height / 3 - 8);
    graphics.strokeRect(width / 2 + 2, height / 3 + 4, width / 2 - 6, 2 * height / 3 - 8);

    // Cabinet handles
    graphics.fillStyle(0xC0C0C0, 1);
    graphics.fillCircle(width / 4, height / 2, 3);
    graphics.fillCircle(3 * width / 4, height / 2, 3);

    graphics.generateTexture(key, width, height);
    graphics.destroy();

    console.log(`✅ Counter created: ${key}`);
  }

  /**
   * Create dining table (larger than desk)
   */
  createDiningTable(key: string = 'dining-table'): void {
    const width = 128;
    const height = 96;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });

    // Table top (wood)
    graphics.fillStyle(0x8D6E63, 1);
    graphics.fillRect(0, 0, width, height);

    // Wood grain
    graphics.lineStyle(1, 0x6D4C41, 0.3);
    for (let i = 0; i < height; i += 8) {
      graphics.lineBetween(0, i, width, i);
    }

    // Table edge
    graphics.lineStyle(3, 0x5D4037, 1);
    graphics.strokeRect(0, 0, width, height);

    // Table legs (visible corners)
    graphics.fillStyle(0x4E342E, 1);
    graphics.fillRect(4, height - 12, 8, 10);
    graphics.fillRect(width - 12, height - 12, 8, 10);
    graphics.fillRect(4, 2, 8, 10);
    graphics.fillRect(width - 12, 2, 8, 10);

    graphics.generateTexture(key, width, height);
    graphics.destroy();

    console.log(`✅ Dining table created: ${key}`);
  }

  /**
   * Create TV/Screen for meeting rooms
   */
  createTV(key: string = 'tv'): void {
    const width = 96;
    const height = 64;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });

    // TV frame
    graphics.fillStyle(0x212121, 1);
    graphics.fillRect(0, 0, width, height);

    // Screen (dark blue when off)
    graphics.fillStyle(0x1A237E, 1);
    graphics.fillRect(4, 4, width - 8, height - 8);

    // Screen reflection
    graphics.fillStyle(0x3F51B5, 0.3);
    graphics.fillRect(8, 8, width / 3, height / 4);

    // Stand
    graphics.fillStyle(0x424242, 1);
    graphics.fillRect(width / 2 - 12, height - 4, 24, 4);
    graphics.fillRect(width / 2 - 6, height - 12, 12, 12);

    graphics.generateTexture(key, width, height);
    graphics.destroy();

    console.log(`✅ TV created: ${key}`);
  }

  /**
   * Create coffee table (for lounge)
   */
  createCoffeeTable(key: string = 'coffee-table'): void {
    const width = 96;
    const height = 64;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });

    // Table top (glass effect)
    graphics.fillStyle(0xB0BEC5, 0.7);
    graphics.fillRect(0, 0, width, height);

    // Glass reflection
    graphics.fillStyle(0xFFFFFF, 0.4);
    graphics.fillRect(4, 4, width / 3, height / 4);

    // Metal frame
    graphics.lineStyle(4, 0x78909C, 1);
    graphics.strokeRect(0, 0, width, height);

    // Legs (chrome/metal)
    graphics.fillStyle(0x90A4AE, 1);
    graphics.fillRect(6, height - 8, 6, 8);
    graphics.fillRect(width - 12, height - 8, 6, 8);

    graphics.generateTexture(key, width, height);
    graphics.destroy();

    console.log(`✅ Coffee table created: ${key}`);
  }
}
