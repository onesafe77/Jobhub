import React, { useState, useEffect } from 'react';
import { Search, Sparkles } from 'lucide-react';

interface NavbarProps {
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLoginClick, onSignUpClick }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8 py-4 flex justify-center`}>
      <nav
        className={`
          w-full max-w-7xl rounded-2xl transition-all duration-300 border
          flex items-center justify-between px-6 py-3
          ${scrolled
            ? 'bg-white/80 backdrop-blur-xl border-white/20 shadow-lg shadow-black/5'
            : 'bg-white/40 backdrop-blur-md border-white/30 shadow-sm'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-tr from-brand-400 to-brand-600 rounded-xl blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
            <img src="/logo-icon.png" alt="JobsAgent" className="relative w-11 h-11 object-contain rounded-xl transition-transform group-hover:scale-110" />
          </div>
          <span className="font-black text-[22px] tracking-tighter text-slate-900 leading-none">
            Jobs<span className="text-brand-500">A</span>gent
          </span>
        </div>

        {/* Menu - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-8">
          {['Fitur', 'Harga', 'Tentang'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-600 transition-all group-hover:w-full opacity-0 group-hover:opacity-100"></span>
            </a>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLoginClick}
            className="hidden md:block px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          >
            Masuk
          </button>
          <button
            onClick={onSignUpClick}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-400 text-white text-sm font-semibold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:translate-y-[-1px] transition-all active:scale-95"
          >
            Daftar Gratis
          </button>
        </div>
      </nav>
    </div>
  );
};