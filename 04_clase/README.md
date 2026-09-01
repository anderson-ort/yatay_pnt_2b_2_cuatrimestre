# Fundamentos de comunicacion

**1. Fundamentos de Comunicación: APIs y Métodos HTTP**

Una API (Application Programming Interface) establece las reglas, rutas y formatos con los que el cliente consulta o modifica datos alojados en el servidor.

* **Analogía pedagógica:** La API actúa como el menú y el mesero de un restaurante. El cliente no accede a la cocina (servidor) directamente; le realiza peticiones al mesero siguiendo la estructura del menú.
* **Métodos HTTP:**
* `GET`: Lectura y recuperación de recursos.
* `POST`: Creación de nuevos recursos.
* `PUT`: Reemplazo total de un recurso existente.
* `PATCH`: Modificación parcial de un recurso.
* `DELETE`: Eliminación de recursos.



**Pregunta de interacción en clase:**
Si se requiere actualizar únicamente la foto de perfil de un usuario, ¿corresponde usar `PUT` o `PATCH`?

* *Respuesta:* Se utiliza `PATCH` porque se modifica una propiedad específica. El método `PUT` requeriría enviar la totalidad del objeto de usuario nuevamente.

---

**2. Consumo de Datos: Fetch API vs. Axios**

**Fetch API (Nativo)**
Permite realizar peticiones HTTP directamente desde JavaScript sin librerías externas. Requiere procesar dos promesas encadenadas mediante `.then()`: la primera recibe los encabezados de la respuesta y la segunda (al invocar `.json()`) procesa el cuerpo de los datos.

```javascript
function obtenerDatos() {
  return new Promise((resolve, reject) => {
    fetch('https://api.misitio.com/datos')
      .then(response => response.json())
      .then(datos => resolve(datos))
      .catch(error => reject(error));
  });
}

```

**Axios (Librería Externa)**
Librería basada en promesas que abstrae la configuración repetitiva, simplificando la sintaxis de consumo.

| Característica | Fetch API (Nativo) | Axios (Librería) |
| --- | --- | --- |
| **Parseo de JSON** | Manual mediante el método `.json()` | Automático a través de `response.data` |
| **Manejo de Errores** | Manual, evaluando la propiedad `response.ok` | Automático; los fallos de red o códigos 4xx/5xx van al `.catch()` |
| **Instalación** | Incluido en el navegador | Requiere importación mediante CDN o `npm install` |

```javascript
axios.get('https://api.misitio.com/datos')
  .then(response => {
    console.log('Datos cargados:', response.data);
  })
  .catch(error => {
    console.error('Error al cargar los datos:', error);
  });

```

---

**3. Control de Asincronía: Async / Await**

El patrón `async / await` es azúcar sintáctica construida sobre las promesas. Permite escribir código asíncrono con una estructura secuencial similar al código síncrono, evitando el encadenamiento excesivo de `.then()`.

* **Funcionamiento:** La palabra clave `await` pausa la ejecución interna de la función `async` hasta que la promesa se resuelve, sin bloquear el hilo de ejecución principal.
* **Manejo de errores:** Se utilizan bloques estándar `try / catch`.

```javascript
async function obtenerDatosAsync() {
  try {
    const datos = await obtenerDatosDesdeAPI();
    const resultado = await procesarDatos(datos);
    await guardarDatos(resultado);
    console.log('Proceso completado exitosamente');
  } catch (error) {
    manejarError(error);
  }
}

```

**Ejercicio interactivo en clase:**
Completar la función asignando las palabras clave requeridas y el acceso a los datos consumidos con Axios.

```javascript
// Resolución del ejercicio
async function cargarUsuarios() { 
  try {
    const respuesta = await axios.get('https://api.misitio.com/users'); 
    console.log(respuesta.data); 
  } catch (error) {
    console.error(error);
  }
}

```

---

**4. Renderizado Imperativo: Manipulación del DOM en JS Vanilla**

El Document Object Model (DOM) es la representación jerárquica en objetos del documento HTML. Sirve como interfaz entre los datos del script y la presentación visual.

**Herramientas fundamentales:**

* `document.getElementById()`: Selecciona el nodo contenedor dentro del HTML.
* `document.createElement()`: Instancia nuevos elementos HTML en memoria.
* `innerHTML`: Permite la inyección directa de cadenas de texto HTML mediante *template literals*.
* `appendChild()`: Inserta los nodos creados dentro del arbol del DOM visible.

---

**5. Integración Arquitectónica en JS Vanilla**

Ejemplo de integración directa entre Axios, sintaxis asíncrona y manipulación imperativa del DOM con clases de Bootstrap:

```javascript
async function renderizarUsuarios() {
  const contenedor = document.getElementById('usuarios');
  contenedor.innerHTML = '';

  try {
    const respuesta = await axios.get('https://api.misitio.com/users');
    const usuarios = respuesta.data;

    usuarios.forEach(usuario => {
      const card = document.createElement('div');
      card.className = 'col-md-4 mb-4';

      card.innerHTML = `
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">${usuario.name}</h5>
            <p class="card-text">Email: ${usuario.email}</p>
            <p class="card-text"><small>Ciudad: ${usuario.address.city}</small></p>
          </div>
        </div>`;

      contenedor.appendChild(card);
    });
  } catch (error) {
    console.error('Error renderizando usuarios:', error);
  }
}

```

**Ciclo de ejecución de la aplicación:**

1. **Evento:** Acción iniciada por el usuario (ej. carga de vista o clic).
2. **Función Async:** Se activa la rutina de procesamiento.
3. **Petición HTTP:** Axios envía la solicitud `GET` al servidor.
4. **Respuesta API:** El servidor retorna una estructura JSON.
5. **Manipulación del DOM:** Se recorren los datos, se construyen nodos HTML y se inyectan en la interfaz.

---

**6. Evolución de la Arquitectura: Por qué migrar a Vue.js**

El enfoque imperativo en JavaScript Vanilla presenta limitaciones operativas a medida que la aplicación escala.

**Limitaciones del enfoque imperativo:**

* **Acoplamiento alto:** La lógica de negocio, las peticiones HTTP y la generación de marcado HTML/CSS se encuentran mezcladas en el mismo archivo.
* **Riesgos de seguridad:** La concatenación directa de cadenas mediante `innerHTML` expone la aplicación a vulnerabilidades XSS (Cross-Site Scripting) si los datos no son saneados.
* **Mantenimiento complejo:** Actualizar la interfaz requiere limpiar e insertar elementos manualmente en cada cambio de estado, lo cual incrementa la complejidad del código.

**Soluciones aportadas por Vue.js:**

* **Reactividad Declarativa (Virtual DOM):** Vue enlaza los datos con la vista automáticamente. Modificar un estado (`usuarios.value = datos`) actualiza el DOM de forma eficiente sin necesidad de llamar a `appendChild` o `innerHTML`.
* **Arquitectura de Componentes:** Permite modularizar la interfaz en piezas independientes y reutilizables (ej. `<UserCard/>`, `<Navbar/>`).
* **Directivas Nativas:** Reemplaza la manipulación manual de bucles y eventos mediante sintaxis declarativa en la plantilla, como `v-for`, `v-if` o `v-model` para la vinculación bidireccional de datos en formularios.
* **Gestión de Estado Centralizada:** Facilita el uso de librerías como Pinia para compartir información global (carrito de compras, sesión de usuario) entre componentes sin propagar eventos manualmente.
* **Enrutamiento del Cliente (Vue Router):** Permite construir aplicaciones SPA (Single Page Application) controlando rutas y protegiendo accesos según roles de usuario mediante guardias de navegación.