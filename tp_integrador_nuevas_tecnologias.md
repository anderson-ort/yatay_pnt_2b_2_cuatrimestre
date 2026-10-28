# Trabajo Práctico Final: Desarrollo Frontend con Vue.js

**Materia:** Programación en Nuevas Tecnologías 2

**Fechas de presentación:** 17 y 24 de Noviembre

**Modalidad:** Grupos de hasta 4 integrantes (MAX)

## 1. Objetivo del Proyecto

Integrar y aplicar los conocimientos adquiridos a lo largo de la cursada mediante el desarrollo de una aplicación web (Single Page Application) completamente funcional. La aplicación deberá resolver un problema concreto, implementando buenas prácticas de desarrollo, gestión del estado y consumo de APIs.

## 2. Requisitos Técnicos Mínimos

El proyecto debe construirse utilizando **Vue 3 (Composition API)** y cumplir estrictamente con las siguientes funcionalidades:

* **Enrutamiento:** Implementación de navegación utilizando **Vue Router**.
* **Gestión del Estado:** Uso de **Pinia** para cualquier dato que deba compartirse entre más de dos niveles de componentes, erradicando el *prop drilling*.
* **Autenticación y Roles:** Sistema de login donde los usuarios tengan distintos perfiles (ej. Cliente/Administrador), restringiendo el acceso a ciertas vistas según el rol.
* **Gestión de Datos (ABM):** Al menos un (1) y hasta un máximo de tres (3) ABMs (Altas, Bajas y Modificaciones) funcionales. Deben consumir una REST API (Pueden usar alguna herramienta del tipo BaaS | Backend propio -> Materia: Taller de programacion 2).
* **(Optional )Dashboard y Gráficos:** Una vista de informes o estadísticas basada en los datos ingresados al sistema, accesible **únicamente** para usuarios administradores.
* **Implementacion de plugin de PWA por Vite**: Integración de componente para ejecutar como una app mobile.
* **(Optional) Inteligencia Artificial:** Integración de al menos una funcionalidad relacionada o impulsada por IA (ej. autocompletado inteligente, análisis de texto, chat, etc.).

## 3. Estándares de Entrega y Calidad

Para que el proyecto cumpla con los estándares profesionales de la materia, deberá contar con:

* **Arquitectura de Carpetas:** Separación clara y lógica de los archivos en directorios como `/components`, `/composables`, `/stores` y `/views`.
* **Documentación (README.md):** Guía de instalación paso a paso, descripción del proyecto y explicación detallada de los *secrets* de GitHub necesarios para el despliegue.
* **(Optional) Calidad de Código y Testing:** Implementación de al menos un test unitario por cada lógica de negocio crítica (ubicada en los *composables* o en la *store*).
* **Integración y Despliegue Continuo (CI/CD):** Inclusión de una carpeta `.github/workflows/` con los archivos YAML configurados para la automatización del testing (CI) y el deploy (CD).

## 4. Metodología de Trabajo y Seguimiento

1. **Definición y Validación:** Acordar la temática con el grupo. Redactar un documento sintético detallando el **objetivo** de la aplicación (qué hará) y sus **funcionalidades principales**. Esta definición deberá registrarse en el Excel de la materia para validación y acotamiento por parte del equipo docente.
2. **Control de Versiones:** El proyecto debe residir obligatoriamente en un repositorio de GitHub. Se evaluará la participación activa y los *commits* de **cada integrante** del equipo.
3. **Entregas Semanales:** Se realizarán revisiones semanales donde se deberá evidenciar un incremento comprobable de las funcionalidades.

## 5. Evaluación y Calificación

La entrega final consistirá en una **defensa oral del proyecto**. Todos los integrantes del grupo deben dominar y ser capaces de explicar la construcción de cualquier parte del código, independientemente de quién la haya programado.

**Criterios de aprobación:**

* Implementación correcta del flujo principal de la aplicación.
* Cumplimiento de los requisitos técnicos, estándares de entrega y mantenimiento del repositorio.
* **Escala de Calificación:**
* Proyecto funcional al **70%**: Nota entre **4 y 6 puntos**.
* Proyecto funcional superior al **80%**: Nota entre **7 y 10 puntos**.


