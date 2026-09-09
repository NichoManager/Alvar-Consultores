import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  contactInterestLabels,
  contactSourceLabels,
  contactStatusLabels,
  deleteContact,
  getContactById,
  getContactPropertyOptions,
  linkContactProperty,
  unlinkContactProperty,
  updateContact,
  type Contact,
  type ContactInterest,
  type ContactPropertySummary,
  type ContactSource,
  type ContactStatus,
} from '../../lib/contacts';
import '../../styles/admin.css';

type ContactFormState = {
  name: string;
  phone: string;
  email: string;
  interest: ContactInterest;
  status: ContactStatus;
  source: ContactSource;
  lastContactAt: string;
  notes: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const propertyStatusLabels: Record<ContactPropertySummary['status'], string> = {
  draft: 'Borrador',
  published: 'Publicado',
  reserved: 'Reservado',
  sold: 'Vendido',
  rented: 'Alquilado',
  archived: 'Archivado',
};

const dateTimeFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function nullableText(value: string) {
  const normalized = value.trim();
  return normalized || null;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormatter.format(date);
}

function toLocalDateTime(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function toIsoDate(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function createFormState(contact: Contact): ContactFormState {
  return {
    name: contact.name,
    phone: contact.phone ?? '',
    email: contact.email ?? '',
    interest: contact.interest,
    status: contact.status,
    source: contact.source,
    lastContactAt: toLocalDateTime(contact.lastContactAt),
    notes: contact.notes ?? '',
  };
}

function getWhatsAppNumber(phone: string) {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.length === 9) digits = `34${digits}`;
  return digits;
}

export function AdminContactDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [form, setForm] = useState<ContactFormState | null>(null);
  const [properties, setProperties] = useState<ContactPropertySummary[]>([]);
  const [propertyToAdd, setPropertyToAdd] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isManagingProperties, setIsManagingProperties] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadContact = useCallback(async () => {
    if (!id) return;

    const loadedContact = await getContactById(id);
    setContact(loadedContact);
    setForm(loadedContact ? createFormState(loadedContact) : null);
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    const loadPage = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [loadedContact, propertyOptions] = await Promise.all([
          getContactById(id),
          getContactPropertyOptions(),
        ]);

        if (!isMounted) return;
        setContact(loadedContact);
        setForm(loadedContact ? createFormState(loadedContact) : null);
        setProperties(propertyOptions);
      } catch (loadError) {
        console.error('Error loading contact detail:', loadError);
        if (isMounted) setError('No se ha podido cargar el contacto.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadPage();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const availableProperties = useMemo(() => {
    const relatedIds = new Set(contact?.properties.map((property) => property.id));
    return properties.filter((property) => !relatedIds.has(property.id));
  }, [contact, properties]);

  const updateForm = <K extends keyof ContactFormState>(
    key: K,
    value: ContactFormState[K],
  ) => {
    setForm((currentForm) => currentForm ? { ...currentForm, [key]: value } : currentForm);
    setSuccess('');
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contact || !form || isSaving || isDeleting) return;

    const name = form.name.trim();
    const email = form.email.trim();

    if (!name) {
      setError('Introduce el nombre del contacto.');
      return;
    }

    if (email && !emailPattern.test(email)) {
      setError('Introduce un email válido.');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateContact(contact.id, {
        name,
        phone: nullableText(form.phone),
        email: nullableText(email),
        interest: form.interest,
        status: form.status,
        source: form.source,
        notes: nullableText(form.notes),
        lastContactAt: toIsoDate(form.lastContactAt),
      });

      await loadContact();
      setSuccess('Contacto actualizado correctamente.');
    } catch (saveError) {
      console.error('Error updating contact:', saveError);
      setError('No se han podido guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLinkProperty = async () => {
    if (!contact || !propertyToAdd || isManagingProperties) return;

    setIsManagingProperties(true);
    setError('');
    setSuccess('');

    try {
      await linkContactProperty(contact.id, propertyToAdd);
      await loadContact();
      setPropertyToAdd('');
      setSuccess('Inmueble relacionado correctamente.');
    } catch (linkError) {
      console.error('Error linking contact property:', linkError);
      setError('No se ha podido relacionar el inmueble.');
    } finally {
      setIsManagingProperties(false);
    }
  };

  const handleUnlinkProperty = async (propertyId: string) => {
    if (!contact || isManagingProperties) return;

    setIsManagingProperties(true);
    setError('');
    setSuccess('');

    try {
      await unlinkContactProperty(contact.id, propertyId);
      await loadContact();
      setSuccess('Relación eliminada correctamente.');
    } catch (unlinkError) {
      console.error('Error unlinking contact property:', unlinkError);
      setError('No se ha podido quitar el inmueble relacionado.');
    } finally {
      setIsManagingProperties(false);
    }
  };

  const handleDelete = async () => {
    if (!contact || isDeleting) return;

    const confirmed = window.confirm(
      '¿Seguro que quieres eliminar este contacto? Esta acción es permanente.',
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setError('');

    try {
      await deleteContact(contact.id);
      navigate('/admin/contactos', { replace: true });
    } catch (deleteError) {
      console.error('Error deleting contact:', deleteError);
      setError('No se ha podido eliminar el contacto.');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <main className="admin-loading"><p>Cargando contacto...</p></main>;
  }

  if (!contact || !form) {
    return (
      <main className="admin-property-edit admin-property-edit--loading">
        <p>{error || 'No se ha encontrado el contacto solicitado.'}</p>
        <Link to="/admin/contactos">← Volver a contactos</Link>
      </main>
    );
  }

  const whatsAppNumber = form.phone ? getWhatsAppNumber(form.phone) : '';

  return (
    <main className="admin-property-edit admin-contact-detail">
      <header className="admin-property-edit__header">
        <div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-site-link"
            aria-label="Abrir la web pública de Alvar Consultores en una nueva pestaña"
          >
            ALVAR CONSULTORES <span aria-hidden="true">↗</span>
          </a>
          <h1>Editar contacto</h1>
          <p>{contact.name}</p>
        </div>

        <div className="admin-property-edit__meta">
          <span>{contactStatusLabels[contact.status]}</span>
          <div><Link to="/admin/contactos">← Volver a contactos</Link></div>
        </div>
      </header>

      <div className="admin-contact-detail__quick-actions">
        {form.phone ? <a href={`tel:${form.phone}`}>Llamar</a> : null}
        {whatsAppNumber ? (
          <a href={`https://wa.me/${whatsAppNumber}`} target="_blank" rel="noopener noreferrer">
            WhatsApp ↗
          </a>
        ) : null}
        {form.email ? <a href={`mailto:${form.email}`}>Email</a> : null}
      </div>

      <form className="admin-property-form admin-contact-form" onSubmit={handleSave}>
        <section className="admin-property-form__section">
          <div><span>01</span><h2>Datos del contacto</h2></div>
          <div className="admin-property-form__grid">
            <label className="admin-property-form__field">
              <span>Nombre *</span>
              <input value={form.name} onChange={(event) => updateForm('name', event.target.value)} required />
            </label>
            <label className="admin-property-form__field">
              <span>Teléfono</span>
              <input type="tel" value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} />
            </label>
            <label className="admin-property-form__field">
              <span>Email</span>
              <input type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} />
            </label>
            <label className="admin-property-form__field">
              <span>Interés *</span>
              <select value={form.interest} onChange={(event) => updateForm('interest', event.target.value as ContactInterest)}>
                {Object.entries(contactInterestLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="admin-property-form__field">
              <span>Estado</span>
              <select value={form.status} onChange={(event) => updateForm('status', event.target.value as ContactStatus)}>
                {Object.entries(contactStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="admin-property-form__field">
              <span>Fuente</span>
              <select value={form.source} onChange={(event) => updateForm('source', event.target.value as ContactSource)}>
                {Object.entries(contactSourceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="admin-property-form__field">
              <span>Último contacto</span>
              <input type="datetime-local" value={form.lastContactAt} onChange={(event) => updateForm('lastContactAt', event.target.value)} />
            </label>
          </div>
        </section>

        <section className="admin-property-form__section">
          <div><span>02</span><h2>Notas</h2></div>
          <label className="admin-property-form__field">
            <span>Notas</span>
            <textarea value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} />
          </label>
        </section>

        {error ? <p className="admin-property-form__error" role="alert">{error}</p> : null}
        {success ? <p className="admin-images__status" role="status">{success}</p> : null}

        <div className="admin-property-form__actions">
          <button type="button" disabled={isSaving || isDeleting} onClick={() => setForm(createFormState(contact))}>Deshacer cambios</button>
          <button type="submit" disabled={isSaving || isDeleting}>{isSaving ? 'Guardando...' : 'Guardar cambios'}</button>
        </div>
      </form>

      <section className="admin-contact-relations">
        <div className="admin-contact-relations__heading">
          <div><span>INMUEBLES</span><h2>Propiedades relacionadas</h2></div>
          {availableProperties.length > 0 ? (
            <div className="admin-contact-relations__add">
              <label className="sr-only" htmlFor="contact-property-add">Añadir inmueble</label>
              <select id="contact-property-add" value={propertyToAdd} onChange={(event) => setPropertyToAdd(event.target.value)}>
                <option value="">Seleccionar inmueble</option>
                {availableProperties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.reference || 'Sin referencia'} · {property.title} · {property.city}
                  </option>
                ))}
              </select>
              <button type="button" disabled={!propertyToAdd || isManagingProperties} onClick={() => void handleLinkProperty()}>
                Añadir
              </button>
            </div>
          ) : null}
        </div>

        {contact.properties.length > 0 ? (
          <div className="admin-contact-relations__list">
            {contact.properties.map((property) => (
              <article key={property.id}>
                <div>
                  <span>{property.operation === 'venta' ? 'VENTA' : 'ALQUILER'} · {propertyStatusLabels[property.status]}</span>
                  <h3>{property.reference ? `${property.reference} · ` : ''}{property.title}</h3>
                  <p>{property.city}</p>
                </div>
                <div>
                  <Link to={`/admin/inmuebles/${property.id}/editar`}>Editar inmueble →</Link>
                  <button type="button" disabled={isManagingProperties} onClick={() => void handleUnlinkProperty(property.id)}>Quitar relación</button>
                </div>
              </article>
            ))}
          </div>
        ) : <p className="admin-contacts__inline-status">Este contacto no tiene inmuebles relacionados.</p>}
      </section>

      <section className="admin-contact-audit" aria-label="Información del registro">
        <span>Fecha de alta: <strong>{formatDateTime(contact.createdAt)}</strong></span>
        <span>Última actualización: <strong>{formatDateTime(contact.updatedAt)}</strong></span>
      </section>

      <section className="admin-property-danger" aria-labelledby="contact-danger-title">
        <div className="admin-property-danger__content">
          <div>
            <span>ACCIÓN PERMANENTE</span>
            <h2 id="contact-danger-title">Eliminar contacto</h2>
            <p>Esta acción es permanente. También se eliminarán sus relaciones con inmuebles.</p>
          </div>
          <button type="button" className="admin-property-danger__button" disabled={isDeleting || isSaving} onClick={() => void handleDelete()}>
            {isDeleting ? 'Eliminando...' : 'Eliminar contacto'}
          </button>
        </div>
      </section>
    </main>
  );
}
