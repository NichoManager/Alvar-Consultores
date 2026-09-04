import { useCallback, useEffect, useRef, useState } from 'react';
import type { Property } from '../../types/content';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { trackEvent } from '../../utils/analytics';
import { ArchitecturalVisual } from '../ui/ArchitecturalVisual';

export function PropertyGallery({ property }: { property: Property }) {
  const [open, setOpen] = useState(false);
  const [activeView, setActiveView] = useState(property.visual);
  const lightboxRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useFocusTrap(lightboxRef, open, close);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const show = (view: Property['visual']) => {
    setActiveView(view);
    setOpen(true);

    trackEvent('property_gallery_open', {
      property: property.slug,
      view,
    });
  };

  return (
    <>
      <div className="property-gallery">
        <button
          type="button"
          className="property-gallery__main"
          onClick={() => show(property.visual)}
          aria-label={`Abrir vista principal de ${property.title}`}
        >
          <ArchitecturalVisual variant={property.visual} decorative />
        </button>

        <button
          type="button"
          onClick={() => show('courtyard')}
          aria-label={`Abrir segunda vista de ${property.title}`}
        >
          <ArchitecturalVisual variant="courtyard" decorative />
        </button>

        <button
          type="button"
          onClick={() => show('facade')}
          aria-label={`Abrir tercera vista de ${property.title}`}
        >
          <ArchitecturalVisual variant="facade" decorative />
        </button>

        <button
          type="button"
          className="gallery-open"
          onClick={() => show(property.visual)}
          aria-label={`Abrir galería de ${property.title}`}
        >
          Ver todas las imágenes
          <span>03</span>
        </button>
      </div>

      {open && (
        <div
          ref={lightboxRef}
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Galería de ${property.title}`}
        >
          <button
            type="button"
            className="lightbox__close"
            onClick={close}
            aria-label="Cerrar galería"
          >
            ×
          </button>

          <ArchitecturalVisual variant={activeView} decorative />
        </div>
      )}
    </>
  );
}