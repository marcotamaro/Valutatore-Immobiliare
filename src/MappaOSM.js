import { useEffect, useRef, useState } from "react";

// Mappa OpenStreetMap del form: cerca l'indirizzo, mostra il segnaposto (colore dell'agenzia)
// e prepara da sola l'immagine che va nel report (pagina "Analisi della zona").
// Regole d'uso OSM: citare "© OpenStreetMap contributors" (sulla mappa e sull'immagine),
// al massimo una ricerca al secondo, nessuno scaricamento in massa.

const TILE = 256;
const MIN_Z = 12, MAX_Z = 18, DEF_Z = 16;
export const MAP_W = 700, MAP_H = 280; // l'immagine del report: 700×280, salvata a doppia risoluzione
const TRIESTE = { lat: 45.6495, lng: 13.7768 };
const ATTRIB = "© OpenStreetMap contributors";
// Segnaposto a forma di casa (tetto, comignolo, porta) con una piccola punta in basso
// che indica il punto esatto: la punta (16,39) sta sul centro della mappa
const CASA = "M16 1 L21.5 5.8 L21.5 3 L25 3 L25 8.8 L31 14 L27 14 L27 33 L20 33 L16 39 L12 33 L5 33 L5 14 L1 14 Z";
const PORTA = "M13.5 31 V25 a2.5 2.5 0 0 1 5 0 V31 Z";
const PIN_K = 1.15; // circa 39×48 px

// Coordinate geografiche <-> pixel del mondo (proiezione di OSM, Web Mercator)
const worldSize = (z) => TILE * 2 ** z;
const project = (lat, lng, z) => {
  const s = worldSize(z), r = (Math.max(-85, Math.min(85, lat)) * Math.PI) / 180;
  return { cx: ((lng + 180) / 360) * s, cy: ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * s, z };
};
const unproject = ({ cx, cy, z }) => {
  const s = worldSize(z), n = Math.PI - (2 * Math.PI * cy) / s;
  return { lat: (180 / Math.PI) * Math.atan(Math.sinh(n)), lng: (cx / s) * 360 - 180 };
};
const round6 = (n) => Math.round(n * 1e6) / 1e6;

// I tasselli arrivano direttamente da OSM; se non si caricano, passano dal nostro server (/api/tile)
let tileSource = "osm";
const tileUrl = (z, x, y) => (tileSource === "osm" ? `https://tile.openstreetmap.org/${z}/${x}/${y}.png` : `/api/tile/${z}/${x}/${y}`);

const tilesFor = ({ cx, cy, z }, w, h) => {
  const left = Math.round(cx - w / 2), top = Math.round(cy - h / 2), n = 2 ** z, out = [];
  for (let ty = Math.floor(top / TILE); ty <= Math.floor((top + h - 1) / TILE); ty++) {
    if (ty < 0 || ty >= n) continue;
    for (let tx = Math.floor(left / TILE); tx <= Math.floor((left + w - 1) / TILE); tx++) {
      out.push({ key: `${z}/${tx}/${ty}`, z, x: ((tx % n) + n) % n, y: ty, left: tx * TILE - left, top: ty * TILE - top });
    }
  }
  return out;
};

const loadImg = (src) => new Promise((resolve, reject) => {
  const i = new Image();
  i.crossOrigin = "anonymous";
  i.onload = () => resolve(i);
  i.onerror = reject;
  i.src = src;
});
const loadTile = async (t) => {
  try { return await loadImg(tileUrl(t.z, t.x, t.y)); } catch (e) {
    if (tileSource !== "osm") throw e;
    tileSource = "proxy";
    return loadImg(tileUrl(t.z, t.x, t.y));
  }
};

function drawPin(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s * PIN_K, s * PIN_K);
  ctx.beginPath(); ctx.ellipse(0, 0, 6, 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.22)"; ctx.fill();
  ctx.translate(-16, -39);
  const casa = new Path2D(CASA);
  ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 5 * s; ctx.shadowOffsetY = 2 * s;
  ctx.fillStyle = color; ctx.fill(casa);
  ctx.shadowColor = "transparent";
  ctx.lineWidth = 1.6; ctx.lineJoin = "round"; ctx.strokeStyle = "#fff"; ctx.stroke(casa);
  ctx.fillStyle = "#fff"; ctx.fill(new Path2D(PORTA));
  ctx.restore();
}

