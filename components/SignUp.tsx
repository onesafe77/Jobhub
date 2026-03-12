import React, { useState } from 'react';
import { Sparkles, Check, Linkedin, Eye, EyeOff, Lock, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SignUpProps {
   onLoginClick: () => void;
   onSignUpComplete: () => void;
   onBackToLanding?: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onLoginClick, onSignUpComplete, onBackToLanding }) => {
   const [showPassword, setShowPassword] = useState(false);
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [fullName, setFullName] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const handleSignUp = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signUp({
         email,
         password,
         options: {
            data: {
               full_name: fullName,
            },
         },
      });

      if (error) {
         setError(error.message);
         setLoading(false);
      } else {
         // In a real app, you might want to show a message about email verification
         // for now, we'll assume the user is signed up and triggers the callback
         onSignUpComplete();
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
               <div className="absolute top-[10%] left-[-10%] w-[60%] h-[60%] bg-brand-400/15 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-10000"></div>
               <div className="absolute bottom-[-10%] right-[-20%] w-[70%] h-[70%] bg-brand-600/15 rounded-full blur-[100px] mix-blend-screen"></div>
            </div>

            <div className="relative z-10 animate-fade-in-up">
               <div className="flex items-center gap-3 mb-16">
                  <img src="/logo-icon.png" alt="JobsAgent" className="w-14 h-14 object-contain rounded-2xl shadow-lg" />
                  <div className="flex flex-col">
                     <span className="font-extrabold text-[24px] tracking-tight leading-tight">
                        <span className="text-white">Jobs</span><span style={{ color: '#00B4D8' }}>A</span><span className="text-white">gen</span><span style={{ color: '#00B4D8' }}>t</span>
                     </span>
                     <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">AI-Powered Career Network</span>
                  </div>
               </div>

               <h1 className="text-5xl xl:text-6xl font-extrabold mb-8 leading-[1.1] tracking-tight">
                  Join 5,000+ <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-300">Future Talents.</span>
               </h1>
               <p className="text-xl text-slate-400 max-w-md leading-relaxed mb-12 font-medium">
                  Akses jutaan lowongan dari 10+ platform dalam satu dashboard yang pintar. Gratis selamanya untuk mulai.
               </p>

               <div className="space-y-6 mb-16">
                  {[
                     { text: 'Akses penuh ke 50 pencarian pertama', icon: '✨' },
                     { text: 'Tidak wajib kartu kredit sekarang', icon: '💳' },
                     { text: 'Proses setup super kilat dalam 2 menit', icon: '⚡' }
                  ].map((item, i) => (
                     <div key={i} className="flex items-center gap-4 text-[17px] font-semibold text-slate-300">
                        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-sm backdrop-blur-md">
                           {item.icon}
                        </div>
                        {item.text}
                     </div>
                  ))}
               </div>
            </div>

            {/* Glassmorphism Testimonial */}
            <div className="relative z-10 mt-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
               <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 max-w-lg shadow-[0_8px_32px_rgba(0,0,0,0.2)] relative overflow-hidden group hover:bg-white/[0.05] transition-all duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-400/20 to-transparent opacity-50 blur-xl"></div>
                  <div className="flex items-center gap-1.5 text-brand-400 mb-5">
                     {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-lg">★</span>)}
                  </div>
                  <p className="text-lg font-medium mb-8 leading-relaxed text-slate-200 relative z-10">
                     "Platform ini revolusioner. Dapat interview pertama cuma dalam 2 minggu tanpa harus buka 5 tab job portal yang beda-beda!"
                  </p>
                  <div className="flex items-center gap-4 relative z-10">
                     <img src="/map-indonesia.png" alt="Map" className="w-14 h-14 rounded-full border-2 border-brand-500/30 object-cover" />
                     <div>
                        <div className="font-bold text-white text-base">Sarah Wijaya</div>
                        <div className="text-sm text-brand-300 font-medium">Product Designer</div>
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
         <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 lg:p-16 xl:p-24 relative overflow-hidden bg-white">
            <button
               onClick={onBackToLanding}
               className="absolute top-8 left-8 text-slate-400 hover:text-slate-900 flex items-center gap-2 font-bold text-sm transition-colors bg-slate-100 hover:bg-slate-200 py-2 px-4 rounded-full z-20"
            >
               <ArrowLeft size={16} /> Kembali
            </button>

            {/* Soft background shape for form side */}
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-50 rounded-full blur-[120px] opacity-60 pointer-events-none translate-x-1/3 translate-y-1/3"></div>

            <div className="w-full max-w-[420px] relative z-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

               {/* Mobile Logo */}
               <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
                  <img src="/logo-icon.png" alt="JobsAgent" className="w-12 h-12 object-contain rounded-xl" />
                  <span className="font-extrabold text-[22px] tracking-tight">
                     <span style={{ color: '#0B1F3F' }}>Jobs</span><span style={{ color: '#00B4D8' }}>A</span><span style={{ color: '#0B1F3F' }}>gen</span><span style={{ color: '#00B4D8' }}>t</span>
                  </span>
               </div>

               <div className="mb-10 text-center lg:text-left">
                  <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Create Account</h2>
                  <p className="text-slate-500 text-base font-medium">
                     Sudah punya akun? <button onClick={onLoginClick} className="text-brand-600 font-bold hover:text-brand-700 hover:underline transition-all">Masuk di sini</button>
                  </p>
               </div>

               <div className="space-y-4 mb-8">
                  <button
                     onClick={() => handleSocialLogin('google')}
                     disabled={loading}
                     className="w-full h-14 bg-white border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] text-[15px] shadow-sm disabled:opacity-70 group"
                  >
                     <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                     Daftar dengan Google
                  </button>
               </div>

               <div className="relative flex py-2 items-center mb-8">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Atau Daftar Manual</span>
                  <div className="flex-grow border-t border-slate-100"></div>
               </div>

               {error && (
                  <div className="mb-6 mx-2 p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 text-sm font-semibold rounded-2xl flex items-start gap-3 animate-shake">
                     <div className="mt-0.5">⚠️</div>
                     <div>{error}</div>
                  </div>
               )}

               {/* Signup Form */}
               <form onSubmit={handleSignUp} className="space-y-5 mb-8 group">
                  <div className="relative">
                     <input
                        type="text"
                        id="fullName"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder=" "
                        className="peer w-full h-14 px-5 rounded-2xl border-2 border-slate-100 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-slate-900 font-semibold bg-white pt-4"
                     />
                     <label htmlFor="fullName" className="absolute left-5 top-4 text-slate-400 font-medium text-base transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-brand-600 peer-focus:font-bold peer-valid:top-1.5 peer-valid:text-xs peer-valid:text-slate-500 pointer-events-none">
                        Full Name
                     </label>
                  </div>

                  <div className="relative">
                     <input
                        type="email"
                        id="signupEmail"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder=" "
                        className="peer w-full h-14 px-5 rounded-2xl border-2 border-slate-100 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-slate-900 font-semibold bg-white pt-4"
                     />
                     <label htmlFor="signupEmail" className="absolute left-5 top-4 text-slate-400 font-medium text-base transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-brand-600 peer-focus:font-bold peer-valid:top-1.5 peer-valid:text-xs peer-valid:text-slate-500 pointer-events-none">
                        Email Address
                     </label>
                  </div>

                  <div className="relative">
                     <input
                        type={showPassword ? "text" : "password"}
                        id="signupPassword"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder=" "
                        className="peer w-full h-14 px-5 pr-12 rounded-2xl border-2 border-slate-100 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-slate-900 font-semibold bg-white pt-4"
                     />
                     <label htmlFor="signupPassword" className="absolute left-5 top-4 text-slate-400 font-medium text-base transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-brand-600 peer-focus:font-bold peer-valid:top-1.5 peer-valid:text-xs peer-valid:text-slate-500 pointer-events-none">
                        Password (Min. 8 Chars)
                     </label>
                     <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all"
                     >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                     </button>
                  </div>

                  <div className="flex items-start gap-3 pt-3 pb-2">
                     <div className="relative flex items-center mt-0.5">
                        <input type="checkbox" id="terms" required className="peer h-[18px] w-[18px] cursor-pointer appearance-none rounded-md border-2 border-slate-200 shadow-sm transition-all checked:border-brand-600 checked:bg-brand-600 hover:border-brand-400 focus:ring-4 focus:ring-brand-500/20 outline-none" />
                        <Check size={12} strokeWidth={3} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" />
                     </div>
                     <label htmlFor="terms" className="text-sm text-slate-500 font-medium leading-relaxed cursor-pointer select-none -mt-0.5">
                        Saya setuju dengan <a href="#" className="text-brand-600 font-bold hover:text-brand-700 hover:underline">Terms of Service</a> dan <a href="#" className="text-brand-600 font-bold hover:text-brand-700 hover:underline">Privacy Policy</a> platform.
                     </label>
                  </div>

                  <button
                     type="submit"
                     disabled={loading}
                     className="w-full h-14 bg-slate-900 hover:bg-brand-600 text-white rounded-2xl font-bold text-[15px] shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(79,70,229,0.25)] transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:hover:bg-slate-900 disabled:shadow-none"
                  >
                     {loading ? (
                        <>
                           <Loader2 size={20} className="animate-spin" />
                           <span className="ml-2">Memproses...</span>
                        </>
                     ) : (
                        <>
                           Mulai Perjalanan Karir <ArrowRight size={18} className="opacity-80 ml-1" />
                        </>
                     )}
                  </button>
               </form>

               <div className="flex items-center justify-center gap-2 text-slate-400 text-[11px] font-extrabold uppercase tracking-widest mt-10 bg-slate-50 py-2.5 px-4 rounded-full w-max mx-auto">
                  <Lock size={12} className="text-slate-400" />
                  <span className="mt-px">Bank-Grade Encryption</span>
               </div>
            </div>
         </div>
      </div>
   );
};