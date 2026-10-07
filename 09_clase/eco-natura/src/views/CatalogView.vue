<script setup>
import { ref } from "vue";
import ProductCard from "../components/ProductCard.vue";
import useFetchProducts from "../composables/useFetchProducts.js";

const { products, loading, error } = useFetchProducts();

const likedIds = ref(new Set());

const toggleLike = (id) => {
  likedIds.value.has(id) ? likedIds.value.delete(id) : likedIds.value.add(id);
  likedIds.value = new Set(likedIds.value); // fuerza reactividad
};


</script>

<template>
  <div>
    <div class="catalog-header">
      <h2>Catálogo de Productos</h2>
      <span class="like-counter">❤ {{ likedIds.size }} favoritos</span>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading">Cargando catálogo...</p>
    <div v-else class="grid">
      <ProductCard v-for="item in products" :key="item.id" :product="item" :liked="likedIds.has(item.id)"
        @toggle-like="toggleLike" />
    </div>
  </div>
</template>
