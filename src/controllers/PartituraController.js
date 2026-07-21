//PartituraController: gestiona subida, transcripción y guardado
import { ref } from 'vue'
import PartituraRepository from '../repositories/PartituraRepository.js'
import OMRService from '../services/OMRService.js'
import { validateImageFile, generateId } from '../utils/validators.js'
import { useAuthStore } from '../stores/authStore.js'

export function usePartituraController() {
  const loading = ref(false)
  const error = ref(null)

  function getUserId() {
    return useAuthStore().user?.id
  }

  //1.Sube la imagen y pide la transcripción a la IA
  async function transcribirImagen(file, onStatusUpdate) {
    const validation = validateImageFile(file)
    if (!validation.valid) throw new Error(validation.error)

    loading.value = true
    error.value = null

    try {
      const fileId = generateId()
      const imagePath = `${getUserId()}/${fileId}/${file.name}`

      // 1.1. Subir imagen a Storage
      onStatusUpdate?.('Subiendo imagen...')
      const imageUrl = await PartituraRepository.uploadImage(file, imagePath)

      // 1.2. Llamar al OMR
      const omr = OMRService.getInstance()
      const result = await omr.transcribir(file, onStatusUpdate)

      return {
        fileId,
        imageUrl,
        result // { musicxml, fiabilidad, metadatos }
      }
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  //2. Guarda definitivamente la partitura con los metadatos confirmados por el usuario.
  async function guardarPartituraFinal(payload, onStatusUpdate) {
    loading.value = true
    const { fileId, imageUrl, result, metadatosEditados } = payload

    try {
      // 2.1. Subir MusicXML a Storage
      onStatusUpdate?.('Guardando música...')
      const xmlPath = `${getUserId()}/${fileId}/score.xml`
      const xmlUrl = await PartituraRepository.uploadMusicXML(result.musicxml, xmlPath)

      // 2.2. Guardar en tabla 'partituras'
      onStatusUpdate?.('Finalizando...')
      const partituraId = generateId()
      await PartituraRepository.setPartitura(partituraId, {
        id_partitura: partituraId,
        id_propietario: getUserId(),
        titulo: metadatosEditados.titulo || 'Sin título',
        autor: metadatosEditados.autor || 'Desconocido',
        instrumento: metadatosEditados.instrumento || '',
        genero: metadatosEditados.genero || '',
        ano_original: metadatosEditados.ano_original || null,
        fecha_subida: new Date().toISOString(),
        es_publica: false,
      })

      // 2.3. Guardar en tabla 'transcripciones'
      await PartituraRepository.addTranscripcion({
        id_partitura: partituraId,
        ruta_imagen: imageUrl,
        ruta_resultado: xmlUrl,
        porcentaje_fiabilidad: result.fiabilidad,
        contenido_resultado: result.musicxml,
      })

      return partituraId
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function obtenerBiblioteca() {
    return PartituraRepository.getPartiturasPorUsuario(getUserId())
  }

  async function eliminar(id) {
    return PartituraRepository.deletePartitura(id)
  }

  async function actualizarMetadatos(id, datos) {
    return PartituraRepository.updateMetadatos(id, datos)
  }

  async function obtenerFavoritos() {
    return PartituraRepository.getLikedPartituras(getUserId())
  }

  return { loading, error, transcribirImagen, guardarPartituraFinal, obtenerBiblioteca, obtenerFavoritos, eliminar, actualizarMetadatos }
}
