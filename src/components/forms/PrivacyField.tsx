import { useId } from 'react';
import { Link } from 'react-router-dom';

export function PrivacyField({ name = 'privacy', error }: { name?: string; error?: string }) {
  const id = `privacy-${useId().replace(/:/g, '')}`;
  const errorId = `${id}-error`;
  return (
    <div className="privacy-field-wrap">
      <label className="privacy-field" htmlFor={id}>
        <input id={id} type="checkbox" name={name} required aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} />
        <span>
          He leído la <Link to="/privacidad">Política de Privacidad</Link> y
          acepto el tratamiento de mis datos para atender mi solicitud.
        </span>
      </label>
      {error && <span id={errorId} className="form-field__error">{error}</span>}
    </div>
  );
}
