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
