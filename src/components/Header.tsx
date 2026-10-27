import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useRestaurantStore } from '../store/restaurantStore';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Menu as MenuIcon, 
  Calculator, 
  X,
  FileText,
  User,
  Coffee,
  Package,
  TrendingDown,
  ShoppingBag,
  IndianRupee,
  AlertTriangle,
  Trash2
} from 'lucide-react';

interface HeaderProps {
  setIsMobileOpen: (isOpen: boolean) => void;
  toggleCalculator: () => void;
}

// Phase 10: Relative timestamp helper
function relativeTime(timestamp: string): string {
  const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return new Date(timestamp).toLocaleDateString();
}

// Phase 10: Notification icon by type
function NotifIcon({ type }: { type: string }) {
  const cls = "flex-shrink-0 mt-0.5";
  if (type === 'low_stock')  return <AlertTriangle size={13} className={`${cls} text-amber-500`} />;
  if (type === 'new_order')  return <ShoppingBag   size={13} className={`${cls} text-emerald-500`} />;
  if (type === 'payment')    return <IndianRupee   size={13} className={`${cls} text-sky-500`} />;
  if (type === 'expense')    return <TrendingDown  size={13} className={`${cls} text-rose-500`} />;
  return                            <FileText      size={13} className={`${cls} text-slate-400`} />;
}

