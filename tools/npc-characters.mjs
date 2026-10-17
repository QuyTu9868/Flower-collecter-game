// NPC tu npc01 den npc06, ve theo hinh nguoi dung dua. Moi nhan vat la 1 ham ve 1 khung:
//   draw({ oy, hy, arms, happy, hearts })  -  oy: nhay len, hy: dau nhun, arms: 0 xuong / 1 dang ngang / 2 gio len
// Dung chung tools/make-npcs.mjs de xuat idle, receive, complete.
import { newFrame, put, rect, addOutline, ellipse, heart } from './png.mjs';

export const OUT = [34, 24, 40];
const HEART_COLOR = [255, 88, 138];
export const WHITE = [255, 255, 255];

export const FRAME_HEARTS = { default: [[4, 6], [41, 4], [40, 12], [3, 14]] };

export const drawHearts = (f, list = []) => list.forEach(([x, y]) => heart(f, x, y, HEART_COLOR));

// Mat mo: vach mi + mat 2x3 + diem sang. Mat vui (happy): hai cung ^ ^
export function eyes(f, y, iris, happy, line) {
  if (happy) {
    for (const e of [18, 27]) {
      put(f, e, y + 1, line);
      put(f, e + 1, y, line);
      put(f, e + 2, y, line);
      put(f, e + 3, y + 1, line);
    }
    return;
  }
  for (const e of [19, 28]) {
    rect(f, e - 1, y - 1, 4, 1, line);
    rect(f, e, y, 2, 3, iris);
    put(f, e, y, WHITE);
  }
}

// Tay chung: S = { sleeve, skin, cuff?, bracelet?, noHands? }
export function arms(f, o, S) {
  const oy = o.oy ?? 0;
  if (o.arms === 0) {
    for (const x of [14, 31]) {
      rect(f, x, 23 + oy, 3, S.noHands ? 7 : 5, S.sleeve);
      if (S.noHands) {
        if (S.cuff) rect(f, x, 28 + oy, 3, 2, S.cuff);
      } else {
        rect(f, x, 28 + oy, 3, 3, S.skin);
        if (S.cuff) rect(f, x, 27 + oy, 3, 1, S.cuff);
      }
    }
    if (S.bracelet) rect(f, 14, 28 + oy, 3, 1, S.bracelet);
  } else if (o.arms === 1) {
    rect(f, 13, 23 + oy, 4, 3, S.sleeve);
    rect(f, 10, 24 + oy, 3, 3, S.skin);
    rect(f, 31, 23 + oy, 4, 3, S.sleeve);
    rect(f, 35, 24 + oy, 3, 3, S.skin);
  } else {
    rect(f, 10, 21 + oy, 3, 4, S.sleeve);
    rect(f, 9, 17 + oy, 3, 4, S.skin);
    rect(f, 35, 21 + oy, 3, 4, S.sleeve);
    rect(f, 36, 17 + oy, 3, 4, S.skin);
  }
}

// ---------------------------------------------------------------------------
// npc01: chi toc dai buoc nua dau, ao thun co lo kem + gile be, vong tay bac
const V = {
  hair: [44, 32, 36], hairL: [90, 68, 68], skin: [255, 226, 208], iris: [76, 48, 40],
  cream: [250, 244, 230], creamShade: [226, 216, 196], vest: [232, 208, 168], vestShade: [198, 172, 130],
  pants: [216, 198, 168], pantsShade: [186, 166, 138], shoe: [126, 86, 64],
  blush: [255, 170, 160], mouth: [206, 64, 70], mouth2: [244, 124, 112], bracelet: [226, 230, 240],
};

