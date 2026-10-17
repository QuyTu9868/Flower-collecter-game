// Tao sprite 5 nhan vat player (chon o man hinh chinh) vao /assets/player_<id>_idle|run|shoot.png.
// Cung cau truc voi mascot (tools/make-player.mjs): 5 goc nhin (side, front, back, dfront, dback), game lat trai/phai de du 8 huong.
//   idle  : 5 goc nhin x 2 khung = 10 khung, cam sung
//   run   : 5 goc nhin x 4 khung = 20 khung, khong sung
//   shoot : 5 huong (E, SE, NE, S, N) x 2 khung = 10 khung
// Chay: node tools/make-players.mjs [duong_dan_anh_xem_truoc.png]
import fs from 'node:fs';
import { newFrame, put, rect, addOutline, ellipse, sheet, encodePng } from './png.mjs';
import { AIM } from '../src/playerAim.js';

const OUT = [26, 20, 34];
const WHITE = [255, 255, 255];
const GUN = [66, 68, 80];

const outlined = (f, x, y, w, h, c) => {
  rect(f, x - 1, y - 1, w + 2, h + 2, OUT);
  rect(f, x, y, w, h, c);
};

function thickLine(f, x0, y0, x1, y1, w, c) {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  for (let i = 0; i <= n; i++) {
    rect(f, Math.round(x0 + ((x1 - x0) * i) / n - (w - 1) / 2), Math.round(y0 + ((y1 - y0) * i) / n - (w - 1) / 2), w, w, c);
  }
}
function limb(f, x0, y0, x1, y1, w, c) {
  thickLine(f, x0, y0, x1, y1, w + 2, OUT);
  thickLine(f, x0, y0, x1, y1, w, c);
}

// ---------- phan than chung (chan, tay, sung) ----------
function shoe(f, cx, bottom, pal) {
  const w = 8, h = 4;
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const dx = (i + 0.5 - w / 2) / (w / 2);
      const dy = (j + 0.5 - h) / h;
      if (dx * dx + dy * dy <= 1.1) put(f, cx - 3 + i, bottom - h + 1 + j, j >= h - 1 ? pal.shoeD : pal.shoe);
    }
  }
  rect(f, cx - 1, bottom - h + 1, 3, 1, pal.shoeL);
}
function leg(f, cx, lift, pal) {
  const bottom = 39 - lift;
  rect(f, cx - 1, 28, 3, bottom - 4 - 28 + 1, pal.pants);
  rect(f, cx - 1, 28, 1, bottom - 4 - 28 + 1, pal.pantsD);
  shoe(f, cx, bottom, pal);
}
function arm(f, x, by, pal, dy = 0) {
  outlined(f, x, 22 + by + dy, 3, 4, pal.sleeve);
  outlined(f, x - 1, 26 + by + dy, 4, 4, pal.hand);
}
function drawGun(f, g, by, pal) {
  const r = (g.angle * Math.PI) / 180;
  const dx = Math.cos(r);
  const dy = Math.sin(r);
  const back = g.recoil ? -1 : 0;
  const hx = g.hand[0] + dx * back;
  const hy = g.hand[1] + by + dy * back;
  const mx = hx + dx * g.len;
  const my = hy + dy * g.len;
  thickLine(f, hx, hy, mx, my, 3, GUN);
  if (g.angle === 0) rect(f, Math.round(hx) + 2, Math.round(hy) + 2, 2, 3, GUN);
  outlined(f, Math.round(hx) - 2, Math.round(hy) - 2, 4, 4, pal.hand);
  if (g.flash) {
    const fx = Math.round(mx + dx * 3);
    const fy = Math.round(my + dy * 3);
    rect(f, fx - 2, fy - 2, 5, 5, [255, 226, 90]);
    rect(f, fx - 1, fy - 1, 3, 3, [255, 255, 210]);
  }
}
const gunOf = (key, extra = {}) => ({ hand: AIM[key].hand, angle: AIM[key].angle, len: AIM[key].len, ...extra });

