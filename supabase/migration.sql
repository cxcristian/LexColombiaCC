-- ============================================================
-- LexColombia — Migración inicial de base de datos
-- Ejecutar en: Supabase → SQL Editor → New query
-- ============================================================

-- ── 1. Extensiones ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 2. Tabla de perfiles (extiende auth.users de Supabase) ────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       text        NOT NULL,
  full_name   text,
  avatar_url  text,
  role        text        NOT NULL DEFAULT 'user'
              CHECK (role IN ('admin', 'user', 'blocked')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ── 3. Tabla de notas judiciales ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notes (
  id                    uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title                 text        NOT NULL,
  content               text        DEFAULT '',
  tags                  text[]      DEFAULT '{}',
  color                 text        DEFAULT 'default'
                        CHECK (color IN ('default', 'amber', 'red', 'blue', 'green', 'purple')),
  -- Referencias opcionales a normas o precedentes
  related_law_id        text,       -- ID de la norma (ej: 'LEY-100-1993')
  related_law_title     text,       -- Título denormalizado para mostrar
  related_precedent_id  text,       -- ID del precedente (ej: 'CC-T-760-2008')
  related_precedent_num text,       -- Número denormalizado (ej: 'T-760/08')
  is_pinned             boolean     NOT NULL DEFAULT false,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- ── 4. Índices ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_notes_user_id   ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created   ON public.notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_updated   ON public.notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_pinned    ON public.notes(user_id, is_pinned);

-- ── 5. Row Level Security ─────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes    ENABLE ROW LEVEL SECURITY;

-- Profiles: cada usuario ve y edita su propio perfil; admins ven todos
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Notes: CRUD solo para el dueño de la nota
CREATE POLICY "notes_select_own"
  ON public.notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notes_insert_own"
  ON public.notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notes_update_own"
  ON public.notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notes_delete_own"
  ON public.notes FOR DELETE
  USING (auth.uid() = user_id);

-- ── 6. Función: crear perfil automáticamente al registrarse ──────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger: se ejecuta después de cada nuevo usuario en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 7. Función: actualizar updated_at automáticamente ─────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 8. Verificación ───────────────────────────────────────────────────────────
DO $$
BEGIN
  RAISE NOTICE '✅ Migración LexColombia completada exitosamente';
  RAISE NOTICE '   - Tabla profiles creada';
  RAISE NOTICE '   - Tabla notes creada';
  RAISE NOTICE '   - RLS activado en ambas tablas';
  RAISE NOTICE '   - Trigger de creación automática de perfil instalado';
END $$;

-- ── FASE 3: Política adicional para que admins lean todos los perfiles ────────
-- (necesario para el dashboard de admin)
CREATE POLICY "profiles_admin_select_all"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Política para que admins actualicen roles de otros usuarios
CREATE POLICY "profiles_admin_update_role"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
    AND id != auth.uid()   -- no puede cambiar su propio rol
  )
  WITH CHECK (true);

DO $$
BEGIN
  RAISE NOTICE '✅ Fase 3: Políticas de admin aplicadas';
END $$;
