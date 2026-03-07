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
        const { query } = await req.json()

        if (!query) {
            return new Response(JSON.stringify({ error: 'Query is required' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
        if (!OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is not set')
        }

        // 1. Generate embedding for the query
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'text-embedding-3-small',
                input: query,
            }),
        })

        if (!embeddingResponse.ok) {
            const err = await embeddingResponse.text()
            throw new Error(`OpenAI embedding error: ${err}`)
        }

        const embeddingData = await embeddingResponse.json()
        const queryEmbedding = embeddingData.data[0].embedding

        // 2. Search for relevant article chunks in Supabase
        const { data: chunks, error: matchError } = await supabaseClient.rpc('match_news_chunks', {
            query_embedding: queryEmbedding,
            match_threshold: 0.3, // Optimized threshold for better relevance
            match_count: 15,      // Increased to gather more specific details
        })

        if (matchError) {
            console.error('Match error:', matchError)
            throw matchError
        }

        console.log(`Found ${chunks?.length || 0} relevant chunks for query: "${query}"`)

        // 3. Construct the prompt with numbered sources, content, and YEAR
        const contextText = chunks && chunks.length > 0
            ? chunks.map((chunk: any, idx: number) => `SOURCE [${idx + 1}]:
Year: ${chunk.year}
Author: ${chunk.author}
Title: ${chunk.caption}
URL: ${chunk.url}
CONTENT SEGMENT: ${chunk.content}`).join('\n\n')
            : 'Sangat sedikit informasi spesifik ditemukan dalam database untuk kueri ini.'

        const prompt = `
Anda adalah asisten AI Jobs Agent berkelas dunia yang ahli dalam informasi CPNS dan BUMN di Indonesia.
Tugas utama Anda adalah menjawab pertanyaan pengguna secara SANGAT RINCI dan AKURAT hanya berdasarkan KONTEKS BERITA yang disediakan.

ATURAN KETAT:
1. JAWABAN BERBASIS DATA: Anda harus mengekstrak informasi spesifik (tanggal, syarat, dokumen, link) yang ada di berita. Jangan memberikan jawaban umum jika ada informasi spesifik di konteks.
2. METODE KOMPARATIF: Jika terdapat data Tahun 2025 dan 2026, Anda WAJIB membandingkannya (misalnya: "Berbeda dengan tahun 2025 [^1], pada tahun 2026... [^2]").
3. SITASI WAJIB: Gunakan sitasi [^N] tepat setelah setiap klaim atau informasi yang diambil dari SOURCE [N].
4. JANGAN BERHALUSINASI: Jika informasi tidak ada di konteks, katakan bahwa informasi tersebut belum tersedia di database berita kami saat ini.
5. FORMATTING: Gunakan bullet points untuk list agar mudah dibaca.

KONTEKS BERITA:
${contextText}

PERTANYAAN PENGGUNA: 
${query}

JAWABAN (Sangat rinci, komparatif, dengan sitasi [^N]):
`

        // 4. Get response from OpenAI
        const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'Anda adalah asisten Jobs Agent yang membantu menjawab pertanyaan seputar CPNS dan BUMN berdasarkan berita terbaru.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
            }),
        })

        if (!chatResponse.ok) {
            const err = await chatResponse.text()
            throw new Error(`OpenAI completion error: ${err}`)
        }

        const chatData = await chatResponse.json()
        const answer = chatData.choices[0].message.content

        return new Response(JSON.stringify({
            answer,
            context: chunks?.map((d: any) => ({ author: d.author, title: d.caption, url: d.url }))
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error('Chat function error:', error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
