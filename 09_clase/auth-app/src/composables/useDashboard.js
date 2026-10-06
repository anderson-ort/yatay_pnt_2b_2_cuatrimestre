import { ref } from 'vue'
import productosService from '@/services/productosService'
import profilesService from '@/services/profilesService'
import { extraerMensaje } from '@/services/api'
import { ROLES } from '@/config/roles'

export function useDashboard() {
  const productos = ref(null)
  const usuariosPorRol = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function cargar() {
    loading.value = true
    error.value = null
    try {
      const [stats, perfiles] = await Promise.all([
        productosService.estadisticas(),
        profilesService.listar()
      ])
      productos.value = stats
      usuariosPorRol.value = Object.values(ROLES).reduce((acc, r) => {
        acc[r] = perfiles.filter((p) => p.rol === r).length
        return acc
      }, {})
    } catch (err) {
      error.value = extraerMensaje(err)
    } finally {
      loading.value = false
    }
  }

  return { productos, usuariosPorRol, loading, error, cargar }
}
