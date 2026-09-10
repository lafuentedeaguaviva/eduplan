"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Loader2, CheckCircle2, Download, Folder, FileText, ArrowLeft, ArrowRight, Sparkles, Trash, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { ExportService } from "@/services/export.service";
import { useProfile } from "@/contexts/ProfileContext";
import { PdcService } from "@/services/pdc.service";
import { PDCMaster } from "@/types";
import { PdcStepIndicator } from "@/components/pdcs/common/PdcStepIndicator";
import { SopaDeLetras } from "./SopaDeLetras";
import { Crucigrama } from "./Crucigrama";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface TemaConfig {
  id: string;
  titulo: string;
  semana: number;
}

export interface ExamenConfig {
  id: string; // ID único interno
  tipoExamen: string; // Diagnóstico, Formativo, Gamificado, Evaluación del Saber, Evaluación del Hacer
  dificultad: string;
  filas: number;
  numeroPreguntas: number;
  enfoqueDimensiones: string;
  tiposPregunta: string[];
  temasAsociados: string[]; // IDs de los temas que cubre este examen
  criteriosSeleccionados?: string[];
}

export interface AreaConfig {
  id: string;
  nombre: string;
  temaContext: string;
  temasDisponibles: TemaConfig[];
  examenes: ExamenConfig[];
  criteriosSaber: string[];
  criteriosHacer: string[];
  criteriosSer: string[];
  criteriosSerSeleccionados?: string[];
  instrumentoSer?: string;
}

export interface ExamenWizardState {
  selectedPdcId?: string;
  areas: AreaConfig[];
  examenesGenerados: any[]; 
  isGenerating: boolean;
}

interface ExamenWizardContextType {
  currentStep: number;
  setStep: (step: number | ((prev: number) => number)) => void;
  nextStep: () => void;
  prevStep: () => void;
  state: ExamenWizardState;
  updateState: (updates: Partial<ExamenWizardState>) => void;
  updateAreaConfig: (areaId: string, updates: Partial<AreaConfig>) => void;
  addExamen: (areaId: string, tipo: string, preselectedTemas: string[]) => void;
  removeExamen: (areaId: string, examenId: string) => void;
  updateExamenConfig: (areaId: string, examenId: string, updates: Partial<ExamenConfig>) => void;
  toggleTemaAsociado: (areaId: string, examenId: string, temaId: string) => void;
}

const ExamenWizardContext = createContext<ExamenWizardContextType | undefined>(undefined);

export function useExamenWizard() {
  const context = useContext(ExamenWizardContext);
  if (!context) {
    throw new Error("useExamenWizard must be used within a WizardProvider");
  }
  return context;
}

