<script setup> 
import useCounter from '../composables/useCounter.js';
const { counter, increment, decrement } = useCounter();
</script>
<template>
    <div>
        <h1>Contador: {{ counter }}</h1>
        <button @click="increment">Aumentar el contador</button>
        <button @click="decrement">Disminuir el contador</button>
    </div>
</template>