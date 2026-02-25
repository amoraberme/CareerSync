// ═══════════════════════════════════════════════════════════════
// EMVCo / QRPh TLV utility — for generating dynamic QRPh payloads
// from a merchant's static QR base payload.
//
// The Philippine QRPh standard (BSP Circular No. 1055-B) uses
// the EMVCo TLV (Tag-Length-Value) encoding format.
//
// Usage:
//   const payload = buildDynamicQRPh(basePayload, 1.01);
//   // Returns a fully valid QRPh string with Tag 54 set to "1.01"
//   // and a recalculated CRC-16 checksum.
// ═══════════════════════════════════════════════════════════════

/**
 * Parse an EMVCo TLV string into an array of { tag, len, value } objects.
 * Each tag is 2 chars, length is 2 chars (decimal), value is `len` chars.
 * @param {string} str - The EMVCo payload WITHOUT the final 4-char CRC.
 * @returns {{ tag: string, value: string }[]}
 */
export function parseTLV(str) {
    const tags = [];
    let i = 0;
    while (i < str.length) {
        if (i + 4 > str.length) break;
        const tag = str.substring(i, i + 2);
        const len = parseInt(str.substring(i + 2, i + 4), 10);
        if (isNaN(len)) break;
        const value = str.substring(i + 4, i + 4 + len);
        tags.push({ tag, value });
        i += 4 + len;
    }
    return tags;
}

/**
 * Serialize an array of TLV tag objects back into an EMVCo string.
 * @param {{ tag: string, value: string }[]} tags
 * @returns {string}
 */
export function serializeTLV(tags) {
    return tags.map(t => {
        const len = t.value.length.toString().padStart(2, '0');
        return `${t.tag}${len}${t.value}`;
    }).join('');
}

/**
 * CRC-16/CCITT-FALSE as required by the EMVCo QR spec (polynomial 0x1021).
 * Applied to the entire string including the "6304" suffix but excluding
 * the 4-character CRC value itself.
 * @param {string} str
 * @returns {string} 4-char uppercase hex CRC
 */
export function crc16(str) {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
        crc ^= (str.charCodeAt(i) << 8);
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Build a DYNAMIC QRPh payload from a merchant's static QR base string,
 * injecting exactly `amountPesos` (e.g. 1.01) into EMVCo Tag 54 and
 * recalculating the CRC-16 checksum.
 *
 * @param {string} basePayload - Raw EMVCo string from the merchant's static QR
 * @param {number} amountPesos - Exact peso amount including centavo suffix (e.g. 1.01)
 * @returns {string} A valid dynamic QRPh EMVCo payload string
 */
export function buildDynamicQRPh(basePayload, amountPesos) {
    // Strip the trailing 8-char CRC block ("63" + "04" + 4-char checksum)
    const body = basePayload.endsWith('6304') ? basePayload.slice(0, -4 - 4) : basePayload.slice(0, -8);

    const tags = parseTLV(body);

    // EMVCo Tag 54 = Transaction Amount (string, 2 decimal places max 13 chars)
    const amountStr = amountPesos.toFixed(2);
    const existing = tags.findIndex(t => t.tag === '54');

    if (existing >= 0) {
        tags[existing].value = amountStr;
    } else {
        // Insert Tag 54 before Tag 58 (Country Code) — required by spec ordering
        const idx58 = tags.findIndex(t => t.tag === '58');
        const insertAt = idx58 >= 0 ? idx58 : tags.length;
        tags.splice(insertAt, 0, { tag: '54', value: amountStr });
    }

    // Also update Tag 01 to "12" (dynamic QR) if it's "11" (static QR)
    const tag01 = tags.find(t => t.tag === '01');
    if (tag01 && tag01.value === '11') {
        tag01.value = '12';
    }

    // Serialize and append CRC sentinel before calculating checksum
    const withoutCrc = serializeTLV(tags) + '6304';
    const checksum = crc16(withoutCrc);

    return withoutCrc + checksum;
}

/**
 * Detect if STATIC_QRPH_DATA env var is set and generate a dynamic payload.
 * Returns null if env var is not configured.
 *
 * @param {number} exactAmountCentavos - Amount in centavos (e.g. 101 for ₱1.01)
 * @returns {string|null}
 */
export function generateSessionQRPhPayload(exactAmountCentavos) {
    const basePayload = process.env.STATIC_QRPH_DATA;
    if (!basePayload || basePayload.trim() === '') return null;

    try {
        const amountPesos = exactAmountCentavos / 100;
        return buildDynamicQRPh(basePayload.trim(), amountPesos);
    } catch (err) {
        console.warn('[EMVCo] Failed to generate dynamic QRPh payload:', err.message);
        return null;
    }
}
