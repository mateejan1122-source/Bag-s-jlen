import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save } from 'lucide-react';

export const SettingsTab: React.FC = () => {
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

            // Map array to object map
            const stgs: Record<string, string> = {};
            data?.forEach(item => {
                stgs[item.key] = item.value;
            });
            setSettings(stgs);
        } catch (err) {
            console.error('Error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSettingChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveAll = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Upsert all modified keys. We categorize them based on key prefix
            const upsertData = Object.entries(settings).map(([key, value]) => ({
                key,
                value,
                category: key.startsWith('contact_') ? 'contact' : key.startsWith('hours_') ? 'hours' : 'general',
            }));

            const { error } = await supabase.from('settings').upsert(upsertData, { onConflict: 'key' });
            if (error) throw error;

            alert('Settings saved successfully!');
            fetchSettings();
        } catch (err) {
            console.error('Error saving settings:', err);
            alert('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    const handleExportBackup = async () => {
        setLoading(true);
        try {
            const tables = ['pages', 'site_content', 'menu_items', 'settings', 'events', 'gallery', 'reviews'];
            const backupData: any = {};

            for (const table of tables) {
                const { data } = await supabase.from(table).select('*');
                backupData[table] = data || [];
            }

            const jsonString = JSON.stringify(backupData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `bag_sojlen_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Backup failed:', err);
            alert('Backup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-[#CDA235]/20 pb-8">
                <div>
                    <span className="text-[#CDA235] text-[11px] font-bold tracking-[0.5em] uppercase block mb-2">CONFIGURATION</span>
                    <h1 className="text-4xl md:text-5xl serif italic text-[#1a1a1a]">Global Settings</h1>
                </div>
                <button
                    onClick={handleSaveAll}
                    disabled={saving || loading}
                    className="bg-[#CDA235] text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-colors flex items-center gap-2 mt-4 md:mt-0 disabled:opacity-50"
                >
                    <Save size={14} /> {saving ? 'Saving...' : 'Save All Settings'}
                </button>
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-400 text-[12px] uppercase tracking-[0.4em] font-bold">Loading Settings...</div>
            ) : (
                <div className="space-y-12 pb-24">
                    {/* Security Information */}
                    <div className="bg-white shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-gray-100 p-8">
                        <h3 className="text-lg font-bold tracking-[0.3em] uppercase text-[#CDA235] mb-8 border-b border-gray-100 pb-4">Admin Security</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Admin Username</label>
                                <input
                                    type="text"
                                    value={settings['admin_username'] || ''}
                                    onChange={e => handleSettingChange('admin_username', e.target.value)}
                                    className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors"
                                    placeholder="admin"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Admin Password</label>
                                <input
                                    type="text"
                                    value={settings['admin_password'] || ''}
                                    onChange={e => handleSettingChange('admin_password', e.target.value)}
                                    className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors"
                                    placeholder="8410"
                                />
                            </div>
                        </div>
                    </div>

                    {/* General Details */}
                    <div className="bg-white shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-gray-100 p-8">
                        <h3 className="text-lg font-bold tracking-[0.3em] uppercase text-[#CDA235] mb-8 border-b border-gray-100 pb-4">General Details</h3>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Copyright Line</label>
                            <input
                                type="text"
                                value={settings['general_copyright'] || ''}
                                onChange={e => handleSettingChange('general_copyright', e.target.value)}
                                className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors"
                                placeholder="© 2024 BAG SØJLEN. DANSK & FRANSK KØKKEN."
                            />
                            <p className="text-xs text-gray-400 mt-2">This text appears at the bottom of the website footer.</p>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-gray-100 p-8">
                        <h3 className="text-lg font-bold tracking-[0.3em] uppercase text-[#CDA235] mb-8 border-b border-gray-100 pb-4">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Phone Number</label>
                                <input
                                    type="text"
                                    value={settings['contact_phone'] || ''}
                                    onChange={e => handleSettingChange('contact_phone', e.target.value)}
                                    className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors"
                                    placeholder="+45 61 73 84 10"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={settings['contact_email'] || ''}
                                    onChange={e => handleSettingChange('contact_email', e.target.value)}
                                    className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors"
                                    placeholder="info@bagsojlen.dk"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Physical Address</label>
                                <input
                                    type="text"
                                    value={settings['contact_address'] || ''}
                                    onChange={e => handleSettingChange('contact_address', e.target.value)}
                                    className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors"
                                    placeholder="Bytorvet 1, 8410 Rønde, Denmark"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Google Maps Embed Link (Src)</label>
                                <input
                                    type="text"
                                    value={settings['contact_map_url'] || ''}
                                    onChange={e => handleSettingChange('contact_map_url', e.target.value)}
                                    className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors"
                                    placeholder="https://www.google.com/maps/embed?..."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Instagram URL</label>
                                <input
                                    type="text"
                                    value={settings['contact_instagram'] || ''}
                                    onChange={e => handleSettingChange('contact_instagram', e.target.value)}
                                    className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors"
                                    placeholder="https://instagram.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Facebook URL</label>
                                <input
                                    type="text"
                                    value={settings['contact_facebook'] || ''}
                                    onChange={e => handleSettingChange('contact_facebook', e.target.value)}
                                    className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors"
                                    placeholder="https://facebook.com/..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Opening Hours */}
                    <div className="bg-white shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-gray-100 p-8">
                        <h3 className="text-lg font-bold tracking-[0.3em] uppercase text-[#CDA235] mb-8 border-b border-gray-100 pb-4">Opening Hours</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).map((day) => (
                                <div key={day} className="flex items-center justify-between border-b border-gray-50 pb-4">
                                    <label className="text-[12px] uppercase tracking-widest text-gray-700 font-bold block w-32">{day}</label>
                                    <input
                                        type="text"
                                        value={settings[`hours_${day.toLowerCase()}`] || ''}
                                        onChange={e => handleSettingChange(`hours_${day.toLowerCase()}`, e.target.value)}
                                        className="flex-1 text-base border border-gray-200 px-4 py-2 focus:outline-none focus:border-[#CDA235] transition-colors text-right md:text-left"
                                        placeholder="11:30 - 20:30"
                                    />
                                </div>
                            ))}
                            <div className="col-span-1 md:col-span-2 pt-6">
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Special Notes / Holiday Closures</label>
                                <textarea
                                    value={settings['hours_notes'] || ''}
                                    onChange={e => handleSettingChange('hours_notes', e.target.value)}
                                    className="w-full text-base border border-gray-200 p-4 focus:outline-none focus:border-[#CDA235] transition-colors min-h-[100px]"
                                    placeholder="e.g. Closed December 24th - 26th"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Database Backups Export */}
                    <div className="bg-white shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-gray-100 p-8">
                        <h3 className="text-lg font-bold tracking-[0.3em] uppercase text-[#CDA235] mb-4 border-b border-gray-100 pb-4">Data Backup</h3>
                        <p className="text-sm text-gray-500 mb-6">Download a copy of your entire database (Pages, Content, Menu) as a JSON file to serve as a backup before making large edits.</p>
                        <button
                            className="bg-gray-100 text-gray-600 px-6 py-3 border border-gray-200 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white transition-colors flex items-center gap-2"
                            onClick={handleExportBackup}
                            disabled={loading}
                        >
                            Download Database Backup (.json)
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
};
