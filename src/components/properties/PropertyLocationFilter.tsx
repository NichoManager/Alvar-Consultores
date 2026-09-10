import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  normalizePropertyFilterText,
  type PropertyLocationOption,
} from '../../lib/propertyFilters';

type PropertyLocationFilterProps = {
  id?: string;
  label?: string;
  options: PropertyLocationOption[];
  value?: PropertyLocationOption;
  onChange: (option?: PropertyLocationOption) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function PropertyLocationFilter({
  id,
  label = 'Ubicación',
  options,
  value,
  onChange,
  placeholder = 'Provincia, municipio o zona',
  disabled = false,
}: PropertyLocationFilterProps) {
  const generatedId = useId();
  const inputId = id ?? `property-location-${generatedId}`;
  const listId = `${inputId}-options`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(value?.label ?? '');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setQuery(value?.label ?? '');
  }, [value]);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const filteredOptions = useMemo(() => {
    const search = normalizePropertyFilterText(query);
    if (!search || value?.label === query) return options.slice(0, 60);
    return options
      .filter((option) =>
        normalizePropertyFilterText(`${option.label} ${option.context}`).includes(search),
      )
      .slice(0, 60);
  }, [options, query, value]);

  const choose = (option: PropertyLocationOption) => {
    setQuery(option.label);
    setOpen(false);
    onChange(option);
  };

  return (
    <div className="property-location-filter" ref={rootRef}>
      <label htmlFor={inputId}>{label}</label>
      <div className="property-location-filter__control">
        <input
          id={inputId}
          type="search"
          role="combobox"
          value={query}
          placeholder={disabled ? 'Cargando ubicaciones…' : placeholder}
          disabled={disabled}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && filteredOptions[activeIndex] ? `${listId}-${activeIndex}` : undefined}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(0);
            if (!event.target.value) onChange(undefined);
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((index) => Math.min(index + 1, filteredOptions.length - 1));
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
            } else if (event.key === 'Enter' && open && filteredOptions[activeIndex]) {
              event.preventDefault();
              choose(filteredOptions[activeIndex]);
            } else if (event.key === 'Escape') {
              setOpen(false);
            }
          }}
        />
        {value ? (
          <button
            className="property-location-filter__clear"
            type="button"
            aria-label="Quitar ubicación"
            onClick={() => {
              setQuery('');
              onChange(undefined);
            }}
          >
            ×
          </button>
        ) : null}
      </div>

      {open && !disabled ? (
        <div className="property-location-filter__options" id={listId} role="listbox">
          {filteredOptions.length ? filteredOptions.map((option, index) => (
            <button
              id={`${listId}-${index}`}
              key={option.id}
              type="button"
              role="option"
              aria-selected={value?.id === option.id}
              className={index === activeIndex ? 'is-active' : undefined}
              onPointerMove={() => setActiveIndex(index)}
              onClick={() => choose(option)}
            >
              <strong>{option.label}</strong>
              <span>{option.context}</span>
            </button>
          )) : (
            <p>No hay ubicaciones públicas que coincidan.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
