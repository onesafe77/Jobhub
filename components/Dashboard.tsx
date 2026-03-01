import React, { useState } from 'react';
import {
  LayoutDashboard, Search, Briefcase, ScanLine, Coins, Settings,
  LogOut, Bell, ChevronRight, TrendingUp, Calendar, FileText,
  MapPin, DollarSign, PenTool, Sparkles, Zap, Filter, Bookmark,
  Star, X, CheckCircle2, ArrowLeft, ArrowRight, ExternalLink, Share2, AlertCircle, Check, Target,
  MoreHorizontal, ChevronLeft, Clock, Download, AlertTriangle, Lightbulb,
  Plus, Minus, ChevronDown, ChevronUp, Wand2, ListFilter, Menu, Upload, User, Mail, Phone, Lock, Globe, BellRing,
  Building2, Users, Trophy, MessageSquare, PieChart, Activity, Eye
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { scraperService } from "../lib/scraperService";
import { supabase } from "../lib/supabase";

// --- INTERFACES & MOCK DATA ---

interface DashboardProps {
  onLogout?: () => void;
  user?: {
    full_name?: string;
    email?: string;
  };
}

interface JobRequirement {
  text: string;
  matched: boolean;
  notes?: string;
}

interface CompanyDetails {
  about: string;
  industry: string;
  size: string;
  founded: string;
  website: string;
  rating: number;
  reviews: number;
  location: string;
  specialties: string[];
  benefits: string[];
  stats: { label: string; value: string }[];
  leaders: { name: string; role: string }[];
  hiringTrends?: { activeJobs: number; compatibility: number };
}

interface Job {
  id: number;
  title: string;
  company: string;
  logo: string;
  logoColor: string;
  source: string;
  matchScore: number;
  location: string;
  type: string;
  salary: string;
  timeAgo: string;
  description: string;
  longDescription: string;
  requirements: JobRequirement[];
  tags: string[];
  aiAnalysis: {
    skills: number;
    experience: number;
    education: number;
    strongMatches: string[];
    missing: string[];
  };
  companyDetails?: CompanyDetails;
}

type ApplicationStatus = 'Interview' | 'Pending' | 'Rejected';

interface Application {
  id: number;
  title: string;
  company: string;
  appliedDate: string;
  fullDate: string;
  status: ApplicationStatus;
}

interface Notification {
  id: number;
  type: 'match' | 'application' | 'system';
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

type DashboardView = 'dashboard' | 'search' | 'detail' | 'applications' | 'scanner' | 'settings' | 'notifications';

// --- MOCK DATA ---
const MOCK_JOBS: Job[] = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "GoTo Financial",
    logo: "G",
    logoColor: "bg-green-600",
    source: "LinkedIn Jobs",
    matchScore: 92,
    location: "Jakarta",
    type: "Full-time",
    salary: "Rp 12,000,000 - Rp 18,000,000",
    timeAgo: "2 days ago",
    description: "We're looking for an experienced Frontend Developer to join our financial services team. You'll be building high-performance web apps...",
    longDescription: "As a Frontend Developer at GoTo Financial, you will be responsible for building high-quality user interfaces for our financial services products. You will work closely with designers and product managers to deliver seamless experiences to millions of users.\n\nKey Responsibilities:\n- Build and maintain responsive web applications using React and TypeScript.\n- Collaborate with backend engineers to integrate APIs.\n- Optimize applications for maximum speed and scalability.\n- Stay up-to-date with emerging technologies in the frontend ecosystem.",
    requirements: [
      { text: "2+ years of experience with React.js", matched: true, notes: "React" },
      { text: "Strong proficiency in TypeScript", matched: true, notes: "TypeScript" },
      { text: "Experience with Next.js and Tailwind CSS", matched: true, notes: "Next.js" },
      { text: "GraphQL experience", matched: false, notes: "Missing" },
    ],
    tags: ["React", "TypeScript", "Next.js"],
    aiAnalysis: { skills: 90, experience: 85, education: 80, strongMatches: ["You have 2+ years React", "TypeScript Proficiency"], missing: ["GraphQL experience"] },
    companyDetails: {
      about: "GoTo is Indonesia's largest technology group, combining on-demand, e-commerce and financial services through the Gojek, Tokopedia and GoTo Financial brands.",
      industry: "Financial Technology",
      size: "1,000-5,000 employees",
      founded: "2021",
      website: "goto.com",
      rating: 4.2,
      reviews: 247,
      location: "Jakarta, Indonesia",
      specialties: ["E-commerce", "Payments", "Logistics", "Food Delivery", "Financial Services"],
      benefits: ["Health insurance (BPJS + private)", "Stock options (ESOP)", "Flexible working hours", "Remote work options", "Learning & development budget", "Free snacks & meals", "Gym membership"],
      stats: [
        { label: "App Downloads", value: "170M+" },
        { label: "Merchants", value: "2M+" },
        { label: "Cities", value: "300+" },
      ],
      leaders: [
        { name: "Andre Soelistyo", role: "CEO" },
        { name: "Patrick Cao", role: "President" }
      ],
      hiringTrends: { activeJobs: 47, compatibility: 85 }
    }
  },
  {
    id: 2,
    title: "Product Designer",
    company: "Traveloka",
    logo: "T",
    logoColor: "bg-blue-500",
    source: "JobStreet",
    matchScore: 88,
    location: "Tanggerang",
    type: "Hybrid",
    salary: "Rp 15jt - 22jt",
    timeAgo: "5h ago",
    description: "Join our design team to create delightful experiences for millions of travelers. Requires strong Figma skills and design system experience.",
    longDescription: "Traveloka is looking for a Product Designer...",
    requirements: [
      { text: "3+ years in UI/UX", matched: true, notes: "Matched" },
      { text: "Figma Mastery", matched: true, notes: "Matched" },
    ],
    tags: ["Figma", "UI/UX", "Prototyping"],
    aiAnalysis: { skills: 85, experience: 90, education: 85, strongMatches: ["Figma", "Design System"], missing: [] }
  },
  {
    id: 3,
    title: "Backend Engineer",
    company: "Shopee",
    logo: "S",
    logoColor: "bg-orange-500",
    source: "Glints",
    matchScore: 85,
    location: "Jakarta",
    type: "Full-time",
    salary: "Rp 18jt - 25jt",
    timeAgo: "1d ago",
    description: "Building scalable backend services for e-commerce platform. Go (Golang) experience is a must for this role.",
    longDescription: "Shopee requires a Backend Engineer with Go experience...",
    requirements: [
      { text: "Go (Golang)", matched: true, notes: "Matched" },
      { text: "Microservices", matched: true, notes: "Matched" },
    ],
    tags: ["Go", "Microservices", "gRPC"],
    aiAnalysis: { skills: 82, experience: 88, education: 85, strongMatches: ["Go Language", "System Design"], missing: [] }
  },
  {
    id: 4,
    title: "Fullstack Engineer",
    company: "Tokopedia",
    logo: "T",
    logoColor: "bg-green-500",
    source: "LinkedIn",
    matchScore: 95,
    location: "Jakarta",
    type: "Remote",
    salary: "Rp 20jt - 30jt",
    timeAgo: "3h ago",
    description: "Looking for a Fullstack Engineer to help us build the next generation of e-commerce tools using React and Go.",
    longDescription: "Tokopedia is hiring...",
    requirements: [{ text: "React", matched: true }, { text: "Go", matched: true }],
    tags: ["React", "Go", "PostgreSQL"],
    aiAnalysis: { skills: 95, experience: 92, education: 90, strongMatches: ["Fullstack", "E-commerce"], missing: [] }
  },
  {
    id: 5,
    title: "Data Scientist",
    company: "Bukalapak",
    logo: "B",
    logoColor: "bg-purple-600",
    source: "TechInAsia",
    matchScore: 78,
    location: "Jakarta",
    type: "Full-time",
    salary: "Rp 15jt - 25jt",
    timeAgo: "4d ago",
    description: "Analyze large datasets to extract actionable insights. Python, SQL, and Machine Learning knowledge required.",
    longDescription: "Bukalapak is hiring...",
    requirements: [{ text: "Python", matched: true }, { text: "SQL", matched: true }],
    tags: ["Python", "SQL", "Machine Learning"],
    aiAnalysis: { skills: 75, experience: 80, education: 85, strongMatches: ["Python"], missing: ["Big Data"] }
  },
  {
    id: 6,
    title: "Mobile Developer (iOS)",
    company: "Bank Jago",
    logo: "J",
    logoColor: "bg-orange-600",
    source: "Kalibrr",
    matchScore: 82,
    location: "Jakarta",
    type: "Hybrid",
    salary: "Rp 18jt - 28jt",
    timeAgo: "1w ago",
    description: "Develop high-quality mobile applications for our digital banking platform using Swift and iOS SDK.",
    longDescription: "Bank Jago is hiring...",
    requirements: [{ text: "Swift", matched: true }, { text: "iOS SDK", matched: true }],
    tags: ["Swift", "iOS", "Mobile"],
    aiAnalysis: { skills: 85, experience: 80, education: 80, strongMatches: ["iOS"], missing: [] }
  }
];

