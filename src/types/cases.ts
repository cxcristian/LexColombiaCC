// ── Tipos para Gestión de Casos ───────────────────────────────────────────────

export type TipoProceso =
  | 'civil' | 'penal' | 'laboral' | 'administrativo'
  | 'familia' | 'constitucional' | 'comercial' | 'otro'

export type EstadoCaso = 'activo' | 'suspendido' | 'cerrado' | 'archivado'

export type TipoEvento =
  | 'actuacion' | 'termino' | 'audiencia' | 'vencimiento' | 'nota' | 'documento'

export type TerminoTipo =
  | 'traslado_demanda' | 'contestacion_demanda'
  | 'recurso_reposicion' | 'recurso_apelacion'
  | 'ejecutoria' | 'notificacion_personal'
  | 'termino_probatorio' | 'alegatos'
  | 'termino_sentencia' | 'custom'

// ── Case ──────────────────────────────────────────────────────────────────────
export interface Case {
  id: string
  user_id: string
  titulo: string
  referencia: string | null
  descripcion: string | null
  cliente_nombre: string
  cliente_contacto: string | null
  juzgado: string | null
  ciudad: string | null
  despacho: string | null
  tipo_proceso: TipoProceso
  estado: EstadoCaso
  fecha_inicio: string
  fecha_cierre: string | null
  notas_generales: string | null
  created_at: string
  updated_at: string
}

export interface CaseInsert {
  user_id: string
  titulo: string
  referencia?: string | null
  descripcion?: string | null
  cliente_nombre: string
  cliente_contacto?: string | null
  juzgado?: string | null
  ciudad?: string | null
  despacho?: string | null
  tipo_proceso?: TipoProceso
  estado?: EstadoCaso
  fecha_inicio?: string
  fecha_cierre?: string | null
  notas_generales?: string | null
}

export interface CaseUpdate {
  titulo?: string
  referencia?: string | null
  descripcion?: string | null
  cliente_nombre?: string
  cliente_contacto?: string | null
  juzgado?: string | null
  ciudad?: string | null
  despacho?: string | null
  tipo_proceso?: TipoProceso
  estado?: EstadoCaso
  fecha_inicio?: string
  fecha_cierre?: string | null
  notas_generales?: string | null
}

// ── CaseEvent ─────────────────────────────────────────────────────────────────
export interface CaseEvent {
  id: string
  case_id: string
  user_id: string
  tipo: TipoEvento
  titulo: string
  descripcion: string | null
  fecha_evento: string
  fecha_limite: string | null
  dias_habiles: number | null
  termino_tipo: TerminoTipo | null
  completado: boolean
  alertar: boolean
  reminder_id: string | null
  created_at: string
  updated_at: string
}

export interface CaseEventInsert {
  case_id: string
  user_id: string
  tipo?: TipoEvento
  titulo: string
  descripcion?: string | null
  fecha_evento?: string
  fecha_limite?: string | null
  dias_habiles?: number | null
  termino_tipo?: TerminoTipo | null
  completado?: boolean
  alertar?: boolean
  reminder_id?: string | null
}

// ── Labels y colores ──────────────────────────────────────────────────────────
export const TIPO_PROCESO_LABELS: Record<TipoProceso, string> = {
  civil:           'Civil',
  penal:           'Penal',
  laboral:         'Laboral',
  administrativo:  'Administrativo',
  familia:         'Familia',
  constitucional:  'Constitucional',
  comercial:       'Comercial',
  otro:            'Otro',
}

export const TIPO_PROCESO_COLORS: Record<TipoProceso, { bg: string; color: string }> = {
  civil:          { bg: '#dbeafe', color: '#1e40af' },
  penal:          { bg: '#fee2e2', color: '#991b1b' },
  laboral:        { bg: '#dcfce7', color: '#166534' },
  administrativo: { bg: '#e0e7ff', color: '#3730a3' },
  familia:        { bg: '#fce7f3', color: '#9d174d' },
  constitucional: { bg: '#fef3c7', color: '#92400e' },
  comercial:      { bg: '#f0fdf4', color: '#14532d' },
  otro:           { bg: '#f1f5f9', color: '#475569' },
}

export const ESTADO_CASO_LABELS: Record<EstadoCaso, string> = {
  activo:     'Activo',
  suspendido: 'Suspendido',
  cerrado:    'Cerrado',
  archivado:  'Archivado',
}

export const ESTADO_CASO_COLORS: Record<EstadoCaso, { bg: string; color: string }> = {
  activo:     { bg: '#dcfce7', color: '#166534' },
  suspendido: { bg: '#fef3c7', color: '#92400e' },
  cerrado:    { bg: '#f1f5f9', color: '#475569' },
  archivado:  { bg: '#e2e8f0', color: '#334155' },
}

