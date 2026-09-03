import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface BaseProps { label: string; name: string; required?: boolean }
type FieldProps = BaseProps & InputHTMLAttributes<HTMLInputElement> & { as?: 'input' };
type SelectProps = BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { as: 'select'; options: string[] };
type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement> & { as: 'textarea' };

export function FormField(props: FieldProps | SelectProps | TextareaProps) {
  const id = `field-${props.name}`;
  const label = <label htmlFor={id}>{props.label}{props.required && <span aria-hidden="true"> *</span>}</label>;
  if (props.as === 'select') {
    const { options, label: _label, as: _as, ...rest } = props;
    return <div className="form-field">{label}<select id={id} {...rest}><option value="">Selecciona una opción</option>{options.map((option) => <option key={option}>{option}</option>)}</select></div>;
  }
  if (props.as === 'textarea') {
    const { label: _label, as: _as, ...rest } = props;
    return <div className="form-field form-field--wide">{label}<textarea id={id} rows={5} {...rest} /></div>;
  }
  const { label: _label, as: _as, ...rest } = props;
  return <div className="form-field">{label}<input id={id} {...rest} /></div>;
}
