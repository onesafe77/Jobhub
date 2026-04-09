import { logUserActivity, calculateOpenAICost } from './logger';

/**
 * lib/openai.ts
 * OpenAI helpers for CV parsing and job match scoring.
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

const getAiEndpoint = () => OPENAI_API_KEY.startsWith('sk-or-')
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';

const getAiHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    ...(OPENAI_API_KEY.startsWith('sk-or-') ? {
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://jobsagent.local',
        'X-Title': 'JobsAgent',
    } : {})
});

// resolveModel: If using OpenRouter, pass full model path (e.g. 'anthropic/claude-3.5-sonnet').
// If using direct OpenAI, strip the provider prefix and use just the model name.
const resolveModel = (model: string) => {
    if (OPENAI_API_KEY.startsWith('sk-or-')) {
        // OpenRouter: use full model path as-is (e.g. 'openai/gpt-4o-mini', 'anthropic/claude-3.5-sonnet')
        return model.includes('/') ? model : `openai/${model}`;
    }
    // Direct OpenAI: strip provider prefix, use just the model name
    return model.includes('/') ? model.split('/').pop()! : model;
};

export interface WorkExperience {
    role: string;
    company: string;
    period: string;
    description: string;
}

export interface EducationEntry {
    degree: string;
    school: string;
    year: string;
    description?: string;
}

export interface ReferenceEntry {
    name: string;
    position: string;
    company: string;
    contact: string;
}

export interface UserProfile {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    photo?: string;
    skills: string[];
    experience_years: number;
    experience_summary: string;
    work_experience: WorkExperience[];
    education: string; // Keep for backward compatibility or simple view
    education_list: EducationEntry[];
    references: ReferenceEntry[];
    certifications: string[];
    preferred_roles: string[];
    raw_cv: string;
    subscriptionPlan?: 'free' | 'lite' | 'pro';
    subscriptionExpiry?: string;
    preferred_tracking_view?: 'kanban' | 'table';
}

export interface MatchResult {
    overall: number;
    skills: number;
    experience: number;
    education: number;
    strongMatches: string[];
    missing: string[];
}

/**
 * Parse CV text using OpenAI GPT-4o-mini.
 * Extracts structured profile data from free-form CV text.
 */
