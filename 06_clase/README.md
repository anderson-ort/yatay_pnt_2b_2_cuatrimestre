# Incorporando Vite a nuestro ecosistema

* **Vue.js** es un **framework de interfaz de usuario (UI)**. Su función es gestionar el estado de la aplicación, renderizar componentes visuales en el DOM y estructurar la lógica del cliente.
* **Vite** es un **servidor de desarrollo y empaquetador de código (Build Tool / Dev Server)**. Su función es servir los archivos de forma instantánea durante el desarrollo y optimizar/empaquetar el código (HTML, JS, CSS, `.vue`) para producción.
---

### 1. Análisis de Vue.js

**Vue.js** (basado en su guía de inicio rápido) es un framework progresivo centrado en la capa de vista. Permite escalar desde un script embebido en una página HTML hasta aplicaciones de una sola página (SPA) complejas.

#### Pros y Contras de Vue.js

| **Pros** | **Contras** |
| --- | --- |
| **Curva de aprendizaje suave:** Sintaxis clara basados en HTML, CSS y JS estándar. | **Ecosistema menor que React:** Aunque es enorme, cuenta con menos librerías de terceros en comparación con el ecosistema de React. |
| **Componentes de Archivo Único (SFC - `.vue`):** Agrupa plantilla, lógica y estilos en un solo archivo organizado. | **Flexibilidad de paradigmas:** La coexistencia de *Options API* y *Composition API* puede crear inconsistencias si el equipo no define estándares. |
| **Sistema de Reactividad Fina:** Gracias a `ref()` y `reactive()`, actualiza de manera eficiente solo las partes del DOM que cambian. | **Menor adopción corporativa tradicional:** En algunas regiones, el mercado laboral demanda más React o Angular. |
| **Ecosistema Oficial Cohesivo:** Soluciones oficiales y perfectamente integradas para enrutamiento (*Vue Router*) y estado global (*Pinia*). |  |

---

### 2. Análisis de Vite

**Vite** (del francés "rápido", pronunciado `/vit/`) es la herramienta de construcción moderna que reemplazó a herramientas tradicionales como Webpack o Vue CLI. Utiliza módulos ES nativos (*ESM*) en el navegador para servir el código en desarrollo sin necesidad de empaquetarlo previamente.

#### Pros y Contras de Vite

| **Pros** | **Contras** |
| --- | --- |
| **Arranque del servidor instantáneo:** No importa qué tan grande sea el proyecto, el servidor de desarrollo inicia en milisegundos. | **Soporte para navegadores muy antiguos:** Requiere configuración explícita (`@vitejs/plugin-legacy`) si se necesita soportar navegadores antiguos que no implementen ESM. |
| **Recarga en caliente (HMR) ultra rápida:** Las modificaciones en el código se reflejan en pantalla de inmediato sin perder el estado de la app. | **No es un framework de UI:** Por sí solo no sirve para crear componentes ni manejar estado, necesita un framework (Vue, React, Svelte, etc.) o JS puro. |
| **Agnóstico al framework:** Funciona indistintamente con Vue, React, Svelte, Preact, Lit o JavaScript Vanilla. | **Diferencia entre Dev y Prod:** En desarrollo usa ESM nativo y en producción usa empaquetado optimizado (vía Rollup/Rolldown), lo que en casos muy raros exige probar bien el build final. |
| **Configuración mínima y Plugins:** Viene configurado por defecto para TypeScript, JSX, CSS Preprocessors y cuenta con un ecosistema de plugins extensible. |  |

---

### 3.  Vue.js vs. Vite

