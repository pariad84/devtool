const http = require('http');
const fs = require('fs');
const path = require('path');

const hostname = '127.0.0.1';
const port = 3000;

const publicDir = path.join(__dirname, 'public');   // CSS, JS, 이미지 등 정적 파일
const viewsDir = path.join(__dirname, 'views');     // HTML 파일 (index.html 등)

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  const baseURL = `http://${req.headers.host || `${hostname}:${port}`}`;
  const parsedUrl = new URL(req.url, baseURL);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // 루트 경로는 index.html로 처리
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // 확장자에 따라 사용할 폴더 결정 (.html → views, 그 외 → public)
  const ext = path.extname(pathname).toLowerCase();
  const baseDir = ext === '.html' ? viewsDir : publicDir;

  // 보안: 지정된 폴더 내부로만 접근 허용
  const filePath = path.resolve(baseDir, '.' + pathname);
  if (!filePath.startsWith(baseDir + path.sep) && filePath !== baseDir) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('403 Forbidden');
    return;
  }

  // Content-Type 결정
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  // 파일 읽어서 응답
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end('<h1>404 Not Found</h1>');
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.end(data);
  });
});

server.listen(port, hostname, () => {
  console.log(`서버 실행 중: http://${hostname}:${port}/`);
});