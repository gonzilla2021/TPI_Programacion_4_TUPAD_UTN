import { useState } from 'react'
import { useProductos } from '../hooks/useProductos'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoCard } from '../components/ProductoCard'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { EstadoError } from '../../../shared/components/EstadoError'

export function CatalogoPage() {
  const [search, setSearch] = useState('')
  const [categoria, setCategoria] = useState('')
  const [pagina, setPagina] = useState(0)
  const limite = 12
  const productos = useProductos({
    skip: pagina * limite,
    limit: limite,
    search,
    categoria_id: categoria ? Number(categoria) : undefined,
  })
  const categorias = useCategorias()
  return (
    <>
      <section className="hero">
        <p className="eyebrow">FOOD STORE</p>
        <h1>Elegí tu próxima comida.</h1>
        <p>Armá tu carrito y confirmá el pedido con tu dirección de entrega.</p>
      </section>
      <div className="filters">
        <label>
          Buscar producto
          <input
            type="search"
            placeholder="Nombre del producto"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPagina(0)
            }}
          />
        </label>
        <label>
          Categoría
          <select
            value={categoria}
            onChange={(e) => {
              setCategoria(e.target.value)
              setPagina(0)
            }}
          >
            <option value="">Todas las categorías</option>
            {categorias.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>
      {categorias.isError && <EstadoError error={categorias.error} />}
      {productos.isPending ? (
        <Skeleton />
      ) : productos.isError ? (
        <EstadoError error={productos.error} />
      ) : (
        <>
          {productos.data.items.length === 0 ? (
            <EstadoVacio />
          ) : (
            <div className="product-grid">
              {productos.data.items.map((p) => (
                <ProductoCard key={p.id} producto={p} />
              ))}
            </div>
          )}
          <Paginacion
            pagina={pagina}
            total={productos.data.total}
            limite={limite}
            cambiar={setPagina}
          />
        </>
      )}
    </>
  )
}
