
**Ejercicio 2: Práctica Autónoma (Catálogo de Deseos y Producto Destacado)**

**Objetivo:** Crear de forma independiente una aplicación para consultar un producto en oferta y gestionar una lista personal de compras pendientes.

**Requisitos del proyecto:**

* **Módulo 1: Producto Destacado (Fetch API)**
* Consultar los datos de un producto consumiendo la API `[https://fakestoreapi.com/products/1](https://fakestoreapi.com/products/1)`.
* Utilizar `async/await` para procesar la respuesta y desestructurar `title`, `price` y `category`.
* Mostrar la información del producto en un contenedor destacado mediante manipulación del DOM.


* **Módulo 2: Lista de Deseos (Wishlist)**
* Crear un campo de texto y un botón para que el usuario añada nombres de productos a su lista de deseos.
* Diseñar una clase `WishlistStorage` encargada exclusivamente de la interacción con `localStorage`.
* Generar los elementos de la lista en el DOM apoyándote en el método `.map()`.
* Permitir quitar elementos de la lista usando `.filter()` y actualizar el almacenamiento local.


* **Criterios de código:**
* Emplear **Arrow Functions** en todos los manejadores de eventos y funciones auxiliares.
* Utilizar la sintaxis de **Template Literals** para estructurar el HTML dinámico.