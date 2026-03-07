import { supabase } from './supabase';

export interface FavoriteJob {
    id: string;
    user_id: string;
    title: string;
    company: string;
    url: string | null;
    location: string | null;
    salary: string | null;
    type: string | null;
    created_at: string;
}

export type NewFavoriteJob = Omit<FavoriteJob, 'id' | 'user_id' | 'created_at'>;

export const favoriteJobsService = {
    async getFavorites(): Promise<FavoriteJob[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from('favorite_jobs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async addFavorite(job: NewFavoriteJob): Promise<FavoriteJob> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from('favorite_jobs')
            .insert([
                {
                    title: job.title,
                    company: job.company,
                    url: job.url || null,
                    location: job.location || null,
                    salary: job.salary || null,
                    type: job.type || null,
                    user_id: user.id
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Supabase insert error:", error);
            throw error;
        }
        return data;
    },

    async removeFavorite(id: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { error } = await supabase
            .from('favorite_jobs')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;
    }
};
