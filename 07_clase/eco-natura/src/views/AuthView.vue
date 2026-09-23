<script setup>
import { ref } from 'vue';
import { signIn, signUp } from '../services/api';

const email = ref('');
const password = ref('');
const mode = ref('login');
const message = ref('');

const submit = async () => {
  const user = mode.value === 'login'
    ? await signIn(email.value, password.value)
    : await signUp(email.value, password.value);
  message.value = `${mode.value === 'login' ? 'Ingresaste' : 'Cuenta creada'} como ${user.email} (mock)`;
};
</script>

<template>
  <form class="auth-form" @submit.prevent="submit">
    <h2>{{ mode === 'login' ? 'Ingresar' : 'Crear cuenta' }}</h2>
    <input v-model="email" type="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Contraseña" required />
    <button type="submit" class="btn-primary">{{ mode === 'login' ? 'Ingresar' : 'Registrarme' }}</button>
    <p class="toggle" @click="mode = mode === 'login' ? 'register' : 'login'">
      {{ mode === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Ingresá' }}
    </p>
    <p v-if="message" class="message">{{ message }}</p>
  </form>
</template>
