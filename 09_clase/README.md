# Autenticación y roles con Vue 3 + Supabase + Axios

Ejemplo base para clase: signup, login, logout, estado de sesión, almacenamiento en el navegador y perfiles de usuario (`admin`, `manager`, `user`) con rutas y vistas distintas según el rol.


Dependencias del frontend: `vue`, `vue-router` y `axios`. No se usa `supabase-js` ni Pinia a propósito, para que se vea qué pasa por debajo; al final de la Parte A se explica cuándo conviene pasar a esas herramientas.

---

# PARTE A: Contenido teórico

## A1. Conceptos base

| Concepto | Pregunta que responde | Dónde se resuelve |
|---|---|---|
| **Autenticación** | ¿Quién sos? | Supabase Auth (email + contraseña, devuelve un JWT) |
| **Autorización** | ¿Qué podés hacer? | Tabla `profiles` (rol) + políticas RLS en la base |
| **Sesión** | ¿Seguís siendo vos? | Tokens guardados en el navegador y enviados en cada request |

### Los dos tokens

| Token | Qué es | Duración típica | Para qué sirve |
|---|---|---|---|
| `access_token` | JWT firmado por Supabase | Corta (1 hora por defecto) | Se envía en `Authorization: Bearer ...` en cada llamada |
| `refresh_token` | Cadena opaca de un solo uso | Larga | Pedir un `access_token` nuevo sin volver a pedir la contraseña |

El JWT lleva adentro el id del usuario (`sub`) y su rol de Postgres (`authenticated`). Postgres lee eso para aplicar RLS. Por eso `auth.uid()` en una política es el id del usuario que mandó el token.

### Flujo completo

```
SIGNUP   formulario -> POST /auth/v1/signup -> Supabase crea el usuario en auth.users
                                            -> un TRIGGER crea la fila en public.profiles (rol = 'user')

LOGIN    formulario -> POST /auth/v1/token?grant_type=password -> access_token + refresh_token
                    -> se guardan en storage + store
                    -> GET /rest/v1/profiles?id=eq.<uid> -> se obtiene el ROL

NAVEGAR  router.beforeEach -> ¿hay sesión? ¿el rol alcanza para esta ruta?

DATOS    cada request lleva el access_token -> Postgres aplica RLS según el rol real de la base

LOGOUT   POST /auth/v1/logout -> se limpia storage + store
```

## A2. Endpoints de Supabase Auth que usamos

Todos viven bajo `https://<proyecto>.supabase.co/auth/v1` y requieren el header `apikey` (la `anon key`).

| Acción | Método y ruta | Body / parámetros | Respuesta |
|---|---|---|---|
| Registro | `POST /signup` | `{ email, password, data: { nombre } }` | Ver abajo |
| Login | `POST /token?grant_type=password` | `{ email, password }` | `access_token`, `refresh_token`, `expires_in`, `user` |
| Renovar sesión | `POST /token?grant_type=refresh_token` | `{ refresh_token }` | Sesión nueva |
| Logout | `POST /logout?scope=local` | Header `Authorization: Bearer <access_token>` | Sin contenido |

### Qué devuelve el signup (importante para la UI)

Depende de una opción del proyecto, **Confirm email**:

| Configuración | Respuesta del signup | Qué hace la app |
|---|---|---|
| Confirm email **activado** (por defecto) | Se devuelve el usuario pero **sin sesión** | Mostrar "Revisá tu correo para confirmar" |
| Confirm email **desactivado** | Se devuelve usuario **y sesión** | Dejar al usuario logueado directo |

Otros detalles que conviene conocer:

- Si el email ya está registrado y la confirmación está activa, Supabase devuelve un usuario "falso" en lugar de un error, para no revelar qué emails existen. Si la confirmación está desactivada, devuelve el error "User already registered".
- El campo `data` del signup se guarda en `user_metadata` y es **editable por el propio usuario**. Sirve para datos cosméticos (nombre), **nunca para el rol**.
- Los endpoints que envían correos (como `/signup`) tienen límites de envío por hora, y con el proveedor de correo incluido en Supabase son bajos. Para una clase con muchos alumnos registrándose, lo práctico es desactivar Confirm email (solo en entorno de práctica).
- Contraseña mínima por defecto: 6 caracteres.

