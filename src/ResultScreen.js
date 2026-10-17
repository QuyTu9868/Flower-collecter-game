import { CONFIG, PLAYERS } from './config.js';

const TEXT_STYLE = { fontFamily: 'monospace', color: '#ffffff', stroke: '#000000', strokeThickness: 3, align: 'center', resolution: CONFIG.RENDER_SCALE };
const CX = CONFIG.GAME_WIDTH / 2;
const INPUT = { y: 290, w: 220, h: 36 };
const BTN = { w: 150, h: 40 };
const MAX_NAME = 16;
const MESSAGE_Y = 465;
const RESTART_Y = 410;
const RESTART_Y_WITH_BOARD = 590; // nut choi lai xuong day khi hien bang xep hang

const loadNickname = () => {
  try {
    return localStorage.getItem('nickname') ?? '';
  } catch {
    return '';
  }
};
const saveNickname = (name) => {
  try {
    localStorage.setItem('nickname', name);
  } catch {
    /* bo qua */
  }
};

// Man hinh ket qua (thang / thua). Tao luc scene bat dau, an san, goi show() khi ket thuc van.
// Cac nut bam bang toa do (tap), o nhap biet danh la <input> cua trinh duyet dat len tren game.
export class ResultScreen {
  constructor(scene, { onSave, onRestart }) {
    this.scene = scene;
    this.onSave = onSave;
    this.onRestart = onRestart;
    this.visible = false;
    this.saved = false;

    const fixed = (o) => o.setScrollFactor(0).setVisible(false);
    const text = (y, size, str = '') =>
      fixed(scene.add.text(CX, y, str, { ...TEXT_STYLE, fontSize: `${size}px` }).setOrigin(0.5).setDepth(100011));

    this.overlay = fixed(scene.add.rectangle(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT, 0x000000, 0.7).setOrigin(0).setDepth(100010));
    // Khung bang (bo goc) va anh nhan vat dang choi
    this.card = fixed(scene.add.graphics().setDepth(100010.5));
    const charId = scene.registry.get('character') ?? PLAYERS[0].id;
    this.charName = PLAYERS.find((pl) => pl.id === charId)?.name ?? '';
    this.portrait = fixed(scene.add.sprite(CX, 66, `${charId}_idle`, 2).setScale(1.5).setDepth(100011));
    this.title = text(130, 34);
    this.timeText = text(190, 22);
    this.label = text(245, 14, `Biệt danh (tối đa ${MAX_NAME} ký tự)`);
    this.message = text(MESSAGE_Y, 14);
    this.board = fixed(scene.add.text(CX, 265, '', { ...TEXT_STYLE, fontSize: '13px', align: 'left' }).setOrigin(0.5, 0).setDepth(100011));

    this.saveBtn = this.makeButton(350, 'Lưu', 0x1565c0, () => this.save());
    this.restartBtn = this.makeButton(RESTART_Y, 'Chơi lại', 0x2e7d32, () => this.onRestart());

    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.maxLength = MAX_NAME;
    this.input.placeholder = 'Biệt danh';
    this.input.autocomplete = 'off';
    Object.assign(this.input.style, {
      position: 'fixed', display: 'none', zIndex: '10', boxSizing: 'border-box',
      textAlign: 'center', fontFamily: 'monospace', border: '2px solid #fff', borderRadius: '4px',
      background: '#222', color: '#fff', outline: 'none',
    });
    this.input.addEventListener('keydown', (e) => e.key === 'Enter' && this.save());
    document.body.appendChild(this.input);

    this.place = () => this.placeInput();
    window.addEventListener('resize', this.place);
    scene.events.once('shutdown', () => this.destroy());
  }

  makeButton(y, label, color, onTap) {
    const rect = this.scene.add.rectangle(CX, y, BTN.w, BTN.h, color).setStrokeStyle(2, 0xffffff).setScrollFactor(0).setDepth(100011).setVisible(false);
    const text = this.scene.add.text(CX, y, label, { ...TEXT_STYLE, fontSize: '18px' }).setOrigin(0.5).setScrollFactor(0).setDepth(100012).setVisible(false);
    return { rect, text, y, onTap, active: false };
  }

