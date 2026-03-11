import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Edit3 } from 'lucide-react';

export const GalleryTab: React.FC = () => {
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState({ id: '', title: '', image_url: '', display_order: 0, is_published: true });
    const [uploadingImage, setUploadingImage] = useState(false);

    const [settings, setSettings] = useState<Record<string, string>>({
        hero_bg_image: '', hero_video_url: '', philosophy_img: '', seasonal_img: '', header_logo: '', footer_logo: '',
        header_logo_size: '64', footer_logo_size: '56'
    });
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        fetchImages();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await supabase.from('settings').select('*');
            if (data) {
                const s = data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string>);
                setSettings(prev => ({ ...prev, ...s }));
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
    };

    const handleSettingImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploadingImage(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `settings/${fileName}`;
            const { error: uploadError } = await supabase.storage.from('public-images').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('public-images').getPublicUrl(filePath);
            setSettings(prev => ({ ...prev, [key]: publicUrl }));
        } catch (err: any) {
            alert(`Failed to upload image. Error: ${err.message || 'Unknown error'}`);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation for common video portals that won't work in a <video> tag
        if (settings.hero_video_url && (settings.hero_video_url.includes('youtube.com') || settings.hero_video_url.includes('youtu.be') || settings.hero_video_url.includes('vimeo.com'))) {
            alert('YouTube and Vimeo links are not supported as background videos. Please upload an .mp4 file directly or provide a direct video link.');
            return;
        }

        setSavingSettings(true);
        const toUpdate = ['hero_bg_image', 'hero_video_url', 'philosophy_img', 'seasonal_img', 'header_logo', 'footer_logo', 'header_logo_size', 'footer_logo_size'];
        try {
            const upsertData = toUpdate
                .filter(key => settings[key] !== undefined && settings[key] !== null)
                .map(key => ({
                    key,
                    value: settings[key],
                    category: 'general'
                }));

            if (upsertData.length > 0) {
                const { error } = await supabase.from('settings').upsert(upsertData, { onConflict: 'key' });
                if (error) throw error;
            }
            alert('Homepage media updated successfully!');
        } catch (err: any) {
            console.error(err);
            alert(`Failed to save homepage media. ${err.message || ''}`);
        } finally {
            setSavingSettings(false);
        }
    };

    const fetchImages = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('gallery').select('*').order('display_order', { ascending: true });
            if (error) throw error;
            setImages(data || []);
        } catch (err) {
            console.error('Error fetching gallery:', err);
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
            const fileName = `gallery_${Math.random()}.${fileExt}`;
            const filePath = `gallery/${fileName}`;

            const { error: uploadError } = await supabase.storage.from('public-images').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('public-images').getPublicUrl(filePath);

            setEditingItem(prev => ({ ...prev, image_url: publicUrl }));
        } catch (err: any) {
            console.error('Error uploading image', err.message);
            alert('Failed to upload image. Ensure public-images bucket exists and allows uploads.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!editingItem.image_url) {
                alert('Please upload an image first.');
                setLoading(false);
                return;
            }

            if (editingItem.id) {
                const { error } = await supabase.from('gallery').update({
                    title: editingItem.title,
                    image_url: editingItem.image_url,
                    display_order: editingItem.display_order,
                    is_published: editingItem.is_published
                }).eq('id', editingItem.id);
                if (error) throw error;
            } else {
                const maxOrder = images.length > 0 ? Math.max(...images.map(img => img.display_order || 0)) : 0;
                const { error } = await supabase.from('gallery').insert([{
                    title: editingItem.title,
                    image_url: editingItem.image_url,
                    display_order: maxOrder + 1,
                    is_published: editingItem.is_published
                }]);
                if (error) throw error;
            }
            setIsEditing(false);
            fetchImages();
        } catch (err: any) {
            console.error('Error saving image:', err);
            alert('Failed to save gallery image.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete image "${title}"?`)) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('gallery').delete().eq('id', id);
            if (error) throw error;
            fetchImages();
        } catch (err) {
            console.error('Error deleting image:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateOrder = async (id: string, currentOrder: number, newOrder?: number) => {
        if (newOrder === undefined) return;
        const otherImage = images.find(img => img.display_order === newOrder);
        if (!otherImage) return;

        setLoading(true);
        try {
            await supabase.from('gallery').update({ display_order: currentOrder }).eq('id', otherImage.id);
            await supabase.from('gallery').update({ display_order: newOrder }).eq('id', id);
            fetchImages();
        } catch (err) {
            console.error('Error reordering', err);
        } finally {
            setLoading(false);
        }
    };

    if (isEditing) {
        return (
            <div className="bg-white p-8 border border-gray-100 shadow-xl max-w-2xl animate-in fade-in">
                <h3 className="text-2xl serif italic mb-6">{editingItem.id ? 'Edit Image Details' : 'Upload New Image'}</h3>
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Image File</label>
                        <div className="flex gap-6 items-start border-2 border-dashed border-gray-200 p-8 text-center relative hover:border-[#CDA235] transition-colors group bg-gray-50">
                            {editingItem.image_url ? (
                                <div className="w-full flex flex-col items-center">
                                    <img src={editingItem.image_url} alt="Preview" className="max-h-64 object-contain mb-4 shadow-md" />
                                    <label className="cursor-pointer bg-white border border-gray-200 text-gray-700 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] inline-block hover:bg-gray-50 transition-colors">
                                        Replace Image
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                    </label>
                                </div>
                            ) : (
                                <div className="w-full flex flex-col items-center py-8">
                                    <ImageIcon className="text-gray-300 mb-4 group-hover:text-[#CDA235] transition-colors" size={48} />
                                    <label className="cursor-pointer bg-[#1a1a1a] text-white px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] inline-block hover:bg-[#CDA235] transition-colors">
                                        Browse Files
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                    </label>
                                    <p className="text-xs text-gray-400 mt-4">Max 5MB.</p>
                                </div>
                            )}
                            {uploadingImage && <div className="absolute inset-0 bg-white/90 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-[#CDA235]">Uploading to Server...</div>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Image Caption / Title</label>
                        <input type="text" value={editingItem.title || ''} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors" placeholder="e.g. Interior view of the bar" />
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                        <input type="checkbox" id="is_published" checked={editingItem.is_published} onChange={e => setEditingItem({ ...editingItem, is_published: e.target.checked })} className="w-4 h-4 accent-[#CDA235]" />
                        <label htmlFor="is_published" className="text-sm font-bold text-gray-700">Display in Gallery</label>
                    </div>

                    <div className="flex gap-4 pt-8">
                        <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 border border-gray-200 text-gray-600 text-[10px] uppercase font-bold tracking-widest hover:bg-gray-50 transition-colors">Cancel</button>
                        <button type="submit" disabled={loading || uploadingImage} className="px-8 py-3 bg-[#CDA235] text-white text-[10px] uppercase font-bold tracking-widest hover:bg-black transition-colors">
                            {loading ? 'Saving...' : 'Save Image'}
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
                    <span className="text-[#CDA235] text-[11px] font-bold tracking-[0.5em] uppercase block mb-2">ASSETS</span>
                    <h1 className="text-4xl md:text-5xl serif italic text-[#1a1a1a]">Image Gallery & Media</h1>
                </div>
                <button
                    onClick={() => {
                        setEditingItem({ id: '', title: '', image_url: '', display_order: 0, is_published: true });
                        setIsEditing(true);
                    }}
                    className="bg-[#1a1a1a] text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#CDA235] transition-colors flex items-center gap-2 mt-4 md:mt-0"
                >
                    <Plus size={14} /> Upload Image
                </button>
            </div>

            <div className="bg-white p-8 border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.03)] space-y-8 mb-12">
                <h2 className="text-2xl serif italic mb-6">Homepage Media</h2>
                <form onSubmit={handleSaveSettings} className="space-y-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Hero Background Image (Fallback)</label>
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                                        {settings.hero_bg_image ? <img src={settings.hero_bg_image} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-300" />}
                                    </div>
                                    <div className="flex-1">
                                        <label className="cursor-pointer bg-[#1a1a1a] text-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] inline-block hover:bg-[#CDA235] transition-colors">
                                            Upload Image <input type="file" accept="image/*" onChange={(e) => handleSettingImageUpload(e, 'hero_bg_image')} className="hidden" />
                                        </label>
                                        <input type="text" value={settings.hero_bg_image || ''} onChange={(e) => setSettings({ ...settings, hero_bg_image: e.target.value })} className="w-full mt-2 text-sm border-b border-gray-200 py-2 focus:outline-none focus:border-[#CDA235]" placeholder="Or Image URL..." />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Hero Background Video</label>
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 bg-gray-50 border border-gray-200 flex flex-col items-center justify-center overflow-hidden">
                                        {settings.hero_video_url ? <span className="text-[10px] font-bold text-[#CDA235] text-center px-2">VIDEO<br />PROVIDED</span> : <span className="text-gray-300 text-[10px] uppercase font-bold">NONE</span>}
                                    </div>
                                    <div className="flex-1">
                                        <label className="cursor-pointer bg-[#1a1a1a] text-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] inline-block hover:bg-[#CDA235] transition-colors">
                                            Upload Video <input type="file" accept="video/*" onChange={(e) => handleSettingImageUpload(e, 'hero_video_url')} className="hidden" />
                                        </label>
                                        <input type="text" value={settings.hero_video_url || ''} onChange={(e) => setSettings({ ...settings, hero_video_url: e.target.value })} className="w-full mt-2 text-sm border-b border-gray-200 py-2 focus:outline-none focus:border-[#CDA235]" placeholder="Or direct Video URL (.mp4)..." />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-2 font-light">Upload an mp4 video or provide a direct video link. (YouTube links are not supported).</p>
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Header Logo</label>
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                                        {settings.header_logo ? <img src={settings.header_logo} alt="Header Preview" className="w-full h-full object-contain p-2" crossOrigin="anonymous" /> : <span className="text-gray-300 text-[10px] uppercase font-bold">NONE</span>}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-col gap-4">
                                            <div>
                                                <label className="cursor-pointer bg-[#1a1a1a] text-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] inline-block hover:bg-[#CDA235] transition-colors">
                                                    Upload Image <input type="file" accept="image/*" onChange={(e) => handleSettingImageUpload(e, 'header_logo')} className="hidden" />
                                                </label>
                                                <input type="text" value={settings.header_logo || ''} onChange={(e) => setSettings({ ...settings, header_logo: e.target.value })} className="w-full mt-2 text-sm border-b border-gray-200 py-2 focus:outline-none focus:border-[#CDA235]" placeholder="Or Image URL..." />
                                            </div>
                                            <div className="bg-gray-50 p-3 flexflex-col gap-2 border border-gray-100">
                                                <div className="flex justify-between items-center w-full">
                                                    <label className="text-[10px] uppercase font-bold text-gray-500">Logo Size (Height px)</label>
                                                    <input type="number" min="20" max="200" value={settings.header_logo_size || '64'} onChange={(e) => setSettings({ ...settings, header_logo_size: e.target.value })} className="w-16 p-1 border border-gray-200 text-xs text-center focus:outline-none focus:border-[#CDA235]" />
                                                </div>
                                                <input type="range" min="20" max="200" value={settings.header_logo_size || '64'} onChange={(e) => setSettings({ ...settings, header_logo_size: e.target.value })} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Footer Logo</label>
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                                        {settings.footer_logo ? <img src={settings.footer_logo} alt="Footer Preview" className="w-full h-full object-contain p-2" crossOrigin="anonymous" /> : <span className="text-gray-300 text-[10px] uppercase font-bold">NONE</span>}
                                    </div>
                                    <div className="flex-1">
                                         <div className="flex flex-col gap-4">
                                            <div>
                                                <label className="cursor-pointer bg-[#1a1a1a] text-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] inline-block hover:bg-[#CDA235] transition-colors">
                                                    Upload Image <input type="file" accept="image/*" onChange={(e) => handleSettingImageUpload(e, 'footer_logo')} className="hidden" />
                                                </label>
                                                <input type="text" value={settings.footer_logo || ''} onChange={(e) => setSettings({ ...settings, footer_logo: e.target.value })} className="w-full mt-2 text-sm border-b border-gray-200 py-2 focus:outline-none focus:border-[#CDA235]" placeholder="Or Image URL..." />
                                            </div>
                                            <div className="bg-gray-50 p-3 flexflex-col gap-2 border border-gray-100">
                                                <div className="flex justify-between items-center w-full">
                                                    <label className="text-[10px] uppercase font-bold text-gray-500">Logo Size (Height px)</label>
                                                    <input type="number" min="20" max="200" value={settings.footer_logo_size || '56'} onChange={(e) => setSettings({ ...settings, footer_logo_size: e.target.value })} className="w-16 p-1 border border-gray-200 text-xs text-center focus:outline-none focus:border-[#CDA235]" />
                                                </div>
                                                <input type="range" min="20" max="200" value={settings.footer_logo_size || '56'} onChange={(e) => setSettings({ ...settings, footer_logo_size: e.target.value })} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Our Food Philosophy Image</label>
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                                        {settings.philosophy_img ? <img src={settings.philosophy_img} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-300" />}
                                    </div>
                                    <div className="flex-1">
                                        <label className="cursor-pointer bg-[#1a1a1a] text-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] inline-block hover:bg-[#CDA235] transition-colors">
                                            Upload Image <input type="file" accept="image/*" onChange={(e) => handleSettingImageUpload(e, 'philosophy_img')} className="hidden" />
                                        </label>
                                        <input type="text" value={settings.philosophy_img || ''} onChange={(e) => setSettings({ ...settings, philosophy_img: e.target.value })} className="w-full mt-2 text-sm border-b border-gray-200 py-2 focus:outline-none focus:border-[#CDA235]" placeholder="Or Image URL..." />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Seasonal Experiences Image</label>
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                                        {settings.seasonal_img ? <img src={settings.seasonal_img} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-300" />}
                                    </div>
                                    <div className="flex-1">
                                        <label className="cursor-pointer bg-[#1a1a1a] text-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] inline-block hover:bg-[#CDA235] transition-colors">
                                            Upload Image <input type="file" accept="image/*" onChange={(e) => handleSettingImageUpload(e, 'seasonal_img')} className="hidden" />
                                        </label>
                                        <input type="text" value={settings.seasonal_img || ''} onChange={(e) => setSettings({ ...settings, seasonal_img: e.target.value })} className="w-full mt-2 text-sm border-b border-gray-200 py-2 focus:outline-none focus:border-[#CDA235]" placeholder="Or Image URL..." />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <button type="submit" disabled={savingSettings || uploadingImage} className="px-8 py-4 bg-[#CDA235] text-white text-[10px] uppercase font-bold tracking-widest hover:bg-black transition-colors disabled:opacity-50">
                            {savingSettings ? 'Saving...' : 'Save Homepage Media'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mb-4 text-2xl serif italic text-[#1a1a1a]">Gallery Images</div>

            {loading && images.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-[12px] uppercase tracking-[0.4em] font-bold">Loading Gallery...</div>
            ) : images.length === 0 ? (
                <div className="py-24 text-center text-gray-400 text-[12px] uppercase tracking-[0.2em] font-bold italic bg-white border border-gray-100">
                    Your gallery is empty. Upload some photos.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {images.map((img, index) => (
                        <div key={img.id} className={`bg-white border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] relative group ${!img.is_published && 'opacity-60 grayscale-[50%]'}`}>
                            <div className="aspect-square bg-gray-100 overflow-hidden relative">
                                <img src={img.image_url} alt={img.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex bg-white/10 backdrop-blur-md rounded-full overflow-hidden text-white">
                                            <button
                                                disabled={index === 0}
                                                onClick={() => updateOrder(img.id, img.display_order, images[index - 1]?.display_order)}
                                                className="p-2 hover:bg-white/20 disabled:opacity-30 transition-colors"
                                                title="Move Up"
                                            >
                                                <ArrowUp size={16} />
                                            </button>
                                            <button
                                                disabled={index === images.length - 1}
                                                onClick={() => updateOrder(img.id, img.display_order, images[index + 1]?.display_order)}
                                                className="p-2 hover:bg-white/20 disabled:opacity-30 transition-colors"
                                                title="Move Down"
                                            >
                                                <ArrowDown size={16} />
                                            </button>
                                        </div>
                                        <button onClick={() => handleDelete(img.id, img.title)} className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-colors" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="flex justify-end">
                                        <button onClick={() => { setEditingItem(img); setIsEditing(true); }} className="p-2 bg-blue-500/80 hover:bg-blue-500 text-white rounded-full backdrop-blur-md transition-colors" title="Edit Details">
                                            <Edit3 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 flex items-center justify-between border-t border-gray-50">
                                <div className="truncate text-sm font-bold text-gray-800 flex-1 mr-4">
                                    {img.title || 'Untitled'}
                                </div>
                                <div className="text-[10px] uppercase tracking-widest text-[#CDA235] font-bold">
                                    #{img.display_order}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
