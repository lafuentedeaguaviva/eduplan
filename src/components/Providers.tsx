"use client";

import { ProfileProvider } from "@/contexts/ProfileContext";
import { AiProvider } from "@/contexts/AiContext";
import { SidebarProvider } from "@/contexts/SidebarContext"; // src1 context

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <AiProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </AiProvider>
    </ProfileProvider>
  );
}
