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

// Skill bootstrap zips live here permanently so other machines can always
// fetch the newest one (see paidiamsg INSTALL.md) - never swept or wiped.
const PROTECTED = /-skill-\d{8}\.zip$/;

// Extensions the web UI's View button may render inline (?view=1). Text-like
// files are forced to text/plain so nothing served from the box can ever
// execute in the browser (html/svg included - they render as source).
const VIEW_TYPES = {
  txt: 'text/plain', md: 'text/plain', markdown: 'text/plain', log: 'text/plain',
  json: 'application/json', jsonl: 'text/plain', csv: 'text/plain', tsv: 'text/plain',
  yaml: 'text/plain', yml: 'text/plain', toml: 'text/plain', ini: 'text/plain',
  xml: 'text/plain', html: 'text/plain', htm: 'text/plain', svg: 'text/plain',
  js: 'text/plain', ts: 'text/plain', py: 'text/plain', sh: 'text/plain',
  css: 'text/plain', sql: 'text/plain', diff: 'text/plain', patch: 'text/plain',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
  webp: 'image/webp', bmp: 'image/bmp',
};

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
    if (n.startsWith('.') || PROTECTED.test(n)) continue;
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

  if (req.method === 'POST' && p === '/files/api/wipe') {
    let n = 0, kept = 0;
    for (const name of fs.readdirSync(STORE)) {
      if (name.startsWith('.')) continue;
      if (PROTECTED.test(name)) { kept++; continue; }
      try { fs.unlinkSync(path.join(STORE, name)); n++; } catch (_) {}
    }
    return json(res, 200, { ok: true, wiped: n, kept });
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
      // ?view=1 on a known-viewable extension renders inline instead of
      // downloading; anything else keeps the attachment behaviour.
      const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
      const viewType = url.searchParams.has('view') ? VIEW_TYPES[ext] : undefined;
      const contentType = viewType
        ? (viewType === 'text/plain' ? 'text/plain; charset=utf-8' : viewType)
        : 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': st.size,
        'Content-Disposition': `${viewType ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(name)}`,
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
