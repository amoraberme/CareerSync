/**
 * Tier Permissions — Feature gating utility
 *
 * Defines which features each subscription tier can access.
 * Used by GatedFeature.jsx and directly in components for conditional rendering.
 */

// Canonical tier permission map
const TIER_PERMISSIONS = {
    base: {
        label: 'Base Token',
        pdf_export: false,
        resume_optimization: false,
        cover_letter: true,
        unlimited_history: false,
        historyLimit: 5
    },
    standard: {
        label: 'Standard',
        pdf_export: true,
        resume_optimization: false,
        cover_letter: true,
        unlimited_history: true,
        historyLimit: Infinity
    },
    premium: {
        label: 'Premium',
        pdf_export: true,
        resume_optimization: true,
        cover_letter: true,
        unlimited_history: true,
        historyLimit: Infinity
    }
};

/**
 * Check if a tier has access to a specific feature.
 * @param {string} tier - 'base' | 'standard' | 'premium'
 * @param {string} feature - Feature key from TIER_PERMISSIONS
 * @returns {boolean}
 */
export function canAccess(tier, feature) {
    const permissions = TIER_PERMISSIONS[tier] || TIER_PERMISSIONS.base;
    return !!permissions[feature];
}

/**
 * Get the history item limit for a tier.
 * @param {string} tier
 * @returns {number}
 */
export function getHistoryLimit(tier) {
    const permissions = TIER_PERMISSIONS[tier] || TIER_PERMISSIONS.base;
    return permissions.historyLimit;
}

/**
 * Get the display label for a tier.
 * @param {string} tier
 * @returns {string}
 */
export function getTierLabel(tier) {
    const permissions = TIER_PERMISSIONS[tier] || TIER_PERMISSIONS.base;
    return permissions.label;
}

/**
 * Get the minimum tier required for a feature (for upgrade prompts).
 * @param {string} feature
 * @returns {string}
 */
export function getMinimumTier(feature) {
    if (TIER_PERMISSIONS.base[feature]) return 'base';
    if (TIER_PERMISSIONS.standard[feature]) return 'standard';
    return 'premium';
}

export default TIER_PERMISSIONS;
