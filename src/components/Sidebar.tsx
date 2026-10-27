import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRestaurantStore } from '../store/restaurantStore';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Clock, 
  Utensils, 
  BookOpen, 
  TrendingUp, 
  Package, 
  Truck, 
  Users, 
  Award, 
  FileSpreadsheet, 
  QrCode, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
  altPaths?: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  setIsOpen, 
  isMobileOpen, 
  setIsMobileOpen 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, setCurrentUser, settings, orders } = useRestaurantStore();

  // Phase 4: Pending order badge count
  const pendingOrderCount = useMemo(() => {
    return orders.filter(o => o.status === 'Pending' || o.status === 'Preparing' || o.status === 'Cooking').length;
  }, [orders]);

  const navSections: NavSection[] = [
    {
      title: 'Operations',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'POS Billing', path: '/pos', icon: ShoppingBag, badge: pendingOrderCount },
        { name: 'Orders', path: '/orders', icon: Clock },
        { name: 'Kitchen Display', path: '/kitchen', icon: Utensils },
        { name: 'Menu Management', path: '/menu', icon: BookOpen },
        { name: 'Inventory', path: '/inventory', icon: Package },
        { name: 'QR Payments', path: '/qr-payments', icon: QrCode },
      ]
    },
    {
      title: 'Finance & CRM',
      items: [
        { name: 'Sales & Expenses', path: '/sales', icon: TrendingUp, altPaths: ['/expenses'] },
        { name: 'Suppliers', path: '/suppliers', icon: Truck },
        { name: 'Customers', path: '/customers', icon: Users },
        { name: 'Reports & Analytics', path: '/reports', icon: FileSpreadsheet, altPaths: ['/analytics'] },
      ]
    },
    {
      title: 'Administration',
      items: [
        { name: 'Employees', path: '/employees', icon: Award },
        { name: 'Settings', path: '/settings', icon: Settings },
      ]
    }
  ];

  const handleLogout = () => {
    setCurrentUser(null); // also clears localStorage via the store's setCurrentUser
    // Redirect to landing page (outside React router — full page navigation)
    window.location.replace('/landing/index.html');
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      
      {/* ── Brand Header ── */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Phase 4: Gradient orb logo container */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/25 via-brand-600/20 to-primary-500/25 flex items-center justify-center ring-1 ring-primary-500/30 shadow-sm">
              <span className="text-xl leading-none">{settings.logo}</span>
            </div>
            {/* Tiny status dot */}
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-darkCard rounded-full"></span>
          </div>

          {(isOpen || isMobileOpen) && (
            <div className="flex flex-col font-poppins leading-tight overflow-hidden">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white whitespace-nowrap tracking-tight">
                Palani Andavar
              </span>
              <span className="text-[10px] text-primary-500 dark:text-primary-400 font-bold tracking-widest uppercase">
                Fast Food · POS
              </span>
            </div>
          )}
        </div>
        
        {/* Toggle button Desktop */}
        {!isMobileOpen && (
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-darkBorder dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors flex-shrink-0"
          >
            {isOpen ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
          </button>
        )}

        {/* Close button Mobile */}
        {isMobileOpen && (
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-darkBorder text-slate-500 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Phase 4: Brand gradient divider */}
      <div className="brand-divider mx-4 mb-2" />

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-1 space-y-3 overflow-y-auto no-scrollbar">
        {navSections.map((section, sIdx) => (
          <div key={section.title} className="space-y-0.5">
            {(isOpen || isMobileOpen) ? (
              <div className="nav-section-label">
                {section.title}
              </div>
            ) : (
              sIdx > 0 && <div className="border-t border-slate-200/50 dark:border-darkBorder/40 my-2 mx-1" />
            )}

            {section.items.map((item) => {
              const isActive = location.pathname === item.path || (item.altPaths && item.altPaths.includes(location.pathname));
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-xs group relative ${
                    isActive 
                      ? 'bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/25 ring-1 ring-white/10' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={!isOpen && !isMobileOpen ? item.name : undefined}
                >
                  {/* Active indicator bar - Gold */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-primary-300 via-primary-400 to-primary-500 rounded-r-full shadow-sm shadow-primary-500/50" />
                  )}

                  <Icon 
                    size={17} 
                    className={`flex-shrink-0 transition-transform duration-150 ${
                      isActive ? 'scale-110 text-primary-300' : 'group-hover:scale-105 group-hover:translate-x-0.5'
                    }`} 
                  />

                  {(isOpen || isMobileOpen) && (
                    <span className="truncate flex-1 text-left">{item.name}</span>
                  )}

                  {/* Badge for pending orders on POS Billing */}
                  {item.badge !== undefined && item.badge > 0 && (isOpen || isMobileOpen) && (
                    <span className={`flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[9px] font-extrabold ${
                      isActive ? 'bg-primary-500 text-white' : 'bg-brand-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}

                  {/* Collapsed badge dot */}
                  {item.badge !== undefined && item.badge > 0 && !isOpen && !isMobileOpen && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Phase 4: Brand divider above footer */}
      <div className="brand-divider mx-4 mt-2" />

      {/* ── User Footer ── */}
      <div className="p-3 pt-2">
        {(isOpen || isMobileOpen) ? (
          <div className="p-2.5 rounded-2xl bg-slate-100/60 dark:bg-darkBorder/30">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="relative">
                <img 
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'} 
                  alt="user avatar" 
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-brand-500/25"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-darkCard rounded-full"></span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                  {currentUser?.name || 'Palani Owner'}
                </span>
                <span className="text-[10px] text-primary-500 font-bold uppercase tracking-wide truncate">
                  {currentUser?.role || 'Owner'}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-colors"
            >
              <LogOut size={12} />
              Logout
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="relative">
              <img 
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'} 
                alt="avatar" 
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-brand-500/15"
                title={currentUser?.name}
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border-2 border-white dark:border-darkCard rounded-full"></span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:block h-screen glass-panel border-r border-slate-200/50 dark:border-darkBorder/50 flex-shrink-0 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-[72px]'
      }`}>
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Mobile Drawer Panel */}
      <aside className={`md:hidden fixed top-0 bottom-0 left-0 z-50 w-64 glass-panel border-r border-slate-200/50 dark:border-darkBorder/50 transform transition-transform duration-300 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {renderSidebarContent()}
      </aside>
    </>
  );
};
