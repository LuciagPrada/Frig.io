<template>
  <div>
    <AppHeader @open-auth="showAuth = true"/>

    <div v-if="loading" style="display:flex;justify-content:center;padding:5rem">
      <div class="spinner"/>
    </div>

    <div v-else-if="!partitura" class="page-container" style="text-align:center;padding-top:4rem">
      <h2 style="font-weight:700;margin:0 0 0.5rem">No se ha podido cargar la partitura</h2>
      <p style="color:var(--color-text-secondary);margin:0 0 1.5rem">
        Puede que no exista o que no tengas permiso para verla.
      </p>
      <button class="btn btn-primary" @click="volver">Volver</button>
    </div>

    <template v-else>
      <div class="detail-bar">
        <button class="btn btn-secondary" style="flex-shrink:0" @click="volver">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Volver
        </button>

        <div class="detail-bar-actions">
          <template v-if="!isEditing">
            <button class="btn btn-primary" @click="handleReproducir">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Reproducir
            </button>
            <button class="btn btn-ghost" @click="handleDescargarPDF">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              PDF
            </button>
            <button v-if="esPropio" class="btn btn-ghost" @click="handleDescargarXML">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              XML
            </button>
            <button v-if="esPropio" class="btn btn-ghost" @click="isShareMode = !isShareMode">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Visibilidad
            </button>
            <button v-if="esPropio" class="btn btn-ghost" @click="startEdit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Editar
            </button>

            <div style="position:relative">
              <button class="btn btn-ghost" @click="abrirEtiquetar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                Etiquetar
              </button>

              <div v-if="etiquetandoActivo" class="dropdown etiquetar-panel">
                <div class="etiquetar-head">Mis etiquetas</div>
                <button
                  v-for="tag in todasMisEtiquetas"
                  :key="tag"
                  type="button"
                  class="etiquetar-opcion"
                  :class="{ 'etiquetar-opcion-marcada': misEtiquetas.includes(tag) }"
                  @click="toggleEtiquetaExistente(tag)"
                >
                  <span class="etiquetar-check">
                    <svg v-if="misEtiquetas.includes(tag)" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                  {{ tag }}
                </button>
                <p v-if="!todasMisEtiquetas.length && !mostrandoNuevaEtiqueta" class="etiquetar-vacio">
                  Todavía no tienes etiquetas creadas.
                </p>

                <form v-if="mostrandoNuevaEtiqueta" style="display:flex;gap:0.4rem;padding:0.6rem 1rem" @submit.prevent="añadirEtiqueta">
                  <input
                    ref="etiquetaInputRef"
                    v-model="nuevaEtiqueta"
                    class="form-input"
                    style="padding:4px 8px;height:auto;flex:1"
                    maxlength="40"
                    placeholder="Nombre de la etiqueta"
                    @keydown.esc="mostrandoNuevaEtiqueta = false"
                  />
                  <button type="submit" class="btn btn-primary" style="font-size:0.78rem;padding:0.3rem 0.6rem">Añadir</button>
                </form>
                <button v-else type="button" class="etiquetar-opcion etiquetar-nueva" @click="abrirNuevaEtiqueta">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                  Añadir etiqueta
                </button>

                <p v-if="etiquetaError" class="etiquetar-error">{{ etiquetaError }}</p>
              </div>
              <div v-if="etiquetandoActivo" style="position:fixed;inset:0;z-index:98" @click="cerrarEtiquetar"/>
            </div>

            <button v-if="!esPropio" class="btn btn-ghost" @click="abrirReporte">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
              Reportar
            </button>
            <button v-if="esPropio" class="btn btn-danger" @click="handleEliminar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              Eliminar
            </button>
          </template>
          <template v-else>
            <button class="btn btn-primary" @click="handleSaveEdit">Guardar cambios</button>
            <button class="btn btn-secondary" @click="isEditing = false">Cancelar</button>
          </template>
        </div>
      </div>

      <div class="page-container" style="max-width:960px">
        <div v-if="isShareMode" class="card" style="padding:1rem;margin-bottom:1.5rem">
          <p style="font-size:0.85rem;font-weight:600;margin:0 0 0.75rem">Mover partitura a:</p>
          <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
            <button class="btn" :class="partitura.es_publica ? 'btn-primary' : 'btn-secondary'" style="font-size:0.85rem" @click="handleCompartir('comunidad')">
              Pública (Comunidad)
            </button>
            <button class="btn" :class="partitura.es_institucional ? 'btn-primary' : 'btn-secondary'" style="font-size:0.85rem" @click="handleCompartir('institucion')">
              Institucional
            </button>
            <button class="btn" :class="partitura.es_privada ? 'btn-primary' : 'btn-secondary'" style="font-size:0.85rem" @click="handleCompartir('privada')">
              Privada
            </button>
          </div>
        </div>

        <div v-if="mensajeOk" class="alert alert-success" style="margin-bottom:1.5rem">{{ mensajeOk }}</div>

        <div style="margin-bottom:1.5rem">
          <template v-if="!isEditing">
            <h1 class="page-title" style="margin:0 0 0.25rem">{{ partitura.titulo }}</h1>
            <p style="margin:0;color:var(--color-text-secondary)">Compuesto por {{ partitura.autor }}</p>
            <div style="display:flex;gap:1rem;align-items:center;margin-top:0.75rem">
              <span style="font-size:0.875rem;color:var(--color-text-secondary);display:flex;align-items:center;gap:0.3rem">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                {{ likesCount }}
              </span>
              <span style="font-size:0.875rem;color:var(--color-text-secondary);display:flex;align-items:center;gap:0.3rem">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {{ comentariosCount }}
              </span>
              <button
                v-if="!esPropio"
                class="like-btn"
                :title="isLiked ? 'Quitar Me gusta' : 'Dar Me gusta'"
                @click="toggleLikeButton"
              >
                <svg v-if="isLiked" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#ef4444"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-text-secondary)"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
            </div>
          </template>
          <template v-else>
            <input v-model="editForm.titulo" class="form-input" style="font-size:1.4rem;font-weight:700;margin-bottom:0.5rem" placeholder="Título"/>
            <input v-model="editForm.autor" class="form-input" placeholder="Autor"/>
          </template>
        </div>

        <div class="card" style="padding:0;overflow:hidden;margin-bottom:1.5rem">
          <div v-if="renderLoading" style="display:flex;flex-direction:column;align-items:center;gap:1rem;padding:3rem">
            <div class="spinner"/>
            <p style="color:var(--color-text-secondary);margin:0">Renderizando transcripción...</p>
          </div>
          <div
            v-else-if="svgContent"
            class="transcripcion-svg"
            v-html="svgContent"
          />
          <div v-else style="height:300px;background:linear-gradient(135deg,#1a2a3a,#2d4a3e);display:flex;flex-direction:column;gap:0.75rem;align-items:center;justify-content:center">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
            <p v-if="renderError" style="color:rgba(255,255,255,0.6);font-size:0.85rem;margin:0">{{ renderError }}</p>
          </div>
        </div>

        <div class="card" style="padding:1.5rem;margin-bottom:1.5rem">
          <h3 style="margin:0 0 1rem;font-size:1rem;font-weight:700;color:var(--color-navy)">
            Información de la partitura
          </h3>
          <table style="width:100%;border-collapse:collapse">
            <tbody>
              <tr v-for="row in infoRows" :key="row.label">
                <td style="padding:0.4rem 0;color:var(--color-text-secondary);font-size:0.875rem;width:32%">{{ row.label }}</td>
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

          <div v-if="fiabilidad != null" style="margin-top:1.25rem;max-width:320px">
            <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:0.35rem">
              <span style="color:var(--color-text-secondary)">Fiabilidad OMR</span>
              <span :style="{ color: fiabilidad >= 0.85 ? '#065f46' : '#92400e', fontWeight:600 }">
                {{ Math.round(fiabilidad * 100) }}%
              </span>
            </div>
            <div style="background:var(--color-border);border-radius:9999px;height:6px;overflow:hidden">
              <div :style="{
                width: Math.round(fiabilidad * 100) + '%',
                height:'100%',
                background: fiabilidad >= 0.85 ? '#10b981' : '#f59e0b',
                borderRadius:'9999px'
              }"/>
            </div>
          </div>
        </div>

        <div class="card" style="padding:1.5rem;margin-bottom:1.5rem">
          <h3 style="margin:0 0 0.35rem;font-size:1rem;font-weight:700;color:var(--color-navy)">
            Mis etiquetas
          </h3>
          <p style="margin:0 0 1rem;font-size:0.82rem;color:var(--color-text-secondary)">
            Organiza esta partitura con tus propias etiquetas. Solo tú las ves y puedes
            usarlas para filtrar en tu biblioteca y en la comunidad.
          </p>

          <div v-if="misEtiquetas.length" style="display:flex;flex-wrap:wrap;align-items:center;gap:0.5rem">
            <span v-for="tag in misEtiquetas" :key="tag" class="tag-chip">{{ tag }}</span>
          </div>
          <p v-else style="margin:0;font-size:0.82rem;color:var(--color-text-secondary)">
            Todavía no has puesto ninguna etiqueta a esta partitura. Usa el botón "Etiquetar"
            de arriba para añadir una.
          </p>
        </div>

        <div class="card" style="padding:1.5rem">
          <ComentariosSection
            :partitura-id="partitura.id_partitura"
            :user-id="authStore.user?.id || null"
          >
            <template #login-hint>
              <span>
                <a href="#" style="color:var(--color-primary);font-weight:600" @click.prevent="showAuth = true">Inicia sesión</a>
                para dejar un comentario
              </span>
            </template>
          </ComentariosSection>
        </div>
      </div>
    </template>

    <VerovioViewer
      v-if="showVerovio && verovioXml"
      :musicxml="verovioXml"
      @close="showVerovio = false"
    />

    <div v-if="showReporte" class="modal-overlay" @click.self="showReporte = false">
      <div class="modal-box card" style="max-width:460px;width:90%;padding:2rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem">
          <h2 style="margin:0;font-size:1.1rem;font-weight:700">Reportar partitura</h2>
          <button class="btn-icon" @click="showReporte = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <form @submit.prevent="handleEnviarReporte">
          <div class="form-group">
            <label class="form-label">Motivo del reporte *</label>
            <div style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.35rem">
              <label v-for="m in motivosReporte" :key="m.valor" style="display:flex;align-items:center;gap:0.5rem;font-size:0.9rem;cursor:pointer">
                <input v-model="reporteMotivo" type="radio" :value="m.valor"/>
                {{ m.etiqueta }}
              </label>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">
              Comentario {{ reporteMotivo === 'otro' ? '*' : '(opcional)' }}
            </label>
            <textarea
              v-model="reporteComentario"
              class="form-input"
              rows="3"
              style="resize:vertical"
              :required="reporteMotivo === 'otro'"
              placeholder="Explica brevemente el problema"
            />
          </div>
          <div v-if="reporteError" class="alert alert-error" style="margin-bottom:1rem">{{ reporteError }}</div>
          <div style="display:flex;gap:0.75rem;justify-content:flex-end">
            <button type="button" class="btn btn-secondary" @click="showReporte = false">Cancelar</button>
            <button type="submit" class="btn btn-danger" :disabled="reporteCtrl.loading.value">
              <span v-if="reporteCtrl.loading.value" class="spinner spinner-sm"/>
              Enviar reporte
            </button>
          </div>
        </form>
      </div>
    </div>

    <AuthModal v-if="showAuth" initial-tab="login" @close="showAuth = false"/>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DOMPurify from 'dompurify'
