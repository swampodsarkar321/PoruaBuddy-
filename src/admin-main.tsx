import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import { RtdbAdminPanel } from './components/RtdbAdminPanel';
import './index.css';

// Standalone admin app — same Realtime Database, no main site.
ReactDOM.createRoot(document.getElementById('admin-root')!).render(
  <React.StrictMode>
    <AppProvider>
      <div className="min-h-screen">
        <RtdbAdminPanel />
      </div>
    </AppProvider>
  </React.StrictMode>
);
