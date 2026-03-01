import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';

export const Pricing: React.FC = () => {
  return (
    <section className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden" id="harga">
      {/* Background decoration */}
       <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
       <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-50/50 rounded-full blur-3xl pointer-events-none opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <h2 className="text-4xl lg:text-[52px] font-bold text-slate-900 mb-6 leading-tight">
            Pilih Paket yang Sesuai
          </h2>
          <p className="text-lg lg:text-xl text-slate-600">
            Mulai gratis, upgrade kapanpun
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1120px] mx-auto items-start">
            
            {/* Free Card */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300">
                <div className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-4">Free</div>
                <div className="flex items-baseline mb-2">
                    <span className="text-[48px] font-bold text-slate-900 font-mono tracking-tight">Rp 0</span>
                    <span className="text-slate-500 ml-2">/bulan</span>
                </div>
                <p className="text-slate-600 mb-8 min-h-[48px] flex items-center">Untuk mencoba fitur dasar</p>
                
                <div className="space-y-4 mb-8">
                    {[
                        { text: '50 tokens per hari', included: true },
                        { text: 'Search 3 platform', included: true },
                        { text: 'Save max 5 jobs', included: true },
                        { text: 'AI Cover Letter', included: false },
                        { text: 'ATS Scanner', included: false },
                    ].map((feature, i) => (
                        <div key={i} className={`flex items-center gap-3 text-sm ${feature.included ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                            {feature.included ? (
                                <Check size={18} className="text-green-500 flex-shrink-0" />
                            ) : (
                                <X size={18} className="text-slate-300 flex-shrink-0" />
                            )}
                            {feature.text}
                        </div>
                    ))}
                </div>

                <button className="w-full py-3 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                    Mulai Gratis
                </button>
            </div>

            {/* Starter Card (Featured) */}
            <div className="bg-white rounded-2xl p-8 border-2 border-brand-500 shadow-xl relative transform md:-translate-y-4 md:scale-105 z-10">
                <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-1/2">
                    <span className="bg-brand-600 text-white px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-sm flex items-center gap-1">
                        <Sparkles size={10} fill="currentColor" /> Paling Populer
                    </span>
                </div>
                
                <div className="text-[13px] font-bold text-brand-600 uppercase tracking-wider mb-4">Starter</div>
                <div className="flex items-baseline mb-2">
                    <span className="text-[48px] font-bold text-brand-600 font-mono tracking-tight">Rp 29.000</span>
                    <span className="text-slate-500 ml-2">/bulan</span>
                </div>
                <p className="text-slate-600 mb-8 min-h-[48px] flex items-center">Paket terbaik untuk fresh graduates</p>
                
                <div className="space-y-4 mb-8">
                    {[
                        { text: 'Unlimited tokens', included: true },
                        { text: 'Search 10+ platform', included: true },
                        { text: 'Save unlimited jobs', included: true },
                        { text: 'AI Cover Letter (20/bln)', included: true },
                        { text: 'ATS Scanner Basic', included: true },
                    ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                            <Check size={18} className="text-green-500 flex-shrink-0" strokeWidth={3} />
                            {feature.text}
                        </div>
                    ))}
                </div>

                <button className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-semibold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-200">
                    Mulai 7 Hari Gratis
                </button>
            </div>

             {/* Pro Card */}
             <div className="bg-white rounded-2xl p-8 border border-purple-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-[13px] font-bold text-purple-600 uppercase tracking-wider">Pro</div>
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                            💎 Pro
                        </span>
                    </div>
                    
                    <div className="flex items-baseline mb-2">
                        <span className="text-[48px] font-bold text-purple-600 font-mono tracking-tight">Rp 49.000</span>
                        <span className="text-slate-500 ml-2">/bulan</span>
                    </div>
                    <p className="text-slate-600 mb-8 min-h-[48px] flex items-center">Fitur lengkap untuk power user</p>
                    
                    <div className="space-y-4 mb-8">
                        {[
                            { text: 'Semua fitur Starter', included: true },
                            { text: 'Unlimited AI Cover Letter', included: true },
                            { text: 'ATS Scanner Premium', included: true },
                            { text: 'Auto-Apply Bot', included: true },
                            { text: 'Priority Support', included: true },
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-slate-700">
                                <Check size={18} className="text-purple-600 flex-shrink-0" />
                                {feature.text}
                            </div>
                        ))}
                    </div>

                    <button className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all duration-200">
                        Upgrade to Pro
                    </button>
                </div>
            </div>

        </div>
      </div>
    </section>
  );
};