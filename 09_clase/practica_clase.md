## B1. Configurar Supabase para la práctica

1. En el panel: **Authentication**, proveedor **Email** (la ubicación exacta del menú puede variar según la versión del panel). Verificá que el registro por email esté habilitado.
2. Para la clase, desactivá **Confirm email**, así el signup devuelve la sesión directamente. En producción se deja activado; el código ya contempla ambos casos.
3. Copiá la URL del proyecto y la `anon key` desde **Project Settings, API**.

## B2. Base de datos

### Archivo `supabase/migrations/20260102000000_auth_roles.sql`

Se puede pegar completo en el **SQL Editor** de Supabase. Es re-ejecutable.

```sql
-- =========================================================
-- 1) Tabla de perfiles (extiende auth.users con el rol)
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  nombre text,
  rol text not null default 'user' check (rol in ('admin', 'manager', 'user')),
  creado_en timestamptz default now()
);

alter table public.profiles enable row level security;

-- =========================================================
-- 2) Trigger: crear el perfil automáticamente al registrarse
--    El rol SIEMPRE es 'user' (default); no se lee del cliente.
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, nombre)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Usuarios que ya existían antes de este script
insert into public.profiles (id, email, nombre)
select id, email, split_part(email, '@', 1)
from auth.users
on conflict (id) do nothing;

-- =========================================================
-- 3) Función auxiliar: rol del usuario que está consultando
--    SECURITY DEFINER evita la recursión de RLS sobre profiles.
-- =========================================================
create or replace function public.mi_rol()
returns text
language sql
stable
security definer set search_path = ''
as $$
  select rol from public.profiles where id = auth.uid()
$$;

-- =========================================================
-- 4) Políticas de profiles
-- =========================================================
drop policy if exists "Ver perfil propio o todos si es admin" on public.profiles;
create policy "Ver perfil propio o todos si es admin"
on public.profiles for select
using (id = auth.uid() or public.mi_rol() = 'admin');

drop policy if exists "Solo admin cambia roles" on public.profiles;
create policy "Solo admin cambia roles"
on public.profiles for update
using (public.mi_rol() = 'admin')
with check (public.mi_rol() = 'admin');

-- (Sin políticas de INSERT/DELETE: el alta la hace el trigger y la baja es en cascada)

-- =========================================================
-- 5) Políticas de productos por rol
-- =========================================================
-- Se reemplazan las políticas "solo autenticado" del esquema histórico.
drop policy if exists "Insercion solo autenticada" on public.productos;
drop policy if exists "Actualizacion solo autenticada" on public.productos;
drop policy if exists "Borrado solo autenticado" on public.productos;
drop policy if exists "Insercion admin y manager" on public.productos;
drop policy if exists "Actualizacion admin y manager" on public.productos;
drop policy if exists "Borrado solo admin" on public.productos;

-- La política "Lectura publica de productos" se mantiene tal cual.

create policy "Insercion admin y manager"
on public.productos for insert
with check (public.mi_rol() in ('admin', 'manager'));

create policy "Actualizacion admin y manager"
on public.productos for update
using (public.mi_rol() in ('admin', 'manager'))
with check (public.mi_rol() in ('admin', 'manager'));

create policy "Borrado solo admin"
on public.productos for delete
using (public.mi_rol() = 'admin');
```

### Convertirte en el primer admin

Primero registrate desde la app (o creá el usuario en el panel) y después, en el SQL Editor:

```sql
update public.profiles set rol = 'admin' where email = 'tu@email.com';
```

El SQL Editor se ejecuta con privilegios elevados, por eso este `UPDATE` funciona aunque todavía no haya ningún admin.

## B3. Crear el proyecto

```bash
npm create vite@latest auth-roles -- --template vue
cd auth-roles
npm install
npm install axios vue-router
```

Estructura final:

```bash
auth-roles/
├── .env
├── vite.config.js
└── src/
    ├── main.js
    ├── App.vue
    ├── assets/main.css
    ├── config/
    │   └── roles.js
    ├── stores/
    │   └── authStore.js
    ├── services/
    │   ├── storage.js
    │   ├── api.js
    │   ├── authService.js
    │   ├── profilesService.js
    │   └── productosService.js
    ├── composables/
    │   ├── useAuth.js
    │   ├── useProductos.js
    │   ├── useUsuarios.js
    │   └── useDashboard.js
    ├── router/
    │   └── index.js
    └── views/
        ├── LoginView.vue
        ├── SignupView.vue
        ├── ProductosView.vue
        ├── DashboardView.vue
        ├── UsuariosView.vue
        └── NoAutorizadoView.vue
```

