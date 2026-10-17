// 11 NPC tiep theo (npc07 den npc17), ve theo hinh nguoi dung dua. Cung kieu voi npc-characters.mjs:
//   draw({ oy, hy, arms, happy, hearts })  -  oy: nhay len, hy: dau nhun, arms: 0 xuong / 1 dang ngang / 2 gio len
import { newFrame, put, rect, addOutline, ellipse } from './png.mjs';
import { OUT, WHITE, drawHearts, eyes, arms } from './npc-characters.mjs';

// Mat to kieu anime: vach mi + mat 3x4 + 2 diem sang. Mat vui thi ve cung ^ ^
function eyesBig(f, y, iris, happy, line) {
  if (happy) return eyes(f, y, iris, true, line);
  for (const e of [18, 27]) {
    rect(f, e - 1, y - 1, 5, 1, line);
    rect(f, e, y, 3, 4, iris);
    put(f, e, y, WHITE);
    put(f, e + 2, y + 2, WHITE);
  }
}

// Quan dai + giay
function legs(f, oy, P) {
  rect(f, 18, 30 + oy, 12, 5, P.pants);
  rect(f, 17, 35 + oy, 14, 2, P.pants);
  rect(f, 23, 33 + oy, 2, 4, P.pantsShade);
  rect(f, 17, 37 + oy, 6, 3, P.shoe);
  rect(f, 25, 37 + oy, 6, 3, P.shoe);
}

// Vay ngan xoe + chan tran
function skirt(f, oy, P) {
  rect(f, 17, 30 + oy, 14, 2, P.skirt);
  rect(f, 16, 32 + oy, 16, 2, P.skirt);
  rect(f, 15, 34 + oy, 18, 2, P.skirt);
  rect(f, 15, 35 + oy, 18, 1, P.skirtShade);
  rect(f, 19, 36 + oy, 3, 2, P.skin);
  rect(f, 26, 36 + oy, 3, 2, P.skin);
  rect(f, 18, 38 + oy, 5, 2, P.shoe);
  rect(f, 26, 38 + oy, 5, 2, P.shoe);
}

const torso = (f, oy, color, shade) => {
  rect(f, 17, 23 + oy, 14, 8, color);
  rect(f, 17, 28 + oy, 14, 2, shade);
};

const finish = (f, o) => {
  drawHearts(f, o.hearts);
  return addOutline(f, OUT);
};

// ---------------------------------------------------------------------------
// npc07 Dezzy: toc xanh la, kinh vang tut xuong mui, ao len den co ao trang, quan jean, tui deo cheo
const Z = {
  hair: [70, 214, 50], hairL: [150, 255, 110], hairD: [36, 150, 30], skin: [255, 228, 208], iris: [40, 170, 60],
  sweater: [30, 32, 42], sweaterL: [60, 64, 80], pants: [52, 86, 150], pantsShade: [38, 64, 118], shoe: [30, 30, 38],
  yellow: [252, 196, 40], frame: [20, 20, 26], bag: [58, 60, 70],
};

function dezzy(o) {
  const f = newFrame();
  const oy = o.oy ?? 0;
  const hy = oy + (o.hy ?? 0);
  legs(f, oy, Z);
  torso(f, oy, Z.sweater, Z.sweater);
  rect(f, 20, 22 + oy, 9, 2, WHITE);
  rect(f, 22, 24 + oy, 5, 1, WHITE);
  rect(f, 23, 25 + oy, 3, 1, WHITE);
  arms(f, o, { sleeve: Z.sweater, skin: Z.skin, cuff: Z.sweaterL, noHands: true });
  for (let t = 0; t < 12; t++) put(f, 18 + t, 23 + oy + Math.round(t * 0.7), Z.bag);
  rect(f, 30, 29 + oy, 4, 5, Z.bag);

  ellipse(f, 24, 13 + hy, 13, 10, Z.hair);
  rect(f, 11, 15 + hy, 4, 11, Z.hair);
  rect(f, 33, 15 + hy, 4, 11, Z.hair);
  rect(f, 11, 22 + hy, 2, 4, Z.hairD);
  ellipse(f, 24, 15 + hy, 9, 7, Z.skin);
  rect(f, 15, 8 + hy, 18, 4, Z.hair);
  for (let x = 15; x <= 32; x += 3) put(f, x, 12 + hy, Z.hair);
  rect(f, 15, 12 + hy, 2, 5, Z.hair);
  rect(f, 31, 12 + hy, 2, 5, Z.hair);
  rect(f, 19, 5 + hy, 6, 1, Z.hairL);

  eyesBig(f, 15 + hy, Z.iris, false, Z.frame);
  // kinh vang tut xuong, gong den
  rect(f, 16, 13 + hy, 18, 1, Z.frame);
  rect(f, 17, 14 + hy, 7, 4, Z.yellow);
  rect(f, 26, 14 + hy, 7, 4, Z.yellow);
  rect(f, 24, 14 + hy, 2, 1, Z.frame);
  rect(f, 18, 15 + hy, 4, 1, [255, 232, 140]);
  rect(f, 22, 20 + hy, 2, 1, [190, 110, 110]);
  return finish(f, o);
}

