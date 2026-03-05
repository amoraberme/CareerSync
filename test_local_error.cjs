async function testAnalyze() {
    const url = 'https://careersync.website/api/analyze';
    const payload = JSON.stringify({
        jobTitle: "Software Engineer",
        industry: "Technology",
        experienceText: "5 years of experience",
        qualifications: "Bachelor's Degree",
        roleDo: "Write code and tests",
        resumeData: "This is a mock resume string for load testing to bypass the length checks.",
        coverLetterTone: "Professional"
    });

    const params = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6IjRjZGI4YTRmLTRjMmItNGExZi04YmE5LTJjZDgyMjY1NDQzMyIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL29pZXZpemV6Z3Fsb2twdml1ZnV0LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJlMjdiZmFiMS0wNWQ0LTQ4MDctODRjMy1mMTM4NmJmZDQ5MmMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzcyNjkyMDYxLCJpYXQiOjE3NzI2ODg0NjEsImVtYWlsIjoiamVyaWNvYmVybWUyOUBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6Imdvb2dsZSIsInByb3ZpZGVycyI6WyJnb29nbGUiXX0sInVzZXJfbWV0YWRhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0pVc1dqa2JkNjJzbUd4eWZtMEl5aWdCYWF6SUVxS3FzOTBYbVUzMEJUdHBKdTY5WFE9czk2LWMiLCJlbWFpbCI6Implcmljb2Jlcm1lMjlAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZ1bGxfbmFtZSI6IkplcmljbyBCZXJtZSIsImlzcyI6Imh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbSIsIm5hbWUiOiJKZXJpY28gQmVybWUiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NKVXNXamtiZDYyc21HeHlmbTBJeWlnQmFheklFcUtxczkwWG1VMzBCVHRwSnU2OVhRPXM5Ni1jIiwicHJvdmlkZXJfaWQiOiIxMDA4ODgyNjIyODUzNzUxMTkzMzgiLCJzdWIiOiIxMDA4ODgyNjIyODUzNzUxMTkzMzgifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJvYXV0aCIsInRpbWVzdGFtcCI6MTc3MjY4ODQ2MX1dLCJzZXNzaW9uX2lkIjoiYTQ3MGJiZTUtMjBiOC00MjE2LWI1NTctOTk3NmEwNjU5ZWE3IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.bNrHngDZr5AsFSZPIBny_717dxb1i8AcSSe840ibECCzwY00QA5eBMINieaCgGbSAuCYCBAruT8zkBCmglpfdA'
        },
        body: payload
    };

    try {
        console.log("Sending request to exactly how k6 does it...");
        const res = await fetch(url, params);
        console.log("Status:", res.status);
        const data = await res.text();
        console.log("Body:", data);
    } catch (e) {
        console.error("Fetch failed entirely:", e);
    }
}

testAnalyze();
