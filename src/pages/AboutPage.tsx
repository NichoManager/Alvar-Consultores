import { SeoHead } from '../components/seo/SeoHead';
import { ArchitecturalVisual } from '../components/ui/ArchitecturalVisual';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { InternalHero } from '../components/ui/InternalHero';

const values = [
  {
    number: '01',
    title: 'Profesionalidad',
    text: 'Criterio, preparación y una estrategia clara antes de tomar decisiones.',
  },
  {
    number: '02',
    title: 'Cercanía',
    text: 'Comunicación directa, seguimiento personal y un interlocutor durante el proceso.',
  },
  {
    number: '03',
    title: 'Transparencia',
    text: 'Información comprensible sobre mercado, documentación, negociación y próximos pasos.',
  },
  {
    number: '04',
    title: 'Compromiso',
    text: 'Acompañamiento desde la primera conversación hasta completar la operación.',
  },
] as const;

export function AboutPage() {
  return (
    <>
      <SeoHead
        title="Sobre Alvar Consultores Inmobiliarios | Madrid"
        description="Más de 18 años de experiencia inmobiliaria y un enfoque cercano, transparente y profesional para operaciones en Madrid capital y alrededores."
        path="/nosotros"
      />

      <InternalHero
        eyebrow="ALVAR CONSULTORES"
        title={
          <>
            Experiencia inmobiliaria
            <br />
            <em>y trato directo.</em>
          </>
        }
        text="Más de 18 años acompañando decisiones inmobiliarias en Madrid capital y alrededores."
        image="/images/alvar/heroes/hero-nosotros-alvar.webp"
        aside={
          <div className="big-stat">
            <strong>18+</strong>
            <span>años de experiencia acumulada</span>
          </div>
        }
      />

      <section
        className="story-section section-pad"
        aria-labelledby="about-story-title"
      >
        <Container className="story-section__grid">
          <div className="story-section__visual">
            <div className="story-section__media">
              <ArchitecturalVisual
                variant="facade"
                label="Composición editorial sobre arquitectura y vivienda"
              />

              <div className="story-section__seal" aria-hidden="true">
                <strong>18+</strong>
                <span>años</span>
              </div>

              <div className="story-section__caption">
                <span>MADRID CAPITAL Y ALREDEDORES</span>
                <p>Experiencia, criterio y seguimiento personal.</p>
              </div>
            </div>

            <div className="story-section__signature">
              <span>ALVAR CONSULTORES</span>
              <p>
                Una forma de trabajar basada en entender primero la operación y
                decidir después.
              </p>
            </div>
          </div>

          <div className="story-section__content">
            <p className="eyebrow">NUESTRA FORMA DE TRABAJAR</p>

            <h2 id="about-story-title">
              Conocimiento del mercado.
              <br />
              <em>Seguimiento personal.</em>
            </h2>

            <p className="story-section__lead">
              En una operación inmobiliaria no basta con enseñar propiedades o
              publicar un anuncio. Hay que entender el contexto, valorar las
              alternativas y saber qué decisión conviene tomar en cada momento.
            </p>

            <p>
              Alvar Consultores Inmobiliarios reúne más de 18 años de experiencia
              profesional acumulada en el sector. La sociedad se constituyó en
              2016, consolidando una trayectoria previa ligada a la intermediación
              y el asesoramiento inmobiliario.
            </p>

            <p>
              Trabajamos con propietarios, compradores e inversores que necesitan
              una lectura clara de la operación, una negociación bien planteada y
              seguimiento durante los trámites hasta llegar a la firma.
            </p>

            <div
              className="story-section__principles"
              aria-label="Principios de trabajo de Alvar Consultores"
            >
              <div>
                <span>01</span>
                <strong>Escuchamos antes de proponer</strong>
              </div>

              <div>
                <span>02</span>
                <strong>Analizamos antes de decidir</strong>
              </div>

              <div>
                <span>03</span>
                <strong>Acompañamos hasta el cierre</strong>
              </div>
            </div>

            <Button to="/contacto" variant="secondary">
              Hablar con nosotros
            </Button>
          </div>
        </Container>
      </section>

      <section
        className="values-section section-pad"
        aria-labelledby="about-values-title"
      >
        <Container>
          <header className="values-section__intro">
            <div>
              <p className="eyebrow">NUESTROS VALORES</p>

              <h2 id="about-values-title">
                Una forma de trabajar que se nota
                <br />
                <em>en cada decisión.</em>
              </h2>
            </div>

            <p>
              Queremos que cada cliente sepa qué estamos haciendo, por qué lo
              hacemos y qué opciones tiene antes de avanzar.
            </p>
          </header>

          <div className="values-grid">
            {values.map(({ number, title, text }) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="about-closing">
        <Container>
          <div className="about-closing__inner">
            <div className="about-closing__content">
              <p className="eyebrow">HABLEMOS DE TU OPERACIÓN</p>

              <h2>
                Las decisiones importantes
                <br />
                <em>merecen un trato personal.</em>
              </h2>

              <p>
                Si estás pensando en comprar, vender, alquilar o invertir,
                cuéntanos tu situación y veremos contigo qué pasos tiene sentido
                dar.
              </p>
            </div>

            <div className="about-closing__actions">
              <Button to="/contacto" variant="light">
                Contactar con Alvar
              </Button>

              <Button to="/servicios" variant="secondary">
                Ver servicios
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}