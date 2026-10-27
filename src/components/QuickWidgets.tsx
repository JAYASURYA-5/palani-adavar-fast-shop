import React, { useState } from 'react';
import { useRestaurantStore } from '../store/restaurantStore';
import { 
  X, 
  Plus, 
  Minus, 
  Delete, 
  PlusCircle, 
  CheckCircle2
} from 'lucide-react';

interface QuickWidgetsProps {
  showCalculator: boolean;
  setShowCalculator: (show: boolean) => void;
}

export const QuickWidgets: React.FC<QuickWidgetsProps> = ({ 
  showCalculator, 
  setShowCalculator 
}) => {
  const { addExpense, addNotification } = useRestaurantStore();
  const [calcInput, setCalcInput] = useState('');
  const [calcResult, setCalcResult] = useState('');
  
  // Quick Expense States
  const [showQuickExpense, setShowQuickExpense] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState<'Chicken Purchase' | 'Rice Purchase' | 'Oil Purchase' | 'Eggs' | 'Water' | 'Gas' | 'Electricity' | 'Salary' | 'Rent' | 'Maintenance' | 'Miscellaneous'>('Miscellaneous');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseNotes, setExpenseNotes] = useState('');

  // Phase 9: Calculator logic (preserved exactly)
  const handleCalcClick = (val: string) => {
    if (val === '=') {
      try {
        const cleanInput = calcInput.replace(/×/g, '*').replace(/÷/g, '/');
        // eslint-disable-next-line no-new-func
        const result = Function(`"use strict"; return (${cleanInput})`)();
        const formatted = parseFloat(result.toFixed(8)).toString();
        setCalcResult(formatted);
        setCalcInput(formatted);
      } catch (err) {
        setCalcResult('Error');
      }
    } else if (val === 'C') {
      setCalcInput('');
      setCalcResult('');
    } else if (val === '⌫') {
      setCalcInput(calcInput.slice(0, -1));
    } else {
      setCalcInput(calcInput + val);
    }
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expenseAmount);
    if (!amountNum || amountNum <= 0) return;

    addExpense({
      category: expenseCategory,
      amount: amountNum,
      notes: expenseNotes || `Quick logged ${expenseCategory}`
    });

    setExpenseAmount('');
    setExpenseNotes('');
    setShowQuickExpense(false);
    addNotification('expense', 'Expense Registered', `Quick expense of ₹${amountNum} added successfully.`);
  };

  // Phase 9: Button style helper
  const getButtonClass = (btn: string) => {
    const isEquals   = btn === '=';
    const isOperator = ['÷', '×', '-', '+'].includes(btn);
    const isClear    = ['C', '⌫'].includes(btn);
    const base       = 'py-3 rounded-xl font-bold font-mono text-sm transition-all duration-100 select-none active:scale-90';

    if (isEquals) {
      return `${base} col-span-1 bg-gradient-to-br from-brand-500 to-primary-500 text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:from-brand-600 hover:to-primary-600`;
    }
    if (isOperator) {
      // Vivid orange-amber so operators pop on dark background
      return `${base} bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-500/30`;
    }
    if (isClear) {
      // Bright rose for clear/backspace — clearly distinct
      return `${base} bg-rose-500 hover:bg-rose-400 text-white shadow-md shadow-rose-500/30`;
    }
    return `${base} bg-slate-700/70 dark:bg-slate-700/60 text-white hover:bg-slate-600/80 dark:hover:bg-slate-600/70`;
  };

  const buttons = ['C', '÷', '×', '⌫', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.'];

  return (
    <>
      {/* ── Phase 9: Floating Calculator Widget ── */}
      {showCalculator && (
        <div className="fixed bottom-6 right-6 z-40 w-72 glass-panel rounded-3xl shadow-2xl ring-1 ring-brand-500/12 p-4 flex flex-col font-poppins slide-up">
          
          {/* Widget Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-darkBorder/50 mb-3">
            <span className="font-extrabold text-xs text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              🧮 Cashier Calculator
            </span>
            <button 
              onClick={() => setShowCalculator(false)}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-darkBorder text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Phase 9: Dark display panel */}
          <div className="bg-slate-900 dark:bg-black/50 rounded-2xl p-3.5 mb-4 text-right min-h-[64px] flex flex-col justify-end ring-1 ring-white/5">
            <span className="text-[10px] text-slate-500 font-mono select-all truncate block mb-0.5">
              {calcInput || '0'}
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono tracking-wider truncate block">
              {calcResult || '0'}
            </span>
          </div>

          {/* Phase 9: Keypad */}
          <div className="grid grid-cols-4 gap-1.5">
            {buttons.map((btn) => {
              const isZero = btn === '0';
              return (
                <button
                  key={btn}
                  onClick={() => handleCalcClick(btn)}
                  className={`${getButtonClass(btn)} ${isZero ? 'col-span-2' : ''}`}
                >
                  {btn}
                </button>
              );
            })}
          </div>
          
          {/* Footer: Log expense shortcut */}
          <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-darkBorder/50">
            <button
              onClick={() => { setShowQuickExpense(true); setShowCalculator(false); }}
              className="w-full py-2 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 bg-slate-100/60 dark:bg-darkBorder/20 hover:bg-brand-50/40 dark:hover:bg-brand-950/20 rounded-xl transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
            >
              <PlusCircle size={10} /> Log Quick Expense
            </button>
          </div>
        </div>
      )}

      {/* FAB button when calculator hidden (mobile only) */}
      {!showCalculator && (
        <button
          onClick={() => setShowCalculator(true)}
          className="fixed bottom-6 right-6 z-30 p-4 rounded-full bg-gradient-to-br from-brand-500 to-primary-500 text-white shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 transition-all hover:scale-105 active:scale-95 md:hidden"
          style={{ animation: 'float-pulse 3s ease-in-out infinite' }}
        >
          <Plus size={22} />
        </button>
      )}

      {/* ── Quick Expense Logging Modal ── */}
      {showQuickExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 dark:bg-black/65 backdrop-blur-sm">
          <form 
            onSubmit={handleExpenseSubmit}
            className="w-full max-w-sm glass-panel rounded-3xl shadow-2xl border border-slate-200/50 dark:border-darkBorder p-6 font-poppins flex flex-col gap-4 modal-enter"
          >
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-darkBorder/50 pb-3">
              <span className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                💰 Quick Register Expense
              </span>
              <button 
                type="button"
                onClick={() => setShowQuickExpense(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-darkBorder text-slate-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Category</label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value as any)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/60 dark:bg-darkCard/60 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-colors"
              >
                <option value="Chicken Purchase">Chicken Purchase</option>
                <option value="Rice Purchase">Rice Purchase</option>
                <option value="Oil Purchase">Oil Purchase</option>
                <option value="Eggs">Eggs Purchase</option>
                <option value="Water">Water Supply</option>
                <option value="Gas">Gas Cylinder Refill</option>
                <option value="Electricity">Electricity Utility</option>
                <option value="Salary">Staff Wages</option>
                <option value="Rent">Shop Rent</option>
                <option value="Maintenance">Maintenance &amp; Cleaning</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Amount (₹)</label>
              <input
                type="number"
                required
                placeholder="Enter amount"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/60 dark:bg-darkCard/60 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Notes (Optional)</label>
              <textarea
                placeholder="Add explanation notes..."
                value={expenseNotes}
                onChange={(e) => setExpenseNotes(e.target.value)}
                rows={2}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/60 dark:bg-darkCard/60 text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-brand-500 to-primary-500 hover:from-brand-600 hover:to-primary-600 text-white rounded-xl text-xs font-extrabold shadow-md shadow-brand-500/20 transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 mt-1"
            >
              <CheckCircle2 size={14} /> Commit Expense
            </button>
          </form>
        </div>
      )}
    </>
  );
};
