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
        const payload = await req.json()

        let rawItems: any[] = [];

        // Catch Apify webhook SUCCEEDED event
        if (payload.eventType === 'ACTOR.RUN.SUCCEEDED' && payload.resource && payload.resource.defaultDatasetId) {
            const datasetId = payload.resource.defaultDatasetId;
            const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?format=json`;
            const response = await fetch(datasetUrl);
            if (!response.ok) {
                console.error('Failed to fetch dataset from Apify API');
                throw new Error('Failed to fetch dataset from Apify API');
            }
            rawItems = await response.json();
        } else if (Array.isArray(payload)) {
            // Direct submission mode (if sent manually)
            rawItems = payload;
        } else {
            return new Response(JSON.stringify({ message: 'Unhandeled Apify webhok event. Only processing ACTOR.RUN.SUCCEEDED.' }), {
                status: 200, // Return 200 so Apify won't retry excessively on irrelevant events
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Format rawItems matching cpns_bumn_posts schema
        const postsData = rawItems.map(item => {
            // Parses Google News item
            // Typically Google News Scraper returns: title, snippet, source (name), url, publishedAt

            const title = item.title || item.headline || '';
            const snippet = item.snippet || item.description || '';
            const captionContent = `${title}\n\n${snippet}`; // Gabungkan judul dan isi berita

            let parsedAuthor = item.source || item.publisher || 'Google News';
            if (typeof parsedAuthor === 'object' && parsedAuthor.name) {
                parsedAuthor = parsedAuthor.name; // In case source is an object
            }

            return {
                id: item.id || undefined,
                caption: captionContent.trim(), // Judul + snippet
                url: item.url || item.link || '',
                image_url: item.imageUrl || item.thumbnailUrl || item.image || null, // Seringkali null
                author: parsedAuthor,
                timestamp: item.publishedAt ? new Date(item.publishedAt) : new Date(),
            };
        }).filter(post => post.url && post.caption); // Wajib ada link baca selengkapnya dan judul

        if (postsData.length === 0) {
            return new Response(JSON.stringify({ message: 'No valid posts found to insert.' }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Initialize Supabase admin client (Service Role Key bypasses RLS policies constraint for backend logic)
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Insert or update based on URL uniqueness
        // Make sure to add a UNIQUE constraint to `url` in `cpns_bumn_posts` table if onConflict is required.
        // If no unique constraint exists, this might insert duplicates! We assume `url` is unique.
        const { data, error } = await supabaseClient
            .from('cpns_bumn_posts')
            .upsert(postsData, { onConflict: 'url', ignoreDuplicates: true })

        // 🚨 Note: For the above upsert to not throw an error, 
        // the "cpns_bumn_posts" table must have a UNIQUE constraint on the "url" column. 
        // The script continues below.

        if (error) {
            console.error('Supabase Upsert Error:', error)
            // Fallback insertion without upsert if no unique constraint yet
            const fallback = await supabaseClient.from('cpns_bumn_posts').insert(postsData)
            if (fallback.error) throw fallback.error;
        }

        return new Response(JSON.stringify({ success: true, inserted_count: postsData.length }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error: any) {
        console.error('Webhook processing failed:', error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