export function WizardExamenes() {
  const [currentStep, setStep] = useState(1);
  const router = useRouter();
  const [state, setState] = useState<ExamenWizardState>({
    selectedPdcId: "",
    areas: [],
    examenesGenerados: [],
    isGenerating: false,
  });

  const totalSteps = 5; // 1 (Select) + 2 (Config) + 3 (Ser) + 4 (Generate) + 5 (Export)

  const updateState = (updates: Partial<ExamenWizardState>) => setState((p) => ({ ...p, ...updates }));

  const updateAreaConfig = (areaId: string, updates: Partial<AreaConfig>) => {
    setState(p => ({
      ...p,
      areas: p.areas.map(a => a.id === areaId ? { ...a, ...updates } : a)
    }));
  };

  const addExamen = (areaId: string, tipo: string, preselectedTemas: string[]) => {
    let reactivoPorDefecto = "Opción Múltiple";
    if (tipo === "Gamificado") reactivoPorDefecto = "Sopa de Letras";
    else if (tipo === "Evaluación del Saber") reactivoPorDefecto = "Opción Múltiple";
    else if (tipo === "Evaluación del Hacer") reactivoPorDefecto = "Resolución de Problemas";

    const newExamen: ExamenConfig = {
      id: Math.random().toString(36).substr(2, 9),
      tipoExamen: tipo,
      dificultad: "Intermedia",
      filas: 1,
      numeroPreguntas: 10,
      enfoqueDimensiones: tipo === "Evaluación del Saber" ? "Énfasis Teórico" : tipo === "Evaluación del Hacer" ? "Énfasis Práctico" : "Equilibrado",
      tiposPregunta: [reactivoPorDefecto],
      temasAsociados: preselectedTemas
    };
    setState(p => ({
      ...p,
      areas: p.areas.map(a => 
        a.id === areaId 
          ? { ...a, examenes: [...(a.examenes || []), newExamen] } 
          : a
      )
    }));
  };

  const removeExamen = (areaId: string, examenId: string) => {
    setState(p => ({
      ...p,
      areas: p.areas.map(a => 
        a.id === areaId 
          ? { ...a, examenes: (a.examenes || []).filter(e => e.id !== examenId) }
          : a
      )
    }));
  };

  const updateExamenConfig = (areaId: string, examenId: string, updates: Partial<ExamenConfig>) => {
    setState(p => ({
      ...p,
      areas: p.areas.map(a => 
        a.id === areaId 
          ? {
              ...a,
              examenes: (a.examenes || []).map(e => e.id === examenId ? { ...e, ...updates } : e)
            } 
          : a
      )
    }));
  };

  const toggleTemaAsociado = (areaId: string, examenId: string, temaId: string) => {
    setState(p => ({
      ...p,
      areas: p.areas.map(a => {
        if (a.id !== areaId) return a;
        return {
          ...a,
          examenes: (a.examenes || []).map(e => {
            if (e.id !== examenId) return e;
            const currentTemas = e.temasAsociados || [];
            if (currentTemas.includes(temaId)) {
              return { ...e, temasAsociados: currentTemas.filter(t => t !== temaId) };
            } else {
              return { ...e, temasAsociados: [...currentTemas, temaId] };
            }
          })
        };
      })
    }));
  };

  const handleGenerate = async () => {
    updateState({ isGenerating: true });
    try {
      const generatedExams = [];
      
      for (const area of state.areas) {
        if (!area.examenes || area.examenes.length === 0) continue;

        for (const examen of area.examenes) {
          const temasSeleccionados = area.temasDisponibles
            .filter(t => (examen.temasAsociados || []).includes(t.id))
            .map(t => t.titulo);
            
          const temasString = temasSeleccionados.length > 0 
            ? temasSeleccionados.join(", ") 
            : "Todos los temas de la materia";
            
          const criteriosSels = examen.criteriosSeleccionados || [];
          const criteriosString = criteriosSels.length > 0 
            ? `\nCRITERIOS ESPECÍFICOS A EVALUAR:\n- ${criteriosSels.join("\n- ")}`
            : "";

          const criteriosSerString = (area.criteriosSerSeleccionados && area.criteriosSerSeleccionados.length > 0)
            ? `\nCRITERIOS DEL SER A EVALUAR:\n- ${area.criteriosSerSeleccionados.join("\n- ")}\nINSTRUMENTO DEL SER SOLICITADO: ${area.instrumentoSer || 'Rúbrica'}`
            : "";

          const pdcContextExtended = (temasSeleccionados.length > 0 
            ? `${area.temaContext}\nTEMAS ESPECÍFICOS A EVALUAR EN ESTE EXAMEN:\n- ${temasSeleccionados.join("\n- ")}`
            : area.temaContext) + criteriosString + criteriosSerString;

          const response = await fetch("/api/examenes/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pdcId: state.selectedPdcId,
              pdcContext: pdcContextExtended,
              areaId: area.id,
              materiaNombre: area.nombre,
              config: {
                tipo: examen.tipoExamen,
                dificultad: examen.dificultad,
                filas: examen.filas,
                numeroPreguntas: examen.numeroPreguntas,
                enfoqueDimensiones: examen.enfoqueDimensiones,
                tiposPregunta: examen.tiposPregunta
              },
              autoPilot: true
            })
          });

          if (!response.ok) throw new Error(`Error en la generación de ${examen.tipoExamen} para la materia: ${area.nombre}`);
          const data = await response.json();
          
          generatedExams.push({
            areaId: area.id,
            temaId: examen.id, // Reutilizamos este campo para identificar el examen en la exportación
            nombreArea: area.nombre,
            nombreTema: temasString, // Se mostrará como "Temas: X, Y, Z"
            tipoExamen: examen.tipoExamen,
            examen: data
          });
        }
      }
      
      updateState({ examenesGenerados: generatedExams, isGenerating: false });
      toast.success("¡Exámenes generados con éxito!");
      setStep(totalSteps); // Ir al último paso (Exportar)
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error al generar. Intenta de nuevo.");
      updateState({ isGenerating: false });
      setStep(totalSteps - 2); // Devolver al último paso de configuración si falla
    }
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      setStep(2);
    } else if (currentStep === 2) {
      setStep(3);
    } else if (currentStep === 3) {
      setStep(4);
      await handleGenerate();
    } else if (currentStep === 5) {
      router.push('/dashboard/examenes');
    }
  };
  
  const prevStep = () => setStep((p) => Math.max(1, p - 1));

  const canProceed = () => {
    if (state.isGenerating) return false;
    if (currentStep === 1) return !!state.selectedPdcId;
    if (currentStep === 2) {
        // Validar que todos los exámenes configurados tengan al menos un tipo de pregunta y al menos un tema
        return state.areas.every(area => 
            area.examenes?.every(examen => {
                const hasPreguntas = examen.tiposPregunta && examen.tiposPregunta.length > 0;
                const hasTemas = examen.temasAsociados && examen.temasAsociados.length > 0;
                const needsCriterios = examen.tipoExamen === 'Evaluación del Saber' || examen.tipoExamen === 'Evaluación del Hacer';
                const hasCriterios = !needsCriterios || (examen.criteriosSeleccionados && examen.criteriosSeleccionados.length > 0);
                return hasPreguntas && hasTemas && hasCriterios;
            })
        );
    }
    if (currentStep === 3) {
        // Evaluación del Ser ahora es opcional.
        return true;
    }
    if (currentStep === 4) return false; // En generación, avanza solo
    if (currentStep === 5) return true;
    return true;
  };

  const getStepName = () => {
    if (currentStep === 1) return "Selección de PDC";
    if (currentStep === 2) return "Configuración por Materias";
    if (currentStep === 3) return "Evaluación del Ser";
    if (currentStep === 4) return "Generación Inteligente";
    if (currentStep === 5) return "Exportar Exámenes";
    return "Examen";
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <ExamenWizardContext.Provider value={{ 
        currentStep, setStep, nextStep, prevStep, state, 
        updateState, updateAreaConfig, toggleTemaAsociado, 
        addExamen, removeExamen, updateExamenConfig 
    }}>
      <div className="min-h-screen bg-slate-50/50 pb-20 -m-6 lg:-m-8">
          
          {/* Header / Navigation */}
          <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-3xl border-b border-slate-200/50 px-6 py-4 transition-all duration-300 shadow-sm">
              <div className="max-w-[1700px] mx-auto w-full flex items-center justify-between gap-10">
                  <div className="flex items-center gap-8">
                      <div className="flex items-center gap-6 bg-slate-50/50 p-2.5 rounded-[2.5rem] border border-slate-200/60 shadow-sm backdrop-blur-xl group/nav hover:border-indigo-200/50 transition-all duration-500">
                          {currentStep > 1 && !state.isGenerating && (
                              <button
                                  onClick={prevStep}
                                  className="size-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm transition-all hover:border-indigo-500 hover:text-indigo-600 hover:shadow-xl hover:shadow-indigo-500/10 active:scale-95 group/back"
                                  title="Volver"
                              >
                                  <ArrowLeft className="w-6 h-6 group-hover/back:-translate-x-1 transition-transform" />
                              </button>
                          )}

                          <div className="flex flex-col gap-4 px-4">
                              <div className="flex flex-col gap-1 min-w-[320px]">
                                  <h1 className="text-xl font-black text-indigo-950 tracking-tighter leading-none uppercase truncate">
                                      {getStepName()}
                                  </h1>
                                  <div className="flex items-center gap-2">
                                      <div className="size-1.5 bg-indigo-500 rounded-full animate-pulse" />
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Generador Automático</p>
                                  </div>
                              </div>
                              <PdcStepIndicator
                                  currentStep={currentStep}
                                  totalSteps={totalSteps}
                                  className="scale-100 origin-left"
                              />
                          </div>

                          <Button
                              onClick={nextStep}
                              disabled={!mounted || !canProceed()}
                              className="h-14 px-10 bg-indigo-600 text-white hover:bg-indigo-700 font-bold rounded-2xl gap-4 shadow-2xl shadow-indigo-500/30 transition-all active:scale-95 group/next disabled:opacity-50 text-sm uppercase tracking-widest"
                          >
                              {state.isGenerating ? (
                                  <div className="size-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                  <>
                                      <span>{currentStep === 5 ? 'FINALIZAR' : currentStep === 3 ? 'GENERAR EXÁMENES' : 'Continuar'}</span>
                                      {currentStep !== 5 && (
                                      <div className="size-9 bg-white/20 text-white rounded-xl flex items-center justify-center group-hover/next:translate-x-1 transition-transform">
                                          {currentStep === 3 ? <Sparkles className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                                      </div>
                                      )}
                                  </>
                              )}
                          </Button>
                  </div>
              </div>
          </div>
      </div>

      {/* Dynamic Step Rendering */}
      <main className="max-w-[1800px] mx-auto px-6 md:px-12 pt-12 md:pt-20">
          <div className="relative animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-out">
              <Card className="shadow-lg border-primary/10 max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden">
                  <div className="p-6 sm:p-10 min-h-[500px]">
                       {currentStep === 1 && <Paso1SeleccionPDC />}
                       {currentStep === 2 && <Paso2Configuracion />}
                       {currentStep === 3 && <Paso3EvaluacionSer />}
                       {currentStep === 4 && <Paso3Generacion />}
                       {currentStep === 5 && <Paso4Exportacion />}
                  </div>
              </Card>
          </div>
      </main>

    </div>
  </ExamenWizardContext.Provider>
  );
}

