// Tao sprite sheet player (mascot robot xanh) vao /assets, 3 goc nhin: ngang (side), thang mat (front), quay lung (back).
// Chay: node tools/make-player.mjs [duong_dan_anh_xem_truoc.png]
//   player_idle.png : 5 goc nhin x 2 khung = 10 khung, cam sung (side, front, back, dfront, dback)
//   player_run.png  : 5 goc nhin x 4 khung = 20 khung, khong sung
//   player_shoot.png: E(2) SE(2) NE(2) S(2) N(2)           = 10 khung, moi huong 2 khung (ngam + giat co lua)
import fs from 'node:fs';
import { newFrame, put, rect, addOutline, sheet, encodePng } from './png.mjs';
import { AIM, muzzleOf } from '../src/playerAim.js';

const C = {
  body: [52, 128, 246],
  shade: [34, 84, 196],
  light: [110, 176, 255],
  spark: [214, 236, 255],
  foot: [28, 56, 170],
  ring: [160, 205, 238],
  glass: [84, 160, 248],
  cyan: [90, 235, 255],
  eyeWhite: [255, 255, 255],
  pupil: [14, 14, 40],
  gun: [66, 68, 80],
  flash: [255, 226, 90],
  flashHot: [255, 255, 210],
  outline: [14, 20, 70],
};

// Khoi co vien toi rieng (de tach tay khoi than cung mau)
const outlined = (f, x, y, w, h, c) => {
  rect(f, x - 1, y - 1, w + 2, h + 2, C.outline);
  rect(f, x, y, w, h, c);
};

// Duong day w x w pixel tu (x0,y0) toi (x1,y1)
function thickLine(f, x0, y0, x1, y1, w, c) {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    const y = y0 + ((y1 - y0) * i) / n;
    rect(f, Math.round(x - (w - 1) / 2), Math.round(y - (w - 1) / 2), w, w, c);
  }
}
// Chi tay: co vien toi
function limb(f, x0, y0, x1, y1, w, c) {
  thickLine(f, x0, y0, x1, y1, w + 2, C.outline);
  thickLine(f, x0, y0, x1, y1, w, c);
}

// Giay hinh vom (nua elip) o duoi chan
function shoe(f, cx, bottom) {
  const w = 8, h = 4;
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const dx = (i + 0.5 - w / 2) / (w / 2);
      const dy = (j + 0.5 - h) / h;
      if (dx * dx + dy * dy <= 1.1) put(f, cx - 3 + i, bottom - h + 1 + j, j >= h - 1 ? C.foot : C.body);
    }
  }
  rect(f, cx - 1, bottom - h + 1, 3, 1, C.light);
}

function leg(f, cx, lift) {
  const bottom = 39 - lift;
  rect(f, cx - 1, 28, 3, bottom - 4 - 28 + 1, C.shade);
  shoe(f, cx, bottom);
}

// Hinh dau chu nhat bo goc
function headShape(f, by) {
  const x0 = 11, y0 = 5 + by, w = 26, h = 15;
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const ex = Math.min(i, w - 1 - i);
      const ey = Math.min(j, h - 1 - j);
      if (ex + ey < 2) continue; // bo goc
      put(f, x0 + i, y0 + j, j >= h - 3 ? C.shade : C.body);
    }
  }
  rect(f, x0 + 3, y0 + 1, 12, 1, C.light);
  put(f, x0 + 2, y0 + 2, C.spark);
}

// Kinh tron + mat hinh thoi, pupilDx la do lech con ngươi (nhin sang phai = 1)
function goggle(f, cx, cy, pupilDx) {
  for (let y = cy - 5; y <= cy + 5; y++) {
    for (let x = cx - 5; x <= cx + 5; x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d <= 5.2 && d >= 4.1) put(f, x, y, C.ring);
      else if (d < 4.1) put(f, x, y, C.glass);
    }
  }
  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      if (Math.abs(dx) + Math.abs(dy) <= 4) put(f, cx + dx, cy + dy, C.eyeWhite);
      if (Math.abs(dx - pupilDx) + Math.abs(dy) <= 2) put(f, cx + dx, cy + dy, C.pupil);
    }
  }
  put(f, cx + 2, cy + 3, C.cyan);
  put(f, cx + 3, cy + 2, C.cyan);
}