| Criterio / Dimensión | **Vue.js** (Framework UI) | **Vite** (Build Tool & Dev Server) |
| --- | --- | --- |
| **Categoría** | Framework de Frontend / Interfaz de Usuario | Herramienta de compilación, empaquetado y dev server |
| **Objetivo Principal** | Crear la lógica de la aplicación, componentes visuales, reactividad y gestión de UI. | Servir el código a máxima velocidad en desarrollo y empaquetarlo de forma óptima para producción. |
| **Fase del Proyecto en que actúa** | En tiempo de ejecución (*Runtime*) en el navegador del usuario. | En tiempo de desarrollo (*Dev time*) y en el proceso de compilación (*Build time*). |
| **Dependencia tecnológica** | Es independiente del empaquetador (puede usarse con Vite, Webpack, Rspack o desde un CDN). | Es independiente del framework (funciona con Vue, React, Svelte, Vanilla JS, etc.). |
| **Manejo de Archivos `.vue**` | Define la estructura del componente (`<template>`, `<script>`, `<style>`). | Procesa y transpila los archivos `.vue` a JavaScript ejecutable utilizando `@vitejs/plugin-vue`. |
| **Reemplaza a...** | React, Angular, Svelte, jQuery. | Webpack, Parcel, Vue CLI, Create React App. |
| **Tecnologías Clave Internas** | Virtual DOM, Proxy Reactivity, Composition API. | Native ES Modules (ESM), esbuild, Rollup / Rolldown. |

---

### 4. ¿Qué es lo más recomendado en el entorno de desarrollo actual?

En el ecosistema moderno de desarrollo web, **lo recomendado es utilizar AMBOS en conjunto**.

1. **La combinación estándar (Vue 3 + Vite):**
Actualmente, el comando oficial recomendado por el equipo de Vue para iniciar un proyecto SPA (Single Page Application) es:
```bash
npm create vue@latest

```


Este comando andamiea un proyecto de **Vue 3 impulsado por Vite** por debajo. La antigua herramienta `Vue CLI` (basada en Webpack) ha quedado oficialmente en estado de mantenimiento/depreciada en favor de esta combinación.
2. **¿Por qué es el estándar actual?**
* **Productividad máxima:** Obtienes la expresividad y simplicidad de desarrollo de Vue 3 (con Composition API y `<script setup>`) sumada a la velocidad de desarrollo instantánea que ofrece Vite.
* **Cero configuración inicial:** Vite detecta y compila automáticamente los archivos de Vue mediante el plugin oficial `@vitejs/plugin-vue`.


3. **Cuándo elegir cada arquitectura:**
* **Vue + Vite:** Ideal para aplicaciones web del lado del cliente (SPAs), paneles de administración, dashboards SaaS y herramientas donde el renderizado sea en el navegador.
* **Nuxt (Vue + Vite + SSR):** Si el proyecto requiere **SEO estricto, renderizado en el servidor (SSR) o generación de sitios estáticos (SSG)**, la recomendación estándar del entorno actual es usar **Nuxt**, el cual también utiliza Vite internamente como motor de construcción.

---

## Vue 

**Bloque 1: Estructura de Archivos y Scripts de Ejecución**

En una aplicación Vue 3 con Vite, el proyecto mantiene una arquitectura donde `index.html` actúa como punto de anclaje, `src/main.js` como entrada del programa, `src/App.vue` como componente raíz y `src/components/` para los elementos reutilizables. Los comandos para operar el proyecto se definen dentro de `package.json`:

```javascript
// src/main.js
import { createApp } from 'vue'
import App from './App.vue'

// Instancia y monta la aplicación en el DOM
createApp(App).mount('#app')

```

```json
// package.json (fragmento de scripts)
{
  "scripts": {
    "dev": "vite",        // Servidor local de desarrollo con recarga rápida[cite: 1]
    "build": "vite build",  // Compilación optimizada para producción[cite: 1]
    "preview": "vite preview" // Previsualización local del build final
  }
}

```

---

**Bloque 2: Paso de Datos y Comunicación mediante Props y Eventos**

Las *props* permiten enviar datos desde un componente padre hacia un hijo de forma unidireccional y son estrictamente de solo lectura (*read-only*). Si el hijo necesita solicitar un cambio, debe emitir un evento hacia el padre usando `defineEmits` en lugar de mutar la prop.