import AppHeader from '../components/AppHeader.vue'
import AuthModal from '../components/AuthModal.vue'
import ComentariosSection from '../components/ComentariosSection.vue'
import VerovioViewer from '../components/VerovioViewer.vue'
import { useAuthStore } from '../stores/authStore.js'
import { usePartituraController } from '../controllers/PartituraController.js'
import { useInstitucionController } from '../controllers/InstitucionController.js'
import { useReporteController } from '../controllers/ReporteController.js'
import { useEtiquetaController } from '../controllers/EtiquetaController.js'
import PartituraRepository from '../repositories/PartituraRepository.js'
import { formatDate } from '../utils/validators.js'
import { getVerovioToolkit } from '../utils/verovioLoader.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const ctrl = usePartituraController()
const instCtrl = useInstitucionController()
const reporteCtrl = useReporteController()
const etiquetaCtrl = useEtiquetaController()
const partitura = ref(null)
const loading = ref(true)
const showAuth = ref(false)
const isEditing = ref(false)
const isShareMode = ref(false)
const isLiked = ref(false)
const mensajeOk = ref('')
const svgContent = ref('')
const renderLoading = ref(false)
const renderError = ref('')
const showVerovio = ref(false)
const verovioXml = ref('')
const showReporte = ref(false)
const reporteMotivo = ref('copyright')
const reporteComentario = ref('')
const reporteError = ref('')
const motivosReporte = [
  { valor: 'copyright',    etiqueta: 'Copyright' },
  { valor: 'robo',         etiqueta: 'Robo de partitura' },
  { valor: 'mala_calidad', etiqueta: 'Mala calidad' },
  { valor: 'otro',         etiqueta: 'Otro' },
]
const esPropio    = computed(() => !!partitura.value && authStore.user?.id === partitura.value.id_propietario)
const fiabilidad  = computed(() => partitura.value?.transcripciones?.[0]?.porcentaje_fiabilidad ?? null)
const musicxml    = computed(() => partitura.value?.transcripciones?.[0]?.contenido_resultado || partitura.value?.transcripciones?.[0]?.musicxml_content || '')
const likesCount = computed(() => partitura.value?.likes?.[0]?.count ?? 0)
const comentariosCount = computed(() => partitura.value?.total_comentarios ?? 0)
const editForm = reactive({
  titulo: '', autor: '', instrumento: '', ano_original: null, genero: '',
})
const misEtiquetas = ref([])
const todasMisEtiquetas = ref([])
const nuevaEtiqueta = ref('')
const etiquetandoActivo = ref(false)
const mostrandoNuevaEtiqueta = ref(false)
const etiquetaError = ref('')
const etiquetaInputRef = ref(null)


