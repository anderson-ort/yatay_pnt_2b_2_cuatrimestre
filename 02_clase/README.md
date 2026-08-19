#  JavaScript ES6 

# TEORÍA Y CONCEPTOS FUNDAMENTALES DE JAVASCRIPT ES6

## 1. Introducción al Entorno y Ecosistema Moderno

### 1.1 Entornos de Ejecución
JavaScript puede ejecutarse en dos entornos principales:
- **Navegador Web (Frontend)**: Utiliza motores como V8 (Chrome, Edge), SpiderMonkey (Firefox) o JavaScriptCore (Safari). Cuenta con acceso directo al DOM (Document Object Model) y a las APIs del navegador (Fetch, LocalStorage, etc.).
- **Servidor / Terminal (Node.js)**: Entorno de ejecución fuera del navegador basado en el motor V8. Permite construir aplicaciones de servidor, herramientas CLI y acceder al sistema de archivos local (`fs`), red, etc.

### 1.2 Protocolo HTTP y Comunicación Web
La comunicación cliente-servidor se realiza mediante solicitudes (*Requests*) y respuestas (*Responses*) usando el protocolo HTTP:

#### Métodos HTTP Principales
- `GET`: Solicita y obtiene recursos o datos del servidor. No debe alterar el estado.
- `POST`: Envía datos al servidor para crear un nuevo recurso.
- `PUT` / `PATCH`: Actualiza un recurso existente (`PUT` reemplaza completamente; `PATCH` modifica parcialmente).
- `DELETE`: Elimina un recurso especificado en el servidor.

#### Códigos de Estado HTTP (Semáforo de Respuestas)
- `200 OK`: La petición fue exitosa y se retorna la información solicitada.
- `400 Bad Request`: La petición enviada por el cliente contiene un formato inválido o faltan datos.
- `404 Not Found`: El recurso solicitado no existe en el servidor.
- `500 Internal Server Error`: Ocurrió un fallo no controlado en el servidor al procesar la petición.

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

"""### 1.4 JavaScript vs Java

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
// var: Ámbito de función o global. Sufre de Hoisting y permite re-declaración (Mala práctica moderna)
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
  var variableVar = "Soy VAR (función)";
  
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
2. `Number`: Números enteros y de coma flotante.
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

Estos métodos no modifican el array original, sino que retornan un nuevo valor o array.

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
  // Método dentro del objeto
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
producto.stock = 50; // Añadir
producto.precio = 80; // Modificar

console.log(producto.obtenerDescuento(10)); // 72

```

---

## 8. Características Clave de ES6+

### 8.1 Template Literals (Plantillas de Cadena)

Utilizan comillas invertidas (````) y permiten interpolación de variables/expresiones con `${}`.

```javascript
const nombre = "Elena";
const profesion = "Desarrolladora Front-End";
const edad = 29;

// Interpolación y multilínea
const mensaje = `Hola, mi nombre es ${nombre}.
Tengo ${edad} años y trabajo como ${profesion}.
El próximo año tendré ${edad + 1} años.`;

console.log(mensaje);

```

### 8.2 Spread Operator (`...`)

El operador de propagación permite expandir elementos de un iterable (arrays, objetos) en otro.

#### En Arrays (Copia inmutable y combinación)

```javascript
const frutasBásicas = ["Manzana", "Banana"];
const frutasExóticas = ["Mango", "Maracuyá"];

// Combina sin mutar los originales
const todasLasFrutas = [...frutasBásicas, ...frutasExóticas, "Frutilla"];
console.log(todasLasFrutas); // ["Manzana", "Banana", "Mango", "Maracuyá", "Frutilla"]

// Obtener valor máximo de un array con Math.max
const numeros = [15, 42, 8, 23];
const maximo = Math.max(...numeros);
console.log(maximo); // 42

```

#### En Objetos (Clonación y Fusión)

```javascript
const usuarioBase = { id: 1, nombre: "Sofía" };
const detallesContacto = { email: "sofia@mail.com", ciudad: "Córdoba" };

// Fusión de objetos
const perfilCompleto = {
  ...usuarioBase,
  ...detallesContacto,
  rol: "Admin"
};

console.log(perfilCompleto);
// { id: 1, nombre: "Sofía", email: "sofia@mail.com", ciudad: "Córdoba", rol: "Admin" }

```

#### Rest Parameters (Parámetros Rest en Funciones)

Agrupa un número indefinido de argumentos en un array dentro de la función.

```javascript
const sumarTodos = (...numeros) => {
  return numeros.reduce((acc, curr) => acc + curr, 0);
};

console.log(sumarTodos(5, 10, 15)); // 30
console.log(sumarTodos(1, 2, 3, 4, 5)); // 15

```

### 8.3 Destructuring (Desestructuración)

Sintaxis que permite extraer valores de arrays u objetos y asignarlos a variables de forma directa.

#### Desestructuración de Objetos

```javascript
const configServidor = {
  puerto: 8080,
  host: "localhost",
  protocolo: "https"
};

// Extracción básica
const { puerto, host } = configServidor;
console.log(puerto); // 8080
console.log(host); // "localhost"

// Desestructuración en parámetros de una función
const mostrarHost = ({ host, protocolo }) => {
  console.log(`Conectando a ${protocolo}://${host}`);
};

mostrarHost(configServidor); // "Conectando a https://localhost"

```

#### Desestructuración de Arrays

```javascript
const coordenadasCiudad = ["Buenos Aires", "Argentina", 3000000];

// Asignación posicional
const [ciudad, pais, poblacion] = coordenadasCiudad;
console.log(ciudad); // "Buenos Aires"
console.log(pais); // "Argentina"

```
