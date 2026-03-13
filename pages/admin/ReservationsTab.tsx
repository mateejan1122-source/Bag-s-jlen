import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Edit3, Trash2, Plus, Download, Search, Check, X } from 'lucide-react';

export const ReservationsTab: React.FC = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

    // New states for Advanced Features
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<'date' | 'fullName' | 'guests' | 'status'>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [isEditing, setIsEditing] = useState(false);
    const [editingBooking, setEditingBooking] = useState<any>({
        id: '', date: '', time: '', guests: 2, fullName: '', email: '', phone: '', specialRequests: '', status: 'pending'
    });

    useEffect(() => {
        fetchBookings();
    }, []);

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
            
            const targetBooking = bookings.find(b => b.id === id);
            
            if (targetBooking) {
                 try {
                     if (newStatus === 'cancelled' || newStatus === 'rejection') {
                         const emailType = targetBooking.status === 'confirmed' ? 'cancellation' : 'rejection';
                         await supabase.functions.invoke('send-booking-email', {
                             body: {
                                 type: emailType,
                                 name: targetBooking.fullName,
                                 email: targetBooking.email,
                                 date: targetBooking.date,
                                 time: targetBooking.time,
                                 guests: targetBooking.guests,
                                 language: 'da' 
                             }
                         });
                     } else if (newStatus === 'confirmed') {
                         await supabase.functions.invoke('send-booking-email', {
                             body: {
                                 type: 'confirmation',
                                 name: targetBooking.fullName,
                                 email: targetBooking.email,
                                 date: targetBooking.date,
                                 time: targetBooking.time,
                                 guests: targetBooking.guests,
                                 language: 'da' 
                             }
                         });
                     }
                 } catch (emailErr) {
                     console.error("Failed to send automatic status email:", emailErr);
                 }
            }
            
            setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingBooking.id) {
                const oldBooking = bookings.find(b => b.id === editingBooking.id);
                const { id, ...updateData } = editingBooking;
                const { error } = await supabase.from('bookings').update(updateData).eq('id', id);
                if (error) throw error;

                if (oldBooking && oldBooking.status !== updateData.status) {
                     try {
                         let emailType = '';
                         if (updateData.status === 'confirmed') emailType = 'confirmation';
                         else if (updateData.status === 'cancelled' || updateData.status === 'rejection') {
                             emailType = oldBooking.status === 'confirmed' ? 'cancellation' : 'rejection';
                         }
                         
                         if (emailType) {
                             await supabase.functions.invoke('send-booking-email', {
                                 body: {
                                     type: emailType,
                                     name: updateData.fullName,
                                     email: updateData.email,
                                     date: updateData.date,
                                     time: updateData.time,
                                     guests: updateData.guests,
                                     language: 'da'
                                 }
                             });
                         }
                     } catch (err) {
                         console.error("Failed to send status update email from edit:", err);
                     }
                }
            } else {
                const { id, ...newData } = editingBooking;
                const { error } = await supabase.from('bookings').insert([newData]);
                if (error) throw error;

                if (newData.status === 'confirmed' && newData.email) {
                     try {
                         await supabase.functions.invoke('send-booking-email', {
                             body: {
                                 type: 'confirmation',
                                 name: newData.fullName,
                                 email: newData.email,
                                 date: newData.date,
                                 time: newData.time,
                                 guests: newData.guests,
                                 language: 'da'
                             }
                         });
                     } catch (err) {
                         console.error("Failed to send creation confirmation email:", err);
                     }
                }
            }
            setIsEditing(false);
            fetchBookings();
        } catch (err: any) {
            console.error(err);
            alert(`Failed to save: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this reservation? This cannot be undone.')) return;
        setLoading(true);
        try {
            const targetBooking = bookings.find(b => b.id === id);
            
            // Added .select() so Supabase returns the rows that were ACTUALLY deleted.
            const { error, data } = await supabase.from('bookings').delete().eq('id', id).select();

            if (error) {
                console.error('Supabase Delete Error:', error);
                alert(`Failed to delete (Supabase Error): ${error.message || JSON.stringify(error)}`);
                throw error;
            }

            // If data is empty, it means RLS blocked the deletion and silently failed.
            if (!data || data.length === 0) {
                const rlsError = new Error('Row Level Security (RLS) policy blocked the deletion. Please check Supabase policies for the bookings table to allow DELETE operations.');
                rlsError.name = 'RLSError';
                throw rlsError;
            }

            if (targetBooking) {
                 try {
                     await supabase.functions.invoke('send-booking-email', {
                         body: {
                             type: 'cancellation',
                             name: targetBooking.fullName,
                             email: targetBooking.email,
                             date: targetBooking.date,
                             time: targetBooking.time,
                             guests: targetBooking.guests,
                             language: 'da'
                         }
                     });
                 } catch (emailErr) {
                     console.error("Failed to send automatic cancellation email:", emailErr);
                 }
            }

            fetchBookings();
        } catch (err: any) {
            console.error('Catch Error:', err);
            // Don't alert twice if it was a supabase error caught above
            if (!err.message?.includes('Supabase Error')) {
                alert(`Failed to delete: ${err.message || 'Unknown error occurred'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const exportToCsv = () => {
        if (filteredAndSortedBookings.length === 0) return;
        const headers = ['Date', 'Time', 'Name', 'Guests', 'Email', 'Phone', 'Requests', 'Status'];
        const rows = filteredAndSortedBookings.map(b => [
            b.date, b.time, `"${b.fullName}"`, b.guests, b.email, b.phone, `"${(b.specialRequests || '').replace(/"/g, '""')}"`, b.status
        ]);
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(',') + '\n'
            + rows.map(e => e.join(',')).join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `reservations_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredAndSortedBookings = bookings
        .filter(b => statusFilter === 'all' || b.status === statusFilter)
        .filter(b => {
            if (!searchQuery) return true;
            const term = searchQuery.toLowerCase();
            return (b.fullName || '').toLowerCase().includes(term) ||
                (b.email || '').toLowerCase().includes(term) ||
                (b.phone || '').toLowerCase().includes(term);
        })
        .sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];
            if (sortField === 'date') {
                valA = `${a.date}T${a.time}`;
                valB = `${b.date}T${b.time}`;
            }
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

    const handleSort = (field: 'date' | 'fullName' | 'guests' | 'status') => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    if (isEditing) {
        return (
            <div className="bg-white p-8 border border-gray-100 shadow-xl max-w-3xl animate-in fade-in">
                <h3 className="text-2xl serif italic mb-6">{editingBooking.id ? 'Edit Reservation' : 'New Reservation'}</h3>
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Full Name</label>
                            <input required type="text" value={editingBooking.fullName} onChange={e => setEditingBooking({ ...editingBooking, fullName: e.target.value })} className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors" placeholder="e.g. Christian Møller" />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Guests</label>
                            <input required type="number" min="1" value={editingBooking.guests} onChange={e => setEditingBooking({ ...editingBooking, guests: parseInt(e.target.value) || 1 })} className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Date</label>
                            <input required type="date" value={editingBooking.date} onChange={e => setEditingBooking({ ...editingBooking, date: e.target.value })} className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors" />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Time</label>
                            <input required type="time" value={editingBooking.time} onChange={e => setEditingBooking({ ...editingBooking, time: e.target.value })} className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Email</label>
                            <input type="email" value={editingBooking.email} onChange={e => setEditingBooking({ ...editingBooking, email: e.target.value })} className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors" placeholder="email@example.com" />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Phone</label>
                            <input type="tel" value={editingBooking.phone} onChange={e => setEditingBooking({ ...editingBooking, phone: e.target.value })} className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors" placeholder="+45..." />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Status</label>
                            <select value={editingBooking.status} onChange={e => setEditingBooking({ ...editingBooking, status: e.target.value })} className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors bg-white">
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Special Requests / Notes</label>
                        <textarea value={editingBooking.specialRequests} onChange={e => setEditingBooking({ ...editingBooking, specialRequests: e.target.value })} className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors min-h-[80px]" placeholder="Any dietary restrictions or requests..." />
                    </div>

                    <div className="flex gap-4 pt-8 border-t border-gray-100">
                        <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 border border-gray-200 text-gray-600 text-[10px] uppercase font-bold tracking-widest hover:bg-gray-50 transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="px-8 py-3 bg-[#CDA235] text-white text-[10px] uppercase font-bold tracking-widest hover:bg-black transition-colors">
                            {loading ? 'Saving...' : 'Save Reservation'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-[#CDA235]/20 pb-8">
                <div>
                    <span className="text-[#CDA235] text-[11px] font-bold tracking-[0.5em] uppercase block mb-2">OVERVIEW</span>
                    <h1 className="text-4xl md:text-5xl serif italic text-[#1a1a1a]">Reservations Dashboard</h1>
                </div>
                <div className="flex flex-col gap-4 mt-6 md:mt-0 items-end">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search Name, Email, Phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-gray-200 text-sm focus:outline-none focus:border-[#CDA235] w-[250px]"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>
                        <button
                            type="button"
                            onClick={exportToCsv}
                            disabled={filteredAndSortedBookings.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download size={14} /> Export CSV
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setEditingBooking({ id: '', date: '', time: '', guests: 2, fullName: '', email: '', phone: '', specialRequests: '', status: 'pending' });
                                setIsEditing(true);
                            }}
                            className="bg-[#1a1a1a] text-white px-6 py-2 border border-transparent text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#CDA235] transition-colors flex items-center gap-2"
                        >
                            <Plus size={14} /> Add Reservation
                        </button>
                        <button type="button" onClick={fetchBookings} className="text-[#CDA235] hover:text-[#1a1a1a] px-2 text-xl flex items-center" title="Refresh">
                            ↻
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(['all', 'pending', 'confirmed', 'cancelled'] as const).map(filter => (
                            <button
                                type="button"
                                key={filter}
                                onClick={() => setStatusFilter(filter)}
                                className={`text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 transition-all border ${statusFilter === filter ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'text-gray-500 border-gray-200 hover:border-[#CDA235] hover:text-[#CDA235]'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-32 text-gray-400 text-[12px] uppercase tracking-[0.4em] font-bold">
                    Loading...
                </div>
            ) : (
                <div className="bg-white shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-gray-100 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-[#faf9f6]">
                                <th onClick={() => handleSort('date')} className="py-6 px-8 text-[10px] font-bold text-[#CDA235] uppercase tracking-[0.3em] border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                                    Date & Time {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('fullName')} className="py-6 px-8 text-[10px] font-bold text-[#CDA235] uppercase tracking-[0.3em] border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                                    Guest {sortField === 'fullName' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="py-6 px-8 text-[10px] font-bold text-[#CDA235] uppercase tracking-[0.3em] border-b border-gray-100 cursor-pointer">
                                    Contact
                                </th>
                                <th className="py-6 px-8 text-[10px] font-bold text-[#CDA235] uppercase tracking-[0.3em] border-b border-gray-100 w-1/4">Notes</th>
                                <th onClick={() => handleSort('status')} className="py-6 px-8 text-[10px] font-bold text-[#CDA235] uppercase tracking-[0.3em] border-b border-gray-100 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                                    Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="py-6 px-8 text-[10px] font-bold text-[#CDA235] uppercase tracking-[0.3em] border-b border-gray-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-gray-400 text-[12px] uppercase tracking-[0.2em] font-bold italic">
                                        No reservations found
                                    </td>
                                </tr>
                            ) : (
                                filteredAndSortedBookings.map((booking) => (
                                    <tr key={booking.id} className="border-b border-gray-50 hover:bg-[#faf9f6]/50 transition-colors group">
                                        <td className="py-6 px-8">
                                            <div className="font-bold text-[#1a1a1a] tracking-wider">{booking.date}</div>
                                            <div className="text-gray-400 italic serif mt-1">{booking.time}</div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="serif text-lg italic text-[#1a1a1a]">{booking.fullName}</div>
                                            <div className="text-[10px] bg-gray-100 text-gray-500 inline-block px-2 py-1 mt-2 tracking-widest font-bold">
                                                {booking.guests} GUESTS
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
                                                    <button type="button" onClick={() => updateStatus(booking.id, 'confirmed')} className="w-8 h-8 flex items-center justify-center bg-[#CDA235]/10 text-[#CDA235] hover:bg-[#CDA235] hover:text-white transition-all rounded-full" title="Confirm">
                                                        ✓
                                                    </button>
                                                    <button type="button" onClick={() => updateStatus(booking.id, 'cancelled')} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-full" title="Cancel">
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
                                        <td className="py-6 px-8 text-right">
                                            <div className="flex justify-end gap-2 border-l border-gray-100 pl-4">
                                                <button type="button" onClick={() => { setEditingBooking(booking); setIsEditing(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors" title="Edit">
                                                    <Edit3 size={16} />
                                                </button>
                                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(booking.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
