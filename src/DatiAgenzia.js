import { useState, useEffect } from "react";

const DEFAULT_ZONES = [
  { id: 1, nome: "Centro di pregio", descrizione: "" },
  { id: 2, nome: "Centro non di pregio", descrizione: "" },
  { id: 3, nome: "San Giacomo, Chiarbola, Ponziana", descrizione: "" },
  { id: 4, nome: "Baiamonti, Valmaura, Borgo San Sergio, Altura", descrizione: "" },
  { id: 5, nome: "San Luigi, Rozzol, San Giovanni, Longera", descrizione: "" },
  { id: 6, nome: "Roiano, Gretta", descrizione: "" },
  { id: 7, nome: "Conconello, Barcola, Costiera, Grignano", descrizione: "" },
  { id: 8, nome: "Largo Barriera, Ospedale Maggiore, Settefontane", descrizione: "" },
  { id: 9, nome: "Scorcola, Cologna, Università", descrizione: "" },
  { id: 10, nome: "Campanelle, Costalunga, Sant'Anna", descrizione: "" },
  { id: 11, nome: "Opicina", descrizione: "" },
  { id: 12, nome: "Basovizza, Padriciano, Trebiciano, Prosecco", descrizione: "" },
  { id: 13, nome: "Prosecco, Aurisina, Santa Croce, Sistiana, Duino", descrizione: "" },
  { id: 14, nome: "Domio, San Dorligo della Valle, San Giuseppe, Log", descrizione: "" },
  { id: 15, nome: "Muggia", descrizione: "" },
];

const GoogleStars = ({ rating }) => {
  const full = Math.floor(rating);
  const frac = rating - full;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push("full");
    else if (i === full && frac >= 0.25) stars.push(frac >= 0.75 ? "full" : "half");
    else stars.push("empty");
  }
  return (
    <div style={{ display: "flex", gap: 1 }}>
      {stars.map((s, i) => (
        <svg key={i} width="18" height="18" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" fill={s === "empty" ? "#dadce0" : "#fbbc04"} />
          {s === "half" && <path d="M12 2v16.56L5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" fill="#fbbc04" />}
          {s === "half" && <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56V2z" fill="#dadce0" />}
        </svg>
      ))}
    </div>
  );
};

