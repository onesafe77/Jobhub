import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Removed strict authorization check so it works out-of-the-box for now.
        // We can add it back later for security.

        const payload = await req.json()

        let jobsData = [];
        let rawItems = [];

        if (payload.eventType === 'ACTOR.RUN.SUCCEEDED' && payload.resource && payload.resource.defaultDatasetId) {
            // Fetch the dataset from Apify
            const datasetId = payload.resource.defaultDatasetId;
            // The Apify Dataset API is partially public if not strictly restricted, but better to use the public JSON link
            const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?format=json`;
            const response = await fetch(datasetUrl);
            if (!response.ok) {
                console.error('Failed to fetch dataset from Apify');
                throw new Error('Failed to fetch dataset from Apify');
            }
            rawItems = await response.json();
        } else if (Array.isArray(payload)) {
            // Direct payload array
            rawItems = payload;
        } else {
            return new Response(JSON.stringify({ message: 'Unhandled payload type or event' }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Process rawItems into jobsData (mapping LinkedIn schema to our schema)
        jobsData = rawItems.map(item => ({
            title: item.title || item.jobTitle || 'Unknown Title',
            company: item.companyName || item.company || 'Unknown Company',
            location: item.location || 'Remote',
            salary: item.salary || null,
            description: item.description || '',
            url: item.jobUrl || item.url || '',
            apply_url: item.applyUrl || item.url || '',
            logo_url: item.companyLogoUrl || null,
            source: 'LinkedIn',
            job_type: item.contractType || item.employmentType || null,
            posted_at: item.postedAt ? new Date(item.postedAt) : new Date(),
        })).filter(job => job.url && job.title); // Basic validation

        if (jobsData.length === 0) {
            return new Response(JSON.stringify({ message: 'No valid jobs found to insert.' }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Create a Supabase client with the Auth context of the logged in user.
        const supabaseClient = createClient(
            // Supabase API URL - env var exported by default.
            Deno.env.get('SUPABASE_URL') ?? '',
            // Supabase API ANON KEY - env var exported by default.
            // use service role key to bypass RLS
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Insert or Update the jobs.
        // We use a deduplication strategy: ON CONFLICT (url) DO UPDATE
        const { data, error } = await supabaseClient
            .from('jobs')
            .upsert(jobsData, { onConflict: 'url', ignoreDuplicates: false })

        if (error) throw error

        return new Response(JSON.stringify({ success: true, count: jobsData.length }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
