//Partitura
export class Partitura {
  constructor({
    id_partitura, id_propietario, titulo, autor, instrumento, genero,
    ano_original, fecha_subida, es_publica, es_privada, es_institucional,
    id_institucion, created_at
  }) {
    this.id_partitura = id_partitura
    this.id_propietario = id_propietario
    this.titulo = titulo || 'Sin título'
    this.autor = autor || 'Desconocido'
    this.instrumento = instrumento || ''
    this.genero = genero || ''
    this.ano_original = ano_original || null
    this.fecha_subida = fecha_subida ? new Date(fecha_subida) : new Date()
    //Visibilidad sólo una activa
    this.es_publica = es_publica ?? false
    this.es_privada = es_privada ?? true
    this.es_institucional = es_institucional ?? false
    this.id_institucion = id_institucion || null
    this.created_at = created_at ? new Date(created_at) : new Date()
  }
}
