import Phaser from 'phaser';
import { CONFIG, FLOWER_TYPES, NPC_NAMES, PLAYERS } from '../config.js';
import { ResultScreen } from '../ResultScreen.js';
import { smoothText } from '../textSmooth.js';
import { initAudio, play, startMusic, stopMusic, toggleMute, isMuted } from '../audio.js';
import { AIM, AIM_ANGLES, muzzleOf } from '../playerAim.js';
import { formatTime, fetchTop, formatBoard, submitScore } from '../api.js';

const TEXT_STYLE = { fontFamily: 'monospace', color: '#ffffff', stroke: '#000000', strokeThickness: 3, resolution: CONFIG.RENDER_SCALE };

// Vi tri 2 nut tren bang tam dung (toa do 360x640)
const PAUSE_BTN = { resumeY: 300, menuY: 356 };

// Loai hoa cuoi cung (hong) chi danh rieng cho chi dac biet
const PINK = FLOWER_TYPES.length - 1;

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    smoothText(this);
    initAudio(this.sound);
    startMusic();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, stopMusic);
    const { MAP_WIDTH, MAP_HEIGHT } = CONFIG;

    // Nen co (tao san o BootScene), lap lai khap ban do
    this.add.tileSprite(0, 0, MAP_WIDTH, MAP_HEIGHT, 'ground').setOrigin(0);

    // Vien ban do de nhin ra ranh gioi
    this.add.rectangle(0, 0, MAP_WIDTH, MAP_HEIGHT).setOrigin(0).setStrokeStyle(4, 0x1d3d1a);

    this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // Vong tron cac chi o trung tam ban do (ve mo tren nen)
    this.add.circle(MAP_WIDTH / 2, MAP_HEIGHT / 2, CONFIG.NPC_ZONE_RADIUS).setStrokeStyle(3, 0xffffff, 0.25);

    // Player bat dau o ngay duoi vong tron
    const startY = MAP_HEIGHT / 2 + CONFIG.NPC_ZONE_RADIUS + 140;
    // Nhan vat player da chon o man hinh chinh (luu trong registry), mac dinh nguoi dau tien
    this.charId = this.registry.get('character') ?? PLAYERS[0].id;
    this.player = this.physics.add.sprite(MAP_WIDTH / 2, startY, `${this.charId}_idle`);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(CONFIG.CHARACTER_SCALE);
    this.player.play(`${this.charId}_idle_side`);
    this.facing = 'side'; // side | front | back
    this.aimKey = 'E';
    this.lastShootKey = '';
    // Mui ten chi duong toi bong hoa can gan nhat (chi bat o 2 giai doan cuoi, xem updateGuide)
    this.guideArrow = this.add
      .triangle(0, 0, 0, -13, 26, 0, 0, 13, 0xffffff)
      .setStrokeStyle(4, 0x222222)
      .setDepth(99997)
      .setVisible(false);
    this.doneCount = 0; // so chi da nhan du hoa
    this.pinkUnlocked = false; // hoa hong da mo chua (chi mo khi 17 chi kia xong)
    // Chu Player tren dau de de phan biet voi cac chi
    this.playerLabel = this.add
      .text(0, 0, CONFIG.PLAYER_LABEL, { ...TEXT_STYLE, fontSize: '18px', strokeThickness: 4, color: '#ffee58' })
      .setOrigin(0.5, 1)
      .setDepth(99999);

    this.playerShadow = this.makeShadow(this.player.x, this.player.y);

    // Vong tron mo quanh player the hien tam ban
    this.rangeRing = this.add.circle(0, 0, CONFIG.FIRE_RANGE).setStrokeStyle(2, 0xffffff, 0.3).setDepth(1);

    this.lives = CONFIG.PLAYER_LIVES;
    this.invincibleUntil = 0;
    this.nextSpawn = CONFIG.ZOMBIE_FIRST_SPAWN;
    this.lastShootFrame = 0;
    this.zombies = [];
    this.bullets = [];

    const cam = this.cameras.main;
    cam.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    cam.startFollow(this.player, true, CONFIG.CAMERA_LERP, CONFIG.CAMERA_LERP);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');

    // Can gat ao: cham bat ky dau roi keo
    this.joyBase = this.add.circle(0, 0, CONFIG.JOY_RADIUS, 0xffffff, 0.2).setScrollFactor(0).setDepth(100000).setVisible(false);
    this.joyThumb = this.add.circle(0, 0, 20, 0xffffff, 0.5).setScrollFactor(0).setDepth(100001).setVisible(false);
    this.joyVec = new Phaser.Math.Vector2(0, 0);
    this.joyOrigin = null;

    this.input.on('pointerdown', (p) => {
      const px = p.x / CONFIG.RENDER_SCALE; // toa do cham quy ve he 360x640
      const py = p.y / CONFIG.RENDER_SCALE;
      if (this.paused) {
        this.tapPause(px, py);
        return;
      }
      if (this.result.tap(px, py)) return;
      // Cham vao nut Dung (goc duoi ben trai)
      if (px < 90 && py > CONFIG.GAME_HEIGHT - 40 && !this.finished) {
        this.pause();
        return;
      }
      // Cham vao nut Am thanh thi bat/tat, khong bat dau can gat
      if (px > CONFIG.GAME_WIDTH - 90 && py > CONFIG.GAME_HEIGHT - 40) {
        toggleMute();
        this.refreshSoundBtn();

    // Nut tam dung o goc duoi ben trai + bang "Tam dung"
    this.pauseBtn = this.add
      .text(6, CONFIG.GAME_HEIGHT - 20, 'II Dừng', { ...TEXT_STYLE, fontSize: '13px' })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(100002);
    const ui = (o, depth = 100020) => o.setScrollFactor(0).setDepth(depth).setVisible(false);
    const mid = CONFIG.GAME_WIDTH / 2;
    this.pauseUi = [
      ui(this.add.rectangle(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT, 0x000000, 0.7).setOrigin(0)),
      ui(this.add.text(mid, 230, 'Tạm dừng', { ...TEXT_STYLE, fontSize: '30px' }).setOrigin(0.5), 100021),
      ui(this.add.rectangle(mid, PAUSE_BTN.resumeY, 200, 44, 0x2e7d32).setStrokeStyle(2, 0xffffff)),
      ui(this.add.text(mid, PAUSE_BTN.resumeY, 'Tiếp tục', { ...TEXT_STYLE, fontSize: '18px' }).setOrigin(0.5), 100021),
      ui(this.add.rectangle(mid, PAUSE_BTN.menuY, 200, 44, 0x37618e).setStrokeStyle(2, 0xffffff)),
      ui(this.add.text(mid, PAUSE_BTN.menuY, 'Về màn chính', { ...TEXT_STYLE, fontSize: '18px' }).setOrigin(0.5), 100021),
    ];
        return;
      }
      this.joyOrigin = { x: px, y: py };
      this.joyBase.setPosition(px, py).setVisible(true);
      this.joyThumb.setPosition(px, py).setVisible(true);
    });
    this.input.on('pointermove', (p) => {
      if (this.joyOrigin && p.isDown) this.updateJoystick(p);
    });
    this.input.on('pointerup', () => this.resetJoystick());

    // Hoa, NPC, dong ho
    this.carried = FLOWER_TYPES.map(() => 0);
    this.elapsed = 0;
    this.finished = false;
    this.takenSpots = [{ x: this.player.x, y: this.player.y, dist: 160 }];
    this.spawnNpcs();
    this.spawnFlowers();
    this.spawnDecor();
    this.createHud();


    // Phim P hoac Esc de tam dung / tiep tuc
    this.paused = false;
    const togglePause = () => (this.paused ? this.resume() : this.pause());
    this.input.keyboard.on('keydown-P', togglePause);
    this.input.keyboard.on('keydown-ESC', togglePause);

    // Camera the gioi thu nho de thay ca vong tron cac chi. Giao dien (scrollFactor 0)
    // ve bang camera thu 2 khong zoom, de chu va can gat giu nguyen co.
    cam.setZoom(CONFIG.CAMERA_ZOOM * CONFIG.RENDER_SCALE);
    const RS = CONFIG.RENDER_SCALE;
    this.uiCam = this.cameras.add(0, 0, CONFIG.GAME_WIDTH * RS, CONFIG.GAME_HEIGHT * RS);
    this.uiCam.setZoom(RS).setOrigin(0, 0); // giao dien (scrollFactor 0) phong gap doi tu goc tren trai
    const all = this.children.list;
    cam.ignore(all.filter((o) => o.scrollFactorX === 0));
    this.uiCam.ignore(all.filter((o) => o.scrollFactorX !== 0));

    // Vat the the gioi tao ra sau nay (zombie, dan...) cung khong ve tren camera giao dien
    const ignoreOnUiCam = (obj) => this.uiCam.ignore(obj);
    this.events.on(Phaser.Scenes.Events.ADDED_TO_SCENE, ignoreOnUiCam);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.events.off(Phaser.Scenes.Events.ADDED_TO_SCENE, ignoreOnUiCam));
  }

  // ---------- Dat vi tri ngau nhien tren ban do ----------

  // inZone = true: chon trong vong tron trung tam, nguoc lai chon tren toan ban do
  pickSpot(minDist, inZone = false) {
    const m = CONFIG.MAP_MARGIN;
    let spot;
    for (let i = 0; i < 300; i++) {
      if (inZone) {
        const angle = Math.random() * Math.PI * 2;
        const r = (CONFIG.NPC_ZONE_RADIUS - 30) * Math.sqrt(Math.random());
        spot = { x: CONFIG.MAP_WIDTH / 2 + Math.cos(angle) * r, y: CONFIG.MAP_HEIGHT / 2 + Math.sin(angle) * r };
      } else {
        spot = { x: Phaser.Math.Between(m, CONFIG.MAP_WIDTH - m), y: Phaser.Math.Between(m, CONFIG.MAP_HEIGHT - m) };
        // Ngoai vong tron cac chi: khong dat hoa vao trong vong
        const inRing = Phaser.Math.Distance.Between(spot.x, spot.y, CONFIG.MAP_WIDTH / 2, CONFIG.MAP_HEIGHT / 2) < CONFIG.NPC_ZONE_RADIUS + 40;
        if (inRing) continue;
      }
      const ok = this.takenSpots.every((t) => Phaser.Math.Distance.Between(spot.x, spot.y, t.x, t.y) >= Math.max(minDist, t.dist));
      if (ok) break;
    }
    this.takenSpots.push({ ...spot, dist: 0 });
    return spot;
  }

  // ---------- NPC ----------

  spawnNpcs() {
    this.npcs = [];
    // Chi dac biet luon o tam ban do, giu cho trong de cac chi khac khong dung de len
    const center = { x: CONFIG.MAP_WIDTH / 2, y: CONFIG.MAP_HEIGHT / 2 };
    this.takenSpots.push({ ...center, dist: CONFIG.NPC_MIN_SPACING });
    for (let i = 0; i < CONFIG.NPC_COUNT; i++) {
      const special = i === CONFIG.NPC_COUNT - 1;
      const { x, y } = special ? center : this.pickSpot(CONFIG.NPC_MIN_SPACING, true);
      // Chi dac biet dung loai hoa cuoi (hong), cac chi con lai chia deu cac loai con lai
      const flower = special ? FLOWER_TYPES.length - 1 : i % (FLOWER_TYPES.length - 1);
      const color = FLOWER_TYPES[flower].color;

      // Sprite NPC: assets/npc01_idle.png ... (so thu tu 01 den 18). Chua co sprite thi dung hinh khoi tam
      const key = `npc${String(i + 1).padStart(2, '0')}`;
      const hasSprite = this.textures.exists(`${key}_idle`);

      let visual;
      if (hasSprite) {
        visual = this.add.sprite(x, y, `${key}_idle`).setOrigin(0.5, 40 / 48).play(`${key}_idle`);
      } else {
        // Hinh khoi tam thoi cho den khi co sprite that: than mau hoa + dau tron
        visual = this.add.container(x, y, [
          this.add.rectangle(0, -9, 16, 18, color).setStrokeStyle(2, 0x222222),
          this.add.circle(0, -25, 8, 0xffd9b3).setStrokeStyle(2, 0x222222),
        ]);
      }
      visual.setScale(CONFIG.CHARACTER_SCALE).setDepth(y);

      // Icon hoa nam tren dau chi; cao them nua chieu cao icon de khong de len mat
      const iconY = y - (hasSprite ? 54 : 46) * CONFIG.CHARACTER_SCALE - 8 * CONFIG.FLOWER_ICON_SCALE - 22; // 22px chua cho dong ten ben duoi icon
      const icon = this.add.container(x, iconY, [
        this.add.sprite(0, 0, 'flowers', FLOWER_TYPES[flower].frame).setScale(CONFIG.FLOWER_ICON_SCALE),
        this.add.text(8 * CONFIG.FLOWER_ICON_SCALE + 4, 0, '', { ...TEXT_STYLE, fontSize: '14px' }).setOrigin(0, 0.5),
        this.add.text(0, 8 * CONFIG.FLOWER_ICON_SCALE + 10, NPC_NAMES[i] ?? '', { ...TEXT_STYLE, fontSize: '18px', strokeThickness: 4 }).setOrigin(0.5),
      ]).setDepth(100000);

      const shadow = this.makeShadow(x, y);
      const npc = { index: i, key, hasSprite, flower, x, y, special, got: 0, done: false, active: true, lastGive: 0, visual, icon, shadow };
      this.npcs.push(npc);
    }
  }

  giveFlower(npc, time) {
    this.carried[npc.flower]--;
    this.refreshSlot();
    npc.got++;
    npc.lastGive = time;
    npc.done = npc.got >= CONFIG.FLOWERS_NEEDED;
    play(npc.done ? 'complete' : 'give');

    if (npc.done) {
      npc.icon.destroy();
      npc.mapDot.destroy();
    } else {
      npc.icon.list[1].setText(`x${npc.got}`);
    }

    // Co sprite thi chay anim receive (roi complete hoac idle). Thieu anim nao thi bo qua anim do.
    const has = (name) => npc.hasSprite && this.anims.exists(`${npc.key}_${name}`);
    if (has('receive')) {
      npc.visual.play(`${npc.key}_receive`);
      npc.visual.chain(npc.done && has('complete') ? `${npc.key}_complete` : `${npc.key}_idle`);
    } else if (npc.done && has('complete')) {
      npc.visual.play(`${npc.key}_complete`);
    } else if (!npc.hasSprite) {
      const s = CONFIG.CHARACTER_SCALE;
      this.tweens.add({ targets: npc.visual, scaleX: s * 1.15, scaleY: s * 0.85, duration: 100, yoyo: true });
    }

    this.refreshFlowers();
    if (npc.done) this.onNpcDone(npc);
  }

  onNpcDone(npc) {
    this.doneCount++; // moi chi nhan du hoa: ban nhanh hon, zombie dong hon
    const allDone = this.npcs.every((n) => n.done);
    if (!allDone) {
      this.floatText(npc.x, npc.y - 60 * CONFIG.CHARACTER_SCALE, NPC_NAMES[npc.index] || 'Xong', '#ffee58', 26);
      const n = this.doneCount;
      this.showBanner(
        `Tốc độ bắn +${Math.round(CONFIG.FIRE_SPEED_PER_NPC * 100 * n)}%
Zombie đông +${Math.round(CONFIG.ZOMBIE_DENSITY_PER_NPC * 100 * n)}%`,
        2500
      );
    }
    if (allDone) {
      this.finished = true;
      stopMusic();
      // Doi anim nhan hoa (3s) + anim complete cua chi cuoi chay xong roi moi hien man hinh thang
      this.time.delayedCall(4500, () => {
        play('win');
        this.result.show(true, formatTime(this.elapsed));
      });
      return;
    }
    const othersDone = this.npcs.every((n) => n.special || n.done);
    if (othersDone) this.unlockPink();
  }

  // Linhgia luon dung o tam ban do tu dau, nhung hoa hong chi moc ra khi 17 chi con lai da nhan du hoa,
  // nen cac chi thuong luon xong truoc va Linhgia luon duoc hoan thanh cuoi cung.
  unlockPink() {
    if (this.pinkUnlocked) return;
    this.cameras.main.flash(300, 255, 200, 220);
    play('appear');

    // Hoa thuong con lai van nam tren ban do cho du loai, nhung khong con chi nao can nen mo di va khong nhat duoc.
    this.pinkUnlocked = true;
    this.spawnFlowerType(PINK);
    this.refreshFlowers();
  }

  // ---------- Hoa ----------

  spawnFlowers() {
    this.flowers = [];
    // Luc dau chi co hoa cua cac chi thuong. Hoa hong (loai cuoi) chi xuat hien khi chi dac biet hien ra.
    for (let t = 0; t < PINK; t++) this.spawnFlowerType(t);
  }

  spawnFlowerType(t) {
    const type = FLOWER_TYPES[t];
    // So hoa moc ra = so hoa cac chi can loai nay * he so du
    const npcsNeeding = this.npcs.filter((n) => n.flower === t).length;
    const count = npcsNeeding * CONFIG.FLOWERS_NEEDED * CONFIG.FLOWER_SPARE;
    for (let k = 0; k < count; k++) {
      const { x, y } = this.pickSpot(40);
      this.addFlower(t, x, y);
    }
  }

  // So bong hoa loai t con can them: tong so con thieu cua cac chi chua xong, tru hoa dang cam. Hoa hong chi tinh khi da mo khoa.
  needFor(t) {
    if (t === PINK && !this.pinkUnlocked) return 0;
    const missing = this.npcs
      .filter((n) => n.flower === t && !n.done)
      .reduce((sum, n) => sum + CONFIG.FLOWERS_NEEDED - n.got, 0);
    return missing - this.carried[t];
  }

  // Khong con chi nao can loai hoa nay thi khong nhat duoc
  canPick(t) {
    return this.needFor(t) > 0;
  }

  // Hoa khong nhat duoc thi lam mo di de nguoi choi biet
  refreshFlowers() {
    for (const fl of this.flowers) {
      const ok = this.canPick(fl.type);
      fl.obj.setAlpha(ok ? 1 : 0.35);
      fl.shadow.setAlpha(ok ? 0.3 : 0.1);
    }
  }

  // Mui ten chi duong toi bong hoa can gan nhat, mau trung mau hoa. Chi bat 2 lan:
  // 1) khi chi con dung 1 loai hoa thuong cuoi cung, 2) khi hoa hong da mo khoa.
  updateGuide(time) {
    let t = null;
    if (this.pinkUnlocked) {
      t = PINK;
    } else {
      const left = new Set(this.npcs.filter((n) => !n.special && !n.done).map((n) => n.flower));
      if (left.size === 1) t = [...left][0];
    }

    let target = null;
    let best = Infinity;
    if (t !== null && !this.finished && this.canPick(t)) {
      for (const fl of this.flowers) {
        if (fl.type !== t) continue;
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, fl.x, fl.y);
        if (d < best) {
          best = d;
          target = fl;
        }
      }
    }
    // Da o gan thi khong can chi nua
    if (!target || best < CONFIG.GUIDE_HIDE_DIST) {
      this.guideArrow.setVisible(false);
      return;
    }
    const angle = Math.atan2(target.y - this.player.y, target.x - this.player.x);
    const r = CONFIG.GUIDE_RADIUS + Math.sin(time / 150) * 6; // nhun nhe cho de thay
    this.guideArrow
      .setFillStyle(FLOWER_TYPES[t].color)
      .setPosition(this.player.x + Math.cos(angle) * r, this.player.y + Math.sin(angle) * r)
      .setRotation(angle)
      .setVisible(true);
  }

  // Dat 1 bong hoa loai t tren mat dat tai (x, y)
  addFlower(t, x, y) {
    // Bong hoa noi tren mat dat, co bong do be o duoi
    const s = CONFIG.FLOWER_SCALE;
    const shadow = this.add.ellipse(x, y, 12 * s, 3.5 * s, 0x000000, 0.3).setDepth(0.5);
    const obj = this.add.sprite(x, y - 5 * s, 'flowers', FLOWER_TYPES[t].frame).setScale(s).setDepth(y);
    this.flowers.push({ x, y, type: t, obj, shadow });
    if (!this.canPick(t)) {
      obj.setAlpha(0.35);
      shadow.setAlpha(0.1);
    }
  }

  // Zombie chet co co hoi roi 1 bong hoa ma cac chi dang can (sau khi hoa hong mo khoa thi chi roi hoa hong)
  maybeDropFlower(x, y) {
    if (Math.random() >= CONFIG.ZOMBIE_DROP_CHANCE) return;
    // Chi roi loai hoa ma van con chi can
    const wanted = FLOWER_TYPES.map((_, t) => t).filter((t) => this.canPick(t));
    if (wanted.length === 0) return;
    this.addFlower(Phaser.Utils.Array.GetRandom(wanted), x, y);
  }

  // Chu bay len roi mo dan (tren the gioi)
  floatText(x, y, text, color, size) {
    const t = this.add
      .text(x, y, text, { ...TEXT_STYLE, fontSize: `${size}px`, strokeThickness: 5, color })
      .setOrigin(0.5)
      .setDepth(99998);
    this.tweens.add({ targets: t, y: y - 70, alpha: 0, duration: 2200, ease: 'Quad.easeOut', onComplete: () => t.destroy() });
  }

  // Cay, bui, nam, da trang tri (Kenney Tiny Town). Chi de dep, khong chan duong.
  spawnDecor() {
    const place = (texture, frame, scale, count) => {
      for (let i = 0; i < count; i++) {
        const { x, y } = this.pickSpot(CONFIG.DECOR_SPACING);
        this.add.sprite(x, y, texture, frame).setOrigin(0.5, 1).setScale(scale).setDepth(y);
      }
    };
    for (let i = 0; i < CONFIG.TREE_COUNT; i++) {
      const { x, y } = this.pickSpot(CONFIG.DECOR_SPACING);
      const key = Math.random() < 0.5 ? 'tree_green' : 'tree_orange';
      this.add.sprite(x, y, key).setOrigin(0.5, 1).setScale(3).setDepth(y);
    }
    place('town', 5, 2, CONFIG.BUSH_COUNT); // bui tron
    place('town', 29, 2, CONFIG.MUSHROOM_COUNT); // nam
    place('town', 43, 2, CONFIG.ROCK_COUNT); // da
  }

  // ---------- Giao dien (dong ho, hoa dang cam) ----------

  createHud() {
    this.timerText = this.add
      .text(CONFIG.GAME_WIDTH / 2, 10, '00:00', { ...TEXT_STYLE, fontSize: '20px' })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(100002);

    this.livesText = this.add
      .text(8, 8, '', { ...TEXT_STYLE, fontSize: '22px', color: '#ff4d4d' })
      .setScrollFactor(0)
      .setDepth(100002);
    this.refreshLives();

    this.carryText = this.add
      .text(8, 36, '', { ...TEXT_STYLE, fontSize: '13px' })
      .setScrollFactor(0)
      .setDepth(100002);
    this.lastFullMsg = -99999;

    // Hang hoa dang cam o day man hinh: chi hien loai nao dang cam (toi da MAX_CARRY loai)
    this.slots = FLOWER_TYPES.map((type) => {
      const dot = this.add.sprite(0, CONFIG.GAME_HEIGHT - 40, 'flowers', type.frame).setScale(CONFIG.FLOWER_HUD_SCALE);
      const count = this.add.text(0, CONFIG.GAME_HEIGHT - 16, '0', { ...TEXT_STYLE, fontSize: '14px' }).setOrigin(0.5, 0);
      [dot, count].forEach((o) => o.setScrollFactor(0).setDepth(100002).setVisible(false));
      return { dot, count };
    });
    this.refreshSlot();

    this.createMinimap();

    // Nut bat/tat am thanh o goc duoi ben phai
    this.soundBtn = this.add
      .text(CONFIG.GAME_WIDTH - 6, CONFIG.GAME_HEIGHT - 20, '', { ...TEXT_STYLE, fontSize: '13px' })
      .setOrigin(1, 0.5)
      .setScrollFactor(0)
      .setDepth(100002);
    this.refreshSoundBtn();

    this.banner = this.add
      .text(CONFIG.GAME_WIDTH / 2, 100, '', { ...TEXT_STYLE, fontSize: '20px', align: 'center', wordWrap: { width: 320 } })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100003)
      .setVisible(false);

    this.result = new ResultScreen(this, {
      onSave: async (name) => {
        const res = await submitScore(name, Math.round(this.elapsed));
        if (res.error) return { ok: false, message: res.error };
        return { ok: true, message: `Hạng của bạn: ${res.rank}`, board: formatBoard(await fetchTop()) };
      },
      onRestart: () => this.scene.restart(),
    });
  }

  // Ban do nho goc tren ben phai: vong tron cac chi, cac chi con lai, vi tri player
  createMinimap() {
    const w = CONFIG.MINIMAP_WIDTH;
    this.mapScale = w / CONFIG.MAP_WIDTH;
    const h = CONFIG.MAP_HEIGHT * this.mapScale;
    this.mapX = CONFIG.GAME_WIDTH - w - 8;
    this.mapY = 8;

    const fixed = (o) => o.setScrollFactor(0).setDepth(100002);
    fixed(this.add.rectangle(this.mapX, this.mapY, w, h, 0x000000, 0.45).setOrigin(0).setStrokeStyle(2, 0xffffff, 0.8));
    fixed(
      this.add
        .circle(this.mapX + w / 2, this.mapY + h / 2, CONFIG.NPC_ZONE_RADIUS * this.mapScale)
        .setStrokeStyle(1, 0xffffff, 0.7)
    );

    for (const npc of this.npcs) {
      npc.mapDot = fixed(
        this.add.circle(this.mapX + npc.x * this.mapScale, this.mapY + npc.y * this.mapScale, 2, FLOWER_TYPES[npc.flower].color)
      );
    }
    this.playerDot = fixed(this.add.circle(0, 0, 3, 0xffffff).setStrokeStyle(1, 0x000000));
  }

  refreshSoundBtn() {
    this.soundBtn.setText(isMuted() ? 'Âm: TẮT' : 'Âm: BẬT');
  }

  refreshLives() {
    this.livesText.setText('♥ '.repeat(this.lives));
  }

  carriedTotal() {
    return this.carried.reduce((a, b) => a + b, 0);
  }

  refreshSlot() {
    this.carryText.setText(`Hoa ${this.carriedTotal()}/${CONFIG.MAX_CARRY}`);
    const held = this.slots.map((s, i) => i).filter((i) => this.carried[i] > 0);
    const gap = 44;
    this.slots.forEach((s, i) => {
      const pos = held.indexOf(i);
      s.dot.setVisible(pos >= 0);
      s.count.setVisible(pos >= 0);
      if (pos < 0) return;
      const x = CONFIG.GAME_WIDTH / 2 + (pos - (held.length - 1) / 2) * gap;
      s.dot.setX(x);
      s.count.setX(x).setText(String(this.carried[i]));
    });
  }

  // ms = 0: hien mai mai
  showBanner(text, ms) {
    this.banner.setText(text).setVisible(true);
    if (ms > 0) this.time.delayedCall(ms, () => this.banner.setVisible(false));
  }

  // ---------- Tam dung ----------

  pause() {
    if (this.finished || this.paused) return;
    this.paused = true;
    this.resetJoystick();
    this.physics.pause();
    this.time.paused = true;
    this.tweens.pauseAll();
    this.anims.pauseAll();
    stopMusic();
    this.pauseUi.forEach((o) => o.setVisible(true));
  }

  resume() {
    if (!this.paused) return;
    this.paused = false;
    this.physics.resume();
    this.time.paused = false;
    this.tweens.resumeAll();
    this.anims.resumeAll();
    startMusic();
    this.pauseUi.forEach((o) => o.setVisible(false));
  }

  tapPause(px, py) {
    const mid = CONFIG.GAME_WIDTH / 2;
    if (Math.abs(px - mid) > 100) return;
    if (Math.abs(py - PAUSE_BTN.resumeY) <= 22) {
      play('click');
      this.resume();
    } else if (Math.abs(py - PAUSE_BTN.menuY) <= 22) {
      play('click');
      this.anims.resumeAll(); // anim la dung chung ca game, phai tiep tuc truoc khi roi van
      this.scene.start('MenuScene');
    }
  }

  // ---------- Can gat ao ----------

  updateJoystick(p) {
    const dx = p.x / CONFIG.RENDER_SCALE - this.joyOrigin.x;
    const dy = p.y / CONFIG.RENDER_SCALE - this.joyOrigin.y;
    const dist = Math.hypot(dx, dy);
    const clamped = Math.min(dist, CONFIG.JOY_RADIUS);
    if (dist < CONFIG.JOY_DEADZONE) {
      this.joyVec.set(0, 0);
    } else {
      this.joyVec.set(dx / dist, dy / dist).scale(clamped / CONFIG.JOY_RADIUS);
    }
    const angle = Math.atan2(dy, dx);
    this.joyThumb.setPosition(
      this.joyOrigin.x + Math.cos(angle) * clamped,
      this.joyOrigin.y + Math.sin(angle) * clamped
    );
  }

  resetJoystick() {
    this.joyOrigin = null;
    this.joyVec.set(0, 0);
    this.joyBase.setVisible(false);
    this.joyThumb.setVisible(false);
  }

  // ---------- Moi khung hinh ----------

  update(time, delta) {
    if (this.paused) return;
    if (this.finished) {
      this.player.setVelocity(0, 0);
      this.player.anims.play(`${this.charId}_idle_${this.facing}`, true);
      return;
    }

    this.elapsed += delta;
    this.timerText.setText(formatTime(this.elapsed));

    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;

    this.player.anims.timeScale = 1; // dang ban thi updateShooting dat lai
    const dir = new Phaser.Math.Vector2(Number(right) - Number(left), Number(down) - Number(up));
    if (dir.lengthSq() === 0) {
      dir.copy(this.joyVec);
    } else {
      dir.normalize();
    }

    this.player.setVelocity(dir.x * CONFIG.PLAYER_SPEED, dir.y * CONFIG.PLAYER_SPEED);

    if (dir.lengthSq() > 0) {
      // Dang di chuyen thi khong ban
      this.lastShootFrame = 0;
      // Huong nhin theo huong di, chia 8 huong (moi huong 45 do). Trai thi lat sprite cua huong phai.
      const sector = Math.round((Math.atan2(dir.y, dir.x) * 180) / Math.PI / 45); // -4..4, 0 = sang phai
      const abs = Math.abs(sector);
      const down = sector > 0;
      this.facing = abs === 0 || abs === 4 ? 'side' : abs === 2 ? (down ? 'front' : 'back') : down ? 'dfront' : 'dback';
      this.player.setFlipX(abs >= 3);
      this.player.anims.play(`${this.charId}_run_${this.facing}`, true);
    } else {
      this.updateShooting();
    }

    // Vi tri chan player (anh 48x48, chan o khoang +15 so voi tam)
    const feetY = this.player.y + 15 * CONFIG.CHARACTER_SCALE;
    this.player.setDepth(feetY);
    this.player.setAlpha(time < this.invincibleUntil && Math.floor(time / CONFIG.BLINK_MS) % 2 ? 0.35 : 1);
    this.playerShadow.setPosition(this.player.x, feetY - 2);
    this.playerLabel.setPosition(this.player.x, this.player.y - 24 * CONFIG.CHARACTER_SCALE);
    this.updateGuide(time);
    this.rangeRing.setPosition(this.player.x, this.player.y).setVisible(!this.inPeaceZone());
    this.playerDot.setPosition(this.mapX + this.player.x * this.mapScale, this.mapY + this.player.y * this.mapScale);

    this.updateZombies(time, delta);
    this.updateBullets(delta);
    if (this.finished) return;

    // Nhat hoa
    for (let i = this.flowers.length - 1; i >= 0; i--) {
      const fl = this.flowers[i];
      if (!this.canPick(fl.type)) continue; // khong con chi nao can loai nay thi khong nhat
      if (Phaser.Math.Distance.Between(this.player.x, feetY, fl.x, fl.y) < CONFIG.FLOWER_PICK_RADIUS) {
        if (this.carriedTotal() >= CONFIG.MAX_CARRY) {
          if (time - this.lastFullMsg > 2000) {
            this.lastFullMsg = time;
            this.showBanner(`Chỉ cầm được ${CONFIG.MAX_CARRY} hoa`, 1200);
          }
          continue;
        }
        this.carried[fl.type]++;
        play('pick');
        this.refreshSlot();
        this.refreshFlowers();
        fl.obj.destroy();
        fl.shadow.destroy();
        this.flowers.splice(i, 1);
      }
    }

    // Tang hoa: toi gan NPC dung loai thi tu tang, moi lan 1 bong
    for (const npc of this.npcs) {
      if (!npc.active || npc.done || this.carried[npc.flower] <= 0) continue;
      if (time - npc.lastGive < CONFIG.NPC_GIVE_DELAY) continue;
      if (Phaser.Math.Distance.Between(this.player.x, feetY, npc.x, npc.y) < CONFIG.NPC_GIVE_RADIUS) {
        this.giveFlower(npc, time);
        if (this.finished) break;
      }
    }
  }

  // ---------- Zombie ----------

  // Tam than cua zombie (de tinh khoang cach, chan o duoi cung anh)
  zombieCenter(z) {
    return { x: z.obj.x, y: z.obj.y - 16 * CONFIG.CHARACTER_SCALE * z.scaleMul };
  }

  // Tu nua sau van (sau ZOMBIE_HARD_FROM chi xong) bat dau co zombie nhanh va zombie trau (nhieu mau)
  pickZombieType() {
    const T = CONFIG.ZOMBIE_TYPES;
    if (this.doneCount >= CONFIG.ZOMBIE_HARD_FROM) {
      const r = Math.random();
      if (r < T.tank.chance) return T.tank;
      if (r < T.tank.chance + T.fast.chance) return T.fast;
    }
    return T.normal;
  }

  spawnZombie() {
    const { MAP_WIDTH, MAP_HEIGHT, NPC_ZONE_RADIUS } = CONFIG;
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Phaser.Math.Between(CONFIG.ZOMBIE_SPAWN_MIN_DIST, CONFIG.ZOMBIE_SPAWN_MAX_DIST);
      const x = this.player.x + Math.cos(angle) * dist;
      const y = this.player.y + Math.sin(angle) * dist;
      const inMap = x > 30 && y > 30 && x < MAP_WIDTH - 30 && y < MAP_HEIGHT - 30;
      const inZone = Phaser.Math.Distance.Between(x, y, MAP_WIDTH / 2, MAP_HEIGHT / 2) < NPC_ZONE_RADIUS + CONFIG.ZOMBIE_ZONE_PAD;
      if (!inMap || inZone) continue;
      const type = this.pickZombieType();
      const obj = this.add.sprite(x, y, 'zombie_walk').setOrigin(0.5, 40 / 48).setScale(CONFIG.CHARACTER_SCALE * type.scale).setDepth(y);
      obj.play({ key: 'zombie_walk', startFrame: Phaser.Math.Between(0, 3) });
      if (type.tint) obj.setTint(type.tint);
      const shadow = this.makeShadow(x, y).setScale(type.scale);
      this.zombies.push({
        obj, shadow, kx: 0, ky: 0,
        hp: Math.round(CONFIG.ZOMBIE_HP * type.hp),
        speedMul: type.speed, scaleMul: type.scale, tint: type.tint,
      });
      return;
    }
  }

  updateZombies(time, delta) {
    const density = 1 + CONFIG.ZOMBIE_DENSITY_PER_NPC * this.doneCount;
    if (this.elapsed >= this.nextSpawn && this.zombies.length < Math.round(CONFIG.ZOMBIE_MAX * density)) {
      this.spawnZombie();
      this.nextSpawn = this.elapsed + CONFIG.ZOMBIE_SPAWN_INTERVAL / density;
    }

    const dt = delta / 1000;
    const cx = CONFIG.MAP_WIDTH / 2;
    const cy = CONFIG.MAP_HEIGHT / 2;
    const minZoneDist = CONFIG.NPC_ZONE_RADIUS + CONFIG.ZOMBIE_ZONE_PAD;

    for (const z of this.zombies) {
      const c = this.zombieCenter(z);
      const dx = this.player.x - c.x;
      const dy = this.player.y - c.y;
      const d = Math.hypot(dx, dy) || 1;
      z.obj.setFlipX(dx < 0);
      z.obj.x += ((dx / d) * CONFIG.ZOMBIE_SPEED * z.speedMul + z.kx) * dt;
      z.obj.y += ((dy / d) * CONFIG.ZOMBIE_SPEED * z.speedMul + z.ky) * dt;
      const decay = Math.exp(-dt * 10); // luc day lui giam dan
      z.kx *= decay;
      z.ky *= decay;
      z.dist = d;
    }

    this.separateZombies();

    for (const z of this.zombies) {
      // Khong cho vao vong tron cac chi: day ra vien, phan di ngang van truot quanh vong
      const zx = z.obj.x - cx;
      const zy = z.obj.y - cy;
      const zd = Math.hypot(zx, zy) || 1;
      if (zd < minZoneDist) {
        z.obj.x = cx + (zx / zd) * minZoneDist;
        z.obj.y = cy + (zy / zd) * minZoneDist;
      }
      z.obj.setDepth(z.obj.y);
      z.shadow.setPosition(z.obj.x, z.obj.y - 2);

      if (z.dist < CONFIG.ZOMBIE_CONTACT * z.scaleMul && time >= this.invincibleUntil) {
        this.hitPlayer(time);
        if (this.finished) return;
      }
    }
  }

  // Moi zombie la 1 vat the rieng: 2 con ma lai qua gan nhau thi day nhau ra de khong chong len nhau
  separateZombies() {
    const zs = this.zombies;
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < zs.length; i++) {
        for (let j = i + 1; j < zs.length; j++) {
          const a = zs[i].obj;
          const b = zs[j].obj;
          const min = CONFIG.ZOMBIE_RADIUS * (zs[i].scaleMul + zs[j].scaleMul);
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let d = Math.hypot(dx, dy);
          if (d >= min) continue;
          if (d < 0.01) {
            // trung dung 1 cho: day theo huong ngau nhien
            const angle = Math.random() * Math.PI * 2;
            dx = Math.cos(angle);
            dy = Math.sin(angle);
            d = 1;
          }
          const push = (min - d) / 2 / d;
          a.x -= dx * push;
          a.y -= dy * push;
          b.x += dx * push;
          b.y += dy * push;
        }
      }
    }
  }

  hitPlayer(time) {
    this.lives--;
    play('hurt');
    this.invincibleUntil = time + CONFIG.INVINCIBLE_MS;
    this.refreshLives();
    this.cameras.main.shake(CONFIG.SHAKE_MS, CONFIG.SHAKE_INTENSITY);
    this.flashSprite(this.player, 0xff3030, 150);
    if (this.lives <= 0) {
      this.finished = true;
      stopMusic();
      this.player.setAlpha(1);
      this.time.delayedCall(600, () => {
        play('lose');
        this.result.show(false, formatTime(this.elapsed));
      });
    }
  }

  // ---------- Hieu ung ----------

  // Bong do hinh bau duc duoi chan, dat tai vi tri chan (x, y)
  makeShadow(x, y) {
    const s = CONFIG.CHARACTER_SCALE;
    return this.add.ellipse(x, y - 2, 22 * s, 7 * s, 0x000000, 0.3).setDepth(0.5);
  }

  // Nhay 1 mau roi tra ve mau cu (restoreTint: mau nhuom cua zombie, khong co thi bo nhuom)
  flashSprite(sprite, color, ms, restoreTint) {
    sprite.setTintFill(color);
    this.time.delayedCall(ms, () => {
      if (!sprite.active) return;
      if (restoreTint) sprite.setTint(restoreTint);
      else sprite.clearTint();
    });
  }

  showDamage(x, y, amount) {
    const t = this.add
      .text(x, y, String(amount), { ...TEXT_STYLE, fontSize: '26px', color: '#ffee58' })
      .setOrigin(0.5)
      .setDepth(95001);
    this.tweens.add({ targets: t, y: y - 50, alpha: 0, duration: 600, onComplete: () => t.destroy() });
  }

  puffSmoke(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
      const dist = Phaser.Math.Between(20, 40);
      const puff = this.add.circle(x, y, Phaser.Math.Between(6, 10), 0xd0d0d0, 0.85).setDepth(95000);
      this.tweens.add({
        targets: puff,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist - 10,
        scale: 1.8,
        alpha: 0,
        duration: 450,
        onComplete: () => puff.destroy(),
      });
    }
  }

  inPeaceZone() {
    const feetY = this.player.y + 15 * CONFIG.CHARACTER_SCALE;
    return Phaser.Math.Distance.Between(this.player.x, feetY, CONFIG.MAP_WIDTH / 2, CONFIG.MAP_HEIGHT / 2) < CONFIG.NPC_ZONE_RADIUS;
  }

  // ---------- Ban ----------

  // Dung yen: ban zombie gan nhat trong tam. Dan ra o khung "giat" cua anim shoot.
  updateShooting() {
    // Vung hoa binh (vong tron cac chi): khong ban duoc
    const target = this.inPeaceZone() ? null : this.nearestZombieInRange();
    if (!target) {
      this.lastShootFrame = 0;
      this.player.anims.play(`${this.charId}_idle_${this.facing}`, true);
      return;
    }
    const c = this.zombieCenter(target);

    // Chon huong sung gan nhat voi huong toi zombie (5 huong, huong trai thi lat sprite)
    const dx = c.x - this.player.x;
    const deg = (Math.atan2(c.y - this.player.y, Math.abs(dx)) * 180) / Math.PI;
    const [, key] = AIM_ANGLES.reduce((best, a) => (Math.abs(a[0] - deg) < Math.abs(best[0] - deg) ? a : best));
    this.aimKey = key;
    this.facing = AIM[key].view;
    this.player.setFlipX(dx < 0 && key !== 'N' && key !== 'S');

    const animKey = `${this.charId}_shoot_${key}`;
    if (animKey !== this.lastShootKey) {
      this.lastShootKey = animKey;
      this.lastShootFrame = 0;
    }
    this.player.anims.play(animKey, true);
    this.player.anims.timeScale = 1 + CONFIG.FIRE_SPEED_PER_NPC * this.doneCount; // anim ban nhanh len = ban nhanh len

    const frame = this.player.anims.currentFrame.index;
    if (frame === 2 && this.lastShootFrame !== 2) this.fireBullet(c);
    this.lastShootFrame = frame;
  }

  nearestZombieInRange() {
    let best = null;
    let bestDist = CONFIG.FIRE_RANGE;
    for (const z of this.zombies) {
      const c = this.zombieCenter(z);
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, c.x, c.y);
      if (d <= bestDist) {
        bestDist = d;
        best = z;
      }
    }
    return best;
  }

  fireBullet(targetPos) {
    play('shoot');
    const s = CONFIG.CHARACTER_SCALE;
    // Dau nong sung theo huong dang ngam (toa do trong khung 48x48, tam khung la 24,24)
    const sign = this.player.flipX ? -1 : 1;
    const [mxp, myp] = muzzleOf(this.aimKey);
    const mx = this.player.x + sign * (mxp - 24) * s;
    const my = this.player.y + (myp - 24) * s;
    const angle = Math.atan2(targetPos.y - my, targetPos.x - mx);

    // Vien dan nho co vet sang phia sau
    const trail = this.add.rectangle(-9, 0, 18, 3, 0xfff2a0, 0.4);
    const head = this.add.rectangle(0, 0, 7, 4, 0xffe066);
    const obj = this.add.container(mx, my, [trail, head]).setRotation(angle).setDepth(90000);
    this.bullets.push({
      obj,
      vx: Math.cos(angle) * CONFIG.BULLET_SPEED,
      vy: Math.sin(angle) * CONFIG.BULLET_SPEED,
      traveled: 0,
    });
  }

  updateBullets(delta) {
    const dt = delta / 1000;
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.obj.x += b.vx * dt;
      b.obj.y += b.vy * dt;
      b.traveled += CONFIG.BULLET_SPEED * dt;

      let used = b.traveled > CONFIG.FIRE_RANGE * 1.4;
      if (!used) {
        for (let j = this.zombies.length - 1; j >= 0; j--) {
          const z = this.zombies[j];
          const c = this.zombieCenter(z);
          if (Phaser.Math.Distance.Between(b.obj.x, b.obj.y, c.x, c.y) < CONFIG.ZOMBIE_BULLET_RADIUS * z.scaleMul) {
            z.hp -= CONFIG.BULLET_DAMAGE;
            this.showDamage(c.x, c.y - 30, CONFIG.BULLET_DAMAGE);
            if (z.hp <= 0) {
              this.puffSmoke(c.x, c.y + 10);
              this.maybeDropFlower(z.obj.x, z.obj.y);
              play('die');
              z.obj.destroy();
              z.shadow.destroy();
              this.zombies.splice(j, 1);
            } else {
              this.flashSprite(z.obj, 0xffffff, 80, z.tint);
              play('hit');
              z.kx = ((b.vx / CONFIG.BULLET_SPEED) * CONFIG.KNOCKBACK_SPEED) / z.scaleMul;
              z.ky = ((b.vy / CONFIG.BULLET_SPEED) * CONFIG.KNOCKBACK_SPEED) / z.scaleMul;
            }
            used = true;
            break;
          }
        }
      }
      if (used) {
        b.obj.destroy();
        this.bullets.splice(i, 1);
      }
    }
  }
}
