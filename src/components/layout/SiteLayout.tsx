import { useEffect } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { Footer } from './Footer';
import { Header } from './Header';

export function SiteLayout() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const target = document.getElementById(location.hash.slice(1));
    if (target) window.requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [location.hash, location.pathname]);

  return (
    <>
      <a className="skip-link" href="#main-content">Saltar al contenido</a>
      <Header />
      <main id="main-content"><Outlet /></main>
      <Footer />
      <ScrollRestoration />
    </>
  );
}
