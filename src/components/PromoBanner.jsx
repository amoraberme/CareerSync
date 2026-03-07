import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Sparkles } from 'lucide-react';

export default function PromoBanner({ onNavigate }) {
    const [userCount, setUserCount] = useState(0);
    const [activePromos, setActivePromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const MAX_PROMO_USERS = 50;

    useEffect(() => {
        // Initial fetch
        async function fetchUserCount() {
            try {
                const { data, error } = await supabase
                    .from('site_stats')
                    .select('stat_value')
                    .eq('id', 'total_users')
                    .single();

                if (error && error.code !== 'PGRST116') throw error;
                if (data) setUserCount(data.stat_value);
            } catch (error) {
                console.error('Error fetching site stats:', error);
            }
        }

        async function fetchPromos() {
            try {
                const { data, error } = await supabase
                    .from('promo_codes')
                    .select('*')
                    .eq('is_active', true);

                if (data) {
                    const validPromos = data.filter(p => p.current_uses < p.max_uses && (!p.expires_at || new Date(p.expires_at) > new Date()));
                    setActivePromos(validPromos || []);
                }
            } catch (err) {
                console.error(err);
            }
        }

        Promise.all([fetchUserCount(), fetchPromos()]).then(() => setLoading(false));

        // Subscribe to real-time changes for site_stats
        const statsChannel = supabase
            .channel('public:site_stats_banner')
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'site_stats', filter: 'id=eq.total_users' },
                (payload) => {
                    if (payload.new && typeof payload.new.stat_value === 'number') {
                        setUserCount(payload.new.stat_value);
                    }
                }
            )
            .subscribe();

        const promoChannel = supabase
            .channel('public:promo_codes_banner')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'promo_codes' },
                () => {
                    fetchPromos(); // Refetch on any promo change
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(statsChannel);
            supabase.removeChannel(promoChannel);
        };
    }, []);

    const showFirst50 = userCount < MAX_PROMO_USERS;
    const firstPromo = activePromos.length > 0 ? activePromos[0] : null;

    if (loading || (!showFirst50 && !firstPromo)) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-[101] bg-champagne text-obsidian px-4 py-2 flex flex-col md:flex-row items-center justify-center text-[10px] md:text-sm font-bold shadow-md gap-2 md:gap-4 transition-all w-full leading-none">
            {showFirst50 && (
                <div className="flex items-center">
                    <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 animate-pulse" />
                    <span>First 50 get 10 Free Credits!</span>
                    <span className="bg-obsidian text-champagne px-2 py-0.5 rounded-full text-[9px] md:text-xs ml-2 block truncate mt-0.5">
                        {userCount}/{MAX_PROMO_USERS} claim
                    </span>
                </div>
            )}

            {showFirst50 && firstPromo && <span className="hidden md:inline opacity-50">•</span>}

            {firstPromo && (
                <div className="flex items-center text-[#d32f2f] dark:text-[#EA4335] bg-white/20 px-2 py-0.5 rounded-lg border border-obsidian/10 mt-1 md:mt-0">
                    <span className="mr-1 hidden sm:inline">🔥 USE PROMO:</span>
                    <span className="font-mono bg-obsidian text-champagne px-1.5 py-0.5 rounded text-[10px] md:text-xs">
                        {firstPromo.code_name}
                    </span>
                    <span className="opacity-70 ml-1 whitespace-nowrap text-[10px] md:text-xs mt-0.5">
                        — {firstPromo.discount_amount}{firstPromo.is_percentage ? '%' : '₱'} OFF
                    </span>
                    <span className="ml-2 bg-white/50 px-1.5 py-0.5 rounded text-obsidian font-mono text-[9px] md:text-[10px] whitespace-nowrap mt-0.5 shadow-sm">
                        Only {firstPromo.max_uses - firstPromo.current_uses} left!
                    </span>
                </div>
            )}

            <button
                onClick={() => onNavigate('plans')}
                className="ml-2 underline underline-offset-2 hover:opacity-80 transition-opacity hidden lg:inline-block"
            >
                Claim yours
            </button>
        </div>
    );
}
