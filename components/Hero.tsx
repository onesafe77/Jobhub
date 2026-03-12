import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onSignUpClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSignUpClick }) => {
  return (
    <section className="relative w-full pt-36 pb-24 lg:pt-48 lg:pb-36 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-100/30 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">

        {/* Platform Badges */}
        <div className="flex items-center justify-center gap-3 mb-10 animate-fade-in-up">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
            <div className="w-5 h-5 rounded bg-[#0A66C2] flex items-center justify-center">
              <span className="text-white text-[10px] font-black">in</span>
            </div>
            <span className="text-sm font-bold text-slate-700">LinkedIn</span>
          </div>
          <span className="text-slate-300 font-bold">+</span>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
            <div className="w-5 h-5 rounded bg-[#1D2B7B] flex items-center justify-center">
              <span className="text-white text-[10px] font-black">JS</span>
            </div>
            <span className="text-sm font-bold text-slate-700">JobStreet</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-[80px] leading-[1.05] font-[900] text-slate-900 tracking-tight mb-8">
          Cari kerja di 2 platform.
          <br />
          <span className="text-brand-600">Satu dashboard.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg lg:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
          Upload CV, dapatkan AI match score, generate cover letter, dan track semua lamaran — semua dari satu tempat.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onSignUpClick}
            className="px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-brand-600/20 hover:shadow-brand-600/30 flex items-center gap-3 active:scale-[0.97]"
          >
            Mulai Gratis
            <ArrowRight size={20} strokeWidth={2.5} />
          </button>
          <a href="#fitur" className="px-8 py-4 text-slate-600 hover:text-slate-900 font-semibold text-lg transition-colors flex items-center gap-2">
            Lihat Fitur
            <ArrowRight size={18} />
          </a>
        </div>

        {/* Powered By Pills */}
        <div className="flex flex-col items-center justify-center pt-8 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Integrasi dengan AI Terbaik</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">

            {/* ChatGPT */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all">
              <img src="/chatgpt.jpg" alt="ChatGPT" className="w-5 h-5 object-contain" />
              <span className="text-slate-700 font-bold">ChatGPT</span>
            </div>

            {/* Claude */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#cc785c]"><path d="M12 2v20M19.071 4.929l-14.142 14.142M22 12H2M19.071 19.071L4.929 4.929" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="text-slate-700 font-bold">Claude</span>
            </div>

            {/* Gemini */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all">
              <svg viewBox="0 0 24 24" fill="url(#gemini-gradient)" className="w-5 h-5">
                <defs>
                  <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4285F4" />
                    <stop offset="50%" stopColor="#9B72CB" />
                    <stop offset="100%" stopColor="#D96570" />
                  </linearGradient>
                </defs>
                <path d="M12 0c0 6.627 5.373 12 12 12-6.627 0-12 5.373-12 12C12 17.373 6.627 12 0 12 6.627 12 12 6.627 12 0z" />
              </svg>
              <span className="text-slate-700 font-bold">Gemini</span>
            </div>

            {/* Notion */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" alt="Notion" className="w-5 h-5 object-contain" />
              <span className="text-slate-700 font-bold">Notion</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};