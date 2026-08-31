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
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.5rem;flex-shrink:0">
          <!-- filtros por etiqueta propia / instrumento / género / me gusta -->
          <ScoreFilterMenu
            v-if="!loading && partituras.length"
            :partituras="partituras"
            :liked-ids="likedIds"
            :mis-etiquetas="misEtiquetas"
            @filtered="partiturasFiltradas = $event"
          />
          <router-link to="/dashboard" class="btn btn-primary" style="display:flex;align-items:center;gap:0.5rem">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            Nueva partitura
          </router-link>
        </div>
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
      <div v-else-if="partiturasFiltradas.length" class="score-grid">
        <ScoreCard
          v-for="p in partiturasFiltradas"
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

    <AuthModal v-if="showAuth" initial-tab="login" @close="showAuth = false"/>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import ScoreCard from '../components/ScoreCard.vue'
import ScoreFilterMenu from '../components/ScoreFilterMenu.vue'
import AuthModal from '../components/AuthModal.vue'
import { useAuthStore } from '../stores/authStore.js'
import { useComunidadController } from '../controllers/ComunidadController.js'
import EtiquetaRepository from '../repositories/EtiquetaRepository.js'

const router = useRouter()
const authStore = useAuthStore()
const comunidadCtrl = useComunidadController()
const { partituras, loading, userLikes, getFeed, loadUserLikes, toggleLike } = comunidadCtrl

const searchQuery = ref('')
const showAuth = ref(false)
const partiturasFiltradas = ref([])
const misEtiquetas = ref([])

//El filtro "Me gusta" reutiliza los likes que el controlador ya tiene cargados
const likedIds = computed(() => [...userLikes.value])

onMounted(async () => {
  await getFeed()
  if (authStore.isAuthenticated) {
    await loadUserLikes()
    //Las etiquetas privadas del usuario se piden una sola vez y el panel de
    //filtro las cruza en cliente con el feed.
    misEtiquetas.value = await EtiquetaRepository.getMisEtiquetas(authStore.user?.id)
  }
})

let searchTimeout = null
watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => getFeed(val), 400)
})

//Si una búsqueda deja el feed vacío, el panel de filtro se desmonta y ya no
//emite: hay que vaciar la lista filtrada a mano para no dejar resultados viejos.
watch(partituras, (v) => { if (!v.length) partiturasFiltradas.value = [] })

function handleSearch() { getFeed(searchQuery.value) }
function clearSearch() { searchQuery.value = ''; getFeed() }

async function handleLike(id) {
  if (!authStore.isAuthenticated) { showAuth.value = true; return }
  await toggleLike(id)
}

function openDetail(p) { router.push('/partitura/' + p.id_partitura) }
</script>