function torsoBase(f, by, pal) {
  rect(f, 18, 20 + by, 12, 10, pal.torso);
  rect(f, 18, 27 + by, 12, 3, pal.torsoD);
}

// Ve 1 khung cho 1 nhan vat S o goc nhin view. o: by, legs, armL, armR, backDx, frontDx, gun
function drawPerson(S, view, o) {
  const f = newFrame();
  const by = o.by;
  const pal = S.pal;
  const side = view === 'side';
  const back = view === 'back' || view === 'dback';
  const diag = view === 'dfront' || view === 'dback';

  if (side) {
    arm(f, 14 + (o.backDx ?? 0), by, pal);
    leg(f, o.legs[0].cx, o.legs[0].lift, pal);
    leg(f, o.legs[1].cx, o.legs[1].lift, pal);
  } else {
    if (!o.gun || back) arm(f, 31, by, pal, o.armR ?? 0);
    arm(f, 14, by, pal, o.armL ?? 0);
    const [lx, rx] = diag ? [21, 27] : [20, 28];
    leg(f, lx, o.legs[0], pal);
    leg(f, rx, o.legs[1], pal);
  }
  torsoBase(f, by, pal);
  S.torso(f, view, by);
  S.head(f, view, by);

  if (o.gun) {
    limb(f, side || !back ? 30 : 32, 22 + by, o.gun.hand[0], o.gun.hand[1] + by - (side ? 0 : 1), 3, pal.sleeve);
    drawGun(f, o.gun, by, pal);
  } else if (side) {
    arm(f, 30 + (o.frontDx ?? 0), by, pal);
  }
  return addOutline(f, OUT);
}

// ---------- 5 nhan vat ----------
const FX = { front: 0, dfront: 2, side: 4, back: 0, dback: 2 };
const isBack = (v) => v === 'back' || v === 'dback';

// Mat (2 mat o 2 ben, dich theo huong nhin) + mieng; eye(f, x, y) ve 1 mat
function faceAt(view, by, eyeFn, mouthFn) {
  return (f) => {
    const fx = FX[view];
    const xs = view === 'side' ? [25, 31] : [19 + fx, 27 + fx];
    xs.forEach((x) => eyeFn(f, x, 13 + by));
    mouthFn(f, 23 + fx, 18 + by);
  };
}

// 1) Le33M: khi doi mu sat vang cai long do, gang tay quyen anh do, ao vang co day chuyen
const M = {
  fur: [238, 230, 196], furD: [206, 196, 160], helm: [250, 170, 40], helmL: [255, 210, 110], helmD: [214, 130, 20],
  crest: [226, 48, 56], black: [30, 28, 34],
};
const le33m = {
  id: 'le33m',
  pal: {
    torso: [244, 190, 50], torsoD: [214, 150, 30], sleeve: [244, 190, 50], hand: [226, 48, 56],
    pants: [58, 44, 40], pantsD: [40, 30, 28], shoe: [226, 48, 56], shoeD: [160, 30, 40], shoeL: [255, 130, 130],
  },
  torso(f, view, by) {
    if (isBack(view)) return;
    rect(f, 22, 22 + by, 4, 1, [255, 244, 190]);
    put(f, 23, 23 + by, [255, 244, 190]);
    put(f, 24, 24 + by, [255, 244, 190]);
    rect(f, 23, 25 + by, 2, 2, [255, 230, 120]);
  },
  head(f, view, by) {
    const fx = FX[view];
    ellipse(f, 24, 12 + by, 11, 8, M.fur);
    if (isBack(view)) {
      ellipse(f, 24, 10 + by, 12, 9, M.helm);
      rect(f, 16, 5 + by, 6, 1, M.helmL);
      rect(f, 14, 17 + by, 20, 1, M.helmD);
      rect(f, 22 + fx, 1 + by, 4, 5, M.crest);
      return;
    }
    if (view !== 'side') {
      ellipse(f, 11, 14 + by, 2, 3, M.fur);
      ellipse(f, 37, 14 + by, 2, 3, M.fur);
    } else {
      ellipse(f, 19, 15 + by, 2, 3, M.fur);
    }
    ellipse(f, 24, 10 + by, 12, 9, M.helm);
    rect(f, 12, 12 + by, 4, 8, M.helm);
    rect(f, 32, 12 + by, 4, 8, M.helm);
    rect(f, 16, 5 + by, 6, 1, M.helmL);
    rect(f, 22 + fx, 1 + by, 4, 5, M.crest);
    rect(f, 23 + fx, 0 + by, 2, 1, M.crest);
    ellipse(f, 24 + fx, 16 + by, 7, 5, M.fur);
    const xs = view === 'side' ? [25, 31] : [19 + fx, 26 + fx];
    for (const x of xs) {
      rect(f, x, 14 + by, 4, 2, WHITE);
      rect(f, x + 1, 15 + by, 2, 1, M.black);
      rect(f, x, 14 + by, 4, 1, M.black);
    }
    put(f, 24 + fx, 17 + by, M.furD);
    put(f, 27 + fx, 19 + by, WHITE);
    rect(f, 22 + fx, 19 + by, 4, 1, M.black);
  },
};

