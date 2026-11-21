import { create } from 'zustand'

interface Aviso {
  id: number
  mensaje: string
}
interface NoticeState {
  avisos: Aviso[]
  mostrar: (mensaje: string) => void
  cerrar: (id: number) => void
}
let siguienteId = 0
// Los avisos no se persisten: sobreviven a la navegación, pero no a una recarga.
export const useNoticeStore = create<NoticeState>((set) => ({
  avisos: [],
  mostrar: (mensaje) =>
    set((state) => ({
      avisos: [...state.avisos, { id: ++siguienteId, mensaje }].slice(-4),
    })),
  cerrar: (id) => set((state) => ({ avisos: state.avisos.filter((aviso) => aviso.id !== id) })),
}))
export const avisarExito = (mensaje: string) => useNoticeStore.getState().mostrar(mensaje)
