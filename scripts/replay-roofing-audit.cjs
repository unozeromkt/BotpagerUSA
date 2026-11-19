// Operator-only CLI. Never expose this runner through an HTTP route.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const [file, requestId, mode = '--dry-run'] = process.argv.slice(2);
if (!file || !requestId || !['--dry-run', '--apply'].includes(mode)) {
  console.error('Usage: node --conditions=react-server scripts/replay-roofing-audit.cjs <logs.jsonl> <requestId> [--dry-run|--apply]');
  process.exit(1);
}

// Use the project's installed TypeScript compiler; no runtime dependency or
// client entry point is added. Resolve Next's server-only marker for this Node CLI.
require.extensions['.ts'] = (loaded, filename) => loaded._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, filename);
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...args) {
  if (request === 'server-only') return resolve.call(this, 'next/dist/compiled/server-only/empty.js', ...args);
  return resolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, ...args);
};

async function main() {
  const { decryptAuditReplay } = require('../lib/ghl/auditReplay.ts');
  const { syncRoofingAudit } = require('../lib/ghl/syncRoofingAudit.ts');
  const secret = process.env.GHL_AUDIT_REPLAY_SECRET || process.env.GHL_PRIVATE_TOKEN || process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  if (!secret) throw new Error('Missing replay key');
  const rows = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).flatMap(line => {
    const row = JSON.parse(line);
    // Accept raw structured records or `vercel logs --json` exports.
    if (row.type === 'log') { try { return [JSON.parse(row.data.message)]; } catch { return []; } }
    return [row];
  });
  const chunks = rows.filter(row => row.event === 'roofing_audit_replay' && row.requestId === requestId);
  const header = chunks[0];
  if (!header || !Number.isInteger(header.total) || header.total < 1 || header.total > 100) throw new Error('Missing record');
  const parts = new Map();
  for (const chunk of chunks) {
    if (chunk.iv !== header.iv || chunk.tag !== header.tag || chunk.total !== header.total || chunk.version !== 1 ||
        !Number.isInteger(chunk.part) || chunk.part < 0 || chunk.part >= header.total || typeof chunk.data !== 'string') {
      throw new Error('Inconsistent record');
    }
    if (parts.has(chunk.part) && parts.get(chunk.part) !== chunk.data) throw new Error('Conflicting part');
    parts.set(chunk.part, chunk.data);
  }
  if (parts.size !== header.total) throw new Error('Incomplete record');
  const data = Array.from({ length: header.total }, (_, i) => parts.get(i)).join('');
  const job = decryptAuditReplay({ version: 1, iv: header.iv, tag: header.tag, data }, secret);
  if (job.evidence?.requestId !== requestId) throw new Error('Request mismatch');
  if (mode === '--dry-run') {
    console.info(JSON.stringify({ event: 'roofing_audit_replay_validated', requestId }));
    return;
  }
  const result = await syncRoofingAudit(job);
  if (!result.ok) process.exitCode = 1;
}

main().catch(() => {
  // Parsing/decryption errors can contain payload text: never print raw errors.
  console.error('Replay failed. Check the complete encrypted record, environment and key. No payload was printed.');
  process.exitCode = 1;
});
