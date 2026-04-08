//Pinia store, estado global de autenticación. Pinia siempre usa singleton
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import AuthRepository from '../repositories/AuthRepository.js'
import SupabaseClient from '../repositories/SupabaseClient.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.rol === 'ADMINISTRADOR')
  const isCreadorInstitucion = computed(() => isAdmin.value)

  async function init() {
    loading.value = true
    const session = await AuthRepository.getSession()
    if (session?.user) {
      await _loadProfile(session.user.id)
    }
    loading.value = false

    //Escuchar cambios de auth
    AuthRepository.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await _loadProfile(session.user.id)
      } else {
        user.value = null
      }
    })
  }

  async function _loadProfile(uid) {
    const db = SupabaseClient.getInstance().getDB()
    const { data } = await db.from('usuarios').select('*').eq('id', uid).single()
    user.value = data || { id: uid }
  }

  async function login(email, pass) {
    await AuthRepository.login(email, pass)
  }

  async function register(datos) {
    await AuthRepository.register(datos)
  }

  async function logout() {
    await AuthRepository.logout()
    user.value = null
  }

  return { user, loading, isAuthenticated, isAdmin, isCreadorInstitucion, init, login, register, logout }
})
