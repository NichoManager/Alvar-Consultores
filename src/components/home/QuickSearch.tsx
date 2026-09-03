import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';

export function QuickSearch() {
  const navigate = useNavigate();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    for (const [key, value] of data.entries()) {
      if (typeof value === 'string' && value.trim()) {
        params.set(key, value.trim());
      }
    }

    const query = params.toString();
    navigate(query ? `/inmuebles?${query}` : '/inmuebles');
  };

  return (
    <section className="quick-search-wrap" aria-labelledby="quick-search-title">
      <Container>
        <div className="quick-search-console">
          <div className="quick-search-console__copy">
            <p className="eyebrow">Búsqueda inmobiliaria</p>

            <h2 id="quick-search-title">
              Encuentra tu próxima propiedad <em>con criterio.</em>
            </h2>

            <p id="quick-search-description">
              Selecciona operación, zona y tipo de inmueble. Si no ves lo que buscas,
              cuéntanos tu caso y te asesoramos personalmente en Madrid capital y
              alrededores.
            </p>

            <Link to="/contacto" className="quick-search-console__advisor">
              Prefiero que me asesoren <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <form
            className="quick-search-console__form"
            onSubmit={submit}
            aria-describedby="quick-search-description"
          >
            <div className="quick-search-console__field quick-search-console__field--wide">
              <label htmlFor="quick-operation">Operación</label>
              <select id="quick-operation" name="operation" defaultValue="venta">
                <option value="venta">Comprar</option>
                <option value="alquiler">Alquilar</option>
              </select>
            </div>

            <div className="quick-search-console__field quick-search-console__field--wide">
              <label htmlFor="quick-city">Zona</label>
              <select id="quick-city" name="city" defaultValue="">
                <option value="">Todas las zonas</option>
                <option value="Madrid">Madrid capital</option>
                <option value="Norte de Madrid">Norte de Madrid</option>
                <option value="Sur de Madrid">Sur de Madrid</option>
                <option value="Este de Madrid">Este de Madrid</option>
                <option value="Oeste de Madrid">Oeste de Madrid</option>
                <option value="Pinto">Pinto</option>
                <option value="Móstoles">Móstoles</option>
                <option value="Otros">Otros municipios</option>
              </select>
            </div>

            <div className="quick-search-console__field quick-search-console__field--wide">
              <label htmlFor="quick-type">Tipo</label>
              <select id="quick-type" name="type" defaultValue="">
                <option value="">Cualquier tipo</option>
                <option value="piso">Piso</option>
                <option value="casa">Casa</option>
                <option value="atico">Ático</option>
                <option value="estudio">Estudio</option>
                <option value="local">Local</option>
                <option value="oficina">Oficina</option>
                <option value="garaje">Garaje</option>
                <option value="terreno">Terreno</option>
              </select>
            </div>

            <div className="quick-search-console__field quick-search-console__field--wide">
              <label htmlFor="quick-min-price">Precio mínimo</label>
              <select id="quick-min-price" name="minPrice" defaultValue="0">
                <option value="0">Sin mínimo</option>
                <option value="150000">150.000 €</option>
                <option value="250000">250.000 €</option>
                <option value="400000">400.000 €</option>
                <option value="600000">600.000 €</option>
              </select>
            </div>

            <div className="quick-search-console__field quick-search-console__field--wide">
              <label htmlFor="quick-max-price">Precio máximo</label>
              <select id="quick-max-price" name="maxPrice" defaultValue="">
                <option value="">Sin límite</option>
                <option value="200000">200.000 €</option>
                <option value="300000">300.000 €</option>
                <option value="500000">500.000 €</option>
                <option value="750000">750.000 €</option>
              </select>
            </div>

            <div className="quick-search-console__actions">
              <Button type="submit">Buscar inmuebles</Button>
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
}