### Alcance del logout

El parámetro `scope` define qué sesiones se cierran:

| `scope` | Efecto |
|---|---|
| `local` | Solo la sesión actual (este navegador) |
| `global` | Todas las sesiones del usuario, en todos los dispositivos |
| `others` | Todas menos la actual |

Aclaración: el `access_token` es un JWT que el servidor no consulta en cada request; sigue siendo técnicamente válido hasta que expire, aunque se haya hecho logout. El logout revoca los `refresh_token`, así que no se puede renovar. Por eso conviene que el `access_token` dure poco.

## A3. Dónde guardar la sesión en el navegador

| Opción | Persistencia | Ante un ataque XSS | Comentario |
|---|---|---|---|
| Memoria (variable/estado) | Se pierde al recargar la página | No hay nada en el storage para robar, pero el script malicioso igual puede usar la sesión mientras la página está abierta | Lo más seguro, pero hay que volver a loguearse al recargar |
| `sessionStorage` | Hasta cerrar la pestaña | Legible por cualquier JavaScript de la página | Ventana de exposición más corta |
| `localStorage` | Hasta que se borre explícitamente | Legible por cualquier JavaScript de la página | Cómodo; es lo que usa por defecto `supabase-js` |
| Cookie `HttpOnly` + `Secure` + `SameSite` | Configurable | JavaScript no la puede leer | Lo más robusto, pero requiere un servidor que la emita (en este esquema no hay) |

Idea clave: `sessionStorage` y `localStorage` tienen **la misma debilidad** (cualquier JavaScript que corra en tu página puede leerlos). La diferencia es solo cuánto dura el dato. Para tokens de larga duración se recomienda no depender de ellos, y el patrón más recomendado en producción es token de acceso en memoria más refresh token en cookie `HttpOnly`.

### Decisión para este proyecto

Para una clase introductoria se usa un enfoque simple y didáctico:

1. Casilla **"Mantener sesión iniciada"** en el login:
   - Marcada: se guarda en `localStorage` (sobrevive al cerrar el navegador).
   - Sin marcar: se guarda en `sessionStorage` (se borra al cerrar la pestaña).
2. Se guarda solo lo necesario: `access_token`, `refresh_token`, `expires_at` y datos mínimos del usuario.
3. **El rol NO se guarda en el storage.** Se vuelve a pedir a la base cada vez que arranca la app. Si se guardara, un usuario podría editar el storage del navegador y "creerse admin" en la interfaz. (Igual no podría hacer nada real gracias a RLS, pero es mejor no confiar en datos que el usuario controla.)
4. Prevención de XSS: Vue escapa por defecto el contenido de `{{ }}`; evitar `v-html` con datos de usuarios.

## A4. Estado en Vue: primer acercamiento

**Estado** = datos que cambian en el tiempo y que la interfaz refleja. Tipos:

| Tipo | Ejemplo | Dónde vive |
|---|---|---|
| Local de un componente | Texto de un input | `ref()` dentro del componente |
| Local de un composable | `loading` y `error` de una llamada | `ref()` dentro de la función del composable (una copia por componente) |
| **Compartido / global** | Sesión y perfil del usuario | Módulo con `reactive()` fuera de las funciones (una sola copia para toda la app) |

La sesión es compartida porque la necesitan a la vez el interceptor de Axios, el router, la barra de navegación y las vistas.

### Store mínimo sin librerías

Un archivo `authStore.js` que exporta:

- `state`: un `reactive({ session, perfil, listo })`.
- Getters: `computed` como `isAuthenticated`, `rol`, `esAdmin`.
- Mutaciones: funciones que modifican el estado (`setSession`, `limpiarSesion`).

Como el `reactive` está declarado a nivel de módulo, **todos los que lo importan comparten la misma instancia**. Es exactamente lo que hace Pinia por dentro, con más herramientas.

### Cuándo pasar a Pinia

