import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Mail, Download } from 'lucide-react';

export const NewsletterTab: React.FC = () => {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false });
            if (error) throw error;
            setSubscribers(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSubscriber = async (id: string, email: string) => {
        if (!confirm(`Remove ${email} from the mailing list?`)) return;
        setLoading(true);
        try {
            await supabase.from('newsletter_subscribers').delete().eq('id', id);
            fetchSubscribers();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const exportSubscribers = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Email,Date Subscribed,Status\n"
            + subscribers.map(s => `${s.email},${new Date(s.subscribed_at).toLocaleDateString()},${s.status}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "newsletter_subscribers.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-[#CDA235]/20 pb-8">
                <div>
                    <span className="text-[#CDA235] text-[11px] font-bold tracking-[0.5em] uppercase block mb-2">AUDIENCE</span>
                    <h1 className="text-4xl md:text-5xl serif italic text-[#1a1a1a]">Newsletter Management</h1>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-end mb-6">
                    <div className="text-sm text-gray-500">
                        Total Subscribers: <span className="font-bold text-[#1a1a1a]">{subscribers.length}</span>
                    </div>
                    <button type="button" onClick={exportSubscribers} className="bg-gray-100 text-[#1a1a1a] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white border border-gray-200 transition-colors flex items-center gap-2">
                        <Download size={14} /> Export CSV
                    </button>
                </div>

                {loading && subscribers.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 text-[12px] uppercase tracking-[0.4em] font-bold">Loading List...</div>
                ) : subscribers.length === 0 ? (
                    <div className="py-24 text-center text-gray-400 text-[12px] uppercase tracking-[0.2em] font-bold italic bg-white border border-gray-100">
                        No subscribers yet.
                    </div>
                ) : (
                    <div className="bg-white shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-gray-100">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#faf9f6]">
                                    <th className="py-4 px-6 text-[10px] font-bold text-[#CDA235] uppercase tracking-[0.3em] border-b border-gray-100">Email Address</th>
                                    <th className="py-4 px-6 text-[10px] font-bold text-[#CDA235] uppercase tracking-[0.3em] border-b border-gray-100">Joined</th>
                                    <th className="py-4 px-6 text-[10px] font-bold text-[#CDA235] uppercase tracking-[0.3em] border-b border-gray-100">Status</th>
                                    <th className="py-4 px-6"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscribers.map(sub => (
                                    <tr key={sub.id} className="border-b border-gray-50 hover:bg-[#faf9f6]/50 transition-colors">
                                        <td className="py-4 px-6 font-medium text-gray-800 flex items-center gap-3">
                                            <Mail size={16} className="text-[#CDA235]/40" /> {sub.email}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500">
                                            {new Date(sub.subscribed_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-[10px] uppercase tracking-widest font-bold bg-green-50 text-green-600 border border-green-200 px-2 py-1">Active</span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button type="button" onClick={() => handleDeleteSubscriber(sub.id, sub.email)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors" title="Remove">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
