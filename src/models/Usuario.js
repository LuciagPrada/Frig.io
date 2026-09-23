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

//Usuario
export class Usuario {
  constructor({ id, email, nombre, apellidos, nickname, rol, avatar_seed, avatar_url, created_at }) {
    this.id = id
    this.email = email
    this.nombre = nombre
    this.apellidos = apellidos
    this.nickname = nickname
    this.rol = rol || 'USUARIO_REGISTRADO'
    this.avatar_seed = avatar_seed || ''
    this.avatar_url = avatar_url || null
    this.created_at = created_at ? new Date(created_at) : new Date()
  }
}
