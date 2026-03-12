import { supabase } from './supabase';

export type ActivityProvider = 'openai' | 'apify' | 'zenrows' | 'system';

export interface ActivityLog {
    userId?: string;
    featureName: string;
    provider: ActivityProvider;
    tokensUsed?: number;
    costUsd: number;
    metadata?: any;
}

/**
 * Logs user activity and costs to Supabase.
 */
export async function logUserActivity(log: ActivityLog) {
    try {
        // If no userId is provided, try to get it from the current session
        let userId = log.userId;
        if (!userId) {
            const { data: { session } } = await supabase.auth.getSession();
            userId = session?.user?.id;
        }

        const { error } = await supabase.from('user_activity_logs').insert([{
            user_id: userId,
            feature_name: log.featureName,
            provider: log.provider,
            tokens_used: log.tokensUsed || 0,
            cost_usd: log.costUsd,
            metadata: log.metadata || {}
        }]);

        if (error) {
            console.error('[Logger] Error inserting log:', error);
        }
    } catch (err) {
        console.error('[Logger] Failed to log activity:', err);
    }
}

/**
 * Helper to calculate OpenAI costs based on model type.
 * Prices per 1k tokens (Input + Output average for simplicity).
 */
export function calculateOpenAICost(model: string, tokens: number): number {
    // Prices as of March 2024
    const rates: Record<string, number> = {
        'gpt-4o-mini': 0.00015 / 1000, // $0.15 per 1M tokens approx
        'gpt-4o': 0.005 / 1000,       // $5 per 1M tokens
        'gpt-3.5-turbo': 0.001 / 1000,
    };

    const rate = rates[model] || rates['gpt-4o-mini'];
    return tokens * rate;
}

/**
 * Helper to calculate Apify costs.
 */
export function calculateApifyCost(actor: string, resultCount: number): number {
    if (actor.includes('linkedin-jobs-scraper')) {
        return resultCount * 0.001; // $1.00 per 1k results
    }
    if (actor.includes('instagram-scraper')) {
        return resultCount * 0.005; // Heuristic
    }
    return 0;
}