### Archivo `.env`

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon
```

Agregar `.env` al `.gitignore`. Nunca poner acá la `service_role`.

### Archivo `vite.config.js`

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  }
})
```

### Archivo `src/main.js`

```js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

createApp(App).use(router).mount('#app')
```

## B4. Configuración de roles

### Archivo `src/config/roles.js`

Fuente única de verdad de los roles y su jerarquía. La posición en el array es el "nivel".

```js
export const ROLES = {
  USER: 'user',
  MANAGER: 'manager',
  ADMIN: 'admin'
}

// De menor a mayor poder
export const JERARQUIA = [ROLES.USER, ROLES.MANAGER, ROLES.ADMIN]

/**
 * ¿El rol actual alcanza el mínimo pedido?
 * Si el rol es desconocido (null/undefined), devuelve false.
 */
export function tieneRol(rolActual, rolMinimo) {
  const actual = JERARQUIA.indexOf(rolActual)
  const minimo = JERARQUIA.indexOf(rolMinimo)
  return actual !== -1 && minimo !== -1 && actual >= minimo
}
```

## B5. Estado y almacenamiento

### Archivo `src/services/storage.js`

Guarda la sesión en `localStorage` (si el usuario eligió "mantener sesión") o en `sessionStorage` (si no). No depende de nada más.

```js
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
```

### Archivo `src/stores/authStore.js`

Store mínimo sin librerías. Como `state` está fuera de cualquier función, es compartido por toda la app. Solo contiene estado y reglas de permisos; **no hace llamadas HTTP**.

```js
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
```

## B6. Servicios

### Archivo `src/services/api.js`

Instancia de Axios. El interceptor de request pone `apikey` y el token del usuario (o la `anon key` si no hay sesión). El de response limpia la sesión ante un `401`. `extraerMensaje` traduce los errores de Auth y PostgREST.

```js
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
```

### Archivo `src/services/profilesService.js`

```js
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
```

### Archivo `src/services/authService.js`

Aquí vive la lógica de autenticación (login, signup, logout, restaurar sesión). Coordina Axios, storage y store.

```js
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
```

### Archivo `src/services/productosService.js`

Versión reducida del CRUD (el completo, con paginación y filtros, está en el material anterior). Sirve para mostrar cómo los permisos los termina decidiendo la base.

```js
import api from '@/services/api'

const TABLA = '/rest/v1/productos'
const STOCK_BAJO = 10

function preparar(f) {
  const producto = {
    nombre: String(f.nombre ?? '').trim(),
    categoria: f.categoria?.trim().toLowerCase() || null,
    precio: Number(f.precio),
    stock: Number(f.stock ?? 0)
  }
  if (!producto.nombre) throw new Error('El nombre es obligatorio')
  if (!Number.isFinite(producto.precio) || producto.precio < 0) throw new Error('Precio inválido')
  if (!Number.isInteger(producto.stock) || producto.stock < 0) throw new Error('Stock inválido')
  return producto
}

const productosService = {
  async listar() {
    const { data } = await api.get(TABLA, { params: { select: '*', order: 'nombre.asc' } })
    return data
  },

  async crear(datos) {
    const { data } = await api.post(TABLA, preparar(datos), {
      headers: { Prefer: 'return=representation' }
    })
    return data[0]
  },

  async actualizar(id, datos) {
    const { data } = await api.patch(TABLA, preparar(datos), {
      params: { id: `eq.${id}` },
      headers: { Prefer: 'return=representation' }
    })
    if (!data.length) throw new Error('No se pudo actualizar (permisos insuficientes)')
    return data[0]
  },

  async eliminar(id) {
    const { data } = await api.delete(TABLA, {
      params: { id: `eq.${id}` },
      headers: { Prefer: 'return=representation' }
    })
    if (!data.length) throw new Error('No se pudo eliminar (permisos insuficientes)')
  },

  /** Números para el dashboard (con pocos productos alcanza; PostgREST limita las filas por respuesta). */
  async estadisticas() {
    const { data } = await api.get(TABLA, { params: { select: 'precio,stock' } })
    return {
      total: data.length,
      sinStock: data.filter((p) => p.stock === 0).length,
      stockBajo: data.filter((p) => p.stock > 0 && p.stock < STOCK_BAJO).length,
      valorInventario: data.reduce((acc, p) => acc + Number(p.precio) * p.stock, 0)
    }
  }
}

export default productosService
```

