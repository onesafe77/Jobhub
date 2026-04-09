import fetch from 'node-fetch';

const apiKey = process.env.OPENAI_API_KEY || "";

async function testOpenAI() {
    console.log("Testing OpenAI API call...");
    const q = "tes halo";

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            temperature: 0.3,
            messages: [
                {
                    role: 'system',
                    content: `Kamu adalah "Jobs Agent AI" — teman karir pintar yang akrab dan menyenangkan.`
                },
                { role: 'user', content: q }
            ]
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API error status:", response.status, "Error:", errorText);
    } else {
        const data = await response.json();
        console.log("Success! Answer:", data.choices[0].message.content);
    }
}

testOpenAI().catch(console.error);
