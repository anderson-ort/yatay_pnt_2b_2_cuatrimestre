# CRUD tradicional de productos (solo admin)

Guía para agregar el alta, edición y baja de productos al proyecto `09_clase_b/repaso`, de forma que **solo los usuarios con rol `admin`** puedan modificar datos. Todo el resto (catálogo) sigue siendo de lectura pública.

La idea es tocar lo mínimo: el proyecto ya tiene Axios con interceptor, Pinia con `isAdmin` y la tabla `user_roles`. Solo falta conectar las piezas.

---

## 0. Punto de partida: qué ya tenemos

| Pieza | Archivo | Qué hace hoy |
|---|---|---|
| Instancia Axios | `src/services/api.js` | Agrega `apikey` y el JWT del usuario en cada request |
| Store de sesión | `src/stores/authStore.js` | Guarda `email`, `token` y `admin` (getter `isAdmin`) |
| Rol del usuario | `src/services/roles.js` | Lee `user_roles` y devuelve `'admin'` o lo que corresponda |
| Productos | `src/services/products.js` | Solo lista (`GET`) |
| Vista admin | `src/views/AdminView.vue` | Vacía y **sin protección** |

## 1. Idea general

```
AdminView ──► useProductosAdmin ──► productsService ──► api.js (Axios) ──► Supabase REST ──► Postgres + RLS
(muestra)     (estado: loading,      (URLs, headers,     (apikey + JWT)                       (decide si el
               error, productos)      validación)                                              usuario es admin)
```

Dos niveles de protección, y conviene que los alumnos entiendan la diferencia:

| Nivel | Dónde | Para qué sirve |
|---|---|---|
| Router guard + ocultar botones | Frontend | **Comodidad (UX).** Evita que un usuario común vea pantallas que no puede usar |
| RLS con la función `es_admin()` | Base de datos | **Seguridad real.** Aunque alguien edite el `sessionStorage` y se ponga `admin: true`, Postgres rechaza la operación |

> Regla mental: todo lo que pasa en el navegador es una sugerencia; la autoridad está en el servidor.

---

## 2. Base de datos (SQL Editor de Supabase)

### 2.1 Función auxiliar `es_admin()`

Centraliza la pregunta "¿el usuario que hace esta consulta es admin?". La vamos a reutilizar en todas las políticas y también desde la Edge Function del CRUD con IA.

```sql
-- Devuelve true si el usuario logueado tiene rol 'admin' en user_roles.
-- SECURITY DEFINER: se ejecuta con permisos del dueño, así no depende
-- de las políticas de user_roles (y evita recursión de RLS).
create or replace function public.es_admin()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = 'admin'
  )
$$;
```

> Asumimos que `user_roles` tiene las columnas `user_id` y `role` (es lo que consulta `src/services/roles.js`). Si tus columnas se llaman distinto, ajustá la función.

### 2.2 Proteger la tabla `user_roles`

Si cualquiera pudiera insertar en `user_roles`, podría auto-asignarse `admin`. Cada usuario solo puede **leer su propio rol**; nadie puede escribir desde el frontend.

```sql
alter table public.user_roles enable row level security;

drop policy if exists "Ver rol propio" on public.user_roles;
create policy "Ver rol propio"
on public.user_roles for select
using (user_id = auth.uid());

-- Sin políticas de INSERT/UPDATE/DELETE: los roles se asignan a mano
-- desde el panel o el SQL Editor (ahí se usa service_role, que saltea RLS).
```

Revisá que no haya otras políticas que permitan escribir:

```sql
select policyname, cmd from pg_policies where tablename = 'user_roles';
```

### 2.3 Políticas de `productos`: leer todos, escribir solo admin

```sql
alter table public.productos enable row level security;

-- Se borran las políticas viejas "solo autenticado" (si existen)
drop policy if exists "Insercion solo autenticada" on public.productos;
drop policy if exists "Actualizacion solo autenticada" on public.productos;
drop policy if exists "Borrado solo autenticado" on public.productos;

-- La lectura sigue siendo pública
drop policy if exists "Lectura publica de productos" on public.productos;
create policy "Lectura publica de productos"
on public.productos for select
using (true);

drop policy if exists "Insercion solo admin" on public.productos;
create policy "Insercion solo admin"
on public.productos for insert
with check (public.es_admin());

drop policy if exists "Actualizacion solo admin" on public.productos;
create policy "Actualizacion solo admin"
on public.productos for update
using (public.es_admin())
with check (public.es_admin());

drop policy if exists "Borrado solo admin" on public.productos;
create policy "Borrado solo admin"
on public.productos for delete
using (public.es_admin());
```

