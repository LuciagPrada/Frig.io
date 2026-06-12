<template>
  <div>
    <AppHeader @open-auth="openAuth"/>

    <!-- seccción -->
    <section style="background:var(--color-teal);padding:4rem 2rem;text-align:center">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--color-navy)" stroke-width="2" style="margin-bottom:1rem;margin-left:auto;margin-right:auto">
        <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
      </svg>
      <h1 style="font-size:2.5rem;font-weight:800;color:var(--color-navy);margin:0 0 1rem">
        Transcripción de Partituras con OMR
      </h1>
      <p style="color:rgba(15,23,42,0.7);font-size:1.1rem;max-width:600px;margin:0 auto 2rem;line-height:1.6">
        Plataforma de reconocimiento óptico musical que convierte imágenes<br>
        de partituras manuscritas en archivos digitales editables y reproducibles
      </p>
    </section>

    <!-- contenido principal -->
    <div class="page-container" style="max-width:960px">
      <!-- CTA card -->
      <div class="card" style="padding:2.5rem;text-align:center;margin-bottom:2rem">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal-dark)" stroke-width="2" style="margin-bottom:1rem;margin-left:auto;margin-right:auto">
          <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
        </svg>
        <h2 style="font-size:1.5rem;font-weight:700;margin:0 0 0.5rem">Empieza a transcribir</h2>
        <p style="color:var(--color-text-secondary);margin:0 0 1.5rem">
          Inicia sesión para subir tus partituras y acceder a todas las funciones
        </p>
        <button v-if="!authStore.isAuthenticated" class="btn btn-primary" style="font-size:1rem;padding:0.75rem 2rem" @click="openAuth('login')">
          Iniciar Sesión para Comenzar
        </button>
        <router-link v-else to="/dashboard" class="btn btn-primary" style="font-size:1rem;padding:0.75rem 2rem;text-decoration:none">
          Ir a Transcribir
        </router-link>
      </div>

      <!-- ¿Qué es? -->
      <section class="card" style="padding:2rem;margin-bottom:1.5rem">
        <h2 style="font-size:1.2rem;font-weight:700;margin:0 0 1rem;display:flex;align-items:center;gap:0.5rem">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m12 16v-4"/><path d="m12 8h.01"/></svg>
          ¿Qué es OMR?
        </h2>
        <p style="color:var(--color-text-secondary);line-height:1.7;margin:0">
          Esta es una aplicación de <strong>transcripción de partituras manuscritas</strong> que utiliza tecnología de
          <strong>OMR (Optical Music Recognition)</strong> Reconocimiento Óptico Musical. Similar a MuseScore,
          permite convertir imágenes de partituras escritas a mano en archivos digitales editables y reproducibles.
          El sistema está diseñado para compositores, estudiantes y profesores de música que necesitan digitalizar
          sus partituras de forma rápida y precisa.
        </p>
      </section>

      <!-- ¿Cómo se usa? -->
      <section class="card" style="padding:2rem;margin-bottom:2rem">
        <h2 style="font-size:1.2rem;font-weight:700;margin:0 0 1.5rem;display:flex;align-items:center;gap:0.5rem">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 4 10-2 10 2v16l-10-2-10 2z"/><path d="m12 2v16"/></svg>
          ¿Cómo se usa?
        </h2>
        <div style="display:flex;flex-direction:column;gap:1rem">
          <div v-for="(step, i) in howToSteps" :key="i" style="display:flex;gap:1rem;align-items:flex-start">
            <div style="background:var(--color-navy);color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;flex-shrink:0;margin-top:2px">
              {{ i + 1 }}
            </div>
            <div>
              <p style="font-weight:600;margin:0 0 0.2rem">{{ step.title }}</p>
              <p style="color:var(--color-text-secondary);font-size:0.875rem;margin:0">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- tarjetas de características -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:2rem">
        <div class="card cursor-pointer hover-effect" style="padding:1.5rem;text-align:center;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s" @click="showProjectPopup = true">
          <div style="font-size:2rem;margin-bottom:0.75rem;color:var(--color-teal-dark)">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin:0 auto"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          </div>
          <h3 style="font-size:1rem;font-weight:700;margin:0 0 0.5rem">Reconocimiento OMR</h3>
          <p style="color:var(--color-text-secondary);font-size:0.85rem;margin:0;line-height:1.5">Tecnología avanzada de reconocimiento óptico de música basada en IA multimodal Qwen2.5.</p>
        </div>
        <div class="card cursor-pointer hover-effect" style="padding:1.5rem;text-align:center;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s" @click="authStore.isAuthenticated ? router.push('/biblioteca') : openAuth('login')">
          <div style="font-size:2rem;margin-bottom:0.75rem;color:var(--color-teal-dark)">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin:0 auto"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          </div>
          <h3 style="font-size:1rem;font-weight:700;margin:0 0 0.5rem">Biblioteca Personal</h3>
          <p style="color:var(--color-text-secondary);font-size:0.85rem;margin:0;line-height:1.5">Guarda todas tus partituras transcritas en tu biblioteca personal y accede a ellas cuando quieras.</p>
        </div>
        <div class="card cursor-pointer hover-effect" style="padding:1.5rem;text-align:center;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s" @click="authStore.isAuthenticated ? router.push('/comunidad') : openAuth('login')">
          <div style="font-size:2rem;margin-bottom:0.75rem;color:var(--color-teal-dark)">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin:0 auto"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
          </div>
          <h3 style="font-size:1rem;font-weight:700;margin:0 0 0.5rem">Compartir en Comunidad</h3>
          <p style="color:var(--color-text-secondary);font-size:0.85rem;margin:0;line-height:1.5">Comparte tus partituras con la comunidad y descubre las de otros músicos, compositores y bibliotecarios.</p>
        </div>
      </div>
    </div>

    <!-- modal  de autenticación -->
    <AuthModal v-if="showAuth" :initial-tab="authTab" @close="showAuth = false"/>

    <!-- modal de información del proyecto -->
    <div v-if="showProjectPopup" style="position:fixed;inset:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(4px);z-index:90;display:flex;align-items:center;justify-content:center" @click.self="showProjectPopup = false">
      <div class="card" style="width:100%;max-width:500px;padding:2rem;position:relative">
        <button class="btn-close" @click="showProjectPopup = false" style="position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--color-text-secondary)">&times;</button>
        <h2 style="margin:0 0 1rem;font-size:1.5rem;font-weight:700;display:flex;align-items:center;gap:0.5rem">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
           Información del Proyecto
        </h2>
        <p style="color:var(--color-text-secondary);line-height:1.6;margin-bottom:1.5rem">
          Frig.io es un sistema multimodal avanzado de <strong>Reconocimiento Óptico de Música (OMR)</strong>.
          Utiliza modelos de inteligencia artificial como Qwen2.5 para interpretar imágenes de partituras manuscritas y
          convertirlas en formatos digitales de código estándar MusicXML, que pueden ser procesados
          por software de edición musical (como MuseScore o Sibelius).
        </p>
        <div style="background:var(--color-bg);padding:1rem;border-radius:0.5rem">
           <h4 style="margin:0 0 0.5rem;font-size:0.95rem;font-weight:600">Tecnologías Principales</h4>
           <ul style="margin:0;padding-left:1.5rem;color:var(--color-text-secondary);font-size:0.9rem">
             <li>Backend AI Multimodal (Python API)</li>
             <li>Supabase (Base de datos y Autenticación)</li>
             <li>Vue.js (Frontend Interfaz)</li>
             <li>Verovio Toolkit (Renderizado de MusicXML)</li>
           </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import AuthModal from '../components/AuthModal.vue'
import { useAuthStore } from '../stores/authStore.js'

const route = useRoute()
const router = useRouter()
const showAuth = ref(false)
const authTab = ref('login')
const showProjectPopup = ref(false)
const authStore = useAuthStore()

onMounted(() => {
  if (route.query.login) { showAuth.value = true; authTab.value = 'login' }
})

function openAuth(tab = 'login') {
  authTab.value = tab
  showAuth.value = true
}

const howToSteps = [
  { title: 'Sube tu partitura manuscrita', description: 'En la página de transcripción, haz clic en el área de carga y selecciona una imagen (JPG, PNG) de tu partitura escrita a mano. Puedes arrastrar y soltar directamente.' },
  { title: 'Espera la transcripción OMR', description: 'Nuestro sistema de IA multimodal analizará la imagen y detectará todos los elementos musicales: clave, compás, notas, silencios y más.' },
  { title: 'Descarga tu archivo', description: 'Una vez procesada, la partitura se guarda en tu biblioteca personal en formato MusicXML, que puedes descargar, visualizar interactivamente y compartir.' },
]

</script>
<style scoped>
.hover-effect:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>
