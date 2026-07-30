//EtiquetaRepository: etiquetas privadas por usuario sobre partituras.
//Cada usuario etiqueta libremente cualquier partitura que pueda ver (propia,
//pública o institucional siendo miembro) y solo él ve sus propias etiquetas:
//la RLS de etiquetas_partitura filtra siempre por auth.uid().
import SupabaseClient from './SupabaseClient.js'

const getDB = () => SupabaseClient.getInstance().getDB()

const EtiquetaRepository = {
  //Todas las etiquetas del usuario (sobre cualquier partitura). Se pide una
  //sola vez al cargar cada vista y se cruza en cliente con las partituras
  //visibles para construir las facetas del filtro.
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

  //Añade una etiqueta. La RLS comprueba además que el usuario puede ver la partitura.
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

  //Quita una etiqueta concreta (borrado por clave primaria compuesta)
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
