import type { Precedente, PrecedentesFilters, PaginatedResult, TipoPrecedente, Corporacion } from '@/types'

// ── Precedentes: datos curados + estructura para futura integración ───────────
// La Corte Constitucional y el Consejo de Estado no tienen API JSON pública,
// pero sus portales son scrapeables. Por ahora usamos un dataset curado de
// sentencias históricas de alto impacto, listos para extender con scraping.

const PRECEDENTES_CURADOS: Precedente[] = [
  // Corte Constitucional - Tutelas icónicas
  {
    id: 'CC-T-760-2008',
    numero: 'T-760/08',
    tipo: 'SENTENCIA_T',
    corporacion: 'CORTE_CONSTITUCIONAL',
    fecha: '2008-07-31',
    magistradoPonente: 'Manuel José Cepeda Espinosa',
    tematico: 'Derecho a la salud como derecho fundamental',
    resumen: 'Sentencia estructural que ordena reformar el sistema de salud colombiano. Reconoce el derecho a la salud como fundamental autónomo e impone obligaciones al Estado y a las EPS para garantizar su efectividad.',
    linkOficial: 'https://www.corteconstitucional.gov.co/relatoria/2008/t-760-08.htm',
    palabrasClave: ['derecho a la salud', 'EPS', 'POS', 'SGSSS', 'sentencia estructural'],
  },
  {
    id: 'CC-C-355-2006',
    numero: 'C-355/06',
    tipo: 'SENTENCIA_C',
    corporacion: 'CORTE_CONSTITUCIONAL',
    fecha: '2006-05-10',
    magistradoPonente: 'Jaime Araújo Rentería - Clara Inés Vargas Hernández',
    tematico: 'Despenalización parcial del aborto',
    resumen: 'Despenaliza el aborto en tres causales: violación, malformación fetal incompatible con la vida extrauterina, y riesgo para la vida o salud de la madre. Hito histórico de derechos reproductivos.',
    linkOficial: 'https://www.corteconstitucional.gov.co/relatoria/2006/c-355-06.htm',
    palabrasClave: ['aborto', 'derechos reproductivos', 'vida', 'dignidad', 'mujer'],
  },
  {
    id: 'CC-SU-1023-2001',
    numero: 'SU-1023/01',
    tipo: 'SENTENCIA_SU',
    corporacion: 'CORTE_CONSTITUCIONAL',
    fecha: '2001-09-26',
    magistradoPonente: 'Jaime Córdoba Triviño',
    tematico: 'Liquidación de Drummond - Pensiones de trabajadores',
    resumen: 'Unifica jurisprudencia sobre protección de pensiones ante liquidación de empresas. Ordena al Fondo de Pensiones el reconocimiento de mesadas a trabajadores afectados.',
    linkOficial: 'https://www.corteconstitucional.gov.co/relatoria/2001/su1023-01.htm',
    palabrasClave: ['pensiones', 'liquidación', 'derechos adquiridos', 'seguridad social'],
  },
  {
    id: 'CC-T-025-2004',
    numero: 'T-025/04',
    tipo: 'SENTENCIA_T',
    corporacion: 'CORTE_CONSTITUCIONAL',
    fecha: '2004-01-22',
    magistradoPonente: 'Manuel José Cepeda Espinosa',
    tematico: 'Estado de cosas inconstitucional - Desplazamiento forzado',
    resumen: 'Declara el estado de cosas inconstitucional frente al desplazamiento forzado. Considerada una de las sentencias más relevantes de América Latina en materia de protección a población desplazada.',
    linkOficial: 'https://www.corteconstitucional.gov.co/relatoria/2004/t-025-04.htm',
    palabrasClave: ['desplazamiento forzado', 'ECI', 'estado de cosas inconstitucional', 'DIH'],
  },
  {
    id: 'CC-C-577-2011',
    numero: 'C-577/11',
    tipo: 'SENTENCIA_C',
    corporacion: 'CORTE_CONSTITUCIONAL',
    fecha: '2011-07-26',
    magistradoPonente: 'Gabriel Eduardo Mendoza Martelo',
    tematico: 'Matrimonio igualitario - Parejas del mismo sexo',
    resumen: 'Reconoce que las parejas del mismo sexo pueden conformar familia y exhorta al Congreso a legislar. Abre la puerta al matrimonio igualitario en Colombia.',
    linkOficial: 'https://www.corteconstitucional.gov.co/relatoria/2011/c-577-11.htm',
    palabrasClave: ['matrimonio igualitario', 'parejas del mismo sexo', 'familia', 'igualdad', 'LGBTIQ+'],
  },
  {
    id: 'CC-T-622-2016',
    numero: 'T-622/16',
    tipo: 'SENTENCIA_T',
    corporacion: 'CORTE_CONSTITUCIONAL',
    fecha: '2016-11-10',
    magistradoPonente: 'Jorge Iván Palacio Palacio',
    tematico: 'Río Atrato como sujeto de derechos',
    resumen: 'Hito ambiental: declara al Río Atrato como sujeto de derechos, con representación de comunidades y Estado. Primera sentencia en reconocer derechos a un ecosistema en Colombia.',
    linkOficial: 'https://www.corteconstitucional.gov.co/relatoria/2016/t-622-16.htm',
    palabrasClave: ['derechos de la naturaleza', 'río Atrato', 'medio ambiente', 'comunidades afro', 'biocentrismo'],
  },
  // Consejo de Estado
  {
    id: 'CE-11001-03-25-000-2005-00012-00',
    numero: 'Exp. 11001-03-25-000-2005-00012-00',
    tipo: 'SENTENCIA_CE',
    corporacion: 'CONSEJO_DE_ESTADO',
    fecha: '2006-08-17',
    magistradoPonente: 'Alberto Arango Mantilla',
    tematico: 'Nulidad electoral - Principios de transparencia',
    resumen: 'Establece precedente sobre el control judicial de actos electorales y la aplicación del principio de transparencia en la función pública. Referente en derecho electoral colombiano.',
    linkOficial: 'https://www.consejodeestado.gov.co',
    palabrasClave: ['nulidad electoral', 'transparencia', 'función pública', 'control judicial'],
  },
  {
    id: 'CE-15001-23-31-000-2002-00608-01',
    numero: 'Exp. 15001-23-31-000-2002-00608-01',
    tipo: 'SENTENCIA_CE',
    corporacion: 'CONSEJO_DE_ESTADO',
    fecha: '2010-03-11',
    magistradoPonente: 'Mauricio Fajardo Gómez',
    tematico: 'Responsabilidad extracontractual del Estado',
    resumen: 'Consolida la doctrina del daño antijurídico en la responsabilidad del Estado. Establece criterios de imputación objetiva aplicables a fallas del servicio público.',
    linkOficial: 'https://www.consejodeestado.gov.co',
    palabrasClave: ['responsabilidad del Estado', 'daño antijurídico', 'falla del servicio', 'indemnización'],
  },
  // Corte Suprema de Justicia
  {
    id: 'CSJ-SC-1974-2016',
    numero: 'SC1974-2016',
    tipo: 'SENTENCIA_CSJ',
    corporacion: 'CORTE_SUPREMA_DE_JUSTICIA',
    fecha: '2016-02-24',
    magistradoPonente: 'Ariel Salazar Ramírez',
    tematico: 'Responsabilidad civil - Obligaciones de resultado',
    resumen: 'Delimita el alcance de las obligaciones de resultado vs. medios en contratos de servicios profesionales. Precedente clave para responsabilidad médica y profesional.',
    linkOficial: 'https://www.cortesuprema.gov.co',
    palabrasClave: ['responsabilidad civil', 'obligaciones de resultado', 'culpa', 'carga de la prueba'],
  },
  {
    id: 'CC-C-490-2011',
    numero: 'C-490/11',
    tipo: 'SENTENCIA_C',
    corporacion: 'CORTE_CONSTITUCIONAL',
    fecha: '2011-06-23',
    magistradoPonente: 'Luis Ernesto Vargas Silva',
    tematico: 'Paridad de género en listas electorales',
    resumen: 'Condiciona la exequibilidad de normas sobre listas electorales cerradas a que incluyan mínimo el 30% de candidatas mujeres. Fomenta la participación política femenina.',
    linkOficial: 'https://www.corteconstitucional.gov.co/relatoria/2011/c-490-11.htm',
    palabrasClave: ['paridad de género', 'listas electorales', 'mujeres', 'participación política', 'cuota'],
  },
  {
    id: 'CC-SU-214-2016',
    numero: 'SU-214/16',
    tipo: 'SENTENCIA_SU',
    corporacion: 'CORTE_CONSTITUCIONAL',
    fecha: '2016-04-28',
    magistradoPonente: 'Alberto Rojas Ríos',
    tematico: 'Matrimonio igualitario - Consolidación',
    resumen: 'Consolida definitivamente el matrimonio entre parejas del mismo sexo en Colombia, ordenando a notarías y jueces que lo celebren. Supera el exhorto de la C-577/11.',
    linkOficial: 'https://www.corteconstitucional.gov.co/relatoria/2016/su214-16.htm',
    palabrasClave: ['matrimonio igualitario', 'unificación', 'LGBTIQ+', 'igualdad', 'dignidad'],
  },
  {
    id: 'CC-C-226-2023',
    numero: 'C-226/23',
    tipo: 'SENTENCIA_C',
    corporacion: 'CORTE_CONSTITUCIONAL',
    fecha: '2023-06-21',
    magistradoPonente: 'Diana Fajardo Rivera',
    tematico: 'Regulación del cannabis medicinal',
    resumen: 'Examina la constitucionalidad de normas sobre uso médico y científico del cannabis. Establece parámetros para la regulación estatal del cannabis no psicoactivo.',
    linkOficial: 'https://www.corteconstitucional.gov.co/relatoria/2023/c-226-23.htm',
    palabrasClave: ['cannabis medicinal', 'salud', 'regulación', 'libre desarrollo de la personalidad'],
  },
]

