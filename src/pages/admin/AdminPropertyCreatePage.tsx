import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import '../../styles/admin.css';

type PropertyStatus = 'draft' | 'published';

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
    const status = String(formData.get('status')) as PropertyStatus;
    const price = nullableNumber(formData.get('price'));

    if (!slug || price === null) {
      setError('Revisa el título y el precio antes de guardar el inmueble.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const { error: insertError } = await supabase
        .from('properties')
        .insert({
          reference: nullableText(formData.get('reference')),
          title,
          slug,
          operation: String(formData.get('operation')),
          property_type: String(formData.get('property_type')),
          status,
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
          published_at:
            status === 'published' ? new Date().toISOString() : null,
        });

      if (insertError) {
        console.error('Error creating property:', insertError);
        setError(
          'No se ha podido guardar el inmueble. Revisa los datos o inténtalo de nuevo.',
        );
        return;
      }

      navigate('/admin/inmuebles', { replace: true });
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
        <span>ALVAR CONSULTORES</span>
        <h1>Nuevo inmueble</h1>
        <p>
          Añade los datos principales de la propiedad. Las fotografías se
          incorporarán en el siguiente paso.
        </p>
      </header>

      <form className="admin-property-form" onSubmit={handleSubmit}>
        <section className="admin-property-form__section">
          <div>
            <span>01</span>
            <h2>Datos principales</h2>
          </div>

          <div className="admin-property-form__grid">
            <label className="admin-property-form__field">
              <span>Operación</span>
              <select name="operation" defaultValue="venta" required>
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
              </select>
            </label>

            <label className="admin-property-form__field">
              <span>Tipo de inmueble</span>
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
              <span>Título</span>
              <input
                type="text"
                name="title"
                placeholder="Piso luminoso con terraza en Pinto"
                required
              />
            </label>

            <label className="admin-property-form__field">
              <span>Referencia (opcional)</span>
              <input type="text" name="reference" />
            </label>

            <label className="admin-property-form__field">
              <span>Precio</span>
              <input type="number" name="price" min="0" step="0.01" required />
            </label>

            <label className="admin-property-form__field">
              <span>Estado</span>
              <select name="status" defaultValue="draft" required>
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </label>
          </div>
        </section>

        <section className="admin-property-form__section">
          <div>
            <span>02</span>
            <h2>Ubicación</h2>
          </div>

          <div className="admin-property-form__grid">
            <label className="admin-property-form__field">
              <span>Ciudad</span>
              <input type="text" name="city" required />
            </label>

            <label className="admin-property-form__field">
              <span>Zona / barrio (opcional)</span>
              <input type="text" name="area" />
            </label>

            <label className="admin-property-form__field">
              <span>Dirección (opcional)</span>
              <input type="text" name="address" />
            </label>

            <label className="admin-property-form__field">
              <span>Código postal (opcional)</span>
              <input type="text" name="postal_code" inputMode="numeric" />
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
              <span>Dormitorios (opcional)</span>
              <input type="number" name="bedrooms" min="0" step="1" />
            </label>

            <label className="admin-property-form__field">
              <span>Baños (opcional)</span>
              <input type="number" name="bathrooms" min="0" step="1" />
            </label>

            <label className="admin-property-form__field">
              <span>Superficie construida (m², opcional)</span>
              <input type="number" name="built_area" min="0" step="0.01" />
            </label>

            <label className="admin-property-form__field">
              <span>Superficie útil (m², opcional)</span>
              <input type="number" name="usable_area" min="0" step="0.01" />
            </label>

            <label className="admin-property-form__field">
              <span>Planta (opcional)</span>
              <input type="text" name="floor" />
            </label>
          </div>

          <div className="admin-property-form__checks">
            <label>
              <input type="checkbox" name="elevator" />
              <span>Ascensor</span>
            </label>
            <label>
              <input type="checkbox" name="parking" />
              <span>Garaje</span>
            </label>
            <label>
              <input type="checkbox" name="terrace" />
              <span>Terraza</span>
            </label>
            <label>
              <input type="checkbox" name="furnished" />
              <span>Amueblado</span>
            </label>
            <label>
              <input type="checkbox" name="exterior" />
              <span>Exterior</span>
            </label>
            <label>
              <input type="checkbox" name="featured" />
              <span>Destacado</span>
            </label>
          </div>
        </section>

        <section className="admin-property-form__section">
          <div>
            <span>04</span>
            <h2>Descripción</h2>
          </div>

          <label className="admin-property-form__field">
            <span>Descripción</span>
            <textarea name="description" rows={8} required />
          </label>
        </section>

        {error ? (
          <p className="admin-property-form__error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="admin-property-form__actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar inmueble'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/inmuebles')}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        </div>
      </form>
    </main>
  );
}
