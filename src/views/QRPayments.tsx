import React, { useState, useMemo } from 'react';
import { useRestaurantStore } from '../store/restaurantStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  RefreshCw, 
  History, 
  X,
  CreditCard,
  IndianRupee,
  AlertCircle
} from 'lucide-react';

interface UpiTransaction {
  id: string;
  amount: number;
  utr: string; // transaction reference
  timestamp: string;
  status: 'Pending' | 'Success' | 'Failed';
}

export const QRPayments: React.FC = () => {
  const { settings, addNotification } = useRestaurantStore();

  const [inputAmount, setInputAmount] = useState('');
  const [activePayment, setActivePayment] = useState<{
    amount: number;
    qrUrl: string;
    status: 'Pending' | 'Success';
    id: string;
  } | null>(null);

  const [upiHistory, setUpiHistory] = useState<UpiTransaction[]>([]);

  const handleKeypadClick = (val: string) => {
    if (val === 'C') {
      setInputAmount('');
    } else if (val === '⌫') {
      setInputAmount(inputAmount.slice(0, -1));
    } else {
      if (inputAmount.includes('.') && val === '.') return;
      setInputAmount(inputAmount + val);
    }
  };

  const handleGenerateQR = () => {
    const amt = parseFloat(inputAmount);
    if (isNaN(amt) || amt <= 0) return;

    // Standard merchant UPI payment URI scheme
    const upiUrl = `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.name)}&am=${amt}&cu=INR`;
    
    setActivePayment({
      amount: amt,
      qrUrl: upiUrl,
      status: 'Pending',
      id: `UPI-${Math.floor(1000 + Math.random() * 9000)}`
    });

    setInputAmount('');
  };

  const handleSimulateSuccess = () => {
    if (!activePayment) return;

    const utrVal = Math.floor(600000000000 + Math.random() * 300000000000).toString();
    const newTx: UpiTransaction = {
      id: activePayment.id,
      amount: activePayment.amount,
      utr: utrVal,
      timestamp: new Date().toISOString(),
      status: 'Success'
    };

    setUpiHistory([newTx, ...upiHistory]);
    
    // Set success indicator
    setActivePayment({
      ...activePayment,
      status: 'Success'
    });

    addNotification(
      'payment', 
      'UPI Payment Received', 
      `Scan Payment of ₹${activePayment.amount.toFixed(0)} received successfully. Reference UTR: ${utrVal}`
    );
  };

  return (
    <div className="p-6 space-y-6 font-poppins text-slate-800 dark:text-slate-100 h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden min-h-0">
        
        {/* Left Column: Number entry Keypad */}
        <div className="lg:col-span-4 glass-panel border border-slate-200/50 dark:border-darkBorder rounded-3xl p-5 flex flex-col justify-between h-full">
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider border-b pb-3 flex items-center gap-1.5">
              🔢 Quick Amount UPI Generator
            </span>

            {/* Display screen */}
            <div className="bg-slate-100/60 dark:bg-darkBorder/40 rounded-2xl p-4 text-right flex flex-col justify-center min-h-16 relative">
              <span className="absolute left-4 text-slate-400 font-bold text-sm">₹</span>
              <span className="text-2xl font-bold font-mono tracking-widest text-brand-500">{inputAmount || '0'}</span>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-1.5">
              {['50', '100', '150', '200'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setInputAmount(preset)}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold font-mono transition-all ${
                    inputAmount === preset
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'bg-slate-100/60 dark:bg-darkBorder/40 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-darkBorder/80'
                  }`}
                >
                  ₹{preset}
                </button>
              ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleKeypadClick(btn)}
                  className={`py-3.5 rounded-xl font-bold font-mono text-sm active:scale-95 transition-all ${
                    btn === 'C' || btn === '⌫'
                      ? 'bg-rose-50/60 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
                      : 'bg-slate-100/60 dark:bg-darkBorder/40 text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-darkBorder/80'
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateQR}
            disabled={!inputAmount || parseFloat(inputAmount) <= 0}
            className="w-full py-3 bg-gradient-to-r from-brand-500 to-primary-500 hover:from-brand-600 hover:to-primary-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4 flex items-center justify-center gap-1.5"
          >
            <QrCode size={14} /> Render Dynamic QR
          </button>
        </div>

        {/* Center Column: Interactive Dynamic QR Placard */}
        <div className="lg:col-span-4 glass-panel border border-slate-200/50 dark:border-darkBorder rounded-3xl p-5 flex flex-col justify-center items-center h-full relative">
          
          <AnimatePresence mode="wait">
            {!activePayment ? (
              <div className="text-center text-slate-400 text-xs flex flex-col items-center gap-3">
                <QrCode size={48} className="text-slate-300 animate-pulse" />
                <span className="font-bold text-slate-500">Scan Standby Mode</span>
                <p className="max-w-[200px] leading-relaxed text-slate-400/80">Key in a transaction value in the left panel to load a merchant UPI QR placard.</p>
              </div>
            ) : (
              <motion.div 
                key={activePayment.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center w-full h-full relative text-center"
              >
                
                {/* Close Placard button */}
                <button
                  onClick={() => setActivePayment(null)}
                  className="absolute top-0 right-0 p-1.5 bg-slate-100 dark:bg-darkBorder rounded-full text-slate-400"
                >
                  <X size={14} />
                </button>

                <span className="text-[10px] font-bold text-brand-500 bg-brand-500/10 px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                  {settings.name}
                </span>

                {/* Simulated QR Code box */}
                <div className="w-40 h-40 bg-white border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex items-center justify-center shadow shadow-slate-900/5 relative mb-4">
                  
                  {activePayment.status === 'Success' ? (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-white/95 rounded-3xl flex flex-col items-center justify-center gap-1.5 text-emerald-500"
                    >
                      <CheckCircle2 size={44} className="fill-emerald-50 text-emerald-500 animate-bounce" />
                      <span className="text-[10px] font-extrabold uppercase">Payment Received!</span>
                    </motion.div>
                  ) : null}

                  <QrCode size={120} className="text-slate-900" />
                </div>

                <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">₹{activePayment.amount}</span>
                <span className="text-[9px] text-slate-400 font-medium font-mono mt-0.5">Reference ID: {activePayment.id}</span>

                {/* Payment provider symbols */}
                <div className="flex gap-2 items-center justify-center mt-5 text-[8px] text-slate-400 font-bold bg-slate-100/50 dark:bg-darkBorder/20 px-3 py-1.5 rounded-full">
                  <span>GPAY</span>•<span>PHONEPE</span>•<span>PAYTM</span>•<span>BHIM</span>•<span>UPI</span>
                </div>

                {/* Simulator verify trigger */}
                {activePayment.status === 'Pending' && (
                  <button
                    onClick={handleSimulateSuccess}
                    className="mt-6 py-2 px-4 border border-dashed border-emerald-500/40 hover:border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-xl flex items-center gap-1.5 animate-pulse"
                  >
                    <RefreshCw size={12} className="animate-spin" /> Verify Receipt Status
                  </button>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Transaction Logs */}
        <div className="lg:col-span-4 glass-panel border border-slate-200/50 dark:border-darkBorder rounded-3xl flex flex-col overflow-hidden h-full">
          <div className="p-4 border-b border-slate-200/50 dark:border-darkBorder/50 flex items-center gap-2 flex-shrink-0">
            <History size={16} className="text-brand-500 animate-pulse" />
            <span className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider">UPI Desk History</span>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2.5">
            {upiHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs text-center py-12 gap-2">
                <History size={28} className="opacity-30" />
                <span className="font-semibold">No UPI payments yet</span>
                <span className="text-[10px] text-slate-400/80">Generate a dynamic QR to receive UPI payments</span>
              </div>
            ) : (
              upiHistory.map((tx) => (
                <div 
                  key={tx.id}
                  className="p-3 bg-white dark:bg-darkCard hover:bg-slate-100/30 dark:hover:bg-darkBorder/30 rounded-2xl border border-slate-100 dark:border-darkBorder/20 text-xs flex justify-between items-center"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-slate-800 dark:text-white">{tx.id}</span>
                    <span className="text-[9px] text-slate-400 font-mono truncate">UTR: {tx.utr}</span>
                    <span className="text-[8px] text-slate-400 mt-1">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1 font-mono text-right flex-shrink-0">
                    <span className="font-bold text-emerald-500 font-mono">₹{tx.amount}</span>
                    <span className="text-[8px] font-bold text-emerald-500 uppercase leading-none bg-emerald-500/10 px-1.5 py-0.5 rounded">SUCCESS</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
