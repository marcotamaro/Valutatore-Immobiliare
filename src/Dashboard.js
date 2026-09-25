import { useState, useEffect } from "react";

const fmt = (v) => {
  if (!v && v !== 0) return "";
  return Number(v).toLocaleString("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 });
};
const fmtDate = (d) => {
  if (!d) return "—";
  try { return new Date(d + "T00:00:00").toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" }); }
  catch { return d; }
};
const mainVal = (v) => {
  if (v.valore_medio) return Number(v.valore_medio);
  const min = Number(v.valore_min || 0);
  const max = Number(v.valore_max || 0);
  if (min && max) return Math.round((min + max) / 2);
  return min || max || 0;
};

export default function Dashboard({ onViewReport } = {}) {
  const [list, setList] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("valutazioni"); // "valutazioni" | "agenti"
  const [filterZona, setFilterZona] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterAgente, setFilterAgente] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterDataDa, setFilterDataDa] = useState("");
  const [filterDataA, setFilterDataA] = useState("");
  const [sortBy, setSortBy] = useState("data_desc");
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [viewReport, setViewReport] = useState(null);
  const [accent, setAccent] = useState("#1a3a5c");

  // Agent form
  const [editAgent, setEditAgent] = useState(null); // null=closed, {}=new, {id,...}=editing
  const [agentForm, setAgentForm] = useState({ nome: "", cognome: "", telefono: "", email: "" });
  const [confirmDeleteAgent, setConfirmDeleteAgent] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("valutazioni_list");
        if (res && res.value) setList(JSON.parse(res.value));
        const ag = await window.storage.get("agency_settings");
        if (ag && ag.value) { const d = JSON.parse(ag.value); if (d.agenzia_colore) setAccent(d.agenzia_colore); }
        const agentsRes = await window.storage.get("agents_list");
        if (agentsRes && agentsRes.value) setAgents(JSON.parse(agentsRes.value));
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const saveList = async (newList) => { setList(newList); try { await window.storage.set("valutazioni_list", JSON.stringify(newList)); } catch (e) {} };
  const saveAgents = async (newAgents) => { setAgents(newAgents); try { await window.storage.set("agents_list", JSON.stringify(newAgents)); } catch (e) {} };

  const deleteValutazione = async (id) => { await saveList(list.filter(v => v.id !== id)); setConfirmDelete(null); if (selected && selected.id === id) setSelected(null); };

  const duplicateValutazione = async (v) => {
    const dup = { ...v, id: Date.now(), data_valutazione: new Date().toISOString().split("T")[0], created_at: new Date().toISOString() };
    await saveList([...list, dup]);
  };

  const loadForEdit = async (v) => {
    try { await window.storage.set("edit_valutazione", JSON.stringify(v)); alert("Valutazione caricata! Apri il form 'valutazione-immobili' — troverai i dati pre-compilati pronti per la modifica."); } catch (e) { alert("Errore nel caricamento."); }
  };

  // Agent CRUD
  const saveAgent = async () => {
    if (!agentForm.nome || !agentForm.cognome) return;
    let newAgents;
    if (editAgent && editAgent.id) {
      newAgents = agents.map(a => a.id === editAgent.id ? { ...editAgent, ...agentForm } : a);
    } else {
      newAgents = [...agents, { id: Date.now(), ...agentForm }];
    }
    await saveAgents(newAgents);
    setEditAgent(null);
    setAgentForm({ nome: "", cognome: "", telefono: "", email: "" });
  };
  const deleteAgent = async (id) => { await saveAgents(agents.filter(a => a.id !== id)); setConfirmDeleteAgent(null); };
  const startEditAgent = (a) => { setEditAgent(a); setAgentForm({ nome: a.nome, cognome: a.cognome, telefono: a.telefono || "", email: a.email || "" }); };
  const startNewAgent = () => { setEditAgent({}); setAgentForm({ nome: "", cognome: "", telefono: "", email: "" }); };

  // Filters
  const zones = [...new Set(list.map(v => v.zona).filter(Boolean))].sort();
  const types = [...new Set(list.map(v => v.tipologia).filter(Boolean))].sort();
  const agentNames = [...new Set(list.map(v => v.agente_nome).filter(Boolean))].sort();

  let filtered = list.filter(v => {
    if (filterZona && v.zona !== filterZona) return false;
    if (filterTipo && v.tipologia !== filterTipo) return false;
    if (filterAgente && v.agente_nome !== filterAgente) return false;
    if (filterDataDa && v.data_valutazione && v.data_valutazione < filterDataDa) return false;
    if (filterDataA && v.data_valutazione && v.data_valutazione > filterDataA) return false;
    if (filterSearch) { const s = filterSearch.toLowerCase(); if (!`${v.indirizzo} ${v.civico} ${v.zona} ${v.tipologia} ${v.agente_nome} ${v.proprietario_cognome} ${v.proprietario_nome}`.toLowerCase().includes(s)) return false; }
    return true;
  });
  filtered.sort((a, b) => {
    switch (sortBy) {
      case "data_desc": return (b.data_valutazione || "").localeCompare(a.data_valutazione || "");
      case "data_asc": return (a.data_valutazione || "").localeCompare(b.data_valutazione || "");
      case "prezzo_desc": return mainVal(b) - mainVal(a);
      case "prezzo_asc": return mainVal(a) - mainVal(b);
      case "zona": return (a.zona || "").localeCompare(b.zona || "");
      default: return 0;
    }
  });

  const stats = {
    totale: list.length, filtrate: filtered.length,
    valMedio: filtered.length > 0 ? Math.round(filtered.reduce((s, v) => s + mainVal(v), 0) / filtered.length) : 0,
    zoneCount: [...new Set(filtered.map(v => v.zona).filter(Boolean))].length,
  };

  const iS = { padding: "9px 12px", border: "1.5px solid #d8dce6", borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans', sans-serif", background: "#f8f9fc", color: "#1a1a2e", outline: "none", boxSizing: "border-box", width: "100%" };
  const sS = { ...iS, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 28 };

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#666" }}>Caricamento...</div>;

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f0f2f7", minHeight: "100vh", color: "#1a1a2e" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ background: `linear-gradient(135deg, ${accent}, ${accent}dd)`, padding: "24px 28px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#fff", fontFamily: "'Playfair Display', serif" }}>📊 Dashboard</h1>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>Gestione valutazioni e agenti</div>
      </div>

      {/* TABS */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 20px 0" }}>
        <div style={{ display: "flex", gap: 4, background: "#e8eaf0", borderRadius: 10, padding: 3, marginBottom: 20, width: "fit-content" }}>
          {[{ id: "valutazioni", label: "📋 Valutazioni", count: list.length }, { id: "proprietari", label: "🏠 Proprietari", count: (() => { const p = new Set(); list.forEach(v => { if (v.proprietario_cognome || v.proprietario_nome) p.add(`${v.proprietario_cognome}|${v.proprietario_nome}`); }); return p.size; })() }, { id: "agenti", label: "👤 Agenti", count: agents.length }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "10px 22px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s",
              background: tab === t.id ? "#fff" : "transparent", color: tab === t.id ? accent : "#888", boxShadow: tab === t.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}>{t.label} ({t.count})</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 40px" }}>

        {/* ═══════════ TAB: VALUTAZIONI ═══════════ */}
        {tab === "valutazioni" && (<>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Totali", value: stats.totale, icon: "📋" },
              { label: "Zone", value: stats.zoneCount, icon: "📍" },
              { label: "Valore medio", value: fmt(stats.valMedio), icon: "📊" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #eef0f4" }}>
                <div style={{ fontSize: 10, color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.icon} {s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: accent, fontFamily: "'Playfair Display', serif", marginTop: 4 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: "1 1 180px" }}><label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#999", marginBottom: 3, textTransform: "uppercase" }}>Cerca</label><input style={iS} value={filterSearch} onChange={e => setFilterSearch(e.target.value)} placeholder="Indirizzo, zona, proprietario..." /></div>
            <div style={{ flex: "0 1 130px" }}><label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#999", marginBottom: 3, textTransform: "uppercase" }}>Dal</label><input type="date" style={iS} value={filterDataDa} onChange={e => setFilterDataDa(e.target.value)} /></div>
            <div style={{ flex: "0 1 130px" }}><label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#999", marginBottom: 3, textTransform: "uppercase" }}>Al</label><input type="date" style={iS} value={filterDataA} onChange={e => setFilterDataA(e.target.value)} /></div>
            <div style={{ flex: "0 1 140px" }}><label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#999", marginBottom: 3, textTransform: "uppercase" }}>Zona</label><select style={sS} value={filterZona} onChange={e => setFilterZona(e.target.value)}><option value="">Tutte</option>{zones.map(z => <option key={z}>{z}</option>)}</select></div>
            <div style={{ flex: "0 1 140px" }}><label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#999", marginBottom: 3, textTransform: "uppercase" }}>Tipologia</label><select style={sS} value={filterTipo} onChange={e => setFilterTipo(e.target.value)}><option value="">Tutte</option>{types.map(t => <option key={t}>{t}</option>)}</select></div>
            <div style={{ flex: "0 1 140px" }}><label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#999", marginBottom: 3, textTransform: "uppercase" }}>Agente</label><select style={sS} value={filterAgente} onChange={e => setFilterAgente(e.target.value)}><option value="">Tutti</option>{agentNames.map(a => <option key={a}>{a}</option>)}</select></div>
            <div style={{ flex: "0 1 140px" }}><label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#999", marginBottom: 3, textTransform: "uppercase" }}>Ordina</label><select style={sS} value={sortBy} onChange={e => setSortBy(e.target.value)}><option value="data_desc">Data ↓</option><option value="data_asc">Data ↑</option><option value="prezzo_desc">Prezzo ↓</option><option value="prezzo_asc">Prezzo ↑</option><option value="zona">Zona A-Z</option></select></div>
            {(filterZona || filterTipo || filterSearch || filterAgente || filterDataDa || filterDataA) && <button onClick={() => { setFilterZona(""); setFilterTipo(""); setFilterSearch(""); setFilterAgente(""); setFilterDataDa(""); setFilterDataA(""); }} style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#999", fontFamily: "'DM Sans', sans-serif" }}>✕ Reset</button>}
          </div>

          <div style={{ fontSize: 12, color: "#999", marginBottom: 10 }}>{filtered.length === list.length ? `${list.length} valutazioni` : `${filtered.length} di ${list.length}`}</div>

          {/* List */}
          {filtered.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 12, padding: 40, textAlign: "center", color: "#999", fontSize: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>{list.length === 0 ? "Nessuna valutazione salvata." : "Nessun risultato."}</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map((v) => (
                <div key={v.id} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: selected && selected.id === v.id ? `2px solid ${accent}` : "1px solid #eef0f4" }}>
                  <div onClick={() => setSelected(selected && selected.id === v.id ? null : v)} style={{ padding: "14px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: accent, background: `${accent}12`, padding: "2px 8px", borderRadius: 4 }}>{v.tipologia}</span>
                        {v.zona && <span style={{ fontSize: 10, fontWeight: 600, color: "#888", background: "#f0f1f4", padding: "2px 8px", borderRadius: 4 }}>{v.zona}</span>}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, marginTop: 5, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.indirizzo}{v.civico ? ` ${v.civico}` : ""}</div>
                      <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{fmtDate(v.data_valutazione)}{v.agente_nome ? ` · ${v.agente_nome}` : ""}{v.superficie_commerciale ? ` · ${v.superficie_commerciale} mq` : ""}{(v.proprietario_cognome || v.proprietario_nome) ? ` · Propr: ${[v.proprietario_cognome, v.proprietario_nome].filter(Boolean).join(" ")}` : ""}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      {v.valore_medio ? <div style={{ fontSize: 18, fontWeight: 800, color: accent, fontFamily: "'Playfair Display', serif" }}>{fmt(v.valore_medio)}</div>
                       : v.valore_min || v.valore_max ? <div style={{ fontSize: 15, fontWeight: 700, color: "#555" }}>{v.valore_min && fmt(v.valore_min)}{v.valore_min && v.valore_max && " — "}{v.valore_max && fmt(v.valore_max)}</div>
                       : <div style={{ fontSize: 14, color: "#ccc" }}>—</div>}
                      {v.superficie_commerciale && mainVal(v) > 0 && <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{Math.round(mainVal(v) / Number(v.superficie_commerciale)).toLocaleString("it-IT")} €/mq</div>}
                    </div>
                  </div>

                  {/* Expanded */}
                  {selected && selected.id === v.id && (
                    <div style={{ borderTop: "1px solid #f0f1f4", padding: "16px 18px", background: "#fafbfd" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 18px", fontSize: 13, marginBottom: 14 }}>
                        {v.superficie_commerciale && <div><span style={{ color: "#999" }}>Superficie:</span> <strong>{v.superficie_commerciale} mq</strong></div>}
                        {v.locali && <div><span style={{ color: "#999" }}>Locali:</span> <strong>{v.locali}</strong></div>}
                        {v.camere && <div><span style={{ color: "#999" }}>Camere:</span> <strong>{v.camere}</strong></div>}
                        {v.bagni && <div><span style={{ color: "#999" }}>Bagni:</span> <strong>{v.bagni}</strong></div>}
                        {v.piano && <div><span style={{ color: "#999" }}>Piano:</span> <strong>{v.piano}{v.totale_piani ? `/${v.totale_piani}` : ""}</strong></div>}
                        {v.stato_conservazione && <div><span style={{ color: "#999" }}>Stato:</span> <strong>{v.stato_conservazione}</strong></div>}
                        {v.classe_energetica && <div><span style={{ color: "#999" }}>Classe:</span> <strong>{v.classe_energetica}</strong></div>}
                        {v.tipologia_edificio && <div><span style={{ color: "#999" }}>Edificio:</span> <strong>{v.tipologia_edificio}</strong></div>}
                        {v.vista && <div><span style={{ color: "#999" }}>Vista:</span> <strong>{v.vista}</strong></div>}
                        {v.luminosita && <div><span style={{ color: "#999" }}>Luminosità:</span> <strong>{v.luminosita}</strong></div>}
                        {v.riscaldamento && <div><span style={{ color: "#999" }}>Risc.:</span> <strong>{v.riscaldamento}</strong></div>}
                        {v.anno_costruzione && <div><span style={{ color: "#999" }}>Anno:</span> <strong>{v.anno_costruzione}</strong></div>}
                      </div>

                      {/* Values */}
                      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                        {v.valore_min && <div style={{ background: "#f0f2f7", borderRadius: 8, padding: "8px 14px", flex: 1, minWidth: 110 }}><div style={{ fontSize: 10, color: "#999", fontWeight: 600, textTransform: "uppercase" }}>Min</div><div style={{ fontSize: 16, fontWeight: 700, color: "#555", marginTop: 3 }}>{fmt(v.valore_min)}</div></div>}
                        {v.valore_medio && <div style={{ background: `${accent}0a`, borderRadius: 8, padding: "8px 14px", flex: 1, minWidth: 110, border: `1px solid ${accent}20` }}><div style={{ fontSize: 10, color: accent, fontWeight: 600, textTransform: "uppercase" }}>Stimato</div><div style={{ fontSize: 16, fontWeight: 800, color: accent, marginTop: 3 }}>{fmt(v.valore_medio)}</div></div>}
                        {v.valore_max && <div style={{ background: "#f0f2f7", borderRadius: 8, padding: "8px 14px", flex: 1, minWidth: 110 }}><div style={{ fontSize: 10, color: "#999", fontWeight: 600, textTransform: "uppercase" }}>Max</div><div style={{ fontSize: 16, fontWeight: 700, color: "#555", marginTop: 3 }}>{fmt(v.valore_max)}</div></div>}
                      </div>

                      {v.pertinenze && v.pertinenze.length > 0 && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", marginBottom: 4 }}>Pertinenze</div>{v.pertinenze.map(p => <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0", borderBottom: "1px solid #eee" }}><span>{p.icon} {p.label}{p.superficie ? ` (${p.superficie} mq)` : ""}</span><span style={{ fontWeight: 600 }}>{p.valore ? fmt(p.valore) : "—"}</span></div>)}</div>}

                      {v.descrizione_manuale && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", marginBottom: 4 }}>Descrizione</div><div style={{ fontSize: 12, color: "#555", lineHeight: 1.6, maxHeight: 70, overflow: "hidden" }}>{v.descrizione_manuale}</div></div>}

                      {/* ACTIONS */}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 10, borderTop: "1px solid #eee" }}>
                        <button onClick={async () => { try { await window.storage.set("view_report_data", JSON.stringify(v)); } catch(e) {} if (onViewReport) onViewReport(v); else alert("Valutazione pronta! Apri l'artifact 'report-valutazione' per visualizzare il report."); }} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: accent, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans'" }}>📄 Visualizza</button>
                        <button onClick={() => loadForEdit(v)} style={{ padding: "7px 16px", borderRadius: 8, border: `1.5px solid ${accent}40`, background: "#fff", color: accent, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans'" }}>✏️ Modifica</button>
                        <button onClick={() => duplicateValutazione(v)} style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid #d0d5dd", background: "#fff", color: "#555", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans'" }}>📋 Duplica</button>
                        <button onClick={() => setConfirmDelete(v.id)} style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid #fcc", background: "#fff", color: "#c33", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans'", marginLeft: "auto" }}>🗑️ Elimina</button>
                      </div>

                      {confirmDelete === v.id && (
                        <div style={{ marginTop: 10, padding: "12px 16px", background: "#fff5f5", borderRadius: 8, border: "1px solid #fcc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12, color: "#c33" }}>Eliminare definitivamente?</span>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => setConfirmDelete(null)} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans'" }}>Annulla</button>
                            <button onClick={() => deleteValutazione(v.id)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: "#c33", color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans'" }}>Elimina</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Zone breakdown */}
          {list.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 12, padding: "18px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginTop: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: accent, marginBottom: 12 }}>Valutazioni per Zona</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(() => {
                  const zc = {}; list.forEach(v => { if (v.zona) zc[v.zona] = (zc[v.zona] || 0) + 1; });
                  return Object.entries(zc).sort((a, b) => b[1] - a[1]).map(([zona, count]) => {
                    const avg = Math.round(list.filter(v => v.zona === zona).reduce((s, v) => s + mainVal(v), 0) / count);
                    return <div key={zona} onClick={() => setFilterZona(filterZona === zona ? "" : zona)} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", background: filterZona === zona ? `${accent}12` : "#f8f9fc", border: filterZona === zona ? `1.5px solid ${accent}40` : "1.5px solid #eef0f4" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: filterZona === zona ? accent : "#333" }}>{zona}</div>
                      <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>{count} val. · {fmt(avg)}</div>
                    </div>;
                  });
                })()}
              </div>
            </div>
          )}
        </>)}

        {/* ═══════════ TAB: PROPRIETARI ═══════════ */}
        {tab === "proprietari" && (() => {
          // Build unique proprietari list from valutazioni
          const propMap = {};
          list.forEach(v => {
            if (!v.proprietario_cognome && !v.proprietario_nome) return;
            const key = `${(v.proprietario_cognome || "").trim().toLowerCase()}|${(v.proprietario_nome || "").trim().toLowerCase()}`;
            if (!propMap[key]) {
              propMap[key] = {
                nome: v.proprietario_nome || "",
                cognome: v.proprietario_cognome || "",
                telefono: v.proprietario_telefono || "",
                email: v.proprietario_email || "",
                valutazioni: [],
              };
            }
            // Update contact info if more recent
            if (v.proprietario_telefono) propMap[key].telefono = v.proprietario_telefono;
            if (v.proprietario_email) propMap[key].email = v.proprietario_email;
            propMap[key].valutazioni.push(v);
          });
          const proprietari = Object.values(propMap).sort((a, b) => a.cognome.localeCompare(b.cognome));

          return (<>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>{proprietari.length} proprietari associati a valutazioni</div>

            {proprietari.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 12, padding: 40, textAlign: "center", color: "#999", fontSize: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                Nessun proprietario trovato. Compila i dati proprietario nelle valutazioni.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {proprietari.map((p, pi) => (
                  <div key={pi} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #eef0f4" }}>
                    <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 17, fontWeight: 700, color: "#1a1a2e" }}>{p.cognome} {p.nome}</div>
                        <div style={{ fontSize: 12, color: "#999", marginTop: 3 }}>
                          {[p.telefono, p.email].filter(Boolean).join(" · ") || "Nessun contatto"}
                        </div>
                      </div>
                      <div style={{ background: `${accent}12`, padding: "6px 14px", borderRadius: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>{p.valutazioni.length}</span>
                        <span style={{ fontSize: 11, color: accent, marginLeft: 4 }}>valutazion{p.valutazioni.length === 1 ? "e" : "i"}</span>
                      </div>
                    </div>
                    {/* Valutazioni del proprietario */}
                    <div style={{ borderTop: "1px solid #f0f1f4", padding: "0 20px 12px" }}>
                      {p.valutazioni.map(v => (
                        <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f8f8f8", fontSize: 13 }}>
                          <div>
                            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: accent, background: `${accent}12`, padding: "1px 6px", borderRadius: 3, marginRight: 8 }}>{v.tipologia}</span>
                            <span style={{ fontWeight: 600 }}>{v.indirizzo}{v.civico ? ` ${v.civico}` : ""}</span>
                            {v.zona && <span style={{ color: "#999", marginLeft: 8 }}>{v.zona}</span>}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontWeight: 700, color: accent }}>{fmt(mainVal(v))}</span>
                            <span style={{ fontSize: 11, color: "#bbb" }}>{fmtDate(v.data_valutazione)}</span>
                            <button onClick={async () => { try { await window.storage.set("view_report_data", JSON.stringify(v)); } catch(e) {} if (onViewReport) onViewReport(v); }} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: accent, color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans'" }}>📄</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>);
        })()}

        {/* ═══════════ TAB: AGENTI ═══════════ */}
        {tab === "agenti" && (<>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "#666" }}>{agents.length} agenti registrati</div>
            <button onClick={startNewAgent} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: accent, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans'" }}>+ Nuovo Agente</button>
          </div>

          {/* Agent form */}
          {editAgent !== null && (
            <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: 16, border: `2px solid ${accent}30` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: accent, marginBottom: 14 }}>{editAgent.id ? "Modifica Agente" : "Nuovo Agente"}</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                <div style={{ flex: "1 1 180px" }}><label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#999", marginBottom: 3, textTransform: "uppercase" }}>Nome *</label><input style={iS} value={agentForm.nome} onChange={e => setAgentForm({ ...agentForm, nome: e.target.value })} placeholder="Marco" /></div>
                <div style={{ flex: "1 1 180px" }}><label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#999", marginBottom: 3, textTransform: "uppercase" }}>Cognome *</label><input style={iS} value={agentForm.cognome} onChange={e => setAgentForm({ ...agentForm, cognome: e.target.value })} placeholder="Tamaro" /></div>
                <div style={{ flex: "1 1 180px" }}><label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#999", marginBottom: 3, textTransform: "uppercase" }}>Telefono</label><input style={iS} value={agentForm.telefono} onChange={e => setAgentForm({ ...agentForm, telefono: e.target.value })} placeholder="+39 333 1234567" /></div>
                <div style={{ flex: "1 1 180px" }}><label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#999", marginBottom: 3, textTransform: "uppercase" }}>Email</label><input style={iS} value={agentForm.email} onChange={e => setAgentForm({ ...agentForm, email: e.target.value })} placeholder="marco@agenzia.it" /></div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={saveAgent} disabled={!agentForm.nome || !agentForm.cognome} style={{ padding: "9px 22px", borderRadius: 8, border: "none", background: agentForm.nome && agentForm.cognome ? accent : "#ccc", color: "#fff", cursor: agentForm.nome && agentForm.cognome ? "pointer" : "default", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans'" }}>{editAgent.id ? "Salva Modifiche" : "Aggiungi Agente"}</button>
                <button onClick={() => { setEditAgent(null); setAgentForm({ nome: "", cognome: "", telefono: "", email: "" }); }} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans'", color: "#666" }}>Annulla</button>
              </div>
            </div>
          )}

          {/* Agent list */}
          {agents.length === 0 && editAgent === null ? (
            <div style={{ background: "#fff", borderRadius: 12, padding: 40, textAlign: "center", color: "#999", fontSize: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>Nessun agente registrato. Aggiungi il primo!</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {agents.map(a => {
                const aVal = list.filter(v => v.agente_nome === `${a.cognome} ${a.nome}` || v.agente_nome === `${a.nome} ${a.cognome}`);
                return (
                  <div key={a.id} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #eef0f4", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e" }}>{a.cognome} {a.nome}</div>
                      <div style={{ fontSize: 12, color: "#999", marginTop: 3 }}>
                        {[a.telefono, a.email].filter(Boolean).join(" · ") || "Nessun contatto"}
                      </div>
                      <div style={{ fontSize: 11, color: accent, marginTop: 4, fontWeight: 600 }}>{aVal.length} valutazion{aVal.length === 1 ? "e" : "i"}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => startEditAgent(a)} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${accent}40`, background: "#fff", color: accent, cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans'" }}>✏️ Modifica</button>
                      <button onClick={() => setConfirmDeleteAgent(a.id)} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #fcc", background: "#fff", color: "#c33", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans'" }}>🗑️</button>
                    </div>
                    {confirmDeleteAgent === a.id && (
                      <div style={{ position: "absolute", right: 20, background: "#fff5f5", border: "1px solid #fcc", borderRadius: 8, padding: "10px 14px", display: "flex", gap: 6, alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                        <span style={{ fontSize: 12, color: "#c33" }}>Eliminare?</span>
                        <button onClick={() => setConfirmDeleteAgent(null)} style={{ padding: "4px 10px", borderRadius: 5, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 11 }}>No</button>
                        <button onClick={() => deleteAgent(a.id)} style={{ padding: "4px 10px", borderRadius: 5, border: "none", background: "#c33", color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>Sì</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Info box */}
          <div style={{ background: `${accent}08`, borderRadius: 10, padding: "14px 18px", marginTop: 20, border: `1px solid ${accent}20`, fontSize: 12, color: "#666", lineHeight: 1.6 }}>
            💡 <strong>Come funziona:</strong> Gli agenti registrati qui appariranno nel form di inserimento valutazioni come menu a tendina, evitando duplicati. Il formato usato nel report sarà sempre "Cognome Nome" (es. Tamaro Marco).
          </div>
        </>)}

      </div>
    </div>
  );
}
