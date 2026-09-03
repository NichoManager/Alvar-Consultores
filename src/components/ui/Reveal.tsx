import type { HTMLAttributes } from 'react';
import { useReveal } from '../../hooks/useReveal';

export function Reveal({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} ${className}`} {...props} />;
}
