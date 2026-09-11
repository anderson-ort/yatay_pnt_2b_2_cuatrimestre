Se corrigieron los saltos de línea internos que rompían la tabla de la Sección 2, se eliminaron los artefactos de texto (``) en los bloques de código y se alineó la Sección 9 para reflejar el estándar actual (`create-vue` con Vite).

---

### 1. Historia, Funcionamiento y Utilidad Actual de Vue.js

* **Historia:** Vue.js fue creado en 2014 por **Evan You**. Nació de la idea de extraer lo que más le gustaba de AngularJS para crear un framework mucho más ligero, flexible y sin las complejidades innecesarias del ecosistema de la época.
* **Cómo funciona:**
* **Sistema de Reactividad (Proxies):** En Vue 3, los datos se envuelven en objetos `Proxy` de JavaScript. Esto permite detectar de forma automática cuando una propiedad cambia y actualizar únicamente las partes correspondientes de la interfaz de usuario.
* **Virtual DOM y Compilación:** Vue compila las plantillas HTML en funciones de renderizado optimizadas. Durante la compilación, analiza el código estático y marca las áreas dinámicas (*patch flags*), lo que permite ignorar los nodos estáticos durante las re-evaluaciones y lograr un rendimiento superior.


* **Por qué es útil en proyectos actuales:**
* **Framework Progresivo:** Permite integrarse progresivamente desde un simple archivo HTML mediante CDN hasta aplicaciones monopágina (*SPA*) complejas de escala empresarial.
* **Ecosistema Oficial Unificado:** A diferencia de otras alternativas, Vue mantiene de forma oficial sus librerías esenciales (Vue Router para enrutamiento, Pinia para estado global y Vite para compilación), asegurando compatibilidad continua.



---

### 2. Versiones y Comparativa: Composition API vs. Options API

* **Evolución de Versiones:**
* **Vue 1:** Enfoque inicial en manipulación sencilla del DOM y enlaces reactivos.
* **Vue 2:** Introducción del Virtual DOM y consolidación de la **Options API**.
* **Vue 3:** Reescritura total en TypeScript, motor de reactividad basado en Proxies de ES6 y presentación de la **Composition API**.



| Criterio | Options API | Composition API (`<script setup>`) |
| --- | --- | --- |
| **Estructura** | Organizada por opciones prefijadas (`data`, `methods`, `computed`, etc.). | Basada en funciones importadas explícitamente (`ref`, `computed`, etc.). |
| **Organización de Código** | La lógica de una sola función queda fragmentada en distintas opciones. | Permite agrupar variables y funciones por característica o caso de uso. |
| **Reutilización** | Depende de *Mixins* (propensos a colisiones de nombres y origen oscuro). | Utiliza *Composables* (funciones reutilizables y totalmente aisladas). |
| **Soporte TypeScript** | Limitado (requiere envoltorios complejos para inferir tipos). | Nativo y de primer nivel; inferencia directa de tipos. |
| **Uso recomendado** | Componentes pequeños o equipos en transición desde Vue 2. | Componentes medianos/grandes y proyectos de alta complejidad. |

---

### 3. Principios Básicos, SFC y Reactividad

* **Declarative Rendering (Renderizado Declarativo):** Vue extiende el HTML estándar con una sintaxis de plantilla que permite describir cómo debe verse la interfaz en función del estado.
* **Component-Based Architecture:** La interfaz se divide en componentes independientes, aislados y reutilizables.
* **Single-File Components (SFC - `.vue`):** Encapsula la estructura, lógica y estilos en un solo archivo con tres bloques principales:
1. `<template>`: Define la estructura visual HTML.
2. `<script setup>`: Aloja la lógica en JavaScript/TypeScript y el estado reactivo.
3. `<style scoped>`: CSS cuyos estilos se aplican exclusivamente al componente actual.



---

### 4. Guía Completa de Directivas de Vue.js

Las directivas son atributos especiales con el prefijo `v-` que aplican comportamiento reactivo al DOM:

* **`v-if` / `v-else` / `v-else-if`:** Renderizado condicional. Si la condición es falsa, el elemento no se crea en el DOM.

```html
<p v-if="isVisible">Visible</p>
<p v-else>No visible</p>

```

* **`v-show`:** Muestra u oculta un elemento modificando la propiedad CSS `display`. A diferencia de `v-if`, el elemento permanece siempre en el DOM.

```html
<p v-show="mostrar">Este texto alterna con v-show</p>

```

* **`v-for`:** Iteración sobre arrays u objetos para renderizar listas. Requiere el atributo dinámico `:key` para optimizar el DOM.

```html
<li v-for="item in items" :key="item.id">{{ item.name }}</li>

```

* **`v-model`:** Enlace bidireccional (*two-way data binding*) ideal para formularios. Sincroniza automáticamente el valor del input con la variable de estado.

```html
<input v-model="nombre" placeholder="Ingresa tu nombre">

```

* **`v-bind` (Sintaxis corta `:`):** Enlaza dinámicamente atributos HTML a expresiones reactivas.

```html
<img :src="imagenUrl" alt="Imagen dinámica">

```

