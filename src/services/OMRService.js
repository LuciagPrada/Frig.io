// OMRService, conecta con la API Python de inferencia

class OMRServiceClass {
  constructor() {
    const rawUrl = import.meta.env.VITE_OMR_API_URL || 'http://localhost:8000'
    this.apiUrl = rawUrl.replace(/\/+$/, '')
  }

  //Transcribe una imagen de partitura enviándola al servidor
  async transcribir(imageFile, onStatusUpdate = () => { }) {
    onStatusUpdate('Enviando imagen al servidor OMR...', 0)

    const formData = new FormData()
    formData.append('file', imageFile)

    let response
    try {
      response = await fetch(`${this.apiUrl}/transcribe-stream`, {
        method: 'POST',
        body: formData,
      })
    } catch (error) {
      console.error('[OMRService]', error)
      throw new Error(`No se pudo conectar con el servidor Jupyter en ${this.apiUrl}. Asegúrate de que la API esté corriendo.`)
    }

    //Compatibilidad durante despliegues graduales: si el servidor todavía no
    //incluye progreso, se usa el endpoint JSON anterior.
    if (response.status === 404 || response.status === 405) {
      onStatusUpdate('Analizando imagen con el modelo OMR...', 2)
      response = await fetch(`${this.apiUrl}/transcribe`, {
        method: 'POST',
        body: formData,
      })
      return await this._readJsonResponse(response)
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      const message = errData.detail || `Error en servidor OMR: ${response.status} ${response.statusText}`
      console.error('[OMRService]', message)
      throw new Error(message)
    }

    const contentType = response.headers.get('content-type') || ''
    if (!response.body || !contentType.includes('application/x-ndjson')) {
      return await this._readJsonResponse(response)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let result = null

    const processLine = (line) => {
      if (!line.trim()) return
      let event
      try {
        event = JSON.parse(line)
      } catch {
        throw new Error('El servidor OMR devolvió un evento de progreso inválido.')
      }

      if (event.type === 'progress') {
        onStatusUpdate(event.message || 'Procesando partitura...', event.step)
      } else if (event.type === 'result') {
        result = event.data
      } else if (event.type === 'error') {
        throw new Error(event.message || 'Error durante la transcripción OMR.')
      }
    }

    while (true) {
      const { value, done } = await reader.read()
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done })
      const lines = buffer.split(/\r?\n/)
      buffer = lines.pop() || ''
      lines.forEach(processLine)
      if (done) break
    }
    processLine(buffer)

    if (!result) throw new Error('La transcripción terminó sin devolver un resultado.')
    return this._normalizeResult(result)
  }

  async _readJsonResponse(response) {
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.detail || `Error en servidor OMR: ${response.status} ${response.statusText}`)
    }
    return this._normalizeResult(await response.json())
  }

  _normalizeResult(result) {
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
