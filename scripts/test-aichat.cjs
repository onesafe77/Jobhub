const https = require('https');

const apiKey = process.env.OPENAI_API_KEY || "";

const data = JSON.stringify({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    messages: [
        {
            role: 'system',
            content: `Kamu adalah "Jobs Agent AI" — teman karir pintar yang akrab dan menyenangkan.`
        },
        { role: 'user', content: 'tes halo' }
    ]
});

const options = {
    hostname: 'api.openai.com',
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = https.request(options, (res) => {
    let responseBody = '';

    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        console.log(`Status code: ${res.statusCode}`);
        if (res.statusCode !== 200) {
            console.error("API error response:", responseBody);
        } else {
            console.log("Success! Answer:", JSON.parse(responseBody).choices[0].message.content);
        }
    });
});

req.on('error', (error) => {
    console.error("Request error:", error);
});

req.write(data);
req.end();
