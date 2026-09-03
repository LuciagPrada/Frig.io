//Pinia store, estado global de autenticación. Pinia siempre usa singleton
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import AuthRepository from '../repositories/AuthRepository.js'
import SupabaseClient from '../repositories/SupabaseClient.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  let authChangeVersion = 0

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.rol === 'ADMINISTRADOR')

  async function init() {
    loading.value = true
    const session = await AuthRepository.getSession()
    if (session?.user) {
      await _loadProfile(session.user.id, session.user.email)
    }
    loading.value = false

    //Escuchar cambios de auth
    AuthRepository.onAuthStateChange((_event, session) => {
      const version = ++authChangeVersion

      if (!session?.user) {
        user.value = null
        return
      }

      const { id, email } = session.user

      //Supabase ejecuta este callback dentro del lock exclusivo de Auth.
      //Consultar la base de datos y esperar aquí intenta adquirir el mismo lock
      //y puede bloquear indefinidamente las peticiones posteriores. Diferimos la
      //carga hasta que el callback haya terminado y el lock se haya liberado.
      setTimeout(async () => {
        try {
          const profile = await _getProfile(id, email)
          if (version === authChangeVersion) user.value = profile
        } catch (e) {
          console.error('[AuthStore] No se pudo actualizar el perfil de sesión:', e)
        }
      }, 0)
    })
  }

  //El email no se lee de la tabla usuarios (columna restringida por RLS/privilegios),
  //se toma de la sesión de Supabase Auth, que ya lo incluye.
  async function _getProfile(uid, email) {
    const db = SupabaseClient.getInstance().getDB()
    const { data } = await db
      .from('usuarios')
      .select('id, nombre, apellidos, nickname, rol, avatar_seed, avatar_url, last_profile_update, created_at')
      .eq('id', uid)
      .single()
    return data ? { ...data, email } : { id: uid, email }
  }

  async function _loadProfile(uid, email) {
    user.value = await _getProfile(uid, email)
  }

  async function login(email, pass) {
    const data = await AuthRepository.login(email, pass)
    if (data?.user) await _loadProfile(data.user.id, data.user.email)
  }

  async function register(datos) {
    const data = await AuthRepository.register(datos)
    if (data?.user) await _loadProfile(data.user.id, data.user.email)
  }

  async function logout() {
    await AuthRepository.logout()
    user.value = null
  }

  async function deleteAccount() {
    await AuthRepository.deleteAccount()
    try { await AuthRepository.logout() } catch (e) { /* cuenta ya borrada, seguir igualmente */ }
    user.value = null
  }

  return { user, loading, isAuthenticated, isAdmin, init, login, register, logout, deleteAccount }
})
