interface ArchitecturalVisualProps {
  variant?: 'arch' | 'courtyard' | 'facade';
  label?: string;
  className?: string;
}

export function ArchitecturalVisual({ variant = 'arch', label = 'Imagen arquitectónica provisional', className = '' }: ArchitecturalVisualProps) {
  return (
    <div className={`architectural-visual architectural-visual--${variant} ${className}`} role="img" aria-label={label}>
      <span className="architectural-visual__sun" />
      <span className="architectural-visual__plane architectural-visual__plane--one" />
      <span className="architectural-visual__plane architectural-visual__plane--two" />
      <span className="architectural-visual__line" />
      <small>Visual provisional · sustituir por fotografía real</small>
    </div>
  );
}
