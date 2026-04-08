<template>
  <div class="modal-backdrop">
    <div class="modal modal-sm" style="text-align:center;padding:2.5rem 2rem">
      <!-- Spiner -->
      <div style="display:flex;justify-content:center;margin-bottom:1.5rem">
        <div class="spinner" style="width:56px;height:56px;border-width:5px"/>
      </div>

      <h2 style="margin:0 0 0.5rem;font-size:1.25rem;font-weight:700">Transcribiendo partitura</h2>
      <p style="color:var(--color-text-secondary);font-size:0.9rem;margin:0 0 1.5rem;min-height:1.5rem">
        {{ currentStatus }}
      </p>

      <!-- Pasos -->
      <div style="text-align:left;background:var(--color-bg);border-radius:var(--radius-sm);padding:1rem;margin-bottom:1.5rem">
        <div v-for="(step, i) in steps" :key="i" style="display:flex;align-items:center;gap:0.6rem;padding:0.3rem 0">
          <span :style="{ fontSize:'0.9rem', opacity: i <= currentStepIndex ? 1 : 0.35, display:'flex', alignItems:'center', justifyContent:'center', width:'20px' }">
            <svg v-if="i < currentStepIndex" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <div v-else-if="i === currentStepIndex" class="spinner spinner-sm" style="width:14px;height:14px;border-width:2px;border-top-color:var(--color-navy)"/>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
          </span>
          <span :style="{ fontSize:'0.85rem', color: i <= currentStepIndex ? 'var(--color-navy)' : 'var(--color-text-secondary)', fontWeight: i === currentStepIndex ? 600 : 400 }">
            {{ step }}
          </span>
        </div>
      </div>

      <p style="color:var(--color-text-secondary);font-size:0.8rem;margin:0;display:flex;align-items:center;justify-content:center;gap:0.4rem">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Tiempo estimado: 30–60 segundos
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentStatus: { type: String, default: 'Iniciando proceso...' },
})

const steps = [
  'Cargando imagen en buffer OMR',
  'Analizando imagen con IA Multimodal',
  'Detectando claves, compás, notas y silencios',
  'Mapeando elementos a estructura XML',
  'Calculando porcentaje de fiabilidad',
  'Generando archivo MusicXML',
  'Guardando en tu biblioteca',
]

const statusToStep = {
  'Subiendo imagen': 0,
  'Enviando imagen': 0,
  'Cargando imagen': 0,
  'Analizando imagen': 1,
  'Detectando claves': 2,
  'Detectando notas': 2,
  'Mapeando elementos': 3,
  'Calculando porcentaje': 4,
  'Generando archivo': 5,
  'Generando MusicXML': 5,
  'Guardando MusicXML': 5,
  'Guardando en tu': 6,
  'Procesando respuesta': 5,
}

const currentStepIndex = computed(() => {
  const status = props.currentStatus || ''
  for (const [key, idx] of Object.entries(statusToStep)) {
    if (status.includes(key.split(' ')[0])) return idx
  }
  return 0
})
</script>
