-- 리소스 데이터를 표준화된 JSONB 엔트리 테이블로 저장.
-- 리소스마다 실제 컬럼을 따로 두지 않고 {resource_key}_entry(id, data JSONB, created_at, updated_at)
-- 형태를 그대로 반복해서 쓴다. 새 리소스가 생기면 이 템플릿으로 테이블만 하나 새로 만들면 됨.
CREATE TABLE IF NOT EXISTS memo_entry (
  id         SERIAL PRIMARY KEY,
  data       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookmark_entry (
  id         SERIAL PRIMARY KEY,
  data       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 기존 memo/bookmark 테이블 데이터를 엔트리 테이블로 이관 (id/시간 보존)
INSERT INTO memo_entry (id, data, created_at, updated_at)
SELECT id, jsonb_build_object('name', name, 'status', status, 'content', content), created_at, updated_at
FROM memo
ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('memo_entry', 'id'), COALESCE((SELECT MAX(id) FROM memo_entry), 1));

INSERT INTO bookmark_entry (id, data, created_at, updated_at)
SELECT id, jsonb_build_object('name', name, 'url', url, 'status', status), created_at, updated_at
FROM bookmark
ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('bookmark_entry', 'id'), COALESCE((SELECT MAX(id) FROM bookmark_entry), 1));

-- 예전 테이블은 바로 DROP하지 않고 백업 이름으로 보관 (확인 후 필요 없어지면 직접 DROP)
ALTER TABLE memo RENAME TO memo_old;
ALTER TABLE bookmark RENAME TO bookmark_old;
