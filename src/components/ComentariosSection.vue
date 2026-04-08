<template>
  <div class="comentarios-section">
    <h3 class="comentarios-title">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      Comentarios
      <span class="comentarios-count">{{ totalComentarios }}</span>
    </h3>

    <!-- Cargando -->
    <div v-if="loading" style="display:flex;justify-content:center;padding:2rem">
      <div class="spinner"/>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="comentarios-error">{{ error }}</div>

    <!-- Lista de comentarios -->
    <div v-else class="comentarios-list">
      <div v-if="!comentarios.length" class="comentarios-empty">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 0.5rem">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
      </div>

      <!-- Comentario raíz-->
      <div v-for="c in comentarios" :key="c.id_comentario" class="comentario-root">
        <div class="comentario-header">
          <div class="comentario-avatar" :style="avatarStyle(c.usuarios)">
            {{ avatarLetter(c.usuarios) }}
          </div>
          <div class="comentario-meta">
            <span class="comentario-author">{{ c.usuarios?.nickname || c.usuarios?.nombre || 'Usuario' }}</span>
            <span class="comentario-date">{{ formatRelative(c.created_at) }}</span>
          </div>
          <button
            v-if="userId && c.id_usuario === userId"
            class="comentario-delete-btn"
            title="Eliminar comentario"
            @click="deleteComentario(c.id_comentario)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
        <p class="comentario-contenido">{{ c.contenido }}</p>

        <!-- Botón Responder -->
        <button
          v-if="userId"
          class="comentario-reply-btn"
          @click="toggleReplyBox(c.id_comentario)"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
          Responder
        </button>

        <!-- Caja de respuesta -->
        <div v-if="replyBoxOpen === c.id_comentario" class="reply-box">
          <textarea
            v-model="replyDraft[c.id_comentario]"
            placeholder="Escribe tu respuesta..."
            rows="2"
            class="reply-textarea"
          />
          <div class="reply-actions">
            <button class="btn btn-ghost btn-sm" @click="toggleReplyBox(null)">Cancelar</button>
            <button
              class="btn btn-primary btn-sm"
              :disabled="submittingReply === c.id_comentario"
              @click="submitMensaje(c.id_comentario)"
            >
              {{ submittingReply === c.id_comentario ? 'Enviando…' : 'Responder' }}
            </button>
          </div>
        </div>

        <!-- Mensajes, contestación al comentario-->
        <div v-if="c.mensajes && c.mensajes.length" class="mensajes-thread">
          <div v-for="m in c.mensajes" :key="m.id_mensaje" class="mensaje-item">
            <div class="comentario-avatar comentario-avatar--sm" :style="avatarStyle(m.usuarios)">
              {{ avatarLetter(m.usuarios) }}
            </div>
            <div style="flex:1;min-width:0">
              <div class="comentario-meta">
                <span class="comentario-author">{{ m.usuarios?.nickname || m.usuarios?.nombre || 'Usuario' }}</span>
                <span class="comentario-date">{{ formatRelative(m.created_at) }}</span>
              </div>
              <p class="comentario-contenido" style="margin-top:0.25rem">{{ m.contenido }}</p>
            </div>
            <button
              v-if="userId && m.id_usuario === userId"
              class="comentario-delete-btn"
              title="Eliminar respuesta"
              @click="deleteMensaje(c.id_comentario, m.id_mensaje)"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Añadir comentario raíz -->
    <div v-if="userId" class="add-comentario">
      <textarea
        v-model="newComentario"
        placeholder="Escribe un comentario sobre esta partitura..."
        rows="3"
        class="reply-textarea"
      />
      <div style="display:flex;justify-content:flex-end;margin-top:0.5rem">
        <button
          class="btn btn-primary btn-sm"
          :disabled="submitting || !newComentario.trim()"
          @click="submitComentario"
        >
          {{ submitting ? 'Publicando…' : 'Publicar comentario' }}
        </button>
      </div>
    </div>
    <div v-else class="comentarios-login-hint">
      <slot name="login-hint">
        <span>Inicia sesión para comentar</span>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ComentarioRepository from '../repositories/ComentarioRepository.js'

const props = defineProps({
  partituraId: { type: String, required: true },
  userId:      { type: String, default: null },
})


const comentarios    = ref([])
const loading        = ref(false)
const error          = ref(null)
const newComentario  = ref('')
const submitting     = ref(false)
const replyBoxOpen   = ref(null) // id_comentario cuyo reply-box está abierto
const replyDraft     = ref({})    
const submittingReply = ref(null) //id_comentario cuyo mensaje se está enviando

const totalComentarios = computed(() =>
  comentarios.value.reduce((acc, c) => acc + 1 + (c.mensajes?.length || 0), 0)
)


onMounted(loadComentarios)


