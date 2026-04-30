'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useProfile } from '@/contexts/ProfileContext';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionService, SubscriptionPlan } from '@/services/subscription.service';
import { Check, Zap, Shield, Star, Crown } from 'lucide-react';

export default function SubscriptionPage() {
    const { profile, refetchProfile } = useProfile();
    const { planName, subscription, isActive } = useSubscription();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [subscribingId, setSubscribingId] = useState<number | null>(null);

    useEffect(() => {
        const fetchPlans = async () => {
            const res = await SubscriptionService.getPlans();
            if (res.success && res.data) {
                setPlans(res.data);
            }
            setLoading(false);
        };
        fetchPlans();
    }, []);

    const handleSubscribe = async (planId: number) => {
        if (!profile?.id) return;
        setSubscribingId(planId);
        try {
            const res = await SubscriptionService.subscribeUser(profile.id, planId);
            if (res.success) {
                await refetchProfile();
                alert('¡Suscripción actualizada con éxito!');
            } else {
                alert('Error al procesar la suscripción.');
            }
        } catch (error) {
            console.error('Error in handleSubscribe:', error);
        } finally {
            setSubscribingId(null);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader 
                title="Suscripción y Planes"
                subtitle="Elige el plan que mejor se adapte a tus necesidades educativas."
                badge="Premium Access"
            />

            {/* Current Plan Status */}
            <div className="relative overflow-hidden bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-soft group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-1000"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className={`size-20 rounded-[1.5rem] flex items-center justify-center ${isActive ? 'bg-indigo-600 text-white shadow-glow-indigo' : 'bg-slate-100 text-slate-400'}`}>
                            <Crown className="size-10 font-black" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Estado de tu Cuenta</p>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                                Plan <span className="text-indigo-600">{planName}</span>
                            </h2>
                            {isActive && subscription?.fecha_fin && (
                                <p className="text-slate-500 font-medium text-sm mt-1">
                                    Vence el: <span className="font-bold">{new Date(subscription.fecha_fin).toLocaleDateString()}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    {isActive ? (
                        <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl border border-emerald-100 shadow-sm">
                            <Check className="size-5" />
                            <span className="font-black text-sm uppercase tracking-widest">Suscripción Activa</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 bg-amber-50 text-amber-700 px-6 py-3 rounded-2xl border border-amber-100 shadow-sm">
                            <Zap className="size-5" />
                            <span className="font-black text-sm uppercase tracking-widest">Requiere Upgrade</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Pricing Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <Card key={i} className="h-[500px] animate-pulse bg-slate-50/50 rounded-[2.5rem]" />
                    ))
                ) : (
                    plans.map((plan) => {
                        const isCurrent = plan.nombre === planName;
                        const features = plan.caracteristicas as string[];
                        
                        return (
                            <div key={plan.id} className={`group relative flex flex-col bg-white rounded-[2.5rem] border-2 transition-all duration-500 hover:-translate-y-2 hover:shadow-premium p-1 ${isCurrent ? 'border-indigo-600' : 'border-slate-100/50 hover:border-indigo-200'}`}>
                                {isCurrent && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-glow-indigo z-20">
                                        Plan Actual
                                    </div>
                                )}
                                
                                <div className="p-8 flex-1">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className={`size-12 rounded-xl flex items-center justify-center ${plan.color_scheme === 'indigo' ? 'bg-indigo-50 text-indigo-600' : plan.color_scheme === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'}`}>
                                            {plan.nombre.includes('Gratuito') ? <Star className="size-6" /> : plan.nombre.includes('Premium') ? <Crown className="size-6" /> : <Shield className="size-6" />}
                                        </div>
                                        {plan.precio > 0 && (
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-slate-900">${plan.precio}</span>
                                                <span className="text-slate-400 font-bold text-xs uppercase tracking-tighter">/mes</span>
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.nombre}</h3>
                                    <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">{plan.descripcion}</p>

                                    <div className="space-y-4 mb-8">
                                        {features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                                                <div className="size-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                                    <Check className="size-3 stroke-[3px]" />
                                                </div>
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 pt-0">
                                    <Button 
                                        onClick={() => handleSubscribe(plan.id)}
                                        disabled={isCurrent || subscribingId === plan.id}
                                        className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 ${isCurrent ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-none' : 'bg-indigo-600 hover:bg-indigo-700 shadow-glow-indigo'}`}
                                    >
                                        {subscribingId === plan.id ? 'Procesando...' : isCurrent ? 'Suscrito' : 'Elegir Plan'}
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            
            <div className="bg-indigo-50/50 rounded-[2rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-indigo-100/50">
                <div className="flex items-center gap-6">
                    <div className="size-16 rounded-2xl bg-white shadow-soft flex items-center justify-center text-indigo-600">
                        <Zap className="size-8" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-slate-900 tracking-tight">¿Necesitas un plan personalizado?</h4>
                        <p className="text-slate-500 font-medium">Contáctanos para soluciones a medida para tu unidad educativa.</p>
                    </div>
                </div>
                <Button variant="outline" className="border-2 border-indigo-600 text-indigo-600 font-black h-12 px-8 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                    Contactar Ventas
                </Button>
            </div>
        </div>
    );
}
