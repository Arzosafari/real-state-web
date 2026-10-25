import type { ReactNode } from 'react'

import { cx } from '@/components/ui/Primitives'

interface FieldProps {
  label: string
  name: string
  error?: string
  hint?: string
  required?: boolean
  children: (props: {
    id: string
    name: string
    'aria-invalid': boolean
    'aria-describedby': string | undefined
    className: string
  }) => ReactNode
}

/** Label + control + error message, so every input is labelled and announced. */
export function Field({ label, name, error, hint, required, children }: FieldProps) {
  const id = `field-${name}`
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required ? <span className="text-gold-deep"> *</span> : <span className="ml-1 text-warmgray/70">(optional)</span>}
      </label>
      {children({
        id,
        name,
        'aria-invalid': Boolean(error),
        'aria-describedby': describedBy,
        className: cx('field-control', error && 'border-red-600/70'),
      })}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-2 text-xs text-warmgray">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-xs text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

interface SelectFieldProps extends Omit<FieldProps, 'children'> {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}

export function SelectField({ value, onChange, options, placeholder, ...field }: SelectFieldProps) {
  return (
    <Field {...field}>
      {(props) => (
        <select {...props} value={value} onChange={(event) => onChange(event.target.value)}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  )
}

interface TextFieldProps extends Omit<FieldProps, 'children'> {
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  min?: number
  max?: number
  step?: number
}

export function TextField({ value, onChange, type = 'text', placeholder, min, max, step, ...field }: TextFieldProps) {
  return (
    <Field {...field}>
      {(props) => (
        <input
          {...props}
          type={type}
          value={value}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </Field>
  )
}

interface TextAreaFieldProps extends Omit<FieldProps, 'children'> {
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
}

export function TextAreaField({ value, onChange, rows = 5, placeholder, ...field }: TextAreaFieldProps) {
  return (
    <Field {...field}>
      {(props) => (
        <textarea
          {...props}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </Field>
  )
}

interface ConsentFieldProps {
  name: string
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
  children: ReactNode
}

export function ConsentField({ name, checked, onChange, error, children }: ConsentFieldProps) {
  const id = `field-${name}`
  return (
    <div className={cx('border px-4 py-3', error ? 'border-red-600/70' : 'border-hairline')}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-gold"
        />
        <label htmlFor={id} className="text-sm text-ink/80">
          {children}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-xs text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
