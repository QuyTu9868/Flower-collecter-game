// Cac huong ngam cua sung, dung chung cho script ve sprite (tools/make-player.mjs) va game.
// hand: vi tri ban tay cam sung trong khung 48x48; angle: do (0 = sang phai, 90 = xuong, -90 = len);
// len: do dai sung. Huong trai thi game lat ngang sprite.
// 5 huong ve san: E (ngang), SE (cheo xuong), NE (cheo len), S (thang mat), N (quay lung).
// Cong voi 3 huong lat trai (W, SW, NW) la du 8 huong.
export const AIM = {
  E: { hand: [34, 22], angle: 0, len: 9, view: 'side' },
  SE: { hand: [33, 25], angle: 45, len: 8, view: 'dfront' },
  NE: { hand: [33, 23], angle: -45, len: 8, view: 'dback' },
  S: { hand: [33, 30], angle: 90, len: 7, view: 'front' },
  N: { hand: [38, 17], angle: -90, len: 8, view: 'back' },
};

// Cac moc goc (sau khi lat trai thanh phai) de chon huong gan nhat
export const AIM_ANGLES = [
  [-90, 'N'],
  [-45, 'NE'],
  [0, 'E'],
  [45, 'SE'],
  [90, 'S'],
];

// Vi tri dau nong sung trong khung 48x48
export function muzzleOf(key) {
  const { hand, angle, len } = AIM[key];
  const r = (angle * Math.PI) / 180;
  return [Math.round(hand[0] + Math.cos(r) * len), Math.round(hand[1] + Math.sin(r) * len)];
}