## 6. Ejemplos de Proyectos Sugeridos

**1. E-Commerce de Productos de Belleza**

* **Descripción:** Plataforma de catálogo y venta online que incluye gestión de inventario, carrito de compras y panel de control administrativo.
* **Objetivos:** Permitir a los usuarios explorar productos, simular compras y gestionar su perfil, mientras el administrador controla el stock y visualiza métricas del negocio.
* **Público:** Consumidores finales (clientes) y dueños o gerentes de la tienda (administradores).
* **Aplicación técnica:** ABM de productos y categorías; Dashboard con gráficos de productos más vistos o ventas mensuales; roles diferenciados donde el cliente usa el carrito y el admin accede al panel de control.

**2. Gestor Corporativo de Credenciales y Accesos**

* **Descripción:** Sistema seguro para el almacenamiento, asignación y auditoría de contraseñas, licencias de software o claves API dentro de una organización.
* **Objetivos:** Centralizar las credenciales de un equipo, asignar accesos temporales y monitorear qué usuario utilizó qué clave.
* **Público:** Equipos de IT, líderes de proyecto y empleados generales.
* **Aplicación técnica:** ABM de credenciales y proyectos; Dashboard con estadísticas de accesos y alertas de contraseñas por expirar; roles de Administrador (otorga permisos) y Empleado (solo visualiza las claves asignadas).

**3. Sistema de Gestión para Canchas Deportivas**

* **Descripción:** Aplicación de reservas de espacios deportivos que automatiza el calendario de turnos y el registro de pagos.
* **Objetivos:** Evitar el solapamiento de turnos, facilitar la reserva autogestionada por parte del usuario y brindar control financiero al establecimiento.
* **Público:** Jugadores aficionados (clientes) y administradores del complejo deportivo.
* **Aplicación técnica:** ABM de canchas y reservas; Dashboard con métricas de ocupación por horario y recaudación diaria; roles de Usuario (reserva y cancela turnos) y Recepcionista/Admin (gestión de pagos y bloqueos de calendario).

**4. Plataforma de Adopción y Rescate de Mascotas**

* **Descripción:** Portal que conecta refugios de animales con posibles adoptantes, gestionando el seguimiento del proceso de adopción.
* **Objetivos:** Digitalizar los expedientes de los animales rescatados, recibir solicitudes de adopción y dar seguimiento al estado de salud de las mascotas.
* **Público:** Personas interesadas en adoptar y voluntarios/coordinadores del refugio.
* **Aplicación técnica:** ABM de animales (con estados: disponible, en tránsito, adoptado) y solicitudes; Dashboard con estadísticas de adopciones mensuales y distribución por especie/edad; roles de Visitante (explora y aplica) y Voluntario (gestiona fichas y aprueba solicitudes).

**5. Sistema de Turnos para Consultorios Médicos**

* **Descripción:** Herramienta de agendamiento para clínicas que maneja múltiples profesionales, especialidades y pacientes.
* **Objetivos:** Optimizar la sala de espera, mantener un registro unificado del paciente (historial básico) y organizar la agenda de cada médico.
* **Público:** Pacientes, personal de recepción y profesionales de la salud.
* **Aplicación técnica:** ABM de pacientes, profesionales y turnos; Dashboard mostrando el volumen de atención por especialidad y ausentismo; roles de Paciente (saca turno), Médico (ve su agenda diaria) y Recepción (control total).

**6. Gestor de Proyectos y Tareas (Estilo Kanban)**

* **Descripción:** Herramienta de productividad visual para equipos de trabajo, donde se pueden crear tableros, asignar tareas y medir tiempos de resolución.
* **Objetivos:** Facilitar el seguimiento del progreso de un proyecto, asignar responsabilidades claras y detectar cuellos de botella en el flujo de trabajo.
* **Público:** Equipos de desarrollo, agencias de marketing o grupos de estudiantes.
* **Aplicación técnica:** ABM de proyectos y tareas (tickets); Dashboard con la tasa de tareas completadas vs. atrasadas y carga de trabajo por usuario; roles de Project Manager (crea y elimina proyectos) y Colaborador (mueve tareas de estado).
