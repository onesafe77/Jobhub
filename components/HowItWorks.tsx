import React from 'react';
import { Search, Upload, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      icon: <Upload className="text-blue-600 w-7 h-7" strokeWidth={2.5} />,
      title: 'Upload CV',
      description: 'Upload CV kamu dan AI akan menganalisis skills, pengalaman, dan keahlianmu secara otomatis.',
      color: 'from-blue-50 to-blue-100',
      accent: 'bg-blue-100',
    },
    {
      number: '02',
      icon: <Search className="text-brand-600 w-7 h-7" strokeWidth={2.5} />,
      title: 'Cari di LinkedIn & JobStreet',
      description: 'Satu search bar untuk dua platform. Temukan ratusan lowongan yang sesuai profil kamu.',
      color: 'from-brand-50 to-brand-100',
      accent: 'bg-brand-100',
    },
    {
      number: '03',
      icon: <Sparkles className="text-emerald-600 w-7 h-7" strokeWidth={2.5} />,
      title: 'Apply dengan AI',
      description: 'AI generate cover letter, cek ATS score, dan bantu kamu apply lebih cepat dari siapapun.',
      color: 'from-emerald-50 to-emerald-100',
      accent: 'bg-emerald-100',
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-slate-900 relative" id="cara-kerja">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="text-brand-400 font-bold text-sm tracking-widest uppercase mb-4">Cara Kerja</div>
          <h2 className="text-4xl lg:text-[52px] font-[900] text-white leading-[1.1] tracking-tight mb-6">
            3 langkah menuju
            <br />
            pekerjaan impian.
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Dari upload CV sampai terima offer — semuanya bisa dilakukan dari satu dashboard.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group relative bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700/50 p-8 lg:p-10 hover:-translate-y-2 transition-all duration-300 flex flex-col"
            >
              {/* Number */}
              <div className="text-6xl font-[900] text-slate-800 absolute top-4 right-6 select-none group-hover:text-slate-700 transition-colors">
                {step.number}
              </div>

              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl ${step.accent} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {step.icon}
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-slate-400 leading-relaxed flex-1">{step.description}</p>

              {/* Arrow for non-last items */}
              <div className="hidden md:flex items-center justify-end mt-6 text-slate-600 group-hover:text-brand-400 transition-colors">
                <ArrowRight size={20} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> Gratis untuk mulai</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> Tidak perlu kartu kredit</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> Setup dalam 60 detik</span>
          </div>
        </div>

      </div>
    </section>
  );
};