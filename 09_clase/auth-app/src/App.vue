<script setup>
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { state } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const { usuario, perfil, isAuthenticated, esAdmin, logout } = useAuth()

async function salir() {
  await logout()
  router.push({ name: 'productos' })
}

// Si la sesión desaparece (401) en una ruta protegida, se vuelve al login
watch(
  () => state.session,
  (sesion) => {
    if (!sesion && route.meta.requiresAuth) {
      router.push({ name: 'login', query: { redirect: route.fullPath } })
    }
  }
)
</script>

<template>
  <header class="barra">
    <strong>Inventario</strong>

    <nav>
      <RouterLink to="/">Productos</RouterLink>
      <!-- Solo admin -->
      <RouterLink v-if="esAdmin" to="/dashboard">Dashboard</RouterLink>
      <RouterLink v-if="esAdmin" to="/usuarios">Usuarios</RouterLink>
    </nav>

    <div class="sesion">
      <template v-if="isAuthenticated">
        <span>
          {{ perfil?.nombre ?? usuario?.email }}
          <span v-if="perfil" class="etiqueta">{{ perfil.rol }}</span>
        </span>
        <button class="secundario" @click="salir">Salir</button>
      </template>
      <template v-else>
        <RouterLink to="/login">Ingresar</RouterLink>
        <RouterLink to="/signup">Registrarme</RouterLink>
      </template>
    </div>
  </header>

  <main class="contenedor">
    <RouterView />
  </main>
</template>
