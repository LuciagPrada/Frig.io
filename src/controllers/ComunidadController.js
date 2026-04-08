//ComunidadController:feed público, búsqueda, likes
import { ref } from 'vue'
import PartituraRepository from '../repositories/PartituraRepository.js'

export function useComunidadController(userId) {
  const partituras = ref([])
  const loading = ref(false)
  const userLikes = ref(new Set())

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
    if (!userId) return
    const likes = await PartituraRepository.getLikesByUser(userId)
    userLikes.value = new Set(likes)
  }

  async function toggleLike(partituraId) {
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
