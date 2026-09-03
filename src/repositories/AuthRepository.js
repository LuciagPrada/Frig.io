//AuthRepository
import SupabaseClient from './SupabaseClient.js'

const auth = SupabaseClient.getInstance().getAuth()

//Espera (con reintentos cortos) a que el trigger handle_new_user haya
//creado la fila en public.usuarios, en vez de una espera fija arbitraria.
async function waitForUsuarioRow(db, uid, attempts = 6, delayMs = 300) {
  for (let i = 0; i < attempts; i++) {
    const { data } = await db.from('usuarios').select('id').eq('id', uid).maybeSingle()
    if (data) return true
    await new Promise(r => setTimeout(r, delayMs))
  }
  return false
}

const AuthRepository = {
  async login(email, pass) {
    const { data, error } = await auth.signInWithPassword({ email, password: pass })
    if (error) throw error
    return data
  },

  async register(datos) {
    //Registrar en Auth y pasar los metadatos del perfil para que el trigger los recoja automáticamente en public.usuarios
    //trigger handle_new_user se encarga de insert
    const { data, error } = await auth.signUp({
      email: datos.email,
      password: datos.password,
      options: {
        data: {
          nombre: datos.nombre || '',
          apellidos: datos.apellidos || '',
          nickname: datos.nickname || '',
        }
      }
    })
    if (error) throw error

    //El trigger handle_new_user inserta la fila en public.usuarios automáticamente
    if (data.user) {
      try {
        const db = SupabaseClient.getInstance().getDB()
        const initialSeed = Math.random().toString(36).substring(2, 10)
        const exists = await waitForUsuarioRow(db, data.user.id)
        if (!exists) {
          console.error('[AuthRepository] La fila de usuarios no se creó a tiempo; no se asignó avatar inicial.')
        } else {
          const { error: seedError } = await db
            .from('usuarios')
            .update({ avatar_seed: initialSeed })
            .eq('id', data.user.id)
          if (seedError) console.error('[AuthRepository] No se pudo asignar avatar inicial:', seedError)
        }
      } catch (e) {
        console.error('[AuthRepository] Error asignando avatar inicial:', e)
      }
    }

    return data
  },

  async logout() {
    const { error } = await auth.signOut()
    if (error) throw error
  },

  async deleteAccount() {
    const db = SupabaseClient.getInstance().getDB()
    const { error } = await db.rpc('eliminar_cuenta')
    if (error) throw error
  },

  async changeEmail({ currentEmail, newEmail, password, redirectTo }) {
    // Una sesión abierta no basta para una operación sensible: se vuelve a
    // comprobar la contraseña antes de solicitar el cambio a Supabase Auth.
    const { data: sessionData, error: sessionError } = await auth.getSession()
    if (sessionError) throw sessionError

    const expectedUserId = sessionData.session?.user?.id
    if (!expectedUserId) throw new Error('Debes iniciar sesión de nuevo para cambiar el correo.')

    const { data: reauthData, error: reauthError } = await auth.signInWithPassword({
      email: currentEmail,
      password,
    })
    if (reauthError) throw reauthError
    if (reauthData.user?.id !== expectedUserId) {
      throw new Error('No se pudo verificar la identidad de la sesión actual.')
    }

    const { data, error } = await auth.updateUser(
      { email: newEmail },
      { emailRedirectTo: redirectTo }
    )
    if (error) throw error
    return data
  },

  async getSession() {
    const { data } = await auth.getSession()
    return data.session
  },

  onAuthStateChange(callback) {
    return auth.onAuthStateChange(callback)
  },
}

export default AuthRepository
