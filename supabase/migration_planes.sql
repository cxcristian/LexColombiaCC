-- ============================================================
-- LexColombia — Migración: Planes, Firmas e Invitaciones
-- Ejecutar en: Supabase → SQL Editor → New query
-- ============================================================

-- ── 1. TABLA: subscriptions ───────────────────────────────────────────────────
-- Cada usuario tiene exactamente una suscripción activa.
-- Usuarios nuevos quedan en 'free' automáticamente.

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             uuid        NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,

  plan                text        NOT NULL DEFAULT 'free'
                      CHECK (plan IN ('free', 'trial', 'independiente', 'firma')),

  estado              text        NOT NULL DEFAULT 'activo'
                      CHECK (estado IN ('activo', 'vencido', 'cancelado', 'pausado')),

  -- Períodos
  trial_ends_at       timestamptz,                      -- fin del trial de 14 días
  periodo_inicio      timestamptz,
  periodo_fin         timestamptz,                      -- NULL = sin fecha de corte (gratis)

  -- Pago (para cuando llegue Wompi)
  wompi_subscription_id   text,
  wompi_customer_id       text,
  ultimo_pago_at          timestamptz,
  proximo_cobro_at        timestamptz,

  -- Meta
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- ── 2. TABLA: firms ───────────────────────────────────────────────────────────
-- Representa una firma jurídica. Solo el plan 'firma' puede tener una.

CREATE TABLE IF NOT EXISTS public.firms (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id        uuid        NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,

  nombre          text        NOT NULL,
  nit             text,                                 -- opcional
  ciudad          text,
  telefono        text,

  -- Límites según plan (se actualiza cuando cambia el plan)
  max_miembros    integer     NOT NULL DEFAULT 6,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── 3. TABLA: firm_members ────────────────────────────────────────────────────
-- Miembros de una firma. El owner también aparece aquí como 'admin'.

CREATE TABLE IF NOT EXISTS public.firm_members (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  firm_id     uuid        NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  rol_firma   text        NOT NULL DEFAULT 'miembro'
              CHECK (rol_firma IN ('admin', 'miembro')),

  estado      text        NOT NULL DEFAULT 'activo'
              CHECK (estado IN ('activo', 'suspendido')),

  joined_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (firm_id, user_id)
);

-- ── 4. TABLA: firm_invitations ────────────────────────────────────────────────
-- Links de invitación para unirse a una firma.

CREATE TABLE IF NOT EXISTS public.firm_invitations (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  firm_id     uuid        NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  invited_by  uuid        NOT NULL REFERENCES public.profiles(id),

  email       text        NOT NULL,
  token       uuid        NOT NULL DEFAULT gen_random_uuid() UNIQUE,

  estado      text        NOT NULL DEFAULT 'pendiente'
              CHECK (estado IN ('pendiente', 'aceptada', 'expirada', 'cancelada')),

  expires_at  timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,

  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (firm_id, email)
);

-- ── 5. FUNCIÓN: crear suscripción free automáticamente al registrarse ─────────
-- Se encadena al trigger existente handle_new_user

CREATE OR REPLACE FUNCTION public.handle_new_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, estado)
  VALUES (NEW.id, 'free', 'activo')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger sobre profiles (se crea el perfil → se crea la suscripción)
DROP TRIGGER IF EXISTS on_profile_created_subscription ON public.profiles;
CREATE TRIGGER on_profile_created_subscription
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_subscription();

-- ── 6. FUNCIÓN: helper para leer plan del usuario actual (sin recursión RLS) ──
CREATE OR REPLACE FUNCTION public.get_my_plan()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT plan FROM public.subscriptions WHERE user_id = auth.uid()
$$;

-- ── 7. FUNCIÓN: helper para leer firm_id del usuario actual ──────────────────
CREATE OR REPLACE FUNCTION public.get_my_firm_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT firm_id FROM public.firm_members
  WHERE user_id = auth.uid() AND estado = 'activo'
  LIMIT 1
$$;

-- ── 8. FUNCIÓN: verificar si el usuario es admin de su firma ─────────────────
CREATE OR REPLACE FUNCTION public.is_my_firm_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.firm_members
    WHERE user_id = auth.uid()
      AND rol_firma = 'admin'
      AND estado = 'activo'
  )
$$;

-- ── 9. FUNCIÓN: downgrade automático al vencer el plan ───────────────────────
-- Llamar con pg_cron (Supabase lo incluye) o manualmente.
CREATE OR REPLACE FUNCTION public.process_expired_subscriptions()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  -- Vencer trials expirados → bajar a free
  UPDATE public.subscriptions
  SET plan   = 'free',
      estado = 'activo',
      updated_at = now()
  WHERE plan = 'trial'
    AND trial_ends_at < now()
    AND estado = 'activo';

  -- Vencer planes pagos expirados → bajar a free
  UPDATE public.subscriptions
  SET plan   = 'free',
      estado = 'activo',
      updated_at = now()
  WHERE plan IN ('independiente', 'firma')
    AND periodo_fin < now()
    AND estado = 'activo';
END;
$$;

