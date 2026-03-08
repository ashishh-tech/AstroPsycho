const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

(async () => {
    try {
        const existingPdfBytes = fs.readFileSync('premium-full-report.pdf');
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        console.log(`Total Pages: ${pdfDoc.getPageCount()}`);
    } catch (e) {
        console.error('Error reading PDF:', e);
    }
})();
