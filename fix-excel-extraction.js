const fs = require('fs');

const exportServicePath = 'd:/PDC/PDCOficial7/eduplan-pro/src/lib/exportService.ts';
let exportServiceContent = fs.readFileSync(exportServicePath, 'utf8');

// The exportToExcel function:
const regex = /\/\*\*\s*\n\s*\*\s*Service to handle Excel\/Dataframe Exports\s*\n\s*\*\/\s*\nexport const exportToExcel = async \(data: Record<string, unknown>\[\], fileName: string\) => {([\s\S]*?)saveAs\(new Blob\(\[buffer\]\), `\$\{fileName\}\.xlsx`\);\n};/;

const match = exportServiceContent.match(regex);
if (match) {
    const fullFunction = match[0];
    // Remove it from exportService
    exportServiceContent = exportServiceContent.replace(fullFunction, '');
    fs.writeFileSync(exportServicePath, exportServiceContent);
    console.log('Removed from exportService.ts');
    
    // Write new file
    const newContent = `${fullFunction}`;
    fs.writeFileSync('d:/PDC/PDCOficial7/eduplan-pro/src/lib/excelExport.service.ts', newContent);
    console.log('Created excelExport.service.ts');
} else {
    console.log('Function not found in exportService.ts!');
}

// Update DashboardClient.tsx
const dashboardClientPath = 'd:/PDC/PDCOficial7/eduplan-pro/src/app/dashboard/reporting/DashboardClient.tsx';
if (fs.existsSync(dashboardClientPath)) {
    let dcContent = fs.readFileSync(dashboardClientPath, 'utf8');
    dcContent = dcContent.replace(/import { exportToWord, exportToExcel } from '@\/lib\/exportService';/g, "import { exportToWord } from '@/lib/exportService';\nimport { exportToExcel } from '@/lib/excelExport.service';");
    fs.writeFileSync(dashboardClientPath, dcContent);
    console.log('Updated DashboardClient.tsx');
}
