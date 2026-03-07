/**
 * bulk-scrape.mjs
 * Bulk scrape jobs from Apify LinkedIn Jobs Scraper across multiple keywords & locations.
 * 
 * Usage:
 *   node scripts/bulk-scrape.mjs --token YOUR_APIFY_TOKEN
 *   node scripts/bulk-scrape.mjs --token YOUR_APIFY_TOKEN --rows 25
 *   node scripts/bulk-scrape.mjs --token YOUR_APIFY_TOKEN --keyword "Safety Officer"
 */

const SUPABASE_URL = 'https://vofsxvyzfhejdogiteyp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_txUK3AtZKoFIO8rBiDxsKw_GKTLdlqs';
const ACTOR_ID = 'curious_coder~linkedin-jobs-scraper';

// ============================================
// 🔧 KONFIGURASI — Edit sesuai kebutuhan
// ============================================
const KEYWORDS = [
    // TECHNOLOGY
    "Frontend Developer", "Backend Developer", "Full Stack Developer", "Mobile Developer",
    "UI/UX Designer", "Data Scientist", "Data Analyst", "Cyber Security", "DevOps", "QA Engineer",
    "Cloud Engineer", "IT Support", "Artificial Intelligence", "Blockchain", "Game Developer",
    "System Architect", "Information Security", "Software Architect", "Embedded Engineer",

    // ENGINEERING & TECHNICAL
    "Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Chemical Engineer",
    "Industrial Engineer", "Site Manager", "Estimator", "Draftsperson",
    "HSE Officer", "Safety Officer", "Environmental Engineer", "K3 Specialist",
    "Maintenance Technician", "Quality Control", "Project Engineer", "Field Engineer",

    // MINING & ENERGY
    "Mining Engineer", "Geologist", "Petroleum Engineer", "Mine Plan Engineer",
    "Drilling Supervisor", "Heavy Equipment Mechanic", "Surveyor", "Mine Superintendent",
    "Exploration Geologist", "GIS Specialist",

    // AGRICULTURE & PLANTATION
    "Estate Manager", "Agronomist", "Mill Manager", "Plantation Supervisor",
    "Palm Oil Specialist", "Forester",

    // LEGAL & CORPORATE
    "Legal Officer", "Corporate Secretary", "Legal Counsel", "Public Relations", "Internal Audit",
    "Compliance Officer",

    // FINANCE & ACCOUNTING
    "Accountant", "Finance Manager", "Tax Specialist", "Auditor",
    "Investment Analyst", "Financial Planner", "Bank Teller", "Credit Analyst",
    "Treasury Specialist", "Finance Controller", "Tax Consultant",

    // SALES & MARKETING
    "Digital Marketing", "Social Media Manager", "SEO Specialist", "Content Creator",
    "Graphic Designer", "Copywriter", "Brand Manager", "Market Researcher",
    "Sales Executive", "Account Manager", "Business Development", "Event Planner",

    // HUMAN RESOURCES & ADMIN
    "HR Generalist", "Recruiter", "Admin Assistant", "Office Manager",
    "Customer Service", "HR Manager", "Payroll Specialist",

    // LOGISTICS & SUPPLY CHAIN
    "Logistics Manager", "Supply Chain Planner", "Warehouse Supervisor", "Procurement",
    "Export Import Specialist", "Inventory Controller", "Operations Specialist",

    // HEALTHCARE & SCIENCE
    "Nurse", "Pharmacist", "Nutritionist", "Biotechnologist",

    // HOSPITALITY & RETAIL
    "Store Manager", "Chef", "Hotel Management", "F&B Manager",
];

const LOCATIONS = [
    "Indonesia",
];

// ============================================

// Parse CLI arguments
const args = process.argv.slice(2);
const getArg = (name) => {
    const idx = args.indexOf(`--${name}`);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
};

const TOKEN = getArg('token');
const ROWS_PER_SEARCH = parseInt(getArg('rows') || '25', 10);
const SINGLE_KEYWORD = getArg('keyword'); // optional: run only 1 keyword

if (!TOKEN) {
    console.error('❌ Missing --token. Usage:');
    console.error('   node scripts/bulk-scrape.mjs --token YOUR_APIFY_TOKEN');
    console.error('   node scripts/bulk-scrape.mjs --token YOUR_APIFY_TOKEN --rows 25');
    console.error('   node scripts/bulk-scrape.mjs --token YOUR_APIFY_TOKEN --keyword "Safety Officer"');
    process.exit(1);
}

// ============================================
// Helper functions
// ============================================