### 2.4 Darle rol admin a tu usuario

Buscá el `id` del usuario en **Authentication > Users** y ejecutá:

```sql
insert into public.user_roles (user_id, role)
values ('UUID-DEL-USUARIO', 'admin');
```

### 2.5 Comportamiento de RLS que hay que recordar

| Operación bloqueada por RLS | Qué devuelve Supabase |
|---|---|
| `INSERT` | Error 403, código `42501` ("new row violates row-level security policy") |
| `UPDATE` / `DELETE` | **No da error**: afecta 0 filas y devuelve `[]` |

Por eso, en el service usamos `Prefer: return=representation` y verificamos que vuelva al menos una fila.

---

## 3. Frontend

### 3.1 `src/main.js`: instalar Pinia antes que el router

El guard del router usa el store. Si Pinia se instala después, la primera navegación puede ejecutarse sin store activo.

```js
createApp(App)
    .use(pinia)
    .use(router)
    .mount('#app')
```

### 3.2 `src/services/api.js`: mensaje de error legible

Agregá esta función al final del archivo (debajo del `export default api`). Traduce los errores de Axios/PostgREST a un texto que se pueda mostrar.

```js
// Convierte un error de Axios/PostgREST en un mensaje para el usuario
export const extraerMensaje = (err) => {
  const data = err.response?.data;
  if (data?.code === "42501") return "No tenés permisos para realizar esta operación";
  return data?.message ?? data?.error ?? err.message ?? "Error inesperado";
};
```

### 3.3 `src/services/products.js`: todo el CRUD

El service es la **única** capa que conoce URLs, headers y el formato de los datos. No importa nada de Vue.

```js
import api from "./api.js";

const API_ENDPOINT = "/rest/v1/productos";

// Pide a Supabase que devuelva las filas afectadas.
// Sirve para detectar cuando RLS bloqueó un UPDATE/DELETE (devuelve []).
const DEVOLVER_FILAS = { Prefer: "return=representation" };

// Deja los datos del formulario en el formato que espera la tabla
const normalizar = (datos) => ({
  nombre: String(datos.nombre ?? "").trim(),
  descripcion: datos.descripcion?.trim() || null,
  categoria: datos.categoria?.trim().toLowerCase() || null,
  precio: Number(datos.precio),
  stock: Number(datos.stock ?? 0),
});

// Devuelve la lista de errores (vacía si está todo bien)
export const validarProducto = (producto) => {
  const errores = [];
  if (!producto.nombre) errores.push("El nombre es obligatorio");
  if (!Number.isFinite(producto.precio) || producto.precio < 0) errores.push("El precio debe ser un número mayor o igual a 0");
  if (!Number.isInteger(producto.stock) || producto.stock < 0) errores.push("El stock debe ser un entero mayor o igual a 0");
  return errores;
};

// Normaliza + valida. Falla rápido, antes de llamar a la API.
const prepararProducto = (datos) => {
  const producto = normalizar(datos);
  const errores = validarProducto(producto);
  if (errores.length) throw new Error(errores.join(". "));
  return producto;
};

const productsService = {
  async listar() {
    const { data } = await api.get(API_ENDPOINT, {
      params: { select: "*", order: "nombre.asc" },
    });
    return data;
  },

  async crear(datos) {
    const { data } = await api.post(API_ENDPOINT, prepararProducto(datos), {
      headers: DEVOLVER_FILAS,
    });
    return data[0];
  },

  async actualizar(id, datos) {
    // PATCH y DELETE SIEMPRE con filtro por id: sin filtro afectan toda la tabla
    const { data } = await api.patch(API_ENDPOINT, prepararProducto(datos), {
      params: { id: `eq.${id}` },
      headers: DEVOLVER_FILAS,
    });
    if (!data.length) throw new Error("No se pudo actualizar (¿sos admin?)");
    return data[0];
  },

  async eliminar(id) {
    const { data } = await api.delete(API_ENDPOINT, {
      params: { id: `eq.${id}` },
      headers: DEVOLVER_FILAS,
    });
    if (!data.length) throw new Error("No se pudo eliminar (¿sos admin?)");
  },
};

export default productsService;
```

### 3.4 `src/composables/useFetchProducts.js`: adaptar el catálogo

Como el service ahora es un objeto, el catálogo usa `productsService.listar()`. De paso se corrigen dos detalles del código actual: `loading` nunca volvía a `false` y el `await response.data` sobraba.