const infoRows = computed(() => [
  { label: 'Autor',              value: partitura.value?.autor,        key: 'autor' },
  { label: 'Título',             value: partitura.value?.titulo,       key: 'titulo' },
  { label: 'Año de composición', value: partitura.value?.ano_original, key: 'ano_original' },
  { label: 'Instrumento',        value: partitura.value?.instrumento,  key: 'instrumento' },
  { label: 'Género',             value: partitura.value?.genero,       key: 'genero' },
  { label: 'Fecha de subida',    value: formatDate(partitura.value?.fecha_subida), key: 'fecha_subida' },
])

onMounted(async () => {
  await cargar()
  if (authStore.user && partitura.value && !esPropio.value) {
    try {
      const likes = await PartituraRepository.getLikesByUser(authStore.user.id)
      isLiked.value = likes.includes(partitura.value.id_partitura)
    } catch { /* el like es secundario, no bloquea la vista */ }
  }
  await cargarMisEtiquetas()
  await renderTranscripcion()
})

async function cargarMisEtiquetas() {
  if (!authStore.user?.id || !partitura.value) { misEtiquetas.value = []; todasMisEtiquetas.value = []; return }
  const [propias, todas] = await Promise.all([
    etiquetaCtrl.getMisEtiquetasDePartitura(partitura.value.id_partitura, authStore.user.id),
    etiquetaCtrl.getMisEtiquetas(authStore.user.id),
  ])
  misEtiquetas.value = propias
  todasMisEtiquetas.value = [...new Set(todas.map(t => t.etiqueta))].sort((a, b) => a.localeCompare(b, 'es'))
}

