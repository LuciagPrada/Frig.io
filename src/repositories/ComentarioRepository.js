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
}

export default ComentarioRepository