```js
import productsService from '../services/products.js'
import { ref } from 'vue'

const useFetchProducts = () => {
    const data = ref([])
    const loading = ref(false)
    const error = ref(null)

    const retrieveProducts = async () => {
        loading.value = true
        error.value = null
        try {
            data.value = await productsService.listar()
        }
        catch (e) {
            error.value = e.message
        }
        finally {
            loading.value = false
        }
    }

    retrieveProducts()

    return { loading, error, data, retrieveProducts }
}

export default useFetchProducts
```

### 3.5 `src/composables/useProductosAdmin.js` (nuevo)

Maneja el estado de la pantalla de administración. Recibe el service por parámetro (**inyección de dependencias**): en un test se le pasa un service falso sin tocar el composable.

```js
import { ref } from "vue";
import productsService from "../services/products.js";
import { extraerMensaje } from "../services/api.js";

const useProductosAdmin = (service = productsService) => {
  const productos = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Ejecuta una acción manejando loading y error siempre igual.
  // Devuelve true/false para que la vista sepa si cerrar el formulario.
  const ejecutar = async (accion) => {
    loading.value = true;
    error.value = null;
    try {
      await accion();
      return true;
    } catch (err) {
      error.value = extraerMensaje(err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const cargar = () =>
    ejecutar(async () => {
      productos.value = await service.listar();
    });

  const crear = async (datos) => {
    const ok = await ejecutar(() => service.crear(datos));
    if (ok) await cargar();
    return ok;
  };

  const actualizar = async (id, datos) => {
    const ok = await ejecutar(() => service.actualizar(id, datos));
    if (ok) await cargar();
    return ok;
  };

  const eliminar = async (id) => {
    const ok = await ejecutar(() => service.eliminar(id));
    if (ok) await cargar();
    return ok;
  };

  return { productos, loading, error, cargar, crear, actualizar, eliminar };
};

export default useProductosAdmin;
```

### 3.6 `src/components/ProductoForm.vue` (nuevo)

Un solo formulario para alta y edición. No sabe nada de la API: recibe un producto y **emite** los datos. La lógica queda en el composable.

```vue
<script setup>
import { reactive, watch } from "vue";

const props = defineProps({
  producto: { type: Object, default: null }, // null = alta, objeto = edición
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(["guardar", "cancelar"]);

const VACIO = { nombre: "", descripcion: "", categoria: "", precio: 0, stock: 0 };
const form = reactive({ ...VACIO });

// Cada vez que cambia el producto a editar, se recarga el formulario
watch(
  () => props.producto,
  (p) => Object.assign(form, VACIO, p ?? {}),
  { immediate: true }
);
</script>

<template>
  <form class="form" @submit.prevent="emit('guardar', { ...form })">
    <h2>{{ producto ? "Editar producto" : "Nuevo producto" }}</h2>

    <input v-model="form.nombre" placeholder="Nombre" required />
    <input v-model="form.descripcion" placeholder="Descripción" />
    <input v-model="form.categoria" placeholder="Categoría" />
    <input v-model.number="form.precio" type="number" min="0" step="0.01" placeholder="Precio" />
    <input v-model.number="form.stock" type="number" min="0" step="1" placeholder="Stock" />

    <button type="submit" :disabled="loading">{{ loading ? "Guardando..." : "Guardar" }}</button>
    <button type="button" @click="emit('cancelar')">Cancelar</button>
  </form>
</template>
```

### 3.7 `src/views/AdminView.vue`: la pantalla del CRUD

