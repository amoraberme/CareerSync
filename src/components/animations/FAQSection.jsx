import React from 'react';
import FAQItem from './FAQItem';
import SwipeLettersButton from './SwipeLettersButton';

const faqData = [
    {
        number: "01",
        question: "Why am I being asked to pay an exact amount with random centavos?",
        answer: "CareerSync uses a highly secure centavo-matching system to instantly verify your GCash transfer. By assigning a unique, locked centavo amount to your session, our database can automatically and accurately credit your specific account the moment the transaction completes."
    },
    {
        number: "02",
        question: "Do my credits roll over, or do they reset daily?",
        answer: "It depends on your chosen tier. Base tier users operate on a token system where purchased credits seamlessly resets every 24 hours. Standard and Premium subscribers receive a massive daily refill (up to 50 credits a day) that seamlessly resets every 30 Days. Furthermore, credits are only ever deducted if the AI successfully completes your analysis."
    },
    {
        number: "03",
        question: "Is my resume data secure when analyzed by the AI?",
        answer: "Absolutely. Your history and profile are locked down by strict Row Level Security (RLS) policies, meaning no one but you can access your data. When analyzing your resume, our architecture strictly isolates your text from the core AI instructions, ensuring your data is only used to generate your personal report and is completely protected against unauthorized prompts."
    },
    {
        number: "04",
        question: "What exactly do I get when I upgrade to Premium?",
        answer: "Upgrading shifts your career search into high gear. While all users get a Match Score and Cover Letter, Standard and Premium users unlock the ability to export their full reports to PDF for easy sharing. Premium users also gain exclusive access to the Resume Optimization engine, which provides tactical before-and-after rewrite advice and targeted ATS keywords to get you past recruiter filters."
    }
];

export default function FAQSection({ onContactClick }) {
    return (
        <section className="w-full max-w-7xl mx-auto px-6 py-24 border-t border-obsidian/5 dark:border-darkText/5">
            <div className="bg-white/50 dark:bg-darkCard/50 backdrop-blur-sm rounded-[3rem] p-8 md:p-16 border border-obsidian/10 dark:border-darkText/10 shadow-xl overflow-hidden relative">

                {/* Background decorative styling mimicking Framer */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-[3rem] z-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-slate-100 to-transparent dark:from-darkBg/50 dark:to-transparent" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row gap-16 lg:gap-24">
                    {/* Left Column: Heading & Contact Info */}
                    <div className="lg:w-1/3 flex flex-col justify-start">
                        <div className="absolute -top-12 -left-12 text-[15rem] leading-none font-bold text-slate/5 dark:text-darkText/5 select-none pointer-events-none font-mono">
                            FAQ
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-obsidian dark:text-darkText mb-6 relative z-10 bg-gradient-to-br from-obsidian to-obsidian/60 dark:from-darkText dark:to-darkText/60 bg-clip-text text-transparent">
                            Questions & Answers
                        </h2>
                        <p className="text-slate dark:text-darkText/70 text-base md:text-lg mb-8 relative z-10">
                            Have more questions? Don't hesitate to email us or reach out to support.
                        </p>
                        <div className="relative z-10 mt-auto opacity-0 lg:opacity-100 flex-grow pointer-events-none">
                            {/* spacing fill for desktop */}
                        </div>
                    </div>

                    {/* Right Column: Accordions */}
                    <div className="lg:w-2/3 relative z-10 flex flex-col">
                        {faqData.map((item, index) => (
                            <FAQItem
                                key={index}
                                number={item.number}
                                question={item.question}
                                answer={item.answer}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
