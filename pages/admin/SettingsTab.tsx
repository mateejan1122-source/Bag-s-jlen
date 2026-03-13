import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save } from 'lucide-react';

export const SettingsTab: React.FC = () => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'setting' | 'email_templates' | 'api_keys'>('setting');

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
                category: key.startsWith('email_template_') ? 'email_template' : key.startsWith('contact_') ? 'contact' : key.startsWith('hours_') ? 'hours' : key.endsWith('_api_key') || key === 'active_ai_provider' || key === 'enable_voice_replies' ? 'api' : 'general',
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
                    <div className="flex justify-center mb-12">
                        <div className="inline-flex bg-gray-50/80 p-1.5 rounded-md">
                            <button
                                onClick={() => setActiveTab('setting')}
                                className={`px-8 py-3 text-[11px] font-bold uppercase tracking-widest transition-all rounded-sm ${activeTab === 'setting' ? 'bg-white text-[#CDA235] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Setting
                            </button>
                            <button
                                onClick={() => setActiveTab('email_templates')}
                                className={`px-8 py-3 text-[11px] font-bold uppercase tracking-widest transition-all rounded-sm ${activeTab === 'email_templates' ? 'bg-white text-[#CDA235] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Email Templates
                            </button>
                            <button
                                onClick={() => setActiveTab('api_keys')}
                                className={`px-8 py-3 text-[11px] font-bold uppercase tracking-widest transition-all rounded-sm ${activeTab === 'api_keys' ? 'bg-white text-[#CDA235] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                API Keys
                            </button>
                        </div>
                    </div>

                    {activeTab === 'setting' && (
                        <div className="space-y-12">
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
                </div>
                )}

                {activeTab === 'email_templates' && (
                    <div className="bg-white shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-gray-100 p-8">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-8">
                            <h3 className="text-lg font-bold tracking-[0.3em] uppercase text-[#CDA235]">Automated Email Templates</h3>
                            <p className="text-xs text-gray-500 italic max-w-sm text-right">Use variables: {'{name}, {date}, {time}, {guests}'}</p>
                        </div>
                        
                        <div className="space-y-16">
                            {(['confirmation', 'rejection', 'cancellation']).map((emailType) => (
                                <div key={emailType} className="border border-gray-100 p-6 bg-gray-50/50">
                                    <h4 className="text-sm font-bold tracking-[0.2em] uppercase text-[#1a1a1a] mb-6">{emailType} Email</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {(['da', 'en', 'de']).map((lang) => (
                                            <div key={lang} className="space-y-4">
                                                <div className="text-[10px] uppercase font-bold tracking-widest text-[#CDA235] border-b border-gray-200 pb-2 mb-4">
                                                    {lang === 'da' ? 'Danish' : lang === 'en' ? 'English' : 'German'}
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-[10px] text-gray-500 font-bold mb-1">Subject</label>
                                                    <input
                                                        type="text"
                                                        value={settings[`email_template_${emailType}_${lang}_subject`] || ''}
                                                        onChange={e => handleSettingChange(`email_template_${emailType}_${lang}_subject`, e.target.value)}
                                                        className="w-full text-sm border-b border-gray-300 py-2 focus:outline-none focus:border-[#CDA235] transition-colors bg-white px-2"
                                                        placeholder={`Default ${lang.toUpperCase()} Subject`}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] text-gray-500 font-bold mb-1">Body Text (HTML)</label>
                                                    <textarea
                                                        value={settings[`email_template_${emailType}_${lang}_body`] || ''}
                                                        onChange={e => handleSettingChange(`email_template_${emailType}_${lang}_body`, e.target.value)}
                                                        className="w-full text-sm border border-gray-300 p-3 focus:outline-none focus:border-[#CDA235] transition-colors min-h-[150px] bg-white font-mono"
                                                        placeholder={`<p>Dear {name},</p>...`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                    {activeTab === 'api_keys' && (
                        <div className="space-y-12 animate-in slide-in-from-right-4 fade-in duration-300">
                            <div className="bg-white shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-gray-100 p-8">
                                <h3 className="text-lg font-bold tracking-[0.3em] uppercase text-[#CDA235] mb-8 border-b border-gray-100 pb-4">AI Integration & APIs</h3>
                                
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">OpenAI API Key</label>
                                            <input
                                                type="password"
                                                value={settings['openai_api_key'] || ''}
                                                onChange={e => handleSettingChange('openai_api_key', e.target.value)}
                                                placeholder="sk-..."
                                                className="w-full text-sm border-b border-gray-300 py-2 focus:outline-none focus:border-[#CDA235] transition-colors bg-transparent"
                                            />
                                            <p className="text-[10px] text-gray-400 mt-2">Required for GPT models and Whisper Voice Transcription.</p>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Groq API Key</label>
                                            <input
                                                type="password"
                                                value={settings['groq_api_key'] || ''}
                                                onChange={e => handleSettingChange('groq_api_key', e.target.value)}
                                                placeholder="gsk_..."
                                                className="w-full text-sm border-b border-gray-300 py-2 focus:outline-none focus:border-[#CDA235] transition-colors bg-transparent"
                                            />
                                            <p className="text-[10px] text-gray-400 mt-2">Required for fast LLaMA models and Whisper.</p>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">DeepSeek API Key</label>
                                            <input
                                                type="password"
                                                value={settings['deepseek_api_key'] || ''}
                                                onChange={e => handleSettingChange('deepseek_api_key', e.target.value)}
                                                placeholder="sk-..."
                                                className="w-full text-sm border-b border-gray-300 py-2 focus:outline-none focus:border-[#CDA235] transition-colors bg-transparent"
                                            />
                                            <p className="text-[10px] text-gray-400 mt-2">Required for DeepSeek Chat models.</p>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">ElevenLabs API Key</label>
                                            <input
                                                type="password"
                                                value={settings['elevenlabs_api_key'] || ''}
                                                onChange={e => handleSettingChange('elevenlabs_api_key', e.target.value)}
                                                className="w-full text-sm border-b border-gray-300 py-2 focus:outline-none focus:border-[#CDA235] transition-colors bg-transparent"
                                            />
                                            <p className="text-[10px] text-gray-400 mt-2">Required for AI Voice Generation (Text-to-Speech).</p>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold mb-4">Active AI Model</label>
                                            <select
                                                value={settings['active_ai_provider'] || 'openai'}
                                                onChange={e => handleSettingChange('active_ai_provider', e.target.value)}
                                                className="w-full text-sm border border-gray-300 py-3 px-4 focus:outline-none focus:border-[#CDA235] transition-colors bg-transparent"
                                            >
                                                <option value="openai">OpenAI (GPT-4o / GPT-3.5)</option>
                                                <option value="groq">Groq (LLaMA-3.3)</option>
                                                <option value="deepseek">DeepSeek (DeepSeek Chat)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold mb-4">Enable AI Voice Replies</label>
                                            <select
                                                value={settings['enable_voice_replies'] || 'false'}
                                                onChange={e => handleSettingChange('enable_voice_replies', e.target.value)}
                                                className="w-full text-sm border border-gray-300 py-3 px-4 focus:outline-none focus:border-[#CDA235] transition-colors bg-transparent"
                                            >
                                                <option value="false">Disabled (Text Only)</option>
                                                <option value="true">Enabled (Generate Audio via ElevenLabs)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Database Backups Export */}
                    <div className="bg-white shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-gray-100 p-8 mt-12">
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
