import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const KEYWORDS = [
    // TECHNOLOGY
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile Developer',
    'UI/UX Designer', 'Data Scientist', 'Data Analyst', 'Cyber Security', 'DevOps', 'QA Engineer',
    'Cloud Engineer', 'IT Support', 'Artificial Intelligence', 'Blockchain', 'Game Developer',
    'System Architect', 'Information Security', 'Software Architect', 'Embedded Engineer',

    // ENGINEERING & TECHNICAL
    'Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Chemical Engineer',
    'Industrial Engineer', 'Site Manager', 'Estimator', 'Draftsperson',
    'HSE Officer', 'Safety Officer', 'Environmental Engineer', 'K3 Specialist',
    'Maintenance Technician', 'Quality Control', 'Project Engineer', 'Field Engineer',

    // MINING & ENERGY
    'Mining Engineer', 'Geologist', 'Petroleum Engineer', 'Mine Plan Engineer',
    'Drilling Supervisor', 'Heavy Equipment Mechanic', 'Surveyor', 'Mine Superintendent',
    'Exploration Geologist', 'GIS Specialist',

    // AGRICULTURE & PLANTATION
    'Estate Manager', 'Agronomist', 'Asisten Kebun', 'Mill Manager', 'Plantation Supervisor',
    'Palm Oil Specialist', 'Forester',

    // LEGAL & CORPORATE
    'Legal Officer', 'Corporate Secretary', 'Legal Counsel', 'Public Relations', 'Internal Audit',
    'Compliance Officer', 'Notary Assistant',

    // FINANCE & ACCOUNTING
    'Accountant', 'Finance Manager', 'Tax Specialist', 'Auditor',
    'Investment Analyst', 'Financial Planner', 'Bank Teller', 'Credit Analyst',
    'Treasury Specialist', 'Finance Controller', 'Tax Consultant',

    // SALES & MARKETING
    'Digital Marketing Specialist', 'Social Media Manager', 'SEO Specialist', 'Content Creator',
    'Graphic Designer', 'Copywriter', 'Brand Manager', 'Market Researcher',
    'Sales Executive', 'Account Manager', 'Business Development', 'Telemarketing',
    'Event Planner', 'PR Specialist',

    // HUMAN RESOURCES & ADMIN
    'HR Generalist', 'Recruiter', 'Admin Assistant', 'Office Manager',
    'Personal Assistant', 'Customer Service Representative', 'Liaison Officer', 'HR Manager',
    'Payroll Specialist', 'Training & Development',

    // LOGISTICS & SUPPLY CHAIN
    'Logistics Manager', 'Supply Chain Planner', 'Warehouse Supervisor', 'Procurement Officer',
    'Export Import Specialist', 'Inventory Controller', 'Delivery Driver', 'Courier Specialist',
    'Operations Specialist', 'Shipping Coordinator',

    // HEALTHCARE & SCIENCE
    'Doctor', 'Nurse', 'Pharmacist', 'Laboratory Assistant', 'Nutritionist', 'Physiotherapist',
    'Radiographer', 'Biotechnologist',

    // HOSPITALITY & RETAIL
    'Store Manager', 'Cashier', 'Waiter/Waitress', 'Chef', 'Barista', 'Hotel Management',
    'F&B Manager', 'Housekeeping Supervisor'
];

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Kita gunakan token apify dari environment variable Supabase
        const APIFY_TOKEN = Deno.env.get('VITE_APIFY_TOKEN') || Deno.env.get('APIFY_TOKEN')

        if (!APIFY_TOKEN) {
            throw new Error('APIFY_TOKEN is missing in Supabase Edge Function Secrets')
        }

        // Pilih 3-5 keyword secara acak setiap hari agar variatif dan tidak timeout (Edge Function max 60s)
        const selectedKeywords = KEYWORDS.sort(() => 0.5 - Math.random()).slice(0, 4);

        console.log(`[Cron] Memulai sinkronisasi harian untuk: ${selectedKeywords.join(', ')}`);

        const totalResults = [];

        for (const query of selectedKeywords) {
            console.log(`[Cron] Scraping LinkedIn untuk: "${query}"...`);

            try {
                const response = await fetch(`https://api.apify.com/v2/acts/worldunboxer~rapid-linkedin-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        searchTerms: [query],
                        location: "Indonesia",
                        maxItems: 20
                    })
                });

                if (!response.ok) {
                    console.error(`[Cron] Gagal scraping ${query}:`, await response.text());
                    continue;
                }

                const items = await response.json();
                console.log(`[Cron] Berhasil mengambil ${items.length} lowongan untuk ${query}`);

                const jobsToInsert = items.map((item: any) => ({
                    title: item.job_title || item.title || query,
                    company: item.company_name || item.company || "Perusahaan Terkait",
                    location: item.location || "Indonesia",
                    salary: item.salary_range || "Negosiasi",
                    description: (item.job_description || "Detail tersedia di link sumber.").substring(0, 5000),
                    url: item.job_url || item.url || `https://linkedin.com/search?keywords=${encodeURIComponent(query)}`,
                    source: "LinkedIn (Auto Sync)",
                    job_type: item.employment_type || "Full-time",
                    posted_at: item.time_posted || new Date().toISOString()
                }));

                const { error: upsertError } = await supabaseClient
                    .from('jobs')
                    .upsert(jobsToInsert, { onConflict: 'url' });

                if (upsertError) {
                    console.error(`[Cron] Gagal simpan ke database untuk ${query}:`, upsertError);
                } else {
                    totalResults.push(`${query}: ${items.length} jobs`);
                }

            } catch (err) {
                console.error(`[Cron] Error pada keyword ${query}:`, err);
            }
        }

        return new Response(JSON.stringify({
            status: 'success',
            synced: totalResults
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error('[Cron] Critical Error:', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
