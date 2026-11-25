// Worker Cloudflare del Valutatore:
//  - accesso con pagina di login (nome utente APP_USERNAME + password APP_PASSWORD, variabili segrete)
//    e sessione salvata in un cookie firmato, valida 30 giorni
//  - /api/kv/...  archivio chiave-valore su D1 (valutazioni, zone, testi, agenti, dati agenzia)
//  - /api/col/...  valutazioni, agenti e zone: un record per scheda, così due persone che
//                   lavorano insieme non si sovrascrivono a vicenda
//  - /api/lock/... blocco "in modifica": una valutazione aperta in modifica da un utente
//                   non può essere modificata né eliminata da un altro finché non la chiude
//  - /api/img/... immagini su D1 (foto, loghi, mappe), salvate una volta sola per contenuto
//  - tutto il resto: i file dell'app React (cartella build)

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS images (id TEXT PRIMARY KEY, mime TEXT NOT NULL, data BLOB NOT NULL, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS items (coll TEXT NOT NULL, id TEXT NOT NULL, value TEXT NOT NULL, pos INTEGER NOT NULL DEFAULT 0,
     created_at TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (coll, id))`,
  `CREATE TABLE IF NOT EXISTS locks (id TEXT PRIMARY KEY, holder TEXT NOT NULL, since TEXT NOT NULL, expires INTEGER NOT NULL)`,
];

// Blocco "in modifica": l'app lo rinnova ogni minuto finché il form è aperto.
// Se il browser si chiude di colpo, il blocco scade da solo dopo 3 minuti.
const LOCK_TTL_MS = 3 * 60 * 1000;
const holderOf = (request) => String(request.headers.get('X-Holder') || '').slice(0, 64);

async function lockedByOther(db, id, holder) {
  const row = await db.prepare('SELECT holder, since, expires FROM locks WHERE id = ?1').bind(id).first();
  return row && row.expires > Date.now() && row.holder !== holder ? row : null;
}

// Elenchi salvati scheda per scheda (prima erano un unico blocco nella tabella kv)
const COLLECTIONS = new Set(['valutazioni_list', 'agents_list', 'zones_config']);

// Trasferimento una tantum: l'elenco salvato come blocco unico diventa un record per scheda.
// Il blocco originale resta come copia di sicurezza con il nome "<elenco>__copia_prima_dei_record".
async function migrateCollection(db, coll) {
  const row = await db.prepare('SELECT value FROM kv WHERE key = ?1').bind(coll).first();
  if (!row) return;
  let arr = [];
  try { arr = JSON.parse(row.value) || []; } catch (e) { arr = []; }
  const now = new Date().toISOString();
  const stmts = (Array.isArray(arr) ? arr : []).filter((it) => it && it.id != null).map((it, i) =>
    db.prepare('INSERT OR IGNORE INTO items (coll, id, value, pos, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?5)')
      .bind(coll, String(it.id), JSON.stringify(it), i, now));
  stmts.push(db.prepare('INSERT OR REPLACE INTO kv (key, value, updated_at) VALUES (?1, ?2, ?3)').bind(coll + '__copia_prima_dei_record', row.value, now));
  stmts.push(db.prepare('DELETE FROM kv WHERE key = ?1').bind(coll));
  await db.batch(stmts);
}
let schemaReady = null;
const ensureSchema = (db) => (schemaReady ??= db.batch(SCHEMA.map((s) => db.prepare(s))));

const MAX_IMAGE_BYTES = 1_900_000; // limite di una riga D1 (2 MB)

// --- Accesso -------------------------------------------------------------------

const COOKIE = 'vt_session';
const SESSION_DAYS = 30;
const enc = new TextEncoder();

const authEnabled = (env) => Boolean(env.APP_PASSWORD);

async function hmac(env, text) {
  // la chiave dipende da nome utente e password: cambiandoli, tutte le sessioni aperte scadono
  const key = await crypto.subtle.importKey('raw', enc.encode(`${env.APP_USERNAME || ''}:${env.APP_PASSWORD}`),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(text));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sameText(env, a, b) {
  // confronto a tempo costante (tramite firma) per non dare indizi sulla password
  return (await hmac(env, 'cmp:' + a)) === (await hmac(env, 'cmp:' + b));
}

function readCookie(request, name) {
  const m = (request.headers.get('Cookie') || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? m[1] : null;
}

async function hasValidSession(request, env) {
  const c = readCookie(request, COOKIE);
  if (!c) return false;
  const [exp, sig] = c.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return sig === (await hmac(env, 'session:' + exp));
}

async function sessionCookie(env) {
  const exp = Date.now() + SESSION_DAYS * 86400_000;
  const sig = await hmac(env, 'session:' + exp);
  return `${COOKIE}=${exp}.${sig}; Path=/; Max-Age=${SESSION_DAYS * 86400}; HttpOnly; Secure; SameSite=Lax`;
}

const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function loginPage(error = '', username = '') {
  return new Response(`<!DOCTYPE html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Accesso · Valutatore TAM</title><meta name="robots" content="noindex">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;
  font-family:'DM Sans',system-ui,sans-serif;background:linear-gradient(135deg,#0f2539,#1a3a5c);color:#1a2b3c}
.card{width:100%;max-width:380px;background:#fff;border-radius:16px;padding:36px 32px;box-shadow:0 20px 60px rgba(0,0,0,.35)}
.mark{width:48px;height:48px;border-radius:12px;background:#1a3a5c;color:#e8b86d;display:grid;place-items:center;
  font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:700;margin:0 auto 16px}
h1{font-family:'Playfair Display',Georgia,serif;font-size:24px;text-align:center;color:#0f2539}
.sub{text-align:center;color:#6b7785;font-size:14px;margin:6px 0 26px}
label{display:block;font-size:13px;font-weight:600;color:#3a4a5c;margin:0 0 6px}
input{width:100%;padding:12px 14px;border:1px solid #d8dce6;border-radius:10px;font:inherit;font-size:15px;margin-bottom:16px;outline:none}
input:focus{border-color:#1a3a5c;box-shadow:0 0 0 3px rgba(26,58,92,.15)}
button{width:100%;padding:13px;border:none;border-radius:10px;background:#1a3a5c;color:#fff;font:inherit;font-weight:600;font-size:15px;cursor:pointer;margin-top:4px}
button:hover{background:#0f2539}
.err{background:#fdecea;color:#b3261e;border-radius:8px;padding:10px 12px;font-size:13px;margin-bottom:16px;text-align:center}
.foot{text-align:center;color:#9aa5b1;font-size:12px;margin-top:22px}
</style></head><body>
<form class="card" method="POST" action="/login">
  <div class="mark">T</div>
  <h1>Valutatore</h1>
  <p class="sub">TAM Immobiliare · accesso riservato</p>
  ${error ? `<div class="err">${esc(error)}</div>` : ''}
  <label for="u">Nome utente</label>
  <input id="u" name="username" autocomplete="username" required autofocus value="${esc(username)}">
  <label for="p">Password</label>
  <input id="p" name="password" type="password" autocomplete="current-password" required>
  <button type="submit">Accedi</button>
  <p class="foot">Beta · TAM Lab</p>
</form></body></html>`, {
    status: error ? 401 : 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

async function handleAuth(request, env, url) {
  if (url.pathname === '/logout') {
    return new Response(null, { status: 302, headers: {
      Location: '/login', 'Set-Cookie': `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax` } });
  }
  if (url.pathname === '/login' && request.method === 'POST') {
    const form = await request.formData();
    const user = String(form.get('username') || '').trim();
    const pass = String(form.get('password') || '');
    const okUser = env.APP_USERNAME ? await sameText(env, user, env.APP_USERNAME) : true;
    const okPass = await sameText(env, pass, env.APP_PASSWORD);
    if (okUser && okPass) {
      return new Response(null, { status: 302, headers: { Location: '/', 'Set-Cookie': await sessionCookie(env) } });
    }
    await new Promise((r) => setTimeout(r, 1000)); // rallenta i tentativi a caso
    return loginPage('Nome utente o password non corretti.', user);
  }
  if (url.pathname === '/login') {
    if (await hasValidSession(request, env)) return Response.redirect(url.origin + '/', 302);
    return loginPage();
  }
  return null;
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

async function sha256(buf) {
  const h = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

// ── Mappe OpenStreetMap ────────────────────────────────────────────────────────
// Ricerca dell'indirizzo (Nominatim) e tasselli della mappa, passando dalla cache di Cloudflare.
// Regole d'uso OSM: identificarsi con lo User-Agent, usare la cache, non fare richieste in massa,
// citare "© OpenStreetMap contributors" (lo fa l'app sulla mappa e sull'immagine del report).
// OSM_GEOCODE_URL e OSM_TILE_URL servono solo per le prove in locale.
const OSM_UA = 'TAMLab-Valutatore/1.0 (+https://valu.tamlab.it)';
const osmCache = (seconds) => ({ cacheEverything: true, cacheTtlByStatus: { '200-299': seconds, '300-599': 0 } });

async function handleMaps(request, env, url, parts) {
  if (request.method !== 'GET') return json({ error: 'richiesta non valida' }, 400);
  if (parts[1] === 'geocode') {
    const q = (url.searchParams.get('q') || '').trim().slice(0, 200);
    if (!q) return json({ error: 'indirizzo mancante' }, 400);
    const u = new URL(env.OSM_GEOCODE_URL || 'https://nominatim.openstreetmap.org/search');
    const params = {
      q, format: 'jsonv2', limit: '1', countrycodes: 'it', addressdetails: '1', 'accept-language': 'it',
      viewbox: '13.45,45.90,14.10,45.50', // preferenza (non obbligo) per la provincia di Trieste
    };
    Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
    const r = await fetch(u, { headers: { 'User-Agent': OSM_UA }, cf: osmCache(30 * 86400) });
    if (!r.ok) return json({ error: 'servizio mappe non disponibile' }, 502);
    const list = await r.json().catch(() => []);
    return json((Array.isArray(list) ? list : []).slice(0, 1).map((p) => ({
      lat: Number(p.lat), lng: Number(p.lon), nome: String(p.display_name || ''),
      civico: Boolean(p.address && p.address.house_number),
    })));
  }
  // /api/tile/z/x/y
  const [z, x, y] = parts.slice(2, 5).map(Number);
  const n = 2 ** z;
  if (![z, x, y].every(Number.isInteger) || z < 0 || z > 19 || x < 0 || y < 0 || x >= n || y >= n) {
    return json({ error: 'tassello non valido' }, 400);
  }
  const r = await fetch(`${env.OSM_TILE_URL || 'https://tile.openstreetmap.org'}/${z}/${x}/${y}.png`,
    { headers: { 'User-Agent': OSM_UA }, cf: osmCache(7 * 86400) });
  if (!r.ok) return new Response('Mappa non disponibile', { status: 502 });
  return new Response(r.body, {
    headers: { 'Content-Type': r.headers.get('Content-Type') || 'image/png', 'Cache-Control': 'private, max-age=604800' },
  });
}

async function handleApi(request, env, url) {
  const db = env.DB;
  const parts = url.pathname.split('/').filter(Boolean); // ['api', 'kv'|'img', id?]
  if (parts[1] === 'geocode' || parts[1] === 'tile') return handleMaps(request, env, url, parts);
  await ensureSchema(db);
  const [, kind, rawId] = parts;
  const id = rawId ? decodeURIComponent(rawId) : null;

  if (kind === 'col') {
    const coll = id;
    const itemId = parts[3] ? decodeURIComponent(parts[3]) : null;
    if (!COLLECTIONS.has(coll)) return json({ error: 'elenco sconosciuto' }, 400);
    await migrateCollection(db, coll);
    if (!itemId && request.method === 'GET') {
      const { results } = await db.prepare('SELECT value FROM items WHERE coll = ?1 ORDER BY pos, created_at').bind(coll).all();
      return new Response('[' + results.map((r) => r.value).join(',') + ']', { headers: { 'Content-Type': 'application/json' } });
    }
    if (!itemId) return json({ error: 'scheda mancante' }, 400);
    if (coll === 'valutazioni_list' && (request.method === 'PUT' || request.method === 'DELETE')) {
      const other = await lockedByOther(db, itemId, holderOf(request));
      if (other) return json({ error: 'Valutazione aperta da un altro utente', since: other.since }, 423);
    }
    if (request.method === 'PUT') {
      const value = await request.text();
      try { JSON.parse(value); } catch (e) { return json({ error: 'dati non validi' }, 400); }
      const posParam = url.searchParams.get('pos');
      const pos = posParam === null || posParam === '' ? null : Number(posParam);
      const now = new Date().toISOString();
      // senza "pos" una scheda nuova va in fondo all'elenco e una esistente resta al suo posto
      await db.prepare(`INSERT INTO items (coll, id, value, pos, created_at, updated_at)
                        VALUES (?1, ?2, ?3, COALESCE(?4, (SELECT COALESCE(MAX(pos), -1) + 1 FROM items WHERE coll = ?1)), ?5, ?5)
                        ON CONFLICT(coll, id) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at,
                          pos = CASE WHEN ?4 IS NULL THEN items.pos ELSE excluded.pos END`)
        .bind(coll, itemId, value, pos, now).run();
      return json({ ok: true });
    }
    if (request.method === 'DELETE') {
      await db.prepare('DELETE FROM items WHERE coll = ?1 AND id = ?2').bind(coll, itemId).run();
      if (coll === 'valutazioni_list') await db.prepare('DELETE FROM locks WHERE id = ?1').bind(itemId).run();
      return json({ ok: true });
    }
  }

  if (kind === 'lock') {
    const holder = holderOf(request);
    const now = Date.now();
    if (!id && request.method === 'GET') {
      const { results } = await db.prepare('SELECT id, holder, since FROM locks WHERE expires > ?1').bind(now).all();
      return json(results.map((r) => ({ id: r.id, since: r.since, mine: r.holder === holder })));
    }
    if (!id || !holder) return json({ error: 'richiesta non valida' }, 400);
    if (request.method === 'POST') {
      // prende il blocco se è libero, scaduto o già suo (in quel caso lo rinnova)
      await db.prepare(`INSERT INTO locks (id, holder, since, expires) VALUES (?1, ?2, ?3, ?4)
                        ON CONFLICT(id) DO UPDATE SET
                          since = CASE WHEN locks.holder = excluded.holder THEN locks.since ELSE excluded.since END,
                          holder = excluded.holder, expires = excluded.expires
                        WHERE locks.holder = excluded.holder OR locks.expires <= ?5`)
        .bind(id, holder, new Date(now).toISOString(), now + LOCK_TTL_MS, now).run();
      const row = await db.prepare('SELECT holder, since FROM locks WHERE id = ?1').bind(id).first();
      return row && row.holder === holder ? json({ ok: true, since: row.since }) : json({ ok: false, since: row && row.since }, 423);
    }
    if (request.method === 'DELETE') {
      await db.prepare('DELETE FROM locks WHERE id = ?1 AND holder = ?2').bind(id, holder).run();
      return json({ ok: true });
    }
  }

  if (kind === 'kv') {
    // gli elenchi ora vivono in /api/col: una versione vecchia dell'app aperta da prima dell'aggiornamento
    // non deve riscriverli come blocco unico
    if (id && COLLECTIONS.has(id)) return json({ error: 'app aggiornata: ricarica la pagina' }, 409);
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
    const url = new URL(request.url);
    if (authEnabled(env)) {
      const authResponse = await handleAuth(request, env, url);
      if (authResponse) return authResponse;
      if (!(await hasValidSession(request, env))) {
        if (url.pathname.startsWith('/api/')) return json({ error: 'accesso scaduto, ricarica la pagina' }, 401);
        return Response.redirect(url.origin + '/login', 302);
      }
    }
    if (url.pathname.startsWith('/api/')) {
      try { return await handleApi(request, env, url); }
      catch (e) { return json({ error: e.message }, 500); }
    }
    return env.ASSETS.fetch(request);
  },
};
