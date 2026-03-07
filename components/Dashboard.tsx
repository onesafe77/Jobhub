import React, { useState } from 'react';
import {
  LayoutDashboard, Search, Briefcase, ScanLine, Coins, Settings,
  LogOut, Bell, ChevronRight, TrendingUp, Calendar, FileText,
  MapPin, DollarSign, PenTool, Sparkles, Zap, Filter, Bookmark,
  Star, X, CheckCircle2, ArrowLeft, ArrowRight, ExternalLink, Share2, AlertCircle, Check, Target,
  MoreHorizontal, ChevronLeft, Clock, Download, AlertTriangle, Lightbulb,
  Plus, Minus, ChevronDown, ChevronUp, Wand2, ListFilter, Menu, Upload, User, Mail, Phone, Lock, Globe, BellRing,
  Building2, Users, Trophy, MessageSquare, PieChart, Activity, Eye, Loader2, Copy, Newspaper, Bot, Send, BellOff, Trash2
} from 'lucide-react';
import { scraperService, InstagramPost } from "../lib/scraperService";
import { supabase } from "../lib/supabase";
import { quickMatchScore, loadProfile, saveProfile, clearProfile, UserProfile, analyzeCVForATS, ATSAnalysisResult, autoFixCVIssue, generateCoverLetter } from "../lib/openai";
import { CVBuilder } from './CVBuilder';
import { Pricing } from './Pricing';
import { CVUpload } from './CVUpload';
import { projectTasksService, ProjectTask, NewProjectTask } from "../lib/projectTasks";
import { favoriteJobsService, FavoriteJob, NewFavoriteJob } from "../lib/favoriteJobs";
import { extractTextFromPDF } from '../lib/pdfParser';