export async function parseCV(cvText: string): Promise<UserProfile> {
    const response = await fetch(getAiEndpoint(), {
        method: 'POST',
        headers: getAiHeaders(),
        body: JSON.stringify({
            model: resolveModel('gpt-4o-mini'),
            temperature: 0.1,
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: `You are a professional CV/resume parser. Extract structured data from the CV text provided. 
Return a JSON object with exactly these fields:
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "skills": ["skill1", "skill2", ...],
  "experience_years": number,
  "experience_summary": "string summary",
  "work_experience": [
    { "role": "string", "company": "string", "period": "string (e.g. 2020 - Present)", "description": "string" }
  ],
  "education": "string summary",
  "education_list": [
    { "degree": "string", "school": "string", "year": "string", "description": "string" }
  ],
  "references": [
    { "name": "string", "position": "string", "company": "string", "contact": "string" }
  ],
  "certifications": ["cert1", "cert2", ...],
  "preferred_roles": ["role1", "role2", ...]
}
Be thorough in extracting skills. Include programming languages, tools, frameworks, methodologies, and soft skills.
If the CV is in Indonesian (Bahasa), still extract the data but translate skill names to English when appropriate.`
                },
                {
                    role: 'user',
                    content: `Parse this CV:\n\n${cvText}`
                }
            ]
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenAI API error: ${err}`);
    }

    const data = await response.json();

    // Log activity
    if (data.usage) {
        logUserActivity({
            featureName: 'CV Parsing',
            provider: 'openai',
            tokensUsed: data.usage.total_tokens,
            costUsd: calculateOpenAICost(data.model || 'gpt-4o-mini', data.usage.total_tokens),
            metadata: { model: data.model }
        });
    }

    const parsed = JSON.parse(data.choices[0].message.content);
    return {
        name: parsed.name || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        location: parsed.location || '',
        skills: parsed.skills || [],
        experience_years: parsed.experience_years || 0,
        experience_summary: parsed.experience_summary || '',
        work_experience: parsed.work_experience || [],
        education: parsed.education || '',
        education_list: parsed.education_list || [],
        references: parsed.references || [],
        certifications: parsed.certifications || [],
        preferred_roles: parsed.preferred_roles || [],
        raw_cv: cvText,
    };
}

/**
 * Calculate a simple client-side match score (no API call).
 * Used for quick scoring in search results list.
 */
export function quickMatchScore(profile: UserProfile | null, jobTitle: string, jobDescription: string): MatchResult {
    if (!profile) {
        // No profile → return random-ish score for visual purposes
        return {
            overall: Math.floor(Math.random() * 15) + 75,
            skills: Math.floor(Math.random() * 15) + 75,
            experience: Math.floor(Math.random() * 15) + 70,
            education: Math.floor(Math.random() * 15) + 75,
            strongMatches: ['Upload CV untuk analisis akurat'],
            missing: [],
        };
    }

    const titleLower = jobTitle.toLowerCase();
    const descLower = jobDescription.toLowerCase();
    const combined = `${titleLower} ${descLower}`;

    // Skills matching
    let skillMatches = 0;
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const skill of profile.skills) {
        if (combined.includes(skill.toLowerCase())) {
            skillMatches++;
            matchedSkills.push(skill);
        }
    }
    const skillScore = profile.skills.length > 0
        ? Math.min(100, Math.round((skillMatches / Math.min(profile.skills.length, 8)) * 100))
        : 70;

    // Role match
    let roleBonus = 0;
    for (const role of profile.preferred_roles) {
        if (titleLower.includes(role.toLowerCase())) {
            roleBonus = 15;
            break;
        }
    }

    // Experience score (simple heuristic)
    const expScore = Math.min(100, 60 + (profile.experience_years * 5));

    // Education score (simple)
    const eduScore = profile.education ? 85 : 60;

    // Overall
    const overall = Math.min(100, Math.round(
        (skillScore * 0.4 + expScore * 0.3 + eduScore * 0.2 + roleBonus)
    ));

    // Strong matches text
    const strongMatches: string[] = [];
    if (matchedSkills.length > 0) strongMatches.push(`Skills cocok: ${matchedSkills.slice(0, 3).join(', ')}`);
    if (roleBonus > 0) strongMatches.push(`Role sesuai dengan preferensi Anda`);
    if (profile.experience_years >= 2) strongMatches.push(`${profile.experience_years} tahun pengalaman relevan`);

    return {
        overall: Math.max(overall, 30),
        skills: Math.max(skillScore, 30),
        experience: Math.max(expScore, 30),
        education: Math.max(eduScore, 30),
        strongMatches,
        missing: missingSkills.slice(0, 2),
    };
}

/**
 * Deep AI match analysis using OpenAI (called when user opens job detail).
 * More accurate but costs ~$0.003 per call.
 */
export async function deepMatchAnalysis(
    profile: UserProfile,
    jobTitle: string,
    jobDescription: string
): Promise<MatchResult> {
    const response = await fetch(getAiEndpoint(), {
        method: 'POST',
        headers: getAiHeaders(),
        body: JSON.stringify({
            model: resolveModel('gpt-4o-mini'),
            temperature: 0.1,
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: `You are a job matching AI. Compare the candidate's profile against the job posting and provide a detailed match analysis.

Return a JSON object:
{
  "overall": number (0-100),
  "skills": number (0-100),
  "experience": number (0-100),
  "education": number (0-100),
  "strongMatches": ["match1", "match2"],  // 2-3 specific things that match well
  "missing": ["gap1"]  // 1-2 things the candidate is missing (if any)
}

Be realistic and honest in scoring. Consider both hard and soft skills.`
                },
                {
                    role: 'user',
                    content: `CANDIDATE PROFILE:
Skills: ${profile.skills.join(', ')}
Experience: ${profile.experience_years} years - ${profile.experience_summary}
Education: ${profile.education}
Certifications: ${profile.certifications.join(', ')}

JOB POSTING:
Title: ${jobTitle}
Description: ${jobDescription.substring(0, 2000)}`
                }
            ]
        }),
    });

    if (!response.ok) {
        // Fallback to quick score if API fails
        return quickMatchScore(profile, jobTitle, jobDescription);
    }

    const data = await response.json();

    // Log activity
    if (data.usage) {
        logUserActivity({
            featureName: 'Deep Match Analysis',
            provider: 'openai',
            tokensUsed: data.usage.total_tokens,
            costUsd: calculateOpenAICost(data.model || 'gpt-4o-mini', data.usage.total_tokens),
            metadata: { model: data.model, jobTitle }
        });
    }

    const result = JSON.parse(data.choices[0].message.content);

    return {
        overall: result.overall || 70,
        skills: result.skills || 70,
        experience: result.experience || 70,
        education: result.education || 70,
        strongMatches: result.strongMatches || [],
        missing: result.missing || [],
    };
}

/**
 * Save user profile to localStorage.
 */
export function saveProfile(profile: UserProfile): void {
    const existing = loadProfile();
    if (existing && existing.subscriptionPlan && !profile.subscriptionPlan) {
        profile.subscriptionPlan = existing.subscriptionPlan;
    }
    localStorage.setItem('jobsagent_profile', JSON.stringify(profile));
}

/**
 * Load user profile from localStorage.
 */
export function loadProfile(): UserProfile | null {
    const stored = localStorage.getItem('jobsagent_profile');
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch {
        return null;
    }
}

/**
 * Clear user profile from localStorage.
 */
export function clearProfile(): void {
    const existing = loadProfile();
    if (existing && existing.subscriptionPlan) {
        // Keep only the subscription plan, wipe everything else
        localStorage.setItem('jobsagent_profile', JSON.stringify({
            subscriptionPlan: existing.subscriptionPlan
        }));
    } else {
        localStorage.removeItem('jobsagent_profile');
    }
}

export interface ATSIssue {
    type: 'critical' | 'warning' | 'suggestion';
    title: string;
    impact: string;
    explanation: string;
    fix: string;
}

export interface ATSAnalysisResult {
    score: number;
    summary: string;
    issues: ATSIssue[];
}

/**
 * Deep AI ATS CV analysis using OpenAI
 */
export async function analyzeCVForATS(cvText: string): Promise<ATSAnalysisResult> {
    const response = await fetch(getAiEndpoint(), {
        method: 'POST',
        headers: getAiHeaders(),
        body: JSON.stringify({
            model: resolveModel('gpt-4o-mini'),
            temperature: 0.1,
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: `You are an ATS (Applicant Tracking System) expert. Analyze this CV for ATS compatibility.
All your responses (summary, title, explanation, fix) MUST be written in Bahasa Indonesia.

Return a JSON object:
{
  "score": number (0-100) representing overall ATS compatibility,
  "summary": "string ringkasan dalam Bahasa Indonesia mengenai kesiapan CV untuk ATS",
  "issues": [
    {
      "type": "critical" | "warning" | "suggestion",
      "title": "Judul singkat masalah (dalam Bahasa Indonesia)",
      "impact": "High" | "Medium" | "Low",
      "explanation": "Penjelasan mengapa hal ini menjadi masalah bagi ATS (dalam Bahasa Indonesia)",
      "fix": "Saran perbaikan yang dapat ditindaklanjuti (dalam Bahasa Indonesia)"
    }
  ]
}

Be realistic and highly critical, considering format, keywords, readability, and structure. Only produce valid JSON.`
                },
                {
                    role: 'user',
                    content: `CV Text:\n${cvText}`
                }
            ]
        }),
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error during ATS analysis: ${response.status}`);
    }

    const data = await response.json();

    // Log activity
    if (data.usage) {
        logUserActivity({
            featureName: 'ATS Analysis',
            provider: 'openai',
            tokensUsed: data.usage.total_tokens,
            costUsd: calculateOpenAICost(data.model || 'gpt-4o-mini', data.usage.total_tokens),
            metadata: { model: data.model }
        });
    }

    const result = JSON.parse(data.choices[0].message.content);

    return {
        score: result.score || 0,
        summary: result.summary || "Tidak ada ringkasan yang diberikan.",
        issues: result.issues || [],
    };
}

