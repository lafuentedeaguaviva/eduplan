const fs = require('fs');

let path = 'd:/PDC/PDCOficial7/eduplan-pro/src/app/dashboard/director/revisions/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    /const doc = new jsPDF\('p', 'mm', 'a4'\);/g, 
    "const { default: jsPDF } = await import('jspdf');\n            const { default: autoTable } = await import('jspdf-autotable');\n            const doc = new jsPDF('p', 'mm', 'a4');"
);

fs.writeFileSync(path, content);
console.log('Fixed revisions jsPDF');
