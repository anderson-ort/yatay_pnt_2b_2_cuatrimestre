<script setup>
import AnimatedLogo from '../components/AnimatedLogo.vue';
</script>

<template>
  <section class="hero">
    <AnimatedLogo />
    <h1>Bienestar natural, resultados reales</h1>
    <p>Suplementos y adaptógenos seleccionados para tu rutina diaria.</p>
    <div class="cta-group">
      <router-link to="/catalogo" class="btn-primary">Ver catálogo</router-link>
      <router-link to="/auth" class="btn-secondary">Ingresar / Registrarme</router-link>
    </div>
  </section>
</template>