function mapApifyToSupabase(items) {
    return items
        .map((item) => ({
            title: item.title || item.jobTitle || 'Unknown',
            company: item.companyName || item.company || 'Unknown',
            location: item.location || 'Indonesia',
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

async function insertJobsToSupabase(jobs) {
    if (jobs.length === 0) return 0;

    // Batch insert in chunks of 50
    let inserted = 0;
    for (let i = 0; i < jobs.length; i += 50) {
        const batch = jobs.slice(i, i + 50);
        const response = await fetch(`${SUPABASE_URL}/rest/v1/jobs?on_conflict=url`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates',
            },
            body: JSON.stringify(batch),
        });

        if (response.ok) {
            inserted += batch.length;
        } else {
            const err = await response.text();
            console.error(`   ❌ Batch insert failed: ${err.substring(0, 200)}`);
        }
    }
    return inserted;
}

async function runApifyAndWait(keyword, location) {
    // Build LinkedIn search URL
    const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}&position=1&pageNum=0`;

    // Start the actor
    const startRes = await fetch(
        `https://api.apify.com/v2/acts/${encodeURIComponent(ACTOR_ID)}/runs?token=${TOKEN}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                urls: [searchUrl],
                rows: ROWS_PER_SEARCH,
                scrapeCompanyDetails: false,
            }),
        }
    );

    if (!startRes.ok) {
        const err = await startRes.text();
        console.error(`   ❌ Failed to start: ${err.substring(0, 200)}`);
        return [];
    }

    const runData = await startRes.json();
    const runId = runData.data.id;
    const datasetId = runData.data.defaultDatasetId;

    // Poll for completion (max 5 min per task)
    const maxWait = 300000; // 5 min
    const startTime = Date.now();
    let status = 'RUNNING';

    while ((status === 'RUNNING' || status === 'READY') && (Date.now() - startTime < maxWait)) {
        await new Promise((r) => setTimeout(r, 10000)); // Wait 10 sec
        const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${TOKEN}`);
        const statusData = await statusRes.json();
        status = statusData.data.status;
    }

    if (status !== 'SUCCEEDED') {
        console.error(`   ❌ Run ended with status: ${status}`);
        return [];
    }

    // Fetch results
    const dataRes = await fetch(
        `https://api.apify.com/v2/datasets/${datasetId}/items?token=${TOKEN}&format=json`
    );
    if (!dataRes.ok) return [];

    return await dataRes.json();
}

// ============================================
// Main
// ============================================

(async () => {
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║   🚀 JobHub Bulk Scraping               ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('');

    const keywords = SINGLE_KEYWORD ? [SINGLE_KEYWORD] : KEYWORDS;
    const totalTasks = keywords.length * LOCATIONS.length;

    console.log(`📋 Keywords: ${keywords.length}`);
    console.log(`📍 Locations: ${LOCATIONS.join(', ')}`);
    console.log(`🔢 Rows per search: ${ROWS_PER_SEARCH}`);
    console.log(`📊 Total tasks: ${totalTasks}`);
    console.log(`⏱️  Estimated time: ~${totalTasks * 2} minutes`);
    console.log('');

    let totalJobs = 0;
    let totalInserted = 0;
    let taskNum = 0;

    for (const keyword of keywords) {
        for (const location of LOCATIONS) {
            taskNum++;
            console.log(`\n[${taskNum}/${totalTasks}] 🔍 "${keyword}" → ${location}`);

            try {
                const items = await runApifyAndWait(keyword, location);
                console.log(`   📥 Apify returned: ${items.length} items`);

                if (items.length === 0) {
                    console.log('   ⏭️  Skipping (no results)');
                    continue;
                }

                const jobs = mapApifyToSupabase(items);
                console.log(`   🔄 Valid jobs: ${jobs.length}`);
                totalJobs += jobs.length;

                const inserted = await insertJobsToSupabase(jobs);
                totalInserted += inserted;
                console.log(`   ✅ Inserted: ${inserted} jobs`);

            } catch (err) {
                console.error(`   ❌ Error: ${err.message}`);
            }

            // Small delay between tasks to avoid rate limiting
            if (taskNum < totalTasks) {
                console.log('   ⏳ Waiting 5s before next task...');
                await new Promise((r) => setTimeout(r, 5000));
            }
        }
    }

    console.log('\n');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║   📊 SUMMARY                            ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log(`   Total jobs scraped : ${totalJobs}`);
    console.log(`   Total inserted     : ${totalInserted}`);
    console.log(`   Tasks completed    : ${taskNum}/${totalTasks}`);
    console.log('');
    console.log('🎉 Done! Your database is now loaded with jobs.');
    console.log('');
})();
