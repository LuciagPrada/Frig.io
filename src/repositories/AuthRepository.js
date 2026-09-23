/*
Copyright (C) 2026 Frigio
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program.  If not, see https://gnu.org.
*/

//AuthRepository
import SupabaseClient from './SupabaseClient.js'

const auth = SupabaseClient.getInstance().getAuth()

async function waitForUsuarioRow(db, uid, attempts = 6, delayMs = 300) {
  for (let i = 0; i < attempts; i++) {
    const { data } = await db.from('usuarios').select('id').eq('id', uid).maybeSingle() //Espera a que el trigger handle_new_user haya creado la fila en public.usuarios
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
