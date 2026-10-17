import Phaser from 'phaser';
import { CONFIG, PLAYERS } from '../config.js';
import townUrl from '../../assets/tiny_town.png';
import flowersUrl from '../../assets/flowers.png';
import zombieUrl from '../../assets/zombie_walk.png';

// Sprite cac nhan vat player: assets/player_<id>_idle.png, _run.png, _shoot.png (id = le33m, quang, tim, conal, quytu)
const PLAYER_FILES = import.meta.glob('../../assets/player_*_*.png', { eager: true, query: '?url', import: 'default' });
const playerKey = (path) => path.match(/player_([a-z0-9]+)_(idle|run|shoot).png$/)?.slice(1, 3).join('_');

// Tat ca sprite NPC trong assets/ ten dang npc01_idle.png, npc01_receive.png, npc01_complete.png ... (khung 48x48, xep ngang)
const NPC_FILES = import.meta.glob('../../assets/npc*_*.png', { eager: true, query: '?url', import: 'default' });
// receive keo dai dung 3 giay (duration), cac anim khac theo frameRate
const NPC_ANIMS = { idle: { frameRate: 2, repeat: -1 }, receive: { duration: 3000, repeat: 0 }, complete: { frameRate: 5, repeat: 0 } };
const npcKey = (path) => path.match(/(npc\d\d_(?:idle|receive|complete))\.png$/)?.[1];

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    const frame = { frameWidth: 48, frameHeight: 48 };
    for (const [path, url] of Object.entries(PLAYER_FILES)) {
      const key = playerKey(path);
      if (key) this.load.spritesheet(key, url, frame);
    }
    this.load.spritesheet('zombie_walk', zombieUrl, frame);
    for (const [path, url] of Object.entries(NPC_FILES)) {
      const key = npcKey(path);
      if (key) this.load.spritesheet(key, url, frame);
    }
    this.load.spritesheet('town', townUrl, { frameWidth: 16, frameHeight: 16 }); // Kenney Tiny Town (CC0)
    this.load.spritesheet('flowers', flowersUrl, frame); // 5 bong hoa tu ve, tools/make-flowers.mjs
  }


  // Cay 16x32 ghep tu 2 o: o tren (tan) + o duoi (than)
  makeTexture(key, topFrame, bottomFrame) {
    const tex = this.textures.createCanvas(key, 16, 32);
    const ctx = tex.getContext();
    [topFrame, bottomFrame].forEach((id, i) => {
      const fr = this.textures.getFrame('town', id);
      ctx.drawImage(fr.source.image, fr.cutX, fr.cutY, 16, 16, 0, i * 16, 16, 16);
    });
    tex.refresh();
  }

  // Nen vuon: tam anh 1024x1024 xep ngau nhien tu 3 o co (phan lon la co tron), phong 2 lan
  makeGround() {
    const size = 1024;
    const scale = 2;
    const tex = this.textures.createCanvas('ground', size, size);
    const ctx = tex.getContext();
    ctx.imageSmoothingEnabled = false;
    for (let y = 0; y < size; y += 16 * scale) {
      for (let x = 0; x < size; x += 16 * scale) {
        const r = Math.random();
        const fr = this.textures.getFrame('town', r < 0.9 ? 0 : r < 0.96 ? 1 : 2);
        ctx.drawImage(fr.source.image, fr.cutX, fr.cutY, 16, 16, x, y, 16 * scale, 16 * scale);
      }
    }
    tex.refresh();
  }

  create() {
    const make = (key, sheet, frameRate, repeat) =>
      this.anims.create({ key, frames: this.anims.generateFrameNumbers(sheet), frameRate, repeat });

    // Moi anim player co 5 goc nhin (game lat trai/phai de du 8 huong): side (ngang), front (thang mat),
    // back (quay lung), dfront (cheo xuong), dback (cheo len). Thu tu trung voi tools/make-player.mjs
    const range = (key, sheet, start, end, frameRate) =>
      this.anims.create({ key, frames: this.anims.generateFrameNumbers(sheet, { start, end }), frameRate, repeat: -1 });
    // Anim co tien to id nhan vat, vi du le33m_idle_side, le33m_run_front, le33m_shoot_E
    for (const id of PLAYERS.map((pl) => pl.id)) {
      ['side', 'front', 'back', 'dfront', 'dback'].forEach((view, i) => {
        range(`${id}_idle_${view}`, `${id}_idle`, i * 2, i * 2 + 1, 3);
        range(`${id}_run_${view}`, `${id}_run`, i * 4, i * 4 + 3, 10);
      });
      // Ban: moi huong sung 2 khung (ngam + giat). Huong trai la lat cua huong phai.
      ['E', 'SE', 'NE', 'S', 'N'].forEach((key, i) => {
        range(`${id}_shoot_${key}`, `${id}_shoot`, i * 2, i * 2 + 1, 2000 / CONFIG.FIRE_INTERVAL);
      });
    }
    make('zombie_walk', 'zombie_walk', 6, -1);
    for (const path of Object.keys(NPC_FILES)) {
      const key = npcKey(path);
      if (!key) continue;
      const { repeat, ...timing } = NPC_ANIMS[key.split('_')[1]];
      this.anims.create({ key, frames: this.anims.generateFrameNumbers(key), repeat, ...timing });
    }

    this.makeGround();
    this.makeTexture('tree_green', 4, 16);
    this.makeTexture('tree_orange', 3, 15);

    this.scene.start('MenuScene');
  }
}
