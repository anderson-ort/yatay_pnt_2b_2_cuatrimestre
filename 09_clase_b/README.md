# Pinia (v3.x) con Vue 3 y Vite

Referencia: https://pinia.vuejs.org/core-concepts/ (la doc actual es Pinia v3.x, solo Vue 3).

## 0. Setup

```bash
npm create vite@latest pinia-demo -- --template vue
cd pinia-demo
npm i pinia pinia-plugin-persistedstate vue-router
npm run dev
```

`src/main.js`

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate) // seccion 6

createApp(App).use(pinia).use(router).mount('#app')
```

Estructura sugerida:

```
src/
  stores/
    counter.js
    auth.js
    products.js
  router/index.js
  main.js
```

---

## 1. Defining a Store

Un store se crea con `defineStore(id, ...)`. El `id` debe ser unico. Convencion: `useXxxStore`. Un store por archivo.

Hay dos sintaxis equivalentes.

### Option Store (similar a Options API)

```js
// src/stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0, name: 'Andru' }),
  getters: {
    doubleCount: (state) => state.count * 2,
  },
  actions: {
    increment() {
      this.count++
    },
  },
})
```

### Setup Store (similar a Composition API)

```js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const name = ref('Andru')
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }
  // Hay que retornar TODO el state, si no Pinia no lo detecta
  return { count, name, doubleCount, increment }
})
```

Equivalencias: `ref` = state, `computed` = getter, `function` = action.

Cuando usar cada una: Option es mas simple para empezar; Setup permite `watch`, composables y mas flexibilidad.

### Uso en un componente

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'
const store = useCounterStore()
</script>

<template>
  <p>{{ store.count }} x2 = {{ store.doubleCount }}</p>
  <button @click="store.increment()">+1</button>
</template>
```

### storeToRefs: desestructurar sin perder reactividad

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/stores/counter'

const store = useCounterStore()
const { count, doubleCount } = storeToRefs(store) // state y getters
const { increment } = store                       // actions se desestructuran directo
</script>
```

Error comun: `const { count } = store` rompe la reactividad.

---

## 2. State

Es la fuente de verdad. Debe ser una funcion que retorna un objeto (en Option Store).

```js
export const useTodoStore = defineStore('todos', {
  state: () => ({
    items: [],
    filter: 'all',
  }),
})
```

Operaciones utiles en el store:

```js
const store = useTodoStore()

store.filter = 'done'                 // mutacion directa (valido en Pinia)
store.$patch({ filter: 'all' })       // varias propiedades a la vez
store.$patch((state) => {             // forma funcion, ideal para arrays
  state.items.push({ id: 1, text: 'Aprender Pinia' })
})
store.$reset()                        // vuelve al estado inicial (solo Option Stores)
store.$subscribe((mutation, state) => {
  console.log('cambio', mutation.type, state)
})
```

En Setup Stores `$reset()` no existe: hay que definir tu propia funcion `reset()`.

---

## 3. Getters

Equivalen a `computed`. Cachean el resultado.

```js
export const useTodoStore = defineStore('todos', {
  state: () => ({ items: [] }),
  getters: {
    doneCount: (state) => state.items.filter((t) => t.done).length,
    // getter que usa otro getter: usar `this` y declarar el tipo de retorno en TS
    summary() {
      return `${this.doneCount} de ${this.items.length} hechas`
    },
    // getter con parametro: retorna una funcion (pierde el cache)
    byId: (state) => (id) => state.items.find((t) => t.id === id),
  },
})
```

Uso: `store.doneCount`, `store.byId(3)`.

---

## 4. Actions

Equivalen a `methods`. Pueden ser asincronas y es el lugar correcto para llamadas a API y logica de negocio.

```js
export const useTodoStore = defineStore('todos', {
  state: () => ({ items: [], loading: false, error: null }),
  actions: {
    async load() {
      this.loading = true
      this.error = null
      try {
        const res = await fetch('https://dummyjson.com/todos?limit=5')
        const data = await res.json()
        this.items = data.todos
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    add(text) {
      this.items.push({ id: Date.now(), todo: text, completed: false })
    },
  },
})
```

Observar acciones: `store.$onAction(({ name, args, after, onError }) => { ... })`.

---

## 5. Stores fuera de componentes

Para usar un store en el router, un interceptor de axios, etc., hay que llamarlo despues de instalar Pinia (dentro de la funcion, no a nivel de modulo).

```js
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('@/views/Home.vue') },
    { path: '/login', component: () => import('@/views/Login.vue') },
    { path: '/products', component: () => import('@/views/Products.vue'), meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore() // correcto: dentro del guard
  if (to.meta.requiresAuth && !auth.isLoggedIn) return '/login'
})

