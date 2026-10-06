import axios from 'axios'
import { state, limpiarSesion } from '@/stores/authStore'

const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const api = axios.create({
  baseURL: import.meta.env.VITE_SUPABASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = state.session?.access_token
  config.headers.apikey = ANON_KEY
  config.headers.Authorization = `Bearer ${token ?? ANON_KEY}`
  config._conSesion = !!token
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const esLogout = err.config?.url?.includes('/auth/v1/logout')
    if (err.response?.status === 401 && err.config?._conSesion && !esLogout) {
      limpiarSesion() // token vencido o inválido
    }
    return Promise.reject(err)
  }
)

const MENSAJES = {
  invalid_credentials: 'Email o contraseña incorrectos',
  user_already_exists: 'Ese email ya está registrado',
  weak_password: 'La contraseña es muy débil (mínimo 6 caracteres)',
  email_not_confirmed: 'Confirmá tu email antes de ingresar',
  over_email_send_rate_limit: 'Demasiados intentos. Esperá unos minutos'
}

export function extraerMensaje(err) {
  const d = err.response?.data
  if (d && typeof d === 'object') {
    if (MENSAJES[d.error_code]) return MENSAJES[d.error_code]
    if (d.code === '42501') return 'No tenés permisos para realizar esta acción'
    if (d.msg) return d.msg
    if (d.error_description) return d.error_description
    if (d.message) return d.message
  }
  if (err.code === 'ECONNABORTED') return 'La solicitud tardó demasiado'
  if (err.response?.status === 403) return 'No tenés permisos para esta acción'
  return err.message || 'Error inesperado'
}

export default api
