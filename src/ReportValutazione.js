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
  agenzia_colore: "#1a3a5c", agenzia_logo: null,
  agenzia_modus_operandi: "La presente valutazione è stata elaborata utilizzando il metodo comparativo di mercato (Market Comparison Approach), che consiste nell'analisi delle compravendite recenti di immobili con caratteristiche analoghe nella medesima zona o in zone limitrofe.\n\nSono stati considerati i seguenti fattori:\n• Ubicazione e contesto urbano dell'immobile\n• Stato di conservazione e qualità delle finiture\n• Superficie commerciale e distribuzione degli spazi\n• Piano, esposizione, luminosità e vista\n• Presenza di pertinenze e spazi accessori\n• Classe energetica e tipologia impiantistica\n• Andamento del mercato immobiliare locale\n• Quotazioni OMI dell'Agenzia delle Entrate\n\nI valori espressi rappresentano una stima del più probabile prezzo di mercato dell'immobile nelle attuali condizioni.",
  tipologia: "Appartamento", indirizzo: "Via Carducci", civico: "22", cap: "34100",
  citta: "Trieste", zona: "Centro Storico", piano: "3", totale_piani: "5", interno: "7",
  mappa_img: null,
  superficie_commerciale: "95", locali: "4", camere: "2", bagni: "1",
  balconi: "2", balconi_mq: "12", terrazzi: "", terrazzi_mq: "",
  giardino: "", giardino_mq: "",
  stato_conservazione: "Ristrutturato ultimi 5 anni", anno_costruzione: "1928",
  classe_energetica: "D", riscaldamento: "Autonomo", tipologia_riscaldamento: "Caloriferi",
  vista: "Molto bella", luminosita: "Molto luminoso", esposizione: "Sud-Est",
  condizioni_facciate: "Buone", tipologia_edificio: "Signorile",
  condizioni_tetto: "Buono", condizioni_atrio: "Ottimo", spese_condominiali: "1800",
  facilita_accesso: "Molto comodo",
  imp_elettrico: "Certificato", imp_acqua_calda: "Autonoma caldaia", cappotto: false,
  ascensore: true, aria_condizionata: false, pannelli_fotovoltaici: false, senza_barriere: false,
  valore_min: "280000", valore_medio: "310000", valore_max: "340000",
  note_valutazione: "Valutazione basata su comparabili di zona. L'immobile beneficia di una posizione centrale, ottima esposizione e recente ristrutturazione che ne valorizzano il prezzo al mq rispetto alla media di zona.",
  descrizione_manuale: "Splendido appartamento di 95 mq commerciali situato al terzo piano di un elegante palazzo d'epoca nel cuore del Centro Storico di Trieste. L'immobile, completamente ristrutturato negli ultimi 5 anni, si compone di ingresso, ampio soggiorno con doppia esposizione, cucina abitabile, due camere da letto e bagno finestrato.\n\nCompletano la proprietà due balconi per un totale di 12 mq con affaccio sulla via. Riscaldamento autonomo con caloriferi, classe energetica D.\n\nEdificio signorile con facciate in buone condizioni e ascensore. Posizione centrale a pochi passi da Piazza Unità d'Italia, con tutti i servizi nelle immediate vicinanze.",
  pertinenze: [
    { id: 1, tipo: "cantina", label: "Cantina", icon: "🏚️", superficie: "8", valore: "12000", note: "Piano -1, buono stato" },
  ],
  data_valutazione: "2026-04-07", agente_nome: "Marco Bianchi",
};

/* ═══════════════ SHARED COMPONENTS ═══════════════ */

const PageNum = ({ n, accent }) => (
  <div style={{ textAlign: "center", padding: "16px 0 0", fontSize: 11, color: "#bbb" }}>— {n} —</div>
);

const SectionHead = ({ title, accent }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: accent }}>{title}</div>
    <div style={{ width: 50, height: 2.5, background: accent, marginTop: 8, borderRadius: 2 }} />
  </div>
);