const exportToWord = (content: string, filename: string) => {
  const preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body style='font-family: Arial, sans-serif;'>";
  const postHtml = "</body></html>";
  const html = preHtml + content.replace(/\n/g, '<br>') + postHtml;

  const blob = new Blob(['\ufeff', html], {
    type: 'application/msword'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportCVToStyledWord = (cvData: any, filename: string) => {
  const sectionStyle = `margin-top:20pt;margin-bottom:8pt;padding-bottom:6pt;border-bottom:2pt solid #1a56db;font-family:'Calibri',sans-serif;font-size:13pt;font-weight:bold;color:#1a56db;text-transform:uppercase;letter-spacing:1pt;`;
  const bodyStyle = `font-family:'Calibri',sans-serif;font-size:10.5pt;color:#333333;line-height:1.6;`;
  const bulletStyle = `font-family:'Calibri',sans-serif;font-size:10.5pt;color:#333333;margin-left:18pt;line-height:1.5;margin-bottom:3pt;`;
  const subheadStyle = `font-family:'Calibri',sans-serif;font-size:11pt;font-weight:bold;color:#1e293b;margin-bottom:2pt;margin-top:12pt;`;
  const labelStyle = `font-family:'Calibri',sans-serif;font-size:9.5pt;color:#64748b;margin-top:2pt;`;

  let html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>CV</title>
<style>
@page { margin: 2.5cm 2.5cm 2.5cm 2.5cm; }
body { font-family: 'Calibri', sans-serif; font-size: 10.5pt; color: #333; line-height: 1.6; }
</style>
</head><body>`;

  // HEADER - Name & Contact
  const name = cvData.personal?.name || 'Nama Lengkap';
  const contacts = [
    cvData.personal?.email,
    cvData.personal?.phone,
    cvData.personal?.address,
    cvData.personal?.linkedin
  ].filter(Boolean);

  html += `<div style="text-align:center;margin-bottom:12pt;">`;
  html += `<p style="font-family:'Calibri',sans-serif;font-size:22pt;font-weight:bold;color:#0f172a;margin:0;letter-spacing:0.5pt;">${name}</p>`;
  if (contacts.length > 0) {
    html += `<p style="font-family:'Calibri',sans-serif;font-size:9.5pt;color:#64748b;margin-top:6pt;">${contacts.join('  ·  ')}</p>`;
  }
  html += `<hr style="border:none;border-top:1px solid #cbd5e1;margin-top:12pt;" />`;
  html += `</div>`;

  // SUMMARY
  if (cvData.summary) {
    html += `<p style="${sectionStyle}">Professional Summary</p>`;
    html += `<p style="${bodyStyle}">${cvData.summary}</p>`;
  }

  // EXPERIENCE
  if (cvData.experience && cvData.experience.length > 0) {
    html += `<p style="${sectionStyle}">Professional Experience</p>`;
    cvData.experience.forEach((exp: any) => {
      html += `<p style="${subheadStyle}">${exp.title || 'Job Title'}</p>`;
      html += `<p style="${labelStyle}">${exp.company || ''}${exp.period ? '  |  ' + exp.period : ''}${exp.location ? '  |  ' + exp.location : ''}</p>`;
      if (exp.bullets && exp.bullets.length > 0) {
        exp.bullets.forEach((b: string) => {
          html += `<p style="${bulletStyle}">•  ${b}</p>`;
        });
      }
    });
  }

  // EDUCATION
  if (cvData.education && cvData.education.length > 0) {
    html += `<p style="${sectionStyle}">Education</p>`;
    cvData.education.forEach((edu: any) => {
      html += `<p style="${subheadStyle}">${edu.degree || edu.title || 'Degree'}</p>`;
      html += `<p style="${labelStyle}">${edu.institution || ''}${edu.year ? '  |  ' + edu.year : ''}</p>`;
      if (edu.details) html += `<p style="${bodyStyle}">${edu.details}</p>`;
    });
  }

  // SKILLS
  if (cvData.skills && cvData.skills.length > 0) {
    html += `<p style="${sectionStyle}">Skills & Competencies</p>`;
    const skillGroups: string[] = [];
    cvData.skills.forEach((s: any) => {
      if (typeof s === 'string') {
        skillGroups.push(s);
      } else if (s.category && s.items) {
        skillGroups.push(`<b>${s.category}:</b> ${s.items.join(', ')}`);
      }
    });
    skillGroups.forEach(sg => {
      html += `<p style="${bulletStyle}">•  ${sg}</p>`;
    });
  }

  // CERTIFICATIONS
  if (cvData.certifications && cvData.certifications.length > 0) {
    html += `<p style="${sectionStyle}">Certifications & Training</p>`;
    cvData.certifications.forEach((cert: any) => {
      if (typeof cert === 'string') {
        html += `<p style="${bulletStyle}">•  ${cert}</p>`;
      } else {
        html += `<p style="${bulletStyle}">•  ${cert.name || cert.title}${cert.year ? ' (' + cert.year + ')' : ''}</p>`;
      }
    });
  }

  // LANGUAGES
  if (cvData.languages && cvData.languages.length > 0) {
    html += `<p style="${sectionStyle}">Languages</p>`;
    cvData.languages.forEach((lang: any) => {
      if (typeof lang === 'string') {
        html += `<p style="${bulletStyle}">•  ${lang}</p>`;
      } else {
        html += `<p style="${bulletStyle}">•  ${lang.language}${lang.level ? ' — ' + lang.level : ''}</p>`;
      }
    });
  }

  // ADDITIONAL SECTIONS
  if (cvData.additional_sections) {
    cvData.additional_sections.forEach((section: any) => {
      html += `<p style="${sectionStyle}">${section.title}</p>`;
      if (section.items) {
        section.items.forEach((item: string) => {
          html += `<p style="${bulletStyle}">•  ${item}</p>`;
        });
      }
      if (section.content) {
        html += `<p style="${bodyStyle}">${section.content}</p>`;
      }
    });
  }

  html += `</body></html>`;

  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- INTERFACES & MOCK DATA ---

interface DashboardProps {
  onLogout?: () => void;
  user?: {
    full_name?: string;
    email?: string;
    job_preferences?: {
      selected_jobs?: string[];
      selected_locations?: string[];
      experience?: string;
    };
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
  logoUrl?: string;
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
  url?: string;
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
  isStarred?: boolean;
}

interface Notification {
  id: number;
  type: 'match' | 'application' | 'system';
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

type DashboardView = 'dashboard' | 'search' | 'detail' | 'applications' | 'scanner' | 'settings' | 'notifications' | 'cv' | 'project-tracker' | 'cover-letter' | 'cpns-bumn' | 'ai-chat' | 'cv-builder' | 'pricing' | 'salary-checker';

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
  { id: 1, title: 'Frontend Developer', company: 'GoTo Financial', appliedDate: '3 days ago', fullDate: 'Feb 6, 2026', status: 'Interview', isStarred: true },
  { id: 2, title: 'Backend Engineer', company: 'Tokopedia', appliedDate: '5 days ago', fullDate: 'Feb 4, 2026', status: 'Pending' },
  { id: 3, title: 'Data Analyst', company: 'Gojek', appliedDate: '1 week ago', fullDate: 'Feb 1, 2026', status: 'Rejected' },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 1, type: 'match', title: 'New High Match Job!', message: '95% match for Senior Frontend Developer at Traveloka.', time: '2 hours ago', unread: true },
  { id: 2, type: 'application', title: 'Application Viewed', message: 'GoTo Financial viewed your application for Frontend Developer.', time: '5 hours ago', unread: true },
  { id: 3, type: 'system', title: 'Welcome to Jobs Agent Pro', message: 'Your pro trial has started. Enjoy unlimited AI features.', time: '1 day ago', unread: false },
  { id: 4, type: 'match', title: 'New Job Alert', message: 'Backend Engineer at Shopee matches your preferences.', time: '1 day ago', unread: false },
];

// Removed duplicate ProjectTask interfaces and mock data as they are now in projectTasks.ts

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

const NavDropdown: React.FC<{
  icon: React.ReactNode;
  label: string;
  activePath?: boolean;
  children: React.ReactNode;
}> = ({ icon, label, activePath, children }) => {
  const [isOpen, setIsOpen] = useState(activePath || false);
  return (
    <div className="mb-1">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group
          ${activePath ? 'bg-brand-50/50 text-brand-700 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
      >
        <span className={`${activePath ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
          {icon}
        </span>
        <span className="flex-1 text-sm">{label}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[400px] mt-1 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="pl-4 pr-1 space-y-1 border-l-2 border-slate-100/50 ml-6 pb-2">
          {children}
        </div>
      </div>
    </div>
  );
};

const TopBar: React.FC<{
  title: string;
  subtitle?: string;
  onNotificationClick?: () => void;
  unreadNotifications?: number;
}> = ({ title, subtitle, onNotificationClick, unreadNotifications = 0 }) => (
  <div className="flex flex-row items-center justify-between mb-6 pb-4 border-b border-slate-200/60 gap-4">
    <div className="flex flex-col flex-1 shrink min-w-0">
      <h1 className="text-[24px] sm:text-[32px] font-[900] text-slate-900 tracking-tight leading-tight truncate">{title}</h1>
      {subtitle && <p className="text-[13px] sm:text-[15px] text-slate-500 font-medium mt-1 truncate">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-3">
      {onNotificationClick && (
        <button
          onClick={onNotificationClick}
          className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-500 relative shadow-sm hover:shadow-md hover:border-slate-300 hover:text-brand-600 transition-all active:scale-95 group"
        >
          <Bell size={22} className="group-hover:animate-shake" />
          {unreadNotifications > 0 && (
            <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
          )}
        </button>
      )}
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
  const styles: Record<ApplicationStatus, string> = {
    Interview: 'bg-green-50 text-green-700 border-green-100',
    Pending: 'bg-orange-50 text-orange-700 border-orange-100',
    Rejected: 'bg-red-50 text-red-700 border-red-100',
  };

  const iconColors: Record<ApplicationStatus, string> = {
    Interview: 'bg-green-600',
    Pending: 'bg-orange-600',
    Rejected: 'bg-red-600',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${iconColors[status]}`}></span>
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
  isFixing?: boolean;
}> = ({ type, title, impact, explanation, fix, onAutoFix, isFixing }) => {
  const styles = {
    critical: {
      bg: 'bg-red-50/50',
      border: 'border-red-200',
      title: 'text-red-800',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-700',
      icon: <X size={18} className="text-red-500" />,
      btn: 'bg-red-500 hover:bg-red-600 text-white'
    },
    warning: {
      bg: 'bg-orange-50/50',
      border: 'border-orange-200',
      title: 'text-orange-800',
      badgeBg: 'bg-orange-100',
      badgeText: 'text-orange-700',
      icon: <AlertTriangle size={18} className="text-orange-500" />,
      btn: 'bg-orange-500 hover:bg-orange-600 text-white'
    },
    suggestion: {
      bg: 'bg-blue-50/50',
      border: 'border-blue-200',
      title: 'text-blue-800',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-700',
      icon: <Lightbulb size={18} className="text-blue-500" />,
      btn: 'bg-blue-500 hover:bg-blue-600 text-white'
    }
  };

  const s = styles[type];

  return (
    <div className={`p-5 rounded-2xl border transition-all hover:shadow-md ${s.bg} ${s.border}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 p-1.5 rounded-lg bg-white shadow-sm border ${s.border}`}>
            {s.icon}
          </div>
          <div>
            <h4 className={`text-base font-bold ${s.title} leading-tight mb-1`}>{title}</h4>
            <div className={`text-[10px] font-bold uppercase tracking-wider ${s.badgeText}`}>
              {type}
            </div>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${s.badgeBg} ${s.badgeText}`}>
          {impact}
        </span>
      </div>

      <p className={`text-sm mb-4 leading-relaxed text-slate-700 ml-11`}>
        {explanation}
      </p>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 ml-11">
        <div className={`text-sm italic text-slate-600 bg-white/60 p-3 rounded-xl border ${s.border} flex-1`}>
          <div className="flex items-center gap-1.5 font-semibold mb-1 text-slate-800 not-italic text-xs">
            <Sparkles size={14} className={s.badgeText} /> AI Suggestion:
          </div>
          "{fix}"
        </div>
        <button
          onClick={onAutoFix}
          disabled={isFixing}
          className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-black/5 disabled:opacity-70 ${s.btn}`}
        >
          {isFixing ? <><Loader2 size={14} className="animate-spin" /> Fixing...</> : <><Wand2 size={14} /> Auto-Fix</>}
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

const DashboardHome: React.FC<{ onViewChange: (view: DashboardView) => void; user?: DashboardProps['user']; unreadCount: number }> = ({ onViewChange, user, unreadCount }) => {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    projectTasksService.getTasks()
      .then(data => setTasks(data))
      .catch(err => console.error("Error fetching tasks for dashboard:", err))
      .finally(() => setLoading(false));
  }, []);

  const totalApplications = tasks.length;
  const totalPlan = tasks.filter(t => t.status === 'Plan').length;
  const totalApplied = tasks.filter(t => t.status === 'Applied').length;
  const totalInterviews = tasks.filter(t => t.status === 'Interview').length;
  const totalOffers = tasks.filter(t => t.status === 'Offer').length;

  const upcomingInterviews = tasks
    .filter(t => t.status === 'Interview' && t.task_date)
    .sort((a, b) => new Date(a.task_date!).getTime() - new Date(b.task_date!).getTime())
    .slice(0, 3);

  const recentActivity = tasks
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  const getTimeAgo = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      <TopBar
        title="Dashboard"
        subtitle="Overview aktivitas pencarian kerjamu minggu ini."
        onNotificationClick={() => onViewChange('notifications')}
        unreadNotifications={unreadCount}
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
                {totalInterviews > 0
                  ? `Kamu punya ${totalInterviews} jadwal di My Notebook. Semangat terus!`
                  : `Yuk, mulai cari dan lamar pekerjaan impianmu hari ini.`}
              </p>
              <div className="flex gap-4 mt-2">
                <button
                  onClick={() => onViewChange('search')}
                  className="bg-white text-brand-600 px-6 py-3 rounded-2xl font-bold hover:bg-brand-50 transition-all shadow-md flex items-center gap-2 text-sm active:scale-95"
                >
                  <Search size={18} /> Mulai Cari Lowongan
                </button>
                <button
                  onClick={() => onViewChange('project-tracker')}
                  className="bg-brand-700/50 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold hover:bg-brand-800/60 transition-all flex items-center gap-2 text-sm active:scale-95 border border-brand-400/30"
                >
                  <Target size={18} /> Buka Notebook
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard icon={<Star size={20} />} colorClass="text-slate-600 bg-amber-50" label="Plan" value={loading ? "..." : totalPlan.toString()} />
            <StatCard icon={<Briefcase size={20} />} colorClass="text-blue-600 bg-blue-50" label="Applied" value={loading ? "..." : totalApplied.toString()} />
            <StatCard icon={<Calendar size={20} />} colorClass="text-purple-600 bg-purple-50" label="Interview" value={loading ? "..." : totalInterviews.toString()} />
            <StatCard icon={<Trophy size={20} />} colorClass="text-emerald-600 bg-emerald-50" label="Offer" value={loading ? "..." : totalOffers.toString()} />
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
                  <div className="text-2xl font-bold text-slate-900">{loading ? '-' : totalApplications}</div>
                  <div className="text-xs text-slate-500 font-medium">Total Applications</div>
                </div>
                <div className="h-8 w-px bg-slate-100"></div>
                <div>
                  <div className="text-2xl font-bold text-green-600">18%</div>
                  <div className="text-xs text-slate-500 font-medium">Est. Response Rate</div>
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
            {loading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="animate-spin text-brand-500 w-6 h-6" />
              </div>
            ) : upcomingInterviews.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-4">Tidak ada jadwal dalam waktu dekat.</div>
            ) : (
              <div className="space-y-4">
                {upcomingInterviews.map((task, i) => {
                  const date = new Date(task.task_date!);
                  const month = date.toLocaleDateString('id-ID', { month: 'short' });
                  const day = date.toLocaleDateString('id-ID', { day: '2-digit' });

                  return (
                    <div key={task.id} className={`flex gap-4 items-start ${i !== upcomingInterviews.length - 1 ? 'pb-4 border-b border-slate-50' : ''}`}>
                      <div className="bg-brand-50 text-brand-600 rounded-lg w-12 h-12 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold uppercase">{month}</span>
                        <span className="text-lg font-bold leading-none">{day}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{task.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{task.company}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-orange-500" /> Activity
            </h3>
            {loading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="animate-spin text-orange-500 w-6 h-6" />
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-4">Belum ada aktivitas.</div>
            ) : (
              <div className="space-y-4 relative">
                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
                {recentActivity.map((task, i) => (
                  <div key={task.id} className="flex gap-3 items-start relative z-10">
                    <div className="w-10 h-10 rounded-full border-4 border-white bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Check size={12} />
                    </div>
                    <div className="pt-1">
                      <p className="text-sm font-medium text-slate-800 leading-tight">
                        Status <span className="font-bold">"{task.status}"</span> di <span className="font-bold">{task.company}</span>
                      </p>
                      <span className="text-xs text-slate-400">{getTimeAgo(task.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const JobSearch: React.FC<{
  onJobClick: (job: Job) => void;
  onViewChange: (view: DashboardView) => void;
  user?: DashboardProps['user'];
  userProfile: UserProfile | null;
  unreadCount?: number;
  isSplitView?: boolean;
  selectedJob?: Job | null;
}> = ({ onJobClick, onViewChange, user, userProfile, unreadCount = 0, isSplitView = false, selectedJob }) => {
  const [viewState, setViewState] = useState<'empty' | 'results' | 'loading'>('empty');
  const [searchInput, setSearchInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  const [sortBy, setSortBy] = useState<'terbaru' | 'rekomendasi'>('terbaru');
  const [activeFilters, setActiveFilters] = useState<{ keyword: string, location: string }>({ keyword: '', location: '' });

  const popularSearches = ["Software Engineer", "Data Analyst", "Safety Officer", "Marketing", "Accountant", "UI/UX Designer"];
  const popularLocations = ["Jakarta", "Bandung", "Surabaya", "Indonesia", "Remote"];

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    // Don't clear results when user is typing/clearing — keep previous results visible
  };

  const handleLocationChange = (val: string) => {
    setLocationInput(val);
  };

  const removeFilter = (type: 'keyword' | 'location') => {
    if (type === 'keyword') {
      setSearchInput('');
      setActiveFilters(prev => ({ ...prev, keyword: '' }));
    } else {
      setLocationInput('');
      setActiveFilters(prev => ({ ...prev, location: '' }));
    }
    // Re-run search with remaining filter, but keep current results if no filters left
    setTimeout(() => {
      const remainingKeyword = type === 'keyword' ? '' : searchInput;
      const remainingLocation = type === 'location' ? '' : locationInput;
      if (remainingKeyword || remainingLocation) {
        handleSearchWithParams(remainingKeyword, remainingLocation);
      }
      // If no remaining filters, keep displaying current results (don't clear)
    }, 0);
  };

  const handleSearch = () => handleSearchWithParams(searchInput, locationInput);

  const handleSearchWithParams = async (keyword: string, location: string) => {
    if (!keyword.trim() && !location.trim()) return;

    setViewState('loading');
    const searchTerm = keyword.trim();
    const locationTerm = location.trim();

    // Save active filters
    setActiveFilters({ keyword: searchTerm, location: locationTerm });

    try {
      console.log('[Search] Keyword:', searchTerm, '| Location:', locationTerm);

      // Build server-side Supabase query
      let query = supabase
        .from('jobs')
        .select('*')
        .order('posted_at', { ascending: false })
        .limit(200);

      // If there's a keyword, search in title OR company
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`);
      }

      // If there's a location, search in location
      if (locationTerm) {
        query = query.ilike('location', `%${locationTerm}%`);
      }

      // Execute query
      const { data: jobsData, error } = await query;

      if (error) {
        console.error('[Search] Supabase error:', error);
        throw error;
      }

      let currentJobs = jobsData || [];

      // Proactive Scraping: If results are too few (< 10), trigger background LinkedIn scrape
      if (currentJobs.length < 10 && (searchTerm || locationTerm)) {
        console.log(`[Search] Low results (${currentJobs.length}). Triggering proactive scrape...`);
        setIsScraping(true);

        const scrapeLoc = locationTerm || 'Indonesia';
        const scrapeUrl = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(searchTerm || 'Job')}&location=${encodeURIComponent(scrapeLoc)}`;

        // Move to results view but keep loading indicator or show what we have first
        setJobs(mapResultsToJobs(currentJobs));
        setViewState('results');

        // Execute scrape in background (non-blocking)
        const scraperTimeout = setTimeout(() => setIsScraping(false), 15000); // 15s max safety

        scraperService.scrapeJob(scrapeUrl).then(scraped => {
          clearTimeout(scraperTimeout);
          console.log(`[Search] Scrape results: ${scraped?.length || 0} jobs found`);

          // Wait slightly for sync to finish then re-query
          setTimeout(async () => {
            let refreshQuery = supabase
              .from('jobs')
              .select('*')
              .order('posted_at', { ascending: false })
              .limit(200);

            if (searchTerm) refreshQuery = refreshQuery.or(`title.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`);
            if (locationTerm) refreshQuery = refreshQuery.ilike('location', `%${locationTerm}%`);

            const { data: updatedData } = await refreshQuery;
            if (updatedData && updatedData.length > 0) {
              setJobs(mapResultsToJobs(updatedData));
            }
            setIsScraping(false);
          }, 2000);
        }).catch(err => {
          clearTimeout(scraperTimeout);
          console.warn("[Search] Proactive scrape failed:", err);
          setIsScraping(false);
        });
      } else {
        setJobs(mapResultsToJobs(currentJobs));
        setViewState('results');
      }

    } catch (error: any) {
      console.error('[Search] Fatal error:', error);
      setViewState('results');
      setJobs([]);
    }
  };

  // Map Supabase results to Job interface
  const mapResultsToJobs = (results: any[]): Job[] => {
    return results.map((result: any, index: number) => ({
      id: index + 1,
      title: result.title || 'Untitled',
      company: result.company || 'Unknown',
      location: result.location || 'Remote',
      salary: result.salary || 'Negosiasi',
      description: result.description ? result.description.substring(0, 200) + '...' : 'Lihat detail untuk selengkapnya.',
      source: result.source || 'LinkedIn',
      timeAgo: result.posted_at ? formatTimeAgo(result.posted_at) : 'Baru saja',
      logo: (result.company || 'U').charAt(0).toUpperCase(),
      logoColor: getLogoColor(index),
      logoUrl: result.logo_url || getCompanyLogoUrl(result.company),
      tags: extractTags(result),
      matchScore: (() => { const m = quickMatchScore(userProfile, result.title || '', result.description || ''); return m.overall; })(),
      type: result.job_type || 'Full-time',
      url: result.url || result.apply_url || '',
      longDescription: result.description || 'Lihat detail untuk selengkapnya.',
      requirements: [],
      aiAnalysis: (() => {
        const m = quickMatchScore(userProfile, result.title || '', result.description || '');
        return {
          skills: m.skills,
          experience: m.experience,
          education: m.education,
          strongMatches: m.strongMatches,
          missing: m.missing,
        };
      })()
    }));
  };

  // Helper: format posted_at into human-readable time ago
  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const posted = new Date(dateStr);
    const diffMs = now.getTime() - posted.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return '1 hari lalu';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
    return `${Math.floor(diffDays / 30)} bulan lalu`;
  };

  // Helper: rotate logo colors
  const getLogoColor = (index: number) => {
    const colors = ['bg-brand-600', 'bg-green-600', 'bg-orange-500', 'bg-purple-600', 'bg-red-500', 'bg-blue-500', 'bg-teal-600', 'bg-pink-600'];
    return colors[index % colors.length];
  };

  // Helper: extract tags from job data
  // Helper: get company logo URL
  const getCompanyLogoUrl = (company: string): string => {
    if (!company) return `https://ui-avatars.com/api/?name=?&background=6366f1&color=fff&size=80&bold=true`;
    // Use UI Avatars API - always returns a clean, colorful avatar image
    const colors = ['3b82f6', '10b981', 'f59e0b', 'ef4444', '8b5cf6', 'ec4899', '06b6d4', '14b8a6'];
    const colorIdx = company.length % colors.length;
    const bg = colors[colorIdx];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=${bg}&color=fff&size=80&bold=true&font-size=0.35`;
  };

  // Helper: extract tags from job data
  const extractTags = (result: any) => {
    const tags: string[] = [];
    if (result.job_type) tags.push(result.job_type);
    if (result.source) tags.push(result.source);
    if (result.location) {
      const city = result.location.split(',')[0]?.trim();
      if (city) tags.push(city);
    }
    return tags.length > 0 ? tags : ['LinkedIn'];
  };

  return (
    <div className="flex flex-col h-full animate-fade-in pb-10">
      {/* TOP SECTION - Minimal for Empty, Full for Results */}
      {viewState !== 'empty' && (
        <div className="mb-8">
          <TopBar
            title="Cari Lowongan"
            onNotificationClick={() => onViewChange('notifications')}
            unreadNotifications={unreadCount}
          />

          <div className="flex flex-col gap-3 animate-fade-in-up pr-2">
            <div className={`flex flex-col ${isSplitView ? 'xl:flex-row flex-wrap' : 'md:flex-row'} gap-3`}>
              <div className="flex-1 min-w-[200px] relative group z-30">
                <div className="relative flex items-center bg-white rounded-xl p-2 shadow-sm border border-slate-200 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all duration-300 h-[56px]">
                  <Search className="ml-3 text-slate-400 shrink-0" size={20} />
                  <input
                    type="text"
                    placeholder="Posisi atau keyword..."
                    className="flex-1 min-w-0 px-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              <div className={`w-full ${isSplitView ? 'xl:w-[200px]' : 'md:w-[200px] lg:w-[260px]'} relative z-30`}>
                <div className="relative flex items-center bg-white rounded-xl p-2 shadow-sm border border-slate-200 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all duration-300 h-[56px]">
                  <MapPin className="ml-3 text-slate-400 shrink-0" size={20} />
                  <input
                    type="text"
                    placeholder="Lokasi..."
                    className="flex-1 min-w-0 px-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                    value={locationInput}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              <button
                onClick={handleSearch}
                className={`h-[56px] px-6 bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-700 hover:to-blue-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 shrink-0 ${isSplitView ? 'w-full xl:w-auto' : 'w-full md:w-auto'}`}
              >
                <Search size={20} />
                <span className={`hidden sm:inline ${isSplitView ? 'xl:inline' : 'lg:inline'}`}>Cari Pekerjaan</span>
              </button>
            </div>

            {(activeFilters.keyword || activeFilters.location) && viewState === 'results' && (
              <div className="flex flex-wrap gap-2">
                {activeFilters.keyword && (
                  <div
                    onClick={() => removeFilter('keyword')}
                    className="bg-brand-50 text-brand-700 border border-brand-200 text-sm font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-brand-100 transition-colors"
                  >
                    🔍 {activeFilters.keyword}
                    <X size={14} className="text-brand-400 hover:text-brand-600" />
                  </div>
                )}
                {activeFilters.location && (
                  <div
                    onClick={() => removeFilter('location')}
                    className="bg-green-50 text-green-700 border border-green-200 text-sm font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-green-100 transition-colors"
                  >
                    📍 {activeFilters.location}
                    <X size={14} className="text-green-400 hover:text-green-600" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEARCH CONTENT AREA */}
      <div className="flex-1 flex flex-col">
        {viewState === 'loading' ? (
          <div className="animate-fade-in-up flex flex-col items-center justify-center py-20">
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-slate-100 border-t-brand-500 rounded-full animate-spin"></div>
              <div className="w-10 h-10 bg-gradient-to-tr from-brand-500 to-purple-500 rounded-full animate-pulse shadow-lg shadow-brand-500/30"></div>
              <Sparkles size={20} className="absolute text-white animate-ping" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">AI Sedang Mencari...</h3>
            <p className="text-slate-500 mb-8 max-w-sm text-center">
              Menganalisis ribuan data lowongan, menghitung skor kecocokan, dan memfilter gaji terbaik untuk Anda.
            </p>
          </div>
        ) : viewState === 'results' ? (
          <div className="animate-fade-in-up">
            {/* Results Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-2 border-b border-slate-100">
              <div className="flex flex-col">
                <div className="text-[17px] text-slate-900 font-[900] flex items-center gap-2">
                  <span>{jobs.length} Lowongan Ditemukan</span>
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                  <span className="text-slate-400 font-bold text-[13px] uppercase tracking-wide">Hasil Pencarian</span>
                </div>
                {isScraping && (
                  <div className="flex items-center gap-2 text-brand-600 text-[12px] font-extrabold mt-1 animate-pulse">
                    <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                    <span>Scraping live data...</span>
                  </div>
                )}
              </div>

              {/* Sort Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-[14px] border border-slate-200/50 shadow-inner">
                <button
                  onClick={() => setSortBy('terbaru')}
                  className={`px-4 py-2 text-[11px] uppercase tracking-wider font-black rounded-[10px] transition-all transform ${sortBy === 'terbaru' ? 'bg-white text-slate-900 shadow-md border border-slate-100 scale-100' : 'text-slate-400 hover:text-slate-600 scale-95'}`}
                >
                  Terbaru
                </button>
                <button
                  onClick={() => setSortBy('rekomendasi')}
                  className={`px-4 py-2 text-[11px] uppercase tracking-wider font-black rounded-[10px] transition-all flex items-center gap-2 transform ${sortBy === 'rekomendasi' ? 'bg-white text-brand-700 shadow-md border border-brand-100 scale-100' : 'text-slate-400 hover:text-slate-600 scale-95'}`}
                >
                  <Sparkles size={14} className={sortBy === 'rekomendasi' ? 'text-brand-500' : ''} />
                  AI Match
                </button>
              </div>
            </div>

            {/* Job Cards */}
            <div className="space-y-3">
              {[...jobs].sort((a, b) => {
                if (sortBy === 'rekomendasi') return (b.matchScore || 0) - (a.matchScore || 0);
                // Default is 'terbaru' which is already the natural order from the DB
                return 0;
              }).map((job) => (
                <div
                  key={job.id}
                  onClick={() => onJobClick(job)}
                  className={`bg-white rounded-2xl border transition-all cursor-pointer flex flex-col relative ${selectedJob?.id === job.id ? 'border-brand-500 ring-4 ring-brand-500/10 shadow-md bg-brand-50/20' : 'border-slate-200 p-5 hover:border-slate-300'}`}
                  style={{ padding: selectedJob?.id === job.id ? '1.25rem' : '1.25rem' }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-800 hover:text-brand-600 transition-colors mb-1 truncate">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-[15px] font-medium text-slate-600">
                          {job.company}
                        </div>
                        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md text-[11px] font-bold">
                          {job.matchScore}% <Star size={10} fill="currentColor" />
                        </div>
                      </div>
                    </div>

                    {job.logoUrl && (
                      <img
                        src={job.logoUrl}
                        alt={job.company}
                        className="w-[60px] h-[60px] object-contain flex-shrink-0"
                      />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-5 mt-3">
                    <span className="text-[13px] font-bold text-slate-500 flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 rounded border border-slate-100 uppercase tracking-tighter">
                      <Briefcase size={13} strokeWidth={2.5} /> Purna waktu
                    </span>
                    <span className="text-[13px] text-slate-600 font-semibold flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" />{job.location}</span>
                    {job.salary && job.salary !== 'Negosiasi' && (
                      <span className="text-[13px] text-brand-700 font-bold bg-brand-50/50 px-2 py-0.5 rounded border border-brand-100/50">{job.salary}</span>
                    )}
                  </div>

                  <ul className="list-disc pl-4 text-[13px] text-slate-500 mb-6 space-y-1 opacity-80">
                    <li className="line-clamp-1">{job.description.split('.')[0] || job.description}</li>
                    {job.tags && job.tags.length > 0 && (
                      <li className="line-clamp-1">{job.tags.join(' | ')}</li>
                    )}
                  </ul>

                  <div className="flex justify-between items-center mt-auto border-t border-slate-100 pt-4">
                    <span className="text-[13px] text-slate-400 font-medium">
                      {job.timeAgo}
                    </span>

                    <div className="flex items-center gap-4 text-[13px] font-bold text-slate-500">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await favoriteJobsService.addFavorite(job);
                            alert("Lowongan disimpan ke favorit!");
                          } catch (err) {
                            console.error("Gagal menyimpan favorit:", err);
                          }
                        }}
                        className="flex items-center hover:text-amber-500 transition-colors"
                      >
                        <Star size={18} className="hover:fill-amber-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle hide logic here
                        }}
                        className="flex items-center gap-1.5 hover:text-red-500 transition-colors"
                      >
                        <X size={16} strokeWidth={2.5} /> Sembunyikan
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : isSplitView ? (
          /* COMPACT EMPTY STATE for Split View */
          <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Search size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Cari Lowongan Lain</h3>
            <p className="text-sm text-slate-400 mb-5 max-w-[250px]">Ketik keyword di kolom pencarian untuk menemukan lowongan lain.</p>
          </div>
        ) : (
          /* EMPTY STATE - AI HYBRID PORTAL */
          <div className="flex-1 flex flex-col items-center justify-start sm:justify-center min-h-[600px] relative w-full pt-12 sm:pt-20 pb-20 animate-fade-in px-4 text-center">

            {/* Minimal Floating Nav for Empty State */}
            <div className="absolute top-4 left-0 w-full px-6 flex justify-between items-center z-40">
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status: Jobs Agent Active</span>
                <p className="text-sm font-bold text-slate-900">Welcome, {user?.full_name?.split(' ')[0] || 'User'} ✨</p>
              </div>
              <button
                onClick={() => onViewChange('notifications')}
                className="w-11 h-11 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-500 relative shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
                )}
              </button>
            </div>

            {/* Decorative Background Orbs for AI Vibe */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] h-[500px] pointer-events-none overflow-hidden z-0 flex justify-center items-center opacity-30">
              <div className="absolute w-[400px] h-[400px] bg-brand-400/20 rounded-full blur-[100px] -translate-x-40 -translate-y-20 animate-pulse"></div>
              <div className="absolute w-[350px] h-[350px] bg-indigo-400/20 rounded-full blur-[100px] translate-x-40 translate-y-20" style={{ animationDelay: '3s' }}></div>
            </div>

            <div className="relative z-10 w-full flex flex-col items-center max-w-4xl">
              <h2 className="text-[32px] sm:text-5xl md:text-6xl font-[900] text-slate-900 mb-6 text-center tracking-tight leading-[1.1] animate-fade-in-up">
                Cari kerja lebih<br /><span className="text-brand-600">pintar dengan AI.</span>
              </h2>
              <p className="text-base sm:text-lg text-slate-500 text-center mb-12 max-w-[500px] leading-relaxed animate-fade-in-up delay-100 font-medium">
                Ketik posisi atau keahlian Anda, biar Job Agent yang mencarikan lowongan paling cocok.
              </p>

              {/* CHATGPT STYLE GIANT SEARCH BAR */}
              <div className="w-full max-w-[760px] bg-white rounded-[32px] p-2.5 sm:p-3 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.15)] border border-slate-200/50 focus-within:border-brand-500 focus-within:ring-[10px] focus-within:ring-brand-500/5 transition-all duration-500 relative z-30 flex flex-col sm:flex-row mb-16 animate-fade-in-up delay-200 group">

                <div className="flex-[1.4] flex items-center px-6 h-[68px] sm:h-[80px] border-b sm:border-b-0 sm:border-r border-slate-100/80 transition-colors group-focus-within:border-slate-200">
                  <Search className="text-brand-500 shrink-0 mr-4" size={24} strokeWidth={2.5} />
                  <input
                    type="text"
                    placeholder="Posisi impian, misal: Software Developer..."
                    className="flex-1 min-w-0 text-[16px] sm:text-[19px] text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent font-bold tracking-tight"
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>

                <div className="flex-1 flex items-center px-6 h-[68px] sm:h-[80px]">
                  <MapPin className="text-slate-400 shrink-0 mr-4" size={22} />
                  <input
                    type="text"
                    placeholder="Lokasi..."
                    className="flex-1 min-w-0 text-[16px] sm:text-[19px] text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent font-semibold"
                    value={locationInput}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>

                <button
                  onClick={handleSearch}
                  className="mt-2 sm:mt-0 h-[68px] sm:h-[80px] px-12 bg-slate-900 hover:bg-brand-600 text-white rounded-[26px] font-[900] transition-all shadow-xl hover:shadow-brand-500/30 flex items-center justify-center gap-3 shrink-0 active:scale-[0.96] text-[16px] uppercase tracking-widest"
                >
                  <span>Cari</span>
                  <ArrowRight size={20} strokeWidth={3} />
                </button>
              </div>

              {userProfile && (
                <div className="w-full flex justify-center mb-16 animate-fade-in delay-500">
                  <button onClick={() => { let keyword = userProfile.preferred_roles?.[0] || "Pekerjaan"; setSearchInput(keyword); handleSearchWithParams(keyword, locationInput); }} className="relative bg-white/80 backdrop-blur-xl border border-brand-100 py-5 px-12 rounded-full font-black text-slate-900 flex items-center gap-4 shadow-xl hover:-translate-y-1 transition-all">
                    <Sparkles size={20} className="text-brand-500" />
                    <span>Dapatkan Rekomendasi Sesuai CV</span>
                  </button>
                </div>
              )}
            </div>

            {/* User Selected Locations (from Onboarding) */}
            {user?.job_preferences?.selected_locations && user.job_preferences.selected_locations.length > 0 && (
              <div className="mt-12 pt-12 border-t border-slate-100/50 w-full max-w-2xl flex flex-col items-center gap-5">
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  <span className="text-[11px] font-[900] text-slate-400 uppercase tracking-[0.2em]">Lokasi Pilihan Anda</span>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {user.job_preferences.selected_locations.map((loc, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setLocationInput(loc);
                        handleSearchWithParams(searchInput, loc);
                      }}
                      className="px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold rounded-full text-sm transition-all cursor-pointer border border-blue-200 hover:border-blue-300 shadow-sm flex items-center gap-1.5"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div >
  );
};


const JobDetail: React.FC<{ job: Job; onBack: () => void; userProfile: UserProfile | null; user?: { full_name?: string; email?: string; }; unreadCount?: number; isSplitView?: boolean; }> = ({ job, onBack, userProfile, user, unreadCount = 0, isSplitView = false }) => {
  const [generating, setGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [savingJob, setSavingJob] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [draftingLetter, setDraftingLetter] = useState(false);

  const handleEasyApply = () => {
    const url = (job as any).url || (job as any).apply_url;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    else alert('Link lamaran tidak ditemukan.');
  };

  const handleDraftAndDownload = async () => {
    setDraftingLetter(true);
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) throw new Error("OpenAI API Key tidak ditemukan.");

      let userContext = "No specific applicant profile provided. Write a generic but professional cover letter. Do not include placeholder brackets like [Your Name].";
      if (userProfile && userProfile.raw_cv) {
        userContext = `
          The applicant has provided their full CV text below.
          Use their NAME, EMAIL, PHONE, and LOCATION exactly as they appear in this CV.
          
          Applicant CV Text:
          """
          ${userProfile.raw_cv}
          """
          
          Background Summary:
          Experience: ${userProfile.experience_years} years. ${userProfile.experience_summary}
          Skills: ${userProfile.skills.join(', ')}
          Education: ${userProfile.education}
          Certifications: ${userProfile.certifications.join(', ')}
        `;
      } else if (user) {
        userContext = `Applicant Identity:\nName: ${user.full_name || '[Applicant Name]'}\nEmail: ${user.email || '[Applicant Email]'}`;
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.7,
          messages: [
            {
              role: 'system',
              content: 'You are an expert career consultant. Write a professional, concise, and persuasive cover letter in English. Use the provided Applicant Identity details in the header instead of placeholders like [Your Name]. If any detail is missing, omit it entirely rather than using brackets.'
            },
            {
              role: 'user',
              content: `Draft a cover letter for the ${job.title} role at ${job.company}.\nJob Description snippet: ${job.description}\n\nApplicant Profile Context:\n${userContext}`
            }
          ]
        })
      });

      if (!response.ok) throw new Error("API request failed");
      const data = await response.json();
      const letterContent = data.choices[0].message.content || "Draft could not be generated.";

      // Auto download as Word
      exportToWord(letterContent, `CoverLetter_${job.company.replace(/\s+/g, '_')}_${job.title.replace(/\s+/g, '_')}.doc`);
    } catch (err: any) {
      console.error("Draft Error:", err);
      alert(`Gagal membuat draft: ${err.message}`);
    } finally {
      setDraftingLetter(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    setGenerating(true);
    setCoverLetter("");

    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) throw new Error("OpenAI API Key is missing");

      let userContext = "No specific applicant profile provided. Write a generic but professional cover letter. Do not include placeholder brackets like [Your Name].";
      if (userProfile || user) {

        if (userProfile && userProfile.raw_cv) {
          userContext = `
          The applicant has provided their full CV text below.
          Use their NAME, EMAIL, PHONE, and LOCATION exactly as they appear in this CV instead of any placeholder. Do NOT use the name '${user?.full_name}' unless it is explicitly their name in the CV.
          
          Applicant CV Text:
          """
          ${userProfile.raw_cv}
          """
          
          Background Summary:
          Experience: ${userProfile.experience_years} years. ${userProfile.experience_summary}
          Skills: ${userProfile.skills.join(', ')}
          Education: ${userProfile.education}
          Certifications: ${userProfile.certifications.join(', ')}
          `;
        } else {
          const applicantName = user?.full_name || "[Applicant Name]";
          const applicantEmail = user?.email || "[Applicant Email]";
          userContext = `
        Applicant Identity:
        Name: ${applicantName}
        Email: ${applicantEmail}
        `;
        }
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.7,
          messages: [
            {
              role: 'system',
              content: 'You are an expert career consultant. Write a professional, concise, and persuasive cover letter in English. Use the provided Applicant Identity details in the header instead of placeholders like [Your Name]. If any detail is missing, omit it entirely rather than using brackets.'
            },
            {
              role: 'user',
              content: `Draft a cover letter for the ${job.title} role at ${job.company}.
        Job Description snippet: ${job.description}

        Applicant Profile Context:
        ${userContext}`
            }
          ]
        })
      });

      if (!response.ok) throw new Error("API request failed");
      const data = await response.json();
      setCoverLetter(data.choices[0].message.content || "Draft could not be generated.");
    } catch (err: any) {
      console.error("AI Error:", err);
      setCoverLetter(`Error: ${err.message || 'An error occurred during generation.'}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    setAiSummary("");

    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) throw new Error("OpenAI API Key is missing");

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.3,
          messages: [
            {
              role: 'system',
              content: 'You are an HR expert. Summarize the following job description into 3-5 concise, high-impact bullet points focusing ONLY on the core responsibilities and hard requirements. Use Indonesian language (Bahasa Indonesia).'
            },
            {
              role: 'user',
              content: `Job Title: ${job.title}\nJob Description: ${job.longDescription}`
            }
          ]
        })
      });

      if (!response.ok) throw new Error("API request failed");
      const data = await response.json();
      setAiSummary(data.choices[0].message.content || "Draft could not be generated.");
    } catch (err: any) {
      console.error("AI Error:", err);
      setAiSummary(`Error: ${err.message || 'An error occurred during generation.'}`);
    } finally {
      setGeneratingSummary(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-10">
      {!isSplitView && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-6 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Results
        </button>
      )}

      {/* HEADER CARD (Full Width) */}
      <div className="bg-white rounded-[20px] p-6 md:p-8 border border-slate-200/80 shadow-sm mb-5 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 right-[-10%] top-[-10%] w-96 h-96 bg-brand-50/50 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row gap-8 md:items-start relative z-10">
          {/* Logo */}
          <div className="p-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex-shrink-0">
            <img
              src={job.logoUrl || ''}
              alt={job.company}
              className="w-20 h-20 rounded-xl object-contain bg-white"
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-[17px] text-slate-600 font-semibold">{job.company}</div>
              <span className="inline-flex items-center gap-1 font-bold text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-wider">
                🟦 {job.source}
              </span>
            </div>

            <h1 className="text-[28px] sm:text-[32px] leading-[1.15] tracking-tight font-extrabold text-slate-900 mb-4">{job.title}</h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-[13px] text-slate-500 font-medium mb-4">
              <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-slate-700"><MapPin size={16} className="text-slate-400" /> {job.location}</span>
              <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-slate-700"><Briefcase size={16} className="text-slate-400" /> {job.type}</span>
              <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-slate-700"><Clock size={16} className="text-slate-400" /> {job.timeAgo}</span>
              {job.salary && job.salary !== 'Negosiasi' && (
                <span className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 text-emerald-700 font-bold">
                  {job.salary} /month
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3 pt-6 border-t border-slate-100 relative items-stretch">
              <div className="absolute -top-[1px] left-0 w-24 h-[1.5px] bg-brand-500"></div>

              <button
                onClick={handleEasyApply}
                className="flex-[1.5] min-w-[200px] bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white px-6 py-4 rounded-2xl font-[900] transition-all shadow-xl hover:shadow-brand-500/20 active:scale-95 flex items-center justify-center gap-2.5 uppercase tracking-wider text-[13px]"
              >
                <Zap size={22} fill="currentColor" />
                Easy Apply With Job Agent
              </button>

              <div className="flex flex-[1] gap-2.5 min-w-[240px]">
                <button
                  disabled={savingJob || saveSuccess}
                  onClick={async () => {
                    try {
                      setSavingJob(true);
                      await favoriteJobsService.addFavorite(job);
                      setSaveSuccess(true);
                      setTimeout(() => setSaveSuccess(false), 3000);
                    } catch (e: any) {
                      console.error("Save error:", e);
                    } finally {
                      setSavingJob(false);
                    }
                  }}
                  className={`flex-1 px-5 bg-white border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50 font-extrabold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 ${savingJob || saveSuccess ? 'opacity-70 cursor-not-allowed' : 'active:scale-95 shadow-sm'}`}>
                  {savingJob ? (
                    <><Loader2 size={20} className="animate-spin text-brand-500" /> <span className="text-[13px] uppercase tracking-wide">Saving</span></>
                  ) : saveSuccess ? (
                    <><CheckCircle2 size={20} className="text-emerald-500" /> <span className="text-emerald-600 text-[13px] uppercase tracking-wide">Saved</span></>
                  ) : (
                    <><Star size={20} /> <span className="text-[13px] uppercase tracking-wide">Save</span></>
                  )}
                </button>

                <button
                  disabled={draftingLetter}
                  onClick={handleDraftAndDownload}
                  className={`flex-1 px-5 bg-white border-2 border-slate-200 text-slate-600 hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50 font-extrabold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-[13px] ${draftingLetter ? 'opacity-70 cursor-wait' : 'active:scale-95 shadow-sm'}`}
                >
                  {draftingLetter ? (
                    <><Loader2 size={20} className="animate-spin text-purple-500" /> <span>Drafting...</span></>
                  ) : (
                    <><Download size={20} className="text-purple-500" /> <span>Draft Letter</span></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* AI MATCH CARD */}
        <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-[20px] p-6 md:p-7 border border-emerald-100/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white shadow-sm border border-emerald-100 rounded-xl text-emerald-600">
                <Target size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-[20px] font-extrabold tracking-tight text-slate-900">AI Match Analysis</h2>
                <p className="text-[13px] font-medium text-emerald-700/80 mt-0.5">Based on your Jobs Agent Profile</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0 bg-white px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">
              <div className="text-[32px] font-black tracking-tighter text-emerald-600">{job.matchScore}%</div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-slate-800 leading-tight">Great Match!</span>
                <span className="text-[12px] font-semibold text-emerald-600 flex items-center gap-1"><Check size={12} strokeWidth={3} /> Recommended</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Progress Bars */}
            <div className="md:col-span-2 space-y-4">
              {[
                { label: 'Skills Match', val: job.aiAnalysis.skills },
                { label: 'Experience Level', val: job.aiAnalysis.experience },
                { label: 'Education Required', val: job.aiAnalysis.education }
              ].map((stat, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[13px] font-bold text-slate-700/80 mb-2 tracking-wide uppercase">
                    <span>{stat.label}</span>
                    <span className="text-emerald-700">{stat.val}%</span>
                  </div>
                  <div className="h-2 bg-emerald-100/50 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${stat.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Match Details */}
            <div className="space-y-3 bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-emerald-100/50 shadow-sm">
              <div className="text-[12px] font-bold text-emerald-800 uppercase tracking-widest mb-3">Core Synergies</div>
              {job.aiAnalysis.strongMatches.slice(0, 2).map((m, i) => (
                <div key={i} className="flex items-start gap-3 justify-start bg-white/60 p-2.5 outline outline-1 outline-emerald-100/50 rounded-xl">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" strokeWidth={2.5} />
                  <span className="text-[13px] font-semibold text-slate-700 leading-snug">{m}</span>
                </div>
              ))}
              {job.aiAnalysis.missing.slice(0, 1).map((m, i) => (
                <div key={i} className="flex items-start gap-3 justify-start mt-3">
                  <div className="bg-amber-100/50 p-1 rounded-md shrink-0">
                    <AlertTriangle size={14} className="text-amber-500" strokeWidth={2.5} />
                  </div>
                  <div className="text-[13px] text-slate-600 font-medium leading-snug">
                    <span className="font-bold text-slate-800">Gap:</span> {m} <span className="text-slate-400 font-normal">(Nice to have)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* JOB DESCRIPTION + COMPANY PROFILE - Side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* JOB DESCRIPTION */}
            <div className="bg-white rounded-[20px] p-6 md:p-7 border border-slate-200/80 shadow-sm relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <h2 className="text-[22px] font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
                  Job Description
                </h2>

                <button
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary || !!aiSummary}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold py-2.5 px-4 rounded-xl transition-all border border-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-[14px] shadow-sm active:scale-95"
                >
                  {generatingSummary ? (
                    <><Sparkles className="animate-spin text-purple-500" size={16} /> Menyusun ringkasan...</>
                  ) : aiSummary ? (
                    <><CheckCircle2 className="text-emerald-500" size={16} /> Selesai Diringkas AI</>
                  ) : (
                    <><Sparkles className="text-purple-500" size={16} /> ✨ AI Summary</>
                  )}
                </button>
              </div>

              {/* AI Summary Box */}
              {aiSummary && (
                <div className="mb-5 p-5 bg-purple-50/50 border border-purple-100/80 rounded-2xl animate-fade-in shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform duration-500 group-hover:scale-150"></div>
                  <h3 className="text-sm font-bold text-purple-800 mb-4 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-500" /> Ringkasan Instan AI
                  </h3>
                  <div className="space-y-3 relative z-10">
                    {aiSummary.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().match(/^\d+[\.)]/)).slice(0, 5).map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-2 rounded-xl transition-colors hover:bg-white/60">
                        <div className="text-purple-500 mt-1 select-none flex-shrink-0 bg-purple-100 p-1 rounded-md shadow-sm">
                          <Zap size={12} strokeWidth={3} className="text-purple-600" />
                        </div>
                        <div className="text-[14px] sm:text-[15px] text-slate-700 font-medium leading-relaxed">{bullet.replace(/^[-•▪*]|\d+[\.)]\s*/, '').trim()}</div>
                      </div>
                    ))}
                    {(!aiSummary.includes('-') && !aiSummary.includes('•') && !aiSummary.match(/\d+\./)) && (
                      <div className="text-[14px] sm:text-[15px] text-slate-700 font-medium leading-relaxed">{aiSummary}</div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-[14px] sm:text-[15px] text-slate-600 leading-[1.75] font-medium relative z-10">
                {job.longDescription.split('\n').map((line, i) => {
                  const trimmed = line.trim();
                  if (!trimmed) return <div key={i} className="h-2"></div>;

                  if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('▪') || trimmed.startsWith('*') || trimmed.match(/^\d+[\.)]/)) {
                    const content = trimmed.replace(/^[-•▪*]|\d+[\.)]\s*/, '').trim();
                    return (
                      <div key={i} className="flex items-start gap-3 ml-1 mb-1.5 group p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-200">
                        <div className="text-brand-500 mt-0.5 select-none flex-shrink-0 bg-brand-50 p-1 rounded-md group-hover:bg-brand-100 transition-colors">
                          <Check size={12} strokeWidth={3} className="text-brand-600" />
                        </div>
                        <div className="text-[14px] sm:text-[15px] text-slate-700 font-medium leading-relaxed">{content}</div>
                      </div>
                    );
                  }

                  const isLikelyHeading = trimmed.length < 80 && trimmed.length > 5 && !trimmed.match(/[.,;]$/);
                  const isAllUppercase = trimmed === trimmed.toUpperCase() && trimmed.length > 5;

                  if (isLikelyHeading || isAllUppercase) {
                    return (
                      <h3 key={i} className="text-[15px] sm:text-[16px] font-extrabold text-slate-900 mt-5 mb-2 tracking-tight capitalize flex items-center gap-3">
                        <span className="h-px bg-slate-200 flex-1"></span>
                        <span className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 text-brand-700 text-[13px]">{trimmed.toLowerCase()}</span>
                        <span className="h-px bg-slate-200 flex-1"></span>
                      </h3>
                    );
                  }

                  return <p key={i} className="mb-2.5 text-[14px] sm:text-[15px] text-slate-600 leading-[1.7]">{trimmed}</p>;
                })}
              </div>
            </div>

            {/* REQUIREMENTS */}
            <div className="bg-white rounded-[20px] p-6 md:p-7 border border-slate-200/80 shadow-sm">
              <h2 className="text-[18px] font-extrabold tracking-tight text-slate-900 mb-5 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                Requirements
              </h2>
              <div className="space-y-3">
                {job.requirements.map((req, i) => (
                  <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-sm ${req.matched ? 'bg-emerald-50/50 border-emerald-100/80' : 'bg-slate-50 border-slate-100'}`}>
                    <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${req.matched ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}>
                      {req.matched ? <Check size={14} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-slate-300"></div>}
                    </div>
                    <div className="flex-1">
                      <div className="text-[14px] leading-snug font-bold text-slate-900">{req.text}</div>
                      <div className={`text-[12px] font-bold mt-1 flex items-center gap-1 ${req.matched ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {req.matched && <span className="bg-emerald-100/50 px-2 py-0.5 rounded-md inline-flex items-center gap-1">✨ You have: {req.notes || "Matched"}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Company Profile */}
          <div className="space-y-5">
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
    </div >
  );
};

// --- NEW SUB-COMPONENTS ---

const FavoriteJobsList: React.FC<{ unreadCount?: number }> = ({ unreadCount = 0 }) => {
  const [favorites, setFavorites] = useState<FavoriteJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [movingJobId, setMovingJobId] = useState<string | null>(null);
  const [moveSuccessId, setMoveSuccessId] = useState<string | null>(null);

  React.useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await favoriteJobsService.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error("Failed to fetch favorite jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackInNotebook = async (job: FavoriteJob) => {
    try {
      setMovingJobId(job.id);
      // 1. Add to Project Tracker (Notebook)
      const newTask: NewProjectTask = {
        title: job.title,
        company: job.company,
        status: 'Plan',
        url: job.url,
        task_date: new Date().toISOString(),
        notes: ''
      };
      await projectTasksService.createTask(newTask);

      // 2. Remove from Favorites
      await favoriteJobsService.removeFavorite(job.id);

      // Update UI
      setMoveSuccessId(job.id);
      setTimeout(() => {
        setFavorites(favorites.filter(f => f.id !== job.id));
        setMoveSuccessId(null);
      }, 1500);
    } catch (error: any) {
      console.error("Failed to move job to Notebook:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setMovingJobId(null);
    }
  };

  const handleRemoveFavorite = async (id: string) => {
    if (!confirm("Remove this job from favorites?")) return;
    try {
      await favoriteJobsService.removeFavorite(id);
      setFavorites(favorites.filter(f => f.id !== id));
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-brand-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-10">
      <TopBar
        title="My Favorite Jobs"
        subtitle="Simpan lowongan impianmu sebelum melamar."
        onNotificationClick={() => { }}
        unreadNotifications={unreadCount}
      />
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {favorites.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Belum ada lowongan tersimpan. Cari pekerjaan dan klik "Save" untuk melihatnya di sini!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-700">Posisi</th>
                  <th className="px-6 py-4 font-bold text-slate-700">Perusahaan</th>
                  <th className="px-6 py-4 font-bold text-slate-700">Tanggal Disimpan</th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {favorites.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{job.title}</div>
                      {job.url && (
                        <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-500 hover:underline flex items-center gap-1 mt-1">
                          <ExternalLink size={10} /> Link
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 flex items-center gap-2">
                      <Building2 size={14} className="text-slate-400" /> {job.company}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(job.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={movingJobId === job.id || moveSuccessId === job.id}
                          onClick={() => handleTrackInNotebook(job)}
                          className={`bg-brand-50 text-brand-600 font-bold px-3 py-1.5 rounded-lg border border-brand-100 transition-colors flex items-center gap-1.5 text-xs ${movingJobId === job.id || moveSuccessId === job.id ? 'opacity-70' : 'hover:bg-brand-100'}`}
                        >
                          {movingJobId === job.id ? (
                            <><Loader2 size={12} className="animate-spin" /> Moving...</>
                          ) : moveSuccessId === job.id ? (
                            <><CheckCircle2 size={12} className="text-emerald-600" /> Moved!</>
                          ) : (
                            <><Target size={12} /> Track in Notebook</>
                          )}
                        </button>
                        <button
                          onClick={() => handleRemoveFavorite(job.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove Favorite"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const ATSScanner: React.FC<{ unreadCount?: number; userProfile?: UserProfile | null }> = ({ unreadCount = 0, userProfile }) => {
  const [cvSource, setCvSource] = useState<'profile' | 'upload'>('profile');
  const [cvText, setCvText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState('');
  const [fixingIssueIndex, setFixingIssueIndex] = useState<number | null>(null);
  const [fixingAll, setFixingAll] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // When switching to profile tab, load existing CV
  React.useEffect(() => {
    if (cvSource === 'profile' && userProfile?.raw_cv) {
      setCvText(userProfile.raw_cv);
    } else if (cvSource === 'upload') {
      setCvText('');
    }
  }, [cvSource, userProfile]);

  const hasProfileCV = !!userProfile?.raw_cv;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setIsParsing(true);

    try {
      if (file.name.endsWith('.txt') || file.type === 'text/plain') {
        const text = await file.text();
        setCvText(text);
      } else if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
        const text = await extractTextFromPDF(file);
        setCvText(text);
      } else {
        setError('Format file tidak didukung. Harap upload .pdf atau .txt.');
      }
    } catch (err: any) {
      console.error('File parsing error:', err);
      setError(`Gagal membaca file: ${err.message || 'File rusak atau tidak terbaca.'}`);
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const analyzeCV = async () => {
    if (!cvText.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    setError('');
    try {
      // Enhanced HR Critique Analysis
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) throw new Error("OpenAI API Key tidak ditemukan.");

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `Anda adalah seorang HR Manager Senior berpengalaman 15+ tahun di perusahaan multinasional.
Anda sangat kritis dalam menilai CV — seperti seorang HR profesional yang menyeleksi ratusan CV per minggu.

Tugas Anda:
1. Berikan skor ATS (0-100) — skor ini HARUS realistis, jangan terlalu murah hati
2. Beri kritik JUJUR dan TAJAM seperti seorang HR sungguhan — sebutkan kelemahan dengan tegas
3. Berikan saran perbaikan yang KONKRET dan ACTIONABLE (bukan nasihat umum)

Gaya Anda: profesional tapi blak-blakan. Jika CV buruk, katakan buruk. Jika bagus, apresiasi tapi tetap temukan yang bisa diperbaiki.

PENTING: Semua respons HARUS dalam Bahasa Indonesia.

Return JSON:
{
  "score": number (0-100),
  "verdict": "string (1 kalimat penilaian tajam dari HR, contoh: 'CV ini terlalu generik dan tidak akan lolos 90% ATS perusahaan top.')",
  "summary": "string (ringkasan 2-3 kalimat analisis keseluruhan dalam perspektif HR)",
  "strengths": ["string (hal positif dari CV, 2-3 poin)"],
  "hr_critique": [
    {
      "category": "Format" | "Konten" | "Keywords" | "Pengalaman" | "Struktur" | "Skill" | "Profesionalisme",
      "severity": "critical" | "warning" | "suggestion",
      "critique": "string (kritik tajam seperti HR bicara langsung ke pelamar)",
      "action": "string (tindakan perbaikan spesifik yang harus dilakukan, bukan umum)",
      "impact": "High" | "Medium" | "Low",
      "example": "string (contoh konkret bagaimana memperbaikinya, opsional)"
    }
  ],
  "ats_keywords_missing": ["string (keyword penting yang sebaiknya ada di CV)"],
  "overall_recommendation": "string (rekomendasi akhir dari HR, apakah CV ini layak submit atau perlu revisi dulu)"
}

Be very strict and detailed. A typical CV should score between 40-70. Only truly excellent CVs get 80+.`
            },
            {
              role: 'user',
              content: `Tolong review CV berikut sebagai HR Manager:\n\n${cvText}`
            }
          ]
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      setResult(parsed);
    } catch (e: any) {
      console.error("Error analyzing CV:", e);
      setError(e.message || "Gagal menganalisis CV. Silakan coba lagi.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAutoFix = async (issue: any, index: number) => {
    if (!cvText.trim()) return;
    setFixingIssueIndex(index);
    setError('');
    try {
      const fixedText = await autoFixCVIssue(cvText, issue.critique, issue.action);
      setCvText(fixedText);
      setResult((prev: any) => ({
        ...prev,
        hr_critique: prev.hr_critique.filter((_: any, i: number) => i !== index)
      }));
    } catch (e: any) {
      console.error("Error auto-fixing:", e);
      setError(`Gagal melakukan Auto-Fix: ${e.message}`);
    } finally {
      setFixingIssueIndex(null);
    }
  };

  const handleFixAllAndDownload = async () => {
    if (!cvText.trim() || !result?.hr_critique?.length) return;
    setFixingAll(true);
    setError('');
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) throw new Error("OpenAI API Key tidak ditemukan.");

      const allCritiques = result.hr_critique.map((item: any, i: number) =>
        `${i + 1}. [${item.category}] ${item.critique}\n   Perbaikan: ${item.action}${item.example ? '\n   Contoh: ' + item.example : ''}`
      ).join('\n\n');

      const missingKeywords = result.ats_keywords_missing?.join(', ') || '';

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.15,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `Anda adalah expert CV writer dan ATS optimization specialist.
Tugas Anda: Tulis ulang CV berikut dengan menerapkan SEMUA perbaikan yang diminta, dan output sebagai JSON terstruktur.

ATURAN:
- Pertahankan semua informasi personal PERSIS seperti aslinya
- Perbaiki format agar ATS-friendly
- Terapkan semua saran perbaikan yang diberikan
- Tambahkan keyword yang relevan secara natural
- Gunakan bahasa yang profesional dan konsisten
- Setiap bullet point dalam experience harus dimulai dengan action verb dan menyebutkan dampak/hasil jika memungkinkan

Output HARUS berupa JSON dengan struktur berikut:
{
  "personal": {
    "name": "Nama Lengkap",
    "email": "email@domain.com",
    "phone": "08xxxxxxxxxx",
    "address": "Kota, Provinsi",
    "linkedin": "linkedin.com/in/xxx" (opsional)
  },
  "summary": "Professional summary 3-4 kalimat yang kuat dan relevan",
  "experience": [
    {
      "title": "Job Title",
      "company": "Nama Perusahaan",
      "period": "Bulan Tahun - Bulan Tahun",
      "location": "Kota",
      "bullets": ["Pencapaian 1 dengan angka/metrik", "Pencapaian 2"]
    }
  ],
  "education": [
    {
      "degree": "Gelar / Jurusan",
      "institution": "Nama Universitas",
      "year": "2020-2024",
      "details": "Detail tambahan (opsional)"
    }
  ],
  "skills": [
    { "category": "Technical Skills", "items": ["Skill 1", "Skill 2"] },
    { "category": "Soft Skills", "items": ["Skill 1", "Skill 2"] }
  ],
  "certifications": [
    { "name": "Nama Sertifikat", "year": "2024" }
  ],
  "languages": [
    { "language": "Bahasa", "level": "Tingkat" }
  ],
  "additional_sections": [
    { "title": "Judul Section", "items": ["Item 1", "Item 2"] }
  ]
}

Hanya output JSON valid, tanpa penjelasan.`
            },
            {
              role: 'user',
              content: `Perbaiki CV berikut berdasarkan semua kritik HR:

=== KRITIK HR ===
${allCritiques}

=== KEYWORDS YANG PERLU DITAMBAHKAN ===
${missingKeywords}

=== CV ASLI ===
${cvText}`
            }
          ]
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      let content = data.choices[0].message.content.trim();
      if (content.startsWith('```')) {
        content = content.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '');
      }
      const cvJson = JSON.parse(content);

      // Export as styled Word document with ATS template
      exportCVToStyledWord(cvJson, `CV_Diperbaiki_${new Date().toISOString().slice(0, 10)}.doc`);

      // Also generate plain text version for the textarea
      const plainParts: string[] = [];
      if (cvJson.personal) {
        plainParts.push(`PERSONAL DATA`);
        if (cvJson.personal.name) plainParts.push(`Nama: ${cvJson.personal.name}`);
        if (cvJson.personal.email) plainParts.push(`Email: ${cvJson.personal.email}`);
        if (cvJson.personal.phone) plainParts.push(`Telepon: ${cvJson.personal.phone}`);
        if (cvJson.personal.address) plainParts.push(`Alamat: ${cvJson.personal.address}`);
        plainParts.push('');
      }
      if (cvJson.summary) { plainParts.push('SUMMARY', cvJson.summary, ''); }
      if (cvJson.experience?.length) {
        plainParts.push('EXPERIENCE');
        cvJson.experience.forEach((exp: any) => {
          plainParts.push(`${exp.title} - ${exp.company}`);
          if (exp.period) plainParts.push(exp.period);
          exp.bullets?.forEach((b: string) => plainParts.push(`- ${b}`));
          plainParts.push('');
        });
      }
      if (cvJson.education?.length) {
        plainParts.push('EDUCATION');
        cvJson.education.forEach((edu: any) => {
          plainParts.push(`${edu.degree} - ${edu.institution}${edu.year ? ' (' + edu.year + ')' : ''}`);
          plainParts.push('');
        });
      }
      if (cvJson.skills?.length) {
        plainParts.push('SKILLS');
        cvJson.skills.forEach((s: any) => {
          if (typeof s === 'string') plainParts.push(`- ${s}`);
          else if (s.category) plainParts.push(`${s.category}: ${s.items?.join(', ')}`);
        });
        plainParts.push('');
      }
      setCvText(plainParts.join('\n'));
      setResult(null);
    } catch (e: any) {
      console.error("Fix all error:", e);
      setError(`Gagal memperbaiki CV: ${e.message}`);
    } finally {
      setFixingAll(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200', label: 'Excellent' };
    if (score >= 60) return { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-200', label: 'Good' };
    if (score >= 40) return { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50', border: 'border-amber-200', label: 'Perlu Perbaikan' };
    return { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50', border: 'border-red-200', label: 'Kritis' };
  };

  const getSeverityStyle = (severity: string) => {
    if (severity === 'critical') return { icon: '🔴', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' };
    if (severity === 'warning') return { icon: '🟡', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' };
    return { icon: '🔵', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' };
  };

  return (
    <div className="animate-fade-in pb-10 max-w-6xl mx-auto">
      <TopBar
        title="ATS CV Scanner"
        subtitle="Review CV Anda oleh AI HR Manager — dapatkan kritik dan saran profesional."
        onNotificationClick={() => { }}
        unreadNotifications={unreadCount}
      />

      {/* CV Source Selector */}
      <div className="mb-6 bg-white rounded-2xl p-2 border border-slate-200 shadow-sm inline-flex gap-1">
        <button
          onClick={() => setCvSource('profile')}
          className={`px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${cvSource === 'profile' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <FileText size={16} />
          {hasProfileCV ? 'CV Profil Anda' : 'CV Belum Ada'}
        </button>
        <button
          onClick={() => setCvSource('upload')}
          className={`px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${cvSource === 'upload' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Upload size={16} />
          Upload CV Baru
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: CV Input (2/5) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                {cvSource === 'profile' ? (
                  <><FileText size={16} className="text-brand-500" /> CV dari Profil</>
                ) : (
                  <><Upload size={16} className="text-brand-500" /> CV yang Diupload</>
                )}
              </span>
              {cvSource === 'upload' && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
                  disabled={isParsing || isAnalyzing}
                >
                  {isParsing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  Upload PDF/TXT
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.txt"
                className="hidden"
              />
            </div>

            {cvSource === 'profile' && !hasProfileCV ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText size={28} className="text-slate-300" />
                </div>
                <h3 className="text-base font-bold text-slate-700 mb-2">Belum Ada CV di Profil</h3>
                <p className="text-sm text-slate-400 mb-4">Upload CV di halaman Settings terlebih dahulu, atau gunakan tab "Upload CV Baru".</p>
              </div>
            ) : (
              <textarea
                className="w-full h-72 p-4 font-mono text-xs text-slate-700 focus:outline-none focus:ring-0 border-none resize-none bg-slate-50"
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder={cvSource === 'profile' ? 'CV dari profil Anda akan ditampilkan di sini...' : 'Paste CV kamu di sini atau upload file...'}
                readOnly={cvSource === 'profile'}
              />
            )}

            <div className="p-4 bg-white border-t border-slate-100">
              <button
                className={`w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all ${!cvText.trim() ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-md shadow-brand-500/20 active:scale-[0.98]'}`}
                disabled={!cvText.trim() || isAnalyzing}
                onClick={analyzeCV}
              >
                {isAnalyzing ? (
                  <><Loader2 size={18} className="animate-spin" /> AI HR sedang mereview...</>
                ) : (
                  <><ScanLine size={18} /> Minta Review HR AI</>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm font-semibold rounded-xl border border-red-200 flex items-center gap-2">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          {/* Quick Stats */}
          {cvText.trim() && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Statistik CV</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <div className="text-lg font-black text-slate-900">{cvText.split(/\s+/).filter(Boolean).length}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Kata</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <div className="text-lg font-black text-slate-900">{cvText.split('\n').filter(l => l.trim()).length}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Baris</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <div className="text-lg font-black text-slate-900">{cvText.length}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Karakter</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Results (3/5) */}
        <div className="lg:col-span-3 space-y-5">
          {result ? (
            <div className="animate-fade-in-up space-y-5">
              {/* Score + Verdict Card */}
              <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${getScoreColor(result.score).border}`}>
                <div className={`${getScoreColor(result.score).light} p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`text-[40px] font-black tracking-tighter ${getScoreColor(result.score).text}`}>
                        {result.score}
                      </div>
                      <div>
                        <div className={`text-xs font-bold uppercase tracking-wider ${getScoreColor(result.score).text}`}>{getScoreColor(result.score).label}</div>
                        <div className="text-sm text-slate-500 font-medium">ATS Compatibility Score</div>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-white/80 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${getScoreColor(result.score).bg}`} style={{ width: `${result.score}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="p-5 border-t border-slate-100">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-lg">⚖️</span>
                    <p className="text-[15px] font-bold text-slate-800 italic leading-snug">"{result.verdict}"</p>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed ml-8">{result.summary}</p>
                </div>
              </div>

              {/* Fix All & Download Button */}
              <button
                onClick={handleFixAllAndDownload}
                disabled={fixingAll || !result.hr_critique?.length}
                className={`w-full py-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2.5 transition-all ${fixingAll ? 'bg-slate-400 cursor-wait' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/20 active:scale-[0.98]'}`}
              >
                {fixingAll ? (
                  <><Loader2 size={18} className="animate-spin" /> AI sedang memperbaiki seluruh CV...</>
                ) : (
                  <><Download size={18} /> Perbaiki Keseluruhan & Download Word</>
                )}
              </button>

              {/* Strengths */}
              {result.strengths && result.strengths.length > 0 && (
                <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100">
                  <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" /> Kelebihan CV Anda
                  </h3>
                  <div className="space-y-2">
                    {result.strengths.map((s: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 bg-white/70 p-3 rounded-xl">
                        <span className="text-emerald-500 mt-0.5">✓</span>
                        <span className="text-sm text-slate-700 font-medium">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HR Critique Cards */}
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">👨‍💼</span> Kritik & Saran HR Manager
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{result.hr_critique?.length || 0} temuan</span>
                </h3>
                <div className="space-y-3">
                  {result.hr_critique?.map((item: any, i: number) => {
                    const style = getSeverityStyle(item.severity);
                    return (
                      <div key={i} className={`${style.bg} rounded-2xl border ${style.border} p-5 transition-all hover:shadow-sm`}>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2.5 flex-1">
                            <span className="text-lg">{style.icon}</span>
                            <div>
                              <span className={`text-[11px] font-bold uppercase tracking-wider ${style.text} px-2 py-0.5 rounded-md ${style.badge}`}>{item.category}</span>
                              <span className={`text-[10px] font-bold ml-2 uppercase tracking-wider ${item.impact === 'High' ? 'text-red-500' : item.impact === 'Medium' ? 'text-amber-500' : 'text-blue-500'}`}>
                                Impact: {item.impact}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-[14px] font-bold text-slate-800 mb-2 leading-snug">{item.critique}</p>

                        <div className="bg-white/80 rounded-xl p-3.5 mb-3 border border-white">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Lightbulb size={13} className="text-amber-500" />
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tindakan Perbaikan</span>
                          </div>
                          <p className="text-sm text-slate-700 font-medium leading-relaxed">{item.action}</p>
                          {item.example && (
                            <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 italic">
                              <span className="font-bold text-slate-600 not-italic">Contoh: </span>{item.example}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleAutoFix(item, i)}
                          disabled={fixingIssueIndex === i}
                          className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-white hover:bg-brand-50 px-3 py-2 rounded-lg transition-all border border-brand-200 flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                        >
                          {fixingIssueIndex === i ? (
                            <><Loader2 size={12} className="animate-spin" /> Memperbaiki...</>
                          ) : (
                            <><Wand2 size={12} /> Auto-Fix dengan AI</>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Missing Keywords */}
              {result.ats_keywords_missing && result.ats_keywords_missing.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Search size={14} className="text-brand-500" /> Keywords yang Sebaiknya Ditambahkan
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.ats_keywords_missing.map((kw: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-brand-50 text-brand-700 text-xs font-bold rounded-lg border border-brand-100">
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Final Recommendation */}
              {result.overall_recommendation && (
                <div className="bg-slate-900 rounded-2xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📋</span>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Rekomendasi Akhir HR</h3>
                  </div>
                  <p className="text-[15px] text-slate-200 font-medium leading-relaxed">{result.overall_recommendation}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-5 border border-slate-100">
                <span className="text-4xl">👨‍💼</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">AI HR Manager Siap Mereview</h3>
              <p className="text-sm text-slate-400 max-w-[320px] leading-relaxed">
                {cvSource === 'profile' && hasProfileCV
                  ? 'CV profil Anda sudah dimuat. Klik "Minta Review HR AI" untuk mendapatkan kritik profesional.'
                  : 'Upload atau paste CV Anda, lalu klik "Minta Review HR AI" untuk mendapatkan kritik dan saran dari perspektif HR Manager.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NotificationsView: React.FC<{ notifications: any[]; onMarkRead: (id: number) => void; onViewChange: (view: DashboardView) => void }> = ({ notifications, onMarkRead, onViewChange }) => {
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-10 w-full px-4 lg:px-0">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="bg-gradient-to-br from-brand-500 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-brand-500/20 text-white relative">
              <Bell size={28} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                </span>
              )}
            </div>
            Notifikasi
          </h2>
          <p className="text-slate-500 font-medium mt-2">Dapatkan pembaruan instan soal lamaran dan loker impian.</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => notifications.forEach(n => onMarkRead(n.id))}
            className="text-sm font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-4 py-2.5 rounded-xl transition-all"
          >
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-slate-100 p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[300px]">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
              <BellOff size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Belum ada notifikasi</h3>
            <p className="text-slate-500">Saat ada loker baru atau status lamaran berubah, kami akan memberitahu Anda di sini.</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => { onMarkRead(notif.id); onViewChange('applications'); }}
              className={`group relative bg-white rounded-2xl p-5 border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] 
                ${notif.unread
                  ? 'border-brand-200 shadow-md shadow-brand-500/5 ring-1 ring-brand-500/10'
                  : 'border-slate-100 shadow-sm opacity-80 hover:opacity-100'}`}
            >
              {/* Left Accent indicator for unread */}
              {notif.unread && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-indigo-600"></div>
              )}

              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${notif.type === 'match' ? 'bg-green-50 text-green-600 border-green-100 group-hover:bg-green-100' :
                notif.type === 'application' ? 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-100' :
                  'bg-slate-50 text-slate-600 border-slate-100 group-hover:bg-slate-100'
                } transition-colors`}>
                {notif.type === 'match' ? <Sparkles size={24} /> : notif.type === 'application' ? <Briefcase size={24} /> : <Bell size={24} />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-3 justify-between mb-1.5">
                  <h4 className={`text-[17px] font-bold truncate ${notif.unread ? 'text-slate-900 group-hover:text-brand-700' : 'text-slate-700'} transition-colors`}>
                    {notif.title}
                  </h4>
                  <span className="text-xs font-bold text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-1 rounded-md">
                    {notif.time}
                  </span>
                </div>
                <p className={`text-[15px] leading-relaxed line-clamp-2 ${notif.unread ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
                  {notif.message}
                </p>
              </div>

              {/* Read/Unread dot indicator */}
              <div className="hidden sm:flex shrink-0 w-8 h-8 items-center justify-center">
                {notif.unread ? (
                  <div className="w-3 h-3 bg-brand-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                ) : (
                  <CheckCircle2 size={18} className="text-slate-300 group-hover:text-green-500 transition-colors opacity-0 group-hover:opacity-100" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const SettingsView: React.FC<{ user?: { full_name?: string; email?: string }; unreadCount?: number; userProfile?: UserProfile | null; onProfileUpdate?: (profile: UserProfile) => void; onViewChange?: (view: DashboardView) => void }> = ({ user, unreadCount = 0, userProfile, onProfileUpdate, onViewChange }) => {
  const [notifications, setNotifications] = useState(true);
  const [marketing, setMarketing] = useState(false);

  return (
    <div className="animate-fade-in pb-10 max-w-4xl mx-auto">
      <TopBar
        title="Pengaturan"
        onNotificationClick={() => { }}
        unreadNotifications={unreadCount}
      />

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden border-4 border-slate-100 shadow-sm relative group cursor-pointer">
              <img src={`https://ui-avatars.com/api/?name=${userProfile?.name || user?.full_name || 'User'}&background=random&size=128`} alt="User" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload size={24} className="text-white" />
              </div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h3 className="text-2xl font-bold text-slate-900">{userProfile?.name || user?.full_name || 'User'}</h3>
              <p className="text-slate-500 font-medium mb-4">{userProfile?.email || user?.email || 'Belum ada email'}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 items-center">
                <span className="bg-brand-50 text-brand-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-brand-100 uppercase tracking-widest">
                  {userProfile?.subscriptionPlan === 'pro' ? '👑 PRO Member' : userProfile?.subscriptionPlan === 'lite' ? '⚡ Lite Member' : 'Free Plan'}
                </span>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200">ID: 8842-1029</span>
                {userProfile?.subscriptionPlan !== 'pro' && onViewChange && (
                  <button
                    onClick={() => onViewChange('pricing')}
                    className="ml-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-md shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-1.5"
                  >
                    <Sparkles size={12} /> Upgrade ke PRO
                  </button>
                )}
              </div>
            </div>
            <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-black/10 hover:bg-slate-800 transition-all active:scale-[0.98]">
              Edit Profil
            </button>
          </div>
        </div>

        {/* Required CV Upload & Resumé Display Block */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText size={24} className="text-brand-600" /> Informasi Pribadi & Resume
            </h4>
            {userProfile?.raw_cv && (
              <div className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border border-emerald-100">
                <CheckCircle2 size={16} /> Data by Resume AI
              </div>
            )}
          </div>

          {!userProfile?.raw_cv ? (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-brand-100 rounded-3xl text-center shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -mr-10 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
                <div className="relative z-10 w-full mx-auto p-6 md:p-10">
                  <h2 className="text-2xl font-black text-slate-900 mb-3">Lengkapi Profil CV Anda</h2>
                  <p className="text-slate-500 text-[15px] mb-8 leading-relaxed max-w-xl mx-auto">Anda wajib melengkapi profil CV untuk mengakses fitur Jobs Agent selengkapnya. Silakan pilih salah satu opsi di bawah ini.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left max-w-3xl mx-auto">
                    {/* Opsi 1: Upload */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-brand-300 transition-colors flex flex-col justify-between">
                      <div>
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-5 border border-blue-100/50">
                          <Upload size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Punya File CV?</h3>
                        <p className="text-sm text-slate-500 mb-8 leading-relaxed">Pilih opsi ini jika Anda sudah mempunyai file CV (PDF) atau teks resume sebelumnya. AI kami akan otomatis mengekstrak datanya.</p>
                      </div>
                      <div className="mt-auto">
                        {onProfileUpdate && <CVUpload existingProfile={userProfile || null} onProfileUpdate={onProfileUpdate} hidePreview={true} />}
                      </div>
                    </div>

                    {/* Opsi 2: Buat Baru */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-brand-300 transition-colors flex flex-col justify-between">
                      <div>
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-5 border border-emerald-100/50">
                          <Wand2 size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Belum Punya CV?</h3>
                        <p className="text-sm text-slate-500 mb-8 leading-relaxed">Belum memiliki CV atau ingin membuat baru yang dioptimasi AI agar lulus screening ATS (Applicant Tracking System)? Gunakan fitur pembuat CV kami.</p>
                      </div>
                      <button
                        onClick={() => onViewChange && onViewChange('cv-builder')}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-colors mt-auto flex justify-center items-center gap-2 text-[15px] shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] active:scale-[0.98]"
                      >
                        <Sparkles size={18} /> Mulai Buat CV AI
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 border-b border-slate-100 pb-8">
              {/* Column 1: Core Summary & Skills */}
              <div className="space-y-6">
                <div>
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ringkasan Pribadi</h5>
                  <p className="text-slate-700 text-sm leading-relaxed">{userProfile.experience_summary || 'Belum ada ringkasan.'}</p>
                </div>

                <div>
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Trophy size={14} /> Keahlian (Skills)</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {userProfile.skills?.length ? userProfile.skills.map((skill, i) => (
                      <span key={i} className="bg-brand-50 text-brand-700 px-2.5 py-1 rounded-lg text-xs font-semibold border border-brand-100">{skill}</span>
                    )) : <span className="text-sm text-slate-400">Belum ada keahlian terdeteksi</span>}
                  </div>
                </div>

                {/* Languages - fallback if not strictly extracted */}
                <div>
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Globe size={14} /> Bahasa</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {userProfile.raw_cv.toLowerCase().includes('english') || userProfile.raw_cv.toLowerCase().includes('inggris') ? (
                      <>
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold">Indonesia (Native)</span>
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold">English</span>
                      </>
                    ) : (
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold">Indonesia</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Column 2 & 3: Experience, Education, Certs */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Briefcase size={14} /> Riwayat Karier ({userProfile.experience_years || 0} Tahun)</h5>
                  {userProfile.work_experience?.length > 0 ? (
                    <div className="space-y-4">
                      {userProfile.work_experience.map((we, i) => (
                        <div key={i} className="relative pl-4 border-l-2 border-slate-200">
                          <div className="absolute w-2 h-2 bg-brand-500 rounded-full -left-[5px] top-1.5 shadow-[0_0_0_4px_white]"></div>
                          <h6 className="font-bold text-slate-900 text-[15px]">{we.role}</h6>
                          <div className="text-sm font-medium text-brand-600 mb-1">{we.company} <span className="text-slate-400 ml-1 font-normal">• {we.duration}</span></div>
                          <p className="text-sm text-slate-500 line-clamp-2">{we.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Menambahkan teks CV tidak mendeteksi Work Experience spesifik, ringkasan pengalaman: {userProfile.experience_summary}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Building2 size={14} /> Pendidikan</h5>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">
                      {userProfile.education_list?.length > 0
                        ? userProfile.education_list.map(e => `${e.degree} di ${e.institution}`).join(', ')
                        : userProfile.education || 'Belum ada data pendidikan.'
                      }
                    </p>
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Sparkles size={14} /> Lisensi & Sertifikasi</h5>
                    <ul className="space-y-1">
                      {userProfile.certifications?.length > 0 ? userProfile.certifications.map((cert, i) => (
                        <li key={i} className="text-sm text-slate-700 font-medium flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">🏅</span> {cert}
                        </li>
                      )) : (
                        <li className="text-sm text-slate-400">Belum ada sertifikasi</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {userProfile?.raw_cv && (
            <div className="bg-slate-50 flex flex-col md:flex-row gap-5 items-center justify-between rounded-xl p-5 border border-slate-100">
              <div className="w-full">
                <h5 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Upload size={16} className="text-brand-600" />
                  Update/Ganti Dokumen CV Anda
                </h5>
                {onProfileUpdate && (
                  <CVUpload existingProfile={userProfile || null} onProfileUpdate={onProfileUpdate} hidePreview={true} />
                )}
              </div>
              <div className="shrink-0 w-full md:w-auto md:border-l md:border-slate-200 md:pl-5 md:ml-2">
                <button
                  onClick={() => {
                    if (window.confirm('Yakin ingin menghapus seluruh data CV dan Profil Anda saat ini?')) {
                      clearProfile?.();
                      if (onProfileUpdate) onProfileUpdate({
                        skills: [],
                        experience_years: 0,
                        experience_summary: '',
                        work_experience: [],
                        education: '',
                        education_list: [],
                        references: [],
                        certifications: [],
                        preferred_roles: [],
                        raw_cv: ''
                      } as unknown as UserProfile); // Force empty
                    }
                  }}
                  className="w-full md:w-auto px-5 py-3 bg-white border border-red-200 text-red-600 font-bold text-sm rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors flex justify-center items-center gap-2"
                >
                  <Trash2 size={16} /> Hapus Data CV
                </button>
              </div>
            </div>
          )}
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
                { label: 'Verifikasi Email', icon: <Mail size={18} />, badge: userProfile?.email ? 'Verified' : '', badgeColor: 'bg-green-100 text-green-700' },
                { label: 'Nomor Telepon', icon: <Phone size={18} />, value: userProfile?.phone || 'Belum diisi' }
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
        <div className="bg-red-50 rounded-[2rem] border border-red-100 p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="text-center sm:text-left">
            <h4 className="text-red-900 font-black text-lg mb-1 flex items-center gap-2 justify-center sm:justify-start">
              <AlertTriangle size={20} /> Danger Zone
            </h4>
            <p className="text-red-600 text-sm font-medium opacity-80 max-w-sm">
              Hapus akun akan menghapus profil, CV, dan semua lamaran yang tersimpan secara permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <button
            onClick={async () => {
              if (window.confirm('PERINGATAN KRITIS: Apakah Anda yakin ingin menghapus akun ini secara permanen? Semua data akan hilang.')) {
                try {
                  // Karena kita tidak bisa menghapus user auth secara langsung dari client side tanpa admin key
                  // Kita hapus data metadata dan paksa logout untuk simulasi testing
                  const { error } = await supabase.auth.updateUser({
                    data: { onboarding_completed: false, job_preferences: null }
                  });
                  if (error) throw error;

                  // Logout
                  await supabase.auth.signOut();
                  window.location.reload();
                } catch (err: any) {
                  alert("Gagal menghapus data: " + err.message);
                }
              }
            }}
            className="px-8 py-3.5 bg-red-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-[0.98] uppercase tracking-wider"
          >
            Hapus Akun Permanen
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD EXPORT ---

const ProjectTracker: React.FC<{ unreadCount?: number }> = ({ unreadCount = 0 }) => {
  const [projects, setProjects] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState<ProjectTask['status'] | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCompany, setNewTaskCompany] = useState('');

  const columns: ProjectTask['status'][] = ['Plan', 'Applied', 'Interview', 'Offer', 'Rejected'];

  React.useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await projectTasksService.getTasks();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ProjectTask['status']) => {
    switch (status) {
      case 'Plan': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Applied': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Interview': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Offer': return 'bg-green-50 text-green-700 border-green-100';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  const handleAddTask = async (status: ProjectTask['status']) => {
    if (!newTaskTitle.trim() || !newTaskCompany.trim()) return;

    try {
      const newTask: NewProjectTask = {
        title: newTaskTitle,
        company: newTaskCompany,
        status: status,
        task_date: new Date().toISOString(),
        url: null,
        notes: ''
      };

      const createdTask = await projectTasksService.createTask(newTask);
      setProjects([createdTask, ...projects]);

      // Reset form
      setIsAddingTask(null);
      setNewTaskTitle('');
      setNewTaskCompany('');
    } catch (error: any) {
      console.error("Failed to create task:", error);
      alert(`Failed to create task: ${error.message || 'Make sure you are logged in and the database table exists.'}`);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await projectTasksService.deleteTask(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: ProjectTask['status']) => {
    try {
      // Optimistic update
      setProjects(projects.map(p => p.id === id ? { ...p, status: newStatus } : p));
      await projectTasksService.updateTaskStatus(id, newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
      // Revert on failure (reload from db)
      fetchTasks();
    }
  };

  return (
    <div className="animate-fade-in pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">My Notebook</h1>
          <p className="text-slate-500 text-sm">Notion-style board to track your job applications, powered by Supabase.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-brand-500 w-8 h-8" />
        </div>
      ) : (
        <div className="flex overflow-x-auto pb-8 gap-6 snap-x custom-scrollbar">
          {columns.map(col => (
            <div key={col} className="flex flex-col gap-3 min-w-[280px] w-[280px] shrink-0 snap-start">
              <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${getStatusColor(col)}`}>
                    {col}
                  </span>
                  <span className="text-slate-400 text-xs font-medium">
                    {projects.filter(p => p.status === col).length}
                  </span>
                </h3>
                <button
                  onClick={() => setIsAddingTask(col)}
                  className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Task Cards */}
              <div className="flex flex-col gap-3">
                {projects.filter(p => p.status === col).map(project => (
                  <div
                    key={project.id}
                    className="bg-white p-4 rounded-[14px] border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group relative overflow-visible flex flex-col gap-2.5"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-slate-800 text-[15px] leading-snug flex-1 break-words">{project.title}</h4>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white rounded-md border border-slate-200 p-0.5 shadow-sm transform translate-x-1 -translate-y-1">
                        <button onClick={() => handleDeleteTask(project.id)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete Task">
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    <p className="text-[13px] font-medium text-slate-500 flex items-center gap-1.5">
                      <Building2 size={14} className="text-slate-400 shrink-0" /> <span className="truncate">{project.company}</span>
                    </p>

                    <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-100/80">
                      <div className="relative group/select">
                        <select
                          className={`text-[11px] font-bold px-2.5 py-1 border rounded-md cursor-pointer outline-none appearance-none pr-6 transition-all ${getStatusColor(project.status).replace('bg-', 'bg-opacity-50 hover:bg-opacity-100 bg-')}`}
                          value={project.status}
                          onChange={(e) => handleStatusChange(project.id, e.target.value as any)}
                        >
                          {columns.map(c => <option key={c} value={c} className="bg-white text-slate-800 font-medium">{c}</option>)}
                        </select>
                        <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none group-hover/select:opacity-100 transition-opacity" />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative group/date">
                          <input
                            type="date"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            value={project.task_date ? project.task_date.split('T')[0] : ''}
                            onChange={(e) => {
                              const newDate = e.target.value ? new Date(e.target.value).toISOString() : null;
                              projectTasksService.updateTask(project.id, { task_date: newDate }).then(() => fetchTasks());
                            }}
                          />
                          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 group-hover/date:border-brand-200 group-hover/date:bg-brand-50 group-hover/date:text-brand-600 transition-colors">
                            <Clock size={12} className="text-slate-400 group-hover/date:text-brand-500" /> {project.task_date ? new Date(project.task_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }) : 'Set Date'}
                          </span>
                        </div>
                        {project.url && (
                          <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-500 transition-colors p-1 hover:bg-brand-50 rounded-md relative z-20">
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div className="mt-2 pt-2 border-t border-slate-100/50">
                      <textarea
                        className="w-full text-[12px] text-slate-600 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-transparent focus:border-brand-300 rounded-md p-2 outline-none resize-none transition-all placeholder:text-slate-300"
                        placeholder="Add notes..."
                        rows={2}
                        defaultValue={project.notes || ''}
                        onBlur={(e) => {
                          if (e.target.value !== (project.notes || '')) {
                            projectTasksService.updateTask(project.id, { notes: e.target.value }).then(() => fetchTasks());
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}

                {/* Add Task Inline Form */}
                {isAddingTask === col ? (
                  <div className="bg-white p-3 rounded-xl border border-brand-300 shadow-sm relative animate-fade-in-up">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Job Title..."
                      className="w-full text-sm font-semibold text-slate-800 mb-2 border-none outline-none placeholder:text-slate-300"
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Company..."
                      className="w-full text-xs text-slate-600 mb-3 border-none outline-none placeholder:text-slate-300"
                      value={newTaskCompany}
                      onChange={e => setNewTaskCompany(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddTask(col)}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAddTask(col)}
                        disabled={!newTaskTitle || !newTaskCompany}
                        className="flex-1 bg-brand-600 text-white text-xs font-bold py-1.5 rounded-lg disabled:opacity-50"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setIsAddingTask(null)}
                        className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingTask(col)}
                    className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:bg-slate-200/50 hover:text-slate-700 rounded-lg transition-colors text-sm font-medium w-full text-left"
                  >
                    <Plus size={16} /> New
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


const CoverLetterView: React.FC<{ unreadCount: number; userProfile: UserProfile | null }> = ({ unreadCount, userProfile }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [cvText, setCvText] = useState(userProfile ? JSON.stringify(userProfile, null, 2) : '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!jobDescription.trim() || !cvText.trim()) return;
    setIsGenerating(true);
    setError('');
    setResult('');
    setCopied(false);

    try {
      const generated = await generateCoverLetter(cvText, jobDescription);
      setResult(generated);
    } catch (err: any) {
      console.error(err);
      setError("Gagal membuat Cover Letter. Harap periksa koneksi atau coba lagi nanti.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in pb-10 max-w-4xl mx-auto">
      <TopBar title="Cover Letter AI" subtitle="Buat surat lamaran kerja profesional dari AI berdasarkan CV kamu." onNotificationClick={() => { }} unreadNotifications={unreadCount} />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi Pekerjaan *</label>
            <textarea
              className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none font-sans"
              placeholder="Tempel detail pekerjaan (Job Description) atau kriteria posisi di sini..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Teks CV / Profil Anda *</label>
            <textarea
              className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none font-mono text-xs"
              placeholder="Tempel teks CV Anda atau biarkan terisi otomatis dari profil Anda..."
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
            ></textarea>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={!jobDescription.trim() || !cvText.trim() || isGenerating}
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? (
              <><Loader2 size={18} className="animate-spin" /> Sedang Membuat...</>
            ) : (
              <><Wand2 size={18} /> {result ? 'Generate Ulang' : 'Generate Cover Letter'}</>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><FileText size={20} className="text-brand-500" /> Hasil Cover Letter</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              >
                <Copy size={16} /> {copied ? 'Tersalin!' : 'Salin Text'}
              </button>
              <button
                onClick={() => exportToWord(result, 'CoverLetter.doc')}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
              >
                <Download size={16} /> Export to Word
              </button>
            </div>
          </div>
          <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-serif px-4">
            {result}
          </div>
        </div>
      )}
    </div>
  );
};

const NewsChatView: React.FC<{ userProfile?: UserProfile | null }> = ({ userProfile }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string, sources?: any[], timestamp?: Date }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [conversations, setConversations] = useState<{ id: string, title: string, date: Date }[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const startNewChat = () => {
    if (messages.length > 0) {
      const title = messages.find(m => m.role === 'user')?.content.slice(0, 40) || 'Chat Baru';
      setConversations(prev => [{ id: activeConvId || Date.now().toString(), title, date: new Date() }, ...prev].slice(0, 10));
    }
    setMessages([]);
    setActiveConvId(Date.now().toString());
    setChatInput('');
  };
  const [debugLog, setDebugLog] = useState<string>('');

  // --- ADVANCED RAG SYSTEM WITH CHUNKING ---

  // Split text into overlapping chunks
  const chunkText = (text: string, chunkSize = 500, overlap = 100): string[] => {
    if (!text || text.length <= chunkSize) return [text || ''];
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      // Try to break at sentence boundary
      let breakPoint = end;
      if (end < text.length) {
        let lastStop = -1;
        // Search backwards from end down to start + 50% for a period or newline
        for (let i = end - 1; i > start + chunkSize * 0.5; i--) {
          if (text[i] === '.' || text[i] === '\n') {
            lastStop = i;
            break;
          }
        }
        if (lastStop !== -1) {
          breakPoint = lastStop + 1;
        }
      }
      chunks.push(text.slice(start, breakPoint).trim());

      const prevStart = start;
      start = breakPoint - overlap;

      // CRITICAL FIX: Ensure start always advances forward! 
      // Otherwise, the while loop will spin infinitely and crash the browser.
      if (start <= prevStart) {
        start = prevStart + 1;
      }

      if (start >= text.length) break;
    }
    return chunks.filter(c => c.length > 30);
  };

  // Score chunk relevance to query using keyword matching
  const scoreRelevance = (chunk: string, queryTokens: string[], title: string, daysAgo: number): number => {
    const lowerChunk = (chunk + ' ' + title).toLowerCase();
    let score = 0;

    // Keyword matching (TF-based)
    queryTokens.forEach(token => {
      if (token.length < 2) return;
      const regex = new RegExp(token, 'gi');
      const matches = lowerChunk.match(regex);
      if (matches) {
        score += matches.length * 3; // each match = 3 points
      }
    });

    // Title match bonus (more important)
    const lowerTitle = title.toLowerCase();
    queryTokens.forEach(token => {
      if (token.length < 2) return;
      if (lowerTitle.includes(token)) score += 10;
    });

    // Recency bonus (newer = higher score)
    if (daysAgo < 1) score += 8;
    else if (daysAgo < 3) score += 5;
    else if (daysAgo < 7) score += 3;
    else if (daysAgo < 30) score += 1;

    // Length penalty for very short chunks
    if (chunk.length < 50) score -= 2;

    return score;
  };

  // Tokenize query into meaningful keywords
  const tokenizeQuery = (query: string): string[] => {
    const stopWords = new Set(['yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'dengan', 'pada', 'ini', 'itu', 'ada', 'apa', 'saya', 'kamu', 'bisa', 'mau', 'tentang', 'seputar', 'bagaimana', 'gimana', 'apakah', 'tolong', 'cari', 'tanya', 'minta', 'kasih', 'the', 'is', 'in', 'of', 'and', 'a', 'to', 'cv', 'saat']);
    return query.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1 && !stopWords.has(t));
  };

  // Main RAG function with chunking
  const fetchRAGContext = async (query: string) => {
    setDebugLog('Fetching jobs...');
    const allChunks: { content: string; title: string; type: 'job' | 'news'; url: string; source: string; score: number }[] = [];
    const queryTokens = tokenizeQuery(query);
    const now = Date.now();

    try {
      // 1. Fetch jobs — get more data for better coverage
      const { data: jobs } = await supabase
        .from('jobs')
        .select('title, company, location, description, source, url, posted_at')
        .order('posted_at', { ascending: false })
        .limit(30);

      if (jobs?.length) {
        setDebugLog(`Chunking ${jobs.length} jobs...`);
        let jobChunkCount = 0;
        jobs.forEach(job => {
          const fullText = [
            `Lowongan: ${job.title}`,
            `Perusahaan: ${job.company}`,
            `Lokasi: ${job.location || 'Tidak disebutkan'}`,
            `Sumber: ${job.source || 'LinkedIn'}`,
            job.description || ''
          ].join('\n');

          const chunks = chunkText(fullText, 500, 80);
          const daysAgo = job.posted_at ? (now - new Date(job.posted_at).getTime()) / 86400000 : 30;
          const title = `${job.title} - ${job.company}`;

          chunks.forEach(chunk => {
            const score = scoreRelevance(chunk, queryTokens, title, daysAgo);
            if (score > 0) {
              jobChunkCount++;
              allChunks.push({
                content: chunk,
                title,
                type: 'job',
                url: job.url || '',
                source: job.source || 'LinkedIn',
                score
              });
            }
          });
        });
        setDebugLog(`Added ${jobChunkCount} job chunks.`);
      }

      // 2. Fetch CPNS/BUMN posts — read full articles
      setDebugLog('Fetching CPNS/BUMN posts...');
      const { data: posts, error } = await supabase
        .from('cpns_bumn_posts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);

      if (error) {
        setDebugLog(`Error fetching posts: ${error.message}`);
      }

      if (posts?.length) {
        setDebugLog(`Chunking ${posts.length} posts...`);
        let postChunkCount = 0;
        posts.forEach(post => {
          const fullText = [
            `Judul: ${post.title}`,
            `Kategori: ${post.category || 'Umum'}`,
            `Sumber: ${post.source || 'CPNS/BUMN'}`,
            post.content || ''
          ].join('\n');

          const chunks = chunkText(fullText, 500, 80);
          const daysAgo = post.timestamp ? (now - new Date(post.timestamp).getTime()) / 86400000 : 30;
          const title = post.title || 'Berita CPNS/BUMN';

          chunks.forEach(chunk => {
            const score = scoreRelevance(chunk, queryTokens, title, daysAgo);
            if (score > 0) {
              postChunkCount++;
              allChunks.push({
                content: chunk,
                title,
                type: 'news',
                url: post.source_url || post.url || '',
                source: post.source || 'CPNS/BUMN',
                score
              });
            }
          });
        });
        setDebugLog(`Added ${postChunkCount} post chunks.`);
      }
    } catch (err: any) {
      setDebugLog(`Catch error: ${err.message}`);
      console.warn('RAG chunk fetch error:', err);
    }

    // Sort by relevance score and return top chunks
    setDebugLog('Sorting and deduplicating chunks...');
    allChunks.sort((a, b) => b.score - a.score);

    // Deduplicate by title (keep highest scored chunk per source)
    const seen = new Set<string>();
    const dedupedChunks = allChunks.filter(c => {
      const key = c.title + '|' + c.content.slice(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    setDebugLog(`Returning ${Math.min(dedupedChunks.length, 8)} chunks.`);
    return dedupedChunks.slice(0, 8).map(c => ({
      type: c.type,
      title: c.title,
      content: c.content,
      url: c.url,
      source: c.source,
      score: c.score
    }));
  };

  const handleChatSubmit = async (customQuery?: string) => {
    const q = customQuery || chatInput.trim();
    if (!q) return;

    const userMsg = { role: 'user' as const, content: q, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    if (!customQuery) setChatInput('');
    setChatLoading(true);
    setDebugLog('Started request...');
    scrollToBottom();

    try {
      // Step 1: Fetch RAG context
      const ragContext = await fetchRAGContext(q);

      const contextText = ragContext.length > 0
        ? ragContext.map((c: any, i: number) => `[Sumber ${i + 1}: ${c.title} | Relevansi: ${c.score}]\n${c.content}`).join('\n\n---\n\n')
        : 'Tidak ada data spesifik ditemukan di database untuk query ini.';

      // Step 2: Build conversation history for context
      const historyMessages = messages.slice(-8).map(m => ({
        role: m.role,
        content: m.content
      }));

      // Step 3: Call OpenAI with RAG context
      setDebugLog('Calling OpenAI API...');
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) throw new Error("API key not found");

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.3,
          messages: [
            {
              role: 'system',
              content: `Kamu adalah "Jobs Agent AI" — teman karir pintar yang akrab dan menyenangkan.

KEPRIBADIANMU:
- Bicara seperti teman yang paham dunia kerja, bukan robot formal
- Enthusiastik dan supportive, seperti career coach yang ramah
- Jika user meminta rekomendasi, berikan rekomendasi yang spesifik dan personal
- Gunakan emoji sesekali untuk membuat percakapan lebih hidup

DATABASE YANG KAMU AKSES (via RAG):
Kamu membaca ${ragContext.length} chunk data yang paling relevan dari:
- Database lowongan kerja (LinkedIn, Jobstreet, dll)
- Artikel berita CPNS & BUMN terbaru
- Info rekrutmen dan tips karir

PROFIL USER:
${userProfile?.raw_cv ? `👤 Nama: ${userProfile.full_name || 'Tidak diketahui'}
🛠 Skills: ${userProfile.skills?.join(', ') || 'Tidak disebutkan'}
💼 Pengalaman: ${userProfile.experience || 'Tidak disebutkan'}
🎓 Pendidikan: ${userProfile.education || 'Tidak disebutkan'}
📄 CV: ${userProfile.raw_cv.slice(0, 2000)}` : '⚠️ User belum upload CV. Sarankan untuk upload di menu Settings agar rekomendasi lebih tepat.'}

DATA KONTEKS (dari RAG chunking — diurutkan berdasarkan relevansi):
${contextText}

CARA MENJAWAB:
1. **Gunakan data konteks** sebagai sumber utama jawaban — ini adalah data REAL dari database
2. Jika data relevan ditemukan, sebutkan sumber: [Sumber 1], [Sumber 2], dst
3. Untuk rekomendasi lowongan: **cocokkan skill user dengan requirement** di data lowongan
4. Jika ditanya "lowongan yang cocok", lihat CV user → cari match di data lowongan → rekomendasikan yang paling cocok
5. Untuk info CPNS/BUMN: gunakan data artikel terbaru, sebutkan tanggal dan sumber
6. **Format yang rapi**: gunakan bullet points, bold untuk poin penting, paragraf pendek
7. Jika data tidak cukup, jujur katakan dan beri saran kemana mencari
8. Jangan pernah mengarang data — lebih baik bilang "Saya belum punya info itu" daripada asal jawab`
            },
            ...historyMessages,
            { role: 'user', content: q }
          ]
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const answer = data.choices[0].message.content;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: answer,
        sources: ragContext.slice(0, 4),
        timestamp: new Date()
      }]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Maaf, terjadi kesalahan saat memproses pertanyaan Anda. Silakan coba lagi.",
        timestamp: new Date()
      }]);
    } finally {
      setChatLoading(false);
      scrollToBottom();
    }
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-2"></div>;

      // Bold text **text**
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.match(/^\d+\.\s/)) {
        const content = trimmed.replace(/^[-•]\s|^\d+\.\s/, '');
        const contentParts = content.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
          }
          return part;
        });
        return (
          <div key={i} className="flex items-start gap-2.5 ml-1 py-0.5">
            <span className="text-brand-500 mt-1.5 text-[8px]">●</span>
            <span>{contentParts}</span>
          </div>
        );
      }

      // Source citations [Sumber N]
      if (trimmed.includes('[Sumber')) {
        const citeParts = trimmed.split(/(\[Sumber \d+\])/g).map((part, j) => {
          const match = part.match(/\[Sumber (\d+)\]/);
          if (match) {
            return (
              <span key={j} className="inline-flex items-center justify-center px-1.5 py-0.5 bg-brand-50 text-brand-600 border border-brand-200 text-[10px] font-black rounded-md mx-0.5 align-middle">
                {match[1]}
              </span>
            );
          }
          return part;
        });
        return <p key={i} className="py-0.5">{citeParts}</p>;
      }

      // Headers (### or ##)
      if (trimmed.startsWith('### ')) {
        return <h4 key={i} className="font-bold text-slate-900 text-[15px] mt-3 mb-1">{trimmed.replace('### ', '')}</h4>;
      }
      if (trimmed.startsWith('## ')) {
        return <h3 key={i} className="font-bold text-slate-900 text-base mt-3 mb-1">{trimmed.replace('## ', '')}</h3>;
      }

      return <p key={i} className="py-0.5">{parts}</p>;
    });
  };

  const suggestedPrompts = [
    { icon: '🔍', title: 'Cari Lowongan', desc: 'Tampilkan lowongan software engineer terbaru', color: 'from-blue-500/10 to-indigo-500/10 border-blue-200/50' },
    { icon: '📋', title: 'Info CPNS', desc: 'Kapan pendaftaran CPNS 2026 dibuka?', color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200/50' },
    { icon: '🏢', title: 'BUMN Terbaru', desc: 'Ada rekrutmen BUMN apa saja saat ini?', color: 'from-amber-500/10 to-orange-500/10 border-amber-200/50' },
    { icon: '💡', title: 'Tips Karir', desc: 'Bagaimana cara lolos tes SKD CPNS?', color: 'from-purple-500/10 to-pink-500/10 border-purple-200/50' },
  ];

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  return (
    <div className="animate-fade-in h-[calc(100vh-80px)] flex flex-col max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Jobs Agent AI</h2>
            <p className="text-[10px] text-slate-400 font-medium">RAG · LinkedIn · CPNS · BUMN</p>
          </div>
        </div>
        <button
          onClick={startNewChat}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 active:scale-95"
        >
          <Plus size={14} /> Chat Baru
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar" id="chat-messages">
        {messages.length === 0 ? (
          /* Empty State — Gemini Style */
          <div className="h-full flex flex-col items-center justify-center px-6 py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-brand-500/20 animate-fade-in">
              <Sparkles size={28} className="text-white" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight animate-fade-in">Halo, ada yang bisa dibantu?</h3>
            <p className="text-sm text-slate-400 font-medium mb-10 text-center max-w-md animate-fade-in">
              Saya bisa membantu mencari lowongan kerja, info CPNS & BUMN, tips karir, dan banyak lagi.
            </p>
            <div className="grid grid-cols-2 gap-3 w-full max-w-lg animate-fade-in-up">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleChatSubmit(prompt.desc)}
                  className={`text-left p-4 rounded-2xl border bg-gradient-to-br ${prompt.color} hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-[0.98] group`}
                >
                  <span className="text-xl mb-2 block">{prompt.icon}</span>
                  <div className="text-xs font-bold text-slate-800 mb-0.5">{prompt.title}</div>
                  <div className="text-[11px] text-slate-500 font-medium leading-snug">{prompt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-6 px-4 md:px-8 space-y-5 max-w-4xl mx-auto">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                {/* AI Avatar — Left */}
                {m.role === 'assistant' && (
                  <div className="shrink-0 mr-3 mt-1">
                    <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
                      <Sparkles size={16} className="text-white" />
                    </div>
                  </div>
                )}

                <div className={`max-w-[75%] ${m.role === 'user' ? '' : ''}`}>
                  {/* Message Bubble */}
                  <div className={`p-4 md:p-5 text-[14px] leading-relaxed font-medium shadow-sm ${m.role === 'user'
                    ? 'bg-slate-900 text-white rounded-2xl rounded-tr-sm'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-tl-sm'
                    }`}>
                    {m.role === 'user' ? (
                      <span>{m.content}</span>
                    ) : (
                      <div>{formatContent(m.content)}</div>
                    )}
                  </div>

                  {/* Sources — Only for AI */}
                  {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {m.sources.map((src, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => src.url && window.open(src.url, '_blank')}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-[10px] font-bold text-slate-400 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95"
                        >
                          {src.type === 'job' ? <Briefcase size={10} className="text-brand-500" /> : <Newspaper size={10} className="text-emerald-500" />}
                          <span className="truncate max-w-[120px]">{src.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* User Avatar — Right */}
                {m.role === 'user' && (
                  <div className="shrink-0 ml-3 mt-1">
                    <div className="w-9 h-9 bg-slate-800 rounded-2xl flex items-center justify-center text-white text-xs font-bold shadow-md">
                      {userProfile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading */}
            {chatLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="shrink-0 mr-3 mt-1">
                  <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
                    <Sparkles size={16} className="text-white animate-pulse" />
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl rounded-tl-sm shadow-sm border border-slate-200">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:0.15s]"></div>
                        <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:0.3s]"></div>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">Mencari & menganalisis data...</span>
                    </div>
                    {/* Debug status */}
                    <div className="text-[10px] text-slate-300 font-mono mt-1 border-t border-slate-100 pt-1">
                      Status: {debugLog}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Input Bar — ChatGPT Style */}
      <div className="px-4 md:px-6 pb-4 pt-2">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={(e) => { e.preventDefault(); handleChatSubmit(); }}
            className="relative bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/50 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all"
          >
            <textarea
              ref={inputRef}
              value={chatInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan apa saja tentang lowongan kerja, CPNS, BUMN..."
              disabled={chatLoading}
              rows={1}
              className="w-full px-5 py-4 pr-14 bg-transparent border-none resize-none focus:outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400 max-h-[150px]"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="absolute right-3 bottom-3 w-9 h-9 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-200 text-white rounded-xl transition-all flex items-center justify-center active:scale-90"
            >
              {chatLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-2.5 font-medium">
            Jobs Agent AI menggunakan data dari LinkedIn, CPNS, dan BUMN untuk memberikan jawaban yang akurat.
          </p>
        </div>
      </div>
    </div>
  );
};

const CPNSBUMNView: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('cpns_bumn_posts')
        .select('*')
        .order('timestamp', { ascending: false });

      if (fetchError) throw fetchError;

      // Map to ensure field consistency
      const formatted = (data || []).map(row => ({
        ...row,
        imageUrl: row.image_url // map snake_case to camelCase if needed by UI
      }));
      setPosts(formatted);
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post =>
    post.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const otherPosts = filteredPosts.slice(1);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getSourceColor = (author: string) => {
    const colors = [
      'from-blue-600 to-indigo-600',
      'from-emerald-600 to-teal-600',
      'from-purple-600 to-violet-600',
      'from-orange-600 to-amber-600',
      'from-rose-600 to-pink-600',
      'from-cyan-600 to-sky-600',
    ];
    const index = author ? author.length % colors.length : 0;
    return colors[index];
  };

  return (
    <div className="animate-fade-in pb-10 max-w-6xl mx-auto px-4 sm:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-4xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <Globe className="text-brand-600" size={36} /> Info CPNS & BUMN
          </h2>
          <p className="text-slate-500 mt-2 font-medium">Portal berita resmi seputar seleksi CASN dan karir BUMN Indonesia.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Cari berita..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl w-full md:w-80 shadow-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm font-medium"
            />
          </div>

          <button
            onClick={fetchPosts}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl font-bold transition-all disabled:opacity-50 active:scale-95 whitespace-nowrap shadow-lg shadow-slate-200"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Loader2 size={18} />}
            <span className="hidden sm:inline">{loading ? 'Memproses...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-5 rounded-2xl flex items-center gap-4 mb-10 shadow-sm">
          <div className="bg-rose-100 p-2 rounded-lg">
            <AlertCircle size={24} />
          </div>
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-10">
          <div className="h-[400px] bg-slate-100 rounded-3xl animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-48 bg-slate-100 rounded-2xl animate-pulse"></div>
                <div className="h-6 bg-slate-100 rounded-lg w-3/4 animate-pulse"></div>
                <div className="h-4 bg-slate-100 rounded-lg w-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Featured Post (Hero Section) */}
          {featuredPost && !searchTerm && (
            <div
              className="relative rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-2xl shadow-slate-200 border border-slate-100 h-[450px]"
              onClick={() => window.open(featuredPost.url, '_blank')}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${getSourceColor(featuredPost.author)} opacity-90 group-hover:opacity-100 transition-opacity`}></div>

              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end text-white z-10">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                    <Newspaper size={16} /> {featuredPost.author || 'Berita Utama'}
                  </span>
                  <span className="bg-black/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                    <Clock size={16} /> {formatDate(featuredPost.timestamp)}
                  </span>
                  <span className="bg-brand-500 text-white px-4 py-1.5 rounded-full text-sm font-black tracking-widest uppercase">LATEST</span>
                </div>

                <h3 className="text-3xl md:text-5xl font-black mb-6 leading-[1.1] max-w-4xl group-hover:translate-x-2 transition-transform duration-500">
                  {featuredPost.caption}
                </h3>

                <div className="flex items-center gap-4">
                  <div className="h-px w-20 bg-white/30 hidden sm:block"></div>
                  <span className="flex items-center gap-2 text-lg font-bold group-hover:gap-4 transition-all">
                    Baca Selengkapnya <ArrowRight size={20} />
                  </span>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 p-12 opacity-10">
                <Newspaper size={200} />
              </div>
            </div>
          )}

          {/* Grid of Other Posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(searchTerm ? filteredPosts : otherPosts).map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col cursor-pointer ring-0 hover:ring-8 hover:ring-brand-500/5"
                onClick={() => window.open(post.url, '_blank')}
              >
                <div className={`h-2.5 bg-gradient-to-r ${getSourceColor(post.author)}`}></div>

                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-brand-600 font-extrabold text-xs uppercase tracking-widest flex items-center gap-2">
                      <Newspaper size={14} /> {post.author}
                    </span>
                    <span className="text-slate-400 text-xs font-bold flex items-center gap-1.5">
                      <Clock size={14} /> {formatDate(post.timestamp)}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-slate-800 line-clamp-4 mb-6 flex-1 group-hover:text-brand-600 transition-colors leading-snug">
                    {post.caption}
                  </h4>

                  <div className="flex items-center justify-end pt-5 border-t border-slate-50 mt-auto">
                    <span className="flex items-center gap-2 text-sm text-slate-900 font-black group-hover:text-brand-600 group-hover:gap-3 transition-all">
                      SELENGKAPNYA <ChevronRight size={18} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(searchTerm ? filteredPosts : posts).length === 0 && !error && (
            <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200">
                <Search size={40} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-bold text-xl">Tidak ada berita yang cocok dengan pencarian Anda.</p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-brand-600 font-bold hover:underline"
              >
                Hapus pencarian
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, user }) => {
  const [currentView, setCurrentView] = useState<DashboardView>('search');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCVAlert, setShowCVAlert] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => loadProfile());
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  React.useEffect(() => {
    // Mandate CV upload for all new users right after onboarding finishes / on start
    if (!userProfile?.raw_cv && currentView !== 'settings' && currentView !== 'cv-builder') {
      setCurrentView('settings');
    } else if (userProfile?.raw_cv && !userProfile?.subscriptionPlan && currentView !== 'pricing' && currentView !== 'settings' && currentView !== 'cv-builder') {
      // Force plan selection right after onboarding CV if not chosen yet
      setCurrentView('pricing');
    }
  }, [userProfile, currentView]);

  React.useEffect(() => {
    // Listen for new jobs being inserted (Scraping notifications)
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'jobs',
        },
        (payload) => {
          const newJob = payload.new;
          const newNotif: Notification = {
            id: Date.now(),
            type: 'match',
            title: 'New Job Scraped!',
            message: `${newJob.title} at ${newJob.company} has been added. Check it out!`,
            time: 'Just now',
            unread: true
          };
          setNotifications(prev => [newNotif, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setCurrentView('detail');
  };
  const handleNavClick = (view: DashboardView) => {
    if (!userProfile?.raw_cv && view !== 'settings' && view !== 'cv-builder') {
      setShowCVAlert(true);
      setCurrentView('settings');
      if (window.innerWidth < 1024) setSidebarOpen(false);
      return;
    }
    if (userProfile?.raw_cv && !userProfile?.subscriptionPlan && view !== 'pricing' && view !== 'settings' && view !== 'cv-builder') {
      setCurrentView('pricing');
      if (window.innerWidth < 1024) setSidebarOpen(false);
      return;
    }
    setCurrentView(view);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const renderContent = () => {
    // Ultimate safeguard: prevent rendering any content other than settings or cv-builder if CV is missing
    if (!userProfile?.raw_cv && currentView !== 'settings' && currentView !== 'cv-builder') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
          <Upload size={64} className="mx-auto text-brand-200 mb-6" />
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Akses Terkunci</h2>
          <p className="text-slate-500 max-w-sm mb-6">Silakan lengkapi profil Anda dengan mengunggah CV. Jobs Agent membutuhkan profil ini untuk mencari pekerjaan yang cocok.</p>
          <button onClick={() => setCurrentView('settings')} className="px-6 py-3 bg-brand-600 text-white font-bold rounded-xl shadow-lg hover:bg-brand-700 active:scale-95 transition-all">
            Menuju Pengaturan
          </button>
        </div>
      );
    }

    if (userProfile?.raw_cv && !userProfile?.subscriptionPlan && currentView !== 'pricing' && currentView !== 'settings' && currentView !== 'cv-builder') {
      return (
        <div className="h-full overflow-y-auto w-full pb-20">
          <Pricing onSelectPlan={(plan) => {
            if (userProfile) {
              setUserProfile({ ...userProfile, subscriptionPlan: plan } as UserProfile);
            }
            setCurrentView('dashboard');
          }} />
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard': return <DashboardHome user={user} onViewChange={setCurrentView} unreadCount={unreadCount} />;
      case 'search':
      case 'detail':
        return (
          <div className={currentView === 'detail' ? 'flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)] overflow-hidden' : ''}>
            {currentView === 'detail' ? (
              // In detail mode: show job list only if there are results, otherwise hide left panel
              <div className="w-full lg:w-[400px] xl:w-[450px] flex-shrink-0 h-full overflow-y-auto custom-scrollbar pr-4 mr-2 lg:block hidden">
                <JobSearch user={user} onJobClick={handleJobClick} onViewChange={setCurrentView} userProfile={userProfile} unreadCount={unreadCount} isSplitView={true} selectedJob={selectedJob} />
              </div>
            ) : (
              <div className="w-full block">
                <JobSearch user={user} onJobClick={handleJobClick} onViewChange={setCurrentView} userProfile={userProfile} unreadCount={unreadCount} isSplitView={false} selectedJob={selectedJob} />
              </div>
            )}
            {currentView === 'detail' && selectedJob && (
              <div key={selectedJob.id} className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar bg-white relative rounded-tl-3xl lg:border-l border-slate-200 lg:pl-6 pb-20 animate-fade-in">
                <JobDetail job={selectedJob} onBack={() => setCurrentView('search')} userProfile={userProfile} user={user} unreadCount={unreadCount} isSplitView={true} />
              </div>
            )}
          </div>
        );
      case 'applications': return <FavoriteJobsList unreadCount={unreadCount} />;
      case 'scanner': return <ATSScanner unreadCount={unreadCount} userProfile={userProfile} />;
      case 'cv':
        // CV functionality moved completely to settings view
        return <SettingsView user={user} unreadCount={unreadCount} userProfile={userProfile} onProfileUpdate={(p) => setUserProfile(p)} onViewChange={setCurrentView} />;
      case 'notifications': return <NotificationsView notifications={notifications} onMarkRead={handleMarkNotificationsRead} onViewChange={setCurrentView} />;
      case 'settings': return <SettingsView user={user} unreadCount={unreadCount} userProfile={userProfile} onProfileUpdate={(p) => setUserProfile(p)} onViewChange={setCurrentView} />;
      case 'project-tracker': return <ProjectTracker unreadCount={unreadCount} />;
      case 'cover-letter': return <CoverLetterView userProfile={userProfile} unreadCount={unreadCount} />;
      case 'pricing':
        return (
          <div className="h-full overflow-y-auto w-full pb-20">
            <Pricing onSelectPlan={(plan) => {
              if (userProfile) {
                const newProfile = { ...userProfile, subscriptionPlan: plan } as UserProfile;
                setUserProfile(newProfile);
                saveProfile(newProfile);
              }
              setCurrentView('dashboard');
            }} />
          </div>
        );
      case 'cpns-bumn':
        if (userProfile?.subscriptionPlan !== 'pro') {
          return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in bg-slate-50 min-h-full">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl shadow-purple-500/30 mb-8 relative">
                <Globe size={40} className="text-white" />
                <div className="absolute -bottom-2 -right-2 bg-slate-900 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border-2 border-slate-50">
                  <Lock size={20} className="text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Fitur Eksklusif PRO</h2>
              <p className="text-lg text-slate-500 max-w-lg mb-8 leading-relaxed">
                Buka akses ke ribuan informasi dan lowongan spesifik <strong>BUMN & CPNS</strong> beserta asisten AI khusus yang akan membantu strategi karir Anda.
              </p>
              <div className="space-y-4 w-full max-w-sm">
                <button
                  onClick={() => setCurrentView('pricing')}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-1 transition-all"
                >
                  Upgrade ke PRO Sekarang
                </button>
                <button onClick={() => setCurrentView('dashboard')} className="w-full py-3 text-slate-500 font-semibold hover:text-slate-700 transition-colors">
                  Kembali ke Dashboard
                </button>
              </div>
            </div>
          );
        }
        return <CPNSBUMNView />;
      case 'cv-builder':
        return (
          <div className="p-4 md:p-8">
            <CVBuilder initialProfile={userProfile} onUpdate={setUserProfile} />
          </div>
        );
      case 'ai-chat':
        if (userProfile?.subscriptionPlan !== 'pro') {
          return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in bg-slate-50 min-h-full">
              <div className="w-24 h-24 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-8 relative">
                <Sparkles size={40} className="text-white" />
                <div className="absolute -bottom-2 -right-2 bg-slate-900 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border-2 border-slate-50">
                  <Lock size={20} className="text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">AI Career Assistant Terkunci</h2>
              <p className="text-lg text-slate-500 max-w-lg mb-8 leading-relaxed">
                Tingkatkan ke paket PRO untuk chatting <strong>tanpa batas</strong> dengan AI Jobs Agent. Dapatkan rekomendasi loker personal dan konsultasi karir 24/7.
              </p>
              <div className="space-y-4 w-full max-w-sm">
                <button
                  onClick={() => setCurrentView('pricing')}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-1 transition-all"
                >
                  Buka Semua Fitur PRO
                </button>
                <button onClick={() => setCurrentView('dashboard')} className="w-full py-3 text-slate-500 font-semibold hover:text-slate-700 transition-colors">
                  Nanti Saja
                </button>
              </div>
            </div>
          );
        }
        return <NewsChatView userProfile={userProfile} />;
      case 'salary-checker':
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in bg-slate-50 min-h-full">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center shadow-xl shadow-teal-500/30 mb-8 relative">
              <Coins size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Salary Checker</h2>
            <p className="text-lg text-slate-500 max-w-lg mb-8 leading-relaxed">
              Fitur kalkulator dan pembanding gaji profesi ini sedang dalam tahap pengembangan oleh tim teknis kami. Segera hadir!
            </p>
            <button onClick={() => setCurrentView('dashboard')} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl shadow-lg hover:bg-slate-800 transition-all">
              Kembali ke Dashboard
            </button>
          </div>
        );
      default: return <DashboardHome onViewChange={setCurrentView} unreadCount={unreadCount} />;
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
        fixed lg:relative inset-y-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-[280px] translate-x-0 opacity-100' : 'w-0 -translate-x-full lg:translate-x-0 opacity-0 lg:opacity-100 pointer-events-none lg:pointer-events-auto overflow-hidden'}
      `}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <Star size={18} fill="currentColor" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Jobs Agent</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-slate-400 p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
            <ChevronLeft size={20} className="hidden lg:block" />
            <X size={24} className="block lg:hidden" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8 custom-scrollbar">

          {/* Main Nav */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 mb-3">Menu</div>
            <div className="space-y-1">
              <NavItem icon={<Search size={20} />} label="Cari Lowongan" active={currentView === 'search' || currentView === 'detail'} onClick={() => handleNavClick('search')} />
              <NavDropdown
                icon={<Briefcase size={20} />}
                label="Track In My Jobs"
                activePath={['dashboard', 'applications', 'project-tracker'].includes(currentView)}
              >
                <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={currentView === 'dashboard'} onClick={() => handleNavClick('dashboard')} badge={unreadCount > 0 ? unreadCount.toString() : undefined} />
                <NavItem icon={<Star size={20} />} label="My Favorite Jobs" active={currentView === 'applications'} onClick={() => handleNavClick('applications')} />
                <NavItem icon={<ScanLine size={20} />} label="My Notebook" active={currentView === 'project-tracker'} badge="Beta" onClick={() => handleNavClick('project-tracker')} />
              </NavDropdown>
            </div>
          </div>

          {/* Tools */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 mb-3">Tools</div>
            <div className="space-y-1">
              {/* Upload CV tool button removed - moved to profile */}
              <NavDropdown
                icon={<Bot size={20} />}
                label="Jobs AI Agent"
                activePath={['cv-builder', 'scanner', 'cover-letter'].includes(currentView)}
              >
                <NavItem
                  icon={<Wand2 size={18} />}
                  label="CV ATS Builder"
                  active={currentView === 'cv-builder'}
                  onClick={() => handleNavClick('cv-builder')}
                />
                <NavItem icon={<Zap size={18} />} label="ATS Scanner" active={currentView === 'scanner'} badge="New" onClick={() => handleNavClick('scanner')} />
                <NavItem icon={<Wand2 size={18} />} label="Cover Letter AI" active={currentView === 'cover-letter'} onClick={() => handleNavClick('cover-letter')} />
              </NavDropdown>

              <NavItem icon={<Globe size={20} />} label="Info CPNS & BUMN" active={currentView === 'cpns-bumn'} onClick={() => handleNavClick('cpns-bumn')} />
              <NavItem
                icon={<MessageSquare size={18} />}
                label="Tanya AI News"
                active={currentView === 'ai-chat'}
                onClick={() => handleNavClick('ai-chat')}
              />
              <NavItem
                icon={<Coins size={20} />}
                label="Salary Checker"
                active={currentView === 'salary-checker'}
                onClick={() => handleNavClick('salary-checker')}
              />
              <NavItem icon={<Bell size={20} />} label="Notifikasi" active={currentView === 'notifications'} onClick={() => handleNavClick('notifications')} badge={unreadCount > 0 ? unreadCount.toString() : undefined} />
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
              <div className="text-xs font-medium truncate bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full inline-block mt-0.5 uppercase tracking-wider text-[10px]">
                {userProfile?.subscriptionPlan === 'pro' ? '👑 PRO' : userProfile?.subscriptionPlan === 'lite' ? '⚡ LITE' : 'FREE PLAN'}
              </div>
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
      <main className="flex-1 h-screen overflow-y-auto bg-slate-50 relative custom-scrollbar flex flex-col">
        {/* Universal Header Toggle (Sticky) */}
        <div className={`
          sticky top-0 z-30 p-4 bg-slate-50/90 backdrop-blur-sm border-b border-slate-200 transition-all duration-300
          ${!sidebarOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none h-0 p-0 border-0'}
        `}>
          <div className="flex items-center justify-between max-w-[1600px] mx-auto">
            <div className="flex items-center gap-4 font-bold text-slate-900">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 text-slate-600 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 shadow-sm transition-all active:scale-95"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-brand-600 rounded flex items-center justify-center text-white">
                  <Star size={14} fill="currentColor" />
                </div>
                Jobs Agent
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Quick stats or user avatar when sidebar is hidden */}
              <div className="hidden sm:flex items-center bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm gap-2 text-xs font-bold text-slate-600">
                <Coins size={14} className="text-amber-500" /> 234
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center font-bold text-xs" onClick={() => handleNavClick('settings')}>
                <img src={`https://ui-avatars.com/api/?name=${user?.full_name || 'User'}&background=random`} alt="User" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto min-h-full w-full">
          {renderContent()}
        </div>
      </main>

      {/* Modern CV Access Alert Modal */}
      {showCVAlert && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowCVAlert(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-8 md:p-10 shadow-2xl relative translate-y-0 transition-transform duration-300" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowCVAlert(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2.5 rounded-full transition-colors active:bg-slate-200"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center mb-6 shadow-sm ring-4 ring-amber-50">
              <AlertTriangle size={32} className="text-amber-600" />
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">Wajib Upload CV</h3>
            <p className="text-[15px] text-slate-500 leading-relaxed mb-8">
              Wah, langkah Anda terhenti! Untuk membuka kunci semua fitur canggih Jobs Agent dan melihat referensi lamaran kerja AI, Anda harus melengkapi profil dengan spesifikasi CV terlebih dahulu.
            </p>

            <button
              onClick={() => setShowCVAlert(false)}
              className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:bg-brand-600 hover:shadow-[0_8px_20px_rgba(79,70,229,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <FileText size={18} /> Lengkapi CV Sekarang
            </button>
          </div>
        </div>
      )}
    </div>
  );
};