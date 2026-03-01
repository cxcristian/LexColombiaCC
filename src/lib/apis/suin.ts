import type { Norma, NormaRaw, LeyesFilters, PaginatedResult, TipoNorma, EstadoNorma } from '@/types'

const SODA_BASE = 'https://www.datos.gov.co/resource'

// Dataset principal de SUIN en datos.gov.co
// Campos reales: tipo, n_mero, a_o, vigencia, entidad, materia, art_culos, sector, subtipo
const DATASET_NORMAS = 'fiev-nid6'

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
  if (upper.includes('VIGENTE') && !upper.includes('NO VIGENTE')) return 'VIGENTE'
  if (upper.includes('NO VIGENTE') || upper.includes('DEROGAD')) return 'DEROGADO'
  if (upper.includes('MODIFICAD')) return 'MODIFICADO'
  return 'DESCONOCIDO'
}

// Limpia valores "NULL" que la API envía como string
function cleanNull(val?: string): string | undefined {
  if (!val || val.trim().toUpperCase() === 'NULL') return undefined
  return val.trim()
}

// Elimina acentos/diacríticos de un string (á→a, é→e, ñ→n, etc.)
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// Genera un título descriptivo a partir de los campos disponibles
function buildTitulo(raw: NormaRaw): string {
  const tipo = cleanNull(raw.tipo) ?? 'Norma'
  const numero = cleanNull(raw.n_mero) ?? ''
  const anio = cleanNull(raw.a_o) ?? ''
  const materiaRaw = cleanNull(raw.materia)
  const materia = materiaRaw ? ` — ${materiaRaw.replace(/\|/g, ', ')}` : ''

  if (numero && anio) return `${tipo} ${numero} de ${anio}${materia}`
  if (numero) return `${tipo} ${numero}${materia}`
  return `${tipo}${materia}`
}

function mapNorma(raw: NormaRaw, index: number): Norma {
  const numero = cleanNull(raw.n_mero)
  const anio = cleanNull(raw.a_o)
  const tipo = cleanNull(raw.tipo)
  const entidad = cleanNull(raw.entidad)
  const materia = cleanNull(raw.materia)
  const vigencia = cleanNull(raw.vigencia)

  return {
    id: numero
      ? `${(tipo ?? 'N').replace(/\s+/g, '_')}-${numero}-${anio ?? '0'}`
      : `norma-${index}`,
    numero: numero ?? 'Sin número',
    anio: anio ?? 'N/D',
    tipo: normalizeTipo(tipo),
    entidad: entidad ?? 'Entidad no especificada',
    titulo: buildTitulo(raw),
    fecha: '',  // El dataset fiev-nid6 no incluye fecha exacta
    estado: normalizeEstado(vigencia),
    linkOficial: undefined,  // El dataset fiev-nid6 no incluye URL
    materia: materia?.replace(/\|/g, ', '),
  }
}

// ── Buscar URL del documento PDF en el dataset 88h2-dykw ──────────────────────

const DATASET_DOCS = '88h2-dykw'

export async function getNormaDocumentUrl(tipo: string, numero: string, anio?: string): Promise<{ url?: string; titulo?: string; descripcion?: string } | null> {
  // Normalizar tipo para la búsqueda
  const tipoNorm = removeAccents(tipo).toUpperCase()
  const tipoQuery = encodeURIComponent(tipoNorm)
  const numQuery = encodeURIComponent(numero)

  // Usar " NUMERO " con espacios para evitar matches parciales (150 → 1500)
  // El título tiene formato "LEY 150 DEL ..." o "DECRETO 150 DE ..."
  const preciseNumQuery = encodeURIComponent(` ${numero} `)

  // Buscar por tipo + número exacto en título
  const url = `${SODA_BASE}/${DATASET_DOCS}.json?$where=upper(tipo) like '%25${tipoQuery}%25' AND upper(titulo) like '%25${preciseNumQuery}%25'&$limit=10`

  try {
    const res = await fetch(url, { headers: buildHeaders(), next: { revalidate: 3600 } })
    if (!res.ok) return null
    const data = await res.json()

    // Filtrar client-side para verificar match exacto del número
    const filtered = findBestMatch(data, numero, anio)
    if (filtered) return filtered

    // Fallback: buscar sin tipo, solo por número exacto
    const fallbackUrl = `${SODA_BASE}/${DATASET_DOCS}.json?$where=upper(titulo) like '%25${preciseNumQuery}%25'&$limit=10`
    const fallbackRes = await fetch(fallbackUrl, { headers: buildHeaders(), next: { revalidate: 3600 } })
    if (!fallbackRes.ok) return null
    const fallbackData = await fallbackRes.json()

    const fallbackFiltered = findBestMatch(fallbackData, numero, anio)
    if (fallbackFiltered) return fallbackFiltered

    return null
  } catch {
    return null
  }
}

