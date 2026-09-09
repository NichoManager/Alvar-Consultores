import { useId } from 'react';

export function HoneypotField() {
  const id = `website-${useId().replace(/:/g, '')}`;

  return (
    <div className="form-honeypot" aria-hidden="true">
      <label htmlFor={id}>No rellenes este campo</label>
      <input
        id={id}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}
