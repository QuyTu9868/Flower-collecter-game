import Phaser from 'phaser';
import { CONFIG, PLAYERS } from '../config.js';
import { fetchTop, formatBoard } from '../api.js';
import { smoothText } from '../textSmooth.js';
import { initAudio, play, toggleMute, isMuted } from '../audio.js';

const W = CONFIG.GAME_WIDTH;
const H = CONFIG.GAME_HEIGHT;
const CX = W / 2;
const TEXT_STYLE = { fontFamily: 'monospace', color: '#ffffff', stroke: '#000000', strokeThickness: 3, align: 'center', resolution: CONFIG.RENDER_SCALE };

const HOW_TO = [
  'Di chuyển: phím WASD hoặc mũi tên. Trên điện thoại chạm rồi kéo ngón tay.',
  'Nhặt hoa đúng màu các chị cần (icon hoa trên đầu mỗi chị). Cầm tối đa 3 hoa.',
  'Đi tới gần chị đó để tặng hoa. Mỗi chị cần 2 bông, nhận cách nhau 5 giây.',
  'Đứng yên để tự bắn zombie gần nhất, đang chạy thì không bắn. Vòng tròn giữa bản đồ là vùng hòa bình, không bắn được.',
  'Mỗi chị nhận đủ hoa: bạn bắn nhanh hơn nhưng zombie đông hơn.',
  'Linhgia đứng giữa bản đồ. Hoa hồng chỉ xuất hiện khi 17 chị còn lại đã đủ hoa. Tặng đủ hoa hồng cho Linhgia là thắng.',
  'Thắng càng nhanh, thứ hạng càng cao. Mất 3 mạng là thua.',
];

const loadChoice = () => {
  try {
    return localStorage.getItem('character');
  } catch {
    return null;
  }
};
const saveChoice = (id) => {
  try {
    localStorage.setItem('character', id);
  } catch {
    /* bo qua */
  }
};

