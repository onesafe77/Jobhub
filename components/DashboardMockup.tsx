import React from 'react';
import { Briefcase, MapPin, Building2, Zap, MoreHorizontal, Bell, Search, Menu } from 'lucide-react';

export const DashboardMockup: React.FC = () => {
  return (
    // The container establishes the 3D space
    <div className="relative w-full max-w-[600px] aspect-[4/3] group perspective-[2000px]">

      {/* Background Decorative Blob behind the mockup */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-200/40 via-purple-200/40 to-pink-200/40 blur-[60px] rounded-full pointer-events-none"></div>

      {/* Main Dashboard Card - Rotated in 3D */}
      <div className="absolute inset-0 bg-white rounded-2xl shadow-2xl shadow-blue-900/20 border border-slate-200/60 overflow-hidden transform transition-transform duration-700 ease-out lg:rotate-y-[-12deg] lg:rotate-x-[5deg] group-hover:rotate-y-[-8deg] group-hover:rotate-x-[2deg]">

        {/* Fake Browser Header */}
        <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
          </div>
          <div className="ml-4 flex-1 max-w-[200px] h-6 bg-white rounded-md border border-slate-200 flex items-center px-2 text-[10px] text-slate-400">
            jobsagent.id/dashboard
          </div>
        </div>

        {/* Dashboard Layout */}
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-16 sm:w-48 bg-slate-50 border-r border-slate-100 flex flex-col py-4 gap-1">
            <div className="px-4 mb-4 flex items-center justify-center">
              <img src="/logo.png" alt="JobsAgent" className="w-[100px] h-auto object-contain mix-blend-multiply" />
            </div>
            {['Dashboard', 'Pekerjaan', 'Aplikasi', 'Interview'].map((item, idx) => (
              <div key={item} className={`mx-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-3 cursor-pointer ${idx === 1 ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>
                <div className={`w-2 h-2 rounded-full ${idx === 1 ? 'bg-brand-600' : 'bg-transparent'}`}></div>
                <span className="hidden sm:inline">{item}</span>
              </div>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white p-6 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Lowongan Terbaru</h3>
                <p className="text-xs text-slate-500">Rekomendasi berdasarkan profilmu</p>
              </div>
              <div className="flex gap-2">
                <div className="p-2 rounded-full hover:bg-slate-50 border border-slate-100 text-slate-400">
                  <Search size={16} />
                </div>
                <div className="p-2 rounded-full hover:bg-slate-50 border border-slate-100 text-slate-400 relative">
                  <Bell size={16} />
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* List Items */}
            <div className="space-y-3">
              {[
                { role: 'Frontend Engineer', company: 'Gojek', type: 'Fulltime', logo: 'bg-green-600' },
                { role: 'UI/UX Designer', company: 'Traveloka', type: 'Remote', logo: 'bg-blue-500' },
                { role: 'Product Manager', company: 'Shopee', type: 'Hybrid', logo: 'bg-orange-500' },
                { role: 'Data Analyst', company: 'Tokopedia', type: 'Fulltime', logo: 'bg-green-500' },
              ].map((job, i) => (
                <div key={i} className="flex items-center p-3 rounded-xl border border-slate-100 hover:border-brand-100 hover:bg-blue-50/30 transition-colors group/item">
                  <div className={`w-10 h-10 rounded-lg ${job.logo} text-white flex items-center justify-center font-bold text-sm mr-3 shadow-sm`}>
                    {job.company[0]}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-slate-800">{job.role}</h4>
                    <p className="text-xs text-slate-500">{job.company} • {job.type}</p>
                  </div>
                  <button className="text-xs font-medium text-brand-600 bg-brand-50 px-3 py-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity">
                    Lihat
                  </button>
                </div>
              ))}
            </div>

            {/* Visual Filler for 'More' */}
            <div className="mt-4 flex justify-center">
              <div className="h-1 w-20 bg-slate-100 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Card 1: Match Score (Top Right) */}
      <div className="absolute -right-4 top-10 lg:right-[-40px] lg:top-[40px] bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl shadow-brand-900/10 border border-white/50 animate-float z-20 w-48">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-slate-500">Match Score</div>
          <Zap size={14} className="text-yellow-500 fill-yellow-500" />
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-slate-800">92%</span>
          <span className="text-xs text-green-600 font-medium mb-1.5 flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>
            High
          </span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
          <div className="bg-gradient-to-r from-green-400 to-brand-500 w-[92%] h-full rounded-full"></div>
        </div>
      </div>

      {/* Floating Card 2: Job Card (Bottom Left) */}
      <div className="absolute -left-4 bottom-20 lg:left-[-30px] lg:bottom-[80px] bg-white p-4 rounded-xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] border border-slate-100 animate-float-delayed z-30 w-64 max-w-[90vw]">
        <div className="flex gap-3 items-start">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Building2 size={20} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">React Developer</div>
            <div className="text-xs text-slate-500 mt-0.5">PT Teknologi Maju</div>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <span className="px-2 py-1 rounded-md bg-slate-50 text-[10px] font-medium text-slate-600 border border-slate-100">IDR 12jt - 18jt</span>
          <span className="px-2 py-1 rounded-md bg-blue-50 text-[10px] font-medium text-blue-600 border border-blue-100">Jakarta</span>
        </div>
        <div className="mt-3 w-full py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium text-center shadow-lg shadow-slate-900/20 cursor-pointer hover:scale-[1.02] transition-transform">
          Apply Now
        </div>
      </div>

    </div>
  );
};