## B7. Composables

### Archivo `src/composables/useAuth.js`

Envuelve al servicio con `loading` y `error` (estado local de cada pantalla) y expone el estado compartido y los permisos.

```js
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
```

### Archivo `src/composables/useProductos.js`

```js
import { ref } from 'vue'
import { extraerMensaje } from '@/services/api'

export function useProductos(service) {
  const productos = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function ejecutar(accion) {
    loading.value = true
    error.value = null
    try {
      await accion()
      return true
    } catch (err) {
      error.value = extraerMensaje(err)
      return false
    } finally {
      loading.value = false
    }
  }

  const cargar = () => ejecutar(async () => { productos.value = await service.listar() })

  async function crear(datos) {
    const ok = await ejecutar(() => service.crear(datos))
    if (ok) await cargar()
    return ok
  }

  async function actualizar(id, datos) {
    const ok = await ejecutar(() => service.actualizar(id, datos))
    if (ok) await cargar()
    return ok
  }

  async function eliminar(id) {
    const ok = await ejecutar(() => service.eliminar(id))
    if (ok) await cargar()
    return ok
  }

  return { productos, loading, error, cargar, crear, actualizar, eliminar }
}
```

### Archivo `src/composables/useUsuarios.js`

```js
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
```

### Archivo `src/composables/useDashboard.js`

```js
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
```

## B8. Router

### Archivo `src/router/index.js`

El guard espera la inicialización, y después valida sesión y rol mínimo según el `meta` de cada ruta.

```js
import { createRouter, createWebHistory } from 'vue-router'
import authService from '@/services/authService'
import { isAuthenticated, rol } from '@/stores/authStore'
import { tieneRol, ROLES } from '@/config/roles'

import ProductosView from '@/views/ProductosView.vue'
import LoginView from '@/views/LoginView.vue'
import SignupView from '@/views/SignupView.vue'
import DashboardView from '@/views/DashboardView.vue'
import UsuariosView from '@/views/UsuariosView.vue'
import NoAutorizadoView from '@/views/NoAutorizadoView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Públicas
    { path: '/', name: 'productos', component: ProductosView },
    { path: '/login', name: 'login', component: LoginView, meta: { soloInvitados: true } },
    { path: '/signup', name: 'signup', component: SignupView, meta: { soloInvitados: true } },
    { path: '/no-autorizado', name: 'no-autorizado', component: NoAutorizadoView },

    // Solo admin
    {
      path: '/dashboard', name: 'dashboard', component: DashboardView,
      meta: { requiresAuth: true, rolMinimo: ROLES.ADMIN }
    },
    {
      path: '/usuarios', name: 'usuarios', component: UsuariosView,
      meta: { requiresAuth: true, rolMinimo: ROLES.ADMIN }
    },

    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach(async (to) => {
  // 1) Nunca decidir permisos mientras la autenticación es desconocida
  await authService.inicializar()

  // 2) Login/signup no tienen sentido si ya hay sesión
  if (to.meta.soloInvitados && isAuthenticated.value) {
    return { name: 'productos' }
  }

  // 3) Rutas que exigen sesión
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // 4) Rutas que exigen un rol mínimo
  if (to.meta.rolMinimo && !tieneRol(rol.value, to.meta.rolMinimo)) {
    return { name: 'no-autorizado' }
  }
})

export default router
```

## B9. Vistas

### Archivo `src/App.vue`

La barra de navegación muestra enlaces distintos según el rol. También redirige a login si la sesión se pierde (por ejemplo, token vencido) estando en una ruta protegida.

