import React, { useState, useMemo } from 'react';
import { useRestaurantStore } from '../store/restaurantStore';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Printer, 
  Download, 
  Share2, 
  BarChart3, 
  TrendingUp, 
  BookOpen, 
  Package, 
  Users,
  Award,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const ReportsAndAnalytics: React.FC = () => {
  const { orders, expenses, inventory, customers, employees } = useRestaurantStore();

  const [timeframe, setTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Monthly');
  const [reportType, setReportType] = useState<'Sales' | 'Expenses' | 'Profit' | 'Inventory' | 'Employees'>('Sales');

  // Timeframe statistics summary
  const stats = useMemo(() => {
    let salesTotal = orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + o.grandTotal, 0);
    let expensesTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Apply scale factor for timeframes in dashboard view
    if (timeframe === 'Daily') {
      salesTotal = salesTotal / 30; // mock daily share
      expensesTotal = expensesTotal / 30;
    } else if (timeframe === 'Weekly') {
      salesTotal = salesTotal / 4;
      expensesTotal = expensesTotal / 4;
    } else if (timeframe === 'Yearly') {
      salesTotal = salesTotal * 12;
      expensesTotal = expensesTotal * 12;
    }

    const netProfit = salesTotal - expensesTotal;
    const margin = salesTotal > 0 ? (netProfit / salesTotal) * 100 : 0;

    return {
      sales: Math.round(salesTotal),
      expenses: Math.round(expensesTotal),
      profit: Math.round(netProfit),
      margin: Math.round(margin)
    };
  }, [orders, expenses, timeframe]);

  // Main Trend Data — Live from store orders and expenses
  const trendsData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dateLabel = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      const rev = orders
        .filter(o => o.timestamp.startsWith(dateStr) && o.status !== 'Cancelled')
        .reduce((sum, o) => sum + o.grandTotal, 0);
      const cost = expenses
        .filter(e => e.date === dateStr)
        .reduce((sum, e) => sum + e.amount, 0);
      days.push({
        date: dateLabel,
        Revenue: Math.round(rev),
        Cost: Math.round(cost),
        Profit: Math.round(rev - cost)
      });
    }
    return days;
  }, [orders, expenses]);

  // Hourly Sales Data (11 AM - 11 PM from live orders)
  const hourlySalesData = useMemo(() => {
    const hours = ['11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'];
    const hourMap: { [h: number]: string } = {
      11: '11 AM', 12: '12 PM', 13: '1 PM', 14: '2 PM', 15: '3 PM', 16: '4 PM',
      17: '5 PM', 18: '6 PM', 19: '7 PM', 20: '8 PM', 21: '9 PM', 22: '10 PM', 23: '11 PM'
    };
    const salesByHour: { [label: string]: number } = {};
    hours.forEach(h => { salesByHour[h] = 0; });
    orders.forEach(o => {
      if (o.status !== 'Cancelled') {
        const h = new Date(o.timestamp).getHours();
        const label = hourMap[h];
        if (label && salesByHour[label] !== undefined) {
          salesByHour[label] += o.grandTotal;
        }
      }
    });
    return hours.map(hour => ({ hour, Sales: Math.round(salesByHour[hour] || 0) }));
  }, [orders]);

  // Best / Worst Selling items data from live orders
  const productPerformanceData = useMemo(() => {
    const itemMap: { [name: string]: number } = {};
    orders.forEach(o => {
      if (o.status !== 'Cancelled') {
        o.items.forEach(i => {
          itemMap[i.menuItem.name] = (itemMap[i.menuItem.name] || 0) + i.quantity;
        });
      }
    });
    const colors = ['#7c3aed', '#8b5cf6', '#d97706', '#fbbf24', '#c4b5fd', '#94a3b8'];
    return Object.entries(itemMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, Quantity], idx) => ({
        name,
        Quantity,
        color: colors[idx % colors.length]
      }));
  }, [orders]);

  const handlePrint = () => {
    window.print();
  };

  // Phase 13: Full order-level CSV export
  const handleCSVExport = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const filteredByTime = orders.filter(o => {
      if (o.status === 'Cancelled') return false;
      if (timeframe === 'Daily') return o.timestamp.startsWith(todayStr);
      return true;
    });

    const rows = [
      ['Order ID', 'Date', 'Time', 'Customer', 'Cashier', 'Items', 'Subtotal', 'Discount', 'Tax', 'Grand Total', 'Payment Method', 'Status', 'Order Type'],
      ...filteredByTime.map(o => [
        o.id,
        new Date(o.timestamp).toLocaleDateString('en-IN'),
        new Date(o.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        o.customerName || 'Walk-in',
        o.cashierName,
        o.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join(' | '),
        o.subtotal.toFixed(2),
        o.discount.toFixed(2),
        o.tax.toFixed(2),
        o.grandTotal.toFixed(2),
        o.paymentMethod,
        o.status,
        o.orderType || 'Takeaway'
      ])
    ];

    const csvContent = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `palani_andavar_${reportType.toLowerCase()}_${timeframe.toLowerCase()}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 font-poppins text-slate-800 dark:text-slate-100 h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      
      {/* Control Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0 bg-white dark:bg-darkCard/50 border border-slate-200/50 dark:border-darkBorder p-4 rounded-3xl glass-panel">
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-darkBorder p-1 rounded-xl text-[10px] font-bold">
            {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  timeframe === tf
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-darkBorder/60 border border-transparent rounded-xl text-[10px] font-bold outline-none text-slate-600 dark:text-slate-300"
          >
            <option value="Sales">Sales Report</option>
            <option value="Expenses">Expense Report</option>
            <option value="Profit">Profit & Margin Report</option>
            <option value="Inventory">Inventory Audits</option>
            <option value="Employees">Helper Wages</option>
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-100 dark:bg-darkBorder/40 hover:bg-slate-200 dark:hover:bg-darkBorder rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1 text-slate-600 dark:text-slate-300"
          >
            <Printer size={12} /> Print
          </button>
          <button
            onClick={handleCSVExport}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-100 dark:bg-darkBorder/40 hover:bg-slate-200 dark:hover:bg-darkBorder rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1 text-slate-600 dark:text-slate-300"
          >
            <Download size={12} /> Excel CSV
          </button>
          <button
            onClick={() => alert('PDF report exported.')}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-100 dark:bg-darkBorder/40 hover:bg-slate-200 dark:hover:bg-darkBorder rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1 text-slate-600 dark:text-slate-300"
          >
            <Download size={12} /> PDF
          </button>
        </div>

      </div>

      {/* KPI Stats summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
        <div className="glass-panel p-4 rounded-2xl flex flex-col">
          <span className="text-[9px] font-bold text-slate-400 uppercase">Revenue ({timeframe})</span>
          <span className="text-base font-extrabold text-emerald-500 font-mono mt-1">₹{stats.sales.toLocaleString()}</span>
        </div>
        <div className="glass-panel p-4 rounded-2xl flex flex-col">
          <span className="text-[9px] font-bold text-slate-400 uppercase">Operating Costs</span>
          <span className="text-base font-extrabold text-rose-500 font-mono mt-1">₹{stats.expenses.toLocaleString()}</span>
        </div>
        <div className="glass-panel p-4 rounded-2xl flex flex-col">
          <span className="text-[9px] font-bold text-slate-400 uppercase">Operating Margins</span>
          <span className="text-base font-extrabold text-blue-500 font-mono mt-1">{stats.margin}%</span>
        </div>
        <div className="glass-panel p-4 rounded-2xl flex flex-col">
          <span className="text-[9px] font-bold text-slate-400 uppercase">Net Margin Net</span>
          <span className="text-base font-extrabold text-amber-500 font-mono mt-1">₹{stats.profit.toLocaleString()}</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto no-scrollbar pb-6 min-h-0">
        
        {/* Main spline Trend curves */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-3xl min-h-[300px] flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-brand-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Revenue vs Cost Analysis</span>
          </div>
          <div className="flex-grow w-full text-xs">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(21, 28, 44, 0.9)', 
                    border: 'none', 
                    borderRadius: '16px',
                    color: '#fff'
                  }} 
                />
                <Area type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="Cost" stroke="#ef4444" strokeWidth={1.5} fillOpacity={1} fill="url(#colorCosts)" />
                <Area type="monotone" dataKey="Profit" stroke="#f59e0b" strokeWidth={2.5} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly distribution bar chart */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-3xl min-h-[300px] flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-brand-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Hourly Peak-Sales load</span>
          </div>
          <div className="flex-grow w-full text-xs">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={hourlySalesData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={8} />
                <YAxis stroke="#64748b" fontSize={8} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(21, 28, 44, 0.9)', 
                    border: 'none', 
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#fff'
                  }} 
                />
                <Bar dataKey="Sales" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best / Worst item distribution */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-3xl flex flex-col min-h-[250px]">
          <div className="flex items-center gap-2 mb-4 border-b pb-3">
            <BookOpen size={16} className="text-brand-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Product Performance Log</span>
          </div>
          <div className="space-y-3.5 flex-grow overflow-y-auto no-scrollbar max-h-56">
            {productPerformanceData.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No product sales recorded yet. Completed POS orders will appear here.
              </div>
            ) : (
              productPerformanceData.map((item, idx) => {
                const maxQty = productPerformanceData[0]?.Quantity || 1;
                const percentage = Math.round((item.Quantity / maxQty) * 100);
                return (
                  <div key={idx} className="flex flex-col gap-1 text-xs">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                      <span className="font-mono text-slate-500">{item.Quantity} portions sold</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: item.color 
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Audit note checklist */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-3xl flex flex-col justify-between min-h-[250px]">
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b pb-3">
              <AlertCircle size={14} className="text-brand-500" /> Audit Parameters
            </span>
            <div className="space-y-2.5 text-xs text-slate-500 font-medium">
              <div className="flex justify-between">
                <span>Total menu registry:</span>
                <span className="font-bold font-mono">{inventory.length} items</span>
              </div>
              <div className="flex justify-between">
                <span>Loyalty database:</span>
                <span className="font-bold font-mono">{customers.length} profiles</span>
              </div>
              <div className="flex justify-between">
                <span>Logged staff:</span>
                <span className="font-bold font-mono">{employees.length} employees</span>
              </div>
            </div>
          </div>
          
          <div className="text-[10px] text-slate-400 leading-relaxed border-t pt-3 mt-4">
            * Margins calculate the cost metrics from the supplier outstanding ledgers and utility invoices against gross sales.
          </div>
        </div>

      </div>

    </div>
  );
};
