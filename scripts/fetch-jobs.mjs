/**
 * fetch-jobs.mjs
 * Script to fetch LinkedIn job data from Apify and insert into Supabase.
 * 
 * Usage:
 *   node scripts/fetch-jobs.mjs --token YOUR_APIFY_TOKEN --keywords "Software Engineer" --location "Indonesia"
 * 
 * Or without Apify (test mode with sample data):
 *   node scripts/fetch-jobs.mjs --test
 */

const SUPABASE_URL = 'https://vofsxvyzfhejdogiteyp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_txUK3AtZKoFIO8rBiDxsKw_GKTLdlqs';
const ACTOR_ID = 'bebity~linkedin-jobs-scraper';

// Parse CLI arguments
const args = process.argv.slice(2);
const getArg = (name) => {
    const idx = args.indexOf(`--${name}`);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
};
const isTest = args.includes('--test');

async function insertJobsToSupabase(jobs) {
    console.log(`\n📦 Inserting ${jobs.length} jobs into Supabase...`);

    const response = await fetch(`${SUPABASE_URL}/rest/v1/jobs`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(jobs),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Supabase insert failed:', errorText);
        return false;
    }

    console.log('✅ Jobs inserted successfully!');
    return true;
}

function mapApifyToSupabase(items) {
    return items
        .map((item) => ({
            title: item.title || item.jobTitle || 'Unknown',
            company: item.companyName || item.company || 'Unknown',
            location: item.location || 'Remote',
            salary: item.salary || null,
            description: (item.description || '').substring(0, 5000),
            url: item.jobUrl || item.url || item.link || '',
            apply_url: item.applyUrl || item.jobUrl || item.url || '',
            logo_url: item.companyLogoUrl || item.companyLogo || null,
            source: 'LinkedIn',
            job_type: item.contractType || item.employmentType || item.workType || null,
            posted_at: item.postedAt || item.publishedAt || new Date().toISOString(),
        }))
        .filter((job) => job.url && job.title && job.title !== 'Unknown');
}

async function runApifyActor(token, keywords, location) {
    console.log(`🔍 Starting Apify Actor: ${ACTOR_ID}`);
    console.log(`   Keywords: ${keywords}`);
    console.log(`   Location: ${location}`);

    // Start the actor run
    const startResponse = await fetch(
        `https://api.apify.com/v2/acts/${encodeURIComponent(ACTOR_ID)}/runs?token=${token}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: keywords,
                location: location,
                rows: 50, // Limit to 50 jobs for testing
            }),
        }
    );

    if (!startResponse.ok) {
        const err = await startResponse.text();
        console.error('❌ Failed to start actor:', err);
        return null;
    }

    const runData = await startResponse.json();
    const runId = runData.data.id;
    const datasetId = runData.data.defaultDatasetId;
    console.log(`⏳ Actor run started: ${runId}`);
    console.log(`   Dataset: ${datasetId}`);

    // Poll for completion
    let status = 'RUNNING';
    while (status === 'RUNNING' || status === 'READY') {
        await new Promise((r) => setTimeout(r, 5000)); // Wait 5 seconds
        const statusResponse = await fetch(
            `https://api.apify.com/v2/actor-runs/${runId}?token=${token}`
        );
        const statusData = await statusResponse.json();
        status = statusData.data.status;
        console.log(`   Status: ${status}`);
    }

    if (status !== 'SUCCEEDED') {
        console.error(`❌ Actor run failed with status: ${status}`);
        return null;
    }

    // Fetch dataset items
    console.log('📥 Fetching dataset items...');
    const datasetResponse = await fetch(
        `https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}&format=json`
    );

    if (!datasetResponse.ok) {
        console.error('❌ Failed to fetch dataset');
        return null;
    }

    const items = await datasetResponse.json();
    console.log(`   Found ${items.length} items from Apify`);
    return items;
}

