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

export default function DatiAgenzia() {
  const [form, setForm] = useState({
    agenzia_nome: "", agenzia_indirizzo: "", agenzia_telefono: "", agenzia_email: "",
    agenzia_colore: "#1a3a5c", agenzia_logo: null, agenzia_modus_operandi: "", testo_mercato: "",
  });
  const [zones, setZones] = useState([]);
  const [logoPreview, setLogoPreview] = useState(null);
  const [savedAgency, setSavedAgency] = useState(false);
  const [savedMercato, setSavedMercato] = useState(false);
  const [savedModus, setSavedModus] = useState(false);
  const [editZone, setEditZone] = useState(null);
  const [newZoneName, setNewZoneName] = useState("");
  const [loading, setLoading] = useState(true);

  const accent = form.agenzia_colore || "#1a3a5c";

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("agency_settings");
        if (res && res.value) {
          const d = JSON.parse(res.value);
          setForm(f => ({ ...f, ...d }));
          if (d.agenzia_logo) setLogoPreview(d.agenzia_logo);
          setSavedAgency(true);
        }
        const zRes = await window.storage.get("zones_config");
        if (zRes && zRes.value) setZones(JSON.parse(zRes.value));
        else setZones(DEFAULT_ZONES);
        const mRes = await window.storage.get("saved_testo_mercato");
        if (mRes && mRes.value) { setForm(f => ({ ...f, testo_mercato: f.testo_mercato || mRes.value })); setSavedMercato(true); }
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const update = (k, v) => { setForm(f => ({ ...f, [k]: v })); setSavedAgency(false); };

  const saveAgency = async () => {
    try {
      const data = { ...form };
      await window.storage.set("agency_settings", JSON.stringify(data));
      setSavedAgency(true);
    } catch (e) {}
  };

  const saveMercato = async () => {
    try {
      await window.storage.set("saved_testo_mercato", form.testo_mercato);
      setSavedMercato(true);
    } catch (e) {}
  };

  const saveModus = async () => {
    try {
      const agData = { ...form };
      await window.storage.set("agency_settings", JSON.stringify(agData));
      setSavedModus(true);
    } catch (e) {}
  };

  const saveZones = async (newZones) => {
    setZones(newZones);
    try { await window.storage.set("zones_config", JSON.stringify(newZones)); } catch (e) {}
  };

  const updateZone = (id, field, value) => {
    const nz = zones.map(z => z.id === id ? { ...z, [field]: value } : z);
    saveZones(nz);
  };

  const addZone = () => {
    if (!newZoneName.trim()) return;
    const nz = [...zones, { id: Date.now(), nome: newZoneName.trim(), descrizione: "" }];
    saveZones(nz);
    setNewZoneName("");
  };

  const removeZone = (id) => {
    saveZones(zones.filter(z => z.id !== id));
    if (editZone === id) setEditZone(null);
  };

  const iS = { padding: "9px 12px", border: "1.5px solid #d8dce6", borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans', sans-serif", background: "#f8f9fc", color: "#1a1a2e", outline: "none", boxSizing: "border-box", width: "100%" };

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#666" }}>Caricamento...</div>;

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f0f2f7", minHeight: "100vh", color: "#1a1a2e" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ background: `linear-gradient(135deg, ${accent}, ${accent}dd)`, padding: "24px 28px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#fff", fontFamily: "'Playfair Display', serif" }}>🏢 Dati Agenzia</h1>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>Configurazione agenzia, testi e zone</div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 20px 60px" }}>

        {/* ═══ DATI GENERALI ═══ */}
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
              <input id="logoUploadAg" type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => { update("agenzia_logo", ev.target.result); setLogoPreview(ev.target.result); }; r.readAsDataURL(f); }} />
              <button onClick={() => document.getElementById("logoUploadAg")?.click()} style={{ ...iS, cursor: "pointer", textAlign: "center", fontWeight: 600, color: logoPreview ? accent : "#999" }}>
                {logoPreview ? "✓ Logo caricato" : "📷 Carica logo"}
              </button>
              {logoPreview && <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}><img src={logoPreview} alt="" style={{ height: 30, borderRadius: 4 }} /><button onClick={() => { update("agenzia_logo", null); setLogoPreview(null); }} style={{ background: "none", border: "none", color: "#c33", cursor: "pointer", fontSize: 11 }}>✕</button></div>}
            </div>
          </div>
          <button onClick={saveAgency} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: savedAgency ? "#e8f5e9" : accent, color: savedAgency ? "#2e7d32" : "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans'" }}>
            {savedAgency ? "✓ Dati salvati" : "💾 Salva dati agenzia"}
          </button>
        </div>

        {/* ═══ MODUS OPERANDI ═══ */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: accent }}>Modus operandi / Criteri di valutazione</div>
            <button onClick={saveModus} style={{ padding: "5px 14px", borderRadius: 6, border: "none", background: savedModus ? "#e8f5e9" : accent, color: savedModus ? "#2e7d32" : "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans'" }}>
              {savedModus ? "✓ Salvato" : "💾 Salva per tutte"}
            </button>
          </div>
          <textarea style={{ ...iS, minHeight: 120, resize: "vertical", lineHeight: 1.7 }} value={form.agenzia_modus_operandi} onChange={e => { update("agenzia_modus_operandi", e.target.value); setSavedModus(false); }} placeholder="Descrivi la metodologia e i criteri utilizzati per le valutazioni immobiliari..." />
        </div>

        {/* ═══ TESTO MERCATO ═══ */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: accent }}>Il mercato immobiliare a Trieste</div>
            <button onClick={saveMercato} style={{ padding: "5px 14px", borderRadius: 6, border: "none", background: savedMercato ? "#e8f5e9" : accent, color: savedMercato ? "#2e7d32" : "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans'" }}>
              {savedMercato ? "✓ Salvato" : "💾 Salva per tutte"}
            </button>
          </div>
          <textarea style={{ ...iS, minHeight: 160, resize: "vertical", lineHeight: 1.7 }} value={form.testo_mercato} onChange={e => { update("testo_mercato", e.target.value); setSavedMercato(false); }} placeholder="Il mercato immobiliare triestino presenta caratteristiche peculiari..." />
        </div>

        {/* ═══ ZONE ═══ */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: accent }}>Descrizioni zone</div>
            <span style={{ fontSize: 12, color: "#999" }}>{zones.length} zone configurate</span>
          </div>
          <p style={{ fontSize: 12, color: "#999", margin: "0 0 16px", lineHeight: 1.6 }}>Clicca su una zona per modificarne nome e descrizione. La descrizione verrà usata automaticamente quando un agente seleziona quella zona nella valutazione.</p>

          {/* Add zone */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input style={{ ...iS, flex: 1 }} value={newZoneName} onChange={e => setNewZoneName(e.target.value)} placeholder="Nome nuova zona..." onKeyDown={e => e.key === "Enter" && addZone()} />
            <button onClick={addZone} disabled={!newZoneName.trim()} style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: newZoneName.trim() ? accent : "#ddd", color: newZoneName.trim() ? "#fff" : "#999", fontSize: 13, fontWeight: 600, cursor: newZoneName.trim() ? "pointer" : "default", fontFamily: "'DM Sans'", whiteSpace: "nowrap" }}>+ Aggiungi zona</button>
          </div>

          {/* Zone list */}
          <div style={{ borderRadius: 10, border: "1px solid #eef0f4", overflow: "hidden" }}>
            {zones.map((z, i) => (
              <div key={z.id} style={{ borderBottom: i < zones.length - 1 ? "1px solid #f0f1f4" : "none" }}>
                {/* Zone header */}
                <div onClick={() => setEditZone(editZone === z.id ? null : z.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", cursor: "pointer", background: editZone === z.id ? `${accent}08` : "transparent", transition: "background 0.2s" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: editZone === z.id ? accent : "#333" }}>{z.nome}</div>
                    <div style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>{z.descrizione ? `${z.descrizione.substring(0, 80)}...` : "Nessuna descrizione"}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {z.descrizione && <span style={{ fontSize: 10, color: "#2e7d32", background: "#e8f5e9", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>✓</span>}
                    <span style={{ fontSize: 16, color: editZone === z.id ? accent : "#ccc", transition: "transform 0.2s", transform: editZone === z.id ? "rotate(90deg)" : "none" }}>›</span>
                  </div>
                </div>

                {/* Zone edit panel */}
                {editZone === z.id && (
                  <div style={{ padding: "0 16px 16px", background: `${accent}04` }}>
                    <div style={{ marginBottom: 10 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4, textTransform: "uppercase" }}>Nome zona</label>
                      <input style={iS} value={z.nome} onChange={e => updateZone(z.id, "nome", e.target.value)} />
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4, textTransform: "uppercase" }}>Descrizione zona</label>
                      <textarea style={{ ...iS, minHeight: 120, resize: "vertical", lineHeight: 1.7 }} value={z.descrizione} onChange={e => updateZone(z.id, "descrizione", e.target.value)} placeholder="Descrivi questa zona: caratteristiche, servizi, tipologia edilizia, atmosfera..." />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <button onClick={() => setEditZone(null)} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans'", color: "#666" }}>Chiudi</button>
                      <button onClick={() => { if (confirm(`Eliminare la zona "${z.nome}"?`)) removeZone(z.id); }} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #fcc", background: "#fff", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans'", color: "#c33" }}>🗑️ Elimina zona</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {zones.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", color: "#999", fontSize: 13 }}>Nessuna zona configurata. Aggiungine una sopra.</div>
          )}
        </div>

      </div>
    </div>
  );
}
