import React from 'react';
import LegalLayout from './LegalLayout';

const Terms = ({ onBack, currentView, onNavigate }) => {
    return (
        <LegalLayout title="Terms of Service" onBack={onBack} currentView={currentView} onNavigate={onNavigate}>
            <p className="text-sm font-mono uppercase tracking-widest text-slate/60 dark:text-darkText/40 mb-8">
                Effective Date: February 26, 2026<br />
                Governing Jurisdiction: Republic of the Philippines
            </p>

            <h2>1. Acceptance of Terms & Core Agreement</h2>
            <p>
                Welcome to CareerSync. By accessing the platform, creating an account, or uploading documents, the user agrees to be bound by these terms, creating a legally binding contract. This establishes the rules of the road, protecting the business from liability while setting clear expectations for the user. If you do not agree to these Terms, you are strictly prohibited from utilizing the CareerSync platform, its APIs, or any associated services.
            </p>

            <h2>2. Comprehensive Definitions</h2>
            <p>
                To ensure absolute clarity regarding user obligations and platform rights, the following terms are expressly defined:
            </p>
            <ul>
                <li>
                    <strong>"Platform" or "CareerSync"</strong>: Refers to the AI-powered career intelligence platform, including its React frontend, Vercel Serverless Functions, and Supabase database infrastructure.
                </li>
                <li>
                    <strong>"User"</strong>: Any individual who registers an account, uploads a resume, or initiates a payment session on the Platform.
                </li>
                <li>
                    <strong>"AI Analysis Engine"</strong>: The proprietary integration utilizing the Google Gemini 2.0 Flash API, responsible for resume-to-job-description analysis, gap identification, and cover letter generation.
                </li>
                <li>
                    <strong>"Centavo-Matching"</strong>: The unique payment identification mechanism where each payment session is assigned a unique Philippine Peso amount down to the centavo (e.g., ₱1.47, ₱1.83) to unambiguously match an incoming GCash transfer.
                </li>
            </ul>

            <h2>3. Description of Services</h2>
            <p>
                CareerSync provides digital optimization services utilizing advanced artificial intelligence. The available features are dependent on the User's active subscription tier and may include:
            </p>
            <ul>
                <li>
                    <strong>AI Match Score</strong>: Scores resume-to-job fit 1–100 with a qualitative summary, giving candidates an immediate, objective benchmark before applying.
                </li>
                <li>
                    <strong>Matched Profile Analysis</strong>: Lists specific skills/experiences the candidate has that align with the role, helping users know what to emphasize in interviews.
                </li>
                <li>
                    <strong>Gap Analysis</strong>: Identifies missing skills or experience the job requires, turning vague rejection into actionable self-improvement.
                </li>
                <li>
                    <strong>Cover Letter Generation</strong>: Auto-generates a 3-paragraph cover letter tailored to bridge the candidate's background with the role, eliminating the blank-page problem and saving hours per application.
                </li>
                <li>
                    <strong>Resume Optimization (Premium)</strong>: Provides strategic rewrite advice (before/after), structural suggestions, and ATS keyword lists to provide direct, tactical advice to increase recruiter visibility.
                </li>
                <li>
                    <strong>PDF Export (Standard+)</strong>: Exports the full analysis report to PDF, allowing candidates to archive and share their reports.
                </li>
                <li>
                    <strong>History Dashboard</strong>: Stores all past analyses with scores, companies, and dates, enabling candidates to track their progress across multiple applications.
                </li>
            </ul>

            <h2>4. Explicit Disclaimer of Guarantees (The "No Guarantee" Clause)</h2>
            <p><strong>PLEASE READ THIS SECTION CAREFULLY AS IT MATERIALLY AFFECTS YOUR LEGAL RIGHTS.</strong></p>
            <ul>
                <li>
                    <strong>Informational Purposes Only</strong>: All resume analysis, scoring, and optimization tools are provided for structural and informational guidance only. CareerSync is an advisory tool, not a human recruiter or hiring manager.
                </li>
                <li>
                    <strong>No Employment Guarantee</strong>: The platform makes no guarantees regarding job placement, securing interviews, or salary increases.
                </li>
                <li>
                    <strong>Waiver of Claims</strong>: This critical clause prevents users from demanding refunds or threatening legal action based on their job search outcomes. The User acknowledges that hiring decisions are entirely at the discretion of third-party employers.
                </li>
                <li>
                    <strong>AI Hallucination & Accuracy</strong>: While CareerSync utilizes state-of-the-art LLMs, the AI Analysis Engine may occasionally produce inaccurate, incomplete, or contextually inappropriate suggestions. The User is solely responsible for reviewing, editing, and verifying any auto-generated content before submitting it to potential employers.
                </li>
            </ul>

            <h2>5. User Responsibilities, Security, & Acceptable Use</h2>
            <p>
                To maintain the integrity of the Platform, Users must adhere to strict operational guidelines.
            </p>
            <ul>
                <li>
                    <strong>Truthfulness and Accuracy</strong>: Users must ensure that all information, work history, and resumes uploaded are accurate, truthful, and their own intellectual property. The platform is not liable for misrepresentations made by users to potential employers.
                </li>
                <li>
                    <strong>Acceptable Use</strong>: This policy outlines permitted behaviors and strictly prohibits illegal activities, spamming, or attempting to reverse-engineer the platform's analysis tools.
                </li>
                <li>
                    <strong>Anti-Abuse & Prompt Injection Mitigation</strong>: Users are strictly prohibited from embedding commands, instructions, or directives within uploaded resumes designed to manipulate the AI Analysis Engine (Prompt Injection). The Platform utilizes separated system/user roles to mitigate this, explicitly instructing the AI not to execute directives found in user-provided text.
                </li>
                <li>
                    <strong>Account Deletion Fraud</strong>: To prevent system abuse, the platform utilizes a <code>previously_registered_emails</code> table; users who delete and re-register their account receive 0 free credits instead of the standard 1.
                </li>
            </ul>

            <h2>6. Micro-Pricing, Subscriptions, API Caps, and Billing</h2>
            <p>
                CareerSync operates on a multi-tier billing architecture designed for extreme accessibility, eliminating the cost barrier typically associated with career coaching.
            </p>

            <h3>6.1 Available Tiers and Billing Mechanisms</h3>
            <p>
                Pricing models detail the available subscription tiers and what features are included in each.
            </p>
            <ul>
                <li>
                    <strong>Base Token Model</strong>: Users may purchase individual tokens (₱1 top-up). This operates on a numeric <code>current_credit_balance</code> in <code>user_profiles</code>, which is decremented by a <code>decrement_credits</code> RPC after each successful analysis. Payment is executed via a unique Centavo-Matching system, allowing the backend to unambiguously match an incoming GCash static QR transfer to the correct user.
                </li>
                <li>
                    <strong>Standard & Premium Subscriptions</strong>: The Standard tier (₱2/mo) and Premium tier (₱3/mo) utilize the PayMongo integration for GCash payment intent creation and recurring billing.
                </li>
                <li>
                    <strong>Recurring Charges</strong>: Subscription plans auto-renew, and users must follow the defined cancellation process before the next billing cycle hits to avoid further charges.
                </li>
            </ul>

            <h3>6.2 Rate Limits and API Caps</h3>
            <p>
                To protect system resources and manage compute costs, usage is strictly gated:
            </p>
            <ul>
                <li>
                    <strong>Daily Caps</strong>: Standard and Premium tiers operate on a daily-cap-based model enforced by a <code>consume_daily_credit</code> RPC. Standard users are limited to 40 requests per day, and Premium users are limited to 50 requests per day. These limits reset every 24 hours.
                </li>
                <li>
                    <strong>Defensive Credit Logic</strong>: Credits are deducted only after the AI API call confirms success, preventing users from being charged for failed analyses.
                </li>
            </ul>

            <h2>7. Strict Refund and Chargeback Policy</h2>
            <p><strong>ALL DIGITAL SALES ARE FINAL.</strong></p>
            <ul>
                <li>
                    <strong>Immediate Consumption</strong>: Explicitly states whether all sales for digital document analyses are final, or under what specific conditions refunds are issued. Due to the immediate execution of serverless functions and the unrecoverable consumption of API compute costs via Google Gemini, CareerSync does not offer refunds for utilized credits or active subscription periods.
                </li>
                <li>
                    <strong>Chargeback Prevention</strong>: This is vital for preventing and winning payment chargebacks. By initiating a payment, the User acknowledges immediate delivery of the digital service.
                </li>
                <li>
                    <strong>Idempotency</strong>: The platform employs idempotency guards to payment sessions to prevent double-crediting on duplicate webhook deliveries. Any disputes regarding billing must be routed through our official support channels prior to initiating a bank chargeback.
                </li>
            </ul>

            <h2>8. Document Handling and Intellectual Property</h2>
            <ul>
                <li>
                    <strong>Platform IP</strong>: The business retains all ownership over the platform's code, branding, and proprietary analysis systems.
                </li>
                <li>
                    <strong>User Ownership</strong>: Users retain full copyright and ownership of their original resumes and the personal data within them.
                </li>
                <li>
                    <strong>License to Process</strong>: By uploading a document, the user grants the platform a limited, revocable legal license to parse, scan, analyze, modify, and store the text strictly to provide the digital optimization service.
                </li>
            </ul>

            <h2>9. Data Privacy and Infrastructure</h2>
            <ul>
                <li>
                    <strong>Data Processing</strong>: Personal documents and profiles are processed securely. User data is housed on secure, robust third-party database infrastructure (Supabase) to ensure reliability and uptime.
                </li>
                <li>
                    <strong>Data Retention</strong>: Analyzed resumes are kept on servers according to standard retention policies. Outlines the exact process users must follow to request the deletion of their parsed documents and account data.
                </li>
                <li>
                    <strong>Security</strong>: Database-level Row Level Security (RLS) policies enforce that users can only read/write their own <code>candidates_history</code> and <code>user_profiles</code> rows.
                </li>
            </ul>

            <h2>10. Termination and Enforcement</h2>
            <ul>
                <li>
                    <strong>User Cancellation</strong>: Explains how users can safely close their accounts and halt billing.
                </li>
                <li>
                    <strong>Provider Rights</strong>: Reserves the right for the platform to suspend or terminate accounts immediately and without notice if a user violates the Acceptable Use policy or falsifies information.
                </li>
            </ul>

            <h2>11. Limitation of Liability</h2>
            <p>
                <strong>Liability Cap</strong>: Protects the business from being held responsible for indirect damages, loss of revenue, or issues arising from service downtime or third-party data breaches. Under no circumstances shall CareerSync’s total liability exceed the amount paid by the User to the Platform in the three (3) months preceding the claim.
            </p>

            <h2>12. Governing Law and Dispute Resolution</h2>
            <ul>
                <li>
                    <strong>Governing Law</strong>: Specifies the jurisdiction whose laws govern the agreement and where any legal disputes will be resolved. This Agreement shall be governed by and construed in accordance with the laws of the Republic of the Philippines.
                </li>
                <li>
                    <strong>Exclusive Jurisdiction</strong>: Any legal disputes, claims, or controversies arising out of or relating to this Agreement shall be subject to the exclusive jurisdiction of the competent courts of Muntinlupa City, Philippines.
                </li>
                <li>
                    <strong>Mandatory Mediation</strong>: Prior to the initiation of any formal litigation, the parties agree to engage in mandatory mediation in good faith to resolve the dispute.
                </li>
            </ul>
        </LegalLayout>
    );
};

export default Terms;
