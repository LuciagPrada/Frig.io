//PartituraController: gestiona subida, transcripción y guardado
import { ref } from 'vue'
import PartituraRepository from '../repositories/PartituraRepository.js'
import OMRService from '../services/OMRService.js'
import { validateImageFile, generateId } from '../utils/validators.js'

export function usePartituraController(userId) {
  const loading = ref(false)
  const error = ref(null)

  async function subirYTranscribir(file, onStatusUpdate) {
    const validation = validateImageFile(file)
    if (!validation.valid) throw new Error(validation.error)

    loading.value = true
    error.value = null

    try {
      const fileId = generateId()
      const imagePath = `${userId}/${fileId}/${file.name}`

      //1.Subir imagen a Supabase Storage
      onStatusUpdate?.('Subiendo imagen...')
      const imageUrl = await PartituraRepository.uploadImage(file, imagePath)

      //2.Llamar al OMR
      const omr = OMRService.getInstance()
      const result = await omr.transcribir(file, onStatusUpdate)

      //3.Verificar fiabilidad
      if (result.fiabilidad < 0.85) {
        throw new Error(
          `La fiabilidad de la transcripción es baja (${Math.round(result.fiabilidad * 100)}%). Por favor, verifique la calidad de la imagen.`
        )
      }

      //4.Subir MusicXML a Storage
      onStatusUpdate?.('Guardando MusicXML...')
      const xmlPath = `${userId}/${fileId}/score.xml`
      const xmlUrl = await PartituraRepository.uploadMusicXML(result.musicxml, xmlPath)

      //5.Guardar partitura en BD
      onStatusUpdate?.('Guardando en tu biblioteca...')
      const partituraId = generateId()
      await PartituraRepository.setPartitura(partituraId, {
        id_partitura: partituraId,
        id_propietario: userId,
        titulo: result.metadatos.titulo || 'Sin título',
        autor: result.metadatos.autor || 'Desconocido',
        instrumento: result.metadatos.instrumento || '',
        genero: result.metadatos.genero || '',
        ano_original: result.metadatos.anoOriginal || null,
        fecha_subida: new Date().toISOString(),
        es_publica: false,
      })

      //6.Guardar transcripción
      await PartituraRepository.setPartitura(`transcripcion_${partituraId}`, null) // replaced below
      const db = (await import('../repositories/SupabaseClient.js')).default.getInstance().getDB()
      await db.from('transcripciones').insert({
        id_partitura: partituraId,
        ruta_imagen: imageUrl,
        ruta_musicxml: xmlUrl,
        porcentaje_fiabilidad: result.fiabilidad,
        musicxml_content: result.musicxml,
      })

      return {
        partituraId,
        musicxml: result.musicxml,
        fiabilidad: result.fiabilidad,
        metadatos: result.metadatos,
        imageUrl,
      }
    } finally {
      loading.value = false
    }
  }

  async function obtenerBiblioteca() {
    return PartituraRepository.getPartiturasPorUsuario(userId)
  }

  async function eliminar(id) {
    return PartituraRepository.deletePartitura(id)
  }

  async function actualizarMetadatos(id, datos) {
    return PartituraRepository.updateMetadatos(id, datos)
  }

  return { loading, error, subirYTranscribir, obtenerBiblioteca, eliminar, actualizarMetadatos }
}
