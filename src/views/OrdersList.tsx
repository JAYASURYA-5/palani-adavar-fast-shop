import React, { useState, useMemo } from 'react';
import { useRestaurantStore, Order } from '../store/restaurantStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  ClipboardList,
  Printer,
  RefreshCw,
  AlertTriangle,
  Eye,
  X,
  IndianRupee,
  Calendar
} from 'lucide-react';

// Phase 13: Receipt print component
const ReceiptModal: React.FC<{ order: Order; onClose: () => void }> = ({ order, onClose }) => {
  const { settings } = useRestaurantStore();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-sm glass-panel rounded-3xl shadow-2xl border border-slate-200/50 dark:border-darkBorder flex flex-col modal-enter">
        <div className="flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-darkBorder/50">
          <span className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
            🧾 Receipt — {order.id}
          </span>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-darkBorder text-slate-400 transition-colors">
            <X size={14} />
          </button>
        </div>
        
        {/* Receipt Content */}
        <div id="printable-receipt" className="p-5 space-y-3 text-xs font-mono">
          <div className="text-center border-b border-dashed border-slate-300 dark:border-darkBorder pb-3">
            <p className="font-extrabold text-sm text-slate-900 dark:text-white">{settings.name}</p>
            <p className="text-slate-500 text-[10px]">{settings.address}</p>
            <p className="text-slate-500 text-[10px]">Ph: {settings.phone}</p>
          </div>
          
          <div className="space-y-1 text-[10px] text-slate-600 dark:text-slate-400">
            <div className="flex justify-between"><span>Bill #:</span><span className="font-bold">{order.id}</span></div>
            <div className="flex justify-between"><span>Date:</span><span>{new Date(order.timestamp).toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between"><span>Cashier:</span><span>{order.cashierName}</span></div>
            <div className="flex justify-between"><span>Customer:</span><span>{order.customerName || 'Walk-in'}</span></div>
            <div className="flex justify-between"><span>Type:</span><span>{order.orderType || 'Takeaway'}</span></div>
          </div>
          
          <div className="border-t border-dashed border-slate-300 dark:border-darkBorder pt-2 space-y-1">
            {order.items.map((item, idx) => {
              const price = item.customPrice ?? item.menuItem.price;
              return (
                <div key={idx} className="flex justify-between text-[10px]">
                  <span className="text-slate-700 dark:text-slate-300">{item.quantity}x {item.menuItem.name}</span>
                  <span className="font-bold">₹{(price * item.quantity).toFixed(0)}</span>
                </div>
              );
            })}
          </div>
          
          <div className="border-t border-dashed border-slate-300 dark:border-darkBorder pt-2 space-y-0.5 text-[10px]">
            <div className="flex justify-between text-slate-500"><span>Subtotal:</span><span>₹{order.subtotal.toFixed(0)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-rose-500"><span>Discount:</span><span>-₹{order.discount.toFixed(0)}</span></div>}
            <div className="flex justify-between text-slate-500"><span>GST (5%):</span><span>₹{order.tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-extrabold text-sm text-slate-900 dark:text-white border-t border-slate-200 dark:border-darkBorder pt-1 mt-1">
              <span>GRAND TOTAL</span>
              <span>₹{order.grandTotal.toFixed(0)}</span>
            </div>
          </div>
          
          <div className="text-center text-[9px] text-slate-400 border-t border-dashed border-slate-300 dark:border-darkBorder pt-2">
            <p>Payment: {order.paymentMethod}</p>
            {order.splitDetails && (
              <p>Split: Cash ₹{order.splitDetails.cash} | UPI ₹{order.splitDetails.upi} | Card ₹{order.splitDetails.card}</p>
            )}
            <p className="mt-1">{settings.receiptFooter.split('\\n')[0]}</p>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-200/50 dark:border-darkBorder/50">
          <button
            onClick={() => window.print()}
            className="w-full py-2.5 bg-gradient-to-r from-brand-500 to-primary-500 hover:from-brand-600 hover:to-primary-600 text-white rounded-xl text-xs font-extrabold transition-all active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <Printer size={13} /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

// Phase 13: Void modal with reason
const VoidModal: React.FC<{ orderId: string; onConfirm: (reason: string) => void; onClose: () => void }> = ({ orderId, onConfirm, onClose }) => {
  const [reason, setReason] = useState('Customer Request');
  const reasons = ['Customer Request', 'Wrong Order', 'Out of Stock', 'Payment Issue', 'Duplicate Order', 'Other'];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-sm glass-panel rounded-3xl shadow-2xl border border-slate-200/50 dark:border-darkBorder p-6 flex flex-col gap-4 modal-enter">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center">
            <AlertTriangle size={20} className="text-rose-500" />
          </div>
          <div>
            <p className="font-extrabold text-sm text-slate-800 dark:text-white">Void Order {orderId}</p>
            <p className="text-xs text-slate-400">Select a reason for voiding this order</p>
          </div>
        </div>
        
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full p-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/60 dark:bg-darkCard/60 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-rose-500 transition-colors"
        >
          {reasons.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-darkBorder text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors hover:bg-slate-200 dark:hover:bg-slate-700">
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(reason)}
            className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold transition-all active:scale-[0.97] flex items-center justify-center gap-1.5"
          >
            <XCircle size={13} /> Void Order
          </button>
        </div>
      </div>
    </div>
  );
};

export const OrdersList: React.FC = () => {
  const { orders, updateOrderStatus, addNotification, voidOrder, refundOrder } = useRestaurantStore();

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'All' | 'Pending' | 'Cooking' | 'Ready' | 'Delivered' | 'Cancelled'>('All');
  const [dateFilter, setDateFilter] = useState('');
  
  // Phase 13: Modal states
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [voidTarget, setVoidTarget] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = 
        order.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        (order.customerName && order.customerName.toLowerCase().includes(orderSearch.toLowerCase())) ||
        order.grandTotal.toString().includes(orderSearch);
      const matchesStatus = orderStatusFilter === 'All' || order.status === orderStatusFilter;
      const matchesDate = !dateFilter || order.timestamp.startsWith(dateFilter);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, orderSearch, orderStatusFilter, dateFilter]);

  const handleVoidConfirm = (reason: string) => {
    if (!voidTarget) return;
    voidOrder(voidTarget, reason);
    setVoidTarget(null);
  };

  const handleRefund = (id: string) => {
    refundOrder(id);
    addNotification('payment', 'Refund Processed', `Order ${id} has been marked as Refunded.`);
  };

  const handleDeliverOrder = (id: string) => {
    updateOrderStatus(id, 'Delivered');
  };

  const renderTimeline = (status: Order['status']) => {
    const steps = ['Pending', 'Cooking', 'Ready', 'Delivered'];
    const activeIdx = steps.indexOf(status === 'Preparing' ? 'Cooking' : status);
    return (
      <div className="flex items-center gap-1 mt-1.5">
        {steps.map((step, idx) => {
          const isDone = idx <= activeIdx;
          const isCurrent = idx === activeIdx;
          const isCancelled = status === 'Cancelled';
          return (
            <React.Fragment key={step}>
              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold ${
                isCancelled ? 'bg-rose-500 text-white' :
                isCurrent   ? 'bg-brand-500 text-white animate-pulse' :
                isDone      ? 'bg-emerald-500 text-white' :
                'bg-slate-200 dark:bg-darkBorder text-slate-400'
              }`}>
                {isCancelled ? '✕' : isDone && !isCurrent ? '✓' : idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-0.5 flex-1 rounded-full ${
                  isCancelled ? 'bg-rose-300/40' :
                  idx < activeIdx ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-darkBorder'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-5 space-y-5 font-poppins text-slate-800 dark:text-slate-100 h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      
      {/* Filtering Row */}
      <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 glass-panel border border-slate-200/50 dark:border-darkBorder p-3.5 rounded-2xl">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={13} />
          <input
            type="text"
            placeholder="Search by ID, customer, amount..."
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-darkBorder/40 border border-transparent rounded-xl text-xs outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        
        {/* Phase 13: Date filter */}
        <div className="flex items-center gap-2">
          <Calendar size={13} className="text-slate-400 flex-shrink-0" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 bg-slate-100 dark:bg-darkBorder/60 border border-transparent rounded-xl text-xs font-semibold outline-none focus:border-brand-500 text-slate-800 dark:text-white"
          />
          {dateFilter && (
            <button onClick={() => setDateFilter('')} className="p-1 text-slate-400 hover:text-rose-500 transition-colors">
              <X size={13} />
            </button>
          )}
        </div>
        
        {/* Status filter */}
        <div className="flex items-center gap-2">
          <Filter className="text-slate-400 flex-shrink-0" size={13} />
          <select
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-100 dark:bg-darkBorder/60 border border-transparent rounded-xl text-xs font-semibold outline-none focus:border-brand-500"
          >
            <option value="All">All Orders</option>
            <option value="Pending">Pending</option>
            <option value="Cooking">Cooking</option>
            <option value="Ready">Ready</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Summary strip */}
      <div className="flex items-center gap-3 flex-shrink-0 text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium">{filteredOrders.length} orders</span>
        <span className="text-slate-300 dark:text-slate-700">·</span>
        <span className="font-bold text-brand-500 font-mono">₹{filteredOrders.reduce((s, o) => s + o.grandTotal, 0).toFixed(0)} total</span>
      </div>

      {/* Orders Grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-4 min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredOrders.map((order) => {
              const dateObj = new Date(order.timestamp);
              const formattedTime = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
              const formattedDate = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

              return (
                <motion.div 
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-panel border border-slate-200/40 dark:border-darkBorder/40 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col gap-2 hover:-translate-y-0.5"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <ClipboardList size={13} className="text-brand-500 flex-shrink-0" />
                        <span className="text-sm font-extrabold text-slate-800 dark:text-white">{order.id}</span>
                        {order.orderType && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-darkBorder text-slate-500 dark:text-slate-400">
                            {order.orderType}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        {formattedDate} · {formattedTime} · {order.cashierName}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`status-badge ${
                        order.status === 'Delivered' ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400' : 
                        order.status === 'Cancelled' ? 'bg-rose-500/12 text-rose-600 dark:text-rose-400' :
                        'bg-amber-500/12 text-amber-600 dark:text-amber-400 animate-pulse'
                      }`}>
                        {order.status}
                      </span>
                      {order.paymentStatus === 'Refunded' && (
                        <span className="status-badge bg-sky-500/12 text-sky-600 dark:text-sky-400">Refunded</span>
                      )}
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-1 text-xs border-t border-slate-100 dark:border-darkBorder/40 pt-2">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between font-medium">
                        <span className="text-slate-700 dark:text-slate-300 truncate">
                          <strong className="text-brand-500 font-extrabold">{item.quantity}×</strong>&nbsp;{item.menuItem.name}
                        </span>
                        <span className="font-mono text-slate-400 ml-2 flex-shrink-0">₹{((item.customPrice ?? item.menuItem.price) * item.quantity).toFixed(0)}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-[10px] text-slate-400">+{order.items.length - 3} more items</p>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="flex justify-between items-center border-t border-slate-100 dark:border-darkBorder/40 pt-2">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Grand Total</span>
                      <span className="font-extrabold text-brand-500 font-mono text-sm">₹{order.grandTotal.toFixed(0)}</span>
                    </div>
                    <span className={`status-badge ${
                      order.paymentMethod === 'UPI' ? 'bg-sky-500/10 text-sky-600' :
                      order.paymentMethod === 'Cash' ? 'bg-amber-500/10 text-amber-600' :
                      order.paymentMethod === 'Card' ? 'bg-emerald-500/10 text-emerald-600' :
                      'bg-purple-500/10 text-purple-600'
                    }`}>
                      {order.paymentMethod}
                    </span>
                  </div>

                  {/* Timeline */}
                  {order.status !== 'Cancelled' && (
                    <div className="text-[8px] font-bold text-slate-400 uppercase">
                      Progress {renderTimeline(order.status)}
                    </div>
                  )}

                  {/* Cancellation reason */}
                  {order.cancellationReason && (
                    <p className="text-[10px] text-rose-500 bg-rose-500/8 px-2 py-1 rounded-lg">
                      Void reason: {order.cancellationReason}
                    </p>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-1.5 pt-1 border-t border-slate-100 dark:border-darkBorder/40 mt-auto">
                    
                    {/* View detail */}
                    <button
                      onClick={() => setViewOrder(order)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-darkBorder/40 text-slate-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/20 transition-colors"
                      title="View Details"
                    >
                      <Eye size={12} />
                    </button>

                    {/* Phase 13: Reprint receipt */}
                    <button
                      onClick={() => setPrintOrder(order)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-darkBorder/40 text-slate-500 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/20 transition-colors"
                      title="Print Receipt"
                    >
                      <Printer size={12} />
                    </button>

                    {/* Phase 13: Refund button (for paid, non-cancelled orders) */}
                    {order.paymentStatus === 'Paid' && order.status === 'Delivered' && (
                      <button
                        onClick={() => handleRefund(order.id)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-darkBorder/40 text-slate-500 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors"
                        title="Process Refund"
                      >
                        <RefreshCw size={12} />
                      </button>
                    )}

                    {/* Deliver button */}
                    {order.status === 'Ready' && (
                      <button
                        onClick={() => handleDeliverOrder(order.id)}
                        className="flex-1 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 text-[10px] font-extrabold rounded-xl transition-all flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 size={10} /> Deliver
                      </button>
                    )}
                    
                    {/* Phase 13: Void order (replaces window.confirm) */}
                    {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                      <button
                        onClick={() => setVoidTarget(order.id)}
                        className="flex-1 py-1.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-[10px] font-extrabold rounded-xl transition-all flex items-center justify-center gap-1"
                      >
                        <XCircle size={10} /> Void
                      </button>
                    )}
                  </div>

                </motion.div>
              );
            })}
            {filteredOrders.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400">
                <ClipboardList size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold">No orders found</p>
                <p className="text-xs mt-1">Try adjusting your filters</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Phase 13: Order Detail Modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-3xl shadow-2xl border border-slate-200/50 dark:border-darkBorder overflow-hidden modal-enter">
            <div className="flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-darkBorder/50">
              <span className="font-extrabold text-sm text-slate-800 dark:text-white">Order Details — {viewOrder.id}</span>
              <button onClick={() => setViewOrder(null)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-darkBorder text-slate-400 transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh] no-scrollbar">
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  ['Order ID', viewOrder.id],
                  ['Status', viewOrder.status],
                  ['Type', viewOrder.orderType || 'Takeaway'],
                  ['Payment', viewOrder.paymentMethod],
                  ['Customer', viewOrder.customerName || 'Walk-in'],
                  ['Cashier', viewOrder.cashierName],
                  ['Date', new Date(viewOrder.timestamp).toLocaleDateString('en-IN')],
                  ['Time', new Date(viewOrder.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })],
                ].map(([label, value]) => (
                  <div key={label} className="bg-slate-100/60 dark:bg-darkBorder/30 rounded-xl p-2.5">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{label}</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
              
              <div>
                <p className="text-xs font-extrabold text-slate-500 uppercase mb-2">Order Items</p>
                <div className="space-y-2">
                  {viewOrder.items.map((item, idx) => {
                    const price = item.customPrice ?? item.menuItem.price;
                    return (
                      <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-100/60 dark:bg-darkBorder/25 rounded-xl text-xs">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">{item.quantity}× {item.menuItem.name}</p>
                          {item.specialInstructions && <p className="text-[10px] text-orange-500 italic">{item.specialInstructions}</p>}
                        </div>
                        <span className="font-extrabold font-mono text-brand-500">₹{(price * item.quantity).toFixed(0)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="space-y-1.5 text-xs border-t border-slate-200/50 dark:border-darkBorder/50 pt-3">
                <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>₹{viewOrder.subtotal.toFixed(0)}</span></div>
                {viewOrder.discount > 0 && <div className="flex justify-between text-rose-500"><span>Discount</span><span>-₹{viewOrder.discount.toFixed(0)}</span></div>}
                <div className="flex justify-between text-slate-500"><span>GST</span><span>₹{viewOrder.tax.toFixed(2)}</span></div>
                <div className="flex justify-between font-extrabold text-sm text-slate-800 dark:text-white">
                  <span>Grand Total</span>
                  <span className="text-brand-500 font-mono">₹{viewOrder.grandTotal.toFixed(0)}</span>
                </div>
              </div>
              
              <button
                onClick={() => { setPrintOrder(viewOrder); setViewOrder(null); }}
                className="w-full py-2.5 bg-gradient-to-r from-brand-500 to-primary-500 hover:from-brand-600 hover:to-primary-600 text-white rounded-xl text-xs font-extrabold transition-all active:scale-[0.97] flex items-center justify-center gap-2"
              >
                <Printer size={13} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 13: Print Receipt Modal */}
      {printOrder && <ReceiptModal order={printOrder} onClose={() => setPrintOrder(null)} />}

      {/* Phase 13: Void Order Modal */}
      {voidTarget && (
        <VoidModal 
          orderId={voidTarget}
          onConfirm={handleVoidConfirm}
          onClose={() => setVoidTarget(null)}
        />
      )}
    </div>
  );
};
