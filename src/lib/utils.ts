import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { TipoNorma, EstadoNorma } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Fecha no disponible'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export const TIPO_NORMA_LABELS: Record<TipoNorma, string> = {
  LEY: 'Ley',
  DECRETO: 'Decreto',
  RESOLUCION: 'Resolución',
  CIRCULAR: 'Circular',
  ORDENANZA: 'Ordenanza',
  ACUERDO: 'Acuerdo',
  OTRO: 'Otro',
}

export const ESTADO_NORMA_LABELS: Record<EstadoNorma, string> = {
  VIGENTE: 'Vigente',
  DEROGADO: 'Derogado',
  MODIFICADO: 'Modificado',
  DESCONOCIDO: 'Estado desconocido',
}

export const TIPO_NORMA_COLORS: Record<TipoNorma, string> = {
  LEY: 'bg-amber-100 text-amber-800 border-amber-200',
  DECRETO: 'bg-blue-100 text-blue-800 border-blue-200',
  RESOLUCION: 'bg-purple-100 text-purple-800 border-purple-200',
  CIRCULAR: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  ORDENANZA: 'bg-green-100 text-green-800 border-green-200',
  ACUERDO: 'bg-orange-100 text-orange-800 border-orange-200',
  OTRO: 'bg-gray-100 text-gray-700 border-gray-200',
}

export const ESTADO_COLORS: Record<EstadoNorma, string> = {
  VIGENTE: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  DEROGADO: 'text-red-700 bg-red-50 border-red-200',
  MODIFICADO: 'text-amber-700 bg-amber-50 border-amber-200',
  DESCONOCIDO: 'text-gray-500 bg-gray-50 border-gray-200',
}

export const ANOS_DISPONIBLES = Array.from(
  { length: new Date().getFullYear() - 1886 },
  (_, i) => String(new Date().getFullYear() - i)
)
