import { db } from '@/lib/database';

export interface ExamenGenerado {
  id?: string;
  docente_id: string;
  pdc_id: string;
  area_id?: string;
  materia_nombre?: string;
  titulo: string;
  narrativa_gamificada: string | null;
  archivo_url: string | null;
  created_at?: string;
  pdcs?: {
    id: string;
    nombre_pdc: string;
  };
}

export interface ReactivoExamen {
  id?: string;
  examen_id: string;
  tipo_reactivo: string;
  subtipo: string | null;
  nivel_bloom: string | null;
  dimension: string | null; // Saber, Hacer, Ser
  enunciado_gamificado: string;
  opciones_json: any;
  respuesta_correcta: string | null;
  justificacion_docente: string | null;
  puntaje: number;
}

export interface InstrumentoCalificacion {
  id?: string;
  examen_id: string;
  tipo_instrumento: string; // rubrica, lista_cotejo, escala_apreciacion
  dimension_evaluada: string; // Hacer, Ser
  criterios_json: any;
  created_at?: string;
}

export class ExamenService {
  async createExamen(examen: Omit<ExamenGenerado, 'id' | 'created_at'>) {
    const { data, error } = await db
      .from('examenes_generados')
      .insert(examen)
      .select()
      .single();

    if (error) throw error;
    return data as ExamenGenerado;
  }

  async createReactivos(reactivos: Omit<ReactivoExamen, 'id'>[]) {
    const { data, error } = await db
      .from('reactivos_examen')
      .insert(reactivos)
      .select();

    if (error) throw error;
    return data as ReactivoExamen[];
  }

  async createInstrumentos(instrumentos: Omit<InstrumentoCalificacion, 'id' | 'created_at'>[]) {
    const { data, error } = await db
      .from('instrumentos_calificacion')
      .insert(instrumentos)
      .select();

    if (error) throw error;
    return data as InstrumentoCalificacion[];
  }

  async getExamenesByDocente(docenteId: string) {
    try {
      const { data, error } = await db
        .from('examenes_generados')
        .select(`
          *,
          pdcs (
            id,
            nombre_pdc
          )
        `)
        .eq('docente_id', docenteId)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST205' || error.code === '42P01') {
          console.warn('Tabla examenes_generados no existe. Devolviendo mock temporal.');
          return [];
        }
        throw error;
      }
      return data;
    } catch (e: any) {
      if (e?.code === 'PGRST205' || e?.code === '42P01') return [];
      throw e;
    }
  }

  async getExamenCompleto(examenId: string) {
    // Obtenemos el examen, sus reactivos y sus instrumentos en paralelo
    const [examenRes, reactivosRes, instrumentosRes] = await Promise.all([
      db.from('examenes_generados').select('*').eq('id', examenId).single(),
      db.from('reactivos_examen').select('*').eq('examen_id', examenId),
      db.from('instrumentos_calificacion').select('*').eq('examen_id', examenId),
    ]);

    if (examenRes.error) throw examenRes.error;
    if (reactivosRes.error) throw reactivosRes.error;
    if (instrumentosRes.error) throw instrumentosRes.error;

    return {
      examen: examenRes.data as ExamenGenerado,
      reactivos: reactivosRes.data as ReactivoExamen[],
      instrumentos: instrumentosRes.data as InstrumentoCalificacion[],
    };
  }
}

export const examenService = new ExamenService();
