<script setup>
import { ref } from 'vue';
import anime from 'animejs';

const props = defineProps({
  product: { type: Object, required: true },
  liked: { type: Boolean, default: false }
});

const emit = defineEmits(['toggle-like']);
const heartRef = ref(null);

const handleLike = () => {
  emit('toggle-like', props.product.id);
  anime({
    targets: heartRef.value,
    scale: [1, 1.4, 1],
    duration: 350,
    easing: 'easeOutBack'
  });
};

// Fallback si la imagen de Unsplash no existe
const onImgError = (e) => {
  e.target.src = 'https://placehold.co/600x400/e8f5e9/2e7d32?text=EcoNatura';
};
</script>

<template>
  <div class="card">
    <img :src="product.imagen" :alt="product.nombre" @error="onImgError" />
    <button ref="heartRef" class="heart-btn" @click="handleLike">
      {{ liked ? '❤' : '🤍' }}
    </button>
    <h3>{{ product.nombre }}</h3>
    <p class="categoria">{{ product.categoria }}</p>
    <p>${{ product.precio.toLocaleString() }}</p>
  </div>
</template>
