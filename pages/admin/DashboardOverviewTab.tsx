import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
    UtensilsCrossed, 
    CalendarCheck, 
    CalendarX, 
    CalendarDays, 
    Mail, 
    Send,
    TrendingUp
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';

export const DashboardOverviewTab: React.FC<{
    setActiveTab: (tab: any) => void;
}> = ({ setActiveTab }) => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalReservations: 0,
        confirmedReservations: 0,
        cancelledReservations: 0,
        newsletterSubmissions: 0,
        emailConfirmations: 0
    });

    const [totalTables, setTotalTables] = useState(100);
    const [editingTables, setEditingTables] = useState(false);
    const [tempTotalTables, setTempTotalTables] = useState(100);

    const [reservationData, setReservationData] = useState<any[]>([]);
    const [engagementData, setEngagementData] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Reservations
            const { data: bookings, error: bookingsError } = await supabase
                .from('bookings')
                .select('status, date');
            
            if (bookingsError) throw bookingsError;

            const total = bookings?.length || 0;
            const confirmed = bookings?.filter(b => b.status === 'confirmed').length || 0;
            const cancelled = bookings?.filter(b => b.status === 'cancelled').length || 0;

            // 2. Fetch Newsletters
            const { data: newsletters, error: newsletterError } = await supabase
                .from('newsletter_subscribers')
                .select('id, subscribed_at');

            // 3. Fetch Email Logs (Ensure this doesn't break if table doesn't exist yet)
            let emailCount = 0;
            try {
                const { count } = await supabase
                    .from('email_logs')
                    .select('*', { count: 'exact', head: true });
                emailCount = count || 0;
            } catch (e) {
                console.warn("email_logs table might not exist yet.");
            }

            // 4. Fetch total_tables setting
            const { data: tablesSetting } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'total_tables')
                .single();
            if (tablesSetting?.value) {
                const val = parseInt(tablesSetting.value, 10);
                if (!isNaN(val)) {
                    setTotalTables(val);
                    setTempTotalTables(val);
                }
            }

            setStats({
                totalReservations: total,
                confirmedReservations: confirmed,
                cancelledReservations: cancelled,
                newsletterSubmissions: newsletters?.length || 0,
                emailConfirmations: emailCount
            });

            // Prepare Chart Data (Last 7 Days)
            prepareChartData(bookings || [], newsletters || []);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const prepareChartData = (bookings: any[], newsletters: any[]) => {
        const today = new Date();
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        // 1. Reservation Data
        const resData = last7Days.map(date => {
            const dayBookings = bookings.filter(b => b.date === date);
            return {
                name: date.split('-').slice(1).join('/'),
                total: dayBookings.length,
                confirmed: dayBookings.filter(b => b.status === 'confirmed').length
            };
        });
        setReservationData(resData);

        // 2. Engagement Data (Mocking visitors, using real newsletters)
        const engData = last7Days.map(date => {
            const dayNewsletters = newsletters.filter(n => n.subscribed_at?.startsWith(date));
            return {
                name: date.split('-').slice(1).join('/'),
                visitors: Math.floor(Math.random() * 30) + 40, // Mock visitors trend
                newsletters: dayNewsletters.length
            };
        });
        setEngagementData(engData);
    };

    const saveTotalTables = async () => {
        await supabase.from('settings').upsert(
            { key: 'total_tables', value: String(tempTotalTables), category: 'general' },
            { onConflict: 'key' }
        );
        setTotalTables(tempTotalTables);
        setEditingTables(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-[#CDA235] text-[12px] font-bold uppercase tracking-[0.3em] animate-pulse">
                    Loading Dashboard...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-[#CDA235]/20 pb-8">
                <div>
                    <span className="text-[#CDA235] text-[11px] font-bold tracking-[0.5em] uppercase block mb-2">OVERVIEW</span>
                    <h1 className="text-4xl md:text-5xl serif italic text-[#1a1a1a]">Dashboard Summary</h1>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Bookings */}
                <div className="bg-white p-6 shadow-sm border border-gray-100 flex items-start justify-between group hover:border-[#CDA235]/50 transition-colors">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Reservations</p>
                        <h3 className="text-3xl serif italic text-[#1a1a1a]">{stats.totalReservations}</h3>
                    </div>
                    <div className="bg-[#FAF9F6] p-3 rounded-full text-[#CDA235] group-hover:scale-110 transition-transform">
                        <CalendarDays size={20} />
                    </div>
                </div>
                
                <div className="bg-white p-6 shadow-sm border border-gray-100 flex items-start justify-between group hover:border-[#CDA235]/50 transition-colors">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Confirmed</p>
                        <h3 className="text-3xl serif italic text-green-700">{stats.confirmedReservations}</h3>
                    </div>
                    <div className="bg-green-50 p-3 rounded-full text-green-600 group-hover:scale-110 transition-transform">
                        <CalendarCheck size={20} />
                    </div>
                </div>

                <div className="bg-white p-6 shadow-sm border border-gray-100 flex items-start justify-between group hover:border-[#CDA235]/50 transition-colors">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cancelled</p>
                        <h3 className="text-3xl serif italic text-red-700">{stats.cancelledReservations}</h3>
                    </div>
                    <div className="bg-red-50 p-3 rounded-full text-red-600 group-hover:scale-110 transition-transform">
                        <CalendarX size={20} />
                    </div>
                </div>

                {/* Total Tables Booked */}
                <div
                    onClick={() => { setTempTotalTables(totalTables); setEditingTables(!editingTables); }}
                    className="bg-white p-6 shadow-sm border border-gray-100 flex flex-col group hover:border-[#CDA235]/50 transition-colors relative overflow-hidden cursor-pointer"
                >
                    <div className="flex items-start justify-between">
                        <div className="z-10 relative">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Tables Booked</p>
                            <h3 className="text-3xl serif italic text-[#1a1a1a]">
                                {stats.confirmedReservations} <span className="text-lg text-gray-300">/</span> <span className="text-lg text-gray-400">{totalTables} tables</span>
                            </h3>
                        </div>
                        <div className="bg-[#CDA235]/10 p-3 rounded-full text-[#CDA235] group-hover:scale-110 transition-transform z-10 relative">
                            <UtensilsCrossed size={20} />
                        </div>
                    </div>
                    {editingTables && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3" onClick={e => e.stopPropagation()}>
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Total Tables</label>
                            <input
                                type="number"
                                min={1}
                                value={tempTotalTables}
                                onChange={e => setTempTotalTables(parseInt(e.target.value, 10) || 1)}
                                className="w-20 px-2 py-1 border border-gray-200 text-sm focus:outline-none focus:border-[#CDA235] text-center"
                            />
                            <button
                                onClick={saveTotalTables}
                                className="px-3 py-1 bg-[#CDA235] text-white text-[9px] font-bold uppercase tracking-widest hover:bg-[#1a1a1a] transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 shadow-sm border border-gray-100 flex items-start justify-between group hover:border-[#CDA235]/50 transition-colors">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Newsletters</p>
                        <h3 className="text-3xl serif italic text-[#1a1a1a]">{stats.newsletterSubmissions}</h3>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-full text-purple-600 group-hover:scale-110 transition-transform">
                        <Mail size={20} />
                    </div>
                </div>

                <div className="bg-white p-6 shadow-sm border border-gray-100 flex items-start justify-between group hover:border-[#CDA235]/50 transition-colors">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email Confirmations</p>
                        <h3 className="text-3xl serif italic text-[#1a1a1a]">{stats.emailConfirmations}</h3>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-full text-orange-600 group-hover:scale-110 transition-transform">
                        <Send size={20} />
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Reservations Chart */}
                <div className="bg-white p-6 shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="serif italic text-2xl text-[#1a1a1a]">Reservations (7 Days)</h3>
                        <TrendingUp size={18} className="text-[#CDA235]" />
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={reservationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#CDA235" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#CDA235" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '0px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }}
                                />
                                <Area type="monotone" dataKey="total" name="Total" stroke="#CDA235" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                                <Area type="monotone" dataKey="confirmed" name="Confirmed" stroke="#15803d" strokeWidth={2} fillOpacity={0} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Engagement Chart */}
                <div className="bg-white p-6 shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="serif italic text-2xl text-[#1a1a1a]">Site Engagement</h3>
                        <TrendingUp size={18} className="text-blue-500" />
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={engagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                <Tooltip 
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '0px', border: '1px solid #e5e7eb' }}
                                />
                                <Bar dataKey="visitors" name="Visitors" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="newsletters" name="Newsletters" fill="#CDA235" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-4">
                    <button 
                        onClick={() => setActiveTab('reservations')}
                        className="px-6 py-3 bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#CDA235] transition-colors"
                    >
                        Manage Reservations
                    </button>
                    <button 
                        onClick={() => setActiveTab('menu')}
                        className="px-6 py-3 bg-white border border-gray-200 text-[#1a1a1a] text-[10px] font-bold uppercase tracking-[0.2em] hover:border-[#CDA235] hover:text-[#CDA235] transition-colors"
                    >
                        Edit Menu
                    </button>
                    <button 
                        onClick={() => setActiveTab('marketing')}
                        className="px-6 py-3 bg-white border border-gray-200 text-[#1a1a1a] text-[10px] font-bold uppercase tracking-[0.2em] hover:border-[#CDA235] hover:text-[#CDA235] transition-colors"
                    >
                        View Newsletters
                    </button>
                </div>
            </div>
        </div>
    );
};
