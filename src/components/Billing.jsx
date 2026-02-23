import React, { useRef, useEffect, useState } from 'react';
import { Check, CreditCard, ShieldCheck, AlertCircle, Download } from 'lucide-react';
import gsap from 'gsap';

export default function Billing() {
    const containerRef = useRef(null);
    const [showMockModal, setShowMockModal] = useState(false);
    const [selectedTier, setSelectedTier] = useState(null);

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

    const handleSubscribe = (tierPrice) => {
        setSelectedTier(tierPrice);
        setShowMockModal(true);
    };

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
                    <div className="text-5xl font-sans font-bold text-surface mb-8">50<span className="text-lg text-surface/40 font-normal"> / min</span></div>

                    <div className="space-y-4 mb-8 w-full text-left text-sm">
                        <div className="flex items-start text-surface/70">
                            <Check className="w-4 h-4 text-surface/30 mr-3 mt-1 shrink-0" />
                            <span>10 analyses per day</span>
                        </div>
                        <div className="flex items-start text-[#EA4335]/80 bg-[#EA4335]/5 p-3 rounded-xl border border-[#EA4335]/10 mt-4">
                            <AlertCircle className="w-4 h-4 mr-3 mt-0.5 shrink-0" />
                            <span className="text-xs leading-relaxed">You may hit your daily wall after just 5 complex task computations.</span>
                        </div>
                        <div className="flex items-start text-surface/40 mt-4">
                            <span className="w-4 h-4 mr-3 mt-1 shrink-0 text-center font-bold">✕</span>
                            <span className="line-through">PDF Export Feature</span>
                        </div>
                    </div>

                    <button className="mt-auto w-full py-4 rounded-2xl border border-surface/10 text-surface/70 font-bold hover:bg-surface/5 transition-colors">
                        Add Credits
                    </button>
                </div>

                {/* Tier 3: Premium (Target - Middle) */}
                <div className="pricing-card relative bg-slate/40 border-[3px] border-champagne rounded-[2rem] p-10 flex flex-col items-center text-center shadow-[0_0_60px_rgba(201,168,76,0.2)] transform z-10 lg:scale-[1.08]">
                    <div className="absolute -top-5 bg-champagne text-obsidian px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                        Most Popular
                    </div>
                    <h3 className="text-3xl font-bold text-champagne mb-2">Premium</h3>
                    <div className="text-champagne/70 font-mono text-xs uppercase tracking-widest mb-6">Full Ecosystem</div>
                    <div className="text-6xl font-sans font-bold text-surface mb-2">295<span className="text-xl text-surface/40 font-normal"> / mo</span></div>

                    <div className="text-sm text-surface/80 bg-champagne/10 p-3 rounded-xl border border-champagne/20 mb-8 w-full mt-2">
                        For a mathematically insignificant upgrade over the 245 tier, unlock complete PDF download capabilities and workflow freedom.
                    </div>

                    <div className="space-y-4 mb-8 w-full text-left">
                        <div className="flex items-start text-surface">
                            <Check className="w-5 h-5 text-champagne mr-3 mt-0.5 shrink-0" />
                            <span><strong className="text-champagne">50 analyses</strong> per day</span>
                        </div>
                        <div className="flex items-start text-surface">
                            <Download className="w-5 h-5 text-champagne mr-3 mt-0.5 shrink-0" />
                            <span><strong className="text-champagne">Full PDF Export</strong> capabilities</span>
                        </div>
                        <div className="flex items-start text-surface/80">
                            <Check className="w-5 h-5 text-champagne/70 mr-3 mt-0.5 shrink-0" />
                            <span>Advanced contextual Cover Letters</span>
                        </div>
                        <div className="flex items-start text-surface/80">
                            <Check className="w-5 h-5 text-champagne/70 mr-3 mt-0.5 shrink-0" />
                            <span>Detailed resume optimization surgery</span>
                        </div>
                    </div>

                    <button
                        onClick={() => handleSubscribe('295')}
                        className="mt-auto w-full py-5 rounded-2xl bg-champagne text-obsidian font-bold text-lg hover:scale-[1.02] transition-transform shadow-xl"
                    >
                        Secure Premium Access
                    </button>
                </div>

                {/* Tier 2: Standard (Decoy) */}
                <div className="pricing-card bg-slate/20 border border-surface/10 rounded-[2rem] p-8 flex flex-col items-center text-center lg:translate-y-4 opacity-90 hover:opacity-100 transition-opacity">
                    <h3 className="text-2xl font-bold text-surface mb-2">Standard</h3>
                    <div className="text-surface/50 font-mono text-xs uppercase tracking-widest mb-6">Monthly Retainer</div>
                    <div className="text-5xl font-sans font-bold text-surface mb-8">245<span className="text-lg text-surface/40 font-normal"> / mo</span></div>

                    <div className="space-y-4 mb-8 w-full text-left text-sm">
                        <div className="flex items-start text-surface/90">
                            <Check className="w-4 h-4 text-surface/50 mr-3 mt-1 shrink-0" />
                            <span>50 analyses per day</span>
                        </div>
                        <div className="flex items-start text-surface/90">
                            <Check className="w-4 h-4 text-surface/50 mr-3 mt-1 shrink-0" />
                            <span>Standard Cover Letters</span>
                        </div>
                        <div className="flex items-start text-[#EA4335]/60 mt-4 bg-[#EA4335]/5 p-3 rounded-xl border border-[#EA4335]/10">
                            <span className="w-4 h-4 mr-3 mt-0.5 shrink-0 text-center font-bold">✕</span>
                            <span className="line-through text-xs leading-relaxed">Strictly NO download features. Data locked to dashboard.</span>
                        </div>
                    </div>

                    <button
                        onClick={() => handleSubscribe('245')}
                        className="mt-auto w-full py-4 rounded-2xl bg-surface/10 text-surface hover:bg-surface/20 font-bold transition-colors"
                    >
                        Subscribe to Standard
                    </button>
                </div>
            </div>

            {/* Stripe Mockup Modal */}
            {showMockModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm" onClick={() => setShowMockModal(false)}></div>
                    <div className="relative bg-[#ffffff] text-[#1a1a1a] rounded-xl w-full max-w-md p-0 shadow-2xl animate-fade-in-up overflow-hidden">
                        {/* Mock Stripe Header */}
                        <div className="bg-[#f7f7f7] p-6 border-b border-[#e6e6e6] text-center relative pointer-events-none">
                            <ShieldCheck className="w-12 h-12 text-[#34A853] mx-auto mb-2" />
                            <h3 className="text-xl font-bold text-[#1a1a1a]">CareerSync {selectedTier === '295' ? 'PREMIUM' : 'STANDARD'}</h3>
                            <p className="text-[#666666] text-sm">per month</p>
                            <div className="text-4xl font-bold mt-2">{selectedTier}</div>
                        </div>
                        {/* Mock Payment Form */}
                        <div className="p-6 pointer-events-none">
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-[#666] mb-1 uppercase tracking-wide">Card Information</label>
                                <div className="border border-[#e6e6e6] rounded-md flex items-center p-3">
                                    <CreditCard className="w-5 h-5 text-[#999] mr-2" />
                                    <span className="text-[#ccc]">4242 4242 4242 4242</span>
                                </div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setShowMockModal(false); }} className="w-full bg-[#0D0D12] text-white rounded-md py-3 font-bold mt-4 pointer-events-auto hover:bg-[#2A2A35] transition-colors">
                                Subscribe
                            </button>
                            <p className="text-center text-xs text-[#999] mt-4 flex items-center justify-center">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4 opacity-50 block grayscale" />
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
