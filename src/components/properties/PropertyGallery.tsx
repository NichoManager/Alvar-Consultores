import { useCallback, useEffect, useRef, useState } from 'react';
import type { Property } from '../../types/content';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { trackEvent } from '../../utils/analytics';
import { ArchitecturalVisual } from '../ui/ArchitecturalVisual';

export function PropertyGallery({ property }: { property: Property }) {
  const [open, setOpen] = useState(false);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useFocusTrap(lightboxRef, open, close);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);
  const show = () => { setOpen(true); trackEvent('property_gallery_open', { property: property.slug }); };
  return (
    <>
      <div className="property-gallery">
        <button className="property-gallery__main" onClick={show} aria-label={`Abrir galería de ${property.title}`}><ArchitecturalVisual variant={property.visual} decorative /></button>
        <button onClick={show} aria-label="Abrir segunda vista"><ArchitecturalVisual variant="courtyard" decorative /></button>
        <button onClick={show} aria-label="Abrir tercera vista"><ArchitecturalVisual variant="facade" decorative /></button>
        <button className="gallery-open" onClick={show}>Ver todas las imágenes <span>03</span></button>
      </div>
      {open && <div ref={lightboxRef} className="lightbox" role="dialog" aria-modal="true" aria-label={`Galería de ${property.title}`}><button className="lightbox__close" onClick={close} aria-label="Cerrar galería">×</button><ArchitecturalVisual variant={property.visual} decorative /></div>}
    </>
  );
}
