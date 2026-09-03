import { Link } from 'react-router-dom';

export function Breadcrumbs({ items }: { items: Array<{ label: string; to?: string }> }) {
  return (
    <nav className="breadcrumbs" aria-label="Migas de pan">
      {items.map((item, index) => <span key={item.label}>{index > 0 && <i>/</i>}{item.to ? <Link to={item.to}>{item.label}</Link> : item.label}</span>)}
    </nav>
  );
}