// ---------------------------------------------------------------------------
// npc08 Cipher: toc nau vang gon song dai, mu luoi trai den "PLEASE BE PATIENT", mat nau to, ao thun trang
const C8 = {
  hair: [176, 112, 70], hairL: [238, 178, 112], hairD: [128, 74, 48], skin: [255, 222, 200], iris: [126, 86, 48],
  cap: [26, 26, 32], capL: [66, 66, 78], text: [222, 222, 234], shirt: [246, 246, 250], shirtShade: [220, 222, 234],
  pants: [60, 96, 160], pantsShade: [44, 72, 126], shoe: [244, 244, 248],
};

function cipher(o) {
  const f = newFrame();
  const oy = o.oy ?? 0;
  const hy = oy + (o.hy ?? 0);
  legs(f, oy, C8);
  torso(f, oy, C8.shirt, C8.shirtShade);
  arms(f, o, { sleeve: C8.shirt, skin: C8.skin });

  ellipse(f, 24, 13 + hy, 13, 10, C8.hair);
  rect(f, 10, 15 + hy, 5, 18, C8.hair);
  rect(f, 33, 15 + hy, 5, 18, C8.hair);
  for (let y = 18; y <= 32; y += 4) {
    put(f, 9, y + hy, C8.hair);
    put(f, 38, y + 2 + hy, C8.hair);
  }
  rect(f, 10, 26 + hy, 2, 7, C8.hairD);
  rect(f, 36, 26 + hy, 2, 7, C8.hairD);
  rect(f, 12, 18 + hy, 2, 4, C8.hairL);
  ellipse(f, 24, 15 + hy, 9, 7, C8.skin);

  eyesBig(f, 15 + hy, C8.iris, o.happy, C8.hairD);
  rect(f, 16, 19 + hy, 3, 1, [255, 168, 160]);
  rect(f, 30, 19 + hy, 3, 1, [255, 168, 160]);
  rect(f, 24, 20 + hy, 2, 1, [214, 118, 118]);

  // mu luoi trai: mui cong + chu tren mui
  ellipse(f, 24, 8 + hy, 13, 6, C8.cap);
  rect(f, 24, 11 + hy, 15, 3, C8.cap);
  rect(f, 26, 13 + hy, 12, 1, C8.capL);
  for (let x = 17; x <= 29; x += 2) put(f, x, 7 + hy, C8.text);
  return finish(f, o);
}

// ---------------------------------------------------------------------------
// npc09 Papii: toc tim xu, kep do, mat to trang vien den, mieng cuoi co rang nanh, ao hoodie nau, om bup be
const Pp = {
  hair: [186, 170, 250], hairL: [222, 212, 255], hairD: [150, 134, 220], skin: [255, 236, 214],
  hoodie: [152, 108, 48], hoodieD: [112, 76, 34], cream: [250, 232, 190], pants: [78, 60, 44], pantsShade: [56, 42, 30],
  shoe: [60, 50, 40], pin: [210, 54, 64], line: [34, 30, 44], plushHair: [66, 62, 70], plushShirt: [250, 172, 194],
};

