<script setup>
import { reactive } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useRouter } from 'vue-router'

import authStore from '../stores/authStore.js'
import getRoleByUserId from '../services/roles.js'

const router = useRouter()
const auth = authStore()

const { login, loading, error } = useAuth()

const formValues = reactive({
  email: '',
  password: ''
})


const loginUser = async () => {
  try {
    const user = await login(formValues.email, formValues.password)
    const role = await getRoleByUserId(user.id)
    // Handle successful login (e.g., redirect to another page)
    loading.value = false
    console.log({ user, role })
    auth.setUser(user, role) // Set the user in the auth store
    // ??? QUE PASA cuando se hace un login??????!
    router.push({ name: 'Catalogo' }) // Redirige a la página de inicio después del login exitoso
  } catch (err) {
    console.error('Login error:', err)
    error.value = err.message || 'An error occurred during login.'
  }
  finally {
    formValues.email = ''
    formValues.password = ''
  }
}

</script>

<template>
  <div>
    <h1>Sign In View</h1>
    <p>Welcome to the Sign In View!</p>
  </div>
  <div class="form">
    <form @submit.prevent="loginUser">
      <input type="email" placeholder="Email" v-model="formValues.email" />
      <input type="password" placeholder="Password" v-model="formValues.password" />

      <button type="submit"> {{ loading ? 'Logging in...' : 'Sign In' }} </button>
      <p v-if="error">{{ error }}</p>
    </form>
  </div>
</template>