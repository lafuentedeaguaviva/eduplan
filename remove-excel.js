const fs = require('fs');

const exportServicePath = 'd:/PDC/PDCOficial7/eduplan-pro/src/lib/exportService.ts';
let exportServiceContent = fs.readFileSync(exportServicePath, 'utf8');

const targetFunction = `export const exportToExcel = async (data: Record<string, unknown>[], fileName: string) => {
    const { default: ExcelJS } = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');

    if (data.length === 0) return;

    const columns = Object.keys(data[0]).map(key => ({
        header: key.toUpperCase().replace('_', ' '),
        key: key,
        width: 20
    }));

    worksheet.columns = columns;

    data.forEach(item => {
        const row: Record<string, string | number | boolean | null | undefined> = {};
        Object.keys(item).forEach(key => {
            if (typeof item[key] === 'object' && item[key] !== null) {
                row[key] = JSON.stringify(item[key]);
            } else {
                row[key] = item[key] as string | number | boolean | null | undefined;
            }
        });
        worksheet.addRow(row);
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer as any], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const { saveAs } = await import('file-saver');
    saveAs(blob, \`\${fileName}.xlsx\`);
};`;

// Also match without `as any` in case it was not there
const regex = /export const exportToExcel = async[\s\S]*?saveAs\(blob, `\$\{fileName\}\.xlsx`\);\n\s*};/;

exportServiceContent = exportServiceContent.replace(regex, '');
exportServiceContent = exportServiceContent.replace(/\/\*\*\s*\n\s*\*\s*Service to handle Excel\/Dataframe Exports\s*\n\s*\*\/\s*\n/g, '');

fs.writeFileSync(exportServicePath, exportServiceContent);
console.log('Removed from exportService.ts');

const dashboardClientPath = 'd:/PDC/PDCOficial7/eduplan-pro/src/app/dashboard/reporting/DashboardClient.tsx';
if (fs.existsSync(dashboardClientPath)) {
    let dcContent = fs.readFileSync(dashboardClientPath, 'utf8');
    dcContent = dcContent.replace(/import { exportToWord, exportToExcel } from '@\/lib\/exportService';/g, "import { exportToWord } from '@/lib/exportService';\nimport { exportToExcel } from '@/lib/excelExport.service';");
    fs.writeFileSync(dashboardClientPath, dcContent);
    console.log('Updated DashboardClient.tsx');
}