const DetailRow = ({ label, value, accent, even }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: even ? "#fafbfd" : "#fff", borderBottom: "1px solid #f0f1f4", fontSize: 13.5 }}>
    <span style={{ color: "#777", fontWeight: 500 }}>{label}</span>
    <span style={{ fontWeight: 600, color: "#2a2a3e", textAlign: "right" }}>{value}</span>
  </div>
);

/* ═══════════════ MAIN REPORT ═══════════════ */

export default function ReportValutazione() {
  const [data, setData] = useState(null);
  const [list, setList] = useState([]);
  const [showSelector, setShowSelector] = useState(true);
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("valutazioni_list");
        if (res && res.value) setList(JSON.parse(res.value));
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  // Fetch market data when data loads
  useEffect(() => {
    if (!data || !data.zona) return;
    // Static market data for Trieste zones (based on OMI and public sources)
    const zoneData = {
      "Centro Storico": { min: 1500, max: 2800, media: 2150, trend: "+2,1%", transazioni: "Alto", zona_omi: "B1" },
      "Borgo Giuseppino": { min: 1600, max: 2900, media: 2250, trend: "+1,8%", transazioni: "Alto", zona_omi: "B1" },
      "Borgo Teresiano": { min: 1700, max: 3200, media: 2400, trend: "+2,5%", transazioni: "Medio-alto", zona_omi: "B1" },
      "San Vito": { min: 1400, max: 2600, media: 2000, trend: "+1,5%", transazioni: "Medio", zona_omi: "B2" },
      "Città Vecchia": { min: 1100, max: 2200, media: 1650, trend: "+0,8%", transazioni: "Medio-basso", zona_omi: "B1" },
      "Cavana": { min: 1200, max: 2400, media: 1800, trend: "+1,2%", transazioni: "Medio", zona_omi: "B1" },
      "San Giacomo": { min: 900, max: 1800, media: 1350, trend: "+1,0%", transazioni: "Medio", zona_omi: "C1" },
      "Roiano": { min: 1200, max: 2200, media: 1700, trend: "+1,5%", transazioni: "Medio", zona_omi: "C2" },
      "Gretta": { min: 1100, max: 2000, media: 1550, trend: "+1,3%", transazioni: "Medio", zona_omi: "C2" },
      "Barcola": { min: 1800, max: 3500, media: 2650, trend: "+2,8%", transazioni: "Medio-alto", zona_omi: "C3" },
      "Cologna": { min: 1000, max: 1900, media: 1450, trend: "+0,9%", transazioni: "Medio-basso", zona_omi: "D1" },
      "Scorcola": { min: 1300, max: 2500, media: 1900, trend: "+1,7%", transazioni: "Medio", zona_omi: "C2" },
      "Chiadino": { min: 1100, max: 2100, media: 1600, trend: "+1,1%", transazioni: "Medio", zona_omi: "C3" },
      "Rozzol": { min: 800, max: 1500, media: 1150, trend: "+0,5%", transazioni: "Medio-basso", zona_omi: "D2" },
      "San Giovanni": { min: 900, max: 1700, media: 1300, trend: "+0,7%", transazioni: "Medio", zona_omi: "D1" },
      "Ponziana": { min: 800, max: 1600, media: 1200, trend: "+0,6%", transazioni: "Medio-basso", zona_omi: "D1" },
      "Barriera Vecchia": { min: 1000, max: 1900, media: 1450, trend: "+1,0%", transazioni: "Medio", zona_omi: "C1" },
      "Barriera Nuova": { min: 1200, max: 2300, media: 1750, trend: "+1,4%", transazioni: "Medio", zona_omi: "B2" },
      "Servola": { min: 700, max: 1400, media: 1050, trend: "+0,3%", transazioni: "Basso", zona_omi: "D2" },
      "Muggia": { min: 1100, max: 2200, media: 1650, trend: "+1,2%", transazioni: "Medio", zona_omi: "E1" },
      "Opicina": { min: 1000, max: 2000, media: 1500, trend: "+0,8%", transazioni: "Basso", zona_omi: "E2" },
      "Basovizza": { min: 900, max: 1800, media: 1350, trend: "+0,5%", transazioni: "Basso", zona_omi: "E2" },
      "Prosecco": { min: 800, max: 1600, media: 1200, trend: "+0,4%", transazioni: "Basso", zona_omi: "E3" },
    };
    setMarketData(zoneData[data.zona] || { min: 1000, max: 2200, media: 1600, trend: "+1,0%", transazioni: "Medio", zona_omi: "—" });
  }, [data]);

  const loadValutazione = (v) => { setData(v); setShowSelector(false); };
  const loadDemo = () => { setData(DEMO); setShowSelector(false); };

  const accent = data?.agenzia_colore || "#1a3a5c";
  const totalPert = data ? data.pertinenze.reduce((s, p) => s + (Number(p.valore) || 0), 0) : 0;

  if (loading) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#666" }}>Caricamento...</div>;
  }

  /* ── SELECTOR ── */
  if (showSelector) {
    return (
      <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f0f2f7", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <div style={{ background: "#fff", borderRadius: 16, padding: "40px 36px", maxWidth: 500, width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 8, color: "#1a1a2e" }}>📄 Report Valutazione</h1>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 28 }}>Seleziona una valutazione salvata per generare il report.</p>
          {list.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {list.map((v, i) => (
                <button key={v.id || i} onClick={() => loadValutazione(v)}
                  style={{ padding: "14px 18px", borderRadius: 10, border: "1.5px solid #d8dce6", background: "#f8f9fc", cursor: "pointer", textAlign: "left", transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif" }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = "#1a3a5c"; e.currentTarget.style.background = "#f0f4fa"; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = "#d8dce6"; e.currentTarget.style.background = "#f8f9fc"; }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "#1a1a2e" }}>{v.tipologia} — {v.indirizzo} {v.civico}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{v.zona && `${v.zona} · `}{fmtDate(v.data_valutazione)}{v.valore_medio && ` · ${fmt(v.valore_medio)}`}</div>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ padding: 24, textAlign: "center", color: "#999", background: "#f8f9fc", borderRadius: 10, border: "1.5px dashed #d8dce6", fontSize: 14 }}>Nessuna valutazione salvata trovata.</div>
          )}
          <button onClick={loadDemo} style={{ marginTop: 20, width: "100%", padding: "12px", borderRadius: 8, border: "1.5px solid #d8dce6", background: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#666" }}>👁️ Carica esempio demo</button>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     ═══         REPORT RENDERING           ═══
     ═══════════════════════════════════════════ */

  // Build characteristics arrays
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
    data.senza_barriere && ["Accessibilità", "Senza barriere architettoniche"],
    data.area_verde_condominiale && ["Area verde condominiale", "Presente"],
    data.parcheggi_condominiali && ["Parcheggi condominiali liberi", "Presenti"],
  ].filter(Boolean);

  const propertyChars = [
    data.superficie_commerciale && ["Superficie commerciale interna", `${data.superficie_commerciale} mq`],
    data.locali && ["Locali", data.locali],
    data.camere && ["Camere da letto", data.camere],
    data.bagni && ["Bagni", data.bagni],
    showField(data.livelli_immobile) && ["Livelli immobile", data.livelli_immobile],
    data.piano && ["Piano", data.totale_piani ? `${data.piano} di ${data.totale_piani}` : data.piano],
    data.interno && ["Interno", data.interno],
    showField(data.altri_vani) && ["Altri vani collegati", `${data.altri_vani}${data.altri_vani_mq ? ` — ${data.altri_vani_mq} mq` : ""}`],
    data.balconi && Number(data.balconi) > 0 && ["Balconi", `${data.balconi}${data.balconi_mq ? ` — ${data.balconi_mq} mq` : ""}`],
    data.terrazzi && Number(data.terrazzi) > 0 && ["Terrazzi", `${data.terrazzi}${data.terrazzi_mq ? ` — ${data.terrazzi_mq} mq` : ""}`],
    data.verande && Number(data.verande) > 0 && ["Verande", `${data.verande}${data.verande_mq ? ` — ${data.verande_mq} mq` : ""}`],
    data.giardino && Number(data.giardino) > 0 && ["Giardino", `${data.giardino}${data.giardino_mq ? ` — ${data.giardino_mq} mq` : ""}`],
    showField(data.stato_conservazione) && ["Stato di conservazione", data.stato_conservazione],
    showField(data.classe_energetica) && ["Classe energetica", data.classe_energetica],
    showField(data.riscaldamento) && ["Riscaldamento", data.riscaldamento],
    showField(data.tipologia_riscaldamento) && ["Tipologia riscaldamento", data.tipologia_riscaldamento],
    showField(data.imp_elettrico) && ["Impianto elettrico", data.imp_elettrico],
    showField(data.imp_acqua_calda) && ["Impianto acqua calda", data.imp_acqua_calda],
    showField(data.vista) && ["Vista", data.vista],
    showField(data.luminosita) && ["Luminosità", data.luminosita],
    data.esposizione && ["Esposizione", data.esposizione],
    data.aria_condizionata && ["Aria condizionata", "Presente"],
    data.pannelli_fotovoltaici && ["Pannelli fotovoltaici", "Presenti"],
    data.cappotto && ["Cappotto interno/esterno", "Presente"],
  ].filter(Boolean);

  const pageStyle = {
    maxWidth: 800, margin: "0 auto 24px", background: "#fff", borderRadius: 12,
    boxShadow: "0 2px 20px rgba(0,0,0,0.08)", overflow: "hidden", position: "relative",
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f0f2f7", minHeight: "100vh", color: "#1a1a2e" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
      <style>{`
        @media print {
          body, html { background: #fff !important; }
          .no-print { display: none !important; }
          .report-page { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; break-inside: avoid; }
          .page-break { break-before: page; }
          @page { margin: 12mm 10mm; size: A4; }
        }
      `}</style>

      {/* TOP BAR */}
      <div className="no-print" style={{ background: "#fff", borderBottom: "1px solid #e0e0e0", padding: "10px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={() => setShowSelector(true)} style={{ padding: "8px 18px", borderRadius: 8, border: "1.5px solid #d8dce6", background: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>← Torna alla lista</button>
        <button onClick={() => window.print()} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: accent, color: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>🖨️ Stampa / Salva PDF</button>
      </div>

      <div style={{ padding: "24px 20px 40px" }}>

        {/* ╔═══════════════════════════════════════════╗
           ║         PAGINA 1 — COPERTINA             ║
           ╚═══════════════════════════════════════════╝ */}
        <div className="report-page" style={{ ...pageStyle, minHeight: 700 }}>
          {/* Full cover */}
          <div style={{ background: `linear-gradient(155deg, ${accent} 0%, ${accent}dd 60%, ${accent}aa 100%)`, minHeight: 700, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 0, position: "relative", overflow: "hidden" }}>
            {/* Decorative circles */}
            <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
            <div style={{ position: "absolute", bottom: -100, left: -60, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
            <div style={{ position: "absolute", top: "40%", right: "10%", width: 150, height: 150, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)" }} />

            {/* Logo top-right */}
            <div style={{ padding: "40px 48px 0", display: "flex", justifyContent: "flex-end", position: "relative", zIndex: 1 }}>
              {data.agenzia_logo && <img src={data.agenzia_logo} alt="Logo" style={{ height: 60, borderRadius: 10, background: "#fff", padding: 6 }} />}
            </div>

            {/* Central content */}
            <div style={{ padding: "0 48px", position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "4px", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>
                RELAZIONE DI VALUTAZIONE
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 900, color: "#fff", lineHeight: 1.15, margin: "0 0 16px", maxWidth: 500 }}>
                {data.tipologia}
              </h1>
              <div style={{ width: 60, height: 3, background: "rgba(255,255,255,0.4)", marginBottom: 20, borderRadius: 2 }} />
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: "rgba(255,255,255,0.85)", margin: "0 0 6px", fontWeight: 400, letterSpacing: "0.3px" }}>
                {data.indirizzo}{data.civico ? ` ${data.civico}` : ""}
              </p>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", margin: 0 }}>
                {[data.cap, data.citta].filter(Boolean).join(" ")}
                {data.zona && ` — ${data.zona}`}
              </p>
            </div>

            {/* Bottom bar */}
            <div style={{ padding: "28px 48px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative", zIndex: 1 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Playfair Display', serif" }}>{data.agenzia_nome}</div>
                {data.agenzia_indirizzo && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{data.agenzia_indirizzo}</div>}
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                  {[data.agenzia_telefono, data.agenzia_email].filter(Boolean).join(" · ")}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Data valutazione</div>
                <div style={{ fontSize: 15, color: "#fff", fontWeight: 600, marginTop: 2 }}>{fmtDate(data.data_valutazione)}</div>
                {data.agente_nome && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Agente: {data.agente_nome}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* ╔═══════════════════════════════════════════╗
           ║  PAGINA 2 — OGGETTO + MODUS OPERANDI     ║
           ╚═══════════════════════════════════════════╝ */}
        <div className="report-page page-break" style={pageStyle}>
          <div style={{ padding: "40px 48px" }}>

            {/* Property header */}
            <SectionHead title="Oggetto della Valutazione" accent={accent} />
            <div style={{ background: "#fafbfd", borderRadius: 10, padding: "22px 26px", marginBottom: 32, border: "1px solid #eef0f4" }}>
              <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px", color: accent, marginBottom: 8 }}>{data.tipologia}</div>
              <h2 style={{ margin: "0 0 8px", fontSize: 24, fontFamily: "'Playfair Display', serif", color: "#1a1a2e" }}>
                {data.indirizzo}{data.civico ? `, ${data.civico}` : ""}
              </h2>
              <div style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>
                {[data.cap, data.citta].filter(Boolean).join(" ")}
                {data.zona && ` — Zona: ${data.zona}`}
                {data.piano && ` · Piano ${data.piano}`}{data.totale_piani && ` di ${data.totale_piani}`}
                {data.interno && ` · Interno ${data.interno}`}
                {data.superficie_commerciale && ` · ${data.superficie_commerciale} mq commerciali`}
              </div>

              {/* Map */}
              {data.mappa_img && (
                <div style={{ marginTop: 16 }}>
                  <img src={data.mappa_img} alt="Posizione immobile" style={{ width: "100%", borderRadius: 8, border: "1px solid #e0e2e8", display: "block" }} />
                </div>
              )}
            </div>

            {/* Modus Operandi */}
            {data.agenzia_modus_operandi && (
              <>
                <SectionHead title="Metodologia e Criteri di Valutazione" accent={accent} />
                <div style={{ fontSize: 14, lineHeight: 1.85, color: "#444", whiteSpace: "pre-line", textAlign: "justify" }}>
                  {data.agenzia_modus_operandi}
                </div>
              </>
            )}

            <PageNum n={2} accent={accent} />
          </div>
        </div>

        {/* ╔═══════════════════════════════════════════╗
           ║  PAGINA 3 — MERCATO E ZONA               ║
           ╚═══════════════════════════════════════════╝ */}
        <div className="report-page page-break" style={pageStyle}>
          <div style={{ padding: "40px 48px" }}>

            <SectionHead title="Il Mercato Immobiliare a Trieste" accent={accent} />
            <div style={{ fontSize: 14, lineHeight: 1.85, color: "#444", marginBottom: 28, textAlign: "justify", whiteSpace: "pre-line" }}>
              {data.testo_mercato || "Testo del mercato non ancora generato."}
            </div>

            {/* Zona specifica */}
            {data.testo_zona && (
              <>
                <SectionHead title={`Analisi della Zona: ${data.zona || "—"}`} accent={accent} />
                <div style={{ fontSize: 14, lineHeight: 1.85, color: "#444", marginBottom: 24, textAlign: "justify", whiteSpace: "pre-line" }}>
                  {data.testo_zona}
                </div>
              </>
            )}

            {/* Dati OMI */}
            {marketData && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: accent, marginBottom: 16 }}>
                  Quotazioni di Riferimento — {data.zona}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
                  <div style={{ background: "#fafbfd", borderRadius: 10, padding: "18px 20px", textAlign: "center", border: "1px solid #eef0f4" }}>
                    <div style={{ fontSize: 11, color: "#999", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Min €/mq</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#555", fontFamily: "'Playfair Display', serif" }}>{marketData.min.toLocaleString("it-IT")}</div>
                  </div>
                  <div style={{ background: `${accent}0a`, borderRadius: 10, padding: "18px 20px", textAlign: "center", border: `1.5px solid ${accent}25` }}>
                    <div style={{ fontSize: 11, color: accent, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Media €/mq</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: accent, fontFamily: "'Playfair Display', serif" }}>{marketData.media.toLocaleString("it-IT")}</div>
                  </div>
                  <div style={{ background: "#fafbfd", borderRadius: 10, padding: "18px 20px", textAlign: "center", border: "1px solid #eef0f4" }}>
                    <div style={{ fontSize: 11, color: "#999", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Max €/mq</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#555", fontFamily: "'Playfair Display', serif" }}>{marketData.max.toLocaleString("it-IT")}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 8 }}>
                  <div style={{ background: "#fafbfd", borderRadius: 8, padding: "12px 16px", border: "1px solid #eef0f4" }}>
                    <div style={{ fontSize: 10, color: "#999", fontWeight: 600, textTransform: "uppercase" }}>Trend annuale</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#2e7d32", marginTop: 4 }}>{marketData.trend}</div>
                  </div>
                  <div style={{ background: "#fafbfd", borderRadius: 8, padding: "12px 16px", border: "1px solid #eef0f4" }}>
                    <div style={{ fontSize: 10, color: "#999", fontWeight: 600, textTransform: "uppercase" }}>Volume transazioni</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginTop: 4 }}>{marketData.transazioni}</div>
                  </div>
                  <div style={{ background: "#fafbfd", borderRadius: 8, padding: "12px 16px", border: "1px solid #eef0f4" }}>
                    <div style={{ fontSize: 10, color: "#999", fontWeight: 600, textTransform: "uppercase" }}>Zona OMI</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginTop: 4 }}>{marketData.zona_omi}</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "#bbb", marginTop: 8, fontStyle: "italic" }}>
                  Fonti: Osservatorio del Mercato Immobiliare (OMI) — Agenzia delle Entrate; elaborazioni su dati di mercato.
                  I valori sono indicativi e riferiti a immobili residenziali in stato conservativo normale.
                </div>
              </>
            )}

            <PageNum n={3} accent={accent} />
          </div>
        </div>

        {/* ╔═══════════════════════════════════════════╗
           ║  PAGINA 4 — CARATTERISTICHE + PERTINENZE  ║
           ╚═══════════════════════════════════════════╝ */}
        <div className="report-page page-break" style={pageStyle}>
          <div style={{ padding: "40px 48px" }}>

            {/* Edificio */}
            {buildingChars.length > 0 && (
              <>
                <SectionHead title="Caratteristiche dell'Edificio" accent={accent} />
                <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #eef0f4", marginBottom: 32 }}>
                  {buildingChars.map(([label, value], i) => (
                    <DetailRow key={i} label={label} value={value} accent={accent} even={i % 2 === 0} />
                  ))}
                </div>
              </>
            )}

            {/* Immobile */}
            <SectionHead title="Caratteristiche dell'Immobile" accent={accent} />
            <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #eef0f4", marginBottom: 32 }}>
              {propertyChars.map(([label, value], i) => (
                <DetailRow key={i} label={label} value={value} accent={accent} even={i % 2 === 0} />
              ))}
            </div>

            {/* Pertinenze */}
            {data.pertinenze && data.pertinenze.length > 0 && (
              <>
                <SectionHead title="Pertinenze" accent={accent} />
                <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #eef0f4", marginBottom: 12 }}>
                  {/* Header */}
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 2fr", padding: "10px 16px", background: accent, fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    <span>Tipologia</span><span>Superficie</span><span style={{ textAlign: "right" }}>Valore</span><span style={{ textAlign: "right" }}>Note</span>
                  </div>
                  {data.pertinenze.map((p, i) => (
                    <div key={p.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 2fr", padding: "11px 16px", background: i % 2 === 0 ? "#fafbfd" : "#fff", borderBottom: "1px solid #f0f1f4", fontSize: 13.5 }}>
                      <span style={{ fontWeight: 600 }}>{p.icon} {p.label}</span>
                      <span style={{ color: "#666" }}>{p.superficie ? `${p.superficie} mq` : "—"}</span>
                      <span style={{ fontWeight: 600, textAlign: "right" }}>{p.valore ? fmt(p.valore) : "—"}</span>
                      <span style={{ color: "#888", textAlign: "right", fontSize: 12 }}>{p.note || "—"}</span>
                    </div>
                  ))}
                  {/* Total row */}
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 2fr", padding: "12px 16px", background: `${accent}08`, borderTop: `2px solid ${accent}20`, fontSize: 14 }}>
                    <span style={{ fontWeight: 700, color: accent }}>Totale pertinenze</span>
                    <span></span>
                    <span style={{ fontWeight: 800, color: accent, textAlign: "right" }}>{fmt(totalPert)}</span>
                    <span></span>
                  </div>
                </div>
              </>
            )}

            {/* Descrizione */}
            {data.descrizione_manuale && (
              <div style={{ marginTop: 28 }}>
                <SectionHead title="Descrizione dell'Immobile" accent={accent} />
                <div style={{ fontSize: 14, lineHeight: 1.85, color: "#444", whiteSpace: "pre-line", textAlign: "justify" }}>
                  {data.descrizione_manuale}
                </div>
              </div>
            )}

            {/* Note */}
            {data.note_valutazione && (
              <div style={{ marginTop: 24 }}>
                <SectionHead title="Note sulla Valutazione" accent={accent} />
                <div style={{ fontSize: 13, lineHeight: 1.75, color: "#666", fontStyle: "italic", whiteSpace: "pre-line" }}>
                  {data.note_valutazione}
                </div>
              </div>
            )}

            <PageNum n={4} accent={accent} />
          </div>
        </div>

        {/* ╔═══════════════════════════════════════════╗
           ║  PAGINA 5 — VALUTAZIONE FINALE            ║
           ╚═══════════════════════════════════════════╝ */}
        <div className="report-page page-break" style={pageStyle}>
          <div style={{ padding: "40px 48px" }}>

            <SectionHead title="Valutazione Economica" accent={accent} />

            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 28px" }}>
                Sulla base dell'analisi effettuata, considerando le caratteristiche dell'immobile, la sua ubicazione, lo stato di conservazione e l'andamento del mercato immobiliare locale, si esprime la seguente valutazione:
              </p>
            </div>

            {/* Value cards */}
            <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
              {data.valore_min && (
                <div style={{ background: "#fafbfd", borderRadius: 14, padding: "24px 30px", textAlign: "center", border: "1.5px solid #e8eaf0", minWidth: 170, flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#999", marginBottom: 10 }}>Valore Minimo</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#555", fontFamily: "'Playfair Display', serif", lineHeight: 1.1 }}>{fmt(data.valore_min)}</div>
                  {data.superficie_commerciale && <div style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>{Math.round(Number(data.valore_min) / Number(data.superficie_commerciale)).toLocaleString("it-IT")} €/mq</div>}
                </div>
              )}
              {data.valore_medio && (
                <div style={{ background: `linear-gradient(135deg, ${accent}08, ${accent}14)`, borderRadius: 14, padding: "28px 34px", textAlign: "center", border: `2px solid ${accent}30`, minWidth: 200, flex: 1.2, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${accent}08` }} />
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: accent, marginBottom: 10, position: "relative" }}>Valore Stimato</div>
                  <div style={{ fontSize: 38, fontWeight: 900, color: accent, fontFamily: "'Playfair Display', serif", lineHeight: 1.1, position: "relative" }}>{fmt(data.valore_medio)}</div>
                  {data.superficie_commerciale && <div style={{ fontSize: 13, color: accent, marginTop: 10, fontWeight: 600, position: "relative" }}>{Math.round(Number(data.valore_medio) / Number(data.superficie_commerciale)).toLocaleString("it-IT")} €/mq</div>}
                </div>
              )}
              {data.valore_max && (
                <div style={{ background: "#fafbfd", borderRadius: 14, padding: "24px 30px", textAlign: "center", border: "1.5px solid #e8eaf0", minWidth: 170, flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#999", marginBottom: 10 }}>Valore Massimo</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#555", fontFamily: "'Playfair Display', serif", lineHeight: 1.1 }}>{fmt(data.valore_max)}</div>
                  {data.superficie_commerciale && <div style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>{Math.round(Number(data.valore_max) / Number(data.superficie_commerciale)).toLocaleString("it-IT")} €/mq</div>}
                </div>
              )}
            </div>

            {/* Pertinenze summary in valuation */}
            {data.pertinenze && data.pertinenze.length > 0 && (
              <div style={{ background: "#fafbfd", borderRadius: 12, padding: "20px 24px", border: "1px solid #eef0f4", marginBottom: 28 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#999", marginBottom: 12 }}>Riepilogo con pertinenze</div>
                {data.pertinenze.map((p) => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: "#666", borderBottom: "1px solid #f0f0f0" }}>
                    <span>{p.icon} {p.label}{p.superficie ? ` (${p.superficie} mq)` : ""}</span>
                    <span style={{ fontWeight: 600 }}>{p.valore ? fmt(p.valore) : "—"}</span>
                  </div>
                ))}
                <div style={{ borderTop: `2px solid ${accent}20`, marginTop: 10, paddingTop: 12 }}>
                  {data.valore_min && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#666", padding: "3px 0" }}>
                      <span>Totale complessivo (minimo)</span>
                      <span style={{ fontWeight: 700 }}>{fmt(Number(data.valore_min) + totalPert)}</span>
                    </div>
                  )}
                  {data.valore_medio && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, color: accent, padding: "5px 0", fontWeight: 700 }}>
                      <span>Totale complessivo (stimato)</span>
                      <span style={{ fontSize: 18, fontFamily: "'Playfair Display', serif" }}>{fmt(Number(data.valore_medio) + totalPert)}</span>
                    </div>
                  )}
                  {data.valore_max && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#666", padding: "3px 0" }}>
                      <span>Totale complessivo (massimo)</span>
                      <span style={{ fontWeight: 700 }}>{fmt(Number(data.valore_max) + totalPert)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Signature area */}
            <div style={{ marginTop: 48, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div style={{ fontSize: 12, color: "#999", marginBottom: 6 }}>Data</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{fmtDate(data.data_valutazione)}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 200, borderBottom: "1px solid #ccc", marginBottom: 8, height: 40 }} />
                <div style={{ fontSize: 12, color: "#999" }}>Firma dell'agente</div>
                {data.agente_nome && <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{data.agente_nome}</div>}
                {(data.agente_telefono || data.agente_email) && (
                  <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
                    {[data.agente_telefono, data.agente_email].filter(Boolean).join(" · ")}
                  </div>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "#999", marginBottom: 6 }}>Timbro</div>
                <div style={{ width: 80, height: 80, border: "1.5px dashed #ddd", borderRadius: 8 }} />
              </div>
            </div>

            {/* Disclaimer */}
            <div style={{ marginTop: 40, padding: "16px 20px", background: "#fafbfd", borderRadius: 8, border: "1px solid #eef0f4", fontSize: 10, color: "#bbb", lineHeight: 1.7 }}>
              La presente relazione di valutazione ha carattere indicativo e non costituisce perizia estimativa ai sensi di legge. I valori espressi rappresentano una stima del più probabile prezzo di mercato dell'immobile sulla base delle informazioni disponibili al momento della valutazione e dell'esperienza professionale del valutatore. La valutazione non tiene conto di eventuali vincoli, ipoteche, servitù o situazioni giuridiche particolari non dichiarate. {data.agenzia_nome && `© ${new Date().getFullYear()} ${data.agenzia_nome}.`} Tutti i diritti riservati.
            </div>

            <PageNum n={5} accent={accent} />
          </div>
        </div>

      </div>
    </div>
  );
}