function vestGirl(o) {
  const f = newFrame();
  const oy = o.oy ?? 0;
  const hy = oy + (o.hy ?? 0);

  rect(f, 18, 30 + oy, 12, 5, V.pants);
  rect(f, 17, 35 + oy, 14, 2, V.pants);
  rect(f, 23, 33 + oy, 2, 4, V.pantsShade);
  rect(f, 17, 37 + oy, 6, 3, V.shoe);
  rect(f, 25, 37 + oy, 6, 3, V.shoe);

  rect(f, 17, 23 + oy, 14, 8, V.cream);
  rect(f, 17, 28 + oy, 14, 2, V.creamShade);
  rect(f, 17, 23 + oy, 5, 8, V.vest);
  rect(f, 27, 23 + oy, 4, 8, V.vest);
  rect(f, 17, 28 + oy, 5, 3, V.vestShade);
  rect(f, 27, 28 + oy, 4, 3, V.vestShade);
  rect(f, 22, 24 + oy, 1, 6, V.vestShade);
  rect(f, 21, 22 + oy, 7, 2, V.cream);

  arms(f, o, { sleeve: V.cream, skin: V.skin, bracelet: V.bracelet });

  // toc dai xoa xuong hai ben vai + chom toc buoc tren dinh dau
  ellipse(f, 24, 13 + hy, 13, 10, V.hair);
  rect(f, 11, 16 + hy, 4, 12, V.hair);
  rect(f, 33, 16 + hy, 4, 12, V.hair);
  ellipse(f, 24, 4 + hy, 3, 2, V.hair);

  ellipse(f, 24, 15 + hy, 9, 7, V.skin);
  rect(f, 15, 8 + hy, 18, 3, V.hair);
  rect(f, 15, 11 + hy, 6, 2, V.hair);
  rect(f, 28, 11 + hy, 5, 1, V.hair);
  rect(f, 19, 5 + hy, 6, 1, V.hairL);

  eyes(f, 15 + hy, V.iris, o.happy, V.hair);
  rect(f, 16, 18 + hy, 3, 2, V.blush);
  rect(f, 30, 18 + hy, 3, 2, V.blush);
  rect(f, 23, 20 + hy, 3, 1, V.mouth);
  rect(f, 24, 21 + hy, 1, 1, V.mouth2);

  drawHearts(f, o.hearts);
  return addOutline(f, OUT);
}

// ---------------------------------------------------------------------------
// npc02: nang tien toc bac, vuong mien, vay trang, tay cam quyen truong pha le
const Q = {
  hair: [166, 180, 208], hairL: [218, 228, 246], hairD: [122, 138, 176], skin: [255, 234, 226],
  blush: [255, 176, 178], lip: [236, 128, 142], iris: [82, 146, 236],
  dress: [246, 249, 253], dressShade: [200, 214, 234], silver: [208, 216, 232], silverD: [150, 162, 188],
  gem: [96, 164, 240], gemL: [196, 228, 255], line: [96, 108, 150],
};

