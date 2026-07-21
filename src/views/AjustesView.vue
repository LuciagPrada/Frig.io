<template>
  <div>
    <AppHeader @open-auth="showAuth = true"/>

    <div class="page-container" style="max-width:640px">
      <h1 class="page-title" style="display:flex;align-items:center;gap:0.75rem">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        Ajustes de cuenta
      </h1>
      <p class="page-subtitle">Gestiona tu información personal y preferencias</p>

      <!-- sección avatares -->
      <div class="card" style="padding:2rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:2rem">
        <div style="width:100px;height:100px;border-radius:50%;overflow:hidden;border:3px solid var(--color-teal);background:var(--color-bg);flex-shrink:0">
          <img v-if="avatarSeed" :src="`https://api.dicebear.com/9.x/avataaars/svg?seed=${avatarSeed}`" alt="Avatar" style="width:100%;height:100%;object-fit:cover"/>
          <svg v-else width="100" height="100" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill="rgba(15,23,42,0.12)"/>
            <circle cx="20" cy="16" r="7" fill="rgba(15,23,42,0.55)"/>
            <path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14" fill="rgba(15,23,42,0.55)"/>
          </svg>
        </div>
        <div>
          <h2 style="margin:0 0 0.5rem;font-size:1.1rem;font-weight:700">Avatar de Perfil</h2>
          <p style="color:var(--color-text-secondary);font-size:0.9rem;margin:0 0 1rem">Genera un nuevo avatar aleatorio para tu perfil.</p>
          <button class="btn btn-secondary" style="font-size:0.875rem;padding:0.5rem 1rem" @click="handleRandomizeAvatar" :disabled="savingAvatar">
            <span v-if="savingAvatar" class="spinner spinner-sm"/>
            <span v-else>🎲 Randomizar Avatar</span>
          </button>
        </div>
      </div>

      <!-- info del perfil -->
      <div class="card" style="padding:2rem;margin-bottom:1.5rem">
        <h2 style="margin:0 0 1.5rem;font-size:1.1rem;font-weight:700">Información personal</h2>
        <div v-if="diasRestantes > 0" class="alert alert-warning" style="margin-bottom:1.5rem">
          ⏳ No puedes modificar tu nombre o nickname hasta que pasen {{ diasRestantes }} días desde la última vez que los editaste.
        </div>
        <form @submit.prevent="handleSavePerfil">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
            <div class="form-group">
              <label class="form-label">Nombre</label>
              <input v-model="form.nombre" type="text" class="form-input" placeholder="Tu nombre" :disabled="diasRestantes > 0"/>
            </div>
            <div class="form-group">
              <label class="form-label">Apellidos</label>
              <input v-model="form.apellidos" type="text" class="form-input" placeholder="Tus apellidos" :disabled="diasRestantes > 0"/>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Nickname</label>
            <input v-model="form.nickname" type="text" class="form-input" placeholder="@tunickname" :disabled="diasRestantes > 0"/>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input :value="authStore.user?.email" type="email" class="form-input" disabled style="opacity:0.6;cursor:not-allowed"/>
            <p style="font-size:0.75rem;color:var(--color-text-secondary);margin:0.3rem 0 0">El email no se puede cambiar desde aquí</p>
          </div>
          <div v-if="perfilSuccess" class="alert alert-success">✅ {{ perfilSuccess }}</div>
          <div v-if="perfilError" class="alert alert-error">⚠️ {{ perfilError }}</div>
          <button type="submit" class="btn btn-primary" :disabled="savingPerfil || diasRestantes > 0">
            <span v-if="savingPerfil" class="spinner spinner-sm"/>
            {{ savingPerfil ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </form>
      </div>

      <!-- cambio de contraseña -->
      <div class="card" style="padding:2rem;margin-bottom:1.5rem">
        <h2 style="margin:0 0 0.5rem;font-size:1.1rem;font-weight:700">Seguridad</h2>
        <p style="color:var(--color-text-secondary);font-size:0.9rem;margin:0 0 1.5rem">Se enviará un enlace seguro a tu correo electrónico para restablecer la contraseña.</p>
        <div v-if="passError" class="alert alert-error" style="margin-bottom:1rem">⚠️ {{ passError }}</div>
        <div v-if="passSuccess" class="alert alert-success" style="margin-bottom:1rem">✅ {{ passSuccess }}</div>
        <button class="btn btn-secondary" @click="handleResetPassword" :disabled="savingPass" style="display:flex;align-items:center;gap:0.5rem">
          <span v-if="savingPass" class="spinner spinner-sm"/>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
          Solicitar cambio de contraseña
        </button>
      </div>

      <!-- rol del usuario -->
      <div class="card" style="padding:1.5rem;margin-bottom:1.5rem">
        <h2 style="margin:0 0 1rem;font-size:1.1rem;font-weight:700">Información de cuenta</h2>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span style="color:var(--color-text-secondary);font-size:0.9rem">Tipo de cuenta</span>
          <span :class="authStore.isAdmin ? 'badge badge-success' : 'badge badge-warning'">
            {{ authStore.isAdmin ? 'Administrador' : 'Usuario Registrado' }}
          </span>
        </div>
      </div>

      <!-- zona de peligro -->
      <div class="card" style="padding:2rem">
        <h2 style="margin:0 0 0.5rem;font-size:1.1rem;font-weight:700">Eliminar cuenta</h2>
        <p style="color:var(--color-text-secondary);font-size:0.9rem;margin:0 0 1.5rem">Elimina permanentemente tu cuenta y todos tus datos. Esta acción no se puede deshacer.</p>
        <button class="btn btn-danger" style="display:flex;align-items:center;gap:0.5rem" @click="confirmarEliminarCuenta">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          Eliminar mi cuenta
        </button>
      </div>
    </div>

    <!-- confirmar eliminar cuenta -->
    <div v-if="showConfirmDelete" class="modal-overlay" @click.self="showConfirmDelete = false">
      <div class="modal-box card" style="max-width:420px;width:90%;padding:2rem">
        <div style="text-align:center;margin-bottom:1.5rem">
          <div style="width:56px;height:56px;border-radius:50%;background:#fee2e2;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </div>
          <h2 style="margin:0 0 0.75rem;font-size:1.1rem;font-weight:700">¿Eliminar tu cuenta?</h2>
          <p style="color:var(--color-text-secondary);font-size:0.9rem;margin:0">
            Se eliminarán tu perfil, tus partituras y todos tus datos asociados.
            Esta acción <strong>no se puede deshacer</strong>.
          </p>
        </div>
        <div v-if="deleteError" class="alert alert-error" style="margin-bottom:1rem">{{ deleteError }}</div>
        <div style="display:flex;gap:0.75rem;justify-content:center">
          <button class="btn btn-secondary" @click="showConfirmDelete = false">Cancelar</button>
          <button class="btn btn-danger" @click="handleEliminarCuenta" :disabled="deletingAccount">
            <span v-if="deletingAccount" class="spinner spinner-sm"/>
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>

    <AuthModal v-if="showAuth" initial-tab="login" @close="showAuth = false"/>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import AuthModal from '../components/AuthModal.vue'
import { useAuthStore } from '../stores/authStore.js'
import SupabaseClient from '../repositories/SupabaseClient.js'

const authStore = useAuthStore()
const router = useRouter()
const showAuth = ref(false)

const form = reactive({ nombre: '', apellidos: '', nickname: '' })
const perfilSuccess = ref(''); const perfilError = ref(''); const savingPerfil = ref(false)
const passSuccess = ref(''); const passError = ref(''); const savingPass = ref(false)
const savingAvatar = ref(false)
const showConfirmDelete = ref(false); const deleteError = ref(''); const deletingAccount = ref(false)

const avatarSeed = computed(() => authStore.user?.avatar_seed || '')
const diasRestantes = computed(() => {
  if (!authStore.user?.last_profile_update) return 0
  const lastUpdate = new Date(authStore.user.last_profile_update)
  const now = new Date()
  const diffTime = Math.abs(now - lastUpdate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 30 ? 0 : (30 - diffDays)
})

onMounted(() => {
  if (authStore.user) {
    form.nombre = authStore.user.nombre || ''
    form.apellidos = authStore.user.apellidos || ''
    form.nickname = authStore.user.nickname || ''
  }
})

async function handleRandomizeAvatar() {
  if (!authStore.user?.id) return
  savingAvatar.value = true
  try {
    const seed = Math.random().toString(36).substring(2, 10)
    const db = SupabaseClient.getInstance().getDB()
    const { error } = await db.from('usuarios').update({ avatar_seed: seed }).eq('id', authStore.user.id)
    if (error) {
      alert('Error en base de datos al guardar avatar: ' + error.message)
      return
    }
    if (authStore.user) {
      authStore.user.avatar_seed = seed
    }
  } catch (e) {
    alert('Error al guardar avatar: ' + e.message)
  } finally {
    savingAvatar.value = false
  }
}

async function handleSavePerfil() {
  if (diasRestantes.value > 0) return
  savingPerfil.value = true; perfilError.value = ''; perfilSuccess.value = ''
  try {
    const db = SupabaseClient.getInstance().getDB()
    const nowTimestamp = new Date().toISOString()
    const { error } = await db.from('usuarios').update({
      nombre: form.nombre,
      apellidos: form.apellidos,
      nickname: form.nickname,
      last_profile_update: nowTimestamp
    }).eq('id', authStore.user.id)
    
    if (error) throw error

    perfilSuccess.value = 'Perfil actualizado correctamente.'

    //Actualizar store local
    if (authStore.user) {
      authStore.user.nombre = form.nombre
      authStore.user.apellidos = form.apellidos
      authStore.user.nickname = form.nickname
      authStore.user.last_profile_update = nowTimestamp
    }
  } catch (e) { perfilError.value = e.message } finally { savingPerfil.value = false }
}

async function handleResetPassword() {
  passError.value = ''; passSuccess.value = ''
  savingPass.value = true
  try {
    const email = authStore.user?.email
    if (!email) throw new Error("No hay email configurado.")
    const { error } = await SupabaseClient.getInstance().getAuth().resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/ajustes`,
    })
    if (error) throw error
    passSuccess.value = 'Se ha enviado un enlace seguro para restablecer tu contraseña a tu correo electrónico.'
  } catch (e) { passError.value = e.message } finally { savingPass.value = false }
}

function confirmarEliminarCuenta() { deleteError.value = ''; showConfirmDelete.value = true }

async function handleEliminarCuenta() {
  deleteError.value = ''
  deletingAccount.value = true
  try {
    await authStore.deleteAccount()
    router.push('/')
  } catch (e) {
    deleteError.value = e.message || 'Error al eliminar la cuenta'
  } finally {
    deletingAccount.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px); display: flex; align-items: center;
  justify-content: center; z-index: 1000;
}
.modal-box { animation: fadeIn 0.2s ease; }
@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
</style>