function drawHeadSide(f, by) {
  headShape(f, by);
  goggle(f, 21, 12 + by, 1);
  goggle(f, 31, 12 + by, 1);
  rect(f, 25, 18 + by, 1, 2, C.eyeWhite);
  rect(f, 28, 18 + by, 1, 2, C.eyeWhite);
}

// diag = goc nhin cheo (mat xoay nhe sang phai)
function drawHeadFront(f, by, diag) {
  headShape(f, by);
  goggle(f, diag ? 20 : 18, 12 + by, diag ? 1 : 0);
  goggle(f, diag ? 30 : 29, 12 + by, diag ? 1 : 0);
  rect(f, diag ? 24 : 22, 18 + by, 1, 2, C.eyeWhite);
  rect(f, diag ? 27 : 25, 18 + by, 1, 2, C.eyeWhite);
}

function drawHeadBack(f, by, diag) {
  const s = diag ? 2 : 0;
  headShape(f, by);
  rect(f, 14 + s, 11 + by, 20 - s, 1, C.shade);
  rect(f, 17 + s, 14 + by, 14 - s, 2, C.shade);
  rect(f, 23 + s, 3 + by, 2, 2, C.light); // anten nho
}

// Tay buong xuong (dy: tay truot len/xuong khi chay)
function arm(f, x, by, dy = 0) {
  outlined(f, x, 22 + by + dy, 3, 4, C.shade);
  outlined(f, x - 1, 26 + by + dy, 4, 4, C.light);
}

// Ve sung tu ban tay: g = { hand, angle, len, grip, recoil, flash }
function drawGun(f, g, by) {
  const r = (g.angle * Math.PI) / 180;
  const dx = Math.cos(r);
  const dy = Math.sin(r);
  const back = g.recoil ? -1 : 0;
  const hx = g.hand[0] + dx * back;
  const hy = g.hand[1] + by + dy * back;
  const mx = hx + dx * g.len;
  const my = hy + dy * g.len;
  thickLine(f, hx, hy, mx, my, 3, C.gun);
  if (g.angle === 0 && g.grip !== false) rect(f, Math.round(hx) + 2, Math.round(hy) + 2, 2, 3, C.gun);
  outlined(f, Math.round(hx) - 2, Math.round(hy) - 2, 4, 4, C.light);
  if (g.flash) {
    const fx = Math.round(mx + dx * 3);
    const fy = Math.round(my + dy * 3);
    rect(f, fx - 2, fy - 2, 5, 5, C.flash);
    rect(f, fx - 1, fy - 1, 3, 3, C.flashHot);
  }
}

const gunOf = (key, extra = {}) => ({ hand: AIM[key].hand, angle: AIM[key].angle, len: AIM[key].len, ...extra });

// ---------------- Goc nhin ngang (quay mat sang phai) ----------------
// o: by, backDx, frontDx, legs[2], gun (hoac null), shoulder (khop vai noi voi ban tay)
function drawSide(o) {
  const f = newFrame();
  const by = o.by;
  arm(f, 14 + o.backDx, by);
  leg(f, o.legs[0].cx, o.legs[0].lift);
  leg(f, o.legs[1].cx, o.legs[1].lift);
  rect(f, 18, 20 + by, 12, 10, C.body);
  rect(f, 18, 27 + by, 12, 3, C.shade);
  rect(f, 20, 22 + by, 3, 1, C.light);
  drawHeadSide(f, by);
  if (o.gun) {
    limb(f, 30, 22 + by, o.gun.hand[0], o.gun.hand[1] + by, 3, C.shade);
    drawGun(f, o.gun, by);
  } else {
    arm(f, 30 + o.frontDx, by);
  }
  return addOutline(f, C.outline);
}

