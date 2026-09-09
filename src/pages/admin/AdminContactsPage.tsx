import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  contactInterestLabels,
  contactStatusLabels,
  getContacts,
  type Contact,
  type ContactInterest,
  type ContactStatus,
} from '../../lib/contacts';
import { supabase } from '../../lib/supabase';
import '../../styles/admin.css';

type InterestFilter = 'all' | ContactInterest;
type StatusFilter = 'all' | ContactStatus;

const statusOrder: ContactStatus[] = [
  'new',
  'contacted',
  'visit',
  'negotiation',
  'closed',
  'discarded',
];

const statusSummaryLabels: Record<
  ContactStatus,
  { singular: string; plural: string }
> = {
  new: { singular: 'nuevo', plural: 'nuevos' },
  contacted: { singular: 'contactado', plural: 'contactados' },
  visit: { singular: 'visita', plural: 'visitas' },
  negotiation: { singular: 'negociación', plural: 'negociaciones' },
  closed: { singular: 'cerrado', plural: 'cerrados' },
  discarded: { singular: 'descartado', plural: 'descartados' },
};

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function formatDate(value: string | null) {
  if (!value) return 'Sin registrar';

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Sin registrar' : dateFormatter.format(date);
}

export function AdminContactsPage() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [interestFilter, setInterestFilter] =
    useState<InterestFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    let isMounted = true;

    const loadPage = async () => {
      setIsLoading(true);
      setError('');

      const [contactsResult, superadminResult] = await Promise.allSettled([
        getContacts(),
        supabase.rpc('is_superadmin'),
      ]);

      if (!isMounted) return;

      if (contactsResult.status === 'rejected') {
        console.error('Error loading contacts:', contactsResult.reason);
        setError('No se han podido cargar los contactos.');
      } else {
        setContacts(contactsResult.value);
      }

      if (
        superadminResult.status === 'fulfilled' &&
        !superadminResult.value.error &&
        superadminResult.value.data === true
      ) {
        setIsSuperadmin(true);
      }

      setIsLoading(false);
    };

    void loadPage();

    return () => {
      isMounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const parts = [
      `${contacts.length} ${contacts.length === 1 ? 'contacto' : 'contactos'}`,
    ];

    statusOrder.forEach((status) => {
      const count = contacts.filter((contact) => contact.status === status).length;
      if (count > 0) {
        const labels = statusSummaryLabels[status];
        parts.push(`${count} ${count === 1 ? labels.singular : labels.plural}`);
      }
    });

    return parts.join(' · ');
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    const normalizedSearch = normalizeSearch(search);

    return contacts.filter((contact) => {
      const matchesSearch =
        !normalizedSearch ||
        [contact.name, contact.email, contact.phone].some((value) =>
          normalizeSearch(value ?? '').includes(normalizedSearch),
        );
      const matchesInterest =
        interestFilter === 'all' || contact.interest === interestFilter;
      const matchesStatus =
        statusFilter === 'all' || contact.status === statusFilter;

      return matchesSearch && matchesInterest && matchesStatus;
    });
  }, [contacts, interestFilter, search, statusFilter]);

  const clearFilters = () => {
    setSearch('');
    setInterestFilter('all');
    setStatusFilter('all');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <main className="admin-properties admin-contacts">
      <header className="admin-properties__header">
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
          <h1>Contactos</h1>
        </div>

        <div>
          <button type="button" onClick={() => navigate('/admin/contactos/nuevo')}>
            + Nuevo contacto
          </button>
          <button type="button" onClick={() => navigate('/admin/inmuebles')}>
            Inmuebles
          </button>
          {isSuperadmin ? (
            <button type="button" onClick={() => navigate('/admin/usuarios')}>
              Usuarios
            </button>
          ) : null}
          <button type="button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <section className="admin-properties__content">
        <div className="admin-properties__intro">
          <div>
            <p>GESTIÓN COMERCIAL</p>
            <h2>Contactos</h2>
            {!isLoading && !error ? (
              <span className="admin-properties__summary">{summary}</span>
            ) : null}
          </div>
        </div>

        {!isLoading && !error && contacts.length > 0 ? (
          <div className="admin-contacts__toolbar">
            <label className="admin-contacts__search">
              <span className="sr-only">Buscar contactos</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre, email o teléfono"
              />
            </label>

            <label>
              <span className="sr-only">Filtrar por interés</span>
              <select
                value={interestFilter}
                onChange={(event) =>
                  setInterestFilter(event.target.value as InterestFilter)
                }
              >
                <option value="all">Todos los intereses</option>
                {Object.entries(contactInterestLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Filtrar por estado</span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
              >
                <option value="all">Todos los estados</option>
                {Object.entries(contactStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          </div>
        ) : null}

        {isLoading ? (
          <p className="admin-properties__loading">Cargando contactos...</p>
        ) : null}

        {error ? (
          <p className="admin-properties__error" role="alert">{error}</p>
        ) : null}

        {!isLoading && !error && contacts.length === 0 ? (
          <div className="admin-properties__empty">
            <span>Sin contactos todavía</span>
            <h3>Añade tu primer contacto comercial.</h3>
            <button type="button" onClick={() => navigate('/admin/contactos/nuevo')}>
              Crear primer contacto
            </button>
          </div>
        ) : null}

        {!isLoading && !error && contacts.length > 0 && filteredContacts.length === 0 ? (
          <div className="admin-properties__empty admin-properties__empty--filtered">
            <h3>No encontramos contactos con estos filtros.</h3>
            <button type="button" onClick={clearFilters}>Limpiar filtros</button>
          </div>
        ) : null}

        {!isLoading && filteredContacts.length > 0 ? (
          <div className="admin-contacts__list">
            {filteredContacts.map((contact) => (
              <article className="admin-contact-card" key={contact.id}>
                <div className="admin-contact-card__identity">
                  <span>{contactInterestLabels[contact.interest]}</span>
                  <h3>{contact.name}</h3>
                  <div>
                    {contact.phone ? <a href={`tel:${contact.phone}`}>{contact.phone}</a> : null}
                    {contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : null}
                    {!contact.phone && !contact.email ? <small>Sin datos de contacto</small> : null}
                  </div>
                </div>

                <div className="admin-contact-card__properties">
                  <span>INMUEBLES RELACIONADOS</span>
                  {contact.properties.length > 0 ? (
                    <p>
                      {contact.properties.slice(0, 2).map((property) =>
                        property.reference || property.title,
                      ).join(' · ')}
                      {contact.properties.length > 2
                        ? ` · +${contact.properties.length - 2}`
                        : ''}
                    </p>
                  ) : <p>Sin inmuebles relacionados</p>}
                </div>

                <div className="admin-contact-card__activity">
                  <span>ÚLTIMO CONTACTO</span>
                  <strong>{formatDate(contact.lastContactAt)}</strong>
                  <span className={`admin-contact-status admin-contact-status--${contact.status}`}>
                    {contactStatusLabels[contact.status]}
                  </span>
                </div>

                <button
                  type="button"
                  className="admin-contact-card__open"
                  onClick={() => navigate(`/admin/contactos/${contact.id}`)}
                >
                  Abrir / Editar <span aria-hidden="true">→</span>
                </button>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
