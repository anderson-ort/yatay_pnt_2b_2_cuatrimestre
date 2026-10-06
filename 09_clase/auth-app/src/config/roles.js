export const ROLES = Object.freeze({
  USER: 'user',
  MANAGER: 'manager',
  ADMIN: 'admin'
})

// De menor a mayor poder
export const JERARQUIA = Object.freeze([ROLES.USER, ROLES.MANAGER, ROLES.ADMIN])

/**
 * ¿El rol actual alcanza el mínimo pedido?
 * Si el rol es desconocido (null/undefined), devuelve false.
 */

const NIVEL = Object.freeze({user:0, manager:1,admin:2})

export const tieneRol = (actual,minimo) => actual in NIVEL && minimo in NIVEL && NIVEL[actual] >= NIVEL[minimo]