function papii(o) {
  const f = newFrame();
  const oy = o.oy ?? 0;
  const hy = oy + (o.hy ?? 0);
  legs(f, oy, Pp);
  torso(f, oy, Pp.hoodie, Pp.hoodieD);
  rect(f, 16, 22 + oy, 16, 3, Pp.hoodie);
  rect(f, 21, 25 + oy, 1, 5, WHITE);
  rect(f, 27, 25 + oy, 1, 5, WHITE);
  rect(f, 23, 27 + oy, 3, 2, Pp.cream);
  arms(f, o, { sleeve: Pp.hoodie, skin: Pp.skin });

  // bup be nho om tay trai: toc den, ao hong
  ellipse(f, 8, 29 + oy, 4, 3.5, Pp.skin);
  rect(f, 4, 25 + oy, 9, 3, Pp.plushHair);
  rect(f, 5, 32 + oy, 7, 5, Pp.plushShirt);
  put(f, 6, 29 + oy, Pp.line);
  put(f, 10, 29 + oy, Pp.line);

  ellipse(f, 24, 12 + hy, 13, 10, Pp.hair);
  rect(f, 11, 14 + hy, 4, 9, Pp.hair);
  rect(f, 33, 14 + hy, 4, 7, Pp.hair);
  put(f, 10, 21 + hy, Pp.hair);
  put(f, 37, 20 + hy, Pp.hair);
  rect(f, 11, 20 + hy, 2, 3, Pp.hairD);
  ellipse(f, 24, 15 + hy, 9, 7, Pp.skin);
  rect(f, 15, 8 + hy, 18, 3, Pp.hair);
  for (let x = 15; x <= 32; x += 2) put(f, x, 11 + hy, Pp.hair);
  rect(f, 15, 11 + hy, 2, 5, Pp.hair);
  rect(f, 31, 11 + hy, 2, 5, Pp.hair);
  rect(f, 19, 5 + hy, 6, 1, Pp.hairL);
  rect(f, 14, 9 + hy, 3, 1, Pp.pin);
  rect(f, 14, 11 + hy, 3, 1, Pp.pin);

  // mat to trang vien den, day mat hong
  const y = 14 + hy;
  if (o.happy) {
    eyes(f, 15 + hy, Pp.line, true, Pp.line);
  } else {
    for (const e of [18, 27]) {
      rect(f, e - 1, y, 5, 5, Pp.line);
      rect(f, e, y + 1, 3, 3, WHITE);
      rect(f, e, y + 3, 3, 1, [250, 170, 200]);
    }
  }
  rect(f, 22, 20 + hy, 5, 2, [246, 120, 128]);
  put(f, 23, 20 + hy, WHITE);
  put(f, 33, 18 + hy, Pp.line);
  return finish(f, o);
}

// ---------------------------------------------------------------------------
// npc10 Rie: non beret trang no hong, toc nau mai bang, mat den to, vay xanh nhat co no trang
const R = {
  hair: [156, 92, 82], hairL: [200, 134, 118], hairD: [118, 66, 60], skin: [238, 238, 226], beret: [250, 228, 228],
  beretShade: [226, 196, 200], bow: [250, 160, 182], bowD: [214, 104, 138], dress: [184, 204, 230], dressShade: [150, 176, 212],
  collar: [246, 242, 226], shoe: [122, 92, 92], skirt: [184, 204, 230], skirtShade: [150, 176, 212], line: [24, 20, 30],
};

function rie(o) {
  const f = newFrame();
  const oy = o.oy ?? 0;
  const hy = oy + (o.hy ?? 0);
  skirt(f, oy, R);
  torso(f, oy, R.dress, R.dressShade);
  rect(f, 20, 22 + oy, 9, 2, R.collar);
  rect(f, 22, 24 + oy, 5, 1, WHITE);
  put(f, 24, 25 + oy, WHITE);
  arms(f, o, { sleeve: R.dress, skin: R.skin });

  ellipse(f, 24, 13 + hy, 13, 10, R.hair);
  rect(f, 11, 15 + hy, 4, 10, R.hair);
  rect(f, 33, 15 + hy, 4, 10, R.hair);
  rect(f, 11, 21 + hy, 2, 4, R.hairD);
  ellipse(f, 24, 15 + hy, 9, 7, R.skin);
  rect(f, 15, 8 + hy, 18, 4, R.hair);
  for (let x = 15; x <= 32; x += 2) put(f, x, 12 + hy, R.hair);
  rect(f, 19, 9 + hy, 5, 1, R.hairL);

  eyesBig(f, 15 + hy, R.line, o.happy, R.line);
  rect(f, 24, 20 + hy, 1, 1, [120, 80, 80]);
  rect(f, 25, 21 + hy, 2, 1, [120, 80, 80]);
  rect(f, 27, 20 + hy, 1, 1, [120, 80, 80]);

  // beret trang lech, ruy bang ren + 2 no hong ben trai
  ellipse(f, 22, 6 + hy, 13, 5, R.beret);
  rect(f, 12, 9 + hy, 18, 1, R.beretShade);
  rect(f, 12, 3 + hy, 4, 3, R.bow);
  rect(f, 17, 4 + hy, 3, 2, R.bow);
  rect(f, 15, 4 + hy, 2, 2, R.bowD);
  rect(f, 10, 7 + hy, 3, 2, R.bow);
  return finish(f, o);
}