async function cargar() {
  loading.value = true
  try {
    partitura.value = await PartituraRepository.getPartituraById(route.params.id)
  } catch {
    partitura.value = null
  } finally {
    loading.value = false
  }
}
async function renderTranscripcion() {
  if (!musicxml.value) { svgContent.value = ''; return }
  renderLoading.value = true
  renderError.value = ''
  try {
    const tk = await getVerovioToolkit()
    tk.setOptions({ scale: 40, pageWidth: 2000, adjustPageHeight: true, breaks: 'auto' })
    tk.loadData(musicxml.value)
    svgContent.value = DOMPurify.sanitize(tk.renderToSVG(1), {
      USE_PROFILES: { svg: true, svgFilters: true },
      ADD_TAGS: ['use'],
      ADD_ATTR: ['xlink:href', 'href'],
    })
  } catch (e) {
    renderError.value = 'No se pudo renderizar la transcripción: ' + e.message
    svgContent.value = ''
  } finally {
    renderLoading.value = false
  }
}

function volver() {
  if (window.history.length > 1) router.back()
  else router.push('/biblioteca')
}

async function toggleLikeButton() {
  if (!authStore.user) { showAuth.value = true; return }
  isLiked.value = await PartituraRepository.toggleLike(partitura.value.id_partitura, authStore.user.id)
  await cargar()
}

