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
