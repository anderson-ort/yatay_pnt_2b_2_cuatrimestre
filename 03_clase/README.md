# Guía de Estudio: JavaScript Moderno y Preparación para Vue.js

## 1. Funciones

Las funciones en JavaScript son ciudadanos de primera clase (First-Class Citizens), lo que significa que pueden asignarse a variables, pasarse como argumentos a otras funciones y retornarse desde ellas.

### A. Funciones Declarativas (Function Declarations)

Sintaxis:

```javascript
function saludar(nombre) {
  return `Hola ${nombre}`;
}
```

**Característica principal:** Tienen Hoisting completo. Se "elevan" en memoria durante la fase de compilación, por lo que pueden ser llamadas antes del punto en el código donde fueron escritas.

### B. Funciones Expresivas (Function Expressions)

Sintaxis:

```javascript
const saludar = function(nombre) {
  return `Hola ${nombre}`;
};
```

**Característica principal:** Se asignan a una variable. No sufren de hoisting para la llamada antes de su asignación; deben definirse antes de invocarse.

### C. Parámetros por Defecto y Rest Parameters

```javascript
// Parámetro por defecto (si no se envía 'rol', toma 'Invitado')
function crearUsuario(nombre, rol = 'Invitado') {
  return { nombre, rol };
}

// Rest parameters: agrupa argumentos indefinidos en un Array
function sumarNumeros(...numeros) {
  return numeros.reduce((acc, n) => acc + n, 0);
}
```

---

## 2. Arrow Functions (Funciones Flecha)

Introducidas en ES6 (2015), ofrecen una sintaxis más corta y limpia.

```javascript
// Sintaxis corta con retorno implícito
const duplicar = x => x * 2;
const sumar = (a, b) => a + b;
```

### Diferencias clave con las funciones tradicionales

- **Binding léxico de `this`:** No crean su propio contexto de `this`. Heredan el `this` del ámbito (scope) padre donde fueron declaradas.
- **Sin objeto `arguments`:** No poseen la variable implícita `arguments` (se debe usar `...args`).
- **No son constructoras:** No pueden ser llamadas con la palabra clave `new` ni tienen propiedad `prototype`.

### ¿Cuándo NO usarlas?

Como métodos de objetos, si necesitas acceder a otras propiedades del mismo objeto usando `this`:

```javascript
const usuario = {
  nombre: "Carlos",
  // Error: 'this.nombre' será undefined porque 'this' apunta al scope global u otro externo
  saludar: () => `Hola ${this.nombre}`
};
```

En manejadores de eventos tradicionales del DOM donde necesites que `this` haga referencia al elemento HTML que disparó el evento (aunque con `event.currentTarget` se puede resolver).

---

## 3. Classes (Programación Orientada a Objetos en JS)

Las clases en JavaScript (ES6) son azúcar sintáctico sobre el sistema de prototipos (Prototypal Inheritance) nativo del lenguaje.

```javascript
class Persona {
  // Campo privado (ES2022) - solo accesible dentro de la clase
  #dni;

  constructor(nombre, edad, dni) {
    this.nombre = nombre;
    this.edad = edad;
    this.#dni = dni;
  }

  // Método de instancia
  saludar() {
    return `Hola, soy ${this.nombre} y tengo ${this.edad} años.`;
  }

  // Getter para acceder al campo privado de forma controlada
  get documento() {
    return this.#dni;
  }

  // Método estático (se llama directamente desde la Clase, no desde las instancias)
  static esMayorDeEdad(edad) {
    return edad >= 18;
  }
}

// Herencia de Clases
class Empleado extends Persona {
  constructor(nombre, edad, dni, puesto) {
    super(nombre, edad, dni); // Invocación al constructor de la clase base
    this.puesto = puesto;
  }

  saludar() {
    return `${super.saludar()} Trabajo como ${this.puesto}.`;
  }
}
```

---

## 4. Callbacks

Un Callback es una función que se pasa a otra función como argumento para ser ejecutada más tarde, una vez finalizada una tarea o ante un evento específico.

```javascript
function procesarEntradaUsuario(nombre, callback) {
  console.log("Procesando datos...");
  callback(nombre);
}

procesarEntradaUsuario("Laura", function(nombre) {
  console.log(`¡Bienvenida, ${nombre}!`);
});
```

---

## 5. Callback Hell y cómo evitarlo

### ¿Qué es el Callback Hell?

Ocurre cuando múltiples operaciones asíncronas encadenadas dependen unas de otras y se anidan profundamente utilizando callbacks. Forma la estructura conocida como "Pyramid of Doom" (Pirámide de la Perdición), haciendo que el código sea muy difícil de leer, mantener y depurar, además de complicar enormemente la captura de errores.

