**Ejercicio 1: Consigna para la Clase**

**Objetivo:** Desarrollar una mini aplicación web integradora en un único archivo (`index.html`) para ejercitar la manipulación del DOM, asincronía y características modernas de ES6+.

**Requisitos del proyecto:**

* **Módulo 1: Perfil de Usuario (Async/Await & Fetch)**
* Crear un botón que consulte la API pública `[https://jsonplaceholder.typicode.com/users/1](https://jsonplaceholder.typicode.com/users/1)`.
* Implementar la petición con una función asíncrona (`async/await`) y manejo de errores mediante `try...catch`.
* Aplicar **desestructuración de objetos** para extraer `name`, `email` y `company`.
* Insertar los datos en el DOM usando **Template Literals** y **Optional Chaining** (`company?.name`).


* **Módulo 2: Lista de Tareas (DOM, Storage & Arrays)**
* Crear una clase `StorageController` con métodos estáticos para leer y guardar la lista en `localStorage` (manejando `JSON.parse` y `JSON.stringify`).
* Implementar la función de agregar tareas usando el **operador Spread (`...`)** para mantener la inmutabilidad al actualizar el array.
* Renderizar las tareas en pantalla iterando el array con `.map()`.
* Agregar la opción de eliminar tareas individuales utilizando `.filter()`.

---

## Este ejercicio integrado en un solo archivo `index.html` combina manipulación del DOM, asincronía (`async`/`await`), `fetch`, `localStorage`, clases y métodos funcionales.

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ejercicio Integrador JS</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 500px; margin: 30px auto; padding: 20px; background: #f4f5f7; }
    .card { background: white; padding: 15px 20px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); margin-bottom: 20px; }
    button { background: #42b883; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; }
    button.btn-del { background: #e74c3c; padding: 2px 6px; font-size: 12px; margin-left: 10px; }
    input { padding: 8px; border: 1px solid #ccc; border-radius: 4px; width: 65%; }
    ul { padding-left: 20px; }
    li { margin-bottom: 8px; }
  </style>
</head>
<body>

  <!-- Módulo 1: Async/Await + Fetch -->
  <div class="card">
    <h3>1. Perfil de Usuario (Fetch API)</h3>
    <button id="btnCargar">Obtener Usuario</button>
    <div id="usuarioInfo" style="margin-top: 10px;"></div>
  </div>

  <!-- Módulo 2: DOM + LocalStorage + Array Methods -->
  <div class="card">
    <h3>2. Lista de Tareas (DOM & Storage)</h3>
    <input type="text" id="inputTarea" placeholder="Nueva tarea...">
    <button id="btnAgregar">Agregar</button>
    <ul id="listaTareas"></ul>
  </div>

  <script>
    // --- 1. CLASES & LOCALSTORAGE ---
    class StorageController {
      static obtener() {
        return JSON.parse(localStorage.getItem('tareas')) || [];
      }
      static guardar(tareas) {
        localStorage.setItem('tareas', JSON.stringify(tareas));
      }
    }

    // --- 2. SELECCIÓN DE ELEMENTOS DOM ---
    const inputTarea = document.querySelector('#inputTarea');
    const btnAgregar = document.querySelector('#btnAgregar');
    const listaTareas = document.querySelector('#listaTareas');
    const btnCargar = document.querySelector('#btnCargar');
    const usuarioInfo = document.querySelector('#usuarioInfo');

    // --- 3. ARROW FUNCTIONS & MÉTODOS DE ARRAYS (map, filter) ---
    const renderizarTareas = () => {
      const tareas = StorageController.obtener();
      listaTareas.innerHTML = tareas
        .map((tarea, index) => `
          <li>
            ${tarea}
            <button class="btn-del" onclick="eliminarTarea(${index})">X</button>
          </li>
        `)
        .join('');
    };

    const agregarTarea = () => {
      const texto = inputTarea.value.trim();
      if (!texto) return;

      // Inmutabilidad y operador Spread (...)
      const tareasActuales = [...StorageController.obtener(), texto];
      StorageController.guardar(tareasActuales);

      inputTarea.value = '';
      renderizarTareas();
    };

    window.eliminarTarea = (index) => {
      const tareas = StorageController.obtener().filter((_, i) => i !== index);
      StorageController.guardar(tareas);
      renderizarTareas();
    };

    // --- 4. FETCH + ASYNC / AWAIT + DESESTRUCTURACIÓN ---
    const cargarUsuario = async () => {
      usuarioInfo.textContent = 'Cargando datos de la API...';
      try {
        const res = await fetch('https://jsonplaceholder.typicode.com/users/1');
        if (!res.ok) throw new Error('Error al realizar la petición');

        // Desestructuración del objeto JSON
        const { name, email, company } = await res.json();
        
        // Modificación del DOM con Template Literals
        usuarioInfo.innerHTML = `
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Compañía:</strong> ${company?.name ?? 'N/A'}</p>
        `;
      } catch (error) {
        usuarioInfo.textContent = 'No se pudo cargar la información.';
      }
    };

    // --- 5. EVENT LISTENERS ---
    btnAgregar.addEventListener('click', agregarTarea);
    btnCargar.addEventListener('click', cargarUsuario);

    // Carga inicial al refrescar la pantalla
    renderizarTareas();
  </script>
</body>
</html>

```

**Conceptos de la guía implementados:**

* **Clases y LocalStorage:** Uso de una clase estática `StorageController` para encapsular `localStorage.getItem` y `setItem` utilizando serialización JSON.


* **Async/Await y Fetch:** Obtención de datos externos reemplazando callbacks por código asíncrono limpio apoyado en `try...catch`.


* **Arrow Functions y Métodos de Array:** Transformación de arrays dinámicos en fragmentos de HTML usando `map` y filtrado con `filter`.


* **Preparación para Vue:** Uso de desestructuración (`const { name, email }`), operador spread (`[...]`) y encadenamiento opcional (`company?.name`).