// 2) Quang: dau troc deo kinh, cuoi, hoodie phi hanh gia trang vien xanh
const Q = { skin: [250, 214, 176], skinD: [226, 178, 140], blue: [52, 52, 204], white: [248, 248, 252], whiteD: [212, 216, 236], glass: [210, 236, 248], frame: [40, 40, 52] };
const quang = {
  id: 'quang',
  pal: {
    torso: Q.white, torsoD: Q.whiteD, sleeve: Q.white, hand: Q.skin,
    pants: [44, 50, 104], pantsD: [32, 36, 80], shoe: [244, 244, 250], shoeD: Q.blue, shoeL: WHITE,
  },
  torso(f, view, by) {
    if (isBack(view)) {
      rect(f, 20, 20 + by, 8, 3, Q.whiteD);
      return;
    }
    rect(f, 20, 20 + by, 8, 2, Q.blue);
    rect(f, 22, 21 + by, 1, 5, Q.blue);
    rect(f, 26, 21 + by, 1, 5, Q.blue);
    rect(f, 22, 25 + by, 5, 3, Q.blue);
    put(f, 24, 25 + by, WHITE);
    put(f, 25, 26 + by, WHITE);
  },
  head(f, view, by) {
    const fx = FX[view];
    ellipse(f, 24, 12 + by, 11, 8, Q.skin);
    rect(f, 16, 17 + by, 16, 2, Q.skinD);
    ellipse(f, 12, 13 + by, 2, 3, Q.skin);
    ellipse(f, 36, 13 + by, 2, 3, Q.skin);
    rect(f, 18, 5 + by, 6, 1, [255, 236, 210]);
    if (isBack(view)) return;
    const xs = view === 'side' ? [25, 31] : [17 + fx, 26 + fx];
    for (const x of xs) {
      rect(f, x, 11 + by, 6, 4, Q.frame);
      rect(f, x + 1, 12 + by, 4, 2, Q.glass);
      put(f, x + 2, 12 + by, [90, 160, 230]);
    }
    rect(f, 23 + fx, 12 + by, 3, 1, Q.frame);
    rect(f, 22 + fx, 17 + by, 5, 2, [120, 40, 50]);
    rect(f, 23 + fx, 17 + by, 3, 1, WHITE);
  },
};

