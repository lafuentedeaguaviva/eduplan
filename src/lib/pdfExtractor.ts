/**
 * Utility to extract text from a PDF file using pdfjs-dist.
 * Designed to be run only on the client side to avoid Next.js SSR issues.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
    if (typeof window === 'undefined') {
        throw new Error('PDF extraction can only run on the client side');
    }

    try {
        // We load pdf.js from CDN directly to completely bypass Next.js / Turbopack 
        // bundling issues (which cause the enqueueModel / canvas crash)
        await loadPdfJsFromCDN();
        
        // @ts-ignore
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

        const arrayBuffer = await file.arrayBuffer();
        
        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        
        // Loop through all pages and extract text
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
                
            fullText += pageText + '\n\n';
        }
        
        return fullText.trim();
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error('No se pudo procesar el archivo PDF. Verifica que sea un PDF válido y contenga texto.');
    }
}

function loadPdfJsFromCDN(): Promise<void> {
    return new Promise((resolve, reject) => {
        // @ts-ignore
        if (window['pdfjs-dist/build/pdf']) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.async = true;
        
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('No se pudo cargar la librería PDF.js'));
        
        document.body.appendChild(script);
    });
}