// ---------------------------------------------------------------------------
// npc11 BiGi: toc nau dam dai xoa, ao den co V tay ngan, chan vay trang, chong nanh
const B = {
  hair: [58, 40, 40], hairL: [104, 72, 66], skin: [250, 218, 198], top: [28, 28, 34], skirt: [250, 242, 222],
  skirtShade: [222, 212, 190], shoe: [150, 100, 90], lips: [222, 116, 120],
};

function bigi(o) {
  const f = newFrame();
  const oy = o.oy ?? 0;
  const hy = oy + (o.hy ?? 0);
  skirt(f, oy, { ...B, skirt: B.skirt });
  torso(f, oy, B.top, B.top);
  rect(f, 22, 23 + oy, 5, 1, B.skin);
  rect(f, 23, 24 + oy, 3, 1, B.skin);
  arms(f, o, { sleeve: B.skin, skin: B.skin });
  if (o.arms === 0) {
    rect(f, 14, 23 + oy, 3, 2, B.top);
    rect(f, 31, 23 + oy, 3, 2, B.top);
  }

  ellipse(f, 24, 13 + hy, 13, 10, B.hair);
  rect(f, 11, 15 + hy, 4, 16, B.hair);
  rect(f, 33, 15 + hy, 4, 16, B.hair);
  rect(f, 12, 22 + hy, 1, 8, B.hairL);
  ellipse(f, 24, 15 + hy, 9, 7, B.skin);
  rect(f, 15, 8 + hy, 18, 3, B.hair);
  rect(f, 15, 11 + hy, 4, 3, B.hair);
  rect(f, 29, 11 + hy, 4, 3, B.hair);
  rect(f, 20, 5 + hy, 5, 1, B.hairL);

  eyes(f, 15 + hy, [40, 30, 34], o.happy, B.hair);
  rect(f, 16, 18 + hy, 3, 2, [255, 176, 168]);
  rect(f, 30, 18 + hy, 3, 2, [255, 176, 168]);
  rect(f, 23, 20 + hy, 3, 1, B.lips);
  return finish(f, o);
}

// ---------------------------------------------------------------------------
// npc12 Senju: toc den tet 2 bim, hoodie trang vien xanh co logo
const S = {
  hair: [26, 26, 36], hairL: [76, 76, 104], skin: [250, 224, 208], iris: [100, 60, 50], white: [250, 250, 254],
  whiteShade: [212, 216, 236], blue: [52, 52, 204], navy: [40, 44, 92], shoe: [244, 244, 250],
};

