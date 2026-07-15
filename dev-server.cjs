const http = require('http');
const fs = require('fs');
const path = require('path');
const { handleRecommend } = require('./server/recommend.cjs');

const root = path.join(__dirname, 'dist');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' };

http.createServer(async (req, res) => {
  if (req.url === '/api/recommend') {
    if (req.method !== 'POST') { res.writeHead(405); res.end(JSON.stringify({ error: 'POST만 지원합니다.' })); return; }
    let body = '';
    req.on('data', (chunk) => { body += chunk; if (body.length > 100_000) req.destroy(); });
    req.on('end', async () => {
      try {
        const result = await handleRecommend(JSON.parse(body || '{}'));
        res.writeHead(result.status, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result.body));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: '요청 본문이 올바르지 않습니다.' }));
      }
    });
    return;
  }
  const requested = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(root, requested === '/' ? 'index.html' : requested);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end('Not found'); return;
  }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(Number(process.env.PORT || 3000), '127.0.0.1');
