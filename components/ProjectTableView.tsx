import React from 'react';
import {
    Building2,
    Calendar,
    Clock,
    Download,
    ExternalLink,
    Trash2,
    ChevronDown,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { ProjectTask, projectTasksService } from '../lib/projectTasks';

interface ProjectTableViewProps {
    projects: ProjectTask[];
    onStatusChange: (id: string, newStatus: ProjectTask['status']) => void;
    onDelete: (id: string) => void;
    onRefresh: () => void;
}

export const ProjectTableView: React.FC<ProjectTableViewProps> = ({
    projects,
    onStatusChange,
    onDelete,
    onRefresh
}) => {
    const columns: ProjectTask['status'][] = ['Plan', 'Applied', 'Interview', 'Offer', 'Rejected'];

    const getStatusColor = (status: ProjectTask['status']) => {
        switch (status) {
            case 'Plan': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'Applied': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'Interview': return 'bg-brand-50 text-brand-700 border-brand-100';
            case 'Offer': return 'bg-green-50 text-green-700 border-green-100';
            case 'Rejected': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-slate-50 text-slate-600';
        }
    };

    return (
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Posisi & Perusahaan</th>
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {projects.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                                    Belum ada lamaran di sini. Mulai tambahkan lamaran Anda!
                                </td>
                            </tr>
                        ) : (
                            projects.map((project) => (
                                <tr key={project.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="font-bold text-slate-900 text-[15px] group-hover:text-brand-600 transition-colors">
                                                {project.title}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[13px] text-slate-500 font-medium">
                                                <Building2 size={14} className="text-slate-300" />
                                                {project.company}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="relative inline-block group/select">
                                            <select
                                                className={`text-[11px] font-bold px-3 py-1.5 border rounded-lg cursor-pointer outline-none appearance-none pr-8 transition-all ${getStatusColor(project.status).replace('bg-', 'bg-opacity-50 hover:bg-opacity-100 bg-')}`}
                                                value={project.status}
                                                onChange={(e) => onStatusChange(project.id, e.target.value as any)}
                                            >
                                                {columns.map(c => <option key={c} value={c} className="bg-white text-slate-800 font-medium">{c}</option>)}
                                            </select>
                                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none group-hover/select:opacity-100 transition-opacity" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="relative group/date inline-block">
                                            <input
                                                type="date"
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                                value={project.task_date ? project.task_date.split('T')[0] : ''}
                                                onChange={(e) => {
                                                    const newDate = e.target.value ? new Date(e.target.value).toISOString() : null;
                                                    projectTasksService.updateTask(project.id, { task_date: newDate }).then(() => onRefresh());
                                                }}
                                            />
                                            <div className="text-[12px] font-bold text-slate-500 flex items-center gap-2 bg-slate-100/50 px-3 py-1.5 rounded-lg border border-slate-200 group-hover/date:border-brand-200 group-hover/date:bg-brand-50 group-hover/date:text-brand-600 transition-all">
                                                <Calendar size={14} className="text-slate-400 group-hover/date:text-brand-500" />
                                                {project.task_date ? new Date(project.task_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Set Tanggal'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {project.url && (
                                                <a
                                                    href={project.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                                                    title="Buka Link"
                                                >
                                                    <ExternalLink size={18} />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => onDelete(project.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                title="Hapus"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
