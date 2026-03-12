import { logUserActivity, calculateApifyCost } from './logger';

interface ScrapedJob {
    title: string;
    company: string;
    location: string;
    salary?: string;
    description: string;
    source: string;
    timeAgo?: string;
    logo?: string;
    tags?: string[];
}

export interface InstagramPost {
    id: string;
    caption: string;
    url: string;
    imageUrl: string;
    author: string;
    timestamp: string;
}

// Daftar domain yang sudah punya Actor matang di Apify
const APIFY_SUPPORTED_DOMAINS = [
    'linkedin.com',
    'indeed.com',
    'glassdoor.com',
    'jobstreet.co.id'
];

export const scraperService = {
    /**
     * Fungsi Utama untuk Scraping
     */
    async scrapeJob(targetUrl: string): Promise<ScrapedJob[]> {
        const domain = new URL(targetUrl).hostname.replace('www.', '');

        // 1. Prioritas Utama: ZENROWS (jika key tersedia)
        // ZenRows lebih kuat untuk bypass anti-bot LinkedIn
        const ZENROWS_API_KEY = import.meta.env.VITE_ZENROWS_API_KEY;

        if (domain.includes('linkedin.com') && ZENROWS_API_KEY) {
            console.log("[Scraper] Mencoba ZenRows sebagai prioritas...");
            try {
                const results = await this.scrapeWithZenRows(targetUrl);
                if (results.length > 0) return results;
            } catch (error) {
                console.warn("[Scraper] ZenRows gagal, mencoba fallback ke Apify...", error);
            }
        }

        // 2. Fallback / Standard: APIFY
        if (domain.includes('linkedin.com')) {
            try {
                return await this.scrapeWithApify(targetUrl);
            } catch (error) {
                console.error(`Scraping failed for ${domain} with Apify:`, error);
                // If Apify also fails, return a mock error object
                return [{
                    title: `Error Scraping URL`,
                    company: "Gagal Mengambil Data",
                    location: "Cek Koneksi / API Key",
                    salary: "N/A",
                    description: `Gagal mengambil data dari ${domain}. Pastikan API Key benar dan tidak ada blokir CORS.`,
                    source: "System",
                    timeAgo: "N/A",
                    logo: "!",
                    tags: ["Error"]
                }];
            }
        } else {
            // Untuk situs lain, coba ZenRows lagi jika belum dicoba (atau jika Apify tidak support)
            try {
                return await this.scrapeWithZenRows(targetUrl);
            } catch (error) {
                console.error(`Scraping failed for ${domain}:`, error);
                // Return mock error object agar UI memberikan feedback visual
                return [{
                    title: `Error Scraping URL`,
                    company: "Gagal Mengambil Data",
                    location: "Cek Koneksi / API Key",
                    salary: "N/A",
                    description: `Gagal mengambil data dari ${domain}. Pastikan API Key benar dan tidak ada blokir CORS.`,
                    source: "System",
                    timeAgo: "N/A",
                    logo: "!",
                    tags: ["Error"]
                }];
            }
        }
    },

    /**
     * 1. SCRAPE MENGGUNAKAN APIFY (curious_coder/LinkedIn-Jobs-Scraper)
     * Pay-per-result: $1.00 / 1,000 results. Rating 4.9 (50 reviews).
     * Input: LinkedIn search URLs langsung.
     */
    async scrapeWithApify(url: string): Promise<ScrapedJob[]> {
        const APIFY_TOKEN = import.meta.env.VITE_APIFY_TOKEN;
        const urlObj = new URL(url);
        const query = urlObj.searchParams.get('keywords') || 'Job';
        const location = urlObj.searchParams.get('location') || 'Indonesia';

        console.log(`[Apify] Menjalankan curious_coder/LinkedIn-Jobs-Scraper untuk: "${query}" di "${location}"`);
        if (!APIFY_TOKEN) {
            throw new Error('Apify Token is missing in .env.local');
        }

        try {
            // Bangun URL pencarian LinkedIn yang benar
            const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&position=1&pageNum=0`;

            const response = await fetch(`https://api.apify.com/v2/acts/curious_coder~linkedin-jobs-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    urls: [searchUrl],
                    rows: 25,
                    scrapeCompanyDetails: false
                })
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Apify API Error: ${response.status} - ${errorBody}`);
            }

            const items = await response.json();

            if (!Array.isArray(items)) {
                console.warn("[Apify] API tidak mengembalikan array. Respons:", items);
                if (items.error) throw new Error(`Apify Error: ${items.error.message || JSON.stringify(items.error)}`);
                throw new Error('Respons Apify bukan merupakan daftar lowongan.');
            }

            console.log(`[Apify] Data berhasil diterima: ${items.length} items`);

            // Log activity
            logUserActivity({
                featureName: 'LinkedIn Job Scraping',
                provider: 'apify',
                costUsd: calculateApifyCost('linkedin-jobs-scraper', items.length),
                metadata: { query, location, resultsCount: items.length }
            });

            if (items.length === 0) return [];

            const jobs = items.map((item: any) => ({
                title: item.title || query,
                company: item.companyName || "Perusahaan Terkait",
                location: item.location || location,
                salary: item.salary || "Negosiasi",
                description: (item.descriptionText || item.descriptionHtml || "Klik detail untuk melihat deskripsi lengkap.").substring(0, 2000),
                source: "LinkedIn",
                timeAgo: item.postedAt || "Baru saja",
                logo: (item.companyName || "P")[0].toUpperCase(),
                tags: item.employmentType ? [item.employmentType] : (item.contractType ? [item.contractType] : ["Full-time"]),
                url: item.link || item.applyUrl || "",
                logoUrl: item.companyLogo || "",
                applyUrl: item.applyUrl || item.link || ""
            }));

            // Sync to Supabase in background
            this.syncJobsToSupabase(jobs).catch(err => console.error("[Sync] Gagal menyimpan ke DB:", err));

            return jobs;
        } catch (error: any) {
            console.warn("[Apify] Failed:", error.message);
            throw error;
        }
    },

    /**
     * 2. SCRAPE MENGGUNAKAN ZENROWS (FALLBACK / CUSTOM)
     * Cocok untuk situs lokal atau yang tidak ada di Apify.
     */
    async scrapeWithZenRows(url: string): Promise<ScrapedJob[]> {
        const ZENROWS_API_KEY = import.meta.env.VITE_ZENROWS_API_KEY;
        console.log(`[ZenRows] Bypass anti-bot & mengambil HTML (Autoparse) untuk: ${url}`);

        if (!ZENROWS_API_KEY) {
            throw new Error('ZenRows API Key is missing in .env.local');
        }

        const zenrowsUrl = `https://api.zenrows.com/v1/?key=${ZENROWS_API_KEY}&url=${encodeURIComponent(url)}&premium_proxy=true&antibot=true&autoparse=true`;

        const response = await fetch(zenrowsUrl);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`ZenRows API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("[ZenRows] Data received:", data);

        // Log activity
        logUserActivity({
            featureName: 'Custom Web Scraping (ZenRows)',
            provider: 'zenrows',
            costUsd: 0.002, // Fixed cost per request
            metadata: { url }
        });

        // Handle jika data adalah array (misal hasil search page)
        let items = [];
        if (Array.isArray(data)) {
            items = data;
        } else if (data.items && Array.isArray(data.items)) {
            items = data.items;
        } else {
            items = [data]; // Single object convert to array
        }

        return items.map((item: any) => {
            const title = item.title || item.jobTitle || item.position || "Job Title Not Found";
            const company = item.company || item.employer || "Company Not Found";

            return {
                title: title,
                company: company,
                location: item.location || "Indonesia",
                salary: item.salary || "Negosiasi",
                description: item.description || item.jobDescription || "Deskripsi pekerjaan tersedia.",
                source: "ZenRows (Autoparse)",
                timeAgo: item.datePosted || "Baru saja",
                logo: (typeof company === 'string' ? company[0] : "Z").toUpperCase(),
                tags: ["Full-time"]
            };
        });
    },

    /**
     * 3. SCRAPE INSTAGRAM POSTS VIA APIFY
     */
    async scrapeInstagramPosts(usernames: string[]): Promise<InstagramPost[]> {
        const APIFY_TOKEN = import.meta.env.VITE_APIFY_TOKEN;

        if (!APIFY_TOKEN) {
            throw new Error('Apify Token is missing. Please set VITE_APIFY_TOKEN.');
        }

        console.log(`[Apify] Menjalankan Instagram Scraper untuk: ${usernames.join(', ')}`);

        try {
            const response = await fetch(`https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    search: usernames.join(', '),
                    searchType: "hashtag",
                    resultsType: "posts",
                    resultsLimit: 10
                })
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Apify IG API Error: ${response.status} - ${errorBody}`);
            }

            const items = await response.json();
            console.log(`[Apify] IG Data berhasil diterima: ${items.length} items`);

            // Log activity
            logUserActivity({
                featureName: 'Instagram Scraping',
                provider: 'apify',
                costUsd: calculateApifyCost('instagram-scraper', items.length),
                metadata: { usernames, resultsCount: items.length }
            });

            return items.map((item: any) => ({
                id: item.id || Math.random().toString(),
                caption: item.caption || "",
                url: item.url || "",
                imageUrl: item.displayUrl || item.imageUrl || "",
                author: item.ownerUsername || item.ownerFullName || "Instagram User",
                timestamp: item.timestamp || new Date().toISOString()
            }));
        } catch (error: any) {
            console.warn("[Apify] IG Scraping Failed:", error.message);
            throw error;
        }
    },

    /**
     * SYNC JOBS TO SUPABASE
     */
    async syncJobsToSupabase(jobs: any[]) {
        const { supabase } = await import('./supabase');
        const jobsToInsert = jobs.map(job => ({
            title: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary,
            description: job.description,
            url: job.url || `https://linkedin.com/search?keywords=${encodeURIComponent(job.title)}`,
            apply_url: job.applyUrl || job.url || '',
            logo_url: job.logoUrl || '',
            source: job.source || 'LinkedIn',
            job_type: job.tags ? job.tags[0] : 'Full-time',
            posted_at: job.timeAgo && job.timeAgo.match(/^\d{4}-\d{2}-\d{2}/) ? job.timeAgo : new Date().toISOString()
        }));

        const { error } = await supabase.from('jobs').upsert(jobsToInsert, { onConflict: 'url' });
        if (error) console.error("[Supabase Sync Error]", error);
        else console.log(`[Supabase Sync] Sync success: ${jobsToInsert.length} jobs.`);
    }
};
