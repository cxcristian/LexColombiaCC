import { cn } from '@/lib/utils'

// ── Badge ──────────────────────────────────────────────────────────────────
interface BadgeProps { children: React.ReactNode; variant?: 'navy'|'gold'|'green'|'red'|'blue'|'slate'; className?: string }
export function Badge({ children, variant = 'navy', className }: BadgeProps) {
  const styles = {
    navy:  'bg-navy-100 text-navy-800',
    gold:  'bg-amber-100 text-amber-800',
    green: 'bg-green-100 text-green-800',
    red:   'bg-red-100 text-red-800',
    blue:  'bg-blue-100 text-blue-800',
    slate: 'bg-slate-100 text-slate-600',
  }
  return (
    <span className={cn('badge', styles[variant], className)}>
      {children}
    </span>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

export function LawCardSkeleton() {
  return (
    <div className="lex-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-4 w-20 rounded-full" />
      </div>
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-3/5" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-7 flex-1 rounded-lg" />
        <Skeleton className="h-7 w-20 rounded-lg" />
      </div>
    </div>
  )
}

// ── Pagination ─────────────────────────────────────────────────────────────
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (p: number) => void
}
export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg text-sm border border-slate-200 text-slate-600 hover:bg-navy-50 hover:border-navy-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Anterior
      </button>
      {pages.map((p, i) => (
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-sm">…</span>
        ) : (
          <button key={`page-${p}`} onClick={() => onPageChange(p as number)}
            className={cn('w-9 h-9 rounded-lg text-sm font-medium transition-all border',
              p === currentPage
                ? 'bg-navy-900 text-white border-navy-900'
                : 'text-slate-700 border-slate-200 hover:bg-navy-50 hover:border-navy-200'
            )}
          >
            {p}
          </button>
        )
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg text-sm border border-slate-200 text-slate-600 hover:bg-navy-50 hover:border-navy-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Siguiente
      </button>
    </div>
  )
}
