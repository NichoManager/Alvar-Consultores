import { Link } from 'react-router-dom';
import { business } from '../../data/business';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';

export function Footer() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="site-footer__lead">
          <p className="eyebrow">ALVAR CONSULTORES</p>
          <h2>Tu próxima operación<br />empieza aquí.</h2>
          <Button to="/contacto" variant="light">Hablar con un asesor</Button>
        </div>
        <div className="site-footer__grid">
          <div><span className="brand-mark brand-mark--footer"><strong>ALVAR</strong><small>CONSULTORES INMOBILIARIOS</small></span><p>Asesoramiento cercano para comprar, vender, alquilar o invertir en Madrid y su zona sur.</p></div>
          <div><h3>Navegación</h3><Link to="/inmuebles">Inmuebles</Link><Link to="/servicios">Servicios</Link><Link to="/nosotros">Nosotros</Link><Link to="/opiniones">Opiniones</Link><Link to="/blog">Blog</Link><Link to="/contacto">Contacto</Link></div>
          <div><h3>Contacto</h3><a href={`tel:${business.phoneOfficeHref}`}>{business.phoneOffice}</a><a href={`tel:${business.phoneMobileHref}`}>{business.phoneMobile}</a><p>{business.addressLine1}<br />{business.addressLine2}<br />{business.postalAddress}</p></div>
          <div><h3>Social</h3><a href={business.instagramUrl} target="_blank" rel="noreferrer">Instagram ↗</a><a href={business.tiktokUrl} target="_blank" rel="noreferrer">TikTok ↗</a></div>
        </div>
        <div className="site-footer__legal">
          <span>© {new Date().getFullYear()} {business.legalName}</span>
          <div><Link to="/aviso-legal">Aviso legal</Link><Link to="/privacidad">Privacidad</Link><Link to="/cookies">Cookies</Link></div>
        </div>
      </Container>
    </footer>
  );
}
