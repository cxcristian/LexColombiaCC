import type { Precedente, PrecedentesFilters, PaginatedResult, TipoPrecedente, Corporacion } from '@/types'

// ── Precedentes: datos.gov.co SODA API ────────────────────────────────────────
// Dataset: Sentencias proferidas por la Corte Constitucional (v2k4-2t8s)
// ~29.210 registros desde 1992

const SODA_BASE = 'https://www.datos.gov.co/resource'
const DATASET_SENTENCIAS = 'v2k4-2t8s'
const APP_TOKEN = process.env.SODA_APP_TOKEN

// ── Tipo raw del dataset ──────────────────────────────────────────────────────

interface SentenciaRaw {
  proceso?: string
  expediente_tipo?: string
  expediente_numero?: string
  magistrado_a?: string
  sala?: string
  sentencia_tipo?: string
  sentencia?: string
  fecha_sentencia?: string
  sv_spv?: string
  av_apv?: string
}

function buildHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (APP_TOKEN) headers['X-App-Token'] = APP_TOKEN
  return headers
}

// ── Mapeo de tipos ────────────────────────────────────────────────────────────

function mapTipoPrecedente(tipoRaw?: string): TipoPrecedente {
  if (!tipoRaw) return 'SENTENCIA_T'
  const upper = tipoRaw.toUpperCase().trim()
  if (upper === 'SU') return 'SENTENCIA_SU'
  if (upper === 'C') return 'SENTENCIA_C'
  if (upper === 'T') return 'SENTENCIA_T'
  if (upper === 'A') return 'AUTO'
  return 'SENTENCIA_T'
}

