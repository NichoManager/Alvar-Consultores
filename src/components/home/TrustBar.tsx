const items = ['Valoración profesional', 'Madrid · Pinto · Móstoles', 'Compra · Venta · Alquiler', 'De la valoración a la firma'];

export function TrustBar() {
  return <div className="trust-bar" aria-label="Valores principales"><div>{items.map((item) => <span key={item}>{item}<i aria-hidden="true">•</i></span>)}</div></div>;
}
