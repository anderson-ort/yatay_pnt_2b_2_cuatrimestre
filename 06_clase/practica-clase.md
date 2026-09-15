**Estructura del Proyecto (`dir schema`)**

```text
econatura/
├── package.json
└── src/
    ├── main.js
    ├── App.vue
    ├── router/
    │   └── index.js
    ├── services/
    │   └── api.js
    ├── components/
    │   ├── AnimatedLogo.vue
    │   └── ProductCard.vue
    └── views/
        ├── HomeView.vue
        └── CatalogView.vue

```

---

**1. Capa de Datos (`src/services/api.js`)**
Abstrae el origen de la información. Si los datos cambian de un array local a un endpoint HTTP (`fetch`/`axios`), la vista no necesita modificarse.

```javascript
const MOCK_DATA = [
  { id: 1, name: 'Pack Anti-Estrés', price: 25.0, category: 'Packs' },
  { id: 2, name: 'Té Verde Orgánico', price: 12.5, category: 'Infusiones' }
];

export const fetchProducts = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_DATA), 400); // Simula latencia de red
  });
};

```

**2. Logo Animado (`src/components/AnimatedLogo.vue`)**
Componente visual autónomo. Aplica `animejs` sobre un gráfico SVG mediante el ciclo de vida `onMounted`.

```vue
<script setup>
import { onMounted } from 'vue';
import anime from 'animejs';

onMounted(() => {
  anime({
    targets: '.logo-shape',
    scale: [0.8, 1],
    opacity: [0, 1],
    easing: 'easeOutElastic(1, .8)',
    duration: 1200
  });
});
</script>

<template>
  <div class="logo-wrapper">
    <svg class="logo-shape" width="40" height="40" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="#4CAF50" />
    </svg>
    <span>EcoNatura</span>
  </div>
</template>

```

**3. Tarjeta Presentacional (`src/components/ProductCard.vue`)**
Componente "tonto" (presentacional) enfocado exclusivamente en renderizar las propiedades enviadas por el padre.

```vue
<script setup>
defineProps({
  product: { type: Object, required: true }
});
</script>

<template>
  <div class="card">
    <h3>{{ product.name }}</h3>
    <p>Precio: ${{ product.price }}</p>
  </div>
</template>

```

**4. Rutas (`src/router/index.js`)**
Maneja la navegación SPA sin recargar el navegador.

```javascript
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import CatalogView from '../views/CatalogView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/catalogo', component: CatalogView }
  ]
});

```

**5. Vista Catálogo (`src/views/CatalogView.vue`)**
Componente contenedor. Consume el servicio de datos en el `onMounted` y renderiza la lista usando `ProductCard`.

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard.vue';

const products = ref([]);
const loading = ref(true);

onMounted(async () => {
  products.value = await fetchProducts();
  loading.value = false;
});
</script>

<template>
  <div>
    <h2>Catálogo de Productos</h2>
    <p v-if="loading">Cargando catálogo...</p>
    <div v-else class="grid">
      <ProductCard v-for="item in products" :key="item.id" :product="item" />
    </div>
  </div>
</template>

```

---

**Decisiones de Diseño y Arquitectura**

* **Principio de Responsabilidad Única:** `CatalogView` gestiona la lógica de estado y carga, mientras que `ProductCard` se limita a la interfaz.
* **Mapeo Genérico de Datos:** Consumir datos mediante `Services` abstrae el backend; la vista solo espera un contrato (promesa) sin importar si viene de memoria o API REST.
* **Encapsulamiento de Animaciones:** Animar el SVG directamente dentro de `AnimatedLogo` evita contaminar el estado global o las vistas principales con código de manipulación DOM.

