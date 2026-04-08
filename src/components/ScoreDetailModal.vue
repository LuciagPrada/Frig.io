<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal" style="max-width:900px;max-height:90vh;overflow-y:auto">
      <!-- Encabezado -->
      <div class="modal-header">
        <div>
          <h2 style="margin:0;font-size:1.4rem;font-weight:700">{{ partitura.titulo }}</h2>
          <p style="margin:0.25rem 0 0;color:var(--color-text-secondary);font-size:0.9rem">
            Compuesto por {{ partitura.autor }}
          </p>
        </div>
        <button class="modal-close" @click="$emit('close')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- Cuerpo -->
      <div class="modal-body" style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;align-items:start">
        <!--imagen -->
        <div style="border-radius:var(--radius-sm);overflow:hidden;border:1px solid var(--color-border)">
          <img
            v-if="imagenUrl"
            :src="imagenUrl"
            :alt="partitura.titulo"
            style="width:100%;display:block;max-height:500px;object-fit:contain;background:#f8f9fa"
          />
          <div v-else style="height:300px;background:linear-gradient(135deg,#1a2a3a,#2d4a3e);display:flex;align-items:center;justify-content:center">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
        </div>

        <!-- info y acciones -->
        <div>
          <div class="card" style="padding:1.25rem;margin-bottom:1rem">
            <h3 style="margin:0 0 1rem;font-size:1rem;font-weight:700;color:var(--color-navy)">
              Información de la Partitura
            </h3>
            <table style="width:100%;border-collapse:collapse">
              <tbody>
                <tr v-for="row in infoRows" :key="row.label">
                  <td style="padding:0.4rem 0;color:var(--color-text-secondary);font-size:0.875rem;width:45%">{{ row.label }}</td>
                  <td style="padding:0.4rem 0;font-weight:500;font-size:0.875rem">{{ row.value || '—' }}</td>
                </tr>
              </tbody>
            </table>

            <!-- fiabilidad -->
            <div v-if="fiabilidad != null" style="margin-top:1rem">
              <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:0.35rem">
                <span style="color:var(--color-text-secondary)">Fiabilidad OMR</span>
                <span :style="{ color: fiabilidad >= 0.85 ? '#065f46' : '#92400e', fontWeight:600 }">
                  {{ Math.round(fiabilidad * 100) }}%
                </span>
              </div>
              <div style="background:var(--color-border);border-radius:9999px;height:6px;overflow:hidden">
                <div
                  :style="{
                    width: Math.round(fiabilidad * 100) + '%',
                    height:'100%',
                    background: fiabilidad >= 0.85 ? '#10b981' : '#f59e0b',
                    borderRadius:'9999px'
                  }"
                />
              </div>
            </div>
          </div>

          <!-- Acciones -->
          <div style="display:flex;flex-direction:column;gap:0.75rem">
            <button class="btn btn-primary btn-full" style="display:flex;align-items:center;justify-content:center;gap:0.5rem" @click="$emit('reproducir', partitura)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Reproducir Partitura
            </button>
            <div style="display:flex;gap:0.75rem">
              <button class="btn btn-ghost" style="flex:1;display:flex;align-items:center;justify-content:center;gap:0.4rem" @click="$emit('descargar', partitura)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Descargar
              </button>
              <button class="btn btn-ghost" style="flex:1;display:flex;align-items:center;justify-content:center;gap:0.4rem" @click="$emit('compartir', partitura)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Compartir
              </button>
            </div>
            <button v-if="esPropio" class="btn btn-danger btn-full" style="display:flex;align-items:center;justify-content:center;gap:0.5rem" @click="handleEliminar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              Eliminar partitura
            </button>
          </div>
        </div>
      </div>

      <!-- Sección de comentarios -->
      <div class="modal-body" style="padding-top:0">
        <ComentariosSection
          :partitura-id="partitura.id_partitura"
          :user-id="authStore.user?.id || null"
        >
          <template #login-hint>
            <span>
              <a @click.prevent="$emit('request-login')" href="#" style="color:var(--color-primary);font-weight:600">Inicia sesión</a>
              para dejar un comentario
            </span>
          </template>
        </ComentariosSection>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/authStore.js'
import { formatDate } from '../utils/validators.js'
import ComentariosSection from './ComentariosSection.vue'

const props = defineProps({
  partitura: { type: Object, required: true },
})
const emit = defineEmits(['close', 'reproducir', 'descargar', 'compartir', 'eliminar', 'request-login'])
const authStore = useAuthStore()

const esPropio    = computed(() => authStore.user?.id === props.partitura.id_propietario)
const imagenUrl   = computed(() => props.partitura.transcripciones?.[0]?.ruta_imagen || null)
const fiabilidad  = computed(() => props.partitura.transcripciones?.[0]?.porcentaje_fiabilidad ?? null)

const infoRows = computed(() => [
  { label: 'Autor',              value: props.partitura.autor },
  { label: 'Título',             value: props.partitura.titulo },
  { label: 'Año de composición', value: props.partitura.ano_original },
  { label: 'Fecha de subida',    value: formatDate(props.partitura.fecha_subida) },
  { label: 'Instrumento',        value: props.partitura.instrumento },
  { label: 'Género',             value: props.partitura.genero },
])

function handleEliminar() {
  if (confirm(`¿Eliminar "${props.partitura.titulo}" de tu biblioteca?`)) {
    emit('eliminar', props.partitura.id_partitura)
    emit('close')
  }
}
</script>
