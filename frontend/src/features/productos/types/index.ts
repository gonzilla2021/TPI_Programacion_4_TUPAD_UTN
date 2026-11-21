import type { Categoria } from '../../categorias/types'

export interface Producto {
  id: number
  categoria_id: number
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string
  stock: number
  disponible: boolean
  activo: boolean
  categoria: Categoria
}

export interface ProductoDatos {
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string
  stock: number
  disponible: boolean
  categoria_id: number
}

export interface FiltrosProductos {
  skip: number
  limit: number
  search?: string
  categoria_id?: number
  disponible?: boolean
}

export interface ProductosPaginados {
  total: number
  items: Producto[]
}
