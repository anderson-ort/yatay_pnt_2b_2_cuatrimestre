import api from '@/services/api'
import { ROLES } from '@/config/roles'

const TABLA = '/rest/v1/profiles'

const profilesService = {
  /** Perfil de un usuario (incluye el rol). */
  async obtener(id) {
    const { data } = await api.get(TABLA, {
      params: { id: `eq.${id}`, select: 'id,email,nombre,rol' },
      headers: { Accept: 'application/vnd.pgrst.object+json' } // devuelve un objeto, no un array
    })
    return data
  },

  /** Lista de perfiles (solo un admin ve a todos; RLS filtra para el resto). */
  async listar() {
    const { data } = await api.get(TABLA, {
      params: { select: 'id,email,nombre,rol,creado_en', order: 'creado_en.asc' }
    })
    return data
  },

  async cambiarRol(id, nuevoRol) {
    if (!Object.values(ROLES).includes(nuevoRol)) throw new Error('Rol inválido')
    const { data } = await api.patch(
      TABLA,
      { rol: nuevoRol },
      { params: { id: `eq.${id}` }, headers: { Prefer: 'return=representation' } }
    )
    // Si RLS bloquea el UPDATE no hay error: simplemente vuelve []
    if (!data.length) throw new Error('No se pudo cambiar el rol (¿sos admin?)')
    return data[0]
  }
}

export default profilesService
