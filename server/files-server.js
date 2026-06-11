// Tiny zero-dependency file store behind /files/api/*. Caddy handles auth
// (basic_auth on /files/*) and proxies here, so this server trusts its caller
// and binds to localhost only.
//
// Storage: /data/files if a Railway volume is mounted at /data, otherwise a
// local directory (which is EPHEMERAL on Railway - files vanish on redeploy).

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.FILES_PORT || 8484;

function pickStore() {
  for (const dir of ['/data/files', path.join(__dirname, 'filestore'), '/tmp/filestore']) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.accessSync(dir, fs.constants.W_OK);
      return dir;
    } catch (_) { /* try next */ }
  }
  throw new Error('no writable storage directory');
}
const STORE = pickStore();
const PERSISTENT = STORE.startsWith('/data/');

// The box is a transfer scratchpad, not storage: anything older than 7 days
// is swept hourly so cruft (and old voicemails) never piles up.
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
function sweep() {
  const cutoff = Date.now() - MAX_AGE_MS;
  for (const n of fs.readdirSync(STORE)) {
    if (n.startsWith('.')) continue;
    try {
      const full = path.join(STORE, n);
      if (fs.statSync(full).mtimeMs < cutoff) {
        fs.unlinkSync(full);
        console.log(`swept (>7 days old): ${n}`);
      }
    } catch (_) { /* raced with a delete - fine */ }
  }
}
sweep();
setInterval(sweep, 60 * 60 * 1000);

// A name is valid only if it round-trips through basename unchanged and has
// no path or hidden-file tricks in it.
function safeName(raw) {
  let name;
  try { name = decodeURIComponent(raw); } catch (_) { return null; }
  if (!name || name.length > 255) return null;
  if (name !== path.basename(name)) return null;
  if (name.startsWith('.') || name.includes('/') || name.includes('\\') || name.includes('\0')) return null;
  return name;
}

function json(res, code, body) {
  const buf = JSON.stringify(body);
  res.writeHead(code, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(buf) });
  res.end(buf);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;

  if (req.method === 'GET' && p === '/files/api/list') {
    const files = fs.readdirSync(STORE)
      .filter(n => !n.startsWith('.'))
      .map(n => {
        const st = fs.statSync(path.join(STORE, n));
        return { name: n, size: st.size, mtime: st.mtimeMs };
      })
      .sort((a, b) => b.mtime - a.mtime);
    return json(res, 200, { persistent: PERSISTENT, files });
  }

  const m = p.match(/^\/files\/api\/f\/(.+)$/);
  if (m) {
    const name = safeName(m[1]);
    if (!name) return json(res, 400, { error: 'bad filename' });
    const full = path.join(STORE, name);

    if (req.method === 'PUT') {
      const tmp = full + '.uploading-' + process.pid;
      const out = fs.createWriteStream(tmp);
      req.pipe(out);
      out.on('finish', () => {
        fs.renameSync(tmp, full);
        json(res, 200, { ok: true, name });
      });
      out.on('error', () => { try { fs.unlinkSync(tmp); } catch (_) {} json(res, 500, { error: 'write failed' }); });
      req.on('aborted', () => { out.destroy(); try { fs.unlinkSync(tmp); } catch (_) {} });
      return;
    }

    if (req.method === 'GET') {
      if (!fs.existsSync(full)) return json(res, 404, { error: 'not found' });
      const st = fs.statSync(full);
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Length': st.size,
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
      });
      return fs.createReadStream(full).pipe(res);
    }

    if (req.method === 'DELETE') {
      if (!fs.existsSync(full)) return json(res, 404, { error: 'not found' });
      fs.unlinkSync(full);
      return json(res, 200, { ok: true });
    }
  }

  json(res, 404, { error: 'not found' });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`files-server on 127.0.0.1:${PORT}, store=${STORE} (${PERSISTENT ? 'persistent volume' : 'EPHEMERAL'})`);
});
