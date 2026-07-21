// OMRService, conecta con la API Python de inferencia

class OMRServiceClass {
  constructor() {
    const rawUrl = import.meta.env.VITE_OMR_API_URL || 'http://localhost:8000'
    this.apiUrl = rawUrl.replace(/\/+$/, '')
  }

  //Transcribe una imagen de partitura enviándola al servidor
  async transcribir(imageFile, onStatusUpdate = () => { }) {
    onStatusUpdate('Enviando imagen al servidor Jupyter...')

    const formData = new FormData()
    formData.append('file', imageFile)

    //Solo el fetch en sí puede fallar por "no hay conexión"; una vez llega
    //respuesta (aunque sea un error 4xx/5xx), se propaga el mensaje real del
    //backend en vez de sustituirlo por el genérico de "no se pudo conectar".
    let response
    try {
      response = await fetch(`${this.apiUrl}/transcribe`, {
        method: 'POST',
        body: formData,
      })
    } catch (error) {
      console.error('[OMRService]', error)
      throw new Error(`No se pudo conectar con el servidor Jupyter en ${this.apiUrl}. Asegúrate de que la API esté corriendo.`)
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      const message = errData.detail || `Error en servidor OMR: ${response.status} ${response.statusText}`
      console.error('[OMRService]', message)
      throw new Error(message)
    }

    onStatusUpdate('Procesando respuesta del modelo...')
    const result = await response.json()

    if (!result.musicxml) throw new Error('Respuesta inválida del servidor OMR: falta MusicXML')

    return {
      musicxml: result.musicxml,
      fiabilidad: result.fiabilidad || 0,
      metadatos: result.metadatos || {},
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
