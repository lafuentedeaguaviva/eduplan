const fs = require('fs');

function replaceFile(path, replacer) {
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');
    content = replacer(content);
    fs.writeFileSync(path, content);
    console.log(`Fixed ${path}`);
}

// 1. page.tsx
replaceFile('d:/PDC/PDCOficial7/eduplan-pro/src/app/dashboard/content/new/page.tsx', content => {
    let c = content.replace(/profile!\.nombre_completo/g, "profile!.nombres + ' ' + profile!.apellidos");
    c = c.replace(/\s*backHref="\/dashboard"/g, "");
    return c;
});

// 2. markdownExport.service.ts
replaceFile('d:/PDC/PDCOficial7/eduplan-pro/src/lib/markdownExport.service.ts', content => {
    let c = content.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*'docx';/, "import {$1, Footer } from 'docx';");
    c = c.replace(/footers:\s*\{\s*default:\s*\{\s*\/\/[^\n]*\n\s*children:\s*\[/g, "footers: {\n                default: new Footer({\n                    children: [");
    // We need to close the new Footer(
    c = c.replace(/\]\s*\}\s*\},/g, "]\n                })\n            },");
    return c;
});

// 3. reports/page.tsx
replaceFile('d:/PDC/PDCOficial7/eduplan-pro/src/app/dashboard/director/reports/page.tsx', content => {
    // Add dynamic imports right before `new jsPDF()` if they aren't there
    let c = content.replace(/const doc = new jsPDF\(\);/g, "const { default: jsPDF } = await import('jspdf');\n            const { default: autoTable } = await import('jspdf-autotable');\n            const doc = new jsPDF();");
    return c;
});

// 4. revisions/page.tsx
replaceFile('d:/PDC/PDCOficial7/eduplan-pro/src/app/dashboard/director/revisions/page.tsx', content => {
    let c = content.replace(/const doc = new jsPDF\(\);/g, "const { default: jsPDF } = await import('jspdf');\n            const { default: autoTable } = await import('jspdf-autotable');\n            const doc = new jsPDF();");
    return c;
});

// 5. exportService.ts (ExcelJS)
replaceFile('d:/PDC/PDCOficial7/eduplan-pro/src/lib/exportService.ts', content => {
    let c = content.replace(/const workbook = new ExcelJS\.Workbook\(\);/g, "const { default: ExcelJS } = await import('exceljs');\n    const workbook = new ExcelJS.Workbook();");
    return c;
});

// 6. export.service.ts (jsPDF, html2canvas)
replaceFile('d:/PDC/PDCOficial7/eduplan-pro/src/services/export.service.ts', content => {
    let c = content.replace(/const tempPdf = new jsPDF\(/g, "const { default: jsPDF } = await import('jspdf');\n        const tempPdf = new jsPDF(");
    c = c.replace(/const canvas = await html2canvas\(/g, "const { default: html2canvas } = await import('html2canvas');\n        const canvas = await html2canvas(");
    return c;
});

