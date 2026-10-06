import { ref, computed } from 'vue'
import authService from '@/services/authService'
import { extraerMensaje } from '@/services/api'
import {
  state, isAuthenticated, rol, esAdmin, puedeEditar, puedeEliminar
} from '@/stores/authStore'

export function useAuth() {
  const loading = ref(false)
  const error = ref(null)

  async function ejecutar(accion) {
    loading.value = true
    error.value = null
    try {
      return { ok: true, data: await accion() }
    } catch (err) {
      error.value = extraerMensaje(err)
      return { ok: false }
    } finally {
      loading.value = false
    }
  }

  const login = (email, password, recordar) =>
    ejecutar(() => authService.login(email, password, recordar))

  const signup = (datos) => ejecutar(() => authService.signup(datos))

  const logout = () => ejecutar(() => authService.logout())

  return {
    // estado compartido (solo lectura para los componentes)
    usuario: computed(() => state.session?.user ?? null),
    perfil: computed(() => state.perfil),
    isAuthenticated, rol, esAdmin, puedeEditar, puedeEliminar,
    // estado local de la pantalla
    loading, error,
    // acciones
    login, signup, logout
  }
}