export default router
```

---

## 6. Plugins y persistencia

Un plugin de Pinia extiende todos los stores (agrega propiedades, suscripciones, etc.). La persistencia es el caso tipico.

### Opcion A: manual, sin dependencias

Util para entender el mecanismo con `$subscribe`.

```js
// src/stores/counter.js
import { defineStore } from 'pinia'

const KEY = 'counter'

export const useCounterStore = defineStore('counter', {
  state: () => {
    const saved = localStorage.getItem(KEY)          // hidrata al crear el store
    return saved ? JSON.parse(saved) : { count: 0 }
  },
  actions: {
    increment() {
      this.count++
    },
  },
})

// En main.js, despues de crear pinia:
// import { useCounterStore } from '@/stores/counter'
// useCounterStore().$subscribe((_, state) => {
//   localStorage.setItem('counter', JSON.stringify(state))   // o sessionStorage
// })
```

Plugin manual generico (persiste cualquier store que declare `persist: true`):

```js
// src/plugins/simple-persist.js
export function simplePersist({ store, options }) {
  if (!options.persist) return
  const storage = options.persist.storage ?? localStorage
  const key = `pinia:${store.$id}`

  const saved = storage.getItem(key)
  if (saved) store.$patch(JSON.parse(saved))

  store.$subscribe((_, state) => storage.setItem(key, JSON.stringify(state)))
}

// main.js: pinia.use(simplePersist)
// store:   defineStore('x', { state: ..., persist: { storage: sessionStorage } })
```

### Opcion B: `pinia-plugin-persistedstate` (recomendada)

Ya registrado en `main.js`. Se configura con la opcion `persist`.

**localStorage** (default, sobrevive al cerrar el navegador):

```js
export const useSettingsStore = defineStore('settings', {
  state: () => ({ theme: 'dark', lang: 'es' }),
  persist: true, // key = id del store, storage = localStorage
})
```

**sessionStorage** (se pierde al cerrar la pestana):

```js
export const useWizardStore = defineStore('wizard', {
  state: () => ({ step: 1, draft: {} }),
  persist: {
    key: 'wizard',
    storage: sessionStorage,
  },
})
```

**Solo algunas propiedades** (`pick` / `omit`):

```js
persist: {
  storage: localStorage,
  pick: ['theme'],      // solo persiste theme
  // omit: ['loading'], // alternativa: persiste todo menos loading
}
```

**Varios storages en el mismo store**:

```js
persist: [
  { key: 'user-local',   storage: localStorage,   pick: ['user'] },
  { key: 'user-session', storage: sessionStorage, pick: ['token'] },
]
```

**Setup Store**: la opcion va como tercer argumento.

```js
export const useSettingsStore = defineStore(
  'settings',
  () => {
    const theme = ref('dark')
    return { theme }
  },
  { persist: { storage: localStorage } },
)
```

Cuando usar cada storage:

| Dato | Storage | Motivo |
|---|---|---|
| Tema, idioma, preferencias | localStorage | Debe sobrevivir entre visitas |
| Sesion/token (sin cookie httpOnly) | sessionStorage o localStorage | sessionStorage expira al cerrar la pestana; localStorage mantiene el login |
| Wizard, formulario a medias, filtros | sessionStorage | Solo importa en esta pestana |
| Cache de productos | sessionStorage o localStorage | Depende de cuanto dure el dato |

---

## 7. Caso de uso: login / register

El store de auth guarda usuario y token, expone `isLoggedIn` y centraliza login, register y logout. Se persiste para que un F5 no cierre la sesion.

Se usa la API publica https://dummyjson.com (usuario de prueba: `emilys` / `emilyspass`).

```js
// src/stores/auth.js
import { defineStore } from 'pinia'

