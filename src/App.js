import React, { useState } from 'react';
import ValutazioneImmobili from './ValutazioneImmobili';
import ReportValutazione from './ReportValutazione';
import Dashboard from './Dashboard';

// Simple localStorage wrapper to mimic window.storage API from Claude artifacts
if (!window.storage) {
  window.storage = {
    get: async (key) => {
      const val = localStorage.getItem(`app_${key}`);
      return val ? { key, value: val } : null;
    },
    set: async (key, value) => {
      localStorage.setItem(`app_${key}`, value);
      return { key, value };
    },
    delete: async (key) => {
      localStorage.removeItem(`app_${key}`);
      return { key, deleted: true };
    },
    list: async (prefix) => {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k.startsWith(`app_${prefix || ''}`)) keys.push(k.replace('app_', ''));
      }
      return { keys };
    }
  };
}

export default function App() {
  const [page, setPage] = useState('form');

  const navStyle = (p) => ({
    padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'all 0.2s',
    background: page === p ? '#1a3a5c' : 'rgba(255,255,255,0.15)',
    color: '#fff',
  });

  return (
    <div>
      {/* Top Navigation */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: 'linear-gradient(135deg, #0f2539, #1a3a5c)',
        padding: '8px 16px', display: 'flex', gap: 8, justifyContent: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      }}>
        <button style={navStyle('form')} onClick={() => setPage('form')}>📝 Nuova Valutazione</button>
        <button style={navStyle('report')} onClick={() => setPage('report')}>📄 Report</button>
        <button style={navStyle('dashboard')} onClick={() => setPage('dashboard')}>📊 Dashboard</button>
      </div>

      {/* Content with top padding for fixed nav */}
      <div style={{ paddingTop: 52 }}>
        {page === 'form' && <ValutazioneImmobili />}
        {page === 'report' && <ReportValutazione />}
        {page === 'dashboard' && <Dashboard />}
      </div>
    </div>
  );
}
