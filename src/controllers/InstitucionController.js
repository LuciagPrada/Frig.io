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

//InstitucionController: gestión de múltiples instituciones por usuario ¡
import { ref } from 'vue'
import InstitucionRepository from '../repositories/InstitucionRepository.js'
import SolicitudInstitucionRepository from '../repositories/SolicitudInstitucionRepository.js'
import PartituraRepository from '../repositories/PartituraRepository.js'
import { useAuthStore } from '../stores/authStore.js'

export function useInstitucionController() {
  const instituciones = ref([])
  const loading = ref(false)
  const error = ref(null)

  function getUserId() {
    const store = useAuthStore()
    return store.user?.id
  }

  async function cargar() {
    loading.value = true
    error.value = null
    try {
      const uid = getUserId()
      if (!uid) return
      instituciones.value = await InstitucionRepository.getAllByUsuario(uid)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  //Crea una institución nueva y recarga
  async function crear(nombre) {
    loading.value = true
    error.value = null
    try {
      const uid = getUserId()
      if (!uid) throw new Error('No hay usuario autenticado')
      const id = await InstitucionRepository.create(nombre, uid)
      await cargar()
      return id
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function unirse(instId) {
    loading.value = true
    error.value = null
    try {
      const uid = getUserId()
      if (!uid) throw new Error('No hay usuario autenticado')
      await SolicitudInstitucionRepository.crear(instId, uid)
      return true
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function invitarMiembro(instId, email) {
    const usuarioId = await InstitucionRepository.buscarUsuarioPorEmail(email)
    if (!usuarioId) throw new Error('No se encontró ningún usuario con ese email.')
    await InstitucionRepository.addMiembro(instId, usuarioId)
    await cargar()
  }

  //obtiene las partituras institucionales
  async function getBibliotecaInstitucion(instId) {
    return PartituraRepository.getPartiturasByInstitucion(instId)
  }

  return {
    instituciones,
    cargar,
    crear,
    unirse,
    invitarMiembro,
    getBibliotecaInstitucion,
    loading,
    error,
  }
}
