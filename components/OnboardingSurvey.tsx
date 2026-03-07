import React, { useState } from 'react';
import { Sparkles, Briefcase, MapPin, Target, ArrowRight, Loader2, Rocket, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { scraperService } from '../lib/scraperService';

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
        selected_jobs: [] as string[],
        selected_locations: [] as string[],
        experience: '0-1 year',
        goal: 'Mencari pekerjaan baru'
    });

    const toggleJob = (job: string) => {
        setFormData(prev => ({
            ...prev,
            selected_jobs: prev.selected_jobs.includes(job)
                ? prev.selected_jobs.filter(j => j !== job)
                : [...prev.selected_jobs, job]
        }));
    };

    const toggleLocation = (loc: string) => {
        setFormData(prev => ({
            ...prev,
            selected_locations: prev.selected_locations.includes(loc)
                ? prev.selected_locations.filter(l => l !== loc)
                : [...prev.selected_locations, loc]
        }));
    };

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    onboarding_completed: true,
                    job_preferences: {
                        ...formData,
                        job_title: formData.selected_jobs.join(', '),
                        location: formData.selected_locations.join(', ')
                    }
                }
            });

            if (error) throw error;

            if (formData.selected_jobs.length > 0) {
                // Trigger scraping for ALL selected jobs and first selected location (or Indonesia if none)
                const targetLoc = formData.selected_locations.length > 0 ? formData.selected_locations[0] : 'Indonesia';

                // Limit to first 5 keywords to avoid extreme bottlenecks, but scrape each
                formData.selected_jobs.slice(0, 5).forEach(jobTitle => {
                    const queryUrl = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(jobTitle)}&location=${encodeURIComponent(targetLoc === 'Remote' ? 'Indonesia' : targetLoc)}`;
                    scraperService.scrapeJob(queryUrl).catch(err => console.error(`[Onboarding Scrape] Error for ${jobTitle}:`, err));
                });
            }

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
            subtitle: "Pilih kategori pekerjaan yang Anda minati (Bisa pilih banyak).",
            icon: <Briefcase className="text-brand-600" size={32} />,
            content: (
                <div className="space-y-4">
                    {/* Selected Jobs Display */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[60px] flex flex-wrap gap-2">
                        {formData.selected_jobs.length === 0 ? (
                            <span className="text-slate-400 italic">Pilih kategori di bawah ini...</span>
                        ) : (
                            formData.selected_jobs.map(job => (
                                <span key={job} className="bg-brand-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-2 animate-fade-in shadow-sm shadow-brand-500/20">
                                    {job}
                                    <button onClick={() => toggleJob(job)} className="hover:text-brand-200 font-black">×</button>
                                </span>
                            ))
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar pb-4">
                        {[
                            // TECHNOLOGY
                            'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile Developer',
                            'UI/UX Designer', 'Data Scientist', 'Data Analyst', 'Cyber Security', 'DevOps', 'QA Engineer',
                            'Cloud Engineer', 'IT Support', 'Artificial Intelligence', 'Blockchain', 'Game Developer',
                            'System Architect', 'Information Security', 'Software Architect', 'Embedded Engineer',

                            // ENGINEERING & TECHNICAL
                            'Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Chemical Engineer',
                            'Industrial Engineer', 'Site Manager', 'Estimator', 'Draftsperson',
                            'HSE Officer', 'Safety Officer', 'Environmental Engineer', 'K3 Specialist',
                            'Maintenance Technician', 'Quality Control', 'Project Engineer', 'Field Engineer',

                            // MINING & ENERGY
                            'Mining Engineer', 'Geologist', 'Petroleum Engineer', 'Mine Plan Engineer',
                            'Drilling Supervisor', 'Heavy Equipment Mechanic', 'Surveyor', 'Mine Superintendent',
                            'Exploration Geologist', 'GIS Specialist',

                            // AGRICULTURE & PLANTATION
                            'Estate Manager', 'Agronomist', 'Asisten Kebun', 'Mill Manager', 'Plantation Supervisor',
                            'Palm Oil Specialist', 'Forester',

                            // LEGAL & CORPORATE
                            'Legal Officer', 'Corporate Secretary', 'Legal Counsel', 'Public Relations', 'Internal Audit',
                            'Compliance Officer', 'Notary Assistant',

                            // FINANCE & ACCOUNTING
                            'Accountant', 'Finance Manager', 'Tax Specialist', 'Auditor',
                            'Investment Analyst', 'Financial Planner', 'Bank Teller', 'Credit Analyst',
                            'Treasury Specialist', 'Finance Controller', 'Tax Consultant',

                            // SALES & MARKETING
                            'Digital Marketing', 'Social Media Manager', 'SEO Specialist', 'Content Creator',
                            'Graphic Designer', 'Copywriter', 'Brand Manager', 'Market Researcher',
                            'Sales Executive', 'Account Manager', 'Business Development', 'Telemarketing',
                            'Event Planner', 'PR Specialist',

                            // HUMAN RESOURCES & ADMIN
                            'HR Generalist', 'Recruiter', 'Admin Assistant', 'Office Manager',
                            'Personal Assistant', 'Customer Service', 'Liaison Officer', 'HR Manager',
                            'Payroll Specialist', 'Training & Development',

                            // LOGISTICS & SUPPLY CHAIN
                            'Logistics Manager', 'Supply Chain Planner', 'Warehouse Supervisor', 'Procurement',
                            'Export Import Specialist', 'Inventory Controller', 'Driver', 'Courier',
                            'Operations Specialist', 'Shipping Coordinator',

                            // HEALTHCARE & SCIENCE
                            'Doctor', 'Nurse', 'Pharmacist', 'Lab Assistant', 'Nutritionist', 'Physiotherapist',
                            'Radiographer', 'Biotechnologist',

                            // HOSPITALITY & RETAIL
                            'Store Manager', 'Cashier', 'Waiter/Waitress', 'Chef', 'Barista', 'Hotel Management',
                            'F&B Manager', 'Housekeeping Supervisor'
                        ].map((role) => (
                            <button
                                key={role}
                                onClick={() => toggleJob(role)}
                                className={`px-4 py-3 rounded-2xl border-[1.5px] text-[13px] font-bold transition-all duration-300 transform active:scale-95 flex items-center gap-2 ${formData.selected_jobs.includes(role)
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                                    }`}
                            >
                                {role} {formData.selected_jobs.includes(role) && <CheckCircle2 size={14} className="text-brand-400" />}
                            </button>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 2,
            title: "Berapa lama pengalaman kerja Anda?",
            subtitle: "Sesuaikan filter pencarian dengan tingkat keahlian Anda.",
            icon: <Target className="text-orange-500" size={28} />,
            content: (
                <div className="grid grid-cols-1 gap-4">
                    {['Fresh Graduate (0-1 year)', 'Junior (2-3 years)', 'Mid-Level (4-6 years)', 'Senior (7+ years)'].map((exp) => (
                        <button
                            key={exp}
                            onClick={() => setFormData({ ...formData, experience: exp })}
                            className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 transform active:scale-[0.99] ${formData.experience === exp
                                ? 'bg-slate-900 border-slate-900 shadow-lg text-white'
                                : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`font-bold text-lg ${formData.experience === exp ? 'text-white' : 'text-slate-700'}`}>{exp}</span>
                                {formData.experience === exp ? (
                                    <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-white">
                                        <CheckCircle2 size={16} />
                                    </div>
                                ) : (
                                    <div className="w-6 h-6 rounded-full border-2 border-slate-200"></div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )
        },
        {
            id: 3,
            title: "Di mana lokasi kerja impian Anda?",
            subtitle: "Pilih kota atau provinsi di Indonesia (Bisa pilih banyak).",
            icon: <MapPin className="text-blue-500" size={32} />,
            content: (
                <div className="space-y-4">
                    {/* Selected Locations Display */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[60px] flex flex-wrap gap-2">
                        {formData.selected_locations.length === 0 ? (
                            <span className="text-slate-400 italic">Pilih lokasi di bawah ini...</span>
                        ) : (
                            formData.selected_locations.map(loc => (
                                <span key={loc} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-2 animate-fade-in shadow-sm shadow-blue-500/20">
                                    {loc}
                                    <button onClick={() => toggleLocation(loc)} className="hover:text-blue-200 font-black">×</button>
                                </span>
                            ))
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {[
                            'Remote', 'Seluruh Indonesia',
                            'Jakarta Raya', 'DKI Jakarta', 'Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara',
                            'Jawa Barat', 'Bandung', 'Bekasi', 'Depok', 'Bogor', 'Tangerang Raya', 'Tangerang', 'Tangerang Selatan',
                            'Jawa Tengah', 'Semarang', 'Solo', 'Surakarta', 'Yogyakarta', 'DIY Yogyakarta',
                            'Jawa Timur', 'Surabaya', 'Malang', 'Sidoarjo', 'Gresik',
                            'Sumatera Utara', 'Medan', 'Sumatera Selatan', 'Palembang', 'Riau', 'Pekanbaru', 'Kepulauan Riau', 'Batam',
                            'Lampung', 'Bandar Lampung', 'Sumatera Barat', 'Padang', 'Jambi', 'Aceh', 'Banda Aceh',
                            'Kalimantan Timur', 'Balikpapan', 'Samarinda', 'Kalimantan Barat', 'Pontianak', 'Kalimantan Selatan', 'Banjarmasin',
                            'Sulawesi Selatan', 'Makassar', 'Sulawesi Utara', 'Manado', 'Bali', 'Denpasar', 'Badung',
                            'Nusa Tenggara Barat', 'Lombok', 'Mataram', 'Papua', 'Jayapura'
                        ].map((loc) => (
                            <button
                                key={loc}
                                onClick={() => toggleLocation(loc)}
                                className={`px-4 py-3 rounded-2xl border-[1.5px] text-[13px] font-bold transition-all duration-300 transform active:scale-95 flex items-center gap-2 ${formData.selected_locations.includes(loc)
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                                    }`}
                            >
                                {loc} {formData.selected_locations.includes(loc) && <CheckCircle2 size={14} className="text-blue-200" />}
                            </button>
                        ))}
                    </div>
                </div>
            )
        }
    ];

    const current = currentStepData.find(s => s.id === step);

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Elegant Background Orbs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] mix-blend-multiply animate-pulse duration-10000"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] mix-blend-multiply"></div>
                <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] mix-blend-multiply"></div>
            </div>

            <div className="max-w-2xl w-full relative z-10 my-8">
                {/* Header branding */}
                <div className="flex items-center justify-center gap-3 mb-10 animate-fade-in-up">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                        <Sparkles size={24} fill="currentColor" className="text-white" />
                    </div>
                    <span className="font-extrabold text-2xl tracking-tight text-slate-900">Jobs Agent</span>
                </div>

                {/* Progress Indicators */}
                <div className="mb-10 flex justify-center items-center px-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-3 bg-white py-3 px-6 rounded-full shadow-sm border border-slate-100">
                        {[1, 2, 3].map((s) => (
                            <React.Fragment key={s}>
                                <div
                                    className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all duration-500 ${s === step ? 'bg-slate-900 text-white shadow-md scale-110' : (s < step ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-400')
                                        }`}
                                >
                                    {s < step ? <CheckCircle2 size={16} /> : s}
                                </div>
                                {s < 3 && (
                                    <div className={`w-8 h-[2px] rounded-full transition-all duration-500 ${s < step ? 'bg-brand-500' : 'bg-slate-200'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Main Card Content */}
                <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-slate-100 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 border border-slate-100 shadow-sm">
                        {current?.icon}
                    </div>

                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
                        {current?.title}
                    </h2>
                    <p className="text-slate-500 text-lg mb-10 font-medium">
                        {current?.subtitle}
                    </p>

                    <div className="mb-12 min-h-[220px]">
                        {current?.content}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100">
                        {step > 1 ? (
                            <button
                                onClick={handleBack}
                                className="text-slate-400 font-bold hover:text-slate-700 hover:bg-slate-50 py-3 px-6 rounded-2xl transition-all flex items-center gap-2"
                            >
                                Kembali
                            </button>
                        ) : <div />}

                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                disabled={step === 1 && formData.selected_jobs.length === 0}
                                className="bg-slate-900 hover:bg-brand-600 disabled:bg-slate-200 text-white font-bold px-10 py-4 rounded-2xl transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.08)] disabled:shadow-none flex items-center gap-3 group active:scale-[0.98]"
                            >
                                LANJUTKAN <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading || formData.selected_locations.length === 0}
                                className="bg-slate-900 hover:bg-brand-600 disabled:bg-slate-200 text-white font-bold px-10 py-4 rounded-2xl transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.08)] disabled:shadow-none flex items-center gap-3 group active:scale-[0.98]"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Rocket size={20} className="group-hover:-translate-y-1 transition-transform" />}
                                MULAI JOBS AGENT
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer branding & Testing Backdoor */}
                <div className="mt-10 text-center flex flex-col items-center justify-center gap-4 relative z-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className="flex items-center justify-center gap-2 text-slate-500 font-semibold bg-white/50 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-200/50">
                        <Sparkles size={16} className="text-brand-500" />
                        <span>Tailored specifically for {user.full_name?.split(' ')[0] || 'your'} career</span>
                    </div>

                    {/* Backdoor for Testing */}
                    <button
                        onClick={() => {
                            supabase.auth.signOut().then(() => {
                                window.location.reload();
                            });
                        }}
                        className="text-[10px] text-slate-400 hover:text-red-500 font-bold tracking-widest uppercase transition-colors"
                    >
                        [ Testing Mode: Exit & Clear ]
                    </button>
                </div>
            </div>
        </div>
    );
};
