import { useState, useEffect, useRef } from "react";

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

const LIVELLI_IMMOBILE = ["", "1", "2", "3", "4", "5"];

const ALTRI_VANI = ["", "Mansarda", "Taverna", "Seminterrato", "Sottotetto"];

const IMP_ELETTRICO = ["", "Certificato", "Funzionante", "Da rifare"];

const IMP_ACQUA_CALDA = ["", "Autonoma boiler elettrico", "Autonoma pompa di calore", "Autonoma caldaia", "Centralizzata", "Da rifare"];

const ZONE_TRIESTE = [
  "", "Centro Storico", "Borgo Giuseppino", "Borgo Teresiano", "San Vito",
  "Città Vecchia", "Cavana", "San Giacomo", "Roiano", "Gretta", "Barcola",
  "Cologna", "Scorcola", "Chiadino", "Rozzol", "San Giovanni", "Ponziana",
  "Barriera Vecchia", "Barriera Nuova", "Servola", "Muggia", "Opicina",
  "Basovizza", "Prosecco", "Altro",
];

const initialFormData = {
  agenzia_nome: "", agenzia_indirizzo: "", agenzia_telefono: "", agenzia_email: "",
  agenzia_colore: "#1a3a5c", agenzia_logo: null, agenzia_modus_operandi: "",
  agente_nome: "", agente_telefono: "", agente_email: "",
  tipologia: "Appartamento", indirizzo: "", civico: "", cap: "34100", citta: "Trieste",
  zona: "", piano: "", totale_piani: "", interno: "", scala: "",
  lat: null, lng: null, mappa_img: null,
  superficie_commerciale: "", locali: "", camere: "", bagni: "",
  livelli_immobile: "", altri_vani: "", altri_vani_mq: "",
  balconi: "", balconi_mq: "", terrazzi: "", terrazzi_mq: "",
  giardino: "", giardino_mq: "", verande: "", verande_mq: "",
  stato_conservazione: "", anno_costruzione: "", classe_energetica: "",
  riscaldamento: "", tipologia_riscaldamento: "",
  vista: "", luminosita: "", esposizione: "",
  condizioni_facciate: "", tipologia_edificio: "",
  condizioni_tetto: "", condizioni_atrio: "", spese_condominiali: "", facilita_accesso: "",
  area_verde_condominiale: false, parcheggi_condominiali: false,
  imp_elettrico: "", imp_acqua_calda: "", cappotto: false,
  ascensore: false, aria_condizionata: false, pannelli_fotovoltaici: false,
  senza_barriere: false,
  valore_min: "", valore_medio: "", valore_max: "",
  note_valutazione: "", descrizione_manuale: "",
  testo_mercato: "", testo_zona: "", testo_zona_generata_per: "",
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
  const [savedAgency, setSavedAgency] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [agentsList, setAgentsList] = useState([]);
  const fileInputRef = useRef(null);
  const accent = form.agenzia_colore || "#1a3a5c";

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("agency_settings");
        if (res && res.value) {
          const data = JSON.parse(res.value);
          setForm((f) => ({ ...f, ...data }));
          setSavedAgency(true);
          if (data.agenzia_logo) setLogoPreview(data.agenzia_logo);
        }
        // Load agents
        const agRes = await window.storage.get("agents_list");
        if (agRes && agRes.value) setAgentsList(JSON.parse(agRes.value));
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

  const saveAgency = async () => {
    const d = { agenzia_nome: form.agenzia_nome, agenzia_indirizzo: form.agenzia_indirizzo, agenzia_telefono: form.agenzia_telefono, agenzia_email: form.agenzia_email, agenzia_colore: form.agenzia_colore, agenzia_logo: logoPreview, agenzia_modus_operandi: form.agenzia_modus_operandi };
    try { await window.storage.set("agency_settings", JSON.stringify(d)); setSavedAgency(true); } catch (e) {}
  };

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setLogoPreview(ev.target.result); update("agenzia_logo", ev.target.result); };
    reader.readAsDataURL(file);
  };

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
    // Market text
    const mercato = `Il mercato immobiliare triestino presenta caratteristiche peculiari legate alla posizione geografica di confine, alla forte identità culturale della città e ad un tessuto urbano prevalentemente storico. Trieste è una città che negli ultimi anni ha registrato un crescente interesse da parte di acquirenti, anche internazionali, attratti dalla qualità della vita, dai costi ancora competitivi rispetto ad altre città italiane di dimensioni analoghe e dalla crescente offerta culturale e turistica.\n\nIl comparto residenziale mostra una domanda sostenuta nelle zone centrali e semicentrali, con particolare interesse per gli immobili ristrutturati o in buono stato di conservazione. Gli edifici d'epoca, numerosi nel centro storico e nei borghi teresiani e giuseppini, rappresentano un segmento di mercato particolarmente apprezzato quando dotati di elementi di pregio architettonico.\n\nI tempi medi di vendita si attestano tra i 3 e i 6 mesi per immobili correttamente posizionati nel prezzo, con variazioni significative in funzione della zona, dello stato dell'immobile e della qualità dell'offerta.`;

    // Zone-specific text with OMI data and market context
    const zoneTexts = {
      "Centro Storico": "Il Centro Storico rappresenta il cuore pulsante della città, sviluppandosi attorno a Piazza Unità d'Italia — una delle piazze affacciate sul mare più grandi d'Europa — e lungo le vie eleganti che ne definiscono l'identità: Corso Italia, Via Mazzini, Via Dante, Via Carducci. La zona è caratterizzata da edifici d'epoca di notevole pregio architettonico, molti dei quali risalenti al periodo asburgico, con facciate neoclassiche e liberty che conferiscono al quartiere un carattere unico nel panorama italiano.\n\nLa dotazione di servizi è di primo livello: attività commerciali di pregio, ristoranti, teatri (tra cui il celebre Teatro Verdi), istituti bancari e uffici pubblici. La rete di trasporti pubblici garantisce collegamenti eccellenti con tutte le zone della città.\n\nSecondo i dati dell'Osservatorio del Mercato Immobiliare dell'Agenzia delle Entrate (OMI), il Centro Storico rientra nella zona B2, con quotazioni per abitazioni civili in stato normale comprese tra 1.650 e 2.650 €/mq. I dati di Immobiliare.it indicano un prezzo medio richiesto di circa 3.388 €/mq, con una crescita annua superiore al 14%. La zona Centro Storico/Città Vecchia/Rive registra le quotazioni più elevate della città, con punte fino a 3.662 €/mq per gli immobili di pregio.\n\nLa domanda è sostenuta sia da acquirenti locali che internazionali — in particolare austriaci, ungheresi, tedeschi e sloveni — attratti dal fascino mitteleuropeo della città e da quotazioni ancora competitive rispetto ad altre città storiche italiane. Gli immobili ristrutturati ai piani alti con affaccio sulle vie principali o con vista mare raggiungono le quotazioni più elevate, con tempi di assorbimento tra i 2 e i 4 mesi quando correttamente posizionati nel prezzo.",
      "Borgo Teresiano": "Il Borgo Teresiano è il quartiere razionale progettato nel XVIII secolo per volere dell'imperatrice Maria Teresa d'Austria, uno dei primi esempi europei di pianificazione urbanistica moderna. Il suo elemento più iconico è il Canal Grande, l'antico porto-canale attorno al quale si sviluppano palazzi neoclassici di grande valore, tra cui la Chiesa di Sant'Antonio Taumaturgo e la Chiesa Serbo-Ortodossa di San Spiridione con le sue cupole azzurre.\n\nIl quartiere ospita importanti istituzioni culturali, il Teatro Lirico Giuseppe Verdi, numerose librerie storiche, caffè letterari e ristoranti di alto livello. La Stazione Centrale si trova al suo margine settentrionale, garantendo eccellenti collegamenti ferroviari.\n\nDal punto di vista immobiliare, il Borgo Teresiano rientra nella zona OMI B1 (Centro Urbano), con quotazioni OMI per abitazioni civili comprese tra 1.450 e 2.350 €/mq. I prezzi di mercato effettivi per gli immobili di pregio superano ampiamente questi valori, attestandosi nella fascia 2.800-3.800 €/mq per le soluzioni ristrutturate nei palazzi d'epoca lungo il Canal Grande.\n\nRappresenta una delle aree più ricercate della città, con una domanda costante sia da parte di acquirenti residenziali che di investitori. Gli immobili di ampia metratura con caratteristiche d'epoca conservate (soffitti affrescati, pavimenti originali, boiserie) raggiungono le valutazioni più elevate.",
      "Borgo Giuseppino": "Il Borgo Giuseppino si sviluppa tra il colle di San Giusto e il centro città, prendendo il nome dall'imperatore Giuseppe II d'Asburgo. Il quartiere è caratterizzato da un tessuto urbano ordinato e ben pianificato, con palazzi ottocenteschi di buona qualità costruttiva, vie ampie e una piacevole alternanza tra residenze signorili e edifici civili.\n\nLa zona ospita la Cattedrale di San Giusto, il Castello e il Museo Civico, oltre a numerose attività commerciali e artigianali. La posizione collinare offre scorci panoramici sulla città e sul golfo.\n\nIl quartiere rientra nella zona OMI B1/B2, con quotazioni per abitazioni civili che si attestano tra 1.500 e 2.500 €/mq a seconda dello stato conservativo. I prezzi di mercato effettivi per gli immobili ristrutturati si collocano mediamente tra 2.400 e 3.200 €/mq.\n\nLa domanda è sostenuta e stabile, con particolare apprezzamento per gli immobili con vista sulla cattedrale, sul castello e sul golfo.",
      "San Vito": "San Vito è un rione storico situato sull'omonimo colle a sud del centro città, con vedute panoramiche sulla città e sul golfo che ne rappresentano il principale punto di forza. Il quartiere è attraversato da caratteristiche vie in salita e scalinate che lo collegano alla zona del Porto Vecchio e al centro.\n\nIl tessuto urbano è misto, con edifici d'epoca di diverse qualità affiancati da costruzioni più recenti. La zona offre servizi di prossimità adeguati e una buona accessibilità pedonale al centro città.\n\nSan Vito rientra nelle zone OMI B2/C1, con quotazioni per abitazioni civili comprese tra 1.350 e 2.200 €/mq. I dati di Idealista indicano che il quartiere Centro-San Vito raggiunge quotazioni medie di circa 3.365 €/mq per gli immobili di pregio. Offre un buon rapporto qualità-prezzo rispetto alle zone più centrali, con premi significativi per gli immobili con vista panoramica sul golfo.",
      "Città Vecchia": "La Città Vecchia è il nucleo storico più antico di Trieste, un dedalo di calli strette, piazzette nascoste ed edifici medievali e rinascimentali che si sviluppa ai piedi del colle di San Giusto, tra la cattedrale e il Teatro Romano di epoca augustea.\n\nNegli ultimi anni la zona è stata oggetto di significativi interventi di riqualificazione urbana, con l'apertura di nuove attività commerciali, gallerie d'arte, locali e spazi culturali.\n\nLa Città Vecchia rientra nella zona OMI B2, con quotazioni per abitazioni civili comprese tra 1.650 e 2.650 €/mq. I dati di mercato mostrano quotazioni medie di circa 3.335 €/mq per gli immobili in vendita. Il potenziale di rivalutazione è tra i più elevati della città.\n\nGli immobili ristrutturati con gusto, che conservano elementi architettonici originali come archi in pietra, volte e pavimenti antichi, sono particolarmente ricercati sia da acquirenti italiani che stranieri.",
      "Cavana": "Cavana è il quartiere adiacente al Porto Vecchio e alla zona del Molo Audace, uno dei luoghi più suggestivi di Trieste. La zona è in forte rivalutazione grazie ai grandi progetti di riqualificazione del Porto Vecchio — un'area di oltre 60 ettari destinata a diventare un nuovo polo urbano.\n\nCavana rientra nella zona OMI B2, con quotazioni per abitazioni civili comprese tra 1.650 e 2.650 €/mq. I prezzi di mercato per gli immobili ristrutturati si attestano tra 2.500 e 3.300 €/mq, con tendenza al rialzo.\n\nIl quartiere presenta un buon potenziale di crescita nel medio termine, legato all'avanzamento dei progetti di riqualificazione del Porto Vecchio.",
      "Barcola": "Barcola è la zona residenziale costiera più ambita di Trieste, celebre per la sua passeggiata lungomare — il \"salotto estivo\" dei triestini — e per il panorama sul Castello di Miramare e sull'intero golfo.\n\nLa zona offre una qualità della vita eccezionale: accesso diretto al mare con i caratteristici \"topolini\", piste ciclabili, il parco di Villa Revoltella e la vicinanza alla Riserva Naturale di Miramare.\n\nBarcola rientra nella zona OMI D3 (Parte Gretta - Barcola - Costiera), con quotazioni che raggiungono i valori massimi della città, fino a 3.200 €/mq secondo l'OMI. I dati di Immobiliare.it indicano che la zona Costiera raggiunge punte di circa 5.104 €/mq, con le soluzioni con vista mare diretta che spuntano i prezzi più elevati in assoluto a Trieste.\n\nLa domanda è costantemente superiore all'offerta, con tempi di vendita tra i più brevi del mercato.",
      "San Giacomo": "San Giacomo è il quartiere più popoloso e vivace di Trieste, con il celebre mercato rionale all'aperto — tra i più estesi d'Europa. Il quartiere ha un'identità multiculturale forte e una vita di quartiere autentica.\n\nSan Giacomo rientra nella zona OMI C2 (San Giacomo - Chiarbola - Servola), con quotazioni tra le più accessibili della città: da 1.210 €/mq (valore minimo OMI cittadino) fino a circa 1.800 €/mq. La zona registra oltre 260 annunci immobiliari attivi, il numero più alto della città.\n\nParticolarmente interessante per giovani coppie, famiglie e investitori alla ricerca di buoni rendimenti locativi, con canoni medi di circa 12,46 €/mq mensili secondo Immobiliare.it.",
      "Roiano": "Roiano è un quartiere residenziale collinare situato a nord-ovest del centro, in posizione privilegiata tra il centro e Barcola. Apprezzato per la qualità della vita, la presenza di aree verdi e la vicinanza alla passeggiata di Barcola.\n\nRoiano rientra nella zona OMI C4/D3, con quotazioni per abitazioni civili comprese tra 1.400 e 2.400 €/mq. I prezzi per gli immobili ristrutturati con vista panoramica possono superare i 2.800 €/mq.\n\nParticolarmente ricercati gli immobili con vista mare e le villette con giardino.",
      "Gretta": "Gretta è un quartiere residenziale lungo la strada costiera che collega il centro a Barcola, con una posizione favorevole tra i servizi del centro e l'accesso al mare.\n\nGretta rientra nella zona OMI D3 (Parte Gretta - Barcola - Costiera), con quotazioni per abitazioni civili che partono da circa 1.300 €/mq. I prezzi di mercato si attestano tra 1.800 e 2.800 €/mq.\n\nI valori più elevati si registrano nella parte alta del quartiere con vista sul golfo e nelle vicinanze della passeggiata di Barcola.",
      "Scorcola": "Scorcola è una zona residenziale collinare sopra il centro città, con viste panoramiche eccezionali sulla città e sul golfo. Caratterizzata da edifici residenziali e ville, offre un contesto tranquillo e riservato.\n\nScorcola rientra nella zona OMI C5, con quotazioni tra le più alte delle zone collinari. I dati OMI indicano valori per box e posti auto fino a 2.600 €/mq, a testimonianza del pregio della zona. I prezzi per gli appartamenti si attestano tra 2.200 e 3.200 €/mq.\n\nParticolarmente ricercate le ville e gli appartamenti con ampia terrazza panoramica.",
      "Chiadino": "Chiadino è un quartiere residenziale collinare a nord del centro, con palazzine degli anni '50-'70 e alcune ville. Offre tranquillità e verde con buoni collegamenti verso il centro.\n\nChiadino rientra nella zona OMI C3/C4, con quotazioni per abitazioni civili comprese tra 1.300 e 2.100 €/mq. I prezzi di mercato si attestano tra 1.800 e 2.500 €/mq.\n\nBuon rapporto qualità-prezzo per chi cerca spazi abitativi più ampi rispetto al centro.",
      "Barriera Nuova": "La Barriera Nuova è una zona semicentrale tra il Borgo Teresiano e i quartieri orientali. Il nome deriva dalle antiche barriere doganali. Tessuto urbano residenziale con buona dotazione di servizi commerciali.\n\nRientra nella zona OMI B1/C1, con quotazioni per abitazioni civili comprese tra 1.350 e 2.200 €/mq. I prezzi di mercato si attestano tra 1.900 e 2.800 €/mq.\n\nBuon compromesso tra centralità e quotazioni più contenute rispetto al cuore del centro storico.",
      "Barriera Vecchia": "La Barriera Vecchia è il quartiere più multiculturale di Trieste, situato a est del centro. Vivace e dinamico, con negozi etnici, ristoranti internazionali e un processo di rinnovamento in corso.\n\nRientra nella zona OMI C1, con quotazioni per abitazioni civili comprese tra 1.250 e 2.000 €/mq. I prezzi di mercato si attestano tra 1.600 e 2.400 €/mq.\n\nQuotazioni tra le più accessibili delle zone semicentrali, con buone opportunità per prima casa e investimenti locativi.",
      "Ponziana": "Ponziana è un quartiere residenziale nella fascia orientale, tra San Giacomo e Rozzol. Tessuto urbano misto con servizi di base adeguati.\n\nRientra nella zona OMI C1/C2, con quotazioni per abitazioni civili comprese tra 1.200 e 1.900 €/mq. I canoni di locazione nella macro-zona raggiungono i 12,46 €/mq mensili secondo Immobiliare.it.\n\nBuon rapporto tra superficie abitativa e prezzo, interessante per famiglie e investitori.",
      "Rozzol": "Rozzol è un quartiere residenziale collinare nella parte orientale, con edifici degli anni '60-'80. Posizione elevata con scorci panoramici.\n\nRientra nella zona OMI C3/D1, con quotazioni per abitazioni civili comprese tra 1.100 e 1.700 €/mq. I dati di WikiCasa confermano quotazioni nella fascia bassa del mercato.\n\nAccessibile per chi cerca la prima casa con possibilità di parcheggio più agevoli rispetto al centro.",
      "San Giovanni": "San Giovanni è un quartiere residenziale orientale, noto per il Parco di San Giovanni (ex Ospedale Psichiatrico, oggi area verde culturale) e la vicinanza all'Università degli Studi di Trieste.\n\nRientra nella zona OMI C2/D1, con quotazioni per abitazioni civili comprese tra 1.100 e 1.800 €/mq. La presenza dell'università genera una domanda stabile di affitti.\n\nIl Parco di San Giovanni rappresenta un elemento di qualità per la vita residenziale nel quartiere.",
      "Cologna": "Cologna è un quartiere residenziale nella parte sud-orientale, con carattere prevalentemente popolare e buoni collegamenti con il centro.\n\nRientra nella zona OMI C2/D1, con quotazioni per abitazioni civili comprese tra 1.100 e 1.700 €/mq.\n\nInteressante per chi cerca la prima casa o soluzioni economiche. Figura tra le zone con il maggior numero di annunci immobiliari.",
      "Servola": "Servola è un quartiere periferico nella parte meridionale, storicamente legato alle attività industriali e portuali. In fase di trasformazione.\n\nRientra nella zona OMI C2, con le quotazioni più accessibili della città: da 1.210 €/mq (valore minimo OMI cittadino). I dati di mercato confermano quotazioni medie di circa 1.805 €/mq.\n\nOpportunità per investitori e per chi cerca soluzioni economiche con potenziale di rivalutazione.",
      "Muggia": "Muggia è un incantevole borgo marinaro a circa 10 km a sud di Trieste, l'ultimo comune italiano prima del confine sloveno. Il centro storico di impianto veneziano — con calli, campielli e il mandracchio — è affacciato sulla baia omonima.\n\nLa cittadina offre un porto turistico, spiagge, il celebre Carnevale Muggesano e una tradizione gastronomica legata al mare. Muggia rientra nella zona OMI E1, con quotazioni che superano i 2.000 €/mq nelle posizioni migliori secondo i dati OMI regionali.\n\nIl mercato attrae sia residenti che cercano una vita più tranquilla sia acquirenti alla ricerca di seconde case in un contesto marinaro. La domanda internazionale è in crescita, soprattutto da parte di acquirenti sloveni e austriaci.",
      "Opicina": "Opicina (in sloveno Opčine) è la località carsica che domina Trieste dall'alto, a circa 300 metri sul livello del mare. Raggiungibile con il suggestivo Tram de Opcina — una delle ultime tramvie a cremagliera d'Europa — e dalla Strada Napoleonica, percorso panoramico amatissimo.\n\nL'area è ricca di sentieri naturalistici, grotte e le tipiche osmize carsiche. Opicina rientra nella zona OMI D2/R1, con quotazioni per abitazioni civili comprese tra 1.200 e 2.000 €/mq, con valori più elevati per ville e immobili con giardino e vista panoramica.\n\nMercato orientato alle soluzioni indipendenti, ideale per famiglie e chi cerca verde e spazio (15-20 minuti dal centro).",
      "Basovizza": "Basovizza è una frazione carsica sull'altopiano a est di Trieste, nota per il Monumento Nazionale della Foiba e per i centri di ricerca scientifica (Sincrotrone Elettra, ICTP).\n\nRientra nella zona OMI R1, con quotazioni accessibili per soluzioni indipendenti con giardino.\n\nIdeale per chi cerca tranquillità, spazi aperti e il contatto con la natura del Carso.",
      "Prosecco": "Prosecco (in sloveno Prosek) è una frazione carsica a nord-ovest di Trieste, nota per la tradizione vinicola — il toponimo precede e non è correlato al celebre vino veneto — e per le tipiche osmize.\n\nRientra nella zona OMI R1/E3, con quotazioni contenute. Mercato di nicchia orientato alle case tradizionali carsiche.\n\nZona ideale per chi ama la natura, la tranquillità e le tradizioni del Carso triestino.",
    };
    const zonaBase = form.zona && zoneTexts[form.zona] ? zoneTexts[form.zona] : "La zona in cui è ubicato l'immobile presenta caratteristiche residenziali con una dotazione di servizi adeguata alle esigenze abitative.";
    const zona = `L'immobile oggetto di valutazione è ubicato nella zona ${form.zona || "—"} di Trieste. ${zonaBase}`;

    return { mercato, zona };
  };

  const steps = [
    { label: "Agenzia", icon: "🏢" },
    { label: "Immobile", icon: "📍" },
    { label: "Caratteristiche", icon: "📐" },
    { label: "Pertinenze", icon: "🅿️" },
    { label: "Valutazione", icon: "💰" },
    { label: "Revisione", icon: "✏️" },
  ];

  const canProceed = () => {
    if (currentStep === 0) return form.agenzia_nome;
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
      <div style={{ background: `linear-gradient(135deg, ${accent}, ${accent}dd)`, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {logoPreview ? (
            <img src={logoPreview} alt="Logo" style={{ height: 44, width: 44, objectFit: "contain", borderRadius: 8, background: "#fff", padding: 4 }} />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: 8, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏠</div>
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: "var(--font-heading)", letterSpacing: "-0.5px" }}>{form.agenzia_nome || "Valutazione Immobiliare"}</h1>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>Trieste — Strumento di Valutazione Professionale</div>
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

        {/* ── STEP 0: AGENZIA ── */}
        {currentStep === 0 && (
          <div style={{ background: "var(--card-bg)", borderRadius: 14, padding: "28px 28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginTop: 20 }}>
            <SectionTitle step="1">Dati Agenzia</SectionTitle>
            <Row>
              <Field label="Nome Agenzia *" half><input style={inputStyle} value={form.agenzia_nome} onChange={(e) => update("agenzia_nome", e.target.value)} placeholder="Es. Immobiliare Trieste" /></Field>
              <Field label="Colore Brand" half>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input type="color" value={form.agenzia_colore} onChange={(e) => update("agenzia_colore", e.target.value)} style={{ width: 44, height: 38, border: "none", borderRadius: 6, cursor: "pointer", padding: 0 }} />
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{form.agenzia_colore}</span>
                </div>
              </Field>
            </Row>
            <Row>
              <Field label="Indirizzo Agenzia" half><input style={inputStyle} value={form.agenzia_indirizzo} onChange={(e) => update("agenzia_indirizzo", e.target.value)} placeholder="Via Roma 1, Trieste" /></Field>
              <Field label="Telefono" half><input style={inputStyle} value={form.agenzia_telefono} onChange={(e) => update("agenzia_telefono", e.target.value)} placeholder="+39 040 123456" /></Field>
            </Row>
            <Row>
              <Field label="Email" half><input style={inputStyle} value={form.agenzia_email} onChange={(e) => update("agenzia_email", e.target.value)} placeholder="info@agenzia.it" /></Field>
              <Field label="Logo Agenzia" half>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogo} style={{ display: "none" }} />
                  <button onClick={() => fileInputRef.current?.click()} style={{ padding: "10px 18px", border: "1.5px dashed var(--border)", borderRadius: 8, background: "var(--input-bg)", cursor: "pointer", fontSize: 13, fontFamily: "var(--font-body)", color: "var(--text-secondary)" }}>📎 Carica logo</button>
                  {logoPreview && <img src={logoPreview} alt="logo" style={{ height: 36, borderRadius: 6 }} />}
                </div>
              </Field>
            </Row>
            <div style={{ marginTop: 16 }}>
              <Field label="Agente" full>
                {agentsList.length > 0 ? (
                  <select style={selectStyle} value={form.agente_nome} onChange={(e) => {
                    const sel = agentsList.find(a => `${a.cognome} ${a.nome}` === e.target.value);
                    if (sel) {
                      setForm(f => ({ ...f, agente_nome: `${sel.cognome} ${sel.nome}`, agente_telefono: sel.telefono || "", agente_email: sel.email || "" }));
                    } else {
                      update("agente_nome", e.target.value);
                    }
                  }}>
                    <option value="">— Seleziona agente —</option>
                    {agentsList.map(a => <option key={a.id} value={`${a.cognome} ${a.nome}`}>{a.cognome} {a.nome}</option>)}
                  </select>
                ) : (
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", padding: "10px 0" }}>
                    Nessun agente registrato. Vai alla Dashboard → tab Agenti per aggiungerne.
                  </div>
                )}
              </Field>
            </div>
            {form.agente_nome && (
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 8, display: "flex", gap: 16 }}>
                {form.agente_telefono && <span>📞 {form.agente_telefono}</span>}
                {form.agente_email && <span>📧 {form.agente_email}</span>}
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              <Field label="Modus Operandi / Criteri di Valutazione" full>
                <textarea style={{ ...inputStyle, minHeight: 110, resize: "vertical" }} value={form.agenzia_modus_operandi} onChange={(e) => update("agenzia_modus_operandi", e.target.value)} placeholder="Descrivi la metodologia e i criteri utilizzati per le valutazioni immobiliari. Es: La valutazione viene effettuata attraverso il metodo comparativo di mercato, analizzando le compravendite recenti di immobili simili nella medesima zona..." />
              </Field>
            </div>
            <button onClick={saveAgency} style={{ marginTop: 18, padding: "10px 22px", borderRadius: 8, border: "none", background: savedAgency ? "#e8f5e9" : accent, color: savedAgency ? "#2e7d32" : "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}>
              {savedAgency ? "✓ Dati agenzia salvati" : "Salva dati agenzia"}
            </button>
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
              <Field label="Zona" half><Select value={form.zona} onChange={(e) => update("zona", e.target.value)} options={ZONE_TRIESTE} placeholder="— Seleziona zona —" /></Field>
            </Row>
            <Row>
              <Field label="Indirizzo *" half><input style={inputStyle} value={form.indirizzo} onChange={(e) => update("indirizzo", e.target.value)} placeholder="Via Carducci" /></Field>
              <Field label="Civico" third><input style={inputStyle} value={form.civico} onChange={(e) => update("civico", e.target.value)} placeholder="12" /></Field>
              <Field label="CAP" third><input style={inputStyle} value={form.cap} onChange={(e) => update("cap", e.target.value)} placeholder="34100" /></Field>
            </Row>
            <Row>
              <Field label="Piano" half><input style={inputStyle} value={form.piano} onChange={(e) => update("piano", e.target.value)} placeholder="3" /></Field>
              <Field label="Interno" half><input style={inputStyle} value={form.interno} onChange={(e) => update("interno", e.target.value)} placeholder="7" /></Field>
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
          </div>
        )}

        {/* ── STEP 2: CARATTERISTICHE ── */}
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
              <Field label="Altri Vani Collegati" third>
                <Select value={form.altri_vani} onChange={(e) => { update("altri_vani", e.target.value); if (!e.target.value) update("altri_vani_mq", ""); }} options={ALTRI_VANI} />
              </Field>
              {form.altri_vani && (
                <Field label={`Mq ${form.altri_vani}`} third>
                  <input type="number" style={inputStyle} value={form.altri_vani_mq} onChange={(e) => update("altri_vani_mq", e.target.value)} placeholder="55" />
                </Field>
              )}
            </Row>

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
              <Field label="Descrizione Immobile (manuale)" full>
                <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={form.descrizione_manuale} onChange={(e) => update("descrizione_manuale", e.target.value)} placeholder="Luminoso appartamento al terzo piano con vista sul golfo di Trieste..." />
              </Field>
            </div>

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
              testo_zona: t.zona,
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
                  <button onClick={() => { const t = generateTexts(); update("testo_mercato", t.mercato); }}
                    style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${accent}40`, background: `${accent}08`, color: accent, cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "var(--font-body)" }}>
                    🔄 Rigenera
                  </button>
                </div>
                <textarea
                  style={{ ...inputStyle, minHeight: 180, resize: "vertical", lineHeight: 1.7, fontSize: 13 }}
                  value={form.testo_mercato}
                  onChange={(e) => update("testo_mercato", e.target.value)}
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

              {/* Note valutazione */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Note sulla Valutazione</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: "vertical", lineHeight: 1.7, fontSize: 13 }}
                  value={form.note_valutazione}
                  onChange={(e) => update("note_valutazione", e.target.value)}
                  placeholder="Note sulla valutazione..."
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
