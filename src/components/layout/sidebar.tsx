'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import { useProfile } from '@/contexts/ProfileContext';
import { AuthService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AiQuotaIndicator } from '../ai/AiQuotaIndicator';
import { useReviewFeatureAccess } from '@/hooks/useReviewFeatureAccess';

const MENU_ITEMS = [
    { icon: 'inbox', label: 'Mi Escritorio', href: '/dashboard' },
    { icon: 'school', label: 'Áreas de Trabajo', href: '/dashboard/areas' },
    { icon: 'collections_bookmark', label: 'Banco de Contenidos', href: '/dashboard/library' },
    { icon: 'calendar_month', label: 'Planificación', href: '/dashboard/planning' },
    { icon: 'edit_document', label: 'Mis PDC', href: '/dashboard/pdcs' },
    { icon: 'library_books', label: 'Recursos Docentes', href: '/dashboard/resources' },
    { icon: 'workspace_premium', label: 'Mi Suscripción', href: '/dashboard/subscription' },
];

export function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { isCollapsed, toggleSidebar } = useSidebar();
    const { profile, loading } = useProfile();
    const { hasAccess: hasReviewAccess, isDirector: isDirectorRole } = useReviewFeatureAccess();

    const handleLogout = async () => {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            await AuthService.signOut();
            router.push('/login');
        }
    };

    const isAdmin = profile?.roles?.includes('Administrador');
    const isDirector = profile?.roles?.includes('Director');

    return (
        <aside className={cn(
            "fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800/80 hidden md:flex flex-col z-40 transition-all duration-300 ease-in-out",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* Brand & Toggle */}
            <div className={cn(
                "h-16 flex items-center border-b border-slate-800/80 transition-all duration-300 shrink-0",
                isCollapsed ? "px-4 justify-center" : "px-5 justify-between"
            )}>
                {!isCollapsed && (
                    <Link href="/dashboard" className="flex items-center gap-3 group overflow-hidden">
                        <div className="size-8 bento-gradient-1 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-900/30 group-hover:shadow-blue-500/25 transition-all shrink-0">
                            <span className="material-symbols-rounded text-lg font-black">lightbulb</span>
                        </div>
                        <span className="font-black text-base tracking-tight text-white group-hover:text-blue-200 transition-colors truncate">EduPlan Pro</span>
                    </Link>
                )}
                {isCollapsed && (
                    <div className="size-8 bento-gradient-1 rounded-xl flex items-center justify-center text-white shrink-0">
                        <span className="material-symbols-rounded text-lg font-black">lightbulb</span>
                    </div>
                )}

                <button
                    onClick={toggleSidebar}
                    className={cn(
                        "p-1.5 rounded-xl text-slate-500 hover:bg-slate-800 hover:text-white transition-all duration-200",
                        isCollapsed && "mt-0"
                    )}
                >
                    <span className="material-symbols-rounded text-xl">{isCollapsed ? 'menu' : 'menu_open'}</span>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto custom-scrollbar mt-2">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={isCollapsed ? item.label : undefined}
                            className={cn(
                                'relative flex items-center gap-3 rounded-2xl transition-all duration-200 group',
                                isCollapsed ? 'p-3 justify-center' : 'px-4 py-3',
                                isActive
                                    ? 'bg-blue-600/15 text-blue-400'
                                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                            )}
                        >
                            {/* Active indicator */}
                            {isActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-400 rounded-r-full" />
                            )}
                            <span className={cn(
                                'material-symbols-rounded text-xl transition-colors shrink-0 font-black',
                                isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                            )}>
                                {item.icon}
                            </span>
                            {!isCollapsed && (
                                <span className={cn(
                                    "text-sm truncate font-semibold transition-colors",
                                    isActive ? "font-black" : ""
                                )}>{item.label}</span>
                            )}
                        </Link>
                    );
                })}

                {/* Revisión Pro / Director */}
                {hasReviewAccess && !isDirectorRole && (
                    <Link
                        href="/dashboard/revisions"
                        title={isCollapsed ? "Mis Revisiones" : undefined}
                        className={cn(
                            'relative flex items-center gap-3 rounded-2xl transition-all duration-200 group mt-1',
                            isCollapsed ? 'p-3 justify-center' : 'px-4 py-3',
                            pathname.startsWith('/dashboard/revisions')
                                ? 'bg-amber-500/15 text-amber-500'
                                : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                        )}
                    >
                        {pathname.startsWith('/dashboard/revisions') && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber-500 rounded-r-full" />
                        )}
                        <span className={cn(
                            'material-symbols-rounded text-xl transition-colors shrink-0 font-black',
                            pathname.startsWith('/dashboard/revisions') ? 'text-amber-500' : 'text-slate-500 group-hover:text-slate-300'
                        )}>
                            rate_review
                        </span>
                        {!isCollapsed && <span className={cn("text-sm truncate font-semibold", pathname.startsWith('/dashboard/revisions') ? "font-black" : "")}>Mis Revisiones</span>}
                    </Link>
                )}

                {isAdmin && (
                    <>
                        <div className={cn("my-3 border-t border-slate-800/60", isCollapsed ? "mx-2" : "mx-1")} />
                        <Link
                            href="/dashboard/admin"
                            title={isCollapsed ? "Panel Admin" : undefined}
                            className={cn(
                                'relative flex items-center gap-3 rounded-2xl transition-all duration-200 group',
                                isCollapsed ? 'p-3 justify-center' : 'px-4 py-3',
                                pathname.startsWith('/dashboard/admin')
                                    ? 'bg-purple-600/15 text-purple-400'
                                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                            )}
                        >
                            {pathname.startsWith('/dashboard/admin') && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-purple-400 rounded-r-full" />
                            )}
                            <span className={cn(
                                'material-symbols-rounded text-xl transition-colors shrink-0 font-black',
                                pathname.startsWith('/dashboard/admin') ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-300'
                            )}>
                                admin_panel_settings
                            </span>
                            {!isCollapsed && <span className="text-sm truncate font-semibold">Panel Admin</span>}
                        </Link>
                    </>
                )}

                {isDirectorRole && (
                    <>
                        <div className={cn("my-3 border-t border-slate-800/60", isCollapsed ? "mx-2" : "mx-1")} />
                        <Link
                            href="/dashboard/director/revisions"
                            title={isCollapsed ? "Revisión Docente" : undefined}
                            className={cn(
                                'relative flex items-center gap-3 rounded-2xl transition-all duration-200 group',
                                isCollapsed ? 'p-3 justify-center' : 'px-4 py-3',
                                pathname.startsWith('/dashboard/director')
                                    ? 'bg-emerald-600/15 text-emerald-400'
                                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                            )}
                        >
                            {pathname.startsWith('/dashboard/director') && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-emerald-400 rounded-r-full" />
                            )}
                            <span className={cn(
                                'material-symbols-rounded text-xl transition-colors shrink-0 font-black',
                                pathname.startsWith('/dashboard/director') ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                            )}>
                                visibility
                            </span>
                            {!isCollapsed && <span className="text-sm truncate font-semibold">Revisión Docente</span>}
                        </Link>
                    </>
                )}

                {!isCollapsed && (
                    <div className="mt-8 px-2">
                        <AiQuotaIndicator />
                    </div>
                )}
            </nav>

            {/* User Footer */}
            <div className="p-3 border-t border-slate-800/80 shrink-0">
                <Link href="/dashboard/profile">
                    <div className={cn(
                        "bg-slate-800/40 hover:bg-slate-800/80 rounded-2xl transition-all cursor-pointer group border border-slate-700/40 hover:border-slate-700/80 flex items-center",
                        isCollapsed ? "p-2.5 justify-center" : "p-3 gap-3"
                    )}>
                        <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-500/30 to-blue-600/20 border border-indigo-500/20 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                            {loading ? (
                                <div className="size-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <img
                                    src={profile?.foto_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile?.nombres || 'User'}`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        {!isCollapsed && (
                            <>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-slate-200 truncate group-hover:text-white transition-colors">
                                        {loading ? 'Cargando...' : `${profile?.nombres || 'Usuario'} ${profile?.apellidos || ''}`}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className={cn("size-1.5 rounded-full animate-pulse", profile?.suscripcion ? "bg-indigo-400" : "bg-emerald-400")} />
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors">
                                            {profile?.suscripcion?.plan_nombre || 'Plan Gratuito'}
                                        </p>
                                    </div>
                                </div>
                                <span className="material-symbols-rounded text-slate-600 group-hover:text-white text-lg transition-colors">chevron_right</span>
                            </>
                        )}
                    </div>
                </Link>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    title={isCollapsed ? "Cerrar Sesión" : undefined}
                    className={cn(
                        "mt-2 w-full flex items-center gap-3 rounded-2xl p-3 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200 group",
                        isCollapsed ? "justify-center" : "px-4"
                    )}
                >
                    <span className="material-symbols-rounded text-xl font-black group-hover:rotate-12 transition-transform">logout</span>
                    {!isCollapsed && <span className="text-sm font-black uppercase tracking-widest">Cerrar Sesión</span>}
                </button>
            </div>
        </aside>
    );
}
