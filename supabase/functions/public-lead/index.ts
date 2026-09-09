import { createSupabaseContext } from '@supabase/server';

type PublicLeadInterest =
  | 'buy'
  | 'rent'
  | 'sell'
  | 'invest'
  | 'owner'
  | 'other';

type PublicLeadSource =
  | 'contact'
  | 'valuation'
  | 'property'
  | 'service';

type PublicProperty = {
  id: string;
  reference: string | null;
  title: string;
  operation: 'venta' | 'alquiler';
  status: string;
};

type ContactInsert = {
  name: string;
  phone: string | null;
  email: string | null;
  interest: PublicLeadInterest;
  status: 'new';
  source: PublicLeadSource;
  message: string | null;
  notes: string | null;
  privacy_accepted_at: string;
};

type Database = {
  public: {
    Tables: {
      contacts: {
        Row: ContactInsert & { id: string };
        Insert: ContactInsert;
        Update: Partial<ContactInsert>;
        Relationships: [];
      };
      contact_properties: {
        Row: {
          id: string;
          contact_id: string;
          property_id: string;
        };
        Insert: {
          contact_id: string;
          property_id: string;
        };
        Update: never;
        Relationships: [];
      };
      properties: {
        Row: PublicProperty;
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://alvar-consultores.vercel.app',
  'https://alvarconsultoresinmobiliarios.es',
  'https://www.alvarconsultoresinmobiliarios.es',
]);

const ALLOWED_INTERESTS = new Set<PublicLeadInterest>([
  'buy',
  'rent',
  'sell',
  'invest',
  'owner',
  'other',
]);

const ALLOWED_SOURCES = new Set<PublicLeadSource>([
  'contact',
  'valuation',
  'property',
  'service',
]);

const INTEREST_LABELS: Record<PublicLeadInterest, string> = {
  buy: 'Compra',
  rent: 'Alquiler',
  sell: 'Venta',
  invest: 'Inversión',
  owner: 'Propietario',
  other: 'Otro',
};

const SOURCE_LABELS: Record<PublicLeadSource, string> = {
  contact: 'Contacto web',
  valuation: 'Valoración',
  property: 'Ficha de inmueble',
  service: 'Servicios',
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getCorsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type, x-retry-count, traceparent, tracestate, baggage',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
    Vary: 'Origin',
  };
}

function json(
  origin: string,
  data: unknown,
  status = 200,
) {
  return Response.json(data, {
    status,
    headers: getCorsHeaders(origin),
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function isPublicLeadInterest(value: string): value is PublicLeadInterest {
  return ALLOWED_INTERESTS.has(value as PublicLeadInterest);
}

function isPublicLeadSource(value: string): value is PublicLeadSource {
  return ALLOWED_SOURCES.has(value as PublicLeadSource);
}

function getEnvironmentVariable(name: string) {
  const runtime = globalThis as typeof globalThis & {
    Deno?: {
      env: {
        get(key: string): string | undefined;
      };
    };
  };

  return runtime.Deno?.env.get(name)?.trim() ?? '';
}

function sanitizeSubjectValue(value: string) {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

function getNotificationSubject(
  source: PublicLeadSource,
  name: string,
  property: PublicProperty | null,
) {
  const safeName = sanitizeSubjectValue(name);

  if (source === 'valuation') {
    return `Nueva solicitud de valoración · ${safeName}`;
  }

  if (source === 'property') {
    const propertyLabel = property?.reference
      ? `REF ${sanitizeSubjectValue(property.reference)}`
      : safeName;
    return `Nueva consulta sobre inmueble · ${propertyLabel}`;
  }

  if (source === 'service') {
    return `Nueva solicitud de servicio · ${safeName}`;
  }

  return `Nueva consulta web · ${safeName}`;
}

function getNotificationText(input: {
  name: string;
  phone: string;
  email: string;
  interest: PublicLeadInterest;
  source: PublicLeadSource;
  message: string;
  property: PublicProperty | null;
}) {
  const lines = [
    'NUEVO CONTACTO DESDE LA WEB',
    '',
    `Nombre: ${input.name}`,
    `Teléfono: ${input.phone || 'No facilitado'}`,
    `Email: ${input.email || 'No facilitado'}`,
    '',
    `Interés: ${INTEREST_LABELS[input.interest]}`,
    `Origen: ${SOURCE_LABELS[input.source]}`,
    '',
    'Mensaje:',
    input.message || 'Sin mensaje registrado.',
  ];

  if (input.property) {
    lines.push(
      '',
      'Inmueble',
      `Referencia: ${input.property.reference || 'Sin referencia'}`,
      `Título: ${input.property.title}`,
    );
  }

  lines.push(
    '',
    input.email
      ? 'Puedes responder directamente a este correo para contestar al cliente.'
      : 'El contacto no facilitó email. Utiliza el teléfono indicado para responder.',
  );

  return lines.join('\n');
}

async function sendLeadNotification(input: {
  name: string;
  phone: string;
  email: string;
  interest: PublicLeadInterest;
  source: PublicLeadSource;
  message: string;
  property: PublicProperty | null;
}) {
  const resendApiKey = getEnvironmentVariable('RESEND_API_KEY');
  const from = getEnvironmentVariable('LEAD_FROM_EMAIL');
  const recipients = getEnvironmentVariable('LEAD_NOTIFICATION_EMAILS')
    .split(',')
    .map((recipient) => recipient.trim().toLowerCase())
    .filter(
      (recipient) =>
        recipient.length <= 254 && EMAIL_PATTERN.test(recipient),
    )
    .slice(0, 50);

  if (!resendApiKey || !from || recipients.length === 0) {
    console.error('public-lead email notification is not configured.');
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject: getNotificationSubject(input.source, input.name, input.property),
        text: getNotificationText(input),
        ...(input.email ? { reply_to: input.email } : {}),
      }),
    });

    if (!response.ok) {
      console.error(
        `public-lead email notification failed with status ${response.status}.`,
      );
    }
  } catch {
    console.error('public-lead email notification request failed.');
  }
}

export default {
  fetch: async (req: Request) => {
    const origin = req.headers.get('origin') ?? '';

    if (!ALLOWED_ORIGINS.has(origin)) {
      return new Response(null, { status: 403 });
    }

    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(origin),
      });
    }

    if (req.method !== 'POST') {
      return json(origin, { error: 'Método no permitido.' }, 405);
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return json(origin, { error: 'Petición no válida.' }, 400);
    }

    if (!isRecord(body)) {
      return json(origin, { error: 'Petición no válida.' }, 400);
    }

    // Honeypot: respondemos como si se hubiese aceptado, sin crear ningún dato.
    if (readString(body.website)) {
      return json(origin, { success: true }, 201);
    }

    const name = readString(body.name);
    const phone = readString(body.phone);
    const email = readString(body.email).toLowerCase();
    const interest = readString(body.interest);
    const source = readString(body.source);
    const message = readString(body.message);
    const propertyId = readString(body.propertyId);

    if (!name || name.length > 160) {
      return json(origin, { error: 'El nombre no es válido.' }, 400);
    }

    if (phone.length > 50) {
      return json(origin, { error: 'El teléfono no es válido.' }, 400);
    }

    if (email.length > 254 || (email && !EMAIL_PATTERN.test(email))) {
      return json(origin, { error: 'El email no es válido.' }, 400);
    }

    if (!phone && !email) {
      return json(
        origin,
        { error: 'Indica un teléfono o un email de contacto.' },
        400,
      );
    }

    if (!isPublicLeadInterest(interest)) {
      return json(origin, { error: 'El interés no es válido.' }, 400);
    }

    if (!isPublicLeadSource(source)) {
      return json(origin, { error: 'El origen no es válido.' }, 400);
    }

    if (message.length > 4000) {
      return json(origin, { error: 'El mensaje es demasiado largo.' }, 400);
    }

    if (body.privacyAccepted !== true) {
      return json(
        origin,
        { error: 'Debes aceptar la política de privacidad.' },
        400,
      );
    }

    if (source === 'property' && !UUID_PATTERN.test(propertyId)) {
      return json(origin, { error: 'El inmueble no es válido.' }, 400);
    }

    const { data: ctx, error: contextError } =
      await createSupabaseContext<Database>(req, { auth: 'none' });

    if (contextError || !ctx) {
      console.error('public-lead context initialization failed:', contextError);
      return json(origin, { error: 'No se ha podido enviar la consulta.' }, 500);
    }

    let validatedInterest: PublicLeadInterest = interest;
    let linkedProperty: PublicProperty | null = null;

    if (source === 'property') {
      const { data: property, error: propertyError } = await ctx.supabaseAdmin
        .from('properties')
        .select('id, reference, title, operation, status')
        .eq('id', propertyId)
        .in('status', ['published', 'reserved'])
        .maybeSingle();

      if (propertyError) {
        console.error('public-lead property validation failed:', propertyError);
        return json(origin, { error: 'No se ha podido enviar la consulta.' }, 500);
      }

      if (!property) {
        return json(origin, { error: 'El inmueble no está disponible.' }, 400);
      }

      validatedInterest = property.operation === 'alquiler' ? 'rent' : 'buy';
      linkedProperty = property;
    }

    const { data: contact, error: contactError } = await ctx.supabaseAdmin
      .from('contacts')
      .insert({
        name,
        phone: phone || null,
        email: email || null,
        interest: validatedInterest,
        status: 'new',
        source,
        message: message || null,
        notes: null,
        privacy_accepted_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (contactError || !contact) {
      console.error('public-lead contact insert failed:', contactError);
      return json(origin, { error: 'No se ha podido enviar la consulta.' }, 500);
    }

    if (source === 'property') {
      const { error: relationError } = await ctx.supabaseAdmin
        .from('contact_properties')
        .insert({
          contact_id: contact.id,
          property_id: propertyId,
        });

      if (relationError) {
        console.error('public-lead property link failed:', relationError);

        const { error: rollbackError } = await ctx.supabaseAdmin
          .from('contacts')
          .delete()
          .eq('id', contact.id);

        if (rollbackError) {
          console.error('public-lead rollback failed:', rollbackError);
        }

        return json(origin, { error: 'No se ha podido enviar la consulta.' }, 500);
      }
    }

    await sendLeadNotification({
      name,
      phone,
      email,
      interest: validatedInterest,
      source,
      message,
      property: linkedProperty,
    });

    return json(origin, { success: true }, 201);
  },
};
