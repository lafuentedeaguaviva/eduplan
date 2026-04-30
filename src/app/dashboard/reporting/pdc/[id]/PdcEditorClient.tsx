'use client';

import { Pdc, FullReportData } from '@/types';
import ReportHeader from './components/ReportHeader';
import ReferenceData from './components/ReferenceData';
import CurricularTable from './components/CurricularTable';
import PDFPreview from './components/PDFPreview';

/**
 * PdcEditorClient - Container Component
 * Rule: Separation of Concerns (Sections extracted to components)
 */
export default function PdcEditorClient({
    pdcId,
    initialPdc,
    fullReportData,
}: {
    pdcId: string,
    initialPdc: Pdc,
    fullReportData: FullReportData,
}) {
    console.log("DEBUG: PdcEditorClient rendering with extracted components");
    
    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">
            {/* Mesh Gradients & Patterns */}
            <div className="absolute inset-0 bg-dot-pattern opacity-[0.1] pointer-events-none"></div>
            <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-400/10 blur-[120px] rounded-full animate-pulse-slow"></div>
            <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-indigo-400/10 blur-[120px] rounded-full animate-float"></div>
            
            <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-8 animate-fade-in-up">
                <ReportHeader initialPdc={initialPdc} fullReportData={fullReportData} />
                
                <main className="max-w-6xl mx-auto space-y-20 pb-20 mt-12">
                    <ReferenceData initialPdc={initialPdc} fullReportData={fullReportData} />
                    
                    <CurricularTable fullReportData={fullReportData} initialPdc={initialPdc} />

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-20 border-t border-slate-200">
                        <SignatureBlock name={fullReportData.director} role="Director de Unidad Educativa" />
                        <SignatureBlock name={fullReportData.docente} role="Firma del Maestro/a" />
                    </section>
                </main>
            </div>

            {/* Hidden Preview Section for PDF */}
            <PDFPreview initialPdc={initialPdc} fullReportData={fullReportData} />
        </div>
    );
}

function SignatureBlock({ name, role }: { name: string, role: string }) {
    return (
        <div className="text-center pt-8 border-t border-slate-300">
            <div className="w-48 h-1 bg-slate-200 mx-auto mb-4 rounded-full"></div>
            <p className="text-sm font-black text-slate-800 mb-1">{name}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{role}</p>
        </div>
    );
}
