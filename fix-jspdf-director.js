const fs = require('fs');

const fixFile = (filePath, dynamicImportsStr) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove static imports
  content = content.replace(/import jsPDF from 'jspdf';\r?\n?/g, '');
  content = content.replace(/import 'jspdf-autotable';\r?\n?/g, '');
  content = content.replace(/import autoTable from 'jspdf-autotable';\r?\n?/g, '');

  // Add dynamic import to the PDF export functions
  // For reports page:
  content = content.replace(
    /const handleExportPDF = async \(\) => {\r?\n/g,
    "const handleExportPDF = async () => {\n  const { default: jsPDF } = await import('jspdf');\n  const { default: autoTable } = await import('jspdf-autotable');\n"
  );
  
  // For revisions page (it might have exportPDF function)
  content = content.replace(
    /const exportToPDF = async \(\) => {\r?\n/g,
    "const exportToPDF = async () => {\n  const { default: jsPDF } = await import('jspdf');\n  const { default: autoTable } = await import('jspdf-autotable');\n"
  );

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
};

try {
  fixFile('d:/PDC/PDCOficial7/eduplan-pro/src/app/dashboard/director/revisions/page.tsx');
  fixFile('d:/PDC/PDCOficial7/eduplan-pro/src/app/dashboard/director/reports/page.tsx');
} catch (e) {
  console.error(e);
}
