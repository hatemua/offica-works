import Phaser from 'phaser';
import { Door as DoorData, DoorState, DOOR_STATES, GAME_CONFIG } from '@mini-gather/shared';

export class Door extends Phaser.GameObjects.Container {
  private doorData: DoorData;
  private doorSprite: Phaser.GameObjects.Rectangle;
  private doorFrame: Phaser.GameObjects.Rectangle;
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

    // Door frame (always visible)
    this.doorFrame = this.scene.add.rectangle(
      0,
      0,
      width,
      height,
      0x8B4513, // Brown wood color
      1
    );
    this.doorFrame.setStrokeStyle(2, 0x654321);
    this.add(this.doorFrame);

    // Door body (changes based on state)
    const doorColor = this.getDoorColor(state);
    this.doorSprite = this.scene.add.rectangle(
      0,
      0,
      width - 4,
      height - 4,
      doorColor,
      state === DOOR_STATES.OPEN ? 0.3 : 0.9
    );
    this.add(this.doorSprite);

    // Lock icon for locked doors
    if (state === DOOR_STATES.LOCKED) {
      this.lockIcon = this.scene.add.text(0, 0, '🔒', {
        fontSize: '20px',
        align: 'center',
      });
      this.lockIcon.setOrigin(0.5);
      this.add(this.lockIcon);
    }
  }

  private getDoorColor(state: DoorState): number {
    switch (state) {
      case DOOR_STATES.OPEN:
        return 0x90EE90; // Light green
      case DOOR_STATES.CLOSED:
        return 0xD2691E; // Chocolate brown
      case DOOR_STATES.LOCKED:
        return 0xCD5C5C; // Indian red
      default:
        return 0x8B4513; // Saddle brown
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
    this.doorSprite.setFillStyle(this.getDoorColor(newState), newState === DOOR_STATES.OPEN ? 0.3 : 0.9);

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
        fontSize: '20px',
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
