import React, { useState, useEffect } from "react";
import { useAi } from "../../contexts/AiContext";
import { Button } from "../ui/Button";

interface AiAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (text: string) => void;
  title?: string;
  initialPrompt?: string;
  context?: string;
  previewData?: Record<string, string | null | undefined>;
}

export const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({
  isOpen,
  onClose,
  onAccept,
  title = "Asistente Educativo IA",
  initialPrompt = "",
  context = "",
  previewData = {}
}) => {
  const { generate, isLoading } = useAi();
  const [result, setResult] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [prompt, setPrompt] = useState(initialPrompt);

  // Sincronizar prompt cuando cambie initialPrompt
  useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt);
  }, [initialPrompt]);

  // Efecto de escritura progresiva
  useEffect(() => {
    if (result && displayedText.length < result.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(result.slice(0, displayedText.length + 1));
      }, 5); // Velocidad de escritura
      return () => clearTimeout(timeout);
    }
  }, [result, displayedText]);

  const handleGenerate = async () => {
    if (!prompt) return;
    setResult("");
    setDisplayedText("");
    try {
      const text = await generate(prompt, context);
      setResult(text);
    } catch (error) {
      console.error("AI Error:", error);
    }
  };

  if (!isOpen) return null;

  const hasPreviewData = Object.keys(previewData).length > 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-in fade-in duration-500" 
        onClick={onClose} 
      />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 rounded-l-[3rem] border-l border-white/20">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
               <span className="material-symbols-rounded">auto_awesome</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">{title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full">Google Gemini PRO</span>
                <span className="size-1 bg-slate-200 rounded-full" />
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sugerencias Pedagógicas</p>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="size-12 rounded-2xl hover:bg-slate-100 flex items-center justify-center transition-all active:scale-90"
          >
            <span className="material-symbols-rounded text-slate-400">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          
          {/* Persona / Team Indicator */}
          <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-[2rem] flex items-start gap-4 shadow-sm">
            <div className="size-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-rounded">groups</span>
            </div>
            <div className="space-y-1">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Misión Actual</p>
                <p className="text-xs font-bold text-emerald-800 leading-tight">
                    Somos un equipo de expertos en diseño didáctico y redacción de planificaciones de clase.
                </p>
            </div>
          </div>

          {/* Data Preview Grid ("Cuadritos") */}
          {hasPreviewData && (
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">
                Información del Contexto Pedagógico
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(previewData).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <div key={key} className="bg-slate-50/80 border border-slate-100 p-4 rounded-2xl space-y-1 hover:bg-white hover:shadow-md transition-all group">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider group-hover:text-indigo-500 transition-colors">{key.replace(/_/g, ' ')}</p>
                        <p className="text-[11px] font-bold text-slate-700 line-clamp-2 leading-snug">{value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Prompt Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                ¿En qué puedo ayudarte hoy?
                </label>
            </div>
            <textarea
              className="w-full h-40 p-6 rounded-[2rem] bg-slate-50 border-2 border-slate-50 focus:border-indigo-100 focus:bg-white transition-all outline-none text-slate-700 font-medium leading-relaxed resize-none shadow-inner text-[11px]"
              placeholder="Ej: Redacta una actividad para introducir fracciones de forma divertida para 4to de primaria..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || !prompt}
            className="w-full h-16 rounded-[2rem] bg-slate-900 hover:bg-black font-black text-white shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 overflow-hidden group/gen"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="size-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                <span className="text-xs uppercase tracking-widest">Analizando contexto...</span>
              </div>
            ) : (
              <>
                <span className="material-symbols-rounded group-hover/gen:rotate-12 transition-transform">bolt</span>
                <span className="text-xs uppercase tracking-widest">Generar Propuesta Curricular</span>
              </>
            )}
          </Button>

          {/* Result Area */}
          {(displayedText || result) && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">
                    Propuesta Generada
                </label>
                {displayedText.length === result.length && (
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(result);
                            // Podríamos añadir un mini toast aquí
                        }}
                        className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
                    >
                        <span className="material-symbols-rounded text-sm">content_copy</span>
                        Copiar
                    </button>
                )}
              </div>
              <div className={`p-8 rounded-[2.5rem] bg-indigo-50/30 border-2 border-indigo-100/20 text-slate-700 font-medium leading-relaxed whitespace-pre-wrap relative overflow-hidden text-sm ${isLoading ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                {displayedText}
                {displayedText.length < result.length && (
                    <span className="inline-block w-2 h-4 bg-indigo-500 ml-1 animate-pulse" />
                )}
              </div>

              {displayedText.length === result.length && (
                <div className="pt-4 flex gap-4">
                    <Button 
                        variant="outline" 
                        className="flex-1 h-14 rounded-2xl border-2 border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50"
                        onClick={() => {
                            setResult("");
                            setDisplayedText("");
                        }}
                    >
                        Reintentar
                    </Button>
                    <Button 
                        className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100"
                        onClick={() => onAccept(result)}
                    >
                        Incorporar al PDC
                    </Button>
                </div>
              )}
            </div>
          )}

          {!result && !isLoading && (
            <div className="h-64 rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 gap-4 group/empty">
              <div className="size-20 rounded-full bg-slate-50 flex items-center justify-center group-hover/empty:scale-110 transition-transform duration-700">
                <span className="material-symbols-rounded text-5xl opacity-30">temp_preferences_custom</span>
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Listo para crear</p>
                <p className="text-[10px] font-bold text-slate-300 max-w-[200px] mt-2 leading-relaxed">Presiona el rayo para que nuestro equipo de expertos genere la propuesta didáctica.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col gap-4">
          <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-rounded text-lg">shield_with_heart</span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 leading-tight">
                Privacidad garantizada. La IA utiliza tu contexto local para generar respuestas precisas sin guardar tus datos personales.
            </p>
          </div>
          <p className="text-[9px] font-black text-slate-300 text-center uppercase tracking-[0.3em]">
            EduPlan Pro AI v3.0 • Powered by Gemini
          </p>
        </div>
      </div>
    </div>
  );
};
