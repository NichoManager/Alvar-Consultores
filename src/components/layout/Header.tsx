import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { MobileNavigation } from './MobileNavigation';

const leftLinks = [
  ['Comprar', '/inmuebles?operation=venta'],
  ['Vender', '/vender'],
  ['Alquilar', '/inmuebles?operation=alquiler'],
] as const;

const rightLinks = [
  ['Servicios', '/servicios'],
  ['Blog', '/blog'],
  ['Contacto', '/contacto'],
] as const;

function isNavigationLinkCurrent(
  pathname: string,
  search: string,
  hash: string,
  to: string,
) {
  const target = new URL(to, 'https://alvar.local');

  if (pathname !== target.pathname) {
    return false;
  }

  const currentSearch = new URLSearchParams(search);

  const matchesSearch = [...target.searchParams].every(
    ([key, value]) => currentSearch.get(key) === value,
  );

  if (!matchesSearch) {
    return false;
  }

  if (target.hash && hash !== target.hash) {
    return false;
  }

  return true;
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const isCurrent = (to: string) =>
    isNavigationLinkCurrent(
      location.pathname,
      location.search,
      location.hash,
      to,
    );

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    onScroll();

    window.addEventListener('scroll', onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search, location.hash]);

  return (
    <>
      <header
        className={`site-header is-over-hero ${
          scrolled ? 'is-scrolled' : ''
        }`}
      >
        <Container className="site-header__inner">
          <nav
            className="desktop-nav desktop-nav--left"
            aria-label="Navegación principal"
          >
            {leftLinks.map(([label, to]) => {
              const active = isCurrent(to);

              return (
                <Link
                  key={to}
                  to={to}
                  className={active ? 'active' : undefined}
                  aria-current={active ? 'page' : undefined}
                >
                  {label}
                </Link>
              );
            })}
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

          <nav
            className="desktop-nav desktop-nav--right"
            aria-label="Navegación complementaria"
          >
            {rightLinks.map(([label, to]) => {
              const active = isCurrent(to);

              return (
                <Link
                  key={to}
                  to={to}
                  className={active ? 'active' : undefined}
                  aria-current={active ? 'page' : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <Button
            to="/vender#valoracion"
            className="header-cta"
          >
            Valora tu inmueble
          </Button>

          <button
            className="menu-button"
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú de navegación"
            aria-controls="mobile-navigation"
            aria-expanded={menuOpen}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </Container>
      </header>

      <MobileNavigation
        open={menuOpen}
        onClose={closeMenu}
      />
    </>
  );
}