Cuando haya varios stores, se necesite depurar con Vue Devtools, persistir con plugins o testear con facilidad. El patrón (state, getters, actions) es el mismo, así que el salto es corto.

### El estado `listo`

Al recargar la página, la sesión se restaura del storage y el perfil (con el rol) hay que pedirlo a la red. Durante ese lapso el rol es desconocido. Si el router decidiera en ese momento, un admin sería rechazado por error. Solución: una función `inicializar()` que corre una sola vez y el guard del router **espera** (`await`) a que termine. Regla: nunca decidir permisos mientras el estado de autenticación es desconocido.

## A5. Modelo de roles

### Roles y permisos del ejemplo

Jerarquía: `admin` > `manager` > `user`. Cada rol incluye lo del anterior.

| Acción | `user` | `manager` | `admin` |
|---|:---:|:---:|:---:|
| Ver productos | Sí | Sí | Sí |
| Crear y editar productos | No | Sí | Sí |
| Eliminar productos | No | No | Sí |
| Ver el dashboard | No | No | Sí |
| Ver usuarios y asignar roles | No | No | Sí |

(La consigna dice que el manager "solo puede editar productos"; se interpreta como crear y modificar, reservando el borrado al admin. Es una decisión de diseño fácil de cambiar en las políticas.)

### Dónde guardar el rol

| Lugar | ¿Seguro para roles? | Motivo |
|---|---|---|
| `user_metadata` (el `data` del signup) | **No** | El usuario puede modificarlo desde el cliente |
| `app_metadata` | Sí | Solo se escribe con la `service_role`; llega dentro del JWT |
| **Tabla `profiles` con columna `rol`** | **Sí (elegida)** | Simple de entender, se protege con RLS, se consulta con SQL normal |
| Claims personalizados en el JWT (Custom Access Token Hook) | Sí | Avanzado: evita una consulta extra, pero es más complejo; buen tema para una clase posterior |

### El patrón `profiles` + trigger

Supabase no permite agregar columnas a `auth.users`, así que se crea una tabla propia `public.profiles` con el mismo `id`:

1. `profiles.id` referencia a `auth.users(id)` con `ON DELETE CASCADE`.
2. Un **trigger** `AFTER INSERT` sobre `auth.users` inserta la fila de perfil automáticamente con `rol = 'user'`. El rol **nunca** se toma de lo que mande el cliente.
3. La función del trigger usa `SECURITY DEFINER` (se ejecuta con los permisos de su dueño, porque en ese momento no hay un usuario logueado consultando) y `SET search_path = ''` (buena práctica de seguridad: obliga a escribir los nombres completos, como `public.profiles`).
4. El primer `admin` se asigna manualmente con SQL. A partir de ahí, un admin puede promover a otros desde la app.

### Función auxiliar `mi_rol()`

Las políticas necesitan saber "¿qué rol tiene quien consulta?". Se encapsula en una función `SECURITY DEFINER` que lee `profiles` del usuario actual (`auth.uid()`):

- Evita repetir subconsultas en cada política.
- Evita la **recursión infinita** que ocurre si una política de `profiles` consulta la propia tabla `profiles` con RLS activo.

### Políticas resultantes

| Tabla | Operación | Quién |
|---|---|---|
| `profiles` | SELECT | Cada uno su fila; el admin todas |
| `profiles` | UPDATE | Solo admin (así nadie puede auto-promoverse) |
| `profiles` | INSERT / DELETE | Nadie desde la API (INSERT lo hace el trigger; DELETE en cascada) |
| `productos` | SELECT | Público |
| `productos` | INSERT / UPDATE | `admin` y `manager` |
| `productos` | DELETE | Solo `admin` |

## A6. Router: guards por rol

Cada ruta declara en `meta` qué necesita:

```js
{ path: '/dashboard', meta: { requiresAuth: true, rolMinimo: 'admin' } }
```

Un único guard global `beforeEach` (en Vue Router 4 se decide devolviendo un valor, sin llamar a `next()`):

