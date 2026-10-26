import React, { useState, useMemo } from 'react';
import { useRestaurantStore, Order, Expense } from '../store/restaurantStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingDown, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Plus, 
  X, 
  Receipt, 
  FileSpreadsheet, 
  PieChart as PieIcon,
  Calendar,
  Eye,
  Trash2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const SalesAndExpenses: React.FC = () => {
  const { 
    orders, 
    expenses, 
    addExpense,
    deleteExpense,
    settings 
  } = useRestaurantStore();

  const [activeTab, setActiveTab] = useState<'sales' | 'expenses'>('sales');

  // Search & Filters
  const [salesSearch, setSalesSearch] = useState('');
  const [salesPaymentFilter, setSalesPaymentFilter] = useState<'All' | 'Cash' | 'UPI' | 'Card'>('All');
  const [salesDateFilter, setSalesDateFilter] = useState<'All' | 'Today' | 'This Week' | 'This Month'>('All');
  
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('All');
  
  // Add Expense Dialog
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expCategory, setExpCategory] = useState<Expense['category']>('Miscellaneous');
  const [expAmount, setExpAmount] = useState('');
  const [expNotes, setExpNotes] = useState('');

  // Selected Bill for Receipt Modal
  const [selectedBill, setSelectedBill] = useState<Order | null>(null);

  // --- Sales Computations ---
  const filteredSales = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    return orders.filter((order) => {
      const matchesSearch = 
        order.id.toLowerCase().includes(salesSearch.toLowerCase()) ||
        (order.customerName && order.customerName.toLowerCase().includes(salesSearch.toLowerCase())) ||
        order.grandTotal.toString().includes(salesSearch);
        
      const matchesPayment = 
        salesPaymentFilter === 'All' || 
        order.paymentMethod === salesPaymentFilter;

      const orderDate = order.timestamp.split('T')[0];
      let matchesDate = true;
      if (salesDateFilter === 'Today') {
        matchesDate = orderDate === today;
      } else if (salesDateFilter === 'This Week') {
        matchesDate = orderDate >= weekAgo;
      } else if (salesDateFilter === 'This Month') {
        matchesDate = orderDate >= monthStart;
      }

      return matchesSearch && matchesPayment && matchesDate;
    });
  }, [orders, salesSearch, salesPaymentFilter, salesDateFilter]);

  const salesStats = useMemo(() => {
    const total = filteredSales.reduce((sum, o) => sum + o.grandTotal, 0);
    const tax = filteredSales.reduce((sum, o) => sum + o.tax, 0);
    const discount = filteredSales.reduce((sum, o) => sum + o.discount, 0);
    const avg = filteredSales.length > 0 ? total / filteredSales.length : 0;
    return { total, tax, discount, avg };
  }, [filteredSales]);

  // --- Expenses Computations ---
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesSearch = 
        exp.category.toLowerCase().includes(expenseSearch.toLowerCase()) ||
        exp.notes.toLowerCase().includes(expenseSearch.toLowerCase()) ||
        exp.amount.toString().includes(expenseSearch);

      const matchesCat = 
        expenseCategoryFilter === 'All' || 
        exp.category === expenseCategoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [expenses, expenseSearch, expenseCategoryFilter]);

  const expenseStats = useMemo(() => {
    const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Category distribution chart
    const distribution: { [key: string]: number } = {};
    filteredExpenses.forEach(e => {
      distribution[e.category] = (distribution[e.category] || 0) + e.amount;
    });

    let topCategory = 'None';
    let maxCatAmount = 0;
    Object.entries(distribution).forEach(([cat, amt]) => {
      if (amt > maxCatAmount) {
        maxCatAmount = amt;
        topCategory = cat;
      }
    });

    const colors = ['#7c3aed', '#d97706', '#10b981', '#38bdf8', '#fbbf24', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1', '#6b7280'];
    const chartData = Object.entries(distribution).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length]
    }));

    const totalEntries = filteredExpenses.length;
    const avgEntry = totalEntries > 0 ? total / totalEntries : 0;

    return { total, chartData, topCategory, totalEntries, avgEntry };
  }, [filteredExpenses]);

  // --- CSV Export Functions ---
  const exportToCSV = (type: 'sales' | 'expenses') => {
    let headers: string;
    let rows: string[];

    if (type === 'sales') {
      headers = 'Bill ID,Date,Customer,Cashier,Subtotal,Discount,Tax,Grand Total,Payment Method,Status\n';
      rows = filteredSales.map(s => 
        `"${s.id}","${new Date(s.timestamp).toLocaleDateString()}","${s.customerName || 'Walk-in'}","${s.cashierName}",${s.subtotal},${s.discount},${s.tax},${s.grandTotal},"${s.paymentMethod}","${s.status}"`
      );
    } else {
      headers = 'Expense ID,Category,Amount,Date,Recorded By,Description / Notes\n';
      rows = filteredExpenses.map(e => 
        `"${e.id}","${e.category}",${e.amount},"${e.date}","${e.recordedBy}","${e.notes.replace(/"/g, '""')}"`
      );
    }

    const blob = new Blob([headers + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `palani_andavar_${type}_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    addExpense({
      category: expCategory,
      amount: amountNum,
      notes: expNotes
    });

    setExpAmount('');
    setExpNotes('');
    setShowAddExpense(false);
  };

  return (
    <div className="p-6 space-y-6 font-poppins text-slate-800 dark:text-slate-100 h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      
      {/* View Selector & Export controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
        
        {/* Tab triggers */}
        <div className="flex bg-slate-100 dark:bg-darkBorder p-1.5 rounded-2xl w-full sm:w-64 border border-slate-200/50 dark:border-darkBorder/50">
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'sales' 
                ? 'bg-gradient-to-r from-brand-500 to-primary-500 text-white shadow shadow-brand-500/10' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            Sales Ledger
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'expenses' 
                ? 'bg-gradient-to-r from-brand-500 to-primary-500 text-white shadow shadow-brand-500/10' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            Expense Ledger
          </button>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {activeTab === 'expenses' && (
            <button
              onClick={() => setShowAddExpense(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-brand-500 to-primary-500 hover:from-brand-600 hover:to-primary-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-1.5 w-full sm:w-auto justify-center"
            >
              <Plus size={14} /> Add Expense
            </button>
          )}
          <button
            onClick={() => exportToCSV(activeTab)}
            className="px-4 py-2.5 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-darkBorder/50 flex items-center gap-1.5 justify-center flex-1 sm:flex-initial"
            title="Download CSV Ledger"
          >
            <FileSpreadsheet size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* SALES TAB LOGIC */}
      {activeTab === 'sales' && (
        <div className="flex-1 flex flex-col gap-6 overflow-hidden min-h-0">
          {/* Sales Stat indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
            <div className="glass-panel p-4 rounded-2xl flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Revenue</span>
              <span className="text-base font-extrabold text-emerald-500 font-mono mt-1">₹{salesStats.total.toFixed(0)}</span>
            </div>
            <div className="glass-panel p-4 rounded-2xl flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">GST Tax Collected</span>
              <span className="text-base font-extrabold text-slate-700 dark:text-slate-200 font-mono mt-1">₹{salesStats.tax.toFixed(0)}</span>
            </div>
            <div className="glass-panel p-4 rounded-2xl flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Discounts Issued</span>
              <span className="text-base font-extrabold text-rose-500 font-mono mt-1">₹{salesStats.discount.toFixed(0)}</span>
            </div>
            <div className="glass-panel p-4 rounded-2xl flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Average Ticket Size</span>
              <span className="text-base font-extrabold text-brand-500 font-mono mt-1">₹{salesStats.avg.toFixed(0)}</span>
            </div>
          </div>

          {/* Filtering row */}
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 bg-white dark:bg-darkCard/50 border border-slate-200/50 dark:border-darkBorder p-3 rounded-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search by Bill ID, customer..."
                value={salesSearch}
                onChange={(e) => setSalesSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-darkBorder/40 border border-transparent rounded-xl text-xs outline-none focus:border-brand-500 transition-colors"
              />
            </div>
                 <div className="flex items-center gap-2">
              <Calendar className="text-slate-400" size={14} />
              <select
                value={salesDateFilter}
                onChange={(e) => setSalesDateFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-100 dark:bg-darkBorder/60 border border-transparent rounded-xl text-xs font-semibold outline-none focus:border-brand-500 text-slate-800 dark:text-white"
              >
                <option value="All">All Dates</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="text-slate-400" size={14} />
              <select
                value={salesPaymentFilter}
                onChange={(e) => setSalesPaymentFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-100 dark:bg-darkBorder/60 border border-transparent rounded-xl text-xs font-semibold outline-none focus:border-brand-500 text-slate-800 dark:text-white"
              >
                <option value="All">All Payment Modes</option>
                <option value="Cash">Cash Drawer</option>
                <option value="UPI">UPI / QR</option>
                <option value="Card">Card Terminal</option>
              </select>
            </div>
          </div>

          {/* Primary Table container */}
          <div className="flex-1 glass-panel border border-slate-200/50 dark:border-darkBorder rounded-3xl overflow-hidden flex flex-col min-h-0">
            <div className="overflow-x-auto flex-1 no-scrollbar">
              <table className="w-full text-left text-xs border-collapse relative">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200/50 dark:border-darkBorder/50 z-10">
                  <tr>
                    <th className="p-4">BILL ID</th>
                    <th className="p-4">DATE & TIME</th>
                    <th className="p-4">CUSTOMER</th>
                    <th className="p-4">CASHIER</th>
                    <th className="p-4 text-right">TOTAL</th>
                    <th className="p-4 text-center">PAYMENT</th>
                    <th className="p-4 text-center">STATUS</th>
                    <th className="p-4 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-darkBorder/40">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-100/50 dark:hover:bg-darkBorder/20 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{sale.id}</td>
                      <td className="p-4 text-slate-500">
                        {new Date(sale.timestamp).toLocaleDateString()} {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 font-medium text-slate-700 dark:text-slate-300">{sale.customerName || 'Walk-in'}</td>
                      <td className="p-4 text-slate-500">{sale.cashierName}</td>
                      <td className="p-4 text-right font-bold font-mono text-brand-500">₹{sale.grandTotal.toFixed(0)}</td>
                      <td className="p-4 text-center">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          sale.paymentMethod === 'UPI' ? 'bg-sky-500/10 text-sky-500' : sale.paymentMethod === 'Cash' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          sale.status === 'Delivered' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>{sale.status}</span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedBill(sale)}
                          className="p-2 bg-slate-100 dark:bg-darkBorder hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-brand-500 dark:text-slate-300 rounded-xl transition-all"
                          title="View Receipt"
                        >
                          <Eye size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400 text-xs">
                      <div className="flex flex-col items-center gap-2">
                        <Receipt size={36} className="text-slate-300 dark:text-slate-600 animate-pulse" />
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-300">No sales transactions found</span>
                        <span className="text-[11px] text-slate-400">Try adjusting your search or date filter</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

      {/* EXPENSES TAB LOGIC */}
      {activeTab === 'expenses' && (
        <div className="flex-1 flex flex-col gap-6 overflow-hidden min-h-0">
          
          {/* Expenses Stat summary row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
            <div className="glass-panel p-4 rounded-2xl flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Expenses</span>
              <span className="text-base font-extrabold text-rose-500 font-mono mt-1">₹{expenseStats.total.toLocaleString()}</span>
            </div>
            <div className="glass-panel p-4 rounded-2xl flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Top Category</span>
              <span className="text-base font-extrabold text-primary-500 truncate mt-1">{expenseStats.topCategory}</span>
            </div>
            <div className="glass-panel p-4 rounded-2xl flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Entries</span>
              <span className="text-base font-extrabold text-brand-500 font-mono mt-1">{expenseStats.totalEntries} logged</span>
            </div>
            <div className="glass-panel p-4 rounded-2xl flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Average Entry</span>
              <span className="text-base font-extrabold text-slate-700 dark:text-slate-200 font-mono mt-1">₹{expenseStats.avgEntry.toFixed(0)}</span>
            </div>
          </div>

          {/* Left Area: Logs and filters */}
          <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden min-h-0">
          
          {/* Left Area: Logs and filters */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0">
            {/* Expense search control */}
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 bg-white dark:bg-darkCard/50 border border-slate-200/50 dark:border-darkBorder p-3 rounded-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search expense note, categories..."
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-darkBorder/40 border border-transparent rounded-xl text-xs outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-slate-400" size={14} />
                <select
                  value={expenseCategoryFilter}
                  onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-100 dark:bg-darkBorder/60 border border-transparent rounded-xl text-xs font-semibold outline-none focus:border-brand-500"
                >
                  <option value="All">All Categories</option>
                  <option value="Chicken Purchase">Chicken Purchase</option>
                  <option value="Rice Purchase">Rice Purchase</option>
                  <option value="Oil Purchase">Oil Purchase</option>
                  <option value="Eggs">Eggs</option>
                  <option value="Water">Water</option>
                  <option value="Gas">Gas</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Salary">Salary</option>
                  <option value="Rent">Rent</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>
            </div>

            {/* Expenses List */}
            <div className="flex-1 glass-panel border border-slate-200/50 dark:border-darkBorder rounded-3xl overflow-hidden flex flex-col min-h-0">
              <div className="overflow-y-auto flex-1 no-scrollbar p-3 space-y-2">
                {filteredExpenses.map((exp) => (
                  <div 
                    key={exp.id} 
                    className="p-4 bg-white dark:bg-darkCard hover:bg-slate-100/30 dark:hover:bg-darkBorder/20 border border-slate-100 dark:border-darkBorder/20 rounded-2xl flex justify-between items-center transition-all group"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-xs text-slate-800 dark:text-white">{exp.category}</span>
                      <span className="text-[10px] text-slate-400">{exp.notes}</span>
                      <span className="text-[9px] text-slate-400 flex items-center gap-1 font-medium mt-1">
                        <Calendar size={10} /> {exp.date} • Recorded by {exp.recordedBy}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold font-mono text-rose-500 text-sm">₹{exp.amount}</span>
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
                        title="Delete expense entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredExpenses.length === 0 && (
                  <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                    <TrendingDown size={36} className="text-slate-300 dark:text-slate-600 animate-pulse" />
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-300">No expense entries found</span>
                    <span className="text-[11px] text-slate-400">Try adjusting your search or category filter</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Area: Chart breakdown & aggregate KPI */}
          <div className="w-full lg:w-80 flex flex-col gap-4 flex-shrink-0">
            {/* Total Expense card */}
            <div className="glass-panel p-5 rounded-3xl flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Selected Expenses</span>
                <span className="text-xl font-bold font-mono text-rose-500 mt-1">₹{expenseStats.total.toFixed(0)}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <TrendingDown size={20} />
              </div>
            </div>

            {/* Recharts Pie Breakdown */}
            <div className="glass-panel p-5 rounded-3xl flex-1 flex flex-col min-h-[250px]">
              <span className="text-xs font-bold text-slate-800 dark:text-white uppercase mb-3 flex items-center gap-1.5">
                <PieIcon size={14} className="text-brand-500" /> Category Breakdown
              </span>
              <div className="flex-1 flex flex-col justify-center items-center relative">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={expenseStats.chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {expenseStats.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(21, 28, 44, 0.9)', 
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '10px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Chart custom labels */}
                <div className="w-full overflow-y-auto no-scrollbar max-h-32 mt-3 space-y-1 text-[9px] font-semibold px-2">
                  {expenseStats.chartData.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-slate-500 dark:text-slate-400 truncate">{entry.name}</span>
                      <span className="ml-auto font-bold font-mono">₹{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* EXPENSE DIALOG FORM POPUP */}
      <AnimatePresence>
        {showAddExpense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs">
            <motion.form 
              onSubmit={handleAddExpenseSubmit}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm glass-panel rounded-3xl border border-slate-200/50 dark:border-darkBorder p-6 font-poppins flex flex-col gap-4 shadow-2xl bg-white dark:bg-darkCard"
            >
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-darkBorder/50 pb-3">
                <span className="font-bold text-sm text-slate-800 dark:text-white">Add Store Expense</span>
                <button type="button" onClick={() => setShowAddExpense(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-darkBorder">
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Expense Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-colors"
                >
                  <option value="Chicken Purchase">Chicken Purchase</option>
                  <option value="Rice Purchase">Rice Purchase</option>
                  <option value="Oil Purchase">Oil Purchase</option>
                  <option value="Eggs">Eggs</option>
                  <option value="Water">Water</option>
                  <option value="Gas">Gas Cylinder Refill</option>
                  <option value="Electricity">Electricity Utility</option>
                  <option value="Salary">Staff Salary / Wages</option>
                  <option value="Rent">Shop Rent</option>
                  <option value="Maintenance">Maintenance & Cleaning</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Expense Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="Enter amount"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description / Purpose</label>
                <textarea
                  required
                  placeholder="e.g. Broiler chicken 10kg from mill"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-brand-500 to-primary-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all"
              >
                Log Expense
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* OVERLAY: Selected Receipt Visualizer */}
      <AnimatePresence>
        {selectedBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-darkBorder relative my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkBorder/40 pb-3 mb-4">
                <span className="font-extrabold text-xs text-slate-500 uppercase tracking-widest">
                  📄 Receipt Invoice {selectedBill.id}
                </span>
                <button 
                  onClick={() => setSelectedBill(null)}
                  className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-darkBorder text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* invoice print code (matching POS receipt view) */}
              <div 
                id="printable-receipt"
                className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-800 font-mono text-xs leading-relaxed"
              >
                <div className="text-center space-y-1 mb-4">
                  <span className="text-2xl block">🔥</span>
                  <h2 className="font-bold text-sm uppercase tracking-wide">{settings.name}</h2>
                  <p className="text-[9px] text-slate-400 leading-none">{settings.address}</p>
                  <p className="text-[9px] text-slate-400 leading-none">Ph: {settings.phone}</p>
                </div>

                <div className="border-t border-b border-dashed border-slate-300 py-2 my-2 space-y-0.5 text-[9px] text-slate-500">
                  <div className="flex justify-between">
                    <span>BILL NO: {selectedBill.id}</span>
                    <span>CASHIER: {selectedBill.cashierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DATE: {new Date(selectedBill.timestamp).toLocaleDateString()}</span>
                    <span>TIME: {new Date(selectedBill.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CUSTOMER: {selectedBill.customerName || 'Walk-in'}</span>
                    <span>STATUS: {selectedBill.paymentStatus}</span>
                  </div>
                </div>

                <table className="w-full text-left my-4 text-[9px] border-collapse">
                  <thead>
                    <tr className="border-b border-dashed border-slate-300 text-slate-600">
                      <th className="py-1">ITEM</th>
                      <th className="py-1 text-center">QTY</th>
                      <th className="py-1 text-right">RATE</th>
                      <th className="py-1 text-right">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBill.items.map((item, idx) => {
                      const rate = item.customPrice !== undefined ? item.customPrice : item.menuItem.price;
                      return (
                        <tr key={idx} className="border-b border-slate-100/50">
                          <td className="py-1.5 max-w-[120px] truncate">{item.menuItem.name}</td>
                          <td className="py-1.5 text-center">{item.quantity}</td>
                          <td className="py-1.5 text-right">₹{rate}</td>
                          <td className="py-1.5 text-right font-mono">₹{(rate * item.quantity).toFixed(0)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[9px]">
                  <div className="flex justify-between text-slate-500">
                    <span>SUBTOTAL</span>
                    <span>₹{selectedBill.subtotal.toFixed(0)}</span>
                  </div>
                  {selectedBill.discount > 0 && (
                    <div className="flex justify-between text-rose-500 font-bold">
                      <span>DISCOUNT</span>
                      <span>-₹{selectedBill.discount.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span>GST (5%)</span>
                    <span>₹{selectedBill.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[10px] border-t border-dashed border-slate-300 pt-1.5">
                    <span>GRAND TOTAL</span>
                    <span className="font-mono text-brand-500">₹{selectedBill.grandTotal.toFixed(0)}</span>
                  </div>
                </div>

                <div className="text-center text-[8px] text-slate-400 mt-5 whitespace-pre-line">
                  Thank you! Visit again.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-bold">
                <button
                  onClick={() => window.print()}
                  className="py-2.5 bg-slate-100 dark:bg-darkBorder hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl flex items-center justify-center gap-1 transition-colors"
                >
                  <Printer size={12} /> Print
                </button>
                <button
                  onClick={() => window.print()}
                  className="py-2.5 bg-gradient-to-r from-brand-500 to-primary-500 text-white rounded-xl flex items-center justify-center gap-1 shadow-sm shadow-brand-500/20 hover:opacity-95 transition-all"
                >
                  <Download size={12} /> Save PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
