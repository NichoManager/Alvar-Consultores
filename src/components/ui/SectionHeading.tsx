import type { ReactNode } from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  text?: string;
  align?: 'left' | 'center';
  inverse?: boolean;
}

export function SectionHeading({ eyebrow, title, text, align = 'left', inverse = false }: SectionHeadingProps) {
  return (
    <div className={`section-heading section-heading--${align}${inverse ? ' section-heading--inverse' : ''}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {text && <p className="section-heading__text">{text}</p>}
    </div>
  );
}
