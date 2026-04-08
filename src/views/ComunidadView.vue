<template>
  <div>
    <AppHeader @open-auth="showAuth = true"/>

    <div class="page-container">
      <div style="display:flex;justify-content:space-between;align-items:flex-end">
        <div>
          <h1 class="page-title" style="display:flex;align-items:center;gap:0.75rem">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
            Comunidad
          </h1>
          <p class="page-subtitle">Descubre partituras compartidas por otros músicos y musicólogos</p>
        </div>
        <router-link to="/dashboard" class="btn btn-primary" style="margin-bottom:1.5rem;display:flex;align-items:center;gap:0.5rem">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          Añadir partitura
        </router-link>
      </div>

      <!-- barra de búsqueda -->
      <div class="search-bar">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por título, autor o instrumento..."
          @keyup.enter="handleSearch"
        />
        <button
          v-if="searchQuery"
          style="position:absolute;right:1rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--color-text-secondary);font-size:1.2rem"
          @click="clearSearch"
        >✕</button>
      </div>

      <!-- cargando -->
      <div v-if="loading" style="display:flex;justify-content:center;padding:3rem">
        <div class="spinner"/>
      </div>

      <!-- grid de resultados -->
      <div v-else-if="partituras.length" class="score-grid">
        <ScoreCard
          v-for="p in partituras"
          :key="p.id_partitura"
          :partitura="p"
          :show-like="authStore.isAuthenticated"
          :is-liked="comunidadCtrl.hasLike(p.id_partitura)"
          @click="openDetail(p)"
          @like="handleLike(p.id_partitura)"
        />
      </div>

      <!-- sin resultados -->
      <div v-else style="text-align:center;padding:4rem 2rem">
        <div style="font-size:3rem;margin-bottom:1rem;color:var(--color-text-secondary)">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </div>
        <h3 style="font-weight:700;margin:0 0 0.5rem">
          {{ searchQuery ? 'Sin resultados para "' + searchQuery + '"' : 'La comunidad está vacía' }}
        </h3>
        <p style="color:var(--color-text-secondary)">
          {{ searchQuery ? 'Prueba con otros términos de búsqueda' : 'Sé el primero en compartir una partitura' }}
        </p>
      </div>
    </div>

    <!-- modals -->
    <ScoreDetailModal
      v-if="selectedPartitura"
      :partitura="selectedPartitura"
      @close="selectedPartitura = null"
      @reproducir="handleReproducir"
      @descargar="handleDescargar"
      @compartir="() => {}"
      @eliminar="() => {}"
      @request-login="showAuth = true"
    />
    <VerovioViewer
      v-if="showVerovio && verovioXml"
      :musicxml="verovioXml"
      @close="showVerovio = false"
    />
    <AuthModal v-if="showAuth" initial-tab="login" @close="showAuth = false"/>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import ScoreCard from '../components/ScoreCard.vue'
import ScoreDetailModal from '../components/ScoreDetailModal.vue'
import VerovioViewer from '../components/VerovioViewer.vue'
import AuthModal from '../components/AuthModal.vue'
import { useAuthStore } from '../stores/authStore.js'
import { useComunidadController } from '../controllers/ComunidadController.js'

const authStore = useAuthStore()
const comunidadCtrl = useComunidadController(authStore.user?.id)
const { partituras, loading, getFeed, loadUserLikes, toggleLike } = comunidadCtrl

const searchQuery = ref('')
const selectedPartitura = ref(null)
const showVerovio = ref(false)
const verovioXml = ref('')
const showAuth = ref(false)

onMounted(async () => {
  await getFeed()
  if (authStore.isAuthenticated) await loadUserLikes()
})

let searchTimeout = null
watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => getFeed(val), 400)
})

function handleSearch() { getFeed(searchQuery.value) }
function clearSearch() { searchQuery.value = ''; getFeed() }

async function handleLike(id) {
  if (!authStore.isAuthenticated) { showAuth.value = true; return }
  await toggleLike(id)
}

function openDetail(p) { selectedPartitura.value = p }

function handleReproducir(p) {
  const xml = p.transcripciones?.[0]?.musicxml_content
  if (xml) { verovioXml.value = xml; showVerovio.value = true }
}

function handleDescargar(p) {
  const xml = p.transcripciones?.[0]?.musicxml_content || ''
  const blob = new Blob([xml], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `${p.titulo || 'partitura'}.xml`; a.click()
  URL.revokeObjectURL(url)
}
</script>
