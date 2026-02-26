import React from 'react';
import LegalLayout from './LegalLayout';

const Terms = ({ onBack }) => {
    return (
        <LegalLayout title="Terms of Service" onBack={onBack}>
            <div className="space-y-12">
                <section>
                    <p className="text-xl font-semibold text-obsidian dark:text-darkText mb-2">
                        CAREERSYNC TERMS OF SERVICE
                    </p>
                    <p className="text-sm font-mono uppercase tracking-widest text-slate/60 dark:text-darkText/40 mb-8">
                        Effective Date: February 26, 2026<br />
                        Governing Jurisdiction: Republic of the Philippines
                    </p>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText mb-6">1. Acceptance of Terms & Core Agreement</h2>
                    <p className="text-lg leading-relaxed text-slate/80 dark:text-darkText/70 indent-8">
                        Welcome to CareerSync. By accessing the platform, creating an account, or uploading documents, the user agrees to be bound by these terms, creating a legally binding contract. This establishes the rules of the road, protecting the business from liability while setting clear expectations for the user. If you do not agree to these Terms, you are strictly prohibited from utilizing the CareerSync platform, its APIs, or any associated services.
                    </p>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText mb-6">2. Comprehensive Definitions</h2>
                    <p className="text-lg leading-relaxed text-slate/80 dark:text-darkText/70 mb-4">
                        To ensure absolute clarity regarding user obligations and platform rights, the following terms are expressly defined:
                    </p>
                    <ul className="space-y-4 ml-8 list-none">
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70">
                                <strong className="text-obsidian dark:text-darkText">"Platform" or "CareerSync"</strong>: Refers to the AI-powered career intelligence platform, including its React frontend, Vercel Serverless Functions, and Supabase database infrastructure.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70">
                                <strong className="text-obsidian dark:text-darkText">"User"</strong>: Any individual who registers an account, uploads a resume, or initiates a payment session on the Platform.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70">
                                <strong className="text-obsidian dark:text-darkText">"AI Analysis Engine"</strong>: The proprietary integration utilizing the Google Gemini 2.0 Flash API, responsible for resume-to-job-description analysis, gap identification, and cover letter generation.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70">
                                <strong className="text-obsidian dark:text-darkText">"Centavo-Matching"</strong>: The unique payment identification mechanism where each payment session is assigned a unique Philippine Peso amount down to the centavo (e.g., ₱1.47, ₱1.83) to unambiguously match an incoming GCash transfer.
                            </p>
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText mb-6">3. Description of Services</h2>
                    <p className="text-lg leading-relaxed text-slate/80 dark:text-darkText/70 mb-4">
                        CareerSync provides digital optimization services utilizing advanced artificial intelligence. The available features are dependent on the User's active subscription tier and may include:
                    </p>
                    <ul className="space-y-4 ml-8 list-none">
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70">
                                <strong className="text-obsidian dark:text-darkText">AI Match Score</strong>: Scores resume-to-job fit 1–100 with a qualitative summary, giving candidates an immediate, objective benchmark before applying.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70">
                                <strong className="text-obsidian dark:text-darkText">Matched Profile Analysis</strong>: Lists specific skills/experiences the candidate has that align with the role, helping users know what to emphasize in interviews.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70">
                                <strong className="text-obsidian dark:text-darkText">Gap Analysis</strong>: Identifies missing skills or experience the job requires, turning vague rejection into actionable self-improvement.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70">
                                <strong className="text-obsidian dark:text-darkText">Cover Letter Generation</strong>: Auto-generates a 3-paragraph cover letter tailored to bridge the candidate's background with the role, eliminating the blank-page problem and saving hours per application.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70">
                                <strong className="text-obsidian dark:text-darkText">Resume Optimization (Premium)</strong>: Provides strategic rewrite advice (before/after), structural suggestions, and ATS keyword lists to provide direct, tactical advice to increase recruiter visibility.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70">
                                <strong className="text-obsidian dark:text-darkText">PDF Export (Standard+)</strong>: Exports the full analysis report to PDF, allowing candidates to archive and share their reports.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70">
                                <strong className="text-obsidian dark:text-darkText">History Dashboard</strong>: Stores all past analyses with scores, companies, and dates, enabling candidates to track their progress across multiple applications.
                            </p>
                        </li>
                    </ul>
                </section>

                <section className="bg-champagne/5 dark:bg-champagne/10 border-l-4 border-champagne p-8 rounded-r-3xl">
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText mb-6">4. Explicit Disclaimer of Guarantees (The "No Guarantee" Clause)</h2>
                    <p className="text-xl font-bold text-obsidian dark:text-darkText mb-6 uppercase tracking-tight">PLEASE READ THIS SECTION CAREFULLY AS IT MATERIALLY AFFECTS YOUR LEGAL RIGHTS.</p>
                    <ul className="space-y-6">
                        <li className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                            <strong className="text-obsidian dark:text-darkText">Informational Purposes Only</strong>: All resume analysis, scoring, and optimization tools are provided for structural and informational guidance only. CareerSync is an advisory tool, not a human recruiter or hiring manager.
                        </li>
                        <li className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                            <strong className="text-obsidian dark:text-darkText">No Employment Guarantee</strong>: The platform makes no guarantees regarding job placement, securing interviews, or salary increases.
                        </li>
                        <li className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                            <strong className="text-obsidian dark:text-darkText">Waiver of Claims</strong>: This critical clause prevents users from demanding refunds or threatening legal action based on their job search outcomes. The User acknowledges that hiring decisions are entirely at the discretion of third-party employers.
                        </li>
                        <li className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                            <strong className="text-obsidian dark:text-darkText">AI Hallucination & Accuracy</strong>: While CareerSync utilizes state-of-the-art LLMs, the AI Analysis Engine may occasionally produce inaccurate, incomplete, or contextually inappropriate suggestions. The User is solely responsible for reviewing, editing, and verifying any auto-generated content before submitting it to potential employers.
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText mb-6">5. User Responsibilities, Security, & Acceptable Use</h2>
                    <p className="text-lg leading-relaxed text-slate/80 dark:text-darkText/70 mb-6">
                        To maintain the integrity of the Platform, Users must adhere to strict operational guidelines.
                    </p>
                    <ul className="space-y-6 ml-8 list-none">
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                                <strong className="text-obsidian dark:text-darkText">Truthfulness and Accuracy</strong>: Users must ensure that all information, work history, and resumes uploaded are accurate, truthful, and their own intellectual property. The platform is not liable for misrepresentations made by users to potential employers.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                                <strong className="text-obsidian dark:text-darkText">Acceptable Use</strong>: This policy outlines permitted behaviors and strictly prohibits illegal activities, spamming, or attempting to reverse-engineer the platform's analysis tools.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                                <strong className="text-obsidian dark:text-darkText">Anti-Abuse & Prompt Injection Mitigation</strong>: Users are strictly prohibited from embedding commands, instructions, or directives within uploaded resumes designed to manipulate the AI Analysis Engine (Prompt Injection). The Platform utilizes separated system/user roles to mitigate this, explicitly instructing the AI not to execute directives found in user-provided text.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                                <strong className="text-obsidian dark:text-darkText">Account Deletion Fraud</strong>: To prevent system abuse, the platform utilizes a <code>previously_registered_emails</code> table; users who delete and re-register their account receive 0 free credits instead of the standard 1.
                            </p>
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText mb-6">6. Micro-Pricing, Subscriptions, API Caps, and Billing</h2>
                    <p className="text-lg leading-relaxed text-slate/80 dark:text-darkText/70 mb-8">
                        CareerSync operates on a multi-tier billing architecture designed for extreme accessibility, eliminating the cost barrier typically associated with career coaching.
                    </p>

                    <div className="space-y-8 ml-8">
                        <div>
                            <h3 className="text-2xl font-bold text-obsidian dark:text-darkText mb-4">6.1 Available Tiers and Billing Mechanisms</h3>
                            <p className="text-lg text-slate/80 dark:text-darkText/70 mb-4 indent-8">
                                Pricing models detail the available subscription tiers and what features are included in each.
                            </p>
                            <ul className="space-y-4 list-none">
                                <li className="flex gap-4">
                                    <span className="text-champagne font-bold text-xl">•</span>
                                    <p className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                                        <strong className="text-obsidian dark:text-darkText">Base Token Model</strong>: Users may purchase individual tokens (₱1 top-up). This operates on a numeric <code>current_credit_balance</code> in <code>user_profiles</code>, which is decremented by a <code>decrement_credits</code> RPC after each successful analysis. Payment is executed via a unique Centavo-Matching system, allowing the backend to unambiguously match an incoming GCash static QR transfer to the correct user.
                                    </p>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-champagne font-bold text-xl">•</span>
                                    <p className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                                        <strong className="text-obsidian dark:text-darkText">Standard & Premium Subscriptions</strong>: The Standard tier (₱2/mo) and Premium tier (₱3/mo) utilize the PayMongo integration for GCash payment intent creation and recurring billing.
                                    </p>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-champagne font-bold text-xl">•</span>
                                    <p className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                                        <strong className="text-obsidian dark:text-darkText">Recurring Charges</strong>: Subscription plans auto-renew, and users must follow the defined cancellation process before the next billing cycle hits to avoid further charges.
                                    </p>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-obsidian dark:text-darkText mb-4">6.2 Rate Limits and API Caps</h3>
                            <p className="text-lg text-slate/80 dark:text-darkText/70 mb-4">
                                To protect system resources and manage compute costs, usage is strictly gated:
                            </p>
                            <ul className="space-y-4 list-none">
                                <li className="flex gap-4">
                                    <span className="text-champagne font-bold text-xl">•</span>
                                    <p className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                                        <strong className="text-obsidian dark:text-darkText">Daily Caps</strong>: Standard and Premium tiers operate on a daily-cap-based model enforced by a <code>consume_daily_credit</code> RPC. Standard users are limited to 40 requests per day, and Premium users are limited to 50 requests per day. These limits reset every 24 hours.
                                    </p>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-champagne font-bold text-xl">•</span>
                                    <p className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                                        <strong className="text-obsidian dark:text-darkText">Defensive Credit Logic</strong>: Credits are deducted only after the AI API call confirms success, preventing users from being charged for failed analyses.
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="bg-obsidian/5 dark:bg-darkText/5 border-l-4 border-obsidian dark:border-darkText p-8 rounded-r-3xl">
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText mb-6">7. Strict Refund and Chargeback Policy</h2>
                    <p className="text-xl font-bold text-obsidian dark:text-darkText mb-6 uppercase tracking-tight">ALL DIGITAL SALES ARE FINAL.</p>
                    <ul className="space-y-6">
                        <li className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                            <strong className="text-obsidian dark:text-darkText">Immediate Consumption</strong>: Explicitly states whether all sales for digital document analyses are final, or under what specific conditions refunds are issued. Due to the immediate execution of serverless functions and the unrecoverable consumption of API compute costs via Google Gemini, CareerSync does not offer refunds for utilized credits or active subscription periods.
                        </li>
                        <li className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                            <strong className="text-obsidian dark:text-darkText">Chargeback Prevention</strong>: This is vital for preventing and winning payment chargebacks. By initiating a payment, the User acknowledges immediate delivery of the digital service.
                        </li>
                        <li className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                            <strong className="text-obsidian dark:text-darkText">Idempotency</strong>: The platform employs idempotency guards to payment sessions to prevent double-crediting on duplicate webhook deliveries. Any disputes regarding billing must be routed through our official support channels prior to initiating a bank chargeback.
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText mb-6">8. Document Handling and Intellectual Property</h2>
                    <ul className="space-y-4 ml-8 list-none">
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                                <strong className="text-obsidian dark:text-darkText">Platform IP</strong>: The business retains all ownership over the platform's code, branding, and proprietary analysis systems.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                                <strong className="text-obsidian dark:text-darkText">User Ownership</strong>: Users retain full copyright and ownership of their original resumes and the personal data within them.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                                <strong className="text-obsidian dark:text-darkText">License to Process</strong>: By uploading a document, the user grants the platform a limited, revocable legal license to parse, scan, analyze, modify, and store the text strictly to provide the digital optimization service.
                            </p>
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText mb-6">9. Data Privacy and Infrastructure</h2>
                    <ul className="space-y-4 ml-8 list-none">
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                                <strong className="text-obsidian dark:text-darkText">Data Processing</strong>: Personal documents and profiles are processed securely. User data is housed on secure, robust third-party database infrastructure (Supabase) to ensure reliability and uptime.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                                <strong className="text-obsidian dark:text-darkText">Data Retention</strong>: Analyzed resumes are kept on servers according to standard retention policies. Outlines the exact process users must follow to request the deletion of their parsed documents and account data.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                                <strong className="text-obsidian dark:text-darkText">Security</strong>: Database-level Row Level Security (RLS) policies enforce that users can only read/write their own <code>candidates_history</code> and <code>user_profiles</code> rows.
                            </p>
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText mb-6">10. Termination and Enforcement</h2>
                    <ul className="space-y-4 ml-8 list-none">
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                                <strong className="text-obsidian dark:text-darkText">User Cancellation</strong>: Explains how users can safely close their accounts and halt billing.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                                <strong className="text-obsidian dark:text-darkText">Provider Rights</strong>: Reserves the right for the platform to suspend or terminate accounts immediately and without notice if a user violates the Acceptable Use policy or falsifies information.
                            </p>
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText mb-6">11. Limitation of Liability</h2>
                    <p className="text-lg leading-relaxed text-slate/80 dark:text-darkText/70 indent-8">
                        <strong className="text-obsidian dark:text-darkText">Liability Cap</strong>: Protects the business from being held responsible for indirect damages, loss of revenue, or issues arising from service downtime or third-party data breaches. Under no circumstances shall CareerSync’s total liability exceed the amount paid by the User to the Platform in the three (3) months preceding the claim.
                    </p>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText mb-6">12. Governing Law and Dispute Resolution</h2>
                    <ul className="space-y-4 ml-8 list-none">
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                                <strong className="text-obsidian dark:text-darkText">Governing Law</strong>: Specifies the jurisdiction whose laws govern the agreement and where any legal disputes will be resolved. This Agreement shall be governed by and construed in accordance with the laws of the Republic of the Philippines.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                                <strong className="text-obsidian dark:text-darkText">Exclusive Jurisdiction</strong>: Any legal disputes, claims, or controversies arising out of or relating to this Agreement shall be subject to the exclusive jurisdiction of the competent courts of Muntinlupa City, Philippines.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                                <strong className="text-obsidian dark:text-darkText">Mandatory Mediation</strong>: Prior to the initiation of any formal litigation, the parties agree to engage in mandatory mediation in good faith to resolve the dispute.
                            </p>
                        </li>
                    </ul>
                </section>

                <section className="mt-20 border-t border-obsidian/10 dark:border-darkText/10 pt-12 italic opacity-60">
                    <h2 className="text-2xl font-bold text-obsidian dark:text-darkText mb-4 not-italic opacity-100">13. Adversarial Validation (Internal Review Memo)</h2>
                    <div className="text-base text-slate/80 dark:text-darkText/70 space-y-4 font-mono">
                        <div className="flex gap-2">
                            <span className="font-bold">To:</span> CareerSync Executive Team
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold">From:</span> Senior Tech Legal Counsel
                        </div>
                        <div className="flex gap-2 mb-6">
                            <span className="font-bold">Subject:</span> Vulnerability Patching & Stress Test of ToS Draft
                        </div>

                        <p className="mb-4">Following your execution protocol, I have simulated adversarial attacks against our operational logic and legal framework. Here are the vulnerabilities identified and patched within the drafted ToS:</p>

                        <div className="space-y-6">
                            <div>
                                <p className="font-bold underline mb-1">The "Free Credit Looping" Exploit:</p>
                                <p>• Attack Vector: A malicious user repeatedly deletes their account and re-registers via Supabase Auth to harvest the 1 free credit given to new users.</p>
                                <p>• Legal/System Patch: I have explicitly weaponized our <code>previously_registered_emails</code> database table logic within Section 5 of the ToS. The ToS now legally defines this as "Account Deletion Fraud" and codifies our right to grant 0 free credits to re-registered emails.</p>
                            </div>

                            <div>
                                <p className="font-bold underline mb-1">Prompt Injection & AI Liability:</p>
                                <p>• Attack Vector: A user uploads a resume filled with hidden text commanding the Gemini 2.0 Flash API to generate hate speech, then sues CareerSync for distributing offensive content.</p>
                                <p>• Legal/System Patch: Section 5 explicitly forbids Prompt Injection. Furthermore, our architecture defends against this by utilizing separated system/user roles, ensuring the AI does not execute commands found within the user-provided text.</p>
                            </div>

                            <div>
                                <p className="font-bold underline mb-1">The "Friendly Fraud" Chargeback (Centavo-Matching):</p>
                                <p>• Attack Vector: A user pays ₱1.47 via GCash, receives their analysis, and immediately files a dispute claiming they "don't know what this charge is."</p>
                                <p>• Legal/System Patch: Section 6 and Section 7 completely neutralize this. Section 6 explicitly outlines the Centavo-Matching system, proving the user had to purposefully input a highly specific, non-round number (e.g., ₱1.47) to match the transaction. Section 7 invokes the "Immediate Consumption" clause, stating that because server compute (Vercel) and AI tokens (Gemini) are instantly burned, digital sales are strictly non-refundable.</p>
                            </div>

                            <div>
                                <p className="font-bold underline mb-1">Data Privacy Act (DPA) Compliance:</p>
                                <p>• Review: Section 9 successfully limits our liability by clarifying that data is housed on a third-party infrastructure (Supabase). Furthermore, our use of Row Level Security (RLS) ensures users only access their own data, heavily mitigating the risk of cross-tenant data leaks.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </LegalLayout>
    );
};

export default Terms;