const MOCK_APPLICATIONS: Application[] = [
  { id: 1, title: 'Frontend Developer', company: 'GoTo Financial', appliedDate: '3 days ago', fullDate: 'Feb 6, 2026', status: 'Interview' },
  { id: 2, title: 'Backend Engineer', company: 'Tokopedia', appliedDate: '5 days ago', fullDate: 'Feb 4, 2026', status: 'Pending' },
  { id: 3, title: 'Data Analyst', company: 'Gojek', appliedDate: '1 week ago', fullDate: 'Feb 1, 2026', status: 'Rejected' },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 1, type: 'match', title: 'New High Match Job!', message: '95% match for Senior Frontend Developer at Traveloka.', time: '2 hours ago', unread: true },
  { id: 2, type: 'application', title: 'Application Viewed', message: 'GoTo Financial viewed your application for Frontend Developer.', time: '5 hours ago', unread: true },
  { id: 3, type: 'system', title: 'Welcome to JobHub Pro', message: 'Your pro trial has started. Enjoy unlimited AI features.', time: '1 day ago', unread: false },
  { id: 4, type: 'match', title: 'New Job Alert', message: 'Backend Engineer at Shopee matches your preferences.', time: '1 day ago', unread: false },
];

// --- HELPER COMPONENTS ---

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
}> = ({
  icon, label, active, badge, onClick
}) => (
    <div
      onClick={onClick}
      className={`
      flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group mb-1
      ${active
          ? 'bg-brand-50 text-brand-600 font-semibold shadow-sm'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
    `}
    >
      <span className={`${active ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
        {icon}
      </span>
      <span className="flex-1 text-sm">{label}</span>
      {badge && (
        <span className={`
        text-[10px] font-bold px-2 py-0.5 rounded-full
        ${active ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'}
      `}>
          {badge}
        </span>
      )}
    </div>
  );

const TopBar: React.FC<{
  title?: string;
  subtitle?: string;
  onNotificationClick: () => void;
  rightContent?: React.ReactNode;
}> = ({ title, subtitle, onNotificationClick, rightContent }) => (
  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-4">
    <div>
      {title && <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>}
      {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-4 self-end md:self-auto">
      {rightContent}
      <div className="flex items-center bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm gap-2">
        <span className="text-lg">🪙</span><span className="font-bold text-slate-700 font-mono text-sm">234</span>
      </div>
      <button
        onClick={onNotificationClick}
        className="w-10 h-10 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-500 relative shadow-sm hover:bg-slate-50 transition-colors"
      >
        <Bell size={20} />
        <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
      </button>
    </div>
  </div>
);

const StatCard: React.FC<{
  icon: React.ReactNode;
  colorClass: string;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
}> = ({ icon, colorClass, label, value, trend, trendUp }) => (
  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all hover:-translate-y-1">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend}
        </span>
      )}
    </div>
    <div className="text-3xl font-bold text-slate-900 font-mono tracking-tighter mb-1">{value}</div>
    <div className="text-sm font-medium text-slate-500">{label}</div>
  </div>
);

const ActivityChart = () => (
  <div className="flex items-end gap-3 h-32 w-full mt-4">
    {[40, 70, 35, 90, 60, 80, 50].map((h, i) => (
      <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
        <div
          className={`w-full bg-slate-100 rounded-t-lg transition-all duration-300 relative group-hover:bg-brand-200`}
          style={{ height: `${h}%` }}
        >
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {h} Apps
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-bold uppercase">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
      </div>
    ))}
  </div>
);

const StatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
  const styles = {
    Interview: 'bg-green-50 text-green-700 border-green-100',
    Pending: 'bg-orange-50 text-orange-700 border-orange-100',
    Rejected: 'bg-red-50 text-red-700 border-red-100',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Interview' ? 'bg-green-600' : status === 'Pending' ? 'bg-orange-600' : 'bg-red-600'}`}></span>
      {status}
    </span>
  );
};

