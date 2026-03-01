import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { Pricing } from './components/Pricing';
import { Platforms } from './components/Platforms';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { Dashboard } from './components/Dashboard';
import { SignUp } from './components/SignUp';
import { Login } from './components/Login';
import { OnboardingSurvey } from './components/OnboardingSurvey';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

type ViewState = 'landing' | 'dashboard' | 'signup' | 'login' | 'onboarding';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        const needsOnboarding = !session.user?.user_metadata?.onboarding_completed;
        if (needsOnboarding) {
          setCurrentView('onboarding');
        } else {
          setCurrentView('dashboard');
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        const needsOnboarding = !session.user?.user_metadata?.onboarding_completed;
        if (needsOnboarding) {
          setCurrentView('onboarding');
        } else {
          setCurrentView('dashboard');
        }
      } else {
        setCurrentView('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (currentView === 'dashboard' && session) {
    const userMetadata = {
      full_name: session.user?.user_metadata?.full_name,
      email: session.user?.email,
    };
    return <Dashboard onLogout={handleLogout} user={userMetadata} />;
  }

  if (currentView === 'signup') {
    return (
      <SignUp
        onLoginClick={() => setCurrentView('login')}
        onSignUpComplete={() => setCurrentView('dashboard')}
        onBackToLanding={() => setCurrentView('landing')}
      />
    );
  }

  if (currentView === 'onboarding' && session) {
    return (
      <OnboardingSurvey
        user={{
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name
        }}
        onComplete={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'login') {
    return (
      <Login
        onSignUpClick={() => setCurrentView('signup')}
        onLoginComplete={() => setCurrentView('dashboard')}
        onBackToLanding={() => setCurrentView('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden selection:bg-brand-600 selection:text-white">
      {/* Background Gradient Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-3xl opacity-60 animate-pulse-slow"></div>
        <div className="absolute top-[20%] right-[-5%] w-[40%] h-[60%] bg-purple-100/50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-pink-100/40 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Navbar
          onLoginClick={() => setCurrentView('login')}
          onSignUpClick={() => setCurrentView('signup')}
        />
        <Hero />
        <Features />
        <HowItWorks />
        <Platforms />
        <Testimonials />
        <Pricing />
        <Footer />
      </div>
    </div>
  );
};

export default App;