//SupabaseClient, singleton

import { createClient } from '@supabase/supabase-js'

class SupabaseClientSingleton {
  constructor() {
    this.conexion = createClient(
      import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
      import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'
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
