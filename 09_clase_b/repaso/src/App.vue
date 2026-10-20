<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import authStore from './stores/authStore.js'
import { useAuth } from './composables/useAuth.js'

const auth = authStore() // Initialize the auth store
const router = useRouter()
const { logout } = useAuth()

const logoutUser = async () => {
  try {
    await logout() // invalida el token en Supabase
  } catch (err) {
    console.error('Logout error:', err)
  } finally {
    auth.clearUser() // limpia el store aunque falle el signOut (ej: token vencido)
    router.push({ name: 'Signin' })
  }
}


</script>

<template>
  <h1>Vue Routing + Auth + Pinia</h1>
  <div>
    <span v-if="auth.isAuthenticated">Welcome, {{ auth.userEmail }}!</span>
    <button v-if="auth.isAuthenticated" @click="logoutUser">Logout</button>
  </div>
  <nav class="nav">
    <RouterLink to="/">Catalogo</RouterLink>
    <RouterLink to="/admin">Admin</RouterLink>
    <RouterLink to="/signin" v-if="!auth.isAuthenticated">Sign In</RouterLink>
    <RouterLink to="/signup" v-if="!auth.isAuthenticated">Sign Up</RouterLink>
  </nav>

  <main class="container">
    <RouterView />
  </main>

</template>