// 3) Tim: toc den bu xu, mat tron nau, "u" meo, vest xanh navy ca vat, cuc xanh tren dau
const T = { skin: [226, 170, 112], hair: [28, 32, 64], hairL: [64, 76, 130], blob: [74, 124, 224], navy: [38, 50, 108], lav: [204, 184, 242] };
const tim = {
  id: 'tim',
  pal: {
    torso: T.navy, torsoD: [26, 36, 84], sleeve: T.navy, hand: T.skin,
    pants: [34, 44, 96], pantsD: [24, 32, 72], shoe: [30, 28, 40], shoeD: [18, 16, 26], shoeL: [90, 90, 110],
  },
  torso(f, view, by) {
    if (isBack(view)) return;
    rect(f, 22, 20 + by, 4, 5, T.lav);
    rect(f, 23, 21 + by, 2, 6, [38, 38, 130]);
  },
  head(f, view, by) {
    const fx = FX[view];
    ellipse(f, 24, 10 + by, 12, 9, T.hair);
    ellipse(f, 30, 3 + by, 4, 2, T.blob);
    put(f, 29, 3 + by, [30, 40, 90]);
    put(f, 32, 3 + by, [30, 40, 90]);
    if (isBack(view)) {
      ellipse(f, 24, 13 + by, 11, 8, T.hair);
      rect(f, 16, 8 + by, 4, 1, T.hairL);
      rect(f, 26, 9 + by, 5, 1, T.hairL);
      return;
    }
    ellipse(f, 24, 14 + by, 10, 7, T.skin);
    rect(f, 13, 8 + by, 22, 3, T.hair);
    for (let x = 13; x <= 34; x += 2) put(f, x, 11 + by, T.hair);
    rect(f, 13, 11 + by, 3, 6, T.hair);
    rect(f, 32, 11 + by, 3, 8, T.hair);
    rect(f, 17, 6 + by, 5, 1, T.hairL);
    const xs = view === 'side' ? [26, 32] : [18 + fx, 28 + fx];
    for (const x of xs) rect(f, x, 13 + by, 2, 3, [40, 20, 20]);
    rect(f, 15 + fx, 16 + by, 3, 2, [240, 150, 140]);
    rect(f, 31 + fx, 16 + by, 3, 2, [240, 150, 140]);
    put(f, 22 + fx, 17 + by, [90, 50, 40]);
    put(f, 23 + fx, 18 + by, [90, 50, 40]);
    put(f, 24 + fx, 17 + by, [90, 50, 40]);
    put(f, 25 + fx, 18 + by, [90, 50, 40]);
    put(f, 26 + fx, 17 + by, [90, 50, 40]);
  },
};

// 4) Conal: mu luoi trai xanh "DLICOM", toc va rau xam, mat to trang vien den, ao khoac xanh
const C4 = { cap: [26, 42, 104], capD: [16, 26, 70], gray: [188, 184, 178], grayD: [150, 146, 142], skin: [244, 150, 160], jacket: [30, 48, 110], tee: [142, 142, 150] };
const conal = {
  id: 'conal',
  pal: {
    torso: C4.jacket, torsoD: [20, 34, 86], sleeve: C4.jacket, hand: C4.skin,
    pants: [34, 38, 60], pantsD: [24, 26, 44], shoe: [40, 40, 50], shoeD: [24, 24, 32], shoeL: [100, 100, 116],
  },
  torso(f, view, by) {
    if (isBack(view)) return;
    rect(f, 22, 20 + by, 4, 10, C4.tee);
  },
  head(f, view, by) {
    const fx = FX[view];
    ellipse(f, 24, 12 + by, 11, 8, C4.skin);
    ellipse(f, 12, 14 + by, 2, 3, C4.skin);
    ellipse(f, 36, 14 + by, 2, 3, C4.skin);
    if (isBack(view)) {
      ellipse(f, 24, 13 + by, 11, 8, C4.gray);
      ellipse(f, 24, 7 + by, 12, 6, C4.cap);
      rect(f, 18, 12 + by, 12, 1, C4.capD);
      return;
    }
    // rau xam quanh ham
    ellipse(f, 24, 18 + by, 10, 4, C4.gray);
    rect(f, 13, 12 + by, 3, 6, C4.gray);
    rect(f, 32, 12 + by, 3, 6, C4.gray);
    for (let x = 14; x <= 34; x += 2) put(f, x, 21 + by, C4.gray);
    rect(f, 20 + fx, 17 + by, 8, 3, C4.skin);
    rect(f, 22 + fx, 18 + by, 4, 1, [30, 24, 30]);
    const xs = view === 'side' ? [25, 31] : [17 + fx, 26 + fx];
    for (const x of xs) {
      rect(f, x, 12 + by, 5, 5, [20, 20, 28]);
      rect(f, x + 1, 13 + by, 3, 3, WHITE);
    }
    rect(f, 17 + fx, 11 + by, 5, 1, C4.grayD);
    rect(f, 26 + fx, 11 + by, 5, 1, C4.grayD);
    // mu luoi trai: mui o phia truoc
    ellipse(f, 24, 7 + by, 12, 6, C4.cap);
    if (view === 'side') rect(f, 26, 10 + by, 12, 2, C4.capD);
    else rect(f, 13, 10 + by, 22, 2, C4.capD);
    for (let x = 19; x <= 29; x += 2) put(f, x + fx, 6 + by, WHITE);
  },
};

