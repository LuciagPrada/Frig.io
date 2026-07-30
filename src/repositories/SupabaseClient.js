//SupabaseClient, singleton

import { createClient } from '@supabase/supabase-js'

//Tiempo máximo que esperamos a conseguir el lock antes de seguir sin él.
const LOCK_TIMEOUT_MS = 8000

//supabase-js v2 serializa el refresco de sesión con la Web Locks API; si un lock
//se queda sin liberar (pestaña/callback colgado) la app deja de cargar datos hasta
//recargar, así que acotamos la espera y continuamos igualmente.
async function lockConTimeout(name, _acquireTimeout, fn) {
  if (typeof navigator === 'undefined' || !navigator.locks?.request) return await fn()

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), LOCK_TIMEOUT_MS)
  try {
    return await navigator.locks.request(
      name,
      { mode: 'exclusive', signal: controller.signal },
      async () => {
        //Ya tenemos el lock: el timeout solo cubre la espera, no la operación.
        clearTimeout(timer)
        return await fn()
      }
    )
  } catch (e) {
    if (e?.name === 'AbortError') return await fn()
    throw e
  } finally {
    clearTimeout(timer)
  }
}

class SupabaseClientSingleton {
  constructor() {
    this.conexion = createClient(
      import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
      import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key',
      { auth: { lock: lockConTimeout } }
    )
  }

  getAuth() {
    return this.conexion.auth
  }

  getDB() {
    return this.conexion
  }

  getStorage() {
    return this.conexion.storage
  }
}

//Singleton
let instance = null
const getInstance = () => {
  if (!instance) {
    instance = new SupabaseClientSingleton()
  }
  return instance
}

export default { getInstance }
