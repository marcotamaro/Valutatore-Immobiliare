import { useState, useEffect } from "react";

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

const DEMO = {
  agenzia_nome: "TAM Immobiliare", agenzia_indirizzo: "Via Mazzini 14, 34121 Trieste",
  agenzia_telefono: "+39 040 555 1234", agenzia_email: "info@tamimmobiliare.it",
  agenzia_colore: "#1a3a5c", agenzia_logo: null, copertina_img: null,
  titolo_valutazione: "Valutazione Immobiliare",
  agenzia_modus_operandi: "La presente valutazione è stata elaborata utilizzando il metodo comparativo di mercato (Market Comparison Approach), analizzando le compravendite recenti di immobili con caratteristiche analoghe nella medesima zona.\n\nSono stati considerati: ubicazione e contesto urbano, stato di conservazione, superficie commerciale e distribuzione degli spazi, piano, esposizione, luminosità e vista, pertinenze e spazi accessori, classe energetica, andamento del mercato locale e quotazioni OMI dell'Agenzia delle Entrate.",
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
  valore_min: "280000", valore_medio: "310000", valore_max: "340000",
  note_valutazione: "Valutazione basata su comparabili di zona.",
  descrizione_manuale: "Splendido appartamento di 95 mq commerciali al terzo piano di un elegante palazzo d'epoca nel Centro Storico di Trieste. Completamente ristrutturato, si compone di ingresso, ampio soggiorno, cucina abitabile, due camere e bagno finestrato. Due balconi per 12 mq totali.",
  testo_mercato: "Il mercato immobiliare triestino presenta caratteristiche peculiari legate alla posizione geografica di confine e ad un tessuto urbano prevalentemente storico. Trieste ha registrato un crescente interesse da parte di acquirenti internazionali, attratti dalla qualità della vita e da quotazioni competitive.\n\nIl comparto residenziale mostra domanda sostenuta nelle zone centrali, con particolare interesse per immobili ristrutturati. I tempi medi di vendita si attestano tra 3 e 6 mesi.",
  testo_zona: "L'immobile è ubicato nel Centro Storico di Trieste, zona B2 OMI con quotazioni tra 1.650 e 2.650 €/mq. Il prezzo medio richiesto è di circa 3.388 €/mq con crescita annua superiore al 14%.",
  pertinenze: [{ id: 1, tipo: "cantina", label: "Cantina", icon: "🏚️", superficie: "8", valore: "12000", note: "Piano -1" }],
  data_valutazione: "2026-04-09",
};

