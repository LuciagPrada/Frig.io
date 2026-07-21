//InstitucionRepository 
//Un usuario puede administrar o pertenecer a varias instituciones
import SupabaseClient from './SupabaseClient.js'

const getDB = () => SupabaseClient.getInstance().getDB()

//El email de los miembros ya no se lee por columna directa (RLS/privilegios
//lo impiden); se obtiene siempre a través de la función get_miembros_institucion,
//que ya comprueba que quien llama pertenece a esa institución.
async function attachMiembrosConEmail(inst) {
  if (!inst) return inst
  const db = getDB()
  const { data, error } = await db.rpc('get_miembros_institucion', { p_institucion_id: inst.id_institucion })
  if (error) throw error
  inst.miembros_institucion = (data || []).map(m => ({
    id_usuario: m.id_usuario,
    joined_at: m.joined_at,
    usuarios: { nombre: m.nombre, apellidos: m.apellidos, email: m.email, rol: m.rol },
  }))
  return inst
}

const InstitucionRepository = {
  //Crea una institución y añade al creador como administrador y miembro
  async create(nombre, adminUid) {
    const db = getDB()
    const { data, error } = await db
      .from('instituciones')
      .insert({ nombre, id_administrador: adminUid })
      .select()
      .single()
    if (error) throw error

    //Añadir admin como primer miembro
    await db
      .from('miembros_institucion')
      .insert({ id_institucion: data.id_institucion, id_usuario: adminUid })
      .throwOnError()

    return data.id_institucion
  },

  //Añade un usuario como miembro de una institución
  async addMiembro(instId, uid) {
    const db = getDB()
    const { error } = await db
      .from('miembros_institucion')
      .insert({ id_institucion: instId, id_usuario: uid })
    if (error) throw error
    return true
  },

  //Busca el id de un usuario por su email exacto (para invitar a una institución).
  //Pasa por una función de BD que no expone el email de nadie, solo el id.
  async buscarUsuarioPorEmail(email) {
    const db = getDB()
    const { data, error } = await db.rpc('buscar_usuario_por_email', { p_email: email })
    if (error) throw error
    return data || null
  },

  //Elimina a un usuario de una institución
  async removeMiembro(instId, uid) {
    const db = getDB()
    const { error } = await db
      .from('miembros_institucion')
      .delete()
      .eq('id_institucion', instId)
      .eq('id_usuario', uid)
    if (error) throw error
  },

  //Obtiene todas las instituciones donde el usuario es ADMINISTRADOR
  async getAllByAdmin(uid) {
    const db = getDB()
    const { data, error } = await db
      .from('instituciones')
      .select('*')
      .eq('id_administrador', uid)
    if (error && error.code !== 'PGRST116') throw error
    const insts = data || []
    await Promise.all(insts.map(attachMiembrosConEmail))
    return insts
  },

  //Obtiene todas las instituciones donde el usuario es miembro y no admin
  async getAllByMiembro(uid) {
    const db = getDB()
    const { data, error } = await db
      .from('miembros_institucion')
      .select('instituciones(*)')
      .eq('id_usuario', uid)
    if (error) throw error
    const insts = data?.map(d => d.instituciones).filter(Boolean) || []
    await Promise.all(insts.map(attachMiembrosConEmail))
    return insts
  },

  //Devuelve todas las instituciones del usuario sin duplicados, añadiendo el campo rolUsuario ('ADMINISTRADOR' | 'MIEMBRO')
  async getAllByUsuario(uid) {
    const [adminInsts, miembroInsts] = await Promise.all([
      InstitucionRepository.getAllByAdmin(uid),
      InstitucionRepository.getAllByMiembro(uid),
    ])

    const map = new Map()
    for (const inst of adminInsts) {
      map.set(inst.id_institucion, { ...inst, rolUsuario: 'ADMINISTRADOR' })
    }
    for (const inst of miembroInsts) {
      if (!map.has(inst.id_institucion)) {
        map.set(inst.id_institucion, { ...inst, rolUsuario: 'MIEMBRO' })
      }
    }
    return Array.from(map.values())
  },

  //Obtiene una institución completa por su ID
  async getById(instId) {
    const db = getDB()
    const { data, error } = await db
      .from('instituciones')
      .select('*')
      .eq('id_institucion', instId)
      .single()
    if (error) throw error
    return attachMiembrosConEmail(data)
  },

  //Actualiza nombre/descripción de una institución
  async update(instId, campos) {
    const db = getDB()
    const { error } = await db
      .from('instituciones')
      .update(campos)
      .eq('id_institucion', instId)
    if (error) throw error
  },

  //Elimina una institución (ON DELETE CASCADE gestiona miembros)
  async eliminar(instId) {
    const db = getDB()
    const { error } = await db
      .from('instituciones')
      .delete()
      .eq('id_institucion', instId)
    if (error) throw error
  },
}

export default InstitucionRepository
