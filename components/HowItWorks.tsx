import React from 'react';
import { Search, Save, Sparkles, Layout, FileText, CheckSquare, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 lg:py-32 bg-white relative" id="fitur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="text-brand-600 font-bold text-[13px] tracking-widest uppercase mb-3">Cara Kerja</div>
          <h2 className="text-4xl lg:text-[48px] font-bold text-slate-900 mb-6 leading-tight">
            Cari Kerja 3× Lebih Cepat
          </h2>
          <p className="text-lg lg:text-xl text-slate-600">
            Tiga langkah sederhana untuk dapat pekerjaan impian
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          
          {/* Card 1 - Search */}
          <div className="group bg-white rounded-[24px] border border-slate-200 p-8 lg:p-10 hover:-translate-y-2 transition-all duration-300 shadow-[0_12px_48px_rgba(0,0,0,0.04)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.08)] relative overflow-hidden flex flex-col">
             {/* Large Number Background */}
             <div className="absolute top-2 right-6 text-[120px] font-bold text-blue-50/80 leading-none select-none -z-10 group-hover:text-blue-100/80 transition-colors font-sans">01</div>
             
             {/* Icon */}
             <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-inner">
               <Search className="text-blue-600 w-8 h-8" strokeWidth={2.5} />
             </div>

             <h3 className="text-2xl font-bold text-slate-900 mb-4">Search Semua Platform</h3>
             <p className="text-slate-600 leading-relaxed mb-8 flex-1">
               Cari di LinkedIn, JobStreet, Glints, Indeed dalam 1× search. Hemat 2 jam setiap hari.
             </p>

             {/* Mini Mockup */}
             <div className="mt-auto bg-slate-50 rounded-xl border border-slate-100 p-4 transform group-hover:translate-y-[-4px] transition-transform duration-500">
               <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center shadow-sm mb-2">
                 <Search size={14} className="text-slate-400 mr-2" />
                 <div className="h-2 w-24 bg-slate-200 rounded-full"></div>
                 <div className="ml-auto w-6 h-4 bg-blue-100 rounded flex items-center justify-center">
                    <ArrowRight size={10} className="text-blue-600" />
                 </div>
               </div>
               <div className="space-y-2 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-slate-200"></div>
                    <div className="flex-1 space-y-1">
                        <div className="h-1.5 w-20 bg-slate-200 rounded-full opacity-60"></div>
                        <div className="h-1.5 w-12 bg-slate-200 rounded-full opacity-40"></div>
                    </div>
                  </div>
               </div>
             </div>
          </div>

          {/* Card 2 - Save */}
          <div className="group bg-white rounded-[24px] border border-slate-200 p-8 lg:p-10 hover:-translate-y-2 transition-all duration-300 shadow-[0_12px_48px_rgba(0,0,0,0.04)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.08)] relative overflow-hidden flex flex-col">
             <div className="absolute top-2 right-6 text-[120px] font-bold text-brand-50/80 leading-none select-none -z-10 group-hover:text-brand-100/80 transition-colors font-sans">02</div>
             
             <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-inner">
               <Save className="text-brand-600 w-8 h-8" strokeWidth={2.5} />
             </div>

             <h3 className="text-2xl font-bold text-slate-900 mb-4">Save ke Notion</h3>
             <p className="text-slate-600 leading-relaxed mb-8 flex-1">
               One-click save ke Notion workspace. Organize dengan Table, Board, atau Calendar view.
             </p>

             {/* Mini Mockup */}
             <div className="mt-auto bg-slate-50 rounded-xl border border-slate-100 p-4 flex gap-2 transform group-hover:translate-y-[-4px] transition-transform duration-500">
               <div className="flex-1 bg-white rounded-lg border border-slate-200 p-2 shadow-sm flex flex-col gap-2">
                  <div className="w-full h-1.5 bg-brand-200 rounded-full"></div>
                  <div className="w-full h-8 bg-slate-50 rounded border border-slate-100"></div>
                  <div className="w-full h-8 bg-slate-50 rounded border border-slate-100"></div>
               </div>
               <div className="flex-1 bg-white/50 rounded-lg border border-slate-200/50 p-2 shadow-sm flex flex-col gap-2 opacity-60">
                  <div className="w-full h-1.5 bg-blue-200 rounded-full"></div>
                  <div className="w-full h-8 bg-slate-50 rounded border border-slate-100"></div>
               </div>
             </div>
          </div>

          {/* Card 3 - Apply */}
          <div className="group bg-white rounded-[24px] border border-slate-200 p-8 lg:p-10 hover:-translate-y-2 transition-all duration-300 shadow-[0_12px_48px_rgba(0,0,0,0.04)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.08)] relative overflow-hidden flex flex-col">
             <div className="absolute top-2 right-6 text-[120px] font-bold text-green-50/80 leading-none select-none -z-10 group-hover:text-green-100/80 transition-colors font-sans">03</div>
             
             <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-inner">
               <Sparkles className="text-green-600 w-8 h-8" strokeWidth={2.5} />
             </div>

             <h3 className="text-2xl font-bold text-slate-900 mb-4">AI Generates Letter</h3>
             <p className="text-slate-600 leading-relaxed mb-8 flex-1">
               AI bikin cover letter profesional dalam 60 detik. Copy, edit, dan apply!
             </p>

             {/* Mini Mockup */}
             <div className="mt-auto bg-slate-50 rounded-xl border border-slate-100 p-4 relative transform group-hover:translate-y-[-4px] transition-transform duration-500">
               <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm space-y-2.5">
                 <div className="h-1.5 w-1/3 bg-slate-400 rounded-full"></div>
                 <div className="space-y-1.5">
                   <div className="h-1 w-full bg-slate-200 rounded-full"></div>
                   <div className="h-1 w-full bg-slate-200 rounded-full"></div>
                   <div className="h-1 w-4/5 bg-slate-200 rounded-full"></div>
                   <div className="h-1 w-full bg-slate-200 rounded-full"></div>
                 </div>
               </div>
               <div className="absolute -right-1 -bottom-1 bg-green-100 rounded-full p-2 border-4 border-slate-50 shadow-sm animate-bounce">
                 <Sparkles size={14} className="text-green-600" />
               </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};