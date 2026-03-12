import React, { useRef, useEffect, useState } from 'react';
import {
  Search, Target, ScanLine, FileText, Wand2, Layout,
  Coins, Globe, MessageSquare, ArrowRight, CheckCircle2,
  Briefcase, MapPin, Star, Bot, AlertTriangle, Lightbulb,
  BarChart3, Calendar, ChevronRight, Sparkles
} from 'lucide-react';

// ─── ANIMATED SEARCH MOCKUP ───────────────────────────────────────────────────

const AnimatedSearchMockup = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [resultsShown, setResultsShown] = useState(0);
  const fullText = 'Software Engineer';

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const animate = async () => {
      // 1. Reset state
      setSearchTerm('');
      setIsSearching(false);
      setResultsShown(0);

      // 2. Wait a bit before starting
      await new Promise(r => setTimeout(r, 1000));

      // 3. Type text
      for (let i = 0; i <= fullText.length; i++) {
        setSearchTerm(fullText.substring(0, i));
        await new Promise(r => setTimeout(r, Math.random() * 100 + 50));
      }

      // 4. Show loading state
      await new Promise(r => setTimeout(r, 400));
      setIsSearching(true);

      // 5. Hide loading and show results sequentially
      await new Promise(r => setTimeout(r, 800));
      setIsSearching(false);

      for (let i = 1; i <= 3; i++) {
        setResultsShown(i);
        await new Promise(r => setTimeout(r, 300));
      }

      // 6. Restart loop after a delay
      timeout = setTimeout(animate, 4000);
    };

    animate();

    return () => clearTimeout(timeout);
  }, []);

  const jobs = [
    { title: 'Frontend Engineer', company: 'Gojek', loc: 'Jakarta', match: 92, src: 'LinkedIn' },
    { title: 'React Developer', company: 'Tokopedia', loc: 'Remote', match: 87, src: 'JobStreet' },
    { title: 'Full Stack Dev', company: 'Traveloka', loc: 'Jakarta', match: 81, src: 'LinkedIn' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg relative overflow-hidden">
      {/* Search bar mockup */}
      <div className={`flex items-center bg-slate-50 rounded-xl p-3 border mb-4 transition-colors ${isSearching ? 'border-brand-300 shadow-sm shadow-brand-100' : 'border-slate-200'}`}>
        <Search size={18} className={`${isSearching ? 'text-brand-500 animate-pulse' : 'text-slate-400'} mr-3 transition-colors`} />
        <span className="text-slate-500 font-medium">
          {searchTerm}
          <span className="animate-pulse inline-block w-0.5 h-4 ml-0.5 align-middle bg-slate-400"></span>
        </span>
        <div className="ml-auto flex items-center gap-1.5 opacity-70">
          <MapPin size={14} className="text-slate-400" />
          <span className="text-slate-400 text-sm">Jakarta</span>
        </div>
      </div>

      {/* Platform tags */}
      <div className={`flex gap-2 mb-4 transition-opacity duration-300 ${searchTerm.length > 0 ? 'opacity-100' : 'opacity-40'}`}>
        <span className="px-2.5 py-1 bg-[#0A66C2]/10 text-[#0A66C2] rounded-lg text-xs font-bold flex items-center gap-1.5">
          <CheckCircle2 size={12} /> LinkedIn
        </span>
        <span className="px-2.5 py-1 bg-[#1D2B7B]/10 text-[#1D2B7B] rounded-lg text-xs font-bold flex items-center gap-1.5">
          <CheckCircle2 size={12} /> JobStreet
        </span>
      </div>

      {/* Loading Overlay or Results Container */}
      <div className="relative min-h-[180px]">
        {/* Loading Spinner */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isSearching ? 'opacity-100 z-10' : 'opacity-0 -z-10'}`}>
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-brand-500 animate-spin"></div>
        </div>

        {/* Job results */}
        <div className="space-y-2.5 relative z-0">
          {jobs.map((job, i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-white transition-all duration-500 transform ${i < resultsShown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
              <div>
                <div className="font-bold text-sm text-slate-800">{job.title}</div>
                <div className="text-xs text-slate-500">{job.company} · {job.loc}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${job.src === 'LinkedIn' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>{job.src}</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{job.match}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`mt-3 text-center text-xs font-bold text-brand-600 transition-opacity duration-500 ${resultsShown === 3 ? 'opacity-100' : 'opacity-0'}`}>
        147 lowongan ditemukan dalam 0.5 detik
      </div>
    </div>
  );
};

// ─── ANIMATED COVER LETTER MOCKUP ─────────────────────────────────────────────

const AnimatedCoverLetterMockup = () => {
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const fullText = `Dear Hiring Manager,

I am writing to express my strong interest in the Software Engineer position at your company. With over 3 years of experience in React and TypeScript, I have successfully built scalable frontend applications that improved user engagement by 40%.

I am particularly drawn to your team's innovative approach to building AI-driven products, and I would be thrilled to bring my technical expertise to help scale your platform.

Thank you for your time and consideration.

Best regards,
Applicant`;

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const animate = async () => {
      // 1. Reset state
      setText('');
      setIsGenerating(true);
      setIsDone(false);

      // 2. Wait before starting
      await new Promise(r => setTimeout(r, 1000));

      // 3. Type text very fast (like an AI)
      for (let i = 0; i <= fullText.length; i += 2) {
        setText(fullText.substring(0, i));
        await new Promise(r => setTimeout(r, Math.random() * 15 + 5));
      }

      // Ensure exact full text is set at the end
      setText(fullText);

      // 4. Finish generation
      await new Promise(r => setTimeout(r, 400));
      setIsGenerating(false);
      setIsDone(true);

      // 5. Restart loop after reading time
      timeout = setTimeout(animate, 5000);
    };

    animate();

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg relative flex flex-col h-[340px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 shrink-0 transition-all">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-500 ${isGenerating ? 'bg-brand-600 shadow-md shadow-brand-200' : 'bg-brand-100'}`}>
          <Bot size={16} className={`transition-colors duration-500 ${isGenerating ? 'text-white animate-pulse' : 'text-brand-600'}`} />
        </div>
        <span className="text-sm font-bold text-slate-700">AI Cover Letter Generator</span>
        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 transition-colors duration-500 ${isGenerating ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
          {isGenerating ? (
            <><div className="w-2.5 h-2.5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div> Generating...</>
          ) : (
            <><Sparkles size={10} /> Generated in 60s</>
          )}
        </span>
      </div>

      {/* Editor Area */}
      <div className={`bg-slate-50 rounded-xl p-4 border flex-1 overflow-hidden relative transition-colors duration-500 ${isGenerating ? 'border-brand-200 shadow-inner' : 'border-slate-100'}`}>
        <div className="text-[11px] leading-relaxed text-slate-700 font-medium whitespace-pre-wrap">
          {text}
          {isGenerating && <span className="inline-block w-1.5 h-3 ml-0.5 align-middle bg-brand-500 animate-pulse"></span>}
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`flex gap-2 mt-4 shrink-0 transition-all duration-500 ${isDone ? 'opacity-100 translate-y-0' : 'opacity-40 pointer-events-none translate-y-1'}`}>
        <button className="flex-1 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-brand-700 transition-colors shadow-sm">
          <FileText size={12} /> Copy Text
        </button>
        <button className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors border border-slate-200 shadow-sm">
          Download .doc
        </button>
      </div>
    </div>
  );
};

