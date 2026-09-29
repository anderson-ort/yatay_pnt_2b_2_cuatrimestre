# Uso de secretos `(.env)` y consumo de APIs en Vue 3 + Vite

En una aplicación Vue 3 creada con Vite, las variables de entorno se leen mediante `import.meta.env`. Para que una variable esté disponible en el código del navegador debe comenzar con `VITE_`; esto significa también que su valor queda expuesto en el bundle final, por lo que nunca debes guardar allí secretos reales. [vite](https://vite.dev/guide/env-and-mode)

En tu caso, la URL de Supabase puede utilizarse así:

```js
const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/productos?select=*&order=creado_en.desc`
```

Supabase expone una API REST a través de una ruta con formato `/rest/v1/`, y las consultas pueden usar parámetros como `select` y `order`. [supabase](https://supabase.com/docs/guides/api)

## 1. Configuración de `.env`

En la raíz del proyecto crea un archivo llamado `.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon
```

También puedes separar los ambientes:

```text
.env
.env.local
.env.development
.env.production
```

Por ejemplo:

```env
# .env.development
VITE_SUPABASE_URL=https://proyecto-dev.supabase.co
VITE_SUPABASE_ANON_KEY=clave-dev
```

```env
# .env.production
VITE_SUPABASE_URL=https://proyecto-produccion.supabase.co
VITE_SUPABASE_ANON_KEY=clave-produccion
```

Vite carga estos archivos según el modo de ejecución y reemplaza las variables durante el desarrollo o la compilación. Las variables se reciben como cadenas de texto. [vite](https://vite.dev/guide/env-and-mode)

Después de modificar un archivo `.env`, reinicia el servidor de Vite:

```bash
npm run dev
```

Normalmente no es necesario convertir manualmente la URL, pero sí conviene validar que exista:

```js
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

if (!supabaseUrl) {
  throw new Error('Falta configurar VITE_SUPABASE_URL')
}
```

### Importante sobre seguridad

Esto es correcto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon
```

Esto es incorrecto:

```env
VITE_SUPABASE_SERVICE_ROLE_KEY=una-clave-secreta
```

Toda variable con prefijo `VITE_` puede terminar visible en el navegador. La clave `service_role`, contraseñas, tokens privados y credenciales administrativas deben permanecer en un backend o función serverless. La clave pública `anon` está diseñada para aplicaciones cliente, pero debe estar protegida mediante las políticas RLS de Supabase.

## [Que es un composable?](./composables.md)

## 2. Consumo con `fetch`

`fetch` viene incluido en el navegador, así que no requiere dependencias. La separación recomendada es la misma que usaremos con Axios: el **service** se comunica con la API, el **composable** maneja el estado reactivo (`productos`, `loading`, `error`) y el **componente** solo pinta la interfaz.

### 2.1 Service: `src/services/productosService.js`

```js
// src/services/productosService.js
export async function listarProductos() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY')
  }

  const url = `${supabaseUrl}/rest/v1/productos?select=*&order=creado_en.desc`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`)
  }

  return response.json()
}
```

### 2.2 Composable: `src/composables/useProductos.js`

```js
// src/composables/useProductos.js
import { ref } from 'vue'
import { listarProductos } from '@/services/productosService'

export function useProductos() {
  const productos = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function obtenerProductos() {
    loading.value = true
    error.value = null

    try {
      productos.value = await listarProductos()
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  return {
    productos,
    loading,
    error,
    obtenerProductos
  }
}
```

### 2.3 Uso desde un componente

```vue
<script setup>
import { onMounted } from 'vue'
import { useProductos } from '@/composables/useProductos'

const {
  productos,
  loading,
  error,
  obtenerProductos
} = useProductos()

onMounted(() => {
  obtenerProductos()
})
</script>

<template>
  <section>
    <p v-if="loading">Cargando productos...</p>

    <p v-else-if="error">
      No se pudieron cargar los productos:
      {{ error.message }}
    </p>

    <ul v-else>
      <li v-for="producto in productos" :key="producto.id">
        {{ producto.nombre }}
      </li>
    </ul>
  </section>
</template>
```

### Ventajas de `fetch`

- Está disponible nativamente en el navegador.
- No requiere instalar dependencias.
- Es suficiente para peticiones simples.
- Reduce el tamaño de la aplicación.
- Te obliga a entender claramente el flujo HTTP.

### Desventajas de `fetch`

- Debes comprobar manualmente `response.ok`.
- Debes convertir manualmente la respuesta con `response.json()`.
- El manejo de errores requiere más código.
- No tiene interceptores incorporados.
- El soporte para cancelación, reintentos y transformaciones requiere código adicional.

Un detalle importante: `fetch` no considera un error HTTP `400` o `500` como una excepción automáticamente. Por eso necesitas comprobar:

```js
if (!response.ok) {
  throw new Error(`Error HTTP: ${response.status}`)
}
```

## 3. Consumo con Axios

Axios es una dependencia externa, pero a cambio nos da transformación automática de JSON, rechazo automático de errores HTTP, `baseURL` e interceptores. La estructura es idéntica a la del stack anterior: **service → composable → componente**.

### 3.1 Instalación

```bash
npm install axios
```

### 3.2 Instancia reutilizable: `src/services/api.js`

```js
// src/services/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1`,
  headers: {
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  }
})

