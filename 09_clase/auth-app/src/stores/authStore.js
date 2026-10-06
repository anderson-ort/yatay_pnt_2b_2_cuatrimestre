import { reactive, computed } from 'vue'
import { limpiarStorage } from '@/services/storage'
import { ROLES, tieneRol } from '@/config/roles'

// Estado compartido
export const state = reactive({
  session: null, // { access_token, refresh_token, expires_at, user: { id, email } }
  perfil: null,  // { id, email, nombre, rol }  (NO se guarda en el storage)
  listo: false   // true cuando terminó la inicialización al arrancar la app
})

// Getters
export const isAuthenticated = computed(() => !!state.session?.access_token)
export const rol = computed(() => state.perfil?.rol ?? null)
export const esAdmin = computed(() => rol.value === ROLES.ADMIN)
export const puedeEditar = computed(() => tieneRol(rol.value, ROLES.MANAGER))
export const puedeEliminar = computed(() => tieneRol(rol.value, ROLES.ADMIN))

// Mutaciones
export function setSession(session) {
  state.session = session
}

export function setPerfil(perfil) {
  state.perfil = perfil
}

export function limpiarSesion() {
  state.session = null
  state.perfil = null
  limpiarStorage()
}
