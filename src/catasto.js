// Categorie catastali: usate nel form (menu a tendina) e nel report (descrizione della categoria)
export const CATEGORIE_CATASTALI = [
  ["Gruppo A — Abitazioni e uffici", [
    ["A/1", "Abitazioni di tipo signorile"], ["A/2", "Abitazioni di tipo civile"], ["A/3", "Abitazioni di tipo economico"],
    ["A/4", "Abitazioni di tipo popolare"], ["A/5", "Abitazioni di tipo ultrapopolare"], ["A/6", "Abitazioni di tipo rurale"],
    ["A/7", "Abitazioni in villini"], ["A/8", "Abitazioni in ville"], ["A/9", "Castelli, palazzi di eminente pregio artistico o storico"],
    ["A/10", "Uffici e studi privati"], ["A/11", "Abitazioni e alloggi tipici dei luoghi"],
  ]],
  ["Gruppo B — Uso collettivo", [
    ["B/1", "Collegi, convitti, ricoveri, conventi, caserme"], ["B/2", "Case di cura e ospedali (senza fine di lucro)"],
    ["B/3", "Prigioni e riformatori"], ["B/4", "Uffici pubblici"], ["B/5", "Scuole e laboratori scientifici"],
    ["B/6", "Biblioteche, musei, gallerie, accademie"], ["B/7", "Cappelle e oratori non destinati al culto pubblico"],
    ["B/8", "Magazzini sotterranei per depositi di derrate"],
  ]],
  ["Gruppo C — Commerciali, depositi, box", [
    ["C/1", "Negozi e botteghe"], ["C/2", "Magazzini e locali di deposito (cantine, soffitte)"], ["C/3", "Laboratori per arti e mestieri"],
    ["C/4", "Fabbricati per esercizi sportivi (senza fine di lucro)"], ["C/5", "Stabilimenti balneari e di acque curative (senza fine di lucro)"],
    ["C/6", "Stalle, scuderie, rimesse, autorimesse (box e posti auto)"], ["C/7", "Tettoie chiuse o aperte"],
  ]],
  ["Gruppo D — Destinazione speciale", [
    ["D/1", "Opifici"], ["D/2", "Alberghi e pensioni"], ["D/3", "Teatri, cinematografi, sale per spettacoli"],
    ["D/4", "Case di cura e ospedali (con fine di lucro)"], ["D/5", "Istituti di credito, cambio e assicurazione"],
    ["D/6", "Fabbricati per esercizi sportivi (con fine di lucro)"], ["D/7", "Fabbricati per attività industriali"],
    ["D/8", "Fabbricati per attività commerciali"], ["D/9", "Edifici galleggianti o sospesi, ponti privati a pedaggio"],
    ["D/10", "Fabbricati per funzioni produttive agricole"],
  ]],
  ["Gruppo E — Destinazione particolare", [
    ["E/1", "Stazioni per servizi di trasporto"], ["E/2", "Ponti comunali e provinciali a pedaggio"],
    ["E/3", "Costruzioni per speciali esigenze pubbliche"], ["E/4", "Recinti chiusi per speciali esigenze pubbliche"],
    ["E/5", "Fortificazioni e loro dipendenze"], ["E/6", "Fari, semafori, torri dell'orologio comunale"],
    ["E/7", "Fabbricati per l'esercizio pubblico dei culti"], ["E/8", "Fabbricati e costruzioni nei cimiteri"],
    ["E/9", "Altri edifici a destinazione particolare"],
  ]],
  ["Gruppo F — Categorie fittizie", [
    ["F/1", "Area urbana"], ["F/2", "Unità collabenti"], ["F/3", "Unità in corso di costruzione"],
    ["F/4", "Unità in corso di definizione"], ["F/5", "Lastrico solare"],
  ]],
];

const DESCRIZIONI = Object.fromEntries(CATEGORIE_CATASTALI.flatMap(([, voci]) => voci));

// "A/2" -> "Abitazioni di tipo civile"
export const descrizioneCategoria = (cod) => DESCRIZIONI[cod] || "";
