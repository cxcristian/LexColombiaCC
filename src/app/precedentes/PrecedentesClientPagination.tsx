'use client'

import { useRouter } from 'next/navigation'
import { Pagination } from '@/components/ui'

interface Props {
  page: number
  total: number
  pageSize: number
  searchParams: Record<string, string | undefined>
}

export default function PrecedentesClientPagination({ page, total, pageSize, searchParams }: Props) {
  const router = useRouter()

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams()
    if (searchParams.q) params.set('q', searchParams.q)
    if (searchParams.tipo) params.set('tipo', searchParams.tipo)
    if (searchParams.corp) params.set('corp', searchParams.corp)
    if (searchParams.anio) params.set('anio', searchParams.anio)
    params.set('page', String(newPage))
    router.push(`/precedentes?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <Pagination
      currentPage={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  )
}
