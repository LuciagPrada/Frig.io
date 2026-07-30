//EtiquetaController: etiquetas privadas del usuario sobre partituras
import { ref } from 'vue'
import EtiquetaRepository from '../repositories/EtiquetaRepository.js'

export function useEtiquetaController() {
  const loading = ref(false)
  const error = ref(null)

  async function getMisEtiquetas(userId) {
    loading.value = true
    error.value = null
    try {
      return await EtiquetaRepository.getMisEtiquetas(userId)
    } catch (e) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  async function getMisEtiquetasDePartitura(idPartitura, userId) {
    loading.value = true
    error.value = null
    try {
      return await EtiquetaRepository.getMisEtiquetasDePartitura(idPartitura, userId)
    } catch (e) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  async function añadir(idPartitura, etiqueta, userId) {
    loading.value = true
    error.value = null
    try {
      return await EtiquetaRepository.añadir(idPartitura, etiqueta, userId)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function quitar(idPartitura, etiqueta, userId) {
    loading.value = true
    error.value = null
    try {
      return await EtiquetaRepository.quitar(idPartitura, etiqueta, userId)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return { loading, error, getMisEtiquetas, getMisEtiquetasDePartitura, añadir, quitar }
}
