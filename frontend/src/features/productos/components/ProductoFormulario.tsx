import type { Categoria } from '../../categorias/types'
import type { Producto, ProductoDatos } from '../types'
import { Formulario } from '../../../shared/components/Formulario'

export function ProductoFormulario({
  producto,
  categorias,
  guardar,
}: {
  producto: Producto | null
  categorias: Categoria[]
  guardar: (datos: ProductoDatos) => Promise<void>
}) {
  const opciones = [...categorias]
  // Un producto puede conservar su categoría aunque esta se haya dado de baja.
  if (producto && !opciones.some((c) => c.id === producto.categoria_id))
    opciones.push(producto.categoria)
  return (
    <Formulario
      iniciales={{
        nombre: producto?.nombre ?? '',
        descripcion: producto?.descripcion ?? '',
        precio_base: String(producto?.precio_base ?? 0),
        stock: String(producto?.stock ?? 0),
        imagen_url: producto?.imagen_url ?? '',
        disponible: String(producto?.disponible ?? true),
        categoria_id: String(producto?.categoria_id ?? categorias[0]?.id ?? ''),
      }}
      campos={[
        { nombre: 'nombre', etiqueta: 'Nombre', requerido: true },
        { nombre: 'descripcion', etiqueta: 'Descripción', tipo: 'textarea' },
        {
          nombre: 'precio_base',
          etiqueta: 'Precio',
          tipo: 'number',
          min: 0,
          step: '0.01',
          requerido: true,
        },
        { nombre: 'imagen_url', etiqueta: 'URL de imagen', tipo: 'url' },
        { nombre: 'stock', etiqueta: 'Stock', tipo: 'number', min: 0, step: '1', requerido: true },
        {
          nombre: 'categoria_id',
          etiqueta: 'Categoría',
          tipo: 'select',
          requerido: true,
          opciones: opciones.map((c) => ({
            valor: String(c.id),
            texto: c.nombre + (c.activo ? '' : ' (inactiva)'),
          })),
        },
        {
          nombre: 'disponible',
          etiqueta: 'Disponibilidad',
          tipo: 'select',
          opciones: [
            { valor: 'true', texto: 'Disponible' },
            { valor: 'false', texto: 'No disponible' },
          ],
        },
      ]}
      enviar={async (datos) =>
        guardar({
          nombre: datos.nombre,
          descripcion: datos.descripcion || null,
          imagen_url: datos.imagen_url,
          precio_base: Number(datos.precio_base),
          stock: Number(datos.stock),
          categoria_id: Number(datos.categoria_id),
          disponible: datos.disponible === 'true',
        })
      }
    />
  )
}
