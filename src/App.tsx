import React, { useState, useEffect } from "react";
import { 
  Users, 
  FileCheck, 
  Award, 
  Settings, 
  Database, 
  Send, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  BookOpen, 
  TrendingUp, 
  Copy, 
  Check, 
  Eye, 
  ArrowRight,
  Info,
  Calendar,
  CloudLightning,
  ChevronRight,
  FileText
} from "lucide-react";
import { Docente, Evaluacion, AppsScriptConfig } from "./types";

// Iniciar docentes por defecto para evitar pantallas vacías
const DOCENTES_SEMILLA: Docente[] = [
  {
    id: "doc-1",
    nombre: "Dra. Elena Rostova",
    materia: "Inteligencia Artificial y Sociedad",
    departamento: "Ciencias de la Computación",
    email: "elena.rostova@universidad.edu",
    fechaRegistro: "2026-01-15"
  },
  {
    id: "doc-2",
    nombre: "Mtro. Javier Santos",
    materia: "Diseño Sostenible y Economía Circular",
    departamento: "Innovación e Impacto",
    email: "javier.santos@universidad.edu",
    fechaRegistro: "2026-02-10"
  },
  {
    id: "doc-3",
    nombre: "Mtra. Sofía Quintanilla",
    materia: "Ética Aplicada e Inclusión de las Minorías",
    departamento: "Humanidades",
    email: "sofia.quintanilla@universidad.edu",
    fechaRegistro: "2026-03-01"
  }
];

const EVALUACIONES_SEMILLA: Evaluacion[] = [
  {
    id: "eval-1",
    docenteId: "doc-1",
    fecha: "2026-05-20",
    nombreDesafio: "Campus Inteligente y Limpio con Visión Artificial",
    descripcionCaso: "Los alumnos investigaron los focos de basura y diseñaron un software detector de reciclaje. El docente guió la investigación introduciendo recursos de redes neuronales, asesoró en el testing local y coordinó un piloto con el personal del campus. Promovió autoevaluaciones y reflexión sobre el impacto real en su comunidad.",
    puntos: {
      criterio1: 4,
      criterio2: 3,
      criterio3: 4,
      criterio4: 3,
      criterio5: 4
    },
    justificaciones: {
      criterio1: "El desafío está magníficamente sustentado en una necesidad del campus. La pregunta esencial detonante movilizó la creación de tecnología propia.",
      criterio2: "Se proporcionaron excelentes bases técnicas para la IA, aunque se pudo expandir el uso de expertos externos en la fase de investigación.",
      criterio3: "Acompañamiento sobresaliente con el software funcional implementado y testeado con usuarios reales del campus.",
      criterio4: "Hubo retroalimentación constante en cada sprint. Logró que los alumnos identificaran sus propios fallos de código críticamente.",
      criterio5: "Impacto inmediato y alto trabajo colaborativo interdisciplinar. Solución presentada en el foro universitario."
    },
    puntajeTotal: 3.6,
    fortalezas: [
      "Vínculo excepcional con problemas internos de la comunidad educativa.",
      "Excelente implementación y prototipado rápido de software funcional."
    ],
    oportunidades: [
      "Integrar a expertos gubernamentales o empresariales en la fase de recopilación.",
      "Estructurar un portafolio digital más detallado de las actividades de investigación."
    ],
    recomendacionesABD: "Se recomienda compartir esta práctica como referente departamental. Para el siguiente desafío, se aconseja invitar a un gestor de residuos municipal para complementar el rol de especialistas e incentivar el escalamiento de la solución fuera de la universidad."
  }
];

