//ReporteController: reportes de partituras y su lectura por el propietario
import { ref } from 'vue'
import ReporteRepository from '../repositories/ReporteRepository.js'

export function useReporteController() {
  const loading = ref(false)
  const error = ref(null)

  async function crear(idPartitura, motivo, comentario = '') {
    loading.value = true
    error.value = null
    try {
      return await ReporteRepository.crear(idPartitura, motivo, comentario)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function getReportesPropietario() {
    loading.value = true
    error.value = null
    try {
      return await ReporteRepository.getReportesPropietario()
    } catch (e) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  async function marcarLeido(idReporte) {
    loading.value = true
    error.value = null
    try {
      return await ReporteRepository.marcarLeido(idReporte)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return { loading, error, crear, getReportesPropietario, marcarLeido }
}