const IssueCard: React.FC<{
  type: 'critical' | 'warning' | 'suggestion';
  title: string;
  impact: string;
  explanation: string;
  fix: string;
  onAutoFix?: () => void;
}> = ({ type, title, impact, explanation, fix, onAutoFix }) => {
  const styles = {
    critical: {
      bg: 'bg-red-50',
      border: 'border-l-red-500',
      title: 'text-red-900',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-700',
      tag: 'CRITICAL',
      icon: <X size={20} className="text-red-500" />,
      btn: 'bg-red-600 hover:bg-red-700 text-white'
    },
    warning: {
      bg: 'bg-orange-50',
      border: 'border-l-orange-500',
      title: 'text-orange-900',
      badgeBg: 'bg-orange-100',
      badgeText: 'text-orange-700',
      tag: 'WARNING',
      icon: <AlertTriangle size={20} className="text-orange-500" />,
      btn: 'bg-orange-600 hover:bg-orange-700 text-white'
    },
    suggestion: {
      bg: 'bg-blue-50',
      border: 'border-l-blue-500',
      title: 'text-blue-900',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-700',
      tag: 'SUGGESTION',
      icon: <Lightbulb size={20} className="text-blue-500" />,
      btn: 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  };

  const s = styles[type];

  return (
    <div className={`p-6 rounded-2xl border-l-[3px] shadow-sm relative transition-all hover:shadow-md ${s.bg} ${s.border}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {s.icon}
          <h4 className={`text-lg font-bold ${s.title}`}>{title}</h4>
        </div>
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${s.badgeBg} ${s.badgeText}`}>
          {impact}
        </span>
      </div>

      <div className={`text-[11px] font-extrabold uppercase tracking-widest mb-3 ${s.badgeText}`}>
        {s.tag}
      </div>

      <p className={`text-sm mb-4 leading-relaxed opacity-80 ${s.title}`}>
        {explanation}
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-black/5 pt-4">
        <div className={`text-sm font-medium ${s.title} flex items-center gap-2 italic`}>
          <Sparkles size={16} /> {fix}
        </div>
        <button
          onClick={onAutoFix}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${s.btn}`}
        >
          <Wand2 size={14} /> Auto-Fix
        </button>
      </div>
    </div>
  );
};

const CompanyProfileCard: React.FC<{ details: CompanyDetails; companyName: string; logo: string; logoColor: string }> = ({ details, companyName, logo, logoColor }) => (
  <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm">
    <div className="p-6 border-b border-slate-100">
      <div className="flex items-start justify-between mb-6">
        <div className={`w-14 h-14 rounded-xl ${logoColor} text-white flex items-center justify-center font-bold text-xl shadow-md`}>
          {logo}
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-yellow-500">
            <Star size={16} fill="currentColor" />
            <span className="font-bold text-slate-900">{details.rating}/5.0</span>
          </div>
          <div className="text-xs text-slate-500 underline decoration-slate-300">{details.reviews} reviews</div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-1">{companyName}</h3>
      <div className="text-sm text-slate-500 flex items-center gap-2">
        <MapPin size={14} /> {details.location}
      </div>
    </div>

    <div className="p-6 space-y-8">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1">
            <Building2 size={12} /> Industry
          </div>
          <div className="text-sm font-bold text-slate-900 leading-tight">{details.industry}</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1">
            <Users size={12} /> Size
          </div>
          <div className="text-sm font-bold text-slate-900 leading-tight">{details.size}</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1">
            <Calendar size={12} /> Founded
          </div>
          <div className="text-sm font-bold text-slate-900 leading-tight">{details.founded}</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1">
            <Globe size={12} /> Website
          </div>
          <a href={`https://${details.website}`} target="_blank" className="text-sm font-bold text-brand-600 hover:underline leading-tight block truncate">{details.website}</a>
        </div>
      </div>

      {/* About */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">About</h4>
        <p className="text-sm text-slate-600 leading-relaxed">
          {details.about}
        </p>
      </div>

      {/* Benefits */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Benefits & Perks</h4>
        <div className="space-y-2">
          {details.benefits.slice(0, 5).map((benefit, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
              {benefit}
            </div>
          ))}
          {details.benefits.length > 5 && (
            <div className="text-xs text-brand-600 font-bold pl-6 cursor-pointer hover:underline">
              + {details.benefits.length - 5} more benefits
            </div>
          )}
        </div>
      </div>

      {/* Leaders */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Leadership</h4>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
          {details.leaders.map((leader, i) => (
            <div key={i} className="min-w-[120px] p-2 rounded-lg border border-slate-100 bg-slate-50">
              <div className="font-bold text-sm text-slate-900">{leader.name}</div>
              <div className="text-xs text-slate-500">{leader.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100 relative">
        <div className="text-yellow-400 absolute top-2 left-2 text-4xl opacity-50 leading-none">"</div>
        <p className="text-sm text-yellow-900 italic relative z-10 pl-4">
          Great learning culture and smart colleagues. Fast-paced environment.
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs font-bold text-yellow-800 pl-4">
          - Software Engineer, 2 years
        </div>
      </div>

      {/* Hiring Trends */}
      {details.hiringTrends && (
        <div className="pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-900">Hiring Activity</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">High</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            {details.hiringTrends.activeJobs} jobs posted in last 30 days.
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-3/4 rounded-full"></div>
          </div>
        </div>
      )}

      <button className="w-full py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors text-sm">
        View Full Profile
      </button>
    </div>
  </div>
);

// --- SUB-PAGES ---

const DashboardHome: React.FC<{ onViewChange: (view: DashboardView) => void; user?: { full_name?: string } }> = ({ onViewChange, user }) => (
  <div className="animate-fade-in space-y-8 pb-10">
    <TopBar
      title="Dashboard"
      subtitle="Overview aktivitas pencarian kerjamu minggu ini."
      onNotificationClick={() => onViewChange('notifications')}
    />

    {/* Welcome & Overview */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Welcome Banner & Stats */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-gradient-to-r from-brand-600 to-indigo-600 rounded-[24px] p-8 text-white relative overflow-hidden shadow-lg flex flex-col justify-center min-h-[180px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-400 opacity-20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">Selamat Pagi, {user?.full_name ? user.full_name.split(' ')[0] : 'User'}! ☀️</h2>
            <p className="text-blue-100 text-lg font-medium mb-6 max-w-lg">
              Kamu punya 2 interview minggu ini. Persiapkan dirimu dengan AI Interview Prep.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => onViewChange('search')}
                className="bg-white text-brand-600 px-5 py-2.5 rounded-xl font-bold hover:bg-brand-50 transition-colors shadow-md flex items-center gap-2 text-sm"
              >
                <Search size={16} /> Mulai Cari
              </button>
              <button className="bg-brand-700 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-800 transition-colors flex items-center gap-2 text-sm">
                <Calendar size={16} /> Cek Jadwal
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={<Briefcase size={20} />} colorClass="text-blue-600 bg-blue-50" label="Aplikasi" value="24" trend="+12%" trendUp={true} />
          <StatCard icon={<Calendar size={20} />} colorClass="text-purple-600 bg-purple-50" label="Interview" value="5" trend="+2" trendUp={true} />
          <StatCard icon={<Eye size={20} />} colorClass="text-orange-600 bg-orange-50" label="Profile Views" value="142" trend="+5%" trendUp={true} />
          <StatCard icon={<MessageSquare size={20} />} colorClass="text-green-600 bg-green-50" label="Responses" value="8" />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">Aktivitas Lamaran</h3>
            <select className="bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg px-2 py-1 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div>
                <div className="text-2xl font-bold text-slate-900">42</div>
                <div className="text-xs text-slate-500 font-medium">Total Applications</div>
              </div>
              <div className="h-8 w-px bg-slate-100"></div>
              <div>
                <div className="text-2xl font-bold text-green-600">18%</div>
                <div className="text-xs text-slate-500 font-medium">Response Rate</div>
              </div>
            </div>
            <ActivityChart />
          </div>
        </div>
      </div>

      {/* Right: Activity Feed & Upcoming */}
      <div className="space-y-6">
        {/* Upcoming Schedule */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-brand-600" /> Upcoming
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4 items-start pb-4 border-b border-slate-50">
              <div className="bg-brand-50 text-brand-600 rounded-lg w-12 h-12 flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] font-bold uppercase">Feb</span>
                <span className="text-lg font-bold leading-none">06</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Interview with Gojek</h4>
                <p className="text-xs text-slate-500 mt-0.5">10:00 AM • Google Meet</p>
                <button className="mt-2 text-xs bg-brand-600 text-white px-3 py-1 rounded-md font-bold">Prepare</button>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-purple-50 text-purple-600 rounded-lg w-12 h-12 flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] font-bold uppercase">Feb</span>
                <span className="text-lg font-bold leading-none">08</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Technical Test Shopee</h4>
                <p className="text-xs text-slate-500 mt-0.5">Deadline: 23:59 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-orange-500" /> Activity
          </h3>
          <div className="space-y-4 relative">
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
            {[
              { text: "Applied to Frontend Dev at Tokopedia", time: "2h ago", icon: <Check size={12} />, color: "bg-blue-500" },
              { text: "Your CV score improved to 85", time: "5h ago", icon: <TrendingUp size={12} />, color: "bg-green-500" },
              { text: "New match: UI Designer at Traveloka", time: "1d ago", icon: <Zap size={12} />, color: "bg-yellow-500" }
            ].map((act, i) => (
              <div key={i} className="flex gap-3 items-start relative z-10">
                <div className={`w-10 h-10 rounded-full border-4 border-white ${act.color} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                  {act.icon}
                </div>
                <div className="pt-1">
                  <p className="text-sm font-medium text-slate-800 leading-tight">{act.text}</p>
                  <span className="text-xs text-slate-400">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const JobSearch: React.FC<{
  onJobClick: (job: Job) => void;
  onViewChange: (view: DashboardView) => void;
  user?: { full_name?: string };
}> = ({ onJobClick, onViewChange, user }) => {
  const [viewState, setViewState] = useState<'empty' | 'results' | 'loading'>('empty');
  const [searchInput, setSearchInput] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);

  const popularSearches = ["Frontend Developer", "Backend Engineer", "Data Analyst", "UI/UX Designer"];

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (val === "") {
      setViewState('empty');
      setJobs([]);
    }
  };

  const handleSearch = async () => {
    if (!searchInput.trim()) return;

    setViewState('loading');

    try {
      // Untuk simulasi scraping nyata
      const results = await scraperService.scrapeJob(`https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(searchInput)}`);

      if (results && results.length > 0) {
        const newJobs: Job[] = results.map((result, index) => ({
          id: Date.now() + index,
          title: result.title,
          company: result.company,
          location: result.location,
          salary: result.salary || "Negosiasi",
          description: result.description,
          source: result.source,
          timeAgo: result.timeAgo || "Baru saja",
          logo: result.logo || result.company.charAt(0).toUpperCase(),
          logoColor: "bg-brand-600",
          tags: result.tags || ["Real-time", "Scraped"],
          matchScore: 95 - index, // Simulated match score
          type: "Full-time",
          longDescription: result.description,
          requirements: [],
          aiAnalysis: {
            skills: 90,
            experience: 85,
            education: 80,
            strongMatches: ["Ditemukan di " + result.source],
            missing: []
          }
        }));
        setJobs([...newJobs, ...MOCK_JOBS]);
        setViewState('results');
      } else {
        setViewState('results');
        setJobs(MOCK_JOBS);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setViewState('results');
      setJobs(MOCK_JOBS);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in pb-10">

      {/* TOP SECTION */}
      <div className="mb-8">
        <TopBar
          title="Cari Jobs"
          subtitle={viewState === 'empty' ? `Welcome back, ${user?.full_name?.split(' ')[0] || 'User'}!` : undefined}
          onNotificationClick={() => onViewChange('notifications')}
        />

        <div className="flex gap-4">
          <div className="flex-1 relative group z-30">
            <div className="relative flex items-center bg-white rounded-xl p-2 shadow-sm border border-slate-200 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all duration-300 h-[56px]">
              <Search className="ml-3 text-slate-400 shrink-0" size={20} />
              <input
                type="text"
                placeholder="Cari posisi, perusahaan, atau keyword..."
                className="flex-1 min-w-0 px-3 text-base md:text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-700 hover:to-blue-700 text-white px-6 h-10 rounded-lg font-bold transition-all shadow-md whitespace-nowrap shrink-0"
              >
                Cari Pekerjaan
              </button>
            </div>
          </div>

          <button className="h-[56px] px-6 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm shrink-0">
            <ListFilter size={20} />
            <span className="hidden lg:inline">Filters</span>
          </button>
        </div>

        {viewState === 'results' && (
          <div className="mt-4 flex flex-wrap gap-2">
            {['📍 Jakarta', '💰 Rp 10-20 jt'].map((filter, i) => (
              <div key={i} className="bg-slate-100 text-slate-700 text-sm font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-slate-200 transition-colors">
                {filter}
                <X size={14} className="text-slate-400 hover:text-slate-600" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RESULTS CONTENT */}
      {viewState === 'loading' && (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
          <h3 className="text-xl font-bold text-slate-800">Menjelajahi Internet...</h3>
          <p className="text-slate-500">Mencari lowongan terbaik untuk Anda via Apify.</p>
        </div>
      )}

      {viewState === 'results' ? (
        <div className="animate-fade-in-up">
          {/* Results Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-lg font-bold text-slate-900">
              <span className="text-brand-600">{jobs.length}</span> jobs found
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer hover:text-slate-900">
              Sort by: <span className="font-bold text-slate-900">Best Match</span> <ChevronDown size={16} />
            </div>
          </div>

          {/* Job Cards */}
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => onJobClick(job)}
                className="bg-white rounded-xl border border-slate-200 border-l-[4px] border-l-brand-500 p-6 hover:shadow-lg hover:border-blue-300 transition-all flex flex-col md:flex-row gap-6 group cursor-pointer"
              >
                {/* Logo Section */}
                <div className="flex-shrink-0">
                  <div className={`w-14 h-14 rounded-lg border border-slate-100 flex items-center justify-center text-white font-bold text-xl shadow-sm ${job.logoColor}`}>
                    {job.logo}
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  {/* Top Row: Source & Title */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <div>
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100 mb-2 uppercase tracking-wide">
                        <div className="w-1.5 h-1.5 bg-brand-600 rounded-full"></div> {job.source}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{job.title}</h3>
                    </div>

                    {/* Match Score (Mobile: moved here for layout flow, Desktop: stays right) */}
                    <div className="flex items-center gap-2 md:hidden">
                      <div className="bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        {job.matchScore}% <Star size={12} fill="currentColor" className="text-green-600" />
                      </div>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-slate-600 font-medium mb-3">
                    <span className="text-slate-700 font-bold">{job.company}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="flex items-center gap-1"><DollarSign size={14} /> {job.salary}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {job.timeAgo}</span>
                  </div>

                  {/* Description Snippet */}
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {job.tags.slice(0, 4).map((tag, i) => (
                      <span key={i} className="bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1 rounded-md text-xs font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Action Section */}
                <div className="flex flex-row md:flex-col justify-between items-end min-w-[140px] pl-4 md:border-l border-slate-50">
                  <div className="hidden md:flex bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-full text-sm font-bold items-center gap-1 shadow-sm">
                    {job.matchScore}% <Star size={12} fill="currentColor" className="text-green-600" />
                  </div>

                  <div className="flex items-center gap-3 mt-auto w-full md:w-auto">
                    <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">
                      <Bookmark size={20} />
                    </button>
                    <button className="flex-1 md:flex-none bg-brand-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/30 flex items-center justify-center gap-2">
                      View Details <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-slate-100 rounded-full blur-3xl opacity-60 transform scale-150"></div>
            <Search size={120} strokeWidth={1} className="text-slate-300 relative z-10" />
          </div>

          <h2 className="text-[32px] font-bold text-slate-900 mb-4 text-center tracking-tight">Mulai Cari Pekerjaan</h2>

          <p className="text-lg text-slate-600 text-center mb-8 max-w-[480px] leading-relaxed">
            Gunakan search bar di atas untuk mencari lowongan dari 10+ platform sekaligus. Hasil muncul dalam hitungan detik.
          </p>

          <button className="h-[52px] flex items-center justify-center text-brand-600 font-bold text-lg hover:text-brand-700 hover:bg-brand-50 px-6 rounded-xl transition-all gap-2 mb-12">
            Lihat Panduan <ArrowRight size={20} />
          </button>

          <div className="flex flex-col items-center gap-4 animate-fade-in-up delay-100">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Popular searches</span>
            <div className="flex flex-wrap justify-center gap-2.5">
              {popularSearches.map((term, i) => (
                <button
                  key={i}
                  onClick={() => handleSearchChange(term)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-full text-sm transition-colors cursor-pointer border border-transparent hover:border-slate-300"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const JobDetail: React.FC<{ job: Job; onBack: () => void }> = ({ job, onBack }) => {
  const [generating, setGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const handleGenerateCoverLetter = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    setGenerating(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Draft a professional cover letter for the ${job.title} role at ${job.company}. 
        Requirements: ${job.requirements.map(r => r.text).join(", ")}. 
        Include my match score of ${job.matchScore}%.`,
        config: {
          systemInstruction: "You are an expert career consultant. Write a professional, concise cover letter in English.",
        }
      });
      setCoverLetter(response.text || "Draft could not be generated.");
    } catch (err) {
      console.error("AI Error:", err);
      setCoverLetter("An error occurred during generation. Please try again later.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-20">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-6 transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Results
      </button>

      {/* HEADER CARD (Full Width) */}
      <div className="bg-white rounded-[24px] p-8 border border-slate-200 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-6 md:items-start">
          {/* Logo */}
          <div className={`w-20 h-20 rounded-2xl ${job.logoColor} text-white flex items-center justify-center font-bold text-3xl shadow-lg shrink-0`}>
            {job.logo}
          </div>

          <div className="flex-1">
            <div className="text-base text-slate-600 font-medium mb-1">{job.company}</div>
            <h1 className="text-[32px] leading-tight font-bold text-slate-900 mb-4">{job.title}</h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[15px] text-slate-600 font-medium mb-4">
              <span className="flex items-center gap-1.5"><MapPin size={16} /> {job.location}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="flex items-center gap-1.5"><Briefcase size={16} /> {job.type}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="flex items-center gap-1.5"><Clock size={16} /> {job.timeAgo}</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-2">
              <span className="text-lg font-bold font-mono text-slate-900 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                💰 {job.salary} /month
              </span>
              <span className="text-[13px] text-slate-500 flex items-center gap-1.5">
                Source: <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">🟦 {job.source}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col md:flex-row gap-3">
          <button className="flex-grow-[6] bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 text-lg">
            🚀 Apply on {job.source}
          </button>
          <button className="flex-grow-[2] bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
            <Bookmark size={20} /> Save
          </button>
          <button
            onClick={() => document.getElementById('ai-cover-letter')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-grow-[2] bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Wand2 size={20} /> Letter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: 2/3 Width */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI MATCH CARD */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-[24px] p-8 border border-green-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-100/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg text-green-700">
                  <Target size={24} />
                </div>
                <h2 className="text-lg font-bold text-green-900">AI Match Analysis</h2>
              </div>
              <div className="text-[32px] font-bold text-green-700 flex items-center gap-2 mt-2 md:mt-0">
                {job.matchScore}% <span className="text-lg font-semibold text-green-600">Great Match! ✅</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              {/* Progress Bars */}
              <div className="space-y-4">
                {[
                  { label: 'Skills', val: job.aiAnalysis.skills },
                  { label: 'Experience', val: job.aiAnalysis.experience },
                  { label: 'Education', val: job.aiAnalysis.education }
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm font-semibold text-green-800 mb-1">
                      <span>{stat.label}</span>
                      <span>{stat.val}%</span>
                    </div>
                    <div className="h-2.5 bg-white/60 rounded-full overflow-hidden border border-green-100">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${stat.val}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Match Details */}
              <div className="space-y-3 bg-white/60 rounded-xl p-4 border border-green-100/50">
                {job.aiAnalysis.strongMatches.slice(0, 2).map((m, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm font-medium text-green-800">
                    <CheckCircle2 size={16} className="text-green-600 mt-0.5 shrink-0" />
                    {m}
                  </div>
                ))}
                {job.aiAnalysis.missing.slice(0, 1).map((m, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm font-medium text-orange-700">
                    <AlertTriangle size={16} className="text-orange-500 mt-0.5 shrink-0" />
                    Missing: {m} (nice-to-have)
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* JOB DESCRIPTION */}
          <div className="bg-white rounded-[24px] p-8 border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Job Description</h2>
            <div className="prose prose-slate max-w-none text-base text-slate-700 leading-[1.7]">
              <p className="whitespace-pre-line">{job.longDescription}</p>
            </div>
          </div>

          {/* REQUIREMENTS */}
          <div className="bg-white rounded-[24px] p-8 border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Requirements ✓</h2>
            <div className="space-y-4">
              {job.requirements.map((req, i) => (
                <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${req.matched ? 'bg-green-50/50 border-green-100' : 'bg-orange-50/50 border-orange-100'}`}>
                  <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${req.matched ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    {req.matched ? <Check size={14} strokeWidth={3} /> : <AlertTriangle size={14} strokeWidth={3} />}
                  </div>
                  <div>
                    <div className="text-base font-bold text-slate-900">{req.text}</div>
                    <div className={`text-sm font-medium mt-1 ${req.matched ? 'text-green-700' : 'text-orange-700'}`}>
                      {req.matched ? `You have: ${req.notes || "Matched"} ✓` : `You're missing this`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cover Letter Section */}
          <div id="ai-cover-letter" className="bg-slate-900 rounded-[24px] p-8 text-white shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl flex items-center gap-3">
                <Wand2 size={24} className="text-purple-400" /> AI Cover Letter Generator
              </h3>
            </div>
            {!coverLetter ? (
              <div className="text-center py-8">
                <p className="text-slate-400 mb-6 max-w-lg mx-auto">Generate a tailored cover letter based on your profile and this job description in seconds.</p>
                <button
                  onClick={handleGenerateCoverLetter}
                  disabled={generating}
                  className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-brand-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                >
                  {generating ? <><Sparkles className="animate-spin" /> Generating...</> : "Generate with Gemini"}
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-slate-800 p-6 rounded-xl text-sm font-mono max-h-[400px] overflow-y-auto whitespace-pre-line text-slate-300 leading-relaxed border border-slate-700">
                  {coverLetter}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigator.clipboard.writeText(coverLetter)}
                    className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors border border-white/10"
                  >
                    Copy to Clipboard
                  </button>
                  <button
                    onClick={() => setCoverLetter("")}
                    className="px-6 py-3 rounded-xl bg-transparent hover:bg-white/5 text-slate-400 text-sm font-bold transition-colors"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Company Profile (1/3 Width) */}
        <div className="space-y-6">
          {job.companyDetails && (
            <CompanyProfileCard
              details={job.companyDetails}
              companyName={job.company}
              logo={job.logo}
              logoColor={job.logoColor}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// --- NEW SUB-COMPONENTS ---

const ApplicationList: React.FC = () => {
  return (
    <div className="animate-fade-in pb-10">
      <TopBar title="Aplikasi Saya" subtitle="Pantau status lamaran pekerjaanmu di sini." onNotificationClick={() => { }} />
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-700">Posisi</th>
                <th className="px-6 py-4 font-bold text-slate-700">Perusahaan</th>
                <th className="px-6 py-4 font-bold text-slate-700">Tanggal</th>
                <th className="px-6 py-4 font-bold text-slate-700">Status</th>
                <th className="px-6 py-4 font-bold text-slate-700 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_APPLICATIONS.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900">{app.title}</td>
                  <td className="px-6 py-4 text-slate-600">{app.company}</td>
                  <td className="px-6 py-4 text-slate-500">{app.fullDate}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-brand-600 transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ATSScanner: React.FC = () => {
  const [cvText, setCvText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyzeCV = async () => {
    if (!cvText.trim()) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyze this CV for ATS compatibility. Return a JSON response with:
       - score (number 0-100)
       - summary (string)
       - issues (array of objects with type 'critical'|'warning'|'suggestion', title, impact, explanation, fix)
       
       CV Text:
       ${cvText}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      setResult(JSON.parse(response.text || '{}'));
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="animate-fade-in pb-10 max-w-5xl mx-auto">
      <TopBar title="ATS CV Scanner" subtitle="Optimalkan CV kamu agar lolos screening mesin ATS." onNotificationClick={() => { }} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <label className="block text-sm font-bold text-slate-700 mb-3">Paste CV Text</label>
            <textarea
              className="w-full h-[400px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm text-slate-700 font-mono resize-none leading-relaxed"
              placeholder="Paste text CV kamu di sini..."
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
            />
            <button
              onClick={analyzeCV}
              disabled={isAnalyzing || !cvText}
              className="w-full mt-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
            >
              {isAnalyzing ? <><Sparkles className="animate-spin" /> Scanning...</> : <><ScanLine /> Scan CV Now</>}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {!result ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <ScanLine size={32} />
              </div>
              <p className="font-medium">Hasil analisis akan muncul di sini</p>
            </div>
          ) : (
            <div className="animate-fade-in space-y-6">
              {/* Score Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">ATS Score</div>
                  <div className="text-5xl font-bold text-slate-900 tracking-tighter">{result.score}/100</div>
                </div>
                <div className="w-24 h-24 relative flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                    <circle cx="48" cy="48" r="40" stroke={result.score > 70 ? "#22c55e" : "#f97316"} strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * result.score / 100)} />
                  </svg>
                </div>
              </div>

              {/* Issues List */}
              <div className="space-y-4">
                {result.issues?.map((issue: any, i: number) => (
                  <IssueCard
                    key={i}
                    type={issue.type}
                    title={issue.title}
                    impact={issue.impact}
                    explanation={issue.explanation}
                    fix={issue.fix}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NotificationsView: React.FC = () => (
  <div className="animate-fade-in max-w-3xl mx-auto pb-10">
    <TopBar title="Notifikasi" onNotificationClick={() => { }} />
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
      {MOCK_NOTIFICATIONS.map(notif => (
        <div key={notif.id} className={`p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer ${notif.unread ? 'bg-blue-50/40' : ''}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'match' ? 'bg-green-100 text-green-600' : notif.type === 'application' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
            {notif.type === 'match' ? <Sparkles size={18} /> : notif.type === 'application' ? <Briefcase size={18} /> : <Bell size={18} />}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <h4 className={`font-bold text-slate-900 ${notif.unread ? 'text-brand-700' : ''}`}>{notif.title}</h4>
              <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{notif.time}</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{notif.message}</p>
          </div>
          {notif.unread && <div className="w-2.5 h-2.5 bg-brand-600 rounded-full mt-2"></div>}
        </div>
      ))}
    </div>
  </div>
);

const SettingsView: React.FC<{ user?: { full_name?: string; email?: string } }> = ({ user }) => {
  const [notifications, setNotifications] = useState(true);
  const [marketing, setMarketing] = useState(false);

  return (
    <div className="animate-fade-in pb-10 max-w-4xl mx-auto">
      <TopBar title="Pengaturan" onNotificationClick={() => { }} />

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden border-4 border-slate-100 shadow-sm relative group cursor-pointer">
              <img src={`https://ui-avatars.com/api/?name=${user?.full_name || 'User'}&background=random&size=128`} alt="User" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload size={24} className="text-white" />
              </div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h3 className="text-2xl font-bold text-slate-900">{user?.full_name || 'User'}</h3>
              <p className="text-slate-500 font-medium mb-4">{user?.email || 'email@example.com'}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <span className="bg-brand-50 text-brand-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-brand-100">Premium Member</span>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200">ID: 8842-1029</span>
              </div>
            </div>
            <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-black/10 hover:bg-slate-800 transition-all active:scale-[0.98]">
              Edit Profil
            </button>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Settings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User size={20} className="text-brand-600" /> Account Settings
            </h4>
            <div className="space-y-4">
              {[
                { label: 'Ubah Password', icon: <Lock size={18} /> },
                { label: 'Verifikasi Email', icon: <Mail size={18} />, badge: 'Verified', badgeColor: 'bg-green-100 text-green-700' },
                { label: 'Nomor Telepon', icon: <Phone size={18} />, value: '+62 812-****-4567' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="text-slate-400 group-hover:text-brand-600 transition-colors">{item.icon}</div>
                    <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.badgeColor}`}>{item.badge}</span>}
                    {item.value && <span className="text-xs text-slate-400 font-medium">{item.value}</span>}
                    <ChevronRight size={16} className="text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BellRing size={20} className="text-orange-500" /> Preferences
            </h4>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-800">Push Notifications</div>
                  <div className="text-xs text-slate-500">Dapatkan update lamaran instan</div>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${notifications ? 'bg-brand-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-800">Job Alerts</div>
                  <div className="text-xs text-slate-500">Email mingguan rekomendasi kerja</div>
                </div>
                <button
                  onClick={() => setMarketing(!marketing)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${marketing ? 'bg-brand-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${marketing ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Bahasa</span>
                <div className="flex items-center gap-2 text-brand-600 font-bold text-sm cursor-pointer">
                  Indonesia <ChevronDown size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-2xl border border-red-100 p-6 flex items-center justify-between">
          <div>
            <h4 className="text-red-900 font-bold">Hapus Akun</h4>
            <p className="text-red-600 text-sm opacity-80">Semua data lamaran dan profil akan dihapus permanen.</p>
          </div>
          <button className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD EXPORT ---

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, user }) => {
  const [currentView, setCurrentView] = useState<DashboardView>('dashboard');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setCurrentView('detail');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardHome user={user} onViewChange={setCurrentView} />;
      case 'search': return <JobSearch user={user} onJobClick={handleJobClick} onViewChange={setCurrentView} />;
      case 'detail': return selectedJob ? <JobDetail job={selectedJob} onBack={() => setCurrentView('search')} /> : <JobSearch onJobClick={handleJobClick} onViewChange={setCurrentView} />;
      case 'applications': return <ApplicationList />;
      case 'scanner': return <ATSScanner />;
      case 'notifications': return <NotificationsView />;
      case 'settings': return <SettingsView user={user} />;
      default: return <DashboardHome onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <Sparkles size={18} fill="currentColor" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">JobHub</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8 custom-scrollbar">
          {/* Main Nav */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 mb-3">Menu</div>
            <div className="space-y-1">
              <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
              <NavItem icon={<Search size={20} />} label="Cari Lowongan" active={currentView === 'search' || currentView === 'detail'} onClick={() => setCurrentView('search')} />
              <NavItem icon={<Briefcase size={20} />} label="Aplikasi Saya" active={currentView === 'applications'} badge="3" onClick={() => setCurrentView('applications')} />
              <NavItem icon={<ScanLine size={20} />} label="ATS Scanner" active={currentView === 'scanner'} badge="New" onClick={() => setCurrentView('scanner')} />
            </div>
          </div>

          {/* Tools */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 mb-3">Tools</div>
            <div className="space-y-1">
              <NavItem icon={<FileText size={20} />} label="CV Builder" />
              <NavItem icon={<Wand2 size={20} />} label="Cover Letter AI" />
              <NavItem icon={<Coins size={20} />} label="Salary Checker" />
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors mb-2" onClick={() => setCurrentView('settings')}>
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
              <img src={`https://ui-avatars.com/api/?name=${user?.full_name || 'User'}&background=random`} alt="User" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate text-slate-900">{user?.full_name || 'User'}</div>
              <div className="text-xs text-slate-500 truncate">Free Plan</div>
            </div>
            <Settings size={18} className="text-slate-400" />
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-red-600 text-sm font-bold py-3 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto bg-slate-50 relative custom-scrollbar">
        {/* Mobile Header Trigger */}
        <div className="lg:hidden p-4 sticky top-0 z-30 bg-slate-50/90 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600">
              <Menu size={24} />
            </button>
            JobHub
          </div>
          <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center font-bold text-xs">
            O
          </div>
        </div>

        <div className="p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto min-h-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};