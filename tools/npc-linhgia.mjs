// Linhgia (npc18): nhan vat chinh cua game, ve ky hon cac chi khac.
// Chibi toc bob den nau, tai nghe hong, ghim hoa hong, ao thun kem rong co day deo balo hong, quan rong, giay hong.
// Co hieu ung lap lanh (ngoi sao nho) quanh nguoi. Xuat 3 bo: idle (4 khung), receive (4 khung), complete (5 khung).
import { newFrame, put, rect, addOutline, ellipse } from './png.mjs';
import { OUT, WHITE, drawHearts } from './npc-characters.mjs';

const L = {
  hair: [56, 38, 50], hairL: [120, 88, 108], hairD: [32, 22, 32],
  skin: [255, 232, 216], skinD: [236, 196, 182], blush: [255, 148, 168],
  eyeD: [38, 24, 30], iris: [96, 58, 56], lash: [28, 18, 26], mouth: [224, 88, 112], tongue: [255, 150, 160],
  phones: [250, 148, 172], phonesL: [255, 204, 218], phonesD: [208, 96, 126], cushion: [255, 228, 234],
  tee: [255, 251, 240], teeD: [232, 220, 198],
  pants: [228, 226, 218], pantsD: [198, 196, 188],
  shoe: [250, 140, 166], sole: [255, 255, 255], lace: [255, 232, 238],
  bag: [250, 166, 186], bagD: [214, 112, 140], bagL: [255, 214, 224],
  pin: [255, 172, 202], pinC: [255, 226, 110],
  spark: [255, 244, 186],
};

const HEARTS5 = [[4, 6], [41, 4], [40, 12], [3, 14], [2, 24]];

// Ngoi sao 4 canh lap lanh (ve SAU khi them vien de khong bi vien den)
function sparkle(f, x, y, big) {
  put(f, x, y, WHITE);
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) put(f, x + dx, y + dy, L.spark);
  if (big) for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2]]) put(f, x + dx, y + dy, L.spark);
}

// o: oy (nhay len), hy (dau nhun), arms (0 xuong, 1 dang ngang, 2 gio len), happy (mat cuoi), hearts, sparkles [[x,y,big]]
function linhgia(o) {
  const f = newFrame();
  const oy = o.oy ?? 0;
  const hy = oy + (o.hy ?? 0);
  const pose = o.arms ?? 0;

  // quan rong, giay hong de trang
  rect(f, 18, 30 + oy, 12, 5, L.pants);
  rect(f, 16, 35 + oy, 16, 2, L.pants);
  rect(f, 23, 32 + oy, 2, 5, L.pantsD);
  rect(f, 16, 36 + oy, 16, 1, L.pantsD);
  rect(f, 16, 37 + oy, 7, 2, L.shoe);
  rect(f, 25, 37 + oy, 7, 2, L.shoe);
  rect(f, 16, 39 + oy, 7, 1, L.sole);
  rect(f, 25, 39 + oy, 7, 1, L.sole);
  rect(f, 19, 37 + oy, 2, 1, L.lace);
  rect(f, 28, 37 + oy, 2, 1, L.lace);

  // ao thun kem rong co nep gap, day deo balo hong
  rect(f, 16, 23 + oy, 16, 8, L.tee);
  rect(f, 16, 28 + oy, 16, 3, L.teeD);
  for (const [x, y] of [[20, 25], [21, 26], [22, 27], [28, 25], [27, 26]]) put(f, x, y + oy, L.teeD);
  rect(f, 19, 23 + oy, 2, 6, L.bag);
  rect(f, 27, 23 + oy, 2, 6, L.bag);
  put(f, 19, 26 + oy, L.bagL);
  put(f, 28, 26 + oy, L.bagL);
  rect(f, 21, 22 + oy, 6, 2, L.skin);

  // tay: ao rong, ban tay nho
  if (pose === 0) {
    rect(f, 12, 23 + oy, 4, 4, L.tee);
    rect(f, 13, 27 + oy, 3, 3, L.skin);
    rect(f, 32, 23 + oy, 4, 4, L.tee);
    rect(f, 32, 27 + oy, 3, 3, L.skin);
  } else if (pose === 1) {
    rect(f, 11, 23 + oy, 5, 3, L.tee);
    rect(f, 8, 24 + oy, 3, 3, L.skin);
    rect(f, 32, 23 + oy, 5, 3, L.tee);
    rect(f, 37, 24 + oy, 3, 3, L.skin);
  }

  // toc bob: khoi toc + 2 ben vao trong o duoi
  ellipse(f, 24, 13 + hy, 13, 10, L.hair);
  rect(f, 11, 15 + hy, 4, 9, L.hair);
  rect(f, 33, 15 + hy, 4, 9, L.hair);
  rect(f, 13, 22 + hy, 2, 2, L.hairD);
  rect(f, 33, 22 + hy, 2, 2, L.hairD);
  put(f, 12, 24 + hy, L.hair);
  put(f, 35, 24 + hy, L.hair);

  // mat
  ellipse(f, 24, 15 + hy, 9, 7, L.skin);
  rect(f, 19, 21 + hy, 10, 1, L.skinD);

  // mai thua: toc mai quet nghieng, vai soi xong len tran
  rect(f, 15, 8 + hy, 18, 3, L.hair);
  for (let x = 15; x <= 32; x += 3) put(f, x, 11 + hy, L.hair);
  rect(f, 15, 11 + hy, 5, 2, L.hair);
  rect(f, 15, 13 + hy, 2, 2, L.hair);
  rect(f, 29, 11 + hy, 4, 3, L.hair);
  rect(f, 18, 5 + hy, 8, 1, L.hairL);
  rect(f, 16, 6 + hy, 2, 1, L.hairL);
  rect(f, 27, 6 + hy, 3, 1, L.hairL);
  rect(f, 15, 9 + hy, 3, 1, L.hairL);

  // mat to long lanh (hoac cuoi nham khi vui), ma hong, mieng cuoi
  const y = 15 + hy;
  if (o.happy) {
    for (const e of [18, 27]) {
      put(f, e, y + 1, L.lash);
      put(f, e + 1, y, L.lash);
      put(f, e + 2, y, L.lash);
      put(f, e + 3, y + 1, L.lash);
    }
  } else {
    for (const e of [18, 27]) {
      rect(f, e, y - 1, 3, 1, L.lash);
      rect(f, e, y, 3, 1, L.eyeD);
      rect(f, e, y + 1, 3, 3, L.iris);
      rect(f, e + 1, y + 2, 1, 2, L.eyeD);
      put(f, e, y + 1, WHITE);
      put(f, e + 2, y + 3, [255, 226, 236]);
    }
    put(f, 17, y - 1, L.lash);
    put(f, 30, y - 1, L.lash);
  }
  rect(f, 15, 18 + hy, 4, 2, L.blush);
  rect(f, 30, 18 + hy, 4, 2, L.blush);
  if (o.happy) {
    rect(f, 22, 20 + hy, 5, 1, L.mouth);
    rect(f, 23, 21 + hy, 3, 1, L.mouth);
    put(f, 24, 21 + hy, L.tongue);
  } else {
    rect(f, 23, 20 + hy, 3, 1, L.mouth);
    put(f, 24, 21 + hy, L.tongue);
  }

  // tai nghe hong: cung vong qua dinh dau + 2 mieng tai co dem tai trang
  let prev = null;
  for (let x = 11; x <= 37; x++) {
    const t = (x - 24) / 13.5;
    const by = Math.round(14 - 12.5 * Math.sqrt(Math.max(0, 1 - t * t))) + hy;
    // To lien cac pixel doc theo cung (khong de ho o doan doc)
    const from = prev === null ? by : Math.min(by, prev);
    const to = prev === null ? by : Math.max(by, prev);
    for (let yy = from; yy <= to; yy++) put(f, x, yy, L.phones);
    if (to === from) put(f, x, by + 1, L.phones);
    put(f, x, from, L.phonesL);
    prev = by;
  }
  for (const cx of [11, 37]) {
    ellipse(f, cx, 17 + hy, 2.5, 3.5, L.phones);
    ellipse(f, cx, 17 + hy, 1.2, 2.2, L.cushion);
    put(f, cx, 19 + hy, L.phonesD);
  }

  // ghim hoa hong tren toc
  for (const [x, yy] of [[32, 6], [31, 7], [33, 7], [30, 8], [34, 8], [31, 9], [33, 9], [32, 10]]) put(f, x, yy + hy, L.pin);
  rect(f, 31, 7 + hy, 3, 3, L.pin);
  put(f, 32, 8 + hy, L.pinC);

  if (pose === 2) {
    rect(f, 8, 21 + oy, 4, 4, L.tee);
    rect(f, 6, 15 + oy, 4, 6, L.skin);
    rect(f, 36, 21 + oy, 4, 4, L.tee);
    rect(f, 38, 15 + oy, 4, 6, L.skin);
  }

  drawHearts(f, o.hearts);
  const out = addOutline(f, OUT);
  for (const [x, yy, big] of o.sparkles ?? []) sparkle(out, x, yy, big);
  return out;
}

