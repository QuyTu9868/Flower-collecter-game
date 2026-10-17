// Tao sprite zombie (di 4 khung, quay mat sang phai, game tu lat trai/phai) vao /assets/zombie_walk.png.
// Chay: node tools/make-zombie.mjs [duong_dan_anh_xem_truoc.png]
import fs from 'node:fs';
import { newFrame, rect, put, addOutline, sheet, encodePng } from './png.mjs';

const C = {
  skin: [118, 176, 92],
  skinShade: [84, 134, 70],
  hair: [52, 70, 38],
  shirt: [104, 112, 134],
  shirtDark: [72, 78, 100],
  rip: [118, 176, 92],
  pants: [74, 66, 92],
  pantsDark: [52, 46, 68],
  foot: [44, 38, 54],
  eye: [226, 48, 48],
  mouth: [36, 30, 30],
  blood: [150, 30, 36],
  outline: [20, 30, 20],
};

// Chan: cx la tam chan, lift la do nhac len
function leg(f, cx, lift) {
  const bottom = 38 - lift;
  rect(f, cx - 2, 27, 4, bottom - 27 + 1, C.pants);
  rect(f, cx - 2, 27, 1, bottom - 27 + 1, C.pantsDark);
  rect(f, cx - 2, bottom + 1, 6, 2, C.foot);
}

// by: nhun, legs, armDy: tay giat len xuong
function drawZombie(by, legs, armDy) {
  const f = newFrame();

  // tay sau (xa), duoi thang ve phia truoc
  rect(f, 27, 21 + by + armDy, 10, 3, C.skinShade);
  rect(f, 36, 20 + by + armDy, 2, 5, C.skinShade);

  leg(f, legs[0].cx, legs[0].lift);
  leg(f, legs[1].cx, legs[1].lift);

  // than: ao rach
  rect(f, 19, 17 + by, 11, 11, C.shirt);
  rect(f, 19, 24 + by, 11, 4, C.shirtDark);
  rect(f, 21, 27 + by, 2, 2, C.shirt); // vat ao rach
  rect(f, 26, 28 + by, 2, 1, C.shirt);
  rect(f, 23, 20 + by, 3, 3, C.rip); // lo thung mat da
  rect(f, 22, 22 + by, 2, 1, C.blood);

  // dau
  rect(f, 18, 6 + by, 13, 11, C.skin);
  rect(f, 18, 14 + by, 13, 3, C.skinShade);
  rect(f, 18, 5 + by, 6, 2, C.hair);
  rect(f, 21, 6 + by, 3, 1, C.hair);
  rect(f, 22, 10 + by, 2, 2, C.eye);
  rect(f, 27, 10 + by, 2, 2, C.eye);
  rect(f, 24, 14 + by, 5, 2, C.mouth);
  rect(f, 25, 15 + by, 1, 1, C.eyeWhite ?? [230, 230, 210]);
  rect(f, 28, 8 + by, 3, 1, C.blood);

  // tay truoc (gan), duoi thang ve phia truoc
  rect(f, 28, 18 + by - armDy, 10, 3, C.skin);
  rect(f, 37, 17 + by - armDy, 2, 5, C.skin);
  rect(f, 28, 20 + by - armDy, 10, 1, C.skinShade);

  return addOutline(f, C.outline);
}

const frames = [
  drawZombie(0, [{ cx: 21, lift: 1 }, { cx: 28, lift: 0 }], 0),
  drawZombie(-1, [{ cx: 24, lift: 2 }, { cx: 24, lift: 0 }], 1),
  drawZombie(0, [{ cx: 28, lift: 0 }, { cx: 21, lift: 1 }], 0),
  drawZombie(-1, [{ cx: 24, lift: 0 }, { cx: 24, lift: 2 }], -1),
];

fs.writeFileSync('assets/zombie_walk.png', encodePng(sheet(frames)));
if (process.argv[2]) {
  fs.writeFileSync(process.argv[2], encodePng(sheet(frames, 6, [118, 200, 97])));
}
console.log('done');
