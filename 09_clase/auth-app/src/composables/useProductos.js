import { ref } from 'vue'
import { extraerMensaje } from '@/services/api'

export function useProductos(service) {
  const productos = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function ejecutar(accion, recargar = true) {
    loading.value = true
    error.value = null
    try {
      await accion()
      if (recargar) productos.value = await service.listar()
      return true
    } catch (err) {
      error.value = extraerMensaje(err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    productos,
    loading,
    error,
    cargar: () => ejecutar(async () => {}),
    crear: (datos) => ejecutar(() => service.crear(datos)),
    actualizar: (id, datos) => ejecutar(() => service.actualizar(id, datos)),
    eliminar: (id) => ejecutar(() => service.eliminar(id))
  }
}
