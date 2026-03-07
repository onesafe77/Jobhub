import fetch from "node-fetch";

const FIRECRAWL_API_KEY = "fc-fd3312952ef64894aa35f9eadc3f49f0";
const url = "https://www.linkedin.com/jobs/search?keywords=Estimator&location=Indonesia";

async function testFirecrawl() {
    console.log(`[Firecrawl] Mengekstrak job listings dari ${url}`);
    
    try {
        const response = await fetch('https://api.firecrawl.dev/v1/extract', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${FIRECRAWL_API_KEY}`
            },
            body: JSON.stringify({
                urls: [url],
                prompt: "Extract the list of job postings from this search results page. Ignore pagination links.",
                schema: {
                    "type": "object",
                    "properties": {
                        "jobs": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "title": {"type": "string", "description": "Job title"},
                                    "company": {"type": "string", "description": "Company name"},
                                    "location": {"type": "string", "description": "Job location"},
                                    "salary": {"type": "string", "description": "Salary range if available, else 'Negosiasi'"},
                                    "description": {"type": "string", "description": "Brief snippet or full job description"},
                                    "url": {"type": "string", "description": "Direct URL to apply or view the job posting"},
                                    "time_posted": {"type": "string", "description": "How long ago it was posted, e.g., '2 days ago'"},
                                    "employment_type": {"type": "string", "description": "E.g., Full-time, Contract, Part-time"}
                                },
                                "required": ["title", "company", "location", "url"]
                            }
                        }
                    },
                    "required": ["jobs"]
                }
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Firecrawl API Error: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        console.log("Raw Response:");
        console.log(JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("Error:", error.message);
    }
}

testFirecrawl();