/**
 * Automatically applies an AI suggestion to the CV text.
 */
export async function autoFixCVIssue(cvText: string, issueTitle: string, fixInstruction: string): Promise<string> {
    const response = await fetch(getAiEndpoint(), {
        method: 'POST',
        headers: getAiHeaders(),
        body: JSON.stringify({
            model: resolveModel('anthropic/claude-3.5-sonnet'),
            temperature: 0.1, // Low temperature for more deterministic edits
            messages: [
                {
                    role: 'system',
                    content: `You are an expert CV editor. Your task is to apply a specific fix to the user's CV.
Output ONLY the revised CV text. Maintain the original formatting structure as much as possible, but modify the content to resolve the issue. 
All modifications and outputs must be strictly in Bahasa Indonesia. Do not use markdown code blocks (like \`\`\`), do not output JSON, do not add conversational filler like "Berikut adalah revisinya". Output purely the new CV text.`
                },
                {
                    role: 'user',
                    content: `Please fix the following issue in my CV:
Masalah: ${issueTitle}
Instruksi Perbaikan: ${fixInstruction}

Berikut adalah CV saya saat ini:
---
${cvText}
---`
                }
            ]
        }),
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error during auto-fix: ${response.status}`);
    }

    const data = await response.json();

    // Log activity
    if (data.usage) {
        logUserActivity({
            featureName: 'CV Auto Fix',
            provider: 'openai',
            tokensUsed: data.usage.total_tokens,
            costUsd: calculateOpenAICost(data.model || 'gpt-4o-mini', data.usage.total_tokens),
            metadata: { model: data.model, issueTitle }
        });
    }

    let text = data.choices[0].message.content.trim();
    // Remove markdown code blocks if the AI still stubbornly adds them
    if (text.startsWith('```')) {
        text = text.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '');
    }
    return text.trim();
}

