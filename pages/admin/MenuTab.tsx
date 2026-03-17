import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit3, Trash2, GripVertical, Image as ImageIcon, ChevronDown, ChevronUp, FolderPlus } from 'lucide-react';

interface MenuCategory {
    id: string;
    name: string;
    display_order: number;
    is_visible: boolean;
}

const DEFAULT_CATEGORIES: MenuCategory[] = [
    { id: 'STARTERS', name: 'A La Carte - Starters', display_order: 0, is_visible: true },
    { id: 'MAINS', name: 'A La Carte - Mains', display_order: 1, is_visible: true },
    { id: 'DESSERTS', name: 'A La Carte - Desserts', display_order: 2, is_visible: true },
    { id: 'SIDES', name: 'A La Carte - Sides', display_order: 3, is_visible: true },
    { id: 'FROKOST', name: 'Frokost (Lunch)', display_order: 4, is_visible: true },
    { id: 'TAKEAWAY', name: 'Takeaway', display_order: 5, is_visible: true },
    { id: 'KIDS', name: 'Kids Menu', display_order: 6, is_visible: true },
    { id: 'DRINKS', name: 'Drinks / Other', display_order: 7, is_visible: true },
];

export const MenuTab: React.FC = () => {
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [categories, setCategories] = useState<MenuCategory[]>(DEFAULT_CATEGORIES);
    const [loading, setLoading] = useState(false);

    // --- Category management state ---
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
    const [newCategoryName, setNewCategoryName] = useState('');

    // --- Dish editing state ---
    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState({
        id: '',
        category: '',
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
        fetchCategories();
        fetchMenu();
    }, []);

    // ─── Category persistence via settings table ────────────────────────
    const fetchCategories = async () => {
        try {
            const { data } = await supabase
                .from('settings')
                .select('*')
                .eq('key', 'menu_categories')
                .maybeSingle();

            if (data && data.value) {
                try {
                    const parsed = JSON.parse(data.value);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setCategories(parsed);
                        return;
                    }
                } catch { /* fallback to defaults */ }
            }
            setCategories(DEFAULT_CATEGORIES);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setCategories(DEFAULT_CATEGORIES);
        }
    };

    const saveCategories = async (cats: MenuCategory[]) => {
        try {
            const { error } = await supabase
                .from('settings')
                .upsert({ key: 'menu_categories', value: JSON.stringify(cats), category: 'general' }, { onConflict: 'key' });
            if (error) throw error;
            setCategories(cats);
        } catch (err: any) {
            console.error('Error saving categories:', err);
            alert(`Failed to save categories: ${err.message}`);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        const id = newCategoryName.trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
        if (categories.find(c => c.id === id)) {
            alert('A category with this ID already exists.');
            return;
        }
        const newCat: MenuCategory = {
            id,
            name: newCategoryName.trim(),
            display_order: categories.length,
            is_visible: true
        };
        await saveCategories([...categories, newCat]);
        setNewCategoryName('');
    };

    const handleDeleteCategory = async (catId: string) => {
        const itemsInCat = menuItems.filter(i => i.category === catId);
        if (itemsInCat.length > 0) {
            if (!confirm(`This menu "${catId}" has ${itemsInCat.length} dish(es). Deleting the menu will NOT delete the dishes, but they will become uncategorized. Continue?`)) return;
        } else {
            if (!confirm(`Delete menu "${catId}"?`)) return;
        }
        await saveCategories(categories.filter(c => c.id !== catId));
    };

    const handleUpdateCategory = async (cat: MenuCategory) => {
        await saveCategories(categories.map(c => c.id === cat.id ? cat : c));
        setEditingCategory(null);
    };

    const handleMoveCategoryUp = async (index: number) => {
        if (index <= 0) return;
        const newCats = [...categories];
        [newCats[index - 1], newCats[index]] = [newCats[index], newCats[index - 1]];
        newCats.forEach((c, i) => c.display_order = i);
        await saveCategories(newCats);
    };

    const handleMoveCategoryDown = async (index: number) => {
        if (index >= categories.length - 1) return;
        const newCats = [...categories];
        [newCats[index], newCats[index + 1]] = [newCats[index + 1], newCats[index]];
        newCats.forEach((c, i) => c.display_order = i);
        await saveCategories(newCats);
    };

    // ─── Menu items ─────────────────────────────────────────────────────
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

            const { error: uploadError } = await supabase.storage
                .from('public-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

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

    // ─── Dish Edit Form ─────────────────────────────────────────────────
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
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Menu / Category</label>
                            <select value={editingItem.category} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} className="w-full text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors bg-white">
                                <option value="">-- Select Menu --</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
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

    // ─── Main View ──────────────────────────────────────────────────────
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-[#CDA235]/20 pb-8">
                <div>
                    <span className="text-[#CDA235] text-[11px] font-bold tracking-[0.5em] uppercase block mb-2">RESTAURANT</span>
                    <h1 className="text-4xl md:text-5xl serif italic text-[#1a1a1a]">Menu Management</h1>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                    <button
                        onClick={() => setShowCategoryManager(!showCategoryManager)}
                        className="border border-gray-200 text-gray-700 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:border-[#CDA235] hover:text-[#CDA235] transition-colors flex items-center gap-2"
                    >
                        <FolderPlus size={14} /> Manage Menus
                    </button>
                    <button
                        onClick={() => {
                            setEditingItem({ id: '', category: categories[0]?.id || 'STARTERS', name: '', description: '', price: '', image_url: '', display_order: 0, is_visible: true, day: '' });
                            setIsEditing(true);
                        }}
                        className="bg-[#1a1a1a] text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#CDA235] transition-colors flex items-center gap-2"
                    >
                        <Plus size={14} /> Add Dish
                    </button>
                </div>
            </div>

            {/* ── Menu Category Manager ─────────────────────────────────── */}
            {showCategoryManager && (
                <div className="bg-white shadow-[0_20px_40px_rgba(0,0,0,0.05)] border border-gray-100 p-8 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl serif italic text-[#1a1a1a]">Menu Categories</h3>
                        <button onClick={() => setShowCategoryManager(false)} className="text-gray-400 hover:text-gray-600 text-sm">✕ Close</button>
                    </div>
                    <p className="text-sm text-gray-500 mb-6 font-light">Add, edit, reorder, or delete menu categories. These will appear as tabs on the frontend.</p>

                    <div className="space-y-3 mb-8">
                        {categories.map((cat, index) => (
                            <div key={cat.id} className="flex items-center gap-3 p-4 border border-gray-100 bg-[#faf9f6] hover:border-[#CDA235]/30 transition-colors group">
                                <div className="flex flex-col gap-1">
                                    <button onClick={() => handleMoveCategoryUp(index)} disabled={index === 0} className="text-gray-300 hover:text-[#CDA235] disabled:opacity-20 transition-colors"><ChevronUp size={14} /></button>
                                    <button onClick={() => handleMoveCategoryDown(index)} disabled={index === categories.length - 1} className="text-gray-300 hover:text-[#CDA235] disabled:opacity-20 transition-colors"><ChevronDown size={14} /></button>
                                </div>
                                <div className="flex-1 min-w-0">
                                    {editingCategory?.id === cat.id ? (
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                value={editingCategory.name}
                                                onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                                className="flex-1 text-base border-b border-[#CDA235] py-1 focus:outline-none bg-transparent"
                                                autoFocus
                                            />
                                            <button onClick={() => handleUpdateCategory(editingCategory)} className="text-[9px] bg-[#CDA235] text-white px-3 py-1.5 font-bold uppercase tracking-wider hover:bg-black transition-colors">Save</button>
                                            <button onClick={() => setEditingCategory(null)} className="text-[9px] text-gray-400 hover:text-gray-700">Cancel</button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-[#1a1a1a]">{cat.name}</span>
                                            <span className="text-[9px] text-gray-400 font-mono uppercase">{cat.id}</span>
                                            <span className="text-[9px] text-gray-400">({menuItems.filter(i => i.category === cat.id).length} dishes)</span>
                                            {!cat.is_visible && <span className="text-[8px] font-bold uppercase tracking-widest text-orange-500 bg-orange-50 px-2 py-0.5 border border-orange-200">Hidden</span>}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditingCategory(cat)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"><Edit3 size={14} /></button>
                                    <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add new category */}
                    <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={e => setNewCategoryName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                            className="flex-1 text-base border-b border-gray-200 py-3 focus:outline-none focus:border-[#CDA235] transition-colors"
                            placeholder="New menu name (e.g. Seasonal Menu, Wine List)"
                        />
                        <button
                            onClick={handleAddCategory}
                            disabled={!newCategoryName.trim()}
                            className="bg-[#1a1a1a] text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#CDA235] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Add Menu
                        </button>
                    </div>
                </div>
            )}

            {/* ── Dishes by Category ───────────────────────────────────── */}
            {loading && menuItems.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-[12px] uppercase tracking-[0.4em] font-bold">Loading Menu...</div>
            ) : (
                <div className="space-y-12">
                    {categories.map(cat => {
                        const itemsInCategory = menuItems.filter(i => i.category === cat.id);
                        if (itemsInCategory.length === 0 && !showCategoryManager) return null;

                        return (
                            <div key={cat.id} className={`bg-white shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-gray-100 p-8 ${!cat.is_visible ? 'opacity-60 border-dashed' : ''}`}>
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold tracking-[0.3em] uppercase text-[#CDA235]">{cat.name}</h3>
                                        {!cat.is_visible && <span className="text-[8px] font-bold uppercase tracking-widest text-orange-500 bg-orange-50 px-2 py-0.5 border border-orange-200">Hidden</span>}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setEditingItem({ id: '', category: cat.id, name: '', description: '', price: '', image_url: '', display_order: itemsInCategory.length, is_visible: true, day: '' });
                                            setIsEditing(true);
                                        }}
                                        className="text-[9px] font-bold uppercase tracking-widest text-[#CDA235] hover:text-[#1a1a1a] transition-colors flex items-center gap-1"
                                    >
                                        <Plus size={12} /> Add dish here
                                    </button>
                                </div>
                                {itemsInCategory.length > 0 ? (
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
                                ) : (
                                    <div className="py-8 text-center text-gray-300 text-[11px] uppercase tracking-[0.3em] font-bold italic border border-dashed border-gray-200">
                                        No dishes yet — click "Add dish here" above
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {menuItems.length === 0 && !showCategoryManager && (
                        <div className="py-24 text-center text-gray-400 text-[12px] uppercase tracking-[0.2em] font-bold italic bg-white border border-gray-100">
                            Menu is empty. Add your first dish.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