function silverQueen(o) {
  const f = newFrame();
  const oy = o.oy ?? 0;
  const hy = oy + (o.hy ?? 0);

  // toc dai phia sau
  ellipse(f, 24, 13 + hy, 13, 10, Q.hair);
  rect(f, 10, 15 + hy, 6, 20, Q.hair);
  rect(f, 32, 15 + hy, 6, 20, Q.hair);
  rect(f, 10, 26 + hy, 3, 9, Q.hairD);
  rect(f, 35, 26 + hy, 3, 9, Q.hairD);

  // vay xoe + giay bac
  rect(f, 16, 30 + oy, 16, 3, Q.dress);
  rect(f, 15, 33 + oy, 18, 3, Q.dress);
  rect(f, 14, 36 + oy, 20, 2, Q.dress);
  rect(f, 14, 37 + oy, 20, 1, Q.silver);
  rect(f, 22, 31 + oy, 1, 6, Q.dressShade);
  rect(f, 26, 31 + oy, 1, 6, Q.dressShade);
  rect(f, 19, 38 + oy, 4, 2, Q.silver);
  rect(f, 26, 38 + oy, 4, 2, Q.silver);

  // than vay, co ao, vong co bac dinh da xanh
  rect(f, 17, 23 + oy, 14, 8, Q.dress);
  rect(f, 17, 28 + oy, 14, 2, Q.dressShade);
  rect(f, 17, 29 + oy, 14, 1, Q.silver);
  rect(f, 21, 23 + oy, 6, 2, Q.skin);
  rect(f, 20, 25 + oy, 8, 1, Q.silver);
  rect(f, 23, 26 + oy, 2, 2, Q.gem);
  put(f, 24, 28 + oy, Q.gemL);

  arms(f, o, { sleeve: Q.skin, skin: Q.skin });

  // mat + toc mai chia giua
  ellipse(f, 24, 15 + hy, 9, 7, Q.skin);
  rect(f, 15, 8 + hy, 9, 3, Q.hair);
  rect(f, 25, 8 + hy, 8, 3, Q.hair);
  rect(f, 15, 11 + hy, 2, 6, Q.hair);
  rect(f, 31, 11 + hy, 2, 6, Q.hair);
  rect(f, 19, 6 + hy, 6, 1, Q.hairL);

  eyes(f, 15 + hy, Q.iris, o.happy, Q.line);
  rect(f, 16, 18 + hy, 3, 2, Q.blush);
  rect(f, 30, 18 + hy, 3, 2, Q.blush);
  rect(f, 23, 20 + hy, 2, 1, Q.lip);

  // vuong mien bac: dai cong tren tran, 3 mui nhon, da xanh giua, giot da tren tran
  for (let x = 17; x <= 31; x++) put(f, x, 5 + hy + Math.round(((x - 24) / 7.5) ** 2 * 3), Q.silver);
  for (const [x, h] of [[20, 2], [28, 2], [24, 3]]) rect(f, x, 5 + hy - h, 1, h, Q.silver);
  rect(f, 23, 2 + hy, 2, 3, Q.gem);
  put(f, 24, 9 + hy, Q.gem);
  put(f, 15, 19 + hy, Q.gem);
  put(f, 33, 19 + hy, Q.gem);

  // quyen truong: can bac, vong tron tren dinh co vien da
  const px = 34;
  rect(f, px, 13 + oy, 2, 25, Q.silver);
  rect(f, px + 1, 13 + oy, 1, 25, Q.silverD);
  rect(f, px - 1, 16 + oy, 4, 1, Q.silverD);
  put(f, px, 15 + oy, Q.gem);
  for (let y = 3; y <= 13; y++) {
    for (let x = px - 5; x <= px + 6; x++) {
      const d = Math.hypot(x - (px + 0.5), y - (8 + oy + 0.5 - oy));
      if (d <= 4.4 && d >= 3.2) put(f, x, y + oy, Q.silver);
      else if (d < 3.2) put(f, x, y + oy, d < 1.8 ? WHITE : Q.gemL);
    }
  }
  // ban tay cam can (khi tay xuong)
  if (o.arms === 0) rect(f, px - 1, 28 + oy, 4, 3, Q.skin);

  drawHearts(f, o.hearts);
  return addOutline(f, OUT);
}

// ---------------------------------------------------------------------------
// npc03: co toc den ngan roi, ghim hoa trang + kep xanh, ao hoodie trang vien xanh co logo
const D = {
  hair: [26, 28, 44], hairL: [72, 78, 114], skin: [250, 224, 208], iris: [140, 144, 158],
  white: [250, 250, 254], whiteShade: [212, 216, 236], blue: [52, 52, 204], navy: [40, 44, 92],
  shoe: [244, 244, 250], clip: [74, 74, 232], petalCenter: [255, 200, 60],
  blush: [255, 170, 170], mouth: [224, 56, 90],
};

