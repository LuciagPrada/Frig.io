<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal" style="max-width:900px;max-height:90vh;overflow-y:auto">
      <!-- Encabezado -->
      <div class="modal-header">
        <div style="flex:1">
          <template v-if="!isEditing">
            <h2 style="margin:0;font-size:1.4rem;font-weight:700">{{ partitura.titulo }}</h2>
            <p style="margin:0.25rem 0 0;color:var(--color-text-secondary);font-size:0.9rem">
              Compuesto por {{ partitura.autor }}
            </p>
            <div style="display:flex; gap:0.75rem; margin-top:0.6rem; align-items:center">
              <span style="font-size:0.875rem;color:var(--color-text-secondary);display:flex;align-items:center;gap:0.3rem">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                {{ likesCount }}
              </span>
              <span style="font-size:0.875rem;color:var(--color-text-secondary);display:flex;align-items:center;gap:0.3rem">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {{ comentariosCount }}
              </span>
              <!-- Like Button in Modal -->
              <button
                v-if="!esPropio && (partitura.es_publica || partitura.es_institucional || true)"
                @click="toggleLikeButton"
                class="btn-icon"
                style="margin-left:auto; width:32px; height:32px; border-radius:50%; background:var(--color-surface); border:1px solid var(--color-border); transition:all 0.2s; display:flex; align-items:center; justify-content:center"
                :title="isLiked ? 'Quitar Me gusta' : 'Dar Me gusta'"
              >
                <svg v-if="isLiked" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#ef4444;transform:translateY(1px)"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-text-secondary);transform:translateY(1px)"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
            </div>
          </template>
          <template v-else>
            <input v-model="editForm.titulo" class="form-input" style="font-size:1.4rem;font-weight:700;margin-bottom:0.5rem" placeholder="Título"/>
            <input v-model="editForm.autor" class="form-input" placeholder="Autor"/>
          </template>
        </div>
        <div style="display:flex;gap:0.5rem;align-items:center">
          <button v-if="esPropio && !isEditing" class="btn-icon" @click="isEditing = true" title="Editar Metadatos">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="modal-close" @click="$emit('close')">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
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
                  <td style="padding:0.4rem 0;color:var(--color-text-secondary);font-size:0.875rem;width:40%">{{ row.label }}</td>
                  <td style="padding:0.4rem 0;font-weight:500;font-size:0.875rem">
                    <template v-if="!isEditing || row.key === 'fecha_subida'">
                      {{ row.value || '-' }}
                    </template>
                    <template v-else>
                      <input v-if="row.key === 'ano_original'" v-model="editForm[row.key]" type="number" class="form-input" style="padding:2px 8px;height:auto"/>
                      <input v-else v-model="editForm[row.key]" class="form-input" style="padding:2px 8px;height:auto"/>
                    </template>
                  </td>
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
            <template v-if="!isEditing">
              <button class="btn btn-primary btn-full" style="display:flex;align-items:center;justify-content:center;gap:0.5rem" @click="$emit('reproducir', partitura)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Reproducir Partitura
              </button>
              <div style="display:flex;flex-direction:column;gap:0.5rem">
                <div style="display:flex;gap:0.75rem">
                  <button class="btn btn-ghost" style="flex:1;display:flex;align-items:center;justify-content:center;gap:0.4rem" @click="handleDescargarPDF">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Descargar PDF
                  </button>
                  <button v-if="esPropio" class="btn btn-ghost" style="flex:1;display:flex;align-items:center;justify-content:center;gap:0.4rem" @click="$emit('descargar', partitura)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    XML
                  </button>
                  <button v-if="esPropio" class="btn btn-ghost" style="flex:1;display:flex;align-items:center;justify-content:center;gap:0.4rem" @click="isShareMode = !isShareMode">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    Visibilidad
                  </button>
                </div>
                <div v-if="isShareMode" class="card" style="padding:1rem; border:1px solid var(--color-border); background:var(--color-surface); margin-top:0.25rem">
                  <p style="font-size:0.85rem;font-weight:600;margin:0 0 0.75rem 0">Mover partitura a:</p>
                  <div style="display:flex; flex-direction:column; gap:0.5rem">
                    <button class="btn" :class="partitura.es_publica ? 'btn-primary' : 'btn-secondary'" style="font-size:0.85rem;padding:0.4rem" @click="$emit('compartir', partitura, 'comunidad'); isShareMode = false">
                      Pública (Comunidad)
                    </button>
                    <button class="btn" :class="partitura.es_institucional ? 'btn-primary' : 'btn-secondary'" style="font-size:0.85rem;padding:0.4rem" @click="$emit('compartir', partitura, 'institucion'); isShareMode = false">
                      Institucional
                    </button>
                    <button class="btn" :class="partitura.es_privada ? 'btn-primary' : 'btn-secondary'" style="font-size:0.85rem;padding:0.4rem" @click="$emit('compartir', partitura, 'privada'); isShareMode = false">
                      Privada
                    </button>
                  </div>
                </div>
              </div>
              <button v-if="esPropio" class="btn btn-danger btn-full" style="display:flex;align-items:center;justify-content:center;gap:0.5rem;margin-top:0.5rem" @click="handleEliminar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Eliminar partitura
              </button>
            </template>
            <template v-else>
              <button class="btn btn-primary btn-full" @click="handleSaveEdit">Guardar cambios</button>
              <button class="btn btn-secondary btn-full" @click="isEditing = false">Cancelar</button>
            </template>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore.js'
