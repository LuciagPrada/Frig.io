//EtiquetaRepository: etiquetas privadas por usuario sobre partituras
import SupabaseClient from './SupabaseClient.js'

const getDB = () => SupabaseClient.getInstance().getDB()

const EtiquetaRepository = {
  async getMisEtiquetas(userId) {
    if (!userId) return []
    const db = getDB()
    const { data, error } = await db
      .from('etiquetas_partitura')
      .select('id_partitura, etiqueta')
      .eq('id_usuario', userId)
    if (error) {
      console.error('Error getMisEtiquetas:', error)
      return []
    }
    return data || []
  },

  //Etiquetas que el usuario ha puesto sobre una partitura concreta
  async getMisEtiquetasDePartitura(idPartitura, userId) {
    if (!userId) return []
    const db = getDB()
    const { data, error } = await db
      .from('etiquetas_partitura')
      .select('etiqueta')
      .eq('id_usuario', userId)
      .eq('id_partitura', idPartitura)
    if (error) {
      console.error('Error getMisEtiquetasDePartitura:', error)
      return []
    }
    return (data || []).map(e => e.etiqueta)
  },

  async añadir(idPartitura, etiqueta, userId) {
    const db = getDB()
    const { error } = await db.from('etiquetas_partitura').insert({
      id_usuario: userId,
      id_partitura: idPartitura,
      etiqueta,
    })
    if (error) throw error
    return true
  },

  async quitar(idPartitura, etiqueta, userId) {
    const db = getDB()
    const { error } = await db
      .from('etiquetas_partitura')
      .delete()
      .eq('id_usuario', userId)
      .eq('id_partitura', idPartitura)
      .eq('etiqueta', etiqueta)
    if (error) throw error
    return true
  },
}

export default EtiquetaRepository
