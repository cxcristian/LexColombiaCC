// ── Leyes (SODA API - datos.gov.co) ──────────────────────────────────────────

export interface NormaRaw {
  // Campos del dataset SUIN en datos.gov.co
  numero_norma?: string
  anio?: string
  tipo_norma?: string
  entidad?: string
  titulo_norma?: string
  fecha_norma?: string
  estado?: string
  link_norma?: string
  materia?: string
  [key: string]: string | undefined
}

export interface Norma {
  id: string
  numero: string
  anio: string
  tipo: TipoNorma
  entidad: string
  titulo: string
  fecha: string
  estado: EstadoNorma
  linkOficial?: string
  materia?: string
}

export type TipoNorma =
  | 'LEY'
  | 'DECRETO'
  | 'RESOLUCION'
  | 'CIRCULAR'
  | 'ORDENANZA'
  | 'ACUERDO'
  | 'OTRO'

export type EstadoNorma = 'VIGENTE' | 'DEROGADO' | 'MODIFICADO' | 'DESCONOCIDO'

// ── Precedentes Judiciales ────────────────────────────────────────────────────

export interface Precedente {
  id: string
  numero: string           // ej: "T-760/08", "C-355/06"
  tipo: TipoPrecedente
  corporacion: Corporacion
  fecha: string
  magistradoPonente?: string
  tematico?: string
  resumen?: string
  linkOficial?: string
  palabrasClave?: string[]
}

export type TipoPrecedente =
  | 'SENTENCIA_T'          // Tutela
  | 'SENTENCIA_C'          // Constitucionalidad
  | 'SENTENCIA_SU'         // Unificación
  | 'AUTO'
  | 'SENTENCIA_CE'         // Consejo de Estado
  | 'SENTENCIA_CSJ'        // Corte Suprema de Justicia

export type Corporacion =
  | 'CORTE_CONSTITUCIONAL'
  | 'CONSEJO_DE_ESTADO'
  | 'CORTE_SUPREMA_DE_JUSTICIA'
  | 'CONSEJO_SUPERIOR_JUDICATURA'

// ── Paginación ────────────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ── Filtros de búsqueda ───────────────────────────────────────────────────────

export interface LeyesFilters {
  query?: string
  tipo?: TipoNorma | ''
  anio?: string
  estado?: EstadoNorma | ''
  page?: number
  pageSize?: number
}

export interface PrecedentesFilters {
  query?: string
  tipo?: TipoPrecedente | ''
  corporacion?: Corporacion | ''
  anio?: string
  page?: number
  pageSize?: number
}
