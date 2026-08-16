const express = require('express');
const pool = require('../db');

const router = express.Router();

// 리소스 엔트리(memo_entry, bookmark_entry, ...)는 전부 {resource_key}_entry(id, data JSONB, ...)
// 형태로 통일돼 있어서, 리소스 종류에 상관없이 이 라우트들로 전부 처리한다.
const RESOURCE_KEY_PATTERN = /^[a-z][a-z0-9_]*$/;

async function findResource(resourceKey) {
  if (!RESOURCE_KEY_PATTERN.test(resourceKey)) {
    return null;
  }
  const result = await pool.query('SELECT id, name, resource_key FROM resource WHERE resource_key = $1', [resourceKey]);
  return result.rows[0] || null;
}

function toEntryRow(row) {
  return { id: row.id, ...row.data, created_at: row.created_at, updated_at: row.updated_at };
}

// DevTool 메뉴가 다루는 리소스 목록 조회
router.get('/resource', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, resource_key, fields FROM resource ORDER BY id');
    res.json({ ok: true, rows: result.rows });
  } catch (err) {
    console.error('리소스 목록 조회 실패:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get('/:resourceKey', async (req, res) => {
  const resource = await findResource(req.params.resourceKey);
  if (!resource) {
    return res.status(404).json({ ok: false, error: 'unknown resource' });
  }
  try {
    const result = await pool.query(`SELECT id, data, created_at, updated_at FROM ${resource.resource_key}_entry ORDER BY id`);
    res.json({ ok: true, rows: result.rows.map(toEntryRow) });
  } catch (err) {
    console.error(resource.name + ' 목록 조회 실패:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.post('/:resourceKey', async (req, res) => {
  const resource = await findResource(req.params.resourceKey);
  if (!resource) {
    return res.status(404).json({ ok: false, error: 'unknown resource' });
  }
  try {
    const { id, ...data } = req.body;
    const result = await pool.query(
      `INSERT INTO ${resource.resource_key}_entry (data) VALUES ($1::jsonb) RETURNING id, data, created_at, updated_at`,
      [JSON.stringify(data)]
    );
    res.status(201).json({ ok: true, row: toEntryRow(result.rows[0]) });
  } catch (err) {
    console.error(resource.name + ' 등록 실패:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.put('/:resourceKey/:id', async (req, res) => {
  const resource = await findResource(req.params.resourceKey);
  if (!resource) {
    return res.status(404).json({ ok: false, error: 'unknown resource' });
  }
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ ok: false, error: 'invalid id' });
  }
  try {
    const { id: _ignored, ...data } = req.body;
    const result = await pool.query(
      `UPDATE ${resource.resource_key}_entry SET data = $1::jsonb, updated_at = now() WHERE id = $2 RETURNING id, data, created_at, updated_at`,
      [JSON.stringify(data), id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ ok: false, error: 'entry not found' });
    }
    res.json({ ok: true, row: toEntryRow(result.rows[0]) });
  } catch (err) {
    console.error(resource.name + ' 수정 실패:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
