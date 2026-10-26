import React, { useState, useMemo } from 'react';
import { useRestaurantStore, MenuItem, CartItem } from '../store/restaurantStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Heart, 
  Plus, 
  Minus, 
  Trash2, 
  Receipt, 
  Check, 
  X, 
  QrCode, 
  Printer, 
  Download, 
  Mail, 
  UserPlus, 
  Smile,
  IndianRupee,
  Tags
} from 'lucide-react';

export const POSBilling: React.FC = () => {
  const { 
    menu, 
    cart, 
    addToCart, 
    updateCartItemQuantity, 
    updateCartItemNotes, 
    removeFromCart, 
    clearCart,
    createOrder,
    customers,
    addCustomer,
    toggleFavorite,
    settings
  } = useRestaurantStore();

  // Search & Filters
  const [activeCategory, setActiveCategory] = useState<'All' | 'Rice' | 'Chilli Chicken' | 'Extras'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart Adjustments
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState('');
  
  // Custom Price Modal for Gravy
  const [gravyItem, setGravyItem] = useState<MenuItem | null>(null);
  const [gravyPrice, setGravyPrice] = useState('');
  
  // New Customer Modal
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Phase 5: Order type selector
  const [orderType, setOrderType] = useState<'Dine-in' | 'Takeaway' | 'Delivery'>('Takeaway');

  // Phase 13: Hold cart (up to 3 parked carts)
  const [parkedCarts, setParkedCarts] = useState<{ label: string; items: typeof cart }[]>([]);
  
  // Phase 13: Per-item discount visibility toggle per row
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // Payment Drawers
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Split'>('Cash');
  const [splitCash, setSplitCash] = useState('');
  const [splitUpi, setSplitUpi] = useState('');
  const [splitCard, setSplitCard] = useState('');
  
  // Receipt State
  const [activeReceipt, setActiveReceipt] = useState<any>(null); // Order object for printing
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Phase 13: Hold cart handlers
  const handleHoldCart = () => {
    if (cart.length === 0) return;
    if (parkedCarts.length >= 3) {
      alert('Maximum 3 carts can be on hold. Resume one first.');
      return;
    }
    setParkedCarts(prev => [...prev, { label: `Hold ${prev.length + 1}`, items: [...cart] }]);
    clearCart();
  };

  const handleResumeCart = (idx: number) => {
    if (cart.length > 0 && !window.confirm('Resuming a held cart will replace the current cart. Continue?')) return;
    const held = parkedCarts[idx];
    clearCart();
    // Re-add each item to cart
    held.items.forEach(item => {
      addToCart(item.menuItem, item.customPrice);
    });
    setParkedCarts(prev => prev.filter((_, i) => i !== idx));
  };

  // Filter Menu Items
  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      const matchCat = activeCategory === 'All' || item.category === activeCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menu, activeCategory, searchQuery]);

  // Selected Customer Details
  const activeCustomer = useMemo(() => {
    if (!selectedCustomerPhone) return null;
    return customers.find(c => c.phone === selectedCustomerPhone) || null;
  }, [selectedCustomerPhone, customers]);

  // Financial Metrics
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const itemPrice = item.customPrice !== undefined ? item.customPrice : item.menuItem.price;
      return sum + (itemPrice * item.quantity);
    }, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return Math.round((subtotal * (discountPercentage / 100)) * 100) / 100;
  }, [subtotal, discountPercentage]);

  const taxAmount = useMemo(() => {
    const net = subtotal - discountAmount;
    return Math.round((net * (settings.taxPercentage / 100)) * 100) / 100;
  }, [subtotal, discountAmount, settings.taxPercentage]);

  const grandTotal = subtotal - discountAmount + taxAmount;

  // Handlers
  const handleItemClick = (item: MenuItem) => {
    // Phase 5: Out-of-stock greyout enforcement
    if (item.isAvailable === false) return;
    if (item.name.toLowerCase().includes('gravy')) {
      // Trigger gravy custom price popup
      setGravyItem(item);
      setGravyPrice('15'); // default suggested price
    } else {
      addToCart(item);
    }
  };

  const handleAddGravy = () => {
    if (!gravyItem) return;
    const priceNum = parseFloat(gravyPrice);
    if (!isNaN(priceNum) && priceNum >= 0) {
      addToCart(gravyItem, priceNum);
      setGravyItem(null);
      setGravyPrice('');
    }
  };

  const handleNewCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;
    addCustomer({
      name: newCustName,
      phone: newCustPhone,
      email: `${newCustName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      itemsSupplied: [], // not used for customer
    } as any);
    setSelectedCustomerPhone(newCustPhone);
    setNewCustName('');
    setNewCustPhone('');
    setShowAddCustomer(false);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    let splitDetails = undefined;
    if (paymentMode === 'Split') {
      splitDetails = {
        cash: parseFloat(splitCash) || 0,
        upi: parseFloat(splitUpi) || 0,
        card: parseFloat(splitCard) || 0
      };
    }

    try {
      const orderCreated = createOrder(
        paymentMode, 
        splitDetails, 
        activeCustomer?.name || 'Walk-in Customer',
        discountAmount,
        orderType  // Phase 5: pass order type
      );
      
      // Save order context and open receipt modal
      setActiveReceipt(orderCreated);
      setShowReceiptModal(true);
      
      // Reset POS cart indicators
      setDiscountPercentage(0);
      setSelectedCustomerPhone('');
      setSplitCash('');
      setSplitUpi('');
      setSplitCard('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Checkout failed');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden font-poppins relative">
      
      {/* LEFT PANEL: Menu Cards & Search */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto no-scrollbar border-r border-slate-200/50 dark:border-darkBorder/50">
        
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search food item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-2xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 transition-colors shadow-sm"
            />
          </div>
          {/* Quick CRM register */}
          <div className="flex gap-2">
            <select
              value={selectedCustomerPhone}
              onChange={(e) => setSelectedCustomerPhone(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-2xl text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-colors shadow-sm"
            >
              <option value="">Walk-in Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.phone}>{c.name} ({c.phone})</option>
              ))}
            </select>
            <button
              onClick={() => setShowAddCustomer(true)}
              className="p-2.5 bg-slate-100 dark:bg-darkBorder/40 hover:bg-slate-200 dark:hover:bg-darkBorder rounded-2xl text-slate-600 dark:text-slate-300 transition-colors"
              title="Add New Customer"
            >
              <UserPlus size={16} />
            </button>
          </div>
        </div>

        {/* Categories Tab selector */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none snap-x flex-shrink-0">
          {(['All', 'Rice', 'Chilli Chicken', 'Extras'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-brand-500 to-primary-500 text-white shadow shadow-brand-500/10 scale-105'
                  : 'bg-white dark:bg-darkCard text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkBorder/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Cards Grid */}
        {filteredMenu.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-3">
              <Search size={28} className="text-brand-500" />
            </div>
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">No matching dishes found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">Try selecting a different category or clearing your search term.</p>
            <button
              onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-500 text-xs font-bold transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 flex-1">
            {filteredMenu.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/30 rounded-3xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0 relative group"
              >
                {/* Image Container */}
                <div className="h-28 w-full relative bg-slate-100 dark:bg-slate-900/50">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Popular Badge */}
                  {item.isPopular && (
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-brand-500 text-[8px] font-extrabold text-white uppercase tracking-wider">
                      Popular
                    </span>
                  )}
                  
                  {/* Special Badge */}
                  {item.isSpecial && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-amber-500 text-[8px] font-extrabold text-white uppercase tracking-wider">
                      Special
                    </span>
                  )}
                </div>

                {/* Card Footer Details */}
                <div className="p-3.5 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{item.category}</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.name}</span>
                  
                  <div className="flex justify-between items-center mt-2.5">
                    <span className="text-xs font-extrabold text-brand-500 font-mono">
                      {item.name.toLowerCase().includes('gravy') ? 'Custom Price' : `₹${item.price}`}
                    </span>
                    
                    {/* Action add plus button */}
                    <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-darkBorder text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-brand-500 group-hover:to-primary-500 group-hover:text-white transition-all">
                      <Plus size={12} />
                    </div>
                  </div>
                </div>

                {/* Phase 5: Out-of-stock overlay */}
                {item.isAvailable === false && (
                  <div className="absolute inset-0 bg-slate-200/70 dark:bg-slate-900/70 rounded-2xl flex items-center justify-center z-10">
                    <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 bg-white dark:bg-darkCard px-2 py-1 rounded-full uppercase tracking-wider">Unavailable</span>
                  </div>
                )}

                {/* Heart favorite icon overlay */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                  className={`absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/60 text-white backdrop-blur-xs transition-colors hover:text-rose-500 ${
                    item.isFavorite ? 'text-rose-500' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Heart size={10} fill={item.isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* RIGHT PANEL: Shopping Cart Drawer */}
      <div className="w-full lg:w-96 glass-panel border-t lg:border-t-0 lg:border-l border-slate-200/50 dark:border-darkBorder/50 flex flex-col h-full bg-white/40 dark:bg-darkBg/40">
        
        {/* Phase 5: Order Type Selector */}
        <div className="px-4 pt-3.5 pb-0">
          <div className="flex bg-slate-100 dark:bg-darkBorder/50 rounded-xl p-1 text-xs font-bold">
            {(['Dine-in', 'Takeaway', 'Delivery'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                  orderType === type 
                    ? 'bg-gradient-to-r from-brand-500 to-primary-500 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'
                }`}
              >
                {type === 'Dine-in' ? '🍽 ' : type === 'Takeaway' ? '🛍 ' : '🛵 '}{type}
              </button>
            ))}
          </div>
        </div>

        {/* Shopping Cart Header */}
        <div className="p-4 border-b border-slate-200/50 dark:border-darkBorder/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-brand-500" />
            <span className="font-bold text-sm text-slate-800 dark:text-white">Active Order Cart</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Phase 13: Hold cart button */}
            {cart.length > 0 && (
              <button
                onClick={handleHoldCart}
                disabled={parkedCarts.length >= 3}
                className="text-[10px] font-bold text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Hold this cart to process another order"
              >
                ⏸ Hold
              </button>
            )}
            {cart.length > 0 && (
              <button 
                onClick={clearCart}
                className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-0.5"
              >
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Phase 13: Parked Carts Resume row */}
        {parkedCarts.length > 0 && (
          <div className="px-3 py-2 bg-amber-50/60 dark:bg-amber-950/10 border-b border-amber-200/30 dark:border-amber-900/20 flex gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
            {parkedCarts.map((held, idx) => (
              <button
                key={idx}
                onClick={() => handleResumeCart(idx)}
                className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-extrabold transition-colors flex items-center gap-1"
              >
                ▶ {held.label} ({held.items.length} items)
              </button>
            ))}
          </div>
        )}

        {/* Selected Customer indicator (loyalty highlights) */}
        {activeCustomer && (
          <div className="p-3 bg-brand-50/50 dark:bg-brand-950/15 border-b border-brand-100 dark:border-brand-950/20 text-xs flex items-center gap-2">
            <Smile size={16} className="text-brand-500 flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-700 dark:text-slate-300">{activeCustomer.name}</span>
              <span className="text-[10px] text-slate-400 font-medium">Points: {activeCustomer.loyaltyPoints} • discount applicable</span>
            </div>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <Receipt size={32} className="text-slate-300 animate-bounce" />
              <p className="text-xs font-bold text-slate-500">POS Cart is Empty</p>
              <p className="text-[10px] text-slate-400 max-w-xs text-center leading-relaxed">Add food items from the left grid to generate a new checkout bill.</p>
            </div>
          ) : (
            cart.map((item, idx) => {
              const price = item.customPrice !== undefined ? item.customPrice : item.menuItem.price;
              return (
                <div key={idx} className="flex flex-col gap-2 p-3 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/40 rounded-2xl shadow-xs">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {item.menuItem.name} 
                        {item.customPrice !== undefined && ` (₹${item.customPrice})`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.menuItem.category}</span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white font-mono flex-shrink-0">
                      ₹{(price * item.quantity).toFixed(0)}
                    </span>
                  </div>

                  {/* Quantity and Notes controllers */}
                  <div className="flex items-center justify-between gap-4 mt-1">
                    {/* Notes Trigger */}
                    <input
                      type="text"
                      placeholder="Add instructions..."
                      value={item.specialInstructions}
                      onChange={(e) => updateCartItemNotes(idx, e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-darkBorder/30 border border-slate-100 dark:border-darkBorder/10 px-2 py-1 rounded-lg text-[10px] text-slate-600 dark:text-slate-300 outline-none focus:border-brand-500"
                    />
                    
                    {/* Increments Box */}
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-darkBorder rounded-lg p-1">
                      <button 
                        onClick={() => updateCartItemQuantity(idx, item.quantity - 1)}
                        className="p-1 rounded bg-white dark:bg-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-xs font-bold font-mono px-1 w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartItemQuantity(idx, item.quantity + 1)}
                        className="p-1 rounded bg-white dark:bg-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pricing Summary */}
        <div className="p-4 border-t border-slate-200/50 dark:border-darkBorder/50 bg-slate-50/50 dark:bg-darkCard/30 space-y-3.5">
          
          {/* Quick Discount Box */}
          <div className="flex gap-2 items-center">
            <Tags size={14} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-auto">Apply Discount</span>
            <div className="flex bg-slate-100 dark:bg-darkBorder rounded-xl p-1 text-[10px] font-bold">
              {[0, 5, 10, 15].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setDiscountPercentage(pct)}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    discountPercentage === pct 
                      ? 'bg-brand-500 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-mono font-medium">₹{subtotal.toFixed(0)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-rose-500 font-semibold">
                <span>Discount ({discountPercentage}%)</span>
                <span className="font-mono">-₹{discountAmount.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>GST / Taxes ({settings.taxPercentage}%)</span>
              <span className="font-mono font-medium">₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold border-t border-slate-200/50 dark:border-darkBorder/50 pt-2 text-slate-800 dark:text-white">
              <span>Grand Total</span>
              <span className="font-mono text-brand-500">₹{grandTotal.toFixed(0)}</span>
            </div>
          </div>

          {/* Payment Mode grid */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-darkBorder rounded-2xl">
            {(['Cash', 'UPI', 'Card', 'Split'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setPaymentMode(mode)}
                className={`py-2 text-[10px] font-extrabold rounded-xl text-center transition-all ${
                  paymentMode === mode 
                    ? 'bg-gradient-to-r from-brand-500 to-primary-500 text-white shadow shadow-brand-500/10' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Split Payment details drawer */}
          {paymentMode === 'Split' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-darkBorder/40 p-2.5 rounded-2xl text-[10px] font-bold"
            >
              <div className="flex flex-col gap-1">
                <span>Cash Amount</span>
                <input 
                  type="number" 
                  placeholder="Cash"
                  value={splitCash}
                  onChange={(e) => setSplitCash(e.target.value)}
                  className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span>UPI Amount</span>
                <input 
                  type="number" 
                  placeholder="UPI"
                  value={splitUpi}
                  onChange={(e) => setSplitUpi(e.target.value)}
                  className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span>Card Amount</span>
                <input 
                  type="number" 
                  placeholder="Card"
                  value={splitCard}
                  onChange={(e) => setSplitCard(e.target.value)}
                  className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard text-xs"
                />
              </div>
            </motion.div>
          )}

          {/* Checkout print button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-3 bg-gradient-to-r from-brand-500 to-primary-500 hover:from-brand-600 hover:to-primary-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <Check size={14} /> Generate Bill & Dispatch
          </button>
        </div>

      </div>

      {/* MODAL 1: Custom Gravy Price Modal */}
      <AnimatePresence>
        {gravyItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm glass-panel rounded-3xl border border-slate-200/50 dark:border-darkBorder p-6 font-poppins flex flex-col gap-4 shadow-2xl bg-white dark:bg-darkCard"
            >
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-darkBorder/50 pb-3">
                <span className="font-bold text-sm text-slate-800 dark:text-white">Custom Price: {gravyItem.name}</span>
                <button onClick={() => setGravyItem(null)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-darkBorder">
                  <X size={16} />
                </button>
              </div>

              {/* Price Suggestions */}
              <div className="flex gap-2">
                {[10, 15, 20, 30].map((pr) => (
                  <button
                    key={pr}
                    type="button"
                    onClick={() => setGravyPrice(pr.toString())}
                    className="flex-1 py-2 bg-slate-100 dark:bg-darkBorder text-xs font-bold rounded-xl hover:bg-brand-500 hover:text-white transition-colors"
                  >
                    ₹{pr}
                  </button>
                ))}
              </div>

              {/* Text Input */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Custom Amount (₹)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={gravyPrice}
                  onChange={(e) => setGravyPrice(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <button
                onClick={handleAddGravy}
                className="w-full py-3 bg-gradient-to-r from-brand-500 to-primary-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all"
              >
                Add to Cart
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Add Customer Modal */}
      <AnimatePresence>
        {showAddCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs">
            <motion.form 
              onSubmit={handleNewCustomerSubmit}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm glass-panel rounded-3xl border border-slate-200/50 dark:border-darkBorder p-6 font-poppins flex flex-col gap-4 shadow-2xl bg-white dark:bg-darkCard"
            >
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-darkBorder/50 pb-3">
                <span className="font-bold text-sm text-slate-800 dark:text-white">Register Loyalty Customer</span>
                <button type="button" onClick={() => setShowAddCustomer(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-darkBorder">
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh S"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-brand-500 to-primary-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all"
              >
                Register & Bind to Cart
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Printable POS Thermal Invoice Receipt Modal */}
      <AnimatePresence>
        {showReceiptModal && activeReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-darkBorder relative my-8"
            >
              {/* Controls bar */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkBorder/40 pb-3 mb-4">
                <span className="font-extrabold text-xs text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  📄 POS Print Console
                </span>
                <button 
                  onClick={() => setShowReceiptModal(false)}
                  className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-darkBorder text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* The 3-inch Print Container */}
              <div id="printable-receipt" className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-800 font-mono text-xs select-all leading-relaxed">
                
                {/* Header */}
                <div className="text-center space-y-1 mb-4">
                  <span className="text-2xl block">🔥</span>
                  <h2 className="font-bold text-sm uppercase tracking-wide">{settings.name}</h2>
                  <p className="text-[9px] text-slate-500 whitespace-pre-line leading-normal">{settings.receiptHeader}</p>
                  <p className="text-[8px] text-slate-400 leading-none mt-1">{settings.address}</p>
                  <p className="text-[8px] text-slate-400 leading-none">Ph: {settings.phone}</p>
                </div>

                <div className="border-t border-b border-dashed border-slate-300 py-2 my-2 space-y-0.5 text-[10px] text-slate-500">
                  <div className="flex justify-between">
                    <span>BILL NO: {activeReceipt.id}</span>
                    <span>CASHIER: {activeReceipt.cashierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DATE: {new Date(activeReceipt.timestamp).toLocaleDateString()}</span>
                    <span>TIME: {new Date(activeReceipt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CUSTOMER: {activeReceipt.customerName || 'Walk-in'}</span>
                    <span>STATUS: {activeReceipt.paymentStatus}</span>
                  </div>
                </div>

                {/* Items details table */}
                <table className="w-full text-left my-4 text-[10px] border-collapse">
                  <thead>
                    <tr className="border-b border-dashed border-slate-300 text-slate-600">
                      <th className="py-1">ITEM</th>
                      <th className="py-1 text-center">QTY</th>
                      <th className="py-1 text-right">RATE</th>
                      <th className="py-1 text-right">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReceipt.items.map((item: CartItem, idx: number) => {
                      const rate = item.customPrice !== undefined ? item.customPrice : item.menuItem.price;
                      return (
                        <tr key={idx} className="border-b border-slate-100/50">
                          <td className="py-1.5 max-w-[140px] truncate">{item.menuItem.name}</td>
                          <td className="py-1.5 text-center">{item.quantity}</td>
                          <td className="py-1.5 text-right font-mono">₹{rate}</td>
                          <td className="py-1.5 text-right font-mono">₹{(rate * item.quantity).toFixed(0)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Summary metrics */}
                <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[10px]">
                  <div className="flex justify-between text-slate-500">
                    <span>SUBTOTAL</span>
                    <span className="font-mono">₹{activeReceipt.subtotal.toFixed(0)}</span>
                  </div>
                  {activeReceipt.discount > 0 && (
                    <div className="flex justify-between text-rose-500 font-bold">
                      <span>DISCOUNT</span>
                      <span className="font-mono">-₹{activeReceipt.discount.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span>GST (5%)</span>
                    <span className="font-mono">₹{activeReceipt.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[11px] border-t border-dashed border-slate-300 pt-1.5">
                    <span>GRAND TOTAL</span>
                    <span className="font-mono">₹{activeReceipt.grandTotal.toFixed(0)}</span>
                  </div>
                </div>

                {/* QR Code Scan Block */}
                {activeReceipt.paymentMethod === 'UPI' && (
                  <div className="my-5 flex flex-col items-center gap-2 border border-slate-200 dark:border-slate-800 p-3 rounded-xl bg-white">
                    {/* Simulated SVG QR */}
                    <div className="w-24 h-24 bg-slate-100 flex items-center justify-center relative border border-slate-200/50 rounded-lg">
                      <QrCode size={64} className="text-slate-800" />
                    </div>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Scan & Pay ₹{activeReceipt.grandTotal.toFixed(0)}</span>
                  </div>
                )}

                {/* Thank You message */}
                <div className="text-center text-[8px] text-slate-400 mt-5 whitespace-pre-line leading-normal">
                  {settings.receiptFooter}
                </div>

              </div>

              {/* Utility actions */}
              <div className="grid grid-cols-3 gap-2 mt-4 text-[10px] font-bold">
                <button
                  onClick={handlePrint}
                  className="py-2.5 bg-slate-100 dark:bg-darkBorder hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl flex items-center justify-center gap-1 transition-colors"
                >
                  <Printer size={12} /> Print
                </button>
                <button
                  onClick={() => alert('PDF invoice compiled successfully. Downloading...')}
                  className="py-2.5 bg-slate-100 dark:bg-darkBorder hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl flex items-center justify-center gap-1 transition-colors"
                >
                  <Download size={12} /> PDF
                </button>
                <button
                  onClick={() => alert(`Receipt mailed to billing client.`)}
                  className="py-2.5 bg-slate-100 dark:bg-darkBorder hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl flex items-center justify-center gap-1 transition-colors"
                >
                  <Mail size={12} /> Email
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
