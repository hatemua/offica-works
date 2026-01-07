import Phaser from 'phaser';
import { Direction } from '@mini-gather/shared';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public playerId: string;
  public username: string;
  public nameText: Phaser.GameObjects.Text;
  public direction: Direction = Direction.DOWN;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    playerId: string,
    username: string,
    avatar: string
  ) {
    // Debug: Check if texture exists before creating sprite
    console.log(`🔍 Player constructor - avatar: ${avatar}, texture exists: ${scene.textures.exists(avatar)}`);

    if (!scene.textures.exists(avatar)) {
      console.error(`❌ CRITICAL ERROR: Avatar texture "${avatar}" does NOT exist!`);
      console.log(`📋 Available textures:`, scene.textures.getTextureKeys().slice(0, 20));
    }

    super(scene, x, y, avatar);

    this.playerId = playerId;
    this.username = username;

    // Debug sprite state
    console.log(`🔍 Sprite created: visible=${this.visible}, alpha=${this.alpha}, texture=${this.texture.key}, frame=${this.frame.name}`);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Setup player properties - ENSURE VISIBILITY
    this.setScale(1.2); // Slightly larger for better visibility
    this.setDepth(1000); // Render above all tilemap layers (which are depth 0-100)
    this.setVisible(true); // Explicitly set visible
    this.setAlpha(1); // Explicitly set full opacity
    this.setActive(true); // Ensure sprite is active

    // Debug after setup
    console.log(`🔍 After setup: scale=${this.scale}, depth=${this.depth}, x=${this.x}, y=${this.y}, visible=${this.visible}, alpha=${this.alpha}`);

    // Add collision body
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setCollideWorldBounds(true);
      body.setSize(28, 28);
      body.setOffset(2, 4);
    }

    // Add name text
    this.nameText = scene.add.text(x, y - 35, username, {
      fontSize: '13px',
      color: '#ffffff',
      backgroundColor: '#00000090',
      padding: { x: 5, y: 3 },
    });
    this.nameText.setOrigin(0.5);
    this.nameText.setDepth(1001); // Above player

    console.log(`👤 Player fully created: ${username} with avatar: ${avatar} at (${x}, ${y}), depth: ${this.depth}`);

    // Create animations if they don't exist
    this.createAnimations();

    // Set initial frame and play idle animation
    console.log(`🎬 Setting initial frame and playing idle animation for ${avatar}...`);

    try {
      // Frame 1 is idle facing down (middle frame of first row)
      this.setFrame(1);

      // Play idle animation
      if (scene.anims.exists(`${avatar}-idle-down`)) {
        this.play(`${avatar}-idle-down`, true);
        console.log(`✅ Playing animation: ${this.anims.currentAnim?.key}, frame: ${this.frame.name}`);
      } else {
        console.warn(`⚠️ Animation ${avatar}-idle-down not found, using frame 1`);
      }
    } catch (error) {
      console.error(`❌ Error setting initial animation:`, error);
    }
  }

  private createAnimations() {
    const scene = this.scene;
    const avatar = this.texture.key;

    console.log(`🎬 Creating animations for avatar: ${avatar}`);

    // Only create if not already created
    if (!scene.anims.exists(`${avatar}-walk-down`)) {
      // Sprite sheet layout: 4 rows × 3 columns
      // Row 0: down, Row 1: left, Row 2: right, Row 3: up
      // Each row has 3 frames for walk animation

      // Walk down (row 0, frames 0-2)
      scene.anims.create({
        key: `${avatar}-walk-down`,
        frames: scene.anims.generateFrameNumbers(avatar, { start: 0, end: 2 }),
        frameRate: 8,
        repeat: -1,
      });

      // Walk left (row 1, frames 3-5)
      scene.anims.create({
        key: `${avatar}-walk-left`,
        frames: scene.anims.generateFrameNumbers(avatar, { start: 3, end: 5 }),
        frameRate: 8,
        repeat: -1,
      });

      // Walk right (row 2, frames 6-8)
      scene.anims.create({
        key: `${avatar}-walk-right`,
        frames: scene.anims.generateFrameNumbers(avatar, { start: 6, end: 8 }),
        frameRate: 8,
        repeat: -1,
      });

      // Walk up (row 3, frames 9-11)
      scene.anims.create({
        key: `${avatar}-walk-up`,
        frames: scene.anims.generateFrameNumbers(avatar, { start: 9, end: 11 }),
        frameRate: 8,
        repeat: -1,
      });

      // Idle animations (middle frame of each direction)
      scene.anims.create({
        key: `${avatar}-idle-down`,
        frames: [{ key: avatar, frame: 1 }],
        frameRate: 1,
      });

      scene.anims.create({
        key: `${avatar}-idle-left`,
        frames: [{ key: avatar, frame: 4 }],
        frameRate: 1,
      });

      scene.anims.create({
        key: `${avatar}-idle-right`,
        frames: [{ key: avatar, frame: 7 }],
        frameRate: 1,
      });

      scene.anims.create({
        key: `${avatar}-idle-up`,
        frames: [{ key: avatar, frame: 10 }],
        frameRate: 1,
      });

      // Generic idle (facing down)
      scene.anims.create({
        key: `${avatar}-idle`,
        frames: [{ key: avatar, frame: 1 }],
        frameRate: 1,
      });
    }
  }

  updatePosition(x: number, y: number, isMoving: boolean, direction: Direction) {
    // Smooth interpolation
    this.setPosition(
      Phaser.Math.Linear(this.x, x, 0.2),
      Phaser.Math.Linear(this.y, y, 0.2)
    );

    this.direction = direction;

    // Update animation
    const avatar = this.texture.key;
    if (isMoving) {
      this.play(`${avatar}-walk-${direction}`, true);
    } else {
      // Use direction-specific idle animation if it exists
      const idleAnim = `${avatar}-idle-${direction}`;
      if (this.scene.anims.exists(idleAnim)) {
        this.play(idleAnim, true);
      } else {
        this.play(`${avatar}-idle`, true);
      }
    }

    // Update name position
    this.nameText.setPosition(this.x, this.y - 30);
  }

  destroy(fromScene?: boolean) {
    this.nameText.destroy();
    super.destroy(fromScene);
  }
}