// ─── ANIMATED CV BUILDER MOCKUP ───────────────────────────────────────────────

const AnimatedCVBuilderMockup = () => {
  // Ordered list of sections
  const [sections, setSections] = useState(['Profil', 'Pengalaman', 'Pendidikan', 'Skills']);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const animate = async () => {
      // 1. Reset
      setSections(['Profil', 'Pengalaman', 'Pendidikan', 'Skills']);
      setDragIndex(null);

      // 2. Wait
      await new Promise(r => setTimeout(r, 1500));

      // 3. Highlight "Pendidikan" (index 2)
      setDragIndex(2);
      await new Promise(r => setTimeout(r, 600));

      // 4. Move "Pendidikan" up to index 1 (above Pengalaman)
      setSections(['Profil', 'Pendidikan', 'Pengalaman', 'Skills']);
      await new Promise(r => setTimeout(r, 800));

      // 5. Release
      setDragIndex(null);

      // 6. Wait
      await new Promise(r => setTimeout(r, 2000));

      // 7. Restart loop
      timeout = setTimeout(animate, 1000);
    };

    animate();

    return () => clearTimeout(timeout);
  }, []);

  // Map section name to its visual representation in the CV preview
  const renderCvSection = (section: string) => {
    switch (section) {
      case 'Profil': return (
        <div key="profil" className="mb-4 transition-transform duration-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-lg">AJ</div>
            <div>
              <div className="text-sm font-[900] text-slate-800 tracking-tight leading-tight">Andi Jayanto</div>
              <div className="text-[10px] font-semibold text-brand-600">Software Engineer</div>
            </div>
          </div>
          <div className="text-[9px] text-slate-500 leading-relaxed font-medium">
            Passionate Software Engineer with 3+ years of experience building scalable web applications using React and Node.js. Proven ability to optimize application performance and lead cross-functional teams.
          </div>
        </div>
      );
      case 'Pengalaman': return (
        <div key="peng" className="mb-4 transition-transform duration-500">
          <div className="text-[10px] font-bold text-brand-700 uppercase tracking-wider mb-1.5 border-b border-slate-100 pb-0.5">Pengalaman Kerja</div>
          <div>
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-bold text-slate-800">Frontend Developer</span>
              <span className="text-[8px] text-slate-400 font-medium">Jan 2021 - Present</span>
            </div>
            <div className="text-[9px] font-semibold text-slate-500 mb-1">Tech Solutions Inc.</div>
            <ul className="text-[9px] text-slate-500 list-disc pl-3 space-y-0.5 mt-1 opacity-90">
              <li>Developed responsive React components for core web application.</li>
              <li>Improved page load speed by 35% using lazy loading.</li>
            </ul>
          </div>
        </div>
      );
      case 'Pendidikan': return (
        <div key="pend" className="mb-4 transition-transform duration-500">
          <div className="text-[10px] font-bold text-brand-700 uppercase tracking-wider mb-1.5 border-b border-slate-100 pb-0.5">Pendidikan</div>
          <div>
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-bold text-slate-800">S1 Ilmu Komputer</span>
              <span className="text-[8px] text-slate-400 font-medium">Sep 2017 - Aug 2021</span>
            </div>
            <div className="text-[9px] font-semibold text-slate-500">Universitas Indonesia</div>
            <div className="text-[9px] text-slate-500 mt-0.5">IPK: 3.85 / 4.00</div>
          </div>
        </div>
      );
      case 'Skills': return (
        <div key="skills" className="mb-4 transition-transform duration-500">
          <div className="text-[10px] font-bold text-brand-700 uppercase tracking-wider mb-1.5 border-b border-slate-100 pb-0.5">Keahlian (Skills)</div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Next.js', 'PostgreSQL'].map(skill => (
              <span key={skill} className="text-[8px] font-semibold bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                {skill}
              </span>
            ))}
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg h-[300px]">
      <div className="flex gap-3 h-full">
        {/* CV Preview */}
        <div className="flex-1 border border-slate-200 rounded-xl p-4 bg-white relative overflow-hidden">
          <div className="absolute inset-x-4 top-4 bottom-4 transition-all duration-500 flex flex-col">
            {sections.map(s => renderCvSection(s))}
          </div>
        </div>

        {/* Sections Panel */}
        <div className="w-28 flex flex-col gap-2 relative">
          {sections.map((s, i) => {
            const isDragging = dragIndex !== null && sections[dragIndex] === s;
            return (
              <div
                key={s}
                className={`p-2 rounded-lg border text-[10px] font-bold text-center transition-all duration-500 z-10 ${isDragging
                  ? 'border-brand-400 bg-brand-50 text-brand-700 shadow-md scale-105 z-20 cursor-grabbing'
                  : i === 0
                    ? 'border-brand-200 bg-brand-50/50 text-brand-700 cursor-grab'
                    : 'border-slate-200 bg-white text-slate-600 cursor-grab hover:border-slate-300'
                  }`}
              >
                {s}
              </div>
            );
          })}
          <div className="text-[10px] text-center text-slate-400 font-bold mt-auto pb-1">↕ Drag to reorder</div>
        </div>
      </div>
    </div>
  );
};

