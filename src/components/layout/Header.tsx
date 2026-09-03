import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { MobileNavigation } from './MobileNavigation';

const leftLinks = [
  ['Inmuebles', '/inmuebles'],
  ['Servicios', '/servicios'],
  ['Nosotros', '/nosotros'],
];

const rightLinks = [
  ['Opiniones', '/opiniones'],
  ['Blog', '/blog'],
  ['Contacto', '/contacto'],
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <>
      <header className={`site-header ${isHome ? 'is-over-hero' : ''} ${scrolled ? 'is-scrolled' : ''}`}>
        <Container className="site-header__inner">
          <nav className="desktop-nav desktop-nav--left" aria-label="Navegación principal">
            {leftLinks.map(([label, to]) => (
              <NavLink key={to} to={to}>
                {label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/"
            className="brand-mark brand-mark--image brand-mark--circular"
            aria-label="Ir a la página de inicio de Alvar Consultores Inmobiliarios"
          >
            <img
              src="/images/alvar/logo-alvar-circular.png"
              alt="Alvar Consultores Inmobiliarios"
              width="1254"
              height="1254"
            />
          </Link>

          <nav className="desktop-nav desktop-nav--right" aria-label="Navegación complementaria">
            {rightLinks.map(([label, to]) => (
              <NavLink key={to} to={to}>
                {label}
              </NavLink>
            ))}
          </nav>

          <Button to="/#valoracion" className="header-cta">
            Valora tu inmueble
          </Button>

          <button
            className="menu-button"
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            aria-controls="mobile-navigation"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
          </button>
        </Container>
      </header>

      <MobileNavigation open={menuOpen} onClose={closeMenu} />
    </>
  );
}
