<script setup>
import { onMounted, reactive, ref } from 'vue';
import useProductAdmin from '../composables/useFetchProductsAdmin';
import ProductCard from '../components/ProductCard.vue';

const { products, loading, error, loadProducts, createProduct, editProduct, deleteProduct } = useProductAdmin()

const emptyForm = () => ({ nombre: '', descripcion: '', categoria: '', imagen: '', precio: 0 })

const form = reactive(emptyForm())
// null -> modo crear, id -> modo editar
const editingId = ref(null)

const resetForm = () => {
  Object.assign(form, emptyForm())
  editingId.value = null
}

const startEdit = (product) => {
  editingId.value = product.id
  Object.assign(form, {
    nombre: product.nombre,
    descripcion: product.descripcion ?? '',
    categoria: product.categoria ?? '',
    imagen: product.imagen ?? '',
    precio: product.precio
  })
}

const handleSubmit = async () => {
  const ok = editingId.value === null
    ? await createProduct({ ...form })
    : await editProduct(editingId.value, { ...form })
  if (ok) resetForm()
}

const removeProduct = async (product) => {
  if (!confirm(`¿Borrar "${product.nombre}"?`)) return
  const ok = await deleteProduct(product.id)
  if (ok && editingId.value === product.id) resetForm()
}

onMounted(() => loadProducts())
</script>

<template>
  <div>
    <h1>Admin View</h1>

    <form @submit.prevent="handleSubmit">
      <h2>{{ editingId === null ? 'Nuevo producto' : 'Editar producto' }}</h2>
      <input v-model="form.nombre" placeholder="Nombre" required />
      <input v-model="form.descripcion" placeholder="Descripcion" />
      <input v-model="form.categoria" placeholder="Categoria" />
      <input v-model="form.imagen" placeholder="URL de imagen" />
      <input v-model.number="form.precio" type="number" min="0" placeholder="Precio" />
      <button type="submit" :disabled="loading">
        {{ editingId === null ? 'Crear' : 'Guardar' }}
      </button>
      <button v-if="editingId !== null" type="button" @click="resetForm">Cancelar</button>
    </form>

    <div v-if="error">{{ error }}</div>
    <div v-if="loading"> Cargando... </div>

    <div class="grid">
      <ProductCard
        v-for="item in products"
        :key="item.id"
        :product="item"
        editable
        @edit="startEdit"
        @delete="removeProduct"
      />
    </div>
  </div>
</template>
