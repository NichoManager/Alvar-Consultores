import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/internal.css';

const container = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Las páginas públicas llegan prerenderizadas (scripts/prerender.mjs) y se hidratan;
// el resto de rutas (fichas de inmuebles, administración) arrancan desde el HTML vacío.
if (container.dataset.prerendered === 'true') {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
