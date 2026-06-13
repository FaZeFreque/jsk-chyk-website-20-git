'use strict';
/* Quick health check for the CHYK website content.
   1. Every data/*.js file must be valid JavaScript.
   2. Every image/video referenced by data files and pages must exist. */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
let problems = 0;

console.log('');
console.log('=== CHYK content check ===');

// 1. Syntax-check all data + js files
for (const dir of ['data', 'js']) {
  for (const f of fs.readdirSync(path.join(ROOT, dir))) {
    if (!f.endsWith('.js')) continue;
    const fp = path.join(ROOT, dir, f);
    try {
      execFileSync(process.execPath, ['--check', fp], { stdio: 'pipe' });
    } catch (e) {
      problems++;
      console.log('');
      console.log('SYNTAX ERROR in ' + dir + '/' + f + ' (a missing comma, quote or bracket):');
      console.log(String(e.stderr).split('\n').slice(0, 5).join('\n'));
    }
  }
}

// 2. Check every locally referenced asset exists
const refRe = /(?:src|href|data-src|poster)=["']([^"']+)["']|url\(['"]?([^'")]+)['"]?\)|(?:image|mobileImage|logo)\s*:\s*["']([^"']+)["']/g;
const missing = new Set();
function scan(fp) {
  const s = fs.readFileSync(fp, 'utf8');
  for (const m of s.matchAll(refRe)) {
    let p = (m[1] || m[2] || m[3] || '').trim();
    if (!p || p.includes('${') || p.startsWith('#')) continue;
    p = p.split('?')[0].split('#')[0];
    if (!p || /^(https?:|data:|mailto:|javascript:|\/\/)/.test(p)) continue;
    p = decodeURIComponent(p);
    if (p.startsWith('#')) continue; // inline SVG data-URI fragments
    const resolved = p.startsWith('../') ? path.join(path.dirname(fp), p) : path.join(ROOT, p.replace(/^\.?\//, ''));
    if (!fs.existsSync(resolved)) missing.add(path.relative(ROOT, fp) + '  ->  ' + p);
  }
}
for (const f of fs.readdirSync(ROOT)) if (f.endsWith('.html')) scan(path.join(ROOT, f));
for (const dir of ['css', 'js', 'data']) {
  for (const f of fs.readdirSync(path.join(ROOT, dir))) {
    if (/\.(css|js)$/.test(f)) scan(path.join(ROOT, dir, f));
  }
}
if (missing.size) {
  problems += missing.size;
  console.log('');
  console.log('MISSING FILES (referenced but not found):');
  [...missing].slice(0, 30).forEach(m => console.log('  ' + m));
}

console.log('');
if (problems === 0) {
  console.log('All good! Content files are valid and every image/video exists.');
} else {
  console.log(problems + ' problem(s) found — fix them before publishing.');
  process.exitCode = 1;
}
console.log('');
