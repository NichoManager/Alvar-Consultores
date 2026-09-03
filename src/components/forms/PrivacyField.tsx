import { useId } from 'react';
import { Link } from 'react-router-dom';

export function PrivacyField({ name = 'privacy', error }: { name?: string; error?: string }) {
  const id = `privacy-${useId().replace(/:/g, '')}`;
  const errorId = `${id}-error`;
  return (
    <div className="privacy-field-wrap">
      <label className="privacy-field" htmlFor={id}>
        <input id={id} type="checkbox" name={name} required aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} />
        <span>He leído y acepto la <Link to="/privacidad">política de privacidad</Link>.</span>
      </label>
      {error && <span id={errorId} className="form-field__error">{error}</span>}
    </div>
  );
}
