// Noi chuyen voi server (bang xep hang) va dinh dang thoi gian / bang xep hang.

export function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// Tra ve mang top 10, hoac null neu khong ket noi duoc server
export async function fetchTop() {
  try {
    const res = await fetch('/api/scores');
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

// Tra ve { rank } neu luu duoc, hoac { error } kem cau bao loi
export async function submitScore(nickname, timeMs) {
  try {
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, timeMs }),
    });
    const data = await res.json();
    return res.ok ? { rank: data.rank } : { error: data.error };
  } catch {
    return { error: 'Không kết nối được server' };
  }
}

export function formatBoard(rows) {
  if (rows === null) return 'Không kết nối được server';
  if (rows.length === 0) return 'Chưa có ai';
  return rows.map((r, i) => `${String(i + 1).padStart(2)}. ${r.nickname.padEnd(16)} ${formatTime(r.timeMs)}`).join('\n');
}