export const Header: React.FC<HeaderProps> = ({ setIsMobileOpen, toggleCalculator }) => {
  const location = useLocation();
  const { 
    isDarkMode, 
    toggleDarkMode, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    clearNotifications,
    menu,
    orders,
    expenses,
    inventory,
    customers,
    currentUser
  } = useRestaurantStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Phase 8: Real-time clock
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  });

  useEffect(() => {
    const ticker = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  // Phase 8: Keyboard shortcut Ctrl+K for search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
      if (e.key === 'Escape') {
        setShowSearchModal(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard': return 'Executive Dashboard';
      case '/pos':       return 'POS Billing Terminal';
      case '/orders':    return 'Order Pipeline';
      case '/kitchen':   return 'Kitchen Display System';
      case '/menu':      return 'Menu Management';
      case '/sales':     return 'Sales Records';
      case '/expenses':  return 'Expense Ledger';
      case '/inventory': return 'Inventory Tracker';
      case '/suppliers': return 'Suppliers Directory';
      case '/customers': return 'Customers CRM';
      case '/employees': return 'Staff Roster';
      case '/reports':   return 'Business Reports';
      case '/analytics': return 'Analytics & Trends';
      case '/qr-payments': return 'UPI Payment Desk';
      case '/settings':  return 'System Settings';
      default:           return 'Palani Andavar POS';
    }
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return { menu: [], orders: [], expenses: [], inventory: [], customers: [] };
    }
    const q = searchQuery.toLowerCase();
    return {
      menu: menu.filter(item => item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)),
      orders: orders.filter(order =>
        order.id.toLowerCase().includes(q) ||
        (order.customerName && order.customerName.toLowerCase().includes(q)) ||
        order.paymentMethod.toLowerCase().includes(q) ||
        order.status.toLowerCase().includes(q) ||
        order.grandTotal.toString().includes(q)
      ),
      expenses: expenses.filter(exp =>
        exp.category.toLowerCase().includes(q) ||
        exp.notes.toLowerCase().includes(q) ||
        exp.amount.toString().includes(q)
      ),
      inventory: inventory.filter(inv => inv.name.toLowerCase().includes(q)),
      customers: customers.filter(cust => cust.name.toLowerCase().includes(q) || cust.phone.includes(q))
    };
  }, [searchQuery, menu, orders, expenses, inventory, customers]);

  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-200/50 dark:border-darkBorder/50 glass-panel sticky top-0 z-30 gap-3 relative">
      {/* Gold accent underline strip */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-500/70 to-transparent pointer-events-none" />
      
      {/* Left: Mobile toggle + Page title */}
      <div className="flex items-center gap-3 min-w-0">
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkBorder transition-colors flex-shrink-0"
        >
          <MenuIcon size={20} />
        </button>
        <div className="flex flex-col min-w-0">
          <h1 className="text-base font-bold font-poppins text-slate-800 dark:text-white leading-tight truncate">
            {getPageTitle()}
          </h1>
          <span className="hidden sm:block text-xs text-slate-400 dark:text-slate-500 font-medium truncate">
            Palani Andavar Fast Food · Pollachi
          </span>
        </div>
      </div>

      {/* Phase 8: Centre — Real-time clock */}
      <div className="hidden lg:flex flex-col items-center flex-shrink-0">
        <span className="text-sm font-bold font-mono text-slate-700 dark:text-slate-200 tracking-wider">
          {currentTime}
        </span>
        {/* Store open indicator */}
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-live inline-block" />
          Store Open
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        
        {/* Phase 8: Search — wider on desktop */}
        <button
          id="header-search-btn"
          onClick={() => setShowSearchModal(true)}
          className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-darkBorder/40 dark:hover:bg-darkBorder/70 rounded-xl transition-all w-36 sm:w-52 lg:w-72"
        >
          <Search size={13} className="text-slate-400 flex-shrink-0" />
          <span className="truncate text-left flex-1">Search POS...</span>
          <kbd className="hidden lg:inline-flex items-center px-1 py-0.5 rounded border border-slate-300 dark:border-slate-600 text-[9px] font-sans text-slate-400">⌘K</kbd>
        </button>

        {/* Calculator toggle */}
        <button
          onClick={toggleCalculator}
          className="p-2 rounded-xl bg-slate-100 dark:bg-darkBorder/40 hover:bg-slate-200/80 dark:hover:bg-darkBorder/80 text-slate-600 dark:text-slate-300 transition-colors"
          title="Open Calculator"
        >
          <Calculator size={17} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl bg-slate-100 dark:bg-darkBorder/40 hover:bg-slate-200/80 dark:hover:bg-darkBorder/80 text-slate-600 dark:text-slate-300 transition-colors"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
        </button>

        {/* Phase 8+10: Notifications — bell wiggle on unread */}
        <div className="relative" ref={notificationsRef}>
          <button
            id="header-notifications-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-darkBorder/40 hover:bg-slate-200/80 dark:hover:bg-darkBorder/80 text-slate-600 dark:text-slate-300 transition-colors relative"
            title="Notifications"
          >
            <Bell 
              size={17} 
              className={unreadNotifications.length > 0 ? 'animate-wiggle' : ''} 
            />
            {unreadNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-brand-500 text-[9px] font-extrabold text-white ring-2 ring-white dark:ring-darkBg">
                {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
              </span>
            )}
          </button>

          {/* Phase 10: Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 max-h-[420px] overflow-hidden glass-panel rounded-2xl shadow-xl shadow-slate-900/15 border border-slate-200/50 dark:border-darkBorder flex flex-col z-50 modal-enter">
              
              {/* Header row */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/50 dark:border-darkBorder/50">
                <span className="font-bold text-sm text-slate-800 dark:text-white">
                  Notifications
                  {unreadNotifications.length > 0 && (
                    <span className="ml-2 text-xs text-brand-500 font-bold">({unreadNotifications.length} unread)</span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {unreadNotifications.length > 0 && (
                    <button 
                      onClick={markAllNotificationsAsRead}
                      className="text-[10px] font-bold text-brand-500 hover:text-brand-600 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearNotifications}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-darkBorder text-slate-400 hover:text-rose-500 transition-colors"
                      title="Clear all notifications"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="overflow-y-auto no-scrollbar flex-1 p-2 space-y-1">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    <Bell size={24} className="mx-auto mb-2 text-slate-300" />
                    No notifications
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => markNotificationAsRead(item.id)}
                      className={`p-3 rounded-xl cursor-pointer transition-all flex gap-2.5 group ${
                        item.isRead 
                          ? 'hover:bg-slate-100/60 dark:hover:bg-darkBorder/30' 
                          : 'bg-brand-50/80 dark:bg-brand-900/20 hover:bg-brand-100/70 dark:hover:bg-brand-900/30 ring-1 ring-brand-500/20'
                      }`}
                    >
                      {/* Phase 10: Type icon */}
                      <NotifIcon type={item.type} />

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-0.5">
                          <span className={`font-bold text-xs truncate ${
                            item.isRead 
                              ? 'text-slate-600 dark:text-slate-200' 
                              : 'text-slate-900 dark:text-white'
                          }`}>
                            {item.title}
                          </span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-400 whitespace-nowrap flex-shrink-0">
                            {relativeTime(item.timestamp)}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {!item.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Capsule */}
        <div className="hidden sm:flex items-center gap-2 p-1 pl-2 rounded-xl bg-slate-100/60 dark:bg-darkBorder/25 border border-slate-200/40 dark:border-darkBorder/30">
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-none">{currentUser?.name.split(' ')[0]}</span>
            <span className="text-[9px] text-primary-500 font-bold uppercase tracking-wide">{currentUser?.role}</span>
          </div>
          <div className="relative">
            <img 
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
              alt="user avatar" 
              className="w-8 h-8 rounded-lg object-cover ring-2 ring-brand-500/15"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border-2 border-white dark:border-darkCard rounded-full"></span>
          </div>
        </div>
      </div>

      {/* Global Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-slate-900/45 dark:bg-black/65 backdrop-blur-sm">
          <div className="w-full max-w-2xl glass-panel rounded-3xl shadow-2xl border border-slate-200/50 dark:border-darkBorder overflow-hidden max-h-[78vh] flex flex-col modal-enter">
            
            {/* Search Input */}
            <div className="flex items-center gap-3 p-4 border-b border-slate-200/50 dark:border-darkBorder/50">
              <Search className="text-slate-400 flex-shrink-0" size={18} />
              <input
                type="text"
                placeholder="Search Bills, Customers, Menu, Expenses, Inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-white placeholder-slate-400 text-sm font-medium"
              />
              <button 
                onClick={() => { setShowSearchModal(false); setSearchQuery(''); }}
                className="p-1.5 rounded-lg bg-slate-200/80 dark:bg-darkBorder text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {!searchQuery ? (
                <div className="text-center py-10 text-slate-400 flex flex-col items-center gap-2">
                  <Search size={28} className="text-slate-300 animate-pulse" />
                  <p className="text-sm font-semibold">Global Search Console</p>
                  <p className="text-xs max-w-xs leading-relaxed">Type billing numbers, customer names, dishes, expense notes or inventory items.</p>
                </div>
              ) : (
                <>
                  {searchResults.menu.length === 0 && searchResults.orders.length === 0 &&
                   searchResults.expenses.length === 0 && searchResults.inventory.length === 0 &&
                   searchResults.customers.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-sm">
                      No records found for &ldquo;{searchQuery}&rdquo;
                    </div>
                  ) : null}

                  {searchResults.menu.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-brand-500 uppercase tracking-wider mb-2">
                        <Coffee size={11} /> Menu Items
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {searchResults.menu.map(item => (
                          <div key={item.id} className="p-3 bg-slate-100/60 dark:bg-darkBorder/25 rounded-2xl flex items-center gap-3">
                            <span className="text-lg">{item.category === 'Rice' ? '🍚' : item.category === 'Chilli Chicken' ? '🍗' : '🥤'}</span>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.name}</span>
                              <span className="text-[10px] text-slate-400">{item.category} · ₹{item.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.orders.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-brand-500 uppercase tracking-wider mb-2">
                        <FileText size={11} /> Bills &amp; Orders
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {searchResults.orders.map(order => (
                          <div key={order.id} className="p-3 bg-slate-100/60 dark:bg-darkBorder/25 rounded-2xl flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-800 dark:text-white">{order.id}</span>
                              <span className={`status-badge ${order.status === 'Delivered' ? 'bg-emerald-500/12 text-emerald-600' : 'bg-amber-500/12 text-amber-600'}`}>{order.status}</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>{order.customerName || 'Walk-in'}</span>
                              <span className="font-bold text-brand-500">₹{order.grandTotal}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.customers.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-brand-500 uppercase tracking-wider mb-2">
                        <User size={11} /> Customers
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {searchResults.customers.map(cust => (
                          <div key={cust.id} className="p-3 bg-slate-100/60 dark:bg-darkBorder/25 rounded-2xl flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                              {cust.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{cust.name}</span>
                              <span className="text-[10px] text-slate-400">Ph: {cust.phone} · {cust.loyaltyPoints} pts</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.expenses.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-brand-500 uppercase tracking-wider mb-2">
                        <TrendingDown size={11} /> Expenses
                      </div>
                      <div className="space-y-2">
                        {searchResults.expenses.map(exp => (
                          <div key={exp.id} className="p-3 bg-slate-100/60 dark:bg-darkBorder/25 rounded-2xl flex justify-between items-center">
                            <div>
                              <span className="text-xs font-bold text-slate-800 dark:text-white">{exp.category}</span>
                              <p className="text-[10px] text-slate-400 line-clamp-1">{exp.notes}</p>
                            </div>
                            <span className="font-bold text-rose-500 text-xs font-mono">₹{exp.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.inventory.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-brand-500 uppercase tracking-wider mb-2">
                        <Package size={11} /> Inventory
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {searchResults.inventory.map(inv => (
                          <div key={inv.id} className="p-3 bg-slate-100/60 dark:bg-darkBorder/25 rounded-2xl">
                            <span className="text-xs font-bold text-slate-800 dark:text-white block">{inv.name}</span>
                            <span className={`text-[10px] font-semibold ${inv.remaining <= inv.lowStockThreshold ? 'text-rose-500 font-extrabold' : 'text-slate-400'}`}>
                              {inv.remaining.toFixed(1)} {inv.unit} remaining
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
