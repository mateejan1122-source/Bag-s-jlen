import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Language, translations } from '../translations';
import { BookingData } from '../types';

export const AdminDashboard: React.FC<{ language: Language }> = ({ language }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState('');
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

    const correctPasscode = '8410'; // A simple hardcoded passcode (maybe the zip code from the footer)

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (passcode === correctPasscode) {
            setIsAuthenticated(true);
            setError('');
            fetchBookings();
        } else {
            setError(language === 'da' ? 'Forkert adgangskode' : 'Incorrect passcode');
            setPasscode('');
        }
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const { data, error: dbError } = await supabase
                .from('bookings')
                .select('*')
                .order('date', { ascending: false })
                .order('time', { ascending: true });

            if (dbError) throw dbError;
            setBookings(data || []);
        } catch (err) {
            console.error(err);
            setError('Kunne ikke hente reservationer / Could not fetch reservations');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const { error: updateError } = await supabase
                .from('bookings')
                .update({ status: newStatus })
                .eq('id', id);

            if (updateError) throw updateError;

            // Update local state without refetching all
            setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="bg-[#FAF9F6] min-h-[800px] py-32 px-8 flex flex-col items-center justify-center">
                <div className="bg-white p-16 shadow-2xl border border-gray-100 max-w-lg w-full relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-full h-[4px] bg-[#CDA235]"></div>
                    <span className="text-[#CDA235] text-[10px] font-bold tracking-[0.4em] uppercase block mb-4">ADMINISTRATOR</span>
                    <h2 className="text-4xl serif italic text-[#1a1a1a] mb-12">Login</h2>

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="flex flex-col gap-3">
                            <input
                                type="password"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                                placeholder="Passcode..."
                                className="border-b border-gray-200 py-4 text-center text-2xl tracking-[0.5em] outline-none focus:border-[#CDA235] serif italic bg-transparent"
                            />
                        </div>
                        {error && <p className="text-red-500 text-xs italic">{error}</p>}
                        <button
                            type="submit"
                            disabled={passcode.length < 3}
                            className={`w-full py-6 text-[11px] font-bold uppercase tracking-[0.5em] transition-all shadow-xl ${passcode.length >= 3 ? 'bg-[#1a1a1a] text-white hover:bg-[#CDA235]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Enter Dashboard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const filteredBookings = bookings.filter(b => statusFilter === 'all' || b.status === statusFilter);

    return (
        <div className="bg-[#FAF9F6] min-h-screen py-24 px-6 md:px-12 w-full">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-[#CDA235]/20 pb-8">
                    <div>
                        <span className="text-[#CDA235] text-[11px] font-bold tracking-[0.5em] uppercase block mb-2">OVERVIEW</span>
                        <h1 className="text-5xl serif italic text-[#1a1a1a]">Reservations Dashboard</h1>
                    </div>
                    <div className="flex gap-4 mt-6 md:mt-0">
                        {(['all', 'pending', 'confirmed', 'cancelled'] as const).map(filter => (
                            <button
                                key={filter}
                                onClick={() => setStatusFilter(filter)}
                                className={`text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 transition-all ${statusFilter === filter ? 'bg-[#1a1a1a] text-white' : 'text-gray-400 hover:text-[#CDA235]'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                        <button onClick={fetchBookings} className="text-[#CDA235] hover:text-[#1a1a1a] ml-4 text-xl" title="Refresh">
                            ↻
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-32 text-gray-400 text-[12px] uppercase tracking-[0.4em] font-bold">
                        Indlæser reservationer...
                    </div>
                ) : (
                    <div className="bg-white shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-gray-100 overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-[#faf9f6]">
                                    <th className="py-6 px-8 text-[10px] font-bold text-[#CDA235] uppercase tracking-[0.3em] border-b border-gray-100">Date & Time</th>
                                    <th className="py-6 px-8 text-[10px] font-bold text-[#CDA235] uppercase tracking-[0.3em] border-b border-gray-100">Guest</th>
                                    <th className="py-6 px-8 text-[10px] font-bold text-[#CDA235] uppercase tracking-[0.3em] border-b border-gray-100">Contact</th>
                                    <th className="py-6 px-8 text-[10px] font-bold text-[#CDA235] uppercase tracking-[0.3em] border-b border-gray-100 w-1/4">Notes</th>
                                    <th className="py-6 px-8 text-[10px] font-bold text-[#CDA235] uppercase tracking-[0.3em] border-b border-gray-100 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-gray-400 text-[12px] uppercase tracking-[0.2em] font-bold italic">
                                            Ingen reservationer fundet / No reservations found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBookings.map((booking) => (
                                        <tr key={booking.id} className="border-b border-gray-50 hover:bg-[#faf9f6]/50 transition-colors group">
                                            <td className="py-6 px-8">
                                                <div className="font-bold text-[#1a1a1a] tracking-wider">{booking.date}</div>
                                                <div className="text-gray-400 italic serif mt-1">{booking.time}</div>
                                            </td>
                                            <td className="py-6 px-8">
                                                <div className="serif text-lg italic text-[#1a1a1a]">{booking.fullName}</div>
                                                <div className="text-[10px] bg-gray-100 text-gray-500 inline-block px-2 py-1 mt-2 tracking-widest font-bold">
                                                    {booking.guests} GÆSTER
                                                </div>
                                            </td>
                                            <td className="py-6 px-8">
                                                <div className="text-sm text-gray-600 mb-1">{booking.email}</div>
                                                <div className="text-sm text-gray-500">{booking.phone}</div>
                                            </td>
                                            <td className="py-6 px-8">
                                                <div className="text-sm text-gray-500 italic max-h-16 overflow-y-auto pr-2 custom-scrollbar">
                                                    {booking.specialRequests || '-'}
                                                </div>
                                            </td>
                                            <td className="py-6 px-8 flex justify-center mt-2 gap-2">
                                                {booking.status === 'pending' ? (
                                                    <>
                                                        <button onClick={() => updateStatus(booking.id, 'confirmed')} className="w-8 h-8 flex items-center justify-center bg-[#CDA235]/10 text-[#CDA235] hover:bg-[#CDA235] hover:text-white transition-all rounded-full" title="Confirm">
                                                            ✓
                                                        </button>
                                                        <button onClick={() => updateStatus(booking.id, 'cancelled')} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-full" title="Cancel">
                                                            ✕
                                                        </button>
                                                    </>
                                                ) : booking.status === 'confirmed' ? (
                                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#CDA235] border border-[#CDA235]/30 px-3 py-1 bg-[#CDA235]/5">
                                                        Confirmed
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400 border border-red-100 px-3 py-1 bg-red-50">
                                                        Cancelled
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
