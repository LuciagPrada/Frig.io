<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal modal-sm" style="padding:0">
      <div class="auth-modal-header" style="padding:1.5rem 2rem 0">
        <h2 style="margin:0 0 0.25rem;font-size:1.25rem;font-weight:700">Accede a tu cuenta</h2>
        <p style="color:var(--color-text-secondary);font-size:0.875rem;margin:0 0 1.25rem">
          Inicia sesión o crea una cuenta para guardar tus partituras
        </p>
        <div class="tabs">
          <button class="tab-btn" :class="{ active: tab === 'login' }" @click="tab = 'login'">Iniciar sesión</button>
          <button class="tab-btn" :class="{ active: tab === 'register' }" @click="tab = 'register'">Registrarse</button>
        </div>
      </div>

      <div class="auth-modal-body" style="padding:1.5rem 2rem 2rem">
        <!-- alerta error -->
        <div v-if="error" class="alert alert-error" style="display:flex;align-items:center;gap:0.5rem">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          {{ error }}
        </div>

        <form v-if="tab === 'login'" @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="form.email" type="email" class="form-input" placeholder="tu@email.com" required autocomplete="email"/>
          </div>
          <div class="form-group">
            <label class="form-label">Contraseña</label>
            <div class="password-wrap">
              <input v-model="form.password" :type="showPassLogin ? 'text' : 'password'" class="form-input" placeholder="••••••••" required autocomplete="current-password"/>
              <button type="button" class="password-toggle" :title="showPassLogin ? 'Ocultar contraseña' : 'Mostrar contraseña'" @click="showPassLogin = !showPassLogin">
                <svg v-if="showPassLogin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
            <span v-if="loading" class="spinner spinner-sm"/>
            {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
          </button>
        </form>

        <form v-else @submit.prevent="handleRegister">
          <div class="auth-name-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
            <div class="form-group">
              <label class="form-label">Nombre</label>
              <input v-model="form.nombre" type="text" class="form-input" placeholder="Tu nombre" required/>
            </div>
            <div class="form-group">
              <label class="form-label">Apellidos</label>
              <input v-model="form.apellidos" type="text" class="form-input" placeholder="Tus apellidos" required/>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Nickname</label>
            <input v-model="form.nickname" type="text" class="form-input" placeholder="@tunickname" required/>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="form.email" type="email" class="form-input" placeholder="tu@email.com" required autocomplete="email"/>
          </div>
          <div class="form-group">
            <label class="form-label">Contraseña</label>
            <div class="password-wrap">
              <input v-model="form.password" :type="showPassRegister ? 'text' : 'password'" class="form-input" placeholder="Mínimo 8 caracteres" required minlength="8" autocomplete="new-password"/>
              <button type="button" class="password-toggle" :title="showPassRegister ? 'Ocultar contraseña' : 'Mostrar contraseña'" @click="showPassRegister = !showPassRegister">
                <svg v-if="showPassRegister" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
            <span v-if="loading" class="spinner spinner-sm"/>
            {{ loading ? 'Creando cuenta...' : 'Registrarse' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'

const props = defineProps({ initialTab: { type: String, default: 'login' } })
const emit = defineEmits(['close'])

const authStore = useAuthStore()
const router = useRouter()
const tab = ref(props.initialTab)
const loading = ref(false)
const error = ref('')
const showPassLogin = ref(false)
const showPassRegister = ref(false)

const form = reactive({
  email: '', password: '', nombre: '', apellidos: '', nickname: '',
})

watch(() => props.initialTab, v => { tab.value = v })

async function handleLogin() {
  loading.value = true; error.value = ''
  try {
    await authStore.login(form.email, form.password)
    emit('close')
    router.push('/dashboard')
  } catch (e) {
    error.value = e.message || 'Error al iniciar sesión. Comprueba tus credenciales.'
  } finally { loading.value = false }
}

async function handleRegister() {
  loading.value = true; error.value = ''
  try {
    await authStore.register({ email: form.email, password: form.password, nombre: form.nombre, apellidos: form.apellidos, nickname: form.nickname })
    emit('close')
    router.push('/dashboard')
  } catch (e) {
    error.value = e.message || 'Error al crear la cuenta.'
  } finally { loading.value = false }
}
</script>

<style scoped>
.password-wrap { position: relative; }
.password-wrap .form-input { padding-right: 2.75rem; }
.password-toggle {
  position: absolute;
  right: 0.6rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: var(--color-text-secondary);
}
.password-toggle:hover { color: var(--color-text-primary); }

@media (max-width: 480px) {
  .auth-modal-header { padding: 1.25rem 1.25rem 0 !important; }
  .auth-modal-body { padding: 1.25rem !important; }
  .auth-name-grid { grid-template-columns: 1fr !important; }
}
</style>
