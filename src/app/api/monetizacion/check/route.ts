import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { MonetizationService } from "@/services/monetizacion.service";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const pdcId = searchParams.get('pdcId');
        const actionType = searchParams.get('actionType') || 'pdc';

        if (!userId) {
            return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });
        }

        let required = 0;
        if (actionType === 'pdc' && pdcId) {
            const check = await MonetizationService.checkBalanceForPdc(userId, pdcId);
            return NextResponse.json({ success: true, ...check });
        } else {
            const config = await MonetizationService.getConfig();
            if (actionType === 'examen') required = config.costo_examen;
            if (actionType === 'autocompletar') required = config.costo_autocompletar;
            
            const check = await MonetizationService.checkBalanceForAction(userId, required);
            return NextResponse.json({ success: true, ...check });
        }

    } catch (e: any) {
        console.error("Error en check balance API:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
