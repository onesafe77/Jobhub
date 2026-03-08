import React, { useState } from 'react';
import { Coins, Loader2, FileText, ArrowRight, TrendingUp, AlertCircle, ChevronRight, Briefcase } from 'lucide-react';
import { UserProfile, estimateSalaryFromCV, SalaryEstimateResult } from '../lib/openai';

interface SalaryCheckerViewProps {
    userProfile: UserProfile | null;
    onNavigate: (view: string) => void;
}

export const SalaryCheckerView: React.FC<SalaryCheckerViewProps> = ({ userProfile, onNavigate }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SalaryEstimateResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const handleAnalyze = async () => {
        if (!userProfile) return;
        setLoading(true);
        setError(null);
        try {
            const data = await estimateSalaryFromCV(userProfile);
            setResult(data);
        } catch (err: any) {
            console.error("Salary Checker Error:", err);
            setError("Gagal menghubungi server untuk menganalisis gaji. Silakan coba lagi nanti.");
        } finally {
            setLoading(false);
        }
    };

    // If no profile, show Empty State
    if (!userProfile || !userProfile.skills || userProfile.skills.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in bg-slate-50 min-h-full">
                <div className="w-24 h-24 bg-gradient-to-br from-brand-100 to-brand-50 rounded-3xl flex items-center justify-center mb-8 border border-brand-200">
                    <FileText size={40} className="text-brand-500" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Profil CV Kosong</h2>
                <p className="text-lg text-slate-500 max-w-lg mb-8 leading-relaxed">
                    AI kami butuh data kamu (seperti skill dan pengalaman) untuk bisa menghitung estimasi gaji yang tepat. Yuk buat profil CV-mu dulu!
                </p>
                <button
                    onClick={() => onNavigate('cv-builder')}
                    className="px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-brand-500/30 transition-all flex items-center gap-3 active:scale-95"
                >
                    <Briefcase size={20} />
                    Buat Profil CV Sekarang
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-slate-50 min-h-screen p-6 md:p-10 lg:p-16 animate-fade-in custom-scrollbar overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold tracking-wide uppercase mb-4">
                            <Coins size={16} /> Beta AI
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">Salary Checker AI</h1>
                        <p className="text-lg text-slate-600 max-w-2xl">
                            Analisis profil CV Anda secara instan dan dapatkan estimasi gaji pasar yang realistis berdasarkan skill dan pengalaman terkini Anda.
                        </p>
                    </div>

                    {!result && !loading && (
                        <button
                            onClick={handleAnalyze}
                            className="w-full md:w-auto px-8 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-lg font-black rounded-3xl shadow-xl hover:shadow-teal-500/30 transition-all flex justify-center items-center gap-3 active:scale-95 shrink-0"
                        >
                            <TrendingUp size={24} />
                            Mulai Analisis
                        </button>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 mb-8 flex gap-4 items-start">
                        <AlertCircle className="shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold mb-1">Terjadi Kesalahan</h3>
                            <p className="text-sm opacity-90">{error}</p>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="bg-white rounded-[32px] border border-slate-200 p-16 flex flex-col items-center justify-center shadow-sm">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-20 rounded-full animate-pulse"></div>
                            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 relative z-10 animate-pulse-slow">
                                <Loader2 size={32} className="text-emerald-500 animate-spin" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Menganalisis Profil Anda...</h3>
                        <p className="text-slate-500 text-center max-w-md">
                            AI kami sedang mengevaluasi skill, pendidikan, dan pengalaman Anda untuk menemukan data gaji pasar yang paling akurat di Indonesia.
                        </p>
                    </div>
                )}

                {result && !loading && (
                    <div className="space-y-8 animate-fade-in-up">
                        {/* Main Salary Card */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <p className="text-emerald-400 font-bold uppercase tracking-widest text-sm mb-4">Estimasi Gaji Bulanan (Median)</p>
                                <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 tabular-nums">
                                    {formatCurrency(result.medianSalary)}
                                </h2>

                                <div className="w-full max-w-2xl bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="text-center md:text-left">
                                        <p className="text-white/60 text-sm font-semibold mb-1 uppercase tracking-wide">Batas Bawah</p>
                                        <p className="text-2xl font-bold text-white/90">{formatCurrency(result.minSalary)}</p>
                                    </div>
                                    <div className="hidden md:block flex-1 h-[2px] bg-gradient-to-r from-emerald-500/20 via-emerald-400 to-emerald-500/20 relative">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-400 border-4 border-slate-800"></div>
                                    </div>
                                    <div className="text-center md:text-right">
                                        <p className="text-white/60 text-sm font-semibold mb-1 uppercase tracking-wide">Batas Atas</p>
                                        <p className="text-2xl font-bold text-emerald-400">{formatCurrency(result.maxSalary)}</p>
                                    </div>
                                </div>

                                <p className="text-white/60 text-sm max-w-lg">
                                    Didukung oleh AI Jobs Agent Profile Analyzer dengan tingkat kepercayaan <strong className="text-white">{result.confidenceScore}%</strong>. Estimasi bersifat indikatif berdasarkan pasar saat ini.
                                </p>
                            </div>
                        </div>

                        {/* Analysis Breakdown */}
                        <div className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-200/60 shadow-sm">
                            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <TrendingUp className="text-brand-500" /> Analisis Nilai Jual Anda
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {result.analysis.map((item, idx) => (
                                    <div key={idx} className={`p-6 rounded-2xl border ${item.impact === 'positive' ? 'bg-emerald-50 border-emerald-100' : item.impact === 'negative' ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-200'}`}>
                                        <div className="flex items-center gap-3 mb-3">
                                            {item.impact === 'positive' ? (
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">+</div>
                                            ) : item.impact === 'negative' ? (
                                                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">-</div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold">~</div>
                                            )}
                                            <h4 className="font-bold text-slate-800">{item.factor}</h4>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Call to action */}
                        <div className="flex justify-center mt-12 mb-12">
                            <button
                                onClick={() => onNavigate('search')}
                                className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-brand-600 transition-colors flex items-center gap-2 shadow-lg"
                            >
                                Cari Lowongan Sekarang <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
