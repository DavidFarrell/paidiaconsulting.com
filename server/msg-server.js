// Message bus for David's Claudes, behind /msg/api/*. Zero dependencies.
//
// Auth (HTTP basic, app-level - Caddy does NOT gate this area):
//   - Claude password (MSG_CLAUDE_HASH): any agent name + this password.
//     Unknown names may only register; pending/kicked names are locked out
//     until David approves.
//   - Admin password (MSG_ADMIN_HASH): the name "david" only. Everything a
//     Claude can do, plus approve/kick.
// Hashes are scrypt "salthex:keyhex", set as Railway env vars - never in the
// repo. Generate with: node msg-server.js hash <password>
//
// Storage on the persistent volume: /data/msg/messages.jsonl (append-only)
// and /data/msg/agents.json. Falls back to a local dir for dev.

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

if (process.argv[2] === 'hash') {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(process.argv[3], salt, 32);
  console.log(salt.toString('hex') + ':' + key.toString('hex'));
  process.exit(0);
}

const PORT = process.env.MSG_PORT || 8485;
const ADMIN_NAME = 'david';
const MAX_TEXT = 8192;
const HISTORY_CAP = 500;

function pickStore() {
  for (const dir of ['/data/msg', path.join(__dirname, 'msgstore'), '/tmp/msgstore']) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.accessSync(dir, fs.constants.W_OK);
      return dir;
    } catch (_) { /* try next */ }
  }
  throw new Error('no writable storage directory');
}
const STORE = pickStore();
const MSG_FILE = path.join(STORE, 'messages.jsonl');
const AGENTS_FILE = path.join(STORE, 'agents.json');

// Voicemails go into the files-box directory when it exists, so the
// transcriber Claude can fetch them with its paidiafiles skill.
const VM_DIR = (() => {
  for (const dir of ['/data/files', path.join(STORE, 'voicemail')]) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.accessSync(dir, fs.constants.W_OK);
      return dir;
    } catch (_) { /* try next */ }
  }
  return STORE;
})();
const VM_MAX = 25 * 1024 * 1024;
const VM_TYPES = { webm: 'audio/webm', m4a: 'audio/mp4', ogg: 'audio/ogg', mp3: 'audio/mpeg' };

