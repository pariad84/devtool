-- 메모 테이블
CREATE TABLE IF NOT EXISTS memo (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  status      VARCHAR(50)  NOT NULL DEFAULT 'Active',
  content     TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memo_status ON memo (status);
