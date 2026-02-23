async function testCheckout() {
    try {
        const response = await fetch('https://career-sync-blush.vercel.app/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tier: 'base',
                userId: 'test_123'
            })
        });

        const text = await response.text();
        console.log("Status:", response.status);
        console.log("Response:", text);
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

testCheckout();
