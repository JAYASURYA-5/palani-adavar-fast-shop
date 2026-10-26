import React, { useState, useMemo } from 'react';
import { useRestaurantStore, InventoryItem } from '../store/restaurantStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  History, 
  Plus, 
  Minus, 
  X,
  Search,
  CheckCircle2
} from 'lucide-react';

export const Inventory: React.FC = () => {
  const { inventory, inventoryLogs, adjustStock } = useRestaurantStore();

  const [searchQuery, setSearchQuery] = useState('');
  
  // Adjust stock overlay form
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>(inventory[0]?.id || '');
  const [adjustType, setAdjustType] = useState<'Purchased' | 'Used'>('Purchased');
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustNotes, setAdjustNotes] = useState('');

  // Computations
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventory, searchQuery]);

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(adjustQuantity);
    if (isNaN(qty) || qty <= 0) return;

    adjustStock(selectedItemId, adjustType, qty, adjustNotes || `Manual ${adjustType} adjustment`);
    
    // Reset Form
    setAdjustQuantity('');
    setAdjustNotes('');
    setShowAdjustModal(false);
  };

  const handleOpenAdjust = (itemId: string, type: 'Purchased' | 'Used') => {
    setSelectedItemId(itemId);
    setAdjustType(type);
    setAdjustQuantity('');
    setAdjustNotes('');
    setShowAdjustModal(true);
  };

  return (
    <div className="p-6 space-y-6 font-poppins text-slate-800 dark:text-slate-100 h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      
      {/* Search and control bar */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search raw items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-2xl text-xs font-semibold outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <button
          onClick={() => {
            setSelectedItemId(inventory[0]?.id || '');
            setAdjustType('Purchased');
            setShowAdjustModal(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-brand-500 to-primary-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-1.5"
        >
          <Plus size={14} /> Adjust Stock
        </button>
      </div>

      {/* Grid displays and log ledger */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden min-h-0">
        
        {/* Left Column: Progress status cards */}
        <div className="lg:col-span-8 overflow-y-auto no-scrollbar space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredInventory.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400 text-xs">
                <Package size={36} className="mx-auto mb-2 opacity-30" />
                <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No raw material items found</p>
                <p className="text-[11px] text-slate-400 mt-1">Adjust stock to start tracking kitchen items</p>
              </div>
            ) : (
              filteredInventory.map((item) => {
                const totalStock = item.openingStock + item.purchased;
                const remainingPct = totalStock > 0 ? Math.min(100, Math.round((item.remaining / totalStock) * 100)) : 0;
                const isLow = item.remaining <= item.lowStockThreshold;

              return (
                <div 
                  key={item.id}
                  className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/40 rounded-3xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Title & units info */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                        <Package size={14} className="text-brand-500" /> {item.name}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Threshold: {item.lowStockThreshold} {item.unit}</span>
                    </div>

                    {isLow && (
                      <span className="text-[8px] font-extrabold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                        <AlertTriangle size={8} /> Low Stock
                      </span>
                    )}
                  </div>

                  {/* Progress Bar details */}
                  <div className="space-y-1.5 my-3">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Levels</span>
                      <span className="font-bold text-slate-800 dark:text-white font-mono">
                        {item.remaining.toFixed(1)} / {totalStock.toFixed(0)} <strong className="text-[10px] font-semibold text-slate-400">{item.unit}</strong>
                      </span>
                    </div>
                    
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isLow ? 'bg-gradient-to-r from-rose-500 to-red-500 animate-pulse' : 'bg-gradient-to-r from-brand-500 to-primary-500'
                        }`}
                        style={{ width: `${remainingPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Operational indicators (purchased vs used) */}
                  <div className="grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-darkBorder/40 pt-3 text-[10px] text-slate-500 font-bold">
                    <div className="flex flex-col">
                      <span>Additions:</span>
                      <span className="text-emerald-500 font-mono text-xs">+{item.purchased.toFixed(0)} {item.unit}</span>
                    </div>
                    <div className="flex flex-col">
                      <span>Sales/Helper:</span>
                      <span className="text-rose-500 font-mono text-xs">-{item.used.toFixed(1)} {item.unit}</span>
                    </div>
                  </div>

                  {/* Adjust Actions overlay triggers */}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-darkBorder/40">
                    <button
                      onClick={() => handleOpenAdjust(item.id, 'Purchased')}
                      className="flex-1 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-[9px] font-extrabold rounded-xl transition-colors flex items-center justify-center gap-1"
                    >
                      <ArrowUpRight size={10} /> Restock
                    </button>
                    <button
                      onClick={() => handleOpenAdjust(item.id, 'Used')}
                      className="flex-1 py-1.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-[9px] font-extrabold rounded-xl transition-colors flex items-center justify-center gap-1"
                    >
                      <ArrowDownRight size={10} /> Waste
                    </button>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>

        {/* Right Column: Historical logs Ledger */}
        <div className="lg:col-span-4 glass-panel border border-slate-200/50 dark:border-darkBorder rounded-3xl flex flex-col overflow-hidden h-full">
          <div className="p-4 border-b border-slate-200/50 dark:border-darkBorder/50 flex items-center gap-2 flex-shrink-0">
            <History size={16} className="text-brand-500" />
            <span className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider">Adjustment Ledger</span>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
            {inventoryLogs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs text-center py-12">
                No adjustments logged. Adjust stock level to preview history logs.
              </div>
            ) : (
              inventoryLogs.map((log) => (
                <div 
                  key={log.id}
                  className="p-3 bg-white dark:bg-darkCard hover:bg-slate-100/30 dark:hover:bg-darkBorder/30 rounded-2xl border border-slate-100 dark:border-darkBorder/20 text-xs flex items-center justify-between"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-slate-800 dark:text-white truncate">{log.itemName}</span>
                    <span className="text-[9px] text-slate-400 leading-normal truncate">{log.notes}</span>
                    <span className="text-[8px] text-slate-400 mt-1 font-medium">
                      {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <span className={`font-mono font-bold text-right whitespace-nowrap ml-2 ${
                    log.type === 'Purchased' ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {log.type === 'Purchased' ? '+' : '-'}{log.quantity.toFixed(1)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ADJUSTMENT POPUP FORM */}
      <AnimatePresence>
        {showAdjustModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs">
            <motion.form 
              onSubmit={handleAdjustSubmit}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm glass-panel rounded-3xl border border-slate-200/50 dark:border-darkBorder p-6 font-poppins flex flex-col gap-4 shadow-2xl bg-white dark:bg-darkCard"
            >
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-darkBorder/50 pb-3">
                <span className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                  📐 Adjust Raw Inventory
                </span>
                <button type="button" onClick={() => setShowAdjustModal(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-darkBorder">
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select Raw Material</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500"
                >
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Adjustment Type</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as any)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500"
                  >
                    <option value="Purchased">Restock / Add (+)</option>
                    <option value="Used">Wastage / Less (-)</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Quantity</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Enter units"
                    value={adjustQuantity}
                    onChange={(e) => setAdjustQuantity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Notes / Explanations</label>
                <textarea
                  required
                  placeholder="e.g. Gas cylinder refilled by vendor or Chicken spoilage..."
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-brand-500 to-primary-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={14} /> Commit Adjustment
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
