import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-canvas',
  backgroundColor: '#2d3748',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: true, // Enable to see physics bodies and troubleshoot
    },
  },
  scene: [MainScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    pixelArt: true,  // Enable crisp pixel art rendering for tilesets
    antialias: false,
    roundPixels: true,
  },
};
