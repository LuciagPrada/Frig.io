<template>
  <div>
    <AppHeader @open-auth="showAuth = true"/>

    <div class="page-container">
      <!-- cabecera con tabs y botón -->
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:1.5rem">
        <div>
          <!-- tabs principales -->
          <div class="tabs" style="max-width:480px;margin-bottom:1.5rem">
            <button class="tab-btn" :class="{ active: activeTab === 'personal' }" @click="switchTab('personal')">
              Tu biblioteca
            </button>
            <button class="tab-btn" :class="{ active: activeTab === 'institucion' }" @click="switchTab('institucion')">
              Biblioteca institucional
            </button>
          </div>

          <!-- subtabs de instituciones cuando hay varias -->
          <div v-if="activeTab === 'institucion' && instituciones.length > 1"
               style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.25rem">
            <button
              v-for="inst in instituciones"
              :key="inst.id_institucion"
              class="chip"
              :class="{ 'chip-active': instFiltro === inst.id_institucion }"
              @click="setInstFiltro(inst.id_institucion)"
            >
              {{ inst.nombre }}
              <span class="badge" style="font-size:0.65rem;padding:0.1rem 0.4rem;margin-left:0.25rem;background:rgba(255,255,255,0.12)">
                {{ inst.rolUsuario === 'ADMINISTRADOR' ? 'Admin' : 'Miembro' }}
              </span>
            </button>
          </div>

          <h1 class="page-title" style="display:flex;align-items:center;gap:0.75rem;margin:0 0 0.5rem">
            <svg v-if="activeTab === 'personal'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/></svg>
            {{ activeTab === 'personal' ? 'Tu biblioteca' : tituloInstitucion }}
          </h1>
          <p class="page-subtitle" style="margin-bottom:0">
            {{ activeTab === 'personal'
              ? 'Aquí se guardan las partituras que hayas escaneado para que puedas revisarlas cuando quieras'
              : 'Partituras compartidas con tu institución' }}
          </p>
        </div>
        <router-link to="/dashboard" class="btn btn-primary" style="margin-bottom:0.25rem;display:flex;align-items:center;gap:0.5rem;flex-shrink:0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          Añadir partitura
        </router-link>
      </div>

      <!-- loading -->
      <div v-if="loading" style="display:flex;justify-content:center;padding:3rem;margin-top:2rem">
        <div class="spinner"/>
      </div>

      <!-- sin instituciones -->
      <div v-else-if="activeTab === 'institucion' && !instituciones.length"
           style="text-align:center;padding:5rem 2rem;margin-top:1rem">
        <div style="margin:0 auto 1.5rem;width:72px;height:72px;border-radius:50%;background:var(--color-surface);display:flex;align-items:center;justify-content:center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" stroke-width="1.5">
            <rect x="4" y="10" width="4" height="10"/><rect x="10" y="10" width="4" height="10"/>
            <rect x="16" y="10" width="4" height="10"/><path d="M2 22h20"/><path d="M12 2L2 8h20L12 2z"/>
          </svg>
        </div>
        <h3 style="font-weight:700;margin:0 0 0.5rem">Aún no estás en ninguna institución</h3>
        <p style="color:var(--color-text-secondary);margin:0 0 2rem">
          Crea una nueva o únete a una institución existente para ver su biblioteca
        </p>
        <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" @click="showCrearModal = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Crear institución
          </button>
          <button class="btn btn-secondary" @click="showUnirseModal = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
            Unirme a institución
          </button>
        </div>
      </div>

      <!-- grid de partituras -->
      <div v-else-if="partituras.length" class="score-grid" style="margin-top:1rem">
        <ScoreCard
          v-for="p in partituras"
          :key="p.id_partitura"
          :partitura="p"
          @click="openDetail(p)"
        />
      </div>

      <!-- hay institución pero no hay partituras -->
      <div v-else style="text-align:center;padding:4rem 2rem;margin-top:2rem">
        <div style="font-size:3rem;margin-bottom:1rem;color:var(--color-text-secondary)">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </div>
        <h3 style="font-weight:700;margin:0 0 0.5rem">No hay partituras aquí todavía</h3>
        <p style="color:var(--color-text-secondary);margin:0 0 1.5rem">
          {{ activeTab === 'personal'
            ? 'Transcribe tu primera partitura para empezar'
            : 'Tu institución no tiene partituras compartidas aún' }}
        </p>
        <router-link to="/dashboard" class="btn btn-primary">Transcribir partitura</router-link>
      </div>
    </div>

    <!-- detalle de partitura -->
    <ScoreDetailModal
      v-if="selectedPartitura"
      :partitura="selectedPartitura"
      @close="selectedPartitura = null"
      @reproducir="handleReproducir"
      @descargar="handleDescargar"
      @compartir="handleCompartir"
      @eliminar="handleEliminar"
      @actualizar="handleActualizar"
    />

    <!-- verovio viewer -->
    <VerovioViewer
      v-if="showVerovio && verovioXml"
      :musicxml="verovioXml"
      @close="showVerovio = false"
    />

    <AuthModal v-if="showAuth" initial-tab="login" @close="showAuth = false"/>

    <!-- crear institución -->
    <div v-if="showCrearModal" class="modal-overlay" @click.self="showCrearModal = false">
      <div class="modal-box card" style="max-width:460px;width:90%;padding:2rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem">
          <h2 style="margin:0;font-size:1.1rem;font-weight:700">Crear institución</h2>
          <button class="btn-icon" @click="showCrearModal = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <form @submit.prevent="handleCrear">
          <div class="form-group">
            <label class="form-label">Nombre de la institución *</label>
            <input v-model="nombreNueva" type="text" class="form-input" placeholder="Ej: Conservatorio Nacional" required/>
          </div>
          <div v-if="crearError" class="alert alert-error" style="margin-bottom:1rem">{{ crearError }}</div>
          <div style="display:flex;gap:0.75rem;justify-content:flex-end">
            <button type="button" class="btn btn-secondary" @click="showCrearModal = false">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="instCtrl.loading.value">
              <span v-if="instCtrl.loading.value" class="spinner spinner-sm"/>
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- unirse a institución -->
    <div v-if="showUnirseModal" class="modal-overlay" @click.self="showUnirseModal = false">
      <div class="modal-box card" style="max-width:460px;width:90%;padding:2rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem">
          <h2 style="margin:0;font-size:1.1rem;font-weight:700">Unirme a institución</h2>
          <button class="btn-icon" @click="showUnirseModal = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <p style="color:var(--color-text-secondary);font-size:0.9rem;margin:0 0 1.5rem">
          Introduce el ID de la institución que te ha proporcionado el administrador.
        </p>
        <form @submit.prevent="handleUnirse">
          <div class="form-group">
            <label class="form-label">ID de la institución *</label>
            <input v-model="instIdUnirse" type="text" class="form-input" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required/>
          </div>
          <div v-if="unirseError" class="alert alert-error" style="margin-bottom:1rem">{{ unirseError }}</div>
          <div style="display:flex;gap:0.75rem;justify-content:flex-end">
            <button type="button" class="btn btn-secondary" @click="showUnirseModal = false">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="instCtrl.loading.value">
              <span v-if="instCtrl.loading.value" class="spinner spinner-sm"/>
              Unirme
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import ScoreCard from '../components/ScoreCard.vue'
import ScoreDetailModal from '../components/ScoreDetailModal.vue'
import VerovioViewer from '../components/VerovioViewer.vue'
import AuthModal from '../components/AuthModal.vue'
import { useAuthStore } from '../stores/authStore.js'
import { usePartituraController } from '../controllers/PartituraController.js'
import { useInstitucionController } from '../controllers/InstitucionController.js'

