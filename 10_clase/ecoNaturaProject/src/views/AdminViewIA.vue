<script setup>
import { ref, computed } from 'vue';
import config from '../config/index.js';
import useCrudIA from '../composables/useCrudIA.js'

const { propuesta, mensaje, loading, error, interpretar, confirmar, descartar } = useCrudIA()

const MAX_INSTRUCCION = config.maxInstruccion
const instruccion = ref("")

const hasMessage = computed(() => !!(error.value || mensaje.value))

const filas = (propuesta) => (propuesta.accion === 'eliminar' ? propuesta.actual : propuesta.datos)
</script>

<template>
    <div class="ia-admin-wrapper">
        <h2 class="title">Admin View Products With IA-Cohere</h2>

        <section class="glass-card instruccion">
            <p class="subtitle">Ingrese las instrucciones a efectuar</p>
            <textarea v-model="instruccion" rows="3" :maxlength="MAX_INSTRUCCION"
                placeholder="Ej: Subir el precio de Totoro a Ar$ 20000" />
            <div class="instruccion-footer">
                <p class="contador">{{ instruccion.length }} / {{ MAX_INSTRUCCION }}</p>
                <button class="btn-primary" :disabled="loading" @click="interpretar(instruccion)">
                    {{ loading ? 'El LLM está pensando...' : 'Interpretar' }}
                </button>
            </div>
        </section>

        <section v-if="hasMessage" class="glass-card errors">
            <p v-if="error" class="msg-error">{{ error }}</p>
            <p v-if="mensaje" class="msg-info">{{ mensaje }}</p>
        </section>

        <section v-if="propuesta" class="glass-card propuesta">
            <h3>Propuesta: <span class="badge">{{ propuesta.accion }}</span></h3>
            <p class="explicacion">{{ propuesta.explicacion }}</p>

            <table v-if="propuesta.accion !== 'ninguna'" class="glass-table">
                <thead>
                    <tr>
                        <th>Campo</th>
                        <th>Actual</th>
                        <th>Nuevo</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(valor, campo) in filas(propuesta)" :key="campo">
                        <td class="field">{{ campo }}</td>
                        <td class="val-actual">{{ propuesta.actual?.[campo] ?? "--" }}</td>
                        <td class="val-nuevo" :class="{ 'text-danger': propuesta.accion === 'eliminar' }">
                            {{ propuesta.accion === 'eliminar' ? '(se elimina)' : valor }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>

        <section class="accionable">
            <button v-if="propuesta && propuesta.accion !== 'ninguna'" class="btn-primary" :disabled="loading" @click="confirmar">
                Confirmar
            </button>
            <button class="btn-secondary" :disabled="loading" @click="descartar">
                Descartar
            </button>
        </section>
    </div>
</template>

<style scoped>
.ia-admin-wrapper {
    max-width: 680px;
    margin: 32px auto;
    padding: 0 16px;
    color: #ffffff;
}

.title {
    font-size: 26px;
    font-weight: 700;
    color: #ffffff;
    text-align: center;
    margin-bottom: 24px;
}

.glass-card {
    background: rgba(30, 27, 55, 0.65);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    padding: 28px 32px;
    margin-bottom: 24px;
}

.instruccion .subtitle {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 12px;
    text-align: left;
}

.instruccion textarea {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 12px 16px;
    color: #ffffff;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.instruccion textarea:focus {
    border-color: #e02567;
    box-shadow: 0 0 12px rgba(224, 37, 103, 0.3);
}

.instruccion textarea::placeholder {
    color: rgba(255, 255, 255, 0.35);
}

.instruccion-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
}

.contador {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
}

.errors {
    border-color: rgba(239, 68, 68, 0.4);
    background: rgba(45, 20, 30, 0.65);
}

.msg-error {
    color: #fca5a5;
    margin: 4px 0;
}

.msg-info {
    color: #93c5fd;
    margin: 4px 0;
}

.propuesta h3 {
    font-size: 18px;
    margin: 0 0 8px 0;
    text-align: left;
}

.badge {
    text-transform: capitalize;
    color: #e02567;
}

.explicacion {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    text-align: left;
    margin-bottom: 16px;
}

.glass-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 16px;
    text-align: left;
    font-size: 14px;
}

.glass-table th {
    padding: 10px 14px;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.9);
    font-weight: 600;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.glass-table td {
    padding: 10px 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-table .field {
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
}

.glass-table .val-actual {
    color: rgba(255, 255, 255, 0.6);
}

.glass-table .val-nuevo {
    color: #4ade80;
}

.glass-table .text-danger {
    color: #f87171;
}

.accionable {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 24px;
}

.btn-primary {
    background: linear-gradient(135deg, #e02567, #d81b60);
    color: #ffffff;
    border: none;
    padding: 12px 32px;
    border-radius: 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(224, 37, 103, 0.4);
    transition: transform 0.2s, box-shadow 0.3s;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(224, 37, 103, 0.6);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-secondary {
    background: transparent;
    color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 12px 28px;
    border-radius: 24px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.3s, border-color 0.3s;
}

.btn-secondary:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.6);
}
</style>