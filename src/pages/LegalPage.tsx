import { SeoHead } from '../components/seo/SeoHead';
import { Container } from '../components/ui/Container';
import { InternalHero } from '../components/ui/InternalHero';

type LegalKind = 'legal' | 'privacy' | 'cookies';

interface LegalContent {
  title: string;
  eyebrow: string;
  intro: string;
  seoDescription: string;
  aside: string;
  sections: Array<{
    title: string;
    text: string;
  }>;
}

const content: Record<LegalKind, LegalContent> = {
  legal: {
    title: 'Aviso legal',
    eyebrow: 'AVISO LEGAL',
    intro:
      'Información corporativa y condiciones generales de uso del sitio web de Alvar Consultores Inmobiliarios.',
    seoDescription:
      'Aviso legal de Alvar Consultores Inmobiliarios. Información corporativa y condiciones generales de uso del sitio web.',
    aside: 'Información corporativa',
    sections: [
      {
        title: 'Titular del sitio',
        text:
          'Alvar Consultores Inmobiliarios, S.L. Domicilio comunicado: Calle Ríos Rosas 42, planta 1, 28003 Madrid. Los datos registrales, fiscales y el correo electrónico de contacto deberán incorporarse una vez hayan sido confirmados antes de la publicación definitiva del sitio.',
      },
      {
        title: 'Uso del sitio web',
        text:
          'Los contenidos de este sitio tienen carácter informativo. Las fichas inmobiliarias identificadas como contenido demostrativo o provisional no constituyen ofertas vinculantes ni acreditan disponibilidad real de los inmuebles mostrados.',
      },
      {
        title: 'Información inmobiliaria',
        text:
          'La información relativa a inmuebles, precios, superficies, características, disponibilidad y condiciones deberá confirmarse de forma individual antes de asumir cualquier compromiso relacionado con una operación inmobiliaria.',
      },
      {
        title: 'Propiedad intelectual',
        text:
          'Los textos, marcas, fotografías, elementos gráficos y demás recursos utilizados en la versión definitiva del sitio deberán contar con las correspondientes autorizaciones o derechos de uso. Los recursos visuales provisionales deberán sustituirse o validarse antes de la publicación final.',
      },
      {
        title: 'Enlaces externos',
        text:
          'El sitio puede incluir enlaces a servicios o plataformas externas. Alvar Consultores Inmobiliarios no controla el contenido, disponibilidad ni políticas propias de dichos servicios externos.',
      },
    ],
  },

  privacy: {
    title: 'Política de privacidad',
    eyebrow: 'PRIVACIDAD',
    intro:
      'Información sobre el tratamiento de los datos enviados a través de los formularios y canales de contacto del sitio.',
    seoDescription:
      'Política de privacidad de Alvar Consultores Inmobiliarios e información sobre el tratamiento de datos personales.',
    aside: 'Protección de datos',
    sections: [
      {
        title: 'Responsable del tratamiento',
        text:
          'Alvar Consultores Inmobiliarios, S.L. será el responsable del tratamiento de los datos personales enviados a través de los formularios y canales de contacto del sitio. Los datos fiscales y el correo electrónico definitivo para cuestiones relacionadas con privacidad deberán incorporarse tras su confirmación.',
      },
      {
        title: 'Finalidad',
        text:
          'Los datos facilitados podrán utilizarse para responder consultas, solicitudes de información sobre inmuebles, peticiones de valoración y otras comunicaciones iniciadas por la persona interesada cuando los formularios estén conectados al sistema definitivo de recepción.',
      },
      {
        title: 'Base del tratamiento',
        text:
          'La base prevista para atender las solicitudes enviadas voluntariamente a través del sitio es el consentimiento de la persona interesada y, cuando corresponda, la aplicación de otras bases legitimadoras vinculadas a la relación precontractual o contractual.',
      },
      {
        title: 'Conservación y destinatarios',
        text:
          'Los plazos concretos de conservación, proveedores tecnológicos y posibles destinatarios deberán documentarse de acuerdo con la configuración definitiva del sistema de formularios, correo, alojamiento y demás herramientas utilizadas por la web.',
      },
      {
        title: 'Derechos',
        text:
          'La versión definitiva de esta política deberá indicar el canal confirmado para ejercer los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, así como cualquier otra información exigible en materia de protección de datos.',
      },
      {
        title: 'Formularios y comunicaciones',
        text:
          'Antes de publicar la web deberá comprobarse que todos los formularios incorporan la información necesaria sobre privacidad, consentimiento y tratamiento de los datos de acuerdo con su finalidad concreta.',
      },
    ],
  },

  cookies: {
    title: 'Política de cookies',
    eyebrow: 'COOKIES',
    intro:
      'Información sobre el uso actual y la futura configuración de cookies y tecnologías similares en este sitio web.',
    seoDescription:
      'Política de cookies de Alvar Consultores Inmobiliarios e información sobre tecnologías de medición y consentimiento.',
    aside: 'Preferencias y medición',
    sections: [
      {
        title: 'Configuración actual',
        text:
          'En la configuración actual del proyecto no se integran herramientas de medición como Google Analytics, Google Tag Manager ni plataformas publicitarias. Las posibles funciones técnicas imprescindibles del navegador no se utilizan actualmente para crear perfiles publicitarios de los usuarios.',
      },
      {
        title: 'Cookies no esenciales',
        text:
          'Si en el futuro se incorporan servicios de analítica, publicidad, mapas, vídeos, redes sociales u otras herramientas que utilicen cookies o tecnologías no esenciales, deberá revisarse esta política antes de activar dichos servicios.',
      },
      {
        title: 'Consentimiento',
        text:
          'Cuando la configuración técnica lo requiera, deberá implementarse un sistema que permita informar al usuario y solicitar el consentimiento correspondiente antes de activar las tecnologías que no sean estrictamente necesarias.',
      },
      {
        title: 'Proveedores y duración',
        text:
          'La versión definitiva deberá identificar las cookies y tecnologías utilizadas, su finalidad, duración, proveedor y, cuando corresponda, la existencia de servicios prestados por terceros.',
      },
      {
        title: 'Retirada del consentimiento',
        text:
          'Si se incorporan tecnologías sujetas a consentimiento, el usuario deberá disponer de un mecanismo accesible para modificar o retirar posteriormente sus preferencias.',
      },
      {
        title: 'Actualización de esta política',
        text:
          'Esta política deberá revisarse junto con la configuración técnica definitiva del sitio antes de su publicación y cada vez que se incorporen o eliminen herramientas que puedan modificar el uso de cookies o tecnologías similares.',
      },
    ],
  },
};

