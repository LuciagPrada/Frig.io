<template>
  <!-- Card de partitura con imagen de fondo y overlay -->
  <div class="score-card" @click="$emit('click', partitura)">
    <!-- Thumbnail -->
    <img
      v-if="thumbnailUrl"
      :src="thumbnailUrl"
      :alt="partitura.titulo"
      loading="lazy"
    />
    <div v-else class="score-placeholder">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5">
        <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
      </svg>
    </div>

    <!-- Overlay con metadatos -->
    <div class="score-card-overlay">
      <!-- Like -->
      <button
        v-if="showLike"
        class="score-like-btn"
        :class="{ liked: isLiked }"
        @click.stop="$emit('like', partitura.id_partitura)"
      >
        <svg v-if="isLiked" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#ef4444"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>

      <p class="score-title">{{ partitura.titulo }}</p>
      <p class="score-author">{{ partitura.autor }}</p>

      <div style="font-size:0.75rem; color:rgba(255,255,255,0.7); margin-top:0.35rem; line-height:1.2">
        <span v-if="partitura.usuarios?.nickname">Subido por @{{ partitura.usuarios.nickname }}</span>
        <br v-if="partitura.usuarios?.nickname && partitura.fecha_subida" />
        <span v-if="partitura.fecha_subida">{{ formatTimeAgo(partitura.fecha_subida) }}</span>
      </div>

      <!-- Contadores likes + comentarios -->
      <div class="score-stats">
        <span class="score-stat">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          {{ likesCount }}
        </span>
        <span class="score-stat">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          {{ comentariosCount }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatTimeAgo } from '../utils/validators.js'

const props = defineProps({
  partitura:  { type: Object,  required: true },
  showLike:   { type: Boolean, default: false },
  isLiked:    { type: Boolean, default: false },
})
defineEmits(['click', 'like'])

const thumbnailUrl = computed(() =>
  props.partitura.transcripciones?.[0]?.ruta_imagen ||
  props.partitura.thumbnail_url || null
)

const likesCount = computed(() => {
  const l = props.partitura.likes
  if (!l) return 0
  if (Array.isArray(l)) return l[0]?.count ?? l.length
  if (typeof l === 'object' && l.count !== undefined) return l.count
  return Number(l) || 0
})

const comentariosCount = computed(() => {
  if (props.partitura.total_comentarios !== undefined) return props.partitura.total_comentarios
  const c = props.partitura.comentarios
  if (!c) return 0
  if (Array.isArray(c)) return c[0]?.count ?? c.length
  if (typeof c === 'object' && c.count !== undefined) return c.count
  return Number(c) || 0
})
</script>

<style scoped>
.score-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a2a3a, #2d4a3e);
  display: flex;
  align-items: center;
  justify-content: center;
}
.score-like-btn {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(4px);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.score-like-btn:hover { transform: scale(1.15); background: rgba(255,255,255,0.3); }
.score-like-btn.liked  { background: rgba(239,68,68,0.3); }

.score-stats {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.35rem;
}
.score-stat {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255,255,255,0.85);
}
</style>
