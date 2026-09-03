import { Link } from 'react-router-dom';

interface ServiceBlockProps {
  number: string;
  title: string;
  text: string;
}

export function ServiceBlock({ number, title, text }: ServiceBlockProps) {
  return (
    <Link to="/servicios" className="service-block">
      <span className="service-block__number">{number}</span>
      <div><h3>{title}</h3><p>{text}</p></div>
      <span className="service-block__arrow" aria-hidden="true">↗</span>
    </Link>
  );
}
