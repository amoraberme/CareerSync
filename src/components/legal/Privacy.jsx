import React from 'react';
import LegalLayout from './LegalLayout';

const Privacy = ({ onBack }) => {
    return (
        <LegalLayout title="Privacy Policy" onBack={onBack}>
            <p className="font-semibold text-sm mb-8">
                Effective Date: February 26, 2026<br />
                Platform: CareerSync (career-sync.blush.vercel.app)
            </p>

            <h2>1. Introduction and Scope</h2>
            <p>
                Welcome to CareerSync. We operate an AI-powered career intelligence platform designed primarily for active job seekers and career-changers in the Philippines. Transparency is our foundational principle. This Privacy Policy details how we collect, process, store, and protect your personal information in strict adherence to the Philippine Data Privacy Act of 2012 (R.A. 10173).
            </p>

            <h2>2. Data Collection Inventory</h2>
            <p>
                Following the principle of data minimization, we collect only the information strictly necessary to deliver and improve our services.
            </p>
            <ul>
                <li><strong>Personally Identifiable Information (PII)</strong>: Names and email addresses for account management and communication.</li>
                <li><strong>Document Data</strong>: The specific contents of uploaded resumes, containing employment and educational backgrounds.</li>
                <li><strong>Target Job Data</strong>: Job titles and descriptions used as benchmarks for AI Match Scores.</li>
                <li><strong>Financial Data</strong>: Transaction logs and centavo-matching data for billing transparency. CareerSync does not store full credit card numbers.</li>
            </ul>

            <h2>3. AI Processing & Data Protection</h2>
            <p>
                When you submit a resume, CareerSync transmits necessary text to the Google Gemini 2.0 Flash API for evaluation.
            </p>
            <ul>
                <li><strong>No Model Training</strong>: User data transmitted via API is strictly for processing and is NOT used to train Google's foundational models.</li>
                <li><strong>Prompt Injection Safeguards</strong>: Our backend utilizes separated system/user roles to ensure the AI does not execute commands found within user-provided text.</li>
            </ul>

            <h2>4. Third-Party Processors</h2>
            <p>
                To deliver a secure platform, we partner with specialized infrastructure providers:
            </p>
            <ul>
                <li><strong>Supabase</strong>: Provides our database, GoTrue authentication, and row-level security.</li>
                <li><strong>Vercel</strong>: Hosts our application and provisions the Serverless Node.js runtime.</li>
                <li><strong>PayMongo</strong>: Securely processes financial instruments for subscription tiers.</li>
            </ul>

            <h2>5. Security Architecture</h2>
            <ul>
                <li><strong>Encryption in Transit</strong>: All data is protected via standard HTTPS protocols.</li>
                <li><strong>Encryption at Rest</strong>: Resume files and reports are encrypted while stored on our servers.</li>
                <li><strong>Data Isolation</strong>: Database-level Row Level Security (RLS) ensures users can only access their own professional records.</li>
            </ul>

            <h2>6. Data Retention & Destruction</h2>
            <ul>
                <li><strong>Active Storage</strong>: Past analyses are stored as long as your account is active to help you track progress.</li>
                <li><strong>Dormancy Purges</strong>: Accounts inactive for 12 months are subject to permanent deletion.</li>
                <li><strong>Anti-Abuse Retention</strong>: Cryptographic hashes of emails are retained after deletion solely to prevent system abuse (e.g., free credit looping).</li>
            </ul>

            <h2>7. Your Rights (NPC Compliance)</h2>
            <p>
                Under the Philippine Data Privacy Act, you possess ultimate control over your digital footprint:
            </p>
            <ul>
                <li>Right to be Informed of how your data is processed.</li>
                <li>Right to Access and view all data tied to your account.</li>
                <li>Right to Rectification to update inaccurate profiles.</li>
                <li>Right to Erasure to permanently delete your account and documents.</li>
                <li>Right to Data Portability to export analysis reports to PDF.</li>
            </ul>

            <h2>8. Contact</h2>
            <p>
                If you wish to exercise any of your rights or have questions regarding our privacy measures, please contact our Data Protection Office through the platform support channels.
            </p>
        </LegalLayout>
    );
};

export default Privacy;