const authStore = useAuthStore()
const activeTab = ref('personal')
const partituras = ref([])
const loading = ref(false)
const selectedPartitura = ref(null)
const showVerovio = ref(false)
const verovioXml = ref('')
const showAuth = ref(false)

//institución
const showCrearModal = ref(false)
const showUnirseModal = ref(false)
const nombreNueva = ref('')
const crearError = ref('')
const instIdUnirse = ref('')
const unirseError = ref('')

const instFiltro = ref(null) //Filtro de subtab de institución activa

const ctrl = usePartituraController(authStore.user?.id)
const instCtrl = useInstitucionController()
const { instituciones } = instCtrl

//Título dinámico según institución seleccionada
const tituloInstitucion = computed(() => {
  if (!instituciones.value.length) return 'Biblioteca institucional'
  if (instituciones.value.length === 1) return instituciones.value[0].nombre
  const activa = instituciones.value.find(i => i.id_institucion === instFiltro.value)
  return activa ? activa.nombre : 'Biblioteca institucional'
})

onMounted(async () => {
  await instCtrl.cargar()
  //Seleccionar la primera institución por defecto si existe
  if (instituciones.value.length) instFiltro.value = instituciones.value[0].id_institucion
  await loadPartituras()
})

async function loadPartituras() {
  loading.value = true
  try {
    if (activeTab.value === 'personal') {
      partituras.value = await ctrl.obtenerBiblioteca()
    } else if (instFiltro.value) {
      partituras.value = await instCtrl.getBibliotecaInstitucion(instFiltro.value)
    } else {
      partituras.value = []
    }
  } finally {
    loading.value = false
  }
}

