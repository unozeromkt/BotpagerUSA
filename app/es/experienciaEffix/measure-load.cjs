// Conservative cold-load budget. Includes all font subsets/fallbacks mentioned by CSS,
// even those a browser will not request. Does not send form data or touch CRM APIs.
const http = require('node:http');
const zlib = require('node:zlib');
const fs = require('node:fs');
const base = process.argv[2] || 'http://127.0.0.1:3000/es/experienciaEffix';
const origin = new URL(base).origin;
const seen = new Set();
const assets = [];
function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, { headers: { 'Accept-Encoding': 'gzip' } }, response => {
      const parts = [];
      response.on('data', part => parts.push(part));
      response.on('end', () => {
        if (response.statusCode !== 200) return reject(new Error(`${response.statusCode}: ${url}`));
        const raw = Buffer.concat(parts);
        const decoded = response.headers['content-encoding'] === 'gzip' ? zlib.gunzipSync(raw) : raw;
        resolve({ raw, decoded });
      });
    }).on('error', reject);
  });
}
async function collect(url) {
  if (seen.has(url) || new URL(url).origin !== origin) return;
  seen.add(url);
  const { raw, decoded } = await get(url);
  assets.push({ path: new URL(url).pathname, transferredBodyBytes: raw.length, decodedBytes: decoded.length });
  if (url === base) {
    const matches = [...decoded.toString().matchAll(/(?:src|href)="([^"?]+)(?:\?[^\"]*)?"/g)].map(match => match[1]);
    for (const match of matches) if (match.startsWith('/_next/') || /\.(png|ico|webp|mp3)$/.test(match)) await collect(new URL(match, url).href);
  } else if (url.endsWith('.css')) {
    for (const match of decoded.toString().matchAll(/url\(([^)]+)\)/g)) {
      const value = match[1].replace(/["']/g, '');
      if (!value.startsWith('data:')) await collect(new URL(value, url).href);
    }
  }
}
(async () => {
  await collect(base);
  const report = {
    measuredAt: new Date().toISOString(), method: 'HTTP cold requests, gzip requested; body bytes only. Conservative: includes unused font subsets, fallbacks, and the entire default audio track.',
    resourceCount: assets.length,
    transferredBodyBytes: assets.reduce((sum, asset) => sum + asset.transferredBodyBytes, 0),
    decodedBytes: assets.reduce((sum, asset) => sum + asset.decodedBytes, 0),
    assets,
  };
  fs.writeFileSync(`${__dirname}/load-budget.json`, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ ...report, assets: undefined }, null, 2));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