// ─── ANIMATED TRACKER MOCKUP ──────────────────────────────────────────────────

const AnimatedTrackerMockup = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showNewCard, setShowNewCard] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const animate = async () => {
      // 1. Reset
      setIsSaving(false);
      setIsSaved(false);
      setShowNewCard(false);

      // 2. Wait
      await new Promise(r => setTimeout(r, 1000));

      // 3. Show saving toast
      setIsSaving(true);
      await new Promise(r => setTimeout(r, 1500));

      // 4. Show saved toast
      setIsSaving(false);
      setIsSaved(true);
      await new Promise(r => setTimeout(r, 800));

      // 5. Hide toast, show card in board
      setIsSaved(false);
      setShowNewCard(true);

      // 6. Wait before restart
      await new Promise(r => setTimeout(r, 3000));

      timeout = setTimeout(animate, 500);
    };

    animate();

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg relative h-[250px] overflow-hidden">

      {/* Toast Notification for Notion Save */}
      <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-800 text-white px-3 py-2 rounded-xl text-[10px] font-bold shadow-xl transition-all duration-500 transform ${isSaving || isSaved ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'
        }`}>
        {isSaving ? (
          <>
            <div className="w-3 h-3 rounded-full border-2 border-slate-400 border-t-white animate-spin"></div>
            Saving to Notion...
          </>
        ) : (
          <>
            <CheckCircle2 size={12} className="text-emerald-400" />
            Saved to Notion!
          </>
        )}
      </div>

      <div className="flex gap-2.5 overflow-x-hidden h-full">
        {/* Column 1: Plan */}
        <div className="min-w-[110px] flex-1">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2 h-2 rounded-full bg-slate-500"></div>
            <span className="text-xs font-bold text-slate-700">Plan</span>
            <span className={`text-[10px] text-slate-400 font-bold ml-auto transition-colors duration-300 ${showNewCard ? 'bg-emerald-100 text-emerald-700 px-1 rounded' : ''}`}>
              {showNewCard ? '3' : '2'}
            </span>
          </div>
          <div className="space-y-1.5 relative">
            {/* New Animated Card */}
            <div className={`p-2 rounded-lg border bg-emerald-50/50 border-emerald-200 shadow-sm transition-all duration-700 transform ${showNewCard ? 'opacity-100 translate-y-0 h-auto mb-1.5' : 'opacity-0 -translate-y-4 h-0 mb-0 overflow-hidden border-none p-0'
              }`}>
              <div className="text-[11px] font-bold text-slate-800 truncate">Data Scientist</div>
              <div className="text-[10px] text-slate-500">GoTo Group</div>
            </div>

            {/* Existing Cards */}
            <div className="p-2 rounded-lg border border-slate-100 bg-slate-50/50 transition-transform duration-500">
              <div className="text-[11px] font-bold text-slate-800 truncate">UI Designer</div>
              <div className="text-[10px] text-slate-400">Shopee</div>
            </div>
            <div className="p-2 rounded-lg border border-slate-100 bg-slate-50/50 transition-transform duration-500">
              <div className="text-[11px] font-bold text-slate-800 truncate">PM</div>
              <div className="text-[10px] text-slate-400">Gojek</div>
            </div>
          </div>
        </div>

        {/* Column 2: Applied */}
        <div className="min-w-[110px] flex-1 opacity-70">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-xs font-bold text-slate-700">Applied</span>
            <span className="text-[10px] text-slate-400 font-bold ml-auto">1</span>
          </div>
          <div className="space-y-1.5">
            <div className="p-2 rounded-lg border border-slate-100 bg-slate-50/50">
              <div className="text-[11px] font-bold text-slate-800 truncate">Frontend Dev</div>
              <div className="text-[10px] text-slate-400">Tokopedia</div>
            </div>
          </div>
        </div>

        {/* Column 3: Interview */}
        <div className="min-w-[110px] flex-1 opacity-40">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="text-xs font-bold text-slate-700">Interview</span>
            <span className="text-[10px] text-slate-400 font-bold ml-auto">1</span>
          </div>
          <div className="space-y-1.5">
            <div className="p-2 rounded-lg border border-slate-100 bg-slate-50/50">
              <div className="text-[11px] font-bold text-slate-800 truncate">React Dev</div>
              <div className="text-[10px] text-slate-400">Traveloka</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ANIMATED SALARY MOCKUP ───────────────────────────────────────────────────

const AnimatedSalaryMockup = () => {
  const [phase, setPhase] = useState<'upload' | 'scanning' | 'result'>('upload');
  const [bars, setBars] = useState<number[]>([10, 10, 10, 10, 10, 10, 10, 10]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const animate = async () => {
      // 1. Upload
      setPhase('upload');
      setBars([10, 10, 10, 10, 10, 10, 10, 10]);
      await new Promise(r => setTimeout(r, 1500));

      // 2. Scanning CV
      setPhase('scanning');
      await new Promise(r => setTimeout(r, 2500));

      // 3. Result
      setPhase('result');
      // Animate bars up
      await new Promise(r => setTimeout(r, 100));
      setBars([30, 45, 65, 85, 95, 80, 60, 40]);

      // 4. Wait to read
      await new Promise(r => setTimeout(r, 4000));

      timeout = setTimeout(animate, 500);
    };

    animate();

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg h-[280px] relative overflow-hidden flex flex-col justify-center">

      {/* Upload & Scanning Phases */}
      <div className={`absolute inset-0 bg-white z-10 flex flex-col items-center justify-center transition-all duration-700 p-6 ${phase !== 'result' ? 'opacity-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 relative ${phase === 'scanning' ? 'bg-brand-50 border-2 border-brand-200 shadow-lg shadow-brand-100' : 'bg-slate-50 border-2 border-dashed border-slate-300'}`}>
          <FileText size={24} className={phase === 'scanning' ? 'text-brand-600' : 'text-slate-400'} />

          {/* Scanner Line */}
          {phase === 'scanning' && (
            <div className="absolute inset-x-0 h-0.5 bg-brand-500 shadow-[0_0_8px_rgba(14,116,144,0.6)] rounded-full z-20 animate-[scan_1.5s_ease-in-out_infinite]"></div>
          )}
        </div>

        <div className="text-sm font-bold text-slate-700 text-center mb-1">
          {phase === 'upload' ? 'Upload CV' : 'AI Analyzing Experience...'}
        </div>
        <div className="text-xs text-slate-400 text-center">
          {phase === 'upload' ? 'Drop PDF here to check salary' : 'Extracting skills, role, and tenure'}
        </div>
      </div>

      {/* Result Phase */}
      <div className={`transition-all duration-700 transform ${phase === 'result' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-bold text-slate-700">Software Engineer</div>
          <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded flex items-center gap-1">
            <Bot size={10} /> AI Predicted
          </span>
        </div>

        <div className="flex items-end gap-1 h-24 mb-3">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full rounded-t-md transition-all duration-1000 ease-out ${i === 4 ? 'bg-brand-500 shadow-md shadow-brand-200' : i === 3 || i === 5 ? 'bg-brand-300' : 'bg-slate-200'}`}
                style={{ height: `${h}%` }}
              ></div>
            </div>
          ))}
        </div>

        <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-4 px-1">
          <span>Rp 5jt</span>
          <span>Rp 10jt</span>
          <span>Rp 15jt</span>
          <span>Rp 20jt</span>
          <span>Rp 25jt+</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-brand-50 rounded-xl border border-brand-100 shadow-inner">
          <div>
            <div className="text-[10px] text-brand-600/80 font-bold uppercase tracking-wider mb-0.5">Estimasi Gaji Kamu</div>
            <div className="text-xl font-[900] text-brand-700">Rp 15.000.000 <span className="text-xs font-bold text-slate-400">/ bulan</span></div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white border border-brand-100 flex items-center justify-center">
            <Sparkles size={14} className="text-amber-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ANIMATED CHAT MOCKUP ─────────────────────────────────────────────────────