function senju(o) {
  const f = newFrame();
  const oy = o.oy ?? 0;
  const hy = oy + (o.hy ?? 0);
  rect(f, 18, 30 + oy, 12, 5, S.navy);
  rect(f, 17, 35 + oy, 14, 2, S.navy);
  rect(f, 23, 33 + oy, 2, 4, S.hair);
  rect(f, 17, 37 + oy, 6, 3, S.shoe);
  rect(f, 25, 37 + oy, 6, 3, S.shoe);
  rect(f, 17, 39 + oy, 6, 1, S.blue);
  rect(f, 25, 39 + oy, 6, 1, S.blue);

  torso(f, oy, S.white, S.whiteShade);
  rect(f, 16, 22 + oy, 16, 3, S.white);
  rect(f, 16, 24 + oy, 16, 1, S.whiteShade);
  rect(f, 21, 25 + oy, 1, 5, S.blue);
  rect(f, 27, 25 + oy, 1, 5, S.blue);
  rect(f, 21, 27 + oy, 7, 3, S.blue);
  put(f, 25, 27 + oy, WHITE);
  put(f, 24, 28 + oy, WHITE);
  put(f, 23, 29 + oy, WHITE);
  arms(f, o, { sleeve: S.white, skin: S.skin, cuff: S.blue, noHands: true });

  // toc den chia giua, 2 bim tet xuong truoc nguc, buoc day xanh
  ellipse(f, 24, 13 + hy, 13, 10, S.hair);
  rect(f, 11, 15 + hy, 3, 12, S.hair);
  rect(f, 34, 15 + hy, 3, 12, S.hair);
  for (const x0 of [16, 30]) {
    for (let i = 0; i < 12; i++) rect(f, x0 + (i % 4 < 2 ? 0 : 1), 24 + i + oy, 2, 1, i % 2 ? S.hairL : S.hair);
    rect(f, x0, 36 + oy, 2, 2, S.blue);
  }
  ellipse(f, 24, 15 + hy, 9, 7, S.skin);
  rect(f, 15, 8 + hy, 9, 3, S.hair);
  rect(f, 25, 8 + hy, 8, 3, S.hair);
  rect(f, 15, 11 + hy, 2, 5, S.hair);
  rect(f, 31, 11 + hy, 2, 5, S.hair);
  rect(f, 18, 5 + hy, 6, 1, S.hairL);

  eyesBig(f, 15 + hy, S.iris, o.happy, S.hair);
  rect(f, 16, 18 + hy, 3, 2, [255, 170, 170]);
  rect(f, 30, 18 + hy, 3, 2, [255, 170, 170]);
  rect(f, 23, 20 + hy, 3, 2, [250, 100, 150]);
  return finish(f, o);
}

// ---------------------------------------------------------------------------
// npc13 Zesty: toc den thang mai bang, khan trang trum dau, ma hong, mieng chum, tay ap ma, ao hai day den
const Y = {
  hair: [20, 20, 28], hairL: [66, 66, 82], scarf: [252, 250, 244], scarfShade: [226, 222, 214], skin: [255, 238, 226],
  top: [24, 24, 30], pants: [36, 36, 46], pantsShade: [20, 20, 28], shoe: [26, 26, 32], lips: [228, 118, 130],
};

function zesty(o) {
  const f = newFrame();
  const oy = o.oy ?? 0;
  const hy = oy + (o.hy ?? 0);
  legs(f, oy, Y);
  torso(f, oy, Y.top, Y.top);
  rect(f, 22, 23 + oy, 5, 2, Y.skin);
  rect(f, 23, 25 + oy, 3, 1, Y.skin);
  arms(f, o, { sleeve: Y.skin, skin: Y.skin });
  rect(f, 17, 23 + oy, 2, 7, Y.skin);
  rect(f, 29, 23 + oy, 2, 7, Y.skin);

  ellipse(f, 24, 13 + hy, 13, 10, Y.hair);
  rect(f, 11, 15 + hy, 4, 20, Y.hair);
  rect(f, 33, 15 + hy, 4, 20, Y.hair);
  rect(f, 12, 24 + hy, 1, 10, Y.hairL);
  ellipse(f, 24, 15 + hy, 9, 7, Y.skin);
  rect(f, 15, 8 + hy, 18, 4, Y.hair);
  rect(f, 15, 12 + hy, 2, 4, Y.hair);
  rect(f, 32, 12 + hy, 2, 4, Y.hair);

  // khan trang trum dau, hai ben rua xuong
  ellipse(f, 24, 6 + hy, 13, 5, Y.scarf);
  rect(f, 10, 8 + hy, 4, 11, Y.scarf);
  rect(f, 34, 8 + hy, 4, 11, Y.scarf);
  rect(f, 11, 15 + hy, 2, 4, Y.scarfShade);
  rect(f, 35, 15 + hy, 2, 4, Y.scarfShade);

  eyes(f, 16 + hy, [30, 30, 40], o.happy, Y.hair);
  rect(f, 15, 18 + hy, 4, 3, [255, 150, 160]);
  rect(f, 30, 18 + hy, 4, 3, [255, 150, 160]);
  put(f, 24, 21 + hy, Y.lips);
  put(f, 25, 21 + hy, Y.lips);
  put(f, 24, 22 + hy, Y.lips);
  put(f, 25, 22 + hy, Y.lips);
  // hai ban tay ap ma (khi dung yen)
  if (o.arms === 0) {
    rect(f, 13, 17 + hy, 3, 5, Y.skin);
    rect(f, 33, 17 + hy, 3, 5, Y.skin);
  }
  return finish(f, o);
}

