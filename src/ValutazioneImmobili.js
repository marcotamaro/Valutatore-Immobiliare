import { useState, useEffect } from "react";

const PERTINENZE_TYPES = [
  { id: "cantina", label: "Cantina", icon: "🏚️" },
  { id: "soffitta", label: "Soffitta", icon: "🏠" },
  { id: "posto_auto", label: "Posto Auto", icon: "🅿️" },
  { id: "posto_auto_garage", label: "Posto Auto in Garage", icon: "🚗" },
  { id: "box_auto", label: "Box Auto", icon: "🏗️" },
  { id: "posto_auto_condominiale", label: "Posto Auto Condominiale", icon: "🏢" },
  { id: "terreno", label: "Terreno non collegato alla proprietà", icon: "🌿" },
];

const TIPOLOGIE = [
  "Appartamento", "Appartamento bilivello", "Villa", "Villetta a schiera",
  "Attico", "Attico bilivello", "Mansarda", "Loft",
  "Terreno edificabile", "Terreno agricolo",
  "Negozio", "Ufficio", "Magazzino", "Laboratorio", "Capannone",
];

const STATI_CONSERVAZIONE = [
  "", "Nuovo", "Ristrutturato ultimi 5 anni", "Ristrutturato ultimi 15 anni",
  "Buono", "Discreto", "Da rimodernare parzialmente", "Completamente da ristrutturare",
];

const CLASSI_ENERGETICHE = [
  "", "A4", "A3", "A2", "A1", "B", "C", "D", "E", "F", "G", "In fase di certificazione",
];

const RISCALDAMENTO = [
  "", "Autonomo", "Centralizzato", "Centralizzato con termovalvole e contacalorie", "Assente",
];

const TIPOLOGIA_RISCALDAMENTO = [
  "", "Caloriferi", "A pavimento", "Split", "Stufa",
];

const VISTA = ["", "Straordinaria", "Molto bella", "Bella", "Media", "Scarsa"];

const LUMINOSITA = ["", "Molto luminoso", "Luminoso", "Normale", "Poco luminoso", "Buio"];

const CONDIZIONI_FACCIATE = ["", "Nuove", "Ottime", "Buone", "Da sistemare", "Da rifare"];

const CONDIZIONI_TETTO = ["", "Nuovo", "Ottimo", "Buono", "Discreto", "Da sistemare", "Da rifare"];

const CONDIZIONI_ATRIO = ["", "Nuovo", "Ottimo", "Buono", "Discreto", "Da sistemare", "Da rifare"];

const TIPOLOGIA_EDIFICIO = ["", "Di pregio", "Signorile", "Civile-medio", "Popolare"];

const FACILITA_ACCESSO = ["", "Molto comodo", "Nella media", "Difficilmente raggiungibile", "Impervio"];

const LIVELLI_IMMOBILE = ["", "Disposto principalmente su 1 livello", "Disposto principalmente su 2 livelli", "Disposto principalmente su 3 livelli", "Disposto principalmente su 4 livelli", "Disposto principalmente su 5 livelli"];

const ALTRI_VANI = ["", "Mansarda", "Taverna", "Seminterrato", "Sottotetto", "Soppalco"];

const IMP_ELETTRICO = ["", "Certificato", "Funzionante", "Da rifare"];

const IMP_ACQUA_CALDA = ["", "Autonoma boiler elettrico", "Autonoma pompa di calore", "Autonoma caldaia", "Centralizzata", "Da rifare"];

const IMP_GAS = ["", "Certificato", "Funzionante", "Assente"];



const initialFormData = {
  agenzia_nome: "", agenzia_indirizzo: "", agenzia_telefono: "", agenzia_email: "",
  agenzia_colore: "#1a3a5c", agenzia_logo: null, agenzia_modus_operandi: "",
  copertina_img: null, titolo_valutazione: "Valutazione Immobiliare",
  agente_nome: "", agente_telefono: "", agente_email: "",
  tipologia: "Appartamento", indirizzo: "", civico: "", cap: "34100", citta: "Trieste",
  zona: "", piano: "", totale_piani: "", scala: "",
  catasto_mappa: "", catasto_foglio: "", catasto_particella: "", catasto_subalterno: "",
  proprietario_nome: "", proprietario_cognome: "", proprietario_telefono: "", proprietario_email: "",
  lat: null, lng: null, mappa_img: null,
  superficie_commerciale: "", locali: "", camere: "", bagni: "",
  livelli_immobile: "", altri_vani: [],
  foto_immobile: [],
  balconi: "", balconi_mq: "", terrazzi: "", terrazzi_mq: "",
  giardino: "", giardino_mq: "", verande: "", verande_mq: "",
  stato_conservazione: "", anno_costruzione: "", classe_energetica: "",
  riscaldamento: "", tipologia_riscaldamento: "",
  vista: "", luminosita: "", esposizione: "",
  condizioni_facciate: "", tipologia_edificio: "",
  condizioni_tetto: "", condizioni_atrio: "", spese_condominiali: "", facilita_accesso: "",
  area_verde_condominiale: false, parcheggi_condominiali: false,
  imp_elettrico: "", imp_acqua_calda: "", imp_gas: "", cappotto: false,
  ascensore: false, aria_condizionata: false, pannelli_fotovoltaici: false,
  senza_barriere: false, caminetto: false,
  valore_min: "", valore_medio: "", valore_max: "",
  note_valutazione: "", descrizione_manuale: "",
  testo_mercato: "", testo_zona: "", testo_zona_generata_per: "", servizi_zona: "",
  pertinenze: [],
  data_valutazione: new Date().toISOString().split("T")[0],
};