```vue
<script setup>
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { state } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const { usuario, perfil, isAuthenticated, esAdmin, logout } = useAuth()

async function salir() {
  await logout()
  router.push({ name: 'productos' })
}

// Si la sesión desaparece (401) en una ruta protegida, se vuelve al login
watch(
  () => state.session,
  (sesion) => {
    if (!sesion && route.meta.requiresAuth) {
      router.push({ name: 'login', query: { redirect: route.fullPath } })
    }
  }
)
</script>

<template>
  <header class="barra">
    <strong>Inventario</strong>

    <nav>
      <RouterLink to="/">Productos</RouterLink>
      <!-- Solo admin -->
      <RouterLink v-if="esAdmin" to="/dashboard">Dashboard</RouterLink>
      <RouterLink v-if="esAdmin" to="/usuarios">Usuarios</RouterLink>
    </nav>

    <div class="sesion">
      <template v-if="isAuthenticated">
        <span>
          {{ perfil?.nombre ?? usuario?.email }}
          <span v-if="perfil" class="etiqueta">{{ perfil.rol }}</span>
        </span>
        <button class="secundario" @click="salir">Salir</button>
      </template>
      <template v-else>
        <RouterLink to="/login">Ingresar</RouterLink>
        <RouterLink to="/signup">Registrarme</RouterLink>
      </template>
    </div>
  </header>

  <main class="contenedor">
    <RouterView />
  </main>
</template>
```

### Archivo `src/views/LoginView.vue`

Incluye la casilla que decide entre `localStorage` y `sessionStorage`.

```vue
<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { login, loading, error } = useAuth()

const email = ref('')
const password = ref('')
const recordar = ref(false)

async function enviar() {
  const { ok } = await login(email.value.trim(), password.value, recordar.value)
  if (ok) router.push(route.query.redirect || '/')
}
</script>

<template>
  <section class="tarjeta angosta">
    <h2>Ingresar</h2>
    <form @submit.prevent="enviar">
      <label>Email
        <input v-model="email" type="email" required autocomplete="username" />
      </label>
      <label>Contraseña
        <input v-model="password" type="password" required autocomplete="current-password" />
      </label>
      <label class="check">
        <input v-model="recordar" type="checkbox" />
        Mantener sesión iniciada en este dispositivo
      </label>

      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" :disabled="loading">{{ loading ? 'Ingresando...' : 'Ingresar' }}</button>
    </form>
    <p class="chico">¿No tenés cuenta? <RouterLink to="/signup">Registrate</RouterLink></p>
  </section>
</template>
```

### Archivo `src/views/SignupView.vue`

Contempla los dos escenarios: sesión inmediata o confirmación pendiente por correo.

```vue
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { signup, loading, error } = useAuth()

const nombre = ref('')
const email = ref('')
const password = ref('')
const repetir = ref('')
const errorLocal = ref(null)
const confirmacionPendiente = ref(false)

async function enviar() {
  errorLocal.value = null
  if (password.value.length < 6) {
    errorLocal.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }
  if (password.value !== repetir.value) {
    errorLocal.value = 'Las contraseñas no coinciden'
    return
  }

  const { ok, data } = await signup({
    nombre: nombre.value.trim(),
    email: email.value.trim(),
    password: password.value
  })

  if (!ok) return
  if (data.sesionIniciada) router.push('/')
  else confirmacionPendiente.value = true
}
</script>

<template>
  <section class="tarjeta angosta">
    <h2>Crear cuenta</h2>

    <div v-if="confirmacionPendiente">
      <p>Te enviamos un correo a <strong>{{ email }}</strong>. Confirmalo para poder ingresar.</p>
      <RouterLink to="/login">Ir a ingresar</RouterLink>
    </div>

    <form v-else @submit.prevent="enviar">
      <label>Nombre
        <input v-model="nombre" required />
      </label>
      <label>Email
        <input v-model="email" type="email" required autocomplete="username" />
      </label>
      <label>Contraseña
        <input v-model="password" type="password" required autocomplete="new-password" />
      </label>
      <label>Repetir contraseña
        <input v-model="repetir" type="password" required autocomplete="new-password" />
      </label>

      <p v-if="errorLocal || error" class="error">{{ errorLocal || error }}</p>
      <button type="submit" :disabled="loading">{{ loading ? 'Creando...' : 'Crear cuenta' }}</button>
      <p class="chico">Las cuentas nuevas empiezan con el rol "user".</p>
    </form>
  </section>
</template>
```

### Archivo `src/views/ProductosView.vue`

Todos ven la lista. Los botones cambian según el permiso: `puedeEditar` (manager y admin) y `puedeEliminar` (solo admin).

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { useProductos } from '@/composables/useProductos'
import { useAuth } from '@/composables/useAuth'
import productosService from '@/services/productosService'

const { productos, loading, error, cargar, crear, actualizar, eliminar } = useProductos(productosService)
const { puedeEditar, puedeEliminar } = useAuth()

const vacio = () => ({ nombre: '', categoria: '', precio: 0, stock: 0 })
const form = ref(vacio())
const editandoId = ref(null)
const mostrandoForm = ref(false)

