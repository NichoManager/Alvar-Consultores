import { Link } from 'react-router-dom';

interface ServiceBlockProps {
  number: string;
  title: string;
  text: string;
}

export function ServiceBlock({ number, title, text }: ServiceBlockProps) {
  return (
    <Link
      to="/servicios"
      className="service-block"
      aria-label={`Ver servicio de ${title.toLowerCase()}`}
    >
      <span className="service-block__number">{number}</span>

      <div className="service-block__content">
        <span className="service-block__kicker">Servicio inmobiliario</span>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>

      <span className="service-block__cta">
        Ver servicio <i aria-hidden="true">↗</i>
      </span>
    </Link>
  );
}