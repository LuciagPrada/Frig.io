//InstitucionController: gestión de múltiples instituciones por usuario ¡
import { ref } from 'vue'
import InstitucionRepository from '../repositories/InstitucionRepository.js'
import PartituraRepository from '../repositories/PartituraRepository.js'
import SupabaseClient from '../repositories/SupabaseClient.js'
import { useAuthStore } from '../stores/authStore.js'

export function useInstitucionController() {
  //Array de todas las instituciones del usuario
  const instituciones = ref([])
  const loading = ref(false)
  const error = ref(null)

  function getUserId() {
    const store = useAuthStore()
    return store.user?.id
  }

  //Carga todas las instituciones en las que participa el usuario
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

  //Une al usuario actual como miembro de una institución existente por ID
  async function unirse(instId) {
    loading.value = true
    error.value = null
    try {
      const uid = getUserId()
      if (!uid) throw new Error('No hay usuario autenticado')
      await InstitucionRepository.addMiembro(instId, uid)
      await cargar()
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  //Invita a un usuario a una institución específica buscándolo por email
  async function invitarMiembro(instId, email) {
    const db = SupabaseClient.getInstance().getDB()
    const { data: usuario, error: findError } = await db
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single()

    if (findError || !usuario) throw new Error('No se encontró ningún usuario con ese email.')
    await InstitucionRepository.addMiembro(instId, usuario.id)
    await cargar()
  }

  //obtiene las partituras institucionales
  async function getBibliotecaInstitucion(instId) {
    return PartituraRepository.getPartiturasByInstitucion(instId)
  }

  //devuelve la primera institución administrada
  const institucion = ref(null)
  const miembros = ref([])

  return {
    instituciones,
    cargar,
    crear,
    unirse,
    invitarMiembro,
    getBibliotecaInstitucion,
    loading,
    error,
    //compatibilidad con InstitucionView
    institucion,
    miembros,
  }
}
