import React from 'react';
import LegalLayout from './LegalLayout';

const Terms = ({ onBack }) => {
    return (
        <LegalLayout title="Terms of Service" onBack={onBack}>
            <p className="font-semibold text-sm mb-8">
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
                <li><strong>"Platform" or "CareerSync"</strong>: Refers to the AI-powered career intelligence platform, including its React frontend, Vercel Serverless Functions, and Supabase database infrastructure.</li>
                <li><strong>"User"</strong>: Any individual who registers an account, uploads a resume, or initiates a payment session on the Platform.</li>
                <li><strong>"AI Analysis Engine"</strong>: The proprietary integration utilizing the Google Gemini 2.0 Flash API, responsible for resume-to-job-description analysis, gap identification, and cover letter generation.</li>
                <li><strong>"Centavo-Matching"</strong>: The unique payment identification mechanism where each payment session is assigned a unique Philippine Peso amount down to the centavo (e.g., ₱1.47, ₱1.83) to unambiguously match an incoming GCash transfer.</li>
            </ul>

            <h2>3. Description of Services</h2>
            <p>
                CareerSync provides digital optimization services utilizing advanced artificial intelligence. The available features are dependent on the User's active subscription tier and may include:
            </p>
            <ul>
                <li><strong>AI Match Score</strong>: Scores resume-to-job fit 1–100 with a qualitative summary, giving candidates an immediate, objective benchmark before applying.</li>
                <li><strong>Matched Profile Analysis</strong>: Lists specific skills/experiences the candidate has that align with the role, helping users know what to emphasize in interviews.</li>
                <li><strong>Gap Analysis</strong>: Identifies missing skills or experience the job requires, turning vague rejection into actionable self-improvement.</li>
                <li><strong>Cover Letter Generation</strong>: Auto-generates a 3-paragraph cover letter tailored to bridge the candidate's background with the role, eliminating the blank-page problem and saving hours per application.</li>
                <li><strong>Resume Optimization (Premium)</strong>: Provides strategic rewrite advice, structural suggestions, and ATS keyword lists to provide direct, tactical advice to increase recruiter visibility.</li>
                <li><strong>PDF Export (Standard+)</strong>: Exports the full analysis report to PDF, allowing candidates to archive and share their reports.</li>
                <li><strong>History Dashboard</strong>: Stores all past analyses with scores, companies, and dates, enabling candidates to track their progress across multiple applications.</li>
            </ul>

            <h2>4. Explicit Disclaimer of Guarantees</h2>
            <p><strong>PLEASE READ THIS SECTION CAREFULLY AS IT MATERIALLY AFFECTS YOUR LEGAL RIGHTS.</strong></p>
            <ul>
                <li><strong>Informational Purposes Only</strong>: All resume analysis, scoring, and optimization tools are provided for structural and informational guidance only. CareerSync is an advisory tool, not a human recruiter or hiring manager.</li>
                <li><strong>No Employment Guarantee</strong>: The platform makes no guarantees regarding job placement, securing interviews, or salary increases.</li>
                <li><strong>Waiver of Claims</strong>: This critical clause prevents users from demanding refunds or threatening legal action based on their job search outcomes.</li>
                <li><strong>AI Hallucination & Accuracy</strong>: While CareerSync utilizes state-of-the-art LLMs, the AI Analysis Engine may occasionally produce inaccurate, incomplete, or contextually inappropriate suggestions.</li>
            </ul>

            <h2>5. User Responsibilities & Acceptable Use</h2>
            <p>
                To maintain the integrity of the Platform, Users must adhere to strict operational guidelines.
            </p>
            <ul>
                <li><strong>Truthfulness and Accuracy</strong>: Users must ensure that all information and resumes uploaded are accurate, truthful, and their own intellectual property.</li>
                <li><strong>Anti-Abuse & Prompt Injection</strong>: Users are strictly prohibited from embedding commands designed to manipulate the AI Analysis Engine.</li>
                <li><strong>Account Deletion Fraud</strong>: To prevent system abuse, users who delete and re-register their account receive 0 free credits instead of the standard 1.</li>
            </ul>

            <h2>6. Pricing and Billing</h2>
            <p>
                CareerSync operates on a multi-tier billing architecture designed for extreme accessibility.
            </p>
            <ul>
                <li><strong>Base Token Model</strong>: Users may purchase individual tokens (₱1 top-up) via unique Centavo-Matching.</li>
                <li><strong>Standard & Premium Subscriptions</strong>: Utilize PayMongo integration for GCash payment intent creation and recurring billing.</li>
                <li><strong>Recurring Charges</strong>: Subscription plans auto-renew unless cancelled before the next billing cycle.</li>
            </ul>

            <h2>7. Strict Refund Policy</h2>
            <p><strong>ALL DIGITAL SALES ARE FINAL.</strong></p>
            <p>
                Due to the immediate execution of serverless functions and the unrecoverable consumption of API compute costs via Google Gemini, CareerSync does not offer refunds for utilized credits or active subscription periods.
            </p>

            <h2>8. Data Privacy and Security</h2>
            <ul>
                <li><strong>Data Processing</strong>: Personal documents and profiles are processed securely using Supabase infrastructure.</li>
                <li><strong>Row Level Security (RLS)</strong>: Policies enforce that users can only read/write their own data rows.</li>
                <li><strong>License to Process</strong>: By uploading a document, the user grants a limited license to parse and analyze the text strictly to provide the service.</li>
            </ul>

            <h2>9. Governing Law</h2>
            <p>
                This Agreement shall be governed by and construed in accordance with the laws of the Republic of the Philippines. Any legal disputes shall be subject to the exclusive jurisdiction of the competent courts of Muntinlupa City, Philippines.
            </p>
        </LegalLayout>
    );
};

export default Terms;
