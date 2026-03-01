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
      <div className="min-h-screen flex bg-white font-sans animate-fade-in">
         {/* LEFT SIDE - 50% */}
         <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 to-purple-600 relative overflow-hidden flex-col justify-between p-16 text-white">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
               <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-white rounded-full blur-[120px]"></div>
               <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-400 rounded-full blur-[120px]"></div>
            </div>

            {/* Top Content */}
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-12">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
                     <Sparkles size={20} fill="currentColor" className="text-white" />
                  </div>
                  <span className="font-bold text-2xl tracking-tight">JobHub</span>
               </div>

               <h1 className="text-5xl font-extrabold mb-6 leading-[1.15] tracking-tight">
                  Join 5,000+<br />Fresh Graduates
               </h1>
               <p className="text-xl text-blue-50 max-w-lg leading-relaxed mb-10 font-medium">
                  Akses 10,000+ lowongan dari 10+ platform dalam satu tempat. Gratis untuk mulai.
               </p>

               <div className="space-y-5 mb-16">
                  {[
                     'Gratis untuk 50 searches',
                     'Tidak perlu kartu kredit',
                     'Setup dalam 2 menit'
                  ].map((item, i) => (
                     <div key={i} className="flex items-center gap-4 text-lg font-semibold text-white/90">
                        <div className="w-7 h-7 rounded-full bg-green-400/20 flex items-center justify-center border border-green-400/50 text-green-300 shadow-sm">
                           <Check size={16} strokeWidth={3} />
                        </div>
                        {item}
                     </div>
                  ))}
               </div>

               {/* Testimonial Card */}
               <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-md shadow-2xl relative overflow-hidden group hover:bg-white/15 transition-colors">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
                  <div className="flex items-center gap-1 text-yellow-300 mb-3">
                     {[1, 2, 3, 4, 5].map(i => <span key={i}>★</span>)}
                  </div>
                  <p className="text-lg font-medium italic mb-6 leading-relaxed text-white">"Got my dream job in 2 weeks! The AI matching is insane."</p>
                  <div className="flex items-center gap-4">
                     <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80" alt="Sarah" className="w-12 h-12 rounded-full border-2 border-white/30" />
                     <div>
                        <div className="font-bold text-white">Sarah Wijaya</div>
                        <div className="text-sm text-blue-200 font-medium">Product Designer at GoTo</div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Footer Text */}
            <div className="relative z-10 text-sm text-blue-200/80 font-medium">
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

               {/* Mobile Logo */}
               <div className="lg:hidden flex items-center gap-2 mb-10 text-brand-600 justify-center">
                  <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
                     <Sparkles size={16} fill="currentColor" />
                  </div>
                  <span className="font-bold text-xl tracking-tight text-slate-900">JobHub</span>
               </div>

               <div className="mb-8 text-center lg:text-left">
                  <h2 className="text-[32px] font-bold text-slate-900 mb-3 tracking-tight">Buat Akun Gratis</h2>
                  <p className="text-slate-600 text-base">
                     Sudah punya akun? <button onClick={onLoginClick} className="text-brand-600 font-bold hover:text-brand-700 hover:underline transition-all">Masuk</button>
                  </p>
               </div>

               {/* Social Login Buttons */}
               <div className="space-y-3 mb-8">
                  <button
                     onClick={() => handleSocialLogin('linkedin')}
                     disabled={loading}
                     className="w-full h-[56px] bg-[#0A66C2] hover:bg-[#004182] text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md active:scale-[0.99] text-[15px] disabled:opacity-70"
                  >
                     <Linkedin size={20} fill="currentColor" />
                     Continue with LinkedIn <ArrowRight size={16} className="opacity-60" />
                  </button>
                  <button
                     onClick={() => handleSocialLogin('google')}
                     disabled={loading}
                     className="w-full h-[56px] bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.99] text-[15px] disabled:opacity-70"
                  >
                     <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
                     Continue with Google <ArrowRight size={16} className="opacity-40" />
                  </button>
               </div>

               {/* Divider */}
               <div className="relative flex py-2 items-center mb-8">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium uppercase tracking-wider">atau</span>
                  <div className="flex-grow border-t border-slate-200"></div>
               </div>

               {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl animate-shake">
                     {error}
                  </div>
               )}

               {/* Signup Form */}
               <form onSubmit={handleSignUp} className="space-y-5 mb-8">
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
                     <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full h-[52px] px-4 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900 bg-slate-50/50 focus:bg-white"
                     />
                  </div>
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
                     <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                     <div className="relative">
                        <input
                           type={showPassword ? "text" : "password"}
                           required
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           placeholder="Min. 8 karakter"
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

                  <div className="flex items-start gap-3 pt-2">
                     <div className="relative flex items-center">
                        <input type="checkbox" id="terms" required className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 shadow-sm transition-all checked:border-brand-600 checked:bg-brand-600 hover:border-brand-400 focus:ring-2 focus:ring-brand-500/20" />
                        <Check size={12} strokeWidth={3} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" />
                     </div>
                     <label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed cursor-pointer select-none">
                        Saya setuju dengan <a href="#" className="text-brand-600 font-bold hover:text-brand-700 hover:underline">Terms of Service</a> dan <a href="#" className="text-brand-600 font-bold hover:text-brand-700 hover:underline">Privacy Policy</a> JobHub.
                     </label>
                  </div>

                  <button
                     type="submit"
                     disabled={loading}
                     className="w-full h-[56px] bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-brand-500/30 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:transform-none"
                  >
                     {loading ? (
                        <>
                           <Loader2 size={20} className="animate-spin" />
                           Memproses...
                        </>
                     ) : (
                        <>
                           Daftar Gratis <ArrowRight size={20} />
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