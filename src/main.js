import Phaser from 'phaser';
import { CONFIG } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: CONFIG.GAME_WIDTH * CONFIG.RENDER_SCALE,
  height: CONFIG.GAME_HEIGHT * CONFIG.RENDER_SCALE,
  backgroundColor: '#2d5a27',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
  },
  scene: [BootScene, MenuScene, GameScene],
});

// Canvas lon hon man hinh nen bi thu nho: dung loc muot cua trinh duyet (pixelArt mac dinh dung nearest lam chu vo hat)
game.events.once(Phaser.Core.Events.READY, () => {
  game.canvas.style.imageRendering = 'auto';
});