// Immagine per il report: stessa inquadratura della mappa, a doppia risoluzione, con segnaposto e attribuzione
async function renderMapImage(view, color) {
  const S = 2, c = document.createElement("canvas");
  c.width = MAP_W * S; c.height = MAP_H * S;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#eceae4"; ctx.fillRect(0, 0, c.width, c.height);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
  const tiles = tilesFor(view, MAP_W, MAP_H);
  const imgs = await Promise.all(tiles.map(loadTile));
  tiles.forEach((t, i) => ctx.drawImage(imgs[i], t.left * S, t.top * S, TILE * S, TILE * S));
  drawPin(ctx, (MAP_W / 2) * S, (MAP_H / 2) * S, S, color);
  ctx.font = `${10.5 * S}px Helvetica, Arial, sans-serif`;
  const tw = ctx.measureText(ATTRIB).width, pad = 5 * S, h = 16 * S;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillRect(c.width - tw - pad * 2, c.height - h, tw + pad * 2, h);
  ctx.fillStyle = "#444"; ctx.textBaseline = "middle";
  ctx.fillText(ATTRIB, c.width - tw - pad, c.height - h / 2);
  return c.toDataURL("image/jpeg", 0.88);
}

// Ricerca dell'indirizzo: passa dal nostro server (con cache); se non risponde, chiede direttamente a OSM
async function geocode(q) {
  try {
    const r = await fetch("/api/geocode?q=" + encodeURIComponent(q));
    if (!r.ok) throw new Error(String(r.status));
    return (await r.json())[0] || null;
  } catch (e) {
    const u = "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=it&addressdetails=1"
      + "&accept-language=it&viewbox=13.45,45.90,14.10,45.50&q=" + encodeURIComponent(q);
    const r = await fetch(u);
    if (!r.ok) throw new Error(String(r.status));
    const p = (await r.json())[0];
    return p ? { lat: Number(p.lat), lng: Number(p.lon), nome: p.display_name || "", civico: !!(p.address && p.address.house_number) } : null;
  }
}

const shortName = (s) => String(s || "").split(", ").filter((x) => !/^(Italia|Friuli[- ]Venezia Giulia)$/i.test(x)).join(", ");

