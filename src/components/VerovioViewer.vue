<template>
  <!-- Verovio viewer -->
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
      <div class="modal-body">
        <!-- cargando -->
        <div v-if="loading" style="display:flex;flex-direction:column;align-items:center;gap:1rem;padding:2rem">
          <div class="spinner"/>
          <p style="color:var(--color-text-secondary)">Renderizando partitura...</p>
        </div>
        <!-- SVG -->
        <div v-else-if="svgContent" v-html="svgContent" style="width:100%;overflow-x:auto"/>
        <!-- Error -->
        <div v-else-if="error" class="alert alert-error">{{ error }}</div>
        <!--Sin contenido -->
        <div v-else class="alert alert-info">No hay contenido MusicXML para mostrar.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  musicxml: { type: String, required: true },
})
defineEmits(['close'])

const loading = ref(true)
const svgContent = ref('')
const error = ref('')

onMounted(async () => {
  try {
    //Carga Verovio de CDN WASM
    if (!window.verovio) {
      await loadScript('https://www.verovio.org/javascript/latest/verovio-toolkit-wasm.js')
      await new Promise(r => setTimeout(r, 1000)) // esperar a que cargue WASM
    }
    const tk = new window.verovio.toolkit()
    tk.setOptions({ scale: 40, pageWidth: 2000, adjustPageHeight: true, breaks: 'auto' })
    tk.loadData(props.musicxml)
    const svg = tk.renderToSVG(1)
    svgContent.value = svg
  } catch (e) {
    error.value = 'Error al renderizar la partitura: ' + e.message
  } finally {
    loading.value = false
  }
})

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}
</script>
