import { useEffect, useState, type ReactNode } from 'react';
import { Container } from './Container';

type InternalHeroProps = {
  eyebrow: string;
  title: ReactNode;
  text?: string;
  aside?: ReactNode;
  meta?: ReactNode;
  image?: string;
  imageAlt?: string;
  coverage?: string;
  align?: 'left' | 'center';
  compact?: boolean;
};

export function InternalHero({
  eyebrow,
  title,
  text,
  aside,
  meta,
  image,
  imageAlt = '',
  coverage = 'Madrid capital y alrededores',
  align = 'left',
  compact = false,
}: InternalHeroProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [image]);

  return (
    <header
      className={`internal-hero internal-hero--${align} ${compact ? 'internal-hero--compact' : ''}`.trim()}
    >
      <div className={`internal-hero__media ${!image || imageFailed ? 'is-fallback' : ''}`}>
        {image && !imageFailed && (
          <img src={image} alt={imageAlt} onError={() => setImageFailed(true)} />
        )}
        <div className="internal-hero__fallback" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="internal-hero__overlay" aria-hidden="true" />
      </div>

      <Container className={`internal-hero__grid ${aside ? '' : 'internal-hero__grid--solo'}`.trim()}>
        <div className="internal-hero__content">
          {meta && <div className="internal-hero__meta">{meta}</div>}
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {text && <p className="internal-hero__text">{text}</p>}
        </div>
        {aside && <div className="internal-hero__aside">{aside}</div>}
      </Container>

      <div className="internal-hero__rail">
        <Container>
          <span>{coverage}</span>
          <i aria-hidden="true" />
          <span>Alvar Consultores Inmobiliarios</span>
        </Container>
      </div>
    </header>
  );
}
