import React, { useRef, useEffect, useState } from 'react';
import { Check, CreditCard, ShieldCheck, AlertCircle, Download } from 'lucide-react';
import gsap from 'gsap';
export default function Billing({ session }) {
    const containerRef = useRef(null);
    const [isProcessing, setIsProcessing] = useState(null);

    const handleCheckout = async (tier) => {
        if (!session?.user?.id) {
            alert('Please log in to proceed with checkout.');
            return;
        }

        setIsProcessing(tier);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tier,
                    userId: session.user.id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate checkout link');
            }

            if (data.checkout_url) {
                // Open the secure PayMongo link in a new tab
                window.open(data.checkout_url, '_blank', 'noopener,noreferrer');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Unable to initialize checkout. Please try again.');
        } finally {
            setIsProcessing(null);
        }
    };

    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.from('.pricing-card', {
                scale: 0.9,
                y: 40,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power3.out'
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="max-w-7xl mx-auto py-12 px-6">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-sans tracking-tight text-surface mb-4 font-semibold">
                    Strategic <span className="font-drama italic text-champagne font-normal">Advantage</span>
                </h2>
                <p className="text-surface/60 max-w-2xl mx-auto text-lg leading-relaxed">
                    Choose the intelligence capacity that matches your professional throughput. Lock in your precision toolkit today.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                {/* Tier 1: Pay-As-You-Go */}
                <div className="pricing-card bg-slate/20 border border-surface/10 rounded-[2rem] p-8 flex flex-col items-center text-center lg:translate-y-4">
                    <h3 className="text-2xl font-bold text-surface mb-2">Base Token</h3>
                    <div className="text-surface/50 font-mono text-xs uppercase tracking-widest mb-6">Pay-As-You-Go</div>
                    <div className="text-5xl font-sans font-bold text-surface mb-8">50<span className="text-lg text-surface/40 font-normal"> / Top-up</span></div>

                    <div className="text-sm text-surface/80 bg-surface/5 p-4 rounded-xl border border-surface/10 mb-8 w-full mt-2 lg:min-h-[100px] flex items-center justify-center">
                        Perfect for quick, one-off tasks. Every top-up grants 5 credits.
                    </div>

                    <div className="space-y-4 mb-8 w-full text-left text-sm">
                        <div className="flex items-start text-surface/90">
                            <Check className="w-4 h-4 text-surface/50 mr-3 mt-1 shrink-0" />
                            <span>5 Credits per top-up</span>
                        </div>
                        <div className="flex items-start text-surface/90">
                            <Check className="w-4 h-4 text-surface/50 mr-3 mt-1 shrink-0" />
                            <span>Basic analysis tools</span>
                        </div>
                        <div className="flex items-start text-surface/90">
                            <Check className="w-4 h-4 text-surface/50 mr-3 mt-1 shrink-0" />
                            <span>30-Day History View</span>
                        </div>
                        <div className="flex items-start text-[#EA4335]/60 mt-4">
                            <span className="w-4 h-4 mr-3 mt-0.5 shrink-0 text-center font-bold">✕</span>
                            <span className="line-through text-xs">Strictly NO download features</span>
                        </div>
                        <div className="flex items-start text-[#EA4335]/60 mt-2">
                            <span className="w-4 h-4 mr-3 mt-0.5 shrink-0 text-center font-bold">✕</span>
                            <span className="line-through text-xs">NO Resume Optimization</span>
                        </div>
                    </div>

                    <button
                        onClick={() => handleCheckout('base')}
                        disabled={isProcessing !== null}
                        className="mt-auto w-full py-4 rounded-2xl border border-surface/10 text-surface/70 font-bold hover:bg-surface/5 transition-colors block text-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing === 'base' ? 'Generating Secure Link...' : 'Add Credits'}
                    </button>
                </div>

                {/* Tier 3: Premium (Target - Middle) */}
                <div className="pricing-card relative bg-slate/40 border-[3px] border-champagne rounded-[2rem] p-10 flex flex-col items-center text-center shadow-[0_0_60px_rgba(201,168,76,0.2)] transform z-10 lg:scale-[1.08]">
                    <div className="absolute -top-5 bg-champagne text-obsidian px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                        Most Popular
                    </div>
                    <h3 className="text-3xl font-bold text-champagne mb-2">Premium</h3>
                    <div className="text-champagne/70 font-mono text-xs uppercase tracking-widest mb-6">The Professional Upgrade</div>
                    <div className="text-6xl font-sans font-bold text-surface mb-2">295<span className="text-xl text-surface/40 font-normal"> / mo</span></div>

                    <div className="text-sm text-surface/80 bg-champagne/10 p-4 rounded-xl border border-champagne/20 mb-8 w-full mt-2 lg:min-h-[100px] flex items-center justify-center">
                        For a mathematically insignificant upgrade over the 245 tier, unlock complete workflow freedom and powerful resume optimization.
                    </div>

                    <div className="space-y-4 mb-8 w-full text-left">
                        <div className="flex items-start text-surface">
                            <Check className="w-5 h-5 text-champagne mr-3 mt-0.5 shrink-0" />
                            <span><strong className="text-champagne">35 analyses</strong> per day</span>
                        </div>
                        <div className="flex items-start text-surface">
                            <Download className="w-5 h-5 text-champagne mr-3 mt-0.5 shrink-0" />
                            <span><strong className="text-champagne">Full PDF Export</strong> capabilities</span>
                        </div>
                        <div className="flex items-start text-surface/80">
                            <Check className="w-5 h-5 text-champagne/70 mr-3 mt-0.5 shrink-0" />
                            <span>Detailed resume optimization surgery</span>
                        </div>
                        <div className="flex items-start text-surface/80">
                            <Check className="w-5 h-5 text-champagne/70 mr-3 mt-0.5 shrink-0" />
                            <span>Unlimited History View</span>
                        </div>
                    </div>

                    <button
                        onClick={() => handleCheckout('premium')}
                        disabled={isProcessing !== null}
                        className="mt-auto w-full py-5 rounded-2xl bg-champagne text-obsidian font-bold text-lg hover:scale-[1.02] transition-transform shadow-xl block text-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing === 'premium' ? 'Securing Premium Access...' : 'Secure Premium Access'}
                    </button>
                </div>

                {/* Tier 2: Standard (Decoy) */}
                <div className="pricing-card bg-slate/20 border border-surface/10 rounded-[2rem] p-8 flex flex-col items-center text-center lg:translate-y-4 relative z-0">
                    <h3 className="text-2xl font-bold text-surface mb-2">Standard</h3>
                    <div className="text-surface/50 font-mono text-xs uppercase tracking-widest mb-6">Monthly Retainer</div>
                    <div className="text-5xl font-sans font-bold text-surface mb-8">245<span className="text-lg text-surface/40 font-normal"> / mo</span></div>

                    <div className="text-sm text-surface/80 bg-surface/5 p-4 rounded-xl border border-surface/10 mb-8 w-full mt-2 lg:min-h-[100px] flex items-center justify-center">
                        Consistent daily access with full export rights, but limited to standard outputs.
                    </div>

                    <div className="space-y-4 mb-8 w-full text-left text-sm">
                        <div className="flex items-start text-surface/90">
                            <Check className="w-4 h-4 text-surface/50 mr-3 mt-1 shrink-0" />
                            <span>25 analyses per day</span>
                        </div>
                        <div className="flex items-start text-surface/90">
                            <Check className="w-4 h-4 text-surface/50 mr-3 mt-1 shrink-0" />
                            <span>Full PDF Export capabilities</span>
                        </div>
                        <div className="flex items-start text-surface/90">
                            <Check className="w-4 h-4 text-surface/50 mr-3 mt-1 shrink-0" />
                            <span>Standard Cover Letters</span>
                        </div>
                        <div className="flex items-start text-[#EA4335]/60 mt-4">
                            <span className="w-4 h-4 mr-3 mt-0.5 shrink-0 text-center font-bold">✕</span>
                            <span className="line-through text-xs">NO Resume Optimization</span>
                        </div>
                    </div>

                    <button
                        onClick={() => handleCheckout('standard')}
                        disabled={isProcessing !== null}
                        className="mt-auto w-full py-4 rounded-2xl bg-surface/10 text-surface hover:bg-surface/20 font-bold transition-colors block text-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing === 'standard' ? 'Initializing Checkout...' : 'Subscribe to Standard'}
                    </button>
                </div>
            </div>
        </div>
    );
}
