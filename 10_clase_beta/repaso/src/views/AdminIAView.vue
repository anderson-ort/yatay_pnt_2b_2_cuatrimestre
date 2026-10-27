<script setup>
import { ref } from "vue";
import useCrudIA, { MAX_INSTRUCCION } from "../composables/useCrudIA.js";

const { propuesta, mensaje, loading, error, interpretar, confirmar, descartar } = useCrudIA();

const instruccion = ref("");

const ejemplos = [
  "Subí el precio de Ashwagandha KSM-66 a 25000",
  "Agregá un Magnesio Bisglicinato a 18000, categoría minerales",
  "Borrá Ashwagandha KSM-66",
];

// For "eliminar" there are no new values: show the current product
const filas = (p) => (p.accion === "eliminar" ? p.actual : p.datos);
</script>

<template>
  <div>
    <h2>Administrar productos con IA</h2>

    <textarea
      v-model="instruccion"
      rows="3"
      :maxlength="MAX_INSTRUCCION"
      placeholder="Ej: subí el precio de la creatina a 20000"
    />
    <p class="contador">{{ instruccion.length }} / {{ MAX_INSTRUCCION }}</p>
    <button :disabled="loading" @click="interpretar(instruccion)">
      {{ loading ? "Pensando..." : "Interpretar" }}
    </button>

    <div class="ejemplos">
      <button v-for="e in ejemplos" :key="e" type="button" :disabled="loading" @click="instruccion = e">{{ e }}</button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="mensaje">{{ mensaje }}</p>

    <!-- The proposal is NOT applied automatically: the admin reviews it and decides -->
    <section v-if="propuesta" class="propuesta">
      <h3>Propuesta: {{ propuesta.accion }}</h3>
      <p>{{ propuesta.explicacion }}</p>

      <!-- Values are rendered as text with {{ }} (never v-html): the AI output is untrusted -->
      <table v-if="propuesta.accion !== 'ninguna'">
        <thead>
          <tr><th>Campo</th><th>Actual</th><th>Nuevo</th></tr>
        </thead>
        <tbody>
          <tr v-for="(valor, campo) in filas(propuesta)" :key="campo">
            <td>{{ campo }}</td>
            <td>{{ propuesta.actual?.[campo] ?? "-" }}</td>
            <td>{{ propuesta.accion === "eliminar" ? "(se elimina)" : valor }}</td>
          </tr>
        </tbody>
      </table>

      <button v-if="propuesta.accion !== 'ninguna'" :disabled="loading" @click="confirmar">Confirmar</button>
      <button :disabled="loading" @click="descartar">Descartar</button>
    </section>
  </div>
</template>

<style scoped>
textarea { width: 100%; box-sizing: border-box; }
.contador { font-size: .8rem; margin: .2rem 0; }
.ejemplos { display: flex; flex-wrap: wrap; gap: .5rem; margin: 1rem 0; }
.error { color: crimson; }
.propuesta { border: 1px solid #ccc; padding: 1rem; margin-top: 1rem; }
table { border-collapse: collapse; margin-bottom: 1rem; }
th, td { border: 1px solid #ccc; padding: .3rem .6rem; text-align: left; }
</style>
