import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * API Route: /api/admin/ai-usage
 * Devuelve estadísticas de consumo de tokens de IA (Gemini + DeepSeek).
 * Solo accesible por usuarios con rol Administrador.
 */
export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        // Verificar rol Administrador
        const { data: roles } = await supabase
            .from('perfil_roles')
            .select('rol_nombre')
            .eq('perfil_id', user.id);

        const isAdmin = roles?.some(r => r.rol_nombre === 'Administrador');
        if (!isAdmin) {
            return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
        }

        // Parsear query params
        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get('days') || '30', 10);

        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - days);

        // 1. Obtener todos los logs del período
        const { data: logs, error: logsError } = await supabase
            .from('ia_consumo_logs')
            .select('prompt_tokens, completion_tokens, total_tokens, proveedor, tipo_operacion, created_at, usuario_id')
            .gte('created_at', sinceDate.toISOString())
            .order('created_at', { ascending: false });

        if (logsError) throw logsError;

        // 2. Agregar por proveedor
        const providerStats: Record<string, {
            totalRequests: number;
            promptTokens: number;
            completionTokens: number;
            totalTokens: number;
        }> = {};

        const dailyUsage: Record<string, Record<string, number>> = {};
        const userUsage: Record<string, { totalTokens: number; requests: number }> = {};

        for (const log of logs || []) {
            const provider = log.proveedor || 'gemini'; // Fallback para logs históricos sin proveedor
            const day = log.created_at?.split('T')[0] || 'unknown';

            // Stats por proveedor
            if (!providerStats[provider]) {
                providerStats[provider] = { totalRequests: 0, promptTokens: 0, completionTokens: 0, totalTokens: 0 };
            }
            providerStats[provider].totalRequests += 1;
            providerStats[provider].promptTokens += log.prompt_tokens || 0;
            providerStats[provider].completionTokens += log.completion_tokens || 0;
            providerStats[provider].totalTokens += log.total_tokens || 0;

            // Uso diario
            if (!dailyUsage[day]) dailyUsage[day] = {};
            if (!dailyUsage[day][provider]) dailyUsage[day][provider] = 0;
            dailyUsage[day][provider] += log.total_tokens || 0;

            // Uso por usuario
            const userId = log.usuario_id;
            if (userId) {
                if (!userUsage[userId]) userUsage[userId] = { totalTokens: 0, requests: 0 };
                userUsage[userId].totalTokens += log.total_tokens || 0;
                userUsage[userId].requests += 1;
            }
        }

        // 3. Top usuarios (limitar a 10)
        const topUsersEntries = Object.entries(userUsage)
            .sort(([, a], [, b]) => b.totalTokens - a.totalTokens)
            .slice(0, 10);

        // Obtener nombres de los top usuarios
        const topUserIds = topUsersEntries.map(([id]) => id);
        const { data: userProfiles } = await supabase
            .from('perfiles')
            .select('id, nombres, apellidos, email')
            .in('id', topUserIds);

        const topUsers = topUsersEntries.map(([id, stats]) => {
            const profile = userProfiles?.find(p => p.id === id);
            return {
                id,
                name: profile ? `${profile.nombres} ${profile.apellidos}`.trim() : (profile as any)?.email || id.slice(0, 8),
                ...stats,
            };
        });

        // 4. Formatear uso diario como array ordenado
        const dailyUsageArray = Object.entries(dailyUsage)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, providers]) => ({ date, ...providers }));

        // 5. Calcular totales globales
        const globalTotals = {
            totalRequests: (logs || []).length,
            totalTokens: Object.values(providerStats).reduce((sum, p) => sum + p.totalTokens, 0),
            promptTokens: Object.values(providerStats).reduce((sum, p) => sum + p.promptTokens, 0),
            completionTokens: Object.values(providerStats).reduce((sum, p) => sum + p.completionTokens, 0),
        };

        // 6. Obtener límites de configuración global
        const { data: configData } = await supabase
            .from('configuracion_global')
            .select('ia_limits')
            .eq('id', 'current_config')
            .maybeSingle();

        const ia_limits = configData?.ia_limits || {
            gemini: {
                dailyTokenLimit: 1_500_000,
                monthlyTokenLimit: 45_000_000,
                rpmLimit: 15,
            },
            deepseek: {
                dailyTokenLimit: 10_000_000,
                monthlyTokenLimit: 300_000_000,
                rpmLimit: 60,
            }
        };

        return NextResponse.json({
            period: { days, since: sinceDate.toISOString() },
            globalTotals,
            providerStats,
            dailyUsage: dailyUsageArray,
            topUsers,
            ia_limits,
        });
    } catch (error: any) {
        console.error("Error en API admin/ai-usage:", error);
        return NextResponse.json(
            { error: error.message || "Error interno" },
            { status: 500 }
        );
    }
}
