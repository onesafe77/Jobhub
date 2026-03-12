import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Users, Activity, CreditCard, Calendar, Crown, Zap, UserCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

type TimePeriod = 'day' | 'week' | 'month';

interface ActivityLog {
    cost_usd: number;
    feature_name: string;
    provider: string;
    created_at: string;
}

interface ProfileRecord {
    plan_type: string;
    created_at: string;
}

function getDateRange(period: TimePeriod): Date {
    const now = new Date();
    if (period === 'day') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (period === 'week') {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        return d;
    }
    // month
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    return d;
}

function getChartLabels(period: TimePeriod): string[] {
    const now = new Date();
    if (period === 'day') {
        // 24 hours, show every 4 hours
        return ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
    }
    if (period === 'week') {
        const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const labels: string[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            labels.push(days[d.getDay()]);
        }
        return labels;
    }
    // month - show 4 weeks
    const labels: string[] = [];
    for (let i = 3; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - (i * 7));
        labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
    }
    return labels;
}

function bucketData(logs: { created_at: string; value: number }[], period: TimePeriod): number[] {
    const now = new Date();

    if (period === 'day') {
        const buckets = new Array(7).fill(0); // 7 x 4-hour slots
        logs.forEach(l => {
            const d = new Date(l.created_at);
            if (d.toDateString() === now.toDateString()) {
                const slot = Math.min(6, Math.floor(d.getHours() / 4));
                buckets[slot] += l.value;
            }
        });
        return buckets;
    }

    if (period === 'week') {
        const buckets = new Array(7).fill(0); // 7 days
        logs.forEach(l => {
            const d = new Date(l.created_at);
            const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays < 7) {
                buckets[6 - diffDays] += l.value;
            }
        });
        return buckets;
    }

    // month - 4 weeks
    const buckets = new Array(4).fill(0);
    logs.forEach(l => {
        const d = new Date(l.created_at);
        const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 28) {
            const weekIndex = 3 - Math.floor(diffDays / 7);
            buckets[weekIndex] += l.value;
        }
    });
    return buckets;
}

