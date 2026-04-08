//Usuario
import { Rol } from './Rol.js'

export class Usuario {
  constructor({ id, email, nombre, apellidos, nickname, rol, avatar_seed, avatar_url, created_at }) {
    this.id = id
    this.email = email
    this.nombre = nombre
    this.apellidos = apellidos
    this.nickname = nickname
    this.rol = rol || Rol.USUARIO_REGISTRADO
    this.avatar_seed = avatar_seed || ''
    this.avatar_url = avatar_url || null
    this.created_at = created_at ? new Date(created_at) : new Date()
  }
}
