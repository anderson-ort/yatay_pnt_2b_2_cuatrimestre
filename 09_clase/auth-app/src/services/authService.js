import api from '@/services/api'
import profilesService from '@/services/profilesService'
import { guardarSesion, leerSesion, esPersistente } from '@/services/storage'
import { state, setSession, setPerfil, limpiarSesion } from '@/stores/authStore'

// Convierte la respuesta de Supabase en la sesión que guardamos
function armarSesion(data) {
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at ?? Math.floor(Date.now() / 1000) + data.expires_in,
    user: { id: data.user.id, email: data.user.email }
  }
}

function establecerSesion(data, recordar) {
  const sesion = armarSesion(data)
  guardarSesion(sesion, recordar)
  setSession(sesion)
}

async function cargarPerfil() {
  const perfil = await profilesService.obtener(state.session.user.id)
  setPerfil(perfil)
}

const vencida = (s) => s.expires_at * 1000 < Date.now() + 30_000 // margen de 30 s

async function refrescar() {
  const recordar = esPersistente() // se conserva el lugar donde estaba guardada
  const { data } = await api.post('/auth/v1/token?grant_type=refresh_token', {
    refresh_token: state.session.refresh_token
  })
  establecerSesion(data, recordar)
}

let promesaInicio = null

const authService = {
  async login(email, password, recordar = false) {
    const { data } = await api.post('/auth/v1/token?grant_type=password', { email, password })
    establecerSesion(data, recordar)
    try {
      await cargarPerfil()
    } catch (err) {
      limpiarSesion() // sin perfil no hay rol: no dejamos una sesión a medias
      throw err
    }
  },

  /**
   * Registro. Devuelve { sesionIniciada }:
   * - true  si Confirm email está desactivado (Supabase devuelve la sesión)
   * - false si hay que confirmar el correo antes de ingresar
   */
  async signup({ email, password, nombre }) {
    const { data } = await api.post('/auth/v1/signup', {
      email,
      password,
      data: { nombre } // user_metadata: solo datos cosméticos, nunca el rol
    })

    if (data.access_token) {
      establecerSesion(data, false)
      await cargarPerfil()
      return { sesionIniciada: true }
    }
    return { sesionIniciada: false }
  },

  async logout() {
    try {
      await api.post('/auth/v1/logout', null, { params: { scope: 'local' } })
    } catch {
      // Si el servidor no responde igual cerramos localmente
    } finally {
      limpiarSesion()
    }
  },

  /**
   * Restaura la sesión guardada al arrancar la app. Se ejecuta una sola vez.
   * El router espera a que termine antes de decidir permisos.
   */
  inicializar() {
    promesaInicio ??= (async () => {
      try {
        const guardada = leerSesion()
        if (guardada) {
          setSession(guardada)
          if (vencida(guardada)) await refrescar()
          await cargarPerfil() // el rol siempre se vuelve a pedir
        }
      } catch {
        limpiarSesion()
      } finally {
        state.listo = true
      }
    })()
    return promesaInicio
  }
}

export default authService
