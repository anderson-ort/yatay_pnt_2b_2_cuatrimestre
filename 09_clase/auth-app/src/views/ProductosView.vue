<script setup>
import { ref, onMounted } from 'vue'
import { useProductos } from '@/composables/useProductos'
import { useAuth } from '@/composables/useAuth'
import productosService from '@/services/productosService'

const { productos, loading, error, cargar, crear, actualizar, eliminar } = useProductos(productosService)
const { puedeEditar, puedeEliminar } = useAuth()

const vacio = () => ({ nombre: '', categoria: '', precio: 0, stock: 0 })
const form = ref(vacio())
const editandoId = ref(null)
const mostrandoForm = ref(false)

onMounted(cargar)

function nuevo() {
  editandoId.value = null
  form.value = vacio()
  mostrandoForm.value = true
}

function editar(p) {
  editandoId.value = p.id
  form.value = { nombre: p.nombre, categoria: p.categoria ?? '', precio: p.precio, stock: p.stock }
  mostrandoForm.value = true
}

async function guardar() {
  const ok = editandoId.value
    ? await actualizar(editandoId.value, form.value)
    : await crear(form.value)
  if (ok) mostrandoForm.value = false
}

async function borrar(p) {
  if (confirm(`¿Eliminar "${p.nombre}"?`)) await eliminar(p.id)
}

const dinero = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)
</script>

<template>
  <section>
    <div class="encabezado">
      <h2>Productos</h2>
      <button v-if="puedeEditar" @click="nuevo">Nuevo producto</button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <form v-if="mostrandoForm" class="tarjeta" @submit.prevent="guardar">
      <h3>{{ editandoId ? 'Editar producto' : 'Nuevo producto' }}</h3>
      <label>Nombre <input v-model="form.nombre" required /></label>
      <label>Categoría <input v-model="form.categoria" /></label>
      <div class="fila">
        <label>Precio <input v-model.number="form.precio" type="number" min="0" step="0.01" required /></label>
        <label>Stock <input v-model.number="form.stock" type="number" min="0" step="1" required /></label>
      </div>
      <div class="fila">
        <button type="submit" :disabled="loading">Guardar</button>
        <button type="button" class="secundario" @click="mostrandoForm = false">Cancelar</button>
      </div>
    </form>

    <p v-if="loading && !productos.length">Cargando...</p>
    <p v-else-if="!productos.length">No hay productos.</p>

    <table v-else class="tabla">
      <thead>
        <tr>
          <th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th>
          <th v-if="puedeEditar">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in productos" :key="p.id">
          <td>{{ p.nombre }}</td>
          <td>{{ p.categoria }}</td>
          <td>{{ dinero(p.precio) }}</td>
          <td :class="{ alerta: p.stock < 10 }">{{ p.stock }}</td>
          <td v-if="puedeEditar" class="fila">
            <button class="secundario" @click="editar(p)">Editar</button>
            <button v-if="puedeEliminar" class="peligro" @click="borrar(p)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