* **`v-on` (Sintaxis corta `@`):** Vincula escuchadores de eventos del DOM a funciones de la lógica.

```html
<button @click="saludar">Ejecutar Acción</button>

```

---

### 5. Hooks y Reactividad (Composition API)

* **`setup` / `<script setup>`:** Primer hook que se ejecuta al inicializar el componente; define el entorno para la Composition API.
* **`ref()`:** Encapsula un valor (primitivo u objeto) dentro de una referencia reactiva. En el script se accede a través de `.value` y en la plantilla se desempaqueta automáticamente.
* **`computed()`:** Genera valores calculados reactivos basados en otras variables. Cuenta con almacenamiento en caché (*memorización*), recalculándose únicamente si sus dependencias cambian.
* **`onMounted()`:** Hook del ciclo de vida que se ejecuta cuando el componente ha sido montado en el DOM real. Ideal para peticiones a APIs.
* **Otros Hooks del Ciclo de Vida:**
* `onUpdated()`: Se ejecuta tras un cambio de estado que provoca la actualización del DOM.
* `onUnmounted()`: Se ejecuta cuando el componente es destruido o desmontado (limpieza de timers o eventos).



---

### 6. Características Principales del Ecosistema

* **Ruteo (Vue Router):** Permite crear SPAs con navegación mediante componentes como `<RouterLink>` y `<RouterView>`, utilizando `createWebHistory` para URLs limpias sin recargas de página. Soporta carga diferida (*lazy-loading*) con importaciones dinámicas.
* **Gestión de Estado (Pinia):** Almacén central de datos reactivos para compartir información entre componentes distantes sin prop drilling.
* **Empaquetado (Vite):** Entorno de desarrollo que aprovecha los módulos ES nativos del navegador para ofrecer un servidor ultra rápido con recarga de módulos en caliente (*HMR*).

---

### 7. Pruebas Automatizadas (Testing)

* **Unit Testing y Component Testing (Vitest / Jest):**
* **Vitest:** Es la herramienta de testing recomendada por el ecosistema Vue/Vite.
* **Vue Test Utils:** Librería oficial para montar componentes aislados, simular eventos del usuario y verificar renderizados o emisiones.


* **End-to-End Testing (E2E):**
* Soporte integrado en el ecosistema para herramientas como **Cypress**, **Playwright** o **Nightwatch** para evaluar los flujos de navegación y experiencia completa de usuario en navegadores reales.



---

### 8. Matriz Comparativa: Vue.js vs. Otras Herramientas

| Criterio | **Vue.js** | **React** | **Angular** | **Svelte** | **Astro** |
| --- | --- | --- | --- | --- | --- |
| **Tipo** | Framework Progresivo | Librería UI | Framework Robusto | Compilador | Framework MPAs/SSG |
| **Reactividad** | Automática por Proxies | Explícita (`useState`) | Basada en RxJS y Signals | En tiempo de compilación | Estática por defecto (Islas) |
| **Arquitectura** | SFC (`.vue`) o JSX | JSX (`.jsx`/`.tsx`) | Módulos / Decoradores | Archivos `.svelte` | Archivos `.astro` + Islas |
| **Curva de Aprendizaje** | Baja / Gradual | Media | Alta | Muy Baja | Baja |
| **Rendimiento** | Muy Alto | Alto | Medio / Alto | Ultra Alto | Ultra Alto (0 JS por defecto) |
| **Uso Principal** | SPAs, MPAs, Apps Web | SPAs, Ecosistema Móvil | Apps Empresariales | Apps ultra livianas | Sitios orientados a contenido |

---

### 9. Inicialización de Proyectos con `create-vue` (Vite)

> **Nota:** La herramienta clásica **Vue CLI** (`@vue/cli`) basada en Webpack está en modo de mantenimiento. El estándar actual recomendado por el equipo oficial de Vue es **`create-vue`**, impulsado por **Vite**.

#### Pasos para inicializar el proyecto:

```bash
npm create vue@latest

```

Sigue los prompts interactivos en la terminal para configurar TypeScript, Vue Router, Pinia o Vitest según los requerimientos de tu proyecto.

---

### Tarea para la Siguiente Clase

**Consigna: Lista de Compras Interactiva**

Crea una aplicación con Vue 3 que cumpla los siguientes requerimientos:

1. **Agregar productos:** Campo de texto donde el usuario escriba el nombre de un producto y lo agregue a la lista al presionar la tecla `Enter`.
2. **Mostrar la lista:** Contenedor que renderice iterativamente todos los productos ingresados.
3. **Marcar como "En el carrito":** Al hacer clic sobre un producto de la lista, su aspecto visual debe cambiar (ej. fondo verde o texto tachado). Un segundo clic devuelve el elemento a estado pendiente.
4. **Control de cantidades:** Muestra dos contadores calculados dinámicamente:
* Cantidad de productos en el carrito.
* Cantidad de productos pendientes por buscar.



---

### 10. Próximos Pasos: [Vite](https://vite.dev/)

Profundización en la configuración avanzada de Vite, optimización de bundles para producción y uso de plugins oficiales del ecosistema Vue.