async function getTestData() {
    // Sample job data for testing
    return [
        {
            title: "Software Engineer",
            companyName: "Tokopedia",
            location: "Jakarta, Indonesia",
            salary: "Rp 18jt - 30jt",
            description: "We are looking for a talented Software Engineer to join our product team. You will be working on building scalable microservices and APIs using Go and Python. Requirements: 3+ years experience, familiar with cloud infrastructure (AWS/GCP), strong problem solving skills.",
            jobUrl: "https://linkedin.com/jobs/view/tokopedia-se-001",
            contractType: "Full-time",
            postedAt: new Date().toISOString(),
        },
        {
            title: "Frontend Developer",
            companyName: "Gojek",
            location: "Jakarta, Indonesia",
            salary: "Rp 15jt - 25jt",
            description: "Join Gojek's frontend engineering team! Build modern web applications using React, TypeScript, and Next.js. We need someone passionate about user experience and performance optimization.",
            jobUrl: "https://linkedin.com/jobs/view/gojek-fe-002",
            contractType: "Full-time",
            postedAt: new Date().toISOString(),
        },
        {
            title: "Data Analyst",
            companyName: "Shopee",
            location: "Bandung, Indonesia",
            salary: "Rp 12jt - 20jt",
            description: "Analyze business data and provide actionable insights for our marketplace operations. Experience with SQL, Python, and Tableau required. Strong analytical thinking and communication skills needed.",
            jobUrl: "https://linkedin.com/jobs/view/shopee-da-003",
            contractType: "Full-time",
            postedAt: new Date().toISOString(),
        },
        {
            title: "DevOps Engineer",
            companyName: "Bukalapak",
            location: "Jakarta, Indonesia",
            salary: "Rp 20jt - 35jt",
            description: "Manage cloud infrastructure on AWS and GCP. Implement CI/CD pipelines, monitoring, and alerting. Experience with Kubernetes, Docker, and Terraform is a must.",
            jobUrl: "https://linkedin.com/jobs/view/bukalapak-devops-004",
            contractType: "Full-time",
            postedAt: new Date().toISOString(),
        },
        {
            title: "UI/UX Designer",
            companyName: "Traveloka",
            location: "Jakarta, Indonesia",
            salary: "Rp 14jt - 22jt",
            description: "Design beautiful and intuitive travel booking experiences for millions of users. Proficiency in Figma, user research methodologies, and design systems required.",
            jobUrl: "https://linkedin.com/jobs/view/traveloka-uiux-005",
            contractType: "Full-time",
            postedAt: new Date().toISOString(),
        },
        {
            title: "Product Manager",
            companyName: "OVO",
            location: "Jakarta, Indonesia",
            salary: "Rp 25jt - 40jt",
            description: "Lead product strategy and roadmap for our digital payment platform. Work cross-functionally with engineering, design, and business teams. 5+ years PM experience required.",
            jobUrl: "https://linkedin.com/jobs/view/ovo-pm-006",
            contractType: "Full-time",
            postedAt: new Date().toISOString(),
        },
        {
            title: "Mobile Developer (Android)",
            companyName: "Dana",
            location: "Jakarta, Indonesia",
            salary: "Rp 16jt - 28jt",
            description: "Build and maintain our Android application used by millions. Experience with Kotlin, Jetpack Compose, and clean architecture patterns required.",
            jobUrl: "https://linkedin.com/jobs/view/dana-android-007",
            contractType: "Full-time",
            postedAt: new Date().toISOString(),
        },
        {
            title: "QA Engineer",
            companyName: "Blibli",
            location: "Jakarta, Indonesia",
            salary: "Rp 10jt - 18jt",
            description: "Ensure product quality through manual and automated testing. Experience with Selenium, Cypress, and API testing tools. ISTQB certification is a plus.",
            jobUrl: "https://linkedin.com/jobs/view/blibli-qa-008",
            contractType: "Full-time",
            postedAt: new Date().toISOString(),
        },
        {
            title: "Machine Learning Engineer",
            companyName: "Grab",
            location: "Jakarta, Indonesia",
            salary: "Rp 30jt - 50jt",
            description: "Develop and deploy ML models for ride matching, ETA prediction, and fraud detection. Strong background in Python, TensorFlow/PyTorch, and MLOps practices required.",
            jobUrl: "https://linkedin.com/jobs/view/grab-ml-009",
            contractType: "Full-time",
            postedAt: new Date().toISOString(),
        },
        {
            title: "Cloud Architect",
            companyName: "Tiket.com",
            location: "Jakarta, Indonesia",
            salary: "Rp 35jt - 55jt",
            description: "Design and implement cloud-native architectures for our travel platform. Expert-level knowledge of AWS services, microservices, and event-driven architecture required.",
            jobUrl: "https://linkedin.com/jobs/view/tiket-cloud-010",
            contractType: "Full-time",
            postedAt: new Date().toISOString(),
        },
    ];
}

// Main
(async () => {
    console.log('🚀 JobHub - Apify Job Fetcher\n');

    let rawItems;

    if (isTest) {
        console.log('🧪 Running in TEST MODE with sample data...');
        rawItems = await getTestData();
    } else {
        const token = getArg('token');
        const keywords = getArg('keywords') || 'Software Engineer';
        const location = getArg('location') || 'Indonesia';

        if (!token) {
            console.error('❌ Missing --token argument. Usage:');
            console.error('   node scripts/fetch-jobs.mjs --token YOUR_APIFY_TOKEN --keywords "Frontend Developer" --location "Indonesia"');
            console.error('\n   Or run in test mode:');
            console.error('   node scripts/fetch-jobs.mjs --test');
            process.exit(1);
        }

        rawItems = await runApifyActor(token, keywords, location);
        if (!rawItems) {
            console.error('❌ No items fetched. Exiting.');
            process.exit(1);
        }
    }

    const jobs = mapApifyToSupabase(rawItems);
    console.log(`\n🔄 Mapped ${jobs.length} valid jobs`);

    if (jobs.length === 0) {
        console.log('⚠️  No valid jobs to insert.');
        process.exit(0);
    }

    // Show preview
    console.log('\n📋 Preview (first 3 jobs):');
    jobs.slice(0, 3).forEach((j, i) => {
        console.log(`   ${i + 1}. ${j.title} @ ${j.company} (${j.location})`);
    });

    const success = await insertJobsToSupabase(jobs);
    if (success) {
        console.log(`\n🎉 Done! ${jobs.length} jobs are now in your Supabase database.`);
        console.log('   Open http://localhost:3000 and search to see them!');
    }
})();
