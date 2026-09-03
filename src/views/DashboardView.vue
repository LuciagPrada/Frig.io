<template>
  <div>
    <AppHeader @open-auth="showAuth = true"/>

    <div class="page-container" style="max-width:860px">
      <!-- título -->
      <div style="text-align:center;margin-bottom:2rem;padding-top:1rem">
        <h1 class="page-title dashboard-title" style="font-size:2rem">Transcribe tus partituras manuscritas</h1>
        <p class="page-subtitle">
          Convierte imágenes de partituras escritas a mano en archivos digitales editables con OMR
        </p>
      </div>

      <!-- card de subida -->
      <div class="card upload-card" style="padding:2rem;margin-bottom:2rem">
        <h2 style="margin:0 0 0.25rem;font-size:1.1rem;font-weight:700">Subir partitura manuscrita</h2>
        <p style="color:var(--color-text-secondary);font-size:0.875rem;margin:0 0 1.25rem">
          Sube una imagen (JPG, PNG) de tu partitura escrita a mano
        </p>

        <UploadDropzone v-model:file="selectedFile"/>

        <!-- error general -->
        <div v-if="transcriptionError" class="alert alert-error" style="margin-top:1rem;display:flex;align-items:center;gap:0.5rem">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          {{ transcriptionError }}
        </div>

        <!-- resultado listo -->
        <div v-if="lastResult" class="alert alert-success" style="margin-top:1rem;display:flex;align-items:flex-start;gap:0.75rem;text-align:left">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top:0.1rem;flex-shrink:0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <div>
            <p style="margin:0 0 0.25rem;font-weight:600">¡Transcripción completada! Fiabilidad: {{ Math.round(lastResult.fiabilidad * 100) }}%</p>
            <p style="margin:0;font-size:0.875rem">Guardada en tu <router-link to="/biblioteca" style="font-weight:600;color:#065f46">biblioteca</router-link>.</p>
          </div>
        </div>

        <!-- aviso de copyright + confirmación obligatoria -->
        <div class="copyright-box">
          <p class="copyright-text">
            Frigio no se hace responsable de las partituras publicadas y subidas. Todas las partituras
            subidas y transcritas deben estar libres de copyright.
          </p>
          <label class="copyright-check">
            <input v-model="copyrightConfirmado" type="checkbox"/>
            <span>Confirmo que esta partitura está libre de copyright</span>
          </label>
        </div>

        <!-- botón transcribir -->
        <button
          class="btn btn-teal btn-full"
          style="margin-top:1.25rem;font-size:1rem;padding:0.9rem;border-radius:var(--radius-sm)"
          :disabled="!selectedFile || loading || !copyrightConfirmado"
          @click="handleTranscribir"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
          {{ loading ? 'Procesando...' : 'Transcribir partitura' }}
        </button>
      </div>

      <!-- cards de características -->
      <div class="responsive-three-column-grid">
        <div v-for="feat in features" :key="feat.title" class="card" style="padding:1.5rem;text-align:center">
          <div style="font-size:2rem;margin-bottom:0.75rem;color:var(--color-teal)" v-html="feat.icon"></div>
          <h3 style="font-size:0.95rem;font-weight:700;margin:0 0 0.4rem">{{ feat.title }}</h3>
          <p style="color:var(--color-text-secondary);font-size:0.83rem;margin:0;line-height:1.5">{{ feat.desc }}</p>
        </div>
      </div>
    </div>

    <!-- modals -->
    <TranscribingModal
      v-if="loading && !showMetadataForm"
      :current-status="statusMsg"
      :current-step="statusStep"
    />
    
    <ScoreMetadataForm
      v-if="showMetadataForm"
      :initial-data="aiResult.result.metadatos"
      :loading="saving"
      :status-msg="statusMsg"
      :error-msg="transcriptionError"
      @save="handleSaveFinal"
      @cancel="showMetadataForm = false"
    />

    <AuthModal v-if="showAuth" initial-tab="login" @close="showAuth = false"/>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import UploadDropzone from '../components/UploadDropzone.vue'
import TranscribingModal from '../components/TranscribingModal.vue'
import ScoreMetadataForm from '../components/ScoreMetadataForm.vue'
import AuthModal from '../components/AuthModal.vue'
import { useAuthStore } from '../stores/authStore.js'
import { usePartituraController } from '../controllers/PartituraController.js'

const authStore = useAuthStore()
const selectedFile = ref(null)
const loading = ref(false)
const saving = ref(false)
const statusMsg = ref('')
const statusStep = ref(0)
const transcriptionError = ref('')
const lastResult = ref(null)
const showAuth = ref(false)
//Sin esta confirmación no se permite lanzar la transcripción
const copyrightConfirmado = ref(false)

const showMetadataForm = ref(false)
const aiResult = ref(null)

const controller = usePartituraController()

async function handleTranscribir() {
  if (!selectedFile.value) return
  if (!authStore.isAuthenticated) { showAuth.value = true; return }

  loading.value = true
  statusStep.value = 0
  transcriptionError.value = ''
  lastResult.value = null

  try {
    const res = await controller.transcribirImagen(selectedFile.value, (msg, step) => {
      statusMsg.value = msg
      if (Number.isInteger(step)) statusStep.value = step
    })
    aiResult.value = res
    showMetadataForm.value = true
  } catch (e) {
    transcriptionError.value = e.message || 'Error durante la transcripción.'
  } finally {
    loading.value = false
    statusMsg.value = ''
    statusStep.value = 0
  }
}

async function handleSaveFinal(metadatosEditados) {
  if (saving.value) return
  saving.value = true
  transcriptionError.value = ''
  try {
    const id = await controller.guardarPartituraFinal({
      ...aiResult.value,
      metadatosEditados
    }, (msg) => { statusMsg.value = msg })
    
    lastResult.value = { id_partitura: id, fiabilidad: aiResult.value.result.fiabilidad }
    showMetadataForm.value = false
    selectedFile.value = null
  } catch (e) {
    // El error ahora se pasa al modal para que el usuario lo vea.
    // (No se usa JSON.stringify(e): podría filtrar detalles internos/stack al usuario.)
    console.error('[Dashboard] Error al guardar la partitura:', e)
    transcriptionError.value = e.message || 'Error al guardar la partitura.'
  } finally {
    saving.value = false
  }
}

const features = [
  { icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>', title: 'Reconocimiento OMR', desc: 'Tecnología avanzada de reconocimiento óptico de música basada en IA multimodal Qwen2.5.' },
  { icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>', title: 'Biblioteca personal', desc: 'Guarda todas tus partituras transcritas en tu biblioteca personal.' },
  { icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>', title: 'Compartir en comunidad', desc: 'Comparte tus partituras con la comunidad y descubre las de otros usuarios.' },
]
</script>

<style scoped>
.copyright-box {
  margin-top: 1.25rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
}
.copyright-text {
  margin: 0 0 0.6rem;
  font-size: 0.82rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}
.copyright-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 600px) {
  .dashboard-title { font-size: clamp(1.45rem, 8vw, 1.8rem) !important; }
  .upload-card { padding: 1.25rem !important; }
}
</style>