onMounted(cargar)

function nuevo() {
  editandoId.value = null
  form.value = vacio()
  mostrandoForm.value = true
}

function editar(p) {
  editandoId.value = p.id
  form.value = { nombre: p.nombre, categoria: p.categoria ?? '', precio: p.precio, stock: p.stock }
  mostrandoForm.value = true
}

async function guardar() {
  const ok = editandoId.value
    ? await actualizar(editandoId.value, form.value)
    : await crear(form.value)
  if (ok) mostrandoForm.value = false
}

async function borrar(p) {
  if (confirm(`¿Eliminar "${p.nombre}"?`)) await eliminar(p.id)
}

const dinero = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)
</script>

<template>
  <section>
    <div class="encabezado">
      <h2>Productos</h2>
      <button v-if="puedeEditar" @click="nuevo">Nuevo producto</button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <form v-if="mostrandoForm" class="tarjeta" @submit.prevent="guardar">
      <h3>{{ editandoId ? 'Editar producto' : 'Nuevo producto' }}</h3>
      <label>Nombre <input v-model="form.nombre" required /></label>
      <label>Categoría <input v-model="form.categoria" /></label>
      <div class="fila">
        <label>Precio <input v-model.number="form.precio" type="number" min="0" step="0.01" required /></label>
        <label>Stock <input v-model.number="form.stock" type="number" min="0" step="1" required /></label>
      </div>
      <div class="fila">
        <button type="submit" :disabled="loading">Guardar</button>
        <button type="button" class="secundario" @click="mostrandoForm = false">Cancelar</button>
      </div>
    </form>

    <p v-if="loading && !productos.length">Cargando...</p>
    <p v-else-if="!productos.length">No hay productos.</p>

    <table v-else class="tabla">
      <thead>
        <tr>
          <th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th>
          <th v-if="puedeEditar">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in productos" :key="p.id">
          <td>{{ p.nombre }}</td>
          <td>{{ p.categoria }}</td>
          <td>{{ dinero(p.precio) }}</td>
          <td :class="{ alerta: p.stock < 10 }">{{ p.stock }}</td>
          <td v-if="puedeEditar" class="fila">
            <button class="secundario" @click="editar(p)">Editar</button>
            <button v-if="puedeEliminar" class="peligro" @click="borrar(p)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
```

### Archivo `src/views/DashboardView.vue`

```vue
<script setup>
import { onMounted } from 'vue'
import { useDashboard } from '@/composables/useDashboard'

const { productos, usuariosPorRol, loading, error, cargar } = useDashboard()
onMounted(cargar)

const dinero = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)
</script>

<template>
  <section>
    <h2>Dashboard</h2>
    <p v-if="loading">Cargando...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="productos" class="grilla">
      <div class="tarjeta"><h3>Productos</h3><p class="numero">{{ productos.total }}</p></div>
      <div class="tarjeta"><h3>Sin stock</h3><p class="numero alerta">{{ productos.sinStock }}</p></div>
      <div class="tarjeta"><h3>Stock bajo</h3><p class="numero alerta">{{ productos.stockBajo }}</p></div>
      <div class="tarjeta"><h3>Valor del inventario</h3><p class="numero">{{ dinero(productos.valorInventario) }}</p></div>
    </div>

    <h3>Usuarios por rol</h3>
    <div v-if="usuariosPorRol" class="grilla">
      <div v-for="(cantidad, rol) in usuariosPorRol" :key="rol" class="tarjeta">
        <h3>{{ rol }}</h3>
        <p class="numero">{{ cantidad }}</p>
      </div>
    </div>
  </section>
</template>
```

### Archivo `src/views/UsuariosView.vue`

El admin ve a todos y cambia roles. El selector de su propia fila está deshabilitado para evitar que se quite el rol por accidente.

```vue
<script setup>
import { onMounted } from 'vue'
import { useUsuarios } from '@/composables/useUsuarios'
import { useAuth } from '@/composables/useAuth'
import { JERARQUIA } from '@/config/roles'

const { usuarios, loading, error, cargar, cambiarRol } = useUsuarios()
const { usuario } = useAuth()

onMounted(cargar)
</script>

