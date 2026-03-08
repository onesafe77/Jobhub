import React, { useState, useEffect } from 'react';
import {
    FileText, Sparkles, Download, Plus, Trash2,
    User, Briefcase, GraduationCap, Star,
    ChevronRight, Save, Loader2, CheckCircle2,
    Layout, Wand2, MapPin, Mail, Phone, Camera, X, ArrowLeft
} from 'lucide-react';
import { UserProfile, optimizeCVSection, saveProfile } from '../lib/openai';

interface CVBuilderProps {
    initialProfile: UserProfile | null;
    onUpdate: (profile: UserProfile) => void;
    onBack?: () => void;
}

export const CVBuilder: React.FC<CVBuilderProps> = ({ initialProfile, onUpdate, onBack }) => {
    const defaultProfile: UserProfile = {
        name: '',
        email: '',
        phone: '',
        location: '',
        photo: '',
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
    };

    const [profile, setProfile] = useState<UserProfile>({
        ...defaultProfile,
        ...(initialProfile || {})
    });

    const [selectedTemplate, setSelectedTemplate] = useState<'minimalist' | 'modern' | 'executive'>('minimalist');
    const [isOptimizing, setIsOptimizing] = useState<Record<string, boolean>>({});
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    // Sync state if initialProfile changes
    useEffect(() => {
        if (initialProfile) setProfile(prev => ({ ...prev, ...initialProfile }));
    }, [initialProfile]);

    const handleUpdateField = (field: keyof UserProfile, value: any) => {
        const updated = { ...profile, [field]: value };
        setProfile(updated);
        setSaveStatus('idle');
    };

    const handleOptimize = async (field: 'experience_summary' | 'education' | 'skills', sectionType: 'summary' | 'experience' | 'skills') => {
        const content = field === 'skills' ? profile.skills.join(', ') : profile[field].toString();
        if (!content.trim()) return;

        setIsOptimizing(prev => ({ ...prev, [field]: true }));
        try {
            const optimized = await optimizeCVSection(content, sectionType);
            if (field === 'skills') {
                handleUpdateField('skills', optimized.split(',').map(s => s.trim()));
            } else {
                handleUpdateField(field, optimized);
            }
        } catch (err) {
            console.error('Optimization failed:', err);
        } finally {
            setIsOptimizing(prev => ({ ...prev, [field]: false }));
        }
    };

    const handleSave = () => {
        setSaveStatus('saving');
        saveProfile(profile);
        onUpdate(profile);
        setTimeout(() => setSaveStatus('saved'), 600);
        setTimeout(() => setSaveStatus('idle'), 3000);
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleUpdateField('photo', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // STRUCTURED SECTION HANDLERS
    const handleArrayUpdate = (field: 'work_experience' | 'education_list' | 'references', index: number, value: any) => {
        const newList = [...(profile[field] as any[])];
        newList[index] = { ...newList[index], ...value };
        handleUpdateField(field, newList);
    };

    const handleArrayAdd = (field: 'work_experience' | 'education_list' | 'references') => {
        const defaults = {
            work_experience: { role: '', company: '', period: '', description: '' },
            education_list: { degree: '', school: '', year: '', description: '' },
            references: { name: '', position: '', company: '', contact: '' }
        };
        const newList = [...(profile[field] as any[]), defaults[field]];
        handleUpdateField(field, newList);
    };

    const handleArrayRemove = (field: 'work_experience' | 'education_list' | 'references', index: number) => {
        const newList = [...(profile[field] as any[])].filter((_, i) => i !== index);
        handleUpdateField(field, newList);
    };

    const getTemplateHtml = (template: string) => {
        const wrap = (html: string) => `<div style="font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.5; word-wrap: break-word; hyphens: auto;">${html}</div>`;

        if (template === 'minimalist') {
            return wrap(`
                <div style="color: #000;">
                  <div style="margin-bottom: 30px;">
                    <h1 style="margin: 0; font-size: 26pt; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; line-height: 1;">${profile.name || 'NAMA LENGKAP'}</h1>
                    <h2 style="margin: 8px 0; font-size: 13pt; font-weight: 700; text-transform: uppercase; color: #475569; letter-spacing: 2px;">${profile.preferred_roles[0] || 'PROFESSIONAL'}</h2>
                    <div style="margin-top: 15px; font-size: 9pt; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                      ${profile.location} &nbsp;&bull;&nbsp; ${profile.email} &nbsp;&bull;&nbsp; ${profile.phone}
                    </div>
                    <div style="border-top: 3px solid #000; margin-top: 15px;"></div>
                  </div>

                  <div style="margin-bottom: 25px;">
                    <h3 style="font-size: 11pt; font-weight: 800; text-transform: uppercase; border-bottom: 1.5px solid #000; padding-bottom: 4px; margin-bottom: 12px; letter-spacing: 1.5px;">Summary</h3>
                    <p style="font-size: 10pt; margin: 0; text-align: justify; color: #334155;">${profile.experience_summary}</p>
                  </div>

                  <div style="margin-bottom: 25px;">
                    <h3 style="font-size: 11pt; font-weight: 800; text-transform: uppercase; border-bottom: 1.5px solid #000; padding-bottom: 4px; margin-bottom: 15px; letter-spacing: 1.5px;">Professional Experience</h3>
                    ${profile.work_experience.map(exp => `
                        <div style="margin-bottom: 20px;">
                          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                            <span style="font-size: 11pt; font-weight: 800; color: #000;">${exp.role}</span>
                            <span style="font-size: 9pt; font-weight: 700; color: #64748b;">${exp.period}</span>
                          </div>
                          <div style="font-size: 10pt; font-weight: 700; color: #94a3b8; font-style: italic; margin-bottom: 8px;">${exp.company}</div>
                          <ul style="font-size: 10pt; margin: 0; padding-left: 18px; color: #334155; line-height: 1.6;">
                            ${exp.description.split('\n').filter(l => l.trim()).map(line => `<li style="margin-bottom: 4px;">${line}</li>`).join('')}
                          </ul>
                        </div>
                    `).join('')}
                  </div>

                  <div style="margin-bottom: 25px;">
                    <h3 style="font-size: 11pt; font-weight: 800; text-transform: uppercase; border-bottom: 1.5px solid #000; padding-bottom: 4px; margin-bottom: 12px; letter-spacing: 1.5px;">Skills</h3>
                    <div style="display: table; width: 100%; font-size: 10pt; color: #334155;">
                       ${profile.skills.reduce((acc, s, i) => {
                if (i % 2 === 0) acc.push([s]);
                else acc[acc.length - 1].push(s);
                return acc;
            }, [] as string[][]).map(row => `
                           <div style="display: table-row;">
                             ${row.map(cell => `<div style="display: table-cell; width: 50%; padding-bottom: 6px;">&bull; ${cell}</div>`).join('')}
                           </div>
                       `).join('')}
                    </div>
                  </div>

                  <div style="margin-bottom: 25px;">
                    <h3 style="font-size: 11pt; font-weight: 800; text-transform: uppercase; border-bottom: 1.5px solid #000; padding-bottom: 4px; margin-bottom: 12px; letter-spacing: 1.5px;">Education</h3>
                    ${profile.education_list.map(edu => `
                        <div style="margin-bottom: 12px;">
                          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px;">
                            <span style="font-size: 10.5pt; font-weight: 800; color: #000; text-transform: uppercase;">${edu.degree}</span>
                            <span style="font-size: 9pt; font-weight: 700; color: #64748b;">${edu.year}</span>
                          </div>
                          <div style="font-size: 10pt; color: #475569; font-style: italic;">${edu.school}</div>
                          ${edu.description ? `<p style="font-size: 9.5pt; color: #64748b; margin-top: 4px;">${edu.description}</p>` : ''}
                        </div>
                    `).join('')}
                  </div>

                  ${profile.certifications.length > 0 ? `
                  <div style="margin-bottom: 20px;">
                    <h3 style="font-size: 11pt; font-weight: 800; text-transform: uppercase; border-bottom: 1.5px solid #000; padding-bottom: 4px; margin-bottom: 12px; letter-spacing: 1.5px;">Additional Info</h3>
                    <ul style="font-size: 10pt; margin: 0; padding-left: 18px; color: #334155;">
                      ${profile.certifications.map(c => `<li style="margin-bottom: 4px;">${c}</li>`).join('')}
                    </ul>
                  </div>
                  ` : ''}
                </div>
            `);
        }
        else if (template === 'modern') {
            return wrap(`
                <div style="color: #334155;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 40px; table-layout: fixed;">
                    <tr>
                      <td width="120" valign="top" style="padding-right: 30px;">
                        ${profile.photo ? `<img src="${profile.photo}" style="width: 120px; height: 120px; border-radius: 16px; object-fit: cover; border: 3px solid #C4A484; display: block;">` : ''}
                      </td>
                      <td valign="top">
                        <div style="margin-bottom: 20px;">
                          <h1 style="margin: 0; font-size: 32pt; line-height: 1; font-family: Georgia, serif; color: #0f172a;">
                            ${profile.name.split(' ')[0]} <span style="color: #C4A484;">${profile.name.split(' ').slice(1).join(' ')}</span>
                          </h1>
                        </div>
                        <div style="display: table; width: 100%;">
                           <div style="display: table-cell; background-color: #0f172a; color: #fff; padding: 10px 20px; font-size: 10.5pt; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; white-space: nowrap;">
                             ${profile.preferred_roles[0] || 'SENIOR PROFESSIONAL'}
                           </div>
                           <div style="display: table-cell; background-color: #C4A484; width: 100%;"></div>
                        </div>
                      </td>
                    </tr>
                  </table>
                  
                  <div style="background-color: #0f172a; color: #e2e8f0; padding: 12px 25px; font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 40px; border-radius: 4px;">
                     ${profile.phone} &nbsp;&bull;&nbsp; ${profile.email} &nbsp;&bull;&nbsp; ${profile.location}
                  </div>

                  <div style="margin-bottom: 40px;">
                    <p style="font-size: 10.5pt; color: #475569; line-height: 1.7; text-align: justify; font-weight: 500;">${profile.experience_summary}</p>
                  </div>

                  <div style="margin-bottom: 40px;">
                    <h3 style="color: #C4A484; font-size: 12pt; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 25px; font-weight: 900; letter-spacing: 2px;">Pengalaman Kerja</h3>
                    ${profile.work_experience.map(exp => `
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; table-layout: fixed;">
                           <tr>
                             <td width="30%" valign="top" style="padding-right: 25px;">
                               <div style="font-weight: 900; font-size: 11pt; color: #0f172a; line-height: 1.2; margin-bottom: 4px;">${exp.role}</div>
                               <div style="font-size: 9.5pt; font-weight: 700; color: #64748b; text-transform: uppercase;">${exp.company}</div>
                               <div style="font-size: 9.5pt; font-weight: 700; color: #C4A484; font-style: italic; margin-top: 4px;">${exp.period}</div>
                             </td>
                             <td width="70%" valign="top">
                               <ul style="margin: 0; padding-left: 20px; font-size: 10.5pt; color: #475569; line-height: 1.7;">
                                 ${exp.description.split('\n').filter(l => l.trim()).map(line => `<li style="margin-bottom: 6px;">${line}</li>`).join('')}
                               </ul>
                             </td>
                           </tr>
                        </table>
                    `).join('')}
                  </div>

                  <div style="margin-bottom: 40px;">
                    <h3 style="color: #C4A484; font-size: 12pt; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 25px; font-weight: 900; letter-spacing: 2px;">Pendidikan</h3>
                    ${profile.education_list.map(edu => `
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; table-layout: fixed;">
                           <tr>
                             <td width="30%" valign="top" style="padding-right: 25px;">
                               <div style="font-weight: 900; font-size: 11pt; color: #0f172a; margin-bottom: 4px;">${edu.degree}</div>
                               <div style="font-size: 9.5pt; font-weight: 700; color: #64748b; text-transform: uppercase;">${edu.school}</div>
                               <div style="font-size: 9.5pt; font-weight: 700; color: #C4A484; font-style: italic; margin-top: 4px;">${edu.year}</div>
                             </td>
                             <td width="70%" valign="top">
                               <p style="margin: 0; font-size: 10.5pt; color: #475569; line-height: 1.6; font-style: italic;">${edu.description || ''}</p>
                             </td>
                           </tr>
                        </table>
                    `).join('')}
                  </div>

                  <table width="100%" cellpadding="0" cellspacing="0" style="table-layout: fixed;">
                    <tr>
                      <td width="50%" valign="top" style="padding-right: 40px;">
                        <h3 style="color: #C4A484; font-size: 12pt; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 15px; font-weight: 900; letter-spacing: 2px;">Keahlian</h3>
                        <ul style="font-size: 10pt; color: #475569; padding-left: 20px; line-height: 2;">
                          ${profile.skills.map(s => `<li style="margin-bottom: 4px;"><b>${s}</b></li>`).join('')}
                        </ul>
                      </td>
                      <td width="50%" valign="top">
                        <h3 style="color: #C4A484; font-size: 12pt; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 15px; font-weight: 900; letter-spacing: 2px;">Sertifikasi</h3>
                        <ul style="font-size: 10pt; color: #475569; padding-left: 20px; line-height: 2;">
                          ${profile.certifications.length > 0 ? profile.certifications.map(c => `<li style="margin-bottom: 4px;"><b>${c}</b></li>`).join('') : '<li style="color: #94a3b8;">-</li>'}
                        </ul>
                      </td>
                    </tr>
                  </table>
                </div>
            `);
        }
        else {
            return wrap(`
                <div style="color: #1e293b; background-color: #ffffff;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 40px;">
                    <tr>
                      <td valign="top">
                        <h1 style="font-size: 32pt; color: #7c94b6; margin: 0 0 8px 0; font-weight: 600; letter-spacing: -1px; line-height: 1;">${profile.name}</h1>
                        <div style="font-size: 13pt; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 3px;">${profile.preferred_roles[0] || 'EXECUTIVE PROFESSIONAL'}</div>
                      </td>
                    </tr>
                  </table>

                  <table width="100%" cellpadding="0" cellspacing="0" style="table-layout: fixed;">
                    <tr>
                      <td width="240" valign="top" style="padding-right: 40px; border-right: 1.5px solid #f1f5f9;">
                        ${profile.photo ? `
                        <div style="margin-bottom: 35px;">
                          <img src="${profile.photo}" width="180" height="180" style="border-radius: 90px; object-fit: cover; border: 4px solid #f1f5f9;">
                        </div>
                        ` : ''}

                        <div style="margin-bottom: 35px;">
                          <h3 style="font-size: 11pt; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #7c94b6; padding-bottom: 6px; margin-bottom: 18px; font-weight: 800; letter-spacing: 2px;">Contact</h3>
                          <div style="font-size: 9.5pt; color: #475569; line-height: 2;">
                            <div style="margin-bottom: 8px;"><b>Phone:</b><br>${profile.phone}</div>
                            <div style="margin-bottom: 8px; word-break: break-all;"><b>Email:</b><br>${profile.email}</div>
                            <div style="margin-bottom: 8px;"><b>Address:</b><br>${profile.location}</div>
                          </div>
                        </div>

                        <div style="margin-bottom: 35px;">
                          <h3 style="font-size: 11pt; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #7c94b6; padding-bottom: 6px; margin-bottom: 18px; font-weight: 800; letter-spacing: 2px;">Profile</h3>
                          <p style="font-size: 9.5pt; color: #475569; line-height: 1.7; text-align: justify;">${profile.experience_summary}</p>
                        </div>

                        <div>
                          <h3 style="font-size: 11pt; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #7c94b6; padding-bottom: 6px; margin-bottom: 18px; font-weight: 800; letter-spacing: 2px;">Expertise</h3>
                          <ul style="padding-left: 18px; margin: 0; font-size: 9.5pt; color: #475569; line-height: 2;">
                            ${profile.skills.map(s => `<li style="margin-bottom: 6px;">${s}</li>`).join('')}
                          </ul>
                        </div>
                      </td>
                      <td valign="top" style="padding-left: 40px;">
                        <div style="margin-bottom: 45px;">
                          <h3 style="font-size: 12pt; color: #0f172a; text-transform: uppercase; border-bottom: 2.5px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 25px; font-weight: 800; letter-spacing: 2.5px;">Education</h3>
                          ${profile.education_list.map(edu => `
                              <div style="margin-bottom: 25px; border-left: 3px solid #7c94b6; padding-left: 20px;">
                                <div style="font-size: 11pt; font-weight: 800; color: #0f172a; line-height: 1.3;">${edu.degree}</div>
                                <div style="font-size: 9.5pt; color: #7c94b6; font-weight: 700; margin: 4px 0;">${edu.school} | ${edu.year}</div>
                                <div style="font-size: 9.5pt; color: #475569; line-height: 1.6; font-style: italic;">${edu.description || ''}</div>
                              </div>
                          `).join('')}
                        </div>

                        <div style="margin-bottom: 45px;">
                          <h3 style="font-size: 12pt; color: #0f172a; text-transform: uppercase; border-bottom: 2.5px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 25px; font-weight: 800; letter-spacing: 2.5px;">Work Experience</h3>
                          ${profile.work_experience.map(exp => `
                              <div style="margin-bottom: 30px; border-left: 3px solid #7c94b6; padding-left: 20px;">
                                <div style="font-size: 11pt; font-weight: 800; color: #0f172a; line-height: 1.3;">${exp.role}</div>
                                <div style="font-size: 9.5pt; color: #7c94b6; font-weight: 700; margin: 4px 0;">${exp.company} | ${exp.period}</div>
                                <div style="font-size: 10pt; color: #475569; line-height: 1.7;">
                                  ${exp.description.split('\n').filter(l => l.trim()).map(l => `&bull; ${l}`).join('<br>')}
                                </div>
                              </div>
                          `).join('')}
                        </div>

                        <div>
                          <h3 style="font-size: 12pt; color: #0f172a; text-transform: uppercase; border-bottom: 2.5px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 25px; font-weight: 800; letter-spacing: 2.5px;">References</h3>
                          <table width="100%" cellpadding="0" cellspacing="0" style="table-layout: fixed;">
                            ${profile.references.reduce((acc, ref, i) => {
                if (i % 2 === 0) acc.push([ref]);
                else acc[acc.length - 1].push(ref);
                return acc;
            }, [] as any[][]).map(row => `
                                <tr>
                                  ${row.map((ref, idx) => `
                                      <td width="50%" valign="top" style="${idx === 0 ? 'padding-right: 20px;' : ''} padding-bottom: 15px;">
                                        <div style="font-size: 10pt; font-weight: 800; color: #0f172a;">${ref.name}</div>
                                        <div style="font-size: 9pt; color: #64748b; font-weight: 700;">${ref.position} / ${ref.company}</div>
                                        <div style="font-size: 8.5pt; color: #94a3b8; margin-top: 4px; line-height: 1.4;">
                                          ${ref.contact}
                                        </div>
                                      </td>
                                  `).join('')}
                                  ${row.length === 1 ? '<td width="50%"></td>' : ''}
                                </tr>
                            `).join('')}
                          </table>
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
            `);
        }
    };

    const handleExport = () => {
        const filename = `CV_${profile.name.replace(/\s+/g, '_')}_${selectedTemplate.toUpperCase()}.doc`;
        const htmlContent = getTemplateHtml(selectedTemplate);

        const preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>CV Export</title></head><body>";
        const postHtml = "</body></html>";
        const fullHtml = preHtml + htmlContent + postHtml;

        const blob = new Blob(['\ufeff', fullHtml], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderTemplatePreview = () => {
        // Wrapper for A4 Proportion
        const A4Wrapper = ({ children }: { children: React.ReactNode }) => (
            <div className="w-full bg-white shadow-lg border border-slate-200 min-h-[600px] mb-10 overflow-hidden relative">
                {children}
            </div>
        );

        if (selectedTemplate === 'minimalist') {
            return (
                <A4Wrapper>
                    <div className="p-12 font-sans text-slate-900 leading-snug animate-fade-in bg-white min-h-full">
                        {/* Header */}
                        <header className="mb-6">
                            <h2 className="text-[28px] font-black text-slate-950 leading-none tracking-tighter uppercase">
                                {profile.name.split(' ')[0]} <span className="text-slate-400 font-medium">{profile.name.split(' ').slice(1).join(' ')}</span>
                            </h2>
                            <h3 className="text-[12px] font-bold text-slate-950 mt-1.5 uppercase tracking-[0.2em]">{profile.preferred_roles[0] || "Professional Specialist"}</h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] font-bold text-slate-400 mt-4 uppercase tracking-widest leading-loose">
                                <span>{profile.location}</span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full hidden sm:block"></span>
                                <span>{profile.email}</span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full hidden sm:block"></span>
                                <span>{profile.phone}</span>
                            </div>
                            <div className="h-0.5 bg-slate-950 w-full mt-5"></div>
                        </header>

                        {/* Summary */}
                        <section className="mb-5">
                            <h4 className="text-[11px] font-black uppercase tracking-widest border-b border-slate-950 pb-0.5 mb-2.5">Summary</h4>
                            <p className="text-[11px] text-slate-800 leading-relaxed text-justify px-0.5">
                                {profile.experience_summary}
                            </p>
                        </section>

                        {/* Experience */}
                        <section className="mb-6">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] border-b-2 border-slate-950 pb-1 mb-4">Professional Experience</h4>
                            <div className="space-y-6 px-0.5">
                                {profile.work_experience.map((exp, idx) => (
                                    <div key={idx} className="break-words">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 mb-1">
                                            <span className="font-black text-[13px] text-slate-950 leading-tight">{exp.role}</span>
                                            <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{exp.period}</span>
                                        </div>
                                        <div className="text-[11px] font-bold text-slate-400 mb-2 italic tracking-wide">{exp.company}</div>
                                        <ul className="list-disc ml-5 space-y-1.5 text-[11px] text-slate-700 leading-relaxed">
                                            {exp.description.split('\n').filter(l => l.trim()).map((line, i) => (
                                                <li key={i}>{line}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                                {profile.work_experience.length === 0 && (
                                    <div className="text-[11px] text-slate-400 italic">Data pengalaman belum diisi.</div>
                                )}
                            </div>
                        </section>

                        {/* Skills */}
                        <section className="mb-5">
                            <h4 className="text-[11px] font-black uppercase tracking-widest border-b border-slate-950 pb-0.5 mb-3">Skills</h4>
                            <div className="grid grid-cols-2 gap-x-10 gap-y-1.5 text-[11px] font-semibold text-slate-800 px-0.5">
                                {profile.skills.map((s, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-1 h-1 bg-slate-950 rounded-full shrink-0"></div>
                                        {s}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Education */}
                        <section className="mb-6">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] border-b-2 border-slate-950 pb-1 mb-4">Education</h4>
                            <div className="space-y-5 px-0.5 text-slate-800">
                                {profile.education_list.map((edu, idx) => (
                                    <div key={idx} className="break-words">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 mb-1">
                                            <span className="font-black text-[12px] uppercase">{edu.degree}</span>
                                            <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{edu.year}</span>
                                        </div>
                                        <div className="text-[11px] font-medium text-slate-400 italic mb-1">{edu.school}</div>
                                        {edu.description && <p className="text-[11px] text-slate-600 leading-relaxed italic">{edu.description}</p>}
                                    </div>
                                ))}
                                {profile.education_list.length === 0 && (
                                    <div className="text-[11px] text-slate-400 italic">Data pendidikan belum diisi.</div>
                                )}
                            </div>
                        </section>

                        {/* Additional Info */}
                        {profile.certifications.length > 0 && (
                            <section className="mb-5">
                                <h4 className="text-[11px] font-black uppercase tracking-widest border-b border-slate-950 pb-0.5 mb-3.5">Additional Information</h4>
                                <ul className="list-disc ml-5 space-y-1 text-[11px] text-slate-700 px-0.5">
                                    {profile.certifications.map((c, i) => <li key={i}>{c}</li>)}
                                </ul>
                            </section>
                        )}
                    </div>
                </A4Wrapper>
            );
        }

        if (selectedTemplate === 'modern') {
            return (
                <A4Wrapper>
                    <div className="font-sans text-slate-800 text-[13px] leading-relaxed p-0 animate-slide-up bg-white min-h-full">
                        {/* Header Group */}
                        <div className="p-12 pb-0">
                            <div className="flex gap-8 items-start mb-8">
                                {profile.photo && (
                                    <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-[#C4A484] shadow-lg shrink-0">
                                        <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex-1 space-y-4 pt-1">
                                    <h2 className="text-[36px] font-serif text-slate-950 leading-[1.1] break-words">
                                        {profile.name.split(' ')[0]} <span className="text-[#C4A484]">{profile.name.split(' ').slice(1).join(' ')}</span>
                                    </h2>
                                    <div className="flex items-center w-full">
                                        <div className="bg-slate-900 text-white px-5 py-2.5 text-[11px] font-black uppercase tracking-widest whitespace-nowrap shadow-sm">
                                            {profile.preferred_roles[0] || "Senior Specialist"}
                                        </div>
                                        <div className="h-[34px] bg-[#C4A484] flex-grow ml-0"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 text-slate-300 px-8 py-3 flex flex-wrap gap-x-8 gap-y-2 text-[10px] font-bold uppercase tracking-widest">
                                <div className="flex items-center gap-2"><Phone size={12} className="text-[#C4A484]" /> {profile.phone}</div>
                                <div className="flex items-center gap-2"><Mail size={12} className="text-[#C4A484]" /> {profile.email}</div>
                                <div className="flex items-center gap-2"><MapPin size={12} className="text-[#C4A484]" /> {profile.location}</div>
                            </div>
                        </div>

                        <div className="p-12 pt-10 space-y-10">
                            {/* Summary */}
                            <section>
                                <p className="text-[13px] text-slate-600 leading-relaxed text-justify px-0.5 font-medium">
                                    {profile.experience_summary}
                                </p>
                            </section>

                            {/* Experience */}
                            <section>
                                <h4 className="text-[#C4A484] font-black uppercase text-[12px] tracking-[0.2em] border-b-2 border-slate-100 pb-2 mb-8">Pengalaman Kerja</h4>
                                <div className="space-y-10">
                                    {profile.work_experience.map((exp, idx) => (
                                        <div key={idx} className="flex flex-col md:flex-row gap-6 px-0.5 items-start">
                                            <div className="w-full md:w-1/3 space-y-1 shrink-0">
                                                <div className="font-black text-slate-950 text-[14px] leading-tight break-words">{exp.role}</div>
                                                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide break-words">{exp.company}</div>
                                                <div className="text-[11px] font-bold text-[#C4A484] italic mt-1">{exp.period}</div>
                                            </div>
                                            <div className="flex-1">
                                                <ul className="list-disc ml-5 space-y-2.5 text-[12px] text-slate-600 font-medium leading-relaxed break-words">
                                                    {exp.description.split('\n').filter(l => l.trim()).map((line, i) => (
                                                        <li key={i}>{line}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                    {profile.work_experience.length === 0 && (
                                        <div className="text-[12px] text-slate-400 italic bg-slate-50 p-4 rounded-lg border border-dashed border-slate-200">Data pengalaman belum diisi.</div>
                                    )}
                                </div>
                            </section>

                            {/* Education */}
                            <section>
                                <h4 className="text-[#C4A484] font-black uppercase text-[12px] tracking-[0.2em] border-b-2 border-slate-100 pb-2 mb-8">Pendidikan</h4>
                                <div className="space-y-8">
                                    {profile.education_list.map((edu, idx) => (
                                        <div key={idx} className="flex flex-col md:flex-row gap-6 px-0.5 items-start">
                                            <div className="w-full md:w-1/3 space-y-1 shrink-0">
                                                <div className="font-black text-slate-950 text-[14px] leading-tight break-words">{edu.degree}</div>
                                                <div className="text-[11px] font-bold text-slate-500 uppercase break-words">{edu.school}</div>
                                                <div className="text-[11px] font-bold text-[#C4A484] italic mt-1">{edu.year}</div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[12px] text-slate-600 font-medium leading-relaxed italic break-words">
                                                    {edu.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {profile.education_list.length === 0 && (
                                        <div className="text-[12px] text-slate-400 italic">Data pendidikan belum diisi.</div>
                                    )}
                                </div>
                            </section>

                            <div className="grid grid-cols-2 gap-12">
                                <section>
                                    <h4 className="text-[#C4A484] font-black uppercase text-[12px] tracking-[0.2em] border-b border-slate-100 pb-2 mb-4">Keahlian</h4>
                                    <ul className="space-y-2 text-[12px] text-slate-600 font-bold px-4 list-disc marker:text-[#C4A484]">
                                        {profile.skills.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </section>
                                <section>
                                    <h4 className="text-[#C4A484] font-black uppercase text-[12px] tracking-[0.2em] border-b border-slate-100 pb-2 mb-4">Sertifikasi</h4>
                                    <ul className="space-y-2 text-[12px] text-slate-600 font-bold px-4 list-disc marker:text-[#C4A484]">
                                        {profile.certifications.length > 0 ?
                                            profile.certifications.map((c, i) => <li key={i}>{c}</li>) :
                                            <li>Certified Data Specialist</li>
                                        }
                                    </ul>
                                </section>
                            </div>
                        </div>
                    </div>
                </A4Wrapper>
            );
        }

        // EXECUTIVE TEMPLATE (Lorna Alvarado Style)
        return (
            <A4Wrapper>
                <div className="font-sans text-slate-800 leading-relaxed bg-white min-h-full p-8 animate-fade-in">
                    {/* Top Header */}
                    <header className="mb-8">
                        <h1 className="text-[28px] font-medium text-[#7c94b6] leading-tight mb-1">
                            {profile.name}
                        </h1>
                        <p className="text-[14px] text-slate-500 font-medium tracking-wide">
                            {profile.preferred_roles[0] || "Marketing Manager"}
                        </p>
                    </header>

                    <div className="grid grid-cols-[140px_1fr] gap-8">
                        {/* Left Column */}
                        <aside className="space-y-8">
                            {profile.photo && (
                                <div className="w-32 h-32 rounded-full overflow-hidden border-0 shadow-lg mb-6">
                                    <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
                                </div>
                            )}

                            {/* Contact */}
                            <section>
                                <h4 className="text-[12px] font-black text-slate-900 border-b border-slate-200 pb-1.5 mb-4 uppercase tracking-widest">Contact</h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2.5 text-[11px] text-slate-600">
                                        <div className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-[#7c94b6] shrink-0 bg-slate-50">
                                            <Phone size={12} />
                                        </div>
                                        <span className="break-words pt-1">{profile.phone}</span>
                                    </div>
                                    <div className="flex items-start gap-2.5 text-[11px] text-slate-600">
                                        <div className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-[#7c94b6] shrink-0 bg-slate-50">
                                            <Mail size={12} />
                                        </div>
                                        <span className="break-all pt-1 font-medium italic">{profile.email}</span>
                                    </div>
                                    <div className="flex items-start gap-2.5 text-[11px] text-slate-600">
                                        <div className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-[#7c94b6] shrink-0 bg-slate-50">
                                            <MapPin size={12} />
                                        </div>
                                        <span className="break-words pt-1">{profile.location}</span>
                                    </div>
                                </div>
                            </section>

                            {/* About Me */}
                            <section>
                                <h4 className="text-[12px] font-black text-slate-900 border-b border-slate-200 pb-1.5 mb-4 uppercase tracking-widest">Profile</h4>
                                <p className="text-[11px] text-slate-600 leading-relaxed text-justify px-0.5 font-medium italic">
                                    {profile.experience_summary}
                                </p>
                            </section>

                            {/* Skills */}
                            <section>
                                <h4 className="text-[12px] font-black text-slate-900 border-b border-slate-200 pb-1.5 mb-4 uppercase tracking-widest">Expertise</h4>
                                <ul className="space-y-2 px-0.5">
                                    {profile.skills.map((skill, i) => (
                                        <li key={i} className="flex items-center gap-2.5 text-[11px] text-slate-700 font-bold">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#7c94b6] shrink-0"></div>
                                            <span className="break-words">{skill}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </aside>

                        {/* Right Column */}
                        <div className="space-y-12">
                            {/* Education */}
                            <section>
                                <h4 className="text-[13px] font-black text-slate-900 border-b-2 border-slate-200 pb-2 mb-8 uppercase tracking-[0.2em] relative">
                                    Education
                                    <div className="absolute -bottom-0.5 left-0 w-12 h-0.5 bg-[#7c94b6]"></div>
                                </h4>
                                <div className="ml-2 border-l-2 border-[#7c94b6]/20 space-y-10">
                                    {profile.education_list.map((edu, idx) => (
                                        <div key={idx} className="relative pl-8 break-words">
                                            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-[#7c94b6] shadow-sm z-10 transition-transform hover:scale-125"></div>
                                            <div className="flex flex-col mb-2">
                                                <div className="text-[14px] font-black text-slate-900 leading-tight tracking-tight uppercase">{edu.degree}</div>
                                                <div className="flex justify-between items-center text-[11px] font-bold mt-1 text-[#7c94b6]">
                                                    <span className="italic opacity-80">{edu.school}</span>
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500">{edu.year}</span>
                                                </div>
                                            </div>
                                            {edu.description && (
                                                <p className="text-[11px] text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-2 rounded border border-slate-100/50 mt-2 italic">
                                                    {edu.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                    {profile.education_list.length === 0 && (
                                        <div className="pl-8 text-[11px] text-slate-400 italic">Data pendidikan belum diisi.</div>
                                    )}
                                </div>
                            </section>

                            {/* Experience */}
                            <section>
                                <h4 className="text-[13px] font-black text-slate-900 border-b-2 border-slate-200 pb-2 mb-8 uppercase tracking-[0.2em] relative">
                                    Experience
                                    <div className="absolute -bottom-0.5 left-0 w-12 h-0.5 bg-[#7c94b6]"></div>
                                </h4>
                                <div className="ml-2 border-l-2 border-[#7c94b6]/20 space-y-12">
                                    {profile.work_experience.map((exp, idx) => (
                                        <div key={idx} className="relative pl-8 break-words">
                                            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-[#7c94b6] shadow-sm z-10"></div>
                                            <div className="flex flex-col mb-3">
                                                <div className="text-[15px] font-black text-slate-900 leading-tight tracking-tight">{exp.role}</div>
                                                <div className="flex justify-between items-center text-[11px] font-bold mt-1">
                                                    <span className="text-slate-500 uppercase tracking-wider">{exp.company}</span>
                                                    <span className="text-[#7c94b6] font-black">{exp.period}</span>
                                                </div>
                                            </div>
                                            <div className="text-[11px] text-slate-600 leading-relaxed font-medium space-y-2">
                                                {exp.description.split('\n').filter(l => l.trim()).map((line, i) => (
                                                    <div key={i} className="flex gap-2">
                                                        <span className="text-[#7c94b6] font-bold mt-0.5">&bull;</span>
                                                        <span>{line}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {profile.work_experience.length === 0 && (
                                        <div className="pl-8 text-[11px] text-slate-400 italic">Data pengalaman belum diisi.</div>
                                    )}
                                </div>
                            </section>

                            {/* References */}
                            <section>
                                <h4 className="text-[13px] font-black text-slate-900 border-b-2 border-slate-200 pb-2 mb-8 uppercase tracking-[0.2em] relative">
                                    References
                                    <div className="absolute -bottom-0.5 left-0 w-12 h-0.5 bg-[#7c94b6]"></div>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    {profile.references.map((ref, idx) => (
                                        <div key={idx} className="space-y-1.5 bg-slate-50/50 p-3 rounded-lg border border-slate-100 break-words">
                                            <div className="text-[12px] font-black text-slate-900">{ref.name}</div>
                                            <div className="text-[10px] text-[#7c94b6] font-black uppercase tracking-tight">{ref.position} / {ref.company}</div>
                                            <div className="text-[9px] text-slate-500 leading-relaxed font-medium mt-1 border-t border-slate-200 pt-1">
                                                {ref.contact}
                                            </div>
                                        </div>
                                    ))}
                                    {profile.references.length === 0 && (
                                        <div className="text-[11px] text-slate-400 italic col-span-2">Data referensi belum diisi.</div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </A4Wrapper>
        );
    };

    return (
        <div className="max-w-6xl mx-auto animate-fade-in pb-10">
            <div className="flex flex-col lg:flex-row gap-8">

                {/* EDIT SIDE */}
                <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className="p-2 hover:bg-slate-100 rounded-xl transition-all active:scale-90 text-slate-500"
                                    title="Kembali"
                                >
                                    <ArrowLeft size={24} />
                                </button>
                            )}
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                    <div className="p-2 bg-brand-500 rounded-xl text-white shadow-lg shadow-brand-200">
                                        <Wand2 size={24} />
                                    </div>
                                    AI CV ATS Builder
                                </h1>
                                <p className="text-slate-500 text-sm font-medium mt-1">
                                    Lengkapi data di bawah ini dan biarkan AI mengoptimasi setiap bagian CV Anda.
                                </p>
                            </div>
                        </div>

                        {/* TEMPLATE PICKER */}
                        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                            <button
                                onClick={() => setSelectedTemplate('minimalist')}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${selectedTemplate === 'minimalist' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Minimalist
                            </button>
                            <button
                                onClick={() => setSelectedTemplate('modern')}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${selectedTemplate === 'modern' ? 'bg-brand-500 text-white shadow-lg shadow-brand-100' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Modern
                            </button>
                            <button
                                onClick={() => setSelectedTemplate('executive')}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${selectedTemplate === 'executive' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Executive
                            </button>
                        </div>
                    </div>

                    {/* Section: Personal Info */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <User size={16} /> Informasi Pribadi
                        </h3>
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Photo Upload */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative transition-all group-hover:border-brand-500">
                                        {profile.photo ? (
                                            <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera size={32} className="text-slate-300 group-hover:text-brand-500 transition-colors" />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    {profile.photo && (
                                        <button
                                            onClick={() => handleUpdateField('photo', '')}
                                            className="absolute -top-2 -right-2 p-1.5 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-red-500 shadow-sm transition-all"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Foto Profil</p>
                                    <p className="text-[9px] text-slate-400 mt-1 italic">JPG/PNG, Max 2MB</p>
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputGroup label="Nama Lengkap" value={profile.name} onChange={(v) => handleUpdateField('name', v)} placeholder="Contoh: Alexander Pierce" />
                                <InputGroup label="Email" value={profile.email} onChange={(v) => handleUpdateField('email', v)} placeholder="alexander@example.com" />
                                <InputGroup label="Telepon" value={profile.phone} onChange={(v) => handleUpdateField('phone', v)} placeholder="+62 812..." />
                                <InputGroup label="Lokasi" value={profile.location} onChange={(v) => handleUpdateField('location', v)} placeholder="Jakarta, Indonesia" />
                            </div>
                        </div>
                    </div>

                    {/* Section: Professional Summary */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Star size={16} /> Ringkasan Profesional
                            </h3>
                            <button
                                onClick={() => handleOptimize('experience_summary', 'summary')}
                                disabled={isOptimizing['experience_summary']}
                                className="px-3 py-1.5 bg-brand-50 text-brand-700 text-[12px] font-bold rounded-lg border border-brand-100 flex items-center gap-1.5 hover:bg-brand-500 hover:text-white transition-all disabled:opacity-50"
                            >
                                {isOptimizing['experience_summary'] ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                Optimasi dengan AI
                            </button>
                        </div>
                        <textarea
                            value={profile.experience_summary}
                            onChange={(e) => handleUpdateField('experience_summary', e.target.value)}
                            placeholder="Gambarkan karir dan pencapaian utama Anda..."
                            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>

                    {/* Section: Skills */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Layout size={16} /> Skills & Kompetensi
                            </h3>
                            <button
                                onClick={() => handleOptimize('skills', 'skills')}
                                disabled={isOptimizing['skills']}
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[12px] font-bold rounded-lg border border-emerald-100 flex items-center gap-1.5 hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                            >
                                {isOptimizing['skills'] ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                Saran Relevan
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {profile.skills.map((skill, idx) => (
                                <div key={idx} className="group flex items-center gap-1.5 bg-slate-100 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-full hover:bg-slate-200 transition-all cursor-default border border-slate-200">
                                    {skill}
                                    <button onClick={() => handleUpdateField('skills', profile.skills.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Tambah skill..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const val = (e.target as HTMLInputElement).value.trim();
                                        if (val) {
                                            handleUpdateField('skills', [...profile.skills, val]);
                                            (e.target as HTMLInputElement).value = '';
                                        }
                                    }
                                }}
                                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none"
                            />
                            <button className="p-3 bg-brand-500 text-white rounded-xl shadow-md hover:bg-brand-600">
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Section: Education List */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <GraduationCap size={16} /> Riwayat Pendidikan
                            </h3>
                            <button
                                onClick={() => handleArrayAdd('education_list')}
                                className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                        <div className="space-y-6">
                            {profile.education_list.map((edu, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                                    <button
                                        onClick={() => handleArrayRemove('education_list', idx)}
                                        className="absolute -top-2 -right-2 p-1.5 bg-white border border-slate-100 rounded-full text-slate-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X size={12} />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <InputGroup label="Gelar/Jurusan" value={edu.degree} onChange={(v) => handleArrayUpdate('education_list', idx, { degree: v })} placeholder="Contoh: S1 Teknik Mesin" />
                                        <InputGroup label="Sekolah/Universitas" value={edu.school} onChange={(v) => handleArrayUpdate('education_list', idx, { school: v })} placeholder="Nama institusi" />
                                        <InputGroup label="Tahun Lulus/Periode" value={edu.year} onChange={(v) => handleArrayUpdate('education_list', idx, { year: v })} placeholder="Contoh: 2016 - 2020" />
                                    </div>
                                    <textarea
                                        value={edu.description}
                                        onChange={(e) => handleArrayUpdate('education_list', idx, { description: e.target.value })}
                                        placeholder="Keterangan tambahan (Opsional)"
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none"
                                    />
                                </div>
                            ))}
                            {profile.education_list.length === 0 && (
                                <p className="text-center text-slate-400 text-xs py-4 font-medium italic">Belum ada riwayat pendidikan. Klik tombol + untuk menambah.</p>
                            )}
                        </div>
                    </div>

                    {/* Section: Work Experience List */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase size={16} /> Pengalaman Kerja
                            </h3>
                            <button
                                onClick={() => handleArrayAdd('work_experience')}
                                className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                        <div className="space-y-6">
                            {profile.work_experience.map((exp, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                                    <button
                                        onClick={() => handleArrayRemove('work_experience', idx)}
                                        className="absolute -top-2 -right-2 p-1.5 bg-white border border-slate-100 rounded-full text-slate-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X size={12} />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <InputGroup label="Posisi/Jabatan" value={exp.role} onChange={(v) => handleArrayUpdate('work_experience', idx, { role: v })} placeholder="Contoh: Senior Manager" />
                                        <InputGroup label="Nama Perusahaan" value={exp.company} onChange={(v) => handleArrayUpdate('work_experience', idx, { company: v })} placeholder="Nama tempat bekerja" />
                                        <InputGroup label="Periode" value={exp.period} onChange={(v) => handleArrayUpdate('work_experience', idx, { period: v })} placeholder="Contoh: Jan 2022 - Sekarang" />
                                    </div>
                                    <textarea
                                        value={exp.description}
                                        onChange={(e) => handleArrayUpdate('work_experience', idx, { description: e.target.value })}
                                        placeholder="Gambarkan tugas dan pencapaian Anda..."
                                        className="w-full h-24 p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none"
                                    />
                                </div>
                            ))}
                            {profile.work_experience.length === 0 && (
                                <p className="text-center text-slate-400 text-xs py-4 font-medium italic">Belum ada pengalaman kerja. Klik tombol + untuk menambah.</p>
                            )}
                        </div>
                    </div>

                    {/* Section: References List */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <User size={16} /> Referensi Profesional
                            </h3>
                            <button
                                onClick={() => handleArrayAdd('references')}
                                className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                        <div className="space-y-6">
                            {profile.references.map((ref, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                                    <button
                                        onClick={() => handleArrayRemove('references', idx)}
                                        className="absolute -top-2 -right-2 p-1.5 bg-white border border-slate-100 rounded-full text-slate-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X size={12} />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputGroup label="Nama Referensi" value={ref.name} onChange={(v) => handleArrayUpdate('references', idx, { name: v })} placeholder="Nama lengkap" />
                                        <InputGroup label="Jabatan" value={ref.position} onChange={(v) => handleArrayUpdate('references', idx, { position: v })} placeholder="Contoh: CEO / Manager" />
                                        <InputGroup label="Perusahaan" value={ref.company} onChange={(v) => handleArrayUpdate('references', idx, { company: v })} placeholder="Nama instansi" />
                                        <InputGroup label="Kontak (WA/Email)" value={ref.contact} onChange={(v) => handleArrayUpdate('references', idx, { contact: v })} placeholder="Nomor HP atau Email" />
                                    </div>
                                </div>
                            ))}
                            {profile.references.length === 0 && (
                                <p className="text-center text-slate-400 text-xs py-4 font-medium italic">Belum ada referensi. Klik tombol + untuk menambah.</p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4">
                        <button
                            onClick={handleSave}
                            disabled={saveStatus === 'saving'}
                            className="flex-1 bg-brand-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-100 hover:bg-brand-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {saveStatus === 'saving' ? <Loader2 size={18} className="animate-spin" /> :
                                saveStatus === 'saved' ? <CheckCircle2 size={18} /> : <Save size={18} />}
                            {saveStatus === 'saving' ? 'Menyimpan...' : saveStatus === 'saved' ? 'Berhasil Disimpan' : 'Simpan Profil CV'}
                        </button>
                        <button
                            onClick={handleExport}
                            className="px-6 bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Download size={18} /> Export CV
                        </button>
                    </div>
                </div>

                {/* PREVIEW SIDE */}
                <div className="lg:w-[450px]">
                    <div className="sticky top-24">
                        <div className="bg-slate-900 rounded-3xl p-1 shadow-2xl overflow-hidden border-4 border-slate-800">
                            <div className="bg-white rounded-[26px] h-[750px] overflow-y-auto custom-scrollbar p-0">
                                {/* ATS PREVIEW RENDERING */}
                                {renderTemplatePreview()}
                            </div>
                            <div className="p-4 flex items-center justify-between text-slate-400">
                                <span className="text-[10px] font-bold uppercase tracking-widest">LIVE {selectedTemplate.toUpperCase()} PREVIEW</span>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/50"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 bg-brand-50 rounded-2xl p-4 border border-brand-100 flex items-start gap-3">
                            <div className="p-2 bg-brand-500 rounded-lg text-white">
                                <CheckCircle2 size={16} />
                            </div>
                            <div>
                                <h4 className="text-[13px] font-black text-brand-900 leading-none mb-1">ATS Optimization is ON</h4>
                                <p className="text-[11px] text-brand-700 font-medium leading-normal">
                                    CV Anda sedang menggunakan format Single-Column yang 100% ramah terhadap LinkedIn & Workable ATS.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InputGroup: React.FC<{ label: string, value: string, onChange: (v: string) => void, placeholder?: string, type?: string }> = ({ label, value, onChange, placeholder, type = "text" }) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-slate-300"
        />
    </div>
);
