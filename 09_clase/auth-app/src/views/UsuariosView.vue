<script setup>
import { onMounted } from 'vue'
import { useUsuarios } from '@/composables/useUsuarios'
import { useAuth } from '@/composables/useAuth'
import { JERARQUIA } from '@/config/roles'

const { usuarios, loading, error, cargar, cambiarRol } = useUsuarios()
const { usuario } = useAuth()

onMounted(cargar)
</script>

<template>
  <section>
    <h2>Usuarios</h2>
    <p v-if="loading && !usuarios.length">Cargando...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <table class="tabla">
      <thead>
        <tr><th>Nombre</th><th>Email</th><th>Rol</th></tr>
      </thead>
      <tbody>
        <tr v-for="u in usuarios" :key="u.id">
          <td>{{ u.nombre }}</td>
          <td>{{ u.email }}</td>
          <td>
            <select
              :value="u.rol"
              :disabled="u.id === usuario?.id"
              @change="cambiarRol(u.id, $event.target.value)"
            >
              <option v-for="r in JERARQUIA" :key="r" :value="r">{{ r }}</option>
            </select>
            <span v-if="u.id === usuario?.id" class="chico"> (vos)</span>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