// ---------------------------------------------------------------------------
// npc14 Poo: toc vang gon song, ngoc toc nho, dau tron ma hong, mieng "w", so mi trang ca vat den
const Po = {
  hair: [252, 210, 120], hairL: [255, 238, 172], hairD: [226, 170, 80], skin: [255, 238, 232], iris: [90, 140, 220],
  shirt: [250, 250, 254], shirtShade: [214, 218, 232], tie: [28, 28, 34], pants: [72, 72, 86], pantsShade: [54, 54, 66], shoe: [40, 40, 48],
};

function poo(o) {
  const f = newFrame();
  const oy = o.oy ?? 0;
  const hy = oy + (o.hy ?? 0);
  legs(f, oy, Po);
  torso(f, oy, Po.shirt, Po.shirtShade);
  rect(f, 20, 22 + oy, 9, 2, Po.shirtShade);
  rect(f, 23, 23 + oy, 2, 6, Po.tie);
  arms(f, o, { sleeve: Po.shirt, skin: Po.skin });

  ellipse(f, 24, 13 + hy, 13, 10, Po.hair);
  rect(f, 10, 15 + hy, 5, 16, Po.hair);
  rect(f, 33, 15 + hy, 5, 16, Po.hair);
  for (let y = 18; y <= 30; y += 4) {
    put(f, 9, y + hy, Po.hair);
    put(f, 38, y + 2 + hy, Po.hair);
  }
  rect(f, 10, 24 + hy, 2, 7, Po.hairD);
  rect(f, 36, 24 + hy, 2, 7, Po.hairD);
  rect(f, 24, 1 + hy, 3, 3, Po.hair);
  rect(f, 26, 0 + hy, 3, 2, Po.hair);
  ellipse(f, 24, 16 + hy, 10, 8, Po.skin);
  rect(f, 14, 8 + hy, 17, 3, Po.hair);
  rect(f, 14, 11 + hy, 3, 5, Po.hair);
  rect(f, 24, 11 + hy, 5, 3, Po.hair);
  rect(f, 30, 11 + hy, 3, 4, Po.hair);
  rect(f, 19, 5 + hy, 6, 1, Po.hairL);

  eyesBig(f, 15 + hy, Po.iris, o.happy, Po.hairD);
  rect(f, 15, 19 + hy, 4, 2, [255, 170, 176]);
  rect(f, 30, 19 + hy, 4, 2, [255, 170, 176]);
  for (const [x, y] of [[22, 21], [23, 22], [24, 21], [25, 22], [26, 21]]) put(f, x, y + hy, [196, 100, 110]);
  return finish(f, o);
}

// ---------------------------------------------------------------------------
// npc15 Yuyuu: toc xanh navy phong, ghim hoa xanh ngoc, mat xanh to co hoa, ma hong soc, dong phuc thuy thu
const Yu = {
  hair: [46, 58, 142], hairL: [108, 126, 214], hairD: [28, 36, 96], skin: [255, 240, 238], iris: [60, 150, 230],
  top: [150, 182, 196], collar: [170, 198, 208], skirt: [50, 64, 140], skirtShade: [34, 44, 104], shoe: [110, 80, 80],
  flower: [96, 204, 250], flowerC: [210, 244, 255],
};

