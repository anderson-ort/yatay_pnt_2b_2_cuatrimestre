### Setup

```bash
npm create vue@latest mi-catalogo
cd mi-catalogo
npm install
npm run dev
```


### `.env`

```
VITE_SUPABASE_URL=https://tuproyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### `src/App.vue`

```vue
<script>
export default {
  data() {
    return {
      productos: [],
      categoriaActiva: 'todos',
      cargando: true,
      error: null,
      imagenFallback: 'https://placehold.co/400x400/F2EFE6/7C8F6E?text=Sin+imagen'
    }
  },

  computed: {
    categorias() {
      const lista = this.productos.map(p => p.categoria).filter(Boolean)
      return ['todos', ...new Set(lista)]
    },

    productosFiltrados() {
      if (this.categoriaActiva === 'todos') return this.productos
      return this.productos.filter(p => p.categoria === this.categoriaActiva)
    }
  },

  methods: {
    async cargarProductos() {
      this.cargando = true
      this.error = null
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/productos?select=*&order=creado_en.desc`
        const respuesta = await fetch(url, {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        })
        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`)
        this.productos = await respuesta.json()
      } catch (err) {
        this.error = err.message
      } finally {
        this.cargando = false
      }
    },

    formatearPrecio(precio) {
      return Number(precio).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
    },

    esAgotado(stock) {
      return !stock || stock <= 0
    },

    obtenerImagen(url) {
      return url || this.imagenFallback
    },

    manejarErrorImagen(event) {
      event.target.src = this.imagenFallback
    }
  },

  mounted() {
    this.cargarProductos()
  }
}
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

### `src/main.js`

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')
```

### Comparativa: JavaScript Vanilla vs. Vue.js Options API

| Criterio | JavaScript Vanilla (Original) | Vue.js Options API (Nuevo) |
| --- | --- | --- |
| **Manipulación del DOM** | Manual e imperativa (`innerHTML`, `querySelector`, `addEventListener`). | Declarativa mediante directivas en el HTML (`v-for`, `@click`, `v-if`). |
| **Gestión de Estado** | Requiere llamar manualmente a funciones de renderizado tras actualizar datos. | Reactiva. Al cambiar `categoriaActiva`, la interfaz se actualiza sola. |
| **Seguridad XSS** | Vulnerable al inyectar cadenas dinámicas directo con `innerHTML`. | Seguro por defecto; Vue escapa automáticamente interpolaciones como `{{ }}`. |
| **Estructura de Código** | Funciones e interactividad dispersas en scripts procedimentales. | Organizado formalmente en opciones claras: `data`, `computed`, `methods` y `mounted`. |
| **Dependencias** | Ninguna (0 KB extra de JS procesado por el navegador). | Requiere incluir la librería de Vue (~35 KB min+gzipped vía CDN). |

---

**Ventajas principales del cambio:**

* **Desaparición del código *boilerplate* de renderizado:** Ya no necesitas reconstruir strings de HTML ni adjuntar listener manuales cada vez que cambia un filtro.
* **Mantenibilidad:** Las propiedades computadas (`computed`) encapsulan la lógica derivativa (filtrado y extracción de categorías de forma optimizada y en caché).

**Desventajas a considerar:**

* Para un catálogo puramente estático de lectura, agregar una librería Javascript añade una mínima carga inicial adicional al navegador en comparación con Vanilla JS.