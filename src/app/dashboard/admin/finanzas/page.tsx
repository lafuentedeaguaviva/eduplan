'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AdminFinanzasService } from '@/services/adminFinanzas.service';

export default function AdminFinanzasPage() {
    const [stats, setStats] = useState<any>(null);
    const [config, setConfig] = useState<any>(null);
    const [whales, setWhales] = useState<any[]>([]);
    const [pendingPayments, setPendingPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // User search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [st, cfg, whls, payments] = await Promise.all([
                AdminFinanzasService.getFinancialStats(),
                AdminFinanzasService.getConfig(),
                AdminFinanzasService.getWhales(),
                AdminFinanzasService.getPendingPayments()
            ]);
            setStats(st);
            setConfig(cfg);
            setWhales(whls);
            setPendingPayments(payments);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleConfigChange = (key: string, val: string) => {
        // if key is qr_payment_url, it's a string, otherwise convert to Number
        const finalVal = key === 'qr_payment_url' ? val : Number(val);
        setConfig((prev: any) => ({ ...prev, [key]: finalVal }));
    };

    const saveConfig = async () => {
        setSaving(true);
        try {
            await AdminFinanzasService.updateConfig(config);
            alert("Configuración actualizada con éxito.");
        } catch (e) {
            alert("Error al guardar.");
        } finally {
            setSaving(false);
        }
    };

    const handleSearchUsers = async () => {
        if (!searchQuery || searchQuery.length < 3) return;
        setSearching(true);
        try {
            const res = await AdminFinanzasService.searchUsers(searchQuery);
            setSearchResults(res);
        } catch (e) {
            console.error(e);
        } finally {
            setSearching(false);
        }
    };

    const handleAssignBonus = async (userId: string, userName: string) => {
        const amountStr = window.prompt(`¿Cuántas monedas de Bono Demo deseas regalar a ${userName}?`, '100');
        if (!amountStr) return;
        
        const amount = parseInt(amountStr);
        if (isNaN(amount) || amount <= 0) return alert("Cantidad inválida");

        try {
            // Reemplazar con el userId real del administrador si es necesario o manejar desde el backend
            await AdminFinanzasService.assignDemoBonus('admin-session', userId, amount);
            alert(`Se han asignado ${amount} monedas a ${userName}`);
            loadData(); // Refrescar lista
        } catch (e: any) {
            alert("Error al asignar bono: " + e.message);
        }
    };

    const handleApprovePayment = async (pagoId: number) => {
        if (!window.confirm("¿Estás seguro de aprobar este pago y asignar las monedas?")) return;
        try {
            await AdminFinanzasService.approvePayment(pagoId);
            alert("Pago aprobado con éxito. Las monedas han sido asignadas.");
            loadData();
        } catch (e: any) {
            alert("Error al aprobar pago: " + e.message);
        }
    };

    const handleRejectPayment = async (pagoId: number) => {
        if (!window.confirm("¿Estás seguro de RECHAZAR este pago? No se asignarán monedas.")) return;
        try {
            await AdminFinanzasService.rejectPayment(pagoId);
            alert("Pago rechazado.");
            loadData();
        } catch (e: any) {
            alert("Error al rechazar pago: " + e.message);
        }
    };

    if (loading) {
        return <div className="p-20 text-center font-bold text-slate-500 animate-pulse uppercase tracking-widest">Cargando Finanzas...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
            {/* Header */}
            <div className="space-y-2">
                <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">
                    Panel Financiero
                </Badge>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Finanzas y Monetización</h1>
                <p className="text-slate-500 font-medium max-w-2xl">
                    Controla los costos dinámicos de IA, visualiza tu rentabilidad en tiempo real y gestiona a tus usuarios más activos.
                </p>
            </div>

            {/* ROI & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 border-none shadow-soft overflow-hidden relative group bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-rounded text-6xl">account_balance</span>
                    </div>
                    <div className="relative z-10 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Utilidad Neta (Caja)</span>
                        <div className="text-4xl font-black">{stats?.utilidadNeta} Bs.</div>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-soft hover:shadow-medium transition-all group overflow-hidden relative">
                    <div className="flex flex-col gap-1 relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ingresos Brutos (QR)</span>
                        <div className="text-3xl font-black text-slate-900">{stats?.ingresosBrutos} Bs.</div>
                    </div>
                    <div className="mt-4 h-1.5 w-12 rounded-full bg-blue-500/20" />
                </Card>

                <Card className="p-6 border-none shadow-soft hover:shadow-medium transition-all group overflow-hidden relative">
                    <div className="flex flex-col gap-1 relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Costo Real IA (DeepSeek)</span>
                        <div className="text-3xl font-black text-rose-600">-{stats?.costoIaBs} Bs.</div>
                        <span className="text-xs font-medium text-slate-400">({(stats?.totalTokensDeepSeek / 1000).toFixed(1)}k tokens)</span>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-soft hover:shadow-medium transition-all group overflow-hidden relative">
                    <div className="flex flex-col gap-1 relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Costo Subvencionado Demos</span>
                        <div className="text-3xl font-black text-orange-600">-{stats?.costoDemos} Bs.</div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Configuración de Tarifas */}
                <div className="xl:col-span-5 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-rounded">tune</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Tarifas de Consumo (EduCoins)</h2>
                    </div>

                    <Card className="p-8 border-none shadow-soft space-y-6">
                        <div className="space-y-4">
                            {[
                                { key: 'costo_pdc_secundaria', label: 'Costo PDC Secundaria (1 Área)', icon: 'school', type: 'number' },
                                { key: 'costo_pdc_primaria', label: 'Costo PDC Primaria (Integrado)', icon: 'child_care', type: 'number' },
                                { key: 'costo_examen', label: 'Costo Examen IA', icon: 'quiz', type: 'number' },
                                { key: 'costo_autocompletar', label: 'Costo Autocompletar', icon: 'magic_button', type: 'number' },
                                { key: 'bono_registro_inicial', label: 'Bono de Bienvenida (Nuevos)', icon: 'redeem', type: 'number' },
                                { key: 'qr_payment_url', label: 'URL Imagen QR Bancario', icon: 'qr_code_scanner', type: 'text' }
                            ].map((item) => (
                                <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-rounded text-slate-400">{item.icon}</span>
                                        <span className="font-bold text-slate-700 whitespace-nowrap">{item.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        {item.type === 'text' ? (
                                            <input 
                                                type="text"
                                                placeholder="https://..."
                                                className="w-full sm:w-64 font-medium text-sm rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                                value={config?.[item.key] || ''}
                                                onChange={(e) => handleConfigChange(item.key, e.target.value)}
                                            />
                                        ) : (
                                            <>
                                                <input 
                                                    type="number"
                                                    className="w-20 text-center font-black text-xl rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                                    value={config?.[item.key] || 0}
                                                    onChange={(e) => handleConfigChange(item.key, e.target.value)}
                                                />
                                                <span className="text-xl">🪙</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <Button 
                            onClick={saveConfig}
                            disabled={saving}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-14 rounded-2xl tracking-widest uppercase shadow-lg shadow-blue-500/30"
                        >
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </Card>
                </div>

                {/* Ballenas Ranking */}
                <div className="xl:col-span-7 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-rounded">monitoring</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Asignación de Bonos y Top Usuarios</h2>
                    </div>

                    <Card className="border-none shadow-soft overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
                            <input 
                                type="text"
                                placeholder="Buscar usuario por nombre o correo (Mínimo 3 letras)..."
                                className="flex-1 rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                            />
                            <Button 
                                onClick={handleSearchUsers}
                                disabled={searching || searchQuery.length < 3}
                                className="bg-slate-900 hover:bg-indigo-600 text-white rounded-xl"
                            >
                                {searching ? 'Buscando...' : 'Buscar Usuario'}
                            </Button>
                        </div>
                        
                        {(searchResults.length > 0) && (
                            <div className="bg-indigo-50/50 border-b border-slate-100">
                                <div className="p-3 text-xs font-black tracking-widest uppercase text-indigo-600">Resultados de Búsqueda</div>
                                <table className="w-full text-left border-collapse">
                                    <tbody>
                                        {searchResults.map((user) => (
                                            <tr key={user.id} className="border-b border-slate-100 last:border-0 hover:bg-white transition-colors">
                                                <td className="p-4 border-b border-slate-100">
                                                    <div className="font-bold text-slate-900">{user.nombres} {user.apellidos}</div>
                                                    <div className="text-xs text-slate-500">{user.email}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-black text-slate-900">{user.monedas_disponibles || 0} 🪙</div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => handleAssignBonus(user.id, `${user.nombres} ${user.apellidos}`)}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20"
                                                    >
                                                        + Dar Bono
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="p-3 text-xs font-black tracking-widest uppercase text-slate-400 bg-slate-50/80">
                            🏆 Top 50 Usuarios (Ballenas)
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-black border-b border-slate-100">
                                        <th className="p-4 rounded-tl-2xl">Usuario</th>
                                        <th className="p-4">Monedas Quemadas</th>
                                        <th className="p-4">Saldo Actual</th>
                                        <th className="p-4 text-center rounded-tr-2xl">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {whales.map((whale, idx) => (
                                        <tr key={whale.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">{whale.nombres} {whale.apellidos}</div>
                                                        <div className="text-xs text-slate-400">{whale.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-black text-rose-500 flex items-center gap-1">
                                                    <span className="material-symbols-rounded text-sm">local_fire_department</span>
                                                    {whale.monedas_quemadas} 🪙
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-black text-slate-900">{whale.monedas_disponibles || 0} 🪙</div>
                                                <div className="text-[10px] text-slate-400">Plan: {whale.ultimo_plan_comprado || 'Ninguno'}</div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    onClick={() => handleAssignBonus(whale.id, `${whale.nombres} ${whale.apellidos}`)}
                                                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 rounded-xl font-bold"
                                                >
                                                    + Bono Demo
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {whales.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">
                                                No hay usuarios con consumo registrado aún.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Aprobación de Pagos QR */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-rounded">receipt_long</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">Aprobación de Pagos QR Pendientes</h2>
                    {pendingPayments.length > 0 && (
                        <Badge className="bg-amber-500 text-white font-black border-none ml-2">
                            {pendingPayments.length} Pendientes
                        </Badge>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingPayments.map((pago) => (
                        <Card key={pago.id} className="p-6 border-none shadow-soft flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="font-bold text-slate-900 text-lg">
                                            {pago.perfiles?.nombres} {pago.perfiles?.apellidos}
                                        </div>
                                        <div className="text-sm text-slate-500">{pago.perfiles?.correo}</div>
                                    </div>
                                    <Badge className="bg-blue-50 text-blue-600 border-none font-bold">
                                        {Array.isArray(pago.paquetes_monedas) ? pago.paquetes_monedas[0]?.nombre : pago.paquetes_monedas?.nombre}
                                    </Badge>
                                </div>
                                <div className="text-3xl font-black text-slate-900 mb-4">{pago.monto_bob} Bs.</div>
                                
                                <div className="mb-6">
                                    <a href={pago.comprobante_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 h-32 rounded-xl bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-colors">
                                        <span className="material-symbols-rounded text-3xl">image</span>
                                        Ver Comprobante
                                    </a>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <Button 
                                    onClick={() => handleRejectPayment(pago.id)}
                                    variant="outline" 
                                    className="flex-1 rounded-xl text-rose-500 border-rose-200 hover:bg-rose-50 font-bold"
                                >
                                    Rechazar
                                </Button>
                                <Button 
                                    onClick={() => handleApprovePayment(pago.id)}
                                    className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black shadow-lg shadow-emerald-500/30"
                                >
                                    Aprobar
                                </Button>
                            </div>
                        </Card>
                    ))}
                    {pendingPayments.length === 0 && (
                        <div className="col-span-full p-12 text-center bg-slate-50 rounded-[2rem] border border-slate-100">
                            <span className="material-symbols-rounded text-6xl text-slate-300 mb-4">check_circle</span>
                            <h3 className="text-xl font-bold text-slate-500">Todo al día</h3>
                            <p className="text-slate-400">No hay pagos pendientes de aprobación.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
