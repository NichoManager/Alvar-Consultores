interface ArchitecturalVisualProps {
  variant?: 'arch' | 'courtyard' | 'facade';
  label?: string;
  className?: string;
  decorative?: boolean;
}

export function ArchitecturalVisual({ variant = 'arch', label = 'Composición arquitectónica editorial', className = '', decorative = false }: ArchitecturalVisualProps) {
  return (
    <div className={`architectural-visual architectural-visual--${variant} ${className}`} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : label} aria-hidden={decorative || undefined}>
      <span className="architectural-visual__sun" />
      <span className="architectural-visual__plane architectural-visual__plane--one" />
      <span className="architectural-visual__plane architectural-visual__plane--two" />
      <span className="architectural-visual__line" />
    </div>
  );
}
