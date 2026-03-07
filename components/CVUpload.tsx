import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, Check, X, Loader2, AlertCircle, ChevronRight, Trash2 } from 'lucide-react';
import { parseCV, saveProfile, loadProfile, clearProfile, UserProfile } from '../lib/openai';
import { extractTextFromPDF } from '../lib/pdfParser';

interface CVUploadProps {
    onProfileUpdate: (profile: UserProfile | null) => void;
    existingProfile: UserProfile | null;
    hidePreview?: boolean;
}

export const CVUpload: React.FC<CVUploadProps> = ({ onProfileUpdate, existingProfile, hidePreview }) => {
    const [cvText, setCvText] = useState('');
    const [parsing, setParsing] = useState(false);
    const [error, setError] = useState('');
    const [parsedProfile, setParsedProfile] = useState<UserProfile | null>(existingProfile);
    const [showUpload, setShowUpload] = useState(!existingProfile);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError('');
        setParsing(true);

        try {
            if (file.name.endsWith('.txt') || file.type === 'text/plain') {
                const text = await file.text();
                setCvText(text);
            } else if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
                const text = await extractTextFromPDF(file);
                setCvText(text);
            } else {
                setError('Format file tidak didukung. Harap upload .pdf atau .txt.');
            }
        } catch (err: any) {
            console.error('File parsing error:', err);
            setError(`Gagal membaca file: ${err.message || 'File rusak atau tidak terbaca.'}`);
        } finally {
            setParsing(false);
            // Reset input so the same file can be selected again
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAnalyze = async () => {
        if (!cvText.trim()) {
            setError('Silakan paste teks CV Anda terlebih dahulu.');
            return;
        }

        setParsing(true);
        setError('');

        try {
            const profile = await parseCV(cvText.trim());
            setParsedProfile(profile);
            saveProfile(profile);
            onProfileUpdate(profile);
            setShowUpload(false);
        } catch (err: any) {
            console.error('CV Parse error:', err);
            setError(`Gagal menganalisis CV: ${err.message || 'Coba lagi nanti.'}`);
        } finally {
            setParsing(false);
        }
    };

    const handleRemoveProfile = () => {
        clearProfile();
        setParsedProfile(null);
        onProfileUpdate(null);
        setShowUpload(true);
        setCvText('');
    };

    // Show profile summary if already parsed
    if (parsedProfile && !showUpload && !hidePreview) {
        return (
            <div className="animate-fade-in">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-4">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                            <div className="p-1.5 bg-brand-50 rounded-lg">
                                <FileText size={18} className="text-brand-600" />
                            </div>
                            Profil CV Anda
                        </h3>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Check size={12} strokeWidth={3} /> Aktif
                        </span>
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Skills</div>
                        <div className="flex flex-wrap gap-1.5">
                            {parsedProfile.skills.slice(0, 12).map((skill, i) => (
                                <span key={i} className="bg-brand-50 text-brand-700 px-2.5 py-1 rounded-lg text-[12px] font-semibold border border-brand-100">
                                    {skill}
                                </span>
                            ))}
                            {parsedProfile.skills.length > 12 && (
                                <span className="text-slate-400 text-[12px] font-medium px-1 py-1">
                                    +{parsedProfile.skills.length - 12} lagi
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Experience */}
                    <div className="mb-4">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pengalaman</div>
                        <div className="text-[14px] font-semibold text-slate-700">
                            {parsedProfile.experience_years} tahun — {parsedProfile.experience_summary}
                        </div>
                    </div>

                    {/* Education */}
                    <div className="mb-4">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pendidikan</div>
                        <div className="text-[14px] font-semibold text-slate-700">{parsedProfile.education}</div>
                    </div>

                    {/* Certifications */}
                    {parsedProfile.certifications.length > 0 && (
                        <div className="mb-4">
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sertifikasi</div>
                            <div className="flex flex-wrap gap-1.5">
                                {parsedProfile.certifications.map((cert, i) => (
                                    <span key={i} className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-[12px] font-semibold border border-amber-100">
                                        🏅 {cert}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Preferred Roles */}
                    {parsedProfile.preferred_roles.length > 0 && (
                        <div className="mb-4">
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Role yang Cocok</div>
                            <div className="flex flex-wrap gap-1.5">
                                {parsedProfile.preferred_roles.map((role, i) => (
                                    <span key={i} className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-[12px] font-semibold border border-emerald-100">
                                        {role}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-5 pt-4 border-t border-slate-100">
                        <button
                            onClick={() => setShowUpload(true)}
                            className="flex-1 text-sm font-bold text-brand-600 hover:bg-brand-50 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                        >
                            <Upload size={14} /> Update CV
                        </button>
                        <button
                            onClick={handleRemoveProfile}
                            className="text-sm font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
                        >
                            <Trash2 size={14} /> Hapus
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Upload / Paste Form
    return (
        <div className="animate-fade-in">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-brand-600 to-blue-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={20} />
                            <h3 className="text-lg font-extrabold tracking-tight">AI CV Analysis</h3>
                        </div>
                        <p className="text-blue-100 text-[13px] font-medium leading-relaxed">
                            Paste CV Anda dan biarkan AI menganalisis skills, pengalaman, serta mencocokkan dengan lowongan terbaik.
                        </p>
                    </div>
                </div>

                {/* Body */}
                <div className="p-5">
                    {/* Text Area */}
                    <textarea
                        value={cvText}
                        onChange={(e) => setCvText(e.target.value)}
                        placeholder="Paste seluruh teks CV Anda di sini...

Contoh:
ANDY BAGUS SAPUTRA
Software Engineer | 3 Years Experience

Skills: JavaScript, React, Node.js, Python
Education: S1 Teknik Informatika, Universitas X

Experience:
- PT ABC (2021-2024): Frontend Developer
  - Built React dashboards
  - Led team of 3 developers"
                        className="w-full h-48 p-4 border border-slate-200 rounded-xl text-[14px] text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 resize-none transition-all"
                    />

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.txt,.text"
                        onChange={handleFileUpload}
                        className="hidden"
                    />

                    {/* Upload Button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 text-[13px] font-semibold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1.5 transition-colors"
                    >
                        <Upload size={14} /> Atau Upload File CV (.pdf, .txt)
                    </button>

                    {/* Error */}
                    {error && (
                        <div className="mt-3 bg-red-50 text-red-700 border border-red-100 rounded-xl p-3 text-[13px] font-medium flex items-start gap-2">
                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Analyze Button */}
                    <button
                        onClick={handleAnalyze}
                        disabled={parsing || !cvText.trim()}
                        className="w-full mt-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.2)] transition-all duration-200 flex items-center justify-center gap-2 text-[15px] disabled:shadow-none"
                    >
                        {parsing ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Menganalisis CV...
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} />
                                Analisis dengan AI
                            </>
                        )}
                    </button>

                    {/* Cancel button if editing */}
                    {parsedProfile && (
                        <button
                            onClick={() => setShowUpload(false)}
                            className="w-full mt-2 text-sm font-bold text-slate-400 hover:text-slate-600 py-2.5 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