function buildLinkOficial(sentencia?: string, fecha?: string): string {
  if (!sentencia) return 'https://www.corteconstitucional.gov.co'
  let anio = ''
  if (fecha) {
    anio = fecha.substring(0, 4)
  } else {
    const parts = sentencia.split('/')
    if (parts[1]) {
      const yearShort = parts[1]
      anio = yearShort.length === 2
        ? (parseInt(yearShort) > 50 ? `19${yearShort}` : `20${yearShort}`)
        : yearShort
    }
  }
  const slug = sentencia.toLowerCase().replace(/\//g, '-')
  return `https://www.corteconstitucional.gov.co/relatoria/${anio}/${slug}.htm`
}

function mapSentencia(raw: SentenciaRaw): Precedente {
  const sentencia = raw.sentencia?.trim() ?? ''
  const fecha = raw.fecha_sentencia?.substring(0, 10) ?? ''

  return {
    id: `SC-${sentencia.replace(/\//g, '-').replace(/\s+/g, '')}`,
    numero: sentencia,
    tipo: mapTipoPrecedente(raw.sentencia_tipo),
    corporacion: 'CORTE_CONSTITUCIONAL',
    fecha,
    magistradoPonente: raw.magistrado_a?.trim(),
    tematico: raw.proceso?.trim(),
    resumen: `Sentencia ${sentencia} · ${raw.sala ?? 'Sala no especificada'} · Proceso: ${raw.proceso ?? 'No especificado'}`,
    linkOficial: buildLinkOficial(sentencia, raw.fecha_sentencia),
    palabrasClave: [
      raw.proceso,
      raw.sala,
      raw.sentencia_tipo ? `Tipo ${raw.sentencia_tipo}` : undefined,
    ].filter(Boolean) as string[],
  }
}

// ── Buscar precedentes con filtros y paginación (SODA API) ───────────────────

export async function getPrecedentes(
  filters: PrecedentesFilters = {}
): Promise<PaginatedResult<Precedente>> {
  const { query, tipo, corporacion, anio, page = 1, pageSize = 9 } = filters
  const offset = (page - 1) * pageSize

  const whereClauses: string[] = []

  if (query && query.trim()) {
    const q = query.trim().replace(/'/g, "''")
    const encoded = encodeURIComponent(q)
    whereClauses.push(
      `(upper(sentencia) like upper('%25${encoded}%25') OR upper(magistrado_a) like upper('%25${encoded}%25') OR upper(proceso) like upper('%25${encoded}%25'))`
    )
  }

  // Mapeo de tipo interno al campo sentencia_tipo de la API
  if (tipo) {
    const tipoApiMap: Record<string, string> = {
      SENTENCIA_T: 'T',
      SENTENCIA_C: 'C',
      SENTENCIA_SU: 'SU',
      AUTO: 'A',
      SENTENCIA_CE: 'CE',
      SENTENCIA_CSJ: 'CSJ',
    }
    const tipoApi = tipoApiMap[tipo]
    if (tipoApi) {
      whereClauses.push(`upper(sentencia_tipo)='${tipoApi}'`)
    }
  }

  if (anio) {
    whereClauses.push(`fecha_sentencia >= '${anio}-01-01T00:00:00.000'`)
    whereClauses.push(`fecha_sentencia < '${parseInt(anio) + 1}-01-01T00:00:00.000'`)
  }

  // Nota: corporacion no aplica (todos los datos son de la Corte Constitucional)

  const whereStr = whereClauses.length > 0 ? `&$where=${whereClauses.join(' AND ')}` : ''

  const countUrl = `${SODA_BASE}/${DATASET_SENTENCIAS}.json?$select=count(*)${whereStr}`
  const dataUrl = `${SODA_BASE}/${DATASET_SENTENCIAS}.json?$limit=${pageSize}&$offset=${offset}&$order=fecha_sentencia DESC${whereStr}`

  try {
    const [countRes, dataRes] = await Promise.all([
      fetch(countUrl, { headers: buildHeaders(), next: { revalidate: 3600 } }),
      fetch(dataUrl, { headers: buildHeaders(), next: { revalidate: 3600 } }),
    ])

    if (!dataRes.ok) throw new Error(`SODA API error: ${dataRes.status}`)

    const countData = await countRes.json()
    const rawData: SentenciaRaw[] = await dataRes.json()

    const total = parseInt(countData?.[0]?.['count'] ?? '0', 10)
    const data = rawData.map(mapSentencia)

    return { data, total, page, pageSize, hasMore: offset + pageSize < total }
  } catch (error) {
    console.error('[getPrecedentes] Error fetching from SODA API:', error)
    console.warn('[getPrecedentes] ⚠️ Usando datos mock como fallback.')
    return getMockPrecedentes(filters)
  }
}

// ── Obtener un precedente por ID ──────────────────────────────────────────────

export async function getPrecedenteById(id: string): Promise<Precedente | null> {
  // IDs del scraping tienen formato "SC-T-012-92"
  if (!id.startsWith('SC-')) return null

  // Extraer número de sentencia del ID: "SC-T-012-92" → "T-012/92"
  const raw = id.replace('SC-', '')
  // El último segmento con guión es el año corto: reconstruir el formato original
  const parts = raw.split('-')
  if (parts.length < 2) return null
  const yearPart = parts[parts.length - 1]
  const sentParts = parts.slice(0, -1).join('-')
  const sentencia = `${sentParts}/${yearPart}`

  const url = `${SODA_BASE}/${DATASET_SENTENCIAS}.json?$where=upper(sentencia)=upper('${encodeURIComponent(sentencia)}')&$limit=1`

  try {
    const res = await fetch(url, { headers: buildHeaders(), next: { revalidate: 3600 } })
    if (!res.ok) return null
    const data: SentenciaRaw[] = await res.json()
    if (!data.length) return null
    return mapSentencia(data[0])
  } catch {
    return null
  }
}

// ── Labels para UI ────────────────────────────────────────────────────────────

export const CORPORACION_LABELS: Record<Corporacion, string> = {
  CORTE_CONSTITUCIONAL: 'Corte Constitucional',
  CONSEJO_DE_ESTADO: 'Consejo de Estado',
  CORTE_SUPREMA_DE_JUSTICIA: 'Corte Suprema de Justicia',
  CONSEJO_SUPERIOR_JUDICATURA: 'Consejo Superior de la Judicatura',
}

export const TIPO_PRECEDENTE_LABELS: Record<TipoPrecedente, string> = {
  SENTENCIA_T: 'Sentencia de Tutela',
  SENTENCIA_C: 'Sentencia de Constitucionalidad',
  SENTENCIA_SU: 'Sentencia de Unificación',
  AUTO: 'Auto',
  SENTENCIA_CE: 'Sentencia Consejo de Estado',
  SENTENCIA_CSJ: 'Sentencia Corte Suprema',
}

// ── Mock data para desarrollo sin conexión (fallback) ─────────────────────────

function getMockPrecedentes(filters: PrecedentesFilters): PaginatedResult<Precedente> {
  const mockData: Precedente[] = [
    {
      id: 'SC-T-760-08',
      numero: 'T-760/08',
      tipo: 'SENTENCIA_T',
      corporacion: 'CORTE_CONSTITUCIONAL',
      fecha: '2008-07-31',
      magistradoPonente: 'Manuel José Cepeda Espinosa',
      tematico: 'Derecho a la salud como derecho fundamental',
      resumen: 'Sentencia estructural que ordena reformar el sistema de salud colombiano.',
      linkOficial: 'https://www.corteconstitucional.gov.co/relatoria/2008/t-760-08.htm',
      palabrasClave: ['derecho a la salud', 'EPS', 'sentencia estructural'],
    },
    {
      id: 'SC-C-355-06',
      numero: 'C-355/06',
      tipo: 'SENTENCIA_C',
      corporacion: 'CORTE_CONSTITUCIONAL',
      fecha: '2006-05-10',
      magistradoPonente: 'Jaime Araújo Rentería',
      tematico: 'Despenalización parcial del aborto',
      resumen: 'Despenaliza el aborto en tres causales.',
      linkOficial: 'https://www.corteconstitucional.gov.co/relatoria/2006/c-355-06.htm',
      palabrasClave: ['aborto', 'derechos reproductivos'],
    },
    {
      id: 'SC-T-025-04',
      numero: 'T-025/04',
      tipo: 'SENTENCIA_T',
      corporacion: 'CORTE_CONSTITUCIONAL',
      fecha: '2004-01-22',
      magistradoPonente: 'Manuel José Cepeda Espinosa',
      tematico: 'Estado de cosas inconstitucional - Desplazamiento forzado',
      resumen: 'Declara el estado de cosas inconstitucional frente al desplazamiento forzado.',
      linkOficial: 'https://www.corteconstitucional.gov.co/relatoria/2004/t-025-04.htm',
      palabrasClave: ['desplazamiento forzado', 'ECI'],
    },
  ]

  let filtered = [...mockData]
  if (filters.query) {
    const q = filters.query.toLowerCase()
    filtered = filtered.filter(
      p => p.numero.toLowerCase().includes(q) ||
        p.tematico?.toLowerCase().includes(q) ||
        p.resumen?.toLowerCase().includes(q)
    )
  }
  if (filters.tipo) filtered = filtered.filter(p => p.tipo === filters.tipo)
  if (filters.anio) filtered = filtered.filter(p => p.fecha.startsWith(filters.anio!))

  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 9
  const start = (page - 1) * pageSize
  const data = filtered.slice(start, start + pageSize)

  return { data, total: filtered.length, page, pageSize, hasMore: start + pageSize < filtered.length }
}
