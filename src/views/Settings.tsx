import React, { useState } from 'react';
import { useRestaurantStore } from '../store/restaurantStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Printer, 
  Receipt, 
  Database, 
  User, 
  Save, 
  CheckSquare, 
  ShieldAlert,
  Building,
  Languages,
  DollarSign
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    currentUser, 
    isDarkMode, 
    toggleDarkMode,
    menu,
    orders,
    expenses,
    inventory,
    inventoryLogs,
    suppliers,
    customers,
    employees
  } = useRestaurantStore();

  const [activeSettingsTab, setActiveSettingsTab] = useState<'restaurant' | 'receipt' | 'backup' | 'profile'>('restaurant');

  // Form states - Restaurant Config
  const [restName, setRestName] = useState(settings.name);
  const [restPhone, setRestPhone] = useState(settings.phone);
  const [restAddress, setRestAddress] = useState(settings.address);
  const [restUpi, setRestUpi] = useState(settings.upiId);
  const [restTax, setRestTax] = useState(settings.taxPercentage.toString());
  const [restCurrency, setRestCurrency] = useState(settings.currencySymbol);

  // Form states - Printer Config
  const [rcptHeader, setRcptHeader] = useState(settings.receiptHeader);
  const [rcptFooter, setRcptFooter] = useState(settings.receiptFooter);
  const [prtrName, setPrtrName] = useState(settings.printerName);
  const [autoPrnt, setAutoPrnt] = useState(settings.autoPrintReceipt);

  const [saveMessage, setSaveMessage] = useState('');

  const handleSaveRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      name: restName,
      phone: restPhone,
      address: restAddress,
      upiId: restUpi,
      taxPercentage: parseFloat(restTax) || 0,
      currencySymbol: restCurrency
    });
    triggerSaveAlert('Restaurant configurations updated successfully.');
  };

  const handleSaveReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      receiptHeader: rcptHeader,
      receiptFooter: rcptFooter,
      printerName: prtrName,
      autoPrintReceipt: autoPrnt
    });
    triggerSaveAlert('Thermal receipt design templates saved.');
  };

  const triggerSaveAlert = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => {
      setSaveMessage('');
    }, 3000);
  };

  const handleBackup = () => {
    const fullSnapshot = {
      appName: 'Palani Andavar Fast POS',
      backupVersion: '2.0',
      exportedAt: new Date().toISOString(),
      settings,
      menu,
      orders,
      expenses,
      inventory,
      inventoryLogs,
      suppliers,
      customers,
      employees
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullSnapshot, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `palani_andavar_full_backup_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
    triggerSaveAlert('Complete system database backup (orders, expenses, inventory, CRM) downloaded.');
  };

  return (
    <div className="p-6 space-y-6 font-poppins text-slate-800 dark:text-slate-100 h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      
      {/* Save indicator alert banner */}
      <AnimatePresence>
        {saveMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-xs font-bold rounded-2xl flex items-center gap-2 flex-shrink-0"
          >
            <CheckSquare size={14} /> {saveMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden min-h-0">
        
        {/* Left Side: Navigation Links */}
        <div className="lg:col-span-3 flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={() => setActiveSettingsTab('restaurant')}
            className={`w-full text-left p-3.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 border ${
              activeSettingsTab === 'restaurant'
                ? 'bg-gradient-to-r from-brand-600 to-brand-500 border-brand-500 text-white shadow-md shadow-brand-500/20 ring-1 ring-white/10'
                : 'bg-white dark:bg-darkCard border-slate-200 dark:border-darkBorder hover:bg-slate-50 dark:hover:bg-darkBorder/40 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Building size={16} /> Restaurant Details
          </button>
          <button
            onClick={() => setActiveSettingsTab('receipt')}
            className={`w-full text-left p-3.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 border ${
              activeSettingsTab === 'receipt'
                ? 'bg-gradient-to-r from-brand-600 to-brand-500 border-brand-500 text-white shadow-md shadow-brand-500/20 ring-1 ring-white/10'
                : 'bg-white dark:bg-darkCard border-slate-200 dark:border-darkBorder hover:bg-slate-50 dark:hover:bg-darkBorder/40 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Printer size={16} /> Receipt & Printers
          </button>
          <button
            onClick={() => setActiveSettingsTab('backup')}
            className={`w-full text-left p-3.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 border ${
              activeSettingsTab === 'backup'
                ? 'bg-gradient-to-r from-brand-600 to-brand-500 border-brand-500 text-white shadow-md shadow-brand-500/20 ring-1 ring-white/10'
                : 'bg-white dark:bg-darkCard border-slate-200 dark:border-darkBorder hover:bg-slate-50 dark:hover:bg-darkBorder/40 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Database size={16} /> Backup & Restores
          </button>
          <button
            onClick={() => setActiveSettingsTab('profile')}
            className={`w-full text-left p-3.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 border ${
              activeSettingsTab === 'profile'
                ? 'bg-gradient-to-r from-brand-600 to-brand-500 border-brand-500 text-white shadow-md shadow-brand-500/20 ring-1 ring-white/10'
                : 'bg-white dark:bg-darkCard border-slate-200 dark:border-darkBorder hover:bg-slate-50 dark:hover:bg-darkBorder/40 text-slate-700 dark:text-slate-300'
            }`}
          >
            <User size={16} /> Cashier Profile
          </button>
        </div>

        {/* Right Side: Active Settings Panel Form */}
        <div className="lg:col-span-9 glass-panel border border-slate-200/50 dark:border-darkBorder rounded-3xl p-6 overflow-y-auto no-scrollbar h-full bg-white/50 dark:bg-darkCard/20">
          
          {/* 1. RESTAURANT DETAILS CONFIG */}
          {activeSettingsTab === 'restaurant' && (
            <form onSubmit={handleSaveRestaurant} className="space-y-4">
              <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider block border-b pb-3 mb-4">
                🏪 Restaurant Information
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Shop Name</label>
                  <input
                    type="text"
                    required
                    value={restName}
                    onChange={(e) => setRestName(e.target.value)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard text-xs font-semibold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-slate-800 dark:text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Telephone</label>
                  <input
                    type="text"
                    required
                    value={restPhone}
                    onChange={(e) => setRestPhone(e.target.value)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard text-xs font-semibold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Shop Location Address</label>
                <input
                  type="text"
                  required
                  value={restAddress}
                  onChange={(e) => setRestAddress(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard text-xs font-semibold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">UPI Pay ID (For checkout QRs)</label>
                  <input
                    type="text"
                    required
                    value={restUpi}
                    onChange={(e) => setRestUpi(e.target.value)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard text-xs font-semibold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-slate-800 dark:text-white"
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Store GST / TAX (%)</label>
                  <input
                    type="number"
                    required
                    value={restTax}
                    onChange={(e) => setRestTax(e.target.value)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard text-xs font-semibold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Currency symbol</label>
                  <input
                    type="text"
                    required
                    value={restCurrency}
                    onChange={(e) => setRestCurrency(e.target.value)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard text-xs font-semibold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Theme toggle checkbox */}
              <div className="border-t border-slate-100 dark:border-darkBorder/40 pt-4 mt-6 flex justify-between items-center text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1.5"><Languages size={14} /> UI Theme Preferences</span>
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className="px-4 py-2 bg-slate-100 dark:bg-darkBorder hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl transition-all"
                >
                  {isDarkMode ? '🌙 Dark Mode Active' : '☀️ Light Mode Active'}
                </button>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-brand-500 to-primary-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 flex items-center gap-1.5"
              >
                <Save size={14} /> Save Config
              </button>
            </form>
          )}

          {/* 2. RECEIPT & PRINTER TEMPLATES */}
          {activeSettingsTab === 'receipt' && (
            <form onSubmit={handleSaveReceipt} className="space-y-4">
              <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider block border-b pb-3 mb-4">
                📄 Thermal Receipt Templates & Devices
              </span>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Receipt Header Message</label>
                <textarea
                  value={rcptHeader}
                  onChange={(e) => setRcptHeader(e.target.value)}
                  rows={2}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard text-xs font-semibold resize-none outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Receipt Footer message</label>
                <textarea
                  value={rcptFooter}
                  onChange={(e) => setRcptFooter(e.target.value)}
                  rows={2}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard text-xs font-semibold resize-none outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Thermal Printer Driver Name</label>
                  <input
                    type="text"
                    required
                    value={prtrName}
                    onChange={(e) => setPrtrName(e.target.value)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard text-xs font-semibold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-slate-800 dark:text-white"
                  />
                </div>
                <div className="flex flex-col justify-end gap-1.5 text-xs font-bold text-slate-500 py-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoPrnt}
                      onChange={(e) => setAutoPrnt(e.target.checked)}
                      className="rounded text-brand-500 border-slate-300 focus:ring-0"
                    />
                    Auto-print receipt on order dispatch
                  </label>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-darkBorder/40 pt-4 mt-6 flex gap-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-brand-500 to-primary-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 flex items-center gap-1.5"
                >
                  <Save size={14} /> Save Templates
                </button>
                <button
                  type="button"
                  onClick={() => alert('Simulating slip testing code... Printer response OK.')}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-darkBorder hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer size={14} /> Test Printer Feed
                </button>
              </div>
            </form>
          )}

          {/* 3. DATABASE BACKUPS */}
          {activeSettingsTab === 'backup' && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider block border-b pb-3 mb-4">
                📂 Backup & DB Maintenance
              </span>
              <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                Generate secure JSON database files representing the current menu registry, active cashier logs, and inventory balances. Backups can restore registers in case of offline data loss.
              </p>

              <div className="bg-amber-500/10 border border-amber-500/25 p-4 rounded-2xl text-xs text-amber-500 font-medium flex gap-2.5 items-start max-w-lg leading-relaxed">
                <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Database Standalone Safety</strong>
                  <span className="block mt-0.5 text-[10px] text-slate-400">Backups compile local IndexedDB parameters. Ensure hardware drives possess sufficient space.</span>
                </div>
              </div>

              <button
                onClick={handleBackup}
                className="px-5 py-2.5 bg-gradient-to-r from-brand-500 to-primary-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 flex items-center gap-1.5"
              >
                <Database size={14} /> Download JSON Backup
              </button>
            </div>
          )}

          {/* 4. ACTIVE CASHIER USER PROFILE */}
          {activeSettingsTab === 'profile' && currentUser && (
            <div className="space-y-6">
              <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider block border-b pb-3 mb-4">
                👤 Active Operator File
              </span>

              <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-100/50 dark:bg-darkBorder/25 p-5 rounded-3xl border border-slate-200/50 dark:border-darkBorder/20">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-20 h-20 rounded-3xl object-cover ring-4 ring-brand-500/25"
                />
                <div className="flex flex-col text-center sm:text-left gap-1 min-w-0">
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white">{currentUser.name}</span>
                  <span className="text-[10px] font-extrabold text-primary-500 uppercase tracking-widest">{currentUser.role}</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-[10px] font-medium text-slate-500 mt-2">
                    <div>Phone: <strong className="font-mono text-slate-700 dark:text-slate-300">{currentUser.phone}</strong></div>
                    <div>Email: <strong className="text-slate-700 dark:text-slate-300">{currentUser.email}</strong></div>
                    <div>Joined: <strong className="text-slate-700 dark:text-slate-300">{currentUser.joinedDate}</strong></div>
                  </div>
                </div>
              </div>

              {/* Activity Log checklist */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Session Activity Audit</span>
                <div className="space-y-2 text-xs font-medium text-slate-500">
                  <div className="p-3 bg-white dark:bg-darkCard border rounded-2xl flex justify-between">
                    <span>1. Session sign-in authorization successfully logged</span>
                    <span className="text-[10px] text-slate-400 font-mono">15:29</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-darkCard border rounded-2xl flex justify-between">
                    <span>2. Commited POS sales dispatch registries</span>
                    <span className="text-[10px] text-slate-400 font-mono">15:18</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
