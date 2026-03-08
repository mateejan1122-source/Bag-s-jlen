import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit3, Trash2, Globe, Image as ImageIcon } from 'lucide-react';
import DefaultEditor from 'react-simple-wysiwyg';

export const PagesTab: React.FC = () => {
    const [pages, setPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Page Editing States
    const [isEditingPage, setIsEditingPage] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [editingPageDetails, setEditingPageDetails] = useState({ id: '', title: '', slug: '', is_published: true, seo_title: '', meta_description: '', og_image: '', content: '', show_in_header: false, show_in_footer: false, banner_image: '' });

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('pages').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setPages(data || []);
        } catch (err) {
            console.error('Error fetching pages:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploadingImage(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `pages/${fileName}`;
            const { error: uploadError } = await supabase.storage.from('public-images').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('public-images').getPublicUrl(filePath);
            setEditingPageDetails(prev => ({ ...prev, banner_image: publicUrl }));
        } catch (err: any) {
            console.error('Error uploading image', err);
            alert(`Failed to upload image. Error: ${err.message || 'Unknown error'}`);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSavePage = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingPageDetails.id) {
                // Update
                const { error } = await supabase
                    .from('pages')
                    .update({
                        title: editingPageDetails.title,
                        slug: editingPageDetails.slug,
                        is_published: editingPageDetails.is_published,
                        seo_title: editingPageDetails.seo_title,
                        meta_description: editingPageDetails.meta_description,
                        og_image: editingPageDetails.og_image,
                        content: editingPageDetails.content,
                        show_in_header: editingPageDetails.show_in_header,
                        show_in_footer: editingPageDetails.show_in_footer,
                        banner_image: editingPageDetails.banner_image
                    })
                    .eq('id', editingPageDetails.id);
                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase
                    .from('pages')
                    .insert([{
                        title: editingPageDetails.title,
                        slug: editingPageDetails.slug,
                        is_published: editingPageDetails.is_published,
                        seo_title: editingPageDetails.seo_title,
                        meta_description: editingPageDetails.meta_description,
                        og_image: editingPageDetails.og_image,
                        content: editingPageDetails.content,
                        show_in_header: editingPageDetails.show_in_header,
                        show_in_footer: editingPageDetails.show_in_footer,
                        banner_image: editingPageDetails.banner_image
                    }]);
                if (error) throw error;
            }
            setIsEditingPage(false);
            fetchPages();
        } catch (err: any) {
            console.error('Error saving page:', err);
            alert(`Failed to save page. Error: ${err.message || 'Check console'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePage = async (id: string, slug: string) => {
        if (!confirm(`Are you sure you want to delete page "${slug}"? This is permanent.`)) return;
        setLoading(true);
        try {
            // Also delete associated site content
            await supabase.from('site_content').delete().eq('page_slug', slug);
            const { error } = await supabase.from('pages').delete().eq('id', id);
            if (error) throw error;
            fetchPages();
        } catch (err) {
            console.error('Error deleting page:', err);
        } finally {
            setLoading(false);
        }
    };

    if (isEditingPage) {
        return (
            <div className="bg-white p-8 border border-gray-100 shadow-xl max-w-2xl animate-in fade-in">
                <h3 className="text-2xl serif italic mb-6">{editingPageDetails.id ? 'Edit Page' : 'Create New Page'}</h3>
                <form onSubmit={handleSavePage} className="space-y-6">
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Page Title</label>
                        <input
                            required
                            type="text"
                            value={editingPageDetails.title}
                            onChange={(e) => setEditingPageDetails({ ...editingPageDetails, title: e.target.value })}
                            className="w-full text-lg border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors"
                            placeholder="e.g. About Us"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">URL Slug</label>
                        <div className="flex items-center">
                            <span className="text-gray-400 bg-gray-50 px-3 py-3 border-b border-gray-200">bagsojlen.dk/</span>
                            <input
                                required
                                type="text"
                                value={editingPageDetails.slug}
                                onChange={(e) => setEditingPageDetails({ ...editingPageDetails, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                className="w-full text-lg border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors"
                                placeholder="about"
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">Only letters, numbers, and hyphens.</p>
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold">Main Content</label>
                            <p className="text-[10px] text-gray-400">Use the toolbar to add Headings and Bullet Points</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-md overflow-hidden min-h-[400px]">
                            <DefaultEditor
                                value={editingPageDetails.content || ''}
                                onChange={(e) => setEditingPageDetails({ ...editingPageDetails, content: e.target.value })}
                                className="dynamic-content !min-h-[400px] border-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Banner Image</label>
                        <div className="flex items-center gap-6">
                            <div className="w-48 h-24 bg-gray-50 border border-gray-200 flex flex-col items-center justify-center overflow-hidden relative">
                                {editingPageDetails.banner_image ? (
                                    <img src={editingPageDetails.banner_image} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="text-gray-300" size={32} />
                                )}
                                {uploadingImage && <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest">Uploading...</div>}
                            </div>
                            <div className="flex-1">
                                <label className="cursor-pointer bg-[#1a1a1a] text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] inline-block hover:bg-[#CDA235] transition-colors">
                                    Upload New Banner
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </label>
                                <p className="text-xs text-gray-400 mt-2">Max 5MB. Recommended wide landscape format (e.g. 1920x800).</p>
                                <div className="mt-4">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">Or Image URL</label>
                                    <input type="text" value={editingPageDetails.banner_image || ''} onChange={e => setEditingPageDetails({ ...editingPageDetails, banner_image: e.target.value })} className="w-full text-sm border-b border-gray-200 py-2 focus:outline-none focus:border-[#CDA235]" placeholder="https://..." />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <h4 className="text-[12px] font-bold tracking-widest uppercase text-[#CDA235] mb-6">SEO & Social Media Sharing</h4>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">SEO Page Title</label>
                                <input
                                    type="text"
                                    value={editingPageDetails.seo_title || ''}
                                    onChange={(e) => setEditingPageDetails({ ...editingPageDetails, seo_title: e.target.value })}
                                    className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors"
                                    placeholder="Leave blank to use default Title"
                                />
                                <p className="text-[10px] text-gray-400 mt-2">Recommended length: 50-60 characters. Appears in browser tab and search results.</p>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Meta Description</label>
                                <textarea
                                    value={editingPageDetails.meta_description || ''}
                                    onChange={(e) => setEditingPageDetails({ ...editingPageDetails, meta_description: e.target.value })}
                                    className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors min-h-[80px]"
                                    placeholder="Brief summary of the page for search engines..."
                                />
                                <p className="text-[10px] text-gray-400 mt-2">Recommended length: 150-160 characters.</p>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Social Sharing Image (OG Image URL)</label>
                                <input
                                    type="text"
                                    value={editingPageDetails.og_image || ''}
                                    onChange={(e) => setEditingPageDetails({ ...editingPageDetails, og_image: e.target.value })}
                                    className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors"
                                    placeholder="https://"
                                />
                                <p className="text-[10px] text-gray-400 mt-2">Image shown when page is shared on Facebook/Twitter. (1200x630px recommended).</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="is_published"
                                checked={editingPageDetails.is_published}
                                onChange={(e) => setEditingPageDetails({ ...editingPageDetails, is_published: e.target.checked })}
                                className="w-4 h-4 accent-[#CDA235]"
                            />
                            <label htmlFor="is_published" className="text-sm font-bold text-gray-700">Published (Visible on live site)</label>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="show_in_header"
                                checked={editingPageDetails.show_in_header}
                                onChange={(e) => setEditingPageDetails({ ...editingPageDetails, show_in_header: e.target.checked })}
                                className="w-4 h-4 accent-[#CDA235]"
                            />
                            <label htmlFor="show_in_header" className="text-sm font-bold text-gray-700">Show Link in Header Menu</label>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="show_in_footer"
                                checked={editingPageDetails.show_in_footer}
                                onChange={(e) => setEditingPageDetails({ ...editingPageDetails, show_in_footer: e.target.checked })}
                                className="w-4 h-4 accent-[#CDA235]"
                            />
                            <label htmlFor="show_in_footer" className="text-sm font-bold text-gray-700">Show Link in Footer Menu</label>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-8">
                        <button type="button" onClick={() => setIsEditingPage(false)} className="px-6 py-3 border border-gray-200 text-gray-600 text-[10px] uppercase font-bold tracking-widest hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-8 py-3 bg-[#CDA235] text-white text-[10px] uppercase font-bold tracking-widest hover:bg-black transition-colors disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save Page'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-[#CDA235]/20 pb-8">
                <div>
                    <span className="text-[#CDA235] text-[11px] font-bold tracking-[0.5em] uppercase block mb-2">ARCHITECTURE</span>
                    <h1 className="text-4xl md:text-5xl serif italic text-[#1a1a1a]">Pages</h1>
                </div>
                <button
                    onClick={() => {
                        setEditingPageDetails({ id: '', title: '', slug: '', is_published: true, seo_title: '', meta_description: '', og_image: '', content: '', show_in_header: false, show_in_footer: false, banner_image: '' });
                        setIsEditingPage(true);
                    }}
                    className="bg-[#1a1a1a] text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#CDA235] transition-colors flex items-center gap-2 mt-4 md:mt-0"
                >
                    <Plus size={14} /> Add New Page
                </button>
            </div>

            {loading && pages.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-[12px] uppercase tracking-[0.4em] font-bold">Loading Pages...</div>
            ) : pages.length === 0 ? (
                <div className="py-24 text-center text-gray-400 text-[12px] uppercase tracking-[0.2em] font-bold italic bg-white border border-gray-100">
                    No custom pages created yet.
                </div>
            ) : (
                <div className="bg-white shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-gray-100 p-8 space-y-4">
                    {pages.map(page => (
                        <div key={page.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 border border-gray-100 hover:border-[#CDA235]/30 transition-colors bg-white group gap-4 md:gap-0">
                            <div>
                                <h3 className="text-xl serif italic text-[#1a1a1a] flex items-center gap-3">
                                    {page.title}
                                    {!page.is_published && <span className="text-[9px] font-bold uppercase tracking-widest text-orange-500 bg-orange-50 px-2 py-0.5 border border-orange-200 not-italic">Draft</span>}
                                </h3>
                                <div className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                                    <Globe size={14} /> /{page.slug}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <a href={`/${page.slug}`} target="_blank" rel="noreferrer" className="text-[10px] uppercase font-bold tracking-widest text-[#CDA235] bg-[#CDA235]/10 px-4 py-2 hover:bg-[#CDA235] hover:text-white transition-colors">
                                    View
                                </a>
                                <button onClick={() => { setEditingPageDetails({ ...page, seo_title: page.seo_title || '', meta_description: page.meta_description || '', og_image: page.og_image || '', content: page.content || '', show_in_header: page.show_in_header || false, show_in_footer: page.show_in_footer || false, banner_image: page.banner_image || '' }); setIsEditingPage(true); }} className="p-2 text-blue-500 hover:bg-blue-50 transition-colors">
                                    <Edit3 size={18} />
                                </button>
                                <button onClick={() => handleDeletePage(page.id, page.slug)} className="p-2 text-red-500 hover:bg-red-50 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
