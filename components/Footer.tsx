import React from 'react';
import { Sparkles, Linkedin, Twitter, Instagram, ArrowRight, ShieldCheck, CheckCircle2, Trophy, Star } from 'lucide-react';

const TikTokIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 pt-20 pb-8 border-t border-slate-800">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* TOP SECTION: 4 COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">

          {/* COLUMN 1: BRAND */}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2.5 mb-6 text-white group cursor-default">
              <img src="/logo-icon.png" alt="JobsAgent" className="w-12 h-12 object-contain rounded-xl group-hover:scale-105 transition-transform" />
              <div className="flex flex-col">
                <span className="font-extrabold text-[20px] tracking-tight leading-tight">
                  <span className="text-white">Jobs</span><span style={{ color: '#00B4D8' }}>A</span><span className="text-white">gen</span><span style={{ color: '#00B4D8' }}>t</span>
                </span>
                <span className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase">AI-Powered Career Network</span>
              </div>
            </div>
            <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-[280px]">
              AI-powered job search untuk fresh graduates di Indonesia.
            </p>
            <div className="flex gap-4">
              {[
                { icon: <Linkedin size={20} />, href: '#' },
                { icon: <Twitter size={20} />, href: '#' },
                { icon: <Instagram size={20} />, href: '#' },
                { icon: <TikTokIcon size={20} />, href: '#' }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-9 h-9 bg-slate-800 text-white rounded-lg flex items-center justify-center hover:bg-brand-600 hover:scale-110 transition-all duration-300 shadow-sm"
                  aria-label={`Social link ${i}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* COLUMN 2: PRODUCT */}
          <div>
            <h4 className="text-white font-semibold text-[15px] uppercase tracking-wider mb-6">Product</h4>
            <ul className="space-y-4">
              {['Fitur', 'Harga', 'Platform', 'Integrasi', 'API Documentation', 'Roadmap'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors text-base block hover:translate-x-1 duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: COMPANY */}
          <div>
            <h4 className="text-white font-semibold text-[15px] uppercase tracking-wider mb-6">Company</h4>
            <ul className="space-y-4">
              {['Tentang Kami', 'Blog', 'Karir', 'Brand Assets', 'Kontak', 'Media Kit'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors text-base flex items-center gap-2 group hover:translate-x-1 duration-200">
                    {item}
                    {item === 'Karir' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-900 text-brand-300 border border-brand-700/50 group-hover:bg-brand-800 transition-colors">
                        WE'RE HIRING
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: RESOURCES */}
          <div>
            <h4 className="text-white font-semibold text-[15px] uppercase tracking-wider mb-6">Resources</h4>
            <ul className="space-y-4">
              {['Help Center', 'FAQ', 'Tutorial', 'Community', 'Status', 'Changelog'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors text-base block hover:translate-x-1 duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* MIDDLE SECTION: NEWSLETTER */}
        <div className="flex flex-col items-center text-center mb-16 px-4">
          <h3 className="text-2xl font-bold text-white mb-2">Stay Updated</h3>
          <p className="text-slate-400 text-base mb-8">
            Dapatkan tips job search dan update produk terbaru
          </p>

          <div className="w-full max-w-[500px] relative">
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full h-[52px] bg-slate-800 border border-slate-700 rounded-xl px-4 pr-36 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
            <button className="absolute right-1 top-1 bottom-1 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-brand-900/20">
              Subscribe
              <ArrowRight size={16} />
            </button>
          </div>
          <p className="text-slate-500 text-xs mt-3">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>

        {/* TRUST BADGES */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-10 border-t border-slate-800/50 pt-10">
          {[
            { icon: <ShieldCheck size={16} />, text: '256-bit Encryption' },
            { icon: <CheckCircle2 size={16} />, text: 'GDPR Compliant' },
            { icon: <Trophy size={16} />, text: '#1 Job Search App' },
            { icon: <Star size={16} />, text: '4.9/5.0 Rating' },
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-500 text-[13px] font-medium select-none">
              <span className="text-slate-400">{badge.icon}</span>
              {badge.text}
            </div>
          ))}
        </div>

        {/* BOTTOM SECTION */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-500 text-sm order-2 md:order-1">
            &copy; 2026 Jobs Agent. All rights reserved.
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-8 order-1 md:order-2">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Sitemap'].map((link) => (
              <a key={link} href="#" className="text-slate-500 hover:text-slate-300 hover:underline text-sm transition-colors">
                {link}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-sm order-3">
            <span className="text-lg leading-none">🇮🇩</span>
            <span>Made with <span className="text-red-500 animate-pulse">❤️</span> in Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
};