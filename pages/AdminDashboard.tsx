import React, { useState, useEffect, useRef } from 'react';
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

    // Notification system
    interface Notification {
        id: string;
        type: 'reservation' | 'chat';
        label: string;
        time: string;
    }
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifPanel, setShowNotifPanel] = useState(false);
    const bellRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

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

    // Set up real-time notification subscriptions once authenticated
    useEffect(() => {
        if (!isAuthenticated) return;

        const addNotif = (type: 'reservation' | 'chat', label: string) => {
            setNotifications(prev => [...prev, {
                id: `${Date.now()}-${Math.random()}`,
                type,
                label,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        };

        // Listen for new reservations
        const bookingSub = supabase.channel('notif_bookings')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'bookings' },
                (payload) => {
                    const name = payload.new?.fullName || 'a guest';
                    addNotif('reservation', `New reservation from ${name}`);
                }
            )
            .subscribe();

        // Listen for new customer chat messages
        const chatSub = supabase.channel('notif_chat_messages')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: 'sender=eq.user' },
                () => {
                    addNotif('chat', 'New message from a customer');
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(bookingSub);
            supabase.removeChannel(chatSub);
        };
    }, [isAuthenticated]);

    // Click-outside handler: clear all notifications when clicking anywhere else
    useEffect(() => {
        const handleDocClick = (e: MouseEvent) => {
            if (
                bellRef.current && !bellRef.current.contains(e.target as Node) &&
                panelRef.current && !panelRef.current.contains(e.target as Node)
            ) {
                setShowNotifPanel(false);
                setNotifications([]);
            }
        };
        document.addEventListener('mousedown', handleDocClick);
        return () => document.removeEventListener('mousedown', handleDocClick);
    }, []);

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
            <div className={`${isSidebarOpen ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[280px] bg-[#1a1a1a] text-white flex-shrink-0 min-h-screen border-r border-[#CDA235]/20 z-10 transition-all`}>
                {/* Header */}
                <div className="px-8 pt-8 pb-6 border-b border-white/10">
                    <span className="text-[#CDA235] text-[10px] font-bold tracking-[0.4em] uppercase block mb-3">ADMINISTRATOR</span>
                    <h2 className="text-2xl serif italic text-white flex items-center justify-between">
                        Dashboard
                        <div className="relative mr-2">
                            <button
                                ref={bellRef}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowNotifPanel(prev => !prev);
                                }}
                                className="relative text-gray-400 hover:text-white transition-colors"
                                title="Notifications"
                            >
                                <Bell size={20} />
                                {notifications.length > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CDA235] opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#CDA235]"></span>
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown Panel */}
                            {showNotifPanel && (
                                <div
                                    ref={panelRef}
                                    className="absolute top-8 left-0 z-50 w-72 bg-[#111] border border-[#CDA235]/30 shadow-2xl rounded-sm overflow-hidden"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#CDA235]">Notifications</span>
                                        {notifications.length > 0 && (
                                            <button
                                                onClick={() => { setNotifications([]); setShowNotifPanel(false); }}
                                                className="text-[9px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                                            >
                                                Clear all
                                            </button>
                                        )}
                                    </div>
                                    {notifications.length === 0 ? (
                                        <div className="px-4 py-6 text-center text-gray-500 text-xs italic">
                                            No new notifications
                                        </div>
                                    ) : (
                                        <ul className="max-h-64 overflow-y-auto divide-y divide-white/5">
                                            {notifications.map(n => (
                                                <li key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                                                    <span className="text-lg mt-0.5 shrink-0">
                                                        {n.type === 'reservation' ? '📅' : '💬'}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white text-[12px] font-medium leading-snug">{n.label}</p>
                                                        <p className="text-gray-500 text-[10px] mt-0.5">{n.time}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))}
                                                        className="text-gray-600 hover:text-white text-xs mt-0.5 shrink-0 transition-colors"
                                                        title="Dismiss"
                                                    >
                                                        ✕
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                    </h2>
                </div>

                {/* Scrollable Nav */}
                <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                    <button
                        onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors rounded-sm ${activeTab === 'overview' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <LayoutDashboard size={18} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Overview</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('reservations'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors rounded-sm ${activeTab === 'reservations' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Calendar size={18} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Reservations</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('chat'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors rounded-sm ${activeTab === 'chat' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <MessageSquare size={18} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Live Chat</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('menu'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors rounded-sm ${activeTab === 'menu' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Coffee size={18} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Menu</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('history'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors rounded-sm ${activeTab === 'history' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <FileText size={18} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Our History</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('pages'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors rounded-sm ${activeTab === 'pages' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <FileText size={18} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Pages</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('content'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors rounded-sm ${activeTab === 'content' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Type size={18} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Site Content</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('events'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors rounded-sm ${activeTab === 'events' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Calendar size={18} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Events</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('gallery'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors rounded-sm ${activeTab === 'gallery' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <ImageIcon size={18} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Gallery</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('marketing'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors rounded-sm ${activeTab === 'marketing' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Users size={18} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Customer Reviews</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('newsletter'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors rounded-sm ${activeTab === 'newsletter' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Mail size={18} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Newsletter List</span>
                    </button>

                    {userRole === 'admin' && (
                        <>
                            <button
                                onClick={() => { setActiveTab('appearance'); setIsSidebarOpen(false); }}
                                className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors rounded-sm ${activeTab === 'appearance' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                <Type size={18} />
                                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Appearance</span>
                            </button>
                            <button
                                onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
                                className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors rounded-sm ${activeTab === 'settings' ? 'bg-[#CDA235] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                <Settings size={18} />
                                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Settings</span>
                            </button>
                        </>
                    )}
                </nav>

                {/* Footer — always at bottom, never overlaps nav */}
                <div className="px-6 py-4 border-t border-white/10 space-y-1 flex-shrink-0">
                    <button onClick={() => window.open('/', '_blank')} className="w-full flex items-center gap-4 px-4 py-3 text-left text-gray-400 hover:text-white transition-colors border border-white/10 hover:border-white/30 rounded-sm">
                        <Globe size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">View Site</span>
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 text-left text-gray-400 hover:text-red-400 transition-colors rounded-sm">
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
