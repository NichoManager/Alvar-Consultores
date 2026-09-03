export type AnalyticsEvent =
  | 'valuation_form_submit'
  | 'contact_form_submit'
  | 'property_lead_submit'
  | 'phone_click'
  | 'whatsapp_click'
  | 'property_view'
  | 'property_filter'
  | 'property_gallery_open'
  | 'instagram_click';

export function trackEvent(event: AnalyticsEvent, payload: Record<string, unknown> = {}) {
  // Punto de integración futuro para GA4/GTM, sujeto al consentimiento de cookies.
  if (import.meta.env.DEV) console.info('[analytics:preview]', event, payload);
}
