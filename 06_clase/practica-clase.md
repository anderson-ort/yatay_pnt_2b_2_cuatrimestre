# EcoNatura — Arquitectura Vue 3 + Supabase

**Desafío en Taller: Construyendo EcoNatura**

**Objetivo**
Armar en clase la arquitectura base de un catálogo interactivo en Vue 3, aplicando el desacoplamiento de la capa de datos y el flujo de datos unidireccional entre componentes.

---

**Pasos a Desarrollar**

* **1. Enrutamiento Inicial:** Configurar `vue-router` para navegar entre la vista principal (`/`), el catálogo (`/catalogo`) y la pantalla de acceso (`/auth`).
* **2. Componente de Producto (`ProductCard.vue`):** Diseñar la tarjeta para que reciba la información por `props` y notifique el clic en el botón de favoritos emitiendo un evento (`toggle-like`) al padre.
* **3. Estado del Catálogo (`CatalogView.vue`):** Manejar la lista de productos y la colección de favoritos utilizando un `Set` reactivo para controlar qué ítems tienen "me gusta".
* **4. Capa de Datos Desacoplada:** Consultar la información desde `services/api.js` simulando la latencia de red de una API real con un `setTimeout`.
* **5. Micro-interacciones:** Integrar `animejs` para animar la escala del logo al cargar la app y el botón de corazón al hacer clic.
* **6. Desafío Extra (Supabase RLS):** Analizar el script SQL y definir en grupo cómo las reglas RLS protegen los datos permitiendo lectura pública pero limitando la edición a usuarios autenticados.

---

**Preguntas para Debatir**

**1. Por qué `ProductCard` no debe mutar directamente la propiedad `liked**`

Esta regla responde al principio de **flujo de datos unidireccional** (*props down, events up*):

* **Fuente única de verdad:** El componente padre (`CatalogView`) es el dueño del estado de los favoritos. Si el hijo mutara la prop por su cuenta, el estado se fragmentaría y la aplicación perdería coherencia (por ejemplo, si un contador global en la barra de navegación necesitase saber cuántos likes hay en total).
* **Predictibilidad y advertencias de Vue:** Las props son estructuralmente de solo lectura. Si un componente hijo altera una prop, Vue emite una advertencia (*warning*) en consola porque cualquier nuevo renderizado del padre sobrescribirá los cambios locales del hijo.
* **Responsabilidad única:** La tarjeta solo presenta datos y avisa *"el usuario hizo clic acá"*. El padre decide qué lógica de negocio aplicar con esa notificación.

---

**2. Beneficios de aislar las peticiones en `services/api.js**`

Crea una **capa de abstracción** que desacopla la interfaz de usuario de la fuente de datos real:

* **Impacto cero en la UI al migrar:** `CatalogView` solo invoca `fetchProducts()` y espera recibir una Promesa con un arreglo de productos. No le importa si los datos vienen de un archivo JSON local, de Supabase o de un servidor REST legacy.
* **Un único punto de cambio:** Cuando sea momento de conectar Supabase, únicamente modificarás el código interno de `services/api.js`. No tendrás que tocar ni una sola línea en tus vistas ni componentes de Vue.
* **Desarrollo autónomo y testing:** Permite armar toda la experiencia de usuario y testear interacciones sin depender de un backend funcional, garantizando que el "contrato" de los datos ya esté definido para el día del despliegue.


## Estructura del Proyecto

```bash
econatura/
├── package.json
├── .env
└── src/
    ├── main.js
    ├── App.vue
    ├── router/
    │   └── index.js
    ├── services/
    │   └── supabase.js
    ├── components/
    │   ├── AnimatedLogo.vue
    │   └── ProductCard.vue
    └── views/
        ├── HomeView.vue
        ├── CatalogView.vue
        └── AuthView.vue
```

---

## 1. Datos Mock (`src/data/productos.mock.json`)

Mismo shape que la tabla `productos`, para desarrollar la UI sin backend real.

