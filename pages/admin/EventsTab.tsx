import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit3, Trash2, Calendar, Image as ImageIcon } from 'lucide-react';

export const EventsTab: React.FC = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState({
        id: '',
        title: '',
        description: '',
        end_date: '',
        image_url: '',
        is_published: true,
        details: {
            top_tag: 'BEGIVENHED',
            hero_date: '',
            paragraph_1: '',
            paragraph_2: '',
            info_title: 'MENUEN BYDER BLANDT ANDET PÅ:',
            bullet_points: '',
            paragraph_3: '',
            price_text: '',
            booking_btn_text: 'BESTIL BORD TIL ARRANGEMENTET',
            time_text: '',
            location_text: 'Restaurant Bag Søjlen\nHovedgaden 5, 8410 Rønde'
        }
    });

    const handleDetailsChange = (field: string, value: string) => {
        setEditingItem(prev => ({
            ...prev,
            details: { ...prev.details, [field]: value }
        }));
    };

    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('start_date', { ascending: true });

            if (error) throw error;
            setEvents(data || []);
        } catch (err) {
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        setUploadingImage(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `event_${Math.random()}.${fileExt}`;
            const filePath = `events/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('public-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('public-images')
                .getPublicUrl(filePath);

            setEditingItem(prev => ({ ...prev, image_url: publicUrl }));
        } catch (err: any) {
            console.error('Error uploading image', err.message);
            alert('Failed to upload image. Ensure public-images bucket exists.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Nullify empty dates
            const payload = {
                ...editingItem,
                start_date: editingItem.start_date || null,
                end_date: editingItem.end_date || null,
            };

            if (editingItem.id) {
                const { error } = await supabase.from('events').update(payload).eq('id', editingItem.id);
                if (error) throw error;
            } else {
                const { id, ...newItem } = payload;
                const { error } = await supabase.from('events').insert([newItem]);
                if (error) throw error;
            }
            setIsEditing(false);
            fetchEvents();
        } catch (err: any) {
            console.error('Error saving item:', err);
            alert(`Failed to save event: ${err.message || 'Unknown database error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('events').delete().eq('id', id);
            if (error) throw error;
            fetchEvents();
        } catch (err) {
            console.error('Error deleting:', err);
        } finally {
            setLoading(false);
        }
    };

    if (isEditing) {
        return (
            <div className="bg-white p-8 border border-gray-100 shadow-xl max-w-3xl animate-in fade-in">
                <h3 className="text-2xl serif italic mb-6">{editingItem.id ? 'Edit Event' : 'Create New Event'}</h3>
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Event Title</label>
                        <input required type="text" value={editingItem.title} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} className="w-full text-lg border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors" placeholder="e.g. Valentine's Day Special Menu" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Start Date (Optional)</label>
                            <input type="date" value={editingItem.start_date} onChange={e => setEditingItem({ ...editingItem, start_date: e.target.value })} className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors" />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">End Date (Optional)</label>
                            <input type="date" value={editingItem.end_date} onChange={e => setEditingItem({ ...editingItem, end_date: e.target.value })} className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Top Tag</label>
                            <input type="text" value={editingItem.details?.top_tag || ''} onChange={e => handleDetailsChange('top_tag', e.target.value)} className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235]" placeholder="e.g. BEGIVENHED" />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Display Date (Hero Override)</label>
                            <input type="text" value={editingItem.details?.hero_date || ''} onChange={e => handleDetailsChange('hero_date', e.target.value)} className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235]" placeholder="e.g. FREDAG 6. - 8. MARTS 2026" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Paragraph 1 (Main Description)</label>
                        <textarea value={editingItem.details?.paragraph_1 || editingItem.description || ''} onChange={e => handleDetailsChange('paragraph_1', e.target.value)} className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] min-h-[100px]" placeholder="Drømmer du om en aften fyldt med..." />
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Paragraph 2</label>
                        <textarea value={editingItem.details?.paragraph_2 || ''} onChange={e => handleDetailsChange('paragraph_2', e.target.value)} className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] min-h-[80px]" placeholder="Glæd dig til en kulinarisk rejse..." />
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Event Banner Image</label>
                        <div className="flex items-center gap-6">
                            <div className="w-48 h-32 bg-gray-50 border border-gray-200 flex flex-col items-center justify-center overflow-hidden relative">
                                {editingItem.image_url ? (
                                    <img src={editingItem.image_url} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="text-gray-300" size={32} />
                                )}
                                {uploadingImage && <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest">Uploading...</div>}
                            </div>
                            <div className="flex-1">
                                <label className="cursor-pointer bg-[#1a1a1a] text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] inline-block hover:bg-[#CDA235] transition-colors">
                                    Upload Banner
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </label>
                                <p className="text-xs text-gray-400 mt-2">Max 5MB. 16:9 ratio recommended.</p>
                                <div className="mt-4">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">Or Image URL</label>
                                    <input type="text" value={editingItem.image_url} onChange={e => setEditingItem({ ...editingItem, image_url: e.target.value })} className="w-full text-sm border-b border-gray-200 py-2 focus:outline-none focus:border-[#CDA235]" placeholder="https://..." />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 border border-gray-100 space-y-6 mt-8">
                        <h4 className="text-xl serif italic text-[#1a1a1a]">Event Flyer Details</h4>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Info Section Title</label>
                            <input type="text" value={editingItem.details?.info_title || ''} onChange={e => handleDetailsChange('info_title', e.target.value)} className="w-full text-base border-b border-gray-300 py-3 bg-transparent focus:outline-none focus:border-[#CDA235]" />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Menu / Bullet Points (One per line)</label>
                            <textarea value={editingItem.details?.bullet_points || ''} onChange={e => handleDetailsChange('bullet_points', e.target.value)} className="w-full text-base border-b border-gray-300 py-3 bg-transparent focus:outline-none focus:border-[#CDA235] min-h-[120px]" placeholder="Bruschetta med røget laks&#10;Vitello Tonnato" />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Paragraph 3 (Below Menu)</label>
                            <textarea value={editingItem.details?.paragraph_3 || ''} onChange={e => handleDetailsChange('paragraph_3', e.target.value)} className="w-full text-base border-b border-gray-300 py-3 bg-transparent focus:outline-none focus:border-[#CDA235] min-h-[80px]" />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 border border-gray-100 space-y-6 mt-8">
                        <h4 className="text-xl serif italic text-[#1a1a1a]">Booking Banner Setup</h4>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Price Banner Text</label>
                            <input type="text" value={editingItem.details?.price_text || ''} onChange={e => handleDetailsChange('price_text', e.target.value)} className="w-full text-base border-b border-gray-300 py-3 bg-transparent focus:outline-none focus:border-[#CDA235]" placeholder="Prisen er 750,- pr. person..." />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Booking Button Label</label>
                            <input type="text" value={editingItem.details?.booking_btn_text || ''} onChange={e => handleDetailsChange('booking_btn_text', e.target.value)} className="w-full text-base border-b border-gray-300 py-3 bg-transparent focus:outline-none focus:border-[#CDA235]" placeholder="BESTIL BORD TIL ARRANGEMENTET" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Location Address Text (Optional)</label>
                                <textarea value={editingItem.details?.location_text || ''} onChange={e => handleDetailsChange('location_text', e.target.value)} className="w-full text-base border-b border-gray-300 py-3 bg-transparent focus:outline-none focus:border-[#CDA235] min-h-[60px]" placeholder="Restaurant Bag Søjlen..." />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Time Details</label>
                                <input type="text" value={editingItem.details?.time_text || ''} onChange={e => handleDetailsChange('time_text', e.target.value)} className="w-full text-base border-b border-gray-300 py-3 bg-transparent focus:outline-none focus:border-[#CDA235]" placeholder="Kl. 18.00" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                        <input type="checkbox" id="is_published" checked={editingItem.is_published} onChange={e => setEditingItem({ ...editingItem, is_published: e.target.checked })} className="w-4 h-4 accent-[#CDA235]" />
                        <label htmlFor="is_published" className="text-sm font-bold text-gray-700">Published (Visible to public)</label>
                    </div>

                    <div className="flex gap-4 pt-8">
                        <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 border border-gray-200 text-gray-600 text-[10px] uppercase font-bold tracking-widest hover:bg-gray-50 transition-colors">Cancel</button>
                        <button type="submit" disabled={loading || uploadingImage} className="px-8 py-3 bg-[#CDA235] text-white text-[10px] uppercase font-bold tracking-widest hover:bg-black transition-colors">
                            {loading ? 'Saving...' : 'Save Event'}
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
                    <span className="text-[#CDA235] text-[11px] font-bold tracking-[0.5em] uppercase block mb-2">PROMOTIONS</span>
                    <h1 className="text-4xl md:text-5xl serif italic text-[#1a1a1a]">Events & Offers</h1>
                </div>
                <button
                    onClick={() => {
                        setEditingItem({
                            id: '',
                            title: '',
                            description: '',
                            start_date: '',
                            end_date: '',
                            image_url: '',
                            is_published: true,
                            details: {
                                top_tag: 'BEGIVENHED',
                                hero_date: '',
                                paragraph_1: '',
                                paragraph_2: '',
                                info_title: 'MENUEN BYDER BLANDT ANDET PÅ:',
                                bullet_points: '',
                                paragraph_3: '',
                                price_text: '',
                                booking_btn_text: 'BESTIL BORD TIL ARRANGEMENTET',
                                time_text: '',
                                location_text: 'Restaurant Bag Søjlen\nHovedgaden 5, 8410 Rønde'
                            }
                        });
                        setIsEditing(true);
                    }}
                    className="bg-[#1a1a1a] text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#CDA235] transition-colors flex items-center gap-2 mt-4 md:mt-0"
                >
                    <Plus size={14} /> Create Event
                </button>
            </div>

            {loading && events.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-[12px] uppercase tracking-[0.4em] font-bold">Loading Events...</div>
            ) : events.length === 0 ? (
                <div className="py-24 text-center text-gray-400 text-[12px] uppercase tracking-[0.2em] font-bold italic bg-white border border-gray-100">
                    No active events or promotions.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {events.map(event => (
                        <div key={event.id} className={`bg-white border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col group ${!event.is_published && 'opacity-70 border-dashed'}`}>
                            {event.image_url ? (
                                <div className="h-48 w-full overflow-hidden bg-gray-100 relative">
                                    <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    {!event.is_published && <div className="absolute top-4 right-4 bg-orange-500 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1">Draft</div>}
                                </div>
                            ) : (
                                <div className="h-48 w-full bg-gray-50 border-b border-gray-100 flex items-center justify-center text-gray-300 relative">
                                    <Calendar size={48} strokeWidth={1} />
                                    {!event.is_published && <div className="absolute top-4 right-4 bg-orange-500 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1">Draft</div>}
                                </div>
                            )}

                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-2xl serif italic text-[#1a1a1a] mb-2">{event.title}</h3>
                                {(event.start_date || event.end_date) && (
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#CDA235] mb-4 flex items-center gap-2">
                                        <Calendar size={12} />
                                        {event.start_date ? new Date(event.start_date).toLocaleDateString() : 'Now'}
                                        {event.end_date && ` - ${new Date(event.end_date).toLocaleDateString()}`}
                                    </div>
                                )}
                                <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">{event.description}</p>

                                <div className="flex gap-2 justify-end border-t border-gray-50 pt-4 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => {
                                        setEditingItem({
                                            ...event,
                                            details: event.details || {
                                                top_tag: 'BEGIVENHED',
                                                hero_date: '',
                                                paragraph_1: '',
                                                paragraph_2: '',
                                                info_title: 'MENUEN BYDER BLANDT ANDET PÅ:',
                                                bullet_points: '',
                                                paragraph_3: '',
                                                price_text: '',
                                                booking_btn_text: 'BESTIL BORD TIL ARRANGEMENTET',
                                                time_text: '',
                                                location_text: 'Restaurant Bag Søjlen\nHovedgaden 5, 8410 Rønde'
                                            }
                                        });
                                        setIsEditing(true);
                                    }} className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 text-blue-500 hover:text-blue-700 px-3 py-2 bg-blue-50 transition-colors">
                                        <Edit3 size={14} /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(event.id, event.title)} className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 text-red-500 hover:text-red-700 px-3 py-2 bg-red-50 transition-colors">
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
