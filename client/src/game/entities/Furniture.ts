import Phaser from 'phaser';
import { Furniture as FurnitureData } from '@mini-gather/shared';

export class Furniture extends Phaser.GameObjects.Sprite {
  private furnitureData: FurnitureData;

  constructor(scene: Phaser.Scene, data: FurnitureData) {
    // Determine texture key based on type
    const textureKey = Furniture.getTextureKey(data.type);

    super(scene, data.x, data.y, textureKey);

    this.furnitureData = data;

    // Set origin to center
    this.setOrigin(0.5);

    // Apply rotation if specified
    if (data.rotation) {
      this.setRotation(data.rotation);
    }

    // Set depth for layering (furniture above floor, below players)
    this.setDepth(5);

    // Add to scene
    scene.add.existing(this);

    // Setup physics if collidable
    if (data.collidable) {
      this.setupCollision(scene);
    }
  }

  private setupCollision(scene: Phaser.Scene): void {
    // Enable physics
    scene.physics.world.enable(this);

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Make it immovable (static collision)
    body.setImmovable(true);

    // Set collision box to match furniture size
    body.setSize(this.furnitureData.width, this.furnitureData.height);

    // Adjust body offset to center
    body.setOffset(
      -this.furnitureData.width / 2,
      -this.furnitureData.height / 2
    );
  }

  /**
   * Get texture key based on furniture type
   */
  private static getTextureKey(type: FurnitureData['type']): string {
    const textureMap: Record<FurnitureData['type'], string> = {
      desk: 'desk',
      table: 'conference-table',
      chair: 'chair',
      bookshelf: 'bookshelf',
      plant: 'plant',
      computer: 'monitor',
      cabinet: 'cabinet',
      sofa: 'sofa',
      'filing-cabinet': 'filing-cabinet',
    };

    return textureMap[type] || 'desk';
  }

  /**
   * Get furniture data
   */
  getData(): FurnitureData {
    return this.furnitureData;
  }

  /**
   * Update furniture position
   */
  updatePosition(x: number, y: number): void {
    this.setPosition(x, y);
    this.furnitureData.x = x;
    this.furnitureData.y = y;
  }
}
