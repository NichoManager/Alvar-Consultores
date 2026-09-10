import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import type { PropertyImage } from '../../types/content';
import { Container } from '../ui/Container';
import './PropertyFloorplans.css';

export function PropertyFloorplans({
  floorplans,
  propertyTitle,
}: {
  floorplans: PropertyImage[];
  propertyTitle: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const isOpen = activeIndex !== null;
  const activeFloorplan =
    activeIndex !== null ? floorplans[activeIndex] : undefined;
  const close = useCallback(() => setActiveIndex(null), []);

  useFocusTrap(lightboxRef, isOpen, close);

  useEffect(() => {
    setActiveIndex(null);
  }, [propertyTitle]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (floorplans.length === 0) {
    return null;
  }

  return (
    <section
      id="property-floorplans"
      className="property-floorplans"
      aria-labelledby="property-floorplans-title"
    >
      <Container>
        <header className="property-floorplans__heading">
          <div>
            <span>PLANOS</span>
            <h2 id="property-floorplans-title">
              Distribución del inmueble
            </h2>
          </div>

          <p>
            Consulta cada planta con detalle y amplía el plano para verlo a
            tamaño completo.
          </p>
        </header>

        <div className="property-floorplans__grid">
          {floorplans.map((floorplan, index) => (
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Ampliar plano ${index + 1} de ${propertyTitle}`}
              key={floorplan.id}
            >
              <img
                src={floorplan.url}
                alt={floorplan.alt}
                loading="lazy"
                decoding="async"
              />
              <span>
                Plano {String(index + 1).padStart(2, '0')}
                <i aria-hidden="true">↗</i>
              </span>
            </button>
          ))}
        </div>
      </Container>

      {isOpen && activeFloorplan ? (
        <div
          ref={lightboxRef}
          className="property-floorplans__lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Planos de ${propertyTitle}`}
        >
          <button
            type="button"
            className="property-floorplans__close"
            onClick={close}
            aria-label="Cerrar plano"
          >
            ×
          </button>

          <img src={activeFloorplan.url} alt={activeFloorplan.alt} />

          {floorplans.length > 1 ? (
            <div className="property-floorplans__navigation">
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((current) =>
                    current === null || current === 0
                      ? floorplans.length - 1
                      : current - 1,
                  )
                }
                aria-label="Ver plano anterior"
              >
                ←
              </button>

              <span aria-live="polite">
                {(activeIndex ?? 0) + 1} / {floorplans.length}
              </span>

              <button
                type="button"
                onClick={() =>
                  setActiveIndex((current) =>
                    current === null || current === floorplans.length - 1
                      ? 0
                      : current + 1,
                  )
                }
                aria-label="Ver plano siguiente"
              >
                →
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
