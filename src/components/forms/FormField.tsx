import { useId, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface BaseProps { label: string; name: string; required?: boolean; error?: string; wrapperClassName?: string }
type FieldProps = BaseProps & InputHTMLAttributes<HTMLInputElement> & { as?: 'input' };
type SelectProps = BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { as: 'select'; options: string[] };
type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement> & { as: 'textarea' };

export function FormField(props: FieldProps | SelectProps | TextareaProps) {
  const reactId = useId();
  const id = `field-${props.name}-${reactId.replace(/:/g, '')}`;
  const errorId = `${id}-error`;
  const wrapperClasses = ['form-field', props.as === 'textarea' && 'form-field--wide', props.wrapperClassName].filter(Boolean).join(' ');
  const label = <label htmlFor={id}>{props.label}{props.required && <span aria-hidden="true"> *</span>}</label>;
  const error = props.error ? <span id={errorId} className="form-field__error">{props.error}</span> : null;
  if (props.as === 'select') {
    const { options, label: _label, as: _as, error: _error, wrapperClassName: _wrapperClassName, ...rest } = props;
    return <div className={wrapperClasses}>{label}<select id={id} aria-invalid={Boolean(props.error)} aria-describedby={props.error ? errorId : undefined} {...rest}><option value="">Selecciona una opción</option>{options.map((option) => <option key={option}>{option}</option>)}</select>{error}</div>;
  }
  if (props.as === 'textarea') {
    const { label: _label, as: _as, error: _error, wrapperClassName: _wrapperClassName, ...rest } = props;
    return <div className={wrapperClasses}>{label}<textarea id={id} rows={5} aria-invalid={Boolean(props.error)} aria-describedby={props.error ? errorId : undefined} {...rest} />{error}</div>;
  }
  const { label: _label, as: _as, error: _error, wrapperClassName: _wrapperClassName, ...rest } = props;
  return <div className={wrapperClasses}>{label}<input id={id} aria-invalid={Boolean(props.error)} aria-describedby={props.error ? errorId : undefined} {...rest} />{error}</div>;
}
