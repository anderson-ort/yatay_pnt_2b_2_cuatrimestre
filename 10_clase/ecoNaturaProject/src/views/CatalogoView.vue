<script setup>
import useFetchProducts from '../composables/useFetchProducts';
import ProductCard from '../components/ProductCard.vue';
import { onMounted } from 'vue';

const { data, loading, error, retrieveProducts } = useFetchProducts()

const handleRetriever = async () => {
  retrieveProducts()
}


onMounted(()=>retrieveProducts())

</script>

<template>
  <div>
    <h1>Catalogo View</h1>
  </div>
  <div v-if="error">{{ error }}</div>
  <div v-if="loading"> Cargando los productos </div>

  <div v-if="data" class="grid">
      <ProductCard v-for="item in data" :key="item.id" :product="item" />
  </div>
</template>