const fmt = (v) => {
  if (!v && v !== 0) return "";
  return Number(v).toLocaleString("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const SectionTitle = ({ children, step }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "36px 0 18px", borderBottom: "2px solid var(--accent)", paddingBottom: 10 }}>
    {step && (
      <span style={{ background: "var(--accent)", color: "#fff", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, fontFamily: "var(--font-body)", flexShrink: 0 }}>{step}</span>
    )}
    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.3px" }}>{children}</h2>
  </div>
);

const Field = ({ label, children, half, third, full }) => {
  let flex = "1 1 calc(50% - 10px)";
  if (third) flex = "1 1 calc(33.333% - 14px)";
  if (full) flex = "1 1 100%";
  return (
    <div style={{ flex, minWidth: third ? 140 : half ? 180 : 200 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 5, fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
      {children}
    </div>
  );
};

const inputStyle = {
  width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 8, fontSize: 14,
  fontFamily: "var(--font-body)", background: "var(--input-bg)", color: "var(--text-primary)", outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box",
};

const selectStyle = { ...inputStyle, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 32 };

const Row = ({ children }) => <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 20px" }}>{children}</div>;

const Toggle = ({ label, checked, onChange }) => (
  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "6px 0", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)" }}>
    <div onClick={onChange} style={{ width: 44, height: 24, borderRadius: 12, background: checked ? "var(--accent)" : "var(--border)", position: "relative", transition: "background 0.25s", cursor: "pointer", flexShrink: 0 }}>
      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: checked ? 23 : 3, transition: "left 0.25s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
    {label}
  </label>
);

const SubLabel = ({ children }) => (
  <div style={{ margin: "20px 0 6px", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{children}</div>
);

const Select = ({ value, onChange, options, placeholder }) => (
  <select style={{ ...selectStyle, color: value ? "var(--text-primary)" : "#999" }} value={value} onChange={onChange}>
    <option value="">{placeholder || "— Seleziona —"}</option>
    {options.filter(o => o !== "").map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);

export default function ValutazioneImmobili() {
  const [form, setForm] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [logoPreview, setLogoPreview] = useState(null);
  const [agentsList, setAgentsList] = useState([]);
  const [savedMercato, setSavedMercato] = useState(false);
  const [zonesConfig, setZonesConfig] = useState([]);
  const accent = form.agenzia_colore || "#1a3a5c";

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("agency_settings");
        if (res && res.value) {
          const data = JSON.parse(res.value);
          setForm((f) => ({ ...f, ...data }));
          if (data.agenzia_logo) setLogoPreview(data.agenzia_logo);
        }
        // Load agents
        const agRes = await window.storage.get("agents_list");
        if (agRes && agRes.value) setAgentsList(JSON.parse(agRes.value));
        // Load zones config (with default fallback)
        const zRes = await window.storage.get("zones_config");
        if (zRes && zRes.value) setZonesConfig(JSON.parse(zRes.value));
        else setZonesConfig([
          { id: 1, nome: "Centro di pregio" }, { id: 2, nome: "Centro non di pregio" },
          { id: 3, nome: "San Giacomo, Chiarbola, Ponziana" }, { id: 4, nome: "Baiamonti, Valmaura, Borgo San Sergio, Altura" },
          { id: 5, nome: "San Luigi, Rozzol, San Giovanni, Longera" }, { id: 6, nome: "Roiano, Gretta" },
          { id: 7, nome: "Conconello, Barcola, Costiera, Grignano" }, { id: 8, nome: "Largo Barriera, Ospedale Maggiore, Settefontane" },
          { id: 9, nome: "Scorcola, Cologna, Università" }, { id: 10, nome: "Campanelle, Costalunga, Sant'Anna" },
          { id: 11, nome: "Opicina" }, { id: 12, nome: "Basovizza, Padriciano, Trebiciano, Prosecco" },
          { id: 13, nome: "Prosecco, Aurisina, Santa Croce, Sistiana, Duino" },
          { id: 14, nome: "Domio, San Dorligo della Valle, San Giuseppe, Log" }, { id: 15, nome: "Muggia" },
        ]);
        // Load saved mercato text
        const mercRes = await window.storage.get("saved_testo_mercato");
        if (mercRes && mercRes.value) {
          setForm(f => ({ ...f, testo_mercato: f.testo_mercato || mercRes.value }));
          setSavedMercato(true);
        }
        // Check if editing existing valutazione
        const editRes = await window.storage.get("edit_valutazione");
        if (editRes && editRes.value) {
          const editData = JSON.parse(editRes.value);
          setForm((f) => ({ ...f, ...editData }));
          if (editData.agenzia_logo) setLogoPreview(editData.agenzia_logo);
          await window.storage.delete("edit_valutazione");
        }
      } catch (e) {}
    })();
  }, []);

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const addPertinenza = (type) => {
    const p = PERTINENZE_TYPES.find((t) => t.id === type);
    setForm((f) => ({ ...f, pertinenze: [...f.pertinenze, { id: Date.now(), tipo: type, label: p.label, icon: p.icon, superficie: "", valore: "", note: "" }] }));
  };
  const updatePertinenza = (id, key, val) => setForm((f) => ({ ...f, pertinenze: f.pertinenze.map((p) => (p.id === id ? { ...p, [key]: val } : p)) }));
  const removePertinenza = (id) => setForm((f) => ({ ...f, pertinenze: f.pertinenze.filter((p) => p.id !== id) }));

  const totalValue = (which) => {
    const imm = Number(form[which]) || 0;
    const pert = form.pertinenze.reduce((sum, p) => sum + (Number(p.valore) || 0), 0);
    return imm + pert;
  };

  const mainValue = () => {
    if (form.valore_medio) return Number(form.valore_medio);
    if (form.valore_min) return Number(form.valore_min);
    if (form.valore_max) return Number(form.valore_max);
    return 0;
  };

  const saveValutazione = async () => {
    const valutazione = { ...form, agenzia_logo: logoPreview, created_at: new Date().toISOString(), id: Date.now() };
    try {
      const existing = await window.storage.get("valutazioni_list");
      let list = [];
      if (existing && existing.value) list = JSON.parse(existing.value);
      list.push(valutazione);
      await window.storage.set("valutazioni_list", JSON.stringify(list));
      return true;
    } catch (e) { return false; }
  };

  const generateTexts = () => {
    const mercato = form.testo_mercato || `Il mercato immobiliare triestino presenta caratteristiche peculiari legate alla posizione geografica di confine, alla forte identità culturale della città e ad un tessuto urbano prevalentemente storico. Trieste è una città che negli ultimi anni ha registrato un crescente interesse da parte di acquirenti, anche internazionali, attratti dalla qualità della vita, dai costi ancora competitivi rispetto ad altre città italiane di dimensioni analoghe e dalla crescente offerta culturale e turistica.\n\nIl comparto residenziale mostra una domanda sostenuta nelle zone centrali e semicentrali, con particolare interesse per gli immobili ristrutturati o in buono stato di conservazione.\n\nI tempi medi di vendita si attestano tra i 3 e i 6 mesi per immobili correttamente posizionati nel prezzo.`;

    // Check zones config first for zone description
    const zonaConfig = zonesConfig.find(z => z.nome === form.zona);
    const zonaDesc = zonaConfig && zonaConfig.descrizione ? zonaConfig.descrizione : "";
    const zona = zonaDesc || `L'immobile è ubicato nella zona ${form.zona || "—"} di Trieste.`;
    const servizi = "";

    return { mercato, zona, servizi };
  };

  const steps = [
    { label: "Copertina", icon: "🎨" },
    { label: "Immobile", icon: "📍" },
    { label: "Caratteristiche", icon: "📐" },
    { label: "Pertinenze", icon: "🅿️" },
    { label: "Valutazione", icon: "💰" },
    { label: "Revisione", icon: "✏️" },
  ];

  const canProceed = () => {
    if (currentStep === 1) return form.indirizzo && form.tipologia;
    if (currentStep === 2) return form.superficie_commerciale;
    if (currentStep === 4) return form.valore_min || form.valore_medio || form.valore_max;
    return true;
  };

  const euroPerMq = () => {
    const v = mainValue();
    const s = Number(form.superficie_commerciale);
    if (v && s) return Math.round(v / s).toLocaleString("it-IT") + " €/mq";
    return "—";
  };

  return (
    <div style={{ "--accent": accent, "--accent-light": accent + "18", "--accent-mid": accent + "30", "--text-primary": "#1a1a2e", "--text-secondary": "#5a6178", "--border": "#d8dce6", "--input-bg": "#f8f9fc", "--card-bg": "#ffffff", "--bg": "#f0f2f7", "--font-heading": "'Playfair Display', Georgia, serif", "--font-body": "'DM Sans', 'Segoe UI', sans-serif", fontFamily: "var(--font-body)", background: "var(--bg)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ background: `linear-gradient(135deg, ${accent}, ${accent}dd)`, padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {logoPreview ? (
            <img src={logoPreview} alt="Logo" style={{ height: 40, width: 40, objectFit: "contain", borderRadius: 8, background: "#fff", padding: 3 }} />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📝</div>
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: "var(--font-heading)", letterSpacing: "-0.5px" }}>Nuova Valutazione</h1>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{form.agenzia_nome || "Valutazione Immobiliare"} — Trieste</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>{new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}</div>
      </div>

      {/* STEP INDICATOR */}
      <div style={{ display: "flex", justifyContent: "center", padding: "20px 20px 0", gap: 0 }}>
        {steps.map((s, i) => (
          <div key={i} onClick={() => setCurrentStep(i)} style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 70 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, background: i === currentStep ? accent : i < currentStep ? accent + "22" : "#e8eaf0", color: i === currentStep ? "#fff" : i < currentStep ? accent : "#999", transition: "all 0.3s", border: i === currentStep ? "3px solid " + accent : i < currentStep ? "3px solid " + accent + "55" : "3px solid transparent" }}>
                {i < currentStep ? "✓" : s.icon}
              </div>
              <span style={{ fontSize: 11, fontWeight: i === currentStep ? 700 : 500, color: i === currentStep ? accent : "var(--text-secondary)" }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div style={{ width: 40, height: 2, background: i < currentStep ? accent + "55" : "#e0e0e0", margin: "0 4px", marginBottom: 22, borderRadius: 1 }} />}
          </div>
        ))}
      </div>

      {/* FORM BODY */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "10px 20px 100px" }}>

        {/* ── STEP 0: COPERTINA + AGENTE ── */}
        {currentStep === 0 && (
          <div style={{ background: "var(--card-bg)", borderRadius: 14, padding: "28px 28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginTop: 20 }}>
            <SectionTitle step="1">Copertina e Agente</SectionTitle>

            <Row>
              <Field label="Titolo Valutazione (appare in copertina)" half>
                <input style={inputStyle} value={form.titolo_valutazione} onChange={(e) => update("titolo_valutazione", e.target.value)} placeholder="Valutazione Immobiliare" />
              </Field>
              <Field label="Agente" half>
                {agentsList.length > 0 ? (
                  <select style={selectStyle} value={form.agente_nome} onChange={(e) => {
                    const sel = agentsList.find(a => `${a.cognome} ${a.nome}` === e.target.value);
                    if (sel) setForm(f => ({ ...f, agente_nome: `${sel.cognome} ${sel.nome}`, agente_telefono: sel.telefono || "", agente_email: sel.email || "" }));
                    else update("agente_nome", e.target.value);
                  }}>
                    <option value="">— Seleziona agente —</option>
                    {agentsList.map(a => <option key={a.id} value={`${a.cognome} ${a.nome}`}>{a.cognome} {a.nome}</option>)}
                  </select>
                ) : (
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", padding: "10px 0" }}>Nessun agente. Vai alla Dashboard → Agenti.</div>
                )}
              </Field>
            </Row>
            {form.agente_nome && (
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, marginBottom: 12, display: "flex", gap: 16 }}>
                {form.agente_telefono && <span>📞 {form.agente_telefono}</span>}
                {form.agente_email && <span>📧 {form.agente_email}</span>}
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <Field label="Immagine di Copertina Report" full>
                <input id="copertinaUpload" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" style={{ display: "none" }} onChange={(e) => {
                  const file = e.target.files[0]; if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => update("copertina_img", ev.target.result);
                  reader.readAsDataURL(file);
                }} />
                <button onClick={() => document.getElementById("copertinaUpload")?.click()} style={{ padding: "14px 24px", borderRadius: 10, width: "100%", border: form.copertina_img ? `2px solid ${accent}40` : "2px dashed var(--border)", background: form.copertina_img ? `${accent}08` : "var(--input-bg)", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-body)", color: form.copertina_img ? accent : "var(--text-secondary)", display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                  {form.copertina_img ? "✓ Immagine caricata — Clicca per sostituire" : "🖼️ Carica immagine di copertina"}
                </button>
                {form.copertina_img && (
                  <div style={{ marginTop: 10, position: "relative" }}>
                    <img src={form.copertina_img} alt="Copertina" style={{ width: "100%", maxHeight: 250, objectFit: "cover", borderRadius: 10, border: "1.5px solid var(--border)", display: "block" }} />
                    <button onClick={() => update("copertina_img", null)} style={{ position: "absolute", top: 8, right: 8, background: "#fee", border: "1px solid #fcc", borderRadius: 6, color: "#c33", cursor: "pointer", padding: "4px 10px", fontSize: 12, fontFamily: "var(--font-body)" }}>✕ Rimuovi</button>
                  </div>
                )}
              </Field>
            </div>
          </div>
        )}

        {/* ── STEP 1: IMMOBILE ── */}
        {currentStep === 1 && (
          <div style={{ background: "var(--card-bg)", borderRadius: 14, padding: "28px 28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginTop: 20 }}>
            <SectionTitle step="2">Ubicazione e Tipologia</SectionTitle>
            <Row>
              <Field label="Tipologia *" half>
                <select style={selectStyle} value={form.tipologia} onChange={(e) => update("tipologia", e.target.value)}>
                  {TIPOLOGIE.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Zona" half>
                <select style={selectStyle} value={form.zona} onChange={(e) => update("zona", e.target.value)}>
                  <option value="">— Seleziona zona —</option>
                  {zonesConfig.map(z => <option key={z.id} value={z.nome}>{z.nome}</option>)}
                </select>
              </Field>
            </Row>
            <Row>
              <Field label="Indirizzo *" half><input style={inputStyle} value={form.indirizzo} onChange={(e) => update("indirizzo", e.target.value)} placeholder="Via Carducci" /></Field>
              <Field label="Civico" third><input style={inputStyle} value={form.civico} onChange={(e) => update("civico", e.target.value)} placeholder="12" /></Field>
              <Field label="CAP" third><input style={inputStyle} value={form.cap} onChange={(e) => update("cap", e.target.value)} placeholder="34100" /></Field>
            </Row>
            <Row>
              <Field label="Piano" half><input style={inputStyle} value={form.piano} onChange={(e) => update("piano", e.target.value)} placeholder="3" /></Field>
            </Row>

            {/* Dati Catastali */}
            <SubLabel>Dati Catastali</SubLabel>
            <Row>
              <Field label="Mappa" third><input style={inputStyle} value={form.catasto_mappa} onChange={(e) => update("catasto_mappa", e.target.value)} placeholder="1" /></Field>
              <Field label="Foglio" third><input style={inputStyle} value={form.catasto_foglio} onChange={(e) => update("catasto_foglio", e.target.value)} placeholder="12" /></Field>
              <Field label="Particella" third><input style={inputStyle} value={form.catasto_particella} onChange={(e) => update("catasto_particella", e.target.value)} placeholder="345" /></Field>
            </Row>
            <Row>
              <Field label="Subalterno" third><input style={inputStyle} value={form.catasto_subalterno} onChange={(e) => update("catasto_subalterno", e.target.value)} placeholder="6" /></Field>
            </Row>

            {/* Proprietario */}
            <SubLabel>Dati Proprietario</SubLabel>
            <Row>
              <Field label="Nome" half><input style={inputStyle} value={form.proprietario_nome} onChange={(e) => update("proprietario_nome", e.target.value)} placeholder="Mario" /></Field>
              <Field label="Cognome" half><input style={inputStyle} value={form.proprietario_cognome} onChange={(e) => update("proprietario_cognome", e.target.value)} placeholder="Rossi" /></Field>
            </Row>
            <Row>
              <Field label="Telefono" half><input style={inputStyle} value={form.proprietario_telefono} onChange={(e) => update("proprietario_telefono", e.target.value)} placeholder="+39 333 1234567" /></Field>
              <Field label="Email" half><input style={inputStyle} value={form.proprietario_email} onChange={(e) => update("proprietario_email", e.target.value)} placeholder="mario.rossi@email.it" /></Field>
            </Row>

            {/* ── MAPPA ── */}
            <SubLabel>Posizione sulla Mappa</SubLabel>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 12px" }}>
              Carica uno screenshot di Google Maps con la posizione dell'immobile.
            </p>
            <div>
              <input id="mapUpload" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" style={{ display: "none" }} onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => update("mappa_img", ev.target.result);
                reader.readAsDataURL(file);
              }} />
              <button
                onClick={() => document.getElementById("mapUpload")?.click()}
                style={{
                  padding: "14px 24px", borderRadius: 10,
                  border: form.mappa_img ? `2px solid ${accent}40` : "2px dashed var(--border)",
                  background: form.mappa_img ? `${accent}08` : "var(--input-bg)",
                  cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-body)",
                  color: form.mappa_img ? accent : "var(--text-secondary)",
                  display: "flex", alignItems: "center", gap: 8, width: "100%", justifyContent: "center",
                }}
              >
                {form.mappa_img ? "✓ Immagine caricata — Clicca per sostituire" : "📍 Carica screenshot mappa"}
              </button>
              {form.mappa_img && (
                <div style={{ marginTop: 12, position: "relative" }}>
                  <img src={form.mappa_img} alt="Mappa" style={{ width: "100%", borderRadius: 10, border: "1.5px solid var(--border)", display: "block" }} />
                  <button
                    onClick={() => update("mappa_img", null)}
                    style={{ position: "absolute", top: 8, right: 8, background: "#fee", border: "1px solid #fcc", borderRadius: 6, color: "#c33", cursor: "pointer", padding: "4px 10px", fontSize: 12, fontFamily: "var(--font-body)" }}
                  >
                    ✕ Rimuovi
                  </button>
                </div>
              )}
            </div>

            {/* Foto immobile */}
            <SubLabel>Foto Immobile</SubLabel>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 10px" }}>Carica fino a 6 foto dell'immobile. Appariranno nel report.</p>
            <input id="fotoUpload" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple style={{ display: "none" }} onChange={(e) => {
              const files = Array.from(e.target.files);
              const remaining = 6 - form.foto_immobile.length;
              files.slice(0, remaining).forEach(file => {
                const reader = new FileReader();
                reader.onload = (ev) => setForm(f => ({ ...f, foto_immobile: [...f.foto_immobile, { id: Date.now() + Math.random(), src: ev.target.result }] }));
                reader.readAsDataURL(file);
              });
              e.target.value = "";
            }} />
            <button onClick={() => document.getElementById("fotoUpload")?.click()} disabled={form.foto_immobile.length >= 6}
              style={{ padding: "12px 20px", borderRadius: 10, border: "2px dashed var(--border)", background: "var(--input-bg)", cursor: form.foto_immobile.length >= 6 ? "default" : "pointer", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-body)", color: "var(--text-secondary)", width: "100%", textAlign: "center", opacity: form.foto_immobile.length >= 6 ? 0.5 : 1 }}
            >📷 Aggiungi foto ({form.foto_immobile.length}/6)</button>
            {form.foto_immobile.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
                {form.foto_immobile.map(f => (
                  <div key={f.id} style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "1.5px solid var(--border)" }}>
                    <img src={f.src} alt="" style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }} />
                    <button onClick={() => setForm(fm => ({ ...fm, foto_immobile: fm.foto_immobile.filter(x => x.id !== f.id) }))}
                      style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: 4, color: "#fff", cursor: "pointer", padding: "2px 6px", fontSize: 11 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {currentStep === 2 && (
          <div style={{ background: "var(--card-bg)", borderRadius: 14, padding: "28px 28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginTop: 20 }}>

            {/* ── EDIFICIO / CONDOMINIO ── */}
            <SectionTitle step="3a">Caratteristiche Edificio / Condominio</SectionTitle>

            <Row>
              <Field label="Anno Costruzione" third>
                <input type="number" style={inputStyle} value={form.anno_costruzione} onChange={(e) => update("anno_costruzione", e.target.value)} placeholder="1960" />
              </Field>
              <Field label="Totale Piani Edificio" third>
                <input type="number" style={inputStyle} value={form.totale_piani} onChange={(e) => update("totale_piani", e.target.value)} placeholder="5" />
              </Field>
              <Field label="Tipologia Edificio" third>
                <Select value={form.tipologia_edificio} onChange={(e) => update("tipologia_edificio", e.target.value)} options={TIPOLOGIA_EDIFICIO} />
              </Field>
            </Row>
            <Row>
              <Field label="Condizioni Facciate" half>
                <Select value={form.condizioni_facciate} onChange={(e) => update("condizioni_facciate", e.target.value)} options={CONDIZIONI_FACCIATE} />
              </Field>
              <Field label="Condizioni Tetto" half>
                <Select value={form.condizioni_tetto} onChange={(e) => update("condizioni_tetto", e.target.value)} options={CONDIZIONI_TETTO} />
              </Field>
            </Row>
            <Row>
              <Field label="Condizioni Atrio / Vano Scale" half>
                <Select value={form.condizioni_atrio} onChange={(e) => update("condizioni_atrio", e.target.value)} options={CONDIZIONI_ATRIO} />
              </Field>
              <Field label="Facilità di Accesso" half>
                <Select value={form.facilita_accesso} onChange={(e) => update("facilita_accesso", e.target.value)} options={FACILITA_ACCESSO} />
              </Field>
            </Row>
            <Row>
              <Field label="Spese Condominiali Annue (€)" half>
                <input type="number" style={inputStyle} value={form.spese_condominiali} onChange={(e) => update("spese_condominiali", e.target.value)} placeholder="1200" />
              </Field>
            </Row>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px", marginTop: 12 }}>
              <Toggle label="Ascensore" checked={form.ascensore} onChange={() => update("ascensore", !form.ascensore)} />
              <Toggle label="Senza Barriere Architettoniche" checked={form.senza_barriere} onChange={() => update("senza_barriere", !form.senza_barriere)} />
              <Toggle label="Area Verde Condominiale" checked={form.area_verde_condominiale} onChange={() => update("area_verde_condominiale", !form.area_verde_condominiale)} />
              <Toggle label="Parcheggi Condominiali Liberi" checked={form.parcheggi_condominiali} onChange={() => update("parcheggi_condominiali", !form.parcheggi_condominiali)} />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div style={{ background: "var(--card-bg)", borderRadius: 14, padding: "28px 28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginTop: 16 }}>

            {/* ── CARATTERISTICHE IMMOBILE ── */}
            <SectionTitle step="3b">Caratteristiche Immobile</SectionTitle>

            <Row>
              <Field label="Superficie Commerciale Interna (mq) *" half>
                <input type="number" style={inputStyle} value={form.superficie_commerciale} onChange={(e) => update("superficie_commerciale", e.target.value)} placeholder="85" />
              </Field>
              <Field label="Stato di Conservazione" half>
                <Select value={form.stato_conservazione} onChange={(e) => update("stato_conservazione", e.target.value)} options={STATI_CONSERVAZIONE} />
              </Field>
            </Row>
            <Row>
              <Field label="Locali" third><input type="number" style={inputStyle} value={form.locali} onChange={(e) => update("locali", e.target.value)} placeholder="4" /></Field>
              <Field label="Camere" third><input type="number" style={inputStyle} value={form.camere} onChange={(e) => update("camere", e.target.value)} placeholder="2" /></Field>
              <Field label="Bagni" third><input type="number" style={inputStyle} value={form.bagni} onChange={(e) => update("bagni", e.target.value)} placeholder="1" /></Field>
            </Row>
            <Row>
              <Field label="Livelli Immobile" third>
                <Select value={form.livelli_immobile} onChange={(e) => update("livelli_immobile", e.target.value)} options={LIVELLI_IMMOBILE} />
              </Field>
            </Row>

            <SubLabel>Altri Vani Collegati</SubLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {ALTRI_VANI.filter(v => v !== "").map(tipo => (
                <button key={tipo} onClick={() => setForm(f => ({ ...f, altri_vani: [...f.altri_vani, { id: Date.now(), tipo, mq: "" }] }))}
                  style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid var(--border)", background: "var(--input-bg)", cursor: "pointer", fontSize: 12, fontFamily: "var(--font-body)", display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s" }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.background = accent + "10"; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--input-bg)"; }}
                >+ {tipo}</button>
              ))}
            </div>
            {form.altri_vani.length === 0 && (
              <div style={{ padding: 16, textAlign: "center", color: "var(--text-secondary)", fontSize: 13, background: "var(--input-bg)", borderRadius: 8, border: "1.5px dashed var(--border)", marginBottom: 12 }}>Nessun vano aggiuntivo. Clicca sopra per aggiungerne.</div>
            )}
            {form.altri_vani.map(v => (
              <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, padding: "10px 14px", background: "var(--input-bg)", borderRadius: 8, border: "1px solid var(--border)" }}>
                <span style={{ fontWeight: 600, fontSize: 13, minWidth: 100 }}>{v.tipo}</span>
                <Field label="" third><input type="number" style={inputStyle} value={v.mq} onChange={(e) => setForm(f => ({ ...f, altri_vani: f.altri_vani.map(x => x.id === v.id ? { ...x, mq: e.target.value } : x) }))} placeholder="Mq" /></Field>
                <button onClick={() => setForm(f => ({ ...f, altri_vani: f.altri_vani.filter(x => x.id !== v.id) }))} style={{ background: "#fee", border: "1px solid #fcc", borderRadius: 6, color: "#c33", cursor: "pointer", padding: "4px 8px", fontSize: 11, fontFamily: "var(--font-body)" }}>✕</button>
              </div>
            ))}

            <SubLabel>Spazi Esterni</SubLabel>
            <Row>
              <Field label="N° Balconi" third><input type="number" style={inputStyle} value={form.balconi} onChange={(e) => update("balconi", e.target.value)} placeholder="1" /></Field>
              <Field label="Mq Balconi (totali)" third><input type="number" style={inputStyle} value={form.balconi_mq} onChange={(e) => update("balconi_mq", e.target.value)} placeholder="8" /></Field>
              <Field label="N° Terrazzi" third><input type="number" style={inputStyle} value={form.terrazzi} onChange={(e) => update("terrazzi", e.target.value)} placeholder="0" /></Field>
            </Row>
            <Row>
              <Field label="Mq Terrazzi (totali)" third><input type="number" style={inputStyle} value={form.terrazzi_mq} onChange={(e) => update("terrazzi_mq", e.target.value)} placeholder="20" /></Field>
              <Field label="N° Giardini" third><input type="number" style={inputStyle} value={form.giardino} onChange={(e) => update("giardino", e.target.value)} placeholder="0" /></Field>
              <Field label="Mq Giardino (totali)" third><input type="number" style={inputStyle} value={form.giardino_mq} onChange={(e) => update("giardino_mq", e.target.value)} placeholder="50" /></Field>
            </Row>
            <Row>
              <Field label="N° Verande" third><input type="number" style={inputStyle} value={form.verande} onChange={(e) => update("verande", e.target.value)} placeholder="0" /></Field>
              <Field label="Mq Verande (totali)" third><input type="number" style={inputStyle} value={form.verande_mq} onChange={(e) => update("verande_mq", e.target.value)} placeholder="10" /></Field>
            </Row>

            <SubLabel>Impianti</SubLabel>
            <Row>
              <Field label="Classe Energetica" third>
                <Select value={form.classe_energetica} onChange={(e) => update("classe_energetica", e.target.value)} options={CLASSI_ENERGETICHE} />
              </Field>
              <Field label="Riscaldamento" third>
                <Select value={form.riscaldamento} onChange={(e) => update("riscaldamento", e.target.value)} options={RISCALDAMENTO} />
              </Field>
              <Field label="Tipologia di Riscaldamento" third>
                <Select value={form.tipologia_riscaldamento} onChange={(e) => update("tipologia_riscaldamento", e.target.value)} options={TIPOLOGIA_RISCALDAMENTO} />
              </Field>
            </Row>
            <Row>
              <Field label="Imp. Elettrico" third>
                <Select value={form.imp_elettrico} onChange={(e) => update("imp_elettrico", e.target.value)} options={IMP_ELETTRICO} />
              </Field>
              <Field label="Imp. Acqua Calda" third>
                <Select value={form.imp_acqua_calda} onChange={(e) => update("imp_acqua_calda", e.target.value)} options={IMP_ACQUA_CALDA} />
              </Field>
              <Field label="Imp. Gas" third>
                <Select value={form.imp_gas} onChange={(e) => update("imp_gas", e.target.value)} options={IMP_GAS} />
              </Field>
            </Row>

            <SubLabel>Qualità dell'immobile</SubLabel>
            <Row>
              <Field label="Vista" third>
                <Select value={form.vista} onChange={(e) => update("vista", e.target.value)} options={VISTA} />
              </Field>
              <Field label="Luminosità" third>
                <Select value={form.luminosita} onChange={(e) => update("luminosita", e.target.value)} options={LUMINOSITA} />
              </Field>
              <Field label="Esposizione" third>
                <input style={inputStyle} value={form.esposizione} onChange={(e) => update("esposizione", e.target.value)} placeholder="Sud-Est" />
              </Field>
            </Row>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px", marginTop: 16 }}>
              <Toggle label="Aria Condizionata" checked={form.aria_condizionata} onChange={() => update("aria_condizionata", !form.aria_condizionata)} />
              <Toggle label="Pannelli Fotovoltaici" checked={form.pannelli_fotovoltaici} onChange={() => update("pannelli_fotovoltaici", !form.pannelli_fotovoltaici)} />
              <Toggle label="Cappotto Interno/Esterno" checked={form.cappotto} onChange={() => update("cappotto", !form.cappotto)} />
              <Toggle label="Caminetto" checked={form.caminetto} onChange={() => update("caminetto", !form.caminetto)} />
            </div>
          </div>
        )}

        {/* ── STEP 3: PERTINENZE ── */}
        {currentStep === 3 && (
          <div style={{ background: "var(--card-bg)", borderRadius: 14, padding: "28px 28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginTop: 20 }}>
            <SectionTitle step="4">Pertinenze</SectionTitle>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px" }}>Aggiungi le pertinenze dell'immobile e il relativo valore.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {PERTINENZE_TYPES.map((pt) => (
                <button key={pt.id} onClick={() => addPertinenza(pt.id)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1.5px solid var(--border)", background: "var(--input-bg)", cursor: "pointer", fontSize: 13, fontFamily: "var(--font-body)", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.background = accent + "10"; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--input-bg)"; }}
                >
                  <span>{pt.icon}</span> + {pt.label}
                </button>
              ))}
            </div>

            {form.pertinenze.length === 0 && (
              <div style={{ padding: 30, textAlign: "center", color: "var(--text-secondary)", fontSize: 14, background: "var(--input-bg)", borderRadius: 10, border: "1.5px dashed var(--border)" }}>
                Nessuna pertinenza aggiunta. Clicca sui pulsanti sopra per aggiungerne.
              </div>
            )}

            {form.pertinenze.map((p) => (
              <div key={p.id} style={{ border: "1.5px solid var(--border)", borderRadius: 10, padding: "16px 18px", marginBottom: 12, background: "var(--input-bg)", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{p.icon} {p.label}</span>
                  <button onClick={() => removePertinenza(p.id)} style={{ background: "#fee", border: "1px solid #fcc", borderRadius: 6, color: "#c33", cursor: "pointer", padding: "4px 10px", fontSize: 12, fontFamily: "var(--font-body)" }}>✕ Rimuovi</button>
                </div>
                <Row>
                  <Field label="Superficie (mq)" third><input type="number" style={inputStyle} value={p.superficie} onChange={(e) => updatePertinenza(p.id, "superficie", e.target.value)} placeholder="12" /></Field>
                  <Field label="Valore (€)" third><input type="number" style={inputStyle} value={p.valore} onChange={(e) => updatePertinenza(p.id, "valore", e.target.value)} placeholder="15000" /></Field>
                  <Field label="Note" third><input style={inputStyle} value={p.note} onChange={(e) => updatePertinenza(p.id, "note", e.target.value)} placeholder="Piano -1, buono stato" /></Field>
                </Row>
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 4: VALUTAZIONE ── */}
        {currentStep === 4 && (
          <div style={{ background: "var(--card-bg)", borderRadius: 14, padding: "28px 28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginTop: 20 }}>
            <SectionTitle step="5">Valutazione Economica</SectionTitle>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px" }}>Inserisci uno o più valori tra minimo, medio e massimo. Solo i valori compilati appariranno nel report.</p>

            <div style={{ background: `linear-gradient(135deg, ${accent}08, ${accent}15)`, borderRadius: 12, padding: 22, marginBottom: 20, border: `1.5px solid ${accent}30` }}>
              <Row>
                <Field label="Valore Minimo (€)" third>
                  <input type="number" style={{ ...inputStyle, fontSize: 17, fontWeight: 700, padding: "12px 14px" }} value={form.valore_min} onChange={(e) => update("valore_min", e.target.value)} placeholder="220.000" />
                </Field>
                <Field label="Valore Medio (€)" third>
                  <input type="number" style={{ ...inputStyle, fontSize: 17, fontWeight: 700, padding: "12px 14px", borderColor: accent + "66" }} value={form.valore_medio} onChange={(e) => update("valore_medio", e.target.value)} placeholder="250.000" />
                </Field>
                <Field label="Valore Massimo (€)" third>
                  <input type="number" style={{ ...inputStyle, fontSize: 17, fontWeight: 700, padding: "12px 14px" }} value={form.valore_max} onChange={(e) => update("valore_max", e.target.value)} placeholder="280.000" />
                </Field>
              </Row>
              {form.superficie_commerciale && (
                <div style={{ marginTop: 12, display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {form.valore_min && <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Min: {Math.round(Number(form.valore_min) / Number(form.superficie_commerciale)).toLocaleString("it-IT")} €/mq</span>}
                  {form.valore_medio && <span style={{ fontSize: 13, color: accent, fontWeight: 600 }}>Medio: {Math.round(Number(form.valore_medio) / Number(form.superficie_commerciale)).toLocaleString("it-IT")} €/mq</span>}
                  {form.valore_max && <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Max: {Math.round(Number(form.valore_max) / Number(form.superficie_commerciale)).toLocaleString("it-IT")} €/mq</span>}
                </div>
              )}
            </div>

            {/* Riepilogo pertinenze */}
            {form.pertinenze.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10 }}>RIEPILOGO PERTINENZE</h3>
                {form.pertinenze.map((p) => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
                    <span>{p.icon} {p.label} {p.superficie ? `(${p.superficie} mq)` : ""}</span>
                    <span style={{ fontWeight: 600 }}>{p.valore ? fmt(p.valore) : "—"}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Totale */}
            <div style={{ background: accent, color: "#fff", borderRadius: 12, padding: "18px 22px", marginBottom: 24, boxShadow: `0 4px 15px ${accent}44` }}>
              {form.valore_min && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: form.valore_medio || form.valore_max ? 8 : 0, opacity: 0.85 }}>
                  <span style={{ fontSize: 13 }}>Valore Totale Minimo</span>
                  <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-heading)" }}>{fmt(totalValue("valore_min"))}</span>
                </div>
              )}
              {form.valore_medio && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: form.valore_max ? 8 : 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-heading)" }}>VALORE TOTALE STIMATO</span>
                  <span style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-heading)" }}>{fmt(totalValue("valore_medio"))}</span>
                </div>
              )}
              {form.valore_max && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", opacity: 0.85 }}>
                  <span style={{ fontSize: 13 }}>Valore Totale Massimo</span>
                  <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-heading)" }}>{fmt(totalValue("valore_max"))}</span>
                </div>
              )}
              {!form.valore_min && !form.valore_medio && !form.valore_max && (
                <div style={{ textAlign: "center", padding: 8, opacity: 0.7 }}>Inserisci almeno un valore</div>
              )}
            </div>

            <Field label="Note sulla Valutazione" full>
              <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={form.note_valutazione} onChange={(e) => update("note_valutazione", e.target.value)} placeholder="Es. Valutazione basata su comparabili di zona, stato dell'immobile e posizione..." />
            </Field>

            <div style={{ marginTop: 16 }}>
              <Field label="Data Valutazione" half>
                <input type="date" style={inputStyle} value={form.data_valutazione} onChange={(e) => update("data_valutazione", e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        {/* ── STEP 5: REVISIONE TESTI ── */}
        {currentStep === 5 && (() => {
          // Auto-generate texts on first visit OR when zona changed
          const needsGenerate = !form.testo_mercato || (form.zona !== form.testo_zona_generata_per);
          if (needsGenerate) {
            const t = generateTexts();
            setTimeout(() => setForm(f => ({
              ...f,
              testo_mercato: f.testo_mercato || t.mercato,
              testo_zona: (f.zona !== f.testo_zona_generata_per) ? t.zona : (f.testo_zona || t.zona),
              servizi_zona: (f.zona !== f.testo_zona_generata_per) ? t.servizi : (f.servizi_zona || t.servizi),
              testo_zona_generata_per: f.zona,
            })), 0);
          }
          return (
            <div style={{ background: "var(--card-bg)", borderRadius: 14, padding: "28px 28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginTop: 20 }}>
              <SectionTitle step="6">Revisione Testi del Report</SectionTitle>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 20px", lineHeight: 1.6 }}>
                I testi seguenti verranno inseriti nel report finale. Sono stati generati automaticamente ma puoi modificarli liberamente prima di salvare.
              </p>

              {/* Mercato */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.5px" }}>Il Mercato Immobiliare a Trieste</label>
                  <button onClick={async () => {
                    try { await window.storage.set("saved_testo_mercato", form.testo_mercato); setSavedMercato(true); } catch (e) {}
                  }}
                    style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: savedMercato ? "#e8f5e9" : accent, color: savedMercato ? "#2e7d32" : "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "var(--font-body)" }}>
                    {savedMercato ? "✓ Salvato" : "💾 Salva per tutte le valutazioni"}
                  </button>
                </div>
                <textarea
                  style={{ ...inputStyle, minHeight: 180, resize: "vertical", lineHeight: 1.7, fontSize: 13 }}
                  value={form.testo_mercato}
                  onChange={(e) => { update("testo_mercato", e.target.value); setSavedMercato(false); }}
                  placeholder="Descrizione del mercato immobiliare..."
                />
              </div>

              {/* Zona */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.5px" }}>Analisi della Zona: {form.zona || "—"}</label>
                  <button onClick={() => { const t = generateTexts(); update("testo_zona", t.zona); }}
                    style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${accent}40`, background: `${accent}08`, color: accent, cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "var(--font-body)" }}>
                    🔄 Rigenera
                  </button>
                </div>
                <textarea
                  style={{ ...inputStyle, minHeight: 120, resize: "vertical", lineHeight: 1.7, fontSize: 13 }}
                  value={form.testo_zona}
                  onChange={(e) => update("testo_zona", e.target.value)}
                  placeholder="Descrizione della zona..."
                />
              </div>

              {/* Servizi zona */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.5px" }}>Servizi Principali della Zona</label>
                  <button onClick={() => { const t = generateTexts(); update("servizi_zona", t.servizi); }}
                    style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${accent}40`, background: `${accent}08`, color: accent, cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "var(--font-body)" }}>
                    🔄 Rigenera
                  </button>
                </div>
                <textarea
                  style={{ ...inputStyle, minHeight: 60, resize: "vertical", lineHeight: 1.7, fontSize: 13 }}
                  value={form.servizi_zona}
                  onChange={(e) => update("servizi_zona", e.target.value)}
                  placeholder="Es. Scuole, supermercati, trasporti pubblici, aree verdi..."
                />
              </div>

              {/* Descrizione immobile */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Descrizione dell'Immobile</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 120, resize: "vertical", lineHeight: 1.7, fontSize: 13 }}
                  value={form.descrizione_manuale}
                  onChange={(e) => update("descrizione_manuale", e.target.value)}
                  placeholder="Descrizione dell'immobile..."
                />
              </div>

              {/* SAVE */}
              <button
                onClick={async () => { const ok = await saveValutazione(); if (ok) alert("Valutazione salvata con successo! Ora puoi generare il report dalla sezione Report."); }}
                style={{ marginTop: 8, width: "100%", padding: "16px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-heading)", letterSpacing: "0.5px", boxShadow: `0 4px 15px ${accent}44`, transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 6px 20px ${accent}55`; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 15px ${accent}44`; }}
              >
                💾 Salva Valutazione e Genera Report
              </button>
            </div>
          );
        })()}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--card-bg)", borderTop: "1px solid var(--border)", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 100, boxShadow: "0 -2px 10px rgba(0,0,0,0.06)" }}>
        <button onClick={() => setCurrentStep((s) => Math.max(0, s - 1))} disabled={currentStep === 0}
          style={{ padding: "10px 24px", borderRadius: 8, border: "1.5px solid var(--border)", background: "var(--card-bg)", cursor: currentStep === 0 ? "default" : "pointer", opacity: currentStep === 0 ? 0.4 : 1, fontSize: 14, fontFamily: "var(--font-body)", fontWeight: 600 }}>
          ← Indietro
        </button>
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{currentStep + 1} / {steps.length}</span>
        {currentStep < steps.length - 1 ? (
          <button onClick={() => setCurrentStep((s) => Math.min(steps.length - 1, s + 1))} disabled={!canProceed()}
            style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: canProceed() ? accent : "#ccc", color: "#fff", cursor: canProceed() ? "pointer" : "default", fontSize: 14, fontFamily: "var(--font-body)", fontWeight: 600, transition: "background 0.2s" }}>
            Avanti →
          </button>
        ) : (
          <div style={{ width: 100 }} />
        )}
      </div>
    </div>
  );
}
