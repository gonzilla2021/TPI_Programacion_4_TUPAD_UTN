import { handleApiError } from '../api/handleApiError'

export function EstadoError({ error }: { error: unknown }) {
  return (
    <p role="alert" className="error">
      {handleApiError(error)}
    </p>
  )
}
