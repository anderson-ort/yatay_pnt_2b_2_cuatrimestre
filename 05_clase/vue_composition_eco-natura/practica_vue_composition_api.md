## Propuesta de proyecto
Poder replicar el mismo frontend en la version de composition en vue

### `.env`

```
VITE_SUPABASE_URL=https://tuproyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### `src/main.js`

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')
```

### `src/App.vue`

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'

const productos = ref([])
const categoriaActiva = ref('todos')
const cargando = ref(true)
const error = ref(null)
const imagenFallback = 'https://placehold.co/400x400/F2EFE6/7C8F6E?text=Sin+imagen'

const categorias = computed(() => {
  const lista = productos.value.map(p => p.categoria).filter(Boolean)
  return ['todos', ...new Set(lista)]
})

const productosFiltrados = computed(() => {
  if (categoriaActiva.value === 'todos') return productos.value
  return productos.value.filter(p => p.categoria === categoriaActiva.value)
})

function formatearPrecio(precio) {
  return Number(precio).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

function esAgotado(stock) {
  return !stock || stock <= 0
}

function obtenerImagen(url) {
  return url || imagenFallback
}

function manejarErrorImagen(event) {
  event.target.src = imagenFallback
}

async function cargarProductos() {
  cargando.value = true
  error.value = null
  try {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/productos?select=*&order=creado_en.desc`
    const respuesta = await fetch(url, {
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      }
    })
    if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`)
    productos.value = await respuesta.json()
  } catch (err) {
    error.value = err.message
  } finally {
    cargando.value = false
  }
}

onMounted(cargarProductos)
</script>

<template>
  <header>
    <p class="marca">Catálogo interno</p>
    <h1>Suplementos naturales, en su forma más simple.</h1>
    <p>Listado en vivo desde la base de datos de productos. Filtra por categoría para revisar stock y precios actualizados.</p>
  </header>

  <main>
    <div class="filtros" v-if="productos.length > 0">
      <button
        v-for="cat in categorias"
        :key="cat"
        :class="{ activo: cat === categoriaActiva }"
        @click="categoriaActiva = cat">
        {{ cat === 'todos' ? 'Todos' : cat }}
      </button>
    </div>

    <div v-if="cargando"><p class="estado">Cargando productos...</p></div>

    <div v-else-if="error">
      <p class="estado">No se pudo cargar el catálogo. Revisa la URL y la anon key configuradas. ({{ error }})</p>
    </div>

    <div v-else-if="productosFiltrados.length === 0">
      <p class="estado">
        {{ productos.length === 0 ? 'No hay productos cargados todavía.' : 'No hay productos en esta categoría.' }}
      </p>
    </div>

    <div v-else class="grid">
      <article v-for="producto in productosFiltrados" :key="producto.id || producto.nombre" class="producto">
        <div class="imagen">
          <img :src="obtenerImagen(producto.imagen)" :alt="producto.nombre" loading="lazy" @error="manejarErrorImagen">
        </div>
        <div class="info">
          <p class="categoria">{{ producto.categoria || 'general' }}</p>
          <h2>{{ producto.nombre }}</h2>
          <p class="descripcion">{{ producto.descripcion || '' }}</p>
          <div class="pie">
            <span class="precio">{{ formatearPrecio(producto.precio) }}</span>
            <span class="stock" :class="{ agotado: esAgotado(producto.stock) }">
              {{ esAgotado(producto.stock) ? 'Sin stock' : `${producto.stock} en stock` }}
            </span>
          </div>
        </div>
      </article>
    </div>
  </main>

  <footer>Datos servidos directamente desde la API REST de Supabase.</footer>
</template>
```

