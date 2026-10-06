import api from '@/services/api'

const TABLA = '/rest/v1/productos'
const STOCK_BAJO = 10

function preparar(f) {
  const producto = {
    nombre: String(f.nombre ?? '').trim(),
    categoria: f.categoria?.trim().toLowerCase() || null,
    precio: Number(f.precio),
    stock: Number(f.stock ?? 0)
  }
  if (!producto.nombre) throw new Error('El nombre es obligatorio')
  if (!Number.isFinite(producto.precio) || producto.precio < 0) throw new Error('Precio inválido')
  if (!Number.isInteger(producto.stock) || producto.stock < 0) throw new Error('Stock inválido')
  return producto
}

const productosService = {
  async listar() {
    const { data } = await api.get(TABLA, { params: { select: '*', order: 'nombre.asc' } })
    return data
  },

  async crear(datos) {
    const { data } = await api.post(TABLA, preparar(datos), {
      headers: { Prefer: 'return=representation' }
    })
    return data[0]
  },

  async actualizar(id, datos) {
    const { data } = await api.patch(TABLA, preparar(datos), {
      params: { id: `eq.${id}` },
      headers: { Prefer: 'return=representation' }
    })
    if (!data.length) throw new Error('No se pudo actualizar (permisos insuficientes)')
    return data[0]
  },

  async eliminar(id) {
    const { data } = await api.delete(TABLA, {
      params: { id: `eq.${id}` },
      headers: { Prefer: 'return=representation' }
    })
    if (!data.length) throw new Error('No se pudo eliminar (permisos insuficientes)')
  },

  /** Números para el dashboard (con pocos productos alcanza; PostgREST limita las filas por respuesta). */
  async estadisticas() {
    const { data } = await api.get(TABLA, { params: { select: 'precio,stock' } })
    return {
      total: data.length,
      sinStock: data.filter((p) => p.stock === 0).length,
      stockBajo: data.filter((p) => p.stock > 0 && p.stock < STOCK_BAJO).length,
      valorInventario: data.reduce((acc, p) => acc + Number(p.precio) * p.stock, 0)
    }
  }
}

export default productosService
