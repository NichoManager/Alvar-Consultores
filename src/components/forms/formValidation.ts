import type { FormEvent } from 'react';

export type FormErrors = Record<string, string>;

export function validateForm(event: FormEvent<HTMLFormElement>): FormErrors {
  const errors: FormErrors = {};
  const fields = Array.from(event.currentTarget.elements).filter((element): element is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement => element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement);

  fields.forEach((field) => {
    if (!field.name || field.type === 'hidden' || field.validity.valid) return;
    errors[field.name] = field.validity.typeMismatch
      ? 'Introduce un formato válido.'
      : field.type === 'checkbox'
        ? 'Necesitamos tu aceptación para continuar.'
        : 'Completa este campo.';
  });

  return errors;
}
