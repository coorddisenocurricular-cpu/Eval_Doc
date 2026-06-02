import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini SDK lazily, guarding against missing API Keys as required
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("ADVERTENCIA: GEMINI_API_KEY no configurado en variables de entorno.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API: Health probe
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

// API: Evaluador ABD Inteligente
app.post("/api/evaluate", async (req, res) => {
  try {
    const { nombreDesafio, descripcionCaso, teacherName, materia } = req.body;

    if (!nombreDesafio || !descripcionCaso) {
      return res.status(400).json({ error: "Faltan datos requeridos (nombreDesafio, descripcionCaso)" });
    }

    const ai = getAiClient();
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "Servicio de Evaluación por IA no configurado. Falta la API Key en el panel de secretos."
      });
    }

    const promptText = `
      Actúa como un experto pedagogo especializado en el Aprendizaje Basado en Desafíos (ABD).
      Evalúa el siguiente reporte de clase / evidencias de un docente.
      
      Información General:
      - Docente: ${teacherName || "No especificado"}
      - Materia: ${materia || "No especificada"}
      - Título del Desafío: ${nombreDesafio}
      - Descripción del caso / Evidencias recopiladas: ${descripcionCaso}
      
      Reglas de Evaluación para los 5 criterios base de ABD:
      La escala de puntaje es del 1 al 4, donde:
      1 = Incipiente (No lo aborda o hay deficiencias graves)
      2 = En Desarrollo (Hay intentos pero faltan componentes esenciales, es parcial)
      3 = Logrado (Se cumple de excelente forma según la metodología ABD estándar)
      4 = Sobresaliente (Excede el estándar, muestra innovación sustancial, impacto medible, conexión interdisciplinaria o participación comunitaria asombrosa)

      Criterios a calificar:
      1. Planteamiento del Desafío y Pregunta Esencial: ¿La pregunta es detonante, abierta, relevante y orientada al desafío real? ¿El desafío es de impacto real?
      2. Facilitación de la Investigación: El docente promueve el planteamiento de preguntas guía, búsqueda autónoma, actividades y recursos estructurados.
      3. Guía en el Diseño e Implementación de la Solución: El docente asesora y acompaña activamente en el desarrollo y testeo de una solución tangible.
      4. Evaluación Formativa y Reflexión: Presencia de retroalimentación constante, autoevaluación, coevaluación y momentos explícitos de reflexión del aprendizaje.
      5. Impacto en Contexto Real y Trabajo Colaborativo: Grado de colaboración activa entre estudiantes y si la solución se aplica, entrega o impacta al entorno o comunidad real.

      Proporciona un veredicto científico, crítico y retroalimentador en formato JSON estricto.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: "Eres un evaluador académico estricto de nivel universitario sobre metodologías activas y ABD.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            puntos: {
              type: Type.OBJECT,
              properties: {
                criterio1: { type: Type.INTEGER, description: "Calificación de 1 a 4 para Planteamiento del Desafío" },
                criterio2: { type: Type.INTEGER, description: "Calificación de 1 a 4 para Facilitación de la Investigación" },
                criterio3: { type: Type.INTEGER, description: "Calificación de 1 a 4 para Guía de la Solución" },
                criterio4: { type: Type.INTEGER, description: "Calificación de 1 a 4 para Evaluación y Reflexión" },
                criterio5: { type: Type.INTEGER, description: "Calificación de 1 a 4 para Impacto y Colaboración" },
              },
              required: ["criterio1", "criterio2", "criterio3", "criterio4", "criterio5"],
            },
            justificaciones: {
              type: Type.OBJECT,
              properties: {
                criterio1: { type: Type.STRING, description: "Justificación detallada de la calificación dada en el Criterio 1" },
                criterio2: { type: Type.STRING, description: "Justificación detallada de la calificación dada en el Criterio 2" },
                criterio3: { type: Type.STRING, description: "Justificación detallada de la calificación dada en el Criterio 3" },
                criterio4: { type: Type.STRING, description: "Justificación detallada de la calificación dada en el Criterio 4" },
                criterio5: { type: Type.STRING, description: "Justificación detallada de la calificación dada en el Criterio 5" },
              },
              required: ["criterio1", "criterio2", "criterio3", "criterio4", "criterio5"],
            },
            fortalezas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de al menos 2 fortalezas observadas."
            },
            oportunidades: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de al menos 2 áreas de oportunidad identificadas."
            },
            recomendacionesABD: {
              type: Type.STRING,
              description: "Plan de mejora y consejos concretos ABD para el docente."
            }
          },
          required: ["puntos", "justificaciones", "fortalezas", "oportunidades", "recomendacionesABD"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No se obtuvo respuesta del evaluador de IA.");
    }

    const evaluationResult = JSON.parse(resultText.trim());
    return res.json(evaluationResult);

  } catch (error: any) {
    console.error("Error en evaluación automática:", error);
    return res.status(500).json({ error: error?.message || "Ocurrió un error inesperado al evaluar" });
  }
});

// Configure Vite middleware in development, and serve static assets in production
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Configurando middleware de Vite para desarrollo...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Configurando serving de archivos estáticos para producción...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Escuchando en http://localhost:${PORT}`);
  });
}

setupServer();