function dlicomGirl(o) {
  const f = newFrame();
  const oy = o.oy ?? 0;
  const hy = oy + (o.hy ?? 0);

  rect(f, 18, 30 + oy, 12, 5, D.navy);
  rect(f, 17, 35 + oy, 14, 2, D.navy);
  rect(f, 23, 33 + oy, 2, 4, D.hair);
  rect(f, 17, 37 + oy, 6, 3, D.shoe);
  rect(f, 25, 37 + oy, 6, 3, D.shoe);
  rect(f, 17, 39 + oy, 6, 1, D.blue);
  rect(f, 25, 39 + oy, 6, 1, D.blue);

  // hoodie: than, mu (co ao), day rut xanh, tui logo xanh co tia set
  rect(f, 17, 23 + oy, 14, 8, D.white);
  rect(f, 17, 28 + oy, 14, 2, D.whiteShade);
  rect(f, 16, 22 + oy, 16, 3, D.white);
  rect(f, 16, 24 + oy, 16, 1, D.whiteShade);
  rect(f, 21, 25 + oy, 1, 5, D.blue);
  rect(f, 27, 25 + oy, 1, 5, D.blue);
  rect(f, 21, 27 + oy, 7, 3, D.blue);
  put(f, 25, 27 + oy, WHITE);
  put(f, 24, 28 + oy, WHITE);
  put(f, 23, 29 + oy, WHITE);

  arms(f, o, { sleeve: D.white, skin: D.skin, cuff: D.blue, noHands: true });
  if (o.arms === 0) {
    rect(f, 14, 24 + oy, 2, 2, D.blue);
    rect(f, 32, 24 + oy, 2, 2, D.blue);
  }

  // toc den ngan roi, mot ben dai hon
  ellipse(f, 24, 12 + hy, 12, 9, D.hair);
  rect(f, 12, 14 + hy, 3, 8, D.hair);
  rect(f, 33, 14 + hy, 3, 6, D.hair);
  put(f, 11, 20 + hy, D.hair);
  put(f, 12, 22 + hy, D.hair);
  put(f, 13, 23 + hy, D.hair);
  put(f, 35, 19 + hy, D.hair);
  put(f, 34, 21 + hy, D.hair);
  rect(f, 20, 2 + hy, 2, 2, D.hair);
  rect(f, 26, 1 + hy, 2, 3, D.hair);

  ellipse(f, 24, 15 + hy, 9, 7, D.skin);
  rect(f, 15, 8 + hy, 18, 2, D.hair);
  for (let x = 15; x <= 32; x++) {
    if (x % 2 === 0) put(f, x, 10 + hy, D.hair);
    if (x % 4 === 0) put(f, x, 11 + hy, D.hair);
  }
  rect(f, 15, 11 + hy, 3, 4, D.hair);
  rect(f, 20, 4 + hy, 5, 1, D.hairL);

  eyes(f, 15 + hy, D.iris, o.happy, D.hair);
  rect(f, 16, 18 + hy, 3, 2, D.blush);
  rect(f, 30, 18 + hy, 3, 2, D.blush);
  rect(f, 23, 20 + hy, 3, 1, D.mouth);

  // ghim hoa trang + kep xanh
  for (const [x, y] of [[32, 8], [31, 9], [33, 9], [31, 11], [33, 11], [32, 12], [30, 10], [34, 10]]) put(f, x, y + hy, WHITE);
  put(f, 32, 10 + hy, D.petalCenter);
  rect(f, 29, 5 + hy, 3, 2, D.clip);
  put(f, 35, 7 + hy, D.clip);

  drawHearts(f, o.hearts);
  return addOutline(f, OUT);
}

// ---------------------------------------------------------------------------
// npc04: chim canh cut, tai nghe xanh, ao choang nau dai trang, vai ben trai ngoi chu chim nhoi bong tim
const P = {
  gray: [126, 136, 150], grayL: [166, 176, 190], white: [250, 250, 253], whiteShade: [214, 220, 232],
  brown: [146, 96, 60], brownShade: [104, 68, 42], orange: [252, 156, 34], orangeD: [214, 110, 20],
  blue: [58, 170, 236], blueD: [36, 120, 204], purple: [116, 66, 164], purpleL: [160, 110, 206],
  cream: [252, 232, 206], eye: [24, 24, 36],
};