/**
 * Generate a Cover Letter based on user profile/CV and a job description.
 */
export async function generateCoverLetter(cvText: string, jobDetails: string): Promise<string> {
    const response = await fetch(getAiEndpoint(), {
        method: 'POST',
        headers: getAiHeaders(),
        body: JSON.stringify({
            model: resolveModel('anthropic/claude-3.5-sonnet'),
            temperature: 0.7, // Higher temp for more natural flow
            messages: [
                {
                    role: 'system',
                    content: `Anda adalah seorang penulis Cover Letter profesional. Tugas Anda adalah menulis surat lamaran kerja (Cover Letter) yang menarik, rapi, dan profesional dalam Bahasa Indonesia.
Surat tersebut harus menyoroti kecocokan terbaik antara pengalaman kandidat (dari CV mereka) dan kebutuhan posisi (dari deskripsi pekerjaan). 
Format surat secara standar:
- Header (Info kontak, jika tersedia dari CV)
- Tanggal
- Nama perusahaan/HR (jika ada)
- Pembuka
- Paragraf Utama (Pengalaman dan alasan mengapa cocok)
- Dokumen pendukung/Call to Action
- Penutup

Hanya hasilkan teks surat lamaran saja, tanpa komentar pembuka atau penutup dari AI.`
                },
                {
                    role: 'user',
                    content: `Berikut adalah rincian pekerjaan yang ingin saya lamar:
---
${jobDetails}
---

Dan berikut adalah teks CV/profil saya:
---
${cvText}
---

Tolong buatkan Cover Letter untuk saya lamar pekerjaan tersebut.`
                }
            ]
        }),
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error during cover letter generation: ${response.status}`);
    }

    const data = await response.json();

    // Log activity
    if (data.usage) {
        logUserActivity({
            featureName: 'Cover Letter Generation',
            provider: 'openai',
            tokensUsed: data.usage.total_tokens,
            costUsd: calculateOpenAICost(data.model || 'gpt-4o', data.usage.total_tokens),
            metadata: { model: data.model }
        });
    }

    return data.choices[0].message.content.trim();
}
/**
 * Optimize a specific CV section for ATS compatibility using OpenAI.
 */
export async function optimizeCVSection(content: string, sectionType: 'summary' | 'experience' | 'skills'): Promise<string> {
    const response = await fetch(getAiEndpoint(), {
        method: 'POST',
        headers: getAiHeaders(),
        body: JSON.stringify({
            model: resolveModel('anthropic/claude-3.5-sonnet'),
            temperature: 0.3,
            messages: [
                {
                    role: 'system',
                    content: `You are an expert CV writer and ATS optimization specialist. 
Your task is to rephrase the following ${sectionType} to be more professional, impact-driven, and ATS-friendly.
- Use strong action verbs (e.g., "Led", "Developed", "Optimized").
- Quantify achievements if possible.
- Ensure high readability for both bots and humans.
- Output ONLY the revised text in Bahasa Indonesia. 
- Do not add any conversational filler.`
                },
                {
                    role: 'user',
                    content: `Please optimize this ${sectionType}:\n\n${content}`
                }
            ]
        }),
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error during section optimization: ${response.status}`);
    }

    const data = await response.json();

    // Log activity
    if (data.usage) {
        logUserActivity({
            featureName: `CV Optimization (${sectionType})`,
            provider: 'openai',
            tokensUsed: data.usage.total_tokens,
            costUsd: calculateOpenAICost(data.model || 'gpt-4o-mini', data.usage.total_tokens),
            metadata: { model: data.model, sectionType }
        });
    }

    return data.choices[0].message.content.trim();
}

