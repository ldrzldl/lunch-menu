const http = require('http');
const fs = require('fs');
const path = require('path');
const { handleRecommend } = require('./server/recommend.cjs');

const root = path.join(__dirname, 'dist');
const evalRoot = path.join(__dirname, 'eval');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' };

function readBody(req, callback) {
  let body = '';
  req.on('data', (chunk) => { body += chunk; if (body.length > 1_000_000) req.destroy(); });
  req.on('end', () => callback(body));
}

http.createServer(async (req, res) => {
  if (req.url === '/api/human-review') {
    if (req.method !== 'POST') { res.writeHead(405); res.end(JSON.stringify({ error: 'POST만 지원합니다.' })); return; }
    readBody(req, async (body) => {
      try {
        const review = JSON.parse(body || '{}');
        const expectedCases = JSON.parse(await fs.promises.readFile(path.join(evalRoot, 'selected-cases.json'), 'utf8'));
        if (!['pending', 'complete'].includes(review.status) || !Array.isArray(review.cases)
          || review.cases.length !== expectedCases.length
          || review.cases.some((item, index) => item.id !== expectedCases[index])) {
          throw new Error('평가 데이터 형식이 올바르지 않습니다.');
        }
        if (review.status === 'complete' && (!review.reviewer || review.cases.some((item) =>
          typeof item.hardRequirementsPassed !== 'boolean' || !Number.isInteger(item.score)
          || item.score < 1 || item.score > 5 || !String(item.reason || '').trim()))) {
          throw new Error('10개 사례의 필수조건, 점수, 평가 이유를 모두 작성해 주세요.');
        }
        if (review.status === 'complete') {
          review.total = review.cases.length;
          review.passed = review.cases.filter((item) => item.hardRequirementsPassed && item.score >= review.passScore).length;
          review.passRate = review.passed / review.total * 100;
          review.averageScore = review.cases.reduce((sum, item) => sum + item.score, 0) / review.total;
        }
        await fs.promises.writeFile(
          path.join(evalRoot, 'human-review.json'),
          `${JSON.stringify(review, null, 2)}\n`,
          'utf8'
        );
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ saved: true, status: review.status }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }
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
  if (requested.startsWith('/eval/')) {
    const evalFile = path.resolve(evalRoot, requested.slice('/eval/'.length));
    if (!evalFile.startsWith(`${evalRoot}${path.sep}`) || !fs.existsSync(evalFile) || fs.statSync(evalFile).isDirectory()) {
      res.writeHead(404); res.end('Not found'); return;
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(evalFile)] || 'application/octet-stream' });
    fs.createReadStream(evalFile).pipe(res);
    return;
  }
  const file = path.join(root, requested === '/' ? 'index.html' : requested);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end('Not found'); return;
  }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(Number(process.env.PORT || 3000), '127.0.0.1');
