import React from 'react';
import { Lock, ArrowUpRight } from 'lucide-react';
import { canAccess, getMinimumTier, getTierLabel } from '../../lib/tierPermissions';

/**
 * GatedFeature — Wraps UI elements with tier-based access control.
 *
 * If the user's tier has access to the feature, renders children normally.
 * Otherwise, renders a disabled overlay with an upgrade prompt.
 *
 * @param {string} tier - Current user tier ('base', 'standard', 'premium')
 * @param {string} feature - Feature key to check ('pdf_export', 'resume_optimization', etc)
 * @param {function} onUpgrade - Callback when "Upgrade" is clicked (e.g., navigate to billing)
 * @param {string} [fallbackMessage] - Custom message for the locked state
 * @param {React.ReactNode} children - The gated content
 */
export default function GatedFeature({ tier, feature, onUpgrade, fallbackMessage, children }) {
    const hasAccess = canAccess(tier, feature);

    if (hasAccess) {
        return <>{children}</>;
    }

    const requiredTier = getMinimumTier(feature);
    const tierLabel = getTierLabel(requiredTier);

    return (
        <div className="relative">
            {/* Blurred/dimmed content underneath */}
            <div className="opacity-30 pointer-events-none select-none blur-[1px]">
                {children}
            </div>

            {/* Upgrade overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 dark:bg-darkBg/90 backdrop-blur-sm border border-obsidian/10 dark:border-darkText/10 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg max-w-xs">
                    <div className="w-12 h-12 bg-champagne/10 border border-champagne/20 rounded-full flex items-center justify-center mb-3">
                        <Lock className="w-5 h-5 text-champagne" />
                    </div>
                    <p className="text-sm font-medium text-obsidian dark:text-darkText mb-1">
                        {fallbackMessage || `${tierLabel} feature`}
                    </p>
                    <p className="text-xs text-slate dark:text-darkText/60 mb-4">
                        Upgrade to {tierLabel} to unlock this feature.
                    </p>
                    <button
                        onClick={onUpgrade}
                        className="flex items-center space-x-1 bg-champagne text-obsidian px-5 py-2.5 rounded-full text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-md"
                    >
                        <span>Upgrade Plan</span>
                        <ArrowUpRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
