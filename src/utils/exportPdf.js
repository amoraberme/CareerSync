import jsPDF from 'jspdf';

/**
 * Generates a clean, plain-text A4 PDF from the Analysis Data JSON object.
 * @param {Object} analysisData - The structured JSON object containing the AI output.
 * @param {string} filename - The desired name for the downloaded PDF.
 */
export const exportElementToPDF = async (analysisData, filename = 'CareerSync_Report.pdf') => {
    if (!analysisData) {
        console.error("Analysis data not provided for PDF generation.");
        return;
    }

    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const margin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const maxLineWidth = pageWidth - margin * 2;
        let yPos = margin;

        // Helper function for adding text and handling pagination
        const addText = (text, fontSize = 12, isBold = false, options = {}) => {
            doc.setFontSize(fontSize);
            doc.setFont('helvetica', isBold ? 'bold' : 'normal');

            // Split text into lines that fit the page width
            const lines = doc.splitTextToSize(text, maxLineWidth);

            // Check if we need a new page
            const lineHeight = fontSize * 0.352777778 * 1.5; // pts to mm approx
            const requiredSpace = lines.length * lineHeight;

            if (yPos + requiredSpace > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                yPos = margin;
            }

            doc.text(lines, margin, yPos, options);
            yPos += requiredSpace + (options.bottomMargin || 5); // Add spacing after block
        };

        // Header Title
        addText(`Career Sync - Analysis Report`, 20, true, { bottomMargin: 10 });

        // Job Role Info
        addText(`Target Role: ${analysisData.jobTitle || 'Unknown'}`, 12, false, { bottomMargin: 2 });
        addText(`Match Score: ${analysisData.matchScore || 0}%`, 12, true, { bottomMargin: 15 });

        // 1. Strategic Synthesis
        addText('Strategic Synthesis', 16, true, { bottomMargin: 6 });
        addText(analysisData.summary || 'No summary available.', 11, false, { bottomMargin: 12 });

        // 2. Match Analysis
        addText('Match Analysis', 16, true, { bottomMargin: 8 });

        // Verified Strengths
        addText('Verified Strengths:', 14, true, { bottomMargin: 4 });
        if (analysisData.matchedProfile && analysisData.matchedProfile.length > 0) {
            analysisData.matchedProfile.forEach(match => {
                addText(`• ${match.skill}: ${match.description}`, 11, false, { bottomMargin: 4 });
            });
        } else {
            addText('• None identified.', 11, false, { bottomMargin: 4 });
        }
        yPos += 4; // Extra space

        // Identified Gaps
        addText('Identified Gaps:', 14, true, { bottomMargin: 4 });
        if (analysisData.gapAnalysis && analysisData.gapAnalysis.length > 0) {
            analysisData.gapAnalysis.forEach(gap => {
                addText(`• ${gap.missingSkill}: ${gap.description}`, 11, false, { bottomMargin: 4 });
            });
        } else {
            addText('• None identified.', 11, false, { bottomMargin: 4 });
        }
        yPos += 8;

        // 3. Cover Letter
        addText('Cover Letter', 16, true, { bottomMargin: 6 });
        if (analysisData.coverLetter) {
            const paragraphs = analysisData.coverLetter.split('\n\n');
            paragraphs.forEach(p => {
                addText(p, 11, false, { bottomMargin: 6 });
            });
        } else {
            addText('No cover letter generated.', 11, false, { bottomMargin: 12 });
        }
        yPos += 6;

        // 4. Optimization
        addText('Optimization', 16, true, { bottomMargin: 6 });

        // Strategic Advice
        addText('Strategic Advice:', 14, true, { bottomMargin: 4 });
        if (analysisData.optimization?.strategicAdvice && analysisData.optimization.strategicAdvice.length > 0) {
            analysisData.optimization.strategicAdvice.forEach(advice => {
                addText(`• ${advice}`, 11, false, { bottomMargin: 4 });
            });
        } else {
            addText('• N/A', 11, false, { bottomMargin: 4 });
        }
        yPos += 4;

        // ATS Keywords
        addText('ATS Injection Keywords:', 14, true, { bottomMargin: 4 });
        if (analysisData.optimization?.atsKeywords && analysisData.optimization.atsKeywords.length > 0) {
            const keywords = analysisData.optimization.atsKeywords.join(', ');
            addText(keywords, 11, false, { bottomMargin: 4 });
        } else {
            addText('N/A', 11, false, { bottomMargin: 4 });
        }
        yPos += 4;

        // Structural Edits
        addText('Structural Edits:', 14, true, { bottomMargin: 4 });
        if (analysisData.optimization?.structuralEdits && analysisData.optimization.structuralEdits.length > 0) {
            analysisData.optimization.structuralEdits.forEach((edit, index) => {
                addText(`Edit ${index + 1}:`, 12, true, { bottomMargin: 2 });
                addText(`Original: ${edit.before}`, 11, false, { bottomMargin: 2 });
                addText(`Revised:  ${edit.after}`, 11, false, { bottomMargin: 6 });
            });
        } else {
            addText('• N/A', 11, false, { bottomMargin: 4 });
        }

        // Save the Document
        doc.save(filename);

    } catch (error) {
        console.error("Failed to generate text PDF:", error);
    }
};
