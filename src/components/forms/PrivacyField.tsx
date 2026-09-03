import { Link } from 'react-router-dom';

export function PrivacyField({ name = 'privacy' }: { name?: string }) {
  return (
    <label className="privacy-field">
      <input type="checkbox" name={name} required />
      <span>He leído y acepto la <Link to="/privacidad">política de privacidad</Link>.</span>
    </label>
  );
}
