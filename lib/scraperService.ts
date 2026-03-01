/**
 * SCRAPER ROUTER SERVICE (Boilerplate)
 * Kombinasi Apify (Marketplace) + ZenRows (Custom Fallback)
 */

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
        const ZENROWS_API_KEY = (import.meta as any).env.VITE_ZENROWS_API_KEY;

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
     * 1. SCRAPE MENGGUNAKAN APIFY (MARKETPLACE ACTORS)
     * Cocok untuk situs besar yang sudah ada "Actor"-nya.
     */
    async scrapeWithApify(url: string): Promise<ScrapedJob[]> {
        const APIFY_TOKEN = (import.meta as any).env.VITE_APIFY_TOKEN;
        const urlObj = new URL(url);
        const query = urlObj.searchParams.get('keywords') || 'HSE';

        console.log(`[Apify] Menjalankan Actor Marketplace untuk: ${query}`);
        if (!APIFY_TOKEN) {
            throw new Error('Apify Token is missing in .env.local');
        }

        try {
            // Menggunakan Actor Resmi LinkedIn Jobs Scraper yang lebih stabil
            console.log(`[Apify] Menjalankan Official Scraper untuk: "${query}"...`);

            const response = await fetch(`https://api.apify.com/v2/acts/apify~linkedin-jobs-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    queries: [query], // LinkedIn Official Scraper butuh array
                    location: "Indonesia",
                    count: 5,         // Official Scraper pakai 'count' atau 'maxItems'
                    maxItems: 5
                })
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Apify API Error: ${response.status} - ${errorBody}`);
            }

            const items = await response.json();
            console.log(`[Apify] Data berhasil diterima: ${items.length} items`);

            if (!items || items.length === 0) throw new Error('No items found');

            return items.map((item: any) => ({
                title: item.positionName || item.title || query,
                company: item.companyName || item.company || "Perusahaan Terkait",
                location: item.location || "Indonesia",
                salary: item.salary || "Negosiasi",
                description: item.description || item.jobDescription || "Klik detail untuk melihat deskripsi lengkap.",
                source: "LinkedIn (Apify)",
                timeAgo: item.postedAt || "Baru saja",
                logo: (item.companyName || "P")[0].toUpperCase(),
                tags: item.jobType ? [item.jobType] : ["Full-time"]
            }));
        } catch (error: any) {
            console.warn("[Apify] Failed:", error.message);
            throw error; // Lempar error agar bisa ditangkap oleh caller
        }
    },

    /**
     * 2. SCRAPE MENGGUNAKAN ZENROWS (FALLBACK / CUSTOM)
     * Cocok untuk situs lokal atau yang tidak ada di Apify.
     */
    async scrapeWithZenRows(url: string): Promise<ScrapedJob[]> {
        const ZENROWS_API_KEY = (import.meta as any).env.VITE_ZENROWS_API_KEY;
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
    }
};
