import React from 'react';
import ReactDOM from 'react-dom/client';
import { storageReady } from './storage';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
// Attende l'eventuale trasferimento dei dati dal browser all'archivio prima di mostrare l'app
storageReady.finally(() => root.render(<App />));