<template>
  <section>
    <h2>Usuarios</h2>
    <p v-if="loading && !usuarios.length">Cargando...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <table class="tabla">
      <thead>
        <tr><th>Nombre</th><th>Email</th><th>Rol</th></tr>
      </thead>
      <tbody>
        <tr v-for="u in usuarios" :key="u.id">
          <td>{{ u.nombre }}</td>
          <td>{{ u.email }}</td>
          <td>
            <select
              :value="u.rol"
              :disabled="u.id === usuario?.id"
              @change="cambiarRol(u.id, $event.target.value)"
            >
              <option v-for="r in JERARQUIA" :key="r" :value="r">{{ r }}</option>
            </select>
            <span v-if="u.id === usuario?.id" class="chico"> (vos)</span>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
```

### Archivo `src/views/NoAutorizadoView.vue`

```vue
<template>
  <section class="tarjeta angosta">
    <h2>Acceso no autorizado</h2>
    <p>Tu rol actual no tiene permisos para ver esta página.</p>
    <RouterLink to="/">Volver a productos</RouterLink>
  </section>
</template>
```

### Archivo `src/assets/main.css`

```css
:root {
  --borde: #d9dde3;
  --fondo: #f6f7f9;
  --primario: #2563eb;
  --peligro: #dc2626;
  --texto: #1f2937;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  background: var(--fondo);
  color: var(--texto);
}

.barra {
  display: flex; align-items: center; gap: 1.5rem;
  padding: .75rem 1.5rem; background: #fff; border-bottom: 1px solid var(--borde);
}
.barra nav { display: flex; gap: 1rem; flex: 1; }
.sesion { display: flex; align-items: center; gap: .75rem; font-size: .9rem; }

.contenedor { max-width: 960px; margin: 1.5rem auto; padding: 0 1rem; }

.tarjeta {
  background: #fff; border: 1px solid var(--borde); border-radius: 10px;
  padding: 1rem; margin-bottom: 1rem;
}
.angosta { max-width: 420px; margin-inline: auto; }