// ==========================================
// COMPONENTES DE PASOS
// ==========================================

function Paso1SeleccionPDC() {
  const { state, updateState, nextStep } = useExamenWizard();
  
  const [pdcs, setPdcs] = useState<PDCMaster[]>([]);
  const [loadingPdcs, setLoadingPdcs] = useState(false);
  const { profile, loading: profileLoading } = useProfile();

  useEffect(() => {
    if (!profileLoading) {
      if (profile?.id) {
        loadData();
      } else {
        setLoadingPdcs(false);
      }
    }
  }, [profile?.id, profileLoading]);

  const loadData = async () => {
    setLoadingPdcs(true);
    try {
      const res = await PdcService.getPDCs(profile!.id);
      if (res.success && res.data) {
          setPdcs(res.data);
      }
    } catch (error) {
      console.error("Error loading PDCs:", error);
    } finally {
      setLoadingPdcs(false);
    }
  };

  const isLoading = profileLoading || loadingPdcs;

  const handleSelectContent = async (pdc: PDCMaster) => {
    if (state.selectedPdcId === pdc.id) return;

    updateState({ selectedPdcId: pdc.id, areas: [] });

    try {
        const fullReport = await PdcService.getFullReportData(pdc.id, 'original', true);
        
        if (fullReport && fullReport.areas_trabajo) {
            const newAreas: AreaConfig[] = fullReport.areas_trabajo.map((a: any) => {
                let textContext = `PDC: ${pdc.nombre_pdc || 'Sin Nombre'}\n`;
                textContext += `ÁREA: ${a.nombre}\n`;
                textContext += `OBJETIVO HOLÍSTICO:\n${fullReport.objetivo_holistico_nivel}\n`;
                textContext += `Objetivos del Área: ${a.objetivos_aprendizaje}\n`;
                
                const temas: TemaConfig[] = [];

                a.semanas.forEach((s: any) => {
                    if (s.semana_contenido_hier && s.semana_contenido_hier.length > 0) {
                        s.semana_contenido_hier.forEach((hier: any) => {
                            if (hier.titulo) {
                                temas.push({
                                    id: `tema-${Math.random().toString(36).substr(2, 9)}`,
                                    titulo: hier.titulo,
                                    semana: s.semana
                                });
                            }
                        });
                    }
                });

                // Deduplicate temas just in case
                const uniqueTemas = Array.from(new Map(temas.map(t => [t.titulo, t])).values());

                const rawCriterios = a.criterios_evaluacion_ia || a.criterios_evaluacion || "";
                
                let saberMatch = rawCriterios.match(/SABER:?\s*(.*?)(?=(HACER:|SER:|ADAPTACIONES:|$))/is);
                let hacerMatch = rawCriterios.match(/HACER:?\s*(.*?)(?=(SABER:|SER:|ADAPTACIONES:|$))/is);
                let serMatch = rawCriterios.match(/SER:?\s*(.*?)(?=(SABER:|HACER:|ADAPTACIONES:|$))/is);
                
                let cSaber: string[] = [];
                let cHacer: string[] = [];
                let cSer: string[] = [];
                
                if (saberMatch) {
                    cSaber = saberMatch[1].split(/[;\/\n]/).map((c: string) => c.trim()).filter((c: string) => c.length > 0);
                }
                if (hacerMatch) {
                    cHacer = hacerMatch[1].split(/[;\/\n]/).map((c: string) => c.trim()).filter((c: string) => c.length > 0);
                }
                if (serMatch) {
                    cSer = serMatch[1].split(/[;\/\n]/).map((c: string) => c.trim()).filter((c: string) => c.length > 0);
                }
                
                // Fallback para datos sin prefijos estructurados
                if (cSaber.length === 0 && cHacer.length === 0 && cSer.length === 0) {
                    const all = rawCriterios.split(/[;\/\n]/).map((c: string) => c.trim()).filter((c: string) => c.length > 0);
                    cSaber = all; // En formato antiguo todo iba mezclado, así que por defecto enviamos todo (excepto Ser si pudieramos aislarlo)
                }

                return {
                    id: a.id,
                    nombre: a.nombre,
                    temaContext: textContext,
                    temasDisponibles: uniqueTemas,
                    examenes: [],
                    criteriosSaber: cSaber,
                    criteriosHacer: cHacer,
                    criteriosSer: cSer,
                    criteriosSerSeleccionados: [],
                    instrumentoSer: 'Rúbrica de Evaluación'
                };
            });
            updateState({ selectedPdcId: pdc.id, areas: newAreas });
        }
    } catch (error) {
        toast.error("Error obteniendo detalles del PDC");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-900">Selecciona el PDC</h2>
        <p className="text-slate-500 mt-2 font-medium">
          Elige el PDC. Configuraremos un examen separado para cada materia incluida.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {pdcs.length === 0 ? (
               <div className="col-span-2 text-center py-12 text-slate-500 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] font-medium">
                 No tienes Planes de Desarrollo Curricular (PDCs) creados aún.
               </div>
             ) : (
               pdcs.map((pdc) => {
                 const isSelected = state.selectedPdcId === pdc.id;
                 return (
                 <div 
                   key={pdc.id}
                   onClick={() => handleSelectContent(pdc)}
                   className={`p-6 border-2 rounded-[2rem] cursor-pointer transition-all flex flex-col gap-4 ${isSelected ? 'border-indigo-600 bg-indigo-50/50 shadow-xl shadow-indigo-500/10 scale-[1.02]' : 'hover:border-indigo-300 bg-white shadow-sm border-slate-100 hover:bg-slate-50'}`}
                 >
                   <div className="flex items-start justify-between gap-4">
                     <div className={`size-12 rounded-2xl shrink-0 flex items-center justify-center ${isSelected ? 'bg-indigo-600 text-white shadow-glow-indigo' : 'bg-slate-100 text-slate-500'}`}>
                       <FileText className="h-6 w-6" />
                     </div>
                     {isSelected && (
                       <div className="bg-white p-1 rounded-full shadow-sm animate-in zoom-in">
                         {state.areas.length === 0 ? (
                            <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
                         ) : (
                            <CheckCircle2 className="h-6 w-6 text-indigo-600" />
                         )}
                       </div>
                     )}
                   </div>
                   <div>
                     <h3 className={`font-black text-lg line-clamp-2 leading-tight ${isSelected ? 'text-indigo-950' : 'text-slate-700'}`}>
                       {pdc.nombre_pdc || `PDC Gestión ${pdc.gestion}`}
                     </h3>
                     <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">
                       {pdc.created_at ? new Date(pdc.created_at).toLocaleDateString() : 'Sin Fecha'}
                     </p>
                   </div>
                 </div>
               )})
             )}
          </div>

          {state.selectedPdcId && state.areas.length > 0 && (
            <div className="mt-8 p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex gap-4 items-start animate-in fade-in slide-in-from-bottom-4">
              <Sparkles className="size-6 text-emerald-600 shrink-0 mt-1" />
              <div className="flex-1">
                <h4 className="font-black text-emerald-900 mb-1">¡Áreas Detectadas!</h4>
                <p className="text-sm text-emerald-700 font-medium mb-4">
                  Se encontraron {state.areas.length} materias. Presiona <strong className="font-black text-emerald-900">"Continuar"</strong> para configurar los parámetros de cada una.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {state.areas.map(a => (
                    <Badge key={a.id} variant="outline" className="bg-emerald-100/50 text-emerald-800 border-emerald-200">
                      {a.nombre}
                    </Badge>
                  ))}
                </div>
                <Button 
                    onClick={nextStep}
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-glow-indigo font-bold gap-2 animate-in zoom-in"
                >
                    Continuar <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ExamenConfigItem({ examen, areaId, index, temasDisponibles, criteriosSaber, criteriosHacer }: { examen: ExamenConfig, areaId: string, index: number, temasDisponibles: TemaConfig[], criteriosSaber: string[], criteriosHacer: string[] }) {
  const { removeExamen, updateExamenConfig, toggleTemaAsociado } = useExamenWizard();
  const [expanded, setExpanded] = useState(index === 0);

  const toggleTipoPregunta = (tipo: string) => {
    // Solo permitimos seleccionar 1 a la vez (comportamiento radio)
    updateExamenConfig(areaId, examen.id, { tiposPregunta: [tipo] });
  };

  const toggleCriterio = (crit: string) => {
    const current = examen.criteriosSeleccionados || [];
    if (current.includes(crit)) {
      updateExamenConfig(areaId, examen.id, { criteriosSeleccionados: current.filter(c => c !== crit) });
    } else {
      updateExamenConfig(areaId, examen.id, { criteriosSeleccionados: [...current, crit] });
    }
  };

  return (
    <div className="bg-white rounded-[1.5rem] border-2 border-slate-100 shadow-sm overflow-hidden transition-all duration-300">
      {/* HEADER ACORDEÓN */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
            {index + 1}
          </div>
          <div>
            <h4 className="font-bold text-slate-800">{examen.tipoExamen}</h4>
            <p className="text-xs text-slate-500 font-medium">{examen.numeroPreguntas} Preguntas • {examen.tiposPregunta.length} tipos de reactivos</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => { e.stopPropagation(); removeExamen(areaId, examen.id); }}
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full"
          >
            <Trash className="size-4" />
          </Button>
          <div className="text-slate-400">
            {expanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
          </div>
        </div>
      </div>

      {/* CONTENIDO ACORDEÓN */}
      {expanded && (
        <div className="px-6 pb-8 pt-4 border-t-2 border-slate-50">
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-12">
            
            {/* COLUMNA IZQUIERDA */}
            <div className="space-y-8">
              
              {/* Tipo de Evaluación (Nombre personalizable) */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="size-2 bg-indigo-500 rounded-full"></div> Tipo de Examen / Nombre
                </label>
                <div className="relative">
                  <select 
                    value={examen.tipoExamen}
                    onChange={(e) => {
                      const nuevoTipo = e.target.value;
                      let reactivoPorDefecto = "Opción Múltiple";
                      if (nuevoTipo === "Gamificado") reactivoPorDefecto = "Sopa de Letras";
                      else if (nuevoTipo === "Evaluación del Saber") reactivoPorDefecto = "Opción Múltiple";
                      else if (nuevoTipo === "Evaluación del Hacer") reactivoPorDefecto = "Resolución de Problemas";
                      
                      let maxPreguntas = examen.numeroPreguntas;
                      if (nuevoTipo === "Diagnóstico" && maxPreguntas > 10) {
                          maxPreguntas = 10;
                      }
                      
                      updateExamenConfig(areaId, examen.id, { 
                        tipoExamen: nuevoTipo,
                        numeroPreguntas: maxPreguntas,
                        enfoqueDimensiones: nuevoTipo === "Evaluación del Saber" ? "Énfasis Teórico" : nuevoTipo === "Evaluación del Hacer" ? "Énfasis Práctico" : "Equilibrado",
                        tiposPregunta: [reactivoPorDefecto]
                      });
                    }}
                    className="w-full h-12 bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold rounded-xl px-4 outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none"
                  >
                    <option value="Evaluación del Saber">Evaluación del Saber</option>
                    <option value="Evaluación del Hacer">Evaluación del Hacer</option>
                    <option value="Diagnóstico">Diagnóstico</option>
                    <option value="Formativo">Formativo</option>
                    <option value="Gamificado">Gamificado</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <ChevronDown className="size-4" />
                  </div>
                </div>
              </div>

              {/* Dificultad */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="size-2 bg-emerald-500 rounded-full"></div> Profundidad Cognitiva
                </label>
                <div className="flex gap-2">
                  {['Básica', 'Intermedia', 'Avanzada'].map(dif => (
                    <div 
                      key={dif}
                      onClick={() => updateExamenConfig(areaId, examen.id, { dificultad: dif })}
                      className={`flex-1 py-2 text-center rounded-xl border-2 cursor-pointer transition-all ${examen.dificultad === dif ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-sm' : 'border-slate-100 hover:border-emerald-200 bg-white text-slate-500 font-semibold text-xs'}`}
                    >
                      {dif}
                    </div>
                  ))}
                </div>
              </div>

              {/* Número de Preguntas y Filas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nº Preguntas</label>
                  <select 
                    value={examen.numeroPreguntas} 
                    onChange={(e) => updateExamenConfig(areaId, examen.id, { numeroPreguntas: Number(e.target.value) })}
                    className="w-full h-12 bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold rounded-xl px-4 outline-none focus:border-indigo-500 transition-colors text-sm"
                  >
                    <option value={5}>5 Preguntas</option>
                    <option value={10}>10 Preguntas</option>
                    {examen.tipoExamen !== 'Diagnóstico' && <option value={15}>15 Preguntas</option>}
                    {examen.tipoExamen !== 'Diagnóstico' && <option value={20}>20 Preguntas</option>}
                  </select>
                </div>
                
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Variantes (Filas)</label>
                  <select 
                    value={examen.filas} 
                    onChange={(e) => updateExamenConfig(areaId, examen.id, { filas: Number(e.target.value) })}
                    className="w-full h-12 bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold rounded-xl px-4 outline-none focus:border-indigo-500 transition-colors text-sm"
                  >
                    <option value={1}>1 Fila</option>
                    <option value={2}>2 Filas (A,B)</option>
                    <option value={3}>3 Filas</option>
                    <option value={4}>4 Filas</option>
                  </select>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA */}
            <div className="space-y-8">
              
              {/* Enfoque Holístico */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="size-2 bg-amber-500 rounded-full"></div> Enfoque de Dimensiones
                </label>
                <div className="grid gap-2">
                  {['Equilibrado', 'Énfasis Teórico', 'Énfasis Práctico'].map(enf => (
                    <div 
                      key={enf}
                      onClick={() => updateExamenConfig(areaId, examen.id, { enfoqueDimensiones: enf })}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${examen.enfoqueDimensiones === enf ? 'border-amber-500 bg-amber-50/50' : 'border-slate-100 hover:border-amber-200 bg-white'}`}
                    >
                      <span className={`font-bold text-xs ${examen.enfoqueDimensiones === enf ? 'text-amber-900' : 'text-slate-600'}`}>{enf}</span>
                      {examen.enfoqueDimensiones === enf && <CheckCircle2 className="size-4 text-amber-600" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tipos de Reactivos */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="size-2 bg-rose-500 rounded-full"></div> Tipos de Reactivos
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(() => {
                    return [
                      'Opción Múltiple', 'Verdadero/Falso', 'Desarrollo', 'Completar Espacios', 
                      'Emparejamiento', 'Casos Prácticos', 'Sopa de Letras', 'Crucigrama', 
                      'Asociación de Conceptos', 'Adivinanzas', 'Juego de Roles', 'Retos Prácticos',
                      'Análisis de Casos', 'Preguntas Teóricas', 'Ensayo Crítico', 'Mapa Conceptual', 
                      'Argumentación', 'Resolución de Problemas', 'Estudio de Caso Práctico', 
                      'Simuladores', 'Guía de Laboratorio', 'Desarrollo de Proyecto', 'Demostración'
                    ];
                  })().map(tipo => {
                    const isActive = (examen.tiposPregunta || []).includes(tipo);
                    return (
                      <div 
                        key={tipo}
                        onClick={() => toggleTipoPregunta(tipo)}
                        className={`px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-2 select-none ${isActive ? 'border-rose-300 bg-rose-50' : 'border-slate-100 bg-white hover:border-rose-100'}`}
                      >
                        <div className={`mt-[2px] shrink-0 size-3.5 rounded-[4px] border-2 flex items-center justify-center transition-colors ${isActive ? 'bg-rose-500 border-rose-500' : 'border-slate-300'}`}>
                           {isActive && <CheckCircle2 className="size-2.5 text-white" strokeWidth={4} />}
                        </div>
                        <span className={`text-[11px] font-bold leading-tight ${isActive ? 'text-rose-900' : 'text-slate-500'}`}>{tipo}</span>
                      </div>
                    );
                  })}
                </div>
                {(!examen.tiposPregunta || examen.tiposPregunta.length === 0) && (
                  <p className="text-[10px] text-red-500 font-bold">* Selecciona al menos un reactivo.</p>
                )}
              </div>

              {/* Temas a Evaluar */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="size-2 bg-blue-500 rounded-full"></div> Temas a Evaluar
                </label>
                <div className="grid gap-2">
                  {temasDisponibles.map(tema => {
                    const isSelected = (examen.temasAsociados || []).includes(tema.id);
                    return (
                      <div 
                        key={tema.id}
                        onClick={() => toggleTemaAsociado(areaId, examen.id, tema.id)}
                        className={`px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${isSelected ? 'border-blue-300 bg-blue-50' : 'border-slate-100 bg-white hover:border-blue-100'}`}
                      >
                        <div className={`mt-[2px] shrink-0 size-4 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}>
                           {isSelected && <CheckCircle2 className="size-3 text-white" strokeWidth={4} />}
                        </div>
                        <span className={`text-[12px] font-bold leading-tight ${isSelected ? 'text-blue-900' : 'text-slate-600'}`}>{tema.titulo}</span>
                      </div>
                    );
                  })}
                </div>
                {(!examen.temasAsociados || examen.temasAsociados.length === 0) && (
                  <p className="text-[10px] text-red-500 font-bold">* Selecciona al menos un tema a evaluar.</p>
                )}
              </div>
            </div>
            
            {/* Criterios de Evaluación para Saber o Hacer */}
            {(examen.tipoExamen === 'Evaluación del Saber' || examen.tipoExamen === 'Evaluación del Hacer') && (
              <div className="space-y-3 mt-6">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="size-2 bg-emerald-500 rounded-full"></div> Criterios a Considerar ({examen.tipoExamen === 'Evaluación del Saber' ? 'Saber' : 'Hacer'})
                </label>
                <div className="grid gap-2">
                  {(examen.tipoExamen === 'Evaluación del Saber' ? criteriosSaber : criteriosHacer).map((crit, idx) => {
                    const isSelected = (examen.criteriosSeleccionados || []).includes(crit);
                    return (
                      <div 
                        key={idx}
                        onClick={() => toggleCriterio(crit)}
                        className={`px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${isSelected ? 'border-emerald-300 bg-emerald-50' : 'border-slate-100 bg-white hover:border-emerald-100'}`}
                      >
                        <div className={`mt-[2px] shrink-0 size-4 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                           {isSelected && <CheckCircle2 className="size-3 text-white" strokeWidth={4} />}
                        </div>
                        <span className={`text-[12px] leading-tight ${isSelected ? 'font-bold text-emerald-900' : 'text-slate-600'}`}>{crit}</span>
                      </div>
                    );
                  })}
                  {(examen.tipoExamen === 'Evaluación del Saber' ? criteriosSaber : criteriosHacer).length === 0 && (
                     <p className="text-[10px] text-slate-400 italic">No se encontraron criterios específicos para esta dimensión en el PDC.</p>
                  )}
                </div>
                {(!examen.criteriosSeleccionados || examen.criteriosSeleccionados.length === 0) && (
                  <p className="text-[10px] text-red-500 font-bold">* Selecciona al menos un criterio.</p>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

function Paso2Configuracion() {
  const { state, addExamen } = useExamenWizard();
  
  if (!state.areas || state.areas.length === 0) return null;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-900">Configuración de Exámenes</h2>
        <p className="text-slate-500 mt-2 font-medium">Puedes crear múltiples exámenes (Diagnóstico, Saber, etc.) para cada materia.</p>
      </div>

      <div className="space-y-16">
        {state.areas.map((currentArea, index) => (
          <div key={currentArea.id} className="relative bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-8 shadow-sm">
            
            <div className="absolute -top-5 left-8 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30">
              Materia {index + 1}
            </div>

            <div className="flex items-center justify-between mb-8 mt-2">
                <h3 className="text-2xl font-black text-indigo-950">{currentArea.nombre}</h3>
                <div className="relative group">
                  <select 
                    className="appearance-none bg-indigo-50 border border-indigo-200 text-indigo-700 group-hover:bg-indigo-100 font-bold text-sm h-9 px-4 pr-8 rounded-md cursor-pointer outline-none transition-colors shadow-sm"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        addExamen(currentArea.id, e.target.value, currentArea.temasDisponibles.map(t => t.id));
                        e.target.value = "";
                      }
                    }}
                  >
                    <option value="" disabled hidden>+ Añadir Examen</option>
                    <option value="Evaluación del Saber">Evaluación del Saber</option>
                    <option value="Evaluación del Hacer">Evaluación del Hacer</option>
                    <option value="Diagnóstico">Diagnóstico</option>
                    <option value="Formativo">Formativo</option>
                    <option value="Gamificado">Gamificado</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-indigo-700">
                    <ChevronDown className="size-4" />
                  </div>
                </div>
            </div>
            
            <div className="space-y-4 mt-6">
                {currentArea.examenes && currentArea.examenes.length > 0 ? (
                  currentArea.examenes.map((examen, exIndex) => (
                    <ExamenConfigItem 
                       key={examen.id} 
                       examen={examen} 
                       areaId={currentArea.id}
                       index={exIndex} 
                       temasDisponibles={currentArea.temasDisponibles}
                       criteriosSaber={currentArea.criteriosSaber}
                       criteriosHacer={currentArea.criteriosHacer}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                     <p className="text-slate-500 font-medium">Aún no hay exámenes configurados para esta materia.</p>
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Paso3EvaluacionSer() {
  const { state, updateAreaConfig } = useExamenWizard();

  const toggleCriterioSer = (areaId: string, criterio: string) => {
    const area = state.areas.find(a => a.id === areaId);
    if (!area) return;
    const current = area.criteriosSerSeleccionados || [];
    if (current.includes(criterio)) {
      updateAreaConfig(areaId, { criteriosSerSeleccionados: current.filter(c => c !== criterio) });
    } else {
      updateAreaConfig(areaId, { criteriosSerSeleccionados: [...current, criterio] });
    }
  };

  const setInstrumentoSer = (areaId: string, instrumento: string) => {
    updateAreaConfig(areaId, { instrumentoSer: instrumento });
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center size-16 bg-indigo-50 text-indigo-600 rounded-3xl shadow-sm mb-4">
          <Sparkles className="size-8" />
        </div>
        <h2 className="text-4xl font-black tracking-tighter text-slate-900">Evaluación del Ser</h2>
        <p className="text-slate-500 mt-3 font-medium text-lg leading-relaxed">
          Selecciona los criterios del Ser (valores, actitudes) que deseas evaluar para cada materia y elige el instrumento de calificación.
        </p>
      </div>

      <div className="grid gap-6">
        {state.areas.map((area, index) => (
          <div key={area.id} className="bg-white rounded-[1.5rem] border-2 border-slate-100 shadow-sm overflow-hidden p-6">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <div className="size-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                {index + 1}
              </div>
              {area.nombre}
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-widest">Criterios del Ser a Evaluar</h4>
                {area.criteriosSer && area.criteriosSer.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {area.criteriosSer.map((crit, cIdx) => {
                      const isSelected = (area.criteriosSerSeleccionados || []).includes(crit);
                      return (
                        <div 
                          key={cIdx}
                          onClick={() => toggleCriterioSer(area.id, crit)}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                            isSelected ? "border-indigo-600 bg-indigo-50" : "border-slate-100 hover:border-indigo-200"
                          )}
                        >
                          <div className={cn("mt-0.5 size-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors", isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white")}>
                            {isSelected && <CheckCircle2 className="size-3.5" />}
                          </div>
                          <span className={cn("text-sm font-medium leading-tight", isSelected ? "text-indigo-950" : "text-slate-600")}>{crit}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 text-amber-800 rounded-xl text-sm font-medium border border-amber-200">
                    No se detectaron criterios del Ser en el PDC original para esta materia. La IA generará criterios generales de actitudes y valores si continúas.
                    <Button variant="outline" size="sm" className="mt-3 bg-white" onClick={() => toggleCriterioSer(area.id, "Responsabilidad, Respeto y Actitud Proactiva")}>
                      Añadir criterio general del Ser
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-widest">Instrumento de Calificación</h4>
                <div className="flex gap-3">
                  {['Rúbrica de Evaluación', 'Lista de Cotejo', 'Ficha de Autoevaluación'].map(inst => (
                    <div 
                      key={inst}
                      onClick={() => setInstrumentoSer(area.id, inst)}
                      className={cn(
                        "px-4 py-2 rounded-lg border-2 text-sm font-bold cursor-pointer transition-all",
                        area.instrumentoSer === inst ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-100 text-slate-500 hover:border-slate-300"
                      )}
                    >
                      {inst}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Paso3Generacion() {
  const { state } = useExamenWizard();
  
  const totalExamenes = state.areas.reduce((acc, area) => {
    return acc + (area.examenes?.length || 0);
  }, 0);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col items-center space-y-10 animate-in zoom-in-95 duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full" />
          <div className="absolute inset-0 border-[6px] border-indigo-100 rounded-full" />
          <div className="size-40 border-[6px] border-indigo-600 border-t-transparent border-b-transparent rounded-full animate-spin-slow" />
          <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
            <Sparkles className="size-14 animate-pulse" />
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-3xl font-black text-slate-800 animate-pulse tracking-tighter">Generando Exámenes...</h3>
          <p className="text-slate-500 font-medium text-base max-w-sm mx-auto leading-relaxed">
            La Inteligencia Artificial está procesando {totalExamenes} examen(es) en base a sus configuraciones específicas.
          </p>
        </div>
      </div>
    </div>
  );
}

function Paso4Exportacion() {
  const { state } = useExamenWizard();
  const [juegoActivo, setJuegoActivo] = useState<any | null>(null);

  const getOpcionesJson = (juego: any) => {
    if (!juego || !juego.opciones_json) return {};
    if (typeof juego.opciones_json === 'string') {
      try {
        return JSON.parse(juego.opciones_json);
      } catch (e) {
        console.error("Error parseando opciones_json", e);
        return {};
      }
    }
    return juego.opciones_json;
  };

  const handleDownloadWord = async (examenResult: any) => {
    let markdown = examenResult?.examen?.markdown_documento || examenResult?.examen?.documento_markdown || examenResult?.examen?.markdown;
    
    // Si la IA no devuelve el string markdown_documento, construimos uno base a partir del JSON.
    if (!markdown) {
      if (examenResult?.examen?.reactivos && examenResult.examen.reactivos.length > 0) {
        markdown = `# ${examenResult.tipoExamen || 'Examen'} - ${examenResult.nombreArea}\n\n`;
        markdown += `## Reactivos de Evaluación\n\n`;
        examenResult.examen.reactivos.forEach((r: any, idx: number) => {
          markdown += `**${idx + 1}. ${r.enunciado_gamificado || 'Pregunta'}**\n\n`;
          
          if (r.opciones_json?.opciones) {
            const letras = ['a', 'b', 'c', 'd', 'e', 'f'];
            r.opciones_json.opciones.forEach((op: string, opIdx: number) => {
              markdown += `${letras[opIdx] || '-'}) ${op}\n`;
            });
            markdown += `\n`;
          } else if (r.subtipo === 'verdadero_falso' || r.tipo_reactivo?.toLowerCase().includes('verdadero')) {
            markdown += `a) Verdadero\nb) Falso\n\n`;
          } else if (r.subtipo === 'sopa_de_letras' || r.subtipo === 'crucigrama') {
            markdown += `*(Actividad Interactiva en línea: ${r.subtipo.replace(/_/g, ' ')})*\n\n`;
          } else {
             // Pregunta de desarrollo
             markdown += `\n_________________________________________________________\n\n_________________________________________________________\n\n`;
          }
        });
      } else {
        toast.error(`No se encontró el documento para ${examenResult.nombreArea}.`);
        return;
      }
    }
    
    try {
      await ExportService.exportExamenToWord(
        markdown, 
        `Examen_${examenResult.nombreArea.replace(/\s+/g, '_')}_${examenResult.tipoExamen.replace(/\s+/g, '_')}`
      );
      toast.success(`¡Documento de ${examenResult.tipoExamen} para ${examenResult.nombreArea} exportado!`);
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al exportar el archivo.");
    }
  };

  const handleDownloadInstrumentos = async (res: any) => {
    const instrumentos = res.examen?.instrumentos;
    if (!instrumentos || instrumentos.length === 0) {
      toast.error(`No se encontraron instrumentos generados para ${res.nombreArea}.`);
      return;
    }
    
    let markdown = `# Instrumentos de Evaluación - ${res.nombreArea}\n\n`;
    
    instrumentos.forEach((i: any) => {
      markdown += `## ${i.tipo_instrumento || 'Instrumento'} - Dimensión: ${i.dimension_evaluada || 'General'}\n\n`;
      let criteriosFormatted = i.criterios_json || "";
      try {
        const parsed = JSON.parse(i.criterios_json);
        criteriosFormatted = Object.entries(parsed).map(([key, val]: [string, any]) => {
            return `- **${key}**: ${val.niveles ? val.niveles.join(' / ') : JSON.stringify(val)}`;
        }).join('\n');
      } catch(e) {}
      markdown += `${criteriosFormatted}\n\n`;
    });

    try {
      await ExportService.exportExamenToWord(markdown, `Instrumentos_${res.nombreArea.replace(/\s+/g, '_')}`);
      toast.success(`Instrumentos descargados para ${res.nombreArea}.`);
    } catch (error) {
      console.error(error);
      toast.error("Error al generar el documento de instrumentos.");
    }
  };

  if (juegoActivo) {
    return (
      <div className="flex flex-col h-full w-full max-w-6xl mx-auto py-8 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-slate-800 uppercase">
            {juegoActivo.subtipo === 'sopa_de_letras' ? 'Sopa de Letras Interactiva' : 'Crucigrama Interactivo'}
          </h2>
          <Button 
            onClick={() => setJuegoActivo(null)}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-6 rounded-xl"
          >
            Volver a Exportación
          </Button>
        </div>
        {juegoActivo.subtipo === 'sopa_de_letras' && (
          <SopaDeLetras palabras={getOpcionesJson(juegoActivo)?.palabras || []} />
        )}
        {juegoActivo.subtipo === 'crucigrama' && (
          <Crucigrama items={getOpcionesJson(juegoActivo)?.pistas || []} />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start h-full min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto py-8">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center size-20 bg-emerald-50 text-emerald-600 rounded-[2rem] shadow-sm mb-2">
          <CheckCircle2 className="size-10" />
        </div>
        <h2 className="text-4xl font-black tracking-tighter text-slate-900">¡Exámenes Generados!</h2>
        <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl mx-auto">
          La IA diseñó exitosamente las evaluaciones para cada materia de tu PDC.
        </p>
      </div>

      <div className="space-y-8 w-full">
        {state.examenesGenerados.map((res, index) => {
          const gamificados = res.examen?.reactivos?.filter((r: any) => r.subtipo === 'sopa_de_letras' || r.subtipo === 'crucigrama');

          return (
            <div key={index} className="border-2 border-slate-100 rounded-[2rem] p-6 bg-slate-50">
                <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Folder className="size-5" />
                    </div>
                    {res.nombreArea} - {res.tipoExamen}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <Button 
                        onClick={() => handleDownloadWord(res)} 
                        className="h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-glow-green border-0 transition-transform active:scale-95 flex items-center justify-center"
                    >
                        <Download className="mr-3 size-5" /> Descargar Prueba Escrita (.docx)
                    </Button>
                    <Button 
                        onClick={() => handleDownloadInstrumentos(res)} 
                        className="h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-glow-indigo border-0 transition-transform active:scale-95 flex items-center justify-center"
                    >
                        <Download className="mr-3 size-5" /> Descargar Eval. Ser y Hacer
                    </Button>
                </div>
                
                {gamificados && gamificados.length > 0 && (
                  <div className="mt-6 p-5 bg-white rounded-xl border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-indigo-900">Recursos Gamificados Detectados</h4>
                      <p className="text-sm text-slate-500">La IA generó juegos para este examen. Puedes previsualizarlos aquí.</p>
                    </div>
                    <div className="flex gap-2">
                      {gamificados.map((juego: any, jIdx: number) => (
                        <Button
                          key={jIdx}
                          onClick={() => setJuegoActivo(juego)}
                          className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold rounded-lg"
                        >
                          Ver {juego.subtipo === 'sopa_de_letras' ? 'Sopa de Letras' : 'Crucigrama'}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