```javascript
// CALLBACK HELL (código difícil de leer y mantener)
obtenerUsuario(1, function(usuario) {
  obtenerPedidos(usuario.id, function(pedidos) {
    obtenerDetallePedido(pedidos[0].id, function(detalle) {
      procesarPago(detalle, function(resultado) {
        console.log("Pago procesado con éxito:", resultado);
      }, manejarError);
    }, manejarError);
  }, manejarError);
}, manejarError);
```

### ¿Cómo evitarlo?

**1. Promesas (`Promise`, `.then()`, `.catch()`)**

Una Promesa representa un valor que estará disponible ahora, en el futuro o nunca.

```javascript
obtenerUsuario(1)
  .then(usuario => obtenerPedidos(usuario.id))
  .then(pedidos => obtenerDetallePedido(pedidos[0].id))
  .then(detalle => procesarPago(detalle))
  .then(resultado => console.log("Pago exitoso:", resultado))
  .catch(error => console.error("Ocurrió un error:", error));
```

**2. Async / Await con `try...catch` (el estándar moderno)**

Permite escribir código asíncrono con sintaxis clara y secuencial (como si fuera síncrono).

```javascript
// SOLUCIÓN MODERNA Y LIMPIA
async function ejecutarFlujo() {
  try {
    const usuario = await obtenerUsuario(1);
    const pedidos = await obtenerPedidos(usuario.id);
    const detalle = await obtenerDetallePedido(pedidos[0].id);
    const resultado = await procesarPago(detalle);
    console.log("Pago exitoso:", resultado);
  } catch (error) {
    console.error("Error durante el proceso:", error);
  }
}
```

---

## 6. Fetch vs Axios

| Característica | Fetch API (Nativo) | Axios (Librería Externa) |
|---|---|---|
| Instalación | Integrado en el navegador. No requiere npm. | Requiere instalación (`npm i axios`, ~13KB). |
| Transformación de datos | Manual. Requiere dos pasos: `res.json()`. | Automático. Devuelve los datos en `response.data`. |
| Manejo de errores HTTP | No rechaza la promesa en errores 404 o 500. Hay que validar `res.ok === true`. | Rechaza automáticamente la promesa si el status no está en el rango 2xx (cae al `catch`). |
| Interceptores | No soporta nativamente. | Soporta interceptores para Request y Response (ideal para adjuntar tokens JWT). |
| Timeouts | Requiere configurar `AbortController`. | Soporta `timeout: 5000` directamente en la configuración. |

### Ejemplo comparativo de código

```javascript
// --- Con FETCH ---
async function getDataFetch() {
  try {
    const res = await fetch('https://api.example.com/data');
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}

// --- Con AXIOS ---
async function getDataAxios() {
  try {
    const { data } = await axios.get('https://api.example.com/data');
    return data;
  } catch (err) {
    console.error('Error capturado directamente:', err);
  }
}
```

---

## 7. LocalStorage vs SessionStorage

Ambos forman parte de la Web Storage API para guardar datos en formato clave-valor en el navegador.

> Nota: Solo almacenan texto (`String`), por lo que para objetos o arrays se requiere `JSON.stringify()` y `JSON.parse()`.

| Característica | LocalStorage | SessionStorage |
|---|---|---|
| Persistencia | Indefinida. Persiste tras cerrar el navegador o reiniciar la máquina. | Se borra automáticamente al cerrar la pestaña o ventana. |
| Alcance (scope) | Compartido entre todas las pestañas/ventanas del mismo origen (dominio). | Limitado a la pestaña específica donde se creó. |
| Capacidad | ~5MB - 10MB por origen. | ~5MB por origen. |
| Casos de uso | Tokens de autenticación, tema de la app (Dark/Light), preferencias del usuario. | Formularios en pasos, filtros temporales de búsqueda en la sesión actual. |

```javascript
const usuario = { nombre: "Carlos", rol: "Admin" };

// Guardar
localStorage.setItem('user', JSON.stringify(usuario));

// Leer
const userGuardado = JSON.parse(localStorage.getItem('user'));

// Eliminar elemento / Limpiar todo
localStorage.removeItem('user');
localStorage.clear();
```

---

## 8. Casos de Uso del DOM usando JavaScript Vainilla

El DOM (Document Object Model) es la representación estructurada en árbol del documento HTML.

**Selección de elementos:**

```javascript
const boton = document.querySelector('#btnEnviar');
const items = document.querySelectorAll('.item-lista');
```

**Manipulación de contenido y clases:**

```javascript
const titulo = document.querySelector('h1');
titulo.textContent = 'Nuevo Título';
titulo.classList.add('destacado');
titulo.classList.toggle('activo');
```

**Escucha de eventos y delegación:**

```javascript
const formulario = document.querySelector('#miForm');
formulario.addEventListener('submit', (event) => {
  event.preventDefault(); // Evita la recarga de la página
  console.log('Formulario enviado sin recargar');
});
```

