-- ── MIGRACIÓN CASOS JURÍDICOS ─────────────────────────────────────────────────
-- Ejecutar en Supabase → SQL Editor

-- ── 1. Tabla principal de casos ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cases (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Identificación
  titulo            text NOT NULL,
  referencia        text,                        -- Número de radicado
  descripcion       text,

  -- Cliente
  cliente_nombre    text NOT NULL,
  cliente_contacto  text,                        -- teléfono o email

  -- Despacho judicial
  juzgado           text,
  ciudad            text,
  despacho          text,

  -- Clasificación
  tipo_proceso      text NOT NULL DEFAULT 'civil'
                    CHECK (tipo_proceso IN (
                      'civil','penal','laboral','administrativo',
                      'familia','constitucional','comercial','otro'
                    )),
  estado            text NOT NULL DEFAULT 'activo'
                    CHECK (estado IN ('activo','suspendido','cerrado','archivado')),

  -- Fechas
  fecha_inicio      date NOT NULL DEFAULT CURRENT_DATE,
  fecha_cierre      date,

  -- Metadatos
  notas_generales   text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ── 2. Tabla de eventos / actuaciones / términos ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.case_events (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id         uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Clasificación
  tipo            text NOT NULL DEFAULT 'actuacion'
                  CHECK (tipo IN (
                    'actuacion','termino','audiencia','vencimiento','nota','documento'
                  )),

  -- Contenido
  titulo          text NOT NULL,
  descripcion     text,

  -- Tiempo
  fecha_evento    date NOT NULL DEFAULT CURRENT_DATE,
  fecha_limite    date,                          -- para términos procesales
  dias_habiles    integer,                       -- duración del término

  -- Tipo de término predefinido
  termino_tipo    text CHECK (termino_tipo IN (
                    'traslado_demanda','contestacion_demanda',
                    'recurso_reposicion','recurso_apelacion',
                    'ejecutoria','notificacion_personal',
                    'termino_probatorio','alegatos',
                    'termino_sentencia','custom'
                  )),

  -- Estado
  completado      boolean NOT NULL DEFAULT false,
  alertar         boolean NOT NULL DEFAULT true,

  -- Vínculo con calendario
  reminder_id     uuid REFERENCES public.reminders(id) ON DELETE SET NULL,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── 3. Relación casos ↔ notas existentes ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.case_notes (
  case_id   uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  note_id   uuid NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  PRIMARY KEY (case_id, note_id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE public.cases       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_notes  ENABLE ROW LEVEL SECURITY;

-- cases
CREATE POLICY "cases_select_own"  ON public.cases FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY "cases_insert_own"  ON public.cases FOR INSERT  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cases_update_own"  ON public.cases FOR UPDATE  USING (auth.uid() = user_id);
CREATE POLICY "cases_delete_own"  ON public.cases FOR DELETE  USING (auth.uid() = user_id);

-- case_events
CREATE POLICY "case_events_select_own" ON public.case_events FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY "case_events_insert_own" ON public.case_events FOR INSERT  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "case_events_update_own" ON public.case_events FOR UPDATE  USING (auth.uid() = user_id);
CREATE POLICY "case_events_delete_own" ON public.case_events FOR DELETE  USING (auth.uid() = user_id);

-- case_notes
CREATE POLICY "case_notes_select_own" ON public.case_notes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_id AND c.user_id = auth.uid()));
CREATE POLICY "case_notes_insert_own" ON public.case_notes FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_id AND c.user_id = auth.uid()));
CREATE POLICY "case_notes_delete_own" ON public.case_notes FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_id AND c.user_id = auth.uid()));

-- ── Triggers updated_at ───────────────────────────────────────────────────────
CREATE TRIGGER set_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_case_events_updated_at
  BEFORE UPDATE ON public.case_events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── Índices ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_cases_user_id       ON public.cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_estado        ON public.cases(estado);
CREATE INDEX IF NOT EXISTS idx_case_events_case_id ON public.case_events(case_id);
CREATE INDEX IF NOT EXISTS idx_case_events_fecha   ON public.case_events(fecha_limite);

SELECT 'Tablas de casos creadas correctamente ✅' AS status;