  moveButton(btn, y) {
    btn.y = y;
    btn.rect.setY(y);
    btn.text.setY(y);
  }

  setButton(btn, on) {
    btn.active = on;
    btn.rect.setVisible(on);
    btn.text.setVisible(on);
  }

  show(win, timeStr) {
    this.visible = true;
    this.saved = false;
    [this.overlay, this.title, this.timeText, this.message, this.card, this.portrait].forEach((o) => o.setVisible(true));
    this.drawCard(win ? 628 : 470);
    this.title.setText(win ? 'Chiến thắng!' : 'Thua rồi');
    this.timeText.setText(`${win ? 'Thời gian' : 'Sống sót'}: ${timeStr}`);
    this.message.setText('').setY(MESSAGE_Y);
    this.board.setVisible(false);
    this.moveButton(this.restartBtn, RESTART_Y);
    this.label.setVisible(win);
    this.setButton(this.saveBtn, win);
    this.setButton(this.restartBtn, true);
    this.input.style.display = win ? 'block' : 'none';
    this.input.value = loadNickname() || this.charName; // dien san ten lan truoc (hoac ten nhan vat dang choi)
    if (win) this.placeInput();

    // Go chu vao o nhap: tat phim game de khong chan phim W A S D
    this.scene.input.keyboard.clearCaptures();
    this.scene.input.keyboard.enabled = false;
  }

  // Ve khung bang bo goc phia sau cac dong chu
  drawCard(bottom) {
    this.card.clear();
    this.card.fillStyle(0x16301c, 0.96).fillRoundedRect(14, 12, CONFIG.GAME_WIDTH - 28, bottom - 12, 16);
    this.card.lineStyle(3, 0xffee58, 0.9).strokeRoundedRect(14, 12, CONFIG.GAME_WIDTH - 28, bottom - 12, 16);
  }

  // Dat o nhap len dung cho tren man hinh game (game co the bi co gian)
  placeInput() {
    const r = this.scene.game.canvas.getBoundingClientRect();
    const k = r.width / CONFIG.GAME_WIDTH;
    Object.assign(this.input.style, {
      left: `${r.left + (CX - INPUT.w / 2) * k}px`,
      top: `${r.top + (INPUT.y - INPUT.h / 2) * k}px`,
      width: `${INPUT.w * k}px`,
      height: `${INPUT.h * k}px`,
      fontSize: `${18 * k}px`,
    });
  }

  // onSave(name) tra ve Promise<{ ok, message, board }>
  async save() {
    if (!this.visible || this.saved || this.saving) return;
    const name = this.input.value.trim();
    if (name.length < 1 || name.length > MAX_NAME) {
      this.message.setText(`Nhập biệt danh từ 1 đến ${MAX_NAME} ký tự`);
      return;
    }
    this.saving = true;
    this.message.setText('Đang lưu...');
    const result = await this.onSave(name);
    this.saving = false;
    this.message.setText(result.message);
    if (!result.ok) return; // loi (vd mat ket noi): giu o nhap de thu lai

    this.saved = true;
    saveNickname(name);
    this.input.style.display = 'none';
    this.label.setVisible(false);
    this.setButton(this.saveBtn, false);
    this.message.setY(235);
    this.board.setText(result.board).setVisible(true);
    this.moveButton(this.restartBtn, RESTART_Y_WITH_BOARD);
  }

  // Tra ve true neu man hinh dang hien (da xu ly cham)
  tap(x, y) {
    if (!this.visible) return false;
    for (const btn of [this.saveBtn, this.restartBtn]) {
      if (btn.active && Math.abs(x - CX) <= BTN.w / 2 && Math.abs(y - btn.y) <= BTN.h / 2) btn.onTap();
    }
    return true;
  }

  destroy() {
    window.removeEventListener('resize', this.place);
    this.input.remove();
  }
}