async function switchTab(tab) {
  activeTab.value = tab
  await loadPartituras()
}

async function setInstFiltro(instId) {
  instFiltro.value = instId
  await loadPartituras()
}

function openDetail(p) { selectedPartitura.value = p }

async function handleEliminar(id) {
  await ctrl.eliminar(id)
  await loadPartituras()
}

async function handleActualizar(id, datos) {
  await ctrl.actualizarMetadatos(id, datos)
  await loadPartituras()
}

function handleReproducir(p) {
  const xml = p.transcripciones?.[0]?.contenido_resultado || p.transcripciones?.[0]?.musicxml_content
  if (xml) { verovioXml.value = xml; showVerovio.value = true }
  else alert('No se encontró el contenido MusicXML para esta partitura.')
}

function handleDescargar(p) {
  const xml = p.transcripciones?.[0]?.contenido_resultado || p.transcripciones?.[0]?.musicxml_content || ''
  const blob = new Blob([xml], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${p.titulo || 'partitura'}.xml`
  a.click()
  URL.revokeObjectURL(url)
}

async function handleCompartir(p) {
  await import('../repositories/PartituraRepository.js').then(m =>
    m.default.updateMetadatos(p.id_partitura, { es_publica: true, es_privada: false, es_institucional: false })
  )
  alert('La partitura ha sido compartida en la comunidad.')
}

async function handleCrear() {
  crearError.value = ''
  try {
    await instCtrl.crear(nombreNueva.value)
    showCrearModal.value = false
    nombreNueva.value = ''
    //Seleccionar la nueva institución
    if (instituciones.value.length) instFiltro.value = instituciones.value[instituciones.value.length - 1].id_institucion
    await loadPartituras()
  } catch (e) {
    crearError.value = e.message || 'Error al crear la institución'
  }
}

async function handleUnirse() {
  unirseError.value = ''
  try {
    await instCtrl.unirse(instIdUnirse.value.trim())
    showUnirseModal.value = false
    instIdUnirse.value = ''
    if (instituciones.value.length) instFiltro.value = instituciones.value[instituciones.value.length - 1].id_institucion
    await loadPartituras()
  } catch (e) {
    unirseError.value = e.message || 'No se pudo unir. Verifica el ID.'
  }
}
</script>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s;
}
.chip:hover { border-color: var(--color-teal); color: var(--color-teal); }
.chip-active {
  background: var(--color-teal, #14b8a6);
  border-color: var(--color-teal, #14b8a6);
  color: #fff;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-box { animation: fadeIn 0.2s ease; }
@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: background 0.15s;
}
.btn-icon:hover { background: var(--color-surface); color: var(--color-text); }
</style>
