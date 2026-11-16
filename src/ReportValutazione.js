import { useState, useEffect } from "react";
import { REPORT_TEXT_DEFAULTS, mergeTexts, applyText } from "./reportTexts";

const fmt = (v) => {
  if (!v && v !== 0) return "";
  return Number(v).toLocaleString("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 });
};
const fmtDate = (d) => {
  if (!d) return "";
  try { return new Date(d + "T00:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" }); }
  catch { return d; }
};
const showField = (v) => v && v !== "";
const perMq = (prezzo, mq) => (Number(prezzo) && Number(mq) ? Math.round(Number(prezzo) / Number(mq)) : null);
const fmtMese = (m) => {
  if (!m) return "—";
  try { return new Date(m + "-01T00:00:00").toLocaleDateString("it-IT", { month: "short", year: "numeric" }); } catch (e) { return m; }
};
const shortLink = (u) => { try { const x = new URL(u); return (x.hostname.replace(/^www\./, "") + x.pathname).replace(/\/$/, "").slice(0, 70); } catch (e) { return u; } };

const DEMO = {
  agenzia_nome: "TAM Immobiliare", agenzia_indirizzo: "Via Mazzini 14, 34121 Trieste",
  agenzia_telefono: "+39 040 555 1234", agenzia_email: "info@tamimmobiliare.it",
  agenzia_colore: "#1a3a5c", agenzia_logo: null, copertina_img: null,
  titolo_valutazione: "Valutazione Immobiliare",
  agenzia_modus_operandi: "La presente valutazione è stata elaborata utilizzando il metodo comparativo di mercato (Market Comparison Approach), analizzando le compravendite recenti di immobili con caratteristiche analoghe nella medesima zona.\n\nSono stati considerati: ubicazione e contesto urbano, stato di manutenzione, superficie commerciale e distribuzione degli spazi, piano, esposizione, luminosità e vista, pertinenze e spazi accessori, classe energetica e andamento del mercato locale.",
  agente_nome: "Bianchi Marco", agente_telefono: "+39 333 9876543", agente_email: "marco@tamimmobiliare.it",
  tipologia: "Appartamento", indirizzo: "Via Carducci", civico: "22", cap: "34100",
  citta: "Trieste", zona: "Centro Storico", piano: "3", totale_piani: "5",
  catasto_mappa: "1", catasto_foglio: "12", catasto_particella: "345", catasto_subalterno: "6",
  proprietario_nome: "Mario", proprietario_cognome: "Rossi", proprietario_telefono: "+39 333 1111111", proprietario_email: "mario.rossi@email.it",
  mappa_img: null, superficie_commerciale: "95", locali: "4", camere: "2", bagni: "1",
  livelli_immobile: "1", altri_vani: "", altri_vani_mq: "",
  balconi: "2", balconi_mq: "12", terrazzi: "", terrazzi_mq: "",
  giardino: "", giardino_mq: "", verande: "", verande_mq: "",
  stato_conservazione: "Ristrutturato ultimi 5 anni", anno_costruzione: "1928",
  classe_energetica: "D", riscaldamento: "Autonomo", tipologia_riscaldamento: "Caloriferi",
  vista: "Molto bella", luminosita: "Molto luminoso", esposizione: "Sud-Est",
  condizioni_facciate: "Buone", tipologia_edificio: "Signorile",
  condizioni_tetto: "Buono", condizioni_atrio: "Ottimo", spese_condominiali: "1800",
  facilita_accesso: "Molto comodo", area_verde_condominiale: false, parcheggi_condominiali: false,
  imp_elettrico: "Certificato", imp_acqua_calda: "Autonoma caldaia", cappotto: false,
  ascensore: true, aria_condizionata: false, pannelli_fotovoltaici: false, senza_barriere: false,
  valore_min: "280000", valore_medio: "310000", valore_max: "340000", prezzo_pubblicita: "329000",
  note_valutazione: "Valutazione basata su comparabili di zona.",
  descrizione_manuale: "Splendido appartamento di 95 mq commerciali al terzo piano di un elegante palazzo d'epoca nel Centro Storico di Trieste. Completamente ristrutturato, si compone di ingresso, ampio soggiorno, cucina abitabile, due camere e bagno finestrato. Due balconi per 12 mq totali.",
  testo_mercato: "Il mercato immobiliare triestino presenta caratteristiche peculiari legate alla posizione geografica di confine e ad un tessuto urbano prevalentemente storico. Trieste ha registrato un crescente interesse da parte di acquirenti internazionali, attratti dalla qualità della vita e da quotazioni competitive.\n\nIl comparto residenziale mostra domanda sostenuta nelle zone centrali, con particolare interesse per immobili ristrutturati. I tempi medi di vendita si attestano tra 3 e 6 mesi.",
  testo_zona: "L'immobile è ubicato nel Centro Storico di Trieste, a pochi passi dal mare e da tutti i principali servizi, in un contesto di palazzi d'epoca molto richiesto sia per l'abitazione principale sia per l'investimento.",
  pertinenze: [{ id: 1, tipo: "cantina", label: "Cantina", icon: "🏚️", superficie: "8", valore: "12000", note: "Piano -1" }],
  data_valutazione: "2026-04-09",
};

/* ══════ Shared components ══════ */
const SH = ({ title, accent }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: accent }}>{title}</div>
    <div style={{ width: 50, height: 2.5, background: accent, marginTop: 6, borderRadius: 2 }} />
  </div>
);