**Creación y renderizado dinámico de nodos:**

```javascript
const contenedor = document.querySelector('#lista');
const nuevoLi = document.createElement('li');
nuevoLi.textContent = 'Elemento creado dinámicamente';
contenedor.appendChild(nuevoLi);
```

---

## 9. Conceptos JS Clave Adicionales para Afrontar Vue.js

Para aprender Vue 3 (tanto en Composition API con `<script setup>` como en Options API), se deben dominar los siguientes prerrequisitos:

**Desestructuración (Destructuring) de objetos y arrays**

En Vue se usa todo el tiempo al importar funciones o extraer valores de objetos reactivos y props.

```javascript
const { createApp, ref, computed } = Vue;
const [primero, segundo] = lista;
```

**Métodos funcionales de arrays (`map`, `filter`, `reduce`, `find`, `some`, `every`)**

Esenciales para trabajar con renderizado de listas (`v-for`) y para crear Computed Properties (propiedades computadas) eficientes.

```javascript
const tareasCompletadas = computed(() => tareas.value.filter(t => t.completada));
```

**Módulos ES6 (`import` / `export`)**

La arquitectura de Vue es modular. Cada componente `.vue` o archivo composable `.js`/`.ts` exporta e importa lógica.

```javascript
import MyComponent from './components/MyComponent.vue';
export default { ... }
```

**Operador Spread (`...`) e inmutabilidad**

Vue detecta mejor los cambios reactivos cuando se modifican objetos/arrays de manera inmutable creando nuevas copias.

```javascript
const nuevoEstado = { ...estadoAnterior, actualizado: true };
```

**Template literals y encadenamiento opcional (`?.` / `??`)**

Evita errores en tiempo de ejecución cuando los datos de una API aún no han llegado a las plantillas de Vue:

```javascript
usuario?.perfil?.direccion ?? 'Dirección no registrada'
```

---

## 10. Tabla Comparativa: ¿Por qué iniciar estudiando JavaScript vs TypeScript?

TypeScript (TS) es un superset de JavaScript que añade tipado estático en tiempo de compilación. Aunque TS es un estándar industrial en grandes proyectos, empezar estudiando directamente TS antes de dominar JS suele generar sobrecarga cognitiva innecesaria.

| Criterio | JavaScript (JS) | TypeScript (TS) | ¿Por qué empezar con JS? |
|---|---|---|---|
| Curva de aprendizaje | Suave y directa. Centrada en entender algoritmos, sintaxis, asincronía y el DOM. | Empinada. Suma conceptos de interfaces, tipos, genéricos, enums y decoradores. | Permite concentrarse en la lógica de programación y el flujo de trabajo sin lidiar con errores del compilador. |
| Comprensión del runtime | Directa. El código que escribes es exactamente el que se ejecuta en el navegador o Node.js. | Indirecta. Se transpila a JS. Si ocurre un fallo en producción, se depura código JS compilado. | Sin entender cómo funciona el runtime de JS (coerción de tipos, prototipos, event loop), es difícil depurar TS. |
| Configuración inicial (tooling) | Cero configuración. Se crea un archivo `.js` o se usa la consola del navegador y se ejecuta al instante. | Requiere herramientas: `tsc`, configurar `tsconfig.json`, transpiladores y bundlers (Vite/Webpack). | Evita la frustración técnica por problemas de configuración antes de escribir la primera línea de código. |
| Detección de errores | En tiempo de ejecución (runtime). Los errores de tipo saltan al probar la aplicación. | En tiempo de compilación (compile-time). El IDE avisa los errores de tipo antes de ejecutar. | Aunque TS ayuda mucho en proyectos grandes, entender los tipos dinámicos de JS ayuda a valorar la utilidad real de TS. |
| Veloz prototipado e inicio | Muy rápido. Se escribe código flexible sin necesidad de definir contratos o estructuras de datos previas. | Más lento al inicio. Hay que definir interfaces/tipos detallados para casi cualquier variable u objeto. | Otorga agilidad al estudiante para crear proyectos pequeños y experimentos rápidos. |
| Preparación para Vue 3 | Base obligatoria. Los conceptos de reactividad (`ref`, `reactive`), componentes y del DOM son 100% JS. | Paso siguiente ideal. Vue 3 está escrito en TS y ofrece un autocompletado excelente si se integra TS. | Para usar TypeScript en Vue eficientemente, primero se debe comprender la sintaxis y reactividad base en JS. |

### Resumen pedagógico

JavaScript es el motor; TypeScript es la armadura y el control de calidad. Intentar aprender a conducir (lógica, asincronía, manipulación del DOM y un framework como Vue) mientras simultáneamente se aprende a forjar la armadura (sistema de tipos estáticos complejos) entorpece la curva de aprendizaje. Primero se domina JavaScript; luego, adoptar TypeScript será natural y muy fluido.