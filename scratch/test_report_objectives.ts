import { db } from './src/lib/database';
import { PdcReportService } from './src/services/pdc-report.service';

async function test() {
    const pdcId = 'c8e160ba-ac0f-41db-a8e3-b797fab32e37';
    console.log("Fetching live report data...");
    const data = await PdcReportService.getFullReportData(pdcId, 'ia', true); // forceLive = true
    
    if (!data) {
        console.log("No data found");
        return;
    }
    
    console.log(`PDC: ${data.objetivo_holistico_nivel}`);
    data.areas_trabajo.forEach(area => {
        console.log(`Area: ${area.nombre}`);
        console.log(`Global Obj IA: ${area.objetivos_aprendizaje_ia}`);
        area.semanas.forEach(s => {
            console.log(`  Semana ${s.semana}:`);
            console.log(`    Obj Original: ${s.objetivos_aprendizaje}`);
            console.log(`    Obj IA: ${s.objetivos_aprendizaje_ia}`);
        });
    });
}

test().catch(console.error);
