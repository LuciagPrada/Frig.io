# Frig.io

Frig.io es una aplicación web de **Reconocimiento Óptico de Música (OMR)** orientada a digitalizar partituras manuscritas. Permite subir una imagen o un PDF, procesarlo mediante un modelo multimodal y obtener una partitura en formato **MusicXML**, lista para visualizar, descargar o abrir en programas como MuseScore y Sibelius.

Además de la transcripción, la plataforma ofrece una biblioteca personal, publicación de partituras en una comunidad, comentarios, likes, reportes y espacios compartidos para instituciones.

## Funcionalidades

- Registro, inicio de sesión y gestión del perfil con Supabase Auth.
- Carga de archivos JPG, PNG y PDF de hasta 10 MB.
- Transcripción OMR con información de progreso en tiempo real.
- Previsualización de MusicXML mediante Verovio Toolkit.
- Edición de metadatos y descarga de partituras.
- Biblioteca personal con búsqueda, filtros y etiquetas privadas.
- Visibilidad privada, pública o institucional.
- Comunidad con likes, comentarios y respuestas.
- Gestión de instituciones, miembros y solicitudes de acceso.
- Sistema de reportes y notificaciones.
- Diseño adaptable a escritorio y dispositivos móviles.

## Tecnologías

- [Vue 3](https://vuejs.org/) y Composition API
- [Vite](https://vitejs.dev/)
- [Vue Router](https://router.vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/) y CSS propio
- [Supabase](https://supabase.com/) para autenticación, PostgreSQL y Storage
- [Verovio](https://www.verovio.org/) para representar MusicXML
- API OMR externa basada en un modelo multimodal Qwen2.5

## Requisitos previos

- Node.js 18 o posterior.
- npm.
- Un proyecto de Supabase.
- Una API OMR compatible con los endpoints descritos más abajo.

> El servidor de inferencia no está incluido como una aplicación ejecutable en este repositorio. La carpeta `api/Cuadernos Colab` contiene cuadernos de entrenamiento y despliegue que pueden servir como referencia.

## Instalación

1. Clona el repositorio y entra en su directorio:

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd Frig.io-main
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Crea un archivo `.env` en la raíz:

   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima
   VITE_OMR_API_URL=http://localhost:8000
   ```

   Las variables con prefijo `VITE_` se incorporan al cliente web. Utiliza únicamente la clave pública `anon` de Supabase; nunca incluyas la clave `service_role`.

4. Configura la base de datos ejecutando [`supabase/schema.sql`](supabase/schema.sql) en el SQL Editor de Supabase. El script crea las tablas, tipos, funciones, triggers, vistas, índices y políticas de Row Level Security necesarias.

5. Crea en Supabase Storage los buckets públicos empleados por la aplicación:

   - `score-images`: imágenes originales de las partituras.
   - `score-musicxml`: resultados MusicXML.

   Configura sus políticas de escritura para que cada usuario autenticado solo pueda operar dentro de una carpeta cuyo nombre coincida con su identificador. Revisa también si los archivos deben ser públicos en tu despliegue: el cliente actual obtiene sus URLs mediante `getPublicUrl()`.

6. Inicia el entorno de desarrollo:

   ```bash
   npm run dev
   ```

   Vite mostrará en la terminal la URL local, normalmente `http://localhost:5173`.

## API OMR esperada

El frontend envía el archivo en una petición `multipart/form-data`, usando el campo `file`.

- `POST /transcribe-stream`: endpoint preferido. Debe responder con eventos NDJSON (`application/x-ndjson`) de tipo `progress`, `result` o `error`.
- `POST /transcribe`: alternativa JSON utilizada si el endpoint anterior responde con `404` o `405`.
- `POST /send-email`: endpoint usado para las notificaciones transaccionales de instituciones.

El resultado de una transcripción debe tener esta forma mínima:

```json
{
  "musicxml": "<?xml version=\"1.0\" ...",
  "fiabilidad": 0.95,
  "metadatos": {
    "titulo": "Título detectado",
    "autor": "Autor detectado"
  }
}
```

En la respuesta en streaming, este objeto se envía dentro de un evento como `{ "type": "result", "data": { ... } }`.

## Comandos disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run build` | Genera la aplicación optimizada en `dist/`. |
| `npm run preview` | Sirve localmente la compilación de producción. |

## Estructura del proyecto

```text
.
├── api/                  # Dataset y cuadernos Colab del modelo OMR
├── public/               # Recursos estáticos
├── src/
│   ├── assets/           # Logotipos y recursos gráficos
│   ├── components/       # Componentes reutilizables de interfaz
│   ├── controllers/      # Coordinación entre vistas y repositorios
│   ├── models/           # Modelos del dominio
│   ├── repositories/     # Acceso a Supabase
│   ├── router/           # Rutas y guards de autenticación
│   ├── services/         # Integración con OMR y correo
│   ├── stores/           # Estado global de autenticación
│   ├── utils/            # Validación y carga de Verovio
│   └── views/            # Páginas principales
├── supabase/schema.sql   # Esquema y seguridad de la base de datos
├── package.json
└── vite.config.js
```

La aplicación sigue una separación por capas: las vistas y componentes presentan la interfaz, los controladores coordinan los casos de uso y los repositorios concentran las consultas a Supabase.

## Rutas principales

| Ruta | Acceso | Contenido |
| --- | --- | --- |
| `/` | Público | Presentación e inicio de sesión. |
| `/dashboard` | Autenticado | Carga y transcripción de partituras. |
| `/biblioteca` | Autenticado | Biblioteca personal. |
| `/comunidad` | Público | Partituras compartidas por la comunidad. |
| `/mis-instituciones` | Autenticado | Gestión de instituciones. |
| `/partitura/:id` | Público | Detalle de una partitura accesible. |
| `/ajustes` | Autenticado | Perfil y preferencias de la cuenta. |

## Despliegue

Genera una compilación de producción con:

```bash
npm run build
```

El archivo `vercel.json` incluye la reescritura necesaria para que las rutas de Vue Router funcionen al desplegar la SPA en Vercel. Añade allí las tres variables de entorno utilizadas localmente y asegúrate de que la API OMR permita solicitudes CORS desde el dominio de la aplicación. El archivo `.vercelignore` excluye `supabase/schema.sql` del paquete de despliegue. Este esquema se conserva en el repositorio como recurso de configuración y debe ejecutarse manualmente en Supabase; la aplicación compilada no lo necesita.


## Seguridad

- No publiques el archivo `.env` ni credenciales privadas.
- Mantén activadas y revisadas las políticas RLS incluidas en el esquema.
- Restringe por usuario las escrituras en Supabase Storage.
- Valida de nuevo los archivos y límites de tamaño en la API: la validación del navegador no sustituye la validación del servidor.
- Configura en Supabase las URLs permitidas para autenticación y redirección antes de desplegar.

## Licencia

Este repositorio no incluye actualmente un archivo de licencia. Antes de redistribuirlo o aceptar contribuciones, añade una licencia que refleje las condiciones de uso del proyecto.
