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

//ReporteController: reportes de partituras y su lectura por el propietario
import { ref } from 'vue'
import ReporteRepository from '../repositories/ReporteRepository.js'

export function useReporteController() {
  const loading = ref(false)
  const error = ref(null)

  async function crear(idPartitura, motivo, comentario = '') {
    loading.value = true
    error.value = null
    try {
      return await ReporteRepository.crear(idPartitura, motivo, comentario)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function getReportesPropietario() {
    loading.value = true
    error.value = null
    try {
      return await ReporteRepository.getReportesPropietario()
    } catch (e) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  async function marcarLeido(idReporte) {
    loading.value = true
    error.value = null
    try {
      return await ReporteRepository.marcarLeido(idReporte)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return { loading, error, crear, getReportesPropietario, marcarLeido }
}
