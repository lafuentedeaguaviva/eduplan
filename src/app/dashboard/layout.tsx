'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { AiProvider } from '@/contexts/AiContext';

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar />

            {/* Main Content */}
            <main className={`flex-1 min-h-screen transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'
                }`}>
                {/* Topbar Mobile (Visible only on mobile) */}
                <div className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-30">
                    <span className="font-bold text-slate-900">EduPlan Pro</span>
                    <button className="p-2 text-slate-500">
                        <span className="material-symbols-rounded">menu</span>
                    </button>
                </div>

                <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <ProfileProvider>
                <AiProvider>
                    <DashboardContent>{children}</DashboardContent>
                </AiProvider>
            </ProfileProvider>
        </SidebarProvider>
    );
}

