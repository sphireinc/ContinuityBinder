import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { APP_NAME, APP_TAGLINE } from './constants';
import './styles.css';

function App() {
  return (
    <main className="app-shell">
      <p className="eyebrow">Local-first</p>
      <h1>{APP_NAME}</h1>
      <p>{APP_TAGLINE}</p>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
