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

//EtiquetaController: etiquetas privadas del usuario sobre partituras
import { ref } from 'vue'
import EtiquetaRepository from '../repositories/EtiquetaRepository.js'

export function useEtiquetaController() {
  const loading = ref(false)
  const error = ref(null)

  async function getMisEtiquetas(userId) {
    loading.value = true
    error.value = null
    try {
      return await EtiquetaRepository.getMisEtiquetas(userId)
    } catch (e) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  async function getMisEtiquetasDePartitura(idPartitura, userId) {
    loading.value = true
    error.value = null
    try {
      return await EtiquetaRepository.getMisEtiquetasDePartitura(idPartitura, userId)
    } catch (e) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  async function añadir(idPartitura, etiqueta, userId) {
    loading.value = true
    error.value = null
    try {
      return await EtiquetaRepository.añadir(idPartitura, etiqueta, userId)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function quitar(idPartitura, etiqueta, userId) {
    loading.value = true
    error.value = null
    try {
      return await EtiquetaRepository.quitar(idPartitura, etiqueta, userId)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return { loading, error, getMisEtiquetas, getMisEtiquetasDePartitura, añadir, quitar }
}