// Market data by zone
const MARKET_DATA = {
  "Centro Storico": { min: 1650, max: 2650, media: 2150, trend: "+14,7%", transazioni: "Alto", zona_omi: "B2", annunci: "~195", densita: "Alta", eta_media: "49", servizi: "Scuole di ogni ordine, ospedale Maggiore, teatro Verdi, tutti i servizi commerciali, 8+ linee bus", distanza_mare: "Sul mare" },
  "Borgo Teresiano": { min: 1450, max: 2350, media: 1900, trend: "+8,5%", transazioni: "Alto", zona_omi: "B1", annunci: "~180", densita: "Alta", eta_media: "48", servizi: "Stazione FS, Canal Grande, scuole, supermercati, ottimi collegamenti bus", distanza_mare: "200m" },
  "Borgo Giuseppino": { min: 1500, max: 2500, media: 2000, trend: "+7,2%", transazioni: "Medio-alto", zona_omi: "B1/B2", annunci: "~90", densita: "Alta", eta_media: "50", servizi: "Cattedrale, Castello, Museo Civico, scuole, negozi artigianali", distanza_mare: "400m" },
  "San Vito": { min: 1350, max: 2200, media: 1775, trend: "+6,8%", transazioni: "Medio", zona_omi: "B2/C1", annunci: "~110", densita: "Media", eta_media: "51", servizi: "Porto Vecchio, scuole primarie, negozi, bus verso centro", distanza_mare: "300m" },
  "Città Vecchia": { min: 1650, max: 2650, media: 2150, trend: "+12,3%", transazioni: "Medio-alto", zona_omi: "B2", annunci: "~195", densita: "Alta", eta_media: "47", servizi: "Teatro Romano, gallerie, ristoranti, vita notturna, tutti i servizi centrali", distanza_mare: "200m" },
  "Cavana": { min: 1650, max: 2650, media: 2150, trend: "+10,5%", transazioni: "Medio", zona_omi: "B2", annunci: "~80", densita: "Alta", eta_media: "46", servizi: "Molo Audace, Porto Vecchio in riqualificazione, locali, ristoranti", distanza_mare: "100m" },
  "Barcola": { min: 1800, max: 3200, media: 2500, trend: "+9,8%", transazioni: "Medio-alto", zona_omi: "D3", annunci: "~70", densita: "Media", eta_media: "50", servizi: "Passeggiata lungomare, Castello Miramare, Riserva Naturale, piste ciclabili, scuole", distanza_mare: "Sul mare" },
  "San Giacomo": { min: 1210, max: 1800, media: 1505, trend: "+5,2%", transazioni: "Alto", zona_omi: "C2", annunci: "~260", densita: "Alta", eta_media: "46", servizi: "Mercato rionale, scuole di ogni ordine, supermercati, ambulatori, 5+ linee bus", distanza_mare: "1,5 km" },
  "Roiano": { min: 1400, max: 2400, media: 1900, trend: "+6,5%", transazioni: "Medio", zona_omi: "C4/D3", annunci: "~85", densita: "Media", eta_media: "52", servizi: "Villa Giulia, scuole, negozi vicinato, bus verso centro e Barcola", distanza_mare: "800m" },
  "Gretta": { min: 1300, max: 2400, media: 1850, trend: "+7,1%", transazioni: "Medio", zona_omi: "D3", annunci: "~65", densita: "Media", eta_media: "51", servizi: "Strada costiera, scuole, supermercati, collegamento diretto Barcola", distanza_mare: "500m" },
  "Scorcola": { min: 1500, max: 2600, media: 2050, trend: "+6,0%", transazioni: "Medio", zona_omi: "C5", annunci: "~45", densita: "Bassa", eta_media: "53", servizi: "Vista panoramica, scuole, verde, parcheggi, bus verso centro", distanza_mare: "1,2 km" },
  "Chiadino": { min: 1300, max: 2100, media: 1700, trend: "+5,5%", transazioni: "Medio", zona_omi: "C3/C4", annunci: "~55", densita: "Media", eta_media: "52", servizi: "Scuole, negozi vicinato, aree verdi, bus, accesso Carso", distanza_mare: "2 km" },
  "Barriera Nuova": { min: 1350, max: 2200, media: 1775, trend: "+6,2%", transazioni: "Medio", zona_omi: "B1/C1", annunci: "~75", densita: "Alta", eta_media: "48", servizi: "Semicentrale, scuole, supermercati, uffici postali, 4+ linee bus", distanza_mare: "800m" },
  "Barriera Vecchia": { min: 1250, max: 2000, media: 1625, trend: "+7,8%", transazioni: "Medio", zona_omi: "C1", annunci: "~95", densita: "Alta", eta_media: "44", servizi: "Stazione FS vicina, mercato multietnico, negozi, scuole, bus", distanza_mare: "1 km" },
  "Ponziana": { min: 1200, max: 1900, media: 1550, trend: "+5,0%", transazioni: "Medio", zona_omi: "C1/C2", annunci: "~70", densita: "Media", eta_media: "47", servizi: "Scuole, ambulatori, supermercati, bus verso centro", distanza_mare: "2 km" },
  "Rozzol": { min: 1100, max: 1700, media: 1400, trend: "+4,2%", transazioni: "Medio-basso", zona_omi: "C3/D1", annunci: "~40", densita: "Media", eta_media: "50", servizi: "Scuole, verde, parcheggi, bus, posizione collinare", distanza_mare: "2,5 km" },
  "San Giovanni": { min: 1100, max: 1800, media: 1450, trend: "+4,8%", transazioni: "Medio", zona_omi: "C2/D1", annunci: "~60", densita: "Media", eta_media: "46", servizi: "Parco San Giovanni, Università, ospedale, scuole, bus", distanza_mare: "3 km" },
  "Cologna": { min: 1100, max: 1700, media: 1400, trend: "+4,5%", transazioni: "Medio", zona_omi: "C2/D1", annunci: "~75", densita: "Media", eta_media: "48", servizi: "Scuole, supermercati, ambulatorio, bus verso centro", distanza_mare: "2,5 km" },
  "Servola": { min: 1210, max: 1800, media: 1505, trend: "+3,8%", transazioni: "Medio-basso", zona_omi: "C2", annunci: "~89", densita: "Media", eta_media: "49", servizi: "Scuole, negozi, bus, area portuale in riqualificazione", distanza_mare: "500m" },
  "Muggia": { min: 1300, max: 2200, media: 1750, trend: "+5,5%", transazioni: "Medio", zona_omi: "E1", annunci: "~50", densita: "Media", eta_media: "48", servizi: "Centro storico, porto turistico, spiagge, scuole, tutti i servizi", distanza_mare: "Sul mare" },
  "Opicina": { min: 1200, max: 2000, media: 1600, trend: "+4,0%", transazioni: "Basso", zona_omi: "D2/R1", annunci: "~35", densita: "Bassa", eta_media: "52", servizi: "Tram Opcina, osmize, Strada Napoleonica, scuole, verde Carso", distanza_mare: "5 km (panorama)" },
  "Basovizza": { min: 1000, max: 1800, media: 1400, trend: "+3,5%", transazioni: "Basso", zona_omi: "R1", annunci: "~15", densita: "Bassa", eta_media: "50", servizi: "Sincrotrone Elettra, ICTP, sentieri Carso, scuole primarie", distanza_mare: "8 km" },
  "Prosecco": { min: 900, max: 1600, media: 1250, trend: "+3,0%", transazioni: "Basso", zona_omi: "R1/E3", annunci: "~10", densita: "Bassa", eta_media: "51", servizi: "Osmize, sentieri, Val Rosandra vicina, bus, scuola primaria", distanza_mare: "4 km (panorama)" },
};

