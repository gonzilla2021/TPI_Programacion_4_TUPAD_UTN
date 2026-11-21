import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { EstadoError } from './EstadoError'

export interface Campo {
  nombre: string
  etiqueta: string
  tipo?: 'text' | 'email' | 'password' | 'number' | 'url' | 'textarea' | 'select'
  requerido?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  step?: string
  opciones?: { valor: string; texto: string }[]
}

export function Formulario({
  iniciales,
  campos,
  enviar,
  texto = 'Guardar',
}: {
  iniciales: Record<string, string>
  campos: Campo[]
  enviar: (datos: Record<string, string>) => Promise<void>
  texto?: string
}) {
  const [error, setError] = useState<unknown>(null)
  const form = useForm({
    defaultValues: iniciales,
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await enviar(value)
      } catch (err) {
        setError(err)
      }
    },
  })
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
      className="form-grid"
    >
      {campos.map((campo) => (
        <form.Field
          key={campo.nombre}
          name={campo.nombre}
          validators={{
            onChange: ({ value }) => {
              if (campo.requerido && !value.trim()) return 'Este campo es obligatorio'
              if (campo.minLength && value.length < campo.minLength)
                return 'Mínimo ' + campo.minLength + ' caracteres'
              if (campo.maxLength && value.length > campo.maxLength)
                return 'Máximo ' + campo.maxLength + ' caracteres'
              if (
                campo.tipo === 'number' &&
                value &&
                (!Number.isFinite(Number(value)) ||
                  (campo.min !== undefined && Number(value) < campo.min))
              )
                return 'Revisá el valor numérico'
              return undefined
            },
          }}
        >
          {(field) => (
            <label className="field">
              {campo.etiqueta}
              {campo.tipo === 'select' ? (
                <select
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  required={campo.requerido}
                  onChange={(e) => field.handleChange(e.target.value)}
                >
                  {campo.opciones?.map((opcion) => (
                    <option key={opcion.valor} value={opcion.valor}>
                      {opcion.texto}
                    </option>
                  ))}
                </select>
              ) : campo.tipo === 'textarea' ? (
                <textarea
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  maxLength={campo.maxLength}
                  required={campo.requerido}
                />
              ) : (
                <Input
                  type={campo.tipo ?? 'text'}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  minLength={campo.minLength}
                  maxLength={campo.maxLength}
                  min={campo.min}
                  step={campo.step}
                  required={campo.requerido}
                />
              )}
              {field.state.meta.errors.length > 0 && (
                <small className="text-red-700">{field.state.meta.errors.join('. ')}</small>
              )}
            </label>
          )}
        </form.Field>
      ))}
      {error !== null && <EstadoError error={error} />}
      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, submitting]) => (
          <Button type="submit" disabled={!canSubmit || submitting}>
            {submitting ? 'Guardando…' : texto}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
