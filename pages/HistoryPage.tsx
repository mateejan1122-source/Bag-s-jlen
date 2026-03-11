import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Language, translations } from '../translations';

export const HistoryPage: React.FC<{ language: Language }> = ({ language }) => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const tHist = translations[language].history;

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('settings')
                    .select('*')
                    .like('key', 'history_%');

                if (data && !error) {
                    const s = data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string>);
                    setSettings(s);
                }
            } catch (err) {
                console.error("Failed to load history settings", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const getTransSetting = (baseKey: string) => {
        const langKey = language === 'da' ? baseKey : `${baseKey}_${language}`;
        return settings[langKey] || settings[baseKey];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center pt-32 pb-24 text-center">
                <span className="text-[#CDA235] text-[10px] uppercase tracking-[0.4em] font-bold block mb-4 animate-pulse">Loading History...</span>
            </div>
        );
    }

    const title = getTransSetting('history_title') || tHist.title;
    const bannerUrl = settings['history_image_url'] || 'https://i.pixi.mg/i/62fcaff217b2df779c5f1878.jpg';
    
    // Default to the short text if the admin hasn't provided a full text yet
    const rawFullText = getTransSetting('history_full_text') || getTransSetting('history_text1') || tHist.text1;
    
    // Convert newlines to paragraphs for basic formatting
    const formattedText = rawFullText.split('\n').filter((t: string) => t.trim() !== '').map((para: string, idx: number) => (
        <p key={idx} className="mb-6">{para}</p>
    ));

    return (
        <div className="bg-[#FAF9F6] min-h-screen pb-24 w-full animate-in fade-in duration-500">
            <div className="w-full h-[40vh] md:h-[60vh] relative mb-16 shadow-xl">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <img src={bannerUrl} alt={title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                    <span className="text-[#CDA235] text-[10px] md:text-[12px] font-bold tracking-[0.4em] md:tracking-[0.6em] uppercase block mb-6 drop-shadow-md">
                        {getTransSetting('history_tag') || tHist.tag}
                    </span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl serif italic text-white text-center px-4 drop-shadow-lg leading-tight">
                        {title}
                    </h1>
                </div>
            </div>
            <div className="max-w-3xl mx-auto px-6 md:px-12 mt-0">
                <div className="text-[16px] md:text-[18px] text-gray-700 leading-relaxed font-light font-serif">
                    {formattedText}
                </div>
                
                <div className="mt-16 flex justify-center">
                    <div className="w-16 h-px bg-[#CDA235]/40"></div>
                </div>
            </div>
        </div>
    );
};
