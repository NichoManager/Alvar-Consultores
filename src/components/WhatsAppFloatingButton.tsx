import { matchPath, useLocation } from 'react-router-dom';
import { business, generalWhatsAppMessage } from '../data/business';
import { trackEvent } from '../utils/analytics';
import { whatsappUrl } from '../utils/contact';
import './WhatsAppFloatingButton.css';

export function WhatsAppFloatingButton() {
  const location = useLocation();
  const isPropertyDetail = Boolean(
    matchPath('/inmuebles/:slug', location.pathname),
  );

  return (
    <a
      className={`whatsapp-floating-button${
        isPropertyDetail
          ? ' whatsapp-floating-button--property-detail'
          : ''
      }`}
      href={whatsappUrl(
        business.phoneMobileHref,
        generalWhatsAppMessage,
      )}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      onClick={() =>
        trackEvent('whatsapp_click', {
          source: 'floating_button',
          path: location.pathname,
        })
      }
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.4-4.7a8.5 8.5 0 1 1 16.1-4.1Z" />
        <path d="M8.1 7.4c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.8 1.9c.1.3.1.5-.1.7l-.6.8c-.2.2-.1.4 0 .6.7 1.2 1.7 2.2 3 2.9.2.1.4.2.6 0l.9-1.1c.2-.2.4-.3.7-.2l2 .9c.3.1.4.3.4.5 0 .4-.2 1.4-.8 2-.6.6-1.5.9-2.4.7-1.1-.2-2.7-.8-4.5-2.4-1.5-1.3-2.6-3-3-4.2-.5-1.4 0-2.5.3-3.1Z" />
      </svg>

      <span>WhatsApp</span>
    </a>
  );
}