export const AdminOverview: React.FC = () => {
    const [period, setPeriod] = useState<TimePeriod>('week');
    const [allProfiles, setAllProfiles] = useState<ProfileRecord[]>([]);
    const [allLogs, setAllLogs] = useState<ActivityLog[]>([]);
    const [jobsCount, setJobsCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [profileRes, logsRes, jobsRes] = await Promise.all([
                supabase.from('profiles').select('plan_type, created_at'),
                supabase.from('user_activity_logs').select('cost_usd, feature_name, provider, created_at'),
                supabase.from('jobs').select('*', { count: 'exact', head: true })
            ]);

            setAllProfiles(profileRes.data || []);
            setAllLogs(logsRes.data || []);
            setJobsCount(jobsRes.count || 0);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Filtered data based on selected period
    const filteredLogs = useMemo(() => {
        const cutoff = getDateRange(period);
        return allLogs.filter(l => new Date(l.created_at) >= cutoff);
    }, [allLogs, period]);

    const filteredProfiles = useMemo(() => {
        const cutoff = getDateRange(period);
        return allProfiles.filter(p => new Date(p.created_at) >= cutoff);
    }, [allProfiles, period]);

    // Stats computed from filtered data
    const stats = useMemo(() => {
        const openAiCost = filteredLogs.filter(l => l.provider === 'openai').reduce((s, l) => s + (Number(l.cost_usd) || 0), 0);
        const apifyCost = filteredLogs.filter(l => l.provider === 'apify' || l.provider === 'zenrows').reduce((s, l) => s + (Number(l.cost_usd) || 0), 0);
        const newUsersCount = filteredProfiles.length;
        const totalActions = filteredLogs.length;

        const proUsers = allProfiles.filter(p => p.plan_type === 'pro').length;
        const liteUsers = allProfiles.filter(p => p.plan_type === 'lite').length;
        const freeUsers = allProfiles.filter(p => !p.plan_type || (p.plan_type !== 'pro' && p.plan_type !== 'lite')).length;

        return { openAiCost, apifyCost, newUsersCount, totalActions, proUsers, liteUsers, freeUsers };
    }, [filteredLogs, filteredProfiles, allProfiles]);

    // Chart data
    const userGrowthChart = useMemo(() => {
        const data = allProfiles.map(p => ({ created_at: p.created_at, value: 1 }));
        return bucketData(data, period);
    }, [allProfiles, period]);

    const costTrendChart = useMemo(() => {
        const data = allLogs.map(l => ({ created_at: l.created_at, value: Number(l.cost_usd) || 0 }));
        return bucketData(data, period);
    }, [allLogs, period]);

    // Feature usage breakdown (filtered)
    const featureBreakdown = useMemo(() => {
        const map: Record<string, number> = {};
        filteredLogs.forEach(l => {
            map[l.feature_name] = (map[l.feature_name] || 0) + 1;
        });
        return Object.entries(map)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);
    }, [filteredLogs]);

    const chartLabels = getChartLabels(period);
    const maxUserGrowth = Math.max(...userGrowthChart, 1);
    const maxCostTrend = Math.max(...costTrendChart, 0.0001);

    if (loading) return <div className="animate-pulse flex gap-4"><div className="h-32 bg-slate-200 rounded-xl w-64"></div><div className="h-32 bg-slate-200 rounded-xl w-64"></div></div>;

    const periodLabel = period === 'day' ? 'Hari Ini' : period === 'week' ? '7 Hari Terakhir' : '30 Hari Terakhir';

    return (
        <div className="space-y-6">
            {/* Time Period Toggle */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2 text-slate-600">
                    <Calendar size={18} />
                    <span className="text-sm font-medium">Periode: <strong className="text-slate-800">{periodLabel}</strong></span>
                </div>
                <div className="inline-flex bg-slate-100 rounded-xl p-1">
                    {(['day', 'week', 'month'] as TimePeriod[]).map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${period === p
                                ? 'bg-white text-brand-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {p === 'day' ? 'Day' : p === 'week' ? 'Week' : 'Month'}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Total Users" value={allProfiles.length} subtitle="All time" icon={<Users size={20} />} color="text-blue-600" bg="bg-blue-50" />
                <StatCard title="New Users" value={`+${stats.newUsersCount}`} subtitle={periodLabel} icon={<TrendingUp size={20} />} color="text-green-600" bg="bg-green-50" />
                <StatCard title="OpenAI Cost" value={`$${stats.openAiCost.toFixed(4)}`} subtitle={periodLabel} icon={<Activity size={20} />} color="text-teal-600" bg="bg-teal-50" />
                <StatCard title="Apify Cost" value={`$${stats.apifyCost.toFixed(4)}`} subtitle={periodLabel} icon={<CreditCard size={20} />} color="text-rose-600" bg="bg-rose-50" />
                <StatCard title="Total Actions" value={stats.totalActions} subtitle={periodLabel} icon={<Activity size={20} />} color="text-purple-600" bg="bg-purple-50" />
            </div>

            {/* Plan Type KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Free Users" value={stats.freeUsers} subtitle="No plan" icon={<UserCheck size={20} />} color="text-slate-600" bg="bg-slate-100" />
                <StatCard title="Lite Users" value={stats.liteUsers} subtitle="Lite plan" icon={<Zap size={20} />} color="text-sky-600" bg="bg-sky-50" />
                <StatCard title="Pro Users" value={stats.proUsers} subtitle="Pro plan" icon={<Crown size={20} />} color="text-amber-600" bg="bg-amber-50" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">User Growth</h3>
                    <p className="text-xs text-slate-500 mb-6">Registrasi user baru ({periodLabel})</p>
                    <div className="h-52 flex items-end gap-2">
                        {userGrowthChart.map((val, i) => (
                            <div key={i} className="flex-1 relative group">
                                <div
                                    className="bg-gradient-to-t from-blue-400 to-blue-200 rounded-t-lg transition-all hover:from-blue-500 hover:to-blue-300"
                                    style={{ height: `${Math.max(4, (val / maxUserGrowth) * 100)}%` }}
                                >
                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {val} user
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-3 text-xs text-slate-500 font-medium">
                        {chartLabels.map((l, i) => <span key={i}>{l}</span>)}
                    </div>
                </div>

                {/* Cost Trend Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Cost Trend</h3>
                    <p className="text-xs text-slate-500 mb-6">Total biaya operasional ({periodLabel})</p>
                    <div className="h-52 flex items-end gap-2">
                        {costTrendChart.map((val, i) => (
                            <div key={i} className="flex-1 relative group">
                                <div
                                    className="bg-gradient-to-t from-rose-400 to-amber-200 rounded-t-lg transition-all hover:from-rose-500 hover:to-amber-300"
                                    style={{ height: `${Math.max(4, (val / maxCostTrend) * 100)}%` }}
                                >
                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        ${val.toFixed(4)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-3 text-xs text-slate-500 font-medium">
                        {chartLabels.map((l, i) => <span key={i}>{l}</span>)}
                    </div>
                </div>
            </div>

            {/* Feature Usage + Cost Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Feature Popularity */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Fitur Paling Sering Digunakan</h3>
                    <p className="text-xs text-slate-500 mb-6">Ranking penggunaan fitur ({periodLabel})</p>
                    <div className="space-y-4">
                        {featureBreakdown.length > 0 ? featureBreakdown.map((f, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1.5 font-medium">
                                    <span className="text-slate-700">{f.name}</span>
                                    <span className="text-slate-500">{f.count}x</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                                        style={{ width: `${Math.min(100, (f.count / (featureBreakdown[0]?.count || 1)) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-500 text-sm italic">Belum ada data penggunaan untuk periode ini.</p>
                        )}
                    </div>
                </div>

                {/* Cost Breakdown by Provider */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Cost Breakdown</h3>
                    <p className="text-xs text-slate-500 mb-6">Perbandingan biaya per layanan ({periodLabel})</p>
                    <div className="space-y-6">
                        <CostBar label="OpenAI (AI)" cost={stats.openAiCost} total={stats.openAiCost + stats.apifyCost} color="bg-teal-500" />
                        <CostBar label="Apify (Scraper)" cost={stats.apifyCost} total={stats.openAiCost + stats.apifyCost} color="bg-rose-400" />
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-sm text-slate-600 font-medium">Total Biaya Periode Ini</span>
                        <span className="text-lg font-bold text-slate-800">${(stats.openAiCost + stats.apifyCost).toFixed(4)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CostBar = ({ label, cost, total, color }: { label: string; cost: number; total: number; color: string }) => (
    <div>
        <div className="flex justify-between text-sm mb-2 font-medium">
            <span className="text-slate-600">{label}</span>
            <span className="text-slate-800 font-mono">${cost.toFixed(4)}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
            <div className={`h-3 rounded-full ${color} transition-all`} style={{ width: `${total > 0 ? Math.max(2, (cost / total) * 100) : 0}%` }}></div>
        </div>
    </div>
);

const StatCard = ({ title, value, subtitle, icon, color, bg }: any) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg} ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs font-medium text-slate-500">{title}</p>
            <h4 className="text-xl font-bold text-slate-800">{value}</h4>
            {subtitle && <p className="text-[10px] text-slate-400">{subtitle}</p>}
        </div>
    </div>
);
