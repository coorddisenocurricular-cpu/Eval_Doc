export interface Docente {
  id: string;
  nombre: string;
  materia: string;
  departamento: string;
  email: string;
  fechaRegistro: string;
}

export interface CriterioPuntaje {
  criterio1: number; // Planteamiento del Desafío y Pregunta Esencial
  criterio2: number; // Facilitación de la Investigación (Preguntas y Recursos Guía)
  criterio3: number; // Guía en el Diseño e Implementación de la Solución
  criterio4: number; // Evaluación Formativa y Reflexión sobre el Aprendizaje
  criterio5: number; // Impacto en Contexto Real y Trabajo Colaborativo
}

export interface CriterioJustificantes {
  criterio1: string;
  criterio2: string;
  criterio3: string;
  criterio4: string;
  criterio5: string;
}

export interface Evaluacion {
  id: string;
  docenteId: string;
  fecha: string;
  nombreDesafio: string;
  descripcionCaso: string; // The text prompt or observational report provided
  puntos: CriterioPuntaje;
  justificaciones: CriterioJustificantes;
  puntajeTotal: number; // Scale out of 100 or 1-4 average
  fortalezas: string[];
  oportunidades: string[];
  recomendacionesABD: string;
}

export interface AppsScriptConfig {
  webhookUrl: string;
  habilitado: boolean;
  ultimoSincro: string | null;
}
