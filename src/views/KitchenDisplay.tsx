import React, { useEffect, useMemo, useState } from 'react';
import { useRestaurantStore, Order } from '../store/restaurantStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  ChefHat, 
  Flame, 
  CheckSquare, 
  AlertOctagon, 
  Volume2, 
  VolumeX, 
  Search,
  Check,
  UtensilsCrossed,
  Timer
} from 'lucide-react';

export const KitchenDisplay: React.FC = () => {
  const { orders, updateOrderStatus, incrementOrderTimers, addNotification } = useRestaurantStore();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterPriority, setFilterPriority] = useState<'All' | 'High' | 'Normal'>('All');
  const [kdsSearch, setKdsSearch] = useState('');

  // Tick timers every minute
  useEffect(() => {
    const timerId = setInterval(() => {
      incrementOrderTimers();
    }, 60000);
    return () => clearInterval(timerId);
  }, [incrementOrderTimers]);

  // Active orders (exclude Delivered and Cancelled)
  const activeOrders = useMemo(() => {
    return orders.filter(
      (order) => order.status !== 'Delivered' && order.status !== 'Cancelled'
    );
  }, [orders]);

  // Phase 6: Completed orders (last 5)
  const completedOrders = useMemo(() => {
    return orders
      .filter(o => o.status === 'Delivered')
      .slice(0, 5);
  }, [orders]);

  // Apply Priority & Search Filter
  const filteredOrders = useMemo(() => {
    return activeOrders.filter((order) => {
      const matchesPriority = filterPriority === 'All' || 
        (filterPriority === 'High' && (order.priority === 'High' || order.priority === 'Urgent')) ||
        (filterPriority === 'Normal' && order.priority === 'Normal');
      const matchesSearch = order.items.some(
        (item) => item.menuItem.name.toLowerCase().includes(kdsSearch.toLowerCase())
      ) || order.id.toLowerCase().includes(kdsSearch.toLowerCase());
      return matchesPriority && matchesSearch;
    });
  }, [activeOrders, filterPriority, kdsSearch]);

  // Phase 6: 4 workflow columns
  const pendingOrders  = filteredOrders.filter(o => o.status === 'Pending');
  const cookingOrders  = filteredOrders.filter(o => o.status === 'Preparing' || o.status === 'Cooking');
  const readyOrders    = filteredOrders.filter(o => o.status === 'Ready');

  const playAlertSound = () => {
    if (!soundEnabled) return;
    console.log('KDS Audio Alert: New ticket received!');
  };

  const handleStatusChange = (orderId: string, currentStatus: Order['status']) => {
    let nextStatus: Order['status'] = 'Pending';
    if (currentStatus === 'Pending') nextStatus = 'Cooking';
    else if (currentStatus === 'Cooking' || currentStatus === 'Preparing') nextStatus = 'Ready';
    else if (currentStatus === 'Ready') nextStatus = 'Delivered';
    updateOrderStatus(orderId, nextStatus);
    playAlertSound();
  };

  // Phase 6: Timer color — green < 8m, amber 8-15m, red > 15m
  const getTimerColorClass = (mins: number) => {
    if (mins >= 15) return 'bg-rose-500/12 text-rose-600 dark:text-rose-400 kds-alert-urgent';
    if (mins >= 8)  return 'bg-amber-500/12 text-amber-600 dark:text-amber-400';
    return 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400';
  };

  const getPriorityBadgeClass = (priority: Order['priority']) => {
    if (priority === 'Urgent') return 'bg-rose-500 text-white animate-pulse';
    if (priority === 'High')   return 'bg-primary-500 text-white';
    return 'bg-slate-200/80 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300';
  };

  // Column config
  const columns = [
    { 
      id: 'new', label: 'New Orders', emoji: '📥', count: pendingOrders.length, 
      orders: pendingOrders, 
      bgClass: 'bg-blue-500/4 dark:bg-blue-500/3', 
      borderClass: 'border-blue-500/15',
      headerColor: 'text-blue-600 dark:text-blue-400'
    },
    { 
      id: 'cooking', label: 'Preparing', emoji: '🔥', count: cookingOrders.length, 
      orders: cookingOrders, 
      bgClass: 'bg-orange-500/4 dark:bg-orange-500/3', 
      borderClass: 'border-orange-500/15',
      headerColor: 'text-orange-600 dark:text-orange-400'
    },
    { 
      id: 'ready', label: 'Ready', emoji: '✅', count: readyOrders.length, 
      orders: readyOrders, 
      bgClass: 'bg-emerald-500/4 dark:bg-emerald-500/3', 
      borderClass: 'border-emerald-500/15',
      headerColor: 'text-emerald-600 dark:text-emerald-400'
    },
    { 
      id: 'done', label: 'Completed', emoji: '🎯', count: completedOrders.length, 
      orders: completedOrders as Order[], 
      bgClass: 'bg-slate-500/4 dark:bg-slate-500/3', 
      borderClass: 'border-slate-500/10',
      headerColor: 'text-slate-500 dark:text-slate-400'
    },
  ];

  return (
    <div className="p-4 space-y-4 font-poppins text-slate-800 dark:text-slate-100 h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      
      {/* KDS Control Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 flex-shrink-0 glass-panel border border-slate-200/50 dark:border-darkBorder p-4 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/10 flex items-center justify-center">
            <ChefHat className="text-brand-500" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-slate-800 dark:text-white">Kitchen Dispatch Monitor</span>
            <span className="text-xs text-slate-400">
              {activeOrders.length} active · {pendingOrders.length} pending · {cookingOrders.length} cooking · {readyOrders.length} ready
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search tickets */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 text-slate-400" size={13} />
            <input
              type="text"
              placeholder="Search orders..."
              value={kdsSearch}
              onChange={(e) => setKdsSearch(e.target.value)}
              className="pl-8 pr-3 py-2 bg-slate-100 dark:bg-darkBorder/40 border border-transparent rounded-xl text-xs outline-none focus:border-brand-500 w-36 transition-colors"
            />
          </div>

          {/* Priority filter */}
          <div className="flex bg-slate-100 dark:bg-darkBorder rounded-xl p-1 text-[10px] font-bold">
            {(['All', 'High', 'Normal'] as const).map((pr) => (
              <button
                key={pr}
                onClick={() => setFilterPriority(pr)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterPriority === pr
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'
                }`}
              >
                {pr}
              </button>
            ))}
          </div>

          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-colors ${
              soundEnabled 
                ? 'bg-brand-500/10 border-brand-500/20 text-brand-500' 
                : 'bg-slate-100 dark:bg-darkBorder border-transparent text-slate-400'
            }`}
            title={soundEnabled ? 'Mute alerts' : 'Unmute alerts'}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>
      </div>

      {/* Phase 6: 4-Column KDS Layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 overflow-hidden min-h-0">
        {columns.map((col) => (
          <div 
            key={col.id}
            className={`flex flex-col h-full ${col.bgClass} border ${col.borderClass} rounded-3xl p-3 overflow-hidden`}
          >
            {/* Column Header */}
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/40 dark:border-darkBorder/40 mb-3 flex-shrink-0">
              <span className={`font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 ${col.headerColor}`}>
                <span>{col.emoji}</span>
                {col.label}
              </span>
              {col.count > 0 && (
                <span className={`min-w-[22px] h-[22px] px-1.5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                  col.id === 'new' ? 'bg-blue-500 text-white' :
                  col.id === 'cooking' ? 'bg-orange-500 text-white' :
                  col.id === 'ready' ? 'bg-emerald-500 text-white' :
                  'bg-slate-400 text-white'
                }`}>
                  {col.count}
                </span>
              )}
            </div>
            
            {/* Column Cards */}
            <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
              <AnimatePresence mode="popLayout">
                {col.orders.map((order) => (
                  <KdsTicketCard 
                    key={order.id} 
                    order={order} 
                    onProgress={handleStatusChange} 
                    getTimerColor={getTimerColorClass} 
                    getPriorityClass={getPriorityBadgeClass}
                    isCompleted={col.id === 'done'}
                  />
                ))}
              </AnimatePresence>
              {col.orders.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400/50 gap-2 py-8">
                  <UtensilsCrossed size={28} className="opacity-30" />
                  <span className="text-xs">No {col.label.toLowerCase()}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Phase 6: Enhanced Ticket Card ──
interface TicketCardProps {
  order: Order;
  onProgress: (id: string, status: Order['status']) => void;
  getTimerColor: (mins: number) => string;
  getPriorityClass: (pr: Order['priority']) => string;
  isCompleted?: boolean;
}

const KdsTicketCard: React.FC<TicketCardProps> = ({ 
  order, 
  onProgress, 
  getTimerColor, 
  getPriorityClass,
  isCompleted = false
}) => {
  const isCooking  = order.status === 'Preparing' || order.status === 'Cooking';
  const isReady    = order.status === 'Ready';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: 60 }}
      transition={{ duration: 0.2 }}
      className={`glass-panel border rounded-2xl p-3.5 flex flex-col gap-2.5 relative overflow-hidden ${
        order.priority === 'Urgent' ? 'kds-alert-urgent ring-1 ring-red-500/40' : 
        isCompleted ? 'opacity-60' : ''
      }`}
    >
      {/* Phase 6: Order header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          {/* Phase 6: Large order number */}
          <span className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
            {order.id}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            {order.orderType || 'Takeaway'} 
            {order.customerName ? ` · ${order.customerName}` : ' · Walk-in'}
          </span>
        </div>

        <div className="flex flex-col items-end gap-1">
          {/* Priority badge */}
          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${getPriorityClass(order.priority)}`}>
            {order.priority}
          </span>
          {/* Phase 6: Timer badge with color */}
          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full flex items-center gap-1 ${getTimerColor(order.timer)}`}>
            <Timer size={9} />
            {order.timer}m
          </span>
        </div>
      </div>

      {/* Phase 6: Items list — quantity prominent */}
      <div className="space-y-2 border-t border-slate-200/40 dark:border-darkBorder/40 pt-2">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {/* Phase 6: Large quantity badge */}
              <span className="min-w-[28px] h-7 rounded-lg bg-brand-500/15 dark:bg-brand-500/12 text-brand-600 dark:text-brand-400 font-black text-sm font-mono flex items-center justify-center">
                {item.quantity}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight flex-1">
                {item.menuItem.name}
                {item.customPrice !== undefined && (
                  <span className="text-[9px] text-slate-400 font-medium ml-1">(₹{item.customPrice})</span>
                )}
              </span>
            </div>
            {/* Special instructions */}
            {item.specialInstructions && (
              <span className="text-[10px] text-primary-600 dark:text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-lg font-medium italic ml-8 block">
                📝 {item.specialInstructions}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Cashier + timestamp */}
      <div className="flex justify-between items-center text-[9px] text-slate-400 border-t border-slate-200/30 dark:border-darkBorder/30 pt-1.5">
        <span>By: {order.cashierName}</span>
        <span>{new Date(order.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      {/* Phase 6: One-tap status button */}
      {!isCompleted && (
        <button
          onClick={() => onProgress(order.id, order.status)}
          className={`w-full py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] ${
            isReady 
              ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md shadow-emerald-500/20 hover:from-emerald-600 hover:to-green-600' 
              : isCooking 
              ? 'bg-gradient-to-r from-primary-500 to-amber-500 text-white shadow-md shadow-primary-500/20 hover:from-primary-600 hover:to-amber-600' 
              : 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/20 hover:from-brand-700 hover:to-brand-600'
          }`}
        >
          {isReady ? (
            <><CheckSquare size={13} /> Deliver &amp; Dismiss</>
          ) : isCooking ? (
            <><Flame size={13} className="animate-pulse" /> Mark Ready</>
          ) : (
            <><ChefHat size={13} /> Start Cooking</>
          )}
        </button>
      )}

      {/* Completed overlay */}
      {isCompleted && (
        <div className="flex items-center justify-center gap-1.5 py-1.5 text-emerald-500 text-xs font-bold">
          <Check size={12} /> Delivered
        </div>
      )}
    </motion.div>
  );
};