```vue
<script setup>
import { ref, onMounted } from "vue";
import useProductosAdmin from "../composables/useProductosAdmin.js";
import ProductoForm from "../components/ProductoForm.vue";

const { productos, loading, error, cargar, crear, actualizar, eliminar } = useProductosAdmin();

const mostrarForm = ref(false);
const editando = ref(null); // producto en edición (null = alta)

const nuevo = () => {
  editando.value = null;
  mostrarForm.value = true;
};

const editar = (producto) => {
  editando.value = producto;
  mostrarForm.value = true;
};

const guardar = async (datos) => {
  const ok = editando.value
    ? await actualizar(editando.value.id, datos)
    : await crear(datos);
  if (ok) mostrarForm.value = false;
};

const borrar = async (producto) => {
  if (confirm(`¿Eliminar "${producto.nombre}"?`)) await eliminar(producto.id);
};

onMounted(cargar);
</script>

<template>
  <h1>Administración de productos</h1>

  <button @click="nuevo">Nuevo producto</button>
  <p v-if="error" class="error">{{ error }}</p>

  <ProductoForm
    v-if="mostrarForm"
    :producto="editando"
    :loading="loading"
    @guardar="guardar"
    @cancelar="mostrarForm = false"
  />

  <p v-if="loading && !productos.length">Cargando...</p>

  <table v-else>
    <thead>
      <tr><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th></th></tr>
    </thead>
    <tbody>
      <tr v-for="p in productos" :key="p.id">
        <td>{{ p.nombre }}</td>
        <td>{{ p.categoria }}</td>
        <td>{{ p.precio }}</td>
        <td>{{ p.stock }}</td>
        <td>
          <button @click="editar(p)">Editar</button>
          <button @click="borrar(p)">Eliminar</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

### 3.8 `src/router/index.js`: guard por rol

La ruta declara qué exige (`meta`) y un único guard lo controla. Agregar otra ruta de admin es solo agregar `meta: { requiresAdmin: true }`.

```js
import { createRouter, createWebHistory } from 'vue-router'
import useAuthStore from '../stores/authStore.js'

const routes = [
    { path: '/', name: 'Catalogo', component: () => import('../views/CatalogoView.vue') },
    { path: '/admin', name: 'Admin', component: () => import('../views/AdminView.vue'), meta: { requiresAdmin: true } },
    { path: '/signin', name: 'Signin', component: () => import('../views/SignInView.vue') },
    { path: '/signup', name: 'Signup', component: () => import('../views/SignUpView.vue') },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Reglas de navegación (UX, no seguridad: la seguridad real es RLS)
router.beforeEach((to) => {
    const auth = useAuthStore()
    if (to.meta.requiresAdmin && !auth.isAdmin) {
        return auth.isAuthenticated ? { name: 'Catalogo' } : { name: 'Signin' }
    }
})

export default router
```

### 3.9 `src/App.vue`: mostrar el link solo a admins

```vue
<RouterLink to="/admin" v-if="auth.isAdmin">Admin</RouterLink>
```

---

## 4. Resumen de archivos

| Archivo | Acción |
|---|---|
| SQL: `es_admin()`, políticas de `user_roles` y `productos` | Ejecutar en SQL Editor |
| `src/main.js` | Modificar (orden de `use`) |
| `src/services/api.js` | Agregar `extraerMensaje` |
| `src/services/products.js` | Reescribir (CRUD completo) |
| `src/composables/useFetchProducts.js` | Adaptar a `productsService.listar()` |
| `src/composables/useProductosAdmin.js` | Nuevo |
| `src/components/ProductoForm.vue` | Nuevo |
| `src/views/AdminView.vue` | Reescribir |
| `src/router/index.js` | Agregar `meta` y `beforeEach` |
| `src/App.vue` | Link `Admin` con `v-if="auth.isAdmin"` |

## 5. Checklist de pruebas

| Prueba | Resultado esperado |
|---|---|
| Entrar sin sesión a `/` | Se ve el catálogo |
| Entrar sin sesión a `/admin` | Redirige a Sign In |
| Login con usuario **no admin** y entrar a `/admin` | Redirige al catálogo; no ve el link "Admin" |
| Login con admin | Ve el link y la tabla |
| Crear con precio negativo o sin nombre | Error de validación **sin** llamar a la API |
| Crear / editar / eliminar como admin | Funciona y la tabla se refresca |
| Usuario común edita `sessionStorage` (`auth.admin = true`), entra a `/admin` e intenta eliminar | El guard lo deja pasar (es UX), pero aparece "No se pudo eliminar (¿sos admin?)": **RLS lo frenó** |

El último caso es el más importante para explicar en clase: demuestra que la seguridad no está en el frontend.

## 6. Buenas prácticas aplicadas

| Práctica | Dónde se ve |
|---|---|
| Separación en capas (service / composable / vista) | Cada archivo tiene una sola responsabilidad |
| Fail fast | `prepararProducto` valida antes de llamar a la API |
| Defensa en capas | Validación en el frontend + `CHECK` y RLS en la base |
| Mínimo privilegio | Solo admin escribe; nadie escribe roles desde el frontend |
| Inyección de dependencias | `useProductosAdmin(service)` se puede testear con un service falso |
| `PATCH`/`DELETE` siempre con filtro | Evita modificar toda la tabla por error |
| Componente "tonto" | `ProductoForm` solo recibe props y emite eventos |
