<script setup>
import { ref, onMounted } from "vue";
import { fetchProducts } from "../services/api";
import ProductCard from "../components/ProductCard.vue";

const products = ref([]);
const loading = ref(true);
const likedIds = ref(new Set());

const toggleLike = (id) => {
  likedIds.value.has(id) ? likedIds.value.delete(id) : likedIds.value.add(id);
  likedIds.value = new Set(likedIds.value); // fuerza reactividad
};

onMounted(async () => {
  //  Es importante notar que esto sucede en uno de los objetos importantes de vue --> Se usa con `onMounted` ->  Es un hook para ingestar wue se ejecuta inmediatamente
  //  despues que el compnente ha sido renderizado.

  products.value = await fetchProducts();
  loading.value = false;
});
</script>

<template>
  <div>
    <div class="catalog-header">
      <h2>Catálogo de Productos</h2>
      <span class="like-counter">❤ {{ likedIds.size }} favoritos</span>
    </div>
    <p v-if="loading">Cargando catálogo...</p>
    <div v-else class="grid">
      <ProductCard
        v-for="item in products"
        :key="item.id"
        :product="item"
        :liked="likedIds.has(item.id)"
        @toggle-like="toggleLike"
      />
    </div>
  </div>
</template>