const API = 'https://dummyjson.com'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    fullName: (state) => (state.user ? `${state.user.firstName} ${state.user.lastName}` : ''),
  },

  actions: {
    async login(username, password) {
      this.loading = true
      this.error = null
      try {
        const res = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        })
        if (!res.ok) throw new Error('Credenciales invalidas')
        const data = await res.json()
        this.token = data.accessToken
        this.user = {
          id: data.id,
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
        }
      } catch (e) {
        this.error = e.message
        throw e
      } finally {
        this.loading = false
      }
    },

    async register({ firstName, lastName, username, password }) {
      this.loading = true
      this.error = null
      try {
        // dummyjson simula la creacion pero no la guarda de verdad
        const res = await fetch(`${API}/users/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName, lastName, username, password }),
        })
        if (!res.ok) throw new Error('No se pudo registrar')
        // Flujo tipico: registrar y loguear automaticamente
        // En una API real el backend devuelve el token en este mismo paso
        this.user = await res.json()
        this.token = 'token-simulado'
      } catch (e) {
        this.error = e.message
        throw e
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.$reset() // limpia state y, con el plugin, tambien el storage
      // Tambien conviene limpiar otros stores (ver seccion 8)
    },
  },

  persist: {
    key: 'auth',
    storage: localStorage,      // cambiar a sessionStorage para que expire al cerrar la pestana
    pick: ['user', 'token'],    // no persistir loading ni error
  },
})
```

Componente `Login.vue`:

```vue
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const { loading, error } = storeToRefs(auth)
const router = useRouter()

const username = ref('emilys')
const password = ref('emilyspass')

async function submit() {
  try {
    await auth.login(username.value, password.value)
    router.push('/products')
  } catch {
    /* el error ya queda en auth.error */
  }
}
</script>

<template>
  <form @submit.prevent="submit">
    <input v-model="username" placeholder="usuario" />
    <input v-model="password" type="password" placeholder="clave" />
    <button :disabled="loading">{{ loading ? 'Ingresando...' : 'Ingresar' }}</button>
    <p v-if="error" style="color: red">{{ error }}</p>
  </form>
</template>
```

Navbar `NavBar.vue` (ejemplo de estado compartido entre componentes):

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const { isLoggedIn, fullName } = storeToRefs(auth)
const router = useRouter()

function salir() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <nav>
    <RouterLink to="/">Home</RouterLink>
    <template v-if="isLoggedIn">
      <RouterLink to="/products">Productos</RouterLink>
      <span>{{ fullName }}</span>
      <button @click="salir">Salir</button>
    </template>
    <RouterLink v-else to="/login">Login</RouterLink>
  </nav>
</template>
```

El guard del router (seccion 5) usa el mismo `isLoggedIn`. Login, navbar y router leen una sola fuente de verdad.

Nota de seguridad: un token en localStorage/sessionStorage es accesible ante XSS. Para produccion lo recomendable es una cookie `httpOnly` emitida por el backend; el store solo guardaria los datos del usuario.

---

## 8. Caso de uso: no descargar los productos varias veces

Problema: cada vista que muestra productos hace su propio `fetch`. Con un store, la primera vista descarga y el resto reutiliza. Con persistencia, tampoco se vuelve a descargar tras un F5.

```js
// src/stores/products.js
import { defineStore } from 'pinia'

const API = 'https://dummyjson.com/products?limit=100'
const TTL_MS = 5 * 60 * 1000 // 5 minutos de validez del cache

export const useProductsStore = defineStore('products', {
  state: () => ({
    items: [],
    fetchedAt: null, // timestamp de la ultima descarga
    loading: false,
    error: null,
  }),

  getters: {
    isFresh: (state) => state.fetchedAt && Date.now() - state.fetchedAt < TTL_MS,
    byId: (state) => (id) => state.items.find((p) => p.id === Number(id)),
    categories: (state) => [...new Set(state.items.map((p) => p.category))],
  },

  actions: {
    async fetchProducts({ force = false } = {}) {
      // 1. Ya hay datos validos: no hacer nada
      if (!force && this.items.length && this.isFresh) return this.items

      // 2. Ya hay una descarga en curso: reutilizar la misma promesa
      if (this._inflight) return this._inflight

      this.loading = true
      this.error = null
      this._inflight = fetch(API)
        .then((res) => {
          if (!res.ok) throw new Error('Error al cargar productos')
          return res.json()
        })
        .then((data) => {
          this.items = data.products
          this.fetchedAt = Date.now()
          return this.items
        })
        .catch((e) => {
          this.error = e.message
        })
        .finally(() => {
          this.loading = false
          this._inflight = null
        })

      return this._inflight
    },

    clear() {
      this.$reset()
    },
  },

  persist: {
    key: 'products',
    storage: sessionStorage,              // cache valido durante la pestana
    pick: ['items', 'fetchedAt'],         // nunca persistir loading/error
  },
})
```

Nota: `_inflight` no esta declarado en `state`, por lo que no se persiste ni es reactivo. Es solo una variable interna del store; si se prefiere algo mas explicito, se puede declarar en `state` y excluirlo con `pick`.

`Products.vue` y `ProductDetail.vue` comparten el mismo cache:

```vue
<!-- src/views/Products.vue -->
<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useProductsStore } from '@/stores/products'

const store = useProductsStore()
const { items, loading, error } = storeToRefs(store)

onMounted(() => store.fetchProducts()) // solo descarga si no hay cache valido
</script>

<template>
  <button @click="store.fetchProducts({ force: true })">Refrescar</button>
  <p v-if="loading">Cargando...</p>
  <p v-else-if="error">{{ error }}</p>
  <ul v-else>
    <li v-for="p in items" :key="p.id">{{ p.title }} - ${{ p.price }}</li>
  </ul>
</template>
```

```vue
<!-- src/views/ProductDetail.vue -->
<script setup>
import { useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/products'

const route = useRoute()
const store = useProductsStore()
await store.fetchProducts()               // instantaneo si ya esta en cache
const product = store.byId(route.params.id)
</script>

<template>
  <h2>{{ product?.title }}</h2>
  <p>{{ product?.description }}</p>
</template>
```

Para verificarlo: abrir DevTools, pestana Network, entrar a Products, ir al detalle, volver y recargar con F5. Solo debe verse un request a `/products` (otro unicamente al pasar el TTL o al presionar Refrescar).

### Limpiar todo al hacer logout

Los datos de un usuario no deben quedar para el siguiente. Se coordinan los stores desde una action:

```js
// en auth.js
import { useProductsStore } from './products'

actions: {
  logout() {
    useProductsStore().clear()
    this.$reset()
  },
}
```

---

## 9. Cuando usar Pinia (y cuando no)

Usar Pinia cuando:

- Varios componentes no relacionados necesitan el mismo dato (usuario logueado, carrito, tema).
- Hay datos remotos que se quieren cachear y compartir entre vistas (productos, catalogos, configuracion).
- La logica de negocio y las llamadas a API deben vivir fuera de los componentes (actions).
- Se necesita persistir estado entre recargas (sesion, preferencias, borradores).
- Hay que inspeccionar cambios con Vue Devtools (time travel, historial de mutaciones).

No hace falta Pinia cuando:

- El estado es local a un componente: usar `ref`/`reactive`.
- Solo se pasa un valor de padre a hijo cercano: `props`/`emit` o `provide`/`inject`.
- El dato es del servidor y se necesita cache avanzado (revalidacion, reintentos, paginacion): considerar TanStack Query (`@tanstack/vue-query`), que resuelve eso mejor que un store manual. Se puede combinar con Pinia para el estado de UI.
- El valor debe vivir en la URL (filtros, pagina): usar query params del router.

Resumen de conceptos:

| Concepto | Equivale a | Funcion |
|---|---|---|
| `defineStore` | - | Crea el store (id unico) |
| state | `data` / `ref` | Datos |
| getters | `computed` | Datos derivados con cache |
| actions | `methods` | Logica, async, llamadas a API |
| `storeToRefs` | - | Desestructurar state/getters sin perder reactividad |
| `$patch` / `$reset` / `$subscribe` | - | Mutar en bloque / reiniciar / observar cambios |
| plugins | - | Extender todos los stores (ej. persistencia) |
