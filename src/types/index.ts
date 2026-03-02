// ── Leyes (SODA API - datos.gov.co) ──────────────────────────────────────────

export interface NormaRaw {
  // Campos reales del dataset SUIN (fiev-nid6) en datos.gov.co
  tipo?: string         // ej: "LEY", "DECRETO", "ACTO LEGISLATIVO"
  n_mero?: string       // número de la norma
  a_o?: string          // año de expedición
  vigencia?: string     // ej: "Vigente", "No vigente"
  entidad?: string      // ej: "CONGRESO DE LA REPUBLICA"
  materia?: string      // ej: "Derecho Penal|Procedimiento Penal"
  art_culos?: string    // cantidad de artículos
  sector?: string       // ej: "Interior", "Hacienda"
  subtipo?: string
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
