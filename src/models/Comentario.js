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
