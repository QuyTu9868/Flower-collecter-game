import pg from 'pg';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Thieu DATABASE_URL. Tao file .env (xem .env.example) hoac dat bien moi truong.');
  process.exit(1);
}

// Postgres tren Supabase/Render bat buoc SSL, con Postgres o may local thi khong
const isLocal = /localhost|127\.0\.0\.1/.test(url);
const pool = new pg.Pool({ connectionString: url, ssl: isLocal ? false : { rejectUnauthorized: false } });

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS scores (
      id SERIAL PRIMARY KEY,
      nickname VARCHAR(16) NOT NULL,
      time_ms INTEGER NOT NULL,
      played_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

// Top thoi gian nhanh nhat (it nhat dung dau)
export async function getTop(limit) {
  const { rows } = await pool.query(
    'SELECT nickname, time_ms, played_at FROM scores ORDER BY time_ms ASC, played_at ASC LIMIT $1',
    [limit]
  );
  return rows.map((r) => ({ nickname: r.nickname, timeMs: r.time_ms, playedAt: r.played_at }));
}

// Luu 1 van thang, tra ve hang cua van do
export async function addScore(nickname, timeMs) {
  await pool.query('INSERT INTO scores (nickname, time_ms) VALUES ($1, $2)', [nickname, timeMs]);
  const { rows } = await pool.query('SELECT COUNT(*)::int AS faster FROM scores WHERE time_ms < $1', [timeMs]);
  return rows[0].faster + 1;
}
