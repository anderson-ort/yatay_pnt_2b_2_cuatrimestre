import { ref } from 'vue'
import profilesService from '@/services/profilesService'
import { extraerMensaje } from '@/services/api'

export function useUsuarios() {
  const usuarios = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function cargar() {
    loading.value = true
    error.value = null
    try {
      usuarios.value = await profilesService.listar()
    } catch (err) {
      error.value = extraerMensaje(err)
    } finally {
      loading.value = false
    }
  }

  async function cambiarRol(id, nuevoRol) {
    error.value = null
    try {
      await profilesService.cambiarRol(id, nuevoRol)
      await cargar()
    } catch (err) {
      error.value = extraerMensaje(err)
      await cargar() // vuelve a mostrar el valor real
    }
  }

  return { usuarios, loading, error, cargar, cambiarRol }
}
