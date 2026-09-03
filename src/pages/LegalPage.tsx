import { SeoHead } from '../components/seo/SeoHead';
import { Container } from '../components/ui/Container';

type LegalKind = 'legal' | 'privacy' | 'cookies';

const content: Record<LegalKind, { title: string; intro: string; sections: Array<[string,string]> }> = {
  legal: { title:'Aviso legal', intro:'Información provisional del titular del sitio, pendiente de validación jurídica antes de producción.', sections:[['Titular del sitio','Alvar Consultores Inmobiliarios, S.L. Domicilio comunicado: Calle Ríos Rosas 42, planta 1, 28003 Madrid. Los datos registrales, fiscales y el correo de contacto deben incorporarse tras su confirmación.'],['Uso del sitio','El contenido tiene carácter informativo. Las fichas señaladas como demo no constituyen ofertas vinculantes ni acreditan disponibilidad real.'],['Propiedad intelectual','Los textos, marcas y recursos definitivos deberán utilizarse con las autorizaciones correspondientes. Los visuales actuales son composiciones provisionales.']] },
  privacy: { title:'Política de privacidad', intro:'Texto provisional pendiente de revisión legal y de completar los datos de contacto del responsable.', sections:[['Responsable y finalidad','Alvar Consultores Inmobiliarios, S.L. tratará los datos enviados para responder consultas y solicitudes de valoración cuando se conecten los formularios a un backend autorizado.'],['Base y conservación','La base prevista es el consentimiento de la persona interesada. Los plazos de conservación y destinatarios deberán definirse al configurar el sistema real de recepción.'],['Derechos','La información definitiva deberá indicar el canal confirmado para ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad.']] },
  cookies: { title:'Política de cookies', intro:'Configuración provisional: esta demo no activa herramientas de medición ni cookies no esenciales.', sections:[['Uso actual','La aplicación no integra por ahora GA4, GTM ni plataformas publicitarias. Las preferencias técnicas imprescindibles que pudiera usar el navegador no se emplean para perfilar usuarios.'],['Futura configuración','Si se incorporan herramientas externas, deberá instalarse un mecanismo de consentimiento previo, documentar proveedores, finalidad y duración, y permitir retirar el consentimiento.'],['Actualización','Esta política deberá revisarse junto con la configuración técnica definitiva antes de la publicación.']] },
};

export function LegalPage({ kind }: { kind: LegalKind }) {
  const page = content[kind];
  const path = kind === 'legal' ? '/aviso-legal' : `/${kind === 'privacy' ? 'privacidad' : 'cookies'}`;
  return <><SeoHead title={`${page.title} | Alvar Consultores Inmobiliarios`} description={page.intro} path={path} /><header className="legal-hero"><Container><p className="eyebrow">INFORMACIÓN LEGAL</p><h1>{page.title}</h1><p>{page.intro}</p></Container></header><section className="legal-content section-pad"><Container><div className="legal-warning">Documento provisional · pendiente de revisión legal y datos definitivos.</div>{page.sections.map(([title,text]) => <section key={title}><h2>{title}</h2><p>{text}</p></section>)}</Container></section></>;
}