/* ══════ Shared components ══════ */
const SH = ({ title, accent }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: accent }}>{title}</div>
    <div style={{ width: 50, height: 2.5, background: accent, marginTop: 6, borderRadius: 2 }} />
  </div>
);

const DR = ({ label, value, even }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px", background: even ? "#fafbfd" : "#fff", borderBottom: "1px solid #f0f1f4", fontSize: 13 }}>
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
  const md = MARKET_DATA[data.zona] || null;

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
  ].filter(Boolean);

  const propChars = [
    data.superficie_commerciale && ["Superficie commerciale interna", `${data.superficie_commerciale} mq`],
    data.locali && ["Locali", data.locali],
    data.camere && ["Camere da letto", data.camere],
    data.bagni && ["Bagni", data.bagni],
    showField(data.livelli_immobile) && ["Livelli", data.livelli_immobile],
    data.piano && ["Piano", data.totale_piani ? `${data.piano} di ${data.totale_piani}` : data.piano],
    showField(data.altri_vani) && ["Vani collegati", `${data.altri_vani}${data.altri_vani_mq ? ` — ${data.altri_vani_mq} mq` : ""}`],
    data.balconi && Number(data.balconi) > 0 && ["Balconi", `${data.balconi}${data.balconi_mq ? ` — ${data.balconi_mq} mq` : ""}`],
    data.terrazzi && Number(data.terrazzi) > 0 && ["Terrazzi", `${data.terrazzi}${data.terrazzi_mq ? ` — ${data.terrazzi_mq} mq` : ""}`],
    data.verande && Number(data.verande) > 0 && ["Verande", `${data.verande}${data.verande_mq ? ` — ${data.verande_mq} mq` : ""}`],
    data.giardino && Number(data.giardino) > 0 && ["Giardino", `${data.giardino}${data.giardino_mq ? ` — ${data.giardino_mq} mq` : ""}`],
    showField(data.stato_conservazione) && ["Stato conservazione", data.stato_conservazione],
    showField(data.classe_energetica) && ["Classe energetica", data.classe_energetica],
    showField(data.riscaldamento) && ["Riscaldamento", data.riscaldamento],
    showField(data.tipologia_riscaldamento) && ["Tipo riscaldamento", data.tipologia_riscaldamento],
    showField(data.imp_elettrico) && ["Imp. elettrico", data.imp_elettrico],
    showField(data.imp_acqua_calda) && ["Imp. acqua calda", data.imp_acqua_calda],
    showField(data.imp_gas) && ["Imp. gas", data.imp_gas],
    showField(data.vista) && ["Vista", data.vista],
    showField(data.luminosita) && ["Luminosità", data.luminosita],
    data.esposizione && ["Esposizione", data.esposizione],
    data.aria_condizionata && ["Aria condizionata", "Presente"],
    data.pannelli_fotovoltaici && ["Pannelli fotovoltaici", "Presenti"],
    data.cappotto && ["Cappotto", "Presente"],
    data.caminetto && ["Caminetto", "Presente"],
  ].filter(Boolean);

  const pg = { maxWidth: 794, minHeight: 1123, margin: "0 auto 24px", background: "#fff", borderRadius: 4, boxShadow: "0 2px 16px rgba(0,0,0,0.08)", overflow: "hidden", position: "relative" };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#e8eaee", minHeight: "100vh", color: "#1a1a2e" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
      <style>{`
        @media print { body,html{background:#fff!important} .no-print{display:none!important} .rp{box-shadow:none!important;margin:0!important;border-radius:0!important;min-height:auto!important} .page-break{break-before:page} @page{margin:0;size:A4 portrait} }
      `}</style>

      {/* Top bar */}
      <div className="no-print" style={{ background: "#fff", borderBottom: "1px solid #ddd", padding: "8px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={goBack} style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid #d8dce6", background: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans'", fontWeight: 600 }}>← Indietro</button>
        <button onClick={() => window.print()} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: accent, color: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans'", fontWeight: 600 }}>🖨️ Stampa / PDF</button>
      </div>

      <div style={{ padding: "20px 16px 40px" }}>

        {/* ══════ PAG 1 — COPERTINA ══════ */}
        <div className="rp" style={{ ...pg, minHeight: 1123, display: "flex", flexDirection: "column" }}>
          {data.copertina_img ? (
            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              <img src={data.copertina_img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }} />
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.6) 100%)" }} />
              <div style={{ position: "absolute", bottom: 60, left: 48, right: 48, zIndex: 1 }}>
                <div style={{ fontSize: 12, letterSpacing: "4px", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>RELAZIONE DI</div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 46, fontWeight: 900, color: "#fff", lineHeight: 1.1, margin: 0 }}>{data.titolo_valutazione || "Valutazione Immobiliare"}</h1>
                <div style={{ width: 60, height: 3, background: "rgba(255,255,255,0.5)", margin: "20px 0", borderRadius: 2 }} />
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "rgba(255,255,255,0.9)" }}>{data.indirizzo}{data.civico ? ` ${data.civico}` : ""} — Trieste</div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, background: `linear-gradient(155deg, ${accent} 0%, ${accent}dd 60%, ${accent}99 100%)`, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 48px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
              <div style={{ position: "absolute", bottom: -100, left: -60, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: 12, letterSpacing: "4px", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>RELAZIONE DI</div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 46, fontWeight: 900, color: "#fff", lineHeight: 1.1, margin: "0 0 20px" }}>{data.titolo_valutazione || "Valutazione Immobiliare"}</h1>
                <div style={{ width: 60, height: 3, background: "rgba(255,255,255,0.4)", marginBottom: 20, borderRadius: 2 }} />
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: "rgba(255,255,255,0.85)" }}>{data.indirizzo}{data.civico ? ` ${data.civico}` : ""}</div>
                <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>{data.cap} {data.citta}{data.zona && ` — ${data.zona}`}</div>
              </div>
            </div>
          )}
        </div>

        {/* ══════ PAG 2 — LOGO + INDIRIZZO + MODUS OPERANDI ══════ */}
        <div className="rp page-break" style={{ ...pg, padding: "48px 48px 40px" }}>
          {/* Logo */}
          {data.agenzia_logo && <div style={{ textAlign: "center", marginBottom: 32 }}><img src={data.agenzia_logo} alt="Logo" style={{ height: 70, borderRadius: 10 }} /></div>}
          {!data.agenzia_logo && data.agenzia_nome && <div style={{ textAlign: "center", marginBottom: 32, fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: accent }}>{data.agenzia_nome}</div>}

          <SH title="Oggetto della Valutazione" accent={accent} />
          <div style={{ background: "#fafbfd", borderRadius: 10, padding: "20px 24px", marginBottom: 32, border: "1px solid #eef0f4" }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px", color: accent, marginBottom: 6 }}>{data.tipologia}</div>
            <h2 style={{ margin: "0 0 6px", fontSize: 24, fontFamily: "'Playfair Display', serif" }}>{data.indirizzo}{data.civico ? `, ${data.civico}` : ""}</h2>
            <div style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>
              {[data.cap, data.citta].filter(Boolean).join(" ")}{data.zona && ` — Zona: ${data.zona}`}
              {data.piano && ` · Piano ${data.piano}`}{data.totale_piani && ` di ${data.totale_piani}`}
              {data.superficie_commerciale && ` · ${data.superficie_commerciale} mq`}
            </div>
            {/* Dati Catastali */}
            {(data.catasto_foglio || data.catasto_particella) && (
              <div style={{ fontSize: 12, color: "#888", marginTop: 8, padding: "8px 12px", background: "#f5f6f8", borderRadius: 6, display: "flex", gap: 16, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 600, color: "#666" }}>Dati catastali:</span>
                {data.catasto_mappa && <span>Mappa {data.catasto_mappa}</span>}
                {data.catasto_foglio && <span>Foglio {data.catasto_foglio}</span>}
                {data.catasto_particella && <span>Part. {data.catasto_particella}</span>}
                {data.catasto_subalterno && <span>Sub. {data.catasto_subalterno}</span>}
              </div>
            )}
          </div>

          {data.agenzia_modus_operandi && (<>
            <SH title="Metodologia e Criteri di Valutazione" accent={accent} />
            <div style={{ fontSize: 13.5, lineHeight: 1.8, color: "#444", whiteSpace: "pre-line", textAlign: "justify" }}>{data.agenzia_modus_operandi}</div>
          </>)}
          <PN n={2} />
        </div>

        {/* ══════ PAG 3 — MERCATO TRIESTE ══════ */}
        <div className="rp page-break" style={{ ...pg, padding: "48px 48px 40px" }}>
          <SH title="Il Mercato Immobiliare a Trieste" accent={accent} />
          <div style={{ fontSize: 13.5, lineHeight: 1.85, color: "#444", whiteSpace: "pre-line", textAlign: "justify" }}>{data.testo_mercato || "Testo mercato non generato."}</div>
          <PN n={3} />
        </div>

        {/* ══════ PAG 4 — ZONA + DATI OMI + MAPPA ══════ */}
        <div className="rp page-break" style={{ ...pg, padding: "48px 48px 40px" }}>
          <SH title={`Analisi della Zona: ${data.zona || "—"}`} accent={accent} />
          <div style={{ fontSize: 13.5, lineHeight: 1.85, color: "#444", whiteSpace: "pre-line", textAlign: "justify", marginBottom: 24 }}>{data.testo_zona || ""}</div>

          {md && (<>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: accent, marginBottom: 14 }}>Quotazioni di Riferimento — {data.zona}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div style={{ background: "#fafbfd", borderRadius: 8, padding: "14px 16px", textAlign: "center", border: "1px solid #eef0f4" }}>
                <div style={{ fontSize: 10, color: "#999", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Min €/mq</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#555", fontFamily: "'Playfair Display', serif" }}>{md.min.toLocaleString("it-IT")}</div>
              </div>
              <div style={{ background: `${accent}0a`, borderRadius: 8, padding: "14px 16px", textAlign: "center", border: `1.5px solid ${accent}25` }}>
                <div style={{ fontSize: 10, color: accent, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Media €/mq</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: accent, fontFamily: "'Playfair Display', serif" }}>{md.media.toLocaleString("it-IT")}</div>
              </div>
              <div style={{ background: "#fafbfd", borderRadius: 8, padding: "14px 16px", textAlign: "center", border: "1px solid #eef0f4" }}>
                <div style={{ fontSize: 10, color: "#999", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Max €/mq</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#555", fontFamily: "'Playfair Display', serif" }}>{md.max.toLocaleString("it-IT")}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[["Trend annuale", md.trend, "#2e7d32"], ["Volume transazioni", md.transazioni, "#333"], ["Zona OMI", md.zona_omi, "#333"]].map(([l, v, c], i) => (
                <div key={i} style={{ background: "#fafbfd", borderRadius: 6, padding: "8px 12px", border: "1px solid #eef0f4" }}>
                  <div style={{ fontSize: 9, color: "#999", fontWeight: 600, textTransform: "uppercase" }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: c, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Dati demografici e servizi */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[["Densità abitativa", md.densita, "#333"], ["Età media residenti", md.eta_media + " anni", "#333"], ["Annunci attivi", md.annunci, accent]].map(([l, v, c], i) => (
                <div key={i} style={{ background: "#fafbfd", borderRadius: 6, padding: "8px 12px", border: "1px solid #eef0f4" }}>
                  <div style={{ fontSize: 9, color: "#999", fontWeight: 600, textTransform: "uppercase" }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: c, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
            {data.servizi_zona && (
              <div style={{ background: "#fafbfd", borderRadius: 6, padding: "10px 14px", border: "1px solid #eef0f4", marginBottom: 8 }}>
                <div style={{ fontSize: 9, color: "#999", fontWeight: 600, textTransform: "uppercase", marginBottom: 3 }}>Servizi principali della zona</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#555", lineHeight: 1.6 }}>{data.servizi_zona}</div>
              </div>
            )}

            <div style={{ fontSize: 9, color: "#bbb", fontStyle: "italic", marginBottom: 16 }}>Fonti: OMI — Agenzia delle Entrate; Immobiliare.it; ISTAT; Comune di Trieste. Valori indicativi, elaborazioni su dati ufficiali.</div>
          </>)}

          {/* Map image */}
          {data.mappa_img && (
            <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #e0e2e8" }}>
              <img src={data.mappa_img} alt="Posizione" style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }} />
            </div>
          )}
          <PN n={4} />
        </div>

        {/* ══════ PAG 5 — EDIFICIO + IMMOBILE + PERTINENZE ══════ */}
        <div className="rp page-break" style={{ ...pg, padding: "48px 48px 40px" }}>
          {buildingChars.length > 0 && (<>
            <SH title="Caratteristiche dell'Edificio" accent={accent} />
            <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #eef0f4", marginBottom: 28 }}>
              {buildingChars.map(([l, v], i) => <DR key={i} label={l} value={v} even={i % 2 === 0} />)}
            </div>
          </>)}

          <SH title="Caratteristiche dell'Immobile" accent={accent} />
          <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #eef0f4", marginBottom: 28 }}>
            {propChars.map(([l, v], i) => <DR key={i} label={l} value={v} even={i % 2 === 0} />)}
          </div>

          {data.pertinenze && data.pertinenze.length > 0 && (<>
            <SH title="Pertinenze" accent={accent} />
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

          {data.descrizione_manuale && (<>
            <SH title="Descrizione" accent={accent} />
            <div style={{ fontSize: 13.5, lineHeight: 1.8, color: "#444", whiteSpace: "pre-line", textAlign: "justify" }}>{data.descrizione_manuale}</div>
          </>)}
          <PN n={5} />
        </div>

        {/* ══════ PAG 6 — VALUTAZIONE + DATI AGENZIA ══════ */}
        <div className="rp page-break" style={{ ...pg, padding: "48px 48px 40px" }}>
          <SH title="Valutazione Economica" accent={accent} />
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 24px", textAlign: "center" }}>
            Sulla base dell'analisi effettuata, considerando le caratteristiche dell'immobile, la sua ubicazione, lo stato di conservazione e l'andamento del mercato, si esprime la seguente valutazione:
          </p>

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
            La presente relazione ha carattere indicativo e non costituisce perizia estimativa ai sensi di legge. I valori rappresentano una stima del più probabile prezzo di mercato sulla base delle informazioni disponibili. {data.agenzia_nome && `© ${new Date().getFullYear()} ${data.agenzia_nome}.`} Tutti i diritti riservati.
          </div>
          <PN n={6} />
        </div>

      </div>
    </div>
  );
}