// Man hinh chinh: ten game, chon nhan vat, bang xep hang, nut bat dau va cach choi
export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    smoothText(this);
    initAudio(this.sound);
    // Canvas ve gap doi do phan giai: phong camera len de toa do van tinh theo 360x640
    this.cameras.main.setZoom(CONFIG.RENDER_SCALE).centerOn(CX, H / 2);

    const saved = loadChoice();
    this.selected = PLAYERS.some((p) => p.id === saved) ? saved : PLAYERS[0].id;
    this.registry.set('character', this.selected);

    this.drawBackground();
    this.drawTitle();
    this.drawCharacterSelect();
    this.drawBoard();
    this.drawButtons();
    this.createHowTo();
  }

  text(x, y, str, size, extra = {}) {
    return this.add.text(x, y, str, { ...TEXT_STYLE, fontSize: `${size}px`, ...extra }).setOrigin(0.5);
  }

  // Khung bo goc (panel) co vien
  panel(x, y, w, h, fill = 0x000000, alpha = 0.5, stroke = 0xffffff) {
    const g = this.add.graphics();
    g.fillStyle(fill, alpha).fillRoundedRect(x, y, w, h, 12);
    g.lineStyle(2, stroke, 0.7).strokeRoundedRect(x, y, w, h, 12);
    return g;
  }

  drawBackground() {
    this.add.tileSprite(0, 0, W, H, 'ground').setOrigin(0).setDepth(0);
    this.add.rectangle(0, 0, W, H, 0x0a2410, 0.4).setOrigin(0).setDepth(1);

    // Hoa, cay trang tri o mep
    for (let i = 0; i < 22; i++) {
      const x = Phaser.Math.Between(10, W - 10);
      const y = Phaser.Math.Between(10, H - 10);
      if (x > 40 && x < W - 40 && y > 130 && y < 560) continue; // chua cho giua cho cac bang
      this.add.sprite(x, y, 'flowers', i % 5).setScale(1.2).setDepth(2).setAlpha(0.9);
    }
    this.add.sprite(26, H - 6, 'tree_green').setOrigin(0.5, 1).setScale(3).setDepth(2);
    this.add.sprite(W - 28, H - 6, 'tree_orange').setOrigin(0.5, 1).setScale(3).setDepth(2);

    // Canh hoa roi cham
    for (let i = 0; i < 14; i++) {
      const petal = this.add.ellipse(Phaser.Math.Between(0, W), -10, 6, 4, 0xffb7d5, 0.85).setDepth(3);
      const drift = Phaser.Math.Between(15, 35) * (i % 2 ? 1 : -1);
      this.tweens.add({
        targets: petal,
        y: H + 10,
        duration: Phaser.Math.Between(7000, 12000),
        delay: Phaser.Math.Between(0, 8000),
        repeat: -1,
      });
      this.tweens.add({ targets: petal, x: petal.x + drift, angle: 180, duration: Phaser.Math.Between(1800, 3000), yoyo: true, repeat: -1 });
    }
  }

  drawTitle() {
    this.text(CX, 52, 'Hoa 20/10', 44, { color: '#fff2b0', stroke: '#c2185b', strokeThickness: 8 }).setDepth(10);
    this.text(CX, 94, 'Tặng hoa cho các chị, tránh zombie!', 13, { color: '#ffe0ef' }).setDepth(10);
    for (const [x, frame, dir] of [[34, 4, 1], [W - 34, 0, -1]]) {
      const flower = this.add.sprite(x, 52, 'flowers', frame).setScale(1.5).setDepth(10);
      this.tweens.add({ targets: flower, angle: 14 * dir, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }

  drawCharacterSelect() {
    this.panel(10, 116, W - 20, 138).setDepth(5);
    this.text(CX, 130, 'Chọn nhân vật', 14, { color: '#ffee58' }).setDepth(10);

    this.ring = this.add.graphics().setDepth(6);
    this.slots = PLAYERS.map((pl, i) => {
      const x = 10 + ((W - 20) / PLAYERS.length) * (i + 0.5);
      const sprite = this.add.sprite(x, 192, `${pl.id}_idle`, 2).setScale(1.3).setDepth(10);
      const name = this.text(x, 236, pl.name, 12).setDepth(10);
      const zone = this.add.rectangle(x, 192, 62, 100, 0xffffff, 0).setDepth(11).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => this.choose(pl.id));
      return { pl, x, sprite, name };
    });
    this.refreshSelection();
  }

  choose(id) {
    if (id === this.selected) return;
    play('click');
    this.selected = id;
    this.registry.set('character', id);
    saveChoice(id);
    this.refreshSelection();
  }

  refreshSelection() {
    this.ring.clear();
    this.tweens.killTweensOf(this.slots.map((s) => s.sprite));
    for (const s of this.slots) {
      const on = s.pl.id === this.selected;
      s.sprite.setAlpha(on ? 1 : 0.6).setY(192);
      s.name.setColor(on ? '#ffee58' : '#ffffff');
      if (on) {
        this.ring.lineStyle(3, 0xffee58, 1).strokeRoundedRect(s.x - 31, 148, 62, 102, 10);
        this.ring.fillStyle(0xffee58, 0.15).fillRoundedRect(s.x - 31, 148, 62, 102, 10);
        this.tweens.add({ targets: s.sprite, y: 186, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
    }
  }

  drawBoard() {
    this.panel(10, 266, W - 20, 206).setDepth(5);
    this.text(CX, 282, 'Bảng xếp hạng', 15, { color: '#ffee58' }).setDepth(10);
    const board = this.add
      .text(CX, 300, 'Đang tải...', { ...TEXT_STYLE, fontSize: '13px', align: 'left' })
      .setOrigin(0.5, 0)
      .setDepth(10);
    fetchTop().then((rows) => {
      if (board.active) board.setText(formatBoard(rows));
    });
  }

  button(y, w, h, color, label, size, onTap) {
    const rect = this.add.rectangle(CX, y, w, h, color).setStrokeStyle(2, 0xffffff).setDepth(10).setInteractive({ useHandCursor: true });
    const txt = this.text(CX, y, label, size).setDepth(11);
    rect.on('pointerdown', onTap);
    return { rect, txt };
  }

  drawButtons() {
    this.button(520, 200, 48, 0x2e7d32, 'Bắt đầu', 22, () => {
      play('click');
      this.scene.start('GameScene');
    });
    this.button(578, 200, 34, 0x37618e, 'Cách chơi', 16, () => {
      play('click');
      this.howTo.setVisible(true);
    });

    const snd = this.text(W - 8, 12, isMuted() ? 'Âm: TẮT' : 'Âm: BẬT', 12).setOrigin(1, 0.5).setDepth(20);
    const zone = this.add.rectangle(W - 36, 12, 72, 24, 0xffffff, 0).setDepth(21).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', () => {
      toggleMute();
      snd.setText(isMuted() ? 'Âm: TẮT' : 'Âm: BẬT');
    });
  }

  // Bang "Cach choi" (an san)
  createHowTo() {
    const c = this.add.container(0, 0).setDepth(50).setVisible(false);
    const block = this.add.rectangle(0, 0, W, H, 0x000000, 0.8).setOrigin(0).setInteractive();
    const panel = this.panel(14, 60, W - 28, 500, 0x16301c, 0.95);
    const title = this.text(CX, 88, 'Cách chơi', 22, { color: '#ffee58' });
    const body = this.add
      .text(26, 114, HOW_TO.map((t) => `• ${t}`).join('\n\n'), {
        ...TEXT_STYLE,
        fontSize: '13px',
        align: 'left',
        wordWrap: { width: W - 52 },
        lineSpacing: 2,
      })
      .setOrigin(0, 0);
    const closeRect = this.add.rectangle(CX, 528, 160, 36, 0x2e7d32).setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true });
    const closeText = this.text(CX, 528, 'Đóng', 16);
    closeRect.on('pointerdown', () => {
      play('click');
      c.setVisible(false);
    });
    c.add([block, panel, title, body, closeRect, closeText]);
    this.howTo = c;
  }
}
