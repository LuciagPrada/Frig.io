//Mensaje, respuesta a un Comentario, threading anidado
export class Mensaje {
  constructor({ id_mensaje, id_comentario, id_usuario, contenido, created_at, usuarios }) {
    this.id_mensaje = id_mensaje
    this.id_comentario = id_comentario
    this.id_usuario = id_usuario
    this.contenido = contenido || ''
    this.created_at = created_at ? new Date(created_at) : new Date()
    this.usuario = usuarios || null
  }
}
