# `.env` y consumo de APIs en Vue 3 + Vite

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
Una forma sencilla es crear un composable llamado `useProductos.js`:

```js
// src/composables/useProductos.js
import { ref } from 'vue'

export function useProductos() {
  const productos = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function obtenerProductos() {
    loading.value = true
    error.value = null

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      error.value = new Error(
        'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY'
      )
      loading.value = false
      return
    }

    const url = `${supabaseUrl}/rest/v1/productos?select=*&order=creado_en.desc`

    try {
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

      productos.value = await response.json()
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

Puedes usarlo desde un componente:

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

Primero instala Axios:

```bash
npm install axios
```

Después crea una instancia reutilizable:

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

Luego crea el servicio de productos:

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

Y úsalo desde un componente o composable:

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

Tu URL actual:

```js
const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/productos?select=*&order=creado_en.desc`
```

Con `fetch`, puedes agregar parámetros de forma más segura usando `URLSearchParams`:

```js
const params = new URLSearchParams({
  select: '*',
  order: 'creado_en.desc',
  limit: '10',
  offset: '0'
})

const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/productos?${params}`

const response = await fetch(url, {
  headers: {
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
  }
})

if (!response.ok) {
  throw new Error(`Error HTTP: ${response.status}`)
}

const productos = await response.json()
```

Con Axios, la misma petición queda más declarativa:

```js
const response = await api.get('/productos', {
  params: {
    select: '*',
    order: 'creado_en.desc',
    limit: 10,
    offset: 0
  }
})

const productos = response.data
```

Como siguiente organización del proyecto, una estructura razonable sería:

```text
src/
├── components/
├── composables/
│   └── useProductos.js
├── services/
│   ├── api.js
│   └── productosService.js
└── views/
```

La separación recomendada es: `services` para comunicarse con la API, `composables` para manejar estados reactivos como `loading`, `error` y `data`, y los componentes para representar la interfaz.
