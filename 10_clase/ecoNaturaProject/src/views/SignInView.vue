<script setup>
import { reactive } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useRoute, useRouter } from 'vue-router'

import authStore from '../stores/authStore.js'
import getRoleByUserId from '../services/roles.js'

const route = useRoute()
const router = useRouter()
const auth = authStore()

const { login, loading, error } = useAuth()

const formValues = reactive({
  email: '',
  password: ''
})


const loginUser = async () => {
  try {
    const {user, accessToken } = await login(formValues.email, formValues.password)
    
    auth.token = accessToken

    const role = await getRoleByUserId(user.id)
    auth.setUser(user, accessToken , role) // Set the user in the auth store
    // vuelve a donde el usuario quería ir (guard: ?redirect=/admin)
    const redirect = route.query.redirect
    const destino = (typeof redirect === 'string' && redirect.startsWith('/'))
      ? redirect
      : { name: 'Catalogo' }
    router.push(destino)
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
