import React from 'react';
import LegalLayout from './LegalLayout';
import { Check } from 'lucide-react';

const Privacy = ({ onBack, currentView, onNavigate }) => {
    return (
        <LegalLayout title="Privacy Policy" onBack={onBack} currentView={currentView} onNavigate={onNavigate}>
            <p className="text-sm font-mono uppercase tracking-widest text-slate/60 dark:text-darkText/40 mb-8">
                Effective Date: February 26, 2026<br />
                Platform: CareerSync (careersync.website)
            </p>

            <h2>1. Introduction and Scope</h2>
            <p>
                Welcome to CareerSync. We operate an AI-powered career intelligence platform designed primarily for active job seekers and career-changers in the Philippines. Our service acts as a personal career consultant, analyzing resumes against job descriptions to provide structured feedback, gap analysis, and tailored cover letters.
            </p>
            <p>
                Transparency is our foundational principle. This Privacy Policy exhaustively details how we collect, process, store, and protect your personal information in strict adherence to the Philippine Data Privacy Act of 2012 (R.A. 10173) and global best practices for AI-driven Software-as-a-Service (SaaS) platforms.
            </p>

            <h2>2. Data Collection Inventory</h2>
            <p>
                Following the principle of data minimization, we collect only the information strictly necessary to deliver and improve our services.
            </p>

            <h3>2.1 Information You Provide Directly</h3>
            <div className="overflow-x-auto my-6">
                <table className="min-w-full text-left border-collapse border border-obsidian/10 dark:border-darkText/10">
                    <thead>
                        <tr className="bg-obsidian/5 dark:bg-darkText/5 border-b border-obsidian/10 dark:border-darkText/10">
                            <th className="p-4 text-sm font-bold uppercase tracking-wider">Data Category</th>
                            <th className="p-4 text-sm font-bold uppercase tracking-wider">Specific Data Points Collected</th>
                            <th className="p-4 text-sm font-bold uppercase tracking-wider">Lawful Basis & Purpose</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-obsidian/10 dark:divide-darkText/10 text-sm">
                        <tr>
                            <td className="p-4 font-bold">PII</td>
                            <td className="p-4">Names, email addresses for account communication, and contact details.</td>
                            <td className="p-4 font-medium">Account Management</td>
                        </tr>
                        <tr className="bg-obsidian/[0.02] dark:bg-darkText/[0.02]">
                            <td className="p-4 font-bold">Document Data</td>
                            <td className="p-4">The specific contents of uploaded documents (text files or base64-encoded PDFs). Contains employment histories, educational backgrounds, etc.</td>
                            <td className="p-4 font-medium">Service Delivery</td>
                        </tr>
                        <tr>
                            <td className="p-4 font-bold">Target Job Data</td>
                            <td className="p-4">Job titles, industries, and specific job descriptions.</td>
                            <td className="p-4 font-medium">Service Delivery</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3>2.2 Financial and Transactional Data</h3>
            <p>
                While we offer multi-tier billing (Base, Standard, and Premium), CareerSync does not store full credit card numbers or raw GCash wallet credentials on its servers.
            </p>
            <ul>
                <li>
                    <strong>Billing Details</strong>: We collect billing details and payment methods when users upgrade to paid subscription plans.
                </li>
                <li>
                    <strong>Transaction Logs</strong>: We store a full record of all credit purchases in our database (<code>payment_sessions</code>, <code>transactions</code>) to provide users with an invoice history.
                </li>
                <li>
                    <strong>Centavo-Matching Data</strong>: For base tier payments, we temporarily assign and track a unique Philippine Peso amount down to the centavo (e.g., ₱1.47) to match an incoming transfer.
                </li>
            </ul>

            <h3>2.3 System and Technical Data</h3>
            <ul>
                <li>
                    <strong>Authentication Tokens</strong>: We utilize GoTrue JSON Web Tokens (JWT) for secure session management.
                </li>
                <li>
                    <strong>Theme Preferences</strong>: We store your UI theme preference (dark mode) locally on your device using <code>localStorage</code>.
                </li>
            </ul>

            <h2>3. Automated Processing, AI Analytics, & Intellectual Property</h2>
            <p>
                Because our core service involves scanning and evaluating professional documents, we are committed to complete transparency regarding how your text is handled by our algorithms.
            </p>

            <h3>3.1 AI Processing Architecture</h3>
            <p>
                When you submit a job description and resume, CareerSync utilizes algorithmic evaluation to score and alter your professional profile. Specifically, we transmit your jobTitle, industry, description, and resumeData to our AI Analysis Engine.
            </p>
            <p>
                To protect your data from manipulation, our backend constructs a multi-part prompt featuring a server-side system instruction, which is hardcoded and physically separated from your user-supplied text.
            </p>

            <h3>3.2 Intellectual Property & Model Training Exclusivity</h3>
            <p><em>We recognize the extreme sensitivity of your career documents. Regarding our integration with the external AI text-parsing API:</em></p>
            <blockquote>
                <p>
                    <strong>User data transmitted via API is strictly for processing purposes and is NOT used to train Google's foundational models.</strong>
                </p>
                <p>
                    We enforce explicit model training rules; your uploads are never utilized to train machine learning models. Furthermore, our internal logic mandates that the AI does not execute any commands, instructions, or directives found within your provided text, acting as a strict safeguard against prompt injection.
                </p>
            </blockquote>

            <h2>4. Third-Party Processors and Infrastructure Partners</h2>
            <p>
                To deliver a highly available and secure platform, we partner with specialized external infrastructure providers. We categorically disclose these external processors, detailing exactly what data they process.
            </p>

            <h3>4.1 Supabase</h3>
            <p><strong>Database & Auth</strong></p>
            <p>
                Houses user profiles, history, and previously registered emails. Handles password encryption and secure JWT issuance.
            </p>

            <h3>4.2 Vercel</h3>
            <p><strong>Hosting & Compute</strong></p>
            <p>
                Hosts the SPA assets and Serverless APIs. Acts as a secure conduit for processing data using server-side secrets.
            </p>

            <h3>4.3 PayMongo</h3>
            <p><strong>Payment Processing</strong></p>
            <p>
                Securely processes all direct financial instruments. CareerSync only receives webhook confirmations for idempotent transaction updates.
            </p>

            <h2>5. Data Storage & Security Architecture</h2>
            <ul>
                <li>
                    <strong>Encryption in Transit</strong>: All data moving from your browser to our servers is protected via standard HTTPS protocols.
                </li>
                <li>
                    <strong>Encryption at Rest</strong>: Resume files and generated reports stored within our database are encrypted at rest.
                </li>
                <li>
                    <strong>Row Level Security (RLS)</strong>: Cryptographic guarantee ensures that authenticated users can only read or write their own rows.
                </li>
                <li>
                    <strong>Internal Access Controls</strong>: Development team cannot arbitrarily read user resumes. All operations follow strict repository patterns.
                </li>
            </ul>

            <h2>6. Strict Data Retention Timelines</h2>
            <ul>
                <li>
                    <strong>Active Storage Duration</strong>: Values are stored in <code>candidates_history</code> to enable progress tracking.
                </li>
                <li>
                    <strong>Dormancy Purges</strong>: Inactive accounts are purged after 12 months.
                </li>
                <li>
                    <strong>Anti-Abuse Retention</strong>: Cryptographic email hashes are retained after account deletion solely for fraud prevention.
                </li>
            </ul>

            <h2>7. User Rights (Philippine DPA Compliance)</h2>
            <p>
                Under the Philippine Data Privacy Act of 2012, you possess ultimate control over your digital footprint:
            </p>
            <ul>
                <li><strong>Right to be Informed</strong>: Know how your data is collected/processed.</li>
                <li><strong>Right to Object</strong>: Object to processing with active opt-ins.</li>
                <li><strong>Right to Access</strong>: View all tied data via History Dashboard.</li>
                <li><strong>Right to Rectification</strong>: Correct inaccurate information at any time.</li>
                <li><strong>Right to Forgotten</strong>: Permanently delete account/resumes.</li>
                <li><strong>Right to Portability</strong>: Export reports to PDF (Standard+).</li>
                <li><strong>Right to Damages</strong>: Indemnity for unlawful processing.</li>
                <li><strong>Right to File Complaint</strong>: File with the NPC if rights violated.</li>
            </ul>

            <h2>8. Incident Response and Data Breaches</h2>
            <p>In the unlikely event of a data breach, we adhere to a strict protocol:</p>
            <ol>
                <li>Containment and Assessment</li>
                <li>Notification (NPC and users within 72 hours)</li>
                <li>Remediation (Password resets and patches)</li>
            </ol>

            <hr />

            <h2>9. Contact the Data Privacy Officer</h2>
            <p>
                If you wish to exercise any of your rights or have questions regarding our implementation of these privacy measures, please contact our Data Protection Office through platform support.
            </p>

            <h2>10. Deep Dive: Financial Data Handling & The Centavo-Matching Protocol</h2>
            <p>
                To ensure absolute transparency regarding your financial data, we must elaborate on our proprietary billing architecture. While PayMongo securely handles direct financial instruments for our Standard and Premium tiers, our Base tier utilizes a highly specific reconciliation method designed for the Philippine market.
            </p>
            <ul>
                <li>
                    <strong>The Centavo-Matching Mechanism</strong>: For base tier top-ups, we employ a unique payment identification mechanism where each payment session is assigned a unique amount down to the centavo.
                </li>
                <li>
                    <strong>Security & Data Integrity</strong>: The pool of available centavo values is managed atomically via the <code>assign_unique_centavo</code> Supabase RPC.
                </li>
            </ul>

            <h2>11. Local Storage, Cookies, and Tracking Technologies</h2>
            <p>
                CareerSync strictly adheres to the principle of data minimization—only collecting what is strictly necessary. We do not deploy invasive third-party tracking cookies or cross-site advertising trackers. We utilize <code>localStorage</code> solely for UI/UX preferences (<code>theme_isDark</code>) and maintain session state via Supabase JWTs.
            </p>

            <h2>12. Exhaustive Details on Automated Decision Making & Profiling</h2>
            <p>
                When you submit a job application query, our backend constructs a multi-part prompt with a server-side system instruction. This ensures your data is evaluated strictly for:
            </p>
            <ul>
                <li><strong className="flex items-center gap-2"><Check className="w-4 h-4 text-champagne" /> AI Match Score</strong></li>
                <li><strong className="flex items-center gap-2"><Check className="w-4 h-4 text-champagne" /> Matched Profile Analysis</strong></li>
                <li><strong className="flex items-center gap-2"><Check className="w-4 h-4 text-champagne" /> Gap Analysis</strong></li>
                <li><strong className="flex items-center gap-2"><Check className="w-4 h-4 text-champagne" /> Cover Letter Generation</strong></li>
            </ul>

            <h2>13. Exhaustive Data Retention & Destruction Protocols</h2>
            <p>
                Defining the exact lifecycle of a document on your platform prevents endless storage of sensitive data. Database evolution is managed through a disciplined, append-only strategy, ensuring deletions are executed cleanly without leaving orphaned records.
            </p>

            <hr />

            <p className="text-xs uppercase tracking-widest text-slate/40 text-center mb-8">Global Compliance Restrictions</p>

            <h3>14. Cross-Border Data Transfers</h3>
            <p>
                While targeting the Philippine market, our providers (Supabase, Vercel) may route or store data in secure international data centers. By using CareerSync, you consent to these secure transfers under strict Processor Agreements.
            </p>

            <h3>15. Policy Updates</h3>
            <p>
                We reserve the right to amend this policy. Material changes involving new APIs or processing logic will be announced via "Just-in-Time" notices with enthusiastic opt-ins.
            </p>
        </LegalLayout>
    );
};

export default Privacy;