const SP = [[6, 12, false], [41, 22, true]];
const idle = [
  linhgia({ hy: 0, sparkles: [[6, 12, false], [41, 22, true]] }),
  linhgia({ hy: 1, sparkles: [[6, 12, true], [41, 22, false]] }),
  linhgia({ hy: 1, sparkles: [[40, 8, false], [7, 24, true]] }),
  linhgia({ hy: 0, sparkles: [[40, 8, true], [7, 24, false]] }),
];
const receive = [
  linhgia({ arms: 1, happy: true, sparkles: [[5, 10, true], [43, 12, true]] }),
  linhgia({ arms: 2, happy: true, oy: -2, hearts: HEARTS5.slice(0, 1), sparkles: SP }),
  linhgia({ arms: 2, happy: true, oy: -1, hearts: HEARTS5.slice(0, 2), sparkles: [[6, 30, true], [42, 28, true]] }),
  linhgia({ arms: 2, happy: true, oy: 0, hearts: HEARTS5.slice(0, 3), sparkles: SP }),
];
const complete = [
  linhgia({ arms: 2, happy: true, oy: -2, hearts: HEARTS5.slice(0, 1), sparkles: [[6, 30, true], [42, 30, true]] }),
  linhgia({ arms: 2, happy: true, oy: 0, hearts: HEARTS5.slice(0, 2), sparkles: SP }),
  linhgia({ arms: 2, happy: true, oy: -2, hearts: HEARTS5.slice(0, 3), sparkles: [[6, 30, true], [42, 30, true], [24, 1, true]] }),
  linhgia({ arms: 2, happy: true, oy: 0, hearts: HEARTS5.slice(0, 4), sparkles: SP }),
  // Khung cuoi (giu den het van): nhieu tim va sao
  linhgia({ arms: 2, happy: true, oy: 0, hearts: HEARTS5, sparkles: [[6, 32, true], [43, 30, true], [42, 40, false], [5, 44, false], [24, 1, true]] }),
];

export const LINHGIA = { idle, receive, complete };
