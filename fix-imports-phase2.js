const fs = require('fs');

const file = 'd:/PDC/PDCOficial7/eduplan-pro/src/lib/exportService.ts';
let content = fs.readFileSync(file, 'utf8');

// Remove static imports
content = content.replace(/import html2canvas from 'html2canvas';\r?\n?/g, '');
content = content.replace(/import jsPDF from 'jspdf';\r?\n?/g, '');
content = content.replace(/import ExcelJS from 'exceljs';\r?\n?/g, '');

// Inject dynamic imports inside exportToPDF
content = content.replace(
  /export const exportToPDF = async \([^)]+\) => {\r?\n(\s*)try {/g,
  "export const exportToPDF = async (elementId: string, fileName: string, orientation: 'p' | 'l' = 'p') => {\n$1const { default: jsPDF } = await import('jspdf');\n$1const { default: html2canvas } = await import('html2canvas');\n$1try {"
);

// Inject dynamic imports inside exportToExcel
content = content.replace(
  /export const exportToExcel = async \([^)]+\) => {\r?\n(\s*)try {/g,
  "export const exportToExcel = async (data: any[], fileName: string) => {\n$1const { default: ExcelJS } = await import('exceljs');\n$1try {"
);

fs.writeFileSync(file, content);

const file2 = 'd:/PDC/PDCOficial7/eduplan-pro/src/services/export.service.ts';
let content2 = fs.readFileSync(file2, 'utf8');

// Remove static imports
content2 = content2.replace(/import html2canvas from 'html2canvas';\r?\n?/g, '');
content2 = content2.replace(/import jsPDF from 'jspdf';\r?\n?/g, '');
content2 = content2.replace(/import ExcelJS from 'exceljs';\r?\n?/g, '');

// Inject dynamic imports inside exportToPDF
content2 = content2.replace(
  /export const exportToPDF = async \([^)]+\) => {\r?\n(\s*)try {/g,
  "export const exportToPDF = async (elementId: string, fileName: string, orientation: 'p' | 'l' = 'p') => {\n$1const { default: jsPDF } = await import('jspdf');\n$1const { default: html2canvas } = await import('html2canvas');\n$1try {"
);

// Inject dynamic imports inside exportToExcel
content2 = content2.replace(
  /export const exportToExcel = async \([^)]+\) => {\r?\n(\s*)try {/g,
  "export const exportToExcel = async (data: any[], fileName: string) => {\n$1const { default: ExcelJS } = await import('exceljs');\n$1try {"
);

fs.writeFileSync(file2, content2);
console.log('Done!');
