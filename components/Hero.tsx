import React from 'react';
import { Search, ArrowRight, Trophy, Star } from 'lucide-react';
import { DashboardMockup } from './DashboardMockup';

export const Hero: React.FC = () => {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        
        {/* LEFT SIDE: Content */}
        <div className="flex flex-col items-start max-w-2xl mx-auto lg:mx-0 z-20">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-brand-600 text-xs font-bold tracking-wide uppercase mb-8 shadow-sm hover:bg-blue-100 transition-colors cursor-default">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse"></span>
            Hemat 2 Jam Setiap Hari
          </div>

          {/* Headline */}
          <h1 className="text-5xl lg:text-[72px] leading-[1.1] font-bold text-slate-900 tracking-tight mb-6">
            Cari Kerja di 10+ Platform, Cukup{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600">
              1× Search
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg lg:text-xl text-slate-500 mb-10 leading-relaxed max-w-lg">
            AI-powered job search untuk fresh graduates. Aggregasi LinkedIn, JobStreet, Glints, dan lainnya dalam satu tempat dashboard pintar.
          </p>

          {/* STATS ABOVE BUTTON */}
          <div className="flex flex-wrap items-center gap-8 mb-8 animate-fade-in-up">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-slate-900 tracking-tight font-mono">10k+</span>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Lowongan</span>
            </div>
            <div className="w-px h-10 bg-slate-200"></div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-slate-900 tracking-tight font-mono">5k+</span>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Users</span>
            </div>
            <div className="w-px h-10 bg-slate-200"></div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-slate-900 tracking-tight font-mono">92%</span>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Match Rate</span>
            </div>
          </div>

          {/* Search Bar (The "Button" Area) */}
          <div className="w-full relative group z-30">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-purple-600 rounded-2xl opacity-20 blur group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center bg-white rounded-xl p-2 shadow-xl shadow-blue-900/5 border border-slate-100">
              <Search className="ml-4 text-slate-400" size={24} />
              <input 
                type="text" 
                placeholder="Frontend Developer Jakarta" 
                className="w-full px-4 py-4 text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
              <button className="hidden sm:flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-8 py-3.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg whitespace-nowrap">
                Cari Pekerjaan
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
          
          {/* Mobile Search Button (Visible only on small screens) */}
          <button className="mt-4 w-full sm:hidden flex items-center justify-center gap-2 bg-brand-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg">
             Cari Pekerjaan <ArrowRight size={18} />
          </button>

          {/* Badges / Trust Line */}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-slate-500">
             <span className="flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 rounded-full border border-orange-100">
                <Trophy size={14} className="fill-orange-500 text-orange-500" />
                Product Hunt #1
            </span>
            <span className="flex items-center gap-2">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                4.9 Rating
            </span>
             <span className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-slate-100 relative overflow-hidden shadow-sm">
                     <div className="absolute bottom-0 w-full h-1/2 bg-white"></div>
                </div>
                Made in Indonesia
            </span>
          </div>
        </div>

        {/* RIGHT SIDE: 3D Mockup */}
        <div className="relative lg:h-[600px] flex items-center justify-center lg:justify-end perspective-container">
          <DashboardMockup />
        </div>

      </div>
    </section>
  );
};