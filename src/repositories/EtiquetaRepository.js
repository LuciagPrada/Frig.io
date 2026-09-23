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
