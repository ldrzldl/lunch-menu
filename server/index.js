import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = normalize(fileURLToPath(new URL('../src/', import.meta.url))).replace(/[\\/]$/, '');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' };

export function createAppServer({ port = Number(process.env.PORT) || 3000 } = {}) {
  const server = createServer(async (request, response) => {
    const pathname = request.url?.split('?')[0] || '/';
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const file = normalize(join(root, relative));
    if (file !== root && !file.startsWith(root + sep)) {
      response.writeHead(404).end('Not found');
      return;
    }
    try {
      const body = await readFile(file);
      response.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
      response.end(body);
    } catch {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found');
    }
  });
  return { server, port };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { server, port } = createAppServer();
  server.listen(port, () => console.log(`Dog care simulation: http://localhost:${port}`));
}
