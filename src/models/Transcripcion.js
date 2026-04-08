//Transcripcion
export class Transcripcion {
  constructor({
    id, id_partitura, ruta_imagen, ruta_resultado, contenido_resultado,
    ruta_abc, modelo, porcentaje_fiabilidad, created_at
  }) {
    this.id = id
    this.id_partitura = id_partitura
    this.ruta_imagen = ruta_imagen || null
    this.ruta_resultado = ruta_resultado || null
    this.contenido_resultado = contenido_resultado || null
    this.ruta_abc = ruta_abc || null
    this.modelo = modelo || 'Qwen2.5'
    this.porcentaje_fiabilidad = porcentaje_fiabilidad || 0
    this.created_at = created_at ? new Date(created_at) : new Date()
  }

  convertir() {
    return this.contenido_resultado
  }
}

