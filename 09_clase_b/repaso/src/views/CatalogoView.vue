<script setup>
import useFetchProducts from '../composables/useFetchProducts';

const { data, loading, error } = useFetchProducts()

const handleRetriever = async () => {
  console.log("recargando data");
  
  retrieveProducts()
}

</script>

<template>
  <div>
    <h1>Catalogo View</h1>
    <button @click="handleRetriever">Reload</button>
  </div>
  <div v-if="error">{{ error }}</div>
  <div v-if="loading"> Cargando los productos </div>

  <div v-if="data">
    <div v-for="p in data">
      <p>{{ p.nombre }}</p>
    </div>
  </div>
</template>