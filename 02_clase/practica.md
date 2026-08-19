# GUÍA PRÁCTICA DE EJERCICIOS (HTML, CSS Y JS VANILLA)

Esta sección contiene ejercicios diseñados para ejecutarse exclusivamente con **HTML5, CSS3 y JavaScript Puro (Vanilla JS)**, sin necesidad de empaquetadores ni librerías externas.

---

## SECCIÓN A: EJERCICIOS DE CONSOLIDACIÓN TÉCNICA (JavaScript ES6)

### Ejercicio A.1: Variables y Ámbitos

1. Declara una variable con `let` para tu edad y una con `const` para tu nombre. Intenta reasignar ambas y observa el comportamiento en la consola.
2. Crea una función donde declares variables con `var`, `let` y `const` dentro de un bloque `if(true)`. Imprime sus valores dentro y fuera del bloque e interpreta el resultado.
3. Declara una constante de tipo objeto `persona`. Modifica su propiedad `edad` y añade una propiedad `ciudad`. Explica por qué es posible si fue declarada con `const`.

### Ejercicio A.2: Manipulación de Arrays

1. Dado el array `["Manzana", "Banana", "Naranja"]`, añade `"Frutilla"` al final con `push()` y `"Pera"` al inicio con `unshift()`.
2. Dado el array `[10, 20, 30, 40, 50, 60]`, utiliza `splice()` para eliminar el primer y el último elemento sin crear un nuevo array.
3. Dado un array de números `[1, 2, 3, 4, 5]`, crea un nuevo array con los dobles de cada número usando un bucle `for` y luego haz lo mismo usando `.map()`.

### Ejercicio A.3: Objetos y Métodos

1. Crea un objeto `libro` con `titulo`, `autor`, `año` y un método `obtenerResumen()` que devuelva una cadena interpolada con sus datos.
2. Crea un objeto `calculadora` con métodos `sumar(a, b)`, `restar(a, b)`, `multiplicar(a, b)` y `dividir(a, b)`. Utiliza funciones flecha en sus declaraciones.

### Ejercicio A.4: Métodos de Array de ES6 (`map`, `filter`, `find`, `reduce`)

Dado el siguiente array de estudiantes:

```javascript
const estudiantes = [
  { nombre: "Laura", edad: 22, nota: 8 },
  { nombre: "Martín", edad: 27, nota: 5 },
  { nombre: "Diego", edad: 30, nota: 9 },
  { nombre: "Sofía", edad: 24, nota: 4 }
];

```

1. Utiliza `filter()` para obtener solo los estudiantes aprobados (`nota >= 6`).
2. Utiliza `map()` para extraer un array que contenga solo los nombres de los estudiantes.
3. Utiliza `find()` para encontrar al primer estudiante mayor de 25 años.
4. Utiliza `reduce()` para calcular la nota promedio de toda la clase.

### Ejercicio A.5: Spread, Destructuring y Rest

1. Usa el operador Spread para combinar dos arrays de colores: `["Rojo", "Verde"]` y `["Azul", "Amarillo"]`.
2. Dado el objeto `persona = { nombre: "Mariana", edad: 31, ocupacion: "Diseñadora" }`, usa *Destructuring* para extraer `nombre` y `ocupacion` en variables independientes.
3. Crea una función flecha `sumarIndefinido(...numeros)` que reciba cualquier cantidad de números como argumentos utilizando *Rest Parameters* y devuelva su suma total.

---

## SECCIÓN B: PROYECTOS INTEGRADORES DE INTERFAZ (HTML + CSS + JS VANILLA)

Para cada uno de los siguientes proyectos, crea una estructura de archivos limpia:

* `index.html`
* `styles.css`
* `app.js`

---

### Proyecto 1: Tarjeta de Perfil Dinámica (DOM + Template Literals + Destructuring)

#### Requerimiento

Construye una aplicación donde un objeto JavaScript con la información de un usuario se renderice dinámicamente en una tarjeta HTML utilizando *Template Literals* y *Destructuring*. Debe permitir cambiar el estado de conexión del usuario con un botón.

#### Archivo `index.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Perfil Dinámico</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main class="container">
    <div id="user-card-container"></div>
    <button id="toggle-status-btn" class="btn">Cambiar Estado</button>
  </main>
  <script src="app.js"></script>
</body>
</html>

```

#### Archivo `styles.css`

```css
body {
  font-family: Arial, sans-serif;
  background-color: #f4f7f6;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

.container {
  text-align: center;
}

.card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 280px;
  margin-bottom: 16px;
}

.avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  margin-top: 8px;
}

.status-online {
  background-color: #2ecc71;
}

.status-offline {
  background-color: #e74c3c;
}

