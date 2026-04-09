import React, { useState } from 'react';
import { Check, X, Sparkles, Loader2 } from 'lucide-react';
import { midtransService } from '../lib/midtransService';
import { loadProfile, saveProfile } from '../lib/openai';
import { supabase } from '../lib/supabase';

export const Pricing: React.FC<{ onSelectPlan?: (plan: 'free' | 'lite' | 'pro') => void }> = ({ onSelectPlan }) => {
    const [loading, setLoading] = useState<string | null>(null);

    const handlePlanSelection = async (plan: 'free' | 'lite' | 'pro', amount: number) => {
        if (plan === 'free') {
            onSelectPlan && onSelectPlan('free');
            return;
        }

        setLoading(plan);
        const profile = loadProfile();
        const orderId = `JA-${Date.now()}`;

        try {
            // 1. Load Snap Script
            await midtransService.loadSnapScript();

            // 2. Create Transaction / Get Token
            const response = await midtransService.createSnapToken({
                orderId: orderId,
                grossAmount: amount,
                firstName: profile?.name?.split(' ')[0] || 'User',
                lastName: profile?.name?.split(' ').slice(1).join(' ') || '',
                email: profile?.email || 'user@example.com',
                phone: '08123456789' // Mock
            });

            // 3. Save pending transaction to billing_history
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('billing_history').insert({
                    user_id: user.id,
                    merchant_order_id: orderId,
                    amount: amount,
                    status: 'pending',
                    plan_type: plan
                });
            }

            // 4. Open Midtrans Snap Popup
            const snap = (window as any).snap;
            if (snap) {
                snap.pay(response.token, {
                    onSuccess: async function (result: any) {
                        console.log('[Midtrans] Success:', result);

                        // Calculate expiry date (1 month from now)
                        const expiryDate = new Date();
                        expiryDate.setMonth(expiryDate.getMonth() + 1);
                        const expiryIso = expiryDate.toISOString();

                        // Update User Plan in Supabase & LocalStorage
                        const { data: { user } } = await supabase.auth.getUser();
                        if (user) {
                            // 1. Update Supabase profiles
                            await supabase.from('profiles').update({
                                subscriptionPlan: plan,
                                subscriptionExpiry: expiryIso
                            }).eq('id', user.id);

                            // 2. Also update user_subscriptions table for BillingView
                            await supabase.from('user_subscriptions').upsert({
                                user_id: user.id,
                                plan_type: plan,
                                status: 'active',
                                expiry_date: expiryIso,
                                amount: amount,
                                merchant_order_id: orderId
                            });

                            // 3. Update billing_history status to success
                            await supabase.from('billing_history')
                                .update({ status: 'success' })
                                .eq('merchant_order_id', orderId);

                            // 4. Update LocalStorage
                            const currentProfile = loadProfile();
                            if (currentProfile) {
                                saveProfile({
                                    ...currentProfile,
                                    subscriptionPlan: plan,
                                    subscriptionExpiry: expiryIso
                                });
                            }
                        }

                        window.location.href = '/dashboard?payment=success';
                    },
                    onPending: function (result: any) {
                        console.log('[Midtrans] Pending:', result);
                        window.location.href = '/dashboard?payment=pending';
                    },
                    onClose: function () {
                        setLoading(null);
                    }
                });
            } else {
                throw new Error('Midtrans Snap failed to load.');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Gagal memproses pembayaran. Silakan coba lagi.';
            alert(errorMessage);
            setLoading(null);
        }
    };

    return (
        <section className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden" id="harga">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-50/50 rounded-full blur-3xl pointer-events-none opacity-50"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-4xl lg:text-[52px] font-bold text-slate-900 mb-6 leading-tight">
                        Pilih Paket yang Sesuai
                    </h2>
                    <p className="text-lg lg:text-xl text-slate-600 mb-8">
                        Mulai gratis, upgrade kapanpun
                    </p>

                    {/* Penawaran Harga Badge */}
                    <div className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-50 text-brand-700 rounded-full text-sm font-bold border border-brand-200 shadow-sm mb-8">
                        ✨ Penawaran Harga / Pricing
                    </div>
                </div>

                {/* Pricing Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1120px] mx-auto items-start">

                    {/* Free Card */}
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300">
                        <div className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-4">Free Trial</div>
                        <div className="flex items-baseline mb-2">
                            <span className="text-[48px] font-bold text-slate-900 font-mono tracking-tight">Rp 0</span>
                            <span className="text-slate-500 ml-2">/4 hari</span>
                        </div>
                        <p className="text-slate-600 mb-8 min-h-[48px] flex items-center">Untuk cek skor CV kamu saja</p>

                        <div className="space-y-4 mb-8">
                            {[
                                { text: 'Pelacakan Lamaran (My Jobs)', included: true },
                                { text: '5x Cari Lowongan AI / hari', included: true },
                                { text: '1x Scan Skor ATS CV', included: true },
                                { text: '1x Intip Kritik AI HR', included: true },
                                { text: 'Auto-Fix Masalah CV', included: false },
                                { text: 'AI Cover Letter Generator', included: false },
                                { text: 'Chat Asisten Karir (Tanya AI)', included: false },
                                { text: 'Info & Loker BUMN/CPNS', included: false },
                            ].map((feature, i) => (
                                <div key={i} className={`flex items-center gap-3 text-sm ${feature.included ? 'text-slate-700 font-medium' : 'text-slate-400 line-through'}`}>
                                    {feature.included ? (
                                        <Check size={18} className="text-green-500 flex-shrink-0" />
                                    ) : (
                                        <X size={18} className="text-slate-300 flex-shrink-0" />
                                    )}
                                    {feature.text}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => handlePlanSelection('free', 0)}
                            className="w-full py-3 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                        >
                            Mulai Trial
                        </button>
                    </div>

                    {/* Lite Card (Featured) */}
                    <div className="bg-white rounded-2xl p-8 border-2 border-brand-500 shadow-xl relative transform md:-translate-y-4 md:scale-105 z-10">
                        <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-1/2">
                            <span className="bg-brand-600 text-white px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-sm flex items-center gap-1">
                                <Sparkles size={10} fill="currentColor" /> Paket Hemat
                            </span>
                        </div>

                        <div className="text-[13px] font-bold text-brand-600 uppercase tracking-wider mb-4">Lite</div>
                        <div className="flex items-baseline mb-2">
                            <span className="text-[48px] font-bold text-brand-600 font-mono tracking-tight">29.9k</span>
                            <span className="text-slate-500 ml-2">/bulan</span>
                        </div>
                        <p className="text-slate-600 mb-8 min-h-[48px] flex items-center">Cocok untuk fresh graduates pemula</p>

                        <div className="space-y-4 mb-8">
                            {[
                                { text: 'Unlimited Cari Lowongan AI', included: true },
                                { text: 'Tracker Lamaran (My Jobs) PRO', included: true },
                                { text: '5x Scan ATS & Auto-Fix CV', included: true },
                                { text: '5x Generate AI Cover Letter', included: true },
                                { text: 'Simpan s.d 25 Lowongan', included: true },
                                { text: 'Download CV Word ATS', included: false },
                                { text: 'Perbaiki KESELURUHAN CV', included: false },
                                { text: 'Chat Asisten Karir (Tanya AI)', included: false },
                                { text: 'Info & Loker BUMN/CPNS', included: false },
                                { text: 'Akses Salary Checker AI', included: true },
                            ].map((feature, i) => (
                                <div key={i} className={`flex items-center gap-3 text-sm ${feature.included ? 'text-slate-700 font-medium' : 'text-slate-400 line-through'}`}>
                                    {feature.included ? (
                                        <Check size={18} className="text-brand-500 flex-shrink-0" strokeWidth={3} />
                                    ) : (
                                        <X size={18} className="text-slate-300 flex-shrink-0" />
                                    )}
                                    {feature.text}
                                </div>
                            ))}
                        </div>

                        <button
                            disabled={loading !== null}
                            onClick={() => handlePlanSelection('lite', 29900)}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-400 text-white font-bold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            {loading === 'lite' ? <Loader2 className="animate-spin" size={20} /> : 'Pilih Paket Lite'}
                        </button>
                    </div>

                    {/* Pro Card */}
                    <div className="bg-white rounded-2xl p-8 border border-brand-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="text-[13px] font-bold text-brand-600 uppercase tracking-wider">Pro</div>
                                <span className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                                    🔥 Best Seller
                                </span>
                            </div>

                            <div className="flex items-baseline mb-2">
                                <span className="text-[48px] font-bold text-brand-600 font-mono tracking-tight">49.9k</span>
                                <span className="text-slate-500 ml-2">/bulan</span>
                            </div>
                            <p className="text-slate-600 mb-8 min-h-[48px] flex items-center">Buka semua fitur & cepat dapat kerja</p>

                            <div className="space-y-4 mb-8">
                                {[
                                    { text: 'Unlimited Pelacakan (My Jobs)', included: true },
                                    { text: 'Unlimited Scan & Auto-Fix CV', included: true },
                                    { text: '10x Perbaiki KESELURUHAN CV', included: true },
                                    { text: 'Download CV Word Template ATS', included: true },
                                    { text: 'Unlimited Chat Asisten AI Karir', included: true },
                                    { text: 'Akses Info & Loker CPNS/BUMN', included: true },
                                    { text: 'Unlimited AI Cover Letter', included: true },
                                    { text: 'Akses Salary Checker AI', included: true },
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm text-slate-700 font-bold">
                                        <Sparkles size={16} className="text-brand-600 flex-shrink-0" />
                                        {feature.text}
                                    </div>
                                ))}
                            </div>

                            <button
                                disabled={loading !== null}
                                onClick={() => handlePlanSelection('pro', 49900)}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-700 to-brand-500 text-white font-bold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                {loading === 'pro' ? <Loader2 className="animate-spin" size={20} /> : 'Upgrade ke PRO'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};