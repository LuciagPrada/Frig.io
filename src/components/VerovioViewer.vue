<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal" style="max-width:900px">
      <div class="modal-header">
        <h2 style="margin:0;font-size:1.2rem;font-weight:700;display:flex;align-items:center;gap:0.5rem">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          Reproducción de Partitura
        </h2>
        <button class="modal-close" @click="$emit('close')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="modal-body" style="display:flex;flex-direction:column;gap:1.5rem">
        <div v-if="loading" style="display:flex;flex-direction:column;align-items:center;gap:1rem;padding:2rem">
          <div class="spinner"/>
          <p style="color:var(--color-text-secondary)">Renderizando partitura...</p>
        </div>
        <div v-else-if="svgContent" style="display:flex;flex-direction:column;gap:1rem">
          <div class="viewer-controls" style="display:flex;align-items:center;gap:1rem;background:var(--color-surface);padding:1rem;border-radius:var(--radius-md);border:1px solid var(--color-border)">
            <button class="btn btn-primary" @click="togglePlay" :disabled="!isReady" style="display:flex;align-items:center;gap:0.4rem;min-width:140px;justify-content:center">
              <svg v-if="isPlaying" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              {{ isPlaying ? 'Pausar' : 'Reproducir Audio' }}
            </button>
            <button class="btn btn-secondary" @click="stopPlay" :disabled="!isPlaying" style="display:flex;align-items:center;gap:0.4rem">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
              Detener
            </button>
            <span v-if="!isReady" style="font-size:0.875rem;color:var(--color-text-secondary);margin-left:auto">Cargando sonido...</span>
          </div>
          <div v-html="svgContent" style="width:100%;overflow-x:auto;padding:1rem;background:#fff;border-radius:var(--radius-md);border:1px solid var(--color-border)"/>
        </div>
        <div v-else-if="error" class="alert alert-error">{{ error }}</div>
        <div v-else class="alert alert-info">No hay contenido MusicXML para mostrar.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import DOMPurify from 'dompurify'
import { getVerovioToolkit } from '../utils/verovioLoader.js'

const props = defineProps({
  musicxml: { type: String, required: true },
})
const emit = defineEmits(['close'])

const loading = ref(true)
const svgContent = ref('')
const error = ref('')

const isPlaying = ref(false)
const isReady = ref(false)
let midiPlayer = null
let soundfontPiano = null
let audioCtx = null
const loadedScripts = []

onMounted(async () => {
  try {
    const tk = await getVerovioToolkit()
    tk.setOptions({ scale: 40, pageWidth: 2000, adjustPageHeight: true, breaks: 'auto' })
    tk.loadData(props.musicxml)
    svgContent.value = DOMPurify.sanitize(tk.renderToSVG(1), {
      USE_PROFILES: { svg: true, svgFilters: true },
      ADD_TAGS: ['use'],
      ADD_ATTR: ['xlink:href', 'href'],
    })

    const base64midi = tk.renderToMIDI()
    window.generatedMidi = base64midi

    if (!window.MidiPlayer) await loadScript('https://cdn.jsdelivr.net/npm/midi-player-js@2.0.16/browser/midiplayer.min.js')
    if (!window.Soundfont) await loadScript('https://cdn.jsdelivr.net/npm/soundfont-player@0.12.0/dist/soundfont-player.min.js')

    isReady.value = true
  } catch (e) {
    error.value = 'Error al renderizar: ' + e.message
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  stopPlay()
  if (audioCtx) {
    audioCtx.close()
    audioCtx = null
  }
  for (const s of loadedScripts) s.remove()
  loadedScripts.length = 0
})

async function initAudio() {
  if (midiPlayer) return
  audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  soundfontPiano = await window.Soundfont.instrument(audioCtx, 'acoustic_grand_piano')
  
  midiPlayer = new window.MidiPlayer.Player((evt) => {
    if (evt.name === 'Note on' && evt.velocity > 0) {
      soundfontPiano.play(evt.noteName, audioCtx.currentTime, { gain: evt.velocity / 100 })
    }
  })
  
  midiPlayer.loadDataUri('data:audio/midi;base64,' + window.generatedMidi)
  midiPlayer.on('endOfFile', () => { isPlaying.value = false; midiPlayer.stop() })
}

async function togglePlay() {
  try {
    await initAudio()
    if (audioCtx.state === 'suspended') await audioCtx.resume()

    if (midiPlayer.isPlaying()) {
      midiPlayer.pause()
      isPlaying.value = false
    } else {
      midiPlayer.play()
      isPlaying.value = true
    }
  } catch (e) {
    alert("Error de reproducción: " + e.message)
  }
}

function stopPlay() {
  if (midiPlayer) {
    midiPlayer.stop()
    isPlaying.value = false
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const s = document.createElement('script')
    s.src = src; s.onload = resolve; s.onerror = reject
    document.head.appendChild(s)
    loadedScripts.push(s)
  })
}
</script>

<style scoped>
@media (max-width: 600px) {
  .viewer-controls {
    align-items: stretch !important;
    flex-direction: column;
    gap: 0.65rem !important;
  }
  .viewer-controls .btn {
    width: 100%;
    min-width: 0 !important;
  }
  .viewer-controls span { margin-left: 0 !important; }
}
</style>
