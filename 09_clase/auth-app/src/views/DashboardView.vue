<script setup>
import { onMounted } from 'vue'
import { useDashboard } from '@/composables/useDashboard'

const { productos, usuariosPorRol, loading, error, cargar } = useDashboard()
onMounted(cargar)

const dinero = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)
</script>

<template>
  <section>
    <h2>Dashboard</h2>
    <p v-if="loading">Cargando...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="productos" class="grilla">
      <div class="tarjeta"><h3>Productos</h3><p class="numero">{{ productos.total }}</p></div>
      <div class="tarjeta"><h3>Sin stock</h3><p class="numero alerta">{{ productos.sinStock }}</p></div>
      <div class="tarjeta"><h3>Stock bajo</h3><p class="numero alerta">{{ productos.stockBajo }}</p></div>
      <div class="tarjeta"><h3>Valor del inventario</h3><p class="numero">{{ dinero(productos.valorInventario) }}</p></div>
    </div>

    <h3>Usuarios por rol</h3>
    <div v-if="usuariosPorRol" class="grilla">
      <div v-for="(cantidad, rol) in usuariosPorRol" :key="rol" class="tarjeta">
        <h3>{{ rol }}</h3>
        <p class="numero">{{ cantidad }}</p>
      </div>
    </div>
  </section>
</template>
