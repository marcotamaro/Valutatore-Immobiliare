// Archivio condiviso: sostituisce il salvataggio nel browser (localStorage)
// con il database su Cloudflare (D1), mantenendo la stessa interfaccia window.storage
// usata da tutta l'app: get / set / delete / list.
//
// Le immagini (foto, logo, mappa) non vengono più salvate dentro i dati:
// prima di salvare, ogni immagine "data:image/..." viene ridimensionata,
// caricata a parte e sostituita con il suo indirizzo (/api/img/...).

const API = '/api';
const MAX_SIDE = 1400;      // lato massimo delle foto, in pixel (A4 stampato: più che sufficiente)
const JPEG_QUALITY = 0.78;

async function req(path, opts = {}) {
  const res = await fetch(API + path, { credentials: 'same-origin', ...opts });
  if (!res.ok && res.status !== 404) throw new Error(`Errore archivio (${res.status})`);
  return res;
}

// --- Immagini ---------------------------------------------------------------

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function compress(dataUrl) {
  // PNG piccoli (es. loghi con trasparenza) restano PNG; il resto diventa JPEG ridimensionato
  const isPng = dataUrl.startsWith('data:image/png');
  if (isPng && dataUrl.length < 400_000) return dataUrlToBlob(dataUrl);
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
}

function dataUrlToBlob(dataUrl) {
  const [head, b64] = dataUrl.split(',');
  const mime = head.match(/data:([^;]+)/)[1];
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

const uploaded = new Map(); // evita di ricaricare la stessa immagine nella stessa sessione

async function uploadImage(dataUrl) {
  if (uploaded.has(dataUrl)) return uploaded.get(dataUrl);
  const blob = await compress(dataUrl);
  const res = await req('/img', { method: 'POST', headers: { 'Content-Type': blob.type }, body: blob });
  const { url } = await res.json();
  uploaded.set(dataUrl, url);
  return url;
}

const DATA_IMG = /"(data:image\/[a-zA-Z+.-]+;base64,[A-Za-z0-9+/=]+)"/g;

async function extractImages(value) {
  if (typeof value !== 'string' || !value.includes('data:image/')) return value;
  const found = [...new Set([...value.matchAll(DATA_IMG)].map(m => m[1]))];
  let out = value;
  for (const d of found) {
    const url = await uploadImage(d);
    out = out.split(`"${d}"`).join(`"${url}"`);
  }
  // valore che è direttamente un'immagine (non JSON)
  if (out.startsWith('data:image/')) out = await uploadImage(out);
  return out;
}

// --- Interfaccia window.storage ----------------------------------------------

const storage = {
  async get(key) {
    const res = await req('/kv/' + encodeURIComponent(key));
    if (res.status === 404) return null;
    return { key, value: await res.text() };
  },
  async set(key, value) {
    const v = await extractImages(String(value));
    await req('/kv/' + encodeURIComponent(key), { method: 'PUT', body: v });
    return { key, value: v };
  },
  async delete(key) {
    await req('/kv/' + encodeURIComponent(key), { method: 'DELETE' });
    return { key, deleted: true };
  },
  async list(prefix = '') {
    const res = await req('/kv?prefix=' + encodeURIComponent(prefix));
    return { keys: await res.json() };
  },
};

// Avvisa l'utente se un salvataggio fallisce (prima fallivano in silenzio)
function withAlert(fn, what) {
  return async (...args) => {
    try { return await fn(...args); }
    catch (e) { alert(`Attenzione: ${what} non riuscito. Controlla la connessione e riprova.\n(${e.message})`); throw e; }
  };
}
storage.set = withAlert(storage.set, 'salvataggio');
storage.delete = withAlert(storage.delete, 'eliminazione');

// --- Trasferimento una tantum dei dati salvati nel browser --------------------

const MIGRATION_FLAG = 'archivio_migrato';
const SKIP = new Set(['view_report_data', 'edit_valutazione']);

async function migrateLocalData() {
  if (localStorage.getItem(MIGRATION_FLAG)) return;
  const local = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.startsWith('app_') && !SKIP.has(k.slice(4))) local.push(k.slice(4));
  }
  if (!local.length) { localStorage.setItem(MIGRATION_FLAG, '1'); return; }
  for (const key of local) {
    const remote = await storage.get(key);
    const localVal = localStorage.getItem('app_' + key);
    if (key === 'valutazioni_list' && remote) {
      // unisce le valutazioni del browser con quelle già in archivio, senza doppioni
      const a = JSON.parse(remote.value || '[]'), b = JSON.parse(localVal || '[]');
      const ids = new Set(a.map(v => v.id));
      const merged = [...a, ...b.filter(v => !ids.has(v.id))];
      await storage.set(key, JSON.stringify(merged));
    } else if (!remote) {
      await storage.set(key, localVal);
    }
  }
  localStorage.setItem(MIGRATION_FLAG, '1');
  console.info(`Archivio: trasferiti ${local.length} elementi dal browser al database.`);
}

window.storage = storage;
export const storageReady = migrateLocalData().catch(e => console.warn('Trasferimento dati non riuscito:', e));
