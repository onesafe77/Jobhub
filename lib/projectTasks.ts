import { supabase } from './supabase';

export interface ProjectTask {
    id: string;
    user_id: string;
    title: string;
    company: string;
    status: 'Plan' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';
    task_date: string | null;
    url: string | null;
    notes: string | null;
    created_at: string;
}

export type NewProjectTask = Omit<ProjectTask, 'id' | 'user_id' | 'created_at'>;

export const projectTasksService = {
    /**
     * Fetch all tasks for the current authenticated user
     */
    async getTasks(): Promise<ProjectTask[]> {
        const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Request timeout")), 8000)
        );

        try {
            const taskPromise = (async () => {
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
                if (sessionError || !sessionData.session) {
                    console.warn("User not authenticated", sessionError);
                    return [];
                }

                const { data, error } = await supabase
                    .from('project_tasks')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching project tasks:', error);
                    throw error;
                }

                return data as ProjectTask[];
            })();

            return await Promise.race([taskPromise, timeout]);
        } catch (err) {
            console.error("[ProjectTasks] getTasks failed or timed out:", err);
            return []; // Fallback empty
        }
    },

    /**
     * Create a new task
     */
    async createTask(task: NewProjectTask): Promise<ProjectTask> {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
            throw new Error("User must be logged in to create a task");
        }

        const { data, error } = await supabase
            .from('project_tasks')
            .insert([
                {
                    user_id: sessionData.session.user.id,
                    ...task
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating project task:', error);
            throw error;
        }

        return data as ProjectTask;
    },

    /**
     * Update a task's status
     */
    async updateTaskStatus(taskId: string, newStatus: ProjectTask['status']): Promise<ProjectTask> {
        const { data, error } = await supabase
            .from('project_tasks')
            .update({ status: newStatus })
            .eq('id', taskId)
            .select()
            .single();

        if (error) {
            console.error('Error updating task status:', error);
            throw error;
        }

        return data as ProjectTask;
    },

    /**
     * Update a task's full details
     */
    async updateTask(taskId: string, updates: Partial<NewProjectTask>): Promise<ProjectTask> {
        const { data, error } = await supabase
            .from('project_tasks')
            .update(updates)
            .eq('id', taskId)
            .select()
            .single();

        if (error) {
            console.error('Error updating task:', error);
            throw error;
        }

        return data as ProjectTask;
    },

    /**
     * Delete a task
     */
    async deleteTask(taskId: string): Promise<void> {
        const { error } = await supabase
            .from('project_tasks')
            .delete()
            .eq('id', taskId);

        if (error) {
            console.error('Error deleting project task:', error);
            throw error;
        }
    }
};
