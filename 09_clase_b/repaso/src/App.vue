<script setup>
import { RouterLink, RouterView } from 'vue-router'
import authStore from './stores/authStore.js'

const auth = authStore() // Initialize the auth store


</script>

<template>
  <h1>Vue Routing + Auth + Pinia</h1>
  <div>
    <span v-if="auth.isAuthenticated">Welcome, {{ auth.userEmail }}!</span>
    <button v-if="auth.isAuthenticated" @click="auth.clearUser()">Logout</button>
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
