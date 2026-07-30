<template>
  <div>
    <AppHeader @open-auth="showAuth = true"/>

    <div class="page-container">
      <!-- cabecera -->
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:1.5rem">
        <div>
          <h1 class="page-title" style="display:flex;align-items:center;gap:0.75rem;margin:0 0 0.5rem">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            Tu biblioteca
          </h1>
          <p class="page-subtitle" style="margin-bottom:0">
            Aquí se guardan las partituras que hayas escaneado para que puedas revisarlas cuando quieras
          </p>
        </div>
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.25rem;flex-shrink:0">
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
            Añadir partitura
          </router-link>
        </div>
      </div>

      <!-- loading -->
      <div v-if="loading" style="display:flex;justify-content:center;padding:3rem;margin-top:2rem">
        <div class="spinner"/>
      </div>

      <!-- grid de partituras -->
      <div v-else-if="partiturasFiltradas.length" class="score-grid" style="margin-top:0.5rem">
        <ScoreCard
          v-for="p in partiturasFiltradas"
          :key="p.id_partitura"
          :partitura="p"
          @click="abrirDetalle(p)"
        />
      </div>

      <!-- sin partituras (o sin resultados para el filtro) -->
      <div v-else style="text-align:center;padding:4rem 2rem;margin-top:2rem">
        <div style="font-size:3rem;margin-bottom:1rem;color:var(--color-text-secondary)">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </div>
        <h3 style="font-weight:700;margin:0 0 0.5rem">
          {{ partituras.length ? 'Ninguna partitura coincide con el filtro' : 'No hay partituras aquí todavía' }}
        </h3>
        <p style="color:var(--color-text-secondary);margin:0 0 1.5rem">
          {{ partituras.length ? 'Prueba con otros filtros o límpialos' : 'Transcribe tu primera partitura para empezar' }}
        </p>
        <router-link v-if="!partituras.length" to="/dashboard" class="btn btn-primary">Transcribir partitura</router-link>
      </div>
    </div>

    <AuthModal v-if="showAuth" initial-tab="login" @close="showAuth = false"/>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import ScoreCard from '../components/ScoreCard.vue'
import ScoreFilterMenu from '../components/ScoreFilterMenu.vue'
import AuthModal from '../components/AuthModal.vue'
import { useAuthStore } from '../stores/authStore.js'
import { usePartituraController } from '../controllers/PartituraController.js'
import PartituraRepository from '../repositories/PartituraRepository.js'
import EtiquetaRepository from '../repositories/EtiquetaRepository.js'

const router = useRouter()
const authStore = useAuthStore()
const ctrl = usePartituraController()

const partituras = ref([])
const partiturasFiltradas = ref([])
const likedIds = ref([])
const misEtiquetas = ref([])
const loading = ref(false)
const showAuth = ref(false)

onMounted(async () => { await loadPartituras() })

async function loadPartituras() {
  loading.value = true
  try {
    partituras.value = await ctrl.obtenerBiblioteca()
    partiturasFiltradas.value = partituras.value
    if (authStore.user?.id) {
      //Los "me gusta" y las etiquetas privadas del usuario se cargan una sola
      //vez: el panel de filtro trabaja después en cliente, sin lanzar
      //consultas por cada click.
      const [likes, etiquetas] = await Promise.all([
        PartituraRepository.getLikesByUser(authStore.user.id),
        EtiquetaRepository.getMisEtiquetas(authStore.user.id),
      ])
      likedIds.value = likes
      misEtiquetas.value = etiquetas
    }
  } finally {
    loading.value = false
  }
}

function abrirDetalle(p) { router.push('/partitura/' + p.id_partitura) }
</script>
