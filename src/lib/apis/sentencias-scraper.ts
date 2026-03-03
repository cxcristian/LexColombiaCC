import type { Precedente, TipoPrecedente } from '@/types'

// ── Scraper de Sentencias via datos.gov.co SODA API ───────────────────────────
// Dataset: Sentencias proferidas por la Corte Constitucional (v2k4-2t8s)
// ~29.210 registros desde 1992

const SODA_BASE = 'https://www.datos.gov.co/resource'
const DATASET_SENTENCIAS = 'v2k4-2t8s'
const APP_TOKEN = process.env.SODA_APP_TOKEN

// Tipo raw del dataset
export interface SentenciaRaw {
    proceso?: string              // "Tutela", "Decreto Legislativo", etc.
    expediente_tipo?: string      // "T", "RE", "D", etc.
    expediente_numero?: string
    magistrado_a?: string
    sala?: string                 // "Salas de Revisión", "Sala Plena"
    sentencia_tipo?: string       // "T", "C", "SU", "A"
    sentencia?: string            // "T-012/92", "C-004/92"
    fecha_sentencia?: string      // "1992-02-25T00:00:00.000"
    sv_spv?: string
    av_apv?: string
}

export interface ScrapeFilters {
    tipo?: string       // T, C, SU, A
    anio?: string       // e.g. "2023"
    query?: string      // buscar texto
    limit?: number
    offset?: number
}

export interface ScrapeResult {
    data: Precedente[]
    total: number
    limit: number
    offset: number
}

function buildHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (APP_TOKEN) headers['X-App-Token'] = APP_TOKEN
    return headers
}

// Mapeo de tipo de sentencia raw al tipo del sistema
function mapTipoPrecedente(tipoRaw?: string): TipoPrecedente {
    if (!tipoRaw) return 'SENTENCIA_T'
    const upper = tipoRaw.toUpperCase().trim()
    if (upper === 'SU') return 'SENTENCIA_SU'
    if (upper === 'C') return 'SENTENCIA_C'
    if (upper === 'T') return 'SENTENCIA_T'
    if (upper === 'A') return 'AUTO'
    return 'SENTENCIA_T'
}

// Genera link oficial a la relatoría de la Corte Constitucional
function buildLinkOficial(sentencia?: string): string {
    if (!sentencia) return 'https://www.corteconstitucional.gov.co'
    // El formato de la relatoría es: t-012-92.htm, c-004-92.htm
    const slug = sentencia.toLowerCase().replace(/\//g, '-')
    return `https://www.corteconstitucional.gov.co/relatoria/${sentencia.split('/')[1] ? `20${sentencia.split('/')[1].length === 2 ? sentencia.split('/')[1] : ''}` || sentencia.split('/')[1] : ''}/${slug}.htm`
}

// Genera link oficial más robusto
function buildLinkOficialSafe(sentencia?: string, fecha?: string): string {
    if (!sentencia) return 'https://www.corteconstitucional.gov.co'

    // Extraer año de la fecha si está disponible
    let anio = ''
    if (fecha) {
        anio = fecha.substring(0, 4) // "1992-02-25T00:00:00.000" → "1992"
    } else {
        // Intentar extraer del número de sentencia (e.g., "T-012/92" → "1992")
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

// Mapea un registro raw a nuestro tipo Precedente
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
        linkOficial: buildLinkOficialSafe(sentencia, raw.fecha_sentencia),
        palabrasClave: [
            raw.proceso,
            raw.sala,
            raw.sentencia_tipo ? `Tipo ${raw.sentencia_tipo}` : undefined,
        ].filter(Boolean) as string[],
    }
}

// ── Scraping principal ────────────────────────────────────────────────────────

export async function scrapeSentencias(filters: ScrapeFilters = {}): Promise<ScrapeResult> {
    const { tipo, anio, query, limit = 50, offset = 0 } = filters

    const whereClauses: string[] = []

    if (tipo) {
        whereClauses.push(`upper(sentencia_tipo)='${tipo.toUpperCase()}'`)
    }

    if (anio) {
        whereClauses.push(`fecha_sentencia >= '${anio}-01-01T00:00:00.000'`)
        whereClauses.push(`fecha_sentencia < '${parseInt(anio) + 1}-01-01T00:00:00.000'`)
    }

    if (query && query.trim()) {
        const q = query.trim().replace(/'/g, "''")
        const encoded = encodeURIComponent(q)
        whereClauses.push(
            `(upper(sentencia) like upper('%25${encoded}%25') OR upper(magistrado_a) like upper('%25${encoded}%25') OR upper(proceso) like upper('%25${encoded}%25'))`
        )
    }

    const whereStr = whereClauses.length > 0 ? `&$where=${whereClauses.join(' AND ')}` : ''

    const countUrl = `${SODA_BASE}/${DATASET_SENTENCIAS}.json?$select=count(*)${whereStr}`
    const dataUrl = `${SODA_BASE}/${DATASET_SENTENCIAS}.json?$limit=${limit}&$offset=${offset}&$order=fecha_sentencia DESC${whereStr}`

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

        return { data, total, limit, offset }
    } catch (error) {
        console.error('[scrapeSentencias] Error:', error)
        return { data: [], total: 0, limit, offset }
    }
}

// ── Obtener tipos disponibles para UI ─────────────────────────────────────────

export const TIPO_SENTENCIA_OPTIONS = [
    { value: '', label: 'Todos los tipos' },
    { value: 'T', label: 'Tutela (T)' },
    { value: 'C', label: 'Constitucionalidad (C)' },
    { value: 'SU', label: 'Unificación (SU)' },
    { value: 'A', label: 'Auto (A)' },
]
