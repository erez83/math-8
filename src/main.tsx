import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { runStartupMigrations } from './lib/migrations';
import { initUpdates } from './lib/update';
import './styles.css';

async function start() {
  try {
    // Bring stored data up to date (with an automatic backup) before anything reads it.
    await runStartupMigrations(__APP_VERSION__);
  } catch (e) {
    console.error('migration failed', e);
  }
  // Ask the browser to keep our data even under storage pressure.
  navigator.storage?.persist?.().catch(() => {});
  initUpdates();
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

start();
