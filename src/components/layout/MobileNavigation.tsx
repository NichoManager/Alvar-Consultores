import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { business } from '../../data/business';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { Button } from '../ui/Button';

interface MobileNavigationProps {
  open: boolean;
  onClose: () => void;
}

const links = [
  ['Comprar', '/inmuebles?operation=venta'],
  ['Vender', '/vender'],
  ['Alquilar', '/inmuebles?operation=alquiler'],
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

export function MobileNavigation({
  open,
  onClose,
}: MobileNavigationProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isCurrent = (to: string) =>
    isNavigationLinkCurrent(
      location.pathname,
      location.search,
      location.hash,
      to,
    );

  useFocusTrap(dialogRef, open, onClose);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      id="mobile-navigation"
      ref={dialogRef}
      className="mobile-nav"
      role="dialog"
      aria-modal="true"
      aria-label="Navegación principal"
    >
      <div className="mobile-nav__top">
        <Link
          to="/"
          className="mobile-nav__brand"
          onClick={onClose}
          aria-label="Ir a la página de inicio de Alvar Consultores Inmobiliarios"
        >
          <img
            src="/images/alvar/logo-alvar-circular.png"
            alt="Alvar Consultores Inmobiliarios"
            width="1254"
            height="1254"
          />
        </Link>

        <button
          className="icon-button"
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú de navegación"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>

      <nav aria-label="Navegación móvil">
        {links.map(([label, to], index) => {
          const active = isCurrent(to);

          return (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={active ? 'active' : undefined}
              aria-current={active ? 'page' : undefined}
            >
              <span aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>

              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mobile-nav__bottom">
        <Button
          to="/vender#valoracion"
          onClick={onClose}
        >
          Solicitar valoración
        </Button>

        <a
          className="mobile-nav__phone"
          href={`tel:${business.phoneMobileHref}`}
          aria-label={`Llamar a Alvar Consultores Inmobiliarios al ${business.phoneMobile}`}
        >
          <span>Contacto directo</span>
          <strong>{business.phoneMobile}</strong>
        </a>

        <div
          className="mobile-nav__social"
          aria-label="Redes sociales"
        >
          <a
            href={business.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram ↗
          </a>

          <a
            href={business.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            TikTok ↗
          </a>
        </div>
      </div>
    </div>
  );
}