import React from 'react';
import { Target, Search, FileText, Bot, ArrowRight, CheckCircle2, ScanLine } from 'lucide-react';

const NotionLogo = () => (
  <svg viewBox="0 0 24 24" className="w-10 h-10" fill="currentColor">
    <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28.047-.653 0-.186-.187-.326-.327-.326-.747 0-3.03.233-3.73.233-.28 0-.42-.14-.42-.42 0-.466.233-1.632.233-2.006 0-.093-.093-.233-.233-.233h-9.98c-.094 0-.234.14-.28.326l-3.266 12.316c-.326 1.306-1.073 1.306-1.586 1.166-.233-.046-.513-.046-.606.327l-1.306 4.618c-.094.326 0 .56.326.56 1.773 0 3.73-.513 4.803-.513.56 0 .7.186.7.466l-.606 2.38c-.047.233.14.373.327.373H15.89c.093 0 .233-.14.28-.327l3.265-12.365c.187-.653.607-.7.98-.653.28.047.467.093.513-.326l.793-3.22c.047-.186-.046-.42-.326-.42-1.493 0-3.17.42-4.196.42-.56 0-.746-.187-.746-.467l.56-2.052c.046-.233-.14-.373-.326-.373H5.858c-.093 0-.186.14-.233.327L2.406 15.31c-.046.233.14.373.326.373.56 0 1.353-.14 1.727-.14.56 0 .7.187.7.513l-1.073 4.385c-.047.186 0 .233.187.233 1.4-.233 3.313-.84 3.966-.84.28 0 .513.14.513.467l-.746 3.033c-.047.233.14.373.326.373h5.92c.094 0 .234-.14.28-.327l3.546-13.438c.14-.513.606-.513 1.073-.466.28.047.466.047.513-.327l.746-2.94c.047-.186-.093-.373-.326-.373-1.12 0-3.264.42-3.87.42-.467 0-.7-.186-.7-.466l.606-2.286c.047-.233-.14-.373-.327-.373H6.046c-.094 0-.187.14-.234.327L4.459 4.208Z" />
  </svg>
);