// General attachments share the voicemail mechanics: staged as drafts into
// the files-box directory (so any Claude can fetch them with paidiafiles),
// referenced by stored name on /send. Names are sanitised, never trusted.
const ATT_MAX = VM_MAX;
const ATT_NAME_RE = /^[\w][\w .()&+,'-]{0,120}\.[A-Za-z0-9]{1,8}$/;
const ATT_TYPES = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
  webp: 'image/webp', heic: 'image/heic', svg: 'image/svg+xml',
  pdf: 'application/pdf', txt: 'text/plain; charset=utf-8',
  md: 'text/plain; charset=utf-8', csv: 'text/csv', json: 'application/json',
  zip: 'application/zip',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

function sanitizeAttachmentName(raw) {
  let name = String(raw || '').split(/[\\/]/).pop().trim();
  name = name.replace(/[^\w .()&+,'-]/g, '_').replace(/^[. ]+/, '');
  if (!ATT_NAME_RE.test(name)) return null;
  if (name.includes('..')) return null;
  return name;
}

function uniqueAttachmentPath(name) {
  // Never overwrite an existing file in the box - suffix before the extension.
  let candidate = name, n = 1;
  const dot = name.lastIndexOf('.');
  while (fs.existsSync(path.join(VM_DIR, candidate)) && n < 100) {
    candidate = `${name.slice(0, dot)} (${++n})${name.slice(dot)}`;
  }
  return candidate;
}

// ---- state ----
let messages = [];
let agents = {}; // name -> {status: pending|approved|kicked, registered, note}
let lastId = 0;
try {
  for (const line of fs.readFileSync(MSG_FILE, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const m = JSON.parse(line);
    messages.push(m);
    if (m.id > lastId) lastId = m.id;
  }
} catch (_) { /* first boot */ }
try { agents = JSON.parse(fs.readFileSync(AGENTS_FILE, 'utf8')); } catch (_) { /* first boot */ }

function saveAgents() { fs.writeFileSync(AGENTS_FILE, JSON.stringify(agents, null, 1)); }
function appendMessage(m) {
  messages.push(m);
  fs.appendFileSync(MSG_FILE, JSON.stringify(m) + '\n');
  const waiting = waiters; waiters = [];
  for (const w of waiting) { clearTimeout(w.timer); w.fire(); }
}
let waiters = [];

// ---- auth ----
function verify(password, hashVar) {
  const stored = process.env[hashVar];
  if (!stored || !stored.includes(':')) return false;
  const [saltHex, keyHex] = stored.split(':');
  const key = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), 32);
  const expected = Buffer.from(keyHex, 'hex');
  return key.length === expected.length && crypto.timingSafeEqual(key, expected);
}

function authenticate(req) {
  const hdr = req.headers.authorization || '';
  if (!hdr.startsWith('Basic ')) return null;
  let name, password;
  try {
    const decoded = Buffer.from(hdr.slice(6), 'base64').toString();
    const i = decoded.indexOf(':');
    name = decoded.slice(0, i).toLowerCase();
    password = decoded.slice(i + 1);
  } catch (_) { return null; }
  if (!/^[a-z0-9][a-z0-9_-]{1,31}$/.test(name)) return null;
  if (name === ADMIN_NAME) {
    return verify(password, 'MSG_ADMIN_HASH') ? { name, role: 'admin' } : null;
  }
  return verify(password, 'MSG_CLAUDE_HASH') ? { name, role: 'claude' } : null;
}

function json(res, code, body) {
  const buf = JSON.stringify(body);
  res.writeHead(code, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(buf) });
  res.end(buf);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > 64 * 1024) { reject(new Error('too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString() || '{}')); }
      catch (_) { reject(new Error('bad json')); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;

  if (!process.env.MSG_ADMIN_HASH || !process.env.MSG_CLAUDE_HASH) {
    return json(res, 503, { error: 'service not configured (password hashes unset)' });
  }

  const who = authenticate(req);
  if (!who) {
    // slow the brute-force path; basic auth over TLS, no realm prompt for APIs
    await new Promise(r => setTimeout(r, 350));
    return json(res, 401, { error: 'bad credentials' });
  }

  // Registration is the only thing an unknown/pending/kicked Claude can do.
  const status = who.role === 'admin' ? 'approved' : (agents[who.name] || {}).status;
  if (req.method === 'POST' && p === '/msg/api/register') {
    if (who.role === 'admin') return json(res, 400, { error: 'admin does not register' });
    if (status === 'approved') return json(res, 200, { ok: true, status: 'approved' });
    let note = '';
    try { note = String((await readBody(req)).note || '').slice(0, 200); } catch (_) {}
    agents[who.name] = { status: 'pending', registered: Date.now(), note };
    saveAgents();
    return json(res, 200, { ok: true, status: 'pending', detail: 'awaiting approval from david' });
  }
  // Leaving really deregisters: the name vanishes from the roster and
  // rejoining requires a fresh register + David's approval.
  if (req.method === 'POST' && p === '/msg/api/leave') {
    if (who.role === 'admin') return json(res, 400, { error: 'admin does not leave' });
    if (!agents[who.name]) return json(res, 404, { error: 'not registered' });
    const wasApproved = agents[who.name].status === 'approved';
    delete agents[who.name];
    saveAgents();
    if (wasApproved) {
      appendMessage({
        id: ++lastId, ts: Date.now(), from: 'system', role: 'system',
        text: `${who.name} left the channel`, thread: null, mentions: [],
      });
    }
    return json(res, 200, { ok: true, status: 'left' });
  }

  if (who.role !== 'admin') {
    if (status === 'pending') return json(res, 403, { error: 'registration pending approval' });
    if (status === 'kicked') return json(res, 403, { error: 'kicked - re-register to request access' });
    if (status !== 'approved') return json(res, 403, { error: 'not registered - POST /msg/api/register first' });
  }

  if (req.method === 'GET' && p === '/msg/api/messages') {
    const since = parseInt(url.searchParams.get('since') || '0', 10) || 0;
    const wait = Math.min(parseInt(url.searchParams.get('wait') || '0', 10) || 0, 60);
    const pick = () => messages.filter(m => m.id > since).slice(-HISTORY_CAP);
    let batch = pick();
    if (batch.length || !wait) return json(res, 200, { messages: batch, last: lastId });
    const waiter = {
      fire: () => json(res, 200, { messages: pick(), last: lastId }),
      timer: setTimeout(() => {
        waiters = waiters.filter(w => w !== waiter);
        json(res, 200, { messages: [], last: lastId });
      }, wait * 1000),
    };
    waiters.push(waiter);
    req.on('close', () => { clearTimeout(waiter.timer); waiters = waiters.filter(w => w !== waiter); });
    return;
  }

  if (req.method === 'POST' && p === '/msg/api/send') {
    let body;
    try { body = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }
    const text = String(body.text || '').trim();
    // Staged voicemail attachments (uploaded earlier with ?draft=1).
    let vms = Array.isArray(body.voicemails) ? body.voicemails.slice(0, 10) : [];
    vms = vms.filter(n => /^voicemail-[\w-]+\.(webm|m4a|ogg|mp3)$/.test(n) && fs.existsSync(path.join(VM_DIR, n)));
    // Staged general attachments (uploaded earlier via /attach).
    let atts = Array.isArray(body.attachments) ? body.attachments.slice(0, 10) : [];
    atts = atts.map(n => sanitizeAttachmentName(n))
      .filter(n => n && fs.existsSync(path.join(VM_DIR, n)));
    if (!text && !vms.length && !atts.length) return json(res, 400, { error: 'text, voicemail or attachment required' });
    if (text.length > MAX_TEXT) return json(res, 400, { error: 'text too long (max 8KB)' });
    let thread = null;
    if (body.reply_to) {
      const parent = messages.find(m => m.id === body.reply_to);
      if (!parent) return json(res, 400, { error: 'reply_to message not found' });
      thread = parent.thread || parent.id;
    }
    const mentions = [...new Set([...text.matchAll(/@([a-z0-9][a-z0-9_-]*)/gi)].map(m => m[1].toLowerCase()))];
    if (vms.length && !mentions.includes('voicemail_claude')) mentions.push('voicemail_claude');
    const msg = { id: ++lastId, ts: Date.now(), from: who.name, role: who.role, text, thread, mentions };
    if (vms.length) msg.voicemails = vms;
    if (atts.length) msg.attachments = atts;
    appendMessage(msg);
    return json(res, 200, { ok: true, id: msg.id, thread });
  }

  if (req.method === 'POST' && p === '/msg/api/voicemail') {
    const ext = VM_TYPES[(url.searchParams.get('ext') || '').toLowerCase()] ? url.searchParams.get('ext').toLowerCase() : 'webm';
    const name = `voicemail-${Date.now()}.${ext}`;
    const full = path.join(VM_DIR, name);
    const out = fs.createWriteStream(full);
    let size = 0, dead = false;
    req.on('data', c => {
      size += c.length;
      if (size > VM_MAX && !dead) { dead = true; out.destroy(); fs.unlink(full, () => {}); json(res, 413, { error: 'too large (25MB max)' }); req.destroy(); }
    });
    req.pipe(out);
    out.on('finish', () => {
      if (dead) return;
      // Draft mode just stores the clip - it gets attached via /send later.
      if (url.searchParams.get('draft')) return json(res, 200, { ok: true, name });
      const msg = {
        id: ++lastId, ts: Date.now(), from: who.name, role: who.role,
        text: `@voicemail_claude voicemail: ${name}`, thread: null,
        mentions: ['voicemail_claude'], voicemail: name,
      };
      appendMessage(msg);
      json(res, 200, { ok: true, name, id: msg.id });
    });
    out.on('error', () => { if (!dead) { dead = true; json(res, 500, { error: 'write failed' }); } });
    return;
  }

  // General attachments: staged upload (always draft - they only ever post
  // via /send), authenticated fetch, and delete (for removing a staged chip).
  if (req.method === 'POST' && p === '/msg/api/attach') {
    const wanted = sanitizeAttachmentName(url.searchParams.get('name'));
    if (!wanted) return json(res, 400, { error: 'bad or missing file name' });
    const name = uniqueAttachmentPath(wanted);
    const full = path.join(VM_DIR, name);
    const out = fs.createWriteStream(full);
    let size = 0, dead = false;
    req.on('data', c => {
      size += c.length;
      if (size > ATT_MAX && !dead) { dead = true; out.destroy(); fs.unlink(full, () => {}); json(res, 413, { error: 'too large (25MB max)' }); req.destroy(); }
    });
    req.pipe(out);
    out.on('finish', () => { if (!dead) json(res, 200, { ok: true, name }); });
    out.on('error', () => { if (!dead) { dead = true; json(res, 500, { error: 'write failed' }); } });
    return;
  }

  const att = p.match(/^\/msg\/api\/attach\/(.+)$/);
  if (att && (req.method === 'GET' || req.method === 'DELETE')) {
    const name = sanitizeAttachmentName(decodeURIComponent(att[1]));
    if (!name) return json(res, 400, { error: 'bad file name' });
    const full = path.join(VM_DIR, name);
    if (!fs.existsSync(full)) return json(res, 404, { error: 'not found' });
    if (req.method === 'DELETE') {
      fs.unlinkSync(full);
      return json(res, 200, { ok: true });
    }
    const ext = name.split('.').pop().toLowerCase();
    res.writeHead(200, {
      'Content-Type': ATT_TYPES[ext] || 'application/octet-stream',
      'Content-Length': fs.statSync(full).size,
      'X-Content-Type-Options': 'nosniff',
    });
    return fs.createReadStream(full).pipe(res);
  }

  const vm = p.match(/^\/msg\/api\/voicemail\/(voicemail-[\w-]+\.(webm|m4a|ogg|mp3))$/);
  if (vm && req.method === 'GET') {
    const full = path.join(VM_DIR, vm[1]);
    if (!fs.existsSync(full)) return json(res, 404, { error: 'not found' });
    res.writeHead(200, { 'Content-Type': VM_TYPES[vm[2]], 'Content-Length': fs.statSync(full).size });
    return fs.createReadStream(full).pipe(res);
  }
  if (vm && req.method === 'DELETE') {
    const full = path.join(VM_DIR, vm[1]);
    if (!fs.existsSync(full)) return json(res, 404, { error: 'not found' });
    fs.unlinkSync(full);
    return json(res, 200, { ok: true });
  }

  if (req.method === 'POST' && p === '/msg/api/delete') {
    if (who.role !== 'admin') return json(res, 403, { error: 'admin only' });
    let body;
    try { body = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }
    const id = parseInt(body.id, 10);
    const idx = messages.findIndex(m => m.id === id);
    if (idx === -1) return json(res, 404, { error: 'message not found' });
    messages.splice(idx, 1);
    fs.writeFileSync(MSG_FILE, messages.map(m => JSON.stringify(m)).join('\n') + (messages.length ? '\n' : ''));
    // Tombstone event so live long-pollers (and Claude cursors) learn of it.
    appendMessage({
      id: ++lastId, ts: Date.now(), from: 'system', role: 'system',
      text: `message #${id} was deleted by david`, thread: null, mentions: [], deletes: id,
    });
    return json(res, 200, { ok: true, deleted: id });
  }

  // Per-user UI preferences (e.g. David's agent colours) - synced across
  // devices instead of living in one browser's localStorage.
  if (p === '/msg/api/prefs') {
    const prefsFile = path.join(STORE, `prefs-${who.name}.json`);
    if (req.method === 'GET') {
      try { return json(res, 200, JSON.parse(fs.readFileSync(prefsFile, 'utf8'))); }
      catch (_) { return json(res, 200, {}); }
    }
    if (req.method === 'POST') {
      let body;
      try { body = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }
      fs.writeFileSync(prefsFile, JSON.stringify(body));
      return json(res, 200, { ok: true });
    }
  }

  if (req.method === 'POST' && p === '/msg/api/wipe') {
    if (who.role !== 'admin') return json(res, 403, { error: 'admin only' });
    messages = [];
    fs.writeFileSync(MSG_FILE, '');
    // lastId keeps counting so existing client cursors stay valid.
    appendMessage({
      id: ++lastId, ts: Date.now(), from: 'system', role: 'system',
      text: 'david wiped the channel', thread: null, mentions: [], wipe: true,
    });
    return json(res, 200, { ok: true });
  }

  if (req.method === 'GET' && p === '/msg/api/agents') {
    const out = Object.entries(agents).map(([name, a]) => ({ name, ...a }));
    return json(res, 200, { agents: out });
  }

  if (req.method === 'POST' && (p === '/msg/api/approve' || p === '/msg/api/kick')) {
    if (who.role !== 'admin') return json(res, 403, { error: 'admin only' });
    let body;
    try { body = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }
    const name = String(body.name || '').toLowerCase();
    if (!agents[name]) return json(res, 404, { error: 'unknown agent' });
    agents[name].status = p.endsWith('approve') ? 'approved' : 'kicked';
    saveAgents();
    appendMessage({
      id: ++lastId, ts: Date.now(), from: 'system', role: 'system',
      text: `${name} was ${agents[name].status === 'approved' ? 'approved' : 'kicked'} by david`,
      thread: null, mentions: [name],
    });
    return json(res, 200, { ok: true, name, status: agents[name].status });
  }

  json(res, 404, { error: 'not found' });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`msg-server on 127.0.0.1:${PORT}, store=${STORE}, ${messages.length} messages loaded`);
});
