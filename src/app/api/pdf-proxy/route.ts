import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url')

    if (!url) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
    }

    // Validate URL domain for security
    try {
        const parsed = new URL(url)
        if (!parsed.hostname.endsWith('.gov.co') && !parsed.hostname.endsWith('.presidencia.gov.co')) {
            return NextResponse.json({ error: 'URL domain not allowed' }, { status: 403 })
        }
    } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    try {
        // Fetch the PDF from the government server
        const res = await fetch(url, {
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/pdf,*/*',
            },
        })

        if (!res.ok) {
            console.error(`[pdf-proxy] Remote server returned ${res.status} for ${url}`)
            return NextResponse.json({ error: `Remote server error: ${res.status}` }, { status: 502 })
        }

        const contentType = res.headers.get('content-type') || 'application/pdf'
        const arrayBuffer = await res.arrayBuffer()

        if (arrayBuffer.byteLength === 0) {
            console.error(`[pdf-proxy] Empty response from ${url}`)
            return NextResponse.json({ error: 'Empty response from server' }, { status: 502 })
        }

        return new NextResponse(Buffer.from(arrayBuffer), {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Length': arrayBuffer.byteLength.toString(),
                'Content-Disposition': 'inline',
                'Cache-Control': 'public, max-age=86400, s-maxage=86400',
                'X-Content-Type-Options': 'nosniff',
            },
        })
    } catch (error) {
        console.error('[pdf-proxy] Error fetching PDF:', error)
        return NextResponse.json({ error: 'Failed to fetch PDF' }, { status: 500 })
    }
}
