// Build: concatenates src/js/*.js (in filename order) inside one IIFE, then writes
//   dist/            - multi-file site (index.html, css/, app.js, assets/, vendor/)  -> GitHub Pages
//   dist/stream-maker.html - everything inlined into ONE file (offline / share / artifact)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = (...p) => path.join(root, 'src', ...p);
const dist = (...p) => path.join(root, 'dist', ...p);

fs.rmSync(dist(), { recursive: true, force: true });
fs.mkdirSync(dist('css'), { recursive: true });

const parts = fs.readdirSync(src('js')).filter(f => f.endsWith('.js')).sort();
const body = parts.map(f => fs.readFileSync(src('js', f), 'utf8').replace(/\n+$/, '')).join('\n');

const sprites = fs.readdirSync(src('assets', 'skin')).filter(f => f.endsWith('.png')).sort();
const legWith = (fn) => 'var LEG={' + sprites.map(f => JSON.stringify(path.basename(f, '.png')) + ':' + JSON.stringify(fn(f))).join(',') + '};\n';
const wrap = (leg) => leg + '(function(){\n' + body + '\n})();\n';

// multi-file site
fs.writeFileSync(dist('app.js'), wrap(legWith(f => 'assets/skin/' + f)));
fs.copyFileSync(src('index.html'), dist('index.html'));
fs.copyFileSync(src('css', 'styles.css'), dist('css', 'styles.css'));
fs.cpSync(src('assets'), dist('assets'), { recursive: true });
fs.cpSync(path.join(root, 'vendor'), dist('vendor'), { recursive: true });

// single-file build
const dataUrl = f => 'data:image/png;base64,' + fs.readFileSync(src('assets', 'skin', f)).toString('base64');
const inlineJs = s => s.replace(/<\/script/gi, '<\\/script');
let html = fs.readFileSync(src('index.html'), 'utf8');
html = html.replace('<link rel="stylesheet" href="css/styles.css">', () => '<style>\n' + fs.readFileSync(src('css', 'styles.css'), 'utf8') + '</style>');
html = html.replace('<script src="vendor/jszip.min.js"></script>', () => '<script>' + inlineJs(fs.readFileSync(path.join(root, 'vendor', 'jszip.min.js'), 'utf8')) + '</script>');
html = html.replace('<script src="app.js"></script>', () => '<script>\n' + inlineJs(wrap(legWith(dataUrl))) + '</script>');
fs.writeFileSync(dist('stream-maker.html'), html);

console.log(`built ${parts.length} source files -> dist/ (${(fs.statSync(dist('stream-maker.html')).size / 1024).toFixed(0)} KB single file)`);
