import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  contactInterestLabels,
  contactStatusLabels,
  createContact,
  deleteContact,
  getContactPropertyOptions,
  linkContactProperties,
  type ContactInterest,
  type ContactPropertySummary,
  type ContactStatus,
} from '../../lib/contacts';
import '../../styles/admin.css';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function nullableText(value: string) {
  const normalized = value.trim();
  return normalized || null;
}

function toIsoDate(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function AdminContactCreatePage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<ContactPropertySummary[]>([]);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProperties = async () => {
      try {
        const options = await getContactPropertyOptions();
        if (isMounted) setProperties(options);
      } catch (loadError) {
        console.error('Error loading property options:', loadError);
        if (isMounted) {
          setError('No se han podido cargar los inmuebles disponibles.');
        }
      } finally {
        if (isMounted) setIsLoadingProperties(false);
      }
    };

    void loadProperties();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleProperty = (propertyId: string) => {
    setSelectedPropertyIds((currentIds) =>
      currentIds.includes(propertyId)
        ? currentIds.filter((id) => id !== propertyId)
        : [...currentIds, propertyId],
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();

    if (!name) {
      setError('Introduce el nombre del contacto.');
      return;
    }

    if (email && !emailPattern.test(email)) {
      setError('Introduce un email válido.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    let contactId: string | null = null;

    try {
      contactId = await createContact({
        name,
        phone: nullableText(String(formData.get('phone') ?? '')),
        email: nullableText(email),
        interest: String(formData.get('interest')) as ContactInterest,
        status: String(formData.get('status')) as ContactStatus,
        source: 'manual',
        notes: nullableText(String(formData.get('notes') ?? '')),
        lastContactAt: toIsoDate(String(formData.get('last_contact_at') ?? '')),
      });

      await linkContactProperties(contactId, selectedPropertyIds);
      navigate(`/admin/contactos/${contactId}`, { replace: true });
    } catch (createError) {
      console.error('Error creating contact:', createError);

      if (contactId) {
        try {
          await deleteContact(contactId);
        } catch (cleanupError) {
          console.error('Error cleaning up incomplete contact:', cleanupError);
        }
      }

      setError('No se ha podido guardar el contacto. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-property-form-page admin-contact-form-page">
      <header className="admin-property-form__header">
        <div className="admin-property-form__header-inner">
          <button
            type="button"
            className="admin-property-form__back"
            onClick={() => navigate('/admin/contactos')}
          >
            <span aria-hidden="true">←</span> Volver a contactos
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-site-link"
            aria-label="Abrir la web pública de Alvar Consultores en una nueva pestaña"
          >
            ALVAR CONSULTORES <span aria-hidden="true">↗</span>
          </a>
          <h1>Nuevo contacto</h1>
          <p>Añade sus datos comerciales y, si corresponde, relaciónalo con uno o varios inmuebles.</p>
        </div>
      </header>

      <form className="admin-property-form admin-contact-form" onSubmit={handleSubmit}>
        <p className="admin-property-form__required-note">
          Los campos marcados con * son obligatorios.
        </p>

        <section className="admin-property-form__section">
          <div><span>01</span><h2>Datos del contacto</h2></div>
          <div className="admin-property-form__grid">
            <label className="admin-property-form__field">
              <span>Nombre *</span>
              <input type="text" name="name" autoComplete="name" required />
            </label>
            <label className="admin-property-form__field">
              <span>Teléfono</span>
              <input type="tel" name="phone" autoComplete="tel" />
            </label>
            <label className="admin-property-form__field">
              <span>Email</span>
              <input type="email" name="email" autoComplete="email" />
            </label>
            <label className="admin-property-form__field">
              <span>Interés *</span>
              <select name="interest" defaultValue="buy" required>
                {Object.entries(contactInterestLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label className="admin-property-form__field">
              <span>Estado</span>
              <select name="status" defaultValue="new">
                {Object.entries(contactStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label className="admin-property-form__field">
              <span>Último contacto</span>
              <input type="datetime-local" name="last_contact_at" />
            </label>
          </div>
        </section>

        <section className="admin-property-form__section">
          <div><span>02</span><h2>Inmuebles relacionados</h2></div>
          <p className="admin-property-form__required-note">
            Puedes seleccionar varios inmuebles ahora o añadirlos más adelante.
          </p>
          {isLoadingProperties ? (
            <p className="admin-contacts__inline-status">Cargando inmuebles...</p>
          ) : properties.length > 0 ? (
            <div className="admin-contact-properties-picker">
              {properties.map((property) => (
                <label key={property.id}>
                  <input
                    type="checkbox"
                    checked={selectedPropertyIds.includes(property.id)}
                    onChange={() => toggleProperty(property.id)}
                  />
                  <span>
                    <strong>{property.reference || 'Sin referencia'} · {property.title}</strong>
                    <small>{property.city}</small>
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="admin-contacts__inline-status">No hay inmuebles para relacionar.</p>
          )}
        </section>

        <section className="admin-property-form__section">
          <div><span>03</span><h2>Notas</h2></div>
          <label className="admin-property-form__field">
            <span>Notas</span>
            <textarea name="notes" rows={8} placeholder="Preferencias, contexto de la consulta y próximos pasos." />
          </label>
        </section>

        {error ? <p className="admin-property-form__error" role="alert">{error}</p> : null}

        <div className="admin-property-form__actions">
          <button type="button" disabled={isSubmitting} onClick={() => navigate('/admin/contactos')}>
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar contacto →'}
          </button>
        </div>
      </form>
    </main>
  );
}
