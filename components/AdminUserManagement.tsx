import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Shield, ShieldAlert, Check } from 'lucide-react';

export const AdminUserManagement: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Fetch total cost per user
            const { data: costData } = await supabase
                .from('user_activity_logs')
                .select('user_id, cost_usd, provider');

            const openAiMap: Record<string, number> = {};
            const apifyMap: Record<string, number> = {};

            costData?.forEach(c => {
                if (c.user_id) {
                    if (c.provider === 'openai') {
                        openAiMap[c.user_id] = (openAiMap[c.user_id] || 0) + (Number(c.cost_usd) || 0);
                    } else if (c.provider === 'apify' || c.provider === 'zenrows') {
                        apifyMap[c.user_id] = (apifyMap[c.user_id] || 0) + (Number(c.cost_usd) || 0);
                    }
                }
            });

            const usersWithCost = (data || []).map(u => ({
                ...u,
                openAiCost: openAiMap[u.id] || 0,
                apifyCost: apifyMap[u.id] || 0
            }));

            setUsers(usersWithCost);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePlan = async (email: string, currentPlan: string, userId: string) => {
        setUpdating(email);
        const newPlan = currentPlan === 'pro' ? 'lite' : 'pro';
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ plan_type: newPlan })
                .eq('id', userId);

            if (!error) {
                setUsers(users.map(u => u.email === email ? { ...u, plan_type: newPlan } : u));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setUpdating(null);
        }
    };

    const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex sm:flex-row flex-col gap-4 sm:items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Users & Subscriptions</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search user by email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-64"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-medium">Email Address</th>
                            <th className="px-6 py-4 font-medium">Plan</th>
                            <th className="px-6 py-4 font-medium">OpenAI ($)</th>
                            <th className="px-6 py-4 font-medium">Apify ($)</th>
                            <th className="px-6 py-4 font-medium">Last Activity</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                                    <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded w-24 ml-auto"></div></td>
                                </tr>
                            ))
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">No users found</td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.email} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${user.plan_type === 'pro' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {user.plan_type === 'pro' ? 'Pro' : 'Lite'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-teal-600 font-mono font-medium">
                                            ${user.openAiCost.toFixed(4)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-rose-600 font-mono font-medium">
                                            ${user.apifyCost.toFixed(4)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleUpdatePlan(user.email, user.plan_type, user.id)}
                                            disabled={updating === user.email}
                                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${user.plan_type === 'pro'
                                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
                                                }`}
                                        >
                                            {updating === user.email ? (
                                                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                                            ) : user.plan_type === 'pro' ? (
                                                <><ShieldAlert size={14} /> Downgrade to Lite</>
                                            ) : (
                                                <><Shield size={14} /> Upgrade to Pro</>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
