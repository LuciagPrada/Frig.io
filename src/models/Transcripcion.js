/*
Copyright (C) 2026 Frigio
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program.  If not, see https://gnu.org.
*/

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

