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
      <div className="min-h-screen flex bg-white font-sans animate-fade-in">
         {/* LEFT SIDE - 50% */}
         <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-700 to-indigo-800 relative overflow-hidden flex-col justify-between p-16 text-white">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
               <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-purple-500 rounded-full blur-[100px]"></div>
               <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-12">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
                     <Sparkles size={20} fill="currentColor" className="text-white" />
                  </div>
                  <span className="font-bold text-2xl tracking-tight">JobHub</span>
               </div>

               <h1 className="text-5xl font-extrabold mb-6 leading-[1.15] tracking-tight">
                  Welcome Back,<br />Future Leader!
               </h1>
               <p className="text-xl text-blue-100 max-w-lg leading-relaxed mb-10 font-medium">
                  Lanjutkan pencarian karirmu. Cek status lamaran, update profil, dan temukan peluang baru hari ini.
               </p>

               <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-md shadow-2xl relative overflow-hidden group hover:bg-white/15 transition-colors mt-auto">
                  <div className="flex items-center gap-1 text-yellow-300 mb-3">
                     {[1, 2, 3, 4, 5].map(i => <span key={i}>★</span>)}
                  </div>
                  <p className="text-lg font-medium italic mb-6 leading-relaxed text-white">"Platform ini bener-bener ngebantu aku tracking semua lamaran tanpa ribet buka banyak tab."</p>
                  <div className="flex items-center gap-4">
                     <img src="https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80" alt="Budi" className="w-12 h-12 rounded-full border-2 border-white/30" />
                     <div>
                        <div className="font-bold text-white">Budi Santoso</div>
                        <div className="text-sm text-blue-200 font-medium">Backend Engineer at Tokopedia</div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="relative z-10 text-sm text-blue-200/80 font-medium mt-12">
               © 2026 JobHub Inc. All rights reserved.
            </div>
         </div>

         {/* RIGHT SIDE - 50% */}
         <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white relative">
            <button
               onClick={onBackToLanding}
               className="absolute top-8 left-8 text-slate-400 hover:text-slate-600 flex items-center gap-2 font-bold text-sm lg:hidden"
            >
               <ArrowLeft size={16} /> Back
            </button>

            <div className="w-full max-w-[480px]">
               <div className="lg:hidden flex items-center gap-2 mb-10 text-brand-600 justify-center">
                  <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
                     <Sparkles size={16} fill="currentColor" />
                  </div>
                  <span className="font-bold text-xl tracking-tight text-slate-900">JobHub</span>
               </div>

               <div className="mb-8 text-center lg:text-left">
                  <h2 className="text-[32px] font-bold text-slate-900 mb-3 tracking-tight">Masuk ke JobHub</h2>
                  <p className="text-slate-600 text-base">
                     Belum punya akun? <button onClick={onSignUpClick} className="text-brand-600 font-bold hover:text-brand-700 hover:underline transition-all">Daftar Gratis</button>
                  </p>
               </div>

               <div className="space-y-3 mb-8">
                  <button
                     onClick={() => handleSocialLogin('linkedin')}
                     disabled={loading}
                     className="w-full h-[56px] bg-[#0A66C2] hover:bg-[#004182] text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md active:scale-[0.99] text-[15px] disabled:opacity-70"
                  >
                     <Linkedin size={20} fill="currentColor" />
                     Masuk dengan LinkedIn
                  </button>
                  <button
                     onClick={() => handleSocialLogin('google')}
                     disabled={loading}
                     className="w-full h-[56px] bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.99] text-[15px] disabled:opacity-70"
                  >
                     <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
                     Masuk dengan Google
                  </button>
               </div>

               <div className="relative flex py-2 items-center mb-8">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium uppercase tracking-wider">atau dengan email</span>
                  <div className="flex-grow border-t border-slate-200"></div>
               </div>

               {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl">
                     {error}
                  </div>
               )}

               <form onSubmit={handleLogin} className="space-y-5 mb-8">
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                     <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full h-[52px] px-4 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900 bg-slate-50/50 focus:bg-white"
                     />
                  </div>
                  <div>
                     <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-bold text-slate-700">Password</label>
                        <a href="#" className="text-sm font-bold text-brand-600 hover:text-brand-700 hover:underline">Lupa Password?</a>
                     </div>
                     <div className="relative">
                        <input
                           type={showPassword ? "text" : "password"}
                           required
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           placeholder="••••••••"
                           className="w-full h-[52px] px-4 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900 pr-12 bg-slate-50/50 focus:bg-white"
                        />
                        <button
                           type="button"
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                           {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                     </div>
                  </div>

                  <button
                     type="submit"
                     disabled={loading}
                     className="w-full h-[56px] bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-brand-500/30 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:transform-none"
                  >
                     {loading ? (
                        <>
                           <Loader2 size={20} className="animate-spin" />
                        </>
                     ) : (
                        <>
                           Masuk <ArrowRight size={20} />
                        </>
                     )}
                  </button>
               </form>

               <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <Lock size={12} /> Secure & Encrypted
               </div>
            </div>
         </div>
      </div>
   );
};