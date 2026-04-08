<template>
  <div>
    <AppHeader @open-auth="showAuth = true"/>

    <div class="page-container" style="max-width:860px">
      <!-- título -->
      <div style="text-align:center;margin-bottom:2rem;padding-top:1rem">
        <h1 class="page-title" style="font-size:2rem">Transcribe tus partituras manuscritas</h1>
        <p class="page-subtitle">
          Convierte imágenes de partituras escritas a mano en archivos digitales editables con OMR
        </p>
      </div>

      <!-- card de subida -->
      <div class="card" style="padding:2rem;margin-bottom:2rem">
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

        <!-- botón transcribir -->
        <button
          class="btn btn-teal btn-full"
          style="margin-top:1.25rem;font-size:1rem;padding:0.9rem;border-radius:var(--radius-sm)"
          :disabled="!selectedFile || loading"
          @click="handleTranscribir"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
          {{ loading ? 'Procesando...' : 'Transcribir partitura' }}
        </button>
      </div>

      <!-- cards de características -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem">
        <div v-for="feat in features" :key="feat.title" class="card" style="padding:1.5rem;text-align:center">
          <div style="font-size:2rem;margin-bottom:0.75rem;color:var(--color-teal)" v-html="feat.icon"></div>
          <h3 style="font-size:0.95rem;font-weight:700;margin:0 0 0.4rem">{{ feat.title }}</h3>
          <p style="color:var(--color-text-secondary);font-size:0.83rem;margin:0;line-height:1.5">{{ feat.desc }}</p>
        </div>
      </div>
    </div>

    <!-- modals -->
    <TranscribingModal v-if="loading" :current-status="statusMsg"/>
    <AuthModal v-if="showAuth" initial-tab="login" @close="showAuth = false"/>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import UploadDropzone from '../components/UploadDropzone.vue'
import TranscribingModal from '../components/TranscribingModal.vue'
import AuthModal from '../components/AuthModal.vue'
import { useAuthStore } from '../stores/authStore.js'
import { usePartituraController } from '../controllers/PartituraController.js'

const authStore = useAuthStore()
const selectedFile = ref(null)
const loading = ref(false)
const statusMsg = ref('')
const transcriptionError = ref('')
const lastResult = ref(null)
const showAuth = ref(false)

const controller = usePartituraController(authStore.user?.id)

async function handleTranscribir() {
  if (!selectedFile.value) return
  if (!authStore.isAuthenticated) { showAuth.value = true; return }

  loading.value = true
  transcriptionError.value = ''
  lastResult.value = null

  try {
    const result = await controller.subirYTranscribir(selectedFile.value, (msg) => {
      statusMsg.value = msg
    })
    lastResult.value = result
    selectedFile.value = null
  } catch (e) {
    transcriptionError.value = e.message || 'Error durante la transcripción.'
  } finally {
    loading.value = false
    statusMsg.value = ''
  }
}

const features = [
  { icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>', title: 'Reconocimiento OMR', desc: 'Tecnología avanzada de reconocimiento óptico de música basada en IA multimodal Qwen2.5.' },
  { icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>', title: 'Biblioteca Personal', desc: 'Guarda todas tus partituras transcritas en tu biblioteca personal.' },
  { icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>', title: 'Compartir en Comunidad', desc: 'Comparte tus partituras con la comunidad y descubre las de otros usuarios.' },
]
</script>
