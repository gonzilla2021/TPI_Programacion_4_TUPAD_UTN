import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ItemCarrito {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
}
interface CartState {
  items: ItemCarrito[]
  agregar: (item: Omit<ItemCarrito, 'cantidad'>) => void
  quitar: (id: number) => void
  cambiarCantidad: (id: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
}
// El carrito se conserva al recargar. Precio y stock se validan al confirmar el pedido.
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      agregar: (item) =>
        set((state) => ({
          items: state.items.some((i) => i.producto_id === item.producto_id)
            ? state.items.map((i) =>
                i.producto_id === item.producto_id ? { ...i, cantidad: i.cantidad + 1 } : i,
              )
            : [...state.items, { ...item, cantidad: 1 }],
        })),
      quitar: (id) => set((state) => ({ items: state.items.filter((i) => i.producto_id !== id) })),
      cambiarCantidad: (id, cantidad) => {
        if (!Number.isInteger(cantidad) || cantidad < 1) return
        set((state) => ({
          items: state.items.map((i) => (i.producto_id === id ? { ...i, cantidad } : i)),
        }))
      },
      vaciar: () => set({ items: [] }),
      total: () => get().items.reduce((total, i) => total + i.precio_unitario * i.cantidad, 0),
    }),
    { name: 'foodstore-carrito' },
  ),
)
