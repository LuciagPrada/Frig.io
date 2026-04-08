//Utils, validadores y formateadores de archivo
export const MAX_FILE_SIZE_MB = 10
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg']

export function validateImageFile(file) {
  if (!file) return { valid: false, error: 'No se ha seleccionado ningún archivo.' }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Formato no admitido. Solo se permiten imágenes JPEG y PNG.' }
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
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9)
}
