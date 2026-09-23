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

//ComunidadController:feed público, búsqueda, likes
import { ref } from 'vue'
import PartituraRepository from '../repositories/PartituraRepository.js'
import { useAuthStore } from '../stores/authStore.js'

export function useComunidadController() {
  const partituras = ref([])
  const loading = ref(false)
  const userLikes = ref(new Set())

  function getUserId() {
    return useAuthStore().user?.id
  }

  async function getFeed(query = '') {
    loading.value = true
    try {
      const data = await PartituraRepository.getPublicFeed(query)
      partituras.value = data
    } finally {
      loading.value = false
    }
  }

  async function loadUserLikes() {
    const userId = getUserId()
    if (!userId) return
    const likes = await PartituraRepository.getLikesByUser(userId)
    userLikes.value = new Set(likes)
  }

  async function toggleLike(partituraId) {
    const userId = getUserId()
    if (!userId) return
    const liked = await PartituraRepository.toggleLike(partituraId, userId)
    if (liked) {
      userLikes.value.add(partituraId)
    } else {
      userLikes.value.delete(partituraId)
    }
    return liked
  }

  function hasLike(partituraId) {
    return userLikes.value.has(partituraId)
  }

  return { partituras, loading, userLikes, getFeed, loadUserLikes, toggleLike, hasLike }
}
