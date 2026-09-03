export function SuccessMessage({ title, text, onReset }: { title: string; text: string; onReset: () => void }) {
  return (
    <div className="success-message" role="status">
      <span aria-hidden="true">✓</span><h3>{title}</h3><p>{text}</p>
      <button type="button" onClick={onReset}>Enviar otra consulta</button>
    </div>
  );
}