function penguin(o) {
  const f = newFrame();
  const oy = o.oy ?? 0;
  const hy = oy + (o.hy ?? 0);
  const poy = o.arms === 2 ? -3 : 0; // chu chim nhoi bong len khi vui

  // chan + ao choang + dai trang
  rect(f, 16, 38 + oy, 6, 2, P.orange);
  rect(f, 26, 38 + oy, 6, 2, P.orange);
  ellipse(f, 24, 31 + oy, 9, 7, P.brown);
  rect(f, 15, 35 + oy, 18, 3, P.brownShade);
  rect(f, 15, 31 + oy, 18, 2, P.white);
  rect(f, 23, 30 + oy, 3, 3, P.white);
  rect(f, 22, 33 + oy, 2, 5, P.white);
  rect(f, 25, 33 + oy, 2, 4, P.white);

  // canh phai: xuong / dang ngang / gio len (ao choang nau, dau canh xam)
  if (o.arms === 0) {
    rect(f, 32, 25 + oy, 4, 7, P.brown);
    rect(f, 33, 31 + oy, 3, 2, P.gray);
  } else if (o.arms === 1) {
    rect(f, 33, 24 + oy, 6, 3, P.brown);
    rect(f, 38, 24 + oy, 3, 3, P.gray);
  } else {
    rect(f, 34, 19 + oy, 3, 7, P.brown);
    rect(f, 34, 16 + oy, 3, 3, P.gray);
  }
  // canh trai dua len do chu chim nhoi bong
  rect(f, 10, 26 + oy + poy, 6, 3, P.brown);
  rect(f, 9, 26 + oy + poy, 2, 3, P.gray);

  // dau: mu xam tren, mat trang, tuft long
  for (let y = 7; y <= 25; y++) {
    for (let x = 12; x <= 36; x++) {
      if (((x - 24) / 11.3) ** 2 + ((y - 16) / 9.3) ** 2 > 1) continue;
      put(f, x, y + hy, y <= 11 ? P.gray : y >= 22 ? P.whiteShade : P.white);
    }
  }
  rect(f, 21, 4 + hy, 2, 3, P.gray);
  rect(f, 24, 3 + hy, 2, 4, P.gray);
  rect(f, 26, 5 + hy, 2, 2, P.grayL);

  // tai nghe xanh
  for (let x = 12; x <= 36; x++) {
    const t = (x - 24) / 12.5;
    const y = 15 + hy - Math.round(12 * Math.sqrt(Math.max(0, 1 - t * t)));
    rect(f, x, y, 1, 2, P.blue);
  }
  rect(f, 11, 12 + hy, 4, 9, P.blue);
  rect(f, 11, 18 + hy, 4, 3, P.blueD);
  rect(f, 33, 12 + hy, 4, 9, P.blue);
  rect(f, 33, 18 + hy, 4, 3, P.blueD);

  // mat + mo
  if (o.happy) {
    for (const e of [17, 28]) {
      put(f, e, 15 + hy, P.eye);
      put(f, e + 1, 14 + hy, P.eye);
      put(f, e + 2, 14 + hy, P.eye);
      put(f, e + 3, 15 + hy, P.eye);
    }
  } else {
    rect(f, 18, 14 + hy, 2, 3, P.eye);
    put(f, 18, 14 + hy, WHITE);
    rect(f, 28, 14 + hy, 2, 3, P.eye);
    put(f, 28, 14 + hy, WHITE);
  }
  rect(f, 23, 17 + hy, 4, 2, P.orange);
  rect(f, 24, 19 + hy, 2, 1, P.orangeD);

  // chu chim nhoi bong tim tren vai trai
  const px = 8;
  const py = 21 + oy + poy;
  ellipse(f, px, py, 3, 4, P.purple);
  ellipse(f, px, py + 1, 2, 3, P.cream);
  ellipse(f, px, py - 4, 3, 2, P.purple);
  put(f, px - 1, py - 4, P.eye);
  put(f, px + 1, py - 4, P.eye);
  put(f, px, py - 3, P.orange);
  rect(f, px - 3, py + 4, 2, 1, P.orange);
  rect(f, px + 1, py + 4, 2, 1, P.orange);

  drawHearts(f, o.hearts);
  return addOutline(f, OUT);
}

