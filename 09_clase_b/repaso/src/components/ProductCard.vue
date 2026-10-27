<script setup>
import useAuthStore from '../stores/authStore';


const auth = useAuthStore()

const props = defineProps({
  product: { type: Object, required: true }
});

// Fallback si la imagen de Unsplash no existe
const onImgError = (e) => {
  e.target.src = 'https://placehold.co/600x400/e8f5e9/2e7d32?text=EcoNatura';
};
</script>

<template>
  <div class="card">
    <img :src="product.imagen" :alt="product.nombre" @error="onImgError" />
    <h3>{{ product.nombre }}</h3>
    <span v-if="auth.isAdmin">
      <button > Edit </button>
      <button > Delete </button>
    </span>
    <p class="categoria">{{ product.categoria }}</p>
    <p>${{ product.precio.toLocaleString() }}</p>
    <br>
  </div>
</template>
