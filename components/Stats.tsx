import React from 'react';
import { Briefcase, Users, Target, Clock, Trophy, Star, Rocket, ShieldCheck, Flag } from 'lucide-react';

export const Stats: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-brand-600 to-purple-600 relative overflow-hidden" id="stats">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      </div>

      {/* Glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-white/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-purple-400/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <h2 className="text-4xl lg:text-[52px] font-bold text-white mb-6 leading-tight">
            Jobs Agent dalam Angka
          </h2>
          <p className="text-lg lg:text-xl text-white/90">
            Data real-time dari platform kami
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 lg:mb-20">

          {/* Stat 1: Jobs */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 flex flex-col items-center text-center shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:bg-white/15 transition-colors duration-300">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6 text-white shadow-inner">
              <Briefcase size={32} strokeWidth={2} />
            </div>
            <div className="font-mono text-5xl font-bold text-white mb-2 tracking-tight">10k+</div>
            <div className="text-lg font-semibold text-white/90 mb-1">Lowongan Aktif</div>
            <div className="text-sm text-white/60">Updated daily</div>
          </div>

          {/* Stat 2: Users */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 flex flex-col items-center text-center shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:bg-white/15 transition-colors duration-300">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6 text-white shadow-inner">
              <Users size={32} strokeWidth={2} />
            </div>
            <div className="font-mono text-5xl font-bold text-white mb-2 tracking-tight">5k+</div>
            <div className="text-lg font-semibold text-white/90 mb-1">Fresh Graduates</div>
            <div className="text-sm text-white/60">Joined this month</div>
          </div>

          {/* Stat 3: Success Rate */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 flex flex-col items-center text-center shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:bg-white/15 transition-colors duration-300">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6 text-white shadow-inner">
              <Target size={32} strokeWidth={2} />
            </div>
            <div className="font-mono text-5xl font-bold text-white mb-2 tracking-tight">92%</div>
            <div className="text-lg font-semibold text-white/90 mb-1">Avg Match Rate</div>
            <div className="text-sm text-white/60">AI-powered matching</div>
          </div>

          {/* Stat 4: Time Saved */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 flex flex-col items-center text-center shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:bg-white/15 transition-colors duration-300">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6 text-white shadow-inner">
              <Clock size={32} strokeWidth={2} />
            </div>
            <div className="font-mono text-5xl font-bold text-white mb-2 tracking-tight">2 Jam</div>
            <div className="text-lg font-semibold text-white/90 mb-1">Hemat Waktu/Hari</div>
            <div className="text-sm text-white/60">vs traditional search</div>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="flex flex-wrap justify-center gap-4 lg:gap-6">
          <div className="bg-white/15 border border-white/25 rounded-2xl px-6 py-4 flex items-center gap-3 shadow-lg hover:bg-white/20 transition-all cursor-default">
            <Trophy className="text-yellow-300" size={24} fill="currentColor" fillOpacity={0.5} />
            <div className="text-white font-medium">
              <div className="text-xs text-white/60 uppercase tracking-wider font-bold">Award</div>
              <div className="text-sm sm:text-base">Product Hunt #1</div>
            </div>
          </div>

          <div className="bg-white/15 border border-white/25 rounded-2xl px-6 py-4 flex items-center gap-3 shadow-lg hover:bg-white/20 transition-all cursor-default">
            <Star className="text-orange-300" size={24} fill="currentColor" fillOpacity={0.5} />
            <div className="text-white font-medium">
              <div className="text-xs text-white/60 uppercase tracking-wider font-bold">Review</div>
              <div className="text-sm sm:text-base">4.9 App Rating</div>
            </div>
          </div>

          <div className="bg-white/15 border border-white/25 rounded-2xl px-6 py-4 flex items-center gap-3 shadow-lg hover:bg-white/20 transition-all cursor-default">
            <Rocket className="text-pink-300" size={24} fill="currentColor" fillOpacity={0.5} />
            <div className="text-white font-medium">
              <div className="text-xs text-white/60 uppercase tracking-wider font-bold">Growth</div>
              <div className="text-sm sm:text-base">Fast Growing 2025</div>
            </div>
          </div>

          <div className="bg-white/15 border border-white/25 rounded-2xl px-6 py-4 flex items-center gap-3 shadow-lg hover:bg-white/20 transition-all cursor-default">
            <ShieldCheck className="text-green-300" size={24} fill="currentColor" fillOpacity={0.5} />
            <div className="text-white font-medium">
              <div className="text-xs text-white/60 uppercase tracking-wider font-bold">Security</div>
              <div className="text-sm sm:text-base">GDPR Compliant</div>
            </div>
          </div>

          <div className="bg-white/15 border border-white/25 rounded-2xl px-6 py-4 flex items-center gap-3 shadow-lg hover:bg-white/20 transition-all cursor-default">
            <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white/40 flex items-center justify-center overflow-hidden">
              <div className="w-full h-1/2 bg-red-600"></div>
              <div className="w-full h-1/2 bg-white"></div>
            </div>
            <div className="text-white font-medium">
              <div className="text-xs text-white/60 uppercase tracking-wider font-bold">Origin</div>
              <div className="text-sm sm:text-base">Made in Indonesia</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};