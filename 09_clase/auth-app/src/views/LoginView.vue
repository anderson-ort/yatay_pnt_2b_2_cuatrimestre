<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { login, loading, error } = useAuth()

const email = ref('')
const password = ref('')
const recordar = ref(false)

async function enviar() {
  const { ok } = await login(email.value.trim(), password.value, recordar.value)
  if (ok) router.push(route.query.redirect || '/')
}
</script>

<template>
  <section class="tarjeta angosta">
    <h2>Ingresar</h2>
    <form @submit.prevent="enviar">
      <label>Email
        <input v-model="email" type="email" required autocomplete="username" />
      </label>
      <label>Contraseña
        <input v-model="password" type="password" required autocomplete="current-password" />
      </label>
      <label class="check">
        <input v-model="recordar" type="checkbox" />
        Mantener sesión iniciada en este dispositivo
      </label>

      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" :disabled="loading">{{ loading ? 'Ingresando...' : 'Ingresar' }}</button>
    </form>
    <p class="chico">¿No tenés cuenta? <RouterLink to="/signup">Registrate</RouterLink></p>
  </section>
</template>
