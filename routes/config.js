const express = require('express');
const db = require('../db');

const router = express.Router();

// DB 접속 정보를 사용자가 직접 입력해서 저장 — 연결 테스트 성공 시에만 반영됨(db.js의 reconfigure 참고)
router.post('/config', async (req, res) => {
  const { host, database, user, password } = req.body;
  const port = Number(req.body.port);
  const ssl = !!req.body.ssl;

  if (!host || !port || !database || !user) {
    return res.status(400).json({ ok: false, error: 'host/port/database/user는 필수입니다' });
  }

  try {
    await db.reconfigure({ host, port, database, user, password: password || '', ssl });
    res.json({ ok: true });
  } catch (err) {
    console.error('DB 설정 저장 실패:', err);
    res.status(400).json({ ok: false, error: err.message });
  }
});

module.exports = router;