export default function DatiAgenzia() {
  const [form, setForm] = useState({
    agenzia_nome: "", agenzia_indirizzo: "", agenzia_telefono: "", agenzia_email: "",
    agenzia_colore: "#1a3a5c", agenzia_logo: null, agenzia_modus_operandi: "", testo_mercato: "",
    google_rating: "", google_reviews_count: "",
  });
  const [zones, setZones] = useState([]);
  const [agents, setAgents] = useState([]);
  const [logoPreview, setLogoPreview] = useState(null);
  const [savedAgency, setSavedAgency] = useState(false);
  const [savedMercato, setSavedMercato] = useState(false);
  const [savedModus, setSavedModus] = useState(false);
  const [editZone, setEditZone] = useState(null);
  const [newZoneName, setNewZoneName] = useState("");
  const [tab, setTab] = useState("agenzia");
  const [editAgent, setEditAgent] = useState(null);
  const [agentForm, setAgentForm] = useState({ nome: "", cognome: "", telefono: "", email: "", foto: null, descrizione: "" });
  const [confirmDeleteAgent, setConfirmDeleteAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  const accent = form.agenzia_colore || "#1a3a5c";

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("agency_settings");
        if (res && res.value) { const d = JSON.parse(res.value); setForm(f => ({ ...f, ...d })); if (d.agenzia_logo) setLogoPreview(d.agenzia_logo); setSavedAgency(true); }
        const zRes = await window.storage.get("zones_config");
        if (zRes && zRes.value) setZones(JSON.parse(zRes.value)); else setZones(DEFAULT_ZONES);
        const mRes = await window.storage.get("saved_testo_mercato");
        if (mRes && mRes.value) { setForm(f => ({ ...f, testo_mercato: f.testo_mercato || mRes.value })); setSavedMercato(true); }
        const agRes = await window.storage.get("agents_list");
        if (agRes && agRes.value) setAgents(JSON.parse(agRes.value));
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const update = (k, v) => { setForm(f => ({ ...f, [k]: v })); setSavedAgency(false); };
  const saveAgency = async () => { try { await window.storage.set("agency_settings", JSON.stringify(form)); setSavedAgency(true); } catch (e) {} };
  const saveMercato = async () => { try { await window.storage.set("saved_testo_mercato", form.testo_mercato); setSavedMercato(true); } catch (e) {} };
  const saveModus = async () => { try { await window.storage.set("agency_settings", JSON.stringify(form)); setSavedModus(true); } catch (e) {} };
  const saveZones = async (nz) => { setZones(nz); try { await window.storage.set("zones_config", JSON.stringify(nz)); } catch (e) {} };
  const updateZone = (id, field, value) => saveZones(zones.map(z => z.id === id ? { ...z, [field]: value } : z));
  const addZone = () => { if (!newZoneName.trim()) return; saveZones([...zones, { id: Date.now(), nome: newZoneName.trim(), descrizione: "" }]); setNewZoneName(""); };
  const removeZone = (id) => { saveZones(zones.filter(z => z.id !== id)); if (editZone === id) setEditZone(null); };

  // Agent CRUD
  const saveAgents = async (na) => { setAgents(na); try { await window.storage.set("agents_list", JSON.stringify(na)); } catch (e) {} };
  const saveAgent = () => {
    if (!agentForm.nome || !agentForm.cognome) return;
    let na;
    if (editAgent && editAgent.id) na = agents.map(a => a.id === editAgent.id ? { ...editAgent, ...agentForm } : a);
    else na = [...agents, { id: Date.now(), ...agentForm }];
    saveAgents(na); setEditAgent(null); setAgentForm({ nome: "", cognome: "", telefono: "", email: "", foto: null, descrizione: "" });
  };
  const deleteAgent = (id) => { saveAgents(agents.filter(a => a.id !== id)); setConfirmDeleteAgent(null); };
  const startEditAgent = (a) => { setEditAgent(a); setAgentForm({ nome: a.nome, cognome: a.cognome, telefono: a.telefono || "", email: a.email || "", foto: a.foto || null, descrizione: a.descrizione || "" }); };
  const startNewAgent = () => { setEditAgent({}); setAgentForm({ nome: "", cognome: "", telefono: "", email: "", foto: null, descrizione: "" }); };

  const iS = { padding: "9px 12px", border: "1.5px solid #d8dce6", borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans', sans-serif", background: "#f8f9fc", color: "#1a1a2e", outline: "none", boxSizing: "border-box", width: "100%" };

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "'DM Sans'", color: "#666" }}>Caricamento...</div>;

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f0f2f7", minHeight: "100vh", color: "#1a1a2e" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ background: `linear-gradient(135deg, ${accent}, ${accent}dd)`, padding: "24px 28px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#fff", fontFamily: "'Playfair Display', serif" }}>🏢 Dati Agenzia</h1>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>Configurazione agenzia, agenti e testi</div>
      </div>

      {/* TABS */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 20px 0" }}>
        <div style={{ display: "flex", gap: 4, background: "#e8eaf0", borderRadius: 10, padding: 3, marginBottom: 20, width: "fit-content" }}>
          {[{ id: "agenzia", label: "🏢 Dati Agenzia" }, { id: "agenti", label: `👤 Agenti (${agents.length})` }, { id: "testi", label: "📝 Testi Report" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "10px 20px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans'", cursor: "pointer",
              background: tab === t.id ? "#fff" : "transparent", color: tab === t.id ? accent : "#888",
              boxShadow: tab === t.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px 60px" }}>

        {/* ═══ TAB: DATI AGENZIA ═══ */}
        {tab === "agenzia" && (<>
          <div style={{ background: "#fff", borderRadius: 12, padding: "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: accent, marginBottom: 16 }}>Dati generali</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4, textTransform: "uppercase" }}>Nome agenzia *</label><input style={iS} value={form.agenzia_nome} onChange={e => update("agenzia_nome", e.target.value)} placeholder="TAM Immobiliare srl" /></div>
              <div><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4, textTransform: "uppercase" }}>Indirizzo</label><input style={iS} value={form.agenzia_indirizzo} onChange={e => update("agenzia_indirizzo", e.target.value)} placeholder="Via Mazzini 14, Trieste" /></div>
              <div><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4, textTransform: "uppercase" }}>Telefono</label><input style={iS} value={form.agenzia_telefono} onChange={e => update("agenzia_telefono", e.target.value)} placeholder="+39 040 555 1234" /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 180px", gap: 12, marginBottom: 16 }}>
              <div><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4, textTransform: "uppercase" }}>Email</label><input style={iS} value={form.agenzia_email} onChange={e => update("agenzia_email", e.target.value)} placeholder="info@agenzia.it" /></div>
              <div><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4, textTransform: "uppercase" }}>Colore</label><input type="color" value={form.agenzia_colore} onChange={e => update("agenzia_colore", e.target.value)} style={{ width: "100%", height: 38, border: "none", borderRadius: 6, cursor: "pointer" }} /></div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4, textTransform: "uppercase" }}>Logo</label>
                <input id="logoUp" type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => { update("agenzia_logo", ev.target.result); setLogoPreview(ev.target.result); }; r.readAsDataURL(f); }} />
                <button onClick={() => document.getElementById("logoUp")?.click()} style={{ ...iS, cursor: "pointer", textAlign: "center", fontWeight: 600, color: logoPreview ? accent : "#999" }}>{logoPreview ? "✓ Logo caricato" : "📷 Carica logo"}</button>
                {logoPreview && <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}><img src={logoPreview} alt="" style={{ height: 30, borderRadius: 4 }} /><button onClick={() => { update("agenzia_logo", null); setLogoPreview(null); }} style={{ background: "none", border: "none", color: "#c33", cursor: "pointer", fontSize: 11 }}>✕</button></div>}
              </div>
            </div>

            {/* GOOGLE CARD */}
            <div style={{ marginTop: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 10, textTransform: "uppercase" }}>Recensioni Google</div>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, flex: "0 0 280px" }}>
                  <div><label style={{ display: "block", fontSize: 11, color: "#999", marginBottom: 3 }}>Voto (es. 4.8)</label><input style={iS} type="number" step="0.1" min="0" max="5" value={form.google_rating} onChange={e => update("google_rating", e.target.value)} placeholder="4.8" /></div>
                  <div><label style={{ display: "block", fontSize: 11, color: "#999", marginBottom: 3 }}>N° recensioni</label><input style={iS} type="number" value={form.google_reviews_count} onChange={e => update("google_reviews_count", e.target.value)} placeholder="127" /></div>
                </div>
                {/* Google-style preview */}
                {form.google_rating && (
                  <div style={{ background: "#fff", border: "1px solid #e8eaed", borderRadius: 8, padding: "14px 18px", flex: 1, fontFamily: "'Google Sans', 'Roboto', Arial, sans-serif" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 019.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 000 24c0 3.77.9 7.34 2.44 10.5l8.09-5.91z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#202124" }}>{form.agenzia_nome || "La tua agenzia"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 28, fontWeight: 400, color: "#202124", fontFamily: "'Google Sans', Arial" }}>{Number(form.google_rating).toFixed(1)}</span>
                      <div>
                        <GoogleStars rating={Number(form.google_rating) || 0} />
                        {form.google_reviews_count && <div style={{ fontSize: 12, color: "#70757a", marginTop: 2 }}>{Number(form.google_reviews_count).toLocaleString("it-IT")} recensioni</div>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button onClick={saveAgency} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: savedAgency ? "#e8f5e9" : accent, color: savedAgency ? "#2e7d32" : "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans'" }}>
              {savedAgency ? "✓ Dati salvati" : "💾 Salva dati agenzia"}
            </button>
          </div>
        </>)}

        {/* ═══ TAB: AGENTI ═══ */}
        {tab === "agenti" && (<>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "#666" }}>{agents.length} agenti registrati</div>
            <button onClick={startNewAgent} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: accent, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans'" }}>+ Nuovo agente</button>
          </div>

          {/* Agent form */}
          {editAgent !== null && (
            <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: 16, border: `2px solid ${accent}30` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: accent, marginBottom: 14 }}>{editAgent.id ? "Modifica agente" : "Nuovo agente"}</div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {/* Photo */}
                <div style={{ flex: "0 0 120px", textAlign: "center" }}>
                  <input id="agentPhotoUp" type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setAgentForm(af => ({ ...af, foto: ev.target.result })); r.readAsDataURL(f); }} />
                  <div onClick={() => document.getElementById("agentPhotoUp")?.click()} style={{ width: 100, height: 100, borderRadius: "50%", overflow: "hidden", margin: "0 auto 8px", cursor: "pointer", border: `2px dashed ${agentForm.foto ? accent : "#d8dce6"}`, display: "flex", alignItems: "center", justifyContent: "center", background: agentForm.foto ? "transparent" : "#f8f9fc" }}>
                    {agentForm.foto ? <img src={agentForm.foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 11, color: "#999", textAlign: "center", lineHeight: 1.3 }}>📷<br/>Carica<br/>foto</span>}
                  </div>
                  {agentForm.foto && <button onClick={() => setAgentForm(af => ({ ...af, foto: null }))} style={{ background: "none", border: "none", color: "#c33", cursor: "pointer", fontSize: 11 }}>✕ Rimuovi</button>}
                </div>
                {/* Fields */}
                <div style={{ flex: 1, minWidth: 300 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 3, textTransform: "uppercase" }}>Nome *</label><input style={iS} value={agentForm.nome} onChange={e => setAgentForm({ ...agentForm, nome: e.target.value })} placeholder="Marco" /></div>
                    <div><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 3, textTransform: "uppercase" }}>Cognome *</label><input style={iS} value={agentForm.cognome} onChange={e => setAgentForm({ ...agentForm, cognome: e.target.value })} placeholder="Tamaro" /></div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 3, textTransform: "uppercase" }}>Telefono</label><input style={iS} value={agentForm.telefono} onChange={e => setAgentForm({ ...agentForm, telefono: e.target.value })} placeholder="+39 333 1234567" /></div>
                    <div><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 3, textTransform: "uppercase" }}>Email</label><input style={iS} value={agentForm.email} onChange={e => setAgentForm({ ...agentForm, email: e.target.value })} placeholder="marco@agenzia.it" /></div>
                  </div>
                  <div><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 3, textTransform: "uppercase" }}>Descrizione / Bio</label><textarea style={{ ...iS, minHeight: 70, resize: "vertical", lineHeight: 1.6 }} value={agentForm.descrizione} onChange={e => setAgentForm({ ...agentForm, descrizione: e.target.value })} placeholder="Es. Agente immobiliare dal 2015, specializzato in immobili di pregio nel centro storico di Trieste..." /></div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button onClick={saveAgent} disabled={!agentForm.nome || !agentForm.cognome} style={{ padding: "9px 22px", borderRadius: 8, border: "none", background: agentForm.nome && agentForm.cognome ? accent : "#ccc", color: "#fff", cursor: agentForm.nome && agentForm.cognome ? "pointer" : "default", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans'" }}>{editAgent.id ? "Salva modifiche" : "Aggiungi agente"}</button>
                <button onClick={() => { setEditAgent(null); setAgentForm({ nome: "", cognome: "", telefono: "", email: "", foto: null, descrizione: "" }); }} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans'", color: "#666" }}>Annulla</button>
              </div>
            </div>
          )}

          {/* Agent list */}
          {agents.length === 0 && editAgent === null ? (
            <div style={{ background: "#fff", borderRadius: 12, padding: 40, textAlign: "center", color: "#999", fontSize: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>Nessun agente registrato. Aggiungi il primo!</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {agents.map(a => (
                <div key={a.id} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #eef0f4", display: "flex", alignItems: "center", gap: 16 }}>
                  {/* Photo */}
                  <div style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "#f0f2f7", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #eef0f4" }}>
                    {a.foto ? <img src={a.foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 20, color: "#ccc" }}>👤</span>}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e" }}>{a.cognome} {a.nome}</div>
                    <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{[a.telefono, a.email].filter(Boolean).join(" · ") || "Nessun contatto"}</div>
                    {a.descrizione && <div style={{ fontSize: 12, color: "#666", marginTop: 4, lineHeight: 1.5, maxHeight: 40, overflow: "hidden" }}>{a.descrizione}</div>}
                  </div>
                  {/* Actions */}
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
              ))}
            </div>
          )}
        </>)}

        {/* ═══ TAB: TESTI REPORT ═══ */}
        {tab === "testi" && (<>
          {/* Modus operandi */}
          <div style={{ background: "#fff", borderRadius: 12, padding: "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: accent }}>Modus operandi / Criteri di valutazione</div>
              <button onClick={saveModus} style={{ padding: "5px 14px", borderRadius: 6, border: "none", background: savedModus ? "#e8f5e9" : accent, color: savedModus ? "#2e7d32" : "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans'" }}>{savedModus ? "✓ Salvato" : "💾 Salva per tutte"}</button>
            </div>
            <textarea style={{ ...iS, minHeight: 120, resize: "vertical", lineHeight: 1.7 }} value={form.agenzia_modus_operandi} onChange={e => { update("agenzia_modus_operandi", e.target.value); setSavedModus(false); }} placeholder="Descrivi la metodologia..." />
          </div>

          {/* Testo mercato */}
          <div style={{ background: "#fff", borderRadius: 12, padding: "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: accent }}>Il mercato immobiliare a Trieste</div>
              <button onClick={saveMercato} style={{ padding: "5px 14px", borderRadius: 6, border: "none", background: savedMercato ? "#e8f5e9" : accent, color: savedMercato ? "#2e7d32" : "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans'" }}>{savedMercato ? "✓ Salvato" : "💾 Salva per tutte"}</button>
            </div>
            <textarea style={{ ...iS, minHeight: 160, resize: "vertical", lineHeight: 1.7 }} value={form.testo_mercato} onChange={e => { update("testo_mercato", e.target.value); setSavedMercato(false); }} placeholder="Il mercato immobiliare triestino..." />
          </div>

          {/* Zone */}
          <div style={{ background: "#fff", borderRadius: 12, padding: "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: accent }}>Descrizioni zone</div>
              <span style={{ fontSize: 12, color: "#999" }}>{zones.length} zone</span>
            </div>
            <p style={{ fontSize: 12, color: "#999", margin: "0 0 16px", lineHeight: 1.6 }}>Clicca su una zona per modificarne nome e descrizione. La descrizione verrà usata automaticamente nelle valutazioni.</p>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input style={{ ...iS, flex: 1 }} value={newZoneName} onChange={e => setNewZoneName(e.target.value)} placeholder="Nome nuova zona..." onKeyDown={e => e.key === "Enter" && addZone()} />
              <button onClick={addZone} disabled={!newZoneName.trim()} style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: newZoneName.trim() ? accent : "#ddd", color: newZoneName.trim() ? "#fff" : "#999", fontSize: 13, fontWeight: 600, cursor: newZoneName.trim() ? "pointer" : "default", fontFamily: "'DM Sans'", whiteSpace: "nowrap" }}>+ Aggiungi</button>
            </div>

            <div style={{ borderRadius: 10, border: "1px solid #eef0f4", overflow: "hidden" }}>
              {zones.map((z, i) => (
                <div key={z.id} style={{ borderBottom: i < zones.length - 1 ? "1px solid #f0f1f4" : "none" }}>
                  <div onClick={() => setEditZone(editZone === z.id ? null : z.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", cursor: "pointer", background: editZone === z.id ? `${accent}08` : "transparent" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: editZone === z.id ? accent : "#333" }}>{z.nome}</div>
                      <div style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>{z.descrizione ? `${z.descrizione.substring(0, 80)}...` : "Nessuna descrizione"}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {z.descrizione && <span style={{ fontSize: 10, color: "#2e7d32", background: "#e8f5e9", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>✓</span>}
                      <span style={{ fontSize: 16, color: editZone === z.id ? accent : "#ccc", transform: editZone === z.id ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</span>
                    </div>
                  </div>
                  {editZone === z.id && (
                    <div style={{ padding: "0 16px 16px", background: `${accent}04` }}>
                      <div style={{ marginBottom: 10 }}><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4, textTransform: "uppercase" }}>Nome zona</label><input style={iS} value={z.nome} onChange={e => updateZone(z.id, "nome", e.target.value)} /></div>
                      <div style={{ marginBottom: 10 }}><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4, textTransform: "uppercase" }}>Descrizione zona</label><textarea style={{ ...iS, minHeight: 120, resize: "vertical", lineHeight: 1.7 }} value={z.descrizione} onChange={e => updateZone(z.id, "descrizione", e.target.value)} placeholder="Descrivi questa zona..." /></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <button onClick={() => setEditZone(null)} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans'", color: "#666" }}>Chiudi</button>
                        <button onClick={() => { if (confirm(`Eliminare "${z.nome}"?`)) removeZone(z.id); }} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #fcc", background: "#fff", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans'", color: "#c33" }}>🗑️ Elimina zona</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>)}
      </div>
    </div>
  );
}