.btn {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn:hover {
  background-color: #2980b9;
}

```

#### Archivo `app.js`

```javascript
// Estado inicial de la aplicación
const usuario = {
  nombre: "Valeria Gómez",
  rol: "Desarrolladora Frontend",
  avatarUrl: "[https://via.placeholder.com/90](https://via.placeholder.com/90)",
  online: true
};

const cardContainer = document.getElementById("user-card-container");
const toggleBtn = document.getElementById("toggle-status-btn");

// Función de renderizado utilizando Template Literals y Destructuring
const renderUserCard = (user) => {
  const { nombre, rol, avatarUrl, online } = user;
  
  const statusClass = online ? "status-online" : "status-offline";
  const statusText = online ? "En línea" : "Desconectado";

  cardContainer.innerHTML = `
    <article class="card">
      <img src="${avatarUrl}" alt="${nombre}" class="avatar">
      <h2>${nombre}</h2>
      <p>${rol}</p>
      <span class="status-badge ${statusClass}">${statusText}</span>
    </article>
  `;
};

// Evento para modificar el estado
toggleBtn.addEventListener("click", () => {
  usuario.online = !usuario.online; // Alternar estado
  renderUserCard(usuario); // Re-renderizar UI
});

// Render inicial
renderUserCard(usuario);

```

---

### Proyecto 2: Catálogo de Productos con Filtro en Tiempo Real (Arrays + Filter + Map)

#### Requerimiento

Crea un catálogo interactivo que renderice una lista de productos. Incluye un menú desplegable (`<select>`) para filtrar los productos por categoría de forma dinámica usando `.filter()` y `.map()`.

#### Archivo `index.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Catálogo de Productos</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="app-container">
    <h1>Catálogo de Productos</h1>
    
    <div class="filter-section">
      <label for="category-select">Filtrar por categoría:</label>
      <select id="category-select">
        <option value="todos">Todos</option>
        <option value="Electrónica">Electrónica</option>
        <option value="Ropa">Ropa</option>
        <option value="Hogar">Hogar</option>
      </select>
    </div>

    <div id="products-grid" class="grid"></div>
  </div>
  <script src="app.js"></script>
</body>
</html>

```

#### Archivo `styles.css`

```css
body {
  font-family: Arial, sans-serif;
  background-color: #f8f9fa;
  margin: 0;
  padding: 32px;
}

.app-container {
  max-width: 900px;
  margin: 0 auto;
}

.filter-section {
  margin-bottom: 24px;
}

select {
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.product-card {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
}

.category-tag {
  font-size: 12px;
  color: #7f8c8d;
  text-transform: uppercase;
}

```

#### Archivo `app.js`

```javascript
const productos = [
  { id: 1, titulo: "Auriculares Bluetooth", categoria: "Electrónica", precio: 45 },
  { id: 2, titulo: "Camiseta de Algodón", categoria: "Ropa", precio: 20 },
  { id: 3, titulo: "Lámpara de Escritorio", categoria: "Hogar", precio: 30 },
  { id: 4, titulo: "Teclado Gamer", categoria: "Electrónica", precio: 85 },
  { id: 5, titulo: "Pantalón Jean", categoria: "Ropa", precio: 50 },
  { id: 6, titulo: "Cafetera Express", categoria: "Hogar", precio: 120 }
];

const gridContainer = document.getElementById("products-grid");
const categorySelect = document.getElementById("category-select");

// Función para renderizar lista de productos en el DOM
const renderProducts = (items) => {
  if (items.length === 0) {
    gridContainer.innerHTML = `<p>No se encontraron productos.</p>`;
    return;
  }

  gridContainer.innerHTML = items.map(({ titulo, categoria, precio }) => `
    <article class="product-card">
      <div>
        <span class="category-tag">${categoria}</span>
        <h3>${titulo}</h3>
      </div>
      <p class="price">$${precio}</p>
    </article>
  `).join("");
};

// Listener para el evento de filtrado
categorySelect.addEventListener("change", (e) => {
  const selectedCategory = e.target.value;

  const productosFiltrados = selectedCategory === "todos"
    ? productos
    : productos.filter(p => p.categoria === selectedCategory);

  renderProducts(productosFiltrados);
});

// Carga inicial
renderProducts(productos);

```

---

### Proyecto 3: Gestor de Carrito de Compras Inmutable (Spread Operator + Eventos)

#### Requerimiento

Implementa un carrito de compras interactivo en donde se puedan agregar y eliminar productos. La manipulación del estado del carrito debe ser estrictamente **inmutable** utilizando el operador Spread (`...`) y el método `.filter()`, mostrando el costo total acumulado con `.reduce()`.

#### Archivo `index.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Carrito Inmutable</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <div class="shop">
      <h2>Tienda</h2>
      <div id="store-items"></div>
    </div>
    <div class="cart">
      <h2>Carrito de Compras</h2>
      <ul id="cart-list"></ul>
      <div class="cart-total">
        <strong>Total: $<span id="cart-total-amount">0</span></strong>
      </div>
    </div>
  </div>
  <script src="app.js"></script>
</body>
</html>

```

#### Archivo `styles.css`

```css
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 24px;
  background-color: #f0f2f5;
}

.container {
  display: flex;
  gap: 32px;
  max-width: 800px;
  margin: 0 auto;
}

.shop, .cart {
  background: white;
  padding: 20px;
  border-radius: 8px;
  flex: 1;
}

.store-item, .cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

button {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

button.delete-btn {
  background-color: #c0392b;
}

.cart-total {
  margin-top: 16px;
  font-size: 18px;
  text-align: right;
}

```

#### Archivo `app.js`

```javascript
const productosDisponibles = [
  { id: 101, nombre: "Mouse Óptico", precio: 15 },
  { id: 102, nombre: "Monitor 24'", precio: 180 },
  { id: 103, nombre: "Pad Mouse XL", precio: 25 }
];

// Estado global del carrito
let carrito = [];

const storeContainer = document.getElementById("store-items");
const cartList = document.getElementById("cart-list");
const totalAmountEl = document.getElementById("cart-total-amount");

// Renderizar tienda
const renderStore = () => {
  storeContainer.innerHTML = productosDisponibles.map(item => `
    <div class="store-item">
      <span>${item.nombre} - $${item.precio}</span>
      <button onclick="agregarAlCarrito(${item.id})">Agregar</button>
    </div>
  `).join("");
};

// Renderizar carrito y calcular total con reduce
const renderCart = () => {
  cartList.innerHTML = carrito.map((item, index) => `
    <li class="cart-item">
      <span>${item.nombre} ($${item.precio})</span>
      <button class="delete-btn" onclick="eliminarDelCarrito(${index})">X</button>
    </li>
  `).join("");

  const total = carrito.reduce((acc, item) => acc + item.precio, 0);
  totalAmountEl.textContent = total;
};

// Agregar al carrito con Spread Operator (Inmutabilidad)
window.agregarAlCarrito = (id) => {
  const productoElegido = productosDisponibles.find(p => p.id === id);
  if (productoElegido) {
    // Generar un nuevo array agregando el elemento
    carrito = [...carrito, { ...productoElegido, cartId: Date.now() }];
    renderCart();
  }
};

// Eliminar del carrito de forma inmutable usando filter
window.eliminarDelCarrito = (indexAEliminar) => {
  carrito = carrito.filter((_, index) => index !== indexAEliminar);
  renderCart();
};

// Inicializar
renderStore();
renderCart();

```

---

### Proyecto 4: Formulario de Registro e Intercambio de Datos JSON (Validation + JSON.stringify)

#### Requerimiento

Crea un formulario de registro. Al enviarlo, valida la concordancia de contraseñas, procesa la entrada, empaqueta la información utilizando `JSON.stringify()` y simula el envío HTTP mostrando el JSON resultante en un bloque `<pre>` estilizado.

#### Archivo `index.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Formulario JSON</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="form-card">
    <h2>Registro de Usuario</h2>
    <form id="register-form">
      <div class="field">
        <label>Nombre:</label>
        <input type="text" id="nombre" required>
      </div>
      <div class="field">
        <label>Email:</label>
        <input type="email" id="email" required>
      </div>
      <div class="field">
        <label>Contraseña:</label>
        <input type="password" id="password" required>
      </div>
      <div class="field">
        <label>Confirmar Contraseña:</label>
        <input type="password" id="confirm-password" required>
      </div>
      <button type="submit" class="submit-btn">Enviar Datos</button>
    </form>

    <div id="error-msg" class="error"></div>

    <div class="output-section">
      <h3>Payload JSON Generado (simulación HTTP POST):</h3>
      <pre id="json-output">// Esperando datos del formulario...</pre>
    </div>
  </div>
  <script src="app.js"></script>
</body>
</html>

```

#### Archivo `styles.css`

```css
body {
  font-family: Arial, sans-serif;
  background-color: #2c3e50;
  color: #333;
  display: flex;
  justify-content: center;
  padding-top: 40px;
  margin: 0;
}

.form-card {
  background: white;
  padding: 28px;
  border-radius: 8px;
  width: 380px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.field {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

label {
  font-size: 13px;
  margin-bottom: 4px;
  font-weight: bold;
}

input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.submit-btn {
  width: 100%;
  padding: 10px;
  background-color: #8e44ad;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.error {
  color: #e74c3c;
  font-size: 13px;
  margin-top: 12px;
}

.output-section {
  margin-top: 24px;
}

pre {
  background: #272822;
  color: #f8f8f2;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  overflow-x: auto;
}

```

#### Archivo `app.js`

```javascript
const form = document.getElementById("register-form");
const errorMsg = document.getElementById("error-msg");
const jsonOutput = document.getElementById("json-output");

form.addEventListener("submit", (e) => {
  e.preventDefault(); // Prevenir recarga de página
  errorMsg.textContent = "";

  // Captura de datos
  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  // Validación
  if (password !== confirmPassword) {
    errorMsg.textContent = "Las contraseñas no coinciden.";
    return;
  }

  // Construcción del objeto de envío
  const payload = {
    nombre,
    email,
    password, // En producción no se enviaría en texto plano
    fechaRegistro: new Date().toISOString()
  };

  // Conversión a JSON con formato legible (indentación de 2 espacios)
  const jsonString = JSON.stringify(payload, null, 2);

  // Muestra del payload
  jsonOutput.textContent = jsonString;
  console.log("Simulando HTTP POST a /api/register con Headers: Content-Type: application/json");
});

```

'''

with open("Clase_JavaScript_ES6.md", "w", encoding="utf-8") as f:
f.write(markdown_content)

print("Archivo Clase_JavaScript_ES6.md generado con éxito.")

```

```text?code_stdout&code_event_index=1
Archivo Clase_JavaScript_ES6.md generado con éxito.


```

Your Markdown file is ready


---

# Clase Magistral Unificada: JavaScript ES6 (Teoría y Práctica)

---

# PARTE 1: MÓDULO TEÓRICO COMPLETO (ES6+)

---

## 1. Introducción al Entorno y Ecosistema Moderno

### 1.1 Entornos de Ejecución

JavaScript puede ejecutarse en dos entornos principales:

* **Navegador Web (Frontend):** Utiliza motores como V8 (Chrome, Edge), SpiderMonkey (Firefox) o JavaScriptCore (Safari). Tiene acceso directo al DOM (*Document Object Model*) y a las APIs del navegador (`fetch`, `localStorage`, etc.).
* **Servidor / Terminal (Node.js):** Entorno de ejecución fuera del navegador basado en el motor V8. Permite construir aplicaciones de servidor, herramientas CLI y acceder al sistema de archivos local (`fs`), red, etc.

---

### 1.2 Protocolo HTTP y Comunicación Web

La comunicación cliente-servidor se realiza mediante solicitudes (*Requests*) y respuestas (*Responses*) usando el protocolo HTTP:

#### Métodos HTTP Principales

* `GET`: Solicita y obtiene recursos o datos del servidor. No altera el estado.
* `POST`: Envía datos al servidor para crear un nuevo recurso.
* `PUT` / `PATCH`: Actualiza un recurso existente (`PUT` reemplaza completamente; `PATCH` modifica parcialmente).
* `DELETE`: Elimina un recurso especificado en el servidor.

#### Códigos de Estado HTTP

* `200 OK`: La petición fue exitosa y se retorna la información solicitada.
* `400 Bad Request`: La petición enviada por el cliente contiene un formato inválido o faltan datos.
* `404 Not Found`: El recurso solicitado no existe en el servidor.
* `500 Internal Server Error`: Ocurrió un fallo no controlado en el servidor al procesar la petición.

---

### 1.3 Formato de Intercambio: JSON (JavaScript Object Notation)

JSON es el estándar liviano para el intercambio de datos entre cliente y servidor. Es un formato de texto estructurado en pares clave-valor.

```javascript
// Objeto de JavaScript en memoria
const usuario = {
  id: 1,
  nombre: "Ana Pérez",
  activo: true
};

// 1. JSON.stringify(): Convierte un objeto/array de JS a un string formato JSON para enviarlo por HTTP
const jsonString = JSON.stringify(usuario);
console.log(jsonString);
// Resultado: '{"id":1,"nombre":"Ana Pérez","activo":true}'

// 2. JSON.parse(): Convierte una cadena de texto JSON a un objeto/array de JS manipulable
const objetoParseado = JSON.parse(jsonString);
console.log(objetoParseado.nombre); // "Ana Pérez"

```

---

### 1.4 JavaScript vs Java

A pesar de la similitud en el nombre, son lenguajes con filosofías y arquitecturas distintas:

| Característica | Java | JavaScript |
| --- | --- | --- |
| **Tipado** | Estático y Fuerte (las variables requieren declarar su tipo) | Dinámico y Débil/Flexible (el tipo se infiere en ejecución) |
| **Paradigma Principal** | Orientado a Objetos basado en Clases rígidas | Multiparadigma (Funcional, Orientado a Objetos basado en Prototipos) |
| **Compilación/Ejecución** | Compilado a Bytecode (`.class`) y ejecutado en JVM | Interpretado / Compilado JIT (*Just-In-Time*) en el motor |

---

## 2. Declaración de Variables y Ámbito (Scope)

En ES6+ se introducen `let` y `const` para solucionar los problemas históricos de `var`.

```javascript
// var: Ámbito de función o global. Sufre de Hoisting y permite re-declaración (Mala práctica)
var x = 10;
var x = 20; // Permitido (propenso a errores)

// let: Ámbito de bloque (Block Scope). Reasignable, pero NO re-declarable en el mismo ámbito.
let contador = 1;
contador = 2; // Válido

// const: Ámbito de bloque (Block Scope). NO reasignable y requiere valor inicial.
const PI = 3.14159;
// PI = 3.14; // Uncaught TypeError: Assignment to constant variable.

```

### Demostración de Ámbito de Bloque (*Block Scope*)

Un bloque está delimitado por llaves `{}` (como en `if`, `for`, o funciones).

```javascript
function probarScope() {
  if (true) {
    var dentroIfVar = "Var en IF";
    let dentroIfLet = "Let en IF";
    const dentroIfConst = "Const en IF";
  }

  console.log(dentroIfVar); // Imprime: "Var en IF" (Escapa al bloque {})
  // console.log(dentroIfLet); // Error: dentroIfLet is not defined
  // console.log(dentroIfConst); // Error: dentroIfConst is not defined
}
probarScope();

```

### Inmutabilidad en `const` con Objetos y Arrays

`const` impide reasignar la referencia de la variable, pero los objetos y arrays declarados con `const` son **mutables** en su contenido interior.

```javascript
const persona = { nombre: "Carlos", edad: 25 };
persona.edad = 26; // PERMITIDO: Se modifica una propiedad del objeto
persona.ciudad = "Mendoza"; // PERMITIDO: Se añade una propiedad

console.log(persona); // { nombre: "Carlos", edad: 26, ciudad: "Mendoza" }

// persona = { nombre: "Juan" }; // ERROR: Reasignación de la referencia

```

---

## 3. Tipos de Datos en JavaScript

### Tipos Primitivos (Inmutables, paso por valor)

1. `String`: Cadenas de texto.
2. `Number`: Números enteros y de coma flottante.
3. `Boolean`: `true` o `false`.
4. `Undefined`: Variable declarada sin valor asignado.
5. `Null`: Ausencia intencional de valor.
6. `Symbol` / `BigInt`: Identificadores únicos y enteros de precisión arbitraria.

### Tipos Complejos / Por Referencia (Mutables, paso por referencia)

1. `Object`: Colección de pares clave-valor.
2. `Array`: Colección ordenada de elementos.
3. `Function`: Funciones como ciudadanos de primera clase (*First-Class Functions*), lo que significa que pueden ser asignadas a variables, pasadas como argumentos y retornadas desde otras funciones.

---

## 4. Control de Flujo

### 4.1 Condicionales (`if / else`, Operador Ternario, `switch`)

```javascript
const nota = 85;

// if / else if / else
if (nota >= 90) {
  console.log("Excelente");
} else if (nota >= 70) {
  console.log("Aprobado");
} else {
  console.log("Reprobado");
}

// Operador Ternario (condición ? verdadero : falso)
const estado = nota >= 70 ? "Aprobado" : "Reprobado";

// Switch
const mes = 3;
switch (mes) {
  case 1:
  case 2:
  case 12:
    console.log("Verano");
    break;
  case 3:
  case 4:
  case 5:
    console.log("Otoño");
    break;
  default:
    console.log("Otra estación");
}

```

### 4.2 Bucles (`for`, `while`)

```javascript
// Bucle for
for (let i = 1; i <= 3; i++) {
  console.log(`Iteración ${i}`);
}

// Bucle while
let contador = 1;
while (contador <= 3) {
  console.log(`Contador while: ${contador}`);
  contador++;
}

```

---

## 5. Funciones y Arrow Functions (ES6)

Las *Arrow Functions* introducen una sintaxis más corta y no poseen su propio binding de `this`, `arguments` o `super`.

### Comparación de Sintaxis

```javascript
// 1. Función Tradicional
function sumarTradicional(a, b) {
  return a + b;
}

// 2. Arrow Function (Sintaxis completa)
const sumarArrow = (a, b) => {
  return a + b;
};

// 3. Arrow Function con Retorno Implícito (una sola expresión)
const sumarCorta = (a, b) => a + b;

// 4. Arrow Function con un solo parámetro (paréntesis opcionales)
const cuadrado = x => x * x;

console.log(sumarCorta(5, 10)); // 15
console.log(cuadrado(4)); // 16

```

---

## 6. Estructuras de Datos: Arrays y Métodos Modernos

Un array en JS es una lista ordenada indexada desde cero (`0-based`).

### 6.1 Métodos de Modificación Directa (Mutables)

* `push(elem)`: Agrega al final.
* `pop()`: Elimina y devuelve el último elemento.
* `unshift(elem)`: Agrega al principio.
* `shift()`: Elimina y devuelve el primer elemento.
* `splice(inicio, borrarCantidad, ...items)`: Modifica el array eliminando, reemplazando o agregando elementos en cualquier índice.

```javascript
const frutas = ["Manzana", "Banana", "Naranja"];

// Operaciones de pila
frutas.push("Uva"); // ["Manzana", "Banana", "Naranja", "Uva"]
frutas.unshift("Pera"); // ["Pera", "Manzana", "Banana", "Naranja", "Uva"]

// Splice: Modificación quirúrgica
// Sintaxis: array.splice(índice_inicio, cantidad_eliminar, nuevo_elemento1, ...)
frutas.splice(2, 1, "Kiwi"); // Elimina 1 elemento en el índice 2 ("Banana") e inserta "Kiwi"
console.log(frutas); // ["Pera", "Manzana", "Kiwi", "Naranja", "Uva"]

```

### 6.2 Métodos Declarativos e Inmutables de ES6+

#### `map()`: Transforma cada elemento y devuelve un nuevo array de igual longitud

```javascript
const numeros = [1, 2, 3, 4];
const dobles = numeros.map(num => num * 2);
console.log(dobles); // [2, 4, 6, 8]

```

#### `filter()`: Filtra elementos que cumplan una condición booleana

```javascript
const numeros = [10, 15, 20, 25, 30];
const pares = numeros.filter(num => num % 2 === 0);
console.log(pares); // [10, 20, 30]

```

#### `find()`: Devuelve el PRIMER elemento que cumpla la condición (o `undefined`)

```javascript
const usuarios = [
  { id: 1, nombre: "Ana", edad: 20 },
  { id: 2, nombre: "Pedro", edad: 28 },
  { id: 3, nombre: "Lucía", edad: 32 }
];

const mayorDe25 = usuarios.find(u => u.edad > 25);
console.log(mayorDe25); // { id: 2, nombre: "Pedro", edad: 28 }

```

#### `reduce()`: Acumula los elementos de un array en un único valor final

```javascript
const precios = [100, 200, 300];
const total = precios.reduce((acumulador, precioActual) => acumulador + precioActual, 0);
console.log(total); // 600

```

#### `concat()`: Combina dos o más arrays

```javascript
const arr1 = [1, 2];
const arr2 = [3, 4];
const combinado = arr1.concat(arr2);
console.log(combinado); // [1, 2, 3, 4]

```

---

## 7. Estructuras de Datos: Objetos Literales

Los objetos almacenan datos mediante pares clave-valor (*key-value*).

```javascript
const producto = {
  id: 101,
  titulo: "Teclado Mecánico",
  precio: 75,
  colores: ["Negro", "RGB"],
  obtenerDescuento: function(porcentaje) {
    return this.precio - (this.precio * (porcentaje / 100));
  }
};

// Acceso a propiedades
console.log(producto.titulo); // Notación de punto: "Teclado Mecánico"
console.log(producto["precio"]); // Notación de corchetes: 75

// Acceso con clave dinámica mediante variable
const propiedadBuscada = "titulo";
console.log(producto[propiedadBuscada]); // "Teclado Mecánico"

// Añadir y modificar propiedades
producto.stock = 50;
producto.precio = 80;

console.log(producto.obtenerDescuento(10)); // 72

```

---

## 8. Características Clave de ES6+

### 8.1 Template Literals (Plantillas de Cadena)

Utilizan comillas invertidas (````) e interpolación `${}`.

```javascript
const nombre = "Elena";
const profesion = "Desarrolladora Front-End";
const edad = 29;

const mensaje = `Hola, mi nombre es ${nombre}.
Tengo ${edad} años y trabajo como ${profesion}.
El próximo año tendré ${edad + 1} años.`;

console.log(mensaje);

```

### 8.2 Spread Operator (`...`)

Permite expandir elementos de un iterable (arrays, objetos) en otro.

#### En Arrays

```javascript
const frutasBásicas = ["Manzana", "Banana"];
const frutasExóticas = ["Mango", "Maracuyá"];

const todasLasFrutas = [...frutasBásicas, ...frutasExóticas, "Frutilla"];
console.log(todasLasFrutas); // ["Manzana", "Banana", "Mango", "Maracuyá", "Frutilla"]

```

#### En Objetos

```javascript
const usuarioBase = { id: 1, nombre: "Sofía" };
const detallesContacto = { email: "sofia@mail.com", ciudad: "Córdoba" };

const perfilCompleto = {
  ...usuarioBase,
  ...detallesContacto,
  rol: "Admin"
};

console.log(perfilCompleto);

```

#### Rest Parameters (Parámetros Rest)

```javascript
const sumarTodos = (...numeros) => {
  return numeros.reduce((acc, curr) => acc + curr, 0);
};

console.log(sumarTodos(5, 10, 15)); // 30

```

### 8.3 Destructuring (Desestructuración)

#### Desestructuración de Objetos

```javascript
const configServidor = { puerto: 8080, host: "localhost", protocolo: "https" };

const { puerto, host } = configServidor;
console.log(puerto); // 8080

// Desestructuración en parámetros de funciones
const mostrarHost = ({ host, protocolo }) => {
  console.log(`Conectando a ${protocolo}://${host}`);
};
mostrarHost(configServidor);

```

#### Desestructuración de Arrays

```javascript
const coordenadas = ["Buenos Aires", "Argentina", 3000000];
const [ciudad, pais] = coordenadas;
console.log(ciudad); // "Buenos Aires"

```

---

# PARTE 2: GUÍA PRÁCTICA DE EJERCICIOS (SOLO JS, HTML Y CSS)

---

## SECCIÓN A: EJERCICIOS TÉCNICOS EN CONSOLA (ES6)

### Ejercicio A.1: Variables y Scope

1. Declara una variable con `let` para tu edad y una con `const` para tu nombre. Intenta reasignar ambas en consola y analiza la respuesta.
2. Crea una función con un bloque `if(true)` adentro. Declara variables usando `var`, `let` y `const` dentro del `if` e intenta imprimirlas fuera del bloque `if`.
3. Declara una constante de tipo objeto `persona`. Modifica su propiedad `edad` y añade `ciudad`. Explica por qué es válido con `const`.

### Ejercicio A.2: Arrays

1. Dado el array `["Manzana", "Banana", "Naranja"]`, agrega `"Frutilla"` al final con `push()` y `"Pera"` al inicio con `unshift()`.
2. Dado `[10, 20, 30, 40, 50, 60]`, usa `splice()` para eliminar el primer y el último elemento.
3. Dado `[1, 2, 3, 4, 5]`, genera un nuevo array con los dobles usando `.map()`.

### Ejercicio A.3: Objetos y Métodos

1. Crea un objeto `libro` con `titulo`, `autor`, `año` y un método `obtenerResumen()` que use *Template Literals*.
2. Crea un objeto `calculadora` con métodos arrow function para `sumar`, `restar`, `multiplicar` y `dividir`.

### Ejercicio A.4: Métodos Iterativos (`map`, `filter`, `find`, `reduce`)

Dado el array:

```javascript
const estudiantes = [
  { nombre: "Laura", edad: 22, nota: 8 },
  { nombre: "Martín", edad: 27, nota: 5 },
  { nombre: "Diego", edad: 30, nota: 9 },
  { nombre: "Sofía", edad: 24, nota: 4 }
];

```

1. Obtén los estudiantes aprobados (`nota >= 6`) usando `filter()`.
2. Extrae solo la lista de nombres con `map()`.
3. Busca al primer estudiante mayor de 25 años usando `find()`.
4. Calcula el promedio general de notas utilizando `reduce()`.

---

## SECCIÓN B: PROYECTOS PRÁCTICOS DE INTERFAZ (HTML + CSS + JS VANILLA)

---

### Proyecto 1: Tarjeta de Perfil Dinámica (DOM + Template Literals + Destructuring)

#### `index.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Perfil Dinámico</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main class="container">
    <div id="user-card-container"></div>
    <button id="toggle-status-btn" class="btn">Cambiar Estado</button>
  </main>
  <script src="app.js"></script>
</body>
</html>

```

#### `styles.css`

```css
body {
  font-family: Arial, sans-serif;
  background-color: #f4f7f6;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

.card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 280px;
  text-align: center;
  margin-bottom: 16px;
}

.avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  margin-top: 8px;
}

.status-online { background-color: #2ecc71; }
.status-offline { background-color: #e74c3c; }

.btn {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

```

#### `app.js`

```javascript
const usuario = {
  nombre: "Valeria Gómez",
  rol: "Desarrolladora Frontend",
  avatarUrl: "https://via.placeholder.com/90",
  online: true
};

const cardContainer = document.getElementById("user-card-container");
const toggleBtn = document.getElementById("toggle-status-btn");

const renderUserCard = (user) => {
  const { nombre, rol, avatarUrl, online } = user;
  
  const statusClass = online ? "status-online" : "status-offline";
  const statusText = online ? "En línea" : "Desconectado";

  cardContainer.innerHTML = `
    <article class="card">
      <img src="${avatarUrl}" alt="${nombre}" class="avatar">
      <h2>${nombre}</h2>
      <p>${rol}</p>
      <span class="status-badge ${statusClass}">${statusText}</span>
    </article>
  `;
};

toggleBtn.addEventListener("click", () => {
  usuario.online = !usuario.online;
  renderUserCard(usuario);
});

renderUserCard(usuario);

```

---

### Proyecto 2: Catálogo con Filtro por Categorías (`filter` + `map`)

#### `index.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Catálogo Filtro</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="app-container">
    <h1>Catálogo de Productos</h1>
    <div class="filter-section">
      <label for="category-select">Filtrar por categoría:</label>
      <select id="category-select">
        <option value="todos">Todos</option>
        <option value="Electrónica">Electrónica</option>
        <option value="Ropa">Ropa</option>
      </select>
    </div>
    <div id="products-grid" class="grid"></div>
  </div>
  <script src="app.js"></script>
</body>
</html>

```

#### `styles.css`

```css
body { font-family: Arial, sans-serif; padding: 32px; background: #f8f9fa; }
.app-container { max-width: 800px; margin: 0 auto; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.product-card { background: white; padding: 16px; border: 1px solid #ddd; border-radius: 8px; }
.price { font-weight: bold; color: #2c3e50; }

```

#### `app.js`

```javascript
const productos = [
  { id: 1, titulo: "Auriculares Bluetooth", categoria: "Electrónica", precio: 45 },
  { id: 2, titulo: "Camiseta de Algodón", categoria: "Ropa", precio: 20 },
  { id: 3, titulo: "Teclado Gamer", categoria: "Electrónica", precio: 85 }
];

const gridContainer = document.getElementById("products-grid");
const categorySelect = document.getElementById("category-select");

const renderProducts = (items) => {
  gridContainer.innerHTML = items.map(({ titulo, categoria, precio }) => `
    <article class="product-card">
      <small>${categoria}</small>
      <h3>${titulo}</h3>
      <p class="price">$${precio}</p>
    </article>
  `).join("");
};

categorySelect.addEventListener("change", (e) => {
  const selected = e.target.value;
  const filtrados = selected === "todos"
    ? productos
    : productos.filter(p => p.categoria === selected);
  renderProducts(filtrados);
});

renderProducts(productos);

```

---

### Proyecto 3: Carrito de Compras Inmutable (`Spread` + `Reduce`)

#### `index.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Carrito Inmutable</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <div class="shop">
      <h2>Tienda</h2>
      <div id="store-items"></div>
    </div>
    <div class="cart">
      <h2>Carrito</h2>
      <ul id="cart-list"></ul>
      <p><strong>Total: $<span id="cart-total">0</span></strong></p>
    </div>
  </div>
  <script src="app.js"></script>
</body>
</html>

```

#### `styles.css`

```css
body { font-family: Arial, sans-serif; padding: 20px; background: #eef2f5; }
.container { display: flex; gap: 20px; max-width: 700px; margin: 0 auto; }
.shop, .cart { background: white; padding: 20px; border-radius: 8px; flex: 1; }
.item { display: flex; justify-content: space-between; margin-bottom: 8px; }
button { background: #27ae60; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; }
button.del { background: #c0392b; }

```

#### `app.js`

```javascript
const productosDisponibles = [
  { id: 101, nombre: "Mouse Óptico", precio: 15 },
  { id: 102, nombre: "Monitor 24'", precio: 180 }
];

let carrito = [];

const storeContainer = document.getElementById("store-items");
const cartList = document.getElementById("cart-list");
const totalEl = document.getElementById("cart-total");

const renderStore = () => {
  storeContainer.innerHTML = productosDisponibles.map(p => `
    <div class="item">
      <span>${p.nombre} - $${p.precio}</span>
      <button onclick="agregar(${p.id})">Agregar</button>
    </div>
  `).join("");
};

const renderCart = () => {
  cartList.innerHTML = carrito.map((item, idx) => `
    <li class="item">
      <span>${item.nombre} ($${item.precio})</span>
      <button class="del" onclick="eliminar(${idx})">X</button>
    </li>
  `).join("");

  totalEl.textContent = carrito.reduce((acc, item) => acc + item.precio, 0);
};

window.agregar = (id) => {
  const prod = productosDisponibles.find(p => p.id === id);
  if (prod) {
    carrito = [...carrito, { ...prod }]; // Inmutabilidad mediante Spread
    renderCart();
  }
};

window.eliminar = (idx) => {
  carrito = carrito.filter((_, index) => index !== idx); // Inmutabilidad mediante Filter
  renderCart();
};

renderStore();
renderCart();

```

---

### Proyecto 4: Formulario de Registro con Salida JSON (`JSON.stringify`)

#### `index.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Formulario JSON</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="card">
    <h2>Registro</h2>
    <form id="user-form">
      <input type="text" id="nombre" placeholder="Nombre" required><br><br>
      <input type="email" id="email" placeholder="Email" required><br><br>
      <button type="submit">Generar JSON</button>
    </form>
    <h3>Payload JSON Output:</h3>
    <pre id="json-result">// Esperando envío...</pre>
  </div>
  <script src="app.js"></script>
</body>
</html>

```

#### `styles.css`

```css
body { font-family: Arial, sans-serif; padding: 40px; background: #34495e; color: white; }
.card { background: white; color: #333; padding: 24px; border-radius: 8px; max-width: 360px; margin: 0 auto; }
input { width: 90%; padding: 8px; }
button { width: 95%; padding: 10px; background: #8e44ad; color: white; border: none; cursor: pointer; }
pre { background: #222; color: #00ff66; padding: 12px; border-radius: 4px; overflow-x: auto; }

```

#### `app.js`

```javascript
const form = document.getElementById("user-form");
const jsonResult = document.getElementById("json-result");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    nombre: document.getElementById("nombre").value,
    email: document.getElementById("email").value,
    fecha: new Date().toISOString()
  };

  // Conversión a cadena de texto JSON formateada
  jsonResult.textContent = JSON.stringify(data, null, 2);
});

```