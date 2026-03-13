import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface DynamicContentProps {
    pageSlug: string;
    sectionKey: string;
    fallback?: string;
}

export const DynamicContent: React.FC<DynamicContentProps> = ({ pageSlug, sectionKey, fallback = '' }) => {
    const [content, setContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const { data, error } = await supabase
                    .from('site_content')
                    .select('content_value')
                    .eq('page_slug', pageSlug)
                    .eq('section_key', sectionKey)
                    .single();

                if (!error && data) {
                    setContent(data.content_value);
                }
            } catch (err) {
                console.error('Error fetching dynamic content:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [pageSlug, sectionKey]);

    if (loading) return <span className="opacity-0">{fallback}</span>;

    // Use default fallback if not found
    if (content === null) return <>{fallback}</>;

    // Simple paragraph parser if multi-line is detected
    if (content.includes('\n')) {
        return (
            <>
                {content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 last:mb-0">
                        {paragraph}
                    </p>
                ))}
            </>
        );
    }

    return <>{content}</>;
};
