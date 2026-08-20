require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '.env');

// DATABASE_URL이 있으면 우선 사용하고, 없으면 개별 PG* 환경변수를 사용합니다.
function buildPoolConfig(env = process.env) {
  return env.DATABASE_URL
    ? {
        connectionString: env.DATABASE_URL,
        ssl: env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
      }
    : {
        host: env.PGHOST || 'localhost',
        port: Number(env.PGPORT) || 5432,
        user: env.PGUSER || 'postgres',
        password: env.PGPASSWORD || '',
        database: env.PGDATABASE || 'postgres',
        ssl: env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
      };
}

function createPool(config) {
  const pool = new Pool({
    ...config,
    max: Number(process.env.PGPOOL_MAX) || 10,
    idleTimeoutMillis: 30000,
  });
  pool.on('error', (err) => {
    console.error('예기치 않은 PostgreSQL 풀 오류:', err);
  });
  return pool;
}

// .env의 기존 값을 보존하면서 주어진 키만 갱신(없으면 추가)하고, 현재 프로세스에도 바로 반영
function writeEnvFile(vars) {
  const lines = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8').split('\n') : [];
  Object.entries(vars).forEach(([key, value]) => {
    const line = `${key}=${value}`;
    const idx = lines.findIndex((l) => l.indexOf(key + '=') === 0);
    if (idx >= 0) {
      lines[idx] = line;
    } else {
      lines.push(line);
    }
    process.env[key] = value;
  });
  fs.writeFileSync(ENV_PATH, lines.join('\n'));
}

let currentPool = createPool(buildPoolConfig());

module.exports = {
  query: (...args) => currentPool.query(...args),

  // 접속 정보를 SELECT 1로 먼저 검증한 뒤에만 활성 풀을 교체하고 .env에 반영.
  // 비밀번호에 특수문자가 있어도 connectionString을 직접 조립하면서 encodeURIComponent로
  // 처리하므로, .env를 손으로 편집할 때처럼 퍼센트 인코딩을 사용자가 직접 신경 쓸 필요가 없다.
  reconfigure: async ({ host, port, user, password, database, ssl }) => {
    const connectionString = `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
    const config = { connectionString, ssl: ssl ? { rejectUnauthorized: false } : false };

    const testPool = new Pool({ ...config, max: 1 });
    try {
      await testPool.query('SELECT 1');
    } finally {
      await testPool.end().catch(() => {});
    }

    const oldPool = currentPool;
    currentPool = createPool(config);
    oldPool.end().catch(() => {});

    writeEnvFile({ DATABASE_URL: connectionString, PGSSL: ssl ? 'true' : 'false' });
  },
};