function startEdit() {
  editForm.titulo = partitura.value.titulo
  editForm.autor = partitura.value.autor
  editForm.instrumento = partitura.value.instrumento
  editForm.ano_original = partitura.value.ano_original
  editForm.genero = partitura.value.genero
  isEditing.value = true
}

function abrirEtiquetar() {
  if (!authStore.isAuthenticated) { showAuth.value = true; return }
  etiquetaError.value = ''
  mostrandoNuevaEtiqueta.value = false
  nuevaEtiqueta.value = ''
  etiquetandoActivo.value = !etiquetandoActivo.value
}

function cerrarEtiquetar() {
  etiquetandoActivo.value = false
  mostrandoNuevaEtiqueta.value = false
  nuevaEtiqueta.value = ''
  etiquetaError.value = ''
}

function abrirNuevaEtiqueta() {
  etiquetaError.value = ''
  nuevaEtiqueta.value = ''
  mostrandoNuevaEtiqueta.value = true
  nextTick(() => etiquetaInputRef.value?.focus())
}

async function toggleEtiquetaExistente(tag) {
  etiquetaError.value = ''
  const yaMarcada = misEtiquetas.value.includes(tag)
  try {
    if (yaMarcada) {
      await etiquetaCtrl.quitar(partitura.value.id_partitura, tag, authStore.user.id)
      misEtiquetas.value = misEtiquetas.value.filter(t => t !== tag)
    } else {
      await etiquetaCtrl.añadir(partitura.value.id_partitura, tag, authStore.user.id)
      misEtiquetas.value = [...misEtiquetas.value, tag]
    }
  } catch (e) {
    etiquetaError.value = e.message || (yaMarcada ? 'No se pudo quitar la etiqueta.' : 'No se pudo añadir la etiqueta.')
  }
}