const DR = ({ label, value, even }) => (
  <div className="dr" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "7px 14px", background: even ? "#fafbfd" : "#fff", borderBottom: "1px solid #f0f1f4", fontSize: 13 }}>
    <span style={{ color: "#777" }}>{label}</span>
    <span style={{ fontWeight: 600, color: "#2a2a3e", textAlign: "right" }}>{value}</span>
  </div>
);

const PN = ({ n }) => <div style={{ textAlign: "center", padding: "12px 0 0", fontSize: 10, color: "#ccc" }}>— {n} —</div>;

/* ══════ MAIN ══════ */
export default function ReportValutazione({ initialData = null, onBack = null }) {
  const [data, setData] = useState(initialData);
  const [list, setList] = useState([]);
  const [showSelector, setShowSelector] = useState(!initialData);
  const [loading, setLoading] = useState(!initialData);
  const [globalTexts, setGlobalTexts] = useState(null);

  useEffect(() => {
    (async () => {
      try { const r = await window.storage.get("report_texts"); if (r && r.value) setGlobalTexts(JSON.parse(r.value)); } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    if (initialData) { setData(initialData); setShowSelector(false); setLoading(false); return; }
    (async () => {
      try {
        const viewRes = await window.storage.get("view_report_data");
        if (viewRes && viewRes.value) { setData(JSON.parse(viewRes.value)); setShowSelector(false); await window.storage.delete("view_report_data"); }
        const res = await window.storage.get("valutazioni_list");
        if (res && res.value) setList(JSON.parse(res.value));
      } catch (e) {}
      setLoading(false);
    })();
  }, [initialData]);

  const goBack = () => onBack ? onBack() : setShowSelector(true);
  const loadDemo = () => { setData(DEMO); setShowSelector(false); };

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#666" }}>Caricamento...</div>;

  /* Selector */
  if (showSelector) return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f0f2f7", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ background: "#fff", borderRadius: 16, padding: "40px 36px", maxWidth: 500, width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 8 }}>📄 Report Valutazione</h1>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 28 }}>Seleziona una valutazione salvata.</p>
        {list.length > 0 ? list.map((v, i) => (
          <button key={v.id || i} onClick={() => { setData(v); setShowSelector(false); }}
            style={{ display: "block", width: "100%", padding: "14px 18px", borderRadius: 10, border: "1.5px solid #d8dce6", background: "#f8f9fc", cursor: "pointer", textAlign: "left", marginBottom: 8, fontFamily: "'DM Sans'" }}
          >
            <div style={{ fontWeight: 600, fontSize: 15 }}>{v.tipologia} — {v.indirizzo} {v.civico}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{v.zona && `${v.zona} · `}{fmtDate(v.data_valutazione)}{v.valore_medio && ` · ${fmt(v.valore_medio)}`}</div>
          </button>
        )) : <div style={{ padding: 24, textAlign: "center", color: "#999", background: "#f8f9fc", borderRadius: 10, border: "1.5px dashed #d8dce6" }}>Nessuna valutazione salvata.</div>}
        <button onClick={loadDemo} style={{ marginTop: 16, width: "100%", padding: "12px", borderRadius: 8, border: "1.5px solid #d8dce6", background: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans'", color: "#666" }}>👁️ Esempio demo</button>
      </div>
    </div>
  );

  /* ══════ REPORT RENDER ══════ */
  const accent = data.agenzia_colore || "#1a3a5c";
  const totalPert = data.pertinenze ? data.pertinenze.reduce((s, p) => s + (Number(p.valore) || 0), 0) : 0;

  const buildingChars = [
    data.anno_costruzione && ["Anno di costruzione", data.anno_costruzione],
    showField(data.tipologia_edificio) && ["Tipologia edificio", data.tipologia_edificio],
    data.totale_piani && ["Piani edificio", data.totale_piani],
    showField(data.condizioni_facciate) && ["Condizioni facciate", data.condizioni_facciate],
    showField(data.condizioni_tetto) && ["Condizioni tetto", data.condizioni_tetto],
    showField(data.condizioni_atrio) && ["Condizioni atrio / vano scale", data.condizioni_atrio],
    showField(data.facilita_accesso) && ["Facilità di accesso", data.facilita_accesso],
    data.spese_condominiali && ["Spese condominiali annue", fmt(data.spese_condominiali)],
    data.ascensore && ["Ascensore", "Presente"],
    data.senza_barriere && ["Senza barriere architettoniche", "Sì"],
    data.area_verde_condominiale && ["Area verde condominiale", "Presente"],
    data.parcheggi_condominiali && ["Parcheggi condominiali liberi", "Presenti"],
    data.vincolo_belle_arti && ["Stabile vincolato Belle Arti", "Sì"],
  ].filter(Boolean);

  const propChars = [
    data.superficie_commerciale && ["Superficie commerciale interna", `${data.superficie_commerciale} mq`],
    data.locali && ["Locali", data.locali],
    data.camere && ["Camere da letto", data.camere],
    data.bagni && ["Bagni", data.bagni],
    showField(data.livelli_immobile) && ["Livelli", data.livelli_immobile],
    data.piano && ["Piano", data.totale_piani ? `${data.piano} di ${data.totale_piani}` : data.piano],
    ...(Array.isArray(data.altri_vani) ? data.altri_vani.map(v => [v.tipo, v.mq ? `${v.mq} mq` : "Presente"]) : (showField(data.altri_vani) ? [["Vani collegati", `${data.altri_vani}${data.altri_vani_mq ? ` — ${data.altri_vani_mq} mq` : ""}`]] : [])),
    data.balconi && Number(data.balconi) > 0 && ["Balconi", `${data.balconi}${data.balconi_mq ? ` — ${data.balconi_mq} mq` : ""}`],
    data.terrazzi && Number(data.terrazzi) > 0 && ["Terrazzi", `${data.terrazzi}${data.terrazzi_mq ? ` — ${data.terrazzi_mq} mq` : ""}`],
    data.verande && Number(data.verande) > 0 && ["Verande", `${data.verande}${data.verande_mq ? ` — ${data.verande_mq} mq` : ""}`],
    data.giardino && Number(data.giardino) > 0 && ["Giardino", `${data.giardino}${data.giardino_mq ? ` — ${data.giardino_mq} mq` : ""}`],
    showField(data.stato_conservazione) && ["Stato manutenzione", data.stato_conservazione],
    showField(data.classe_energetica) && ["Classe energetica", data.classe_energetica],
    showField(data.riscaldamento) && ["Riscaldamento", data.riscaldamento],
    showField(data.tipologia_riscaldamento) && ["Tipo riscaldamento", data.tipologia_riscaldamento],
    showField(data.imp_acqua_calda) && ["Acqua calda", data.imp_acqua_calda],
    showField(data.imp_riscaldamento) && ["Imp. riscaldamento", data.imp_riscaldamento],
    showField(data.imp_elettrico) && ["Imp. elettrico", data.imp_elettrico],
    showField(data.imp_gas) && ["Imp. gas", data.imp_gas],
    showField(data.vista) && ["Vista", data.vista],
    showField(data.luminosita) && ["Luminosità", data.luminosita],
    data.esposizione && ["Esposizione", data.esposizione],
    data.aria_condizionata && ["Aria condizionata", "Presente"],
    data.pannelli_fotovoltaici && ["Pannelli fotovoltaici", "Presenti"],
    data.cappotto && ["Cappotto", "Presente"],
    data.caminetto && ["Caminetto", "Presente"],
    data.domotica && ["Domotica", "Presente"],
    data.videocitofono && ["Videocitofono", "Presente"],
    data.porta_blindata && ["Porta blindata", "Presente"],
  ].filter(Boolean);

  const comps = (data.comparabili || []).filter(c => c.link || c.indirizzo || c.titolo || c.prezzo);
  const vendite = (data.vendite_zona || []).filter(v => v.indirizzo || v.prezzo).sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  const hasFoto = data.foto_immobile && data.foto_immobile.length > 0;
  const hasComp = comps.length > 0;
  const hasVend = vendite.length > 0;
  const hasAcq = Number(data.acquirenti_numero) > 0;
  const hasTarget = !!(data.analisi_target && data.analisi_target.trim());

  // Titoli e frasi: predefiniti → personalizzati dall'admin → copia salvata nella valutazione
  const tx = mergeTexts(globalTexts, data.report_texts);
  const vars = { agenzia: data.agenzia_nome || "la nostra agenzia", zona: data.zona || "", data: fmtDate(data.data_valutazione), anno: String(new Date().getFullYear()) };
  const T = (k) => applyText(tx[k], vars);                               // frase: vuota = non mostrata
  const TT = (k) => T(k) || applyText(REPORT_TEXT_DEFAULTS[k], vars);    // titolo: vuoto = predefinito

  const indice = [
    [TT("titolo_indice_oggetto")],
    [TT("titolo_mercato")],
    [TT("titolo_zona")],
    [TT("titolo_scheda")],
    hasFoto && [TT("titolo_foto")],
    [TT("titolo_valutazione"), (hasComp || hasVend || hasAcq || hasTarget) ? [hasComp && TT("titolo_comparabili"), hasVend && TT("titolo_vendite"), hasTarget && TT("titolo_target"), hasAcq && !hasVend && !hasTarget && TT("titolo_acquirenti"), "Valore di mercato stimato"].filter(Boolean) : null],
  ].filter(Boolean);

  let pageNo = 1; // copertina = pagina 1; ogni pagina renderizzata chiama nextPage() nell'ordine di stampa
  const nextPage = () => ++pageNo;

  const pg = { maxWidth: 794, minHeight: 1123, margin: "0 auto 24px", background: "#fff", borderRadius: 4, boxShadow: "0 2px 16px rgba(0,0,0,0.08)", overflow: "hidden", position: "relative" };

  return (
    <div className="rp-root" style={{ fontFamily: "'DM Sans', sans-serif", background: "#e8eaee", minHeight: "100vh", color: "#1a1a2e" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
      <style>{`
        @media print {
          body,html{background:#fff!important;margin:0!important;padding:0!important}
          .no-print{display:none!important}
          .rp{box-shadow:none!important;margin:0!important;border-radius:0!important;min-height:auto!important;overflow:visible!important}
          .rp-root{background:#fff!important;min-height:0!important}
          .rp-pages{padding:0!important}
          .rp-cover{min-height:0!important;height:297mm!important;max-height:297mm!important;overflow:hidden!important;max-width:none!important;width:210mm!important}
          .cover-img-wrap{height:100%!important;min-height:100%!important}
          .page-break{break-before:page}
          .dr{break-inside:avoid}
          @page{margin:0;size:A4 portrait}
          *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
        }
      `}</style>

      {/* Top bar */}
      <div className="no-print" style={{ background: "#fff", borderBottom: "1px solid #ddd", padding: "8px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={goBack} style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid #d8dce6", background: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans'", fontWeight: 600 }}>← Indietro</button>
        {process.env.REACT_APP_NO_PRINT === "1"
          ? <span style={{ fontSize: 12, color: "#888", textAlign: "right" }}>Anteprima: la stampa in PDF è disponibile nell'app online</span>
          : <button onClick={() => window.print()} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: accent, color: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans'", fontWeight: 600 }}>🖨️ Stampa / PDF</button>}
      </div>

      <div className="rp-pages" style={{ padding: "20px 16px 40px" }}>

        {/* ══════ PAG 1 — COPERTINA ══════ */}
        <div className="rp rp-cover" style={{ ...pg, minHeight: 1123, height: 1123, position: "relative" }}>
          {/* Sfondo: foto caricata oppure tinta agenzia */}
          <div className="cover-img-wrap" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
            {data.copertina_img ? (<>
              <img src={data.copertina_img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0.10) 50%, ${accent}e0 100%)` }} />
            </>) : (<>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `linear-gradient(160deg, ${accent} 0%, ${accent}ee 55%, ${accent}bb 100%)` }} />
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "repeating-linear-gradient(135deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 22px)" }} />
              <div style={{ position: "absolute", top: -140, right: -140, width: 480, height: 480, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.10)" }} />
              <div style={{ position: "absolute", top: -60, right: -60, width: 320, height: 320, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.07)" }} />
              <div style={{ position: "absolute", bottom: 60, left: -180, width: 520, height: 520, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
            </>)}
          </div>

          {/* Riga superiore */}
          <div style={{ position: "absolute", top: 40, left: 56, right: 56, display: "flex", justifyContent: "space-between", fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>
            <span>{data.tipologia || "Immobile"}{data.zona ? ` · ${data.zona}` : ""}</span>
            <span>{fmtDate(data.data_valutazione)}</span>
          </div>

          {/* Titolo */}
          <div style={{ position: "absolute", left: 56, right: 56, bottom: 200, zIndex: 1 }}>
            <div style={{ fontSize: 12, letterSpacing: "4px", textTransform: "uppercase", color: "rgba(255,255,255,0.75)", marginBottom: 16 }}>{T("copertina_sopratitolo")}</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 900, color: "#fff", lineHeight: 1.08, margin: 0, textShadow: data.copertina_img ? "0 2px 18px rgba(0,0,0,0.25)" : "none" }}>{data.titolo_valutazione || TT("copertina_titolo")}</h1>
            <div style={{ width: 60, height: 3, background: "rgba(255,255,255,0.6)", margin: "22px 0", borderRadius: 2 }} />
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: "#fff" }}>{data.indirizzo}{data.civico ? ` ${data.civico}` : ""}</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 6 }}>{[data.cap, data.citta].filter(Boolean).join(" ")}</div>
          </div>

          {/* Fascia agenzia con logo */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 150, background: "#fff", zIndex: 2, display: "flex", alignItems: "center", padding: "0 56px", gap: 32 }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: accent }} />
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center", height: 80 }}>
              {data.agenzia_logo
                ? <img src={data.agenzia_logo} alt={data.agenzia_nome || "Logo"} style={{ maxHeight: 76, maxWidth: 240, objectFit: "contain", display: "block" }} />
                : <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800, color: accent }}>{data.agenzia_nome}</div>}
            </div>
            <div style={{ width: 1, alignSelf: "stretch", margin: "38px 0", background: "#e4e6ec" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {data.agenzia_logo && data.agenzia_nome && <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: accent, marginBottom: 6 }}>{data.agenzia_nome}</div>}
              {data.agenzia_indirizzo && <div style={{ fontSize: 12, color: "#666" }}>{data.agenzia_indirizzo}</div>}
              <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>{[data.agenzia_telefono, data.agenzia_email].filter(Boolean).join("  ·  ")}</div>
            </div>
          </div>
        </div>

        {/* ══════ PAG 2 — SOMMARIO ══════ */}
        <div className="rp page-break" style={{ ...pg, padding: "48px 48px 40px" }}>
          {data.agenzia_logo && <div style={{ textAlign: "center", marginBottom: 24 }}><img src={data.agenzia_logo} alt="Logo" style={{ height: 55, borderRadius: 8 }} /></div>}
          <SH title="Indice" accent={accent} />
          <div style={{ marginTop: 20 }}>
            {indice.map(([title, subs], i) => (
              <div key={i} style={{ padding: "14px 0", borderBottom: "1px solid #f0f1f4" }}>
                <div style={{ display: "flex", alignItems: "baseline" }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: accent, fontFamily: "'Playfair Display', serif", width: 36 }}>{i + 1}.</span>
                  <span style={{ fontSize: 15, color: "#333", fontWeight: 500 }}>{title}</span>
                </div>
                {subs && subs.map((t, k) => (
                  <div key={k} style={{ display: "flex", alignItems: "baseline", marginTop: 6, paddingLeft: 36 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: accent, width: 34 }}>{i + 1}.{k + 1}</span>
                    <span style={{ fontSize: 13, color: "#666" }}>{t}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40, padding: "20px 24px", background: "#fafbfd", borderRadius: 10, border: "1px solid #eef0f4" }}>
            <div style={{ fontSize: 13, color: "#666", lineHeight: 1.7 }}>
              <strong style={{ color: accent }}>{data.tipologia}</strong> — {data.indirizzo}{data.civico ? ` ${data.civico}` : ""}, {data.cap} {data.citta}
              {data.zona && ` — ${data.zona}`}
            </div>
            <div style={{ fontSize: 12, color: "#999", marginTop: 8 }}>
              Valutazione del {fmtDate(data.data_valutazione)}{data.agente_nome ? ` · Agente: ${data.agente_nome}` : ""}
            </div>
          </div>
          <PN n={nextPage()} />
        </div>

        {/* ══════ PAG 3 — OGGETTO + MODUS OPERANDI ══════ */}
        <div className="rp page-break" style={{ ...pg, padding: "48px 48px 40px" }}>
          {/* Logo */}
          {data.agenzia_logo && <div style={{ textAlign: "center", marginBottom: 32 }}><img src={data.agenzia_logo} alt="Logo" style={{ height: 70, borderRadius: 10 }} /></div>}
          {!data.agenzia_logo && data.agenzia_nome && <div style={{ textAlign: "center", marginBottom: 32, fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: accent }}>{data.agenzia_nome}</div>}

          <SH title={TT("titolo_oggetto")} accent={accent} />
          <div style={{ background: "#fafbfd", borderRadius: 10, padding: "20px 24px", marginBottom: 32, border: "1px solid #eef0f4" }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px", color: accent, marginBottom: 6 }}>{data.tipologia}</div>
            <h2 style={{ margin: "0 0 6px", fontSize: 24, fontFamily: "'Playfair Display', serif" }}>{data.indirizzo}{data.civico ? `, ${data.civico}` : ""}</h2>
            <div style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>
              {[data.cap, data.citta].filter(Boolean).join(" ")}{data.zona && ` — Zona: ${data.zona}`}
              {data.piano && ` · Piano ${data.piano}`}{data.totale_piani && ` di ${data.totale_piani}`}
              {data.superficie_commerciale && ` · ${data.superficie_commerciale} mq`}
            </div>
            {/* Dati Catastali */}
            {(data.catasto_foglio || data.catasto_particella || data.catasto_categoria) && (
              <div style={{ fontSize: 12, color: "#888", marginTop: 8, padding: "8px 12px", background: "#f5f6f8", borderRadius: 6, display: "flex", gap: 16, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 600, color: "#666" }}>Dati catastali:</span>
                {data.catasto_mappa && <span>Mappa {data.catasto_mappa}</span>}
                {data.catasto_foglio && <span>Foglio {data.catasto_foglio}</span>}
                {data.catasto_particella && <span>Part. {data.catasto_particella}</span>}
                {data.catasto_subalterno && <span>Sub. {data.catasto_subalterno}</span>}
                {data.catasto_categoria && <span>Cat. {data.catasto_categoria}</span>}
              </div>
            )}
          </div>

          {data.agenzia_modus_operandi && (<>
            <SH title={TT("titolo_metodologia")} accent={accent} />
            <div style={{ fontSize: 13.5, lineHeight: 1.8, color: "#444", whiteSpace: "pre-line", textAlign: "justify" }}>{data.agenzia_modus_operandi}</div>
          </>)}
          <PN n={nextPage()} />
        </div>

        {/* ══════ MERCATO TRIESTE ══════ */}
        <div className="rp page-break" style={{ ...pg, padding: "48px 48px 40px" }}>
          <SH title={TT("titolo_mercato")} accent={accent} />
          <div style={{ fontSize: 13.5, lineHeight: 1.85, color: "#444", whiteSpace: "pre-line", textAlign: "justify" }}>{data.testo_mercato || "Testo mercato non generato."}</div>
          <PN n={nextPage()} />
        </div>

        {/* ══════ ZONA + SERVIZI + MAPPA ══════ */}
        <div className="rp page-break" style={{ ...pg, padding: "48px 48px 40px" }}>
          <SH title={TT("titolo_zona")} accent={accent} />
          <div style={{ fontSize: 13.5, lineHeight: 1.85, color: "#444", whiteSpace: "pre-line", textAlign: "justify", marginBottom: 24 }}>{data.testo_zona || ""}</div>
          {data.servizi_zona && (
            <div style={{ background: "#fafbfd", borderRadius: 6, padding: "10px 14px", border: "1px solid #eef0f4", marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: "#999", fontWeight: 600, textTransform: "uppercase", marginBottom: 3 }}>Servizi principali della zona</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#555", lineHeight: 1.6 }}>{data.servizi_zona}</div>
            </div>
          )}

          {/* Map image */}
          {data.mappa_img && (
            <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #e0e2e8" }}>
              <img src={data.mappa_img} alt="Posizione" style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }} />
            </div>
          )}
          <PN n={nextPage()} />
        </div>

        {/* ══════ SCHEDA (1/2) — DESCRIZIONE + EDIFICIO ══════ */}
        {(data.descrizione_manuale || buildingChars.length > 0) && (
          <div className="rp page-break" style={{ ...pg, padding: "48px 48px 40px" }}>
            {data.descrizione_manuale && (<>
              <SH title={TT("titolo_descrizione")} accent={accent} />
              <div style={{ fontSize: 13.5, lineHeight: 1.8, color: "#444", whiteSpace: "pre-line", textAlign: "justify", marginBottom: 32 }}>{data.descrizione_manuale}</div>
            </>)}
            {buildingChars.length > 0 && (<>
              <SH title={TT("titolo_edificio")} accent={accent} />
              <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #eef0f4", marginBottom: 28 }}>
                {buildingChars.map(([l, v], i) => <DR key={i} label={l} value={v} even={i % 2 === 0} />)}
              </div>
            </>)}
            <PN n={nextPage()} />
          </div>
        )}

        {/* ══════ SCHEDA (2/2) — IMMOBILE + PERTINENZE ══════ */}
        <div className="rp page-break" style={{ ...pg, padding: "48px 48px 40px" }}>
          <SH title={TT("titolo_immobile")} accent={accent} />
          <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #eef0f4", marginBottom: 28 }}>
            {propChars.map(([l, v], i) => <DR key={i} label={l} value={v} even={i % 2 === 0} />)}
          </div>

          {data.pertinenze && data.pertinenze.length > 0 && (<>
            <SH title={TT("titolo_pertinenze")} accent={accent} />
            <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #eef0f4", marginBottom: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 2fr", padding: "8px 14px", background: accent, fontSize: 10, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                <span>Tipo</span><span>Mq</span><span style={{ textAlign: "right" }}>Valore</span><span style={{ textAlign: "right" }}>Note</span>
              </div>
              {data.pertinenze.map((p, i) => (
                <div key={p.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 2fr", padding: "9px 14px", background: i % 2 === 0 ? "#fafbfd" : "#fff", borderBottom: "1px solid #f0f1f4", fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>{p.icon} {p.label}</span>
                  <span style={{ color: "#666" }}>{p.superficie ? `${p.superficie} mq` : "—"}</span>
                  <span style={{ fontWeight: 600, textAlign: "right" }}>{p.valore ? fmt(p.valore) : "—"}</span>
                  <span style={{ color: "#888", textAlign: "right", fontSize: 12 }}>{p.note || "—"}</span>
                </div>
              ))}
            </div>
          </>)}

          <PN n={nextPage()} />
        </div>

        {/* ══════ PAG FOTO (condizionale) ══════ */}
        {hasFoto && (
          <div className="rp page-break" style={{ ...pg, padding: "48px 48px 40px" }}>
            <SH title={TT("titolo_foto")} accent={accent} />
            <div style={{
              display: "grid",
              gridTemplateColumns: data.foto_immobile.length === 1 ? "1fr" : "1fr 1fr",
              gap: 14,
            }}>
              {data.foto_immobile.map((f, i) => (
                <div key={f.id || i} style={{
                  borderRadius: 8, overflow: "hidden", border: "1px solid #e0e2e8",
                  height: data.foto_immobile.length <= 2 ? 320 : data.foto_immobile.length <= 4 ? 240 : 190,
                }}>
                  <img src={f.src} alt={`Foto ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              ))}
            </div>
            <PN n={nextPage()} />
          </div>
        )}

        {/* ══════ COMPARABILI IN ZONA (condizionale) ══════ */}
        {hasComp && (
          <div className="rp page-break" style={{ ...pg, padding: "48px 48px 40px" }}>
            <SH title={TT("titolo_comparabili")} accent={accent} />
            {T("intro_comparabili") && <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7, margin: "0 0 16px", textAlign: "justify" }}>{T("intro_comparabili")}</p>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "12px 16px", borderRadius: 8, background: `${accent}0a`, border: `1.5px solid ${accent}25`, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: accent }}>Immobile valutato</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{data.tipologia} · {data.indirizzo}{data.civico ? ` ${data.civico}` : ""}{data.superficie_commerciale ? ` · ${data.superficie_commerciale} mq` : ""}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {comps.map((c, i) => {
                const cm = perMq(c.prezzo, c.mq);
                const stanze = c.stanze || c.locali;
                const chips = [c.mq && `${c.mq} mq`, stanze && `${stanze} stanze`, c.piano && `Piano ${c.piano}`, c.stato].filter(Boolean);
                return (
                  <div key={c.id || i} className="dr" style={{ display: "flex", gap: 16, border: "1px solid #e6e8ee", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
                    <div style={{ width: 210, height: 150, flexShrink: 0, background: "#eef0f4", position: "relative" }}>
                      {c.foto
                        ? <img src={c.foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#999" }}>{c.portale || "Annuncio"}</div>}
                      <span style={{ position: "absolute", top: 8, left: 8, width: 24, height: 24, borderRadius: "50%", background: accent, color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0, padding: "12px 16px 12px 0", display: "flex", flexDirection: "column", gap: 5 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#999" }}>{c.portale || "Annuncio"}</span>
                        {c.prezzo && <span style={{ fontSize: 20, fontWeight: 800, color: accent, fontFamily: "'Playfair Display', serif", whiteSpace: "nowrap" }}>{fmt(c.prezzo)}</span>}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#2a2a3e", lineHeight: 1.3 }}>{c.indirizzo || c.titolo || "—"}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {chips.map((t, k) => <span key={k} style={{ fontSize: 11, color: "#555", background: "#f3f4f7", borderRadius: 4, padding: "2px 8px" }}>{t}</span>)}
                        {cm && <span style={{ fontSize: 11, color: accent, background: `${accent}10`, borderRadius: 4, padding: "2px 8px", fontWeight: 700 }}>{cm.toLocaleString("it-IT")} €/mq</span>}
                      </div>
                      {c.differenze && <div style={{ fontSize: 12, color: "#666", fontStyle: "italic", lineHeight: 1.4 }}>{c.differenze}</div>}
                      {c.link && <a href={c.link} style={{ fontSize: 10, color: "#999", textDecoration: "none", marginTop: "auto", overflowWrap: "anywhere" }}>{shortLink(c.link)}</a>}
                    </div>
                  </div>
                );
              })}
            </div>
            <PN n={nextPage()} />
          </div>
        )}

        {/* ══════ LE NOSTRE VENDITE IN ZONA + TARGET + ACQUIRENTI (condizionale) ══════ */}
        {(hasVend || hasAcq || hasTarget) && (
          <div className="rp page-break" style={{ ...pg, padding: "48px 48px 40px" }}>
            {hasVend && (<>
              <SH title={TT("titolo_vendite")} accent={accent} />
              {T("intro_vendite") && <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7, margin: "0 0 16px" }}>{T("intro_vendite")}</p>}
              <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #eef0f4", marginBottom: 28 }}>
                <div style={{ display: "grid", gridTemplateColumns: "2.2fr 0.7fr 1.8fr 1.2fr 0.9fr 1fr", gap: 8, padding: "8px 14px", background: accent, fontSize: 10, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  <span>Indirizzo</span><span>Mq</span><span>Stato manutenzione</span><span style={{ textAlign: "right" }}>Prezzo</span><span style={{ textAlign: "right" }}>€/mq</span><span style={{ textAlign: "right" }}>Venduto</span>
                </div>
                {vendite.map((v, i) => (
                  <div key={v.id || i} className="dr" style={{ display: "grid", gridTemplateColumns: "2.2fr 0.7fr 1.8fr 1.2fr 0.9fr 1fr", gap: 8, padding: "9px 14px", background: i % 2 === 0 ? "#fafbfd" : "#fff", borderBottom: "1px solid #f0f1f4", fontSize: 12.5, alignItems: "center" }}>
                    <span style={{ fontWeight: 600 }}>{v.indirizzo || "—"}</span>
                    <span style={{ color: "#666" }}>{v.mq || "—"}</span>
                    <span style={{ color: "#666" }}>{v.condizioni || "—"}</span>
                    <span style={{ fontWeight: 700, textAlign: "right" }}>{v.prezzo ? fmt(v.prezzo) : "—"}</span>
                    <span style={{ color: accent, fontWeight: 600, textAlign: "right" }}>{perMq(v.prezzo, v.mq) ? perMq(v.prezzo, v.mq).toLocaleString("it-IT") : "—"}</span>
                    <span style={{ color: "#666", textAlign: "right" }}>{fmtMese(v.data)}</span>
                  </div>
                ))}
              </div>
            </>)}

            {hasTarget && (<>
              <SH title={TT("titolo_target")} accent={accent} />
              <div style={{ fontSize: 13.5, lineHeight: 1.8, color: "#444", whiteSpace: "pre-line", textAlign: "justify", marginBottom: 28 }}>{data.analisi_target}</div>
            </>)}

            {hasAcq && (<>
              <SH title={TT("titolo_acquirenti")} accent={accent} />
              {(() => {
                const n = Number(data.acquirenti_numero);
                const budget = data.acquirenti_budget_min && data.acquirenti_budget_max ? `Tra ${fmt(data.acquirenti_budget_min)} e ${fmt(data.acquirenti_budget_max)}` : data.acquirenti_budget_max ? `Fino a ${fmt(data.acquirenti_budget_max)}` : data.acquirenti_budget_min ? `Da ${fmt(data.acquirenti_budget_min)}` : "";
                const righe = [budget && ["Budget", budget], data.acquirenti_nota && ["Cosa cercano", data.acquirenti_nota]].filter(Boolean);
                const frase = n === 1 && tx.frase_acquirenti === REPORT_TEXT_DEFAULTS.frase_acquirenti ? "Nel nostro archivio clienti c'è già un acquirente che cerca un immobile con queste caratteristiche." : T("frase_acquirenti");
                return (
                  <div className="dr" style={{ display: "flex", alignItems: "stretch", border: "1px solid #e6e8ee", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
                    <div style={{ width: 150, flexShrink: 0, background: `${accent}08`, borderRight: `1px solid ${accent}22`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 12px" }}>
                      <div style={{ fontSize: 48, fontWeight: 800, color: accent, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{data.acquirenti_numero}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: accent, marginTop: 10 }}>{n === 1 ? "Acquirente" : "Acquirenti"}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0, padding: "16px 20px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      {frase && <div style={{ fontSize: 14, fontWeight: 600, color: "#2a2a3e", lineHeight: 1.55, marginBottom: righe.length ? 12 : 0 }}>{frase}</div>}
                      {righe.map(([l, v], i) => (
                        <div key={i} style={{ display: "flex", gap: 14, padding: "7px 0", borderTop: "1px solid #f0f1f4", fontSize: 12.5 }}>
                          <span style={{ width: 92, flexShrink: 0, fontSize: 9, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#999", paddingTop: 2 }}>{l}</span>
                          <span style={{ color: "#444", lineHeight: 1.5 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              {T("nota_acquirenti") && <p style={{ fontSize: 12, color: "#888", lineHeight: 1.6, margin: "10px 0 0" }}>{T("nota_acquirenti")}</p>}
            </>)}
            <PN n={nextPage()} />
          </div>
        )}

        {/* ══════ PAG VALUTAZIONE + DATI AGENZIA ══════ */}
        <div className="rp page-break" style={{ ...pg, padding: "48px 48px 40px" }}>
          <SH title={TT("titolo_valutazione")} accent={accent} />
          {T("intro_valutazione") && <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 24px", textAlign: "center" }}>{T("intro_valutazione")}</p>}

          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
            {data.valore_min && (
              <div style={{ background: "#fafbfd", borderRadius: 12, padding: "20px 26px", textAlign: "center", border: "1.5px solid #e8eaf0", flex: 1, minWidth: 150 }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#999", marginBottom: 8 }}>Minimo</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#555", fontFamily: "'Playfair Display', serif" }}>{fmt(data.valore_min)}</div>
                {data.superficie_commerciale && <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>{Math.round(Number(data.valore_min) / Number(data.superficie_commerciale)).toLocaleString("it-IT")} €/mq</div>}
              </div>
            )}
            {data.valore_medio && (
              <div style={{ background: `${accent}08`, borderRadius: 12, padding: "24px 30px", textAlign: "center", border: `2px solid ${accent}30`, flex: 1.2, minWidth: 180 }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: accent, marginBottom: 8 }}>Valore Stimato</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: accent, fontFamily: "'Playfair Display', serif", lineHeight: 1.1 }}>{fmt(data.valore_medio)}</div>
                {data.superficie_commerciale && <div style={{ fontSize: 12, color: accent, marginTop: 8, fontWeight: 600 }}>{Math.round(Number(data.valore_medio) / Number(data.superficie_commerciale)).toLocaleString("it-IT")} €/mq</div>}
              </div>
            )}
            {data.valore_max && (
              <div style={{ background: "#fafbfd", borderRadius: 12, padding: "20px 26px", textAlign: "center", border: "1.5px solid #e8eaf0", flex: 1, minWidth: 150 }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#999", marginBottom: 8 }}>Massimo</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#555", fontFamily: "'Playfair Display', serif" }}>{fmt(data.valore_max)}</div>
                {data.superficie_commerciale && <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>{Math.round(Number(data.valore_max) / Number(data.superficie_commerciale)).toLocaleString("it-IT")} €/mq</div>}
              </div>
            )}
          </div>

          {/* Prezzo consigliato di pubblicità */}
          {data.prezzo_pubblicita && (
            <div style={{ background: "linear-gradient(135deg, #f0faf4, #e8f5ed)", borderRadius: 12, padding: "20px 26px", textAlign: "center", border: "2px solid #b8e6cc", marginBottom: 24 }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#6b9f7e", marginBottom: 8 }}>Prezzo Consigliato di Pubblicità</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#2e7d32", fontFamily: "'Playfair Display', serif", lineHeight: 1.1 }}>{fmt(data.prezzo_pubblicita)}</div>
              {data.superficie_commerciale && <div style={{ fontSize: 12, color: "#6b9f7e", marginTop: 8, fontWeight: 600 }}>{Math.round(Number(data.prezzo_pubblicita) / Number(data.superficie_commerciale)).toLocaleString("it-IT")} €/mq</div>}
              {T("spiegazione_prezzo_pubblicita") && <div style={{ fontSize: 10, color: "#999", lineHeight: 1.5, maxWidth: 450, margin: "10px auto 0" }}>{T("spiegazione_prezzo_pubblicita")}</div>}
            </div>
          )}

          {/* Pertinenze riepilogo */}
          {data.pertinenze && data.pertinenze.length > 0 && totalPert > 0 && (
            <div style={{ background: "#fafbfd", borderRadius: 10, padding: "16px 20px", border: "1px solid #eef0f4", marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#999", marginBottom: 10 }}>Riepilogo con pertinenze</div>
              {data.pertinenze.filter(p => p.valore).map(p => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12, color: "#666", borderBottom: "1px solid #f0f0f0" }}>
                  <span>{p.icon} {p.label}</span><span style={{ fontWeight: 600 }}>{fmt(p.valore)}</span>
                </div>
              ))}
              <div style={{ borderTop: `2px solid ${accent}20`, marginTop: 8, paddingTop: 10 }}>
                {data.valore_medio && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, color: accent, fontWeight: 700 }}>
                  <span>Totale complessivo</span><span style={{ fontSize: 18, fontFamily: "'Playfair Display', serif" }}>{fmt(Number(data.valore_medio) + totalPert)}</span>
                </div>}
              </div>
            </div>
          )}

          {data.note_valutazione && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#999", marginBottom: 6 }}>Note</div>
              <div style={{ fontSize: 12, lineHeight: 1.7, color: "#666", fontStyle: "italic", whiteSpace: "pre-line" }}>{data.note_valutazione}</div>
            </div>
          )}

          {/* Firma */}
          <div style={{ marginTop: 36, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>Data</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{fmtDate(data.data_valutazione)}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 180, borderBottom: "1px solid #ccc", marginBottom: 6, height: 36 }} />
              <div style={{ fontSize: 11, color: "#999" }}>Firma</div>
              {data.agente_nome && <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{data.agente_nome}</div>}
              {(data.agente_telefono || data.agente_email) && <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>{[data.agente_telefono, data.agente_email].filter(Boolean).join(" · ")}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>Timbro</div>
              <div style={{ width: 70, height: 70, border: "1.5px dashed #ddd", borderRadius: 6 }} />
            </div>
          </div>

          {/* Agenzia */}
          <div style={{ marginTop: 32, padding: "16px 20px", background: "#fafbfd", borderRadius: 8, border: "1px solid #eef0f4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: accent, fontFamily: "'Playfair Display', serif" }}>{data.agenzia_nome}</div>
              {data.agenzia_indirizzo && <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{data.agenzia_indirizzo}</div>}
            </div>
            <div style={{ textAlign: "right", fontSize: 12, color: "#888" }}>
              {data.agenzia_telefono && <div>{data.agenzia_telefono}</div>}
              {data.agenzia_email && <div>{data.agenzia_email}</div>}
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ marginTop: 20, padding: "12px 16px", fontSize: 9, color: "#bbb", lineHeight: 1.6, borderTop: "1px solid #f0f0f0" }}>
            {T("avvertenza_legale")} {data.agenzia_nome && `© ${new Date().getFullYear()} ${data.agenzia_nome}.`} Tutti i diritti riservati.
          </div>
          <PN n={nextPage()} />
        </div>

      </div>
    </div>
  );
}
