export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, concern } = req.body;

        if (!name || !email || !concern) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: 'onboarding@resend.dev',
                to: process.env.CONTACT_DESTINATION_EMAIL,
                subject: `New Contact Request from ${name}`,
                html: `
                    <h2>New Contact Submission</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Concern:</strong></p>
                    <p>${concern.replace(/\n/g, '<br>')}</p>
                `
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to send email');
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