// ---------------- Cac goc nhin con lai ----------------
// view: front (thang mat), back (quay lung), dfront (cheo xuong), dback (cheo len)
// o: by, legs[2] (do nhac chan), armL, armR (dy), gun
function drawFrontBack(o) {
  const f = newFrame();
  const by = o.by;
  const back = o.view === 'back' || o.view === 'dback';
  const diag = o.view === 'dfront' || o.view === 'dback';
  const [lx, rx] = diag ? [21, 27] : [20, 28];
  if (!o.gun || back) {
    arm(f, 31, by, o.armR);
  }
  arm(f, 14, by, o.armL);
  leg(f, lx, o.legs[0]);
  leg(f, rx, o.legs[1]);
  rect(f, 18, 20 + by, 12, 10, C.body);
  rect(f, 18, 27 + by, 12, 3, C.shade);
  if (back) {
    rect(f, 21, 22 + by, 6, 4, C.shade);
    rect(f, 23, 23 + by, 2, 1, C.light);
  } else {
    rect(f, 20, 22 + by, 3, 1, C.light);
  }
  if (back) drawHeadBack(f, by, diag);
  else drawHeadFront(f, by, diag);
  if (o.gun) {
    // Tay cam sung duoi tu vai phai toi ban tay
    limb(f, back ? 32 : 31, 22 + by, o.gun.hand[0], o.gun.hand[1] + by - 1, 3, C.shade);
    drawGun(f, o.gun, by);
  }
  return addOutline(f, C.outline);
}

// ---------------- Cac chuoi khung ----------------
const standSide = [{ cx: 21, lift: 0 }, { cx: 27, lift: 0 }];
const carrySide = { hand: [34, 24], angle: 0, len: 8 };
const carryFront = { hand: [33, 30], angle: 90, len: 5 };
const carryDiag = { hand: [34, 28], angle: 45, len: 6 };

// Thu tu goc nhin trong sheet idle / run (game dung cung thu tu nay)
const VIEWS = ['side', 'front', 'back', 'dfront', 'dback'];

const idle = [];
for (const view of VIEWS) {
  for (const by of [0, 1]) {
    if (view === 'side') idle.push(drawSide({ by, legs: standSide, backDx: 0, gun: carrySide }));
    else {
      const gun = view === 'front' ? carryFront : view === 'dfront' ? carryDiag : null;
      idle.push(drawFrontBack({ view, by, legs: [0, 0], armL: 0, armR: 0, gun }));
    }
  }
}

const run = [
  drawSide({ by: 0, backDx: -2, frontDx: 2, legs: [{ cx: 19, lift: 1 }, { cx: 29, lift: 0 }] }),
  drawSide({ by: -1, backDx: 0, frontDx: 0, legs: [{ cx: 24, lift: 2 }, { cx: 24, lift: 0 }] }),
  drawSide({ by: 0, backDx: 2, frontDx: -2, legs: [{ cx: 29, lift: 0 }, { cx: 19, lift: 1 }] }),
  drawSide({ by: -1, backDx: 0, frontDx: 0, legs: [{ cx: 24, lift: 0 }, { cx: 24, lift: 2 }] }),
];
for (const view of VIEWS.slice(1)) {
  run.push(
    drawFrontBack({ view, by: 0, legs: [3, 0], armL: -2, armR: 2 }),
    drawFrontBack({ view, by: -1, legs: [0, 0], armL: 0, armR: 0 }),
    drawFrontBack({ view, by: 0, legs: [0, 3], armL: 2, armR: -2 }),
    drawFrontBack({ view, by: -1, legs: [0, 0], armL: 0, armR: 0 })
  );
}

const shoot = [];
for (const key of ['E', 'SE', 'NE', 'S', 'N']) {
  for (const recoil of [false, true]) {
    const gun = gunOf(key, { recoil, flash: recoil });
    const view = AIM[key].view;
    if (view === 'side') {
      shoot.push(drawSide({ by: 0, legs: standSide, backDx: 0, gun }));
    } else {
      shoot.push(drawFrontBack({ view, by: 0, legs: [0, 0], armL: 0, armR: 0, gun }));
    }
  }
}

const write = (name, frames) => fs.writeFileSync(`assets/${name}.png`, encodePng(sheet(frames)));
write('player_idle', idle);
write('player_run', run);
write('player_shoot', shoot);

if (process.argv[2]) {
  const bg = [59, 122, 51];
  fs.writeFileSync(process.argv[2], encodePng(sheet(idle, 6, bg)));
  fs.writeFileSync(process.argv[2].replace('.png', '_run.png'), encodePng(sheet(run, 4, bg)));
  fs.writeFileSync(process.argv[2].replace('.png', '_shoot.png'), encodePng(sheet(shoot, 6, bg)));
}
console.log('done', muzzleOf('E'));
