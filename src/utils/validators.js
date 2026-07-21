//Utils, validadores y formateadores de archivo
export const MAX_FILE_SIZE_MB = 10
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']

export function validateImageFile(file) {
  if (!file) return { valid: false, error: 'No se ha seleccionado ningún archivo.' }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Formato no admitido. Se permiten imágenes (JPEG, PNG) y archivos PDF.' }
  }
  const sizeMB = file.size / (1024 * 1024)
  if (sizeMB > MAX_FILE_SIZE_MB) {
    return { valid: false, error: `El archivo supera el límite de ${MAX_FILE_SIZE_MB} MB.` }
  }
  return { valid: true }
}

export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function generateId() {
  if (crypto.randomUUID) return crypto.randomUUID()
  //Fallback compatible con el formato UUID v4 (las columnas de la BD son UUID).
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export function formatTimeAgo(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return `Hace ${diffInSeconds} s`
  const minutes = Math.floor(diffInSeconds / 60)
  if (minutes < 60) return `Hace ${minutes} m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `Hace ${days} días`
  const months = Math.floor(days / 30)
  if (months < 12) return `Hace ${months} meses`
  const years = Math.floor(days / 365)
  return `Hace ${years} años`
}