async function añadirEtiqueta() {
  etiquetaError.value = ''
  const valor = nuevaEtiqueta.value.trim()
  if (!valor) return
  if (valor.length > 40) { etiquetaError.value = 'La etiqueta no puede superar los 40 caracteres.'; return }
  if (misEtiquetas.value.includes(valor)) { etiquetaError.value = 'Ya has puesto esa etiqueta a esta partitura.'; return }
  try {
    await etiquetaCtrl.añadir(partitura.value.id_partitura, valor, authStore.user.id)
    misEtiquetas.value = [...misEtiquetas.value, valor]
    if (!todasMisEtiquetas.value.includes(valor)) {
      todasMisEtiquetas.value = [...todasMisEtiquetas.value, valor].sort((a, b) => a.localeCompare(b, 'es'))
    }
    nuevaEtiqueta.value = ''
    mostrandoNuevaEtiqueta.value = false
  } catch (e) {
    etiquetaError.value = e.message || 'No se pudo añadir la etiqueta.'
  }
}


async function handleSaveEdit() {
  await ctrl.actualizarMetadatos(partitura.value.id_partitura, {
    titulo: editForm.titulo,
    autor: editForm.autor,
    instrumento: editForm.instrumento,
    ano_original: editForm.ano_original || null,
    genero: editForm.genero,
  })
  isEditing.value = false
  await cargar()
}

async function handleEliminar() {
  if (!confirm(`¿Eliminar "${partitura.value.titulo}" de tu biblioteca?`)) return
  await ctrl.eliminar(partitura.value.id_partitura)
  router.push('/biblioteca')
}

function handleReproducir() {
  if (!musicxml.value) return alert('No se encontró el contenido MusicXML para esta partitura.')
  verovioXml.value = musicxml.value
  showVerovio.value = true
}

