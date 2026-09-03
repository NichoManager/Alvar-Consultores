import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { MobileNavigation } from './MobileNavigation';

const links = [
  ['Inicio', '/'], ['Inmuebles', '/inmuebles'], ['Servicios', '/servicios'], ['Nosotros', '/nosotros'],
  ['Opiniones', '/opiniones'], ['Blog', '/blog'], ['Contacto', '/contacto'],
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <>
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <Container className="site-header__inner">
          <Link to="/" className="brand-mark" aria-label="Alvar Consultores Inmobiliarios, inicio">
            <strong>ALVAR</strong><small>CONSULTORES INMOBILIARIOS</small>
          </Link>
          <nav className="desktop-nav" aria-label="Navegación principal">
            {links.map(([label, to]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}
          </nav>
          <Button to="/#valoracion" className="header-cta">Valora tu inmueble</Button>
          <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menú" aria-expanded={menuOpen}>
            <span /><span />
          </button>
        </Container>
      </header>
      <MobileNavigation open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
