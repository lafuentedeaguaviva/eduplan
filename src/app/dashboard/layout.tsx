'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { AiProvider } from '@/contexts/AiContext';

import { RoleSelector } from '@/components/auth/RoleSelector';
import { useProfile } from '@/contexts/ProfileContext';
import { AuthService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();
    const { profile, activeRole, setActiveRole } = useProfile();
    const router = useRouter();

    const handleSwitchRole = () => {
        setActiveRole(null);
        router.push('/dashboard');
    };

    const handleLogout = async () => {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            await AuthService.signOut();
            setActiveRole(null);
            router.push('/login');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Obliga a seleccionar un rol si hay múltiples y ninguno activo */}
            <RoleSelector />
            
            <Sidebar />

            {/* Main Content */}
            <main className={`flex-1 min-h-screen transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'
                }`}>
                {/* Topbar Mobile (Visible only on mobile) */}
                <div className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-30">
                    <div className="flex flex-col">
                        <span className="font-black text-slate-900 leading-none">EduPlan Pro</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mt-1">{activeRole || 'Cargando...'}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                        {(profile?.roles || []).length > 1 && (
                            <button 
                                onClick={handleSwitchRole}
                                className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors"
                                title="Cambiar Rol"
                            >
                                <span className="material-symbols-rounded font-black">sync_alt</span>
                            </button>
                        )}
                        <button 
                            onClick={handleLogout}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Cerrar Sesión"
                        >
                            <span className="material-symbols-rounded font-black">logout</span>
                        </button>
                    </div>
                </div>

                <div className="p-4 md:p-8 w-full">
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

