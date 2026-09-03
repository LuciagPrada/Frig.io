//InstitucionController: gestión de múltiples instituciones por usuario ¡
import { ref } from 'vue'
import InstitucionRepository from '../repositories/InstitucionRepository.js'
import SolicitudInstitucionRepository from '../repositories/SolicitudInstitucionRepository.js'
import PartituraRepository from '../repositories/PartituraRepository.js'
import { useAuthStore } from '../stores/authStore.js'

export function useInstitucionController() {
  const instituciones = ref([])
  const loading = ref(false)
  const error = ref(null)

  function getUserId() {
    const store = useAuthStore()
    return store.user?.id
  }

  async function cargar() {
    loading.value = true
    error.value = null
    try {
      const uid = getUserId()
      if (!uid) return
      instituciones.value = await InstitucionRepository.getAllByUsuario(uid)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  //Crea una institución nueva y recarga
  async function crear(nombre) {
    loading.value = true
    error.value = null
    try {
      const uid = getUserId()
      if (!uid) throw new Error('No hay usuario autenticado')
      const id = await InstitucionRepository.create(nombre, uid)
      await cargar()
      return id
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function unirse(instId) {
    loading.value = true
    error.value = null
    try {
      const uid = getUserId()
      if (!uid) throw new Error('No hay usuario autenticado')
      await SolicitudInstitucionRepository.crear(instId, uid)
      return true
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function invitarMiembro(instId, email) {
    const usuarioId = await InstitucionRepository.buscarUsuarioPorEmail(email)
    if (!usuarioId) throw new Error('No se encontró ningún usuario con ese email.')
    await InstitucionRepository.addMiembro(instId, usuarioId)
    await cargar()
  }

  //obtiene las partituras institucionales
  async function getBibliotecaInstitucion(instId) {
    return PartituraRepository.getPartiturasByInstitucion(instId)
  }

  return {
    instituciones,
    cargar,
    crear,
    unirse,
    invitarMiembro,
    getBibliotecaInstitucion,
    loading,
    error,
  }
}
