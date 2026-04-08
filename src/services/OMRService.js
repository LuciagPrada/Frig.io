// OMRService, conecta con la API Python de inferencia

class OMRServiceClass {
  constructor() {
    this.apiUrl = import.meta.env.VITE_OMR_API_URL || 'http://localhost:8000'
  }

  //Transcribe una imagen de partitura enviándola al servidor
  async transcribir(imageFile, onStatusUpdate = () => { }) {
    onStatusUpdate('Enviando imagen al servidor Jupyter...')

    const formData = new FormData()
    formData.append('file', imageFile)

    try {
      const response = await fetch(`${this.apiUrl}/transcribe`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || `Error en servidor OMR: ${response.status} ${response.statusText}`)
      }

      onStatusUpdate('Procesando respuesta del modelo...')
      const result = await response.json()

      if (!result.musicxml) throw new Error('Respuesta inválida del servidor OMR: falta MusicXML')

      return {
        musicxml: result.musicxml,
        fiabilidad: result.fiabilidad || 0,
        metadatos: result.metadatos || {},
      }
    } catch (error) {
      console.error('[OMRService]', error)
      throw new Error(`No se pudo conectar con el servidor Jupyter en ${this.apiUrl}. Asegúrate de que API esté corriendo.`)
    }
  }
}

// Singleton
let omrInstance = null
export const OMRService = {
  getInstance() {
    if (!omrInstance) omrInstance = new OMRServiceClass()
    return omrInstance
  },
}

export default OMRService
