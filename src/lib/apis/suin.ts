import type { Norma, NormaRaw, LeyesFilters, PaginatedResult, TipoNorma, EstadoNorma } from '@/types'

const SODA_BASE = 'https://www.datos.gov.co/resource'

// Dataset principal de SUIN en datos.gov.co
// Contiene leyes, decretos, resoluciones desde la Presidencia de Colombia
const DATASET_NORMAS = 'fiev-nid6'
const DATASET_NORMATIVA = '88h2-dykw' // Dataset alternativo/complementario

const APP_TOKEN = process.env.SODA_APP_TOKEN

function buildHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (APP_TOKEN) headers['X-App-Token'] = APP_TOKEN
  return headers
}

// Mapea el tipo raw de la API al tipo normalizado
function normalizeTipo(raw?: string): TipoNorma {
  if (!raw) return 'OTRO'
  const upper = raw.toUpperCase()
  if (upper.includes('LEY')) return 'LEY'
  if (upper.includes('DECRETO')) return 'DECRETO'
  if (upper.includes('RESOLUCION') || upper.includes('RESOLUCIÓN')) return 'RESOLUCION'
  if (upper.includes('CIRCULAR')) return 'CIRCULAR'
  if (upper.includes('ORDENANZA')) return 'ORDENANZA'
  if (upper.includes('ACUERDO')) return 'ACUERDO'
  return 'OTRO'
}

function normalizeEstado(raw?: string): EstadoNorma {
  if (!raw) return 'DESCONOCIDO'
  const upper = raw.toUpperCase()
  if (upper.includes('VIGENTE')) return 'VIGENTE'
  if (upper.includes('DEROGAD')) return 'DEROGADO'
  if (upper.includes('MODIFICAD')) return 'MODIFICADO'
  return 'DESCONOCIDO'
}

function mapNorma(raw: NormaRaw, index: number): Norma {
  return {
    id: raw.numero_norma
      ? `${raw.tipo_norma ?? 'N'}-${raw.numero_norma}-${raw.anio ?? '0'}`
      : `norma-${index}`,
    numero: raw.numero_norma ?? 'Sin número',
    anio: raw.anio ?? raw.fecha_norma?.split('-')[0] ?? 'N/D',
    tipo: normalizeTipo(raw.tipo_norma),
    entidad: raw.entidad ?? 'Entidad no especificada',
    titulo: raw.titulo_norma ?? 'Sin título',
    fecha: raw.fecha_norma ?? '',
    estado: normalizeEstado(raw.estado),
    linkOficial: raw.link_norma,
    materia: raw.materia,
  }
}

// ── Listar leyes con filtros y paginación ─────────────────────────────────────

