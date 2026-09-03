const items = ['+18 años de experiencia', 'Madrid · Pinto · Móstoles', 'Compra · Venta · Alquiler', 'Acompañamiento hasta la firma'];

export function TrustBar() {
  return <div className="trust-bar" aria-label="Valores principales"><div>{items.map((item) => <span key={item}>{item}<i aria-hidden="true">•</i></span>)}</div></div>;
}
