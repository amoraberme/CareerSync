import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. Setup Data - Define Load Testing Stages
export const options = {
    // Phase 1: 5 users for 10s -> testing baseline
    // Phase 2: 15 users for 20s -> pushing past the 15 RPM Google Cloud limit
    // Phase 3: 25 users for 30s -> sustaining the limit to guarantee 429s (Too Many Requests)
    stages: [
        { duration: '10s', target: 5 },
        { duration: '20s', target: 15 },
        { duration: '30s', target: 25 },
        { duration: '10s', target: 0 },
    ],
    // Setting thresholds correctly to capture error rates
    thresholds: {
        http_req_duration: ['p(95)<10000'], // Gemini can take ~3-8s per generation

        http_req_failed: ['rate<0.05'],   // Less than 5% of requests should fail entirely
        // Custom threshold checks can be appended for specific status codes if needed
    },
};

// 2. Execution - Define the actual API call logic
export default function () {
    // 🔴 PLACEHOLDER 1: Testing the core AI Analysis endpoint on your Production deploy
    const url = 'https://careersync.website/api/analyze';

    // 🔴 PLACEHOLDER 2: Providing a mock payload that the /api/analyze endpoint expects
    const payload = JSON.stringify({
        jobTitle: "Software Engineer",
        industry: "Technology",
        experienceText: "5 years of experience",
        qualifications: "Bachelor's Degree",
        roleDo: "Write code and tests",
        resumeData: {
            name: "mock_resume.txt",
            mimeType: "text/plain",
            // Base64 encoded string of "This is a mock resume string for load testing."
            data: "VGhpcyBpcyBhIG1vY2sgcmVzdW1lIHN0cmluZyBmb3IgbG9hZCB0ZXN0aW5nLg=="
        },
        coverLetterTone: "Professional"
    });

    // 🔴 PLACEHOLDER 3: Default headers
    const params = {
        headers: {
            'Content-Type': 'application/json',
            // IMPORTANT: Your Vercel /api/analyze endpoint checks `verifyAuth(req, res)`.
            // You MUST get a valid Supabase Bearer token from a logged-in session in your browser
            // and paste it below, otherwise all requests will fail with 401 Unauthorized.
            'Authorization': 'Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6IjRjZGI4YTRmLTRjMmItNGExZi04YmE5LTJjZDgyMjY1NDQzMyIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL29pZXZpemV6Z3Fsb2twdml1ZnV0LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJlMjdiZmFiMS0wNWQ0LTQ4MDctODRjMy1mMTM4NmJmZDQ5MmMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzcyNjk1OTExLCJpYXQiOjE3NzI2OTIzMTEsImVtYWlsIjoiamVyaWNvYmVybWUyOUBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6Imdvb2dsZSIsInByb3ZpZGVycyI6WyJnb29nbGUiXX0sInVzZXJfbWV0YWRhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0pVc1dqa2JkNjJzbUd4eWZtMEl5aWdCYWF6SUVxS3FzOTBYbVUzMEJUdHBKdTY5WFE9czk2LWMiLCJlbWFpbCI6Implcmljb2Jlcm1lMjlAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZ1bGxfbmFtZSI6IkplcmljbyBCZXJtZSIsImlzcyI6Imh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbSIsIm5hbWUiOiJKZXJpY28gQmVybWUiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NKVXNXamtiZDYyc21HeHlmbTBJeWlnQmFheklFcUtxczkwWG1VMzBCVHRwSnU2OVhRPXM5Ni1jIiwicHJvdmlkZXJfaWQiOiIxMDA4ODgyNjIyODUzNzUxMTkzMzgiLCJzdWIiOiIxMDA4ODgyNjIyODUzNzUxMTkzMzgifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJvYXV0aCIsInRpbWVzdGFtcCI6MTc3MjY5MjMxMX1dLCJzZXNzaW9uX2lkIjoiYmY1NmVkMTQtMzNhNC00NGZjLWI1MjQtMjU5NDA0NTAwNmM4IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.lZp0vSiVP9TGkbyiTp3rfLRQixUA8fmw_TWv3WhUqaOUgyFGFL4Qd5lroZXZbVOdgUrxIP0l76ITtq3hy-5Ehg',
        },
    };

    // Make the standard HTTP request (Change `http.post(url, payload, params)` to `http.get(url, params)` if testing a GET endpoint)
    const response = http.post(url, payload, params);

    // 3. Verification - Explicitly track successes and document the failures
    check(response, {
        'status is 200/201 (Success)': (r) => r.status === 200 || r.status === 201,
        'status is 401/403 (Auth failure)': (r) => r.status === 401 || r.status === 403,
        'status is 429 (Rate Limited)': (r) => r.status === 429,
        'status is 500+ (Server Error)': (r) => r.status >= 500,
    });

    // Pace the virtual users so they act like real humans clicking through the app
    // Provide a 1-second pause between each user's requests.
    sleep(1);
}
