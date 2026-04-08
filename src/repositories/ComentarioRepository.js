//ComentarioRepository
import SupabaseClient from './SupabaseClient.js'

const getDB = () => SupabaseClient.getInstance().getDB()

const ComentarioRepository = {

  //Comentarios.Devuelve todos los comentarios de una partitura, con sus mensajes y autor
  async getComentarios(partituraId) {
    const db = getDB()
    const { data, error } = await db
      .from('comentarios')
      .select(`
        *,
        usuarios ( id, nickname, nombre, avatar_url, avatar_seed ),
        mensajes (
          *,
          usuarios ( id, nickname, nombre, avatar_url, avatar_seed )
        )
      `)
      .eq('id_partitura', partituraId)
      .order('created_at', { ascending: true })
    if (error) throw error
    //Ordenar respuestas dentro de cada comentario
    return (data || []).map(c => ({
      ...c,
      mensajes: (c.mensajes || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    }))
  },

  //Crea un nuevo comentario raíz sobre una partitura
  async addComentario(partituraId, userId, contenido) {
    if (!contenido?.trim()) throw new Error('El comentario no puede estar vacío.')
    const db = getDB()
    const { data, error } = await db
      .from('comentarios')
      .insert({ id_partitura: partituraId, id_usuario: userId, contenido: contenido.trim() })
      .select()
      .single()
    if (error) throw error
    return data
  },

  //Elimina un comentario. Los mensajes de respuesta se eliminan en cascada (ON DELETE CASCADE)
  async deleteComentario(comentarioId, userId) {
    const db = getDB()
    const { error } = await db
      .from('comentarios')
      .delete()
      .eq('id_comentario', comentarioId)
      .eq('id_usuario', userId)
    if (error) throw error
    return true
  },

  //Mensajes (respuestas a comentarios)

  //Crea una respuesta (mensaje) a un comentario existente
  async addMensaje(comentarioId, userId, contenido) {
    if (!contenido?.trim()) throw new Error('La respuesta no puede estar vacía.')
    const db = getDB()
    const { data, error } = await db
      .from('mensajes')
      .insert({ id_comentario: comentarioId, id_usuario: userId, contenido: contenido.trim() })
      .select()
      .single()
    if (error) throw error
    return data
  },

  //Elimina una respuesta (solo el propio usuario)
  async deleteMensaje(mensajeId, userId) {
    const db = getDB()
    const { error } = await db
      .from('mensajes')
      .delete()
      .eq('id_mensaje', mensajeId)
      .eq('id_usuario', userId)
    if (error) throw error
    return true
  },

  //Crea una respuesta (mensaje) a un comentario existente
  async addMensaje(comentarioId, userId, contenido) {
    if (!contenido?.trim()) throw new Error('La respuesta no puede estar vacía.')
    const db = getDB()
    const { data, error } = await db
      .from('mensajes')
      .insert({ id_comentario: comentarioId, id_usuario: userId, contenido: contenido.trim() })
      .select()
      .single()
    if (error) throw error
    return data
  },

  //Elimina una respuesta
  /*async deleteMensaje(mensajeId, userId) {
    const db = getDB()
    const { error } = await db
      .from('mensajes')
      .delete()
      .eq('id_mensaje', mensajeId)
      .eq('id_usuario', userId)
    if (error) throw error
    return true
  },*/

  //Cuenta el total de comentarios+mensajes de una partitura
  async countInteracciones(partituraId) {
    const db = getDB()
    const { count, error } = await db
      .from('comentarios')
      .select('id_comentario', { count: 'exact', head: true })
      .eq('id_partitura', partituraId)
    if (error) throw error
    return count || 0
  },
}

export default ComentarioRepository
