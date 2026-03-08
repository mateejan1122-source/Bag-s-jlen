import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Image as ImageIcon } from 'lucide-react';

export const ContentTab: React.FC = () => {
    const [settings, setSettings] = useState<Record<string, string>>({
        hero_welcome: '', hero_title: '', hero_subtitle: '', hero_btn_book: '', hero_btn_menu: '', philosophy_img: '', seasonal_img: ''
    });
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        const { data } = await supabase.from('settings').select('*');
        if (data) {
            const s = data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string>);
            setSettings(prev => ({ ...prev, ...s }));
        }
        setLoading(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploadingImage(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `settings/${fileName}`;
            const { error: uploadError } = await supabase.storage.from('public-images').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('public-images').getPublicUrl(filePath);
            setSettings(prev => ({ ...prev, [key]: publicUrl }));
        } catch (err: any) {
            alert(`Failed to upload image. Error: ${err.message || 'Unknown error'}`);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const toUpdate = ['hero_welcome', 'hero_title', 'hero_subtitle', 'hero_btn_book', 'hero_btn_menu', 'philosophy_img', 'seasonal_img'];

        try {
            const upsertData = toUpdate
                .filter(key => settings[key] !== undefined && settings[key] !== null)
                .map(key => ({
                    key,
                    value: settings[key],
                    category: 'general'
                }));

            if (upsertData.length > 0) {
                const { error } = await supabase.from('settings').upsert(upsertData, { onConflict: 'key' });
                if (error) throw error;
            }
            alert('Homepage content updated successfully!');
        } catch (err: any) {
            console.error(err);
            alert(`Failed to save homepage content. ${err.message || ''}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300 max-w-3xl">
            <div className="mb-8 border-b border-[#CDA235]/20 pb-8">
                <span className="text-[#CDA235] text-[11px] font-bold tracking-[0.5em] uppercase block mb-2">COPYWRITING</span>
                <h1 className="text-4xl md:text-5xl serif italic text-[#1a1a1a]">Homepage Content</h1>
                <p className="text-gray-500 mt-4 text-sm font-light">Manage the main text and buttons shown immediately when users visit the site.</p>
            </div>

            <form onSubmit={handleSave} className="bg-white p-8 border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.03)] space-y-8">
                <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Hero Welcome Text (Small Tag)</label>
                    <input
                        type="text"
                        value={settings.hero_welcome || ''}
                        onChange={(e) => setSettings({ ...settings, hero_welcome: e.target.value })}
                        className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors"
                        placeholder="e.g. VELKOMMEN"
                    />
                </div>
                <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Main Hero Title</label>
                    <input
                        type="text"
                        value={settings.hero_title || ''}
                        onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                        className="w-full text-2xl serif border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors"
                        placeholder="e.g. Bag Søjlen"
                    />
                </div>
                <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Hero Subtitle</label>
                    <textarea
                        value={settings.hero_subtitle || ''}
                        onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                        className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors min-h-[100px]"
                        placeholder="e.g. Et sted med smag..."
                    />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Primary Button (Left)</label>
                        <input
                            type="text"
                            value={settings.hero_btn_book || ''}
                            onChange={(e) => setSettings({ ...settings, hero_btn_book: e.target.value })}
                            className="w-full text-sm font-bold tracking-widest uppercase border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235]"
                            placeholder="e.g. BESTIL BORD"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Secondary Button (Right)</label>
                        <input
                            type="text"
                            value={settings.hero_btn_menu || ''}
                            onChange={(e) => setSettings({ ...settings, hero_btn_menu: e.target.value })}
                            className="w-full text-sm font-bold tracking-widest uppercase border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235]"
                            placeholder="e.g. SE MENUKORT"
                        />
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100">
                    <h2 className="text-xl serif italic mb-6">Homepage Images</h2>

                    <div className="space-y-8">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Our Food Philosophy Image</label>
                            <div className="flex items-center gap-6">
                                <div className="w-32 h-32 bg-gray-50 border border-gray-200 flex flex-col items-center justify-center overflow-hidden relative">
                                    {settings.philosophy_img ? (
                                        <img src={settings.philosophy_img} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="text-gray-300" size={32} />
                                    )}
                                    {uploadingImage && <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest">Uploading...</div>}
                                </div>
                                <div className="flex-1">
                                    <label className="cursor-pointer bg-[#1a1a1a] text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] inline-block hover:bg-[#CDA235] transition-colors">
                                        Upload Image
                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'philosophy_img')} className="hidden" />
                                    </label>
                                    <div className="mt-4">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">Or Image URL</label>
                                        <input type="text" value={settings.philosophy_img || ''} onChange={(e) => setSettings({ ...settings, philosophy_img: e.target.value })} className="w-full text-sm border-b border-gray-200 py-2 focus:outline-none focus:border-[#CDA235]" placeholder="https://..." />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Seasonal Experiences Image</label>
                            <div className="flex items-center gap-6">
                                <div className="w-32 h-32 bg-gray-50 border border-gray-200 flex flex-col items-center justify-center overflow-hidden relative">
                                    {settings.seasonal_img ? (
                                        <img src={settings.seasonal_img} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="text-gray-300" size={32} />
                                    )}
                                    {uploadingImage && <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest">Uploading...</div>}
                                </div>
                                <div className="flex-1">
                                    <label className="cursor-pointer bg-[#1a1a1a] text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] inline-block hover:bg-[#CDA235] transition-colors">
                                        Upload Image
                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'seasonal_img')} className="hidden" />
                                    </label>
                                    <div className="mt-4">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">Or Image URL</label>
                                        <input type="text" value={settings.seasonal_img || ''} onChange={(e) => setSettings({ ...settings, seasonal_img: e.target.value })} className="w-full text-sm border-b border-gray-200 py-2 focus:outline-none focus:border-[#CDA235]" placeholder="https://..." />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6">
                    <button type="submit" disabled={loading} className="px-8 py-4 bg-[#CDA235] text-white text-[10px] uppercase font-bold tracking-widest hover:bg-black transition-colors disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Homepage Content'}
                    </button>
                </div>
            </form>
        </div>
    );
};