export default function MappaOSM({ accent, indirizzo, civico, cap, citta, lat, lng, zoom, img, onChange }) {
  const boxRef = useRef(null);
  const fileRef = useRef(null);
  const [w, setW] = useState(MAP_W);
  const [view, setView] = useState(() => (lat != null && lng != null ? project(lat, lng, zoom || DEF_Z) : null));
  const [settle, setSettle] = useState(0); // aumenta quando la mappa si ferma in una nuova posizione
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [capErr, setCapErr] = useState(false);
  const [msg, setMsg] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [, force] = useState(0);
  const drag = useRef(null);
  const viewRef = useRef(view); viewRef.current = view;
  const onChangeRef = useRef(onChange); onChangeRef.current = onChange;
  const colorRef = useRef(accent); colorRef.current = accent;

  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setW(Math.max(200, Math.min(MAP_W, el.clientWidth))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Quando la mappa si ferma, aggiorna da sola l'immagine del report.
  // seq = ultima posizione da salvare, started = ultima già in preparazione.
  const seq = useRef(0);
  const started = useRef(0);
  const capture = useRef(null);
  capture.current = async () => {
    const my = seq.current, v = viewRef.current;
    if (started.current >= my || !v) return;
    started.current = my;
    setSaving(true);
    try {
      const image = await renderMapImage(v, colorRef.current || "#1a3a5c");
      if (my !== seq.current) return; // nel frattempo la mappa è stata spostata o tolta
      const p = unproject(v);
      onChangeRef.current({ lat: round6(p.lat), lng: round6(p.lng), mappa_zoom: v.z, mappa_img: image });
      setCapErr(false);
    } catch (e) {
      if (my === seq.current) setCapErr(true);
    } finally {
      if (my === seq.current) setSaving(false);
    }
  };
  const annulla = () => { seq.current += 1; started.current = seq.current; setSaving(false); };
  useEffect(() => {
    if (!settle) return;
    seq.current += 1;
    const t = setTimeout(() => capture.current(), 450);
    return () => clearTimeout(t);
  }, [settle]);
  // uscendo dallo step subito dopo aver spostato la mappa, l'ultima posizione si salva comunque
  useEffect(() => () => capture.current(), []);

  const cerca = async () => {
    const via = String(indirizzo || "").trim();
    if (!via) { setMsg({ tipo: "errore", testo: "Scrivi prima l'indirizzo dell'immobile." }); return; }
    const civ = String(civico || "").trim(), city = String(citta || "Trieste").trim(), cp = String(cap || "").trim();
    const tentativi = [...new Set([
      `${via}${civ ? " " + civ : ""}, ${[cp, city].filter(Boolean).join(" ")}`,
      `${via}${civ ? " " + civ : ""}, ${city}`,
      civ ? `${via}, ${city}` : null,
    ].filter(Boolean))];
    setBusy(true); setMsg(null);
    try {
      let found = null;
      for (let i = 0; i < tentativi.length && !found; i++) {
        if (i) await new Promise((r) => setTimeout(r, 1100)); // massimo una ricerca al secondo
        found = await geocode(tentativi[i]);
      }
      if (found) {
        setView(project(found.lat, found.lng, DEF_Z));
        setSettle((s) => s + 1);
        setMsg(found.civico || !civ
          ? { tipo: "ok", testo: "Trovato: " + shortName(found.nome) }
          : { tipo: "avviso", testo: "Numero civico non trovato: il segnaposto è sulla via. Trascina la mappa per metterlo sul punto esatto." });
      } else {
        setView((v) => v || project(TRIESTE.lat, TRIESTE.lng, 14));
        setMsg({ tipo: "avviso", testo: "Indirizzo non trovato: controlla come è scritto, oppure trascina la mappa per mettere il segnaposto sul punto giusto." });
      }
    } catch (e) {
      setMsg({ tipo: "errore", testo: "Il servizio mappe non risponde: riprova tra qualche istante." });
    } finally {
      setBusy(false);
    }
  };

  const rimuovi = () => {
    annulla();
    onChange({ lat: null, lng: null, mappa_zoom: null, mappa_img: null });
    setView(null); setMsg(null); setCapErr(false);
  };

  const carica = (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { annulla(); onChange({ mappa_img: ev.target.result, lat: null, lng: null, mappa_zoom: null }); setView(null); setMsg(null); };
    reader.readAsDataURL(file);
  };

  const onDown = (e) => {
    if (!view || e.button > 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, cx: view.cx, cy: view.cy, moved: false };
    setDragging(true);
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) d.moved = true;
    setView((v) => ({ ...v, cx: d.cx - dx, cy: Math.max(0, Math.min(worldSize(v.z), d.cy - dy)) }));
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (d && d.moved) { setSettle((s) => s + 1); setMsg(null); }
  };
  const zoomBy = (d) => {
    const v = viewRef.current;
    const z = Math.max(MIN_Z, Math.min(MAX_Z, v.z + d));
    if (z === v.z) return;
    const k = 2 ** (z - v.z);
    setView({ cx: v.cx * k, cy: v.cy * k, z });
    setSettle((s) => s + 1);
  };
  const stopDrag = { onPointerDown: (e) => e.stopPropagation() };

  const btn = (primary) => ({
    padding: "11px 18px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, fontFamily: "var(--font-body)", cursor: "pointer",
    border: primary ? "none" : "1.5px solid var(--border)", background: primary ? accent : "var(--input-bg)",
    color: primary ? "#fff" : "var(--text-secondary)",
  });
  const msgColors = { ok: ["#eaf6ee", "#2e7d4f"], avviso: ["#fff6e5", "#9a6400"], errore: ["#fdecec", "#c33"] };
  const zoomBtn = { width: 32, height: 32, border: "none", background: "#fff", fontSize: 18, fontWeight: 600, color: "#333", cursor: "pointer", lineHeight: "32px", padding: 0, fontFamily: "var(--font-body)" };
  const pronta = !!img && lat != null;

  return (
    <div ref={boxRef}>
      <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 12px" }}>
        Cerca l'indirizzo e controlla il segnaposto: la mappa va nel report, nella pagina dell'analisi della zona.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button type="button" onClick={cerca} disabled={busy} style={{ ...btn(true), opacity: busy ? 0.6 : 1 }}>
          {busy ? "Ricerca in corso…" : view ? "📍 Cerca di nuovo l'indirizzo" : "📍 Trova sulla mappa"}
        </button>
        <button type="button" onClick={() => fileRef.current && fileRef.current.click()} style={btn(false)}>Carica un'immagine</button>
        {(view || img) && (
          <button type="button" onClick={rimuovi} style={{ ...btn(false), border: "1px solid #fcc", background: "#fee", color: "#c33" }}>✕ Rimuovi mappa</button>
        )}
        <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" style={{ display: "none" }} onChange={carica} />
      </div>

      {msg && (
        <div style={{ marginTop: 12, padding: "9px 12px", borderRadius: 8, fontSize: 12.5, lineHeight: 1.5, background: msgColors[msg.tipo][0], color: msgColors[msg.tipo][1] }}>
          {msg.testo}
        </div>
      )}

      {view && (
        <div style={{ marginTop: 14, maxWidth: MAP_W }}>
          <div
            className="osm-map"
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            style={{ position: "relative", height: MAP_H, overflow: "hidden", borderRadius: 10, border: "1.5px solid var(--border)", background: "#eceae4", cursor: dragging ? "grabbing" : "grab", touchAction: "none", userSelect: "none" }}
          >
            {tilesFor(view, w, MAP_H).map((t) => (
              <img
                key={t.key + tileSource} src={tileUrl(t.z, t.x, t.y)} crossOrigin="anonymous" alt="" draggable={false}
                onError={() => { if (tileSource === "osm") { tileSource = "proxy"; force((n) => n + 1); } }}
                style={{ position: "absolute", left: t.left, top: t.top, width: TILE, height: TILE, pointerEvents: "none", maxWidth: "none" }}
              />
            ))}
            <svg viewBox="-1 -1 34 42" width={34 * PIN_K} height={42 * PIN_K}
              style={{ position: "absolute", left: w / 2 - 17 * PIN_K, top: MAP_H / 2 - 40 * PIN_K, pointerEvents: "none", filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.35))", overflow: "visible" }}>
              <ellipse cx="16" cy="39" rx="6" ry="2" fill="rgba(0,0,0,0.22)" />
              <path d={CASA} fill={accent} stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
              <path d={PORTA} fill="#fff" />
            </svg>
            <div {...stopDrag} style={{ position: "absolute", top: 10, left: 10, display: "flex", flexDirection: "column", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 5px rgba(0,0,0,0.25)" }}>
              <button type="button" aria-label="Avvicina" onClick={() => zoomBy(1)} disabled={view.z >= MAX_Z} style={{ ...zoomBtn, borderBottom: "1px solid #ddd", opacity: view.z >= MAX_Z ? 0.4 : 1 }}>+</button>
              <button type="button" aria-label="Allontana" onClick={() => zoomBy(-1)} disabled={view.z <= MIN_Z} style={{ ...zoomBtn, opacity: view.z <= MIN_Z ? 0.4 : 1 }}>−</button>
            </div>
            <a {...stopDrag} href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer"
              style={{ position: "absolute", right: 0, bottom: 0, background: "rgba(255,255,255,0.85)", padding: "2px 6px", fontSize: 10.5, color: "#444", textDecoration: "none", fontFamily: "Helvetica, Arial, sans-serif" }}>
              {ATTRIB}
            </a>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginTop: 8, fontSize: 12 }}>
            <span style={{ color: "var(--text-secondary)" }}>Trascina la mappa per mettere il segnaposto sul punto esatto; usa + e − per lo zoom.</span>
            <span style={{ fontWeight: 600, color: saving ? "var(--text-secondary)" : capErr ? "#c33" : pronta ? "#2e7d4f" : "#9a6400" }}>
              {saving ? "Aggiorno la mappa del report…" : capErr ? "Mappa del report non aggiornata" : pronta ? "✓ Mappa pronta per il report" : "Mappa non ancora nel report"}
              {!saving && (capErr || !pronta) && (
                <button type="button" onClick={() => setSettle((s) => s + 1)} style={{ marginLeft: 8, border: "none", background: "none", color: accent, fontWeight: 700, cursor: "pointer", padding: 0, fontSize: 12, fontFamily: "var(--font-body)", textDecoration: "underline" }}>
                  {capErr ? "Riprova" : "Usa questa posizione"}
                </button>
              )}
            </span>
          </div>
        </div>
      )}

      {!view && img && (
        <div style={{ marginTop: 14 }}>
          <img src={img} alt="Mappa" style={{ width: "100%", borderRadius: 10, border: "1.5px solid var(--border)", display: "block" }} />
        </div>
      )}
    </div>
  );
}
