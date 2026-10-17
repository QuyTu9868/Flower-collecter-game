import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDb, getTop, addScore } from './db.js';

const PORT = process.env.PORT || 3000;
const NAME_MAX = 16;
const TIME_MIN_MS = 30 * 1000; // nhanh hon 30 giay la khong the
const TIME_MAX_MS = 3 * 60 * 60 * 1000; // lau hon 3 gio la khong hop ly

const app = express();
app.use(express.json({ limit: '1kb' }));

app.get('/api/scores', async (req, res) => {
  res.json(await getTop(10));
});

app.post('/api/scores', async (req, res) => {
  const { nickname, timeMs } = req.body ?? {};
  const name = typeof nickname === 'string' ? nickname.trim() : '';
  if (name.length < 1 || name.length > NAME_MAX) {
    return res.status(400).json({ error: `Biệt danh phải từ 1 đến ${NAME_MAX} ký tự` });
  }
  if (!Number.isInteger(timeMs) || timeMs < TIME_MIN_MS || timeMs > TIME_MAX_MS) {
    return res.status(400).json({ error: 'Thời gian không hợp lệ' });
  }
  const rank = await addScore(name, timeMs);
  res.status(201).json({ rank });
});

// Khi deploy: server phuc vu luon ban game da build (thu muc dist)
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
app.use(express.static(dist));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: 'Lỗi server' });
});

await initDb();
app.listen(PORT, () => console.log(`Server chay o http://localhost:${PORT}`));
