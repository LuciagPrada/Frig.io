//Comentario
export class Comentario {
  constructor({ id_comentario, id_partitura, id_usuario, contenido, created_at, usuarios, mensajes }) {
    this.id_comentario = id_comentario
    this.id_partitura = id_partitura
    this.id_usuario = id_usuario
    this.contenido = contenido || ''
    this.created_at = created_at ? new Date(created_at) : new Date()
    this.usuario = usuarios || null
    this.mensajes = mensajes || [] //array de Mensaje, las respuestas
  }
}
