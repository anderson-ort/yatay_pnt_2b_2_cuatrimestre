const KEY = 'auth.session'

/** Guarda la sesión. Si recordar es true va a localStorage, si no a sessionStorage. */
export function guardarSesion(sesion, recordar) {
  limpiarStorage()
  const destino = recordar ? localStorage : sessionStorage
  destino.setItem(KEY, JSON.stringify(sesion))
}

/** Lee la sesión desde donde esté guardada. */
export function leerSesion() {
  const raw = sessionStorage.getItem(KEY) ?? localStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null // dato corrupto: se ignora
  }
}

/** ¿La sesión actual está guardada de forma persistente? */
export function esPersistente() {
  return localStorage.getItem(KEY) !== null
}

export function limpiarStorage() {
  localStorage.removeItem(KEY)
  sessionStorage.removeItem(KEY)
}
