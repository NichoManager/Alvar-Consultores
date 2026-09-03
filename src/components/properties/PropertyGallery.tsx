import { useCallback, useRef, useState } from 'react';
import type { Property } from '../../types/content';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { trackEvent } from '../../utils/analytics';
import { ArchitecturalVisual } from '../ui/ArchitecturalVisual';

export function PropertyGallery({ property }: { property: Property }) {
  const [open, setOpen] = useState(false);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useFocusTrap(lightboxRef, open, close);
  const show = () => { setOpen(true); trackEvent('property_gallery_open', { property: property.slug }); };
  return (
    <>
      <div className="property-gallery">
        <button className="property-gallery__main" onClick={show} aria-label="Abrir galería provisional"><ArchitecturalVisual variant={property.visual} label={`Visual provisional de ${property.title}`} /></button>
        <button onClick={show} aria-label="Abrir segunda vista provisional"><ArchitecturalVisual variant="courtyard" label="Segunda vista arquitectónica provisional" /></button>
        <button onClick={show} aria-label="Abrir tercera vista provisional"><ArchitecturalVisual variant="facade" label="Tercera vista arquitectónica provisional" /></button>
        <button className="gallery-open" onClick={show}>Ver todas las imágenes <span>03</span></button>
      </div>
      {open && <div ref={lightboxRef} className="lightbox" role="dialog" aria-modal="true" aria-label="Galería provisional"><button className="lightbox__close" onClick={close} aria-label="Cerrar galería">×</button><ArchitecturalVisual variant={property.visual} label={`Visual ampliado provisional de ${property.title}`} /><p>Galería provisional. Sustituir por reportaje fotográfico real.</p></div>}
    </>
  );
}
