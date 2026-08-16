-- DevTool 메뉴가 다루는 리소스(메모, 북마크 등) 메타정보 테이블
CREATE TABLE IF NOT EXISTS resource (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  resource_key VARCHAR(100),
  fields       JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