// 5) QuyTu: nam toc den, deo kinh ram den, ao thun xanh nhat co logo tron, quan jean, giay trang
const U = { skin: [250, 214, 190], skinD: [222, 176, 150], hair: [24, 24, 32], hairL: [70, 72, 96], tee: [150, 200, 240], teeD: [116, 166, 214], black: [20, 20, 26] };
const quytu = {
  id: 'quytu',
  pal: {
    torso: U.tee, torsoD: U.teeD, sleeve: U.tee, hand: U.skin,
    pants: [52, 74, 124], pantsD: [38, 54, 96], shoe: [244, 248, 252], shoeD: [150, 160, 190], shoeL: WHITE,
  },
  torso(f, view, by) {
    if (isBack(view)) return;
    rect(f, 22, 22 + by, 4, 4, WHITE);
    put(f, 24, 23 + by, [60, 80, 200]);
    put(f, 24, 24 + by, [60, 80, 200]);
    put(f, 23, 25 + by, [60, 80, 200]);
  },
  head(f, view, by) {
    const fx = FX[view];
    ellipse(f, 24, 12 + by, 11, 8, U.skin);
    rect(f, 16, 18 + by, 16, 2, U.skinD);
    ellipse(f, 12, 14 + by, 2, 3, U.skin);
    ellipse(f, 36, 14 + by, 2, 3, U.skin);
    if (isBack(view)) {
      // toc den phu kin phia sau dau
      ellipse(f, 24, 11 + by, 12, 9, U.hair);
      rect(f, 17, 5 + by, 6, 1, U.hairL);
      rect(f, 14, 14 + by, 3, 4, U.hair);
      rect(f, 31, 14 + by, 3, 4, U.hair);
      return;
    }
    // toc den: dinh dau xu nhe + mai nghieng
    ellipse(f, 24, 7 + by, 12, 4, U.hair);
    rect(f, 13, 8 + by, 2, 5, U.hair);
    rect(f, 33, 8 + by, 2, 5, U.hair);
    rect(f, 15, 8 + by, 18, 2, U.hair);
    for (let x = 16; x <= 31; x += 3) put(f, x + (x % 2), 10 + by, U.hair);
    rect(f, 18, 4 + by, 6, 1, U.hairL);
    rect(f, 22, 2 + by, 2, 2, U.hair);
    rect(f, 26, 3 + by, 3, 1, U.hair);
    // kinh ram den
    const xs = view === 'side' ? [25, 31] : [17 + fx, 26 + fx];
    for (const x of xs) {
      rect(f, x - 1, 12 + by, 8, 1, [70, 72, 92]);
      rect(f, x, 13 + by, 6, 3, U.black);
      put(f, x + 1, 13 + by, [150, 160, 200]);
      put(f, x + 2, 14 + by, [80, 90, 130]);
    }
    rect(f, 23 + fx, 13 + by, 3, 1, [70, 72, 92]);
    rect(f, 22 + fx, 18 + by, 4, 1, [196, 100, 96]);
  },
};