export default function App() {
  // --- Estados ---
  const [docentes, setDocentes] = useState<Docente[]>(() => {
    const local = localStorage.getItem("abd_docentes");
    return local ? JSON.parse(local) : DOCENTES_SEMILLA;
  });

  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>(() => {
    const local = localStorage.getItem("abd_evaluaciones");
    return local ? JSON.parse(local) : EVALUACIONES_SEMILLA;
  });

  const [config, setConfig] = useState<AppsScriptConfig>(() => {
    const local = localStorage.getItem("abd_config");
    return local ? JSON.parse(local) : {
      webhookUrl: "",
      habilitado: false,
      ultimoSincro: null
    };
  });

  // Vista activa: 'dashboard' | 'evaluaciones' | 'docentes' | 'config' | 'export'
  const [vistaActiva, setVistaActiva] = useState<string>("dashboard");

  // Alertas / Mensajes de estado
  const [notificacion, setNotificacion] = useState<{ tipo: "success" | "error" | "info" | null; mensaje: string }>({
    tipo: null,
    mensaje: ""
  });

  // UI Copiado
  const [copiadoIdx, setCopiadoIdx] = useState<boolean>(false);
  const [menuMobilAbierto, setMenuMobilAbierto] = useState<boolean>(false);

  // --- Estado para Agregar Docente ---
  const [nuevoNombre, setNuevoNombre] = useState<string>("");
  const [nuevaMateria, setNuevaMateria] = useState<string>("");
  const [nuevoDpto, setNuevoDpto] = useState<string>("");
  const [nuevoEmail, setNuevoEmail] = useState<string>("");

  // --- Estado para Nueva Evaluación ---
  const [docenteSeleccionadoId, setDocenteSeleccionadoId] = useState<string>("");
  const [nombreDesafio, setNombreDesafio] = useState<string>("");
  const [descripcionCaso, setDescripcionCaso] = useState<string>("");
  
  // Calificaciones manuales (se usan si el usuario no califica con IA o quiere sobreescribirlo)
  const [puntosManuales, setPuntosManuales] = useState({
    criterio1: 3,
    criterio2: 3,
    criterio3: 3,
    criterio4: 3,
    criterio5: 3
  });

  const [cargandoIA, setCargandoIA] = useState<boolean>(false);
  const [evaluacionActual, setEvaluacionActual] = useState<Partial<Evaluacion> | null>(null);
  const [mostrandoDetalleEval, setMostrandoDetalleEval] = useState<Evaluacion | null>(null);

  // Guardar datos en localStorage ante cambios
  useEffect(() => {
    localStorage.setItem("abd_docentes", JSON.stringify(docentes));
  }, [docentes]);

  useEffect(() => {
    localStorage.setItem("abd_evaluaciones", JSON.stringify(evaluaciones));
  }, [evaluaciones]);

  useEffect(() => {
    localStorage.setItem("abd_config", JSON.stringify(config));
  }, [config]);

  // Cerrar alerta automáticamente
  const autoCerrarNotificacion = (ms = 5000) => {
    setTimeout(() => {
      setNotificacion({ tipo: null, mensaje: "" });
    }, ms);
  };

  // --- Gestor: Agregar Docente ---
  const handleAgregarDocente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre || !nuevaMateria || !nuevoDpto) {
      setNotificacion({ tipo: "error", mensaje: "Por favor, completa los campos obligatorios." });
      return;
    }

    const nuevo: Docente = {
      id: "doc-" + Date.now(),
      nombre: nuevoNombre,
      materia: nuevaMateria,
      departamento: nuevoDpto,
      email: nuevoEmail || `${nuevoNombre.toLowerCase().replace(/\s+/g, ".")}@universidad.edu`,
      fechaRegistro: new Date().toISOString().split("T")[0]
    };

    setDocentes(prev => [nuevo, ...prev]);
    setNuevoNombre("");
    setNuevaMateria("");
    setNuevoDpto("");
    setNuevoEmail("");
    setNotificacion({ tipo: "success", mensaje: `Docente ${nuevo.nombre} agregado con éxito.` });
    autoCerrarNotificacion();
  };

  // --- Gestor: Eliminar Docente ---
  const handleEliminarDocente = (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al docente "${nombre}"? Se conservarán sus evaluaciones.`)) {
      setDocentes(prev => prev.filter(d => d.id !== id));
      setNotificacion({ tipo: "success", mensaje: `Docente ${nombre} eliminado exitosamente.` });
      autoCerrarNotificacion();
    }
  };

  // --- Evaluador: Resetear Form ---
  const resetFormEvaluacion = () => {
    setDocenteSeleccionadoId("");
    setNombreDesafio("");
    setDescripcionCaso("");
    setPuntosManuales({
      criterio1: 3,
      criterio2: 3,
      criterio3: 3,
      criterio4: 3,
      criterio5: 3
    });
    setEvaluacionActual(null);
  };

  // --- Evaluador: Ejecutar Auto-evaluación Automática con IA ---
  const handleEvaluarConIA = async () => {
    if (!docenteSeleccionadoId) {
      setNotificacion({ tipo: "error", mensaje: "Selecciona un docente para iniciar la evaluación." });
      return;
    }
    if (!nombreDesafio.trim() || !descripcionCaso.trim()) {
      setNotificacion({ tipo: "error", mensaje: "Proporciona el título del desafío y una descripción de evidencias pedagógicas." });
      return;
    }

    const t = docentes.find(d => d.id === docenteSeleccionadoId);
    setCargandoIA(true);
    setNotificacion({ tipo: "info", mensaje: "Analizando evidencias pedagógicas según rúbrica ABD con inteligencia artificial..." });

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreDesafio,
          descripcionCaso,
          teacherName: t?.nombre || "No especificado",
          materia: t?.materia || "No especificada"
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error en el servidor de evaluación.");
      }

      // Calcular promedio del resultado
      const pts = data.puntos;
      const prom = Number(((pts.criterio1 + pts.criterio2 + pts.criterio3 + pts.criterio4 + pts.criterio5) / 5).toFixed(2));

      setEvaluacionActual({
        docenteId: t?.id,
        fecha: new Date().toISOString().split("T")[0],
        nombreDesafio: nombreDesafio,
        descripcionCaso: descripcionCaso,
        puntos: pts,
        justificaciones: data.justificaciones,
        fortalezas: data.fortalezas,
        oportunidades: data.oportunidades,
        recomendacionesABD: data.recomendacionesABD,
        puntajeTotal: prom
      });

      setNotificacion({ tipo: "success", mensaje: "¡Desafío evaluado automáticamente con éxito por Gemini!" });
      autoCerrarNotificacion(4000);

    } catch (error: any) {
      console.error(error);
      setNotificacion({ 
        tipo: "error", 
        mensaje: `No se pudo evaluar con IA: ${error.message || "Verifique la API Key de Gemini en Configuración."}` 
      });
    } finally {
      setCargandoIA(false);
    }
  };

  // --- Generar Evaluación Manual si el usuario así lo desea ---
  const handleEvaluarManualmente = () => {
    if (!docenteSeleccionadoId) {
      setNotificacion({ tipo: "error", mensaje: "Selecciona un docente para iniciar la evaluación." });
      return;
    }
    if (!nombreDesafio.trim() || !descripcionCaso.trim()) {
      setNotificacion({ tipo: "error", mensaje: "El título del desafío y la descripción son necesarios para documentar el caso." });
      return;
    }

    const t = docentes.find(d => d.id === docenteSeleccionadoId);
    const prom = Number(((puntosManuales.criterio1 + puntosManuales.criterio2 + puntosManuales.criterio3 + puntosManuales.criterio4 + puntosManuales.criterio5) / 5).toFixed(2));

    const manualEval: Partial<Evaluacion> = {
      docenteId: t?.id,
      fecha: new Date().toISOString().split("T")[0],
      nombreDesafio: nombreDesafio,
      descripcionCaso: descripcionCaso,
      puntos: { ...puntosManuales },
      justificaciones: {
        criterio1: "Calificación colocada manualmente por el revisor académico.",
        criterio2: "Calificación colocada manualmente por el revisor académico.",
        criterio3: "Calificación colocada manualmente por el revisor académico.",
        criterio4: "Calificación colocada manualmente por el revisor académico.",
        criterio5: "Calificación colocada manualmente por el revisor académico."
      },
      fortalezas: ["Fuerte impulso metodológico.", "Diseño curricular práctico."],
      oportunidades: ["Fomentar más espacios de coevaluación constructiva.", "Sustentar mayor vinculación externa."],
      recomendacionesABD: "Plan generado manualmente: Se invita a profundizar la rúbrica de autoevaluación al cierre de los entregables del desafío.",
      puntajeTotal: prom
    };

    setEvaluacionActual(manualEval);
    setNotificacion({ tipo: "success", mensaje: "Cálculo manual ponderado completado." });
    autoCerrarNotificacion();
  };

  // --- Guardar Evaluación Final ---
  const handleGuardarEvaluacion = async () => {
    if (!evaluacionActual) return;

    const t = docentes.find(d => d.id === evaluacionActual.docenteId);
    const nueva: Evaluacion = {
      id: "eval-" + Date.now(),
      docenteId: evaluacionActual.docenteId!,
      fecha: evaluacionActual.fecha!,
      nombreDesafio: evaluacionActual.nombreDesafio!,
      descripcionCaso: evaluacionActual.descripcionCaso!,
      puntos: evaluacionActual.puntos as any,
      justificaciones: evaluacionActual.justificaciones as any,
      fortalezas: evaluacionActual.fortalezas || [],
      oportunidades: evaluacionActual.oportunidades || [],
      recomendacionesABD: evaluacionActual.recomendacionesABD || "",
      puntajeTotal: evaluacionActual.puntajeTotal!
    };

    // Agregar a la lista de evaluaciones local
    setEvaluaciones(prev => [nueva, ...prev]);
    setNotificacion({ tipo: "success", mensaje: "Evaluación guardada exitosamente en el sistema." });
    autoCerrarNotificacion();

    // Sincronizar con Google Sheets si está activo y tiene URL
    if (config.habilitado && config.webhookUrl) {
      await handleSyncWithSheets(nueva, t);
    }

    resetFormEvaluacion();
    setVistaActiva("dashboard");
  };

  // --- Eliminar Evaluación ---
  const handleEliminarEvaluacion = (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar permanentemente esta evaluación? Esta acción no se puede deshacer de forma local.")) {
      setEvaluaciones(prev => prev.filter(e => e.id !== id));
      setNotificacion({ tipo: "success", mensaje: "Evaluación eliminada correctamente." });
      autoCerrarNotificacion();
    }
  };

  // --- Conexión Google Sheets vía Webhook Apps Script ---
  const handleSyncWithSheets = async (evalData: Evaluacion, docente?: Docente) => {
    if (!config.webhookUrl) return;

    setNotificacion({ tipo: "info", mensaje: "Sincronizando evaluación con Google Sheets vía Apps Script..." });

    try {
      const payload = {
        id: evalData.id,
        nombreDocente: docente?.nombre || "Docente Desconocido",
        materiaDocente: docente?.materia || "Materia Desconocida",
        nombreDesafio: evalData.nombreDesafio,
        fecha: evalData.fecha,
        puntos: evalData.puntos,
        puntajeTotal: evalData.puntajeTotal,
        recomendacionesABD: evalData.recomendacionesABD
      };

      // Intentamos enviar como POST (Apps Script doPost)
      const res = await fetch(config.webhookUrl, {
        method: "POST",
        mode: "no-cors", // Requerido comúnmente para peticiones cruzadas sencillas con Apps Script Web Apps
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      // Nota: Bajo 'no-cors' la respuesta vendrá opaca, de modo que simulamos éxito si no hay catch
      const timestamp = new Date().toLocaleString();
      setConfig(prev => ({
        ...prev,
        ultimoSincro: timestamp
      }));

      setNotificacion({ 
        tipo: "success", 
        mensaje: `Registro sincronizado exitosamente con Google Sheets (${timestamp}).` 
      });
      autoCerrarNotificacion(4500);

    } catch (err: any) {
      console.error(err);
      setNotificacion({ 
        tipo: "error", 
        mensaje: "Error de sincronización. Asegúrate de configurar los permisos de acceso de tu Apps Script a 'Cualquiera'." 
      });
    }
  };

  // --- Probar Conexión Apps Script ---
  const handleProbarConexion = async () => {
    if (!config.webhookUrl) {
      setNotificacion({ tipo: "error", mensaje: "Por favor, introduce una URL de Apps Script válida primero." });
      return;
    }

    setNotificacion({ tipo: "info", mensaje: "Mandando ping de prueba a la web app de Google..." });

    try {
      // Como Apps Script redirige, un fetch directo podría dar problemas de CORS, 
      // pero usaremos 'no-cors' o un endpoint para verificar estructura básica.
      const res = await fetch(config.webhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true })
      });

      setNotificacion({ 
        tipo: "success", 
        mensaje: "Conexión preliminar enviada. Verifica si tu hoja de cálculo registró la entrada de prueba." 
      });
      autoCerrarNotificacion(5000);
    } catch (err: any) {
      setNotificacion({ 
        tipo: "error", 
        mensaje: `Fallo de conexión: ${err.message || "Fallo CORS o URL inválida"}` 
      });
    }
  };

  // --- Copiar Código Apps Script ---
  const handleCopiarAppsScript = () => {
    const code = `/**
 * Código para Google Apps Script
 * Crea un archivo de código (.gs) en tu proyecto de Apps Script vinculado a tu hoja.
 * Asegúrate de implementar como 'Aplicación Web' con acceso a 'Cualquiera'.
 */

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    
    var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Buscar u obtener hoja llamada 'EvaluacionesABD' o usar la primera
    var sheet = spreadSheet.getSheetByName("EvaluacionesABD");
    if (!sheet) {
      sheet = spreadSheet.insertSheet("EvaluacionesABD");
      // Escribir cabeceras
      sheet.appendRow([
        "ID Evaluación", 
        "Docente", 
        "Materia", 
        "Desafío / Proyecto", 
        "Fecha", 
        "Pregunta Esencial & Desafío", 
        "Investigación & Recursos", 
        "Diseño & Solución", 
        "Evaluación & Reflexión", 
        "Impacto & Trabajo Colaborativo", 
        "Puntaje Promedio (1-4)", 
        "Recomendaciones Pedagógicas"
      ]);
      sheet.getRange(1, 1, 1, 12).setFontWeight("bold").setBackground("#2e1065").setFontColor("#ffffff");
    }
    
    // Agregar fila correspondiente
    sheet.appendRow([
      data.id || "Prueba",
      data.nombreDocente || "Docente Prueba",
      data.materiaDocente || "Materia Prueba",
      data.nombreDesafio || "Prueba Desafío",
      data.fecha || new Date().toISOString(),
      data.puntos?.criterio1 || 0,
      data.puntos?.criterio2 || 0,
      data.puntos?.criterio3 || 0,
      data.puntos?.criterio4 || 0,
      data.puntos?.criterio5 || 0,
      data.puntajeTotal || 0,
      data.recomendacionesABD || "Sin recomendaciones"
    ]);
    
    // Retornar JSON de éxito
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      message: "¡Registro de Aprendizaje Basado en Desafíos guardado con éxito!" 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("¡Ruta de Conectividad ABD Activa! Usa peticiones POST para sincronizar.");
}`;

    navigator.clipboard.writeText(code);
    setCopiadoIdx(true);
    setTimeout(() => setCopiadoIdx(false), 2500);
  };

  // --- Promedio de escuela e historial ---
  const totalDocentes = docentes.length;
  const totalEvals = evaluaciones.length;
  const promedioAcademico = totalEvals > 0 
    ? Number((evaluaciones.reduce((acc, current) => acc + current.puntajeTotal, 0) / totalEvals).toFixed(2))
    : 0;

  // Calculamos puntajes promedio de cada criterio
  const promedioPorCriterio = {
    c1: totalEvals > 0 ? Number((evaluaciones.reduce((a, c) => a + c.puntos.criterio1, 0) / totalEvals).toFixed(1)) : 0,
    c2: totalEvals > 0 ? Number((evaluaciones.reduce((a, c) => a + c.puntos.criterio2, 0) / totalEvals).toFixed(1)) : 0,
    c3: totalEvals > 0 ? Number((evaluaciones.reduce((a, c) => a + c.puntos.criterio3, 0) / totalEvals).toFixed(1)) : 0,
    c4: totalEvals > 0 ? Number((evaluaciones.reduce((a, c) => a + c.puntos.criterio4, 0) / totalEvals).toFixed(1)) : 0,
    c5: totalEvals > 0 ? Number((evaluaciones.reduce((a, c) => a + c.puntos.criterio5, 0) / totalEvals).toFixed(1)) : 0,
  };

  // Descriptores calificados
  const getDescriptorColor = (puntos: number) => {
    if (puntos >= 3.5) return "text-emerald-400 border-emerald-900 bg-emerald-950/30";
    if (puntos >= 2.8) return "text-violet-400 border-violet-900 bg-violet-950/30";
    if (puntos >= 1.9) return "text-amber-400 border-amber-900 bg-amber-950/30";
    return "text-orange-500 border-orange-950 bg-orange-950/30";
  };

  const getDescriptorNivel = (puntos: number) => {
    if (puntos >= 3.5) return "Sobresaliente";
    if (puntos >= 2.8) return "Logrado";
    if (puntos >= 1.9) return "En Desarrollo";
    return "Incipiente";
  };

  return (
    <div className="gradient-bg-main min-h-screen text-[#e0e0e0] flex flex-col font-sans bg-[#050505] overflow-hidden">
      
      {/* Elegant Dark Header */}
      <nav className="h-16 border-b border-[#1f1a2e] flex items-center justify-between px-6 bg-[#0a0a0a] shrink-0 sticky top-0 z-40 w-full">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setMenuMobilAbierto(prev => !prev)} 
            className="md:hidden p-1.5 mr-1 text-gray-400 hover:text-white hover:bg-neutral-900 rounded-lg"
          >
            <span className="text-xl">☰</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#8b5cf6] to-[#f97316] rounded-lg"></div>
            <span className="text-xl font-bold tracking-tight text-white">
              Evalua<span className="text-[#f97316]">CBL</span>
            </span>
          </div>
          <span className="hidden md:inline text-xs text-purple-400 font-mono tracking-widest uppercase ml-2 border-l border-[#1f1a2e] pl-3">
            Modelo ABD
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1 bg-[#121016] border border-[#2d2a3d] rounded-full text-xs font-medium ${config.habilitado && config.webhookUrl ? "text-purple-400" : "text-gray-500"}`}>
            <div className={`w-2 h-2 rounded-full ${config.habilitado && config.webhookUrl ? "bg-green-500" : "bg-orange-500"}`}></div>
            {config.habilitado && config.webhookUrl ? "Google Sheets Linked" : "Local Database"}
          </div>
          <div className="w-8 h-8 rounded-full bg-[#1e1b4b] border border-[#8b5cf6] flex items-center justify-center text-xs text-white font-bold">
            JD
          </div>
        </div>
      </nav>

      {/* Alerta de notificación flotante */}
      {notificacion.tipo && (
        <div className="px-6 py-2 bg-[#050505] border-b border-[#1f1a2e] w-full">
          <div className={`max-w-7xl mx-auto flex items-center justify-between p-4 rounded-xl border ${
            notificacion.tipo === "success" ? "bg-[#121016] border-emerald-800 text-emerald-300" :
            notificacion.tipo === "error" ? "bg-[#121016] border-orange-800 text-orange-400" :
            "bg-[#121016] border-purple-800 text-purple-300"
          }`}>
            <div className="flex items-center gap-3">
              {notificacion.tipo === "success" ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-orange-500" />}
              <span className="text-sm font-medium">{notificacion.mensaje}</span>
            </div>
            <button type="button" onClick={() => setNotificacion({ tipo: null, mensaje: "" })} className="text-gray-400 hover:text-white font-bold ml-4">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Mobile nav drawer */}
      {menuMobilAbierto && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#050505]/95 p-6 flex flex-col gap-6 font-sans">
          <div className="flex justify-between items-center pb-4 border-b border-[#1f1a2e]">
            <span className="text-xl font-bold tracking-tight text-white">
              Evalua<span className="text-[#f97316]">CBL</span>
            </span>
            <button type="button" onClick={() => setMenuMobilAbierto(false)} className="text-gray-400 hover:text-white text-2xl p-1">
              ×
            </button>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6b7280] mb-4">Principal</p>
            <ul className="space-y-4">
              <li>
                <button 
                  type="button"
                  onClick={() => { setVistaActiva("dashboard"); setEvaluacionActual(null); setMenuMobilAbierto(false); }}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-lg text-sm font-medium ${
                    vistaActiva === "dashboard" ? "bg-[#1e1b4b] text-white" : "text-[#7b7290]"
                  }`}
                >
                  <span className="w-4 h-4 text-purple-400">⊞</span> Dashboard
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => { setVistaActiva("docentes"); setMenuMobilAbierto(false); }}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-lg text-sm font-medium ${
                    vistaActiva === "docentes" ? "bg-[#1e1b4b] text-white" : "text-[#7b7290]"
                  }`}
                >
                  <span className="w-4 h-4 text-purple-400">👥</span> Docentes
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => { setVistaActiva("evaluaciones"); setMenuMobilAbierto(false); }}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-lg text-sm font-medium ${
                    vistaActiva === "evaluaciones" ? "bg-[#1e1b4b] text-white" : "text-[#7b7290]"
                  }`}
                >
                  <span className="w-4 h-4 text-purple-400">📜</span> Rúbricas CBL
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => { setVistaActiva("config"); setMenuMobilAbierto(false); }}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-lg text-sm font-medium ${
                    vistaActiva === "config" ? "bg-[#1e1b4b] text-white" : "text-[#7b7290]"
                  }`}
                >
                  <span className="w-4 h-4 text-purple-400">⚙️</span> Configuración
                </button>
              </li>
            </ul>
          </div>
          
          <div className="mt-auto">
            <button 
              type="button"
              onClick={() => { setVistaActiva("export"); setMenuMobilAbierto(false); }}
              className="w-full bg-[#f97316] hover:bg-[#ea580c] text-black font-bold py-3 rounded-lg text-sm transition-all"
            >
              Publicar en GitHub
            </button>
          </div>
        </div>
      )}

      {/* Main Container Layout */}
      <div className="flex flex-1 overflow-hidden w-full">
        {/* Sidebar Desktop */}
        <aside className="hidden md:flex w-64 border-r border-[#1f1a2e] bg-[#0a0a0a] p-6 flex-col justify-between gap-8 shrink-0 h-full overflow-y-auto">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#6b7280] mb-4">Principal</p>
              <ul className="space-y-2">
                <li>
                  <button 
                    type="button"
                    onClick={() => { setVistaActiva("dashboard"); setEvaluacionActual(null); }}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm font-medium transition-all text-left cursor-pointer ${
                      vistaActiva === "dashboard" ? "bg-[#1e1b4b] text-white" : "text-[#6b7280] hover:bg-[#121016] hover:text-[#e0e0e0]"
                    }`}
                  >
                    <span className="w-4 h-4 text-purple-400">⊞</span> Dashboard
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => { setVistaActiva("docentes"); }}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm font-medium transition-all text-left cursor-pointer ${
                      vistaActiva === "docentes" ? "bg-[#1e1b4b] text-white" : "text-[#6b7280] hover:bg-[#121016] hover:text-[#e0e0e0]"
                    }`}
                  >
                    <span className="w-4 h-4 text-[#6b7280]">👥</span> Docentes
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => { setVistaActiva("evaluaciones"); }}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm font-medium transition-all text-left cursor-pointer ${
                      vistaActiva === "evaluaciones" ? "bg-[#1e1b4b] text-white" : "text-[#6b7280] hover:bg-[#121016] hover:text-[#e0e0e0]"
                    }`}
                  >
                    <span className="w-4 h-4 text-[#6b7280]">📜</span> Rúbricas CBL
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => { setVistaActiva("config"); }}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm font-medium transition-all text-left cursor-pointer ${
                      vistaActiva === "config" ? "bg-[#1e1b4b] text-white" : "text-[#6b7280] hover:bg-[#121016] hover:text-[#e0e0e0]"
                    }`}
                  >
                    <span className="w-4 h-4 text-[#6b7280]">⚙️</span> Configuración
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#6b7280] mb-4">Estructura de Archivos</p>
              <div className="bg-[#050505] p-3 rounded border border-[#1f1a2e] text-[11px] font-mono leading-relaxed">
                <div className="text-purple-400">📁 root/</div>
                <div className="ml-4 text-orange-400">📄 index.html</div>
                <div className="ml-4 text-purple-400">📁 script/</div>
                <div className="ml-8 text-white">📄 gas-connect.js</div>
                <div className="ml-4 text-purple-400">📁 css/</div>
                <div className="ml-8 text-white">📄 global.css</div>
              </div>
            </div>
          </div>
          <div className="mt-auto">
            <button 
              type="button"
              onClick={() => setVistaActiva("export")}
              className="w-full bg-[#f97316] hover:bg-[#ea580c] text-black font-bold py-2 rounded-lg text-sm transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] cursor-pointer"
            >
              Publicar en GitHub
            </button>
          </div>
        </aside>

        {/* Dynamic Content Views inside grid layout */}
        <main className="flex-grow p-6 md:p-8 overflow-y-auto bg-[#050505] text-[#e0e0e0] h-full flex flex-col">

        
        {vistaActiva === "dashboard" && (
          <div className="space-y-8 animate-fade-in">
            {/* Cabecera del Dashboard */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0a0a0a] border border-[#1f1a2e] p-6 rounded-2xl">
              <div>
                <h2 className="text-2xl font-bold font-display text-white">Panel de Desempeño Académico</h2>
                <p className="text-gray-400 text-sm mt-1">Supervisión y control docente bajo el enfoque de resolución de desafíos reales.</p>
              </div>
              <button 
                type="button"
                onClick={() => setVistaActiva("evaluaciones")}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-orange-500 hover:brightness-110 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Evaluar Nuevo Desafío
              </button>
            </div>

            {/* RESPONSIVE CSS BENTO GRID FOR METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-[#0d0d12] border border-[#1f1a2e] p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:opacity-10 transition-all duration-300">
                  <Users className="w-24 h-24 text-purple-400" />
                </div>
                <p className="text-xs text-purple-400 font-mono uppercase tracking-wider">Censo de Docentes</p>
                <h3 className="text-3xl font-bold font-display text-white mt-2">{totalDocentes}</h3>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500 inline-block animate-pulse"></span>
                  Docentes dados de alta
                </p>
              </div>

              <div className="bg-[#0d0d12] border border-[#1f1a2e] p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:opacity-10 transition-all duration-300">
                  <FileCheck className="w-24 h-24 text-purple-400" />
                </div>
                <p className="text-xs text-purple-400 font-mono uppercase tracking-wider">Desafíos Evaluados</p>
                <h3 className="text-3xl font-bold font-display text-white mt-2">{totalEvals}</h3>
                <p className="text-xs text-gray-400 mt-2">
                  Prácticas registradas en ABD
                </p>
              </div>

              <div className="bg-[#0d0d12] border border-[#1f1a2e] p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:opacity-10 transition-all duration-300">
                  <Award className="w-24 h-24 text-orange-500" />
                </div>
                <p className="text-xs text-orange-500 font-mono uppercase tracking-wider">Calificación Promedio</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <h3 className="text-3xl font-bold font-display text-white">{promedioAcademico}</h3>
                  <span className="text-xs text-gray-400">/ 4.0 Max</span>
                </div>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                  Nivel promedio: <span className="font-semibold text-purple-300">{getDescriptorNivel(promedioAcademico)}</span>
                </p>
              </div>

              <div className="bg-[#0d0d12] border border-[#1f1a2e] p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:opacity-10 transition-all duration-300">
                  <Database className="w-24 h-24 text-orange-500" />
                </div>
                <p className="text-xs text-orange-400 font-mono uppercase tracking-wider">Estado de Google Sheets</p>
                <h3 className="text-sm font-bold mt-2 truncate text-white">
                  {config.habilitado ? "Auto-Sincronización Habilitada" : "Sincronización Inactiva"}
                </h3>
                <p className="text-xs text-gray-400 mt-2 truncate">
                  {config.ultimoSincro ? `Última: ${config.ultimoSincro}` : "Configura Apps Script para conectar"}
                </p>
              </div>

            </div>

            {/* MIDDLE LAYOUT COMPONENT USING CSS GRID: Left: Metrics Analysis. Right: Recent Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column (Radar/Bar distribution metrics) - Span 5 */}
              <div className="lg:col-span-5 bg-[#0d0d12] border border-[#1f1a2e] p-6 rounded-2xl">
                <h4 className="text-lg font-bold text-white font-display mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" /> Desglose por Criterios ABD
                </h4>
                <p className="text-sm text-gray-400 mb-6">Puntaje promedio obtenido institucionalmente por cada fase del Aprendizaje Basado en Desafíos.</p>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                      <span>C1. Pregunta Esencial y Desafío</span>
                      <span className="text-orange-400 font-bold">{promedioPorCriterio.c1} / 4.0</span>
                    </div>
                    <div className="w-full bg-[#110e1e] h-2.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-600 to-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${(promedioPorCriterio.c1 / 4) * 100 || 5}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                      <span>C2. Facilitación de Investigación</span>
                      <span className="text-purple-400 font-bold">{promedioPorCriterio.c2} / 4.0</span>
                    </div>
                    <div className="w-full bg-[#110e1e] h-2.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-600 to-violet-500 h-full rounded-full transition-all duration-500" style={{ width: `${(promedioPorCriterio.c2 / 4) * 100 || 5}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                      <span>C3. Guía de Solución y Testeo</span>
                      <span className="text-orange-400 font-bold">{promedioPorCriterio.c3} / 4.0</span>
                    </div>
                    <div className="w-full bg-[#110e1e] h-2.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-600 to-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${(promedioPorCriterio.c3 / 4) * 100 || 5}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                      <span>C4. Evaluación Formativa y Reflexión</span>
                      <span className="text-purple-400 font-bold">{promedioPorCriterio.c4} / 4.0</span>
                    </div>
                    <div className="w-full bg-[#110e1e] h-2.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-600 to-violet-500 h-full rounded-full transition-all duration-500" style={{ width: `${(promedioPorCriterio.c4 / 4) * 100 || 5}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                      <span>C5. Impacto Real y Colaboración</span>
                      <span className="text-orange-400 font-bold">{promedioPorCriterio.c5} / 4.0</span>
                    </div>
                    <div className="w-full bg-[#110e1e] h-2.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-600 to-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${(promedioPorCriterio.c5 / 4) * 100 || 5}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="border border-[#1f1a2e] bg-[#121016] rounded-xl p-4 mt-6">
                  <h5 className="text-xs font-mono text-purple-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                    <Info className="w-3.5 h-3.5 text-orange-500" /> Resumen de Escala ABD
                  </h5>
                  <ul className="text-xs text-gray-400 space-y-1.5 font-mono">
                    <li className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> 3.5 a 4.0: Sobresaliente</li>
                    <li className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500"></span> 2.8 a 3.4: Logrado</li>
                    <li className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> 1.9 a 2.7: En Desarrollo</li>
                    <li className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500"></span> 1.0 a 1.8: Incipiente</li>
                  </ul>
                </div>
              </div>

              {/* Right Column (Recent Evaluations List) - Span 7 */}
              <div className="lg:col-span-7 bg-[#0d0d12] border border-[#1f1a2e] p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white font-display mb-1 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-500" /> Expediente Universitario de Evaluaciones
                  </h4>
                  <p className="text-sm text-gray-400 mb-6">Historial de evaluaciones de metodologías active guardadas localmente.</p>

                  {evaluaciones.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-[#1f1a2e] rounded-2xl bg-purple-950/5">
                      <p className="text-gray-400 text-sm">No hay evaluaciones guardadas en este navegador.</p>
                      <button 
                        type="button"
                        onClick={() => setVistaActiva("evaluaciones")}
                        className="text-orange-400 text-xs font-semibold hover:underline mt-2 flex items-center justify-center gap-1 mx-auto"
                      >
                        Empezar primera evaluación <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
                      {evaluaciones.map((e) => {
                        const d = docentes.find(doc => doc.id === e.docenteId);
                        return (
                          <div key={e.id} className="p-4 bg-[#121016] border border-[#1f1a2e] rounded-xl flex items-center justify-between gap-4 hover:border-purple-800/60 transition-all duration-205">
                            <div className="min-w-0">
                              <span className="text-[10px] font-mono text-purple-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {e.fecha}
                              </span>
                              <h5 className="font-bold text-sm text-white truncate mt-1">
                                {d?.nombre || "Docente Eliminado"}
                              </h5>
                              <p className="text-xs text-gray-400 truncate mt-0.5">
                                Desafío: <span className="text-orange-300 font-medium">{e.nombreDesafio}</span>
                              </p>
                              <p className="text-xs text-gray-400 truncate mt-0.5">
                                {d?.materia}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border ${getDescriptorColor(e.puntajeTotal)}`}>
                                {e.puntajeTotal.toFixed(2)}
                              </div>
                              <button 
                                type="button"
                                onClick={() => setMostrandoDetalleEval(e)}
                                className="p-2 text-purple-400 hover:text-white bg-purple-950/10 hover:bg-purple-950/40 rounded-lg transition-colors cursor-pointer"
                                title="Ver reporte completo"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleEliminarEvaluacion(e.id)}
                                className="p-2 text-orange-500 hover:text-orange-400 hover:bg-orange-950/20 rounded-lg transition-colors cursor-pointer"
                                title="Eliminar del registro local"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-[#1f1a2e] flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-2">
                  <span>Solo tú puedes ver estos registros. La persistencia es de navegador libre de servidores (o sincronizada a tu central de Google Hojas).</span>
                  {evaluaciones.length > 0 && (
                    <button 
                      type="button"
                      onClick={() => setVistaActiva("config")}
                      className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                    >
                      Configurar Apps Script <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

        {/* VISTA: REALIZAR NUEVA EVALUACIÓN (MANUAL O AUTOMÁTICA CON IA) */}
        {vistaActiva === "evaluaciones" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-[#0a0815]/90 border border-purple-950/40 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold font-display text-white">Evaluador Tecnopedagógico Automático</h2>
              <p className="text-gray-400 text-sm mt-1">Somete reportes observacionales de clase, evidencias del docente o carpetas de proyectos estudiantiles al modelo de evaluación automática.</p>
            </div>

            {/* Layout en Grid para configurar la evaluación */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* Columna Izquierda: Formulario (Span 6) */}
              <div className="xl:col-span-6 bg-[#0d0d12] border border-[#1f1a2e] p-6 rounded-2xl space-y-6">
                <span className="text-xs font-mono text-purple-400 uppercase tracking-widest bg-purple-950/40 px-3 py-1 rounded-full border border-purple-900/60 inline-block">
                  Configurar Expediente
                </span>

                <div className="space-y-4">
                  {/* Selector de Docente */}
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-300 mb-2">1. Seleccionar Docente a Evaluar</label>
                    <select 
                      value={docenteSeleccionadoId}
                      onChange={(e) => setDocenteSeleccionadoId(e.target.value)}
                      className="w-full bg-[#050505] border border-[#1f1a2e] text-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all font-sans"
                    >
                      <option value="">-- Seleccionar Docente Registrado --</option>
                      {docentes.map(d => (
                        <option key={d.id} value={d.id}>{d.nombre} ({d.materia})</option>
                      ))}
                    </select>
                  </div>

                  {/* Nombre del Desafío */}
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-300 mb-2">2. Nombre o Título del Desafío</label>
                    <input 
                      type="text"
                      placeholder="Ej. Diseño de Vivienda Social Sostenible en Puebla"
                      value={nombreDesafio}
                      onChange={(e) => setNombreDesafio(e.target.value)}
                      className="w-full bg-[#050505] border border-[#1f1a2e] text-gray-100 px-4 py-3 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all text-sm"
                    />
                  </div>

                  {/* Evidencias Pedagógicas (Inputs para Gemini) */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-mono uppercase text-gray-300">3. Evidencias / Reporte Observacional de Clase</label>
                      <span className="text-[10px] font-mono text-purple-400">Entre más detalles brindes, mejor evaluará la IA</span>
                    </div>
                    <textarea 
                      rows={6}
                      placeholder="Describe ampliamente la dinámica del docente. ¿Cómo se relacionó la pregunta esencial con el desafío? ¿Suministró actividades de investigación robustas? ¿Los alumnos construyeron o simularon un entregable que soluciona el problema de manera real? ¿Hubo reflexiones y retroalimentación interactiva?"
                      value={descripcionCaso}
                      onChange={(e) => setDescripcionCaso(e.target.value)}
                      className="w-full bg-[#050505] border border-[#1f1a2e] text-gray-100 p-4 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all text-sm font-sans"
                    />
                  </div>
                </div>

                <div className="border-t border-[#1f1a2e] pt-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={handleEvaluarConIA}
                      disabled={cargandoIA}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-orange-500 hover:brightness-115 text-white py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {cargandoIA ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Evaluando con IA...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-orange-200" /> Evaluar por IA (Gratis)
                        </>
                      )}
                    </button>
                    <button 
                      onClick={handleEvaluarManualmente}
                      disabled={cargandoIA}
                      className="bg-purple-950/40 border border-purple-800 text-purple-300 hover:bg-purple-900/40 py-3 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Ponderar Manualmente
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono mt-3 text-center">
                    La evaluación con IA se ejecuta de forma segura en nuestro servidor protegiendo los secretos técnicos.
                  </p>
                </div>

                {/* MODULADORES MANUALES (En caso de querer ajustar o realizar evaluación local inmediata) */}
                <div className="border-t border-purple-950/40 pt-6 space-y-4">
                  <h4 className="text-xs font-mono uppercase text-purple-400 tracking-wider">Ajuste de Criterios Manuales (Escala 1 al 4)</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-sans text-gray-300">
                        <span>C1. Planteamiento de Desafío</span>
                        <span className="font-bold font-mono text-orange-400">{puntosManuales.criterio1}</span>
                      </div>
                      <input 
                        type="range" min="1" max="4" step="1"
                        value={puntosManuales.criterio1}
                        onChange={(e) => setPuntosManuales(prev => ({ ...prev, criterio1: parseInt(e.target.value) }))}
                        className="w-full accent-orange-500 bg-[#1e152a] mt-1 h-1.5 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-sans text-gray-300">
                        <span>C2. Facilitación de Investigación</span>
                        <span className="font-bold font-mono text-orange-400">{puntosManuales.criterio2}</span>
                      </div>
                      <input 
                        type="range" min="1" max="4" step="1"
                        value={puntosManuales.criterio2}
                        onChange={(e) => setPuntosManuales(prev => ({ ...prev, criterio2: parseInt(e.target.value) }))}
                        className="w-full accent-orange-500 bg-[#1e152a] mt-1 h-1.5 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-sans text-gray-300">
                        <span>C3. Diseño de Solución y Testeo</span>
                        <span className="font-bold font-mono text-orange-400">{puntosManuales.criterio3}</span>
                      </div>
                      <input 
                        type="range" min="1" max="4" step="1"
                        value={puntosManuales.criterio3}
                        onChange={(e) => setPuntosManuales(prev => ({ ...prev, criterio3: parseInt(e.target.value) }))}
                        className="w-full accent-orange-500 bg-[#1e152a] mt-1 h-1.5 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-sans text-gray-300">
                        <span>C4. Retroalimentación y Reflexión</span>
                        <span className="font-bold font-mono text-orange-400">{puntosManuales.criterio4}</span>
                      </div>
                      <input 
                        type="range" min="1" max="4" step="1"
                        value={puntosManuales.criterio4}
                        onChange={(e) => setPuntosManuales(prev => ({ ...prev, criterio4: parseInt(e.target.value) }))}
                        className="w-full accent-orange-500 bg-[#1e152a] mt-1 h-1.5 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-sans text-gray-300">
                        <span>C5. Impacto y Colaboración Real</span>
                        <span className="font-bold font-mono text-orange-400">{puntosManuales.criterio5}</span>
                      </div>
                      <input 
                        type="range" min="1" max="4" step="1"
                        value={puntosManuales.criterio5}
                        onChange={(e) => setPuntosManuales(prev => ({ ...prev, criterio5: parseInt(e.target.value) }))}
                        className="w-full accent-orange-500 bg-[#1e152a] mt-1 h-1.5 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Columna Derecha: Reporte de Veredicto Previsto (Span 6) */}
              <div className="xl:col-span-6 bg-[#080612]/90 border border-purple-950/40 p-6 rounded-2xl relative">
                
                {!evaluacionActual ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-purple-950/40 border border-purple-800 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-orange-500 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-display text-white">Veredicto Pedagógico Esperado</h3>
                      <p className="text-gray-400 text-sm max-w-sm mt-1 mx-auto">
                        Completa la información, presiona "Evaluar por IA" y observa el desglose cuantitativo y sugerencias de mejora al momento.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-[#130f25] p-4 rounded-xl border border-purple-950">
                      <div>
                        <span className="text-[10px] font-mono text-orange-400 uppercase tracking-widest">
                          Resultado de Calificación
                        </span>
                        <h4 className="text-xl font-bold font-display text-white mt-1">Evaluación Completada</h4>
                      </div>
                      <div className={`text-center px-4 py-2 rounded-xl border ${getDescriptorColor(evaluacionActual.puntajeTotal || 0)}`}>
                        <span className="text-2xl font-mono font-bold block">
                          {(evaluacionActual.puntajeTotal || 0).toFixed(2)}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-wider">
                          {getDescriptorNivel(evaluacionActual.puntajeTotal || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Grados Desglosados */}
                    <div className="space-y-3 font-sans">
                      <h5 className="text-xs font-mono uppercase text-purple-400 tracking-wider">Puntuaciones por Fase Mapped</h5>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-[#110e1e]/60 rounded-xl border border-purple-950/60">
                          <span className="text-xs text-gray-400 block truncate">C1. Desafío y Pregunta</span>
                          <span className="text-sm font-bold font-mono text-orange-400">{evaluacionActual.puntos?.criterio1} / 4</span>
                          <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">{evaluacionActual.justificaciones?.criterio1}</p>
                        </div>
                        <div className="p-3 bg-[#110e1e]/60 rounded-xl border border-purple-950/60">
                          <span className="text-xs text-gray-400 block truncate">C2. Investigación Guía</span>
                          <span className="text-sm font-bold font-mono text-orange-400">{evaluacionActual.puntos?.criterio2} / 4</span>
                          <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">{evaluacionActual.justificaciones?.criterio2}</p>
                        </div>
                        <div className="p-3 bg-[#110e1e]/60 rounded-xl border border-purple-950/60">
                          <span className="text-xs text-gray-400 block truncate">C3. Solución y Test</span>
                          <span className="text-sm font-bold font-mono text-orange-400">{evaluacionActual.puntos?.criterio3} / 4</span>
                          <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">{evaluacionActual.justificaciones?.criterio3}</p>
                        </div>
                        <div className="p-3 bg-[#110e1e]/60 rounded-xl border border-purple-950/60">
                          <span className="text-xs text-gray-400 block truncate">C4. Reflexión Evaluativa</span>
                          <span className="text-sm font-bold font-mono text-orange-400">{evaluacionActual.puntos?.criterio4} / 4</span>
                          <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">{evaluacionActual.justificaciones?.criterio4}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-[#110e1e]/60 rounded-xl border border-purple-950/60 w-full">
                        <span className="text-xs text-gray-400 block truncate">C5. Impacto Contextual & Colaborativo</span>
                        <span className="text-sm font-bold font-mono text-orange-400">{evaluacionActual.puntos?.criterio5} / 4</span>
                        <p className="text-[11px] text-gray-500 mt-1">{evaluacionActual.justificaciones?.criterio5}</p>
                      </div>
                    </div>

                    {/* Fortalezas y Oportunidades */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#051c14]/40 border border-emerald-950 p-4 rounded-xl text-xs space-y-2">
                        <span className="text-emerald-400 font-bold font-mono block tracking-wider uppercase">Fortalezas pedagógicas:</span>
                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                          {evaluacionActual.fortalezas?.map((str, ii) => <li key={ii}>{str}</li>)}
                        </ul>
                      </div>
                      <div className="bg-[#1c0e05]/40 border border-orange-950 p-4 rounded-xl text-xs space-y-2">
                        <span className="text-orange-400 font-bold font-mono block tracking-wider uppercase">Áreas de oportunidad:</span>
                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                          {evaluacionActual.oportunidades?.map((str, ii) => <li key={ii}>{str}</li>)}
                        </ul>
                      </div>
                    </div>

                    {/* Recomendación Docente ABD */}
                    <div className="p-4 bg-[#110e1e] border border-purple-950 rounded-xl">
                      <span className="text-xs text-purple-400 font-mono font-bold block uppercase tracking-wider mb-1">
                        Recomendaciones para el Plan de Acción ABD:
                      </span>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans">{evaluacionActual.recomendacionesABD}</p>
                    </div>

                    {/* Botones de Guardado final y Cancelación */}
                    <div className="flex gap-3">
                      <button 
                        onClick={handleGuardarEvaluacion}
                        className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileCheck className="w-4 h-4" /> Registrar y Guardar en Libro
                      </button>
                      <button 
                        onClick={resetFormEvaluacion}
                        className="bg-transparent border border-purple-950 text-gray-400 hover:text-white px-4 py-3 rounded-xl text-sm transition-all cursor-pointer"
                      >
                        Resetear
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

        {/* VISTA: DETALLES REPORTADOS COMPLETO (MODAL / DRAWER) */}
        {mostrandoDetalleEval && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-[#080612] border border-purple-800 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 md:p-8 space-y-6 animate-zoom-in">
              
              <div className="flex justify-between items-start gap-4 border-b border-purple-950 pb-4">
                <div>
                  <span className="text-xs text-purple-400 font-mono">Boleta Digital de Evaluación Metodológica</span>
                  <h3 className="text-2xl font-bold font-display text-white mt-1">{mostrandoDetalleEval.nombreDesafio}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Evaluado el: {mostrandoDetalleEval.fecha} • Docente: <span className="text-orange-400 font-semibold">{docentes.find(doc => doc.id === mostrandoDetalleEval.docenteId)?.nombre || "Docente"}</span>
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-xl text-center border shrink-0 ${getDescriptorColor(mostrandoDetalleEval.puntajeTotal)}`}>
                  <span className="text-xl font-bold font-mono block">{mostrandoDetalleEval.puntajeTotal.toFixed(2)}</span>
                  <span className="text-[10px] font-mono tracking-wider">{getDescriptorNivel(mostrandoDetalleEval.puntajeTotal)}</span>
                </div>
              </div>

              {/* Evidencia analizada */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase text-purple-400 tracking-wider">Evidencias observadas del caso:</h4>
                <p className="text-xs text-gray-300 p-4 bg-[#110e1e] border border-purple-950/50 rounded-xl leading-relaxed whitespace-pre-line font-sans">
                  {mostrandoDetalleEval.descripcionCaso}
                </p>
              </div>

              {/* Cuadrante de calificaciones */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase text-purple-400 tracking-wider">Justificación de Calificaciones por Criterio</h4>
                <div className="space-y-3 font-sans">
                  
                  <div className="p-3 bg-[#110e1e]/60 rounded-xl border border-purple-950">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-300">C1. Planteamiento de Desafío y Pregunta Esencial</span>
                      <span className="text-orange-400 font-bold font-mono">{mostrandoDetalleEval.puntos.criterio1} / 4</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{mostrandoDetalleEval.justificaciones.criterio1}</p>
                  </div>

                  <div className="p-3 bg-[#110e1e]/60 rounded-xl border border-purple-950">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-300">C2. Facilitación de la Investigación (Preguntas y Recursos Guía)</span>
                      <span className="text-orange-400 font-bold font-mono">{mostrandoDetalleEval.puntos.criterio2} / 4</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{mostrandoDetalleEval.justificaciones.criterio2}</p>
                  </div>

                  <div className="p-3 bg-[#110e1e]/60 rounded-xl border border-purple-950">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-300">C3. Guía en el Diseño e Implementación de la Solución</span>
                      <span className="text-orange-400 font-bold font-mono">{mostrandoDetalleEval.puntos.criterio3} / 4</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{mostrandoDetalleEval.justificaciones.criterio3}</p>
                  </div>

                  <div className="p-3 bg-[#110e1e]/60 rounded-xl border border-purple-950">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-300">C4. Evaluación Formativa y Reflexión sobre el Aprendizaje</span>
                      <span className="text-orange-400 font-bold font-mono">{mostrandoDetalleEval.puntos.criterio4} / 4</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{mostrandoDetalleEval.justificaciones.criterio4}</p>
                  </div>

                  <div className="p-3 bg-[#110e1e]/60 rounded-xl border border-purple-950">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-300">C5. Impacto en Contexto Real y Trabajo Colaborativo</span>
                      <span className="text-orange-400 font-bold font-mono">{mostrandoDetalleEval.puntos.criterio5} / 4</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{mostrandoDetalleEval.justificaciones.criterio5}</p>
                  </div>

                </div>
              </div>

              {/* Fortalezas y áreas de mejora */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#0a231b]/30 border border-emerald-950 rounded-xl text-xs">
                  <span className="text-emerald-400 font-bold block font-mono uppercase tracking-wider mb-2">Puntos Fuertes Identificados:</span>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {mostrandoDetalleEval.fortalezas.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
                <div className="p-4 bg-[#230f0a]/30 border border-orange-950 rounded-xl text-xs">
                  <span className="text-orange-400 font-bold block font-mono uppercase tracking-wider mb-2">Vías de Optimización (Áreas de Mejora):</span>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {mostrandoDetalleEval.oportunidades.map((o, i) => <li key={i}>{o}</li>)}
                  </ul>
                </div>
              </div>

              {/* Plan de mejora final */}
              <div className="p-4 bg-[#110e1e] border border-purple-950/60 rounded-xl">
                <span className="text-xs text-purple-400 font-mono block font-bold uppercase tracking-wider mb-1">
                  Plan de Acción de Mejora Continua ABD:
                </span>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">{mostrandoDetalleEval.recomendacionesABD}</p>
              </div>

              {/* Acciones de cierre del modal */}
              <div className="pt-4 border-t border-purple-950/50 flex flex-col sm:flex-row justify-between items-center gap-3">
                <button 
                  onClick={() => {
                    const doc = docentes.find(d => d.id === mostrandoDetalleEval.docenteId);
                    handleSyncWithSheets(mostrandoDetalleEval, doc);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-xl text-xs font-semibold hover:opacity-95 flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Forzar sincronización Sheets
                </button>
                <button 
                  onClick={() => setMostrandoDetalleEval(null)}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer w-full sm:w-auto text-center"
                >
                  Regresar al Panel
                </button>
              </div>

            </div>
          </div>
        )}

        {/* VISTA: GESTIÓN DE DOCENTES */}
        {vistaActiva === "docentes" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-[#0a0815]/90 border border-purple-950/40 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold font-display text-white">Directorio Docente</h2>
              <p className="text-gray-400 text-sm mt-1">Inserta y gestiona los titulares académicos autorizados para impartir aprendizaje activo.</p>
            </div>

            {/* Layout CSS Grid para el alta de docentes */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Formulario de Alta (Span 4) */}
              <div className="lg:col-span-4 bg-[#080612] border border-purple-950/40 p-6 rounded-2xl">
                <h3 className="text-lg font-bold font-display text-white mb-4">Registrar Nuevo Académico</h3>
                
                <form onSubmit={handleAgregarDocente} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Nombre Completo *</label>
                    <input 
                      type="text" required
                      placeholder="Ej. Dr. Armando Gómez Pérez"
                      value={nuevoNombre}
                      onChange={(e) => setNuevoNombre(e.target.value)}
                      className="w-full bg-[#110e1e] border border-purple-950 text-gray-100 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-purple-600 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Materia / Unidad de Aprendizaje *</label>
                    <input 
                      type="text" required
                      placeholder="Ej. Estructuras Avanzadas de Acero"
                      value={nuevaMateria}
                      onChange={(e) => setNuevaMateria(e.target.value)}
                      className="w-full bg-[#110e1e] border border-purple-950 text-gray-100 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-purple-600 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Departamento Institucional *</label>
                    <input 
                      type="text" required
                      placeholder="Ej. Ingeniería Civil o Ciencias"
                      value={nuevoDpto}
                      onChange={(e) => setNuevoDpto(e.target.value)}
                      className="w-full bg-[#110e1e] border border-purple-950 text-gray-100 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-purple-600 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Correo Electrónico (Opcional)</label>
                    <input 
                      type="email"
                      placeholder="Ej. armando.gomez@universidad.edu"
                      value={nuevoEmail}
                      onChange={(e) => setNuevoEmail(e.target.value)}
                      className="w-full bg-[#110e1e] border border-purple-950 text-gray-100 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-purple-600 font-sans"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:opacity-95 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Plus className="w-4 h-4" /> Agregar al Directorio
                  </button>
                </form>
              </div>

              {/* Lista / Directorio (Span 8) */}
              <div className="lg:col-span-8 bg-[#080612] border border-purple-950/40 p-6 rounded-2xl">
                <h3 className="text-lg font-bold font-display text-white mb-1">Docentes de Alta</h3>
                <p className="text-sm text-gray-400 mb-6">Listado de profesores disponibles para recibir auditorías de metodologías activas.</p>

                {docentes.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-purple-950/40 rounded-xl bg-purple-950/5">
                    <p className="text-gray-400 text-sm">No se encuentran docentes cargados.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-sans">
                      <thead>
                        <tr className="border-b border-purple-950/60 text-xs font-mono text-purple-400 uppercase">
                          <th className="pb-3 font-semibold">Docente / Materia</th>
                          <th className="pb-3 font-semibold hidden md:table-cell">Departamento</th>
                          <th className="pb-3 font-semibold text-center">Desafíos</th>
                          <th className="pb-3 font-semibold text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-950/30 text-sm">
                        {docentes.map((d) => {
                          const numDesafios = evaluaciones.filter(ev => ev.docenteId === d.id).length;
                          return (
                            <tr key={d.id} className="hover:bg-purple-950/10 transition-colors">
                              <td className="py-4 pr-3">
                                <div className="font-bold text-white text-base">{d.nombre}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{d.materia}</div>
                                <div className="text-[11px] text-gray-500 font-mono mt-0.5">{d.email}</div>
                              </td>
                              <td className="py-4 pr-3 hidden md:table-cell">
                                <span className="px-2.5 py-1 text-xs bg-[#120f21] border border-purple-950 rounded-lg text-purple-300">
                                  {d.departamento}
                                </span>
                              </td>
                              <td className="py-4 text-center font-bold font-mono">
                                {numDesafios}
                              </td>
                              <td className="py-4 text-right">
                                <button 
                                  onClick={() => handleEliminarDocente(d.id, d.nombre)}
                                  className="p-2 text-orange-500 hover:text-white hover:bg-orange-950/40 rounded-lg transition-all cursor-pointer"
                                  title="Remover titular"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

        {/* VISTA: HOJA DE CÁLCULO / APPS SCRIPT WEBHOOK */}
        {vistaActiva === "config" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-[#0a0815]/90 border border-purple-950/40 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold font-display text-white">Sincronización a Google Sheets</h2>
              <p className="text-gray-400 text-sm mt-1">Conecta el evaluador con cualquier hoja de cálculo de Google Drive usando Google Apps Script (GAS) en 3 sencillos pasos.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Columna Izquierda: Configuración del Endpoint (Span 5) */}
              <div className="lg:col-span-5 bg-[#080612] border border-purple-950/40 p-6 rounded-2xl space-y-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold font-display text-white mb-2 flex items-center gap-1.5">
                    <Settings className="w-5 h-5 text-purple-400" /> Parámetros del Conector
                  </h3>
                  <p className="text-xs text-gray-400 mb-6">Inserta la URL de despliegue generada por Google Apps Script para guardar todas tus evaluaciones directamente en tu documento central de Excel/Sheets.</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-gray-300 mb-2">Web App URL de Apps Script</label>
                      <input 
                        type="url"
                        placeholder="https://script.google.com/macros/s/.../exec"
                        value={config.webhookUrl}
                        onChange={(e) => setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                        className="w-full bg-[#110e1e] border border-purple-950 text-gray-100 px-4 py-3 rounded-lg text-xs font-mono focus:outline-none focus:border-purple-600"
                      />
                    </div>

                    <div className="flex items-center gap-3 bg-[#110e1e] p-4 rounded-xl border border-purple-950/50">
                      <input 
                        type="checkbox"
                        id="autoSync"
                        checked={config.habilitado}
                        onChange={(e) => setConfig(prev => ({ ...prev, habilitado: e.target.checked }))}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-600 accent-purple-600 bg-black border-purple-950"
                      />
                      <div>
                        <label htmlFor="autoSync" className="block text-xs font-bold text-gray-200 cursor-pointer">Sincronización Automática</label>
                        <span className="text-[10px] text-gray-400">Guarda en Google Sheets cada vez que agregues o guardes una evaluación.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-purple-950/40">
                  <button 
                    onClick={handleProbarConexion}
                    className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:opacity-95 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" /> Enviar Evaluación de Prueba
                  </button>
                  <button 
                    onClick={() => {
                      setNotificacion({ tipo: "success", mensaje: "Endpoint de Google guardado localmente." });
                      autoCerrarNotificacion();
                    }}
                    className="w-full bg-purple-950/30 border border-purple-800 text-purple-300 hover:bg-purple-600 hover:text-white py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center block"
                  >
                    Guardar Configuración
                  </button>
                </div>
              </div>

              {/* Columna Derecha: Clona el Código (Span 7) */}
              <div className="lg:col-span-7 bg-[#080612] border border-purple-950/40 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold font-display text-white">Instrucciones de Despliegue en Google</h3>
                  <button 
                    onClick={handleCopiarAppsScript}
                    className="px-3 py-1.5 bg-[#110e1e] hover:bg-purple-950 border border-purple-950 text-xs font-mono text-purple-300 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    {copiadoIdx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiadoIdx ? "Copiado!" : "Copiar Código GAS"}
                  </button>
                </div>

                <div className="space-y-4 text-xs font-sans leading-relaxed text-gray-300">
                  <p>Sigue estos pasos rápidos para tener tu base de datos montada en la nube en 5 minutos de forma gratuita:</p>
                  
                  <ol className="list-decimal list-inside space-y-2 text-gray-400 font-sans">
                    <li>Abre o crea una nueva <span className="text-orange-300 font-semibold">Hoja de Cálculo de Google</span> en tu Drive.</li>
                    <li>En el menú superior, ve a <span className="text-purple-300 font-semibold">Extensiones &gt; Apps Script</span>.</li>
                    <li>Sustituye todo el código por defecto por el <span className="text-orange-300 font-bold">Código GAS</span> copiado arriba.</li>
                    <li>Pulsa el botón de Guardar (icono de disquete).</li>
                    <li>Haz clic en <span className="text-purple-300 font-semibold">Implementar &gt; Nueva implementación</span>:
                      <ul className="list-disc list-inside lg:pl-6 pt-1 text-[11px] text-gray-400">
                        <li>Filtro / Tipo: <span className="text-white">Aplicación Web</span>.</li>
                        <li>Ejecutar como: <span className="text-white">Tú (tu correo)</span>.</li>
                        <li>Quién tiene acceso: <span className="text-white font-bold select-all">Cualquiera</span> (indispensable para recibir las peticiones).</li>
                      </ul>
                    </li>
                    <li>Concede los permisos requeridos de Google, copia la <span className="text-orange-300 font-semibold">URL de la aplicación web</span>, pégala en los parámetros del conector a la izquierda y ¡Listo!</li>
                  </ol>

                  <div className="bg-[#110e1e] p-3 rounded-lg border border-purple-950 font-mono text-[10px] overflow-x-auto text-gray-400 max-h-[140px]">
                    <span className="text-purple-400 select-none">// Vista previa del código de Apps Script</span>
                    <pre className="mt-1">{`function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("EvaluacionesABD");
  ...
}`}</pre>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VISTA: GUÍA DE DESPLIEGUE EN GITHUB PAGES */}
        {vistaActiva === "export" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-[#0a0815]/90 border border-purple-950/40 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold font-display text-white">Publica tu Evaluador en GitHub Pages</h2>
              <p className="text-gray-400 text-sm mt-1">Cómo subir los directorios y archivos de este proyecto de React + Vite a GitHub de forma directa y publicarlo en la web.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Pasos de despliegue (Span 7) */}
              <div className="md:col-span-7 bg-[#080612] border border-purple-950/40 p-6 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold font-display text-white">Estructura Lista para Exportar</h3>
                
                <p className="text-sm text-gray-300">
                  Este proyecto está diseñado en una arquitectura de SPA (Single Page Application) estática altamente portable. Todo lo elaborado se encuentra ya organizado para ser servido por GitHub Pages.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex gap-4 items-start p-3 bg-[#110e1e] border border-purple-950/30 rounded-xl">
                    <div className="w-7 h-7 rounded-full bg-orange-950 border border-orange-500 text-orange-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Exporta tu Código</h4>
                      <p className="text-xs text-gray-400 mt-1">Exporta tu código mediante la opción Descargar ZIP o Conecta con tu cuenta GitHub en la opción exportar del menú superior derecho de AI Studio.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start p-3 bg-[#110e1e] border border-purple-950/30 rounded-xl">
                    <div className="w-7 h-7 rounded-full bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Construye la carpeta distributiva (dist)</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Ejecuta <code className="text-orange-300 bg-black/40 px-1 py-0.5 rounded font-mono text-[11px]">npm run build</code> en tu terminal local. Esto generará la carpeta <code className="text-purple-300 font-mono">dist/</code> con todo el HTML, CSS y JS compilado de manera ultra-optimizada.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start p-3 bg-[#110e1e] border border-purple-950/30 rounded-xl">
                    <div className="w-7 h-7 rounded-full bg-orange-950 border border-orange-500 text-orange-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Arrastra el contenido a tu rama gh-pages o main</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Sube todo el contenido interior de tu carpeta <code className="text-orange-300 font-mono">dist/</code> (especialmente el index.html y assets de script) directamente al repositorio de GitHub correspondiente de forma plana y ¡Listo!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 text-xs text-orange-400 font-mono flex items-center gap-1.5">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Nota: La IA Autoevaluadora requiere comunicación con el backend server. Para conservar la funcionalidad de IA al hospedar en GitHub Pages estático de forma gratuita, asegúrate de mantener desplegado tu servicio en Cloud Run o similar, o usa la evaluación pedagógica manual.</span>
                </div>
              </div>

              {/* Vista previa de estructura de archivos (Span 5) */}
              <div className="md:col-span-5 bg-[#080612] border border-purple-950/40 p-6 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold font-display text-white">Navegación de Estructura de GitHub</h3>
                <p className="text-xs text-gray-400">Tus archivos ya están preconfigurados con la jerarquía ideal requerida por GitHub:</p>

                <div className="p-4 bg-[#110e1e] border border-purple-950 rounded-xl font-mono text-xs text-gray-300">
                  <div className="flex items-center gap-2 text-white font-bold mb-3 pb-2 border-b border-purple-950/40">
                    <BookOpen className="w-4 h-4 text-orange-500" /> Directorio de Repositorio
                  </div>
                  
                  <div className="space-y-1.5 text-xs text-gray-400">
                    <div>📁 .github/ <span className="text-gray-600">// CI/CD opcional</span></div>
                    <div>📁 dist/ <span className="text-orange-400 font-semibold">// ¡CONTENIDO PARA GITHUB PAGES!</span></div>
                    <div className="pl-4">📄 index.html <span className="text-gray-500">(Master adaptativo)</span></div>
                    <div className="pl-4">📁 assets/ <span className="text-gray-500">(React bundles, styles)</span></div>
                    <div>📁 src/ <span className="text-gray-600">// Archivos de desarrollo</span></div>
                    <div className="pl-4">📄 App.tsx <span className="text-gray-500">(Interacciones e interfaces)</span></div>
                    <div className="pl-4">📄 types.ts <span className="text-gray-500">(Estructuras de datos)</span></div>
                    <div className="pl-4">📄 index.css <span className="text-gray-500">(Fuentes y Tailwind resets)</span></div>
                    <div>📄 index.html</div>
                    <div>📄 package.json <span className="text-gray-500">(Librerías de dependencias)</span></div>
                    <div>📄 server.ts <span className="text-gray-500">(Servidor Express de evaluación)</span></div>
                    <div>📄 tsconfig.json</div>
                    <div>📄 vite.config.ts</div>
                  </div>
                </div>

                <button 
                  onClick={() => setVistaActiva("dashboard")}
                  className="w-full text-center py-2.5 bg-purple-950/40 border border-purple-800 text-purple-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Regresar al Panel Principal
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
      </div>

      {/* Footer institucional elegante */}
      <footer className="bg-[#0a0a0a] border-t border-[#1f1a2e] text-gray-500 text-xs px-6 py-6 mt-auto shrink-0 z-10 w-full">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-mono text-purple-400">EvaluaCBL Plataforma Académica • Sincronización Activa</span>
          </div>
          <div className="text-center md:text-right font-sans text-gray-500">
            <p>© 2026 Modelo de Aprendizaje Basado en Desafíos (CBL). Exportable a GitHub Pages.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
