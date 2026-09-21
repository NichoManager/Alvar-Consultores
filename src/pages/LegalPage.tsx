import { SeoHead } from '../components/seo/SeoHead';
import { Container } from '../components/ui/Container';
import { InternalHero } from '../components/ui/InternalHero';

type LegalKind =
  | 'legal'
  | 'privacy'
  | 'cookies';

interface LegalSection {
  title: string;
  text?: string;
  paragraphs?: string[];
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
      'Condiciones generales de uso, información legal y política de privacidad del sitio web de Alvar Consultores Inmobiliarios.',
    seoDescription:
      'Aviso legal, condiciones generales y política de privacidad de Alvar Consultores Inmobiliarios.',
    aside:
      'Condiciones generales',
    sections: [
      {
        title:
          'Condiciones generales · Datos identificativos',
        paragraphs: [
          'En cumplimiento con el deber de información recogido en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico, se reflejan los siguientes datos:',

          'La empresa titular de los sitios web www.alvarconsultoresinmobiliarios.es (en adelante, el Sitio Web) es ALVAR CONSULTORES INMOBILIARIOS SL con domicilio C/RIO ROSAS 42, 1º PLANTA, 28003, Madrid, con número de C.I.F.: B87458428 y correo electrónico de contacto info@alvarconsultoresinmobiliarios.es (en adelante, ALVAR CONSULTORES INMOBILIARIOS).',
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
          'El usuario se obliga a llevar a cabo una utilización del Sitio web, sus condiciones, servicios que se pudieran ofrecer, contenidos de conformidad con la Ley, la Moral, las buenas Costumbres y el orden público, no utilizándolo contrariamente a los contenidos presentes en este texto, de forma lesiva para ALVAR CONSULTORES INMOBILIARIOS SL o terceros, o que de cualquier forma pueda dañar, inutilizar o deteriorar los sitios web o sus servicios, o impedir un normal disfrute del Sitio Web por otros Usuarios.',

          'El Usuario se compromete a no transmitir, introducir, difundir y poner a disposición de terceros cualquier tipo de material e información (programas, virus, macros, applets, controles ActiveX, datos, contenidos, dibujos, archivos de sonido e imagen, etc.) que sean contrarios a la ley, el orden público o que causen o sean susceptibles de causar cualquier tipo de alteración en los sistemas informáticos.',

          'Con carácter general, para hacer uso del Sitio Web los menores de edad deben haber obtenido previamente la autorización de sus padres, tutores o representantes legales, quienes serán responsables de todos los actos realizados a través del Portal por los menores a su cargo. En aquellos Servicios en los que expresamente se señale, el acceso quedará restringido única y exclusivamente a mayores de 14 años.',
        ],
      },
      {
        title:
          'Protección de Datos',
        paragraphs: [
          'ALVAR CONSULTORES INMOBILIARIOS SL cumple con el Reglamento (UE) 2016/679 del Parlamento europeo y del Consejo relativo a la protección de las personas físicas en lo que respecta al tratamiento de datos personales y a la libre circulación de estos datos, y demás normativa vigente en cada momento, y vela por garantizar un correcto uso y tratamiento de los datos personales del usuario.',

          'Para ello, junto a cada formulario de recabo de datos de carácter personal, en los servicios que el usuario pueda solicitar a ALVAR CONSULTORES INMOBILIARIOS SL, hará saber al usuario de la existencia y aceptación de las condiciones particulares del tratamiento de sus datos en cada caso, informándole de la responsabilidad del fichero creado, la dirección del responsable, la posibilidad de ejercer sus derechos de protección de datos, la finalidad del tratamiento y las comunicaciones de datos a terceros en su caso.',

          'Asimismo, ALVAR CONSULTORES INMOBILIARIOS SL informa que da cumplimiento a la Ley 34/2002 de 11 de julio, de Servicios de la Sociedad de la Información y el Comercio Electrónico y le solicitará su consentimiento al tratamiento de su correo electrónico con fines comerciales en cada momento.',
        ],
      },
      {
        title:
          'Propiedad intelectual e industrial',
        paragraphs: [
          'ALVAR CONSULTORES INMOBILIARIOS SL, por sí o como cesionaria, es titular de todos los derechos de propiedad intelectual e industrial de su Sitio Web, así como de los elementos contenidos en el mismo (a título enunciativo: imágenes, sonido, audio, vídeo, software, textos, logotipos o marcas, combinaciones de colores, estructura y diseño, selección de materiales usados, etc.).',

          'Queda expresamente prohibida la reproducción, distribución y comunicación pública, incluida su modalidad de puesta a disposición, de la totalidad o parte de los contenidos del Sitio Web con fines comerciales en cualquier soporte y por cualquier medio técnico, sin la autorización de ALVAR CONSULTORES INMOBILIARIOS SL.',
        ],
      },
      {
        title:
          'Exclusión de Garantías y responsabilidad',
        paragraphs: [
          'ALVAR CONSULTORES INMOBILIARIOS SL no se hace responsable de los daños y perjuicios de cualquier naturaleza que pudieran ocasionar errores u omisiones en los contenidos, falta de disponibilidad del portal o transmisión de virus, a pesar de haber adoptado las medidas tecnológicas necesarias para evitarlo.',
        ],
      },
      {
        title: 'Modificaciones',
        paragraphs: [
          'ALVAR CONSULTORES INMOBILIARIOS SL se reserva el derecho a efectuar sin previo aviso las modificaciones que considere oportunas en su Sitio Web, pudiendo cambiar, suprimir o añadir contenidos y servicios que se presten a través del mismo, así como la forma en la que estos aparezcan presentados.',
        ],
      },
      {
        title: 'Uso de cookies',
        paragraphs: [
          'ALVAR CONSULTORES INMOBILIARIOS SL podrá utilizar cookies para personalizar y facilitar al máximo la navegación del usuario por su Sitio Web. Las cookies se asocian únicamente a un usuario anónimo y su ordenador y no proporcionan referencias que permitan deducir datos personales del usuario.',

          'Se podrá configurar su navegador para que notifique y rechace la instalación de las cookies enviadas por ALVAR CONSULTORES INMOBILIARIOS SL, sin que ello perjudique la posibilidad del usuario de acceder a los Contenidos.',
        ],
      },
      {
        title:
          'Política de privacidad',
        paragraphs: [
          'ALVAR CONSULTORES INMOBILIARIOS SL, S.L.',

          'CIF: B87458428',

          'Domicilio: C/RIO ROSAS 42, 1º PLANTA, 28003, MADRID',

          'Correo electrónico: info@alvarconsultoresinmobiliarios.es',

          'Mediante la presente, ALVAR CONSULTORES INMOBILIARIOS SL informa a los usuarios de su sitio web www.alvarconsultoresinmobiliarios.es de su política de Privacidad y describe qué datos recoge, cómo los utiliza, las opciones de los usuarios en relación a estos datos, sus derechos, la seguridad de sus datos, las comunicaciones comerciales y la modificación de la política de confidencialidad.',

          'En el tratamiento de datos de carácter personal, ALVAR CONSULTORES INMOBILIARIOS SL garantiza el cumplimiento del Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo relativo a la protección de las personas físicas. Dicha norma tiene por objeto garantizar y proteger, en lo que concierne al tratamiento de datos personales, las libertades públicas y los derechos fundamentales de las personas físicas y, en especial, su honor e intimidad personal y familiar.',

          'La utilización del sitio web y de cualquiera de los servicios que se incorporan en la web supone la aceptación de las condiciones que se presentan a continuación.',

          'No obstante, ALVAR CONSULTORES INMOBILIARIOS SL se reserva el derecho de modificar esta Política de Protección de Datos en cualquier momento, con el fin de adaptarla a novedades legislativas o cambios en sus actividades.',

          'ALVAR CONSULTORES INMOBILIARIOS SL garantiza en todo momento el íntegro y pleno cumplimiento de las obligaciones dispuestas por la normativa de protección de datos y de servicios de la sociedad de la información, así como por cualquier otra Ley o norma que complemente o sustituya a las anteriores.',
        ],
      },
      {
        title:
          'Responsable del Tratamiento',
        paragraphs: [
          'ALVAR CONSULTORES INMOBILIARIOS SL, S.L.',

          'CIF: B87458428',

          'Domicilio: C/RIO ROSAS 42, 1º PLANTA, 28003, MADRID',

          'Correo electrónico: info@alvarconsultoresinmobiliarios.es',
        ],
      },
      {
        title:
          'Finalidad del tratamiento y calidad de los datos',
        paragraphs: [
          'Se informa de que los datos de carácter personal que se solicitan en nuestros formularios o que nos puedan ser facilitados por medio de las direcciones de correo electrónico, se incluirán en nuestro sistema de tratamientos de datos personales, cuya responsable y titular es ALVAR CONSULTORES INMOBILIARIOS SL.',

          'Todos los datos recogidos serán tratados con la confidencialidad debida siguiendo la normativa vigente en materia de protección de datos personales, al amparo del Reglamento (UE) 2016/679 del Parlamento europeo y del Consejo.',

          'Este sitio web se rige por la normativa exclusivamente aplicable al Estado español, a la que quedan sometidas las personas, tanto nacionales como extranjeras, que utilicen esta página web.',

          'Los datos que solicitamos son los adecuados, concretos y necesarios para la finalidad con la que se recogen, y no serán utilizados con otra distinta de aquella a la que han sido cedidos.',

          'Salvo que quede indicado de forma expresa, se considerará necesario rellenar todos los campos del formulario. Estos datos ofrecidos por el usuario tendrán que ser datos verdaderos, exactos, completos y actualizados.',

          'El usuario será el único responsable de cualquier daño o perjuicio, directo o indirecto, que ocasione a ALVAR CONSULTORES INMOBILIARIOS SL o a cualquier tercero, por rellenar los formularios con datos falsos, inexactos o con datos de terceros.',

          'Nuestro sitio web obtiene los datos personales mediante la recepción de formularios y por medio de correo electrónico, con las siguientes finalidades:',

          '• Gestión de usuarios y clientes.',

          '• Atención de solicitudes de información.',

          '• Prestación de servicios contratados.',

          '• Envío de comunicaciones comerciales relacionadas con los servicios de ALVAR CONSULTORES INMOBILIARIOS SL (previo consentimiento expreso).',
        ],
      },
      {
        title:
          'Recopilación de información',
        paragraphs: [
          'Recopilamos información que pertenece a dos categorías generales:',

          '1. Información que usted nos suministra.',

          'ALVAR CONSULTORES INMOBILIARIOS SL recopila y solicita determinados datos de carácter personal para la utilización y correcto funcionamiento del sitio web. Sin estos datos, es posible que no se pueda prestar todos los servicios solicitados.',

          '• Suscripción a boletines online, publicaciones físicas, comunicaciones comerciales y promocionales relacionadas con los servicios de ALVAR CONSULTORES INMOBILIARIOS SL, para lo que se solicita un consentimiento expreso mediante check in para esta finalidad.',

          '• Al registrarse o rellenar un formulario del sitio web, se le requerirá determinada información como nombre, apellidos, dirección de correo electrónico, etc.',

          '• Usted podrá optar por proporcionarnos más información al cumplimentar algún formulario de contacto, o al ponerse en contacto directamente con nosotros a través de la dirección de email.',

          '2. Información que nosotros recopilamos de terceros.',

          'Cuando accede a nuestro sitio web, recopilamos información sobre las funciones que has utilizado, cómo las ha utilizado y qué dispositivos usa para acceder a nuestros servicios. Continúe leyendo para obtener más información:',

          'Información de uso',

          'Recopilamos información sobre su actividad en nuestros servicios. Por ejemplo, cómo los usa (p. ej., fecha y hora en que inicia sesión, funciones que utiliza, búsquedas, clics, anuncios en los que haya hecho clic).',

          'Información de dispositivos',

          'Recopilamos información sobre el dispositivo que usted utiliza para acceder a nuestro sitio web, incluidos el hardware, el sistema operativo y su versión, los identificadores únicos del dispositivo y la información de la red móvil.',
        ],
      },
      {
        title:
          'Derechos de los usuarios',
        paragraphs: [
          'El Usuario podrá ejercer en cualquier momento sus derechos de acceso, rectificación, supresión, limitación, oposición y portabilidad, dirigiendo comunicación escrita a ALVAR CONSULTORES INMOBILIARIOS SL, S.L., a la dirección postal indicada o al correo electrónico info@alvarconsultoresinmobiliarios.es, adjuntando copia de su DNI o documento equivalente.',

          'Asimismo, se informa de la posibilidad de presentar reclamación ante la Agencia Española de Protección de Datos si considera que no ha obtenido satisfacción en el ejercicio de sus derechos.',
        ],
      },
      {
        title:
          '¿Cómo protegemos tu información personal?',
        paragraphs: [
          'Nos comprometemos a proteger su información personal. Utilizamos las medidas técnicas y organizativas adecuadas con la finalidad de proteger su información personal y su privacidad, y revisamos dichas medidas periódicamente.',

          'Protegemos su información personal mediante el uso de una combinación de controles de seguridad tanto físicos como informáticos o lógicos, incluso controles de acceso que restringen y administran la forma en que su información personal y sus datos personales son procesados, administrados y gestionados.',
        ],
      },
      {
        title:
          'Plazo de conservación',
        paragraphs: [
          'Los datos se conservarán mientras se mantenga la relación comercial o mientras el usuario no solicite su supresión. Una vez finalizada la relación, se mantendrán bloqueados durante el plazo legalmente exigido (5 años) para atender posibles responsabilidades.',
        ],
      },
      {
        title:
          'Legislación aplicable y Fuero',
        paragraphs: [
          'La ley aplicable en caso de disputa o conflicto de interpretación de los términos que conforman estas Condiciones de Uso, así como cualquier cuestión relacionada con los servicios del Portal, será la ley española.',

          'Para la resolución de cualquier controversia que pudiera surgir con ocasión del uso del Portal y sus servicios, las partes acuerdan someterse a la jurisdicción de los Juzgados y Tribunales de la ciudad de Madrid (España), y sus superiores jerárquicos, con expresa renuncia a otros fueros si lo tuvieren y fueran diferentes de los reseñados.',
        ],
      },
    ],
  },

  privacy: {
    title:
      'Política de privacidad',
    eyebrow: 'PRIVACIDAD',
    intro:
      'Información sobre el tratamiento de los datos enviados a través de los formularios y canales de contacto del sitio.',
    seoDescription:
      'Política de privacidad de Alvar Consultores Inmobiliarios e información sobre el tratamiento de datos personales.',
    aside:
      'Protección de datos',
    sections: [
      {
        title:
          'Responsable del tratamiento',
        text:
          'Alvar Consultores Inmobiliarios, S.L. será el responsable del tratamiento de los datos personales enviados a través de los formularios y canales de contacto del sitio. Los datos fiscales y el correo electrónico definitivo para cuestiones relacionadas con privacidad deberán incorporarse tras su confirmación.',
      },
      {
        title: 'Finalidad',
        text:
          'Los datos facilitados podrán utilizarse para responder consultas, solicitudes de información sobre inmuebles, peticiones de valoración y otras comunicaciones iniciadas por la persona interesada cuando los formularios estén conectados al sistema definitivo de recepción.',
      },
      {
        title:
          'Base del tratamiento',
        text:
          'La base prevista para atender las solicitudes enviadas voluntariamente a través del sitio es el consentimiento de la persona interesada y, cuando corresponda, la aplicación de otras bases legitimadoras vinculadas a la relación precontractual o contractual.',
      },
      {
        title:
          'Conservación y destinatarios',
        text:
          'Los plazos concretos de conservación, proveedores tecnológicos y posibles destinatarios deberán documentarse de acuerdo con la configuración definitiva del sistema de formularios, correo, alojamiento y demás herramientas utilizadas por la web.',
      },
      {
        title: 'Derechos',
        text:
          'La versión definitiva de esta política deberá indicar el canal confirmado para ejercer los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, así como cualquier otra información exigible en materia de protección de datos.',
      },
      {
        title:
          'Formularios y comunicaciones',
        text:
          'Antes de publicar la web deberá comprobarse que todos los formularios incorporan la información necesaria sobre privacidad, consentimiento y tratamiento de los datos de acuerdo con su finalidad concreta.',
      },
    ],
  },

  cookies: {
    title: 'Política de cookies',
    eyebrow: 'COOKIES',
    intro:
      'Información sobre el uso de cookies propias y de terceros, sus finalidades y las opciones disponibles para gestionarlas.',
    seoDescription:
      'Política de cookies de Alvar Consultores Inmobiliarios. Información sobre el uso, finalidad, consentimiento y configuración de cookies.',
    aside: 'Uso y configuración de cookies',
    sections: [
      {
        title: 'Política de cookies',
        paragraphs: [
          'Con el objetivo de garantizar tu privacidad, ALVAR CONSULTORES INMOBILIARIOS te informa que podemos usar cookies propias y de terceros para: (i) facilitarte el uso y navegación a través de la página web; (ii) garantizar el acceso a determinadas funcionalidades; (iii) mejorar la calidad de la página de acuerdo a tus hábitos y estilos de navegación.',

          'Nuestra Política de Cookies está sujeta a actualizaciones periódicas, pudiendo acceder el usuario a esta información en todo momento a través del link habilitado en la web (política de cookies), así como modificar sus preferencias sobre la aceptación de cookies a través de las opciones de su navegador y rechazar en cualquier momento el uso de las mismas, salvo aquellas que sean necesarias para el correcto funcionamiento del sitio web.',

          'El propósito de esta política es ayudarle a comprender el uso que hacemos de las cookies, la finalidad de las cookies utilizadas, así como las opciones que tiene el usuario para gestionarlas.',
        ],
      },
      {
        title: '¿Qué son las Cookies?',
        paragraphs: [
          'Las cookies constituyen una herramienta empleada por los servidores web para almacenar y recuperar información acerca de sus visitantes. Las cookies son pequeños archivos de texto que enviamos a tu ordenador, Tablet o cualquier otro dispositivo que te permita navegar por internet cuando accedes a determinadas páginas web. Las cookies permiten, entre otras cosas, mantener un registro sobre tus hábitos de navegación o de tu equipo, tus preferencias y recordarlas a su regreso.',

          'Las Cookies se asocian únicamente a un usuario anónimo y su ordenador y no proporcionan referencias que permitan deducir datos personales del usuario.',

          'Las cookies pueden ser de “sesión”, por lo que se borrarán una vez el usuario abandone la página web que las generó, o “persistentes”, que permanecen en su ordenador hasta una fecha determinada.',

          'Además, las cookies pueden ser “propias” gestionadas por el dominio al que el usuario accede y del que solicita un determinado servicio o “cookies de terceros”, son aquellas titularidad de un tercero, distinto al dominio al que se accede, que será quien trate la información recabada.',
        ],
      },
      {
        title: 'Consentimiento',
        paragraphs: [
          'Al pulsar sobre «Acepto todas las cookies» en nuestro banner de cookies o al aceptar los distintos tipos de cookies a través de nuestra herramienta de preferencias, está otorgando su consentimiento al uso de las cookies antes indicadas, durante los períodos de tiempo señalados y conforme a los términos y condiciones establecidos en esta Política de Cookies.',

          'Tenga en cuenta que puede establecer y modificar sus preferencias en cuanto a cookies en cualquier momento pulsando el botón «Cambiar mi consentimiento de cookies» que puede encontrar en nuestra web.',
        ],
      },
      {
        title: 'Configuración de cookies',
        paragraphs: [
          'Puede retirar su consentimiento a la instalación de cookies o desactivar las cookies no esenciales en cualquier momento pulsando sobre el botón «Cambiar mi consentimiento de cookies», o en el menú de configuración de su navegador que permite prohibir la instalación de algunas o de todas las cookies. Tenga en cuenta que si acepta cookies de tercero y después quiere eliminarlas de forma permanente, debe suprimirlas en las opciones del navegador, ya que la retirada de su consentimiento impedirá su uso pero no las eliminará porque son cookies de tercero.',

          'La mayoría de los navegadores le permiten cambiar la configuración de las cookies. Por lo general, puede encontrar esta configuración en el menú de opciones o preferencias del navegador. Para comprender esta configuración, consulte los siguientes enlaces para navegadores de uso común o use la opción de ayuda en el navegador para obtener más información:',

          'Configuración de cookies en Internet Explorer:',

          'https://support.microsoft.com/es-es/help/17442/windows-internet-explorer-delete-manage-cookies#ie=ie-10',

          'Configuración de cookies en Firefox:',

          'https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer?redirectslug=Cookies&redirectlocale=en-US',

          'Configuración de cookies en Chrome:',

          'https://support.google.com/chrome/answer/95647?hl=en&ref_topic=14666',

          'Configuración de cookies en Safari y iOS:',

          'https://support.apple.com/es-es/guide/safari/sfri11471/mac',

          'https://support.apple.com/es-es/HT201265',

          'Estos navegadores están sometidos a actualizaciones o modificaciones, por lo que no podemos garantizar que se ajusten completamente a la versión de su navegador. Para evitar estos desajustes, puede acceder directamente desde las opciones de su navegador, generalmente en el menú de «Opciones» en la sección de «Privacidad».',

          'Recuerde que, si usted opta por eliminar o rechazar las cookies, esto podría afectar a la disponibilidad y funcionalidad de nuestra Plataforma.',
        ],
      },
      {
        title: 'Revisiones de esta Política',
        paragraphs: [
          'Podemos modificar esta Política de cookies total o parcialmente, en función de exigencias legislativas, reglamentarias o con la finalidad de adaptar dicha política a las instrucciones de la Agencia Española de Protección de Datos. Cuando introduzcamos alguna modificación, publicaremos la versión más actualizada y revisaremos la fecha en la parte superior de esta página. Por ello, te aconsejamos la visita periódica a su contenido.',
        ],
      },
      {
        title: 'Cookies que utiliza nuestra empresa',
        paragraphs: [],
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
    /(info@alvarconsultoresinmobiliarios\.es|www\.alvarconsultoresinmobiliarios\.es|https?:\/\/[^\s]+)/g,
  );

  return parts.map(
    (part, index) => {
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

      if (
        part.startsWith('https://') ||
        part.startsWith('http://')
      ) {
        return (
          <a
            key={`${part}-${index}`}
            href={part}
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
          {kind !==
            'legal' ? (
            <div
              className="legal-warning"
              role="note"
            >
              <strong>
                Documento provisional
              </strong>

              <span>
                Pendiente de
                validación jurídica
                y de incorporar los
                datos corporativos y
                técnicos definitivos
                antes de producción.
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

                    {section.text ? (
                      <p>
                        {renderLegalText(
                          section.text,
                        )}
                      </p>
                    ) : null}

                    {section.paragraphs?.map(
                      (
                        paragraph,
                        paragraphIndex,
                      ) => (
                        <p
                          key={`${section.title}-${paragraphIndex}`}
                        >
                          {renderLegalText(
                            paragraph,
                          )}
                        </p>
                      ),
                    )}
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