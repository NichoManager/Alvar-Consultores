import { Link } from 'react-router-dom';
import { business } from '../../data/business';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';

export function Footer() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="site-footer__lead">
          <div className="site-footer__lead-copy">
            <p className="eyebrow">ALVAR CONSULTORES</p>

            <h2>
              Tu propiedad merece
              <br />
              una estrategia clara.
            </h2>

            <p>
              Compra, venta, alquiler e inversión inmobiliaria con
              acompañamiento profesional en Madrid capital y alrededores.
            </p>
          </div>

          <Button to="/contacto" variant="light">
            Hablar con un asesor
          </Button>
        </div>

        <div className="site-footer__grid">
          <div className="site-footer__brand-column">
            <Link
              to="/"
              className="brand-mark brand-mark--footer"
              aria-label="Ir al inicio de Alvar Consultores Inmobiliarios"
            >
              <strong>ALVAR</strong>
              <small>CONSULTORES INMOBILIARIOS</small>
            </Link>

            <p>
              Asesoramiento cercano para comprar, vender, alquilar o invertir
              en Madrid capital y alrededores.
            </p>
          </div>

          <nav
            className="site-footer__nav"
            aria-label="Navegación del pie de página"
          >
            <h3>Navegación</h3>

            <Link to="/servicios">Servicios</Link>
            <Link to="/nosotros">Nosotros</Link>
            <Link to="/opiniones">Opiniones</Link>
            <Link to="/blog">Blog</Link>
          </nav>

          <div className="site-footer__contact">
            <h3>Contacto</h3>

            <a
              href={`tel:${business.phoneMobileHref}`}
              aria-label={`Llamar a Alvar Consultores Inmobiliarios al ${business.phoneMobile}`}
            >
              {business.phoneMobile}
            </a>

            <address>
              <p>
                {business.addressLine1}
                <br />
                {business.addressLine2}
                <br />
                {business.postalAddress}
              </p>
            </address>
          </div>

          <div className="site-footer__social">
            <h3>Social</h3>

            <a
              href={business.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram ↗
            </a>

            <a
              href={business.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              TikTok ↗
            </a>
          </div>
        </div>

        <div className="site-footer__legal">
          <span>
            © {new Date().getFullYear()} {business.legalName}
          </span>

          <div className="site-footer__legal-links">
            <Link to="/aviso-legal">Aviso legal</Link>
            <Link to="/privacidad">Privacidad</Link>
            <Link to="/cookies">Cookies</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}