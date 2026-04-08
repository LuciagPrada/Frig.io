//AuthRepository
import SupabaseClient from './SupabaseClient.js'

const auth = SupabaseClient.getInstance().getAuth()

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
        //Esperamos a que el trigger haya ejecutado
        await new Promise(r => setTimeout(r, 800))
        await db
          .from('usuarios')
          .update({ avatar_seed: initialSeed })
          .eq('id', data.user.id)
      } catch (_) { }
    }

    return data
  },

  async logout() {
    const { error } = await auth.signOut()
    if (error) throw error
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