function yuyuu(o) {
  const f = newFrame();
  const oy = o.oy ?? 0;
  const hy = oy + (o.hy ?? 0);
  skirt(f, oy, Yu);
  torso(f, oy, Yu.top, Yu.top);
  rect(f, 18, 22 + oy, 12, 3, Yu.collar);
  rect(f, 22, 24 + oy, 5, 1, WHITE);
  rect(f, 18, 28 + oy, 12, 1, WHITE);
  arms(f, o, { sleeve: Yu.top, skin: Yu.skin });

  ellipse(f, 24, 13 + hy, 14, 11, Yu.hair);
  rect(f, 10, 14 + hy, 5, 15, Yu.hair);
  rect(f, 33, 14 + hy, 5, 15, Yu.hair);
  rect(f, 10, 22 + hy, 2, 7, Yu.hairD);
  rect(f, 36, 22 + hy, 2, 7, Yu.hairD);
  ellipse(f, 24, 15 + hy, 9, 7, Yu.skin);
  rect(f, 15, 8 + hy, 18, 4, Yu.hair);
  for (let x = 15; x <= 32; x += 2) put(f, x, 12 + hy, Yu.hair);
  rect(f, 15, 12 + hy, 2, 5, Yu.hair);
  rect(f, 31, 12 + hy, 2, 5, Yu.hair);
  rect(f, 18, 4 + hy, 4, 1, Yu.hairL);
  rect(f, 24, 4 + hy, 2, 1, Yu.hairL);

  eyesBig(f, 15 + hy, Yu.iris, o.happy, Yu.hairD);
  if (!o.happy) {
    put(f, 19, 16 + hy, Yu.flowerC);
    put(f, 28, 16 + hy, Yu.flowerC);
  }
  rect(f, 15, 18 + hy, 4, 3, [255, 146, 160]);
  rect(f, 30, 18 + hy, 4, 3, [255, 146, 160]);
  put(f, 24, 20 + hy, [230, 110, 120]);
  put(f, 24, 21 + hy, [230, 110, 120]);

  // ghim hoa xanh ngoc tren toc
  for (const [x, y] of [[32, 6], [31, 7], [33, 7], [30, 8], [34, 8], [31, 9], [33, 9], [32, 10]]) put(f, x, y + hy, Yu.flower);
  rect(f, 31, 7 + hy, 3, 3, Yu.flower);
  put(f, 32, 8 + hy, Yu.flowerC);
  return finish(f, o);
}

// ---------------------------------------------------------------------------
// npc16 Susu: toc nau buoc cao duoi ngua xoan, vien da hong tren dau, ao khoac len do, vien da tim bay canh tay
const Su = {
  hair: [112, 66, 52], hairL: [164, 108, 86], hairD: [80, 46, 38], skin: [255, 224, 208], iris: [96, 56, 44],
  cardigan: [172, 30, 52], cardiganD: [128, 20, 40], pattern: [204, 62, 78], pants: [66, 54, 68], pantsShade: [46, 36, 48],
  shoe: [96, 54, 54], crystal: [226, 48, 108], crystalL: [255, 140, 180], crystalD: [168, 24, 80], gem: [236, 130, 244],
};

function susu(o) {
  const f = newFrame();
  const oy = o.oy ?? 0;
  const hy = oy + (o.hy ?? 0);

  // duoi ngua dai xoan phia sau ben trai
  rect(f, 7, 9 + hy, 7, 23, Su.hair);
  for (let y = 12; y <= 30; y += 4) put(f, 6, y + hy, Su.hair);
  for (let y = 14; y <= 30; y += 4) put(f, 14, y + hy, Su.hair);
  rect(f, 8, 22 + hy, 2, 9, Su.hairD);

  legs(f, oy, Su);
  torso(f, oy, Su.cardigan, Su.cardiganD);
  rect(f, 21, 23 + oy, 7, 8, WHITE);
  for (const [x, y] of [[18, 25], [18, 28], [29, 25], [29, 28], [19, 26]]) put(f, x, y + oy, Su.pattern);
  arms(f, o, { sleeve: Su.cardigan, skin: Su.skin });

  ellipse(f, 24, 13 + hy, 13, 10, Su.hair);
  ellipse(f, 24, 6 + hy, 5, 3, Su.hair);
  rect(f, 11, 15 + hy, 3, 8, Su.hair);
  rect(f, 34, 15 + hy, 3, 8, Su.hair);
  ellipse(f, 24, 15 + hy, 9, 7, Su.skin);
  rect(f, 15, 8 + hy, 18, 3, Su.hair);
  for (let x = 15; x <= 32; x += 2) put(f, x, 11 + hy, Su.hair);
  rect(f, 19, 5 + hy, 6, 1, Su.hairL);

  eyesBig(f, 15 + hy, Su.iris, o.happy, Su.hairD);
  rect(f, 16, 19 + hy, 3, 1, [255, 168, 160]);
  rect(f, 30, 19 + hy, 3, 1, [255, 168, 160]);
  rect(f, 23, 20 + hy, 3, 1, [214, 70, 80]);

  // vien da hong tren dinh dau
  for (const [x, y, w] of [[23, 0, 2], [22, 1, 4], [21, 2, 6], [21, 3, 6], [22, 4, 4], [23, 5, 2]]) {
    rect(f, x, y + hy, w, 1, Su.crystal);
  }
  rect(f, 22, 2 + hy, 2, 2, Su.crystalL);
  rect(f, 25, 3 + hy, 2, 2, Su.crystalD);

  // vien da tim bay canh ban tay phai
  for (const [x, y, w] of [[38, 12, 2], [37, 13, 4], [37, 14, 4], [38, 15, 2]]) rect(f, x, y + oy, w, 1, Su.gem);
  put(f, 38, 13 + oy, WHITE);
  return finish(f, o);
}

