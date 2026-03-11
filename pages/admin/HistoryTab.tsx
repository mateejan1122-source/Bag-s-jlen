import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Image as ImageIcon } from 'lucide-react';

export const HistoryTab: React.FC = () => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [activeLang, setActiveLang] = useState<'da' | 'en' | 'de'>('da');
    const [isTranslating, setIsTranslating] = useState(false);

    // Base keys without language suffix
    const baseKeys = ['history_tag', 'history_title', 'history_text1', 'history_full_text', 'history_readMore', 'history_image_url', 'history_link_url'];

    const fetchSettings = async () => {
        setLoading(true);
        const { data } = await supabase.from('settings').select('*');
        if (data) {
            const s = data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string>);
            setSettings(prev => ({ ...prev, ...s }));
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSettings();
    }, []);

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
            alert('History details saved successfully!');
        } catch (err: any) {
            console.error(err);
            alert(`Failed to save details. ${err.message || ''}`);
        } finally {
            setLoading(false);
        }
    };

    const getFormKey = (baseKey: string) => {
        // Image URL and Link URL are language-agnostic
        if (baseKey === 'history_image_url' || baseKey === 'history_link_url') return baseKey;
        if (activeLang === 'da') return baseKey;
        return `${baseKey}_${activeLang}`;
    };

    const updateSetting = (baseKey: string, value: string) => {
        setSettings({ ...settings, [getFormKey(baseKey)]: value });
    };

    const handleAutoTranslate = async () => {
        setIsTranslating(true);
        try {
            const sourceLang = activeLang;
            
            const keysToTranslate = ['history_tag', 'history_title', 'history_text1', 'history_full_text', 'history_readMore'];
            const targetLangs = ['da', 'en', 'de'].filter(l => l !== sourceLang);
            
            const newSettings = { ...settings };
            let hasText = false;

            for (const key of keysToTranslate) {
                const sourceKey = sourceLang === 'da' ? key : `${key}_${sourceLang}`;
                const textToTranslate = settings[sourceKey];
                
                if (textToTranslate && textToTranslate.trim() !== '') {
                    hasText = true;
                    for (const targetLang of targetLangs) {
                        const targetKey = targetLang === 'da' ? key : `${key}_${targetLang}`;
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
                            newSettings[targetKey] = data.translations[0].text;
                        }
                    }
                }
            }
            
            if (!hasText) {
                alert('Please enter some text in the current language tab before translating.');
                setIsTranslating(false);
                return;
            }
            
            setSettings(newSettings);
            alert('Translation complete! Please review the other tabs to verify.');
            
        } catch (error) {
            console.error('Translation error:', error);
            alert('Failed to auto-translate. The free translation service might be temporarily unavailable.');
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300 max-w-3xl">
            <div className="mb-8 border-b border-[#CDA235]/20 pb-8">
                <span className="text-[#CDA235] text-[11px] font-bold tracking-[0.5em] uppercase block mb-2">ABOUT US</span>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl md:text-5xl serif italic text-[#1a1a1a]">Our History</h1>
                        <p className="text-gray-500 mt-4 text-sm font-light">Manage the text and images for the History section on the Homepage.</p>
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-sm shadow-inner">
                        <button
                            type="button"
                            onClick={() => setActiveLang('da')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-sm ${activeLang === 'da' ? 'bg-white shadow text-[#CDA235]' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            DA
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveLang('en')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-sm ${activeLang === 'en' ? 'bg-white shadow text-[#CDA235]' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            EN
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveLang('de')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-sm ${activeLang === 'de' ? 'bg-white shadow text-[#CDA235]' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            DE
                        </button>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSave} className="bg-white p-8 border border-gray-100 shadow-xl space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#CDA235]/5 rounded-bl-full pointer-events-none"></div>

                <div className="flex justify-between items-center bg-gray-50 p-4 border border-gray-100">
                    <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Auto-Translation Settings</div>
                    <button 
                        type="button" 
                        onClick={handleAutoTranslate}
                        disabled={isTranslating}
                        className="text-[10px] bg-white border border-gray-200 px-4 py-2 font-bold uppercase tracking-widest text-[#CDA235] hover:border-[#CDA235] transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isTranslating ? 'Translating...' : '✨ Auto-Translate All Fields'}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-6 relative z-10">
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Section Tag (eg. VORES HISTORIE)</label>
                        <input
                            type="text"
                            value={settings[getFormKey('history_tag')] || ''}
                            onChange={(e) => updateSetting('history_tag', e.target.value)}
                            className="w-full text-sm font-bold tracking-widest uppercase border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors bg-transparent"
                            placeholder="VORES HISTORIE"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Read More Button</label>
                        <input
                            type="text"
                            value={settings[getFormKey('history_readMore')] || ''}
                            onChange={(e) => updateSetting('history_readMore', e.target.value)}
                            className="w-full text-sm font-bold tracking-widest uppercase border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors bg-transparent"
                            placeholder="LÆS HELE HISTORIEN"
                        />
                    </div>
                </div>

                <div className="relative z-10">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Main Headline</label>
                    <input
                        type="text"
                        value={settings[getFormKey('history_title')] || ''}
                        onChange={(e) => updateSetting('history_title', e.target.value)}
                        className="w-full text-3xl serif border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors bg-transparent italic"
                        placeholder="Over 30 år i Rønde"
                    />
                </div>

                <div className="relative z-10">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">Short Homepage Description</label>
                    <textarea
                        value={settings[getFormKey('history_text1')] || ''}
                        onChange={(e) => updateSetting('history_text1', e.target.value)}
                        className="w-full text-base font-light text-gray-600 leading-relaxed border border-gray-200 p-5 focus:outline-none focus:border-[#CDA235] transition-colors min-h-[120px] bg-gray-50/50"
                        placeholder="Restaurant Bag Søjlen har gennem mere end 30 år været en fast del af Rønde..."
                    />
                </div>

                <div className="relative z-10">
                    <div className="flex justify-between items-end mb-3">
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold">Full Complete History (For the separate History Page)</label>
                    </div>
                    <textarea
                        value={settings[getFormKey('history_full_text')] || ''}
                        onChange={(e) => updateSetting('history_full_text', e.target.value)}
                        className="w-full text-base font-light text-gray-600 leading-relaxed border border-gray-200 p-5 focus:outline-none focus:border-[#CDA235] transition-colors min-h-[300px] bg-gray-50/50 resize-y"
                        placeholder="Write the complete history of the restaurant here. This text will appear when visitors click the 'Read Full History' button..."
                    />
                </div>

                <div className="pt-8 border-t border-gray-100 relative z-10">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4 flex items-center gap-2">
                        <ImageIcon size={14} className="text-[#CDA235]" /> Section Image
                    </label>
                    <div className="flex gap-6 items-start">
                        <div className="flex-1 space-y-4">
                            <div>
                                <input
                                    type="url"
                                    value={settings['history_image_url'] || ''}
                                    onChange={(e) => setSettings({ ...settings, history_image_url: e.target.value })}
                                    className="w-full text-sm border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors bg-transparent"
                                    placeholder="https://example.com/image.jpg"
                                />
                                <p className="text-[10px] tracking-wide text-gray-400 mt-2">Paste a direct image URL. This image applies across all languages.</p>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Read More Button Destination URL / Slug</label>
                                <input
                                    type="text"
                                    value={settings['history_link_url'] || ''}
                                    onChange={(e) => setSettings({ ...settings, history_link_url: e.target.value })}
                                    className="w-full text-sm border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors bg-transparent"
                                    placeholder="/vores-historie"
                                />
                                <p className="text-[10px] tracking-wide text-gray-400 mt-2">The page this button navigates to (eg. "/vores-historie").</p>
                            </div>
                        </div>
                        {settings['history_image_url'] && (
                            <div className="w-32 h-32 border border-gray-100 shadow-md flex-shrink-0 bg-gray-50 p-1">
                                <img src={settings['history_image_url']} alt="History preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-6 relative z-10">
                    <button type="submit" disabled={loading} className="w-full py-5 bg-[#1a1a1a] text-white text-[11px] uppercase font-bold tracking-[0.4em] shadow-xl hover:bg-[#CDA235] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1">
                        {loading ? 'Saving...' : 'Save History Content'}
                    </button>
                </div>
            </form>
        </div>
    );
};
