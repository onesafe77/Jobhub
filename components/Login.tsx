import React, { useState } from 'react';
import { Sparkles, Linkedin, Eye, EyeOff, Lock, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginProps {
   onSignUpClick: () => void;
   onLoginComplete: () => void;
   onBackToLanding: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSignUpClick, onLoginComplete, onBackToLanding }) => {
   const [showPassword, setShowPassword] = useState(false);
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithPassword({
         email,
         password,
      });

      if (error) {
         setError(error.message);
         setLoading(false);
      } else {
         onLoginComplete();
      }
   };

   const handleSocialLogin = async (provider: 'google' | 'linkedin') => {
      const { error } = await supabase.auth.signInWithOAuth({
         provider: provider as any,
      });
      if (error) setError(error.message);
   };

   return (
      <div className="min-h-screen flex bg-[#FAFAFA] font-sans">
         {/* LEFT SIDE - Premium Abstract Dark */}
         <div className="hidden lg:flex lg:w-[45%] bg-[#0B0F19] relative overflow-hidden flex-col justify-between p-12 lg:p-20 text-white border-r border-white/5 shadow-2xl z-10">
            {/* Elegant glowing orbs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
               <div className="absolute top-[-15%] right-[-10%] w-[70%] h-[70%] bg-brand-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-10000"></div>
               <div className="absolute bottom-[-10%] left-[-20%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[100px] mix-blend-screen"></div>
               <div className="absolute top-[40%] left-[20%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[80px] mix-blend-screen"></div>
            </div>

            <div className="relative z-10 animate-fade-in-up">
               <div className="flex items-center gap-3 mb-16">
                  <div className="bg-white p-3 rounded-2xl shadow-xl shadow-brand-500/10 inline-flex">
                     <img src="/logo.png" alt="JobsAgent Logo" className="w-[140px] h-auto object-contain" />
                  </div>
               </div>

               <h1 className="text-5xl xl:text-6xl font-extrabold mb-8 leading-[1.1] tracking-tight">
                  Welcome <br /> Back, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">Future Leader.</span>
               </h1>
               <p className="text-xl text-slate-400 max-w-md leading-relaxed mb-12 font-medium">
                  Lanjutkan langkahmu menuju karir impian. Data, insight, dan lowongan eksklusif menantimu.
               </p>
            </div>

            {/* Glassmorphism Testimonial */}
            <div className="relative z-10 mt-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
               <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 max-w-lg shadow-[0_8px_32px_rgba(0,0,0,0.2)] relative overflow-hidden group hover:bg-white/[0.05] transition-all duration-500">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-indigo-500 opacity-50"></div>
                  <div className="flex items-center gap-1.5 text-brand-400 mb-5">
                     {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-lg">★</span>)}
                  </div>
                  <p className="text-lg font-medium mb-8 leading-relaxed text-slate-200">
                     "Jobs Agent menyederhanakan proses lamaranku. UI-nya premium, rekomendasinya akurat, dan aku bisa track semuanya tanpa stres."
                  </p>
                  <div className="flex items-center gap-4">
                     <div className="relative">
                        <img src="https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80" alt="Budi" className="w-14 h-14 rounded-full border-2 border-brand-500/30 object-cover" />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-[#0B0F19] rounded-full"></div>
                     </div>
                     <div>
                        <div className="font-bold text-white text-base">Budi Santoso</div>
                        <div className="text-sm text-brand-300 font-medium">Backend Engineer</div>
                     </div>
                  </div>
               </div>

               <div className="text-sm text-slate-500 font-medium mt-12 flex items-center justify-between">
                  <span>© 2026 Jobs Agent Inc.</span>
                  <div className="flex gap-4">
                     <a href="#" className="hover:text-white transition-colors">Privacy</a>
                     <a href="#" className="hover:text-white transition-colors">Terms</a>
                  </div>
               </div>
            </div>
         </div>

         {/* RIGHT SIDE - Clean, Minimalist Form */}
         <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 lg:p-24 relative overflow-hidden bg-white">
            <button
               onClick={onBackToLanding}
               className="absolute top-8 left-8 text-slate-400 hover:text-slate-900 flex items-center gap-2 font-bold text-sm lg:hidden transition-colors bg-slate-100 hover:bg-slate-200 py-2 px-4 rounded-full"
            >
               <ArrowLeft size={16} /> Kembali
            </button>

            {/* Soft background shape for form side */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-50 rounded-full blur-[120px] opacity-60 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

            <div className="w-full max-w-[420px] relative z-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
               <div className="lg:hidden flex items-center gap-3 mb-12 justify-center">
                  <img src="/logo.png" alt="JobsAgent Logo" className="w-[140px] h-auto object-contain mix-blend-multiply" />
               </div>

               <div className="mb-10 text-center lg:text-left">
                  <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Sign In</h2>
                  <p className="text-slate-500 text-base font-medium">
                     Belum punya akun? <button onClick={onSignUpClick} className="text-brand-600 font-bold hover:text-brand-700 hover:underline transition-all">Daftar Sekarang</button>
                  </p>
               </div>

               <div className="space-y-4 mb-8">
                  <button
                     onClick={() => handleSocialLogin('google')}
                     disabled={loading}
                     className="w-full h-14 bg-white border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] text-[15px] shadow-sm disabled:opacity-70 group"
                  >
                     <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                     Lanjutkan dengan Google
                  </button>
               </div>

               <div className="relative flex py-2 items-center mb-8">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Atau dengan Email</span>
                  <div className="flex-grow border-t border-slate-100"></div>
               </div>

               {error && (
                  <div className="mb-6 mx-2 p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 text-sm font-semibold rounded-2xl flex items-start gap-3">
                     <div className="mt-0.5">⚠️</div>
                     <div>{error}</div>
                  </div>
               )}

               <form onSubmit={handleLogin} className="space-y-6 mb-8 group">
                  <div className="relative">
                     <input
                        type="email"
                        id="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder=" "
                        className="peer w-full h-14 px-5 rounded-2xl border-2 border-slate-100 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-slate-900 font-semibold bg-white pt-4"
                     />
                     <label htmlFor="email" className="absolute left-5 top-4 text-slate-400 font-medium text-base transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-brand-600 peer-focus:font-bold peer-valid:top-1.5 peer-valid:text-xs peer-valid:text-slate-500 pointer-events-none">
                        Email Address
                     </label>
                  </div>

                  <div className="relative">
                     <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder=" "
                        className="peer w-full h-14 px-5 pr-12 rounded-2xl border-2 border-slate-100 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-slate-900 font-semibold bg-white pt-4"
                     />
                     <label htmlFor="password" className="absolute left-5 top-4 text-slate-400 font-medium text-base transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-brand-600 peer-focus:font-bold peer-valid:top-1.5 peer-valid:text-xs peer-valid:text-slate-500 pointer-events-none">
                        Password
                     </label>
                     <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all"
                     >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                     </button>
                  </div>

                  <div className="flex justify-end pb-2">
                     <a href="#" className="text-sm font-bold text-slate-500 hover:text-brand-600 transition-colors">Lupa Password?</a>
                  </div>

                  <button
                     type="submit"
                     disabled={loading}
                     className="w-full h-14 bg-slate-900 hover:bg-brand-600 text-white rounded-2xl font-bold text-[15px] shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(79,70,229,0.25)] transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:hover:bg-slate-900 disabled:shadow-none"
                  >
                     {loading ? (
                        <Loader2 size={20} className="animate-spin" />
                     ) : (
                        <>
                           Masuk Sekarang <ArrowRight size={18} className="opacity-80" />
                        </>
                     )}
                  </button>
               </form>

               <div className="flex items-center justify-center gap-2 text-slate-400 text-[11px] font-extrabold uppercase tracking-widest mt-12 bg-slate-50 py-2.5 px-4 rounded-full w-max mx-auto">
                  <Lock size={12} className="text-slate-400" />
                  <span className="mt-px">Bank-Grade Encryption</span>
               </div>
            </div>
         </div>
      </div>
   );
};