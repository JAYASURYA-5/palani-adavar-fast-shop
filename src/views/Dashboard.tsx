import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurantStore } from '../store/restaurantStore';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  Receipt, 
  Users, 
  AlertTriangle, 
  ChevronRight, 
  Play, 
  FileText,
  ShoppingBag,
  Zap
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { orders, expenses, inventory, customers } = useRestaurantStore();

  const todayStr = new Date().toISOString().split('T')[0]; // Live current date

  // 1. Live calculations based on store state
  const todayOrders = orders.filter(o => o.timestamp.startsWith(todayStr) && o.status !== 'Cancelled');
  const todaySales = todayOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const todayBillsCount = todayOrders.length;
  
  const todayExp = expenses.filter(e => e.date === todayStr);
  const todayExpenses = todayExp.reduce((sum, e) => sum + e.amount, 0);
  const todayProfit = todaySales - todayExpenses;

  // Best selling item analysis
  const itemCounts: { [key: string]: number } = {};
  orders.forEach(o => {
    if (o.status !== 'Cancelled') {
      o.items.forEach(i => {
        itemCounts[i.menuItem.name] = (itemCounts[i.menuItem.name] || 0) + i.quantity;
      });
    }
  });
  let bestSellingItem = '—';
  let maxQty = 0;
  Object.entries(itemCounts).forEach(([name, qty]) => {
    if (qty > maxQty) { maxQty = qty; bestSellingItem = name; }
  });

  // Low stock items
  const lowStockItems = inventory.filter(item => item.remaining <= item.lowStockThreshold);

  // 2. Charts Data Modeling — Live from store orders and expenses
  const salesTrendData = React.useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dateLabel = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      const daySales = orders
        .filter(o => o.timestamp.startsWith(dateStr) && o.status !== 'Cancelled')
        .reduce((sum, o) => sum + o.grandTotal, 0);
      const dayExp = expenses
        .filter(e => e.date === dateStr)
        .reduce((sum, e) => sum + e.amount, 0);
      days.push({ date: dateLabel, Sales: Math.round(daySales), Expenses: Math.round(dayExp) });
    }
    return days;
  }, [orders, expenses]);

  const monthlyComparisonData = React.useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthPrefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short' });
      const mSales = orders
        .filter(o => o.timestamp.startsWith(monthPrefix) && o.status !== 'Cancelled')
        .reduce((sum, o) => sum + o.grandTotal, 0);
      const mExp = expenses
        .filter(e => e.date.startsWith(monthPrefix))
        .reduce((sum, e) => sum + e.amount, 0);
      months.push({
        month: monthLabel,
        Sales: Math.round(mSales),
        Expenses: Math.round(mExp),
        Profit: Math.round(mSales - mExp)
      });
    }
    return months;
  }, [orders, expenses]);

  // Payment Breakdown
  const paymentCounts = { Cash: 0, UPI: 0, Card: 0, Split: 0 };
  orders.forEach(o => {
    if (o.status !== 'Cancelled') {
      paymentCounts[o.paymentMethod] = paymentCounts[o.paymentMethod] + o.grandTotal;
    }
  });
  const paymentPieData = [
    { name: 'GPay/PhonePe UPI', value: Math.round(paymentCounts.UPI), color: '#38bdf8' },
    { name: 'Cash Drawer', value: Math.round(paymentCounts.Cash), color: '#f59e0b' },
    { name: 'Card Machine', value: Math.round(paymentCounts.Card), color: '#34d399' },
    { name: 'Split / Other', value: Math.round(paymentCounts.Split), color: '#8b5cf6' }
  ];

  const recentBills = orders.slice(0, 4);

  // Custom tooltip style for charts
  const tooltipStyle = {
    backgroundColor: 'rgba(15, 20, 35, 0.95)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px',
    color: '#f8fafc',
    fontSize: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
  };

  return (
    <div className="p-6 space-y-6 font-poppins text-slate-800 dark:text-slate-100 overflow-y-auto h-[calc(100vh-4rem)] no-scrollbar">
      
      {/* ── PHASE 2: KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Today's Sales */}
        <div className="glass-panel p-5 rounded-3xl relative overflow-hidden flex items-center gap-4 card-glow-emerald transition-all duration-300 hover:-translate-y-0.5 cursor-default border-t-2 border-emerald-500/40">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/12 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0 ring-1 ring-emerald-500/20">
            <TrendingUp size={24} />
          </div>
          <div className="flex flex-col min-w-0 z-10">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Today's Sales</span>
            <span className="text-2xl font-black font-mono tracking-tight text-emerald-500">₹{todaySales.toFixed(0)}</span>
            <span className="text-xs text-slate-400 font-medium mt-0.5">{todayBillsCount} bills generated</span>
          </div>
          <div className="absolute right-0 bottom-0 opacity-[0.04] -mb-2 -mr-3 pointer-events-none">
            <TrendingUp size={96} />
          </div>
        </div>

        {/* Today's Expenses */}
        <div className="glass-panel p-5 rounded-3xl relative overflow-hidden flex items-center gap-4 card-glow-rose transition-all duration-300 hover:-translate-y-0.5 cursor-default border-t-2 border-rose-500/40">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/12 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0 ring-1 ring-rose-500/20">
            <TrendingDown size={24} />
          </div>
          <div className="flex flex-col min-w-0 z-10">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Today's Expenses</span>
            <span className="text-2xl font-black font-mono tracking-tight text-rose-500">₹{todayExpenses.toFixed(0)}</span>
            <span className="text-xs text-slate-400 font-medium mt-0.5">Purchases &amp; utility</span>
          </div>
          <div className="absolute right-0 bottom-0 opacity-[0.04] -mb-2 -mr-3 pointer-events-none">
            <TrendingDown size={96} />
          </div>
        </div>

        {/* Net Profit */}
        <div className="glass-panel p-5 rounded-3xl relative overflow-hidden flex items-center gap-4 card-glow-amber transition-all duration-300 hover:-translate-y-0.5 cursor-default border-t-2 border-amber-500/40">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/12 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 ring-1 ring-amber-500/20">
            <Coins size={24} />
          </div>
          <div className="flex flex-col min-w-0 z-10">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Today's Net Profit</span>
            <span className={`text-2xl font-black font-mono tracking-tight ${todayProfit >= 0 ? 'text-amber-500' : 'text-rose-500'}`}>
              ₹{todayProfit.toFixed(0)}
            </span>
            <span className="text-xs text-slate-400 font-medium mt-0.5">Sales minus expenses</span>
          </div>
          <div className="absolute right-0 bottom-0 opacity-[0.04] -mb-2 -mr-3 pointer-events-none">
            <Coins size={96} />
          </div>
        </div>

        {/* Customers */}
        <div className="glass-panel p-5 rounded-3xl relative overflow-hidden flex items-center gap-4 card-glow-blue transition-all duration-300 hover:-translate-y-0.5 cursor-default border-t-2 border-blue-500/40">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/12 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0 ring-1 ring-blue-500/20">
            <Users size={24} />
          </div>
          <div className="flex flex-col min-w-0 z-10">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Customers (CRM)</span>
            <span className="text-2xl font-black font-mono tracking-tight text-blue-500">{customers.length}</span>
            <span className="text-xs text-slate-400 font-medium mt-0.5">Top: <strong className="text-slate-600 dark:text-slate-300">{bestSellingItem}</strong></span>
          </div>
          <div className="absolute right-0 bottom-0 opacity-[0.04] -mb-2 -mr-3 pointer-events-none">
            <Users size={96} />
          </div>
        </div>

      </div>

      {/* ── PHASE 7: Charts Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sales area chart */}
        <div className="glass-panel p-5 rounded-3xl lg:col-span-8 flex flex-col min-h-[320px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800 dark:text-white">Sales &amp; Expenditure Curve</span>
              <span className="text-xs text-slate-400">7-Day trend projection</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Phase 7: Live indicator */}
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 px-2.5 py-1 bg-emerald-500/10 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-live inline-block"></span>
                Live Ledger
              </span>
            </div>
          </div>

          {/* Phase 7: Chart Legend */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span className="w-3 h-0.5 bg-brand-500 rounded-full inline-block"></span>
              Sales Revenue
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span className="w-3 h-0.5 bg-primary-500 rounded-full inline-block"></span>
              Expenses
            </div>
          </div>

          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.45}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(124,58,237,0.20)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="Sales" stroke="#7c3aed" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" animationDuration={1200} />
                <Area type="monotone" dataKey="Expenses" stroke="#d97706" strokeWidth={1.5} fillOpacity={1} fill="url(#colorExpenses)" animationDuration={1400} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods pie */}
        <div className="glass-panel p-5 rounded-3xl lg:col-span-4 flex flex-col min-h-[320px]">
          <div className="flex flex-col mb-3">
            <span className="text-sm font-bold text-slate-800 dark:text-white">Payment Distribution</span>
            <span className="text-xs text-slate-400">All transaction channels</span>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center">
            {paymentPieData.reduce((s, p) => s + p.value, 0) === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400 text-xs text-center">
                <Receipt size={28} className="opacity-25 mb-1.5" />
                <span>No payments processed today</span>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={paymentPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={68}
                      paddingAngle={4}
                      dataKey="value"
                      animationDuration={1200}
                    >
                      {paymentPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Pie Legend */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 w-full mt-2 text-xs font-medium px-2">
                  {paymentPieData.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="text-slate-500 dark:text-slate-400 truncate text-[10px]">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* ── PHASE 5: Monthly Performance Comparison Bar Chart ── */}
      <div className="glass-panel p-5 rounded-3xl flex flex-col min-h-[300px]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800 dark:text-white">Monthly Financial Comparison</span>
            <span className="text-xs text-slate-400">H1 2026 Sales, Expenses &amp; Net Profit Analysis</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded-md bg-brand-500 inline-block" /> Sales
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded-md bg-primary-500 inline-block" /> Expenses
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" /> Profit
            </span>
          </div>
        </div>
        <div className="flex-1 w-full text-xs min-h-[220px]">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={monthlyComparisonData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(val: any) => [`₹${val.toLocaleString()}`, '']} />
              <Bar dataKey="Sales" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#d97706" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Lower Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Low Stock */}
        <div className="glass-panel p-5 rounded-3xl lg:col-span-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-darkBorder/50 pb-3">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" /> Low Stock Signals
              </span>
              <span className="text-xs text-slate-400">Kitchen replenishment items</span>
            </div>
            {lowStockItems.length > 0 && (
              <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                {lowStockItems.length} Warnings
              </span>
            )}
          </div>
          <div className="space-y-3 overflow-y-auto no-scrollbar max-h-52">
            {inventory.map((item) => {
              const totalStock = item.openingStock + item.purchased;
              const percentage = totalStock > 0 ? Math.min(100, Math.round((item.remaining / totalStock) * 100)) : 0;
              const isLow = item.remaining <= item.lowStockThreshold;
              return (
                <div key={item.id} className="flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700 dark:text-slate-200 font-bold">{item.name}</span>
                    <span className={`font-mono font-bold ${isLow ? 'text-rose-500' : 'text-slate-400'}`}>
                      {item.remaining.toFixed(1)} / {totalStock.toFixed(0)} {item.unit}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLow ? 'bg-rose-500 animate-pulse' : percentage > 50 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Bills */}
        <div className="glass-panel p-5 rounded-3xl lg:col-span-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-darkBorder/50 pb-3">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Receipt size={16} className="text-brand-500" /> Recent Invoices
              </span>
              <span className="text-xs text-slate-400">Current cashier records</span>
            </div>
            <button 
              onClick={() => navigate('/sales')}
              className="text-xs font-bold text-brand-500 hover:text-brand-600 flex items-center gap-0.5 transition-colors"
            >
              See all <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-2 overflow-y-auto no-scrollbar max-h-52">
            {recentBills.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No orders recorded yet today
              </div>
            ) : (
              recentBills.map((bill) => (
                <div 
                  key={bill.id}
                  className="p-3 bg-slate-100/60 dark:bg-darkBorder/25 rounded-2xl flex justify-between items-center hover:bg-slate-200/50 dark:hover:bg-darkBorder/40 transition-colors cursor-default"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">{bill.id}</span>
                    <span className="text-xs text-slate-400">
                      {bill.customerName || 'Walk-in'} · {new Date(bill.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold text-brand-500 font-mono text-sm">₹{bill.grandTotal.toFixed(0)}</span>
                    <span className={`status-badge ${
                      bill.paymentMethod === 'UPI' ? 'bg-sky-500/10 text-sky-500' : 
                      bill.paymentMethod === 'Cash' ? 'bg-amber-500/10 text-amber-500' : 
                      'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {bill.paymentMethod}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-panel p-5 rounded-3xl lg:col-span-4 flex flex-col gap-4">
          <div className="flex flex-col border-b border-slate-200/50 dark:border-darkBorder/50 pb-3">
            <span className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Zap size={16} className="text-primary-500" /> Quick Actions
            </span>
            <span className="text-xs text-slate-400">Terminal shortcuts</span>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <button
              onClick={() => navigate('/pos')}
              className="p-4 bg-gradient-to-br from-brand-500/10 to-primary-500/10 border border-brand-500/25 hover:border-brand-500/55 rounded-2xl flex flex-col items-center justify-center gap-2 text-center group transition-all duration-200 hover:-translate-y-0.5"
            >
              <ShoppingBag size={22} className="text-brand-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">POS Billing</span>
            </button>
            <button
              onClick={() => navigate('/kitchen')}
              className="p-4 bg-amber-500/8 dark:bg-amber-500/6 border border-amber-500/20 hover:border-amber-500/45 rounded-2xl flex flex-col items-center justify-center gap-2 text-center group transition-all duration-200 hover:-translate-y-0.5"
            >
              <Play size={22} className="text-amber-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">KDS Screen</span>
            </button>
            <button
              onClick={() => navigate('/inventory')}
              className="p-4 bg-rose-500/8 dark:bg-rose-500/6 border border-rose-500/20 hover:border-rose-500/45 rounded-2xl flex flex-col items-center justify-center gap-2 text-center group transition-all duration-200 hover:-translate-y-0.5"
            >
              <AlertTriangle size={22} className="text-rose-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Inventory</span>
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="p-4 bg-blue-500/8 dark:bg-blue-500/6 border border-blue-500/20 hover:border-blue-500/45 rounded-2xl flex flex-col items-center justify-center gap-2 text-center group transition-all duration-200 hover:-translate-y-0.5"
            >
              <FileText size={22} className="text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Reports</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