```vue
<!-- src/components/ProductCard.vue (Hijo) -->
<script setup>
// Declaración de props que el componente espera recibir[cite: 1]
const props = defineProps({
  title: { type: String, required: true },
  price: { type: Number, default: 0 }
})

// Declaración de eventos que el hijo puede emitir al padre[cite: 1]
const emit = defineEmits(['delete-product'])

function solicitarBorrado() {
  emit('delete-product', props.title)
}
</script>

<template>
  <div class="card">
    <h3>{{ props.title }}</h3>
    <p>Precio: ${{ props.price }}</p>
    <button @click="solicitarBorrado">Eliminar</button>
  </div>
</template>

```

```vue
<!-- src/App.vue (Padre) -->
<script setup>
import ProductCard from './components/ProductCard.vue'

function manejarEliminacion(nombreProducto) {
  console.log(`Eliminar producto: ${nombreProducto}`)
}
</script>

<template>
  <!-- Envío de props y escucha del evento emitido por el hijo -->
  <ProductCard 
    title="Teclado Mecánico" 
    :price="85" 
    @delete-product="manejarEliminacion"
  />
</template>

```

---

**Bloque 3: Control de Formularios con Modificadores de Eventos**

El modificador `@submit.prevent` intercepta el evento de envío en los formularios HTML impidiendo la recarga de página por defecto (equivalente a `event.preventDefault()`).

```vue
<!-- src/components/LoginForm.vue -->
<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')

function procesarFormulario() {
  console.log('Enviando credenciales:', email.value, password.value)
}
</script>

<template>
  <!-- .prevent evita que el formulario recargue la página al hacer submit[cite: 1] -->
  <form @submit.prevent="procesarFormulario">
    <input v-model="email" type="email" placeholder="Correo electrónico" required />
    <input v-model="password" type="password" placeholder="Contraseña" required />
    
    <button type="submit">Ingresar</button>
  </form>
</template>

```

---

**Bloque 4: Navegación Dinámica con Vue Router**

Para capturar valores cambiantes dentro de la URL (rutas dinámicas), se especifican parámetros dinámicos prefijados por dos puntos (ej. `:id`). Dentro de `<script setup>`, la función `useRoute()` da acceso a dichos parámetros.

```javascript
// src/router/index.js (Configuración de rutas)
import { createRouter, createWebHistory } from 'vue-router'
import ProductDetail from '../views/ProductDetail.vue'

const routes = [
  {
    path: '/product/:id', // Parámetro dinámico :id[cite: 1]
    name: 'ProductDetail',
    component: ProductDetail
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

```

```vue
<!-- src/views/ProductDetail.vue -->
<script setup>
import { useRoute } from 'vue-router'
import { onMounted } from 'vue'

const route = useRoute()
// Lectura del parámetro :id desde la ruta actual[cite: 1]
const productId = route.params.id

onMounted(() => {
  console.log(`Cargando información para el ID: ${productId}`)[cite: 1]
})
</script>

<template>
  <div>
    <h2>Viendo detalles del producto #{{ productId }}</h2>
    <router-link to="/">Volver al inicio</router-link>
  </div>
</template>

```

---

**Bloque 5: Formas de Estilizado en Vue 3**

El atributo `<style scoped>` garantiza que el CSS afecte únicamente al HTML dentro del componente actual mediante identificadores de ámbito. También es posible usar selectores profundos como `:deep()` o vincular variables reactivas de JavaScript en la hoja de estilos a través de `v-bind()`.

```vue
<!-- src/components/StyledBox.vue -->
<script setup>
import { ref } from 'vue'

const temaColor = ref('#42b883')
</script>

<template>
  <div class="box">
    <p class="texto">Componente con estilos encapsulados y reactivos</p>
  </div>
</template>

<!-- scoped aísla las reglas de estilo de este archivo[cite: 1] -->
<style scoped>
.box {
  padding: 1.5rem;
  border: 2px solid v-bind(temaColor); /* Vinculación directa de variable JS a CSS */
  border-radius: 8px;
}

.texto {
  color: v-bind(temaColor);
}
</style>

```
