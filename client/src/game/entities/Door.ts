import Phaser from 'phaser';
import { Door as DoorData, DoorState, DOOR_STATES, GAME_CONFIG } from '@mini-gather/shared';

export class Door extends Phaser.GameObjects.Container {
  private doorData: DoorData;
  private doorSprite!: Phaser.GameObjects.Rectangle;
  private doorFrame!: Phaser.GameObjects.Rectangle;
  private lockIcon?: Phaser.GameObjects.Text;
  private interactionHint?: Phaser.GameObjects.Text;
  private isPlayerNear: boolean = false;

  constructor(scene: Phaser.Scene, doorData: DoorData) {
    super(scene, doorData.x, doorData.y);
    this.doorData = doorData;

    // Create door visual
    this.createDoorVisual();

    // Add to scene
    scene.add.existing(this);

    // Setup physics if needed
    this.setupPhysics();
  }

  private createDoorVisual(): void {
    const { width, height, state } = this.doorData;

    // Door frame (thicker, more visible)
    this.doorFrame = this.scene.add.rectangle(
      0,
      0,
      width,
      height,
      0x654321, // Dark brown wood
      1
    );
    this.doorFrame.setStrokeStyle(3, 0x3E2A1A);
    this.add(this.doorFrame);

    // Door body (changes based on state)
    const doorColor = this.getDoorColor(state);
    this.doorSprite = this.scene.add.rectangle(
      0,
      0,
      width - 8,
      height - 8,
      doorColor,
      state === DOOR_STATES.OPEN ? 0.4 : 1.0
    );
    this.add(this.doorSprite);

    // Add door panels (decorative lines)
    if (state !== DOOR_STATES.OPEN) {
      const panel1 = this.scene.add.rectangle(0, -height / 4, width - 12, 2, 0x8B6914, 0.5);
      const panel2 = this.scene.add.rectangle(0, height / 4, width - 12, 2, 0x8B6914, 0.5);
      this.add(panel1);
      this.add(panel2);
    }

    // Door handle/knob
    const knob = this.scene.add.circle(width / 3, 0, 4, 0xC0C0C0, 1);
    knob.setStrokeStyle(1, 0x808080);
    this.add(knob);

    // Lock icon for locked doors
    if (state === DOOR_STATES.LOCKED) {
      this.lockIcon = this.scene.add.text(0, 0, '🔒', {
        fontSize: '24px',
        align: 'center',
      });
      this.lockIcon.setOrigin(0.5);
      this.add(this.lockIcon);
    }
  }

  private getDoorColor(state: DoorState): number {
    switch (state) {
      case DOOR_STATES.OPEN:
        return 0xA0D890; // Pale green (more subtle)
      case DOOR_STATES.CLOSED:
        return 0x8B5A3C; // Rich brown wood
      case DOOR_STATES.LOCKED:
        return 0xB85450; // Muted red
      default:
        return 0x8B5A3C; // Rich brown wood
    }
  }

  private setupPhysics(): void {
    // Add physics body for collision detection
    this.scene.physics.world.enable(this);
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.doorData.state === DOOR_STATES.OPEN) {
      body.setEnable(false); // No collision when open
    } else {
      body.setImmovable(true);
      body.setSize(this.doorData.width, this.doorData.height);
    }
  }

  public updateState(newState: DoorState): void {
    this.doorData.state = newState;

    // Update visual
    this.doorSprite.setFillStyle(this.getDoorColor(newState), newState === DOOR_STATES.OPEN ? 0.4 : 1.0);

    // Update collision
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (newState === DOOR_STATES.OPEN) {
      body.setEnable(false);
    } else {
      body.setEnable(true);
    }

    // Update lock icon
    if (newState === DOOR_STATES.LOCKED && !this.lockIcon) {
      this.lockIcon = this.scene.add.text(0, 0, '🔒', {
        fontSize: '24px',
        align: 'center',
      });
      this.lockIcon.setOrigin(0.5);
      this.add(this.lockIcon);
    } else if (newState !== DOOR_STATES.LOCKED && this.lockIcon) {
      this.lockIcon.destroy();
      this.lockIcon = undefined;
    }
  }

  public checkPlayerProximity(playerX: number, playerY: number): boolean {
    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      playerX,
      playerY
    );

    const wasNear = this.isPlayerNear;
    this.isPlayerNear = distance <= GAME_CONFIG.DOOR_INTERACTION_DISTANCE;

    // Show/hide interaction hint
    if (this.isPlayerNear && !wasNear) {
      this.showInteractionHint();
    } else if (!this.isPlayerNear && wasNear) {
      this.hideInteractionHint();
    }

    return this.isPlayerNear;
  }

  private showInteractionHint(): void {
    const hintText = this.doorData.state === DOOR_STATES.LOCKED
      ? 'Locked'
      : 'Press E to ' + (this.doorData.state === DOOR_STATES.OPEN ? 'close' : 'open');

    this.interactionHint = this.scene.add.text(0, -this.doorData.height / 2 - 20, hintText, {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 },
    });
    this.interactionHint.setOrigin(0.5);
    this.add(this.interactionHint);
  }

  private hideInteractionHint(): void {
    if (this.interactionHint) {
      this.interactionHint.destroy();
      this.interactionHint = undefined;
    }
  }

  public canInteract(): boolean {
    return this.isPlayerNear && this.doorData.state !== DOOR_STATES.LOCKED;
  }

  public getDoorId(): string {
    return this.doorData.id;
  }

  public getDoorState(): DoorState {
    return this.doorData.state;
  }

  public getRoomId(): string {
    return this.doorData.roomId;
  }

  public destroy(): void {
    this.hideInteractionHint();
    if (this.lockIcon) {
      this.lockIcon.destroy();
    }
    super.destroy();
  }
}
