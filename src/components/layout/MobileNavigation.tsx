import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { business } from '../../data/business';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { Button } from '../ui/Button';

interface MobileNavigationProps {
  open: boolean;
  onClose: () => void;
}

const links = [
  ['Inicio', '/'],
  ['Inmuebles', '/inmuebles'],
  ['Servicios', '/servicios'],
  ['Nosotros', '/nosotros'],
  ['Opiniones', '/opiniones'],
  ['Blog', '/blog'],
  ['Contacto', '/contacto'],
];

export function MobileNavigation({ open, onClose }: MobileNavigationProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open, onClose);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  return (
    <div ref={dialogRef} className="mobile-nav" role="dialog" aria-modal="true" aria-label="Navegación principal">
      <div className="mobile-nav__top">
        <span className="brand-mark"><strong>ALVAR</strong><small>CONSULTORES INMOBILIARIOS</small></span>
        <button className="icon-button" onClick={onClose} aria-label="Cerrar menú">×</button>
      </div>
      <nav>
        {links.map(([label, to], index) => (
          <NavLink key={to} to={to} onClick={onClose}><span>0{index + 1}</span>{label}</NavLink>
        ))}
      </nav>
      <div className="mobile-nav__bottom">
        <Button to="/#valoracion" onClick={onClose}>Solicitar valoración</Button>
        <a href={`tel:${business.phoneMobileHref}`}>{business.phoneMobile}</a>
        <a href={business.instagramUrl} target="_blank" rel="noreferrer">Instagram · {business.instagram}</a>
      </div>
    </div>
  );
}
