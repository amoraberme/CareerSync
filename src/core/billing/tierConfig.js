/**
 * SINGLE SOURCE OF TRUTH — Tier Configuration
 * Used by: initiate-payment.js, analyze.js, webhooks/paymongo.js
 * DO NOT duplicate this logic elsewhere.
 */

export const TIER_CONFIG = {
    base: {
        label: 'Base Token',
        base_amount: 100,           // ₱1.00 in centavos
        // Credits granted to current_credit_balance on purchase
        credits_on_purchase: 10,
        // -1 = unlimited daily premium analyses (base uses credit balance, not daily cap)
        daily_cap: -1,
        // No subscription lock
        lock_days: 0,
        unlimited_base: false,
    },
    standard: {
        label: 'Standard',
        base_amount: 200,           // ₱2.00 in centavos
        // Standard plan grants 40 credits on purchase
        credits_on_purchase: 40,
        daily_cap: 40,
        lock_days: 30,
        unlimited_base: true,       // Base credit balance is never deducted
    },
    premium: {
        label: 'Premium',
        base_amount: 300,           // ₱3.00 in centavos
        credits_on_purchase: 50,
        daily_cap: 50,
        lock_days: 30,
        unlimited_base: true,
    },
};

/**
 * Returns the daily analysis cap for a given tier.
 * -1 signals "governed by credit balance" (base tier).
 */
export function getDailyCap(tier) {
    return TIER_CONFIG[tier]?.daily_cap ?? -1;
}

/**
 * Returns true if this tier bypasses the credit balance deduction.
 */
export function hasUnlimitedBase(tier) {
    return TIER_CONFIG[tier]?.unlimited_base ?? false;
}
