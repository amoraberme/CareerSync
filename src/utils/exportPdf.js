import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Captures a DOM element and exports it as a paginated A4 PDF.
 * @param {HTMLElement} element - The DOM node to capture.
 * @param {string} filename - The desired name for the downloaded PDF.
 */
export const exportElementToPDF = async (element, filename = 'CareerSync_Report.pdf') => {
    if (!element) {
        console.error("DOM Element not provided for PDF generation.");
        return;
    }

    try {
        // Temporarily adjust styles for better PDF rendering
        const originalBg = element.style.backgroundColor;
        // Set a solid background for the capture to prevent transparency issues
        element.style.backgroundColor = '#050505'; // obsidian

        const canvas = await html2canvas(element, {
            scale: 2, // Higher scale for better resolution
            useCORS: true,
            logging: false,
            backgroundColor: '#050505',
        });

        element.style.backgroundColor = originalBg;

        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        // A4 Dimensions in mm
        const pdfWidth = 210;
        const pdfHeight = 297;

        // Calculate aspect ratio to fit the canvas width to A4 width
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        const pdf = new jsPDF('p', 'mm', 'a4');
        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        // Add paginated subsequent pages if content overflows A4 height
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(filename);

    } catch (error) {
        console.error("Failed to generate PDF:", error);
    }
};