const PLAYERS = [le33m, quang, tim, conal, quytu];

// ---------- cac chuoi khung (giong mascot) ----------
const VIEWS = ['side', 'front', 'back', 'dfront', 'dback'];
const standSide = [{ cx: 21, lift: 0 }, { cx: 27, lift: 0 }];
const carry = { side: { hand: [34, 24], angle: 0, len: 8 }, front: { hand: [33, 30], angle: 90, len: 5 }, dfront: { hand: [34, 28], angle: 45, len: 6 } };

function build(S) {
  const idle = [];
  for (const view of VIEWS) {
    for (const by of [0, 1]) {
      if (view === 'side') idle.push(drawPerson(S, view, { by, legs: standSide, gun: carry.side }));
      else idle.push(drawPerson(S, view, { by, legs: [0, 0], armL: 0, armR: 0, gun: carry[view] }));
    }
  }
  const run = [
    drawPerson(S, 'side', { by: 0, backDx: -2, frontDx: 2, legs: [{ cx: 19, lift: 1 }, { cx: 29, lift: 0 }] }),
    drawPerson(S, 'side', { by: -1, backDx: 0, frontDx: 0, legs: [{ cx: 24, lift: 2 }, { cx: 24, lift: 0 }] }),
    drawPerson(S, 'side', { by: 0, backDx: 2, frontDx: -2, legs: [{ cx: 29, lift: 0 }, { cx: 19, lift: 1 }] }),
    drawPerson(S, 'side', { by: -1, backDx: 0, frontDx: 0, legs: [{ cx: 24, lift: 0 }, { cx: 24, lift: 2 }] }),
  ];
  for (const view of VIEWS.slice(1)) {
    run.push(
      drawPerson(S, view, { by: 0, legs: [3, 0], armL: -2, armR: 2 }),
      drawPerson(S, view, { by: -1, legs: [0, 0], armL: 0, armR: 0 }),
      drawPerson(S, view, { by: 0, legs: [0, 3], armL: 2, armR: -2 }),
      drawPerson(S, view, { by: -1, legs: [0, 0], armL: 0, armR: 0 })
    );
  }
  const shoot = [];
  for (const key of ['E', 'SE', 'NE', 'S', 'N']) {
    for (const recoil of [false, true]) {
      const gun = gunOf(key, { recoil, flash: recoil });
      const view = AIM[key].view;
      if (view === 'side') shoot.push(drawPerson(S, view, { by: 0, legs: standSide, gun }));
      else shoot.push(drawPerson(S, view, { by: 0, legs: [0, 0], armL: 0, armR: 0, gun }));
    }
  }
  return { idle, run, shoot };
}

const write = (name, frames) => fs.writeFileSync(`assets/${name}.png`, encodePng(sheet(frames)));
const previews = [];
for (const S of PLAYERS) {
  const { idle, run, shoot } = build(S);
  write(`player_${S.id}_idle`, idle);
  write(`player_${S.id}_run`, run);
  write(`player_${S.id}_shoot`, shoot);
  // Anh xem truoc: idle (10 khung: moi goc nhin khung dau) + 2 khung ban
  previews.push([S.id, [idle[0], idle[2], idle[4], idle[6], idle[8], shoot[1], shoot[3], shoot[7], shoot[9]]]);
}
if (process.argv[2]) {
  for (const [id, frames] of previews) {
    fs.writeFileSync(process.argv[2].replace('.png', `_${id}.png`), encodePng(sheet(frames, 8, [118, 200, 97])));
  }
}
console.log('done', PLAYERS.map((p) => p.id).join(' '));
