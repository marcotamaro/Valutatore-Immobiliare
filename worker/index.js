// Worker Cloudflare del Valutatore:
//  - protegge tutto il sito con una password unica (variabile segreta APP_PASSWORD)
//  - /api/kv/...  archivio chiave-valore su D1 (valutazioni, zone, testi, agenti, dati agenzia)
//  - /api/img/... immagini su D1 (foto, loghi, mappe), salvate una volta sola per contenuto
//  - tutto il resto: i file dell'app React (cartella build)

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS images (id TEXT PRIMARY KEY, mime TEXT NOT NULL, data BLOB NOT NULL, created_at TEXT NOT NULL)`,
];
let schemaReady = null;
const ensureSchema = (db) => (schemaReady ??= db.batch(SCHEMA.map((s) => db.prepare(s))));

const MAX_IMAGE_BYTES = 1_900_000; // limite di una riga D1 (2 MB)

function unauthorized() {
  return new Response('Accesso riservato', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Valutatore TAM", charset="UTF-8"' },
  });
}

function checkPassword(request, env) {
  if (!env.APP_PASSWORD) return true; // senza password impostata il sito resta aperto
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Basic ')) return false;
  try {
    const [, pass] = atob(auth.slice(6)).split(/:(.*)/s);
    return pass === env.APP_PASSWORD;
  } catch { return false; }
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

async function sha256(buf) {
  const h = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

async function handleApi(request, env, url) {
  const db = env.DB;
  await ensureSchema(db);
  const parts = url.pathname.split('/').filter(Boolean); // ['api', 'kv'|'img', id?]
  const [, kind, rawId] = parts;
  const id = rawId ? decodeURIComponent(rawId) : null;

  if (kind === 'kv') {
    if (!id && request.method === 'GET') {
      const prefix = url.searchParams.get('prefix') || '';
      const { results } = await db.prepare(`SELECT key FROM kv WHERE key LIKE ?1 ESCAPE '\\' ORDER BY key`)
        .bind(prefix.replace(/[%_]/g, '\\$&') + '%').all();
      return json(results.map((r) => r.key));
    }
    if (!id) return json({ error: 'chiave mancante' }, 400);
    if (request.method === 'GET') {
      const row = await db.prepare('SELECT value FROM kv WHERE key = ?1').bind(id).first();
      return row ? new Response(row.value, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
                 : json({ error: 'non trovato' }, 404);
    }
    if (request.method === 'PUT') {
      const value = await request.text();
      await db.prepare(`INSERT INTO kv (key, value, updated_at) VALUES (?1, ?2, ?3)
                        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`)
        .bind(id, value, new Date().toISOString()).run();
      return json({ ok: true });
    }
    if (request.method === 'DELETE') {
      await db.prepare('DELETE FROM kv WHERE key = ?1').bind(id).run();
      return json({ ok: true });
    }
  }

  if (kind === 'img') {
    if (request.method === 'POST' && !id) {
      const mime = (request.headers.get('Content-Type') || 'image/jpeg').split(';')[0];
      if (!mime.startsWith('image/')) return json({ error: 'non è un\'immagine' }, 400);
      const buf = await request.arrayBuffer();
      if (buf.byteLength > MAX_IMAGE_BYTES) return json({ error: 'immagine troppo grande' }, 413);
      const imgId = await sha256(buf);
      await db.prepare('INSERT OR IGNORE INTO images (id, mime, data, created_at) VALUES (?1, ?2, ?3, ?4)')
        .bind(imgId, mime, buf, new Date().toISOString()).run();
      return json({ url: `/api/img/${imgId}` });
    }
    if (request.method === 'GET' && id) {
      const row = await db.prepare('SELECT mime, data FROM images WHERE id = ?1').bind(id).first();
      if (!row) return new Response('Immagine non trovata', { status: 404 });
      return new Response(new Uint8Array(row.data), {
        headers: { 'Content-Type': row.mime, 'Cache-Control': 'private, max-age=31536000, immutable' },
      });
    }
  }

  return json({ error: 'richiesta non valida' }, 400);
}

export default {
  async fetch(request, env) {
    if (!checkPassword(request, env)) return unauthorized();
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      try { return await handleApi(request, env, url); }
      catch (e) { return json({ error: e.message }, 500); }
    }
    return env.ASSETS.fetch(request);
  },
};
