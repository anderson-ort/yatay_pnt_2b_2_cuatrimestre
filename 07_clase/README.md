### 1. Flujo de Datos Unidireccional (_Props Down, Events Up_)

En las aplicaciones modernas basadas en componentes, la información viaja en un único sentido para garantizar la predictibilidad del sistema:

- **Entrada de datos:** Los componentes padres transmiten información hacia los componentes hijos mediante propiedades de solo lectura.
- **Notificación de cambios:** Los componentes hijos jamás modifican los datos recibidos. Si el usuario realiza una acción interna, el hijo emite un evento para avisar al padre.
- **Fuente única de verdad:** Solo el componente contenedor que posee el estado tiene la potestad de alterarlo, evitando que múltiples componentes mantengan copias desincronizadas o estados contradictorios.

---

### 2. Patrón de Componentes Presentacionales vs. Contenedores

Esta separación divide el trabajo de la interfaz en dos roles claros:

- **Componentes Contenedores (Vistas/Páginas):** Gestionan la lógica de negocio, coordinan la carga asíncrona de datos y controlan el estado reactivo central.
- **Componentes Presentacionales (Tarjetas/UI):** Funcionan como piezas reutilizables y visuales cuya única responsabilidad es renderizar la información recibida y capturar interacciones básicas del usuario.

---

### 3. Desacoplamiento de la Capa de Datos (Capa de Servicios)

Consiste en aislar la obtención de información de la interfaz gráfica a través de un intermediario o contrato:

- **Abstracción:** La vista solicita entidades de datos sin preocuparse por la tecnología subyacente (un archivo local simulado, una API REST o una base de datos en la nube).
- **Mantenibilidad:** Si la fuente de datos cambia o se migra de proveedor, únicamente se actualiza el servicio interno, manteniendo intactos todos los componentes visuales.
- **Desarrollo independiente:** Permite construir y probar la experiencia de usuario de inmediato mediante datos de prueba, sin necesidad de esperar a que el backend esté disponible.

---

### 4. Enrutamiento en Aplicaciones de Página Única (SPA)

El enrutador gestiona la navegación de la aplicación en el lado del cliente:

- Permite alternar entre diferentes pantallas sin recargar la página por completo en el navegador.
- Sincroniza la URL visible con las vistas correspondientes, preservando la fluidez visual y el estado general de la aplicación.

---

### 5. Micro-interacciones y Animación Imperativa

Las micro-interacciones mejoran la experiencia de usuario mediante pequeñas respuestas visuales ante acciones concretas:

- Dan retroalimentación inmediata frente a eventos como la carga de pantalla o la interacción con un botón.
- Se manejan de forma aislada a nivel del elemento visual, evitando intervenir o sobrecargar el estado lógico global de la aplicación.