```json
[
  { "id": "1", "nombre": "Magnesio Bisglicinato 400mg", "descripcion": "Forma de magnesio de alta absorción, ideal para descanso y relajación muscular.", "categoria": "minerales", "precio": 8500.00, "stock": 60, "ingredientes": ["magnesio bisglicinato", "cápsula vegetal"], "imagen": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600" },
  { "id": "2", "nombre": "Omega 3 Aceite de Pescado", "descripcion": "Concentrado de EPA y DHA para salud cardiovascular y cognitiva.", "categoria": "acidos grasos", "precio": 9200.00, "stock": 45, "ingredientes": ["aceite de pescado", "vitamina e"], "imagen": "https://images.unsplash.com/photo-1550572017-edd951b55104?w=600" },
  { "id": "3", "nombre": "Vitamina D3 2000UI", "descripcion": "Soporte para sistema inmune y salud ósea, formato gotas.", "categoria": "vitaminas", "precio": 6300.00, "stock": 80, "ingredientes": ["colecalciferol", "aceite de oliva"], "imagen": "https://images.unsplash.com/photo-1550572017-9a3f3f9f3f3f?w=600" },
  { "id": "4", "nombre": "Complejo B Activado", "descripcion": "Vitaminas del grupo B en formas metiladas activas, para energía y sistema nervioso.", "categoria": "vitaminas", "precio": 10500.00, "stock": 30, "ingredientes": ["metilcobalamina", "metilfolato", "p5p"], "imagen": "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600" },
  { "id": "5", "nombre": "Ashwagandha KSM-66", "descripcion": "Adaptógeno tradicional para manejo del estrés y equilibrio hormonal.", "categoria": "adaptogenos", "precio": 11800.00, "stock": 40, "ingredientes": ["extracto de ashwagandha", "raíz"], "imagen": "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600" },
  { "id": "6", "nombre": "Colágeno Hidrolizado", "descripcion": "Péptidos de colágeno tipo I y III para piel, articulaciones y cabello.", "categoria": "proteinas", "precio": 13500.00, "stock": 25, "ingredientes": ["colágeno bovino hidrolizado", "vitamina c"], "imagen": "https://images.unsplash.com/photo-1622484212385-1c3a0e1f5b8b?w=600" },
  { "id": "7", "nombre": "Probióticos 20 Billones UFC", "descripcion": "Mezcla multicepa para equilibrio de la flora intestinal.", "categoria": "digestivo", "precio": 12400.00, "stock": 35, "ingredientes": ["lactobacillus", "bifidobacterium"], "imagen": "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600" },
  { "id": "8", "nombre": "Zinc Quelado 25mg", "descripcion": "Mineral esencial para sistema inmune y salud de la piel.", "categoria": "minerales", "precio": 5400.00, "stock": 70, "ingredientes": ["zinc bisglicinato"], "imagen": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600" },
  { "id": "9", "nombre": "Melatonina 3mg", "descripcion": "Apoyo natural para conciliar el sueño, formato sublingual.", "categoria": "descanso", "precio": 7100.00, "stock": 50, "ingredientes": ["melatonina", "manitol"], "imagen": "https://images.unsplash.com/photo-1607619056574-8c8e9e5e1e1e?w=600" },
  { "id": "10", "nombre": "Cúrcuma con Piperina", "descripcion": "Curcumina de alta biodisponibilidad para soporte antiinflamatorio natural.", "categoria": "antiinflamatorios", "precio": 8900.00, "stock": 55, "ingredientes": ["curcumina", "piperina", "cáscara vegetal"], "imagen": "https://images.unsplash.com/photo-1615485500704-8e990f9900f4?w=600" }
]
```

## 2. Servicio de Datos (`src/services/api.js`)

Contrato de promesa idéntico al que tendrá la versión con Supabase, para que migrar sea solo cambiar esta función.

```javascript
import mockData from '../data/productos.mock.json';

export const fetchProducts = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockData), 400); // simula latencia de red
  });
};

// Auth placeholder — sin backend real por ahora
export const signIn = (email, password) => Promise.resolve({ email });
export const signUp = (email, password) => Promise.resolve({ email });
```

---

## 2. Logo Animado (`src/components/AnimatedLogo.vue`)

Sin cambios respecto a la propuesta original: `animejs` sobre SVG en `onMounted`.

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

---

## 3. Tarjeta con Likes (`src/components/ProductCard.vue`)

Componente "tonto": recibe `product` y `liked` por `props`, y notifica el toggle mediante `emit`. La animación del corazón se hace con `animejs` al detectar el cambio.

```vue
<script setup>
import { ref } from 'vue';
import anime from 'animejs';

const props = defineProps({
  product: { type: Object, required: true },
  liked: { type: Boolean, default: false }
});

const emit = defineEmits(['toggle-like']);
const heartRef = ref(null);

const handleLike = () => {
  emit('toggle-like', props.product.id);
  anime({
    targets: heartRef.value,
    scale: [1, 1.4, 1],
    duration: 350,
    easing: 'easeOutBack'
  });
};
</script>

<template>
  <div class="card">
    <img :src="product.imagen" :alt="product.nombre" />
    <button ref="heartRef" class="heart-btn" @click="handleLike">
      {{ liked ? '❤' : '🤍' }}
    </button>
    <h3>{{ product.nombre }}</h3>
    <p class="categoria">{{ product.categoria }}</p>
    <p>${{ product.precio.toLocaleString() }}</p>
  </div>
</template>
```

---

## 4. Rutas (`src/router/index.js`)

```javascript
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import CatalogView from '../views/CatalogView.vue';
import AuthView from '../views/AuthView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/catalogo', component: CatalogView },
    { path: '/auth', component: AuthView }
  ]
});
```

---

