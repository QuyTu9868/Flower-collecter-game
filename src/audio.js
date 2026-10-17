// Am thanh game: tao ra bang code (Web Audio), khong can file am thanh.
// Dung: initAudio(this.sound) o dau scene, roi play('shoot'), startMusic(), toggleMute()...

let ctx = null;
let master = null;
let noiseBuffer = null;
let musicTimer = null;
let muted = false;
try {
  muted = localStorage.getItem('muted') === '1';
} catch {
  /* khong co localStorage thi bo qua */
}

const MASTER_VOLUME = 0.7;

export function initAudio(soundManager) {
  ctx = soundManager.context ?? null; // NoAudio thi khong co context, moi ham ben duoi se bo qua
  if (!ctx || master) return;
  master = ctx.createGain();
  master.gain.value = muted ? 0 : MASTER_VOLUME;
  master.connect(ctx.destination);
}

export const isMuted = () => muted;

export function toggleMute() {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : MASTER_VOLUME;
  try {
    localStorage.setItem('muted', muted ? '1' : '0');
  } catch {
    /* bo qua */
  }
  return muted;
}

const ready = () => ctx && master && ctx.state === 'running';

// 1 nốt: freq (Hz) truot toi "to", keo dai dur giay, bat dau sau "at" giay
function tone({ freq, to = freq, dur, type = 'square', vol = 0.1, at = 0 }) {
  if (!ready()) return;
  const t = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to !== freq) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

// Tieng xoa (noi, no): loc thong thap quet tu "from" xuong "to"
function noise({ dur, vol = 0.1, from = 3000, to = 400, at = 0 }) {
  if (!ready()) return;
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const t = ctx.currentTime + at;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(from, t);
  filter.frequency.exponentialRampToValueAtTime(to, t + dur);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(gain).connect(master);
  src.start(t);
  src.stop(t + dur + 0.02);
}

const notes = (list, opts) => list.forEach(([freq, at]) => tone({ freq, at, ...opts }));

const SFX = {
  click: () => tone({ freq: 800, to: 1000, dur: 0.06, vol: 0.06 }),
  shoot: () => tone({ freq: 900, to: 300, dur: 0.07, vol: 0.05 }),
  hit: () => noise({ dur: 0.06, vol: 0.08, from: 2500, to: 800 }),
  die: () => {
    noise({ dur: 0.25, vol: 0.12, from: 1800, to: 200 });
    tone({ freq: 160, to: 50, dur: 0.25, type: 'sawtooth', vol: 0.08 });
  },
  hurt: () => {
    tone({ freq: 260, to: 70, dur: 0.3, type: 'sawtooth', vol: 0.12 });
    noise({ dur: 0.15, vol: 0.1, from: 2000, to: 300 });
  },
  pick: () => notes([[660, 0], [990, 0.07]], { dur: 0.1, type: 'sine', vol: 0.1 }),
  give: () => notes([[523, 0], [659, 0.09], [784, 0.18]], { dur: 0.2, type: 'sine', vol: 0.1 }),
  complete: () => notes([[523, 0], [659, 0.1], [784, 0.2], [1047, 0.3]], { dur: 0.3, type: 'triangle', vol: 0.12 }),
  appear: () => {
    tone({ freq: 300, to: 1800, dur: 0.9, type: 'sine', vol: 0.1 });
    notes([[1568, 0.9], [2093, 1.0]], { dur: 0.3, type: 'sine', vol: 0.08 });
  },
  win: () => notes([[523, 0], [659, 0.15], [784, 0.3], [1047, 0.45], [784, 0.65], [1047, 0.8]], { dur: 0.25, vol: 0.12 }),
  lose: () => notes([[392, 0], [330, 0.25], [262, 0.5], [196, 0.75]], { dur: 0.35, type: 'triangle', vol: 0.14 }),
};

export function play(name) {
  SFX[name]?.();
}

// ---------- Nhac nen: vong lap 16 nhip vui nhon (nhac nen thap hon hieu ung) ----------
const MELODY = [523.25, 659.25, 783.99, 659.25, 440, 523.25, 659.25, 523.25, 349.23, 440, 523.25, 440, 392, 493.88, 587.33, 493.88];
const BASS = [130.81, 0, 0, 0, 110, 0, 0, 0, 87.31, 0, 0, 0, 98, 0, 0, 0];
const STEP = 0.25; // giay moi nhip (120 nhip/phut, not tam)

export function startMusic() {
  stopMusic();
  if (!ctx) return;
  let step = 0;
  let next = 0;
  musicTimer = setInterval(() => {
    if (!ready()) {
      next = 0;
      return;
    }
    if (!next) next = ctx.currentTime + 0.1;
    while (next < ctx.currentTime + 0.3) {
      const i = step % MELODY.length;
      const at = next - ctx.currentTime;
      tone({ freq: MELODY[i], dur: 0.2, vol: 0.025, at });
      if (BASS[i]) tone({ freq: BASS[i], dur: 0.9, type: 'triangle', vol: 0.06, at });
      next += STEP;
      step++;
    }
  }, 80);
}

export function stopMusic() {
  clearInterval(musicTimer);
  musicTimer = null;
}
