<script setup>
import AnimatedLogo from "./components/AnimatedLogo.vue";
</script>

<template>
  <header class="navbar">
    <router-link to="/" class="brand"> EcoNatura</router-link>>
    <!-- <router-link to="/" class="brand"><AnimatedLogo /></router-link> -->
    <nav>
      <router-link to="/">Inicio</router-link>
      <router-link to="/catalogo">Catálogo</router-link>
      <router-link to="/auth">Ingresar</router-link>
    </nav>
  </header>
  <main class="container">
    <router-view />
  </main>
</template>
