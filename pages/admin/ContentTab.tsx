import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Globe } from 'lucide-react';

export const ContentTab: React.FC = () => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [activeLang, setActiveLang] = useState<'da' | 'en' | 'de'>('da');

    // Base keys without language suffix
    const baseKeys = ['hero_welcome', 'hero_title', 'hero_subtitle', 'hero_btn_book', 'hero_btn_menu', 'footer_desc', 'events_tag', 'events_title', 'events_sub', 'events_phone', 'events_contact', 'events_localText', 'events_finalText'];

    const fetchSettings = async () => {
        setLoading(true);
        const { data } = await supabase.from('settings').select('*');
        if (data) {
            const s = data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string>);
            setSettings(prev => ({ ...prev, ...s }));
        }
        setLoading(false);
    };



    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Collect all settings across all languages
            const upsertData: any[] = [];
            baseKeys.forEach(baseKey => {
                const keys = [baseKey, `${baseKey}_en`, `${baseKey}_de`];
                keys.forEach(k => {
                    if (settings[k] !== undefined) {
                        upsertData.push({
                            key: k,
                            value: settings[k],
                            category: 'general'
                        });
                    }
                });
            });

            if (upsertData.length > 0) {
                const { error } = await supabase.from('settings').upsert(upsertData, { onConflict: 'key' });
                if (error) throw error;
            }
            alert('Content saved successfully!');
        } catch (err: any) {
            console.error(err);
            alert(`Failed to save content. ${err.message || ''}`);
        } finally {
            setLoading(false);
        }
    };

    const getFormKey = (baseKey: string) => {
        if (activeLang === 'da') return baseKey;
        return `${baseKey}_${activeLang}`;
    };

    const updateSetting = (baseKey: string, value: string) => {
        setSettings({ ...settings, [getFormKey(baseKey)]: value });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300 max-w-3xl">
            <div className="mb-8 border-b border-[#CDA235]/20 pb-8">
                <span className="text-[#CDA235] text-[11px] font-bold tracking-[0.5em] uppercase block mb-2">COPYWRITING</span>
                <div className="flex justify-between items-center">
                    <h1 className="text-4xl md:text-5xl serif italic text-[#1a1a1a]">Website Content</h1>
                    <div className="flex bg-gray-100 p-1 rounded-md">
                        <button
                            type="button"
                            onClick={() => setActiveLang('da')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded-sm ${activeLang === 'da' ? 'bg-white shadow text-[#CDA235]' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            Dansk
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveLang('en')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded-sm ${activeLang === 'en' ? 'bg-white shadow text-[#CDA235]' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            English
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveLang('de')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded-sm ${activeLang === 'de' ? 'bg-white shadow text-[#CDA235]' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            Deutsch
                        </button>
                    </div>
                </div>
                <p className="text-gray-500 mt-4 text-sm font-light">Manage translations for the Hero section and Footer.</p>
            </div>

            <form onSubmit={handleSave} className="bg-white p-8 border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.03)] space-y-8">
                <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Hero Welcome Text (Small Tag)</label>
                    <input
                        type="text"
                        value={settings[getFormKey('hero_welcome')] || ''}
                        onChange={(e) => updateSetting('hero_welcome', e.target.value)}
                        className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors"
                        placeholder="e.g. VELKOMMEN"
                    />
                </div>
                <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Main Hero Title</label>
                    <input
                        type="text"
                        value={settings[getFormKey('hero_title')] || ''}
                        onChange={(e) => updateSetting('hero_title', e.target.value)}
                        className="w-full text-2xl serif border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors"
                        placeholder="e.g. Bag Søjlen"
                    />
                </div>
                <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Hero Subtitle</label>
                    <textarea
                        value={settings[getFormKey('hero_subtitle')] || ''}
                        onChange={(e) => updateSetting('hero_subtitle', e.target.value)}
                        className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors min-h-[100px]"
                        placeholder="e.g. Et sted med smag..."
                    />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Primary Button (Left)</label>
                        <input
                            type="text"
                            value={settings[getFormKey('hero_btn_book')] || ''}
                            onChange={(e) => updateSetting('hero_btn_book', e.target.value)}
                            className="w-full text-sm font-bold tracking-widest uppercase border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235]"
                            placeholder="e.g. BESTIL BORD"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Secondary Button (Right)</label>
                        <input
                            type="text"
                            value={settings[getFormKey('hero_btn_menu')] || ''}
                            onChange={(e) => updateSetting('hero_btn_menu', e.target.value)}
                            className="w-full text-sm font-bold tracking-widest uppercase border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235]"
                            placeholder="e.g. SE MENUKORT"
                        />
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100">
                    <h3 className="text-xl serif italic mb-6">Private Events Section</h3>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Section Tag</label>
                                <input
                                    type="text"
                                    value={settings[getFormKey('events_tag')] || ''}
                                    onChange={(e) => updateSetting('events_tag', e.target.value)}
                                    className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235]"
                                    placeholder="e.g. PRIVATE ARRANGEMENTER"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Section Title</label>
                                <input
                                    type="text"
                                    value={settings[getFormKey('events_title')] || ''}
                                    onChange={(e) => updateSetting('events_title', e.target.value)}
                                    className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235]"
                                    placeholder="e.g. Skab minder sammen"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Main Description</label>
                            <textarea
                                value={settings[getFormKey('events_sub')] || ''}
                                onChange={(e) => updateSetting('events_sub', e.target.value)}
                                className="w-full text-sm font-light leading-relaxed border border-gray-200 p-4 focus:outline-none focus:border-[#CDA235] min-h-[100px]"
                                placeholder="Hos Restaurant Bag Søjlen hjælper vi gerne..."
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Phone Number</label>
                            <input
                                type="text"
                                value={settings['events_phone'] || ''}
                                onChange={(e) => setSettings({ ...settings, events_phone: e.target.value })}
                                className="w-full text-xl font-bold border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] text-[#1a1a1a]"
                                placeholder="8637 3500"
                            />
                            <p className="text-[10px] tracking-wide text-gray-400 mt-2">This number applies across all languages.</p>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Contact Box Title</label>
                            <input
                                type="text"
                                value={settings[getFormKey('events_contact')] || ''}
                                onChange={(e) => updateSetting('events_contact', e.target.value)}
                                className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235]"
                                placeholder="e.g. KONTAKT OS FOR ET TILBUD"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Contact Box Local Text</label>
                                <textarea
                                    value={settings[getFormKey('events_localText')] || ''}
                                    onChange={(e) => updateSetting('events_localText', e.target.value)}
                                    className="w-full text-sm font-light leading-relaxed border border-gray-200 p-4 focus:outline-none focus:border-[#CDA235] min-h-[100px]"
                                    placeholder="Vi råder over et separat lokale..."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Contact Box Final Text</label>
                                <textarea
                                    value={settings[getFormKey('events_finalText')] || ''}
                                    onChange={(e) => updateSetting('events_finalText', e.target.value)}
                                    className="w-full text-sm font-light leading-relaxed border border-gray-200 p-4 focus:outline-none focus:border-[#CDA235] min-h-[100px]"
                                    placeholder="Uanset anledning sørger vi for..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100">
                    <label className="block text-[10px] uppercase tracking-widest text-[#CDA235] font-bold mb-2">Footer Short Description</label>
                    <textarea
                        value={settings[getFormKey('footer_desc')] || ''}
                        onChange={(e) => updateSetting('footer_desc', e.target.value)}
                        className="w-full text-sm font-light leading-relaxed border border-gray-200 p-4 focus:outline-none focus:border-[#CDA235] transition-colors min-h-[120px]"
                        placeholder="e.g. Dansk & Fransk Køkken kombineret med moderne håndværk..."
                    />
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
