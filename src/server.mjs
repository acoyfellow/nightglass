import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { classifyReceipt } from './classifier.mjs';

const html = await readFile(new URL('../site/index.html', import.meta.url), 'utf8');
const server = createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(html);
    return;
  }
  if (request.method === 'POST' && request.url === '/classify') {
    let body = '';
    for await (const chunk of request) body += chunk;
    try {
      const result = classifyReceipt(JSON.parse(body));
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify(result));
    } catch {
      response.writeHead(400, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ error: 'Send JSON with claim and evidence.' }));
    }
    return;
  }
  response.writeHead(404);
  response.end();
});

const port = Number(process.env.PORT ?? 8787);
server.listen(port, () => console.log(`NIGHTGLASS listening on http://localhost:${port}`));
