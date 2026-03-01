import React, { useState } from 'react';
import { Sparkles, Briefcase, MapPin, Target, ArrowRight, Loader2, Rocket, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface OnboardingSurveyProps {
    onComplete: () => void;
    user: {
        id: string;
        full_name?: string;
    };
}

export const OnboardingSurvey: React.FC<OnboardingSurveyProps> = ({ onComplete, user }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        job_title: '',
        experience: '0-1 year',
        location: 'Remote',
        goal: 'Mencari pekerjaan baru'
    });

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    onboarding_completed: true,
                    job_preferences: formData
                }
            });

            if (error) throw error;
            onComplete();
        } catch (error) {
            console.error('Error saving onboarding data:', error);
            alert('Gagal menyimpan data survey. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const currentStepData = [
        {
            id: 1,
            title: "Pekerjaan apa yang Anda cari?",
            subtitle: "Ini akan membantu AI kami merekomendasikan lowongan yang sesuai.",
            icon: <Briefcase className="text-brand-600" size={32} />,
            content: (
                <input
                    type="text"
                    placeholder="Contoh: Frontend Developer, Product Manager..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-lg"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    autoFocus
                />
            )
        },
        {
            id: 2,
            title: "Berapa lama pengalaman kerja Anda?",
            subtitle: "Sesuaikan filter pencarian dengan tingkat keahlian Anda.",
            icon: <Target className="text-orange-500" size={32} />,
            content: (
                <div className="grid grid-cols-1 gap-3">
                    {['Fresh Graduate (0-1 year)', 'Junior (2-3 years)', 'Mid-Level (4-6 years)', 'Senior (7+ years)'].map((exp) => (
                        <button
                            key={exp}
                            onClick={() => setFormData({ ...formData, experience: exp })}
                            className={`p-4 rounded-xl border text-left transition-all ${formData.experience === exp
                                    ? 'bg-brand-50 border-brand-500 shadow-sm ring-2 ring-brand-500/10'
                                    : 'bg-white border-slate-200 hover:border-brand-300'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`font-semibold ${formData.experience === exp ? 'text-brand-700' : 'text-slate-700'}`}>{exp}</span>
                                {formData.experience === exp && <CheckCircle2 size={20} className="text-brand-500" />}
                            </div>
                        </button>
                    ))}
                </div>
            )
        },
        {
            id: 3,
            title: "Di mana lokasi kerja impian Anda?",
            subtitle: "Bisa kota spesifik atau pilih kerja remote.",
            icon: <MapPin className="text-blue-500" size={32} />,
            content: (
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Contoh: Jakarta, Bandung, Bali..."
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-lg"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                    <div className="flex flex-wrap gap-2">
                        {['Jakarta', 'Remote', 'Bandung', 'Bali', 'Singapore'].map((loc) => (
                            <button
                                key={loc}
                                onClick={() => setFormData({ ...formData, location: loc })}
                                className="px-4 py-2 rounded-full border border-slate-200 text-sm font-medium hover:border-brand-500 hover:text-brand-600 transition-colors bg-white"
                            >
                                {loc}
                            </button>
                        ))}
                    </div>
                </div>
            )
        }
    ];

    const current = currentStepData.find(s => s.id === step);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-xl w-full">
                {/* Progress Bar */}
                <div className="mb-8 flex justify-between items-center px-2">
                    <div className="flex gap-2">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-2 rounded-full transition-all duration-500 ${s === step ? 'w-10 bg-brand-600' : (s < step ? 'w-8 bg-brand-200' : 'w-4 bg-slate-200')
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-sm font-bold text-slate-400">Step {step} of 3</span>
                </div>

                {/* Card Content */}
                <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-2xl shadow-brand-500/5 border border-slate-100 animate-fade-in-up">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                        {current?.icon}
                    </div>

                    <h2 className="text-3xl font-bold text-slate-900 mb-2 leading-tight">
                        {current?.title}
                    </h2>
                    <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                        {current?.subtitle}
                    </p>

                    <div className="mb-10 min-h-[220px]">
                        {current?.content}
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                        {step > 1 ? (
                            <button
                                onClick={handleBack}
                                className="text-slate-400 font-bold hover:text-slate-600 transition-colors flex items-center gap-2"
                            >
                                Kembali
                            </button>
                        ) : <div />}

                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                disabled={step === 1 && !formData.job_title}
                                className="bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2 group active:scale-[0.98]"
                            >
                                Lanjut <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-10 py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2 group active:scale-[0.98]"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Rocket size={18} />}
                                Mulai JobHub
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer branding */}
                <div className="mt-8 text-center flex items-center justify-center gap-2 text-slate-400 font-medium">
                    <Sparkles size={16} />
                    <span>Tailored for {user.full_name?.split(' ')[0] || 'your'} career goals</span>
                </div>
            </div>
        </div>
    );
};
