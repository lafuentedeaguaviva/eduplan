'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useProfile } from '@/contexts/ProfileContext';
import { BillingService } from '@/services/billing.service';
import { Check, Star, Crown, History, Upload, QrCode } from 'lucide-react';

export default function BillingPage() {
    const { profile } = useProfile();
    const [wallet, setWallet] = useState({ balance: 0, lastPlan: 'Cargando...' });
    const [packages, setPackages] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [qrConfig, setQrConfig] = useState<any>(null);
    
    // QR Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (profile?.id) {
            loadData(profile.id);
        }
    }, [profile?.id]);

    const loadData = async (userId: string) => {
        setLoading(true);
        try {
            const [w, pkgs, hist, config] = await Promise.all([
                BillingService.getUserWallet(userId),
                BillingService.getAvailablePackages(),
                BillingService.getTransactionHistory(userId),
                BillingService.getPaymentConfig()
            ]);
            setWallet(w);
            setPackages(pkgs);
            setHistory(hist);
            setQrConfig(config);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleBuyClick = (pkg: any) => {
        setSelectedPackage(pkg);
        setFile(null);
        setShowModal(true);
    };

    const handleUpload = async () => {
        if (!file || !selectedPackage || !profile?.id) return alert("Selecciona un archivo");
        setUploading(true);
        try {
            await BillingService.submitQrPayment(profile.id, selectedPackage.id, selectedPackage.precio_bob, file);
            alert("¡Comprobante enviado! El administrador lo revisará pronto.");
            setShowModal(false);
        } catch (e: any) {
            alert(e.message || "Error al subir comprobante");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <PageHeader 
                title="Mi Billetera (EduCoins)"
                subtitle="Administra tu saldo, revisa tus gastos de IA y adquiere nuevos paquetes."
                badge="Finanzas"
            />

            {/* Current Balance */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] p-10 shadow-2xl group text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-1000"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-8">
                        <div className="size-24 rounded-[2rem] bg-white/10 border border-white/20 flex items-center justify-center text-4xl shadow-inner">
                            🪙
                        </div>
                        <div>
                            <p className="text-[12px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-2">Saldo Disponible</p>
                            <h2 className="text-6xl font-black tracking-tighter">
                                {loading ? '...' : wallet.balance} <span className="text-2xl text-indigo-300 font-bold">Coins</span>
                            </h2>
                            <p className="text-slate-300 font-medium text-sm mt-3 flex items-center gap-2">
                                <Crown className="size-4 text-amber-400" /> Plan Actual: <span className="font-bold text-white">{wallet.lastPlan}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Store / Packages */}
                <div className="xl:col-span-7 space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="size-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Star className="size-5" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Comprar EduCoins</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {loading ? (
                            [1, 2].map(i => <Card key={i} className="h-64 animate-pulse bg-slate-100 rounded-3xl border-none" />)
                        ) : packages.map(pkg => (
                            <Card key={pkg.id} className="p-6 rounded-3xl border-2 border-slate-100 hover:border-indigo-600 transition-all group flex flex-col justify-between h-full hover:shadow-premium">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none px-3 py-1 font-black">
                                            {pkg.nombre}
                                        </Badge>
                                    </div>
                                    <div className="text-4xl font-black text-indigo-600 mb-2 flex items-center gap-2">
                                        +{pkg.monedas_otorgadas} <span className="text-xl">🪙</span>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">{pkg.descripcion}</p>
                                </div>
                                <Button 
                                    onClick={() => handleBuyClick(pkg)}
                                    className="w-full bg-slate-900 hover:bg-indigo-600 text-white rounded-xl h-12 font-black tracking-widest uppercase transition-colors"
                                >
                                    Pagar con QR
                                </Button>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* History */}
                <div className="xl:col-span-5 space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="size-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                            <History className="size-5" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Historial</h2>
                    </div>

                    <Card className="border-none shadow-soft overflow-hidden rounded-3xl">
                        <div className="max-h-[500px] overflow-y-auto p-2">
                            {loading ? (
                                <div className="p-8 text-center text-slate-400">Cargando...</div>
                            ) : history.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 font-medium">No tienes transacciones aún.</div>
                            ) : (
                                <div className="space-y-2">
                                    {history.map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`size-10 rounded-full flex items-center justify-center font-black ${tx.monto_monedas > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                    {tx.monto_monedas > 0 ? '+' : '-'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-sm">{tx.descripcion}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                                        {new Date(tx.fecha).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-black ${tx.monto_monedas > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                    {tx.monto_monedas > 0 ? '+' : ''}{tx.monto_monedas}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-medium">
                                                    Saldo: {tx.saldo_resultante}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Modal de Pago QR */}
            {showModal && selectedPackage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-md p-8 rounded-[2rem] shadow-2xl border-none space-y-6">
                        <div className="text-center space-y-2">
                            {qrConfig?.qr_payment_url ? (
                                <img src={qrConfig.qr_payment_url} alt="Código QR Bancario" className="w-48 h-48 mx-auto rounded-xl shadow-md mb-4 object-contain bg-white border-2 border-indigo-100" />
                            ) : (
                                <div className="size-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <QrCode className="size-8" />
                                </div>
                            )}
                            <h3 className="text-2xl font-black text-slate-900">Pago por QR</h3>
                            <p className="text-slate-500 font-medium text-sm">
                                Estás adquiriendo <span className="font-bold text-slate-900">{selectedPackage.nombre}</span> por <span className="font-bold text-slate-900">{selectedPackage.precio_bob} Bs.</span>
                            </p>
                        </div>
                        
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Instrucciones</p>
                            <p className="text-sm font-medium text-slate-600">
                                1. Escanea el código QR oficial de EduPlan Pro en tu app bancaria.<br/>
                                2. Transfiere exactamente <b>{selectedPackage.precio_bob} Bs.</b><br/>
                                3. Toma una captura de pantalla y súbela aquí.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-indigo-400 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="size-6 text-slate-400 mb-2" />
                                    <p className="text-sm font-bold text-slate-600">{file ? file.name : 'Subir Comprobante (PNG/JPG)'}</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                            </label>

                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1 rounded-xl h-12 font-bold">
                                    Cancelar
                                </Button>
                                <Button onClick={handleUpload} disabled={uploading || !file} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 font-black shadow-glow-indigo">
                                    {uploading ? 'Enviando...' : 'Confirmar Pago'}
                                </Button>
                            </div>
                            
                            <p className="text-[10px] text-slate-400 leading-tight text-center mt-4 px-2">
                                *Al realizar esta transferencia, aceptas que los "EduCoins" representan saldo digital exclusivo de EduPlan Pro. Todas las ventas son finales y no se emiten reembolsos. La aprobación toma un máximo de 24h hábiles.
                            </p>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
