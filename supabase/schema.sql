-- ============================================================
-- ENUM: Rol de usuario 
-- ============================================================
DO $$ BEGIN
  CREATE TYPE rol_usuario AS ENUM ('USUARIO_REGISTRADO', 'ADMINISTRADOR');
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'ADMINISTRADOR';
EXCEPTION WHEN others THEN null;
END $$;

-- ============================================================
-- TABLA: usuarios
-- Extiende auth.users de Supabase
-- ============================================================
CREATE TABLE IF NOT EXISTS public.usuarios (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                TEXT NOT NULL UNIQUE,
  nombre               TEXT NOT NULL DEFAULT '',
  apellidos            TEXT NOT NULL DEFAULT '',
  nickname             TEXT NOT NULL DEFAULT '',
  rol                  rol_usuario NOT NULL DEFAULT 'USUARIO_REGISTRADO',
  avatar_seed          TEXT DEFAULT '',
  avatar_url           TEXT DEFAULT NULL,
  last_profile_update  TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);
--Por si la tabla ya existía de una versión anterior sin estas columnas
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS avatar_seed         TEXT DEFAULT '';
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS avatar_url          TEXT DEFAULT NULL;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS last_profile_update TIMESTAMPTZ;

-- ============================================================
-- TRIGGER, crear perfil automáticamente al registrar en Auth
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  SET LOCAL row_security = off;
  INSERT INTO public.usuarios (id, email, nombre, apellidos, nickname, rol)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre',    ''),
    COALESCE(NEW.raw_user_meta_data->>'apellidos', ''),
    COALESCE(NEW.raw_user_meta_data->>'nickname',  ''),
    'USUARIO_REGISTRADO'
  )
  ON CONFLICT (id) DO UPDATE
    SET email     = EXCLUDED.email,
        nombre    = CASE WHEN public.usuarios.nombre    = '' THEN EXCLUDED.nombre    ELSE public.usuarios.nombre    END,
        apellidos = CASE WHEN public.usuarios.apellidos = '' THEN EXCLUDED.apellidos ELSE public.usuarios.apellidos END,
        nickname  = CASE WHEN public.usuarios.nickname  = '' THEN EXCLUDED.nickname  ELSE public.usuarios.nickname  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.usuarios (id, email, nombre, apellidos, nickname, rol)--Reparar cuentas existentes sin fila en public.usuarios
SELECT au.id, au.email,
       COALESCE(au.raw_user_meta_data->>'nombre',    ''),
       COALESCE(au.raw_user_meta_data->>'apellidos', ''),
       COALESCE(au.raw_user_meta_data->>'nickname',  ''),
       'USUARIO_REGISTRADO'
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = au.id)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.prevent_self_privileged_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rol IS DISTINCT FROM OLD.rol THEN
    NEW.rol := OLD.rol;
  END IF;
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    IF NOT EXISTS (
      SELECT 1
      FROM auth.users AS auth_user
      WHERE auth_user.id = NEW.id
        AND auth_user.email = NEW.email
    ) THEN
      NEW.email := OLD.email;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

ALTER FUNCTION public.prevent_self_privileged_changes() OWNER TO postgres;

DROP TRIGGER IF EXISTS trg_prevent_self_privileged_changes ON public.usuarios;
CREATE TRIGGER trg_prevent_self_privileged_changes
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_privileged_changes();

CREATE OR REPLACE FUNCTION public.handle_auth_user_email_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email AND NEW.email IS NOT NULL THEN
    SET LOCAL row_security = off;
    UPDATE public.usuarios
    SET email = NEW.email
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

ALTER FUNCTION public.handle_auth_user_email_change() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.handle_auth_user_email_change() FROM PUBLIC;

DROP TRIGGER IF EXISTS on_auth_user_email_changed ON auth.users;
CREATE TRIGGER on_auth_user_email_changed
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.handle_auth_user_email_change();

UPDATE public.usuarios AS usuario
SET email = auth_user.email
FROM auth.users AS auth_user
WHERE usuario.id = auth_user.id
  AND auth_user.email IS NOT NULL
  AND usuario.email IS DISTINCT FROM auth_user.email;

