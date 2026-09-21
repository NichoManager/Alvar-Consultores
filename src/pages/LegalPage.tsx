import { SeoHead } from '../components/seo/SeoHead';
import { Container } from '../components/ui/Container';
import { InternalHero } from '../components/ui/InternalHero';

type LegalKind =
  | 'legal'
  | 'privacy'
  | 'cookies';

interface LegalLink {
  label: string;
  href: string;
}

interface LegalSection {
  title: string;
  paragraphs?: string[];
  items?: string[];
  links?: LegalLink[];
}

interface LegalContent {
  title: string;
  eyebrow: string;
  intro: string;
  seoDescription: string;
  aside: string;
  sections: LegalSection[];
}

const content: Record<
  LegalKind,
  LegalContent
> = {
  legal: {
    title: 'Aviso legal',
    eyebrow: 'AVISO LEGAL',
    intro:
      'Condiciones generales de uso, información corporativa y normas aplicables al sitio web de Alvar Consultores Inmobiliarios.',
    seoDescription:
      'Aviso legal y condiciones generales de uso del sitio web de Alvar Consultores Inmobiliarios.',
    aside:
      'Condiciones generales',
    sections: [
      {
        title:
          'Condiciones generales · Datos identificativos',
        paragraphs: [
          'En cumplimiento del deber de información recogido en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico, se facilitan los siguientes datos:',

          'La empresa titular del sitio web www.alvarconsultoresinmobiliarios.es (en adelante, el Sitio Web) es ALVAR CONSULTORES INMOBILIARIOS SL, con domicilio en C/RIO ROSAS 42, 1º PLANTA, 28003 Madrid, con C.I.F. B87458428 y correo electrónico de contacto info@alvarconsultoresinmobiliarios.es (en adelante, ALVAR CONSULTORES INMOBILIARIOS).',
        ],
      },
      {
        title: 'Usuarios',
        paragraphs: [
          'El acceso y/o uso de este Sitio Web atribuye la condición de Usuario, que acepta, desde dicho acceso y/o uso, las Condiciones Generales aquí reflejadas. Estas condiciones se aplicarán con independencia de las Condiciones Generales de Contratación que resulten, en su caso, de obligado cumplimiento.',
        ],
      },
      {
        title: 'Uso de la web',
        paragraphs: [
          'El Usuario se obliga a realizar una utilización del Sitio Web, de sus contenidos, condiciones y servicios de conformidad con la ley, la moral, las buenas costumbres y el orden público. No podrá utilizarlo de forma contraria a estas condiciones, de manera lesiva para ALVAR CONSULTORES INMOBILIARIOS SL o para terceros, ni de cualquier forma que pueda dañar, inutilizar o deteriorar el Sitio Web o sus servicios, o impedir su normal utilización por otros usuarios.',

          'El Usuario se compromete a no transmitir, introducir, difundir ni poner a disposición de terceros materiales o información —como programas, virus, macros, applets, controles ActiveX, datos, contenidos, dibujos, archivos de sonido o imagen— que sean contrarios a la ley o al orden público, o que causen o puedan causar cualquier tipo de alteración en los sistemas informáticos.',

          'Con carácter general, los menores de edad deberán haber obtenido previamente la autorización de sus padres, tutores o representantes legales para hacer uso del Sitio Web. Estos serán responsables de los actos realizados a través del Portal por los menores a su cargo. En aquellos servicios en los que expresamente se indique, el acceso quedará restringido exclusivamente a mayores de 14 años.',
        ],
      },
      {
        title:
          'Protección de datos',
        paragraphs: [
          'ALVAR CONSULTORES INMOBILIARIOS SL cumple con el Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, relativo a la protección de las personas físicas en lo que respecta al tratamiento de datos personales y a la libre circulación de estos datos, así como con la demás normativa vigente que resulte de aplicación.',

          'En los formularios destinados a la recogida de datos personales, el usuario será informado de las condiciones aplicables al tratamiento de sus datos, la identidad y dirección del responsable, la finalidad del tratamiento, las posibles comunicaciones a terceros y la forma de ejercer sus derechos en materia de protección de datos.',

          'Asimismo, ALVAR CONSULTORES INMOBILIARIOS SL declara su cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico, y solicitará el consentimiento correspondiente cuando proceda utilizar el correo electrónico del usuario con fines comerciales.',
        ],
      },
      {
        title:
          'Propiedad intelectual e industrial',
        paragraphs: [
          'ALVAR CONSULTORES INMOBILIARIOS SL, por sí o como cesionaria, es titular de los derechos de propiedad intelectual e industrial correspondientes al Sitio Web y a los elementos contenidos en él, incluyendo, entre otros, imágenes, sonido, audio, vídeo, software, textos, logotipos, marcas, combinaciones de colores, estructura, diseño y selección de materiales.',

          'Queda expresamente prohibida la reproducción, distribución y comunicación pública, incluida su modalidad de puesta a disposición, de la totalidad o de parte de los contenidos del Sitio Web con fines comerciales, en cualquier soporte y por cualquier medio técnico, sin la autorización de ALVAR CONSULTORES INMOBILIARIOS SL.',
        ],
      },
      {
        title:
          'Exclusión de garantías y responsabilidad',
        paragraphs: [
          'ALVAR CONSULTORES INMOBILIARIOS SL no se hace responsable de los daños y perjuicios de cualquier naturaleza que pudieran derivarse de errores u omisiones en los contenidos, falta de disponibilidad del portal o transmisión de virus u otros elementos dañinos, a pesar de haber adoptado las medidas tecnológicas razonablemente necesarias para prevenirlos.',
        ],
      },
      {
        title: 'Modificaciones',
        paragraphs: [
          'ALVAR CONSULTORES INMOBILIARIOS SL se reserva el derecho a efectuar, sin previo aviso, las modificaciones que considere oportunas en su Sitio Web, pudiendo cambiar, suprimir o añadir contenidos y servicios, así como modificar la forma en la que estos aparecen presentados.',
        ],
      },
      {
        title: 'Uso de cookies',
        paragraphs: [
          'ALVAR CONSULTORES INMOBILIARIOS SL puede utilizar cookies y tecnologías similares necesarias para el correcto funcionamiento del Sitio Web y, cuando corresponda, servicios de terceros sujetos al consentimiento del usuario.',

          'El Usuario puede aceptar, rechazar o configurar el uso de tecnologías no esenciales mediante el sistema de preferencias disponible en el Sitio Web. Puede ampliar esta información en la Política de Cookies.',
        ],
      },
      {
        title:
          'Política de privacidad',
        paragraphs: [
          'ALVAR CONSULTORES INMOBILIARIOS SL',

          'CIF: B87458428',

          'Domicilio: C/RIO ROSAS 42, 1º PLANTA, 28003 MADRID',

          'Correo electrónico: info@alvarconsultoresinmobiliarios.es',

          'Mediante la presente política, ALVAR CONSULTORES INMOBILIARIOS SL informa a los usuarios de www.alvarconsultoresinmobiliarios.es sobre el tratamiento de sus datos personales, las finalidades para las que pueden ser utilizados, sus derechos, las medidas de seguridad aplicables y las comunicaciones comerciales que, en su caso, puedan realizarse.',

          'En el tratamiento de datos de carácter personal, ALVAR CONSULTORES INMOBILIARIOS SL garantiza el cumplimiento del Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo relativo a la protección de las personas físicas. Esta normativa tiene por objeto garantizar y proteger las libertades públicas y los derechos fundamentales de las personas físicas y, en especial, su honor e intimidad personal y familiar.',

          'La utilización del Sitio Web y de cualquiera de los servicios incorporados en él supone la aceptación de las condiciones que resulten aplicables.',

          'ALVAR CONSULTORES INMOBILIARIOS SL se reserva el derecho de modificar esta Política de Protección de Datos cuando resulte necesario para adaptarla a novedades legislativas, cambios normativos o modificaciones en sus actividades.',

          'ALVAR CONSULTORES INMOBILIARIOS SL garantiza el cumplimiento de las obligaciones establecidas por la normativa de protección de datos, de servicios de la sociedad de la información y de cualquier otra norma que complemente o sustituya a las anteriores.',
        ],
      },
      {
        title:
          'Responsable del tratamiento',
        paragraphs: [
          'ALVAR CONSULTORES INMOBILIARIOS SL',

          'CIF: B87458428',

          'Domicilio: C/RIO ROSAS 42, 1º PLANTA, 28003 MADRID',

          'Correo electrónico: info@alvarconsultoresinmobiliarios.es',
        ],
      },
      {
        title:
          'Finalidad del tratamiento y calidad de los datos',
        paragraphs: [
          'Los datos de carácter personal solicitados mediante nuestros formularios o facilitados a través de nuestras direcciones de correo electrónico se incorporarán al sistema de tratamiento de datos personales cuyo responsable es ALVAR CONSULTORES INMOBILIARIOS SL.',

          'Los datos serán tratados con la debida confidencialidad y de conformidad con la normativa vigente en materia de protección de datos personales, incluido el Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo.',

          'Este Sitio Web se rige por la normativa aplicable en España, a la que quedan sometidas las personas, tanto nacionales como extranjeras, que lo utilicen.',

          'Los datos solicitados serán adecuados, pertinentes y limitados a lo necesario en relación con las finalidades para las que se recaban, y no serán utilizados para finalidades incompatibles con aquellas para las que hayan sido facilitados.',

          'Salvo que se indique expresamente lo contrario, los campos señalados como obligatorios deberán ser cumplimentados. Los datos facilitados por el Usuario deberán ser verdaderos, exactos, completos y estar actualizados.',

          'El Usuario será responsable de los daños o perjuicios, directos o indirectos, que pudiera ocasionar a ALVAR CONSULTORES INMOBILIARIOS SL o a terceros como consecuencia de facilitar datos falsos, inexactos, incompletos o pertenecientes a terceros sin la debida autorización.',

          'Los datos personales pueden obtenerse mediante formularios, comunicaciones por correo electrónico y otros canales de contacto disponibles en el Sitio Web.',
        ],
        items: [
          'Gestión de usuarios y clientes.',
          'Atención de solicitudes de información.',
          'Prestación de servicios contratados.',
          'Envío de comunicaciones comerciales relacionadas con los servicios de ALVAR CONSULTORES INMOBILIARIOS SL, cuando exista consentimiento expreso para ello.',
        ],
      },
      {
        title:
          'Recopilación de información',
        paragraphs: [
          'La información tratada puede pertenecer a las siguientes categorías generales:',

          'Información facilitada directamente por el usuario.',

          'ALVAR CONSULTORES INMOBILIARIOS SL puede solicitar determinados datos de carácter personal necesarios para la utilización de los servicios y el correcto funcionamiento de determinadas funcionalidades del Sitio Web.',

          'Información relacionada con el uso del Sitio Web y los dispositivos.',

          'En función de los servicios utilizados y de las tecnologías activadas, puede generarse determinada información técnica relativa al uso del sitio, al dispositivo empleado, al navegador, al sistema operativo o a la interacción con determinadas funcionalidades.',
        ],
        items: [
          'Datos facilitados al completar formularios de contacto o solicitudes de información.',
          'Datos proporcionados cuando el Usuario contacta directamente mediante correo electrónico u otros canales habilitados.',
          'Datos necesarios para gestionar una relación comercial o prestar un servicio solicitado.',
          'Datos relacionados con comunicaciones comerciales, únicamente cuando exista la base jurídica correspondiente.',
        ],
      },
      {
        title:
          'Derechos de los usuarios',
        paragraphs: [
          'El Usuario podrá ejercer sus derechos de acceso, rectificación, supresión, limitación, oposición y portabilidad mediante comunicación dirigida a ALVAR CONSULTORES INMOBILIARIOS SL, en la dirección postal indicada o en el correo electrónico info@alvarconsultoresinmobiliarios.es.',

          'La solicitud deberá permitir acreditar adecuadamente la identidad del interesado cuando ello resulte necesario para garantizar que los derechos se ejercen de forma legítima.',

          'Asimismo, el Usuario puede presentar una reclamación ante la Agencia Española de Protección de Datos si considera que el tratamiento de sus datos personales no se ajusta a la normativa aplicable.',
        ],
      },
      {
        title:
          '¿Cómo protegemos tu información personal?',
        paragraphs: [
          'ALVAR CONSULTORES INMOBILIARIOS SL se compromete a proteger la información personal de los usuarios mediante medidas técnicas y organizativas adecuadas destinadas a preservar su confidencialidad, integridad y disponibilidad.',

          'Estas medidas pueden incluir controles físicos, técnicos y lógicos de acceso, así como procedimientos destinados a restringir y administrar la forma en la que la información personal es procesada, gestionada y conservada.',
        ],
      },
      {
        title:
          'Plazo de conservación',
        paragraphs: [
          'Los datos se conservarán mientras resulte necesario para mantener la relación comercial, atender las finalidades para las que fueron obtenidos o mientras el Usuario no solicite su supresión cuando esta proceda.',

          'Una vez finalizada la relación, los datos podrán mantenerse debidamente bloqueados durante los plazos legalmente exigibles para atender posibles responsabilidades.',
        ],
      },
      {
        title:
          'Legislación aplicable y fuero',
        paragraphs: [
          'La legislación aplicable en caso de disputa o conflicto relacionado con la interpretación de estas Condiciones de Uso o con los servicios del Portal será la legislación española.',

          'Para la resolución de cualquier controversia que pudiera surgir con ocasión del uso del Portal y sus servicios se estará a los juzgados y tribunales que resulten competentes de acuerdo con la legislación aplicable.',
        ],
      },
    ],
  },

  privacy: {
    title:
      'Política de privacidad',
    eyebrow: 'PRIVACIDAD',
    intro:
      'Información sobre el tratamiento de los datos personales facilitados a través de los formularios y canales de contacto del sitio web.',
    seoDescription:
      'Política de privacidad de Alvar Consultores Inmobiliarios e información sobre el tratamiento de datos personales.',
    aside:
      'Protección de datos',
    sections: [
      {
        title:
          'Responsable del tratamiento',
        paragraphs: [
          'ALVAR CONSULTORES INMOBILIARIOS SL',

          'CIF: B87458428',

          'Domicilio: C/RIO ROSAS 42, 1º PLANTA, 28003 MADRID',

          'Correo electrónico: info@alvarconsultoresinmobiliarios.es',
        ],
      },
      {
        title: 'Finalidad',
        paragraphs: [
          'Los datos facilitados a través de los formularios y canales de contacto podrán utilizarse para responder consultas, atender solicitudes de información sobre inmuebles, gestionar peticiones de valoración, coordinar visitas y atender otras comunicaciones iniciadas por la persona interesada.',

          'Cuando exista consentimiento expreso y resulte aplicable, también podrán utilizarse para el envío de comunicaciones comerciales relacionadas con los servicios de ALVAR CONSULTORES INMOBILIARIOS SL.',
        ],
      },
      {
        title:
          'Base jurídica del tratamiento',
        paragraphs: [
          'El tratamiento podrá basarse en el consentimiento de la persona interesada cuando esta envíe voluntariamente una consulta o solicitud mediante los canales disponibles en el Sitio Web.',

          'Cuando corresponda, también podrán resultar aplicables otras bases jurídicas vinculadas a la aplicación de medidas precontractuales, la ejecución de una relación contractual o el cumplimiento de obligaciones legales.',
        ],
      },
      {
        title:
          'Conservación de los datos',
        paragraphs: [
          'Los datos personales se conservarán durante el tiempo necesario para atender la finalidad para la que fueron recabados y mientras exista una relación con la persona interesada.',

          'Posteriormente podrán mantenerse bloqueados durante los plazos legalmente exigibles para atender posibles responsabilidades.',
        ],
      },
      {
        title:
          'Derechos',
        paragraphs: [
          'La persona interesada puede ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad mediante comunicación dirigida a ALVAR CONSULTORES INMOBILIARIOS SL en la dirección postal indicada o a través de info@alvarconsultoresinmobiliarios.es.',

          'Asimismo, puede presentar una reclamación ante la Agencia Española de Protección de Datos si considera que el tratamiento de sus datos no se ajusta a la normativa.',
        ],
      },
      {
        title:
          'Formularios y comunicaciones',
        paragraphs: [
          'Los formularios del Sitio Web deberán utilizarse para las finalidades expresamente indicadas en cada caso. Los datos facilitados no deberán emplearse para finalidades incompatibles con aquellas para las que fueron recabados.',

          'Cuando una finalidad requiera consentimiento específico, este deberá solicitarse de forma diferenciada.',
        ],
      },
    ],
  },

  cookies: {
    title:
      'Política de cookies',
    eyebrow: 'COOKIES',
    intro:
      'Información sobre las tecnologías utilizadas por este sitio web, sus finalidades y las opciones disponibles para aceptar, rechazar o modificar tus preferencias.',
    seoDescription:
      'Política de cookies de Alvar Consultores Inmobiliarios. Información sobre consentimiento, contenido externo y configuración de preferencias.',
    aside:
      'Privacidad y preferencias',
    sections: [
      {
        title:
          'Política de cookies',
        paragraphs: [
          'Con el objetivo de proteger tu privacidad, ALVAR CONSULTORES INMOBILIARIOS informa sobre el uso de cookies y tecnologías similares en este Sitio Web.',

          'Actualmente utilizamos tecnologías técnicas necesarias para recordar determinadas preferencias del usuario. Además, algunas funcionalidades proporcionadas por terceros, como Google Maps, únicamente se cargan cuando el Usuario autoriza expresamente el contenido externo mediante el sistema de preferencias del Sitio Web.',

          'En la configuración actual no utilizamos herramientas propias de analítica publicitaria, Google Analytics, Google Tag Manager ni píxeles publicitarios para realizar seguimiento comercial de los visitantes.',

          'Esta Política de Cookies puede actualizarse cuando cambien las funcionalidades del Sitio Web, los servicios de terceros utilizados o la normativa aplicable.',
        ],
      },
      {
        title:
          '¿Qué son las cookies?',
        paragraphs: [
          'Las cookies son pequeños archivos o fragmentos de información que pueden almacenarse en el dispositivo del Usuario cuando visita una página web. Permiten, entre otras funciones, recordar determinadas preferencias, mantener sesiones o facilitar la utilización de determinados servicios.',

          'Las cookies pueden ser de sesión, cuando se eliminan al finalizar la navegación, o persistentes, cuando permanecen almacenadas durante un periodo determinado.',

          'También pueden ser propias, cuando son gestionadas directamente por el titular del sitio web, o de terceros, cuando son gestionadas por un proveedor externo que presta una funcionalidad o servicio.',
        ],
      },
      {
        title: 'Consentimiento',
        paragraphs: [
          'Al acceder por primera vez al Sitio Web se muestra un sistema de preferencias que permite aceptar todas las tecnologías opcionales, rechazarlas o configurar individualmente el contenido externo.',

          'Al seleccionar «Aceptar todas», el Usuario autoriza la carga de los servicios externos contemplados en las preferencias, como Google Maps.',

          'Al seleccionar «Rechazar», esos servicios externos permanecen desactivados y no se cargan automáticamente dentro del Sitio Web.',

          'La opción «Configurar» permite revisar las categorías disponibles antes de guardar la elección.',
        ],
      },
      {
        title:
          'Cambiar o retirar el consentimiento',
        paragraphs: [
          'El Usuario puede modificar posteriormente su decisión mediante el botón «Cambiar consentimiento de cookies» disponible en el Sitio Web.',

          'Desde ese panel puede volver a permitir o desactivar el contenido externo. La modificación se aplica a partir de ese momento.',

          'También es posible eliminar manualmente la información almacenada desde las opciones de privacidad y almacenamiento del navegador.',
        ],
      },
      {
        title:
          'Configuración del navegador',
        paragraphs: [
          'La mayoría de los navegadores permiten consultar, bloquear o eliminar cookies y otros datos almacenados. La ubicación exacta de estas opciones puede variar en función del navegador y de su versión.',

          'Puedes consultar la documentación oficial de los principales navegadores en los siguientes enlaces:',
        ],
        links: [
          {
            label:
              'Microsoft Edge · gestión de cookies',
            href:
              'https://support.microsoft.com/es-es/windows/eliminar-y-administrar-cookies-168dab11-0753-043d-7c16-ede5947fc64d',
          },
          {
            label:
              'Mozilla Firefox · cookies y datos de sitios',
            href:
              'https://support.mozilla.org/es/kb/limpia-las-cookies-y-los-datos-de-sitios-web-en-firefox',
          },
          {
            label:
              'Google Chrome · borrar, permitir y gestionar cookies',
            href:
              'https://support.google.com/chrome/answer/95647?hl=es',
          },
          {
            label:
              'Safari para Mac · gestionar cookies y datos de sitios web',
            href:
              'https://support.apple.com/es-es/guide/safari/sfri11471/mac',
          },
          {
            label:
              'Safari en iPhone y iPad · borrar historial y datos',
            href:
              'https://support.apple.com/es-es/105082',
          },
        ],
      },
      {
        title:
          'Tecnologías utilizadas actualmente',
        paragraphs: [
          'En la configuración actual del Sitio Web utilizamos las siguientes tecnologías relacionadas con las preferencias y el contenido externo:',
        ],
        items: [
          'Preferencias de privacidad: el Sitio Web guarda en el almacenamiento local del navegador la elección realizada por el Usuario. Esta información se utiliza exclusivamente para recordar si se ha autorizado o rechazado el contenido externo.',

          'Google Maps: los mapas de las fichas de inmuebles permanecen bloqueados hasta que el Usuario autoriza el contenido externo. Una vez autorizado, el navegador establece una conexión con los servicios de Google y pueden resultar aplicables las tecnologías y políticas propias de dicho proveedor.',

          'En la configuración actual no utilizamos cookies de analítica o publicidad propias para realizar seguimiento del comportamiento de navegación.',
        ],
      },
      {
        title:
          'Contenido externo',
        paragraphs: [
          'Las fichas de determinados inmuebles pueden incluir un mapa proporcionado por Google Maps. Por defecto, el mapa no se carga mientras el Usuario no haya autorizado expresamente el contenido externo.',

          'Si el Usuario mantiene esta categoría desactivada, se mostrará un aviso en lugar del mapa. El enlace «Ver en Google Maps» seguirá siendo un enlace externo y solo llevará al servicio de Google cuando el propio Usuario decida pulsarlo.',

          'Los enlaces a vídeos, visitas virtuales, WhatsApp u otras plataformas externas tampoco cargan esos servicios dentro del Sitio Web por el mero hecho de visitar la página; la conexión con el proveedor correspondiente se produce cuando el Usuario decide seguir el enlace.',
        ],
      },
      {
        title:
          'Revisiones de esta política',
        paragraphs: [
          'ALVAR CONSULTORES INMOBILIARIOS puede modificar total o parcialmente esta Política de Cookies para adaptarla a cambios normativos, nuevas funcionalidades del Sitio Web o modificaciones en los servicios utilizados.',

          'La versión publicada en esta página será la vigente en cada momento. Se recomienda revisarla periódicamente cuando se incorporen nuevas herramientas o servicios.',
        ],
      },
    ],
  },
};