// ---------------------------------------------------------------------------
// npc17 selena: toc den dai mai thua, ao trang co chun xoe, chan vay den, cam dien thoai hong chup anh
const Se = {
  hair: [30, 26, 32], hairL: [78, 68, 78], skin: [250, 222, 204], top: [250, 242, 228], topShade: [226, 214, 194],
  skirt: [30, 30, 36], skirtShade: [18, 18, 24], shoe: [150, 100, 90], phone: [250, 196, 208], phoneD: [214, 142, 162],
  lips: [214, 110, 116],
};

function selena(o) {
  const f = newFrame();
  const oy = o.oy ?? 0;
  const hy = oy + (o.hy ?? 0);
  skirt(f, oy, Se);
  torso(f, oy, Se.top, Se.topShade);
  rect(f, 16, 29 + oy, 16, 2, Se.top);
  rect(f, 21, 23 + oy, 7, 2, Se.skin);
  for (let y = 25; y <= 28; y += 1) put(f, 24, y + oy, [200, 186, 164]);
  arms(f, o, { sleeve: Se.skin, skin: Se.skin });
  if (o.arms === 0) {
    rect(f, 14, 23 + oy, 3, 2, Se.top);
    rect(f, 31, 23 + oy, 3, 2, Se.top);
  }

  ellipse(f, 24, 13 + hy, 13, 10, Se.hair);
  rect(f, 11, 15 + hy, 4, 18, Se.hair);
  rect(f, 33, 15 + hy, 4, 18, Se.hair);
  rect(f, 12, 24 + hy, 1, 8, Se.hairL);
  ellipse(f, 24, 15 + hy, 9, 7, Se.skin);
  rect(f, 15, 8 + hy, 18, 3, Se.hair);
  rect(f, 15, 11 + hy, 5, 4, Se.hair);
  rect(f, 28, 11 + hy, 5, 4, Se.hair);
  rect(f, 20, 5 + hy, 5, 1, Se.hairL);

  eyes(f, 15 + hy, [40, 30, 34], o.happy, Se.hair);
  rect(f, 16, 18 + hy, 3, 2, [255, 176, 168]);
  rect(f, 30, 18 + hy, 3, 2, [255, 176, 168]);
  rect(f, 23, 20 + hy, 3, 1, Se.lips);

  // tay phai gio len cam dien thoai hong (chup anh)
  rect(f, 33, 20 + oy, 3, 4, Se.skin);
  rect(f, 35, 14 + oy, 4, 8, Se.phone);
  rect(f, 38, 14 + oy, 1, 8, Se.phoneD);
  rect(f, 36, 15 + oy, 1, 1, [20, 20, 28]);
  return finish(f, o);
}

export const CHARACTERS_2 = {
  npc07: { draw: dezzy },
  npc08: { draw: cipher },
  npc09: { draw: papii, hearts: [[1, 2], [41, 4], [40, 12], [40, 22]] },
  npc10: { draw: rie },
  npc11: { draw: bigi },
  npc12: { draw: senju },
  npc13: { draw: zesty },
  npc14: { draw: poo },
  npc15: { draw: yuyuu },
  npc16: { draw: susu, hearts: [[1, 1], [42, 28], [42, 36], [1, 34]] },
  npc17: { draw: selena, hearts: [[2, 4], [2, 14], [3, 24], [2, 34]] },
};