function getLegalPath(kind: LegalKind) {
  if (kind === 'legal') return '/aviso-legal';
  if (kind === 'privacy') return '/privacidad';
  return '/cookies';
}

export function LegalPage({ kind }: { kind: LegalKind }) {
  const page = content[kind];
  const path = getLegalPath(kind);

  return (
    <>
      <SeoHead
        title={`${page.title} | Alvar Consultores Inmobiliarios`}
        description={page.seoDescription}
        path={path}
        noIndex
      />

      <InternalHero
        eyebrow={page.eyebrow}
        title={page.title}
        text={page.intro}
        image="/images/alvar/heroes/hero-legal-alvar.webp"
        compact
        aside={
          <span className="internal-hero__quote">
            {page.aside}
          </span>
        }
      />

      <section
        className="legal-content section-pad"
        aria-labelledby="legal-content-title"
      >
        <Container>
          <div className="legal-warning" role="note">
            <strong>Documento provisional</strong>
            <span>
              Pendiente de validación jurídica y de incorporar los datos
              corporativos y técnicos definitivos antes de producción.
            </span>
          </div>

          <div className="legal-content__heading">
            <p className="eyebrow">INFORMACIÓN</p>

            <h2 id="legal-content-title">
              {page.title}
            </h2>
          </div>

          <div className="legal-content__sections">
            {page.sections.map((section, index) => (
              <section key={section.title}>
                <span aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div>
                  <h3>{section.title}</h3>
                  <p>{section.text}</p>
                </div>
              </section>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}