// ── Buscar precedentes con filtros ───────────────────────────────────────────

export async function getPrecedentes(
  filters: PrecedentesFilters = {}
): Promise<PaginatedResult<Precedente>> {
  const { query, tipo, corporacion, anio, page = 1, pageSize = 9 } = filters

  let filtered = [...PRECEDENTES_CURADOS]

  if (query && query.trim()) {
    const q = query.toLowerCase()
    filtered = filtered.filter(
      p =>
        p.numero.toLowerCase().includes(q) ||
        p.tematico?.toLowerCase().includes(q) ||
        p.resumen?.toLowerCase().includes(q) ||
        p.palabrasClave?.some(k => k.toLowerCase().includes(q)) ||
        p.magistradoPonente?.toLowerCase().includes(q)
    )
  }

  if (tipo) filtered = filtered.filter(p => p.tipo === tipo)
  if (corporacion) filtered = filtered.filter(p => p.corporacion === corporacion)
  if (anio) filtered = filtered.filter(p => p.fecha.startsWith(anio))

  const total = filtered.length
  const start = (page - 1) * pageSize
  const data = filtered.slice(start, start + pageSize)

  return { data, total, page, pageSize, hasMore: start + pageSize < total }
}

export async function getPrecedenteById(id: string): Promise<Precedente | null> {
  return PRECEDENTES_CURADOS.find(p => p.id === id) ?? null
}

// ── Labels para UI ────────────────────────────────────────────────────────────

export const CORPORACION_LABELS: Record<Corporacion, string> = {
  CORTE_CONSTITUCIONAL: 'Corte Constitucional',
  CONSEJO_DE_ESTADO: 'Consejo de Estado',
  CORTE_SUPREMA_DE_JUSTICIA: 'Corte Suprema de Justicia',
  CONSEJO_SUPERIOR_JUDICATURA: 'Consejo Superior de la Judicatura',
}

export const TIPO_PRECEDENTE_LABELS: Record<TipoPrecedente, string> = {
  SENTENCIA_T: 'Sentencia de Tutela',
  SENTENCIA_C: 'Sentencia de Constitucionalidad',
  SENTENCIA_SU: 'Sentencia de Unificación',
  AUTO: 'Auto',
  SENTENCIA_CE: 'Sentencia Consejo de Estado',
  SENTENCIA_CSJ: 'Sentencia Corte Suprema',
}
