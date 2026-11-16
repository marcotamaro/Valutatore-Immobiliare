import React, { useState } from 'react';
import ValutazioneImmobili from './ValutazioneImmobili';
import ReportValutazione from './ReportValutazione';
import Dashboard from './Dashboard';
import DatiAgenzia from './DatiAgenzia';

// window.storage (archivio condiviso su database) è impostato in ./storage.js

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [reportData, setReportData] = useState(null);
  const [reportBack, setReportBack] = useState('dashboard');
  const [formKey, setFormKey] = useState(0);

  const go = (p) => {
    if (p === 'form' && page !== 'form') setFormKey(k => k + 1); // form pulito a ogni apertura
    setPage(p);
  };
  const openReport = (v, back) => { setReportData(v); setReportBack(back); setPage('report'); };

  const navStyle = (p) => ({
    padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'all 0.2s',
    background: page === p ? '#1a3a5c' : 'rgba(255,255,255,0.15)', color: '#fff',
  });

  return (
    <div>
      {page !== 'report' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          background: 'linear-gradient(135deg, #0f2539, #1a3a5c)',
          padding: '8px 16px', display: 'flex', gap: 8, justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        }}>
          <button style={navStyle('dashboard')} onClick={() => go('dashboard')}>📊 Dashboard</button>
          <button style={navStyle('form')} onClick={() => go('form')}>📝 Nuova Valutazione</button>
          <button style={navStyle('agenzia')} onClick={() => go('agenzia')}>🏢 Dati Agenzia</button>
          <a href="/logout" style={{ ...navStyle('logout'), textDecoration: 'none', position: 'absolute', right: 16, background: 'transparent', opacity: 0.8 }}>Esci</a>
        </div>
      )}

      <div style={{ paddingTop: page !== 'report' ? 52 : 0 }}>
        {page === 'dashboard' && (
          <Dashboard
            onViewReport={(v) => openReport(v, 'dashboard')}
            onEdit={() => { setFormKey(k => k + 1); setPage('form'); }}
          />
        )}
        {page === 'form' && <ValutazioneImmobili key={formKey} onSaved={(v) => openReport(v, 'dashboard')} />}
        {page === 'agenzia' && <DatiAgenzia />}
        {page === 'report' && (
          <ReportValutazione initialData={reportData} onBack={() => { setReportData(null); setPage(reportBack); }} />
        )}
      </div>
    </div>
  );
}