const AnimatedChatMockup = () => {
  const [phase, setPhase] = useState<'typing' | 'sent' | 'thinking' | 'replying' | 'done'>('typing');
  const [userText, setUserText] = useState('');
  const [aiText, setAiText] = useState('');

  const fullUserText = 'Kapan CPNS 2026 dibuka?';
  const fullAiText = 'Berdasarkan data terbaru, pendaftaran CPNS 2026 direncanakan dibuka pada Mei 2026. Formasi terbanyak untuk bidang Teknis dan Kesehatan.';

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const animate = async () => {
      // 1. Reset
      setPhase('typing');
      setUserText('');
      setAiText('');

      await new Promise(r => setTimeout(r, 1000));

      // 2. User Typing (Much slower, realistic typing speed)
      for (let i = 0; i <= fullUserText.length; i++) {
        setUserText(fullUserText.substring(0, i));
        // Random delay between 80ms and 200ms per character
        await new Promise(r => setTimeout(r, Math.random() * 120 + 80));
      }

      // Small pause before sending
      await new Promise(r => setTimeout(r, 600));

      // 3. Sent & AI Thinking (Longer thinking time)
      setPhase('thinking');
      await new Promise(r => setTimeout(r, 2000));

      // 4. Replying (Smoother, 1 char at a time, moderate speed)
      setPhase('replying');
      for (let i = 0; i <= fullAiText.length; i++) {
        setAiText(fullAiText.substring(0, i));
        // Random delay between 20ms and 50ms per character (AI types fast but smoothly)
        await new Promise(r => setTimeout(r, Math.random() * 30 + 20));
      }
      setAiText(fullAiText); // ensure complete

      // 5. Done (Show Suggestions)
      setPhase('done');

      // Wait a long time so user can read before restarting
      await new Promise(r => setTimeout(r, 8000));
      timeout = setTimeout(animate, 1000);
    };

    animate();

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg h-[260px] flex flex-col justify-end relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute inset-0 bg-slate-50/50 -z-10"></div>

      <div className="space-y-4 flex flex-col justify-end h-full">

        {/* User Message */}
        <div className={`flex justify-end transition-all duration-500 transform ${userText.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="bg-brand-600 text-white px-4 py-2.5 rounded-2xl rounded-br-md text-sm max-w-[200px] shadow-sm">
            {userText}
            {phase === 'typing' && <span className="inline-block w-1 h-3.5 bg-white/70 ml-0.5 animate-pulse align-middle"></span>}
          </div>
        </div>

        {/* AI Response */}
        <div className={`flex gap-3 transition-all duration-500 transform ${phase !== 'typing' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="w-8 h-8 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center shrink-0 mt-1 shadow-sm">
            <Bot size={16} className="text-brand-600" />
          </div>

          <div className="bg-white border border-slate-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-md text-sm text-slate-700 max-w-[240px]">
            {phase === 'thinking' ? (
              <div className="flex gap-1 h-4 items-center px-1">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
              </div>
            ) : (
              <p className="leading-relaxed">
                {aiText}
                {phase === 'replying' && <span className="inline-block w-1.5 h-3 ml-1 bg-brand-500 animate-pulse align-middle"></span>}
              </p>
            )}
          </div>
        </div>

        {/* Suggestions */}
        <div className={`flex flex-wrap gap-1.5 pl-11 transition-all duration-500 transform ${phase === 'done' ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 pointer-events-none'}`}>
          {['Tips SKD', 'Formasi populer', 'Batas usia'].map((s) => (
            <button key={s} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 transition-all shadow-sm">
              {s}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};

// ─── ANIMATED SCANNER MOCKUP ──────────────────────────────────────────────────

const AnimatedScannerMockup = () => {
  const [phase, setPhase] = useState<'scanning' | 'score' | 'issues'>('scanning');
  const [score, setScore] = useState(0);
  const [visibleIssues, setVisibleIssues] = useState(0);

  const targetScore = 72;
  const issues = [
    { icon: <AlertTriangle size={14} className="text-red-500" />, text: 'Missing keywords: "project management"', severity: 'Critical' },
    { icon: <AlertTriangle size={14} className="text-amber-500" />, text: 'Phone number format incorrect', severity: 'Warning' },
    { icon: <Lightbulb size={14} className="text-blue-500" />, text: 'Add metrics to work experience', severity: 'Tip' },
  ];

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const animate = async () => {
      // 1. Reset
      setPhase('scanning');
      setScore(0);
      setVisibleIssues(0);

      await new Promise(r => setTimeout(r, 1500)); // Scan duration

      // 2. Reveal Score
      setPhase('score');

      // Animate score counter
      for (let i = 0; i <= targetScore; i += 4) {
        setScore(Math.min(i, targetScore));
        await new Promise(r => setTimeout(r, 20));
      }
      setScore(targetScore);

      await new Promise(r => setTimeout(r, 800));

      // 3. Reveal Issues
      setPhase('issues');
      for (let i = 1; i <= issues.length; i++) {
        setVisibleIssues(i);
        await new Promise(r => setTimeout(r, 500));
      }

      // Wait before restart
      await new Promise(r => setTimeout(r, 4000));
      timeout = setTimeout(animate, 500);
    };

    animate();

    return () => clearTimeout(timeout);
  }, []);

  // Calculate circle stroke
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg h-[280px] relative overflow-hidden flex flex-col justify-center">

      {/* Scanning Phase Overlay */}
      <div className={`absolute inset-0 bg-slate-50 z-10 flex flex-col items-center justify-center transition-all duration-700 p-6 ${phase === 'scanning' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-16 h-16 rounded-2xl bg-white border-2 border-brand-200 shadow-lg shadow-brand-100 flex items-center justify-center mb-4 relative overflow-hidden">
          <FileText size={24} className="text-brand-600" />
          <div className="absolute inset-x-0 h-0.5 bg-brand-500 shadow-[0_0_8px_rgba(14,116,144,0.6)] rounded-full z-20 animate-[scan_1.2s_ease-in-out_infinite]"></div>
        </div>
        <div className="text-sm font-bold text-slate-700 text-center mb-1 animate-pulse">
          Scanning CV Structure...
        </div>
        <div className="text-xs text-slate-400 text-center">
          Checking ATS compatibility
        </div>
      </div>

      <div className={`transition-all duration-700 ${phase !== 'scanning' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <svg className="w-20 h-20 transform -rotate-90 transition-all duration-1000">
              <circle cx="40" cy="40" r="32" stroke="#f1f5f9" strokeWidth="7" fill="transparent" />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#f97316"
                strokeWidth="7"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xl font-[900] text-slate-800">
              {score}
            </div>
          </div>
          <div>
            <div className="font-bold text-slate-800">ATS Score</div>
            <div className={`text-sm font-bold px-2 py-0.5 rounded-full inline-block transition-all duration-500 ${score > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
              {score > 0 ? 'Perlu Perbaikan' : 'Calculating...'}
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {issues.map((issue, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 transition-all duration-500 transform ${i < visibleIssues ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
            >
              <div className="mt-0.5 shrink-0">{issue.icon}</div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-slate-700">{issue.text}</div>
              </div>
              <button className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded shrink-0 hover:bg-brand-100 transition-colors">Auto-Fix</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── FEATURE DATA ───────────────────────────────────────────────────────────────

const features = [
  {
    id: 'search',
    badge: 'Core Feature',
    title: 'Cari lowongan di LinkedIn & JobStreet sekaligus.',
    description: 'Satu search bar, dua platform. Hemat waktu, temukan lowongan lebih cepat.',
    reversed: false,
    mockup: <AnimatedSearchMockup />
  },
  {
    id: 'matching',
    badge: 'AI-Powered',
    title: 'AI menganalisis CV kamu dan memberikan match score.',
    description: 'Lihat persis kenapa kamu cocok — atau apa yang kurang — untuk setiap lowongan.',
    reversed: true,
    mockup: (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm font-bold text-slate-500">Match Score</div>
            <div className="text-5xl font-[900] text-emerald-600 tracking-tight">92%</div>
            <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">Excellent Match</div>
          </div>
          <div className="w-20 h-20 rounded-full border-[6px] border-emerald-500 border-t-emerald-100 flex items-center justify-center">
            <Star size={24} className="text-emerald-500 fill-emerald-500" />
          </div>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Skills Match', value: 90, color: 'bg-blue-500' },
            { label: 'Experience', value: 85, color: 'bg-brand-400' },
            { label: 'Education', value: 95, color: 'bg-emerald-500' },
          ].map((bar, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                <span>{bar.label}</span>
                <span>{bar.value}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${bar.color} rounded-full transition-all`} style={{ width: `${bar.value}%` }}></div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex flex-wrap gap-1.5">
            {['React', 'TypeScript', 'Node.js', 'SQL'].map((s) => (
              <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 size={10} /> {s}
              </span>
            ))}
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-bold">+ Docker (missing)</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'scanner',
    badge: 'ATS Ready',
    title: 'Cek ATS score CV kamu sebelum apply.',
    description: 'Scanner otomatis menemukan masalah format, keyword, dan struktur yang membuat CV kamu ditolak ATS.',
    reversed: false,
    mockup: <AnimatedScannerMockup />
  },
  {
    id: 'cover-letter',
    badge: '60 Detik',
    title: 'AI generate cover letter profesional.',
    description: 'Disesuaikan dengan job description dan pengalamanmu. Copy, edit, apply.',
    reversed: true,
    mockup: <AnimatedCoverLetterMockup />
  },
  {
    id: 'cv-builder',
    badge: 'Premium',
    title: 'Bangun CV yang lolos ATS.',
    description: 'Template profesional dengan panduan AI. Setiap section dioptimasi agar terdeteksi sempurna oleh sistem ATS.',
    reversed: false,
    mockup: <AnimatedCVBuilderMockup />
  },
  {
    id: 'tracker',
    badge: 'Organizer',
    title: 'Track semua lamaran di satu tempat.',
    description: 'Kanban board atau table view. Pindahkan status: Plan → Applied → Interview → Offer.',
    reversed: true,
    mockup: <AnimatedTrackerMockup />
  },
  {
    id: 'salary',
    badge: 'AI Salary Check',
    title: 'AI bantu prediksi gajimu dari CV.',
    description: 'Upload CV, AI akan menganalisis skill dan pengalamanmu untuk memberikan estimasi gaji yang pantas di pasaran.',
    reversed: false,
    mockup: <AnimatedSalaryMockup />
  },
  {
    id: 'cpns',
    badge: 'Indonesia',
    title: 'Info CPNS & BUMN terkini.',
    description: 'Jadwal pendaftaran, tips seleksi, dan informasi rekrutmen pemerintah terbaru.',
    reversed: true,
    mockup: (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg">
        <div className="space-y-3">
          {[
            { title: 'CPNS 2026', status: 'Segera Dibuka', date: 'Mei 2026', color: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-700' },
            { title: 'Rekrutmen BUMN', status: 'Pendaftaran Dibuka', date: 'Mar 2026', color: 'bg-blue-500', light: 'bg-blue-50 text-blue-700' },
            { title: 'PPPK Guru', status: 'Seleksi Tahap 2', date: 'Apr 2026', color: 'bg-amber-500', light: 'bg-amber-50 text-amber-700' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
              <div className={`w-2 h-10 rounded-full ${item.color}`}></div>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-800">{item.title}</div>
                <div className="text-xs text-slate-400">{item.date}</div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.light}`}>{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'ai-chat',
    badge: 'AI Assistant',
    title: 'Tanya apa saja soal karir.',
    description: 'Chat AI yang tahu info lowongan, CPNS, tips wawancara, dan strategi karir.',
    reversed: false,
    mockup: <AnimatedChatMockup />
  }
];

// ─── SCROLL REVEAL HOOK ─────────────────────────────────────────────────────────

const useScrollReveal = (threshold = 0.15) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { setIsVisible(entry.isIntersecting); },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
};

// ─── FEATURE ROW COMPONENT ──────────────────────────────────────────────────────

const FeatureRow: React.FC<{ feature: typeof features[0]; index: number }> = ({ feature, index }) => {
  const { ref, isVisible } = useScrollReveal(0.12);

  return (
    <div
      ref={ref}
      className={`py-16 lg:py-24 ${index % 2 === 1 ? 'bg-slate-50' : 'bg-white'}`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className={`flex flex-col ${feature.reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}>
          {/* Text Side */}
          <div
            className={`flex-1 max-w-lg transition-all duration-700 ease-out ${isVisible
              ? 'opacity-100 translate-x-0'
              : feature.reversed ? 'opacity-0 translate-x-12' : 'opacity-0 -translate-x-12'
              }`}
          >
            <div className="inline-block px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-xs font-bold tracking-wide uppercase mb-6">
              {feature.badge}
            </div>
            <h3 className="text-3xl lg:text-[40px] font-[900] text-slate-900 leading-[1.15] tracking-tight mb-4">
              {feature.title}
            </h3>
            <p className="text-lg text-slate-500 leading-relaxed">
              {feature.description}
            </p>
          </div>

          {/* Mockup Side */}
          <div
            className={`flex-1 w-full max-w-md transition-all duration-700 ease-out delay-200 ${isVisible
              ? 'opacity-100 translate-x-0 translate-y-0'
              : feature.reversed ? 'opacity-0 -translate-x-12' : 'opacity-0 translate-x-12'
              }`}
          >
            <div className={`transition-transform duration-500 ${isVisible ? 'scale-100' : 'scale-95'
              }`}>
              {feature.mockup}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────

export const Features: React.FC = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { setHeaderVisible(entry.isIntersecting); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 lg:py-32" id="fitur">
      {/* Section Header */}
      <div
        ref={headerRef}
        className={`max-w-4xl mx-auto px-6 text-center mb-20 lg:mb-28 transition-all duration-700 ease-out ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
      >
        <div className="text-brand-600 font-bold text-sm tracking-widest uppercase mb-4">Fitur Lengkap</div>
        <h2 className="text-4xl lg:text-[56px] font-[900] text-slate-900 leading-[1.1] tracking-tight mb-6">
          Semua yang kamu butuhkan,
          <br />
          <span className="text-brand-600">dalam satu aplikasi.</span>
        </h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Dari mencari lowongan hingga mendapat offer — Jobs Agent mendampingi setiap langkah karirmu.
        </p>
      </div>

      {/* Feature Sections */}
      <div className="space-y-0">
        {features.map((feature, index) => (
          <FeatureRow key={feature.id} feature={feature} index={index} />
        ))}
      </div>
    </section>
  );
};