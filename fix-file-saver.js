const fs = require('fs');
const path = require('path');

const filesToFix = [
  'd:/PDC/PDCOficial7/eduplan-pro/src/lib/exportService.ts',
  'd:/PDC/PDCOficial7/eduplan-pro/src/lib/markdownExport.service.ts',
  'd:/PDC/PDCOficial7/eduplan-pro/src/services/export.service.ts'
];

for (const file of filesToFix) {
  try {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove static import
    content = content.replace(/import\s+{\s*saveAs\s*}\s+from\s+['"]file-saver['"];\r?\n?/g, '');
    
    // Dynamic import before saveAs
    content = content.replace(/saveAs\s*\(\s*blob\s*,/g, "const { saveAs } = await import('file-saver');\n    saveAs(blob,");
    
    fs.writeFileSync(file, content);
    console.log(`Fixed ${path.basename(file)}`);
  } catch (err) {
    console.error(`Error fixing ${file}:`, err);
  }
}
