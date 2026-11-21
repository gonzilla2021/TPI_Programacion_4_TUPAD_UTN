import axios from 'axios'

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError<{ detail?: unknown }>(error)) {
    const detail = error.response?.data.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail
        .map((item: unknown) => {
          if (typeof item === 'object' && item !== null && 'msg' in item) return String(item.msg)
          return 'Revisá los datos ingresados'
        })
        .join('. ')
    }
    if (!error.response) return 'No se pudo conectar con el servidor'
  }
  return error instanceof Error ? error.message : 'No se pudo completar la operación'
}
