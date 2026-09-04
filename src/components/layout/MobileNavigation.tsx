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
  ['Vender', '/#valoracion'],
  ['Alquilar', '/inmuebles?operation=alquiler'],
  ['Servicios', '/servicios'],
  ['Blog', '/blog'],
  ['Contacto', '/contacto'],
];

export function MobileNavigation({ open, onClose }: MobileNavigationProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isCurrent = (to: string) => {
    const target = new URL(to, window.location.origin);
    if (location.pathname !== target.pathname) return false;
    if (target.search && location.search !== target.search) return false;
    if (target.hash && location.hash !== target.hash) return false;
    return true;
  };
  useFocusTrap(dialogRef, open, onClose);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  return (
    <div id="mobile-navigation" ref={dialogRef} className="mobile-nav" role="dialog" aria-modal="true" aria-label="Navegación principal">
      <div className="mobile-nav__top">
        <span className="brand-mark"><strong>ALVAR</strong><small>CONSULTORES INMOBILIARIOS</small></span>
        <button className="icon-button" onClick={onClose} aria-label="Cerrar menú">×</button>
      </div>
      <nav>
        {links.map(([label, to], index) => (
          <Link key={to} to={to} onClick={onClose} className={isCurrent(to) ? 'active' : undefined} aria-current={isCurrent(to) ? 'page' : undefined}><span>0{index + 1}</span>{label}</Link>
        ))}
      </nav>
      <div className="mobile-nav__bottom">
        <Button to="/#valoracion" onClick={onClose}>Solicitar valoración</Button>
        <a className="mobile-nav__phone" href={`tel:${business.phoneMobileHref}`}>{business.phoneMobile}</a>
        <div className="mobile-nav__social"><a href={business.instagramUrl} target="_blank" rel="noreferrer">Instagram ↗</a><a href={business.tiktokUrl} target="_blank" rel="noreferrer">TikTok ↗</a></div>
      </div>
    </div>
  );
}
