//SolicitudInstitucionRepository: solicitudes de ingreso a una institución.
//Sustituye la auto-unión directa en miembros_institucion (la RLS ya no la
//permite): el usuario solicita y el administrador acepta o rechaza desde la
//campana de notificaciones.
import SupabaseClient from './SupabaseClient.js'

const getDB = () => SupabaseClient.getInstance().getDB()

const SolicitudInstitucionRepository = {
  //Crea una solicitud pendiente. Un índice único parcial impide duplicarla
  //mientras la anterior siga pendiente.
  async crear(idInstitucion, userId) {
    const db = getDB()
    const { error } = await db.from('solicitudes_institucion').insert({
      id_institucion: idInstitucion,
      id_usuario: userId,
    })
    if (error) {
      //23505 = violación de unicidad: ya hay una solicitud pendiente igual
      if (error.code === '23505') throw new Error('Ya tienes una solicitud pendiente para esta institución.')
      throw error
    }
    return true
  },

  //Solicitudes pendientes de las instituciones que administra el usuario
  //autenticado, con el nombre de la institución y del solicitante incluidos.
  async getPendientesAdmin() {
    const db = getDB()
    const { data, error } = await db.rpc('get_solicitudes_pendientes_admin')
    if (error) {
      console.error('Error getSolicitudesPendientesAdmin:', error)
      return []
    }
    return data || []
  },

  //Acepta o rechaza una solicitud. La función valida en BD que quien llama es
  //el administrador y, si se acepta, inserta el miembro en la misma transacción.
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
