import React from 'react';
import LegalLayout from './LegalLayout';

const Privacy = ({ onBack }) => {
    return (
        <LegalLayout title="Privacy Policy" onBack={onBack}>
            <div className="space-y-12">
                <section>
                    <p className="text-xl font-semibold text-obsidian dark:text-darkText mb-2">
                        CareerSync Comprehensive Privacy Policy
                    </p>
                    <p className="text-sm font-mono uppercase tracking-widest text-slate/60 dark:text-darkText/40 mb-8">
                        Effective Date: February 26, 2026<br />
                        Platform: CareerSync (careersync.website)
                    </p>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText mb-6">1. Introduction and Scope</h2>
                    <p className="text-lg leading-relaxed text-slate/80 dark:text-darkText/70 indent-8 mb-4">
                        Welcome to CareerSync. We operate an AI-powered career intelligence platform designed primarily for active job seekers and career-changers in the Philippines. Our service acts as a personal career consultant, analyzing resumes against job descriptions to provide structured feedback, gap analysis, and tailored cover letters.
                    </p>
                    <p className="text-lg leading-relaxed text-slate/80 dark:text-darkText/70 indent-8">
                        Transparency is our foundational principle. This Privacy Policy exhaustively details how we collect, process, store, and protect your personal information in strict adherence to the Philippine Data Privacy Act of 2012 (R.A. 10173) and global best practices for AI-driven Software-as-a-Service (SaaS) platforms.
                    </p>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText mb-6">2. Data Collection Inventory</h2>
                    <p className="text-lg leading-relaxed text-slate/80 dark:text-darkText/70 mb-8">
                        Following the principle of data minimization, we collect only the information strictly necessary to deliver and improve our services.
                    </p>

                    <div className="space-y-10">
                        <div>
                            <h3 className="text-2xl font-bold text-obsidian dark:text-darkText mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-champagne/10 flex items-center justify-center text-champagne text-sm font-mono">2.1</span>
                                Information You Provide Directly
                            </h3>
                            <div className="overflow-hidden rounded-3xl border border-obsidian/5 dark:border-darkText/5 shadow-sm mb-6">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-obsidian/5 dark:bg-darkText/5">
                                            <th className="px-6 py-4 text-sm font-bold text-obsidian dark:text-darkText uppercase tracking-wider border-b border-obsidian/5 dark:border-darkText/5">Data Category</th>
                                            <th className="px-6 py-4 text-sm font-bold text-obsidian dark:text-darkText uppercase tracking-wider border-b border-obsidian/5 dark:border-darkText/5">Specific Data Points Collected</th>
                                            <th className="px-6 py-4 text-sm font-bold text-obsidian dark:text-darkText uppercase tracking-wider border-b border-obsidian/5 dark:border-darkText/5">Lawful Basis & Purpose</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-obsidian/5 dark:divide-darkText/5">
                                        <tr>
                                            <td className="px-6 py-4 text-base font-bold text-obsidian dark:text-darkText">PII</td>
                                            <td className="px-6 py-4 text-base text-slate/80 dark:text-darkText/70">Names, email addresses for account communication, and contact details.</td>
                                            <td className="px-6 py-4 text-base text-slate/80 dark:text-darkText/70 font-medium">Account Management</td>
                                        </tr>
                                        <tr className="bg-obsidian/[0.02] dark:bg-darkText/[0.02]">
                                            <td className="px-6 py-4 text-base font-bold text-obsidian dark:text-darkText">Document Data</td>
                                            <td className="px-6 py-4 text-base text-slate/80 dark:text-darkText/70">The specific contents of uploaded documents (text files or base64-encoded PDFs). Contains employment histories, educational backgrounds, etc.</td>
                                            <td className="px-6 py-4 text-base text-slate/80 dark:text-darkText/70 font-medium">Service Delivery</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 text-base font-bold text-obsidian dark:text-darkText">Target Job Data</td>
                                            <td className="px-6 py-4 text-base text-slate/80 dark:text-darkText/70">Job titles, industries, and specific job descriptions.</td>
                                            <td className="px-6 py-4 text-base text-slate/80 dark:text-darkText/70 font-medium">Service Delivery</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="ml-8 space-y-6">
                            <h3 className="text-2xl font-bold text-obsidian dark:text-darkText mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-champagne/10 flex items-center justify-center text-champagne text-sm font-mono">2.2</span>
                                Financial and Transactional Data
                            </h3>
                            <p className="text-lg text-slate/80 dark:text-darkText/70 mb-4 indent-8">
                                While we offer multi-tier billing (Base, Standard, and Premium), CareerSync does not store full credit card numbers or raw GCash wallet credentials on its servers.
                            </p>
                            <ul className="space-y-4 list-none">
                                <li className="flex gap-4">
                                    <span className="text-champagne font-bold text-xl">•</span>
                                    <p className="text-lg text-slate/80 dark:text-darkText/70">
                                        <strong className="text-obsidian dark:text-darkText">Billing Details</strong>: We collect billing details and payment methods when users upgrade to paid subscription plans.
                                    </p>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-champagne font-bold text-xl">•</span>
                                    <p className="text-lg text-slate/80 dark:text-darkText/70">
                                        <strong className="text-obsidian dark:text-darkText">Transaction Logs</strong>: We store a full record of all credit purchases in our database (<code>payment_sessions</code>, <code>transactions</code>) to provide users with an invoice history.
                                    </p>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-champagne font-bold text-xl">•</span>
                                    <p className="text-lg text-slate/80 dark:text-darkText/70">
                                        <strong className="text-obsidian dark:text-darkText">Centavo-Matching Data</strong>: For base tier payments, we temporarily assign and track a unique Philippine Peso amount down to the centavo (e.g., ₱1.47) to match an incoming transfer.
                                    </p>
                                </li>
                            </ul>
                        </div>

                        <div className="ml-8 space-y-6">
                            <h3 className="text-2xl font-bold text-obsidian dark:text-darkText mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-champagne/10 flex items-center justify-center text-champagne text-sm font-mono">2.3</span>
                                System and Technical Data
                            </h3>
                            <ul className="space-y-4 list-none">
                                <li className="flex gap-4">
                                    <span className="text-champagne font-bold text-xl">•</span>
                                    <p className="text-lg text-slate/80 dark:text-darkText/70">
                                        <strong className="text-obsidian dark:text-darkText">Authentication Tokens</strong>: We utilize GoTrue JSON Web Tokens (JWT) for secure session management.
                                    </p>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-champagne font-bold text-xl">•</span>
                                    <p className="text-lg text-slate/80 dark:text-darkText/70">
                                        <strong className="text-obsidian dark:text-darkText">Theme Preferences</strong>: We store your UI theme preference (dark mode) locally on your device using <code>localStorage</code>.
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText mb-6">3. Automated Processing, AI Analytics, & Intellectual Property</h2>
                    <p className="text-lg leading-relaxed text-slate/80 dark:text-darkText/70 mb-8">
                        Because our core service involves scanning and evaluating professional documents, we are committed to complete transparency regarding how your text is handled by our algorithms.
                    </p>

                    <div className="space-y-10 ml-8">
                        <div>
                            <h3 className="text-2xl font-bold text-obsidian dark:text-darkText mb-4">3.1 AI Processing Architecture</h3>
                            <p className="text-lg text-slate/80 dark:text-darkText/70 indent-8 mb-4">
                                When you submit a job description and resume, CareerSync utilizes algorithmic evaluation to score and alter your professional profile. Specifically, we transmit your jobTitle, industry, description, and resumeData to the Google Gemini 2.0 Flash API.
                            </p>
                            <p className="text-lg text-slate/80 dark:text-darkText/70 indent-8 leading-relaxed">
                                To protect your data from manipulation, our backend constructs a multi-part prompt featuring a server-side system instruction, which is hardcoded and physically separated from your user-supplied text.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-obsidian dark:text-darkText mb-4">3.2 Intellectual Property & Model Training Exclusivity</h3>
                            <p className="text-lg text-slate/80 dark:text-darkText/70 italic mb-6">
                                We recognize the extreme sensitivity of your career documents. Regarding our integration with Google's external AI text-parsing API:
                            </p>
                            <div className="bg-obsidian/5 dark:bg-darkText/5 p-8 rounded-3xl border border-obsidian/10 dark:border-darkText/10">
                                <p className="text-lg text-obsidian dark:text-darkText font-medium mb-4">
                                    User data transmitted via API is strictly for processing purposes and is <span className="underline decoration-champagne decoration-2">NOT used to train Google's foundational models</span>.
                                </p>
                                <p className="text-lg text-slate/80 dark:text-darkText/70">
                                    We enforce explicit model training rules; your uploads are never utilized to train machine learning models. Furthermore, our internal logic mandates that the AI does not execute any commands, instructions, or directives found within your provided text, acting as a strict safeguard against prompt injection.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText mb-6">4. Third-Party Processors and Infrastructure Partners</h2>
                    <p className="text-lg leading-relaxed text-slate/80 dark:text-darkText/70 mb-8">
                        To deliver a highly available and secure platform, we partner with specialized external infrastructure providers. We categorically disclose these external processors, detailing exactly what data they process.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 rounded-[2rem] bg-white dark:bg-darkCard border border-obsidian/5 dark:border-darkText/5 shadow-sm">
                            <h3 className="text-xl font-bold text-obsidian dark:text-darkText mb-3">4.1 Supabase</h3>
                            <p className="text-sm text-champagne font-mono mb-4 uppercase tracking-widest leading-none">Database & Auth</p>
                            <p className="text-base text-slate/80 dark:text-darkText/70 leading-relaxed">
                                Houses user profiles, history, and previously registered emails. Handles password encryption and secure JWT issuance.
                            </p>
                        </div>
                        <div className="p-8 rounded-[2rem] bg-white dark:bg-darkCard border border-obsidian/5 dark:border-darkText/5 shadow-sm">
                            <h3 className="text-xl font-bold text-obsidian dark:text-darkText mb-3">4.2 Vercel</h3>
                            <p className="text-sm text-champagne font-mono mb-4 uppercase tracking-widest leading-none">Hosting & Compute</p>
                            <p className="text-base text-slate/80 dark:text-darkText/70 leading-relaxed">
                                Hosts the SPA assets and Serverless APIs. Acts as a secure conduit for processing data using server-side secrets.
                            </p>
                        </div>
                        <div className="p-8 rounded-[2rem] bg-white dark:bg-darkCard border border-obsidian/5 dark:border-darkText/5 shadow-sm md:col-span-2">
                            <h3 className="text-xl font-bold text-obsidian dark:text-darkText mb-3">4.3 PayMongo</h3>
                            <p className="text-sm text-champagne font-mono mb-4 uppercase tracking-widest leading-none">Payment Processing</p>
                            <p className="text-base text-slate/80 dark:text-darkText/70 leading-relaxed">
                                Securely processes all direct financial instruments. CareerSync only receives webhook confirmations for idempotent transaction updates.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText mb-6">5. Data Storage & Security Architecture</h2>
                    <ul className="space-y-4 ml-8 list-none">
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70">
                                <strong className="text-obsidian dark:text-darkText">Encryption in Transit</strong>: All data moving from your browser to our servers is protected via standard HTTPS protocols.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70">
                                <strong className="text-obsidian dark:text-darkText">Encryption at Rest</strong>: Resume files and generated reports stored within our database are encrypted at rest.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70">
                                <strong className="text-obsidian dark:text-darkText">Row Level Security (RLS)</strong>: Cryptographic guarantee ensures that authenticated users can only read or write their own rows.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70">
                                <strong className="text-obsidian dark:text-darkText">Internal Access Controls</strong>: Development team cannot arbitrarily read user resumes. All operations follow strict repository patterns.
                            </p>
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText mb-6">6. Strict Data Retention Timelines</h2>
                    <ul className="space-y-4 ml-8 list-none">
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70">
                                <strong className="text-obsidian dark:text-darkText">Active Storage Duration</strong>: Values are stored in <code>candidates_history</code> to enable progress tracking.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70">
                                <strong className="text-obsidian dark:text-darkText">Dormancy Purges</strong>: Inactive accounts are purged after 12 months.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-champagne font-bold text-xl">•</span>
                            <p className="text-lg text-slate/80 dark:text-darkText/70">
                                <strong className="text-obsidian dark:text-darkText">Anti-Abuse Retention</strong>: Cryptographic email hashes are retained after account deletion solely for fraud prevention.
                            </p>
                        </li>
                    </ul>
                </section>

                <section className="bg-champagne/5 dark:bg-champagne/10 border-l-4 border-champagne p-8 rounded-r-3xl">
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText mb-6">7. User Rights (Philippine DPA Compliance)</h2>
                    <p className="text-lg leading-relaxed text-slate/80 dark:text-darkText/70 mb-6">
                        Under the Philippine Data Privacy Act of 2012, you possess ultimate control over your digital footprint:
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8 list-none">
                        {[
                            { title: "Right to be Informed", desc: "Know how your data is collected/processed." },
                            { title: "Right to Object", desc: "Object to processing with active opt-ins." },
                            { title: "Right to Access", desc: "View all tied data via History Dashboard." },
                            { title: "Right to Rectification", desc: "Correct inaccurate information at any time." },
                            { title: "Right to Forgotten", desc: "Permanently delete account/resumes." },
                            { title: "Right to Portability", desc: "Export reports to PDF (Standard+)." },
                            { title: "Right to Damages", desc: "Indemnity for unlawful processing." },
                            { title: "Right to File Complaint", desc: "File with the NPC if rights violated." }
                        ].map((right, idx) => (
                            <li key={idx} className="flex gap-3">
                                <span className="text-champagne font-bold text-lg">•</span>
                                <p className="text-lg text-slate/80 dark:text-darkText/70">
                                    <strong className="text-obsidian dark:text-darkText">{right.title}</strong>: {right.desc}
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText mb-6">8. Incident Response and Data Breaches</h2>
                    <p className="text-lg text-slate/80 dark:text-darkText/70 mb-6">In the unlikely event of a data breach, we adhere to a strict protocol:</p>
                    <ol className="space-y-4 ml-8 list-decimal">
                        <li className="text-lg font-bold text-obsidian dark:text-darkText pl-2">Containment and Assessment</li>
                        <li className="text-lg font-bold text-obsidian dark:text-darkText pl-2">Notification (NPC and users within 72 hours)</li>
                        <li className="text-lg font-bold text-obsidian dark:text-darkText pl-2">Remediation (Password resets and patches)</li>
                    </ol>
                </section>

                <section className="mt-12 text-center border-y border-obsidian/10 dark:border-darkText/10 py-12">
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText mb-4">9. Contact the Data Privacy Officer</h2>
                    <p className="text-lg text-slate/80 dark:text-darkText/70">
                        If you wish to exercise any of your rights or have questions regarding our implementation of these privacy measures, please contact our Data Protection Office through platform support.
                    </p>
                </section>

                {/* Deep Dive Sections added manually for premium experience */}
                <section className="space-y-12 pt-12">
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText">10. Deep Dive: Financial Data Handling & The Centavo-Matching Protocol</h2>
                    <div className="space-y-6 text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">
                        <p className="indent-8">To ensure absolute transparency regarding your financial data, we must elaborate on our proprietary billing architecture. While PayMongo securely handles direct financial instruments for our Standard and Premium tiers, our Base tier utilizes a highly specific reconciliation method designed for the Philippine market.</p>
                        <ul className="space-y-4 list-none">
                            <li className="flex gap-4">
                                <span className="text-champagne font-bold text-xl">•</span>
                                <p><strong className="text-obsidian dark:text-darkText">The Centavo-Matching Mechanism</strong>: For base tier top-ups, we employ a unique payment identification mechanism where each payment session is assigned a unique amount down to the centavo.</p>
                            </li>
                            <li className="flex gap-4">
                                <span className="text-champagne font-bold text-xl">•</span>
                                <p><strong className="text-obsidian dark:text-darkText">Security & Data Integrity</strong>: The pool of available centavo values is managed atomically via the <code>assign_unique_centavo</code> Supabase RPC.</p>
                            </li>
                        </ul>
                    </div>
                </section>

                <section className="space-y-6">
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText">11. Local Storage, Cookies, and Tracking Technologies</h2>
                    <p className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed indent-8">
                        CareerSync strictly adheres to the principle of data minimization—only collecting what is strictly necessary. We do not deploy invasive third-party tracking cookies or cross-site advertising trackers. We utilize <code>localStorage</code> solely for UI/UX preferences (<code>theme_isDark</code>) and maintain session state via Supabase JWTs.
                    </p>
                </section>

                <section className="space-y-6">
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText">12. Exhaustive Details on Automated Decision Making & Profiling</h2>
                    <div className="bg-obsidian/5 dark:bg-darkText/5 p-8 rounded-3xl space-y-4">
                        <p className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed">When you submit a job application query, our backend constructs a multi-part prompt with a server-side system instruction. This ensures your data is evaluated strictly for:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <p className="text-base text-obsidian dark:text-darkText font-bold flex items-center"><Check className="w-5 h-5 mr-2" /> AI Match Score</p>
                            <p className="text-base text-obsidian dark:text-darkText font-bold flex items-center"><Check className="w-5 h-5 mr-2" /> Matched Profile Analysis</p>
                            <p className="text-base text-obsidian dark:text-darkText font-bold flex items-center"><Check className="w-5 h-5 mr-2" /> Gap Analysis</p>
                            <p className="text-base text-obsidian dark:text-darkText font-bold flex items-center"><Check className="w-5 h-5 mr-2" /> Cover Letter Generation</p>
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <h2 className="text-3xl font-bold text-obsidian dark:text-darkText">13. Exhaustive Data Retention & Destruction Protocols</h2>
                    <p className="text-lg text-slate/80 dark:text-darkText/70 leading-relaxed indent-8">
                        Defining the exact lifecycle of a document on your platform prevents endless storage of sensitive data. Database evolution is managed through a disciplined, append-only strategy, ensuring deletions are executed cleanly without leaving orphaned records.
                    </p>
                </section>

                <section className="space-y-6 pt-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-px flex-1 bg-obsidian/10"></div>
                        <h2 className="text-sm font-mono uppercase tracking-[0.3em] text-slate/40 leading-none">Global Compliance</h2>
                        <div className="h-px flex-1 bg-obsidian/10"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">14. Cross-Border Data Transfers</h3>
                            <p className="text-base text-slate/80 dark:text-darkText/70 leading-relaxed">
                                While targeting the Philippine market, our providers (Supabase, Vercel) may route or store data in secure international data centers. By using CareerSync, you consent to these secure transfers under strict Processor Agreements.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">15. Policy Updates</h3>
                            <p className="text-base text-slate/80 dark:text-darkText/70 leading-relaxed">
                                We reserve the right to amend this policy. Material changes involving new APIs or processing logic will be announced via "Just-in-Time" notices with enthusiastic opt-ins.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </LegalLayout>
    );
};

export default Privacy;
