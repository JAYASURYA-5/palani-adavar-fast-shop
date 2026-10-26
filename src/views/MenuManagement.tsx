import React, { useState, useMemo } from 'react';
import { useRestaurantStore, MenuItem } from '../store/restaurantStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Coffee,
  Sparkles,
  Heart
} from 'lucide-react';

export const MenuManagement: React.FC = () => {
  const { menu, addMenuItem, updateMenuItem, deleteMenuItem, toggleFavorite } = useRestaurantStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Rice' | 'Chilli Chicken' | 'Extras'>('All');

  // Modal forms
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'Rice' | 'Chilli Chicken' | 'Extras'>('Rice');
  const [formPrice, setFormPrice] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formAvailable, setFormAvailable] = useState(true);
  const [formPopular, setFormPopular] = useState(false);
  const [formSpecial, setFormSpecial] = useState(false);
  const [formWeight, setFormWeight] = useState('');

  // Form validation errors
  const [valError, setValError] = useState('');

  // Filter Menu
  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      const matchCat = activeCategory === 'All' || item.category === activeCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menu, activeCategory, searchQuery]);

  // Open Form for Add
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('Rice');
    setFormPrice('');
    setFormImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80');
    setFormAvailable(true);
    setFormPopular(false);
    setFormSpecial(false);
    setFormWeight('');
    setValError('');
    setShowFormModal(true);
  };

  // Open Form for Edit
  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormPrice(item.price.toString());
    setFormImage(item.image);
    setFormAvailable(item.isAvailable);
    setFormPopular(item.isPopular);
    setFormSpecial(item.isSpecial);
    setFormWeight(item.weightGrams ? item.weightGrams.toString() : '');
    setValError('');
    setShowFormModal(true);
  };

  // Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValError('');

    const priceNum = parseFloat(formPrice);
    if (!formName.trim()) {
      setValError('Item name is required.');
      return;
    }
    if (isNaN(priceNum) || priceNum < 0) {
      setValError('Please enter a valid price (greater than or equal to 0).');
      return;
    }

    const itemData: any = {
      name: formName,
      category: formCategory,
      price: priceNum,
      image: formImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80',
      isAvailable: formAvailable,
      isPopular: formPopular,
      isSpecial: formSpecial,
      weightGrams: formWeight ? parseInt(formWeight) : undefined
    };

    if (editingItem) {
      updateMenuItem(editingItem.id, itemData);
    } else {
      addMenuItem(itemData);
    }

    setShowFormModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMenuItem(id);
    }
  };

  return (
    <div className="p-6 space-y-6 font-poppins text-slate-800 dark:text-slate-100 h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
        <div className="flex bg-slate-100 dark:bg-darkBorder p-1.5 rounded-2xl w-full sm:w-64 border border-slate-200/50 dark:border-darkBorder/50">
          {(['All', 'Rice', 'Chilli Chicken', 'Extras'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition-all ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-brand-500 to-primary-500 text-white shadow shadow-brand-500/10'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search active menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-2xl text-xs font-semibold outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-gradient-to-r from-brand-500 to-primary-500 hover:from-brand-600 hover:to-primary-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-1.5 justify-center flex-shrink-0"
          >
            <Plus size={14} /> Add Item
          </button>
        </div>
      </div>

      {/* Grid Display list */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-6 min-h-0">
        {filteredMenu.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-3">
              <Search size={28} className="text-brand-500" />
            </div>
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">No dishes match your criteria</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">Try selecting a different category or clearing the search query.</p>
            <button
              onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-500 text-xs font-bold transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredMenu.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/40 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col relative group"
              >
                {/* Picture card */}
                <div className="h-32 w-full bg-slate-100 dark:bg-slate-900/50 relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  
                  {/* Available badge */}
                  <div className="absolute top-2.5 left-2.5 flex gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${
                      item.isAvailable ? 'bg-green-500 text-white' : 'bg-rose-500 text-white animate-pulse'
                    }`}>
                      {item.isAvailable ? 'Active' : 'Sold Out'}
                    </span>
                  </div>

                  {/* Popularity indicator */}
                  <div className="absolute top-2.5 right-2.5 flex gap-1">
                    {item.isPopular && (
                      <span className="p-1 rounded-lg bg-brand-500 text-white" title="Popular dish">
                        <Sparkles size={10} />
                      </span>
                    )}
                    {item.isSpecial && (
                      <span className="p-1 rounded-lg bg-amber-500 text-white" title="Special dish">
                        <Coffee size={10} />
                      </span>
                    )}
                  </div>
                </div>

                {/* Descriptions */}
                <div className="p-4 flex-1 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.category}</span>
                  <span className="text-sm font-bold text-slate-950 dark:text-white truncate">{item.name}</span>
                  <span className="text-xs font-bold text-brand-500 font-mono mt-1.5">
                    {item.price === 0 ? 'Custom Price' : `₹${item.price}`}
                  </span>

                  {/* Availability rapid controls */}
                  <div className="flex items-center justify-between mt-4 border-t border-slate-100 dark:border-darkBorder/40 pt-3 text-[10px] font-bold text-slate-500">
                    <span>Available POS</span>
                    <button
                      onClick={() => updateMenuItem(item.id, { isAvailable: !item.isAvailable })}
                      className="text-brand-500"
                    >
                      {item.isAvailable ? <ToggleRight size={24} /> : <ToggleLeft size={24} className="text-slate-400" />}
                    </button>
                  </div>
                </div>

                {/* Action hovering drawer */}
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-3 bg-white dark:bg-darkCard hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white rounded-2xl flex items-center justify-center transition-transform hover:scale-105"
                    title="Edit Dish"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="p-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl flex items-center justify-center transition-transform hover:scale-105"
                    title="Delete Dish"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADMIN ADD/EDIT FORM MODAL */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.form 
              onSubmit={handleFormSubmit}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass-panel rounded-3xl border border-slate-200/50 dark:border-darkBorder p-6 font-poppins flex flex-col gap-4 shadow-2xl bg-white dark:bg-darkCard my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-darkBorder/50 pb-3">
                <span className="font-bold text-sm text-slate-800 dark:text-white">
                  {editingItem ? `Edit Item: ${editingItem.name}` : 'Add New Dish'}
                </span>
                <button type="button" onClick={() => setShowFormModal(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-darkBorder">
                  <X size={16} />
                </button>
              </div>

              {/* Validation alert banner */}
              {valError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-2xl flex items-center gap-2">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {valError}
                </div>
              )}

              {/* Form Input fields */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Dish Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chicken Rice Special"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  >
                    <option value="Rice">Rice</option>
                    <option value="Chilli Chicken">Chilli Chicken</option>
                    <option value="Extras">Extras</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 100"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Portion Weight (g)</label>
                  <input
                    type="number"
                    placeholder="Optional weight"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Image URL (Mocked)</label>
                  <input
                    type="text"
                    placeholder="https://unsplash..."
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Badges Toggles row */}
              <div className="grid grid-cols-3 gap-2 py-2 text-[9px] font-bold">
                <label className="flex items-center gap-1.5 p-2 bg-slate-100 dark:bg-darkBorder/40 rounded-xl cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formAvailable} 
                    onChange={(e) => setFormAvailable(e.target.checked)}
                    className="rounded text-brand-500 border-slate-300 focus:ring-0" 
                  />
                  <span>ACTIVE POS</span>
                </label>
                <label className="flex items-center gap-1.5 p-2 bg-slate-100 dark:bg-darkBorder/40 rounded-xl cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formPopular} 
                    onChange={(e) => setFormPopular(e.target.checked)}
                    className="rounded text-brand-500 border-slate-300 focus:ring-0" 
                  />
                  <span>POPULAR</span>
                </label>
                <label className="flex items-center gap-1.5 p-2 bg-slate-100 dark:bg-darkBorder/40 rounded-xl cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formSpecial} 
                    onChange={(e) => setFormSpecial(e.target.checked)}
                    className="rounded text-brand-500 border-slate-300 focus:ring-0" 
                  />
                  <span>SPECIAL</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-brand-500 to-primary-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all mt-2"
              >
                {editingItem ? 'Save Changes' : 'Publish Dish'}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
