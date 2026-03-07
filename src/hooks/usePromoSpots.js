import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function usePromoSpots() {
    const [spotsLeft, setSpotsLeft] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function fetchInitialSpots() {
            try {
                const { data, error } = await supabase.rpc('get_promo_spots_left');
                if (error) throw error;
                if (isMounted) {
                    setSpotsLeft(data);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error fetching promo spots:', err);
                if (isMounted) setLoading(false);
            }
        }

        fetchInitialSpots();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('public:promo_tracker_banner')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'promo_tracker', filter: 'id=eq.1' },
                (payload) => {
                    if (isMounted && payload.new && typeof payload.new.spots_remaining === 'number') {
                        setSpotsLeft(payload.new.spots_remaining);
                    }
                }
            )
            .subscribe();

        return () => {
            isMounted = false;
            supabase.removeChannel(channel);
        };
    }, []);

    return { spotsLeft, loading };
}
