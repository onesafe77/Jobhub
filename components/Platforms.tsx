import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const platforms = [
  { name: 'LinkedIn', domain: 'linkedin.com', count: '5.2k jobs', color: '#0A66C2' },
  { name: 'Glints', domain: 'glints.com', count: '1.8k jobs', color: '#00C48C' },
  { name: 'JobStreet', domain: 'jobstreet.co.id', count: '3.4k jobs', color: '#FF6000' },
  { name: 'Indeed', domain: 'indeed.com', count: '2.1k jobs', color: '#2164F3' },
  { name: 'Kalibrr', domain: 'kalibrr.com', count: '850 jobs', color: '#6633CC' },
  { name: 'Urbanhire', domain: 'urbanhire.com', count: '420 jobs', color: '#E94B3C' },
  { name: 'KitaLulus', domain: 'kitalulus.com', count: '1.2k jobs', color: '#00AB6B' },
  { name: 'Karir.com', domain: 'karir.com', count: '650 jobs', color: '#0066CC' },
  { name: 'Tech in Asia', domain: 'techinasia.com', count: '320 jobs', color: '#6B3FA0' },
  { name: 'Remote OK', domain: 'remoteok.com', count: '150 jobs', color: '#4A90E2' },
];

const NotionIcon = () => (
  <svg viewBox="0 0 24 24" className="w-12 h-12" fill="currentColor">
    <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28.047-.653 0-.186-.187-.326-.327-.326-.747 0-3.03.233-3.73.233-.28 0-.42-.14-.42-.42 0-.466.233-1.632.233-2.006 0-.093-.093-.233-.233-.233h-9.98c-.094 0-.234.14-.28.326l-3.266 12.316c-.326 1.306-1.073 1.306-1.586 1.166-.233-.046-.513-.046-.606.327l-1.306 4.618c-.094.326 0 .56.326.56 1.773 0 3.73-.513 4.803-.513.56 0 .7.186.7.466l-.606 2.38c-.047.233.14.373.327.373H15.89c.093 0 .233-.14.28-.327l3.265-12.365c.187-.653.607-.7.98-.653.28.047.467.093.513-.326l.793-3.22c.047-.186-.046-.42-.326-.42-1.493 0-3.17.42-4.196.42-.56 0-.746-.187-.746-.467l.56-2.052c.046-.233-.14-.373-.326-.373H5.858c-.093 0-.186.14-.233.327L2.406 15.31c-.046.233.14.373.326.373.56 0 1.353-.14 1.727-.14.56 0 .7.187.7.513l-1.073 4.385c-.047.186 0 .233.187.233 1.4-.233 3.313-.84 3.966-.84.28 0 .513.14.513.467l-.746 3.033c-.047.233.14.373.326.373h5.92c.094 0 .234-.14.28-.327l3.546-13.438c.14-.513.606-.513 1.073-.466.28.047.466.047.513-.327l.746-2.94c.047-.186-.093-.373-.326-.373-1.12 0-3.264.42-3.87.42-.467 0-.7-.186-.7-.466l.606-2.286c.047-.233-.14-.373-.327-.373H6.046c-.094 0-.187.14-.234.327L4.459 4.208Z" />
  </svg>
);

const OpenAIIcon = () => (
  <svg viewBox="0 0 24 24" className="w-12 h-12" fill="currentColor">
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1195 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.3979-.667zM12.0143 5.7595 5.8143 2.3951V.0666a.0758.0758 0 0 1 .038-.0616L10.6876-2.196a4.504 4.504 0 0 1 6.1456 1.6465 4.4944 4.4944 0 0 1 .5346 3.0137l-.142-.0853-4.783-2.763a.7617.7617 0 0 0-.7759 0zm-7.794 8.7196 5.8097-3.3543V5.5476L7.995 4.3643a.0758.0758 0 0 1-.0379-.0616V-1.2949a4.504 4.504 0 0 1 4.504-4.4993 4.4802 4.4802 0 0 1 2.8669 1.0409l-.1419.0804-4.783 2.763a.7712.7712 0 0 0-.3927.6765v6.7321z" transform="translate(1 3)" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-12 h-12">
    <path fill="#4285F4" d="M23.64 12.204c0-.638-.057-1.251-.164-1.84H12v3.481h6.535c-.28 1.5-1.132 2.774-2.411 3.633v3.02h3.904c2.285-2.105 3.612-5.204 3.612-8.294z" />
    <path fill="#34A853" d="M12 24c3.273 0 6.016-1.083 8.02-2.919l-3.904-3.02c-1.086.727-2.476 1.157-4.116 1.157-3.158 0-5.834-2.134-6.79-5.003H1.186v3.136C3.186 21.328 7.286 24 12 24z" />
    <path fill="#FBBC05" d="M5.21 14.215c-.246-.736-.388-1.524-.388-2.336 0-.812.142-1.6.388-2.336V6.407H1.186C.428 7.913 0 9.608 0 12c0 2.392.428 4.088 1.186 5.592l4.024-3.136z" />
    <path fill="#EA4335" d="M12 4.757c1.78 0 3.378.612 4.634 1.812l3.473-3.472C17.994 1.107 15.273 0 12 0 7.286 0 3.186 2.672 1.186 7.407l4.024 3.136c.956-2.869 3.632-5.003 6.79-5.003z" />
  </svg>
);

const ClaudeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-12 h-12" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 21.6C6.698 21.6 2.4 17.302 2.4 12S6.698 2.4 12 2.4 21.6 6.698 21.6 12 17.302 21.6 12 21.6z" opacity="0.2" />
    <path d="M8.5 17h2.5l.5-1.5h3l.5 1.5h2.5L13.5 7h-3L8.5 17zm4.25-6.5.75 2.5h-1.5l.75-2.5z" />
  </svg>
);

const GeminiIcon = () => (
  <svg viewBox="0 0 24 24" className="w-12 h-12">
    <defs>
      <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4E84F8" />
        <stop offset="50%" stopColor="#D6589F" />
        <stop offset="100%" stopColor="#FFC857" />
      </linearGradient>
    </defs>
    <path fill="url(#gemini-gradient)" d="M12,2 L14.5,8 L22,12 L14.5,16 L12,22 L9.5,16 L2,12 L9.5,8 L12,2 Z" />
  </svg>
);

export const Platforms: React.FC = () => {
  return (
    <section className="py-24 lg:py-32 bg-white border-t border-slate-100" id="platform">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-20">
          <div className="text-brand-600 font-bold text-[13px] tracking-wider uppercase mb-3">
            PLATFORM YANG KAMI CARI
          </div>
          <h2 className="text-4xl lg:text-[52px] font-bold text-slate-900 mb-6 leading-tight">
            Search di 10+ Platform Sekaligus
          </h2>
          <p className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Jobs Agent otomatis mencari lowongan dari semua platform job terbesar di Indonesia. Satu search, semua hasil.
          </p>
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-8 max-w-[1200px] mx-auto mb-20 lg:mb-28">
          {platforms.map((platform, i) => (
            <div
              key={i}
              className="group bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-center relative hover:border-blue-300 hover:shadow-[0_12px_24px_rgba(37,99,235,0.08)] hover:-translate-y-1 transition-all duration-300 aspect-[220/140] h-[140px]"
            >
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                <span className="bg-blue-50 text-brand-600 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border border-blue-100">
                  {platform.count}
                </span>
              </div>

              <img
                src={`https://logo.clearbit.com/${platform.domain}?size=160`}
                alt={`${platform.name} logo`}
                className="max-w-[120px] max-h-[50px] object-contain filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.querySelector('.fallback-text')!.classList.remove('hidden');
                }}
              />
              <span className="hidden fallback-text text-lg font-bold text-slate-400 group-hover:text-slate-800 transition-colors">
                {platform.name}
              </span>
            </div>
          ))}
        </div>

        {/* Integrations */}
        <div className="max-w-[1200px] mx-auto">
          <h3 className="text-2xl lg:text-[28px] font-bold text-slate-900 text-center mb-10">
            Integrasi dengan Tools Favoritmu
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-6 justify-center">

            {/* Notion Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <NotionIcon />
                </div>
                <span className="bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase">
                  Popular
                </span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Notion</h4>
              <p className="text-slate-600 leading-relaxed text-sm lg:text-[15px] mb-6 flex-1">
                Save jobs langsung ke Notion. Auto-create database.
              </p>
              <div className="mt-auto flex items-center text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors cursor-pointer">
                Connect Notion <ArrowUpRight size={16} className="ml-1" />
              </div>
            </div>

            {/* OpenAI Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <OpenAIIcon />
                </div>
                <span className="bg-brand-50 text-brand-700 border border-brand-100 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase">
                  AI
                </span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">OpenAI GPT-4</h4>
              <p className="text-slate-600 leading-relaxed text-sm lg:text-[15px] mb-6 flex-1">
                Generasi cover letter pintar & analisis CV.
              </p>
              <div className="mt-auto flex items-center text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors cursor-pointer">
                Learn more <ArrowUpRight size={16} className="ml-1" />
              </div>
            </div>

            {/* Claude Opus Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform duration-300 text-orange-600">
                  <ClaudeIcon />
                </div>
                <span className="bg-orange-50 text-orange-700 border border-orange-100 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase">
                  Smart
                </span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Claude Opus</h4>
              <p className="text-slate-600 leading-relaxed text-sm lg:text-[15px] mb-6 flex-1">
                Deep reasoning untuk analisis company culture & interview.
              </p>
              <div className="mt-auto flex items-center text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors cursor-pointer">
                Learn more <ArrowUpRight size={16} className="ml-1" />
              </div>
            </div>

            {/* Gemini Pro Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <GeminiIcon />
                </div>
                <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase">
                  Google
                </span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Gemini Pro</h4>
              <p className="text-slate-600 leading-relaxed text-sm lg:text-[15px] mb-6 flex-1">
                Review portofolio multimodal (Gambar/PDF) instan.
              </p>
              <div className="mt-auto flex items-center text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors cursor-pointer">
                Learn more <ArrowUpRight size={16} className="ml-1" />
              </div>
            </div>

            {/* Google Workspace Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <GoogleIcon />
                </div>
                <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase">
                  Available
                </span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Workspace</h4>
              <p className="text-slate-600 leading-relaxed text-sm lg:text-[15px] mb-6 flex-1">
                Export ke Google Sheets & Docs untuk tracking.
              </p>
              <div className="mt-auto flex items-center text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors cursor-pointer">
                View integration <ArrowUpRight size={16} className="ml-1" />
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};