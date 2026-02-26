const fs = require('fs');
const path = require('path');

function extractPdfText(filePath) {
    const buf = fs.readFileSync(filePath);
    const str = buf.toString('latin1');

    // Extract text from PDF streams
    const streamMatches = str.match(/stream[\r\n]([\s\S]*?)[\r\n]endstream/g) || [];
    let text = '';

    for (const s of streamMatches) {
        // Get printable ASCII and common chars
        const cleaned = s.replace(/stream|endstream/g, '')
            .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
            .replace(/\s{3,}/g, '\n')
            .trim();
        if (cleaned.length > 20) text += cleaned + '\n';
    }

    // Also try to grab text between parentheses (PDF text objects)
    const parenMatches = str.match(/\(([^\)]{2,200})\)/g) || [];
    const parenText = parenMatches
        .map(m => m.slice(1, -1))
        .filter(t => /[a-zA-Z ]{4,}/.test(t))
        .join(' ');

    return text + '\n\n' + parenText;
}

const tos = extractPdfText('!Terms of Service.pdf');
const pp = extractPdfText('Privacy Policy.pdf');

fs.writeFileSync('tos_extracted.txt', tos, 'utf8');
fs.writeFileSync('pp_extracted.txt', pp, 'utf8');

console.log('TOS length:', tos.length);
console.log('PP length:', pp.length);
console.log('\n=== TOS SAMPLE (first 2000 chars) ===\n', tos.substring(0, 2000));
console.log('\n=== PP SAMPLE (first 2000 chars) ===\n', pp.substring(0, 2000));
