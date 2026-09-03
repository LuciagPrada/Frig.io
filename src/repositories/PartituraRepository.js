//PartituraRepository
import SupabaseClient from './SupabaseClient.js'

const getDB = () => SupabaseClient.getInstance().getDB()
const getStorage = () => SupabaseClient.getInstance().getStorage()

const PartituraRepository = {
  async setPartitura(id, datos) {
    const db = getDB()
    const { error } = await db.from('partituras').upsert({ id_partitura: id, ...datos })
    if (error) throw error
    return true
  },

  async addTranscripcion(datos) {
    const db = getDB()
    const { error } = await db.from('transcripciones').insert(datos)
    if (error) throw error
    return true
  },

  async getPartiturasPorUsuario(uid) {
    const db = getDB()
    const { data, error } = await db
      .from('partituras')
      .select('*, transcripciones(*), likes(count), total_comentarios')
      .eq('id_propietario', uid)
    if (error) {
      console.error('Error getPartiturasPorUsuario:', error)
      return []
    }
    return data || []
  },

  async deletePartitura(id) {
    const db = getDB()
    const { error } = await db.from('partituras').delete().eq('id_partitura', id)
    if (error) throw error
    return true
  },

  async updateMetadatos(id, metadatos) {
    const db = getDB()
    const { data, error } = await db.from('partituras').update(metadatos).eq('id_partitura', id).select()
    if (error) throw error
    if (!data || data.length === 0) {
      alert("Error crítico: la base de datos ignoró el comando (0 filas actualizadas). Posible bloqueo por permisos RLS o la partitura no te pertenece.")
    }
    return true
  },

  async getPublicFeed(query = '') {
    const db = getDB()
    let q = db
      .from('partituras')
      .select('*, transcripciones(*), usuarios!partituras_id_propietario_fkey(nickname, nombre, avatar_url, avatar_seed), likes(count), total_comentarios')
      .eq('es_publica', true)
      .order('fecha_subida', { ascending: false })

    if (query) {
      const safeQuery = query.replace(/[,()]/g, '')
      q = q.or(`titulo.ilike.%${safeQuery}%,autor.ilike.%${safeQuery}%`)
    }
    const { data, error } = await q
    if (error) {
      console.error('Error getPublicFeed:', error)
      return []
    }
    return data || []
  },

  async getPartituraCommunityDetail(partituraId) {
    const db = getDB()
    const { data, error } = await db
      .from('partituras')
      .select('*, transcripciones(*), usuarios!partituras_id_propietario_fkey(nickname, nombre, avatar_url, avatar_seed), total_comentarios')
      .eq('id_partitura', partituraId)
      .single()
    if (error) {
      console.error('Error getPartituraCommunityDetail:', error)
      throw error
    }
    return data
  },

  async getPartituraById(partituraId) {
    const db = getDB()
    const { data, error } = await db
      .from('partituras')
      .select('*, transcripciones(*), usuarios!partituras_id_propietario_fkey(nickname, nombre, avatar_url, avatar_seed), likes(count), total_comentarios')
      .eq('id_partitura', partituraId)
      .single()
    if (error) {
      console.error('Error getPartituraById:', error)
      throw error
    }
    return data
  },

  async toggleLike(partituraId, userId) {
    const db = getDB()
    const { data: existing } = await db
      .from('likes')
      .select('*')
      .eq('id_partitura', partituraId)
      .eq('id_usuario', userId)
      .single()

    if (existing) {
      const { error } = await db
        .from('likes')
        .delete()
        .eq('id_partitura', partituraId)
        .eq('id_usuario', userId)
      if (error) throw error
      return false
    } else {
      const { error } = await db.from('likes').insert({ id_partitura: partituraId, id_usuario: userId })
      if (error) throw error
      return true
    }
  },

  async getLikesByUser(userId) {
    const db = getDB()
    const { data, error } = await db.from('likes').select('id_partitura').eq('id_usuario', userId)
    if (error) throw error
    return (data || []).map(l => l.id_partitura)
  },

  async uploadImage(file, path) {
    const storage = getStorage()
    const { data, error } = await storage
      .from('score-images')
      .upload(path, file, { contentType: file.type, upsert: true })
    if (error) throw error
    const { data: urlData } = storage.from('score-images').getPublicUrl(path)
    return urlData.publicUrl
  },

  async uploadMusicXML(content, path) {
    const storage = getStorage()
    const blob = new Blob([content], { type: 'application/xml' })
    const { error } = await storage
      .from('score-musicxml')
      .upload(path, blob, { contentType: 'application/xml', upsert: true })
    if (error) throw error
    const { data: urlData } = storage.from('score-musicxml').getPublicUrl(path)
    return urlData.publicUrl
  },

  async getPartiturasByInstitucion(instId) {
    const db = getDB()
    const { data, error } = await db
      .from('partituras')
      .select('*, transcripciones(*), likes(count), total_comentarios')
      .eq('id_institucion', instId)
      .order('fecha_subida', { ascending: false })
    if (error) {
      console.error('Error getPartiturasByInstitucion:', error)
      return []
    }
    return data || []
  },
}

export default PartituraRepository