export const TIPO_EVENTO_LABELS: Record<TipoEvento, string> = {
  actuacion:  'Actuación',
  termino:    'Término procesal',
  audiencia:  'Audiencia',
  vencimiento:'Vencimiento',
  nota:       'Nota',
  documento:  'Documento',
}

export const TIPO_EVENTO_COLORS: Record<TipoEvento, string> = {
  actuacion:   '#2563eb',
  termino:     '#dc2626',
  audiencia:   '#7c3aed',
  vencimiento: '#d97706',
  nota:        '#0891b2',
  documento:   '#059669',
}

// ── Términos procesales predefinidos Colombia ─────────────────────────────────
export interface TerminoPredefinido {
  tipo: TerminoTipo
  label: string
  dias_habiles: number
  descripcion: string
  tipo_evento: TipoEvento
}

export const TERMINOS_COLOMBIA: TerminoPredefinido[] = [
  {
    tipo: 'traslado_demanda',
    label: 'Traslado de demanda',
    dias_habiles: 20,
    descripcion: 'Término para contestar la demanda (Art. 91 CGP)',
    tipo_evento: 'termino',
  },
  {
    tipo: 'contestacion_demanda',
    label: 'Contestación de demanda',
    dias_habiles: 20,
    descripcion: 'Término para presentar contestación con excepciones',
    tipo_evento: 'termino',
  },
  {
    tipo: 'recurso_reposicion',
    label: 'Recurso de reposición',
    dias_habiles: 3,
    descripcion: 'Término para interponer recurso de reposición (Art. 318 CGP)',
    tipo_evento: 'termino',
  },
  {
    tipo: 'recurso_apelacion',
    label: 'Recurso de apelación',
    dias_habiles: 3,
    descripcion: 'Término para interponer recurso de apelación (Art. 322 CGP)',
    tipo_evento: 'termino',
  },
  {
    tipo: 'ejecutoria',
    label: 'Ejecutoria de providencia',
    dias_habiles: 3,
    descripcion: 'Término de ejecutoria de autos y sentencias (Art. 302 CGP)',
    tipo_evento: 'vencimiento',
  },
  {
    tipo: 'notificacion_personal',
    label: 'Notificación personal',
    dias_habiles: 10,
    descripcion: 'Término para notificación personal al demandado (Art. 291 CGP)',
    tipo_evento: 'actuacion',
  },
  {
    tipo: 'termino_probatorio',
    label: 'Término probatorio',
    dias_habiles: 30,
    descripcion: 'Período de decreto y práctica de pruebas (Art. 172 CGP)',
    tipo_evento: 'termino',
  },
  {
    tipo: 'alegatos',
    label: 'Alegatos de conclusión',
    dias_habiles: 5,
    descripcion: 'Término para presentar alegatos de conclusión',
    tipo_evento: 'termino',
  },
  {
    tipo: 'termino_sentencia',
    label: 'Término para sentencia',
    dias_habiles: 40,
    descripcion: 'Término del juez para proferir sentencia (Art. 121 CGP)',
    tipo_evento: 'vencimiento',
  },
  {
    tipo: 'custom',
    label: 'Término personalizado',
    dias_habiles: 0,
    descripcion: 'Define tu propio término procesal',
    tipo_evento: 'termino',
  },
]

// ── Utilidades de fechas ──────────────────────────────────────────────────────

// Calcula días hábiles a partir de una fecha (excluye sábados y domingos)
export function addDiasHabiles(fechaInicio: string, dias: number): string {
  const date = new Date(fechaInicio + 'T12:00:00')
  let added = 0
  while (added < dias) {
    date.setDate(date.getDate() + 1)
    const dow = date.getDay()
    if (dow !== 0 && dow !== 6) added++ // excluye domingo (0) y sábado (6)
  }
  return date.toISOString().split('T')[0]
}

// Calcula días hábiles restantes desde hoy hasta fecha_limite
export function getDiasHabilesRestantes(fechaLimite: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const limite = new Date(fechaLimite + 'T12:00:00')
  if (limite <= today) return 0

  let count = 0
  const current = new Date(today)
  while (current < limite) {
    current.setDate(current.getDate() + 1)
    const dow = current.getDay()
    if (dow !== 0 && dow !== 6) count++
  }
  return count
}

// Días calendario restantes (para mostrar urgencia)
export function getDiasRestantes(fechaLimite: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const limite = new Date(fechaLimite + 'T12:00:00')
  return Math.ceil((limite.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

// Color de urgencia según días restantes
export function getUrgenciaColor(diasRestantes: number): { bg: string; color: string; label: string } {
  if (diasRestantes < 0)  return { bg: '#fee2e2', color: '#991b1b', label: 'Vencido' }
  if (diasRestantes <= 2) return { bg: '#fee2e2', color: '#dc2626', label: 'Urgente' }
  if (diasRestantes <= 5) return { bg: '#fef3c7', color: '#d97706', label: 'Próximo' }
  return { bg: '#dcfce7', color: '#16a34a', label: 'En tiempo' }
}
