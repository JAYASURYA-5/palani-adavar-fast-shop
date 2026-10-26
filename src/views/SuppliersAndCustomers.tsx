import React, { useState, useMemo } from 'react';
import { useRestaurantStore, Customer, Supplier } from '../store/restaurantStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Truck, 
  Search, 
  Plus, 
  X, 
  Award, 
  TrendingUp, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const SuppliersAndCustomers: React.FC = () => {
  const { 
    customers, 
    addCustomer,
    suppliers, 
    addSupplier, 
    updateSupplierOutstanding,
    addExpense
  } = useRestaurantStore();

  const [activeSubTab, setActiveSubTab] = useState<'customers' | 'suppliers'>('customers');

  // Search queries
  const [crmSearch, setCrmSearch] = useState('');

  // Modals
  const [showCustModal, setShowCustModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState<Supplier | null>(null);

  // Form Fields - Customer
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');

  // Form Fields - Supplier
  const [supName, setSupName] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supItems, setSupItems] = useState('');
  
  // Form Fields - Settle Balance
  const [settleAmount, setSettleAmount] = useState('');
  const [settleNotes, setSettleNotes] = useState('');

  // Computations
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(crmSearch.toLowerCase()) ||
      c.phone.includes(crmSearch)
    );
  }, [customers, crmSearch]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => 
      s.name.toLowerCase().includes(crmSearch.toLowerCase()) ||
      s.itemsSupplied.some(i => i.toLowerCase().includes(crmSearch.toLowerCase()))
    );
  }, [suppliers, crmSearch]);

  // Actions
  const handleCustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone) return;

    addCustomer({
      name: custName,
      phone: custPhone,
      email: custEmail || `${custName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      favoriteItems: []
    } as any);

    setCustName('');
    setCustPhone('');
    setCustEmail('');
    setShowCustModal(false);
  };

  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName || !supPhone) return;

    addSupplier({
      name: supName,
      phone: supPhone,
      email: supEmail || `${supName.toLowerCase().replace(/\s+/g, '')}@supplier.com`,
      address: supAddress,
      itemsSupplied: supItems.split(',').map(s => s.trim()).filter(Boolean),
      outstandingBalance: 0,
      lastPurchaseDate: new Date().toISOString().split('T')[0]
    });

    setSupName('');
    setSupPhone('');
    setSupEmail('');
    setSupAddress('');
    setSupItems('');
    setShowSupplierModal(false);
  };

  const handleSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSettleModal) return;
    const amountNum = parseFloat(settleAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    // 1. Deduct outstanding from Supplier
    updateSupplierOutstanding(showSettleModal.id, -amountNum);

    // 2. Register Expense in sales/expense ledger
    let category: any = 'Miscellaneous';
    if (showSettleModal.name.toLowerCase().includes('chicken') || showSettleModal.name.toLowerCase().includes('broiler')) {
      category = 'Chicken Purchase';
    } else if (showSettleModal.name.toLowerCase().includes('rice')) {
      category = 'Rice Purchase';
    } else if (showSettleModal.name.toLowerCase().includes('egg')) {
      category = 'Eggs';
    } else if (showSettleModal.name.toLowerCase().includes('oil')) {
      category = 'Oil Purchase';
    }

    addExpense({
      category,
      amount: amountNum,
      notes: settleNotes || `Credit Settlement payment to ${showSettleModal.name}`
    });

    // Reset Form
    setSettleAmount('');
    setSettleNotes('');
    setShowSettleModal(null);
  };

  return (
    <div className="p-6 space-y-6 font-poppins text-slate-800 dark:text-slate-100 h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      
      {/* Tab select & search controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
        
        <div className="flex bg-slate-100 dark:bg-darkBorder p-1.5 rounded-2xl w-full sm:w-64 border border-slate-200/50 dark:border-darkBorder/50">
          <button
            onClick={() => { setActiveSubTab('customers'); setCrmSearch(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeSubTab === 'customers' 
                ? 'bg-gradient-to-r from-brand-500 to-primary-500 text-white shadow shadow-brand-500/10' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            Loyalty Customers
          </button>
          <button
            onClick={() => { setActiveSubTab('suppliers'); setCrmSearch(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeSubTab === 'suppliers' 
                ? 'bg-gradient-to-r from-brand-500 to-primary-500 text-white shadow shadow-brand-500/10' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            Suppliers Ledger
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              placeholder={activeSubTab === 'customers' ? "Search customer contact..." : "Search supplier, supplies..."}
              value={crmSearch}
              onChange={(e) => setCrmSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-2xl text-xs font-semibold outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          
          <button
            onClick={() => {
              if (activeSubTab === 'customers') setShowCustModal(true);
              else setShowSupplierModal(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-brand-500 to-primary-500 hover:from-brand-600 hover:to-primary-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-1.5 justify-center flex-shrink-0"
          >
            <Plus size={14} /> Add {activeSubTab === 'customers' ? 'Customer' : 'Supplier'}
          </button>
        </div>
      </div>

      {/* VIEW PANEL CONTROLLER */}
      {activeSubTab === 'customers' ? (
        <div className="flex-1 glass-panel border border-slate-200/50 dark:border-darkBorder rounded-3xl overflow-hidden flex flex-col min-h-0">
          <div className="overflow-x-auto flex-1 no-scrollbar">
            <table className="w-full text-left text-xs border-collapse relative">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200/50 dark:border-darkBorder/50 z-10">
                <tr>
                  <th className="p-4">NAME</th>
                  <th className="p-4">CONTACT NO</th>
                  <th className="p-4">EMAIL</th>
                  <th className="p-4 text-center">VISIT COUNT</th>
                  <th className="p-4 text-right">TOTAL SPENT</th>
                  <th className="p-4 text-center">LOYALTY POINTS</th>
                  <th className="p-4">FAVORITES</th>
                  <th className="p-4">LAST VISIT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-darkBorder/40">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-100/50 dark:hover:bg-darkBorder/20 transition-colors">
                    <td className="p-4 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-500 font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {cust.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-white">{cust.name}</span>
                    </td>
                    <td className="p-4 font-mono font-medium text-slate-500">{cust.phone}</td>
                    <td className="p-4 text-slate-400">{cust.email}</td>
                    <td className="p-4 text-center font-bold font-mono text-slate-600 dark:text-slate-300">{cust.visitCount}</td>
                    <td className="p-4 text-right font-bold font-mono text-brand-500">₹{cust.totalSpent.toFixed(0)}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                        <Award size={10} /> {cust.loyaltyPoints} PTS
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 max-w-[150px] truncate" title={cust.favoriteItems.join(', ')}>
                      {cust.favoriteItems.join(', ') || 'N/A'}
                    </td>
                    <td className="p-4 text-slate-400 font-medium">{cust.lastVisitDate}</td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400 text-xs">
                      <div className="flex flex-col items-center gap-2">
                        <Users size={36} className="text-slate-300 dark:text-slate-600 animate-pulse" />
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-300">No customer records found</span>
                        <span className="text-[11px] text-slate-400">Try adjusting your search criteria</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-6 min-h-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredSuppliers.map((sup) => (
              <div 
                key={sup.id}
                className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/40 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Header Info */}
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{sup.name}</span>
                    <span className="text-[9px] text-slate-400 font-medium flex items-center gap-1 mt-0.5"><Calendar size={10} /> Last supply: {sup.lastPurchaseDate}</span>
                  </div>
                  <span className="p-2 rounded-xl bg-brand-500/10 text-brand-500 flex-shrink-0">
                    <Truck size={16} />
                  </span>
                </div>

                {/* Items & details */}
                <div className="space-y-2.5 my-3 text-[11px] font-medium text-slate-500">
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-slate-400" />
                    <span className="font-mono text-slate-600 dark:text-slate-300">{sup.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-slate-400" />
                    <span className="truncate">{sup.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={12} className="text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{sup.address}</span>
                  </div>
                  
                  {/* Category Supplies tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {sup.itemsSupplied.map((item, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-darkBorder rounded text-[9px] font-bold text-slate-600 dark:text-slate-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Financial Ledger (We owe) */}
                <div className="border-t border-slate-100 dark:border-darkBorder/40 pt-4 mt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Outstanding Due</span>
                    <span className={`text-base font-extrabold font-mono ${sup.outstandingBalance > 0 ? 'text-rose-500 font-extrabold' : 'text-emerald-500'}`}>
                      ₹{sup.outstandingBalance.toFixed(0)}
                    </span>
                  </div>

                  {sup.outstandingBalance > 0 && (
                    <button
                      onClick={() => setShowSettleModal(sup)}
                      className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-[10px] font-extrabold rounded-xl transition-all flex items-center gap-1"
                    >
                      <CreditCard size={12} /> Settle Credit
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filteredSuppliers.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <Truck size={36} className="text-slate-300 dark:text-slate-600 animate-pulse" />
                <span className="font-bold text-sm text-slate-700 dark:text-slate-300">No supplier records found</span>
                <span className="text-[11px] text-slate-400">Try searching a different keyword</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: Add Customer Modal */}
      <AnimatePresence>
        {showCustModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs">
            <motion.form 
              onSubmit={handleCustSubmit}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm glass-panel rounded-3xl border border-slate-200/50 dark:border-darkBorder p-6 font-poppins flex flex-col gap-4 shadow-2xl bg-white dark:bg-darkCard"
            >
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-darkBorder/50 pb-3">
                <span className="font-bold text-sm text-slate-800 dark:text-white">Register Loyalty Customer</span>
                <button type="button" onClick={() => setShowCustModal(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-darkBorder">
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9845612300"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Email ID (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. ramesh@gmail.com"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-brand-500 to-primary-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all"
              >
                Create Loyalty Account
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Add Supplier Modal */}
      <AnimatePresence>
        {showSupplierModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.form 
              onSubmit={handleSupplierSubmit}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm glass-panel rounded-3xl border border-slate-200/50 dark:border-darkBorder p-6 font-poppins flex flex-col gap-4 shadow-2xl bg-white dark:bg-darkCard my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-darkBorder/50 pb-3">
                <span className="font-bold text-sm text-slate-800 dark:text-white">Add Vendor Supplier</span>
                <button type="button" onClick={() => setShowSupplierModal(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-darkBorder">
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Supplier Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coimbatore Rice Mill"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Number</label>
                  <input
                    type="text"
                    required
                    placeholder="9944332211"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                  <input
                    type="email"
                    placeholder="mill@rice.com"
                    value={supEmail}
                    onChange={(e) => setSupEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Supplies Category (Comma separated)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Raw Chicken, Broiler, Eggs"
                  value={supItems}
                  onChange={(e) => setSupItems(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Full Address</label>
                <textarea
                  placeholder="Street and office location..."
                  value={supAddress}
                  onChange={(e) => setSupAddress(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-brand-500 to-primary-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all"
              >
                Register Supplier
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Settle Balance Credit Payment Drawer */}
      <AnimatePresence>
        {showSettleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs">
            <motion.form 
              onSubmit={handleSettleSubmit}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm glass-panel rounded-3xl border border-slate-200/50 dark:border-darkBorder p-6 font-poppins flex flex-col gap-4 shadow-2xl bg-white dark:bg-darkCard"
            >
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-darkBorder/50 pb-3">
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-slate-800 dark:text-white">Settle Due Credit</span>
                  <span className="text-[10px] text-slate-400 font-medium">To: {showSettleModal.name}</span>
                </div>
                <button type="button" onClick={() => setShowSettleModal(null)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-darkBorder">
                  <X size={16} />
                </button>
              </div>

              <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-500 rounded-2xl flex justify-between items-center text-xs font-bold">
                <span>Total Credit Due:</span>
                <span className="font-mono">₹{showSettleModal.outstandingBalance}</span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Payment Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="Enter amount paid"
                  max={showSettleModal.outstandingBalance}
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Payment reference notes</label>
                <textarea
                  placeholder="e.g. Paid via GPay business or Cash from register..."
                  value={settleNotes}
                  onChange={(e) => setSettleNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-brand-500 to-primary-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={14} /> Commit Credit Payment
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
