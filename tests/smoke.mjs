// Smoke test: serves dist/, loads the editor, imports a fixture map and checks that it renders without errors.
// Run with: npm test   (needs `npm install` once for Playwright)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const f = path.join(root, 'dist', req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(path.join(root, 'dist')) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [], missing = [];
page.on('pageerror', e => errors.push(e.message));
page.on('response', r => { if (r.status() >= 400) missing.push(r.url()); });
await page.goto(`http://localhost:${port}/`);
await page.setInputFiles('#file', path.join(root, 'tests/fixtures/sample.osu'));
await page.waitForFunction(() => document.getElementById('mObjs').textContent.trim() === '13', null, { timeout: 5000 });

const fail = [];
if (errors.length) fail.push('page errors: ' + errors.join('; '));
if (missing.length) fail.push('failed requests: ' + missing.join(', '));
const imgs = await page.evaluate(() => Promise.all(['hc', 'ov', 'ap'].map(k => new Promise(ok => { const i = new Image(); i.onload = () => ok(i.naturalWidth > 0); i.onerror = () => ok(false); i.src = 'assets/skin/' + k + '.png'; }))));
if (!imgs.every(Boolean)) fail.push('skin sprites did not load');
const drawn = await page.evaluate(() => { const c = document.querySelector('canvas'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 3; i < d.length; i += 4) if (d[i]) return true; return false; });
if (!drawn) fail.push('canvas is blank');

await browser.close(); server.close();
if (fail.length) { console.error('FAIL\n- ' + fail.join('\n- ')); process.exit(1); }
console.log('ok: map imported (13 objects), assets load, canvas drawn, no errors');