// ---------------------------------------------------------------------------
// npc05: chi toc den rat dai, nhay mat, khuyen vong vang, ao croptop + ao khoac den trang, ran trang dom do dau lau
const S5 = {
  hair: [18, 20, 34], hairL: [62, 66, 98], skin: [255, 226, 212], blush: [255, 170, 168], lip: [206, 76, 88],
  white: [244, 244, 250], black: [34, 36, 46], crop: [58, 64, 92], pants: [52, 56, 78], pantsL: [86, 92, 122],
  belt: [150, 152, 164], shoe: [28, 30, 40], sole: [232, 232, 240], gold: [244, 196, 60],
  snake: [248, 248, 250], snakeShade: [214, 218, 232], red: [224, 64, 64], belly: [232, 184, 56],
  skull: [250, 246, 234], bone: [226, 218, 196], crest: [60, 150, 236], socket: [20, 20, 28],
};

function snakeLady(o) {
  const f = newFrame();
  const oy = o.oy ?? 0;
  const hy = oy + (o.hy ?? 0);

  // than ran cuon phia sau ben phai: thanh trang dom do, bung vang
  for (let a = -1.1; a <= 1.3; a += 0.12) {
    const px = Math.round(28 + Math.cos(a) * 14);
    const py = Math.round(22 + oy + Math.sin(a) * 13);
    rect(f, px - 2, py - 2, 4, 4, S5.snake);
    rect(f, px - 2, py + 1, 4, 1, S5.snakeShade);
    put(f, px - Math.round(Math.cos(a) * 2) - 1, py, S5.belly);
    if (Math.round(a * 100) % 3 === 0) rect(f, px, py - 1, 2, 2, S5.red);
  }

  // dau ran la dau lau co sung, bom long xanh, dat ben vai trai
  const kx = 7;
  const ky = 17 + oy + (o.arms === 2 ? -3 : 0);
  rect(f, kx - 2, ky + 3, 4, 8, S5.snake);
  rect(f, kx - 1, ky + 6, 2, 2, S5.red);
  for (const [x, y, w, h] of [[kx - 4, ky - 9, 3, 4], [kx - 1, ky - 11, 3, 5], [kx + 2, ky - 9, 3, 4]]) rect(f, x, y, w, h, S5.crest);
  ellipse(f, kx, ky, 4, 4, S5.skull);
  rect(f, kx - 6, ky - 5, 2, 4, S5.bone);
  rect(f, kx + 4, ky - 5, 2, 3, S5.bone);
  rect(f, kx - 2, ky - 1, 2, 2, S5.socket);
  rect(f, kx + 1, ky - 1, 2, 2, S5.socket);
  rect(f, kx - 1, ky + 2, 3, 1, S5.bone);

  // quan den + dai deo
  rect(f, 18, 30 + oy, 12, 5, S5.pants);
  rect(f, 17, 35 + oy, 14, 2, S5.pants);
  rect(f, 18, 30 + oy, 12, 1, S5.belt);
  rect(f, 23, 33 + oy, 2, 4, S5.pantsL);
  rect(f, 20, 33 + oy, 3, 1, S5.white);
  rect(f, 17, 37 + oy, 6, 2, S5.shoe);
  rect(f, 25, 37 + oy, 6, 2, S5.shoe);
  rect(f, 17, 39 + oy, 6, 1, S5.sole);
  rect(f, 25, 39 + oy, 6, 1, S5.sole);

  // ao croptop den co cao, ho bung
  rect(f, 17, 23 + oy, 14, 6, S5.crop);
  rect(f, 21, 22 + oy, 7, 2, S5.crop);
  put(f, 24, 23 + oy, S5.white);
  put(f, 24, 24 + oy, S5.white);
  rect(f, 21, 26 + oy, 6, 1, S5.white);
  rect(f, 18, 29 + oy, 12, 1, S5.skin);
  rect(f, 17, 23 + oy, 2, 7, S5.white);
  rect(f, 29, 23 + oy, 2, 7, S5.white);

  arms(f, o, { sleeve: S5.white, skin: S5.skin, cuff: S5.black });
  rect(f, 14, 22 + oy, 3, 3, S5.black);
  rect(f, 31, 22 + oy, 3, 3, S5.black);

  // toc dai thang xuong tan eo
  ellipse(f, 24, 13 + hy, 13, 10, S5.hair);
  rect(f, 11, 15 + hy, 3, 22, S5.hair);
  rect(f, 34, 15 + hy, 3, 22, S5.hair);
  rect(f, 12, 22 + hy, 1, 14, S5.hairL);
  ellipse(f, 24, 15 + hy, 9, 7, S5.skin);
  rect(f, 15, 8 + hy, 18, 3, S5.hair);
  rect(f, 15, 11 + hy, 3, 5, S5.hair);
  rect(f, 29, 11 + hy, 4, 5, S5.hair);
  rect(f, 19, 5 + hy, 6, 1, S5.hairL);

  // mat: mat trai mo, mat phai nhay
  const y = 15 + hy;
  if (o.happy) {
    eyes(f, y, S5.hair, true, S5.hair);
  } else {
    rect(f, 18, y - 1, 4, 1, S5.hair);
    rect(f, 19, y, 2, 3, S5.hair);
    put(f, 19, y, WHITE);
    put(f, 27, y + 1, S5.hair);
    put(f, 28, y + 2, S5.hair);
    put(f, 29, y + 2, S5.hair);
    put(f, 30, y + 1, S5.hair);
  }
  rect(f, 16, 18 + hy, 3, 2, S5.blush);
  rect(f, 30, 18 + hy, 3, 2, S5.blush);
  rect(f, 23, 20 + hy, 2, 1, S5.lip);

  // khuyen vong vang
  rect(f, 13, 17 + hy, 2, 5, S5.gold);
  rect(f, 34, 17 + hy, 2, 5, S5.gold);

  drawHearts(f, o.hearts);
  return addOutline(f, OUT);
}