.grilla { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
.grilla .tarjeta { margin: 0; }
.numero { font-size: 1.8rem; font-weight: 700; margin: .25rem 0 0; }

.encabezado { display: flex; justify-content: space-between; align-items: center; }
.fila { display: flex; gap: .5rem; flex-wrap: wrap; align-items: flex-end; }
.fila > label { flex: 1; }

.tabla { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid var(--borde); }
.tabla th, .tabla td { padding: .6rem; text-align: left; border-bottom: 1px solid var(--borde); }

label { display: block; margin-bottom: .75rem; font-size: .9rem; }
label.check { display: flex; gap: .5rem; align-items: center; }
input, select { padding: .5rem; border: 1px solid var(--borde); border-radius: 6px; font: inherit; }
label input:not([type='checkbox']) { display: block; width: 100%; margin-top: .25rem; }

button {
  padding: .5rem 1rem; border: 0; border-radius: 6px; cursor: pointer;
  background: var(--primario); color: #fff; font: inherit;
}
button.secundario { background: #e5e7eb; color: var(--texto); }
button.peligro { background: var(--peligro); }
button:disabled { opacity: .5; cursor: not-allowed; }

.error { color: var(--peligro); }
.alerta { color: var(--peligro); font-weight: 600; }
.chico { font-size: .85rem; color: #6b7280; }
.etiqueta { display: inline-block; background: #e0e7ff; padding: .1rem .5rem; border-radius: 99px; font-size: .75rem; margin-left: .25rem; }
```

## B10. Probar de punta a punta

```bash
npm run dev
```

### Escenario guiado para la clase

1. **Sin sesión** en `http://localhost:5173`: se ve la lista de productos, sin botones de edición, y el menú solo muestra Ingresar y Registrarme.
2. **Registrar** una cuenta (por ejemplo `alumno@test.com`). Debe quedar con el rol `user`. Los botones de edición **no** aparecen. Intentar abrir `/dashboard` manualmente lleva a "Acceso no autorizado".
3. **Cerrar sesión** y volver a entrar tildando "Mantener sesión iniciada". Inspeccionar en las herramientas del navegador (Application, Storage) dónde quedó la clave `auth.session`: en `localStorage` si se tildó, en `sessionStorage` si no. Recargar la página: la sesión se restaura y el rol se vuelve a pedir.
4. **Convertirse en admin** con el `UPDATE` de la sección B2 y recargar: aparecen Dashboard y Usuarios.
5. En **Usuarios**, registrar una segunda cuenta y asignarle `manager`. Ingresar con ella: ve el botón de crear y editar, pero no el de eliminar ni los enlaces de admin.

### Pruebas de seguridad con curl (RLS por encima de la interfaz)

Con un token de un usuario con rol `user` (obtenido del login):

```bash
# 1) Un user intenta crear un producto: ERROR 403 (código 42501), la política WITH CHECK lo rechaza
curl -i -X POST "https://TU-PROYECTO.supabase.co/rest/v1/productos" \
  -H "apikey: TU_ANON_KEY" -H "Authorization: Bearer TOKEN_DEL_USER" \
  -H "Content-Type: application/json" -H "Prefer: return=representation" \
  -d '{"nombre":"Hack","precio":1,"stock":1}'

# 2) Un user intenta ascenderse a admin: devuelve [] (no hay error, RLS filtró 0 filas)
curl -i -X PATCH "https://TU-PROYECTO.supabase.co/rest/v1/profiles?id=eq.ID_DEL_USER" \
  -H "apikey: TU_ANON_KEY" -H "Authorization: Bearer TOKEN_DEL_USER" \
  -H "Content-Type: application/json" -H "Prefer: return=representation" \
  -d '{"rol":"admin"}'

# 3) Un manager intenta borrar un producto: devuelve [] (solo el admin puede borrar)
curl -i -X DELETE "https://TU-PROYECTO.supabase.co/rest/v1/productos?id=eq.ID_PRODUCTO" \
  -H "apikey: TU_ANON_KEY" -H "Authorization: Bearer TOKEN_DEL_MANAGER" \
  -H "Prefer: return=representation"
```

La conclusión para los alumnos: aunque se modifique el frontend para mostrar todos los botones, la base sigue rechazando lo que el rol no permite.

### Problemas frecuentes

| Síntoma | Causa probable |
|---|---|
| Al registrarme no queda logueado y no pasa nada | Confirm email está activado: hay que confirmar el correo (la pantalla lo informa) o desactivarlo para la práctica |
| "Over email send rate limit" | Demasiados registros con el correo incluido de Supabase; desactivar Confirm email o esperar |
| Tras el login, el rol no aparece / error al cargar perfil | Falta ejecutar la migración o el usuario es anterior al trigger (el script incluye el *backfill*; volvé a ejecutarlo) |
| El admin es rechazado en `/dashboard` al recargar | El guard no está esperando `inicializar()`; verificá el `await` en `beforeEach` |
| "No se pudo cambiar el rol" siendo admin | El `UPDATE` de `profiles` quedó sin política o `mi_rol()` devuelve `null` (revisar que tu fila de `profiles` tenga `rol = 'admin'`) |
| Error "infinite recursion detected in policy" | Se escribió una política de `profiles` que consulta `profiles` directamente; usar `mi_rol()` |
| La sesión se pierde al cerrar la pestaña | No se tildó "Mantener sesión iniciada" (se guardó en `sessionStorage`); es el comportamiento esperado |

## B11. Cómo integrarlo al proyecto `inventario-ia`

Si querés sumar esto al proyecto anterior:

1. Ejecutá esta migración encima de la anterior (reemplaza las políticas de `productos`).
2. Reemplazá `session.js` y `authService.js` del proyecto anterior por `storage.js`, `authStore.js` y el nuevo `authService.js`.
3. Para que el asistente de IA quede restringido a `manager` y `admin`, agregá `meta: { requiresAuth: true, rolMinimo: ROLES.MANAGER }` a la ruta `/admin/ia`. Para reforzarlo en el servidor, la Edge Function puede consultar `profiles` con el cliente del usuario y devolver `403` si el rol no alcanza.

---

## Recursos

- Supabase Auth, contraseñas y signup: https://supabase.com/docs/guides/auth/passwords
- Supabase Auth, cierre de sesión y alcances (`scope`): https://supabase.com/docs/guides/auth/signout
- Supabase, gestión de datos de usuario (tabla `profiles` y trigger): https://supabase.com/docs/guides/auth/managing-user-data
- Supabase, límites de uso de Auth: https://supabase.com/docs/guides/auth/rate-limits
- Supabase, Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Vue Router, navigation guards: https://router.vuejs.org/guide/advanced/navigation-guards.html
- Composables en Vue 3: https://vuejs.org/guide/reusability/composables
- Almacenamiento de JWT (localStorage, sessionStorage y cookies): https://blog.openreplay.com/cookies-vs-localstorage-jwt-auth/
