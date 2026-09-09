import { useCallback, useEffect, useRef, useState } from 'react';
import type { Property } from '../../types/content';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { trackEvent } from '../../utils/analytics';
import { ArchitecturalVisual } from '../ui/ArchitecturalVisual';

export function PropertyGallery({ property }: { property: Property }) {
  const images = property.images ?? [];
  const [open, setOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const lightboxRef = useRef<HTMLDivElement>(null);

  const activeImage = images[activeImageIndex] ?? images[0];

  const close = useCallback(() => setOpen(false), []);

  useFocusTrap(lightboxRef, open, close);

  useEffect(() => {
    setActiveImageIndex(0);
    setOpen(false);
  }, [property.id]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const showImage = (index: number) => {
    setActiveImageIndex(index);
    setOpen(true);

    trackEvent('property_gallery_open', {
      property: property.slug,
      view: images[index]?.id ?? '',
    });
  };

  if (!images.length) {
    return (
      <div className="property-gallery">
        <div className="property-gallery__main">
          <ArchitecturalVisual variant={property.visual} decorative />
        </div>

        <div>
          <ArchitecturalVisual variant="courtyard" decorative />
        </div>

        <div>
          <ArchitecturalVisual variant="facade" decorative />
        </div>

        <div className="gallery-open">
          Sin fotografías disponibles
          <span>00</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="property-gallery">
        {images.slice(0, 3).map((image, index) => (
          <button
            type="button"
            className={index === 0 ? 'property-gallery__main' : undefined}
            onClick={() => showImage(index)}
            aria-label={`Abrir fotografía ${index + 1} de ${property.title}`}
            key={image.id}
          >
            <img src={image.url} alt={image.alt} decoding="async" />
          </button>
        ))}

        <button
          type="button"
          className="gallery-open"
          onClick={() => showImage(0)}
          aria-label={`Abrir galería de ${property.title}`}
        >
          Ver todas las imágenes
          <span>{String(images.length).padStart(2, '0')}</span>
        </button>
      </div>

      {open && activeImage ? (
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

          <img src={activeImage.url} alt={activeImage.alt} />

          {images.length > 1 ? (
            <div className="lightbox__navigation">
              <button
                type="button"
                onClick={() =>
                  setActiveImageIndex((current) =>
                    current === 0 ? images.length - 1 : current - 1,
                  )
                }
                aria-label="Ver fotografía anterior"
              >
                ←
              </button>

              <span aria-live="polite">
                {activeImageIndex + 1} / {images.length}
              </span>

              <button
                type="button"
                onClick={() =>
                  setActiveImageIndex((current) =>
                    current === images.length - 1 ? 0 : current + 1,
                  )
                }
                aria-label="Ver fotografía siguiente"
              >
                →
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
