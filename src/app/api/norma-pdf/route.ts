import { NextRequest, NextResponse } from 'next/server'
import { getNormaDocumentUrl } from '@/lib/apis/suin'

export async function GET(req: NextRequest) {
    const tipo = req.nextUrl.searchParams.get('tipo') ?? ''
    const numero = req.nextUrl.searchParams.get('numero') ?? ''
    const anio = req.nextUrl.searchParams.get('anio') ?? undefined

    if (!numero) {
        return NextResponse.json({ error: 'Missing numero' }, { status: 400 })
    }

    const result = await getNormaDocumentUrl(tipo, numero, anio)
    return NextResponse.json(result ?? { url: null })
}