export async function getLeyes(filters: LeyesFilters = {}): Promise<PaginatedResult<Norma>> {
  const { query, tipo, anio, estado, page = 1, pageSize = 12 } = filters
  const offset = (page - 1) * pageSize

  const whereClauses: string[] = []

  if (query && query.trim()) {
    // Búsqueda en título
    const q = query.trim().replace(/'/g, "''")
    whereClauses.push(`upper(titulo_norma) like upper('%25${encodeURIComponent(q)}%25')`)
  }

  if (tipo) {
    whereClauses.push(`upper(tipo_norma) like upper('%25${tipo}%25')`)
  }

  if (anio) {
    whereClauses.push(`anio='${anio}'`)
  }

  if (estado && estado !== 'DESCONOCIDO') {
    whereClauses.push(`upper(estado) like upper('%25${estado}%25')`)
  }

  const whereStr = whereClauses.length > 0 ? `&$where=${whereClauses.join(' AND ')}` : ''

  const countUrl = `${SODA_BASE}/${DATASET_NORMAS}.json?$select=count(*)${whereStr}`
  const dataUrl = `${SODA_BASE}/${DATASET_NORMAS}.json?$limit=${pageSize}&$offset=${offset}&$order=anio DESC${whereStr}`

  try {
    const [countRes, dataRes] = await Promise.all([
      fetch(countUrl, { headers: buildHeaders(), next: { revalidate: 3600 } }),
      fetch(dataUrl, { headers: buildHeaders(), next: { revalidate: 3600 } }),
    ])

    if (!dataRes.ok) throw new Error(`SODA API error: ${dataRes.status}`)

    const countData = await countRes.json()
    const rawData: NormaRaw[] = await dataRes.json()

    const total = parseInt(countData?.[0]?.['count'] ?? '0', 10)
    const data = rawData.map((r, i) => mapNorma(r, offset + i))

    return { data, total, page, pageSize, hasMore: offset + pageSize < total }
  } catch (error) {
    console.error('[getLeyes] Error:', error)
    // Retorna mock data si la API falla (útil en desarrollo)
    return getMockLeyes(filters)
  }
}

// ── Obtener una ley por ID ────────────────────────────────────────────────────

export async function getLeyById(id: string): Promise<Norma | null> {
  // El id tiene formato "TIPO-NUMERO-AÑO"
  const parts = id.split('-')
  if (parts.length < 3) return null

  const tipo = parts[0]
  const numero = parts[1]
  const anio = parts[2]

  const url = `${SODA_BASE}/${DATASET_NORMAS}.json?$where=numero_norma='${numero}' AND anio='${anio}'&$limit=1`

  try {
    const res = await fetch(url, { headers: buildHeaders(), next: { revalidate: 3600 } })
    if (!res.ok) return null
    const data: NormaRaw[] = await res.json()
    if (!data.length) return null
    return mapNorma(data[0], 0)
  } catch {
    return null
  }
}

// ── Mock data para desarrollo sin conexión ────────────────────────────────────

function getMockLeyes(filters: LeyesFilters): PaginatedResult<Norma> {
  const mockData: Norma[] = [
    { id: 'LEY-100-1993', numero: '100', anio: '1993', tipo: 'LEY', entidad: 'Congreso de la República', titulo: 'Por la cual se crea el sistema de seguridad social integral', fecha: '1993-12-23', estado: 'VIGENTE', materia: 'Seguridad Social' },
    { id: 'LEY-599-2000', numero: '599', anio: '2000', tipo: 'LEY', entidad: 'Congreso de la República', titulo: 'Por la cual se expide el Código Penal', fecha: '2000-07-24', estado: 'VIGENTE', materia: 'Derecho Penal' },
    { id: 'LEY-906-2004', numero: '906', anio: '2004', tipo: 'LEY', entidad: 'Congreso de la República', titulo: 'Por la cual se expide el Código de Procedimiento Penal', fecha: '2004-08-31', estado: 'VIGENTE', materia: 'Procedimiento Penal' },
    { id: 'LEY-1564-2012', numero: '1564', anio: '2012', tipo: 'LEY', entidad: 'Congreso de la República', titulo: 'Por medio de la cual se expide el Código General del Proceso', fecha: '2012-07-12', estado: 'VIGENTE', materia: 'Derecho Civil Procesal' },
    { id: 'DECRETO-410-1971', numero: '410', anio: '1971', tipo: 'DECRETO', entidad: 'Presidencia de la República', titulo: 'Por el cual se expide el Código de Comercio', fecha: '1971-03-27', estado: 'VIGENTE', materia: 'Derecho Comercial' },
    { id: 'LEY-1437-2011', numero: '1437', anio: '2011', tipo: 'LEY', entidad: 'Congreso de la República', titulo: 'Por la cual se expide el Código de Procedimiento Administrativo y de lo Contencioso Administrativo', fecha: '2011-01-18', estado: 'VIGENTE', materia: 'Derecho Administrativo' },
    { id: 'LEY-57-1887', numero: '57', anio: '1887', tipo: 'LEY', entidad: 'Congreso de la República', titulo: 'Código Civil Colombiano', fecha: '1887-04-26', estado: 'VIGENTE', materia: 'Derecho Civil' },
    { id: 'LEY-1952-2019', numero: '1952', anio: '2019', tipo: 'LEY', entidad: 'Congreso de la República', titulo: 'Por medio de la cual se expide el Código General Disciplinario', fecha: '2019-01-28', estado: 'VIGENTE', materia: 'Derecho Disciplinario' },
    { id: 'DECRETO-2663-1950', numero: '2663', anio: '1950', tipo: 'DECRETO', entidad: 'Presidencia de la República', titulo: 'Código Sustantivo del Trabajo', fecha: '1950-08-05', estado: 'VIGENTE', materia: 'Derecho Laboral' },
    { id: 'LEY-1098-2006', numero: '1098', anio: '2006', tipo: 'LEY', entidad: 'Congreso de la República', titulo: 'Por la cual se expide el Código de la Infancia y la Adolescencia', fecha: '2006-11-08', estado: 'VIGENTE', materia: 'Familia y Menores' },
    { id: 'LEY-80-1993', numero: '80', anio: '1993', tipo: 'LEY', entidad: 'Congreso de la República', titulo: 'Por la cual se expide el Estatuto General de Contratación de la Administración Pública', fecha: '1993-10-28', estado: 'VIGENTE', materia: 'Contratación Pública' },
    { id: 'LEY-1258-2008', numero: '1258', anio: '2008', tipo: 'LEY', entidad: 'Congreso de la República', titulo: 'Por medio de la cual se crea la sociedad por acciones simplificada', fecha: '2008-12-05', estado: 'VIGENTE', materia: 'Derecho Comercial' },
  ]

  const filtered = mockData.filter(n => {
    if (filters.query) {
      const q = filters.query.toLowerCase()
      if (!n.titulo.toLowerCase().includes(q) && !n.numero.includes(q)) return false
    }
    if (filters.tipo && n.tipo !== filters.tipo) return false
    if (filters.anio && n.anio !== filters.anio) return false
    if (filters.estado && n.estado !== filters.estado) return false
    return true
  })

  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 12
  const start = (page - 1) * pageSize
  const data = filtered.slice(start, start + pageSize)

  return { data, total: filtered.length, page, pageSize, hasMore: start + pageSize < filtered.length }
}
