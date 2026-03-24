import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Settings2, Save } from 'lucide-react';

export const AppearanceTab: React.FC = () => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase.from('settings').select('*');
            if (error) throw error;
            const settingsMap = data.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
            setSettings(settingsMap);
        } catch (err) {
            console.error('Error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const upsertData = [
                { key: 'font_scale_menu', value: settings.font_scale_menu || '1', category: 'general' },
                { key: 'font_scale_headings', value: settings.font_scale_headings || '1', category: 'general' },
                { key: 'font_scale_body', value: settings.font_scale_body || '1', category: 'general' },
                { key: 'header_bg_scale', value: settings.header_bg_scale || '1', category: 'general' }
            ];

            const { error } = await supabase.from('settings').upsert(upsertData, { onConflict: 'key' });
            if (error) throw error;

            alert('Appearance settings saved successfully! Reloading...');
            window.location.reload();
        } catch (err: any) {
            console.error('Error saving settings:', err);
            alert(`Failed to save appearance settings. ${err.message || ''}`);
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (key: string, val: string) => setSettings(prev => ({ ...prev, [key]: val }));

    if (loading) return <div className="py-20 text-center text-gray-400">Loading...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-[#CDA235]/20 pb-8">
                <div>
                    <span className="text-[#CDA235] text-[11px] font-bold tracking-[0.5em] uppercase block mb-2">CUSTOMIZATION</span>
                    <h1 className="text-4xl md:text-5xl serif italic text-[#1a1a1a]">Appearance & Styles</h1>
                </div>
            </div>

            <form onSubmit={handleSave} className="bg-white border border-gray-100 p-8 shadow-sm space-y-12 max-w-4xl">

                {/* Typography Settings */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <Settings2 className="text-[#CDA235]" size={20} />
                        <h2 className="text-xl serif italic text-[#1a1a1a]">Typography Scaling</h2>
                    </div>

                    <div className="grid md:grid-cols-1 gap-10">
                        {/* Menu Scale */}
                        <div className="space-y-4 max-w-xl">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] uppercase tracking-widest text-[#CDA235] font-bold">Header & Footer Menus Size Menu</label>
                                <span className="text-sm font-bold text-gray-500">{settings.font_scale_menu || '1'}x</span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="1.5"
                                step="0.05"
                                value={settings.font_scale_menu || '1'}
                                onChange={e => updateSetting('font_scale_menu', e.target.value)}
                                className="w-full accent-[#CDA235] h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <p className="text-xs text-gray-400 font-light leading-relaxed">Adjust this slider to scale header and footer menus securely.</p>
                        </div>

                        {/* Headings Scale */}
                        <div className="space-y-4 max-w-xl">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] uppercase tracking-widest text-[#CDA235] font-bold">Headings Size Multiplier</label>
                                <span className="text-sm font-bold text-gray-500">{settings.font_scale_headings || '1'}x</span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="1.5"
                                step="0.05"
                                value={settings.font_scale_headings || '1'}
                                onChange={e => updateSetting('font_scale_headings', e.target.value)}
                                className="w-full accent-[#CDA235] h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <p className="text-xs text-gray-400 font-light leading-relaxed">Adjust this slider to universally scale Heading (h1-h6) sizes outside Event & T&C pages.</p>
                        </div>

                        {/* Body Scale */}
                        <div className="space-y-4 max-w-xl">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] uppercase tracking-widest text-[#CDA235] font-bold">Body Paragraphs Scale</label>
                                <span className="text-sm font-bold text-gray-500">{settings.font_scale_body || '1'}x</span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="1.5"
                                step="0.05"
                                value={settings.font_scale_body || '1'}
                                onChange={e => updateSetting('font_scale_body', e.target.value)}
                                className="w-full accent-[#CDA235] h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <p className="text-xs text-gray-400 font-light leading-relaxed">Adjust this slider to universally scale regular text sizes outside Event & T&C pages.</p>
                        </div>

                        {/* Header Background Scale */}
                        <div className="space-y-4 max-w-xl mt-6">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] uppercase tracking-widest text-[#CDA235] font-bold">Header Background Size Scale</label>
                                <span className="text-sm font-bold text-gray-500">{settings.header_bg_scale || '1'}x</span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="2.5"
                                step="0.05"
                                value={settings.header_bg_scale || '1'}
                                onChange={e => updateSetting('header_bg_scale', e.target.value)}
                                className="w-full accent-[#CDA235] h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <p className="text-xs text-gray-400 font-light leading-relaxed">Adjust this slider to increase or decrease the height of the black header background.</p>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-[#1a1a1a] text-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-[#CDA235] transition-colors flex items-center gap-3 disabled:opacity-50"
                    >
                        {saving ? 'SAVING...' : 'SAVE APPEARANCE'}
                        <Save size={16} />
                    </button>
                </div>
            </form>
        </div>
    );
};
