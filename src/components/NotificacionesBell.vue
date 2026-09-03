<template>
  <div style="position:relative">
    <button class="bell-btn" title="Notificaciones" @click="toggle">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <span v-if="noLeidos" class="bell-badge">{{ noLeidos > 99 ? '99+' : noLeidos }}</span>
    </button>

    <div v-if="open" class="dropdown notification-panel" style="min-width:320px;max-width:360px;max-height:420px;overflow-y:auto;z-index:100">
      <template v-if="solicitudes.length">
        <div class="notif-head">Solicitudes de ingreso</div>
        <div v-for="s in solicitudes" :key="s.id_solicitud" class="notif-item notif-pending">
          <div class="notif-link">
            <p class="notif-title">
              <svg class="notif-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              {{ nombreSolicitante(s) }}
            </p>
            <p class="notif-comment">Quiere unirse a {{ s.nombre_institucion }}</p>
            <p class="notif-date">{{ formatTimeAgo(s.created_at) }}</p>
            <p v-if="s.error" class="notif-error">{{ s.error }}</p>
            <div class="notif-actions">
              <button class="notif-accept" :disabled="s.resolviendo" @click="resolverSolicitud(s, true)">Aceptar</button>
              <button class="notif-reject" :disabled="s.resolviendo" @click="resolverSolicitud(s, false)">Rechazar</button>
            </div>
          </div>
        </div>
      </template>

      <div class="notif-head">Reportes sobre tus partituras</div>

      <div v-if="!reportes.length" class="notif-empty">
        No tienes ningún reporte por ahora.
      </div>

      <div v-for="r in reportes" :key="r.id_reporte" class="notif-item" :class="{ 'notif-unread': !r.leido }">
        <router-link
          :to="'/partitura/' + r.id_partitura"
          class="notif-link"
          @click="open = false"
        >
          <p class="notif-title">{{ motivoLegible(r.motivo) }} · {{ r.titulo_partitura }}</p>
          <p v-if="r.comentario" class="notif-comment">{{ r.comentario }}</p>
          <p class="notif-date">{{ formatTimeAgo(r.created_at) }}</p>
        </router-link>
        <button v-if="!r.leido" class="notif-read-btn" title="Marcar como leído" @click="marcar(r)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
      </div>
    </div>

    <div v-if="open" style="position:fixed;inset:0;z-index:98" @click="open = false"/>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/authStore.js'
import { useReporteController } from '../controllers/ReporteController.js'
import { useSolicitudInstitucionController } from '../controllers/SolicitudInstitucionController.js'
import { formatTimeAgo } from '../utils/validators.js'

const authStore = useAuthStore()
const reporteCtrl = useReporteController()
const solicitudCtrl = useSolicitudInstitucionController()

const open = ref(false)
const reportes = ref([])
const solicitudes = ref([])

const noLeidos = computed(
  () => reportes.value.filter(r => !r.leido).length + solicitudes.value.length
)

const MOTIVOS = {
  copyright: 'Copyright',
  robo: 'Robo de partitura',
  mala_calidad: 'Mala calidad',
  otro: 'Otro',
}
function motivoLegible(m) { return MOTIVOS[m] || m }

function nombreSolicitante(s) {
  const nombre = [s.nombre_usuario, s.apellidos_usuario].filter(Boolean).join(' ').trim()
  return nombre || 'Un usuario'
}

async function cargar() {
  if (!authStore.isAuthenticated) { reportes.value = []; solicitudes.value = []; return }
  const [rep, sol] = await Promise.all([
    reporteCtrl.getReportesPropietario(),
    solicitudCtrl.getPendientesAdmin(),
  ])
  reportes.value = rep
  solicitudes.value = (sol || []).map(s => ({ ...s, resolviendo: false, error: '' }))
}

async function resolverSolicitud(s, aceptar) {
  s.error = ''
  s.resolviendo = true
  try {
    await solicitudCtrl.resolver(s.id_solicitud, aceptar)
    solicitudes.value = solicitudes.value.filter(x => x.id_solicitud !== s.id_solicitud)
  } catch (e) {
    s.error = e.message || 'No se pudo resolver la solicitud.'
    s.resolviendo = false
  }
}

onMounted(cargar)
watch(() => authStore.isAuthenticated, cargar)

function toggle() { open.value = !open.value }

async function marcar(r) {
  try {
    await reporteCtrl.marcarLeido(r.id_reporte)
    r.leido = true
  } catch (e) {
    console.warn('[Notificaciones] No se pudo marcar como leído:', e.message)
  }
}
</script>

<style scoped>
.bell-btn {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-navy);
  transition: background 0.15s;
}
.bell-btn:hover { background: rgba(255,255,255,0.35); }

.bell-badge {
  position: absolute;
  top: 2px;
  right: 0;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-head {
  padding: 0.75rem 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
}
.notif-empty {
  padding: 1.25rem 1rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  text-align: center;
}
.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem 0.6rem 1rem;
  border-bottom: 1px solid var(--color-border);
}
.notif-item:last-child { border-bottom: none; }
.notif-unread { background: rgba(239,68,68,0.06); }
.notif-link { flex: 1; min-width: 0; text-decoration: none; color: inherit; }
.notif-title { margin: 0; font-size: 0.875rem; font-weight: 600; }
.notif-comment {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.notif-date { margin: 0.25rem 0 0; font-size: 0.72rem; color: var(--color-text-secondary); }
.notif-read-btn {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--color-border);
  cursor: pointer;
  color: var(--color-text-secondary);
}
.notif-read-btn:hover { color: #10b981; border-color: #10b981; }

/* solicitudes de ingreso a instituciones */
.notif-pending { background: rgba(20,184,166,0.07); }
.notif-icon { vertical-align: -2px; margin-right: 0.25rem; color: var(--color-teal-dark); }
.notif-error { margin: 0.35rem 0 0; font-size: 0.75rem; color: #ef4444; }
.notif-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.notif-accept, .notif-reject {
  padding: 0.25rem 0.7rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid transparent;
}

@media (max-width: 600px) {
  .notification-panel {
    position: fixed;
    top: 72px;
    left: 0.75rem;
    right: 0.75rem;
    width: auto;
    min-width: 0 !important;
    max-width: none !important;
    max-height: calc(100dvh - 88px) !important;
  }
}
.notif-accept { background: #10b981; color: #fff; }
.notif-accept:hover:not(:disabled) { background: #059669; }
.notif-reject {
  background: none;
  border-color: var(--color-border);
  color: var(--color-text-secondary);
}
.notif-reject:hover:not(:disabled) { color: #ef4444; border-color: #ef4444; }
.notif-accept:disabled, .notif-reject:disabled { opacity: 0.5; cursor: default; }
</style>
