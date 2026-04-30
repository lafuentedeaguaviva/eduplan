"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useProfile } from "./ProfileContext"; // Asumiendo que existe de src1

interface AiQuota {
  percentage: number;
  current: number;
  limit: number;
}

interface AiContextType {
  quota: AiQuota | null;
  isLoading: boolean;
  refreshQuota: () => Promise<void>;
  generate: (prompt: string, context?: string) => Promise<string>;
}

const AiContext = createContext<AiContextType | undefined>(undefined);

export function AiProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useProfile();
  const [quota, setQuota] = useState<AiQuota | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshQuota = useCallback(async () => {
    if (!profile?.id) return;
    
    try {
      const current = profile.solicitudes_ia_hoy || 0;
      const limit = 1500; 
      const percentage = Math.min(100, Math.max(0, (current / limit) * 100));
      
      setQuota({ current, limit, percentage });
    } catch (error) {
      console.error("Error refreshing AI quota:", error);
    }
  }, [profile]);

  useEffect(() => {
    refreshQuota();
  }, [refreshQuota]);

  const generate = async (prompt: string, context?: string): Promise<string> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, context }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al llamar a la IA");
      }

      // Refrescar cuota después de generar exitosamente
      setTimeout(refreshQuota, 1000); 

      return data.text;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AiContext.Provider value={{ quota, isLoading, refreshQuota, generate }}>
      {children}
    </AiContext.Provider>
  );
}

export function useAi() {
  const context = useContext(AiContext);
  if (context === undefined) {
    throw new Error("useAi must be used within an AiProvider");
  }
  return context;
}
