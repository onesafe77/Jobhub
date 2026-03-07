import React from 'react';
import { Star, Users, Trophy, ShieldCheck, CheckCircle2 } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Wijaya",
    role: "Frontend Developer",
    company: "GoTo",
    companyDomain: "gojek.com",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    quote: "Jobs Agent helped me land my dream job at GoTo in just 2 weeks! The AI match feature saved me so much time matching my skills with requirements.",
    rating: 5
  },
  {
    name: "Budi Santoso",
    role: "Backend Engineer",
    company: "Tokopedia",
    companyDomain: "tokopedia.com",
    image: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    quote: "Cover letter generator is a game changer! I used to spend 30 minutes per application, now it's just 2 minutes and the quality is amazing.",
    rating: 5
  },
  {
    name: "Dina Lestari",
    role: "Data Analyst",
    company: "Traveloka",
    companyDomain: "traveloka.com",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    quote: "ATS scanner helped me fix my CV and I started getting interview calls immediately. Worth every rupiah for the Pro plan!",
    rating: 5
  }
];

const badges = [
  {
    icon: <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />,
    title: "4.9/5.0 Rating",
    subtitle: "from 247 reviews"
  },
  {
    icon: <Users className="w-6 h-6 text-blue-500" />,
    title: "5,000+ Users",
    subtitle: "and growing daily"
  },
  {
    icon: <Trophy className="w-6 h-6 text-orange-500" />,
    title: "#1 Job App",
    subtitle: "for fresh grads"
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-green-500" />,
    title: "100% Secure",
    subtitle: "Data encrypted"
  }
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-24 lg:py-32 bg-slate-50 relative border-t border-slate-200" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <h2 className="text-4xl lg:text-[52px] font-bold text-slate-900 mb-6 leading-tight">
            Dipercaya oleh 5,000+ Fresh Graduates
          </h2>
          <p className="text-lg lg:text-xl text-slate-600">
            Lihat apa kata mereka tentang Jobs Agent
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="bg-white rounded-[20px] p-8 border-[1.5px] border-slate-200 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="flex-1 text-[17px] leading-relaxed text-slate-700 italic mb-8">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 truncate">{testimonial.name}</div>
                  <div className="text-sm text-slate-500 truncate">{testimonial.role}</div>
                </div>
                <img
                  src={`https://logo.clearbit.com/${testimonial.companyDomain}`}
                  alt={testimonial.company}
                  className="w-6 h-6 object-contain opacity-80"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {badges.map((badge, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col items-center text-center shadow-sm hover:border-brand-200 transition-colors"
            >
              <div className="mb-2 p-2 bg-slate-50 rounded-lg">
                {badge.icon}
              </div>
              <div className="font-bold text-slate-900 text-sm mb-0.5">
                {badge.title}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {badge.subtitle}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};