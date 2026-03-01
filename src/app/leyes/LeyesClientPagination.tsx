'use client'

import { useRouter } from 'next/navigation'
import { Pagination } from '@/components/ui'

interface Props {
  page: number
  total: number
  pageSize: number
  searchParams: Record<string, string | undefined>
}

export default function LeyesClientPagination({ page, total, pageSize, searchParams }: Props) {
  const router = useRouter()

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams()
    if (searchParams.q) params.set('q', searchParams.q)
    if (searchParams.tipo) params.set('tipo', searchParams.tipo)
    if (searchParams.anio) params.set('anio', searchParams.anio)
    if (searchParams.estado) params.set('estado', searchParams.estado)
    params.set('page', String(newPage))
    router.push(`/leyes?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Pagination
      page={page}
      total={total}
      pageSize={pageSize}
      onPageChange={handlePageChange}
    />
  )
}