function getLegalPath(
  kind: LegalKind,
) {
  if (kind === 'legal') {
    return '/aviso-legal';
  }

  if (kind === 'privacy') {
    return '/privacidad';
  }

  return '/cookies';
}

function renderLegalText(
  text: string,
) {
  const parts = text.split(
    /(info@alvarconsultoresinmobiliarios\.es|www\.alvarconsultoresinmobiliarios\.es)/g,
  );

  return parts.map(
    (
      part,
      index,
    ) => {
      if (
        part ===
        'info@alvarconsultoresinmobiliarios.es'
      ) {
        return (
          <a
            key={`${part}-${index}`}
            href="mailto:info@alvarconsultoresinmobiliarios.es"
          >
            {part}
          </a>
        );
      }

      if (
        part ===
        'www.alvarconsultoresinmobiliarios.es'
      ) {
        return (
          <a
            key={`${part}-${index}`}
            href="https://www.alvarconsultoresinmobiliarios.es"
            target="_blank"
            rel="noopener noreferrer"
          >
            {part}
          </a>
        );
      }

      return part;
    },
  );
}

export function LegalPage({
  kind,
}: {
  kind: LegalKind;
}) {
  const page =
    content[kind];

  const path =
    getLegalPath(kind);

  return (
    <>
      <SeoHead
        title={`${page.title} | Alvar Consultores Inmobiliarios`}
        description={
          page.seoDescription
        }
        path={path}
        noIndex
      />

      <InternalHero
        eyebrow={
          page.eyebrow
        }
        title={
          page.title
        }
        text={
          page.intro
        }
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
          {kind ===
          'privacy' ? (
            <div
              className="legal-warning"
              role="note"
            >
              <strong>
                Información sobre
                privacidad
              </strong>

              <span>
                Consulta las condiciones
                aplicables al tratamiento
                de tus datos personales y
                a los canales de contacto
                utilizados por el sitio
                web.
              </span>
            </div>
          ) : null}

          <div className="legal-content__heading">
            <p className="eyebrow">
              INFORMACIÓN
            </p>

            <h2 id="legal-content-title">
              {page.title}
            </h2>
          </div>

          <div className="legal-content__sections">
            {page.sections.map(
              (
                section,
                index,
              ) => (
                <section
                  key={
                    section.title
                  }
                >
                  <span
                    aria-hidden="true"
                  >
                    {String(
                      index + 1,
                    ).padStart(
                      2,
                      '0',
                    )}
                  </span>

                  <div>
                    <h3>
                      {
                        section.title
                      }
                    </h3>

                    {section.paragraphs?.map(
                      (
                        paragraph,
                        paragraphIndex,
                      ) => (
                        <p
                          key={`${section.title}-paragraph-${paragraphIndex}`}
                        >
                          {renderLegalText(
                            paragraph,
                          )}
                        </p>
                      ),
                    )}

                    {section.items?.length ? (
                      <ul className="mt-5 space-y-3">
                        {section.items.map(
                          (
                            item,
                            itemIndex,
                          ) => (
                            <li
                              key={`${section.title}-item-${itemIndex}`}
                              className="relative pl-6"
                            >
                              <span
                                aria-hidden="true"
                                className="absolute left-0 top-0 text-[#B8944D]"
                              >
                                —
                              </span>

                              {renderLegalText(
                                item,
                              )}
                            </li>
                          ),
                        )}
                      </ul>
                    ) : null}

                    {section.links?.length ? (
                      <div className="mt-5 grid gap-3">
                        {section.links.map(
                          (
                            link,
                          ) => (
                            <a
                              key={
                                link.href
                              }
                              href={
                                link.href
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex w-fit items-center gap-2 font-medium underline decoration-[#B8944D]/60 underline-offset-4 transition hover:decoration-[#B8944D]"
                            >
                              {
                                link.label
                              }

                              <span
                                aria-hidden="true"
                              >
                                ↗
                              </span>
                            </a>
                          ),
                        )}
                      </div>
                    ) : null}
                  </div>
                </section>
              ),
            )}
          </div>
        </Container>
      </section>
    </>
  );
}