import PartituraRepository from '../repositories/PartituraRepository.js'
import { formatDate } from '../utils/validators.js'
import ComentariosSection from './ComentariosSection.vue'

  const props = defineProps({
    partitura: { type: Object, required: true },
  })
  const emit = defineEmits(['close', 'reproducir', 'descargar', 'compartir', 'eliminar', 'actualizar', 'request-login'])
  const authStore = useAuthStore()
  
  const esPropio    = computed(() => authStore.user?.id === props.partitura.id_propietario)
  const imagenUrl   = computed(() => props.partitura.transcripciones?.[0]?.ruta_imagen || null)
  const fiabilidad  = computed(() => props.partitura.transcripciones?.[0]?.porcentaje_fiabilidad ?? null)
  
  const isEditing = ref(false)
  const isShareMode = ref(false)
  const isLiked = ref(false)
  
  onMounted(async () => {
    if (authStore.user && !esPropio.value) {
      const likes = await PartituraRepository.getLikesByUser(authStore.user.id)
      isLiked.value = likes.includes(props.partitura.id_partitura)
    }
  })

  async function toggleLikeButton() {
    if (!authStore.user) return emit('request-login')
    isLiked.value = await PartituraRepository.toggleLike(props.partitura.id_partitura, authStore.user.id)
  }

  const editForm = reactive({
    titulo: props.partitura.titulo,
    autor: props.partitura.autor,
    instrumento: props.partitura.instrumento,
    ano_original: props.partitura.ano_original,
    genero: props.partitura.genero
  })
  
  const likesCount = computed(() => {
    let base = 0
    const l = props.partitura.likes
    if (l) {
      if (Array.isArray(l)) base = l[0]?.count ?? l.length
      else base = Number(l) || 0
    }
    // Visually bump logic: if the user likes the score here but the prop doesn't know yet
    return base
  })

  const comentariosCount = computed(() => {
    if (props.partitura.total_comentarios !== undefined) return props.partitura.total_comentarios
    const c = props.partitura.comentarios
    if (!c) return 0
    if (Array.isArray(c)) return c[0]?.count ?? c.length
    return Number(c) || 0
  })

  async function handleDescargarPDF() {
    try {
      if (!window.html2pdf) {
        const s = document.createElement('script')
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
        document.head.appendChild(s)
        await new Promise(r => s.onload = r)
      }
      if (!window.verovio) {
        const s2 = document.createElement('script')
        s2.src = 'https://www.verovio.org/javascript/latest/verovio-toolkit-wasm.js'
        document.head.appendChild(s2)
        await new Promise(r => s2.onload = r)
        await new Promise(r => setTimeout(r, 1000))
      }

      const tk = new window.verovio.toolkit()
      tk.setOptions({ scale: 40, pageWidth: 2000, adjustPageHeight: true, breaks: 'auto' })
      const musicxml = props.partitura.transcripciones?.[0]?.contenido_resultado
      if (!musicxml) return alert('No hay transcripción disponible para generar el PDF.')
      
      tk.loadData(musicxml)
      const svg = tk.renderToSVG(1)
      const hiddenDiv = document.createElement('div')
      hiddenDiv.innerHTML = svg
      document.body.appendChild(hiddenDiv)

      await window.html2pdf().from(hiddenDiv).save(`${props.partitura.titulo || 'Partitura'}.pdf`)
      document.body.removeChild(hiddenDiv)
    } catch (e) {
      alert('Error al generar el PDF: ' + e.message)
    }
  }

  const infoRows = computed(() => [
    { label: 'Autor',              value: props.partitura.autor,      key: 'autor' },
    { label: 'Título',             value: props.partitura.titulo,     key: 'titulo' },
    { label: 'Año de composición', value: props.partitura.ano_original, key: 'ano_original' },
    { label: 'Instrumento',        value: props.partitura.instrumento, key: 'instrumento' },
    { label: 'Género',             value: props.partitura.genero,      key: 'genero' },
  ])
  
  async function handleSaveEdit() {
    emit('actualizar', props.partitura.id_partitura, { ...editForm })
    isEditing.value = false
  }
  
  function handleEliminar() {
    if (confirm(`¿Eliminar "${props.partitura.titulo}" de tu biblioteca?`)) {
      emit('eliminar', props.partitura.id_partitura)
      emit('close')
    }
  }
</script>
