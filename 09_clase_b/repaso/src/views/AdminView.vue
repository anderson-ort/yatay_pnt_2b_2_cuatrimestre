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
  // TODO: Implementar algun toast message-> 
  if (!confirm(`¿Borrar "${product.nombre}"?`)) return
  const ok = await deleteProduct(product.id)
  if (ok && editingId.value === product.id) resetForm()
}

onMounted(() => loadProducts())
</script>

<template>
  <div>
    <h1>Admin View</h1>

    <form @submit.prevent="handleSubmit" class="glass-form">
      <h2>{{ editingId === null ? 'Nuevo producto' : 'Editar producto' }}</h2>
      <p class="form-subtitle">Complete los campos a continuación</p>

      <div class="form-group">
        <label>Nombre</label>
        <input v-model="form.nombre" placeholder="Ingrese el nombre" required />
      </div>

      <div class="form-group">
        <label>Descripción</label>
        <input v-model="form.descripcion" placeholder="Ingrese la descripción" />
      </div>

      <div class="form-group">
        <label>Categoría</label>
        <input v-model="form.categoria" placeholder="Ingrese la categoría" />
      </div>

      <div class="form-group">
        <label>Imagen</label>
        <input v-model="form.imagen" placeholder="URL de la imagen" />
      </div>

      <div class="form-group">
        <label>Precio</label>
        <input v-model.number="form.precio" type="number" min="0" placeholder="0.00" />
      </div>

      <div class="button-group">
        <button type="submit" :disabled="loading" class="btn-submit">
          {{ editingId === null ? 'Crear' : 'Guardar' }}
        </button>
        <button v-if="editingId !== null" type="button" @click="resetForm" class="btn-cancel">
          Cancelar
        </button>
      </div>
    </form>

    <div v-if="error">{{ error }}</div>
    <div v-if="loading"> Cargando... </div>

    <div class="grid">
      <ProductCard v-for="item in products" :key="item.id" :product="item" editable @edit="startEdit"
        @delete="removeProduct" />
    </div>
  </div>
</template>

<style lang="css">
/* Estilos aplicados exclusivamente al formulario según imagen de referencia */
.glass-form {
  max-width: 520px;
  margin: 40px auto;
  padding: 40px 48px;
  background: rgba(30, 27, 60, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  color: #ffffff;
  text-align: center;
  box-sizing: border-box;
}

.glass-form h2 {
  font-size: 26px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 6px;
}

.glass-form .form-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 32px;
}

.glass-form .form-group {
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-bottom: 24px;
}

.glass-form label {
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 6px;
}

.glass-form input {
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 0;
  padding: 8px 0;
  color: #ffffff;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.glass-form input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.glass-form input:focus {
  border-bottom-color: #e02567;
  box-shadow: none;
}

.glass-form .button-group {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 36px;
}

.glass-form .btn-submit {
  background: linear-gradient(135deg, #e02567, #d81b60);
  color: #ffffff;
  border: none;
  padding: 12px 36px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.3s, box-shadow 0.3s;
  box-shadow: 0 4px 15px rgba(224, 37, 103, 0.4);
}

.glass-form .btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #f02d73, #e0195a);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(224, 37, 103, 0.6);
}

.glass-form .btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.glass-form .btn-cancel {
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s, border-color 0.3s;
}

.glass-form .btn-cancel:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.6);
}
</style>
