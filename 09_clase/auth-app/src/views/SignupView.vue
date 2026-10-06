<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { signup, loading, error } = useAuth()

const nombre = ref('')
const email = ref('')
const password = ref('')
const repetir = ref('')
const errorLocal = ref(null)
const confirmacionPendiente = ref(false)

async function enviar() {
  errorLocal.value = null
  if (password.value.length < 6) {
    errorLocal.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }
  if (password.value !== repetir.value) {
    errorLocal.value = 'Las contraseñas no coinciden'
    return
  }

  const { ok, data } = await signup({
    nombre: nombre.value.trim(),
    email: email.value.trim(),
    password: password.value
  })

  if (!ok) return
  if (data.sesionIniciada) router.push('/')
  else confirmacionPendiente.value = true
}
</script>

<template>
  <section class="tarjeta angosta">
    <h2>Crear cuenta</h2>

    <div v-if="confirmacionPendiente">
      <p>Te enviamos un correo a <strong>{{ email }}</strong>. Confirmalo para poder ingresar.</p>
      <RouterLink to="/login">Ir a ingresar</RouterLink>
    </div>

    <form v-else @submit.prevent="enviar">
      <label>Nombre
        <input v-model="nombre" required />
      </label>
      <label>Email
        <input v-model="email" type="email" required autocomplete="username" />
      </label>
      <label>Contraseña
        <input v-model="password" type="password" required autocomplete="new-password" />
      </label>
      <label>Repetir contraseña
        <input v-model="repetir" type="password" required autocomplete="new-password" />
      </label>

      <p v-if="errorLocal || error" class="error">{{ errorLocal || error }}</p>
      <button type="submit" :disabled="loading">{{ loading ? 'Creando...' : 'Crear cuenta' }}</button>
      <p class="chico">Las cuentas nuevas empiezan con el rol "user".</p>
    </form>
  </section>
</template>
