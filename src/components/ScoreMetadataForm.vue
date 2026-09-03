<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal-box card" style="max-width:500px;width:95%;padding:2rem">
      <div style="text-align:center;margin-bottom:1.5rem">
        <div style="width:64px;height:64px;background:#f0fdfa;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <h2 style="margin:0;font-size:1.25rem;font-weight:700;color:var(--color-navy)">Revisar transcripción</h2>
        <p style="color:var(--color-text-secondary);font-size:0.9rem;margin:0.25rem 0 0">
          La IA ha detectado estos datos. Por favor, corrígelos si es necesario.
        </p>
      </div>
      <div v-if="errorMsg" class="alert alert-error" style="margin-bottom:1.5rem;display:flex;align-items:center;gap:0.5rem">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        {{ errorMsg }}
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label">Título de la obra *</label>
          <input v-model="form.titulo" type="text" class="form-input" required placeholder="Ej: Minueto en Sol Mayor"/>
        </div>

        <div class="form-group">
          <label class="form-label">Autor / Compositor</label>
          <input v-model="form.autor" type="text" class="form-input" placeholder="Ej: J.S. Bach"/>
        </div>

        <div class="metadata-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <div class="form-group">
            <label class="form-label">Instrumento</label>
            <input v-model="form.instrumento" type="text" class="form-input" placeholder="Ej: Piano"/>
          </div>
          <div class="form-group">
            <label class="form-label">Año (aprox)</label>
            <input v-model="form.ano_original" type="number" class="form-input" placeholder="Ej: 1725"/>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Género Musical</label>
          <input v-model="form.genero" type="text" class="form-input" placeholder="Ej: Barroco"/>
        </div>

        <div class="metadata-actions" style="display:flex;gap:1rem;margin-top:2rem">
          <button type="button" class="btn btn-secondary" style="flex:1" @click="$emit('cancel')">Descartar</button>
          <button type="submit" class="btn btn-primary" style="flex:1" :disabled="loading">
            <span v-if="loading" class="spinner spinner-sm" style="margin-right:0.5rem"/>
            {{ loading && statusMsg ? statusMsg : 'Guardar Partitura' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  initialData: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  errorMsg: { type: String, default: '' },
  statusMsg: { type: String, default: '' }
})

const emit = defineEmits(['save', 'cancel'])

const form = reactive({
  titulo: props.initialData.titulo || '',
  autor: props.initialData.autor || '',
  instrumento: props.initialData.instrumento || '',
  ano_original: props.initialData.ano_original || props.initialData.ano || null,
  genero: props.initialData.genero || '',
})

function handleSubmit() {
  if (props.loading) return
  emit('save', { ...form })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}
.modal-box {
  animation: slideUp 0.3s ease;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 600px) {
  .modal-overlay { padding: 0.75rem; }
  .modal-box {
    width: 100% !important;
    max-height: calc(100dvh - 1.5rem);
    overflow-y: auto;
    padding: 1.25rem !important;
  }
  .metadata-grid { grid-template-columns: 1fr !important; }
}

@media (max-width: 400px) {
  .metadata-actions { flex-direction: column; }
}
</style>
