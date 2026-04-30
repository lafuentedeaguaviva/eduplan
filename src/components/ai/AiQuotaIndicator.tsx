"use client";

import React from "react";
import { useAi } from "../../contexts/AiContext";

/**
 * Indicador visual premium para la cuota de IA personal (proporcionada por el usuario).
 * Se muestra usualmente en el sidebar o dashboard.
 */
export const AiQuotaIndicator = () => {
  const { quota, isLoading } = useAi();

  if (!quota) return null;

  const { percentage, current, limit } = quota;
  const remanente = 100 - percentage;

  // Colores dinámicos según el porcentaje restante
  const getProgressColor = () => {
    if (remanente > 60) return "bg-emerald-500 shadow-glow-emerald";
    if (remanente > 25) return "bg-amber-500 shadow-glow-amber";
    return "bg-rose-500 shadow-glow-rose";
  };

  const getTextColor = () => {
    if (remanente > 60) return "text-emerald-600";
    if (remanente > 25) return "text-amber-600";
    return "text-rose-600";
  };

  return (
    <div className="relative p-4 bg-[#1e293b]/40 backdrop-blur-xl rounded-[1.5rem] border border-white/5 shadow-2xl group transition-all duration-500 hover:bg-[#1e293b]/60 hover:border-white/10 overflow-hidden">
      {/* Decorative Glow */}
      <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-[40px] opacity-20 -mr-8 -mt-8 transition-colors duration-500 ${remanente > 20 ? 'bg-emerald-500' : 'bg-rose-500'}`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`size-1.5 rounded-full ${isLoading ? 'animate-pulse bg-blue-400' : 'bg-slate-600'}`} />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Cuota Gemini Personal</span>
          </div>
          <span className={`text-[10px] font-black ${getTextColor()} tracking-tighter`}>
            {Math.round(remanente)}%
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="h-1.5 w-full bg-slate-900/60 rounded-full overflow-hidden border border-white/5 p-[1px]">
          <div 
            className={`h-full transition-all duration-1000 ease-out rounded-full relative ${getProgressColor()}`}
            style={{ width: `${remanente}%` }}
          >
            {/* Shimmer on progress bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] bg-[length:200%_100%]" />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
            PETICIONES: <span className="text-slate-300 ml-1">{current} <span className="opacity-40">/</span> {limit}</span>
          </p>
          <div className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
             <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Reset Diario</span>
             <span className="material-symbols-rounded text-[10px] text-slate-600">history</span>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center rounded-[1.5rem]">
           <div className="size-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