function handleDescargarXML() {
  const blob = new Blob([musicxml.value || ''], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${partitura.value.titulo || 'partitura'}.xml`
  a.click()
  URL.revokeObjectURL(url)
}

async function handleDescargarPDF() {
  try {
    if (!musicxml.value) return alert('No hay transcripción disponible para generar el PDF.')
    if (!window.html2pdf) {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
      document.head.appendChild(s)
      await new Promise(r => { s.onload = r })
    }

    let svg = svgContent.value
    if (!svg) {
      const tk = await getVerovioToolkit()
      tk.setOptions({ scale: 40, pageWidth: 2000, adjustPageHeight: true, breaks: 'auto' })
      tk.loadData(musicxml.value)
      svg = DOMPurify.sanitize(tk.renderToSVG(1), {
        USE_PROFILES: { svg: true, svgFilters: true },
        ADD_TAGS: ['use'],
        ADD_ATTR: ['xlink:href', 'href'],
      })
    }

    const hiddenDiv = document.createElement('div')
    hiddenDiv.innerHTML = svg
    document.body.appendChild(hiddenDiv)
    await window.html2pdf().from(hiddenDiv).save(`${partitura.value.titulo || 'Partitura'}.pdf`)
    document.body.removeChild(hiddenDiv)
  } catch (e) {
    alert('Error al generar el PDF: ' + e.message)
  }
}

async function handleCompartir(tipo) {
  isShareMode.value = false
  const id = partitura.value.id_partitura
  if (tipo === 'institucion') {
    await instCtrl.cargar()
    if (!instCtrl.instituciones.value.length) {
      alert('Debes unirte o crear una institución primero para poder compartir partituras con ella.')
      return
    }
    const instId = partitura.value.id_institucion || instCtrl.instituciones.value[0].id_institucion
    await ctrl.actualizarMetadatos(id, { es_publica: false, es_privada: false, es_institucional: true, id_institucion: instId })
    mensajeOk.value = 'La partitura ha sido movida a tu institución.'
  } else if (tipo === 'comunidad') {
    await ctrl.actualizarMetadatos(id, { es_publica: true, es_privada: false, es_institucional: false })
    mensajeOk.value = 'La partitura se ha publicado en la comunidad.'
  } else {
    await ctrl.actualizarMetadatos(id, { es_publica: false, es_privada: true, es_institucional: false, id_institucion: null })
    mensajeOk.value = 'La partitura vuelve a ser totalmente privada.'
  }
  await cargar()
  setTimeout(() => { mensajeOk.value = '' }, 4000)
}

function abrirReporte() {
  if (!authStore.isAuthenticated) { showAuth.value = true; return }
  reporteMotivo.value = 'copyright'
  reporteComentario.value = ''
  reporteError.value = ''
  showReporte.value = true
}

async function handleEnviarReporte() {
  reporteError.value = ''
  if (reporteMotivo.value === 'otro' && !reporteComentario.value.trim()) {
    reporteError.value = 'Al elegir "Otro" debes explicar el motivo en el comentario.'
    return
  }
  try {
    await reporteCtrl.crear(partitura.value.id_partitura, reporteMotivo.value, reporteComentario.value.trim())
    showReporte.value = false
    mensajeOk.value = 'Gracias, hemos enviado tu reporte al propietario de la partitura.'
    setTimeout(() => { mensajeOk.value = '' }, 5000)
  } catch (e) {
    reporteError.value = e.message || 'No se ha podido enviar el reporte.'
  }
}
</script>

<style scoped>
.etiquetar-panel {
  position: absolute;
  left: 0;
  top: calc(100% + 8px);
  min-width: 220px;
  max-width: 280px;
  max-height: 320px;
  overflow-y: auto;
  z-index: 100;
  text-align: left;
}
.etiquetar-head {
  padding: 0.6rem 1rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
}
.etiquetar-opcion {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  text-align: left;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  font-size: 0.85rem;
  font-family: inherit;
  color: var(--color-text-primary);
  cursor: pointer;
}
.etiquetar-opcion:hover { background: var(--color-bg); }
.etiquetar-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--color-teal-dark);
}
.etiquetar-opcion-marcada {
  background: var(--color-teal-light);
  color: var(--color-navy);
  font-weight: 600;
}
.etiquetar-opcion-marcada:hover { background: var(--color-teal); }
.etiquetar-opcion-marcada .etiquetar-check { color: var(--color-navy); }
.etiquetar-nueva {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  color: var(--color-teal-dark);
  border-top: 1px solid var(--color-border);
}
.etiquetar-vacio {
  margin: 0;
  padding: 0.75rem 1rem;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}
.etiquetar-error {
  margin: 0;
  padding: 0.5rem 1rem;
  font-size: 0.78rem;
  color: #ef4444;
}

.detail-bar {
  position: sticky;
  top: 64px;
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0.75rem 2rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}
.detail-bar-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }

.transcripcion-svg {
  width: 100%;
  overflow-x: auto;
  padding: 1rem;
  background: #fff;
}
.transcripcion-svg :deep(svg) { max-width: 100%; height: auto; }

.like-btn {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--color-surface); border: 1px solid var(--color-border);
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: transform 0.15s;
}
.like-btn:hover { transform: scale(1.1); }

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px); display: flex; align-items: center;
  justify-content: center; z-index: 1000;
}
.modal-box { animation: fadeIn 0.2s ease; }
@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }

@media (max-width: 768px) {
  .detail-bar {
    position: static;
    align-items: stretch;
    padding: 0.75rem 0.875rem;
  }
  .detail-bar > .btn { width: 100%; }
  .detail-bar-actions {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .detail-bar-actions > .btn,
  .detail-bar-actions > div > .btn { width: 100%; }
  .etiquetar-panel {
    position: fixed;
    top: 76px;
    left: 0.75rem;
    right: 0.75rem;
    width: auto;
    min-width: 0;
    max-width: none;
    max-height: calc(100dvh - 92px);
  }
  .transcripcion-svg { padding: 0.5rem; }
  .modal-overlay { padding: 0.75rem; }
  .modal-overlay .modal-box {
    width: 100% !important;
    max-height: calc(100dvh - 1.5rem);
    overflow-y: auto;
    padding: 1.25rem !important;
  }
}

.btn-icon {
  width: 32px; height: 32px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  background: none; border: none; cursor: pointer;
  color: var(--color-text-secondary); transition: background 0.15s;
}
.btn-icon:hover { background: var(--color-bg); color: var(--color-text-primary); }
</style>
