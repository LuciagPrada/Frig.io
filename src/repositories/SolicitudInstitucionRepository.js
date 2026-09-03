//SolicitudInstitucionRepository
import SupabaseClient from './SupabaseClient.js'

const getDB = () => SupabaseClient.getInstance().getDB()

const SolicitudInstitucionRepository = {
  async crear(idInstitucion, userId) {
    const db = getDB()
    const { error } = await db.from('solicitudes_institucion').insert({
      id_institucion: idInstitucion,
      id_usuario: userId,
    })
    if (error) {
      //23505=violación de unicidad: ya hay una solicitud pendiente igual
      if (error.code === '23505') throw new Error('Ya tienes una solicitud pendiente para esta institución.')
      throw error
    }
    return true
  },

  async getPendientesAdmin() {
    const db = getDB()
    const { data, error } = await db.rpc('get_solicitudes_pendientes_admin')
    if (error) {
      console.error('Error getSolicitudesPendientesAdmin:', error)
      return []
    }
    return data || []
  },
  async resolver(idSolicitud, aceptar) {
    const db = getDB()
    const { error } = await db.rpc('resolver_solicitud_institucion', {
      p_solicitud_id: idSolicitud,
      p_aceptar: aceptar,
    })
    if (error) throw error
    return true
  },
}

export default SolicitudInstitucionRepository
