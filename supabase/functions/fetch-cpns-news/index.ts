import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// RSS Feeds mapped by year
const FEEDS_CONFIG = [
    { year: 2025, q: 'CPNS+BUMN+2025+pendaftaran+syarat' },
    { year: 2026, q: 'CPNS+BUMN+2026+pendaftaran+terbaru' },
    { year: 2026, q: 'lowongan+kerja+BUMN+CPNS+2026' }
]


// Extract image URL from HTML description
function extractImageUrl(html: string): string | null {
    if (!html) return null
    // Try to find <img src="..."> in the description HTML
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/i
    const match = imgRegex.exec(html)
    return match ? match[1] : null
}

// Clean HTML to get readable text
function cleanHtml(html: string): string {
    return html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

// Simple text chunker
function chunkText(text: string, chunkSize = 800, chunkOverlap = 150): string[] {
    const chunks: string[] = []
    let start = 0
    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length)
        chunks.push(text.slice(start, end))
        if (end === text.length) break
        start += (chunkSize - chunkOverlap)
    }
    return chunks
}

// Fetch article content
async function fetchArticleContent(url: string): Promise<string | null> {
    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
        })
        if (!response.ok) return null
        const html = await response.text()

        // Robust extraction: try common article containers
        const selectors = [
            /<article[^>]*>([\s\S]*?)<\/article>/i,
            /<main[^>]*>([\s\S]*?)<\/main>/i,
            /<div[^>]+class=["'][^"']*(?:article|content|post|entry|story)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
            /<section[^>]+class=["'][^"']*(?:article|content|post|entry|story)[^"']*["'][^>]*>([\s\S]*?)<\/section>/i
        ]

        for (const regex of selectors) {
            const match = html.match(regex)
            if (match && match[1].length > 500) {
                return cleanHtml(match[1])
            }
        }

        // Final fallback: just clean the whole body but exclude common junk
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
        return bodyMatch ? cleanHtml(bodyMatch[1]) : cleanHtml(html)
    } catch (err) {
        return null
    }
}