-- ============================================================
-- TABLA: instituciones 
-- ============================================================
CREATE TABLE IF NOT EXISTS public.instituciones (
  id_institucion   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre           TEXT NOT NULL,
  descripcion      TEXT DEFAULT '',
  id_administrador UUID NOT NULL REFERENCES public.usuarios(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.instituciones ADD COLUMN IF NOT EXISTS descripcion TEXT DEFAULT '';

CREATE OR REPLACE VIEW public.usuario_administra_institucion AS
  SELECT id_administrador AS id_usuario, id_institucion
  FROM public.instituciones;

-- ============================================================
-- TABLA: miembros_institucion 
-- ============================================================
CREATE TABLE IF NOT EXISTS public.miembros_institucion (
  id_institucion UUID NOT NULL REFERENCES public.instituciones(id_institucion) ON DELETE CASCADE,
  id_usuario     UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  joined_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id_institucion, id_usuario)
);

-- ============================================================
-- TABLA: partituras 
-- ============================================================
CREATE TABLE IF NOT EXISTS public.partituras (
  id_partitura         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_propietario       UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  titulo               TEXT NOT NULL DEFAULT 'Sin título',
  autor                TEXT NOT NULL DEFAULT 'Desconocido',
  instrumento          TEXT DEFAULT '',
  genero               TEXT DEFAULT '',
  ano_original         INTEGER,
  fecha_subida         TIMESTAMPTZ DEFAULT NOW(),
  es_publica           BOOLEAN NOT NULL DEFAULT FALSE,
  es_privada           BOOLEAN NOT NULL DEFAULT TRUE,
  es_institucional     BOOLEAN NOT NULL DEFAULT FALSE,
  id_institucion       UUID REFERENCES public.instituciones(id_institucion) ON DELETE SET NULL,
  etiquetas            TEXT[] NOT NULL DEFAULT '{}',
  copyright_confirmado BOOLEAN NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);
--Por si la tabla ya existía de una versión anterior sin estas columnas
ALTER TABLE public.partituras ADD COLUMN IF NOT EXISTS es_privada           BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.partituras ADD COLUMN IF NOT EXISTS es_institucional     BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.partituras ADD COLUMN IF NOT EXISTS etiquetas            TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE public.partituras ADD COLUMN IF NOT EXISTS copyright_confirmado BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.partituras DROP CONSTRAINT IF EXISTS chk_visibilidad_exclusiva;
ALTER TABLE public.partituras ADD CONSTRAINT chk_visibilidad_exclusiva
  CHECK ( (es_publica::int + es_privada::int + es_institucional::int) = 1 );

-- ============================================================
-- TABLA: transcripciones  
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transcripciones (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_partitura          UUID NOT NULL REFERENCES public.partituras(id_partitura) ON DELETE CASCADE,
  ruta_imagen           TEXT,
  ruta_resultado        TEXT,
  contenido_resultado   TEXT,
  ruta_abc              TEXT,
  modelo                TEXT DEFAULT 'Qwen2.5',
  porcentaje_fiabilidad FLOAT NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: likes 
-- ============================================================
CREATE TABLE IF NOT EXISTS public.likes (
  id_usuario   UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  id_partitura UUID NOT NULL REFERENCES public.partituras(id_partitura) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id_usuario, id_partitura)
);

-- ============================================================
-- TABLA: comentarios  
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comentarios (
  id_comentario UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_partitura  UUID NOT NULL REFERENCES public.partituras(id_partitura) ON DELETE CASCADE,
  id_usuario    UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  contenido     TEXT NOT NULL CHECK (char_length(contenido) > 0),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: mensajes  
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mensajes (
  id_mensaje    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_comentario UUID NOT NULL REFERENCES public.comentarios(id_comentario) ON DELETE CASCADE,
  id_usuario    UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  contenido     TEXT NOT NULL CHECK (char_length(contenido) > 0),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: etiquetas_partitura 
-- ============================================================
CREATE TABLE IF NOT EXISTS public.etiquetas_partitura (
  id_usuario   UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  id_partitura UUID NOT NULL REFERENCES public.partituras(id_partitura) ON DELETE CASCADE,
  etiqueta     TEXT NOT NULL CHECK (char_length(etiqueta) > 0 AND char_length(etiqueta) <= 40),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id_usuario, id_partitura, etiqueta)
);

-- ============================================================
-- TABLA: reportes_partitura  
-- ============================================================
DO $$ BEGIN
  CREATE TYPE motivo_reporte AS ENUM ('copyright', 'robo', 'mala_calidad', 'otro');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.reportes_partitura (
  id_reporte    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_partitura  UUID NOT NULL REFERENCES public.partituras(id_partitura) ON DELETE CASCADE,
  id_reportante UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  motivo        motivo_reporte NOT NULL,
  comentario    TEXT NOT NULL DEFAULT '',
  leido         BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: solicitudes_institucion
-- ============================================================
DO $$ BEGIN
  CREATE TYPE estado_solicitud_institucion AS ENUM ('pendiente', 'aceptada', 'rechazada');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.solicitudes_institucion (
  id_solicitud   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_institucion UUID NOT NULL REFERENCES public.instituciones(id_institucion) ON DELETE CASCADE,
  id_usuario     UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  estado         estado_solicitud_institucion NOT NULL DEFAULT 'pendiente',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  resolved_at    TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_solicitud_pendiente
  ON public.solicitudes_institucion (id_institucion, id_usuario)
  WHERE estado = 'pendiente';

CREATE INDEX IF NOT EXISTS idx_partituras_propietario    ON public.partituras (id_propietario);
CREATE INDEX IF NOT EXISTS idx_partituras_institucion     ON public.partituras (id_institucion);
CREATE INDEX IF NOT EXISTS idx_partituras_fecha_subida    ON public.partituras (fecha_subida DESC);
CREATE INDEX IF NOT EXISTS idx_partituras_es_publica      ON public.partituras (es_publica) WHERE es_publica = true;
CREATE INDEX IF NOT EXISTS idx_partituras_etiquetas       ON public.partituras USING GIN (etiquetas);
CREATE INDEX IF NOT EXISTS idx_transcripciones_partitura  ON public.transcripciones (id_partitura);
CREATE INDEX IF NOT EXISTS idx_comentarios_partitura      ON public.comentarios (id_partitura);
CREATE INDEX IF NOT EXISTS idx_comentarios_usuario        ON public.comentarios (id_usuario);
CREATE INDEX IF NOT EXISTS idx_mensajes_comentario        ON public.mensajes (id_comentario);
CREATE INDEX IF NOT EXISTS idx_mensajes_usuario           ON public.mensajes (id_usuario);
CREATE INDEX IF NOT EXISTS idx_likes_partitura            ON public.likes (id_partitura);
CREATE INDEX IF NOT EXISTS idx_miembros_usuario           ON public.miembros_institucion (id_usuario);
CREATE INDEX IF NOT EXISTS idx_etiquetas_partitura_usuario    ON public.etiquetas_partitura (id_usuario);
CREATE INDEX IF NOT EXISTS idx_etiquetas_partitura_partitura  ON public.etiquetas_partitura (id_partitura);
CREATE INDEX IF NOT EXISTS idx_reportes_partitura         ON public.reportes_partitura (id_partitura);
CREATE INDEX IF NOT EXISTS idx_reportes_reportante        ON public.reportes_partitura (id_reportante);
CREATE INDEX IF NOT EXISTS idx_reportes_leido             ON public.reportes_partitura (leido) WHERE leido = false;
CREATE INDEX IF NOT EXISTS idx_solicitudes_institucion    ON public.solicitudes_institucion (id_institucion);
CREATE INDEX IF NOT EXISTS idx_solicitudes_usuario        ON public.solicitudes_institucion (id_usuario);
CREATE INDEX IF NOT EXISTS idx_solicitudes_pendientes     ON public.solicitudes_institucion (estado) WHERE estado = 'pendiente';


CREATE OR REPLACE FUNCTION public.total_comentarios(p public.partituras) RETURNS INT AS $$
  SELECT (
    (SELECT COUNT(*) FROM public.comentarios WHERE id_partitura = p.id_partitura) +
    (SELECT COUNT(*) FROM public.mensajes m JOIN public.comentarios c ON m.id_comentario = c.id_comentario WHERE c.id_partitura = p.id_partitura)
  )::INT;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION public.buscar_usuario_por_email(p_email TEXT)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM public.usuarios WHERE email = p_email LIMIT 1;
$$;
ALTER FUNCTION public.buscar_usuario_por_email(TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.buscar_usuario_por_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.buscar_usuario_por_email(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_miembros_institucion(p_institucion_id UUID)
RETURNS TABLE (
  id_usuario UUID, nombre TEXT, apellidos TEXT, email TEXT, rol rol_usuario, joined_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT u.id, u.nombre, u.apellidos, u.email, u.rol, m.joined_at
  FROM public.miembros_institucion m
  JOIN public.usuarios u ON u.id = m.id_usuario
  WHERE m.id_institucion = p_institucion_id
    AND (
      EXISTS (SELECT 1 FROM public.miembros_institucion me WHERE me.id_institucion = p_institucion_id AND me.id_usuario = auth.uid())
      OR EXISTS (SELECT 1 FROM public.instituciones i WHERE i.id_institucion = p_institucion_id AND i.id_administrador = auth.uid())
    );
$$;
ALTER FUNCTION public.get_miembros_institucion(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.get_miembros_institucion(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_miembros_institucion(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.es_miembro_institucion(p_institucion_id UUID, p_usuario_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.miembros_institucion
    WHERE id_institucion = p_institucion_id AND id_usuario = p_usuario_id
  );
$$;
ALTER FUNCTION public.es_miembro_institucion(UUID, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.es_miembro_institucion(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.es_miembro_institucion(UUID, UUID) TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.es_administrador_institucion(p_institucion_id UUID, p_usuario_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.instituciones
    WHERE id_institucion = p_institucion_id AND id_administrador = p_usuario_id
  );
$$;
ALTER FUNCTION public.es_administrador_institucion(UUID, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.es_administrador_institucion(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.es_administrador_institucion(UUID, UUID) TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.eliminar_cuenta()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.instituciones WHERE id_administrador = auth.uid();
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
ALTER FUNCTION public.eliminar_cuenta() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.eliminar_cuenta() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.eliminar_cuenta() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_reportes_propietario()
RETURNS TABLE (
  id_reporte UUID, id_partitura UUID, titulo_partitura TEXT,
  motivo motivo_reporte, comentario TEXT, leido BOOLEAN, created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT r.id_reporte, r.id_partitura, p.titulo, r.motivo, r.comentario, r.leido, r.created_at
  FROM public.reportes_partitura r
  JOIN public.partituras p ON p.id_partitura = r.id_partitura
  WHERE p.id_propietario = auth.uid()
  ORDER BY r.created_at DESC;
$$;
ALTER FUNCTION public.get_reportes_propietario() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.get_reportes_propietario() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_reportes_propietario() TO authenticated;

CREATE OR REPLACE FUNCTION public.resolver_solicitud_institucion(p_solicitud_id UUID, p_aceptar BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_institucion UUID;
  v_usuario     UUID;
BEGIN
  SELECT id_institucion, id_usuario INTO v_institucion, v_usuario
  FROM public.solicitudes_institucion
  WHERE id_solicitud = p_solicitud_id AND estado = 'pendiente';

  IF v_institucion IS NULL THEN
    RAISE EXCEPTION 'Solicitud no encontrada o ya resuelta';
  END IF;

  IF NOT public.es_administrador_institucion(v_institucion, auth.uid()) THEN
    RAISE EXCEPTION 'No tienes permiso para resolver esta solicitud';
  END IF;

  UPDATE public.solicitudes_institucion
  SET estado = (CASE WHEN p_aceptar THEN 'aceptada' ELSE 'rechazada' END)::estado_solicitud_institucion,
      resolved_at = NOW()
  WHERE id_solicitud = p_solicitud_id;

  IF p_aceptar THEN
    INSERT INTO public.miembros_institucion (id_institucion, id_usuario)
    VALUES (v_institucion, v_usuario)
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;
ALTER FUNCTION public.resolver_solicitud_institucion(UUID, BOOLEAN) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.resolver_solicitud_institucion(UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolver_solicitud_institucion(UUID, BOOLEAN) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_solicitudes_pendientes_admin()
RETURNS TABLE (
  id_solicitud UUID, id_institucion UUID, nombre_institucion TEXT,
  id_usuario UUID, nombre_usuario TEXT, apellidos_usuario TEXT, created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT s.id_solicitud, s.id_institucion, i.nombre, s.id_usuario, u.nombre, u.apellidos, s.created_at
  FROM public.solicitudes_institucion s
  JOIN public.instituciones i ON i.id_institucion = s.id_institucion
  JOIN public.usuarios u ON u.id = s.id_usuario
  WHERE s.estado = 'pendiente'
    AND i.id_administrador = auth.uid()
  ORDER BY s.created_at DESC;
$$;
ALTER FUNCTION public.get_solicitudes_pendientes_admin() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.get_solicitudes_pendientes_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_solicitudes_pendientes_admin() TO authenticated;

-- ============================================================
-- ROW LEVEL SECURITY  
-- ============================================================
ALTER TABLE public.usuarios              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instituciones         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.miembros_institucion  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partituras            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripciones       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etiquetas_partitura   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reportes_partitura    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_institucion ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuarios_select_all" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update_own" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_insert_own" ON public.usuarios;
CREATE POLICY "usuarios_select_all" ON public.usuarios FOR SELECT USING (true);
CREATE POLICY "usuarios_update_own" ON public.usuarios FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "usuarios_insert_own" ON public.usuarios FOR INSERT WITH CHECK (auth.uid() = id);

REVOKE SELECT (email) ON public.usuarios FROM anon, authenticated;

DROP POLICY IF EXISTS "instituciones_select_all"      ON public.instituciones;
DROP POLICY IF EXISTS "instituciones_select_miembro"  ON public.instituciones;
DROP POLICY IF EXISTS "instituciones_insert_auth"     ON public.instituciones;
DROP POLICY IF EXISTS "instituciones_update_admin"    ON public.instituciones;
DROP POLICY IF EXISTS "instituciones_delete_admin"    ON public.instituciones;
CREATE POLICY "instituciones_select_miembro" ON public.instituciones FOR SELECT USING (
  auth.uid() = id_administrador
  OR public.es_miembro_institucion(id_institucion, auth.uid())
);
CREATE POLICY "instituciones_insert_auth"  ON public.instituciones FOR INSERT WITH CHECK (auth.uid() = id_administrador);
CREATE POLICY "instituciones_update_admin" ON public.instituciones FOR UPDATE USING (auth.uid() = id_administrador);
CREATE POLICY "instituciones_delete_admin" ON public.instituciones FOR DELETE USING (auth.uid() = id_administrador);

-- ── miembros_institucion ──────────────────────────────────────
DROP POLICY IF EXISTS "miembros_select"       ON public.miembros_institucion;
DROP POLICY IF EXISTS "miembros_insert_admin" ON public.miembros_institucion;
DROP POLICY IF EXISTS "miembros_delete_admin" ON public.miembros_institucion;
CREATE POLICY "miembros_select" ON public.miembros_institucion FOR SELECT USING (
  auth.uid() = id_usuario
  OR public.es_administrador_institucion(id_institucion, auth.uid())
);
CREATE POLICY "miembros_insert_admin" ON public.miembros_institucion FOR INSERT WITH CHECK (
  public.es_administrador_institucion(id_institucion, auth.uid())
);
CREATE POLICY "miembros_delete_admin" ON public.miembros_institucion FOR DELETE USING (
  auth.uid() = id_usuario OR public.es_administrador_institucion(id_institucion, auth.uid())
);

DROP POLICY IF EXISTS "partituras_select_public" ON public.partituras;
DROP POLICY IF EXISTS "partituras_insert_own"    ON public.partituras;
DROP POLICY IF EXISTS "partituras_update_own"    ON public.partituras;
DROP POLICY IF EXISTS "partituras_delete_own"    ON public.partituras;
CREATE POLICY "partituras_select_public" ON public.partituras FOR SELECT USING (
  es_publica = true
  OR id_propietario = auth.uid()
  OR (es_institucional = true AND id_institucion IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.miembros_institucion
        WHERE id_institucion = partituras.id_institucion
          AND id_usuario = auth.uid()
      ))
);
CREATE POLICY "partituras_insert_own" ON public.partituras FOR INSERT WITH CHECK (auth.uid() = id_propietario);
CREATE POLICY "partituras_update_own" ON public.partituras FOR UPDATE USING (
  auth.uid() = id_propietario
) WITH CHECK (
  auth.uid() = id_propietario
  AND (
    id_institucion IS NULL
    OR EXISTS (SELECT 1 FROM public.miembros_institucion m WHERE m.id_institucion = partituras.id_institucion AND m.id_usuario = auth.uid())
  )
);
CREATE POLICY "partituras_delete_own" ON public.partituras FOR DELETE USING (auth.uid() = id_propietario);

DROP POLICY IF EXISTS "transcripciones_select"     ON public.transcripciones;
DROP POLICY IF EXISTS "transcripciones_insert_own" ON public.transcripciones;
DROP POLICY IF EXISTS "transcripciones_update_own" ON public.transcripciones;
CREATE POLICY "transcripciones_select" ON public.transcripciones FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.partituras
          WHERE id_partitura = transcripciones.id_partitura
          AND (
            es_publica = true
            OR id_propietario = auth.uid()
            OR (es_institucional = true AND id_institucion IS NOT NULL AND EXISTS (
                  SELECT 1 FROM public.miembros_institucion
                  WHERE id_institucion = partituras.id_institucion AND id_usuario = auth.uid()
                ))
          ))
);
CREATE POLICY "transcripciones_insert_own" ON public.transcripciones FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.partituras p
          WHERE p.id_partitura = transcripciones.id_partitura
          AND p.id_propietario = auth.uid())
);
CREATE POLICY "transcripciones_update_own" ON public.transcripciones FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.partituras
          WHERE id_partitura = transcripciones.id_partitura
          AND id_propietario = auth.uid())
);

DROP POLICY IF EXISTS "likes_select"       ON public.likes;
DROP POLICY IF EXISTS "likes_insert_auth"  ON public.likes;
DROP POLICY IF EXISTS "likes_delete_own"   ON public.likes;
CREATE POLICY "likes_select"      ON public.likes FOR SELECT USING (true);
CREATE POLICY "likes_insert_auth" ON public.likes FOR INSERT WITH CHECK (auth.uid() = id_usuario);
CREATE POLICY "likes_delete_own"  ON public.likes FOR DELETE USING (auth.uid() = id_usuario);

DROP POLICY IF EXISTS "comentarios_select"       ON public.comentarios;
DROP POLICY IF EXISTS "comentarios_insert_auth"  ON public.comentarios;
DROP POLICY IF EXISTS "comentarios_delete_own"   ON public.comentarios;
CREATE POLICY "comentarios_select" ON public.comentarios FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.partituras p
    WHERE p.id_partitura = comentarios.id_partitura
    AND (
      p.es_publica = true OR
      p.id_propietario = auth.uid() OR
      (p.es_institucional = true AND p.id_institucion IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.miembros_institucion
        WHERE id_institucion = p.id_institucion AND id_usuario = auth.uid()
      ))
    )
  )
);
CREATE POLICY "comentarios_insert_auth" ON public.comentarios FOR INSERT WITH CHECK (
  auth.uid() = id_usuario AND
  EXISTS (
    SELECT 1 FROM public.partituras p
    WHERE p.id_partitura = comentarios.id_partitura
    AND (
      p.es_publica = true OR
      p.id_propietario = auth.uid() OR
      (p.es_institucional = true AND p.id_institucion IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.miembros_institucion
        WHERE id_institucion = p.id_institucion AND id_usuario = auth.uid()
      ))
    )
  )
);
CREATE POLICY "comentarios_delete_own" ON public.comentarios FOR DELETE USING (auth.uid() = id_usuario);

DROP POLICY IF EXISTS "mensajes_select"       ON public.mensajes;
DROP POLICY IF EXISTS "mensajes_insert_auth"  ON public.mensajes;
DROP POLICY IF EXISTS "mensajes_delete_own"   ON public.mensajes;
CREATE POLICY "mensajes_select" ON public.mensajes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.comentarios c
    JOIN public.partituras p ON p.id_partitura = c.id_partitura
    WHERE c.id_comentario = mensajes.id_comentario
    AND (
      p.es_publica = true OR
      p.id_propietario = auth.uid() OR
      (p.es_institucional = true AND p.id_institucion IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.miembros_institucion
        WHERE id_institucion = p.id_institucion AND id_usuario = auth.uid()
      ))
    )
  )
);
CREATE POLICY "mensajes_insert_auth" ON public.mensajes FOR INSERT WITH CHECK (
  auth.uid() = id_usuario AND
  EXISTS (
    SELECT 1 FROM public.comentarios c
    JOIN public.partituras p ON p.id_partitura = c.id_partitura
    WHERE c.id_comentario = mensajes.id_comentario
    AND (
      p.es_publica = true OR
      p.id_propietario = auth.uid() OR
      (p.es_institucional = true AND p.id_institucion IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.miembros_institucion
        WHERE id_institucion = p.id_institucion AND id_usuario = auth.uid()
      ))
    )
  )
);
CREATE POLICY "mensajes_delete_own" ON public.mensajes FOR DELETE USING (auth.uid() = id_usuario);

DROP POLICY IF EXISTS "etiquetas_partitura_select_own" ON public.etiquetas_partitura;
DROP POLICY IF EXISTS "etiquetas_partitura_insert_own" ON public.etiquetas_partitura;
DROP POLICY IF EXISTS "etiquetas_partitura_delete_own" ON public.etiquetas_partitura;
CREATE POLICY "etiquetas_partitura_select_own" ON public.etiquetas_partitura FOR SELECT USING (
  auth.uid() = id_usuario
);
CREATE POLICY "etiquetas_partitura_insert_own" ON public.etiquetas_partitura FOR INSERT WITH CHECK (
  auth.uid() = id_usuario
  AND EXISTS (
    SELECT 1 FROM public.partituras p
    WHERE p.id_partitura = etiquetas_partitura.id_partitura
      AND (
        p.es_publica = true
        OR p.id_propietario = auth.uid()
        OR (p.es_institucional = true AND p.id_institucion IS NOT NULL AND public.es_miembro_institucion(p.id_institucion, auth.uid()))
      )
  )
);
CREATE POLICY "etiquetas_partitura_delete_own" ON public.etiquetas_partitura FOR DELETE USING (
  auth.uid() = id_usuario
);

DROP POLICY IF EXISTS "reportes_select" ON public.reportes_partitura;
DROP POLICY IF EXISTS "reportes_insert" ON public.reportes_partitura;
DROP POLICY IF EXISTS "reportes_update_propietario" ON public.reportes_partitura;
CREATE POLICY "reportes_select" ON public.reportes_partitura FOR SELECT USING (
  auth.uid() = id_reportante
  OR EXISTS (
    SELECT 1 FROM public.partituras p
    WHERE p.id_partitura = reportes_partitura.id_partitura
      AND p.id_propietario = auth.uid()
  )
);
CREATE POLICY "reportes_insert" ON public.reportes_partitura FOR INSERT WITH CHECK (
  auth.uid() = id_reportante
  AND EXISTS (
    SELECT 1 FROM public.partituras p
    WHERE p.id_partitura = reportes_partitura.id_partitura
      AND p.id_propietario <> auth.uid()
      AND (
        p.es_publica = true
        OR (p.es_institucional = true AND p.id_institucion IS NOT NULL AND public.es_miembro_institucion(p.id_institucion, auth.uid()))
      )
  )
);
CREATE POLICY "reportes_update_propietario" ON public.reportes_partitura FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.partituras p
    WHERE p.id_partitura = reportes_partitura.id_partitura
      AND p.id_propietario = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.partituras p
    WHERE p.id_partitura = reportes_partitura.id_partitura
      AND p.id_propietario = auth.uid()
  )
);
DROP POLICY IF EXISTS "solicitudes_select" ON public.solicitudes_institucion;
DROP POLICY IF EXISTS "solicitudes_insert" ON public.solicitudes_institucion;
CREATE POLICY "solicitudes_select" ON public.solicitudes_institucion FOR SELECT USING (
  auth.uid() = id_usuario
  OR public.es_administrador_institucion(id_institucion, auth.uid())
);
CREATE POLICY "solicitudes_insert" ON public.solicitudes_institucion FOR INSERT WITH CHECK (
  auth.uid() = id_usuario
  AND NOT public.es_miembro_institucion(id_institucion, auth.uid())
);