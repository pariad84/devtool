const express = require('express');
const path = require('path');
const pool = require('./db');
const resourceRoutes = require('./routes/resource');

const hostname = '127.0.0.1';
const port = 3000;

const publicDir = path.join(__dirname, 'public');   // CSS, JS, 이미지 등 정적 파일
const viewsDir = path.join(__dirname, 'views');      // HTML 파일 (index.html 등)

const app = express();
app.use(express.json());

// DB 연결 상태 확인용 헬스체크
app.get('/api/db/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS now');
    res.json({ ok: true, now: result.rows[0].now });
  } catch (err) {
    console.error('DB 헬스체크 실패:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.use('/api', resourceRoutes);

// 정적 파일: HTML은 views/, 그 외(CSS/JS 등)는 public/
app.use(express.static(viewsDir));
app.use(express.static(publicDir));

app.use((req, res) => {
  res.status(404).type('html').send('<h1>404 Not Found</h1>');
});

app.listen(port, hostname, () => {
  console.log(`서버 실행 중: http://${hostname}:${port}/`);
});
