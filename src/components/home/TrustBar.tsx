const items = [
  'Valoración profesional',
  'Madrid capital y alrededores',
  'Compra · Venta · Alquiler',
  'Acompañamiento hasta la firma',
  '18+ años de experiencia',
  'Asesoramiento inmobiliario personalizado',
];

export function TrustBar() {
  return (
    <section className="trust-bar" aria-label="Compromisos de Alvar Consultores Inmobiliarios">
      <div className="trust-bar__track">
        <div className="trust-bar__group">
          {items.map((item) => (
            <span className="trust-bar__item" key={item}>
              {item}
              <i aria-hidden="true">•</i>
            </span>
          ))}
        </div>

        <div className="trust-bar__group" aria-hidden="true">
          {items.map((item) => (
            <span className="trust-bar__item" key={item}>
              {item}
              <i aria-hidden="true">•</i>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
