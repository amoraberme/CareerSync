async function testCheckout() {
    try {
        const response = await fetch('http://localhost:3000/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tier: 'premium',
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
