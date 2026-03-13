import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Language } from '../translations';
import { LayoutDashboard, FileText, Type, Settings, LogOut, Menu, X, Trash2, Edit3, Plus, Globe, Coffee, Calendar, Image as ImageIcon, Users, Send, Mail, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ReservationsTab } from './admin/ReservationsTab';
import { MenuTab } from './admin/MenuTab';
import { PagesTab } from './admin/PagesTab';
import { ContentTab } from './admin/ContentTab';
import { SettingsTab } from './admin/SettingsTab';
import { EventsTab } from './admin/EventsTab';
import { GalleryTab } from './admin/GalleryTab';
import { MarketingTab } from './admin/MarketingTab';
import { AppearanceTab } from './admin/AppearanceTab';
import { HistoryTab } from './admin/HistoryTab';
import { DashboardOverviewTab } from './admin/DashboardOverviewTab';
import { NewsletterTab } from './admin/NewsletterTab';
import { ChatTab } from './admin/ChatTab';
import { Bell } from 'lucide-react';

type AdminTab = 'overview' | 'reservations' | 'menu' | 'history' | 'pages' | 'content' | 'events' | 'gallery' | 'marketing' | 'newsletter' | 'settings' | 'appearance' | 'chat';

export const AdminDashboard: React.FC<{ language: Language }> = ({ language }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return sessionStorage.getItem('adminAuth') === 'true';
    });
    const [userRole, setUserRole] = useState<'admin' | 'editor'>(() => {
        return (sessionStorage.getItem('adminRole') as 'admin' | 'editor') || 'admin';
    });
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

    // Data States
    // No longer parsing pages/content inside the main dashboard component

    // UI States
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Fetch credentials from settings
            const { data: settingsData } = await supabase.from('settings').select('*').in('key', ['admin_username', 'admin_password']);

            let currentUsername = 'admin'; // fallback
            let currentPassword = '8410'; // fallback

            if (settingsData) {
                const dbUser = settingsData.find(s => s.key === 'admin_username')?.value;
                const dbPass = settingsData.find(s => s.key === 'admin_password')?.value;
                if (dbUser) currentUsername = dbUser;
                if (dbPass) currentPassword = dbPass;
            }

            if (username === currentUsername && password === currentPassword) {
                setUserRole('admin');
                setIsAuthenticated(true);
                sessionStorage.setItem('adminAuth', 'true');
                sessionStorage.setItem('adminRole', 'admin');
                setError('');
                fetchData();
            } else {
                setError(language === 'da' ? 'Forkert brugernavn eller adgangskode' : 'Incorrect username or password');
                setPassword('');
            }
        } catch (err) {
            setError('Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUserRole('admin');
        sessionStorage.removeItem('adminAuth');
        sessionStorage.removeItem('adminRole');
    };

    const fetchData = () => {
        // Main data fetch is now handled inside individual tabs
    };

    if (!isAuthenticated) {
        return (
            <div className="bg-[#FAF9F6] min-h-[800px] py-32 px-8 flex flex-col items-center justify-center -mt-[80px]">
                <div className="bg-white p-16 shadow-2xl border border-gray-100 max-w-lg w-full relative overflow-hidden text-center z-10">
                    <div className="absolute top-0 left-0 w-full h-[4px] bg-[#CDA235]"></div>
                    <span className="text-[#CDA235] text-[10px] font-bold tracking-[0.4em] uppercase block mb-4">ADMINISTRATOR</span>
                    <h2 className="text-4xl serif italic text-[#1a1a1a] mb-12">Login</h2>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="flex flex-col gap-4">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username..."
                                autoCapitalize="none"
                                className="border-b border-gray-200 py-4 text-center text-xl outline-none focus:border-[#CDA235] serif bg-transparent"
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password..."
                                className="border-b border-gray-200 py-4 text-center text-xl tracking-[0.3em] outline-none focus:border-[#CDA235] serif italic bg-transparent mt-2"
                            />
                        </div>
                        {error && <p className="text-red-500 text-xs italic mt-2">{error}</p>}
                        <button
                            type="submit"
                            disabled={!username || password.length < 3}
                            className={`w-full py-6 mt-6 text-[11px] font-bold uppercase tracking-[0.5em] transition-all shadow-xl ${(!username || password.length < 3) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#1a1a1a] text-white hover:bg-[#CDA235]'}`}
                        >
                            Enter Dashboard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#FAF9F6] min-h-screen flex flex-col md:flex-row w-full font-sans">
            {/* Sidebar Toggle for Mobile */}
            <div className="md:hidden bg-[#1a1a1a] text-white p-4 flex justify-between items-center sticky top-0 z-20">
                <span className="text-[#CDA235] text-[11px] font-bold tracking-[0.4em] uppercase">Control Panel</span>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-[280px] bg-[#1a1a1a] text-white flex-shrink-0 min-h-[calc(100vh-80px)] relative p-8 border-r border-[#CDA235]/20 z-10 transition-all`}>
                <div className="mb-16 pb-8 border-b border-white/10 relative">
                    <span className="text-[#CDA235] text-[10px] font-bold tracking-[0.4em] uppercase block mb-3">ADMINISTRATOR</span>
                    <h2 className="text-2xl serif italic text-white flex items-center justify-between">
                        Dashboard
                        <button className="relative text-gray-400 hover:text-white transition-colors">
                            <Bell size={20} />
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CDA235] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#CDA235]"></span>
                            </span>
                        </button>
                    </h2>
                </div>

                <nav className="space-y-2">
                    <button
                        onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-colors ${activeTab === 'overview' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <LayoutDashboard size={18} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Overview</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('reservations'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-colors ${activeTab === 'reservations' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Calendar size={18} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Reservations</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('menu'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-colors ${activeTab === 'menu' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Coffee size={18} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Menu</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('history'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-colors ${activeTab === 'history' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <FileText size={18} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Our History</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('pages'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-colors ${activeTab === 'pages' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <FileText size={18} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Pages</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('content'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-colors ${activeTab === 'content' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Type size={18} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Site Content</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('events'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-colors ${activeTab === 'events' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Calendar size={18} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Events</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('gallery'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-colors ${activeTab === 'gallery' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <ImageIcon size={18} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Gallery</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('marketing'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-colors ${activeTab === 'marketing' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Users size={18} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Customer Reviews</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('newsletter'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-colors ${activeTab === 'newsletter' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Mail size={18} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Newsletter List</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('chat'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-colors ${activeTab === 'chat' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <MessageSquare size={18} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Live Chat</span>
                    </button>

                    {userRole === 'admin' && (
                        <>
                            <button
                                onClick={() => { setActiveTab('appearance'); setIsSidebarOpen(false); }}
                                className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-colors ${activeTab === 'appearance' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                <Type size={18} />
                                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Appearance</span>
                            </button>
                            <button
                                onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
                                className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-colors ${activeTab === 'settings' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                <Settings size={18} />
                                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Settings</span>
                            </button>
                        </>
                    )}
                </nav>

                <div className="absolute bottom-8 left-8 right-8 space-y-4">
                    <button onClick={() => navigate('/')} className="w-full flex items-center gap-4 px-4 py-4 text-left text-gray-400 hover:text-white transition-colors border border-white/10 hover:border-white/30">
                        <Globe size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">View Site</span>
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-4 text-left text-gray-400 hover:text-red-400 transition-colors">
                        <LogOut size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Log Out</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow p-6 md:p-12 overflow-y-auto w-full bg-[#FAF9F6] relative z-0">
                <div className="max-w-[1200px] mx-auto">
                    {activeTab === 'overview' && <DashboardOverviewTab setActiveTab={setActiveTab} />}
                    {activeTab === 'reservations' && <ReservationsTab />}
                    {activeTab === 'menu' && <MenuTab />}
                    {activeTab === 'history' && <HistoryTab />}
                    {activeTab === 'pages' && <PagesTab />}
                    {activeTab === 'content' && <ContentTab />}
                    {activeTab === 'events' && <EventsTab />}
                    {activeTab === 'gallery' && <GalleryTab />}
                    {activeTab === 'marketing' && <MarketingTab />}
                    {activeTab === 'newsletter' && <NewsletterTab />}
                    {activeTab === 'chat' && <ChatTab />}
                    {activeTab === 'appearance' && userRole === 'admin' && <AppearanceTab />}
                    {activeTab === 'settings' && userRole === 'admin' && <SettingsTab />}
                </div>
            </div>
        </div>
    );
};
