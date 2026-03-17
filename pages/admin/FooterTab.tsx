import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save } from 'lucide-react';

export const FooterTab: React.FC = () => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('settings').select('*');
            if (error) throw error;
            const stgs: Record<string, string> = {};
            data?.forEach(item => { stgs[item.key] = item.value; });
            setSettings(stgs);
        } catch (err) {
            console.error('Error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const set = (key: string, value: string) =>
        setSettings(prev => ({ ...prev, [key]: value }));

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const footerKeys = [
                'footer_desc', 'footer_desc_en', 'footer_desc_de',
                'footer_logo', 'footer_logo_size',
                'contact_address', 'contact_phone', 'contact_email',
                'contact_instagram', 'contact_facebook',
                'hours_monday', 'hours_tuesday', 'hours_wednesday',
                'hours_thursday', 'hours_friday', 'hours_saturday', 'hours_sunday',
                'hours_tuesday_saturday', 'hours_lunch_saturday', 'hours_sunday_monday',
                'hours_notes', 'general_copyright',
            ];

            const upsertData = footerKeys
                .filter(key => settings[key] !== undefined)
                .map(key => ({
                    key,
                    value: settings[key] || '',
                    category: key.startsWith('hours_') ? 'hours'
                        : key.startsWith('contact_') ? 'contact'
                        : key.startsWith('footer_') ? 'footer'
                        : 'general',
                }));

            const { error } = await supabase.from('settings').upsert(upsertData, { onConflict: 'key' });
            if (error) throw error;
            alert('Footer settings saved successfully!');
            fetchSettings();
        } catch (err) {
            console.error('Error saving settings:', err);
            alert('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    const inputClass = "w-full text-sm border-b border-gray-200 py-2.5 focus:outline-none focus:border-[#CDA235] transition-colors bg-transparent placeholder:text-gray-300";
    const labelClass = "block text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold mb-2";
    const cardClass = "bg-white shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-gray-100 p-8";

    return (
        <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-300 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end border-b border-[#CDA235]/20 pb-8">
                <div>
                    <span className="text-[#CDA235] text-[11px] font-bold tracking-[0.5em] uppercase block mb-2">CUSTOMIZATION</span>
                    <h1 className="text-4xl md:text-5xl italic font-light text-[#1a1a1a]" style={{ fontFamily: 'Georgia, serif' }}>Footer</h1>
                </div>
                <button
                    type="submit"
                    disabled={saving || loading}
                    className="bg-[#CDA235] text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-colors flex items-center gap-2 mt-4 md:mt-0 disabled:opacity-50"
                >
                    <Save size={14} /> {saving ? 'Saving...' : 'Save Footer'}
                </button>
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-400 text-[12px] uppercase tracking-[0.4em] font-bold">Loading...</div>
            ) : (
                <div className="space-y-8">

                    {/* Brand / Description */}
                    <div className={cardClass}>
                        <h3 className="text-sm font-bold tracking-[0.3em] uppercase text-[#CDA235] mb-8 border-b border-gray-100 pb-4">Brand</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={labelClass}>Footer Logo URL</label>
                                <input type="text" value={settings['footer_logo'] || ''} onChange={e => set('footer_logo', e.target.value)}
                                    placeholder="https://... (leave empty for default)" className={inputClass} />
                                <p className="text-[10px] text-gray-400 mt-2">If empty, the default SVG logo (inverted white) is used.</p>
                            </div>
                            <div>
                                <label className={labelClass}>Logo Height (px)</label>
                                <input type="number" value={settings['footer_logo_size'] || ''} onChange={e => set('footer_logo_size', e.target.value)}
                                    placeholder="e.g. 48" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Tagline / Description (Danish)</label>
                                <textarea rows={3} value={settings['footer_desc'] || ''} onChange={e => set('footer_desc', e.target.value)}
                                    placeholder="Short restaurant description shown under the logo..." className={`${inputClass} resize-none`} />
                            </div>
                            <div>
                                <label className={labelClass}>Tagline / Description (English)</label>
                                <textarea rows={3} value={settings['footer_desc_en'] || ''} onChange={e => set('footer_desc_en', e.target.value)}
                                    placeholder="English version..." className={`${inputClass} resize-none`} />
                            </div>
                            <div>
                                <label className={labelClass}>Copyright Line</label>
                                <input type="text" value={settings['general_copyright'] || ''} onChange={e => set('general_copyright', e.target.value)}
                                    placeholder={`© ${new Date().getFullYear()} BAG SØJLEN. DANSK & FRANSK KØKKEN.`} className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className={cardClass}>
                        <h3 className="text-sm font-bold tracking-[0.3em] uppercase text-[#CDA235] mb-8 border-b border-gray-100 pb-4">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={labelClass}>Physical Address</label>
                                <textarea rows={2} value={settings['contact_address'] || ''} onChange={e => set('contact_address', e.target.value)}
                                    placeholder={"Hauptstraße 5\n8410 Rønde"} className={`${inputClass} resize-none`} />
                            </div>
                            <div>
                                <label className={labelClass}>Phone Number</label>
                                <input type="text" value={settings['contact_phone'] || ''} onChange={e => set('contact_phone', e.target.value)}
                                    placeholder="+45 8637 3500" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Email Address</label>
                                <input type="email" value={settings['contact_email'] || ''} onChange={e => set('contact_email', e.target.value)}
                                    placeholder="info@bagsojlen.dk" className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className={cardClass}>
                        <h3 className="text-sm font-bold tracking-[0.3em] uppercase text-[#CDA235] mb-8 border-b border-gray-100 pb-4">Social Media</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={labelClass}>Instagram URL</label>
                                <input type="url" value={settings['contact_instagram'] || ''} onChange={e => set('contact_instagram', e.target.value)}
                                    placeholder="https://instagram.com/bagsojlen" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Facebook URL</label>
                                <input type="url" value={settings['contact_facebook'] || ''} onChange={e => set('contact_facebook', e.target.value)}
                                    placeholder="https://facebook.com/bagsojlen" className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* Opening Hours — Grouped (Reference-style) */}
                    <div className={cardClass}>
                        <h3 className="text-sm font-bold tracking-[0.3em] uppercase text-[#CDA235] mb-2 border-b border-gray-100 pb-4">Opening Hours — Footer Display</h3>
                        <p className="text-[11px] text-gray-400 mb-8">These values are displayed in the website footer. If left empty, default values are shown (e.g. "17.00 – 22.00").</p>
                        <div className="space-y-6">
                            {[
                                { key: 'hours_tuesday_saturday', label: 'Tuesday – Saturday', ph: '17.00 – 22.00' },
                                { key: 'hours_lunch_saturday', label: 'Lunch Saturday', ph: '12.00 – 15.00' },
                                { key: 'hours_sunday_monday', label: 'Sunday & Monday', ph: 'Closed. We open by appointment.' },
                            ].map(({ key, label, ph }) => (
                                <div key={key} className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 border-b border-gray-50 pb-4">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-[#CDA235] md:col-span-1">{label}</label>
                                    <input type="text" value={settings[key] || ''} onChange={e => set(key, e.target.value)}
                                        placeholder={ph}
                                        className="md:col-span-3 text-sm border border-gray-200 px-4 py-2.5 focus:outline-none focus:border-[#CDA235] transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Opening Hours — Day by Day */}
                    <div className={cardClass}>
                        <h3 className="text-sm font-bold tracking-[0.3em] uppercase text-[#CDA235] mb-2 border-b border-gray-100 pb-4">Opening Hours — Day by Day</h3>
                        <p className="text-[11px] text-gray-400 mb-8">Used as a fallback if grouped hours above are empty.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).map(day => (
                                <div key={day} className="flex items-center gap-4 border-b border-gray-50 pb-4">
                                    <label className="text-[11px] uppercase tracking-widest text-gray-700 font-bold w-28 shrink-0">{day}</label>
                                    <input type="text" value={settings[`hours_${day.toLowerCase()}`] || ''}
                                        onChange={e => set(`hours_${day.toLowerCase()}`, e.target.value)}
                                        placeholder="e.g. 17.00 - 22.00 or Closed" className="flex-1 text-sm border border-gray-200 px-3 py-2 focus:outline-none focus:border-[#CDA235] transition-colors" />
                                </div>
                            ))}
                        </div>
                        <div className="mt-8">
                            <label className={labelClass}>Special Notes / Holiday Closures</label>
                            <textarea rows={3} value={settings['hours_notes'] || ''} onChange={e => set('hours_notes', e.target.value)}
                                placeholder="e.g. Closed December 24th - 26th" className={`${inputClass} resize-none`} />
                        </div>
                    </div>

                </div>
            )}
        </form>
    );
};
