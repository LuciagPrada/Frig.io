<template>
  <div style="position:relative;flex-shrink:0">
    <button class="btn btn-secondary filtro-btn" @click="abrir">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
      </svg>
      Filtrar
      <span v-if="totalAplicados" class="filtro-badge">{{ totalAplicados }}</span>
    </button>

    <div v-if="open" class="dropdown filtro-panel">
      <div class="filtro-seccion">
        <p class="filtro-titulo">Etiquetas</p>
        <label class="filtro-opcion">
          <input type="checkbox" v-model="pendLikes"/>
          <span>❤ Me gusta</span>
        </label>
        <label v-for="t in etiquetasDisponibles" :key="t" class="filtro-opcion">
          <input type="checkbox" :value="t" v-model="pendEtiquetas"/>
          <span>{{ t }}</span>
        </label>
        <p v-if="!etiquetasDisponibles.length" class="filtro-vacio">
          Todavía no has etiquetado ninguna de estas partituras.
        </p>
      </div>

      <div v-if="instrumentosDisponibles.length" class="filtro-seccion">
        <p class="filtro-titulo">Instrumento</p>
        <label v-for="i in instrumentosDisponibles" :key="i" class="filtro-opcion">
          <input type="checkbox" :value="i" v-model="pendInstrumentos"/>
          <span>{{ i }}</span>
        </label>
      </div>

      <div v-if="generosDisponibles.length" class="filtro-seccion">
        <p class="filtro-titulo">Género</p>
        <label v-for="g in generosDisponibles" :key="g" class="filtro-opcion">
          <input type="checkbox" :value="g" v-model="pendGeneros"/>
          <span>{{ g }}</span>
        </label>
      </div>

      <div class="filtro-pie">
        <button class="btn btn-primary" style="width:100%;font-size:0.82rem" @click="aplicar">
          Aplicar filtros
        </button>
        <button class="btn btn-secondary" style="width:100%;font-size:0.82rem;margin-top:0.5rem" :disabled="!totalAplicados && !totalPendientes" @click="limpiar">
          Limpiar filtros
        </button>
      </div>
    </div>

    <div v-if="open" style="position:fixed;inset:0;z-index:98" @click="open = false"/>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  partituras: { type: Array, default: () => [] },
  likedIds:   { type: Array, default: () => [] },
  misEtiquetas: { type: [Array, Map], default: () => [] },
})
const emit = defineEmits(['filtered'])

const open = ref(false)

const pendEtiquetas    = ref([])
const pendInstrumentos = ref([])
const pendGeneros      = ref([])
const pendLikes        = ref(false)

const apEtiquetas    = ref([])
const apInstrumentos = ref([])
const apGeneros      = ref([])
const apLikes        = ref(false)

function abrir() {
  pendEtiquetas.value = [...apEtiquetas.value]
  pendInstrumentos.value = [...apInstrumentos.value]
  pendGeneros.value = [...apGeneros.value]
  pendLikes.value = apLikes.value
  open.value = true
}

function aplicar() {
  apEtiquetas.value = [...pendEtiquetas.value]
  apInstrumentos.value = [...pendInstrumentos.value]
  apGeneros.value = [...pendGeneros.value]
  apLikes.value = pendLikes.value
  open.value = false
}

function limpiar() {
  pendEtiquetas.value = []; apEtiquetas.value = []
  pendInstrumentos.value = []; apInstrumentos.value = []
  pendGeneros.value = []; apGeneros.value = []
  pendLikes.value = false; apLikes.value = false
  open.value = false
}

const mapaEtiquetas = computed(() => {
  if (props.misEtiquetas instanceof Map) {
    const m = new Map()
    for (const [id, tags] of props.misEtiquetas) m.set(id, new Set(tags || []))
    return m
  }
  const m = new Map()
  for (const fila of (props.misEtiquetas || [])) {
    if (!fila?.id_partitura || !fila?.etiqueta) continue
    if (!m.has(fila.id_partitura)) m.set(fila.id_partitura, new Set())
    m.get(fila.id_partitura).add(fila.etiqueta)
  }
  return m
})

const ordenEs = (a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' })

const etiquetasDisponibles = computed(() => {
  const set = new Set()
  for (const p of props.partituras) {
    for (const t of (mapaEtiquetas.value.get(p.id_partitura) || [])) set.add(t)
  }
  return [...set].sort(ordenEs)
})

function facetaDe(campo) {
  const set = new Set()
  for (const p of props.partituras) {
    const v = (p?.[campo] || '').trim()
    if (v) set.add(v)
  }
  return [...set].sort(ordenEs)
}
const instrumentosDisponibles = computed(() => facetaDe('instrumento'))
const generosDisponibles      = computed(() => facetaDe('genero'))

const totalAplicados  = computed(() => apEtiquetas.value.length + apInstrumentos.value.length + apGeneros.value.length + (apLikes.value ? 1 : 0))
const totalPendientes = computed(() => pendEtiquetas.value.length + pendInstrumentos.value.length + pendGeneros.value.length + (pendLikes.value ? 1 : 0))

const filtradas = computed(() => {
  if (!totalAplicados.value) return props.partituras
  const likes = new Set(props.likedIds)

  return props.partituras.filter(p => {
    if (apLikes.value && !likes.has(p.id_partitura)) return false

    if (apEtiquetas.value.length) {
      const tags = mapaEtiquetas.value.get(p.id_partitura)
      if (!tags || !apEtiquetas.value.some(t => tags.has(t))) return false
    }
    if (apInstrumentos.value.length && !apInstrumentos.value.includes((p.instrumento || '').trim())) return false
    if (apGeneros.value.length && !apGeneros.value.includes((p.genero || '').trim())) return false
    return true
  })
})

function podar(refArr, disponibles) {
  const validos = new Set(disponibles)
  if (refArr.value.every(v => validos.has(v))) return
  refArr.value = refArr.value.filter(v => validos.has(v))
}
watch(etiquetasDisponibles, v => { podar(apEtiquetas, v); podar(pendEtiquetas, v) })
watch(instrumentosDisponibles, v => { podar(apInstrumentos, v); podar(pendInstrumentos, v) })
watch(generosDisponibles, v => { podar(apGeneros, v); podar(pendGeneros, v) })

watch(filtradas, v => emit('filtered', v), { immediate: true })
</script>

<style scoped>
.filtro-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}
.filtro-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--color-navy);
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.filtro-panel {
  min-width: 240px;
  max-width: 280px;
  max-height: 420px;
  overflow-y: auto;
  z-index: 100;
  text-align: left;
}
.filtro-seccion {
  padding: 0.75rem 1rem 0.5rem;
  border-bottom: 1px solid var(--color-border);
}
.filtro-titulo {
  margin: 0 0 0.5rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-text-secondary);
}
.filtro-opcion {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  font-size: 0.875rem;
  cursor: pointer;
  color: var(--color-text-primary);
}
.filtro-opcion input { cursor: pointer; flex-shrink: 0; }
.filtro-opcion span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.filtro-vacio {
  margin: 0;
  font-size: 0.78rem;
  color: var(--color-text-secondary);
}
.filtro-pie { padding: 0.75rem 1rem; }

@media (max-width: 600px) {
  .filtro-panel {
    position: fixed;
    top: 76px;
    left: 0.75rem;
    right: 0.75rem;
    width: auto;
    min-width: 0;
    max-width: none;
    max-height: calc(100dvh - 92px);
  }
}
</style>
