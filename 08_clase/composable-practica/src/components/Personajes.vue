<script setup>
import useFetchAPI from '../composables/useFetchAPI.js';
const url = import.meta.env.VITE_API_URL
const { data, error, loading } = useFetchAPI(url)
</script>

<template>

<div v-if="loading">Loading...</div>
<div v-else-if="error">Error: {{ error }}</div>
<div v-else>
  <ul>
    <li v-for="character in data.items" :key="character.id">
      {{ character.name }}
    </li>
  </ul>
</div>

</template>