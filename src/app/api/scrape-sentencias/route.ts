import { NextRequest, NextResponse } from 'next/server'
import { scrapeSentencias, type ScrapeFilters } from '@/lib/apis/sentencias-scraper'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)

    const filters: ScrapeFilters = {
        tipo: searchParams.get('tipo') || undefined,
        anio: searchParams.get('anio') || undefined,
        query: searchParams.get('q') || undefined,
        limit: Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200),
        offset: parseInt(searchParams.get('offset') ?? '0', 10),
    }

    try {
        const result = await scrapeSentencias(filters)
        return NextResponse.json(result)
    } catch (error) {
        console.error('[API scrape-sentencias] Error:', error)
        return NextResponse.json(
            { error: 'Error al realizar el scraping de sentencias' },
            { status: 500 }
        )
    }
}