async function loadComentarios() {
  loading.value = true
  error.value   = null
  try {
    comentarios.value = await ComentarioRepository.getComentarios(props.partituraId)
  } catch (e) {
    error.value = 'Error al cargar comentarios.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function submitComentario() {
  if (!newComentario.value.trim() || !props.userId) return
  submitting.value = true
  try {
    const created = await ComentarioRepository.addComentario(
      props.partituraId, props.userId, newComentario.value
    )
    //recarga para tener el join completo
    newComentario.value = ''
    await loadComentarios()
  } catch (e) {
    alert(e.message || 'Error al publicar el comentario.')
  } finally {
    submitting.value = false
  }
}

async function submitMensaje(comentarioId) {
  const texto = replyDraft.value[comentarioId]?.trim()
  if (!texto || !props.userId) return
  submittingReply.value = comentarioId
  try {
    await ComentarioRepository.addMensaje(comentarioId, props.userId, texto)
    replyDraft.value[comentarioId] = ''
    replyBoxOpen.value = null
    await loadComentarios()
  } catch (e) {
    alert(e.message || 'Error al enviar la respuesta.')
  } finally {
    submittingReply.value = null
  }
}

async function deleteComentario(comentarioId) {
  if (!confirm('¿Eliminar este comentario y todas sus respuestas?')) return
  try {
    await ComentarioRepository.deleteComentario(comentarioId, props.userId)
    comentarios.value = comentarios.value.filter(c => c.id_comentario !== comentarioId)
  } catch (e) {
    alert('Error al eliminar el comentario.')
  }
}

async function deleteMensaje(comentarioId, mensajeId) {
  if (!confirm('¿Eliminar esta respuesta?')) return
  try {
    await ComentarioRepository.deleteMensaje(mensajeId, props.userId)
    const c = comentarios.value.find(c => c.id_comentario === comentarioId)
    if (c) c.mensajes = c.mensajes.filter(m => m.id_mensaje !== mensajeId)
  } catch (e) {
    alert('Error al eliminar la respuesta.')
  }
}

function toggleReplyBox(id) {
  replyBoxOpen.value = replyBoxOpen.value === id ? null : id
}


function avatarLetter(u) {
  return (u?.nickname || u?.nombre || '?')[0].toUpperCase()
}

function avatarStyle(u) {
  const seed  = u?.avatar_seed || (u?.nickname || 'X')
  const hue   = (seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 37) % 360
  return { background: `hsl(${hue},55%,42%)`, color: '#fff' }
}

function formatRelative(iso) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 60)    return 'ahora mismo'
  if (diff < 3600)  return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
  return new Date(iso).toLocaleDateString('es-ES', { day:'numeric', month:'short' })
}
</script>

<style scoped>
.comentarios-section {
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
  margin-top: 1.5rem;
}

.comentarios-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-navy);
  margin: 0 0 1.25rem;
}
.comentarios-count {
  background: var(--color-primary, #4a4a8a);
  color: #fff;
  border-radius: 9999px;
  padding: 0.1rem 0.55rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.comentarios-error  { color: #dc2626; font-size: 0.875rem; padding: 0.75rem 0; }
.comentarios-empty  { text-align: center; color: var(--color-text-secondary); padding: 1.5rem 0; font-size: 0.9rem; }
.comentarios-list   { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.25rem; }

/*Comentario raíz*/
.comentario-root {
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-sm, 8px);
  padding: 0.875rem 1rem;
  background: var(--color-card-bg, #fff);
}

.comentario-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 0.5rem;
}

.comentario-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
}
.comentario-avatar--sm {
  width: 26px;
  height: 26px;
  font-size: 0.75rem;
}

.comentario-meta {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.comentario-author { font-weight: 700; font-size: 0.875rem; color: var(--color-navy, #1a1a2e); }
.comentario-date   { font-size: 0.75rem; color: var(--color-text-secondary, #6b7280); }
.comentario-contenido { margin: 0; font-size: 0.9rem; line-height: 1.55; color: var(--color-text, #1f2937); }

.comentario-delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary, #9ca3af);
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}
.comentario-delete-btn:hover { color: #dc2626; }

.comentario-reply-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-secondary, #6b7280);
  padding: 0.25rem 0;
  margin-top: 0.4rem;
  transition: color 0.15s;
}
.comentario-reply-btn:hover { color: var(--color-primary, #4a4a8a); }

/* Mensajes (nivel 2) */
.mensajes-thread {
  margin-top: 0.75rem;
  padding-left: 1rem;
  border-left: 2px solid var(--color-border, #e5e7eb);
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}
.mensaje-item {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

/*Caja de respuesta*/
.reply-box {
  margin-top: 0.625rem;
  padding: 0.75rem;
  background: var(--color-bg-secondary, #f9fafb);
  border-radius: var(--radius-sm, 8px);
  border: 1px solid var(--color-border, #e5e7eb);
}
.reply-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

/*Añadir comentario*/
.add-comentario {
  margin-top: 0.5rem;
}
.reply-textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--color-border, #d1d5db);
  border-radius: var(--radius-sm, 8px);
  padding: 0.625rem 0.75rem;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  background: var(--color-bg, #fff);
  color: var(--color-text, #1f2937);
  transition: border-color 0.2s;
}
.reply-textarea:focus {
  outline: none;
  border-color: var(--color-primary, #4a4a8a);
}

.comentarios-login-hint {
  text-align: center;
  color: var(--color-text-secondary, #6b7280);
  font-size: 0.875rem;
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: var(--color-bg-secondary, #f9fafb);
  border-radius: var(--radius-sm, 8px);
}

.btn-sm { padding: 0.35rem 0.85rem; font-size: 0.8rem; }
</style>
