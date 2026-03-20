import React from 'react';
import {
    CreditCard,
    Calendar,
    ArrowUpCircle,
    History,
    CheckCircle2,
    AlertCircle,
    Download,
    ExternalLink,
    Zap,
    ShieldCheck,
    Package
} from 'lucide-react';
import { UserProfile } from '../lib/openai';
import { supabase } from '../lib/supabase';
import { midtransService } from '../lib/midtransService';
import { RefreshCw } from 'lucide-react';
import { generateInvoicePDF } from '../lib/invoiceGenerator';

interface SubscriptionData {
    plan_type: 'lite' | 'pro';
    status: string;
    expiry_date: string;
    amount: number;
}

interface BillingItem {
    id: string;
    created_at: string;
    amount: number;
    status: string;
    merchant_order_id: string;
    plan_type?: string;
}

interface BillingViewProps {
    userProfile: UserProfile | null;
    onNavigate: (view: any) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ userProfile, onNavigate }) => {
    const [subscription, setSubscription] = React.useState<SubscriptionData | null>(null);
    const [billingHistory, setBillingHistory] = React.useState<BillingItem[]>([]);
    const [loading, setLoading] = React.useState(true);

    const plan = subscription?.plan_type || userProfile?.subscriptionPlan || 'free';
    const isPro = plan === 'pro';
    const isLite = plan === 'lite';

    const handleDownloadInvoice = (item: BillingItem) => {
        generateInvoicePDF({
            orderId: item.merchant_order_id,
            date: new Date(item.created_at).toLocaleDateString('id-ID'),
            amount: item.amount,
            planType: item.plan_type || 'PRO',
            userName: userProfile?.name || 'User',
            userEmail: userProfile?.email || ''
        });
    };

    const handleRefreshStatus = async (merchantOrderId: string) => {
        try {
            const statusData = await midtransService.checkStatus(merchantOrderId);

            // Midtrans success statuses: 'settlement' or 'capture' (for CC)
            const isSuccess = statusData.transaction_status === 'settlement' ||
                statusData.transaction_status === 'capture';

            if (isSuccess) {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // 1. Update billing history
                await supabase
                    .from('billing_history')
                    .update({ status: 'success' })
                    .eq('merchant_order_id', merchantOrderId);

                // 2. Fetch the plan type from the history to update subscription
                const { data: hist } = await supabase
                    .from('billing_history')
                    .select('plan_type, amount')
                    .eq('merchant_order_id', merchantOrderId)
                    .single();

                if (hist) {
                    const expiryDate = new Date();
                    expiryDate.setMonth(expiryDate.getMonth() + 1);

                    await supabase
                        .from('user_subscriptions')
                        .upsert({
                            user_id: user.id,
                            plan_type: hist.plan_type,
                            status: 'active',
                            expiry_date: expiryDate.toISOString(),
                            amount: hist.amount,
                            merchant_order_id: merchantOrderId
                        });
                }

                // Refresh the local state
                window.location.reload();
            } else {
                alert(`Status: ${statusData.transaction_status || 'Masih Pending'}`);
            }
        } catch (error) {
            console.error('Refresh status error:', error);
            alert('Gagal mengecek status. Coba lagi nanti.');
        }
    };

    React.useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch latest active subscription
            const { data: subData } = await supabase
                .from('user_subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (subData) setSubscription(subData);

            // Fetch billing history
            const { data: histData } = await supabase
                .from('billing_history')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (histData) setBillingHistory(histData);
            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up-3d perspective-2000 pb-10 max-w-5xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Billing & Langganan</h2>
                    <p className="text-slate-500 font-medium">Kelola paket langganan dan metode pembayaran Anda.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => onNavigate('pricing')}
                        className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <ArrowUpCircle size={18} /> Ganti Paket
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Current Plan Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl hover-tilt-3d group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                    <Package size={24} className="text-brand-300" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Paket Aktif</div>
                                    <div className="text-2xl font-black tracking-tight flex items-center gap-2">
                                        {isPro ? '👑 PRO Member' : isLite ? '⚡ LITE Member' : 'Free Plan'}
                                        <span className="text-[10px] bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2 py-0.5 rounded-full">Monthly</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                        <Calendar size={12} /> Renewal Date
                                    </div>
                                    <div className="text-lg font-bold">
                                        {subscription?.expiry_date
                                            ? new Date(subscription.expiry_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                            : userProfile?.subscriptionExpiry
                                                ? new Date(userProfile.subscriptionExpiry).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                                : '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                        <ShieldCheck size={12} /> Status
                                    </div>
                                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                        <CheckCircle2 size={16} /> Aktif
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-black">
                                        {isPro ? 'Rp 49.9k' : isLite ? 'Rp 29.9k' : 'Free'}
                                        <span className="text-sm font-medium text-slate-400 ml-1">/ bulan</span>
                                    </div>
                                </div>
                                <button className="text-xs font-bold text-white/60 hover:text-white transition-colors underline underline-offset-4 decoration-white/20">
                                    Batalkan Perpanjangan
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Usage Stats Toggle */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Zap size={20} className="text-brand-600" /> Penggunaan Fitur AI
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm font-bold mb-2">
                                    <span className="text-slate-600">AI Chat (Tanya AI News)</span>
                                    <span className="text-slate-900">{isPro ? 'Unlimited' : isLite ? '45/50' : '5/5'}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${isPro ? 'bg-emerald-500 w-full' : isLite ? 'bg-brand-500 w-[90%]' : 'bg-red-500 w-full'}`}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm font-bold mb-2">
                                    <span className="text-slate-600">ATS Scanning</span>
                                    <span className="text-slate-900">{isPro ? 'Unlimited' : isLite ? '12/20' : '1/1'}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${isPro ? 'bg-emerald-500 w-full' : isLite ? 'bg-brand-500 w-[60%]' : 'bg-red-500 w-full'}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Payment & History */}
                <div className="space-y-8">
                    {/* Payment Method */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Metode Pembayaran</h3>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
                                <CreditCard size={24} className="text-slate-600" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-slate-900">•••• 4242</div>
                                <div className="text-xs text-slate-500 font-medium">Expires 12/28</div>
                            </div>
                            <button className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-md border border-brand-100">Update</button>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
                            Tagihan Anda diproses secara aman melalui mitra pembayaran kami.
                        </p>
                    </div>

                    {/* Billing Email */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-900 mb-2">Email Tagihan</h4>
                        <p className="text-xs text-slate-500 mb-4">Invoice akan dikirimkan ke email ini setiap bulan.</p>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm font-medium text-slate-600">
                            {userProfile?.email || 'user@example.com'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoice History */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <History size={24} className="text-slate-400" /> Riwayat Transaksi
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">ID Pesanan</th>
                                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Tanggal</th>
                                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Total</th>
                                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Invoice</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {billingHistory.length > 0 ? billingHistory.map((inv) => (
                                <tr key={inv.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 text-sm font-bold text-slate-900">{inv.merchant_order_id}</td>
                                    <td className="py-4 text-sm font-medium text-slate-500">
                                        {new Date(inv.created_at).toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="py-4 text-sm font-bold text-slate-900">
                                        Rp {inv.amount.toLocaleString('id-ID')}
                                    </td>
                                    <td className="py-4">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${inv.status === 'success'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            {inv.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right flex items-center justify-end gap-2">
                                        {inv.status === 'pending' && (
                                            <button
                                                onClick={() => handleRefreshStatus(inv.merchant_order_id)}
                                                className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold"
                                                title="Cek Status Pembayaran"
                                            >
                                                <RefreshCw size={14} className="animate-spin-hover" /> Refresh
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDownloadInvoice(inv)}
                                            className="p-2 text-slate-400 hover:text-brand-600 transition-colors"
                                            title="Download Invoice"
                                        >
                                            <Download size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-slate-400 font-medium">
                                        Belum ada riwayat transaksi.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
