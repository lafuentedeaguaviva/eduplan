"use client";

import React from "react";
import { useProfile } from "../../contexts/ProfileContext";

/**
 * Indicador visual de saldo de EduCoins.
 * Se muestra en el sidebar.
 */
export const AiQuotaIndicator = () => {
  const { profile, loading } = useProfile();

  const monedas = profile?.monedas_disponibles || 0;
  
  // Colores dinámicos según el saldo
  const getTextColor = () => {
    if (monedas > 50) return "text-emerald-400";
    if (monedas > 15) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <div className="relative p-4 bg-[#1e293b]/40 backdrop-blur-xl rounded-[1.5rem] border border-white/5 shadow-2xl group transition-all duration-500 hover:bg-[#1e293b]/60 hover:border-white/10 overflow-hidden">
      {/* Decorative Glow */}
      <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-[40px] opacity-20 -mr-8 -mt-8 transition-colors duration-500 ${monedas > 15 ? 'bg-indigo-500' : 'bg-rose-500'}`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`size-1.5 rounded-full ${loading ? 'animate-pulse bg-blue-400' : 'bg-indigo-400'}`} />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Mis EduCoins</span>
          </div>
          <span className={`text-lg font-black ${getTextColor()} tracking-tighter flex items-center gap-1`}>
            {monedas} <span className="text-sm">🪙</span>
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
            PLAN: <span className="text-slate-300 ml-1">{profile?.ultimo_plan_comprado || 'Demo'}</span>
          </p>
          <a href="/dashboard/billing" className="flex items-center gap-1 hover:translate-x-0.5 transition-transform cursor-pointer">
             <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Recargar</span>
             <span className="material-symbols-rounded text-[10px] text-indigo-400 font-bold">add_circle</span>
          </a>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center rounded-[1.5rem]">
           <div className="size-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

