import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit3, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';

export const MenuTab: React.FC = () => {
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState({
        id: '',
        category: 'STARTERS', // Default category
        name: '',
        description: '',
        price: '',
        image_url: '',
        display_order: 0,
        is_visible: true,
        day: ''
    });

    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .order('category')
                .order('display_order');

            if (error) throw error;
            setMenuItems(data || []);
        } catch (err) {
            console.error('Error fetching menu:', err);
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
            const filePath = `menu/${fileName}`;

            // Upload the image to 'public-images' storage bucket
            const { error: uploadError } = await supabase.storage
                .from('public-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('public-images')
                .getPublicUrl(filePath);

            setEditingItem(prev => ({ ...prev, image_url: publicUrl }));
        } catch (err: any) {
            console.error('Error uploading image', err);
            alert(`Failed to upload image. Error: ${err.message || 'Unknown error'}`);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingItem.id) {
                const { id, ...updateData } = editingItem;
                const { error } = await supabase
                    .from('menu_items')
                    .update(updateData)
                    .eq('id', id);
                if (error) throw error;
            } else {
                const { id, ...newItem } = editingItem; // omit empty id
                const { error } = await supabase
                    .from('menu_items')
                    .insert([newItem]);
                if (error) throw error;
            }
            setIsEditing(false);
            fetchMenu();
        } catch (err: any) {
            console.error('Error saving item:', err);
            alert(`Failed to save menu item. Supabase Error: ${err.message || err.details || 'Check console'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this menu item?')) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('menu_items').delete().eq('id', id);
            if (error) throw error;
            fetchMenu();
        } catch (err) {
            console.error('Error deleting:', err);
        } finally {
            setLoading(false);
        }
    };

    if (isEditing) {
        return (
            <div className="bg-white p-8 border border-gray-100 shadow-xl max-w-3xl animate-in fade-in">
                <h3 className="text-2xl serif italic mb-6">{editingItem.id ? 'Edit Dish' : 'Add New Dish'}</h3>
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Name</label>
                            <input required type="text" value={editingItem.name} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors" placeholder="e.g. Steak Frites" />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Category</label>
                            <select value={editingItem.category} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors bg-white">
                                <option value="STARTERS">A La Carte - Starters</option>
                                <option value="MAINS">A La Carte - Mains</option>
                                <option value="DESSERTS">A La Carte - Desserts</option>
                                <option value="SIDES">A La Carte - Sides</option>
                                <option value="FROKOST">Frokost (Lunch)</option>
                                <option value="TAKEAWAY">Takeaway</option>
                                <option value="KIDS">Kids Menu</option>
                                <option value="DRINKS">Drinks / Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Assign to Week Day (For Takeaway)</label>
                            <select value={editingItem.day} onChange={e => setEditingItem({ ...editingItem, day: e.target.value })} className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors bg-white text-gray-700">
                                <option value="">None (Always Available)</option>
                                <option value="mandag">Mandag (Monday)</option>
                                <option value="tirsdag">Tirsdag (Tuesday)</option>
                                <option value="onsdag">Onsdag (Wednesday)</option>
                                <option value="torsdag">Torsdag (Thursday)</option>
                                <option value="fredag">Fredag (Friday)</option>
                                <option value="lørdag">Lørdag (Saturday)</option>
                                <option value="søndag">Søndag (Sunday)</option>
                            </select>
                            <p className="text-[10px] text-gray-400 mt-1 italic">Optional. Used primarily for Takeaway "dish of the day" format.</p>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Price string</label>
                            <input type="text" value={editingItem.price} onChange={e => setEditingItem({ ...editingItem, price: e.target.value })} className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors" placeholder="e.g. 245,-" />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Display Order (Sorting)</label>
                            <input type="number" value={editingItem.display_order} onChange={e => setEditingItem({ ...editingItem, display_order: parseInt(e.target.value) || 0 })} className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Description</label>
                        <textarea value={editingItem.description} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors min-h-[80px]" placeholder="Brief description of the dish..." />
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Dish Image</label>
                        <div className="flex items-center gap-6">
                            <div className="w-32 h-32 bg-gray-50 border border-gray-200 flex flex-col items-center justify-center overflow-hidden relative">
                                {editingItem.image_url ? (
                                    <img src={editingItem.image_url} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="text-gray-300" size={32} />
                                )}
                                {uploadingImage && <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest">Uploading...</div>}
                            </div>
                            <div className="flex-1">
                                <label className="cursor-pointer bg-[#1a1a1a] text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] inline-block hover:bg-[#CDA235] transition-colors">
                                    Upload New Image
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </label>
                                <p className="text-xs text-gray-400 mt-2">Max 5MB. Recommended square or landscape format.</p>
                                <div className="mt-4">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">Or Image URL</label>
                                    <input type="text" value={editingItem.image_url} onChange={e => setEditingItem({ ...editingItem, image_url: e.target.value })} className="w-full text-sm border-b border-gray-200 py-2 focus:outline-none focus:border-[#CDA235]" placeholder="https://..." />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                        <input type="checkbox" id="is_visible" checked={editingItem.is_visible} onChange={e => setEditingItem({ ...editingItem, is_visible: e.target.checked })} className="w-4 h-4 accent-[#CDA235]" />
                        <label htmlFor="is_visible" className="text-sm font-bold text-gray-700">Visible on Frontend (Published)</label>
                    </div>

                    <div className="flex gap-4 pt-8">
                        <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 border border-gray-200 text-gray-600 text-[10px] uppercase font-bold tracking-widest hover:bg-gray-50 transition-colors">Cancel</button>
                        <button type="submit" disabled={loading || uploadingImage} className="px-8 py-3 bg-[#CDA235] text-white text-[10px] uppercase font-bold tracking-widest hover:bg-black transition-colors">
                            {loading ? 'Saving...' : 'Save Dish'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }
    const categories = ['STARTERS', 'MAINS', 'DESSERTS', 'SIDES', 'FROKOST', 'TAKEAWAY', 'KIDS', 'DRINKS'];

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-[#CDA235]/20 pb-8">
                <div>
                    <span className="text-[#CDA235] text-[11px] font-bold tracking-[0.5em] uppercase block mb-2">RESTAURANT</span>
                    <h1 className="text-4xl md:text-5xl serif italic text-[#1a1a1a]">Menu Management</h1>
                </div>
                <button
                    onClick={() => {
                        setEditingItem({ id: '', category: 'STARTERS', name: '', description: '', price: '', image_url: '', display_order: 0, is_visible: true, day: '' });
                        setIsEditing(true);
                    }}
                    className="bg-[#1a1a1a] text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#CDA235] transition-colors flex items-center gap-2 mt-4 md:mt-0"
                >
                    <Plus size={14} /> Add Dish
                </button>
            </div>

            {loading && menuItems.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-[12px] uppercase tracking-[0.4em] font-bold">Loading Menu...</div>
            ) : (
                <div className="space-y-12">
                    {categories.map(category => {
                        const itemsInCategory = menuItems.filter(i => i.category === category);
                        if (itemsInCategory.length === 0) return null;

                        return (
                            <div key={category} className="bg-white shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-gray-100 p-8">
                                <h3 className="text-lg font-bold tracking-[0.3em] uppercase text-[#CDA235] mb-6">{category}</h3>
                                <div className="space-y-4">
                                    {itemsInCategory.map(item => (
                                        <div key={item.id} className={`flex items-center gap-4 p-4 border transition-colors ${item.is_visible ? 'border-gray-100 bg-white hover:bg-[#faf9f6]' : 'border-dashed border-gray-300 bg-gray-50 opacity-75'}`}>
                                            <div className="text-gray-400 cursor-move"><GripVertical size={20} /></div>
                                            <div className="w-16 h-16 bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={20} /></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="serif italic text-xl text-[#1a1a1a] truncate">{item.name}</h4>
                                                    {!item.is_visible && <span className="text-[9px] font-bold uppercase tracking-widest text-orange-500 bg-orange-50 px-2 py-0.5 border border-orange-200">Hidden / Draft</span>}
                                                    {item.day && <span className="text-[9px] font-bold uppercase tracking-widest text-[#CDA235] bg-[#CDA235]/10 px-2 py-0.5 border border-[#CDA235]/20">{item.day}</span>}
                                                </div>
                                                <p className="text-sm text-gray-500 truncate">{item.description}</p>
                                            </div>
                                            <div className="font-bold text-[#1a1a1a] w-24 text-right">
                                                {item.price}
                                            </div>
                                            <div className="flex gap-2 border-l border-gray-100 pl-4 ml-4">
                                                <button onClick={() => { setEditingItem(item); setIsEditing(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"><Edit3 size={18} /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {menuItems.length === 0 && (
                        <div className="py-24 text-center text-gray-400 text-[12px] uppercase tracking-[0.2em] font-bold italic bg-white border border-gray-100">
                            Menu is empty. Add your first dish.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
