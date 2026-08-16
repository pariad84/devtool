-- 북마크 테이블
CREATE TABLE IF NOT EXISTS bookmark (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  url         VARCHAR(2048) NOT NULL,
  status      VARCHAR(50)  NOT NULL DEFAULT 'Active',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookmark_status ON bookmark (status);
