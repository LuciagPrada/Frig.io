//Institucion
export class Institucion {
  constructor({ id_institucion, nombre, id_administrador, miembros }) {
    this.id_institucion = id_institucion
    this.nombre = nombre
    this.id_administrador = id_administrador
    this.miembros = miembros || []
  }
}