// Simple XML parser for RSS items
function parseRSSItems(xml: string): any[] {
    const items: any[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match

    while ((match = itemRegex.exec(xml)) !== null) {
        const itemXml = match[1]

        const getTag = (tag: string): string => {
            const tagRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`)
            const m = tagRegex.exec(itemXml)
            return m ? (m[1] || m[2] || '').trim() : ''
        }

        // Try to get media:content or enclosure for images
        const getMediaUrl = (): string | null => {
            const mediaRegex = /<media:content[^>]+url=["']([^"']+)["']/i
            const enclosureRegex = /<enclosure[^>]+url=["']([^"']+)["']/i
            const mMedia = mediaRegex.exec(itemXml)
            if (mMedia) return mMedia[1]
            const mEnc = enclosureRegex.exec(itemXml)
            if (mEnc) return mEnc[1]
            return null
        }

        const description = getTag('description')

        items.push({
            title: getTag('title'),
            link: getTag('link'),
            description: description,
            imageUrl: getMediaUrl() || extractImageUrl(description),
            pubDate: getTag('pubDate'),
            source: getTag('source'),
        })
    }

    return items
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const executionLogs: string[] = []
    try {
        const allItems: any[] = []

        // Fetch all RSS feeds based on year configuration
        for (const config of FEEDS_CONFIG) {
            try {
                const feedUrl = `https://news.google.com/rss/search?q=${config.q}&hl=id&gl=ID&ceid=ID:id`
                const response = await fetch(feedUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; Jobs Agent/1.0)',
                    },
                })

                if (!response.ok) {
                    executionLogs.push(`Failed to fetch RSS feed: ${feedUrl}`)
                    continue
                }

                const xml = await response.text()
                const items = parseRSSItems(xml)
                // Tag items with year
                items.forEach(item => { item.year = config.year })
                allItems.push(...items)
            } catch (feedError: any) {
                executionLogs.push(`Error fetching feed ${config.q}: ${feedError.message}`)
                continue
            }
        }

        // Map RSS items to our cpns_bumn_posts schema
        const postsData = allItems.map(item => ({
            caption: item.title || '',
            url: item.link || '',
            image_url: item.imageUrl || null,
            author: item.source || 'Google News',
            timestamp: item.pubDate ? new Date(item.pubDate) : new Date(),
            year: item.year || 2026
        })).filter(post => post.url && post.caption)

        // Deduplicate by URL
        const seen = new Set<string>()
        const uniquePosts = postsData.filter(post => {
            if (seen.has(post.url)) return false
            seen.add(post.url)
            return true
        }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

        executionLogs.push(`Found ${uniquePosts.length} unique articles across all feeds.`)

        if (uniquePosts.length === 0) {
            return new Response(JSON.stringify({ message: 'No news articles found.', logs: executionLogs }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Initialize Supabase client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
        if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not found')

        // 1. Generate embeddings for the captions
        const newest2026 = uniquePosts.filter(p => p.year === 2026).slice(0, 15)
        const newest2025 = uniquePosts.filter(p => p.year === 2025).slice(0, 15)
        const postsToProcess = [...newest2026, ...newest2025]

        executionLogs.push(`Preparing to deep process ${postsToProcess.length} core articles (15 from 2026, 15 from 2025).`)

        const postsWithEmbeddings = []
        for (const post of uniquePosts) {
            try {
                // To save costs/time, only embed those that are new or in our deep process list
                const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'text-embedding-3-small',
                        input: post.caption,
                    }),
                })

                if (embeddingResponse.ok) {
                    const embeddingData = await embeddingResponse.json()
                    postsWithEmbeddings.push({
                        ...post,
                        embedding: embeddingData.data[0].embedding,
                    })
                } else {
                    postsWithEmbeddings.push(post)
                }
            } catch (err) {
                postsWithEmbeddings.push(post)
            }
        }

        // 2. Upsert posts
        const { data: upsertData, error: upsertError } = await supabaseClient
            .from('cpns_bumn_posts')
            .upsert(postsWithEmbeddings, { onConflict: 'url' })
            .select()

        if (upsertError) throw upsertError

        // 3. Re-fetch the actual database records to be sure we have IDs
        const { data: finalPosts, error: fetchError } = await supabaseClient
            .from('cpns_bumn_posts')
            .select('id, url, caption')
            .in('url', postsToProcess.map(p => p.url))

        if (fetchError) throw fetchError

        executionLogs.push(`Database identified ${finalPosts?.length || 0} posts for chunking.`)

        let totalChunksSaved = 0
        for (const post of (finalPosts || [])) {
            // Find the original RSS item to get the description
            const originalItem = allItems.find(item => item.link === post.url)
            const rssDescription = originalItem ? cleanHtml(originalItem.description) : ''

            let contentToChunk = ''
            const fullContent = await fetchArticleContent(post.url)

            if (fullContent && fullContent.length > 300) {
                contentToChunk = fullContent
                executionLogs.push(`Full scrape success (${fullContent.length} chars) for: ${post.caption.substring(0, 30)}...`)
            } else if (rssDescription && rssDescription.length > 50) {
                contentToChunk = rssDescription
                executionLogs.push(`Using RSS fallback (${rssDescription.length} chars) for: ${post.caption.substring(0, 30)}...`)
            } else {
                // Fallback to caption if nothing else found
                contentToChunk = post.caption
                executionLogs.push(`No usable content found, using caption only for: ${post.caption.substring(0, 30)}...`)
            }

            const chunks = chunkText(contentToChunk)
            executionLogs.push(`Generated ${chunks.length} chunks for: ${post.caption.substring(0, 20)}...`)

            const chunksToInsert = []
            for (const chunk of chunks) {
                try {
                    const embeddingResp = await fetch('https://api.openai.com/v1/embeddings', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${OPENAI_API_KEY}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            model: 'text-embedding-3-small',
                            input: chunk,
                        }),
                    })

                    if (embeddingResp.ok) {
                        const embData = await embeddingResp.json()
                        chunksToInsert.push({
                            post_id: post.id,
                            content: chunk,
                            embedding: embData.data[0].embedding,
                        })
                    }
                } catch (e) {
                    console.error('Error embedding chunk:', e)
                }
            }

            if (chunksToInsert.length > 0) {
                await supabaseClient.from('news_content_chunks').delete().eq('post_id', post.id)
                const { error: chunkErr } = await supabaseClient.from('news_content_chunks').insert(chunksToInsert)
                if (chunkErr) {
                    executionLogs.push(`Error inserting chunks for ${post.id}: ${chunkErr.message}`)
                } else {
                    totalChunksSaved += chunksToInsert.length
                }
            }
        }

        return new Response(JSON.stringify({
            success: true,
            fetched_meta: uniquePosts.length,
            deep_processed_articles: finalPosts?.length || 0,
            total_chunks_indexed: totalChunksSaved,
            logs: executionLogs
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message, logs: executionLogs }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})


