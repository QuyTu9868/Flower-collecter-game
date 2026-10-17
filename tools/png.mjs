// Ham dung chung cho cac script tao sprite: ve pixel va ghi file PNG (khong can thu vien).
import zlib from 'node:zlib';

export const S = 48;

export const newFrame = () => new Uint8Array(S * S * 4);

export const put = (f, x, y, c) => {
  if (x < 0 || y < 0 || x >= S || y >= S) return;
  const i = (y * S + x) * 4;
  f[i] = c[0]; f[i + 1] = c[1]; f[i + 2] = c[2]; f[i + 3] = 255;
};

export const rect = (f, x, y, w, h, c) => {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(f, x + i, y + j, c);
};

export const solid = (f, x, y) => x >= 0 && y >= 0 && x < S && y < S && f[(y * S + x) * 4 + 3] > 0;

// Them vien toi 1px bao ngoai hinh, tra ve khung moi
export function addOutline(f, color) {
  const out = Uint8Array.from(f);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      if (solid(f, x, y)) continue;
      if (solid(f, x - 1, y) || solid(f, x + 1, y) || solid(f, x, y - 1) || solid(f, x, y + 1)) {
        put(out, x, y, color);
      }
    }
  }
  return out;
}

// Xep cac khung thanh 1 hang ngang; scale > 1 va bg dung de xem truoc
export function sheet(frames, scale = 1, bg = null) {
  const w = S * frames.length * scale;
  const h = S * scale;
  const px = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const fi = Math.floor(x / scale / S);
      const sx = Math.floor(x / scale) % S;
      const sy = Math.floor(y / scale);
      const si = (sy * S + sx) * 4;
      const di = (y * w + x) * 4;
      if (frames[fi][si + 3]) {
        px.set(frames[fi].subarray(si, si + 4), di);
      } else if (bg) {
        px.set([bg[0], bg[1], bg[2], 255], di);
      }
    }
  }
  return { w, h, px };
}

const TABLE = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};

export function encodePng({ w, h, px }) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // 8 bit
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    Buffer.from(px.buffer, y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Hinh elip dac (rx, ry la ban kinh, tam la (cx, cy))
export const ellipse = (f, cx, cy, rx, ry, c) => {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      if (((x - cx) / (rx + 0.3)) ** 2 + ((y - cy) / (ry + 0.3)) ** 2 <= 1) put(f, x, y, c);
    }
  }
};

// Trai tim nho 5x4 pixel, goc tren trai tai (x, y)
const HEART = ['.X.X.', 'XXXXX', '.XXX.', '..X..'];
export const heart = (f, x, y, c) => {
  HEART.forEach((row, j) => [...row].forEach((ch, i) => ch === 'X' && put(f, x + i, y + j, c)));
};
