import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Language } from '../translations';
import { useParams, useNavigate } from 'react-router-dom';

export const DynamicPage: React.FC<{ language: Language }> = ({ language }) => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPage = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('pages')
                    .select('*')
                    .eq('slug', slug)
                    .eq('is_published', true)
                    .single();

                if (error || !data) {
                    navigate('/'); // Auto redirect or show 404
                } else {
                    setPage(data);
                }
            } catch (err) {
                console.error(err);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchPage();
    }, [slug, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center pt-32 pb-24 text-center">
                <span className="text-[#CDA235] text-[10px] uppercase tracking-[0.4em] font-bold block mb-4 animate-pulse">Loading Page...</span>
            </div>
        );
    }

    if (!page) return null;

    const getTranslatedText = (key: string, defaultVal: string) => {
        if (language === 'en' && page[`${key}_en`]) return page[`${key}_en`];
        if (language === 'de' && page[`${key}_de`]) return page[`${key}_de`];
        return page[key] || defaultVal;
    };

    const displayTitle = getTranslatedText('title', page.title);
    const displayContent = getTranslatedText('content', page.content);

    return (
        <div className="bg-[#FAF9F6] min-h-screen pb-24 w-full">
            {page.banner_image && (
                <div className="w-full h-[40vh] md:h-[60vh] relative mb-16">
                    <div className="absolute inset-0 bg-black/30 z-10" />
                    <img src={page.banner_image} alt={displayTitle} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl serif italic text-white text-center px-4 drop-shadow-lg">
                            {displayTitle}
                        </h1>
                    </div>
                </div>
            )}
            <div className={`max-w-4xl mx-auto px-6 md:px-12 ${page.banner_image ? 'mt-0' : 'pt-32'}`}>
                {!page.banner_image && (
                    <>
                        <span className="text-[11px] font-semibold tracking-[0.4em] uppercase block mb-3" style={{ color: '#CDA235' }}>
                            {language === 'da' ? 'SIDE' : language === 'de' ? 'SEITE' : 'PAGE'}
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl italic text-[#1a1a1a] mb-12" style={{ fontFamily: '"Playfair Display", serif', letterSpacing: '0.01em', fontWeight: 400 }}>
                            {displayTitle}
                        </h1>
                    </>
                )}

                <div
                    className="dynamic-content max-w-none w-full"
                    dangerouslySetInnerHTML={{ __html: displayContent || '' }}
                />
            </div>
        </div>
    );
};
