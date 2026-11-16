// Titoli e frasi del report modificabili dall'admin (Dati Agenzia → Testi Report).
// Si salvano solo i testi diversi da quelli predefiniti, nella chiave "report_texts".
// Ogni valutazione salvata conserva una copia dei testi del momento (campo report_texts).

export const REPORT_TEXT_DEFAULTS = {
  copertina_sopratitolo: "Relazione di",
  copertina_titolo: "Valutazione Immobiliare",
  titolo_indice_oggetto: "Oggetto della Valutazione e Metodologia",
  titolo_oggetto: "Oggetto della Valutazione",
  titolo_metodologia: "Metodologia e Criteri di Valutazione",
  titolo_mercato: "Il Mercato Immobiliare a Trieste",
  titolo_zona: "Analisi della Zona: {zona}",
  titolo_scheda: "Scheda Tecnica dell'Immobile",
  titolo_descrizione: "Descrizione dell'Immobile",
  titolo_edificio: "Caratteristiche dell'Edificio",
  titolo_immobile: "Caratteristiche dell'Immobile",
  titolo_pertinenze: "Pertinenze",
  titolo_foto: "Documentazione Fotografica",
  titolo_comparabili: "Comparabili in Zona",
  intro_comparabili: "Immobili con caratteristiche simili attualmente in vendita nella zona, selezionati dal nostro agente come termine di confronto. I prezzi indicati sono quelli richiesti negli annunci: di norma, in trattativa, si riducono.",
  titolo_vendite: "Le Nostre Vendite in Zona",
  intro_vendite: "Immobili venduti da {agenzia} nella zona {zona} negli ultimi mesi. Sono prezzi di vendita effettivi, non prezzi richiesti.",
  titolo_target: "Analisi del Target del Tuo Immobile",
  titolo_acquirenti: "Acquirenti Già in Cerca",
  frase_acquirenti: "Nel nostro archivio clienti ci sono già acquirenti che cercano un immobile con queste caratteristiche.",
  nota_acquirenti: "Dato rilevato dal nostro archivio clienti alla data della valutazione ({data}). Appena l'immobile sarà in vendita, saranno i primi a riceverne la proposta.",
  titolo_valutazione: "Valutazione Economica",
  intro_valutazione: "Sulla base dell'analisi effettuata, considerando le caratteristiche dell'immobile, la sua ubicazione, lo stato di manutenzione e l'andamento del mercato, si esprime la seguente valutazione:",
  spiegazione_prezzo_pubblicita: "Il prezzo di pubblicità tiene conto della strategia commerciale e del margine di trattativa.",
  avvertenza_legale: "La presente relazione ha carattere indicativo e non costituisce perizia estimativa ai sensi di legge. I valori rappresentano una stima del più probabile prezzo di mercato sulla base delle informazioni disponibili.",
};

// Campi raggruppati nell'ordine del report: [chiave, etichetta, lunghezza consigliata, testo lungo]
export const REPORT_TEXT_GROUPS = [
  { id: "copertina", nome: "Copertina", campi: [
    ["copertina_sopratitolo", "Sopratitolo", 30],
    ["copertina_titolo", "Titolo predefinito delle nuove valutazioni", 60],
  ] },
  { id: "oggetto", nome: "Oggetto e metodologia", nota: "Il testo della metodologia si modifica nel riquadro \"Modus operandi\" qui sotto.", campi: [
    ["titolo_indice_oggetto", "Voce nell'indice", 60],
    ["titolo_oggetto", "Titolo: oggetto della valutazione", 60],
    ["titolo_metodologia", "Titolo: metodologia", 60],
  ] },
  { id: "mercato", nome: "Mercato", nota: "Il testo si modifica nel riquadro \"Il mercato immobiliare a Trieste\" qui sotto.", campi: [
    ["titolo_mercato", "Titolo", 60],
  ] },
  { id: "zona", nome: "Analisi della zona", nota: "Le descrizioni si modificano in \"Descrizioni zone\" qui sotto.", campi: [
    ["titolo_zona", "Titolo", 60],
  ] },
  { id: "scheda", nome: "Scheda tecnica", campi: [
    ["titolo_scheda", "Voce nell'indice", 60],
    ["titolo_descrizione", "Titolo: descrizione", 60],
    ["titolo_edificio", "Titolo: caratteristiche dell'edificio", 60],
    ["titolo_immobile", "Titolo: caratteristiche dell'immobile", 60],
    ["titolo_pertinenze", "Titolo: pertinenze", 60],
  ] },
  { id: "foto", nome: "Documentazione fotografica", campi: [
    ["titolo_foto", "Titolo", 60],
  ] },
  { id: "comparabili", nome: "Comparabili in zona", campi: [
    ["titolo_comparabili", "Titolo", 60],
    ["intro_comparabili", "Frase introduttiva", 400, true],
  ] },
  { id: "vendite", nome: "Le nostre vendite in zona", campi: [
    ["titolo_vendite", "Titolo", 60],
    ["intro_vendite", "Frase introduttiva", 400, true],
  ] },
  { id: "target", nome: "Analisi del target", campi: [
    ["titolo_target", "Titolo", 60],
  ] },
  { id: "acquirenti", nome: "Acquirenti già in cerca", campi: [
    ["titolo_acquirenti", "Titolo", 60],
    ["frase_acquirenti", "Frase accanto al numero", 160, true],
    ["nota_acquirenti", "Nota finale", 300, true],
  ] },
  { id: "valutazione", nome: "Valutazione economica", campi: [
    ["titolo_valutazione", "Titolo", 60],
    ["intro_valutazione", "Frase introduttiva", 400, true],
    ["spiegazione_prezzo_pubblicita", "Spiegazione del prezzo di pubblicità", 200, true],
  ] },
  { id: "avvertenza", nome: "Avvertenza legale", nota: "Testo delicato: modificalo solo con la certezza di cosa stai scrivendo. Nel report è sempre seguito da © anno e nome dell'agenzia.", campi: [
    ["avvertenza_legale", "Testo", 600, true],
  ] },
];

export const SEGNAPOSTO = ["{agenzia}", "{zona}", "{data}"];

// Testi effettivi: predefiniti, poi personalizzati dall'admin, poi la copia salvata nella valutazione
export const mergeTexts = (...layers) => {
  const out = { ...REPORT_TEXT_DEFAULTS };
  layers.filter(Boolean).forEach(l => Object.keys(l).forEach(k => { if (k in REPORT_TEXT_DEFAULTS && typeof l[k] === "string") out[k] = l[k]; }));
  return out;
};

// Solo le differenze dai predefiniti (quello che si salva)
export const diffFromDefaults = (t) => {
  const out = {};
  Object.keys(REPORT_TEXT_DEFAULTS).forEach(k => { if (t[k] !== undefined && t[k] !== REPORT_TEXT_DEFAULTS[k]) out[k] = t[k]; });
  return out;
};

// Sostituisce i segnaposto
export const applyText = (t, vars) =>
  String(t || "")
    .replace(/\{(agenzia|zona|data|anno)\}/g, (_, k) => (vars && vars[k]) || "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ ([.,:;])/g, "$1")
    .trim();
