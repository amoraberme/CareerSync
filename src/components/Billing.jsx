import React, { useRef, useEffect, useState } from 'react';
import { Check, CreditCard, ShieldCheck } from 'lucide-react';
import gsap from 'gsap';

export default function Billing() {
    const containerRef = useRef(null);
    const [showMockModal, setShowMockModal] = useState(false);

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
        <div ref={containerRef} className="max-w-6xl mx-auto py-12 px-6">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-sans tracking-tight text-surface mb-4 font-semibold">
                    Unlock the <span className="font-drama italic text-champagne font-normal">Advantage</span>
                </h2>
                <p className="text-surface/60 max-w-xl mx-auto text-lg leading-relaxed">
                    Upgrade your precision toolkit to generate highly contextual cover letters and unlimited AI match analysis.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Free Tier */}
                <div className="pricing-card bg-slate/20 border border-surface/10 rounded-[2rem] p-8 flex flex-col items-center text-center">
                    <h3 className="text-2xl font-bold text-surface mb-2">Essential</h3>
                    <div className="text-surface/50 font-mono text-sm uppercase tracking-widest mb-6">Current Plan</div>
                    <div className="text-5xl font-sans font-bold text-surface mb-8">$0<span className="text-lg text-surface/40 font-normal">/mo</span></div>

                    <div className="space-y-4 mb-8 w-full">
                        {['5 AI analyses per month', 'Basic match scoring', 'Standard resume parsing'].map((feature, i) => (
                            <div key={i} className="flex items-center text-surface/70">
                                <Check className="w-5 h-5 text-surface/30 mr-3 shrink-0" />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>

                    <button disabled className="mt-auto w-full py-4 rounded-2xl bg-surface/10 text-surface/50 font-bold cursor-default">
                        Active Plan
                    </button>
                </div>

                {/* Pro Tier */}
                <div className="pricing-card relative bg-slate/40 border-2 border-champagne rounded-[2rem] p-8 flex flex-col items-center text-center shadow-[0_0_50px_rgba(201,168,76,0.15)] transform md:-translate-y-4">
                    <div className="absolute -top-4 bg-champagne text-obsidian px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                        Recommended
                    </div>
                    <h3 className="text-2xl font-bold text-champagne mb-2">Performance</h3>
                    <div className="text-surface/50 font-mono text-sm uppercase tracking-widest mb-6">Full Ecosystem</div>
                    <div className="text-5xl font-sans font-bold text-surface mb-8">$29<span className="text-lg text-surface/40 font-normal">/mo</span></div>

                    <div className="space-y-4 mb-8 w-full text-left">
                        {[
                            'Unlimited AI analyses',
                            'Advanced contextual Cover Letters',
                            'Detailed resume optimization surgery',
                            'ATS keyword injections',
                            'Priority parsing engine'
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center text-surface/90">
                                <Check className="w-5 h-5 text-champagne mr-3 shrink-0" />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowMockModal(true)}
                        className="mt-auto w-full py-4 rounded-2xl bg-champagne text-obsidian font-bold btn-magnetic"
                    >
                        Upgrade to Performance
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
                            <h3 className="text-xl font-bold text-[#1a1a1a]">CareerSync PRO</h3>
                            <p className="text-[#666666] text-sm">per month</p>
                            <div className="text-4xl font-bold mt-2">$29.00</div>
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
