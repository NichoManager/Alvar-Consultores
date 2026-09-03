import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';

export function QuickSearch() {
  const navigate = useNavigate();
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of data.entries()) {
      if (typeof value === 'string' && value) params.set(key, value);
    }
    navigate(`/inmuebles?${params.toString()}`);
  };
  return (
    <section className="quick-search-wrap">
      <Container>
        <form className="quick-search" onSubmit={submit}>
          <div className="quick-search__title"><span>01</span><h2>Encuentra tu próxima propiedad</h2></div>
          <label>Operación<select name="operation" defaultValue="venta"><option value="venta">Comprar</option><option value="alquiler">Alquilar</option></select></label>
          <label>Ubicación<select name="city" defaultValue=""><option value="">Todas las zonas</option><option value="Madrid">Madrid</option><option value="Pinto">Pinto</option><option value="Móstoles">Móstoles</option><option value="Otros">Otros</option></select></label>
          <label>Tipo<select name="type" defaultValue=""><option value="">Cualquier tipo</option><option value="piso">Piso</option><option value="casa">Casa</option><option value="atico">Ático</option><option value="estudio">Estudio</option><option value="local">Local</option><option value="oficina">Oficina</option><option value="garaje">Garaje</option><option value="terreno">Terreno</option></select></label>
          <label>Precio mínimo<select name="minPrice" defaultValue="0"><option value="0">Sin mínimo</option><option value="150000">150.000 €</option><option value="250000">250.000 €</option><option value="400000">400.000 €</option></select></label>
          <label>Precio máximo<select name="maxPrice" defaultValue=""><option value="">Sin límite</option><option value="200000">200.000 €</option><option value="300000">300.000 €</option><option value="500000">500.000 €</option></select></label>
          <Button type="submit">Buscar</Button>
        </form>
      </Container>
    </section>
  );
}