## 5. Vista Catálogo (`src/views/CatalogView.vue`)

Contenedor: gestiona el estado de `products` y el `Set` de IDs favoritos (likes), y los pasa a `ProductCard` vía props, escuchando el `emit` para mutar el estado.

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard.vue';

const products = ref([]);
const loading = ref(true);
const likedIds = ref(new Set());

const toggleLike = (id) => {
  likedIds.value.has(id) ? likedIds.value.delete(id) : likedIds.value.add(id);
  likedIds.value = new Set(likedIds.value); // fuerza reactividad
};

onMounted(async () => {
  products.value = await fetchProducts();
  loading.value = false;
});
</script>

<template>
  <div>
    <div class="catalog-header">
      <h2>Catálogo de Productos</h2>
      <span class="like-counter">❤ {{ likedIds.size }} favoritos</span>
    </div>
    <p v-if="loading">Cargando catálogo...</p>
    <div v-else class="grid">
      <ProductCard
        v-for="item in products"
        :key="item.id"
        :product="item"
        :liked="likedIds.has(item.id)"
        @toggle-like="toggleLike"
      />
    </div>
  </div>
</template>
```

---

## 6. Vista Home (`src/views/HomeView.vue`)

Landing con logo animado, CTA hacia el catálogo y placeholders de login/registro.

```vue
<script setup>
import AnimatedLogo from '../components/AnimatedLogo.vue';
</script>

<template>
  <section class="hero">
    <AnimatedLogo />
    <h1>Bienestar natural, resultados reales</h1>
    <p>Suplementos y adaptógenos seleccionados para tu rutina diaria.</p>
    <div class="cta-group">
      <router-link to="/catalogo" class="btn-primary">Ver catálogo</router-link>
      <router-link to="/auth" class="btn-secondary">Ingresar / Registrarme</router-link>
    </div>
  </section>
</template>
```

---

## 7. Vista Auth (`src/views/AuthView.vue`)

Placeholder funcional conectado a Supabase Auth.

```vue
<script setup>
import { ref } from 'vue';
import { signIn, signUp } from '../services/api';

const email = ref('');
const password = ref('');
const mode = ref('login');

const submit = () =>
  mode.value === 'login'
    ? signIn(email.value, password.value)
    : signUp(email.value, password.value);
</script>

<template>
  <form @submit.prevent="submit">
    <h2>{{ mode === 'login' ? 'Ingresar' : 'Crear cuenta' }}</h2>
    <input v-model="email" type="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Contraseña" required />
    <button type="submit">{{ mode === 'login' ? 'Ingresar' : 'Registrarme' }}</button>
    <p @click="mode = mode === 'login' ? 'register' : 'login'">
      {{ mode === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Ingresá' }}
    </p>
  </form>
</template>
```

---

## Dependencias e instalación

Proyecto creado con Vite (`npm create vite@latest econatura -- --template vue`).

```json
{
  "name": "econatura",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.3.0",
    "animejs": "^3.2.2",
    "@supabase/supabase-js": "^2.45.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.2.0"
  }
}
```

Instalación:
```bash
npm create vite@latest econatura -- --template vue
cd econatura
npm install
npm install vue-router animejs @supabase/supabase-js
npm run dev
```

`@supabase/supabase-js` se instala ahora aunque `services/api.js` use el mock JSON, para no reinstalar nada al conectar el backend real — solo se reemplaza el contenido de ese archivo.

## Esquema Supabase (referencia)

```sql
CREATE TABLE IF NOT EXISTS productos (
  id uuid PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  nombre VARCHAR NOT NULL,
  descripcion VARCHAR,
  categoria VARCHAR,
  precio NUMERIC(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  ingredientes TEXT[],
  imagen VARCHAR,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica de productos"
ON productos FOR SELECT USING (true);

CREATE POLICY "Insercion solo autenticada"
ON productos FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Actualizacion solo autenticada"
ON productos FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Borrado solo autenticado"
ON productos FOR DELETE USING (auth.role() = 'authenticated');
```

---

## Decisiones de Diseño y Arquitectura

* **Principio de Responsabilidad Única:** `CatalogView` gestiona estado (productos, likes); `ProductCard` solo presenta y emite eventos.
* **Comunicación por Props/Emits:** el estado de "me gusta" vive en el padre; el hijo nunca lo muta directamente — dispara `toggle-like` y espera la nueva prop.
* **Capa de Datos Desacoplada:** `services/api.js` es el único punto que conoce el origen de datos (hoy mock, mañana Supabase); las vistas solo esperan un contrato (array de productos, promesas de auth).
* **RLS como contrato de seguridad:** lectura pública sin sesión, escritura solo autenticada — coherente con un catálogo público y un panel admin futuro.
* **Encapsulamiento de Animaciones:** tanto el logo como el corazón de "like" animan su propio DOM local con `animejs`, sin tocar estado global.