// Verifica que el número aparezca como palabra exacta en el título (no como parte de otro número)
function findBestMatch(
  data: Array<{ url?: string; titulo?: string; descripcion?: string }>,
  numero: string,
  anio?: string
): { url?: string; titulo?: string; descripcion?: string } | null {
  if (!data || !data.length) return null

  // Regex para match exacto del número como palabra completa
  // Matchea "150" pero no "1500" ni "2150"
  const numRegex = new RegExp(`\\b${numero}\\b`)

  for (const item of data) {
    const titulo = (item.titulo ?? '').toUpperCase()
    if (numRegex.test(titulo)) {
      // Si tenemos año, priorizar match que también contenga el año
      if (anio && titulo.includes(anio)) {
        return { url: item.url, titulo: item.titulo, descripcion: item.descripcion }
      }
    }
  }

  // Si no hubo match con año, devolver el primero que matchee por número
  for (const item of data) {
    const titulo = (item.titulo ?? '').toUpperCase()
    if (numRegex.test(titulo)) {
      return { url: item.url, titulo: item.titulo, descripcion: item.descripcion }
    }
  }

  return null
}

// ── Listar leyes con filtros y paginación ─────────────────────────────────────

export async function getLeyes(filters: LeyesFilters = {}): Promise<PaginatedResult<Norma>> {
  const { query, tipo, anio, estado, page = 1, pageSize = 12 } = filters
  const offset = (page - 1) * pageSize

  const whereClauses: string[] = []

  if (query && query.trim()) {
    const raw = query.trim().replace(/'/g, "''")
    // Normalizar: quitar acentos para que "resolución" encuentre "RESOLUCION"
    const q = removeAccents(raw)
    const encoded = encodeURIComponent(q)
    // Si es un número puro, buscar por número de norma
    if (/^\d+$/.test(q)) {
      whereClauses.push(`n_mero='${q}'`)
    } else {
      // Búsqueda de texto en tipo + entidad + materia + número (sin tildes)
      whereClauses.push(
        `(upper(tipo) like upper('%25${encoded}%25') OR upper(entidad) like upper('%25${encoded}%25') OR upper(materia) like upper('%25${encoded}%25') OR n_mero='${encoded}')`
      )
    }
  }

  if (tipo) {
    whereClauses.push(`upper(tipo) like upper('%25${tipo}%25')`)
  }

  if (anio) {
    whereClauses.push(`a_o='${anio}'`)
  }

  if (estado && estado !== 'DESCONOCIDO') {
    const vigenciaMap: Record<string, string> = {
      VIGENTE: 'Vigente',
      DEROGADO: 'No vigente',
      MODIFICADO: 'Modificado',
    }
    const vigenciaValue = vigenciaMap[estado] ?? estado
    whereClauses.push(`upper(vigencia) like upper('%25${encodeURIComponent(vigenciaValue)}%25')`)
  }

  const whereStr = whereClauses.length > 0 ? `&$where=${whereClauses.join(' AND ')}` : ''

  const countUrl = `${SODA_BASE}/${DATASET_NORMAS}.json?$select=count(*)${whereStr}`
  const dataUrl = `${SODA_BASE}/${DATASET_NORMAS}.json?$limit=${pageSize}&$offset=${offset}&$order=a_o DESC${whereStr}`

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
    console.error('[getLeyes] Error fetching from SODA API:', error)
    console.warn('[getLeyes] ⚠️ Usando datos mock como fallback. Verifica la conexión a la API.')
    return getMockLeyes(filters)
  }
}

// ── Obtener una ley por ID ────────────────────────────────────────────────────

export async function getLeyById(id: string): Promise<Norma | null> {
  // IDs con formato "norma-X" no tienen datos reales para buscar
  if (id.startsWith('norma-')) return null

  // El id tiene formato "TIPO-NUMERO-AÑO" (ej: "LEY-100-1993", "ACTO_LEGISLATIVO-3-2011")
  const parts = id.split('-')
  if (parts.length < 3) return null

  // El tipo puede contener guiones (ej: "ACTO_LEGISLATIVO"), tomamos los últimos dos segmentos
  const anio = parts[parts.length - 1]
  const numero = parts[parts.length - 2]

  // Validar que tenemos datos suficientes: año debe ser numérico de 4 dígitos
  if (!anio || !/^\d{3,4}$/.test(anio) || !numero) return null

  const url = `${SODA_BASE}/${DATASET_NORMAS}.json?$where=n_mero='${numero}' AND a_o='${anio}'&$limit=5`

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

// ── Mock data para desarrollo sin conexión (fallback) ─────────────────────────

function getMockLeyes(filters: LeyesFilters): PaginatedResult<Norma> {
  const mockData: Norma[] = [
    { id: 'LEY-100-1993', numero: '100', anio: '1993', tipo: 'LEY', entidad: 'Congreso de la República', titulo: 'LEY 100 de 1993 — Seguridad Social', fecha: '', estado: 'VIGENTE', materia: 'Seguridad Social' },
    { id: 'LEY-599-2000', numero: '599', anio: '2000', tipo: 'LEY', entidad: 'Congreso de la República', titulo: 'LEY 599 de 2000 — Derecho Penal', fecha: '', estado: 'VIGENTE', materia: 'Derecho Penal' },
    { id: 'LEY-906-2004', numero: '906', anio: '2004', tipo: 'LEY', entidad: 'Congreso de la República', titulo: 'LEY 906 de 2004 — Procedimiento Penal', fecha: '', estado: 'VIGENTE', materia: 'Procedimiento Penal' },
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
