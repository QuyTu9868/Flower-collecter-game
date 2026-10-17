// Tao sprite NPC vao /assets: npc01 den npc17 (npc-characters.mjs, npc-characters-2.mjs) va Linhgia = npc18 (npc-linhgia.mjs).
// Chay: node tools/make-npcs.mjs [duong_dan_anh_xem_truoc.png]
import fs from 'node:fs';
import { sheet, encodePng } from './png.mjs';
import { CHARACTERS, FRAME_HEARTS } from './npc-characters.mjs';
import { CHARACTERS_2 } from './npc-characters-2.mjs';
import { LINHGIA } from './npc-linhgia.mjs';

// 3 bo anim (idle, receive, complete) cho 1 nhan vat. H la danh sach vi tri trai tim bay (toi da 4)
function animSet(draw, H) {
  const hearts = (n) => H.slice(0, n);
  return {
    idle: [draw({ arms: 0, hy: 0 }), draw({ arms: 0, hy: 1 })],
    receive: [
      draw({ arms: 1, happy: true }),
      draw({ arms: 2, happy: true, oy: -2, hearts: hearts(1) }),
      draw({ arms: 2, happy: true, oy: -1, hearts: hearts(2) }),
    ],
    complete: [
      draw({ arms: 2, happy: true, oy: -2, hearts: hearts(1) }),
      draw({ arms: 2, happy: true, oy: 0, hearts: hearts(2) }),
      draw({ arms: 2, happy: true, oy: -1, hearts: hearts(3) }),
      draw({ arms: 2, happy: true, oy: 0, hearts: hearts(4) }),
    ],
  };
}

const SETS = { npc18: LINHGIA };
for (const [name, ch] of Object.entries({ ...CHARACTERS, ...CHARACTERS_2 })) {
  SETS[name] = animSet(ch.draw, ch.hearts ?? FRAME_HEARTS.default);
}

const write = (name, frames) => fs.writeFileSync(`assets/${name}.png`, encodePng(sheet(frames)));
for (const [name, set] of Object.entries(SETS)) {
  write(`${name}_idle`, set.idle);
  write(`${name}_receive`, set.receive);
  write(`${name}_complete`, set.complete);
}

// Anh xem truoc: moi nhan vat 1 hang (idle, receive, complete) xep ngang; them 2 anh tong hop de so sanh
if (process.argv[2]) {
  const bg = [59, 122, 51];
  const sets = Object.entries(SETS).sort(([a], [b]) => a.localeCompare(b));
  for (const [name, set] of sets) {
    const out = process.argv[2].replace('.png', `_${name}.png`);
    fs.writeFileSync(out, encodePng(sheet([...set.idle, ...set.receive, ...set.complete], 6, bg)));
  }
  fs.writeFileSync(process.argv[2].replace('.png', '_all_idle.png'), encodePng(sheet(sets.map(([, s]) => s.idle[0]), 3, bg)));
  fs.writeFileSync(process.argv[2].replace('.png', '_all_done.png'), encodePng(sheet(sets.map(([, s]) => s.complete[s.complete.length - 1]), 3, bg)));
}
console.log('done', Object.keys(SETS).join(' '));