// ---------------------------------------------------------------------------
// npc06 Phuongeo82: co gai toc hong pastel mai bang, mat nhay + cuoi to, cai bong hoa trang lon tren toc, ao hong vay xanh nhat
const F6 = {
  hair: [248, 176, 214], hairL: [255, 216, 236], hairD: [208, 124, 174],
  skin: [255, 230, 216], blush: [255, 150, 170], pink: [255, 86, 148], eyeD: [60, 30, 50],
  petal: [255, 255, 255], petalShade: [226, 218, 242], petalCenter: [255, 200, 80],
  dress: [255, 140, 184], dressShade: [226, 104, 152], skirt: [176, 204, 236], skirtShade: [140, 176, 216],
  flowerDot: [255, 255, 255], shoe: [255, 236, 244], shoeLine: [255, 140, 184],
};

function flowerGirl(o) {
  const f = newFrame();
  const oy = o.oy ?? 0;
  const hy = oy + (o.hy ?? 0);

  // vay xoe xanh nhat co cham hoa trang + giay
  rect(f, 16, 30 + oy, 16, 3, F6.skirt);
  rect(f, 15, 33 + oy, 18, 3, F6.skirt);
  rect(f, 14, 36 + oy, 20, 2, F6.skirt);
  rect(f, 14, 37 + oy, 20, 1, F6.skirtShade);
  for (const [x, y] of [[18, 31], [27, 33], [22, 35], [30, 31], [17, 35], [25, 31]]) put(f, x, y + oy, F6.flowerDot);
  rect(f, 18, 38 + oy, 5, 2, F6.shoe);
  rect(f, 26, 38 + oy, 5, 2, F6.shoe);
  rect(f, 18, 39 + oy, 5, 1, F6.shoeLine);
  rect(f, 26, 39 + oy, 5, 1, F6.shoeLine);

  // ao hong, co
  rect(f, 17, 23 + oy, 14, 8, F6.dress);
  rect(f, 17, 28 + oy, 14, 2, F6.dressShade);
  rect(f, 22, 22 + oy, 5, 2, F6.skin);
  put(f, 21, 24 + oy, [255, 190, 214]);
  put(f, 27, 24 + oy, [255, 190, 214]);

  arms(f, o, { sleeve: F6.dress, skin: F6.skin });

  // toc hong bob, mai bang
  ellipse(f, 24, 13 + hy, 13, 10, F6.hair);
  rect(f, 11, 15 + hy, 4, 9, F6.hair);
  rect(f, 33, 15 + hy, 4, 9, F6.hair);
  rect(f, 12, 21 + hy, 2, 3, F6.hairD);
  rect(f, 34, 21 + hy, 2, 3, F6.hairD);
  ellipse(f, 24, 15 + hy, 9, 7, F6.skin);
  rect(f, 15, 8 + hy, 18, 3, F6.hair);
  for (let x = 15; x <= 32; x += 2) put(f, x, 11 + hy, F6.hair);
  rect(f, 15, 11 + hy, 2, 5, F6.hair);
  rect(f, 31, 11 + hy, 2, 5, F6.hair);
  rect(f, 18, 5 + hy, 7, 1, F6.hairL);
  rect(f, 16, 6 + hy, 2, 1, F6.hairL);

  // mat: 1 mat mo, 1 mat nhay (hoac ca hai cuoi khi vui), ma hong, nu cuoi to
  const ey = 15 + hy;
  const wink = (x) => {
    put(f, x, ey + 1, F6.pink);
    put(f, x + 1, ey, F6.pink);
    put(f, x + 2, ey, F6.pink);
    put(f, x + 3, ey + 1, F6.pink);
  };
  if (o.happy) {
    wink(18);
    wink(27);
  } else {
    rect(f, 18, ey - 1, 3, 1, F6.eyeD);
    rect(f, 18, ey, 3, 3, F6.eyeD);
    put(f, 18, ey, WHITE);
    put(f, 20, ey + 2, [255, 226, 236]);
    wink(27);
  }
  rect(f, 15, 18 + hy, 4, 2, F6.blush);
  rect(f, 30, 18 + hy, 4, 2, F6.blush);
  for (const [x, y] of [[21, 19], [22, 20], [23, 20], [24, 20], [25, 20], [26, 20], [27, 19]]) put(f, x, y + hy, F6.pink);
  if (o.happy) rect(f, 23, 21 + hy, 3, 1, F6.pink);

  // bong hoa trang lon cai tren toc (8 canh bo tron nhu logo), tam vang
  const fx = 31;
  const fy = 6 + hy;
  for (const [dx, col] of [[1, F6.petalShade], [0, F6.petal]]) {
    ellipse(f, fx + dx, fy + dx, 2, 2, col);
    for (let k = 0; k < 8; k++) {
      const ang = (k * Math.PI) / 4;
      ellipse(f, fx + dx + Math.cos(ang) * 3.4, fy + dx + Math.sin(ang) * 3.4, 1.6, 1.6, col);
    }
  }
  rect(f, fx - 1, fy - 1, 3, 3, F6.petalCenter);

  drawHearts(f, o.hearts);
  return addOutline(f, OUT);
}

export const CHARACTERS = {
  npc01: { draw: vestGirl },
  npc02: { draw: silverQueen, hearts: [[2, 4], [2, 14], [3, 24], [2, 34]] },
  npc03: { draw: dlicomGirl },
  npc04: { draw: penguin, hearts: [[1, 2], [41, 4], [40, 12], [40, 22]] },
  npc05: { draw: snakeLady, hearts: [[1, 28], [42, 1], [42, 38], [1, 38]] },
  npc06: { draw: flowerGirl },
};