1. Esperar a que la autenticación esté inicializada.
2. Si la ruta es solo para invitados (login/signup) y ya hay sesión, ir al inicio.
3. Si la ruta exige sesión y no hay, ir a `/login` guardando a dónde quería ir (`redirect`).
4. Si exige un rol mínimo y el rol no alcanza, ir a `/no-autorizado` (mejor que redirigir en silencio: el usuario entiende qué pasó).

Principio que hay que repetir en clase: **un guard controla la navegación, no protege datos.** El código del frontend lo controla quien usa el navegador. La barrera real está en RLS. Un `v-if="esAdmin"` oculta un botón; la política RLS impide la operación aunque alguien la dispare a mano con `curl`.

## A7. Composables y servicios: reparto de responsabilidades

| Archivo | Responsabilidad |
|---|---|
| `storage.js` | Leer/escribir/borrar la sesión en `localStorage` o `sessionStorage` |
| `authStore.js` | Estado compartido y getters (sin llamadas HTTP) |
| `api.js` | Instancia de Axios, interceptores y traducción de errores |
| `authService.js` | Casos de uso de autenticación: login, signup, logout, inicializar, refrescar |
| `profilesService.js` / `productosService.js` | Llamadas HTTP a las tablas |
| `useAuth.js` | Envuelve al servicio con `loading` y `error` y expone el estado a los componentes |
| `useProductos.js`, `useUsuarios.js`, `useDashboard.js` | Estado y acciones de cada pantalla |
| Vistas | Mostrar y capturar eventos; nunca llaman a Axios |

Dependencias sin ciclos: `api.js` importa el store; el store no importa nada de red; `authService` importa ambos. Si dos módulos se importan entre sí hay un ciclo y aparecen errores confusos, por eso el store se mantiene "puro".

## A8. Interfaz distinta según el rol

Dos niveles, que se complementan:

1. **Rutas**: el guard impide entrar a `/dashboard` o `/usuarios` si no sos admin.
2. **Elementos de una página**: `v-if` con getters del store (`puedeEditar`, `esAdmin`) para mostrar u ocultar botones y enlaces.

Para no repetir comparaciones de strings por todo el código, los permisos se centralizan en getters con nombre de intención (`puedeEditar`, `puedeEliminar`). Si mañana la regla cambia, se modifica en un solo lugar.

## A9. Sesión vencida y renovación

- Al arrancar la app: si el `access_token` guardado venció (o está por vencer), se intenta renovar con el `refresh_token`. Si falla, se limpia la sesión.
- Durante el uso: si una llamada devuelve `401` estando logueado, el interceptor limpia la sesión; la app detecta que ya no hay sesión y redirige a `/login`.
- Mejora para clase avanzada: renovar automáticamente antes del vencimiento (temporizador) o reintentar la request tras refrescar.

## A10. Checklist de seguridad

- El rol vive en `profiles` y solo un admin puede cambiarlo (política `UPDATE`).
- El trigger asigna `user` siempre; no se lee ningún rol del signup.
- No se lee el rol desde `user_metadata`.
- Toda decisión importante está duplicada en RLS; la interfaz solo es comodidad.
- Nunca poner la `service_role` en el frontend.
- No guardar el rol en el storage.
- Evitar `v-html` con contenido de usuarios (XSS).
- Mensajes de error genéricos para el login (no indicar si falló el email o la contraseña).
- Un admin no debe poder quitarse el rol a sí mismo por accidente (la interfaz lo bloquea).

## A11. Ejercicios para la clase

1. Cambiar la regla: que el `manager` también pueda eliminar, modificando solo la política SQL, y comprobar el cambio sin tocar el frontend.
2. Reemplazar `authStore.js` por un store de Pinia manteniendo la misma API.
3. Renovar el token automáticamente antes de que venza.
4. Agregar un cuarto rol (`viewer` sin acceso a la lista de usuarios) y reflejarlo en la jerarquía.
5. Probar con `curl` que un `user` no puede cambiar su propio rol ni insertar productos, y explicar por qué una operación da error y la otra devuelve `[]`.
6. Migrar el rol a un claim del JWT con un Custom Access Token Hook.
