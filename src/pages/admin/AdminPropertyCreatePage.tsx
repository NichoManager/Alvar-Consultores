import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import '../../styles/admin.css';

function createSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}

function nullableText(value: FormDataEntryValue | null) {
  const normalized = String(value ?? '').trim();

  return normalized || null;
}

function nullableNumber(value: FormDataEntryValue | null) {
  const normalized = String(value ?? '').trim();

  if (!normalized) {
    return null;
  }

  const number = Number(normalized);

  return Number.isFinite(number) ? number : null;
}

export function AdminPropertyCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get('title') ?? '').trim();
    const slug = createSlug(title);
    const price = nullableNumber(formData.get('price'));

    if (!slug || price === null) {
      setError('Revisa el título y el precio antes de guardar el inmueble.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const { data: createdProperty, error: insertError } = await supabase
        .from('properties')
        .insert({
          reference: nullableText(formData.get('reference')),
          title,
          slug,
          operation: String(formData.get('operation')),
          property_type: String(formData.get('property_type')),
          status: 'draft',
          price,
          currency: 'EUR',
          city: String(formData.get('city') ?? '').trim(),
          area: nullableText(formData.get('area')),
          postal_code: nullableText(formData.get('postal_code')),
          address: nullableText(formData.get('address')),
          bedrooms: nullableNumber(formData.get('bedrooms')),
          bathrooms: nullableNumber(formData.get('bathrooms')),
          built_area: nullableNumber(formData.get('built_area')),
          usable_area: nullableNumber(formData.get('usable_area')),
          floor: nullableText(formData.get('floor')),
          elevator: formData.has('elevator'),
          parking: formData.has('parking'),
          terrace: formData.has('terrace'),
          furnished: formData.has('furnished'),
          exterior: formData.has('exterior'),
          description: String(formData.get('description') ?? '').trim(),
          featured: formData.has('featured'),
          published_at: null,
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Error creating property:', insertError);
        setError(
          'No se ha podido guardar el inmueble. Revisa los datos o inténtalo de nuevo.',
        );
        return;
      }

      navigate(`/admin/inmuebles/${createdProperty.id}/editar`, {
        replace: true,
      });
    } catch (unexpectedError) {
      console.error('Unexpected property creation error:', unexpectedError);
      setError(
        'No se ha podido guardar el inmueble. Inténtalo de nuevo en unos minutos.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-property-form-page">
      <header className="admin-property-form__header">
        <div className="admin-property-form__header-inner">
          <button
            type="button"
            className="admin-property-form__back"
            onClick={() => navigate('/admin/inmuebles')}
          >
            <span aria-hidden="true">←</span> Volver a inmuebles
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
          <h1>Nuevo inmueble</h1>
          <p>
            Añade los datos principales de la propiedad. Después podrás
            incorporar fotografías y revisar el inmueble antes de publicarlo.
          </p>
        </div>
      </header>

      <form className="admin-property-form" onSubmit={handleSubmit}>
        <p className="admin-property-form__required-note">
          Los campos marcados con * son obligatorios.
        </p>

        <section className="admin-property-form__section">
          <div>
            <span>01</span>
            <h2>Datos principales</h2>
          </div>

          <div className="admin-property-form__grid">
            <label className="admin-property-form__field">
              <span>Operación *</span>
              <select name="operation" defaultValue="venta" required>
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
              </select>
            </label>

            <label className="admin-property-form__field">
              <span>Tipo de inmueble *</span>
              <select name="property_type" defaultValue="Piso" required>
                <option value="Piso">Piso</option>
                <option value="Casa">Casa</option>
                <option value="Chalet">Chalet</option>
                <option value="Ático">Ático</option>
                <option value="Dúplex">Dúplex</option>
                <option value="Estudio">Estudio</option>
                <option value="Local">Local</option>
                <option value="Oficina">Oficina</option>
                <option value="Terreno">Terreno</option>
                <option value="Otro">Otro</option>
              </select>
            </label>

            <label className="admin-property-form__field">
              <span>Título *</span>
              <input
                type="text"
                name="title"
                placeholder="Ej. Piso luminoso con terraza en Pinto"
                required
              />
            </label>

            <label className="admin-property-form__field">
              <span>Referencia</span>
              <input type="text" name="reference" placeholder="Ej. ALV-001" />
            </label>

            <label className="admin-property-form__field">
              <span>Precio *</span>
              <span className="admin-property-form__input-suffix">
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  required
                />
                <span aria-hidden="true">€</span>
              </span>
            </label>

            <div className="admin-property-form__status" aria-label="Estado: Borrador">
              <span>Estado</span>
              <strong>Borrador</strong>
              <small>
                No aparecerá en la web hasta que lo publiques desde la edición
                del inmueble.
              </small>
            </div>
          </div>
        </section>

        <section className="admin-property-form__section">
          <div>
            <span>02</span>
            <h2>Ubicación</h2>
          </div>

          <div className="admin-property-form__grid">
            <label className="admin-property-form__field">
              <span>Ciudad *</span>
              <input type="text" name="city" placeholder="Madrid" required />
            </label>

            <label className="admin-property-form__field">
              <span>Zona / barrio</span>
              <input type="text" name="area" placeholder="Ej. Ríos Rosas" />
            </label>

            <label className="admin-property-form__field">
              <span>Dirección</span>
              <input type="text" name="address" placeholder="Ej. Calle ..." />
            </label>

            <label className="admin-property-form__field">
              <span>Código postal</span>
              <input
                type="text"
                name="postal_code"
                inputMode="numeric"
                placeholder="Ej. 28003"
              />
            </label>
          </div>
        </section>

        <section className="admin-property-form__section">
          <div>
            <span>03</span>
            <h2>Características</h2>
          </div>

          <div className="admin-property-form__grid">
            <label className="admin-property-form__field">
              <span>Dormitorios</span>
              <input type="number" name="bedrooms" min="0" step="1" />
            </label>

            <label className="admin-property-form__field">
              <span>Baños</span>
              <input type="number" name="bathrooms" min="0" step="1" />
            </label>

            <label className="admin-property-form__field">
              <span>Superficie construida (m²)</span>
              <input type="number" name="built_area" min="0" step="0.01" />
            </label>

            <label className="admin-property-form__field">
              <span>Superficie útil (m²)</span>
              <input type="number" name="usable_area" min="0" step="0.01" />
            </label>

            <label className="admin-property-form__field">
              <span>Planta</span>
              <input type="text" name="floor" />
            </label>
          </div>

          <div className="admin-property-form__checks">
            <label className="admin-property-form__check">
              <input type="checkbox" name="elevator" />
              <span>Ascensor</span>
            </label>
            <label className="admin-property-form__check">
              <input type="checkbox" name="parking" />
              <span>Garaje</span>
            </label>
            <label className="admin-property-form__check">
              <input type="checkbox" name="terrace" />
              <span>Terraza</span>
            </label>
            <label className="admin-property-form__check">
              <input type="checkbox" name="furnished" />
              <span>Amueblado</span>
            </label>
            <label className="admin-property-form__check">
              <input type="checkbox" name="exterior" />
              <span>Exterior</span>
            </label>
            <label className="admin-property-form__check">
              <input type="checkbox" name="featured" />
              <span>Destacado</span>
            </label>
          </div>

          <p className="admin-property-form__check-help">
            Los inmuebles destacados pueden aparecer en posiciones preferentes
            de la web.
          </p>
        </section>

        <section className="admin-property-form__section">
          <div>
            <span>04</span>
            <h2>Descripción</h2>
          </div>

          <label className="admin-property-form__field">
            <span>Descripción</span>
            <small className="admin-property-form__helper">
              Describe los puntos fuertes del inmueble, distribución, estado,
              ubicación y cualquier detalle relevante.
            </small>
            <textarea name="description" rows={8} required />
          </label>
        </section>

        {error ? (
          <p className="admin-property-form__error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="admin-property-form__actions">
          <button
            type="button"
            onClick={() => navigate('/admin/inmuebles')}
            disabled={isSubmitting}
          >
            Cancelar
          </button>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar y continuar →'}
          </button>
        </div>
      </form>
    </main>
  );
}
