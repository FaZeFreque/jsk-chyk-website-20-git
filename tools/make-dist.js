'use strict';
/* Builds a clean hosting package in dist/ — only the files the live
   website needs. Upload the CONTENTS of dist/ to your web host. */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

// Everything that must NOT go to the web host
const EXCLUDE = new Set([
  'dist',
  'node_modules',
  'content-manager',
  'tools',
  '_SOURCE FILES (not for hosting)',
  '.claude',
  'README.md',
  'CONTENT-GUIDE.md',
  'serve.json',
  'vercel.json',
  'netlify.toml',
  '.vercelignore',
  '.netlifyignore',
  '.gitignore',
  'DEPLOYING.md',
  'package.json',
  'package-lock.json',
  'OPEN CHYK CONTENT MANAGER.cmd',
  'MAKE HOSTING PACKAGE.cmd',
  'OPEN CHYK VISUAL EDITOR.cmd',
]);

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST);

let files = 0;
let bytes = 0;

function copy(src, dst) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const f of fs.readdirSync(src)) copy(path.join(src, f), path.join(dst, f));
  } else {
    fs.copyFileSync(src, dst);
    files++;
    bytes += st.size;
  }
}

for (const entry of fs.readdirSync(ROOT)) {
  if (EXCLUDE.has(entry) || entry.startsWith('.')) continue;
  if (entry.toLowerCase().endsWith('.cmd')) continue; // launchers are dev-only, never hosted
  copy(path.join(ROOT, entry), path.join(DIST, entry));
}

// Sanity check: every local asset referenced by the site must exist in dist
const missing = [];
const refRe = /(?:src|href|data-src|poster)=["']([^"']+)["']|url\(['"]?([^'")]+)['"]?\)|(?:image|mobileImage|logo)\s*:\s*["']([^"']+)["']/g;
function checkFile(fp, baseDir) {
  const s = fs.readFileSync(fp, 'utf8');
  for (const m of s.matchAll(refRe)) {
    let p = (m[1] || m[2] || m[3] || '').trim();
    if (!p || p.includes('${') || p.startsWith('#')) continue;
    p = p.split('?')[0].split('#')[0];
    if (!p || /^(https?:|data:|mailto:|javascript:|\/\/)/.test(p)) continue;
    p = decodeURIComponent(p);
    if (p.startsWith('#')) continue; // inline SVG data-URI fragments
    const resolved = p.startsWith('../')
      ? path.join(baseDir, p)
      : path.join(p.startsWith('/') ? DIST : (path.extname(fp) === '.css' ? baseDir : DIST), p.replace(/^\.?\//, ''));
    if (!fs.existsSync(resolved)) missing.push(path.relative(DIST, fp) + ' -> ' + p);
  }
}
function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const fp = path.join(d, f);
    if (fs.statSync(fp).isDirectory()) walk(fp);
    else if (/\.(html|css|js)$/.test(f)) checkFile(fp, path.dirname(fp));
  }
}
walk(DIST);

console.log('');
console.log('Hosting package ready: ' + DIST);
console.log('Files: ' + files + '  |  Size: ' + (bytes / 1048576).toFixed(1) + ' MB');
if (missing.length) {
  console.log('');
  console.log('WARNING — these referenced files are missing (fix before uploading):');
  [...new Set(missing)].slice(0, 30).forEach(m => console.log('  ' + m));
  process.exitCode = 1;
} else {
  console.log('All referenced images/videos/scripts are present. Safe to upload.');
}
