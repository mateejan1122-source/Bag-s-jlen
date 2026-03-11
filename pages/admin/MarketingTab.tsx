import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit3, Trash2, Mail, Star, Download } from 'lucide-react';

export const MarketingTab: React.FC = () => {
    const [activeSection, setActiveSection] = useState<'reviews' | 'newsletter'>('reviews');

    // Data States
    const [reviews, setReviews] = useState<any[]>([]);
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Editing State (Reviews)
    const [isEditingReview, setIsEditingReview] = useState(false);
    const [editingReview, setEditingReview] = useState({ id: '', author_name: '', rating: 5, content: '', content_en: '', content_de: '', is_published: true });
    const [activeLangMode, setActiveLangMode] = useState<'da' | 'en' | 'de'>('da');
    const [isTranslating, setIsTranslating] = useState(false);

    useEffect(() => {
        if (activeSection === 'reviews') {
            fetchReviews();
        } else {
            fetchSubscribers();
        }
    }, [activeSection]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setReviews(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

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

    const handleSaveReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingReview.id) {
                const { error } = await supabase.from('reviews').update({
                    author_name: editingReview.author_name,
                    rating: editingReview.rating,
                    content: editingReview.content,
                    content_en: editingReview.content_en,
                    content_de: editingReview.content_de,
                    is_published: editingReview.is_published
                }).eq('id', editingReview.id);
                if (error) throw error;
            } else {
                const { id, ...newReview } = editingReview;
                const { error } = await supabase.from('reviews').insert([newReview]);
                if (error) throw error;
            }
            setIsEditingReview(false);
            fetchReviews();
        } catch (err: any) {
            console.error('Supabase save error:', err);
            alert(`Failed to save review: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAutoTranslate = async () => {
        setIsTranslating(true);
        try {
            const sourceLang = activeLangMode;
            let textToTranslate = '';
            if (sourceLang === 'da') textToTranslate = editingReview.content;
            if (sourceLang === 'en') textToTranslate = editingReview.content_en;
            if (sourceLang === 'de') textToTranslate = editingReview.content_de;

            if (!textToTranslate || textToTranslate.trim() === '') {
                alert('Please enter some text in the current language tab first before translating.');
                setIsTranslating(false);
                return;
            }

            const targetLangs = ['da', 'en', 'de'].filter(l => l !== sourceLang);
            const newContent = { ...editingReview };

            for (const targetLang of targetLangs) {
                const deepLTarget = targetLang === 'en' ? 'EN-GB' : targetLang.toUpperCase();
                const { data, error } = await supabase.functions.invoke('translate', {
                    body: {
                        text: [textToTranslate],
                        target_lang: deepLTarget
                    }
                });
                
                if (error) {
                    console.error('DeepL Translation API Error:', error);
                    continue;
                }
                
                if (data?.translations?.[0]?.text) {
                    const translatedText = data.translations[0].text;
                    if (targetLang === 'da') newContent.content = translatedText;
                    if (targetLang === 'en') newContent.content_en = translatedText;
                    if (targetLang === 'de') newContent.content_de = translatedText;
                }
            }
            
            setEditingReview(newContent);
            alert('Translation complete! Please review the other tabs to verify.');
            
        } catch (error) {
            console.error('Translation error:', error);
            alert('Failed to auto-translate. The free translation service might be temporarily unavailable.');
        } finally {
            setIsTranslating(false);
        }
    };

    const handleDeleteReview = async (id: string) => {
        if (!confirm('Delete this review forever?')) return;
        setLoading(true);
        try {
            await supabase.from('reviews').delete().eq('id', id);
            fetchReviews();
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
                    <h1 className="text-4xl md:text-5xl serif italic text-[#1a1a1a]">Marketing & Reviews</h1>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-sm mt-4 md:mt-0">
                    <button type="button" onClick={() => { setActiveSection('reviews'); setIsEditingReview(false); }} className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeSection === 'reviews' ? 'bg-white shadow-sm text-[#CDA235]' : 'text-gray-500 hover:text-[#1a1a1a]'}`}>
                        Customer Reviews
                    </button>
                    <button type="button" onClick={() => { setActiveSection('newsletter'); setIsEditingReview(false); }} className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeSection === 'newsletter' ? 'bg-white shadow-sm text-[#CDA235]' : 'text-gray-500 hover:text-[#1a1a1a]'}`}>
                        Newsletter List
                    </button>
                </div>
            </div>

            {/* --- REVIEWS SECTION --- */}
            {activeSection === 'reviews' && (
                <>
                    {isEditingReview ? (
                        <div className="bg-white p-8 border border-gray-100 shadow-xl max-w-2xl animate-in fade-in">
                            <h3 className="text-2xl serif italic mb-6">{editingReview.id ? 'Edit Review' : 'Add Testimonial'}</h3>
                            <form onSubmit={handleSaveReview} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Customer Name</label>
                                    <input required type="text" value={editingReview.author_name} onChange={e => setEditingReview({ ...editingReview, author_name: e.target.value })} className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors" placeholder="e.g. John Doe" />
                                </div>
                                <div className="flex gap-4 items-center border-b border-gray-200 py-4">
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold w-24">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                type="button"
                                                key={star}
                                                onClick={() => setEditingReview({ ...editingReview, rating: star })}
                                                className={`transition-colors ${editingReview.rating >= star ? 'text-[#CDA235]' : 'text-gray-200'}`}
                                            >
                                                <Star fill={editingReview.rating >= star ? 'currentColor' : 'none'} size={24} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold">Review Content</label>
                                        <div className="flex gap-4 items-center">
                                            <button 
                                                type="button" 
                                                onClick={handleAutoTranslate}
                                                disabled={isTranslating}
                                                className="text-[9px] font-bold uppercase tracking-widest text-[#CDA235] hover:text-[#1a1a1a] transition-colors flex items-center gap-1 disabled:opacity-50"
                                            >
                                                {isTranslating ? 'Translating...' : '✨ Auto-Translate'}
                                            </button>
                                            <div className="flex bg-gray-100 p-1 rounded-sm">
                                                <button type="button" onClick={() => setActiveLangMode('da')} className={`px-4 py-1 text-[9px] font-bold uppercase tracking-widest transition-colors ${activeLangMode === 'da' ? 'bg-white shadow-sm text-[#CDA235]' : 'text-gray-500 hover:text-[#1a1a1a]'}`}>DA</button>
                                                <button type="button" onClick={() => setActiveLangMode('en')} className={`px-4 py-1 text-[9px] font-bold uppercase tracking-widest transition-colors ${activeLangMode === 'en' ? 'bg-white shadow-sm text-[#CDA235]' : 'text-gray-500 hover:text-[#1a1a1a]'}`}>EN</button>
                                                <button type="button" onClick={() => setActiveLangMode('de')} className={`px-4 py-1 text-[9px] font-bold uppercase tracking-widest transition-colors ${activeLangMode === 'de' ? 'bg-white shadow-sm text-[#CDA235]' : 'text-gray-500 hover:text-[#1a1a1a]'}`}>DE</button>
                                            </div>
                                        </div>
                                    </div>
                                    {activeLangMode === 'da' && (
                                        <textarea required value={editingReview.content} onChange={e => setEditingReview({ ...editingReview, content: e.target.value })} className="w-full text-base border border-gray-200 py-3 px-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#CDA235] transition-colors min-h-[120px]" placeholder="The food was amazing..." />
                                    )}
                                    {activeLangMode === 'en' && (
                                        <textarea value={editingReview.content_en || ''} onChange={e => setEditingReview({ ...editingReview, content_en: e.target.value })} className="w-full text-base border border-gray-200 py-3 px-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#CDA235] transition-colors min-h-[120px]" placeholder="English translation..." />
                                    )}
                                    {activeLangMode === 'de' && (
                                        <textarea value={editingReview.content_de || ''} onChange={e => setEditingReview({ ...editingReview, content_de: e.target.value })} className="w-full text-base border border-gray-200 py-3 px-4 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#CDA235] transition-colors min-h-[120px]" placeholder="German translation..." />
                                    )}
                                </div>
                                <div className="flex items-center gap-3 pt-4">
                                    <input type="checkbox" id="is_published" checked={editingReview.is_published} onChange={e => setEditingReview({ ...editingReview, is_published: e.target.checked })} className="w-4 h-4 accent-[#CDA235]" />
                                    <label htmlFor="is_published" className="text-sm font-bold text-gray-700">Display on Website</label>
                                </div>

                                <div className="flex gap-4 pt-8">
                                    <button type="button" onClick={() => setIsEditingReview(false)} className="px-6 py-3 border border-gray-200 text-gray-600 text-[10px] uppercase font-bold tracking-widest hover:bg-gray-50 transition-colors">Cancel</button>
                                    <button type="submit" disabled={loading} className="px-8 py-3 bg-[#CDA235] text-white text-[10px] uppercase font-bold tracking-widest hover:bg-black transition-colors">
                                        {loading ? 'Saving...' : 'Save Review'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div>
                            <div className="flex justify-end mb-6">
                                <button type="button" onClick={() => { setEditingReview({ id: '', author_name: '', rating: 5, content: '', content_en: '', content_de: '', is_published: true }); setIsEditingReview(true); }} className="bg-[#1a1a1a] text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#CDA235] transition-colors flex items-center gap-2">
                                    <Plus size={14} /> Add Testimonial
                                </button>
                            </div>

                            {loading && reviews.length === 0 ? (
                                <div className="text-center py-16 text-gray-400 text-[12px] uppercase tracking-[0.4em] font-bold">Loading Reviews...</div>
                            ) : reviews.length === 0 ? (
                                <div className="py-24 text-center text-gray-400 text-[12px] uppercase tracking-[0.2em] font-bold italic bg-white border border-gray-100">
                                    No reviews added yet.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {reviews.map(review => (
                                        <div key={review.id} className={`bg-white border border-gray-100 p-8 shadow-sm group ${!review.is_published && 'opacity-60'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-bold text-lg text-[#1a1a1a]">{review.author_name}</h4>
                                                    <div className="flex gap-1 text-[#CDA235] mt-1">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} strokeWidth={i < review.rating ? 0 : 2} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button type="button" onClick={() => { setEditingReview(review); setIsEditingReview(true); }} className="p-2 text-blue-500 hover:bg-blue-50 transition-colors"><Edit3 size={16} /></button>
                                                    <button type="button" onClick={() => handleDeleteReview(review.id)} className="p-2 text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 text-sm leading-relaxed italic border-l-2 border-[#CDA235]/30 pl-4 py-1">"{review.content}"</p>
                                            {!review.is_published && <span className="inline-block mt-4 text-[10px] uppercase font-bold tracking-widest bg-gray-100 text-gray-500 px-2 py-1">Hidden</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* --- NEWSLETTER SECTION --- */}
            {activeSection === 'newsletter' && (
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
                                        <tr key={sub.id} className="border-b border-gray-50 hover:bg-[#faf9f6]/50">
                                            <td className="py-4 px-6 font-medium text-gray-800 flex items-center gap-3">
                                                <Mail size={16} className="text-gray-400" /> {sub.email}
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
            )}
        </div>
    );
};
