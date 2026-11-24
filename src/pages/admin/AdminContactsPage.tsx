import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminCurrentUser } from '../../components/admin/AdminCurrentUser';
import {
  contactInterestLabels,
  contactSourceLabels,
  contactStatusLabels,
  getContacts,
  contactOrigin,
  importSourceLabels,
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
  const [originFilter, setOriginFilter] = useState('all');
  const [sheetFilter, setSheetFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 50;
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

  const origins = useMemo(() => Array.from(new Set(['Web', ...importSourceLabels, 'Otros', ...contacts.map(contactOrigin)])), [contacts]);
  const sheets = useMemo(() => Array.from(new Set(contacts.filter((contact) => contactOrigin(contact) === originFilter && contact.importSheet).map((contact) => contact.importSheet as string))).sort(), [contacts, originFilter]);

  const filteredContacts = useMemo(() => {
    const normalizedSearch = normalizeSearch(search);

    return contacts.filter((contact) => {
      const matchesSearch =
        !normalizedSearch ||
        [contact.name, contact.email, contact.phone, contact.importAddress, contact.importMunicipality].some((value) =>
          normalizeSearch(value ?? '').includes(normalizedSearch),
        );
      const matchesInterest =
        interestFilter === 'all' || contact.interest === interestFilter;
      const matchesStatus =
        statusFilter === 'all' || contact.status === statusFilter;

      const matchesOrigin = originFilter === 'all' || contactOrigin(contact) === originFilter;
      const matchesSheet = sheetFilter === 'all' || contact.importSheet === sheetFilter;
      return matchesSearch && matchesInterest && matchesStatus && matchesOrigin && matchesSheet;
    });
  }, [contacts, interestFilter, search, statusFilter, originFilter, sheetFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleContacts = filteredContacts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const clearFilters = () => {
    setSearch('');
    setOriginFilter('all');
    setSheetFilter('all');
    setPage(1);
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

        <div className="admin-properties__actions">
          <button
            type="button"
            className="admin-header__primary-action"
            onClick={() => navigate('/admin/contactos/nuevo')}
          >
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
          <AdminCurrentUser />
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

        {!isLoading && !error ? (
          <nav aria-label="Origen de contactos" className="admin-contacts__origins" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {['all', ...origins].map((origin) => (
              <button key={origin} type="button" aria-pressed={originFilter === origin} className={originFilter === origin ? 'admin-header__primary-action' : ''} style={{ padding: '9px 14px', border: '1px solid #b9b4aa', borderRadius: 6, fontWeight: originFilter === origin ? 700 : 400, background: originFilter === origin ? '#283b38' : 'transparent', color: originFilter === origin ? '#fff' : 'inherit', cursor: 'pointer' }} onClick={() => { setOriginFilter(origin); setSheetFilter('all'); setPage(1); }}>
                {origin === 'all' ? 'Todos' : origin} ({origin === 'all' ? contacts.length : contacts.filter((contact) => contactOrigin(contact) === origin).length})
              </button>
            ))}
          </nav>
        ) : null}

        {!isLoading && !error && contacts.length > 0 ? (
          <div className="admin-contacts__toolbar">
            <label className="admin-contacts__search">
              <span className="sr-only">Buscar contactos</span>
              <input
                type="search"
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                placeholder="Buscar por nombre, teléfono, email o dirección"
              />
            </label>

            <label>
              <span className="sr-only">Filtrar por interés</span>
              <select
                value={interestFilter}
                onChange={(event) => { setInterestFilter(event.target.value as InterestFilter); setPage(1); }}
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
                onChange={(event) => { setStatusFilter(event.target.value as StatusFilter); setPage(1); }}
              >
                <option value="all">Todos los estados</option>
                {Object.entries(contactStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            {sheets.length > 1 ? (
              <label><span className="sr-only">Filtrar por hoja de origen</span><select value={sheetFilter} onChange={(event) => { setSheetFilter(event.target.value); setPage(1); }}><option value="all">Todas las hojas</option>{sheets.map((sheet) => <option key={sheet} value={sheet}>{sheet}</option>)}</select></label>
            ) : null}
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
            {visibleContacts.map((contact) => (
              <article className="admin-contact-card" key={contact.id}>
                <div className="admin-contact-card__identity">
                  <span>
                    INTERÉS: {contactInterestLabels[contact.interest]} · ORIGEN:{' '}
                    {contact.importSource || contactSourceLabels[contact.source]}{contact.importSheet && contact.importSheet !== 'Hoja1' ? ` · ${contact.importSheet}` : ''}
                  </span>
                  <h3>{contact.name}</h3>
                  {contact.importAddress ? <p>{contact.importAddress}{contact.importMunicipality ? ` · ${contact.importMunicipality}` : ''}</p> : null}
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
        {!isLoading && !error && filteredContacts.length > 0 ? (
          <div aria-label="Paginación de contactos" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 20 }}>
            <span>{filteredContacts.length} resultados · Página {currentPage} de {totalPages}</span>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>← Anterior</button>
              <button type="button" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Siguiente →</button>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
