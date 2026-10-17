// Tao 5 bong hoa (chi ve bong, co vien toi de noi tren nen co) vao /assets/flowers.png, moi khung 48x48.
// Thu tu khung: 0 do (hong), 1 vang (huong duong), 2 xanh (5 canh), 3 trang (cuc), 4 hong (anh dao).
// Chay: node tools/make-flowers.mjs [duong_dan_anh_xem_truoc.png]
import fs from 'node:fs';
import { newFrame, put, addOutline, sheet, encodePng } from './png.mjs';

const OUTLINE = [34, 22, 44];
const CX = 24;
const CY = 24;

// Tu 3 tong mau (sang, giua, toi): sang o goc tren trai, toi o goc duoi phai cua tung canh
function shade(tones, dx, dy, r) {
  const v = (-0.6 * dx - 0.8 * dy) / r;
  return v > 0.35 ? tones.light : v < -0.35 ? tones.dark : tones.base;
}

// Ve 1 vong n canh hoa tron: R = khoang cach tu tam toi tam canh, pr = ban kinh canh
function petals(f, n, R, pr, tones, rot = -Math.PI / 2) {
  for (let k = 0; k < n; k++) {
    const a = rot + (k * 2 * Math.PI) / n;
    const px = CX + Math.cos(a) * R;
    const py = CY + Math.sin(a) * R;
    for (let y = Math.floor(py - pr); y <= Math.ceil(py + pr); y++) {
      for (let x = Math.floor(px - pr); x <= Math.ceil(px + pr); x++) {
        if (Math.hypot(x + 0.5 - px, y + 0.5 - py) <= pr) put(f, x, y, shade(tones, x + 0.5 - px, y + 0.5 - py, pr));
      }
    }
  }
}

function disc(f, r, tones) {
  for (let y = Math.floor(CY - r) - 1; y <= Math.ceil(CY + r); y++) {
    for (let x = Math.floor(CX - r) - 1; x <= Math.ceil(CX + r); x++) {
      if (Math.hypot(x + 0.5 - CX, y + 0.5 - CY) <= r) put(f, x, y, shade(tones, x + 0.5 - CX, y + 0.5 - CY, r));
    }
  }
}


// Duong ke toi giua cac canh de tach canh ra: tu ban kinh r0 den r1, o goc giua 2 canh lien tiep
function creases(f, n, r0, r1, color, rot = -Math.PI / 2) {
  for (let k = 0; k < n; k++) {
    const a = rot + ((k + 0.5) * 2 * Math.PI) / n;
    for (let t = r0; t <= r1; t += 0.5) {
      put(f, Math.floor(CX + Math.cos(a) * t), Math.floor(CY + Math.sin(a) * t), color);
    }
  }
}
const finish = (f) => addOutline(f, OUTLINE);

function rose() {
  const f = newFrame();
  const outer = { light: [240, 90, 100], base: [205, 35, 55], dark: [140, 18, 40] };
  const mid = { light: [250, 120, 125], base: [222, 55, 72], dark: [160, 25, 48] };
  petals(f, 7, 6.2, 4.2, outer);
  creases(f, 7, 4.5, 8, [120, 14, 36]);
  petals(f, 5, 3.4, 3.2, mid, -Math.PI / 2 + 0.5);
  creases(f, 5, 2.5, 5.5, [130, 18, 40], -Math.PI / 2 + 0.5);
  disc(f, 2.4, { light: [255, 150, 150], base: [235, 80, 90], dark: [170, 30, 55] });
  put(f, CX - 1, CY - 1, [150, 22, 44]);
  put(f, CX, CY - 1, [150, 22, 44]);
  put(f, CX, CY, [150, 22, 44]);
  return finish(f);
}

function sunflower() {
  const f = newFrame();
  petals(f, 14, 7, 2.9, { light: [255, 242, 130], base: [255, 214, 50], dark: [226, 156, 20] });
  petals(f, 14, 5.4, 2.4, { light: [255, 232, 100], base: [250, 196, 35], dark: [214, 140, 16] }, -Math.PI / 2 + 0.22);
  disc(f, 4.2, { light: [150, 92, 44], base: [112, 64, 30], dark: [74, 40, 22] });
  for (const [dx, dy] of [[-2, -2], [0, -3], [2, -1], [-3, 0], [-1, 0], [1, 1], [3, 1], [-2, 2], [0, 3], [2, 3]]) {
    put(f, CX + dx, CY + dy, [176, 112, 52]);
  }
  return finish(f);
}

function blueFlower() {
  const f = newFrame();
  petals(f, 5, 5.8, 4.8, { light: [140, 196, 255], base: [66, 134, 240], dark: [34, 82, 192] });
  creases(f, 5, 3, 7.5, [28, 70, 170]);
  disc(f, 2.6, { light: [255, 252, 210], base: [255, 238, 150], dark: [235, 190, 80] });
  put(f, CX - 1, CY - 1, [250, 160, 40]);
  put(f, CX, CY, [250, 160, 40]);
  return finish(f);
}

function daisy() {
  const f = newFrame();
  petals(f, 12, 6.6, 3, { light: [255, 255, 255], base: [244, 248, 252], dark: [190, 206, 224] });
  disc(f, 3.4, { light: [255, 226, 90], base: [255, 196, 40], dark: [226, 140, 20] });
  put(f, CX - 1, CY - 1, [255, 240, 150]);
  return finish(f);
}

function blossom() {
  const f = newFrame();
  petals(f, 5, 5.4, 4.9, { light: [255, 196, 220], base: [255, 128, 176], dark: [218, 72, 134] });
  creases(f, 5, 3, 7.5, [196, 52, 112]);
  disc(f, 2.8, { light: [230, 90, 150], base: [196, 46, 108], dark: [150, 24, 80] });
  for (let k = 0; k < 5; k++) {
    const a = (k * 2 * Math.PI) / 5 - Math.PI / 2;
    put(f, Math.round(CX + Math.cos(a) * 1.8 - 0.5), Math.round(CY + Math.sin(a) * 1.8 - 0.5), [255, 236, 150]);
  }
  return finish(f);
}

const frames = [rose(), sunflower(), blueFlower(), daisy(), blossom()];
fs.writeFileSync('assets/flowers.png', encodePng(sheet(frames)));
if (process.argv[2]) {
  fs.writeFileSync(process.argv[2], encodePng(sheet(frames, 6, [118, 200, 97])));
}
console.log('done');
