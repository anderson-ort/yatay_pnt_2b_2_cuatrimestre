<script setup>
import { reactive } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useRouter } from 'vue-router'
const { register, loading, error } = useAuth()
const router = useRouter()

const formValues = reactive({
  email: '',
  password: ''
})

const registerUser = async () => {
  try {
    await register(formValues.email, formValues.password)
    router.push('/signin')
  } catch (err) {
    console.error('Registration error:', err)
    error.value = err.message || 'An error occurred during registration.'
  }
  finally {
    formValues.email = ''
    formValues.password = ''
  }
}

</script>

<template>
  <div>
    <h1>Sign Up View</h1>
    <p>Welcome to the Sign Up View!</p>
  </div>
  <div class="form">
    <form @submit.prevent="registerUser">
      <input type="email" placeholder="Email" v-model="formValues.email" />
      <input type="password" placeholder="Password" v-model="formValues.password" />

      <button type="submit"> {{ loading ? 'Registering user...' : 'Sign Up' }} </button>
      <p v-if="error">{{ error }}</p>
    </form>
  </div>

</template>