-- ── 10. pg_cron: ejecutar downgrade diariamente a las 3am ────────────────────
-- Requiere que pg_cron esté habilitado en Supabase (Extensions → pg_cron)
-- Descomentar cuando lo activen:
/*
SELECT cron.schedule(
  'process-expired-subscriptions',
  '0 3 * * *',
  $$ SELECT public.process_expired_subscriptions() $$
);
*/

-- ── 11. FUNCIÓN: updated_at para tablas nuevas ────────────────────────────────
-- (handle_updated_at ya existe de migration_calendario.sql, usamos set_updated_at
--  que existe de migration.sql — solo agregamos triggers)

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_firms_updated_at
  BEFORE UPDATE ON public.firms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 12. ÍNDICES ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id    ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan       ON public.subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_periodo    ON public.subscriptions(periodo_fin);
CREATE INDEX IF NOT EXISTS idx_firm_members_firm_id     ON public.firm_members(firm_id);
CREATE INDEX IF NOT EXISTS idx_firm_members_user_id     ON public.firm_members(user_id);
CREATE INDEX IF NOT EXISTS idx_firm_invitations_token   ON public.firm_invitations(token);
CREATE INDEX IF NOT EXISTS idx_firm_invitations_email   ON public.firm_invitations(email);

-- ── 13. ROW LEVEL SECURITY ────────────────────────────────────────────────────
ALTER TABLE public.subscriptions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firms            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firm_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firm_invitations ENABLE ROW LEVEL SECURITY;

-- subscriptions: cada usuario lee/edita solo la suya
CREATE POLICY "sub_select_own" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sub_update_own" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);
-- INSERT lo hace solo el trigger (SECURITY DEFINER), no el usuario directo
-- Admin plataforma puede ver todas
CREATE POLICY "sub_admin_select" ON public.subscriptions
  FOR SELECT USING (public.get_my_role() = 'admin');

-- firms: owner y miembros activos pueden leer
CREATE POLICY "firms_select_member" ON public.firms
  FOR SELECT USING (
    owner_id = auth.uid()
    OR public.get_my_firm_id() = id
  );
CREATE POLICY "firms_insert_owner" ON public.firms
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "firms_update_owner" ON public.firms
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "firms_delete_owner" ON public.firms
  FOR DELETE USING (auth.uid() = owner_id);

-- firm_members: miembros de la firma pueden ver sus compañeros
CREATE POLICY "fm_select_member" ON public.firm_members
  FOR SELECT USING (public.get_my_firm_id() = firm_id);
CREATE POLICY "fm_insert_admin" ON public.firm_members
  FOR INSERT WITH CHECK (public.is_my_firm_admin());
CREATE POLICY "fm_update_admin" ON public.firm_members
  FOR UPDATE USING (public.is_my_firm_admin());
CREATE POLICY "fm_delete_admin" ON public.firm_members
  FOR DELETE USING (
    public.is_my_firm_admin()
    AND user_id != auth.uid()  -- no puede removerse a sí mismo
  );

-- firm_invitations: admin de firma las crea/ve/cancela
CREATE POLICY "fi_select_admin" ON public.firm_invitations
  FOR SELECT USING (public.is_my_firm_admin());
CREATE POLICY "fi_insert_admin" ON public.firm_invitations
  FOR INSERT WITH CHECK (public.is_my_firm_admin());
CREATE POLICY "fi_update_admin" ON public.firm_invitations
  FOR UPDATE USING (public.is_my_firm_admin());

-- ── 14. CASOS: agregar firm_id y monitoreo_activo ────────────────────────────
-- Extender la tabla cases existente (de migration_casos.sql)

ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS monitoreo_activo  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS firm_id           uuid    REFERENCES public.firms(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_to       uuid    REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Actualizar RLS de cases para que miembros de firma vean casos de la firma
CREATE POLICY "cases_select_firm" ON public.cases
  FOR SELECT USING (
    -- Dueño del caso
    auth.uid() = user_id
    -- O miembro de la firma propietaria
    OR (firm_id IS NOT NULL AND public.get_my_firm_id() = firm_id)
  );

-- ── 15. SUSCRIBIR usuarios existentes que no tengan subscription ──────────────
INSERT INTO public.subscriptions (user_id, plan, estado)
SELECT id, 'free', 'activo'
FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.subscriptions)
ON CONFLICT (user_id) DO NOTHING;

-- ── 16. VERIFICACIÓN ──────────────────────────────────────────────────────────
DO $$
DECLARE
  v_subs   integer;
  v_firms  integer;
BEGIN
  SELECT COUNT(*) INTO v_subs  FROM public.subscriptions;
  SELECT COUNT(*) INTO v_firms FROM public.firms;

  RAISE NOTICE '✅ Migración Planes completada:';
  RAISE NOTICE '   - Tabla subscriptions: % registros', v_subs;
  RAISE NOTICE '   - Tabla firms creada';
  RAISE NOTICE '   - Tabla firm_members creada';
  RAISE NOTICE '   - Tabla firm_invitations creada';
  RAISE NOTICE '   - Funciones get_my_plan(), get_my_firm_id(), is_my_firm_admin() creadas';
  RAISE NOTICE '   - Trigger: suscripción free automática al registrarse';
  RAISE NOTICE '   - Cases extendida: monitoreo_activo, firm_id, assigned_to';
  RAISE NOTICE '   - % usuarios existentes migrados a plan free', v_subs;
END $$;