export const Features: React.FC = () => {
  return (
    <section className="py-24 lg:py-32 bg-slate-50 relative" id="fitur-unggulan">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-4xl lg:text-[56px] font-bold text-slate-900 mb-6 tracking-tight leading-tight">
            Fitur Unggulan
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Semua yang kamu butuhkan untuk job search yang efektif
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* CARD 1: AI Job Matching (Left, Tall) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-white to-blue-50/50 rounded-[32px] border border-slate-200 p-8 lg:p-12 relative overflow-hidden group hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 flex flex-col">
            <div className="mb-8">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 shadow-sm">
                <Target size={28} strokeWidth={2.5} />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">AI Job Matching</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                AI menganalisis CV kamu dan memberikan match score 0-100% untuk setiap job. Lihat exactly kenapa kamu cocok atau tidak.
              </p>
            </div>

            <div className="mt-auto relative h-64 w-full flex items-center justify-center">
              {/* Main Score Badge */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="text-[100px] lg:text-[120px] leading-none font-bold text-green-600 tracking-tighter drop-shadow-sm">
                  92%
                </div>
                <div className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-bold uppercase tracking-wider mt-2">
                  Excellent Match
                </div>
              </div>

              {/* Progress Bars Visual */}
              <div className="absolute w-full max-w-[280px] -bottom-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/60 shadow-lg transform rotate-2 lg:group-hover:rotate-0 transition-transform duration-500 z-20">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                      <span>Skills Match</span>
                      <span>90%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[90%] rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                      <span>Experience</span>
                      <span>75%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-[75%] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-200/30 rounded-full blur-3xl"></div>
            </div>
          </div>

          {/* Right Column Container */}
          <div className="lg:col-span-7 flex flex-col gap-6">

            {/* CARD 2: Multi-Platform Search (Wide) */}
            <div className="bg-white rounded-[32px] border border-slate-200 p-8 lg:p-10 relative overflow-hidden group hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 h-full min-h-[300px]">
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-1 z-10">
                  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6 shadow-sm">
                    <Search size={24} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Search 10+ Platform Sekaligus</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    Hemat 2 jam per hari. Satu search, semua hasil.
                  </p>
                </div>

                {/* Visual */}
                <div className="flex-1 w-full relative">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 shadow-sm relative z-10">
                    <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center shadow-inner mb-4">
                      <Search size={16} className="text-slate-400 mr-3" />
                      <div className="text-slate-400 text-sm">Product Manager...</div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {['LinkedIn', 'JobStreet', 'Glints'].map((p, i) => (
                        <div key={i} className="bg-white border border-slate-200 px-2 py-1 rounded text-[10px] font-medium text-slate-600 flex items-center shadow-sm">
                          <CheckCircle2 size={10} className="text-green-500 mr-1" /> {p}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-brand-600 font-semibold bg-brand-50 px-2 py-1 rounded inline-block">
                      147 jobs found in 0.5s
                    </div>
                  </div>
                  {/* Decorative blobs */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-100/50 rounded-full blur-3xl"></div>
                </div>
              </div>
            </div>

            {/* Bottom Row of Right Column */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">

              {/* CARD 3: Notion Integration */}
              <div className="bg-white rounded-[32px] border border-slate-200 p-8 relative overflow-hidden group hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 min-h-[300px] flex flex-col">
                <div className="mb-6 z-10">
                  <div className="mb-6 opacity-90 group-hover:scale-110 transition-transform duration-300 origin-left">
                    <NotionLogo />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Save ke Notion</h3>
                  <p className="text-slate-600 text-[15px]">
                    One-click save. Auto-create database.
                  </p>
                </div>

                {/* Visual Kanban */}
                <div className="mt-auto bg-slate-50 rounded-t-xl border-t border-x border-slate-200 p-3 pb-0 relative -bottom-8 group-hover:-bottom-4 transition-all duration-300">
                  <div className="flex gap-2 overflow-hidden">
                    {[1, 2, 3].map((col) => (
                      <div key={col} className="w-16 bg-white rounded-t border border-slate-200 p-1.5 space-y-1.5 flex-shrink-0">
                        <div className={`h-1.5 w-8 rounded-full ${col === 1 ? 'bg-red-200' : col === 2 ? 'bg-yellow-200' : 'bg-green-200'}`}></div>
                        <div className="h-6 w-full bg-slate-50 border border-slate-100 rounded"></div>
                        <div className="h-6 w-full bg-slate-50 border border-slate-100 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CARD 4: ATS Scanner */}
              <div className="bg-white rounded-[32px] border border-slate-200 p-8 relative overflow-hidden group hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 min-h-[300px] flex flex-col">
                <div className="mb-6 z-10">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-6 shadow-sm">
                    <ScanLine size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">ATS CV Scanner</h3>
                  <p className="text-slate-600 text-[15px]">
                    Cek ATS score sebelum apply lowongan.
                  </p>
                </div>

                {/* Visual Score */}
                <div className="mt-auto flex justify-center pb-2">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                      <circle cx="48" cy="48" r="40" stroke="#f97316" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset="70" className="transition-all duration-1000 ease-out group-hover:stroke-dashoffset-50" />
                    </svg>
                    <div className="absolute text-xl font-bold text-slate-800">72</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 5: AI Cover Letter (Full Width) */}
          <div className="lg:col-span-12 bg-gradient-to-r from-purple-50 to-pink-50 rounded-[32px] border border-slate-200 p-8 lg:p-12 relative overflow-hidden group hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 flex flex-col lg:flex-row items-center gap-10">
            <div className="lg:w-1/2 z-10">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-purple-600 mb-6 shadow-sm">
                <Bot size={32} strokeWidth={2} />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">AI Cover Letter Generator</h3>
              <p className="text-lg text-slate-600 leading-relaxed max-w-lg mb-8">
                Ga perlu bingung nulis kata-kata. AI Jobs Agent membuat cover letter profesional dalam 60 detik, yang disesuaikan secara spesifik dengan job description dan pengalamanmu.
              </p>
              <button className="flex items-center gap-2 font-semibold text-purple-700 bg-white px-6 py-3 rounded-xl border border-purple-100 shadow-sm hover:bg-purple-50 transition-colors">
                Coba Generator <ArrowRight size={18} />
              </button>
            </div>

            {/* Visual Document */}
            <div className="lg:w-1/2 w-full flex justify-center lg:justify-end relative perspective-[1000px]">
              <div className="relative w-64 h-80 bg-white rounded-xl border border-slate-200 shadow-xl p-6 transform rotate-y-[-10deg] rotate-x-[5deg] group-hover:rotate-y-0 group-hover:rotate-x-0 transition-transform duration-500">
                <div className="h-3 w-1/3 bg-slate-800 rounded mb-6"></div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-slate-200 rounded"></div>
                  <div className="h-2 w-full bg-slate-200 rounded"></div>
                  <div className="h-2 w-2/3 bg-slate-200 rounded"></div>
                  <br />
                  <div className="h-2 w-full bg-slate-200 rounded"></div>
                  <div className="h-2 w-full bg-slate-200 rounded"></div>
                  <div className="h-2 w-full bg-slate-200 rounded"></div>
                  <div className="h-2 w-1/2 bg-slate-200 rounded"></div>
                </div>

                {/* Floating Sparkles */}
                <div className="absolute -top-4 -right-4 bg-yellow-100 p-2 rounded-lg shadow-sm border border-yellow-200 animate-bounce">
                  <Bot size={20} className="text-yellow-600" />
                </div>
                <div className="absolute -bottom-2 -left-2 bg-purple-100 p-2 rounded-full shadow-sm border border-purple-200">
                  <div className="text-[10px] font-bold text-purple-600">AI Generated</div>
                </div>
              </div>

              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-200/40 rounded-full blur-[60px] pointer-events-none"></div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};