//SolicitudInstitucionController: solicitudes de ingreso a instituciones
import { ref } from 'vue'
import SolicitudInstitucionRepository from '../repositories/SolicitudInstitucionRepository.js'

export function useSolicitudInstitucionController() {
  const loading = ref(false)
  const error = ref(null)

  async function crear(idInstitucion, userId) {
    loading.value = true
    error.value = null
    try {
      return await SolicitudInstitucionRepository.crear(idInstitucion, userId)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function getPendientesAdmin() {
    loading.value = true
    error.value = null
    try {
      return await SolicitudInstitucionRepository.getPendientesAdmin()
    } catch (e) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  async function resolver(idSolicitud, aceptar) {
    loading.value = true
    error.value = null
    try {
      return await SolicitudInstitucionRepository.resolver(idSolicitud, aceptar)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return { loading, error, crear, getPendientesAdmin, resolver }
}
