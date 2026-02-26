async function testWebhook() {
    try {
        const res = await fetch("https://careersync.website/api/webhooks/paymongo", {
            method: "POST",
            headers: {
                "Paymongo-Signature": "t=1,te=1",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ data: { attributes: { type: "test" } } })
        });
        const text = await res.text();
        console.log("Webhook Status:", res.status);
        console.log("Webhook Response:", text);
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

async function testAnalyze() {
    try {
        const res = await fetch("https://careersync.website/api/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ test: "data" })
        });
        const text = await res.text();
        console.log("Analyze Status:", res.status);
        console.log("Analyze Response:", text.substring(0, 50));
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

testWebhook();
testAnalyze();
