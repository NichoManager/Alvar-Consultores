import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { MobileNavigation } from './MobileNavigation';

const links = [
  ['Inicio', '/'],
  ['Inmuebles', '/inmuebles'],
  ['Servicios', '/servicios'],
  ['Nosotros', '/nosotros'],
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
          <Link
            to="/"
            className="brand-mark brand-mark--image"
            aria-label="Alvar Consultores Inmobiliarios"
          >
            <img
              src="/images/alvar/logo-alvar-consultores-inmobiliarios.png"
              alt="Alvar Consultores Inmobiliarios"
              width="197"
              height="155"
            />
          </Link>

          <nav className="desktop-nav" aria-label="Navegación principal">
            {links.map(([label, to]) => (
              <NavLink key={to} to={to} end={to === '/'}>
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
