import { useQuery } from '@tanstack/react-query'
import { pedidosApi } from '../api/pedidos'
import type { Pedido } from '../types'
import { useAuthStore } from '../../../store/authStore'

export function useMisPedidos(pagina: number) {
  const usuario = useAuthStore((s) => s.usuario)
  return useQuery({
    queryKey: ['pedidos', 'propios', usuario?.id, pagina],
    queryFn: async () => {
      if (usuario?.role !== 'admin') return pedidosApi.listar(pagina * 20)
      // GET /pedidos devuelve todos al admin. Filtramos los propios para esta pantalla.
      const propios: Pedido[] = []
      for (let skip = 0; ; skip += 20) {
        const resultado = await pedidosApi.listar(skip)
        propios.push(...resultado.items.filter((pedido) => pedido.usuario_id === usuario.id))
        if (skip + resultado.items.length >= resultado.total || resultado.items.length === 0) break
      }
      return { total: propios.length, items: propios.slice(pagina * 20, (pagina + 1) * 20) }
    },
  })
}