/**
 * Result structure for Salary Checker
 */
export interface SalaryEstimateResult {
    minSalary: number;
    maxSalary: number;
    medianSalary: number;
    confidenceScore: number;
    analysis: {
        factor: string;
        impact: 'positive' | 'negative' | 'neutral';
        description: string;
    }[];
}

/**
 * Estimate Market Salary based on CV Profile.
 */
export async function estimateSalaryFromCV(profile: UserProfile): Promise<SalaryEstimateResult> {
    const response = await fetch(getAiEndpoint(), {
        method: 'POST',
        headers: getAiHeaders(),
        body: JSON.stringify({
            model: resolveModel('openai/gpt-4o-mini'),
            temperature: 0.2,
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: `You are an expert tech recruiter and compensation analyst in Indonesia. 
Your task is to estimate a realistic market salary range (in Indonesian Rupiah / IDR per month) for a candidate based strictly on their CV profile.
Factor in their experience years, skills, education, and preferred roles.

Return a JSON object exactly like this:
{
  "minSalary": 8000000,
  "maxSalary": 15000000,
  "medianSalary": 11500000,
  "confidenceScore": 85,
  "analysis": [
    {
      "factor": "Pengalaman 3 Tahun",
      "impact": "positive",
      "description": "Pengalaman yang cukup matang di bidang ini menaikkan nilai tawar."
    },
    {
      "factor": "Skill React & Node.js",
      "impact": "positive",
      "description": "Permintaan tinggi untuk fullstack developer di pasar saat ini."
    }
  ]
}

Provide 3-5 analysis factors in Bahasa Indonesia explaining your reasoning. Ensure salaries are realistic for the current Indonesian job market.`
                },
                {
                    role: 'user',
                    content: `Please estimate the salary for this candidate profile:
Skills: ${profile.skills.join(', ')}
Experience: ${profile.experience_years} years - ${profile.experience_summary}
Education: ${profile.education}
Certifications: ${profile.certifications.join(', ')}
Preferred Roles: ${profile.preferred_roles.join(', ')}`
                }
            ]
        }),
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error during salary estimation: ${response.status}`);
    }

    const data = await response.json();

    // Log activity
    if (data.usage) {
        logUserActivity({
            featureName: 'Salary Estimation',
            provider: 'openai',
            tokensUsed: data.usage.total_tokens,
            costUsd: calculateOpenAICost(data.model || 'gpt-4o', data.usage.total_tokens),
            metadata: { model: data.model }
        });
    }

    const result = JSON.parse(data.choices[0].message.content);

    return {
        minSalary: result.minSalary || 0,
        maxSalary: result.maxSalary || 0,
        medianSalary: result.medianSalary || 0,
        confidenceScore: result.confidenceScore || 0,
        analysis: result.analysis || [],
    };
}
