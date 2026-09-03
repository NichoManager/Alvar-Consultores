import type { ReactNode } from 'react';
import { Container } from './Container';

export function InternalHero({ eyebrow, title, text, aside }: { eyebrow: string; title: ReactNode; text?: string; aside?: ReactNode }) {
  return <header className="internal-hero"><Container className="internal-hero__grid"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{text && <p>{text}</p>}</div>{aside && <div className="internal-hero__aside">{aside}</div>}</Container></header>;
}
