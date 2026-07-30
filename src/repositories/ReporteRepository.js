//ReporteRepository: reportes de partituras (copyright, robo, mala calidad, otro)
import SupabaseClient from './SupabaseClient.js'

const getDB = () => SupabaseClient.getInstance().getDB()

const ReporteRepository = {
  //Crea un reporte sobre una partitura ajena. La RLS comprueba que el usuario
  //no es el propietario y que puede ver la partitura.
  async crear(idPartitura, motivo, comentario = '') {
    const db = getDB()
    const { data: { user } } = await db.auth.getUser()
    if (!user) throw new Error('Debes iniciar sesión para reportar una partitura.')

    const { error } = await db.from('reportes_partitura').insert({
      id_partitura: idPartitura,
      id_reportante: user.id,
      motivo,
      comentario: comentario || '',
    })
    if (error) throw error
    return true
  },

  //Reportes sobre las partituras del usuario autenticado (incluye titulo_partitura)
  async getReportesPropietario() {
    const db = getDB()
    const { data, error } = await db.rpc('get_reportes_propietario')
    if (error) {
      console.error('Error getReportesPropietario:', error)
      return []
    }
    return data || []
  },

  //Marca un reporte como leído (solo el propietario de la partitura puede)
  async marcarLeido(idReporte) {
    const db = getDB()
    const { error } = await db
      .from('reportes_partitura')
      .update({ leido: true })
      .eq('id_reporte', idReporte)
    if (error) throw error
    return true
  },
}

export default ReporteRepository
