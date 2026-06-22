import { NextResponse } from 'next/server';
import { PdcService } from '@/services/pdc.service';
import { PdcRevisionesService } from '@/services/pdc-revisiones.service';

export async function GET() {
    const directorId = '65e6c7a4-7ab3-4e19-9640-ca13e1179a70'; // Juan Perez
    try {
        const pdcsRes = await PdcService.getPDCsForDirector(directorId);
        const inbox = await PdcRevisionesService.getDirectorInbox(directorId);
        const analytics = await PdcService.getUEAnalytics(directorId);
        return NextResponse.json({ pdcsRes, inbox, analytics });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack });
    }
}
