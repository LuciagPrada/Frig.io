//Like
//Al dar like a una partitura pública se guarda en la biblioteca personal del usuario
export class Like {
  constructor({ id_usuario, id_partitura, created_at }) {
    this.id_usuario = id_usuario
    this.id_partitura = id_partitura
    this.created_at = created_at ? new Date(created_at) : new Date()
  }
}
