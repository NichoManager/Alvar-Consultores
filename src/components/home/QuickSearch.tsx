import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';

export function QuickSearch() {
  const navigate = useNavigate();
  return (
    <section className="quick-search-wrap">
      <Container>
        <form className="quick-search" onSubmit={(event) => { event.preventDefault(); navigate('/inmuebles'); }}>
          <div className="quick-search__title"><span>01</span><h2>Encuentra tu próxima propiedad</h2></div>
          <label>Operación<select><option>Comprar</option><option>Alquilar</option></select></label>
          <label>Ubicación<select><option>Madrid</option><option>Pinto</option><option>Móstoles</option><option>Otros</option></select></label>
          <label>Tipo<select><option>Cualquier tipo</option><option>Piso</option><option>Casa</option><option>Ático</option><option>Estudio</option><option>Local</option><option>Oficina</option><option>Garaje</option><option>Terreno</option></select></label>
          <label>Precio máximo<select><option>Sin límite</option><option>200.000 €</option><option>300.000 €</option><option>500.000 €</option></select></label>
          <Button type="submit">Buscar</Button>
        </form>
      </Container>
    </section>
  );
}
