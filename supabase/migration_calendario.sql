-- ── MIGRACIÓN CALENDARIO: Tabla de recordatorios ─────────────────────────────
-- Ejecutar en Supabase → SQL Editor

CREATE TABLE IF NOT EXISTS public.reminders (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text,
  date          date NOT NULL,
  time          time,
  color         text NOT NULL DEFAULT 'blue'
                CHECK (color IN ('blue','red','green','amber','purple','navy')),
  note_id       uuid REFERENCES public.notes(id) ON DELETE SET NULL,
  is_completed  boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reminders_select_own"
  ON public.reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "reminders_insert_own"
  ON public.reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reminders_update_own"
  ON public.reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "reminders_delete_own"
  ON public.reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger updated_at
CREATE TRIGGER set_reminders_updated_at
  BEFORE UPDATE ON public.reminders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Índices
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON public.reminders(date);

SELECT 'Tabla reminders creada correctamente ✅' AS status;