export default api
```

### 3.3 Service: `src/services/productosService.js`

```js
// src/services/productosService.js
import api from './api'

export async function listarProductos() {
  const response = await api.get('/productos', {
    params: {
      select: '*',
      order: 'creado_en.desc'
    }
  })

  return response.data
}
```

### 3.4 Composable: `src/composables/useProductos.js`

```js
// src/composables/useProductos.js
import { ref } from 'vue'
import { listarProductos } from '@/services/productosService'

export function useProductos() {
  const productos = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function obtenerProductos() {
    loading.value = true
    error.value = null

    try {
      productos.value = await listarProductos()
    } catch (err) {
      error.value =
        err.response?.data ||
        err.message ||
        'Ocurrió un error al obtener los productos'
    } finally {
      loading.value = false
    }
  }

  return {
    productos,
    loading,
    error,
    obtenerProductos
  }
}
```

### 3.5 Uso desde un componente

El componente es exactamente el mismo que en la versión con `fetch`, porque solo cambió la implementación del service:

```vue
<script setup>
import { onMounted } from 'vue'
import { useProductos } from '@/composables/useProductos'

const {
  productos,
  loading,
  error,
  obtenerProductos
} = useProductos()

onMounted(() => {
  obtenerProductos()
})
</script>

<template>
  <section>
    <p v-if="loading">Cargando productos...</p>

    <p v-else-if="error">
      No se pudieron cargar los productos:
      {{ error.message }}
    </p>

    <ul v-else>
      <li v-for="producto in productos" :key="producto.id">
        {{ producto.nombre }}
      </li>
    </ul>
  </section>
</template>
```

> **Nota sobre nombres:** en el proyecto EcoNatura `src/services/api.js` hoy es la capa de datos (el `fetchProducts` sobre el mock). Al migrar a una API real, ese archivo se reemplaza por el `productosService.js` del stack elegido. La instancia de Axios también se llama `api.js` en este ejemplo, así que elegí un stack u otro para evitar el choque de nombres.

### Ventajas de Axios

- Convierte automáticamente las respuestas JSON.
- Rechaza automáticamente las respuestas HTTP con error.
- Permite definir una `baseURL`.
- Soporta interceptores.
- Facilita agregar tokens de autenticación.
- Simplifica parámetros de consulta.
- Ofrece una API consistente para navegador y otros entornos.
- Facilita configurar timeouts, cancelación y transformaciones.

### Desventajas de Axios

- Añade una dependencia al proyecto.
- Aumenta ligeramente el tamaño del bundle.
- Para peticiones simples puede ser innecesario.
- Es posible ocultar detalles importantes de HTTP si se utiliza sin comprender su funcionamiento.
- El proyecto debe mantener actualizada otra dependencia.

## 4. Comparación rápida

| Aspecto | `fetch` | Axios |
|---|---|---|
| Instalación | No requiere instalación | Requiere `npm install axios` |
| JSON | Debes usar `response.json()` | Se transforma automáticamente |
| Errores HTTP | Debes comprobar `response.ok` | Las respuestas no exitosas rechazan la promesa |
| Base URL | Debes construirla manualmente | Puedes definir `baseURL` |
| Interceptores | No incluidos | Incluidos |
| Tamaño | Menor | Añade una dependencia |
| Peticiones simples | Excelente | También funciona |
| APIs grandes | Requiere más estructura propia | Suele ser más cómodo |

Para este proyecto educativo, te recomiendo empezar con `fetch`. Te permitirá entender `async/await`, headers, códigos HTTP, estados de carga y errores. Cuando tengas varios servicios, autenticación, interceptores o lógica común, Axios puede ofrecer una estructura más cómoda.

## 5. Ejemplo con filtros y paginación

Los filtros se agregan dentro del **service**, no en el composable ni en el componente. Así el composable sigue igual y solo cambia la consulta.

Con `fetch`, la forma más segura de armar la query es `URLSearchParams`:

```js
// src/services/productosService.js
export async function listarProductos({ limit = 10, offset = 0 } = {}) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  const params = new URLSearchParams({
    select: '*',
    order: 'creado_en.desc',
    limit: String(limit),
    offset: String(offset)
  })

  const url = `${supabaseUrl}/rest/v1/productos?${params}`

  const response = await fetch(url, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`
    }
  })

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`)
  }

  return response.json()
}
```

Con Axios, la misma consulta queda más declarativa:

```js
// src/services/productosService.js
import api from './api'

export async function listarProductos({ limit = 10, offset = 0 } = {}) {
  const response = await api.get('/productos', {
    params: {
      select: '*',
      order: 'creado_en.desc',
      limit,
      offset
    }
  })

  return response.data
}
```

Y en el composable solo pasás los parámetros:

```js
// src/composables/useProductos.js (fragmento)
async function obtenerProductos(filtros) {
  loading.value = true
  error.value = null

  try {
    productos.value = await listarProductos(filtros)
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
}
```

Como siguiente organización del proyecto, una estructura razonable sería:

```text
src/
├── components/
├── composables/
│   └── useProductos.js
├── services/
│   ├── api.js              # solo en el stack Axios (instancia)
│   └── productosService.js # el service del stack elegido
└── views/
```

La separación recomendada es: `services` para comunicarse con la API, `composables` para manejar estados reactivos como `loading`, `error` y `data`, y los componentes para representar la interfaz.
