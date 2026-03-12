import React, { useState } from 'react';
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';
import { AdminOverview } from './AdminOverview';
import { AdminUserManagement } from './AdminUserManagement';

interface AdminDashboardProps {
    onLogout: () => void;
    user: any;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, user }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex">
                <div>
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-tr from-brand-400 to-brand-600 rounded-xl blur opacity-30"></div>
                                <img src="/logo-icon.png" alt="Logo" className="relative w-8 h-8 rounded-lg" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-slate-800">
                                Admin<span className="text-brand-600">Panel</span>
                            </span>
                        </div>

                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === 'overview' ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <LayoutDashboard size={18} />
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === 'users' ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <Users size={18} />
                                Users
                            </button>
                        </nav>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium text-sm"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden">
                <header className="bg-white border-b border-slate-200 py-4 px-8 sticky top-0 z-10 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-slate-800">
                        {activeTab === 'overview' ? 'Dashboard Overview' : 'User Management'}
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-600 py-1.5 px-3 bg-slate-100 rounded-lg">
                            bagusfirmansyah2525@gmail.com
                        </span>
                    </div>
                </header>

                <div className="p-8">
                    {activeTab === 'overview' && <AdminOverview />}
                    {activeTab === 'users' && <AdminUserManagement />}
                </div>
            </main>
        </div>
    );
}
