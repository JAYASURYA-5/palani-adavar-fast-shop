import { create } from 'zustand';
import {
  saveOrder,
  updateOrder,
  saveExpense,
  deleteExpenseFromDB,
  saveInventoryItem,
  saveInventoryLog,
  saveSupplier,
  saveCustomer,
  saveEmployee,
  saveMenuItem,
  deleteMenuItemFromDB,
  saveNotification,
  markNotificationReadInDB,
  clearAllNotificationsInDB,
  saveSettings,
} from '../firebase/firestoreService';

// Types
export interface MenuItem {
  id: string;
  name: string;
  category: 'Rice' | 'Chilli Chicken' | 'Extras';
  price: number;
  image: string;
  isAvailable: boolean;
  isPopular: boolean;
  isSpecial: boolean;
  isFavorite?: boolean;
  weightGrams?: number; // for chilli chicken variations
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions: string;
  customPrice?: number; // specifically for gravy custom price
  itemDiscount?: number; // Phase 13: per-item discount amount in ₹
}

export interface Order {
  id: string; // e.g., P-1001
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Split';
  splitDetails?: { cash: number; upi: number; card: number };
  status: 'Pending' | 'Preparing' | 'Cooking' | 'Ready' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Paid' | 'Unpaid' | 'Refunded';
  timestamp: string;
  cashierName: string;
  customerName?: string;
  timer: number; // minutes elapsed since order created
  priority: 'Normal' | 'High' | 'Urgent';
  // Phase 13 additions (optional — non-breaking)
  orderType?: 'Dine-in' | 'Takeaway' | 'Delivery';
  cancellationReason?: string;
  refundStatus?: 'None' | 'Refunded' | 'Partial';
}

export interface Expense {
  id: string;
  category: 
    | 'Chicken Purchase' 
    | 'Rice Purchase' 
    | 'Oil Purchase' 
    | 'Eggs' 
    | 'Water' 
    | 'Gas' 
    | 'Electricity' 
    | 'Salary' 
    | 'Rent' 
    | 'Maintenance' 
    | 'Miscellaneous';
  amount: number;
  date: string;
  notes: string;
  recordedBy: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  openingStock: number;
  purchased: number;
  used: number;
  remaining: number;
  lowStockThreshold: number;
}

export interface InventoryLog {
  id: string;
  itemId: string;
  itemName: string;
  type: 'Purchased' | 'Used' | 'Opening Adjust';
  quantity: number;
  date: string;
  notes: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  itemsSupplied: string[];
  outstandingBalance: number;
  lastPurchaseDate: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  visitCount: number;
  totalSpent: number;
  loyaltyPoints: number;
  favoriteItems: string[];
  lastVisitDate: string;
}

export interface Employee {
  id: string;
  name: string;
  role: 'Owner' | 'Manager' | 'Cashier' | 'Kitchen Staff';
  phone: string;
  email: string;
  attendanceStatus: 'Present' | 'Absent' | 'On Leave';
  salary: number;
  rating: number; // performance score out of 5
  joinedDate: string;
  avatar: string;
}

export interface Notification {
  id: string;
  type: 'low_stock' | 'new_order' | 'payment' | 'expense' | 'report';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface RestaurantSettings {
  name: string;
  logo: string;
  phone: string;
  address: string;
  upiId: string;
  currencySymbol: string;
  taxPercentage: number;
  receiptHeader: string;
  receiptFooter: string;
  printerName: string;
  language: string;
  autoPrintReceipt: boolean;
}

interface RestaurantState {
  // Authentication
  currentUser: Employee | null;
  setCurrentUser: (user: Employee | null) => void;
  
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Settings
  settings: RestaurantSettings;
  updateSettings: (settings: Partial<RestaurantSettings>) => void;
  
  // Menu
  menu: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleFavorite: (id: string) => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem, customPrice?: number) => void;
  updateCartItemQuantity: (index: number, quantity: number) => void;
  updateCartItemNotes: (index: number, notes: string) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  
  // Orders
  orders: Order[];
  createOrder: (paymentMethod: Order['paymentMethod'], splitDetails?: Order['splitDetails'], customerName?: string, discount?: number, orderType?: Order['orderType']) => Order;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  incrementOrderTimers: () => void;
  // Phase 13: void & refund
  voidOrder: (id: string, reason: string) => void;
  refundOrder: (id: string) => void;
  
  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'recordedBy' | 'date'>) => void;
  deleteExpense: (id: string) => void;
  
  // Inventory
  inventory: InventoryItem[];
  inventoryLogs: InventoryLog[];
  adjustStock: (itemId: string, type: 'Purchased' | 'Used', quantity: number, notes: string) => void;
  
  // Suppliers
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplierOutstanding: (id: string, amount: number) => void;
  
  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'visitCount' | 'totalSpent' | 'loyaltyPoints' | 'lastVisitDate'>) => void;
  addLoyaltyPoints: (phone: string, amountSpent: number) => void;
  
  // Employees
  employees: Employee[];
  updateEmployeeAttendance: (id: string, status: Employee['attendanceStatus']) => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (type: Notification['type'], title: string, message: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
}

// Initial Mock Data
const INITIAL_MENU: MenuItem[] = [
  // Rice Category
  { id: 'm1', name: 'Chicken Rice', category: 'Rice', price: 100, image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=300&q=80', isAvailable: true, isPopular: true, isSpecial: false, isFavorite: true },
  { id: 'm2', name: 'Egg Rice', category: 'Rice', price: 70, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=300&q=80', isAvailable: true, isPopular: false, isSpecial: false },
  { id: 'm3', name: 'Veg Rice', category: 'Rice', price: 50, image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=300&q=80', isAvailable: true, isPopular: false, isSpecial: false },
  { id: 'm4', name: 'White Rice', category: 'Rice', price: 50, image: 'https://images.unsplash.com/photo-1516685018646-549198525c1b?auto=format&fit=crop&w=300&q=80', isAvailable: true, isPopular: false, isSpecial: false },
  { id: 'm5', name: 'Chicken Sambar Rice', category: 'Rice', price: 50, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80', isAvailable: true, isPopular: true, isSpecial: true },
  
  // Chilli Chicken Category
  { id: 'm6', name: 'Chilli Chicken 100g', category: 'Chilli Chicken', price: 30, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80', isAvailable: true, isPopular: false, isSpecial: false, weightGrams: 100 },
  { id: 'm7', name: 'Chilli Chicken 150g', category: 'Chilli Chicken', price: 50, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80', isAvailable: true, isPopular: true, isSpecial: false, weightGrams: 150 },
  { id: 'm8', name: 'Chilli Chicken 250g', category: 'Chilli Chicken', price: 80, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80', isAvailable: true, isPopular: true, isSpecial: false, weightGrams: 250, isFavorite: true },
  { id: 'm9', name: 'Chilli Chicken 500g', category: 'Chilli Chicken', price: 160, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80', isAvailable: true, isPopular: false, isSpecial: true, weightGrams: 500 },
  { id: 'm10', name: 'Chilli Chicken 1kg', category: 'Chilli Chicken', price: 320, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80', isAvailable: true, isPopular: false, isSpecial: false, weightGrams: 1000 },
  
  // Extras Category
  { id: 'm11', name: 'Water Bottle 1L', category: 'Extras', price: 20, image: 'https://images.unsplash.com/photo-1608885898957-a599fb18e841?auto=format&fit=crop&w=300&q=80', isAvailable: true, isPopular: false, isSpecial: false },
  { id: 'm12', name: 'Water Bottle 2L', category: 'Extras', price: 30, image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=300&q=80', isAvailable: true, isPopular: false, isSpecial: false },
  { id: 'm13', name: 'Omelette Small', category: 'Extras', price: 20, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=300&q=80', isAvailable: true, isPopular: false, isSpecial: false },
  { id: 'm14', name: 'Omelette Medium', category: 'Extras', price: 30, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=300&q=80', isAvailable: true, isPopular: true, isSpecial: false, isFavorite: true },
  { id: 'm15', name: 'Omelette Large', category: 'Extras', price: 40, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=300&q=80', isAvailable: true, isPopular: false, isSpecial: false },
  { id: 'm16', name: 'Off Oil', category: 'Extras', price: 10, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80', isAvailable: true, isPopular: false, isSpecial: false },
  { id: 'm17', name: 'Gravy', category: 'Extras', price: 0, image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=300&q=80', isAvailable: true, isPopular: false, isSpecial: true } // Custom Price gravy
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Palani Andavar', role: 'Owner', phone: '+91 98765 43210', email: 'palani@andavarfastfood.com', attendanceStatus: 'Present', salary: 0, rating: 5.0, joinedDate: '2022-01-10', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
  { id: 'emp-2', name: 'Arumugam K', role: 'Manager', phone: '+91 98765 43211', email: 'arumugam@andavarfastfood.com', attendanceStatus: 'Present', salary: 18000, rating: 4.8, joinedDate: '2023-04-15', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
  { id: 'emp-3', name: 'Muthu Swamy', role: 'Cashier', phone: '+91 98765 43212', email: 'muthu@andavarfastfood.com', attendanceStatus: 'Present', salary: 12000, rating: 4.5, joinedDate: '2024-02-01', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
  { id: 'emp-4', name: 'Selvam R', role: 'Kitchen Staff', phone: '+91 98765 43213', email: 'selvam@andavarfastfood.com', attendanceStatus: 'Present', salary: 10000, rating: 4.6, joinedDate: '2023-09-20', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80' }
];

const INITIAL_CUSTOMERS: Customer[] = [];

const INITIAL_SUPPLIERS: Supplier[] = [];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'i-1', name: 'Chicken', unit: 'kg', openingStock: 0, purchased: 0, used: 0, remaining: 0, lowStockThreshold: 10 },
  { id: 'i-2', name: 'Rice', unit: 'kg', openingStock: 0, purchased: 0, used: 0, remaining: 0, lowStockThreshold: 20 },
  { id: 'i-3', name: 'Eggs', unit: 'pcs', openingStock: 0, purchased: 0, used: 0, remaining: 0, lowStockThreshold: 50 },
  { id: 'i-4', name: 'Sunflower Oil', unit: 'L', openingStock: 0, purchased: 0, used: 0, remaining: 0, lowStockThreshold: 8 },
  { id: 'i-5', name: 'Water Bottles 1L', unit: 'bottles', openingStock: 0, purchased: 0, used: 0, remaining: 0, lowStockThreshold: 15 },
  { id: 'i-6', name: 'Gas Cylinders', unit: 'units', openingStock: 0, purchased: 0, used: 0, remaining: 0, lowStockThreshold: 2 }
];

const INITIAL_EXPENSES: Expense[] = [];

const INITIAL_ORDERS: Order[] = [];

const INITIAL_NOTIFICATIONS: Notification[] = [];

// One-time session flag set by the landing page login.
// Read synchronously here so currentUser is set BEFORE the first render.
// The key is deleted immediately after reading, so any page refresh returns null.
const restoreAdminSession = (): Employee | null => {
  try {
    const raw = sessionStorage.getItem('palani_admin_session');
    if (!raw) return null;
    sessionStorage.removeItem('palani_admin_session'); // consume once — refresh clears auth
    const { name } = JSON.parse(raw) as { name: string };
    return INITIAL_EMPLOYEES.find((e) => e.name === name) ?? null;
  } catch {
    return null;
  }
};

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  // Authentication — null on every fresh load; only set via the landing-page one-time flag
  currentUser: restoreAdminSession(),
  setCurrentUser: (user) => {
    // No storage persistence — auth lives in memory only.
    // Refreshing the page always returns to the landing page.
    set({ currentUser: user });
  },
  
  // Theme
  isDarkMode: true, // Default to dark mode for premium feel
  toggleDarkMode: () => set((state) => {
    const nextMode = !state.isDarkMode;
    if (nextMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    return { isDarkMode: nextMode };
  }),
  
  // Settings
  settings: {
    name: 'Palani Andavar Fast Food',
    logo: '🔥',
    phone: '+91 94432 10850',
    address: 'Opp. Bus Stand, Udumalpet Road, Pollachi - 642001',
    upiId: 'palaniandavar@okaxis',
    currencySymbol: '₹',
    taxPercentage: 5, // 5% GST
    receiptHeader: 'PALANI ANDAVAR FAST FOOD\nTaste that lingers, speed that fits!',
    receiptFooter: 'Thank you for your visit!\nVisit again to satisfy your cravings.',
    printerName: 'TSP100 POS Thermal Printer',
    language: 'English',
    autoPrintReceipt: true
  },
  // Menu
  menu: INITIAL_MENU,
  addMenuItem: (item) => set((state) => {
    const newItem = { ...item, id: `m-${Date.now()}` };
    saveMenuItem(newItem).catch(console.error);
    return { menu: [...state.menu, newItem] };
  }),
  updateMenuItem: (id, updatedFields) => set((state) => {
    const updatedMenu = state.menu.map((item) => item.id === id ? { ...item, ...updatedFields } : item);
    const updatedItem = updatedMenu.find(i => i.id === id);
    if (updatedItem) saveMenuItem(updatedItem).catch(console.error);
    return { menu: updatedMenu };
  }),
  deleteMenuItem: (id) => set((state) => {
    deleteMenuItemFromDB(id).catch(console.error);
    return { menu: state.menu.filter((item) => item.id !== id) };
  }),
  toggleFavorite: (id) => set((state) => {
    const updatedMenu = state.menu.map((item) => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item);
    const updatedItem = updatedMenu.find(i => i.id === id);
    if (updatedItem) saveMenuItem(updatedItem).catch(console.error);
    return { menu: updatedMenu };
  }),
  
  // Cart
  cart: [],
  addToCart: (menuItem, customPrice) => set((state) => {
    const existingIndex = state.cart.findIndex(
      (item) => item.menuItem.id === menuItem.id && 
                (!customPrice || item.customPrice === customPrice)
    );
    
    if (existingIndex > -1) {
      const nextCart = [...state.cart];
      nextCart[existingIndex].quantity += 1;
      return { cart: nextCart };
    }
    
    return {
      cart: [...state.cart, { menuItem, quantity: 1, specialInstructions: '', customPrice }]
    };
  }),
  updateCartItemQuantity: (index, quantity) => set((state) => {
    if (quantity <= 0) {
      return { cart: state.cart.filter((_, i) => i !== index) };
    }
    const nextCart = [...state.cart];
    nextCart[index].quantity = quantity;
    return { cart: nextCart };
  }),
  updateCartItemNotes: (index, notes) => set((state) => {
    const nextCart = [...state.cart];
    nextCart[index].specialInstructions = notes;
    return { cart: nextCart };
  }),
  removeFromCart: (index) => set((state) => ({
    cart: state.cart.filter((_, i) => i !== index)
  })),
  clearCart: () => set({ cart: [] }),
  
  // Orders
  orders: INITIAL_ORDERS,
  createOrder: (paymentMethod, splitDetails, customerName, discount = 0, orderType = 'Takeaway') => {
    const state = get();
    const cart = state.cart;
    
    if (cart.length === 0) {
      throw new Error("Cart is empty");
    }
    
    // Subtotal calculations
    const subtotal = cart.reduce((acc, item) => {
      const price = item.customPrice !== undefined ? item.customPrice : item.menuItem.price;
      return acc + (price * item.quantity);
    }, 0);
    
    const tax = Math.round(((subtotal - discount) * (state.settings.taxPercentage / 100)) * 100) / 100;
    const grandTotal = subtotal - discount + tax;
    
    const orderId = `P-${1000 + state.orders.length + 1}`;
    
    const newOrder: Order = {
      id: orderId,
      items: [...cart],
      subtotal,
      discount,
      tax,
      grandTotal,
      paymentMethod,
      splitDetails,
      status: 'Pending',
      paymentStatus: 'Paid',
      timestamp: new Date().toISOString(),
      cashierName: state.currentUser?.name || 'Cashier',
      customerName,
      timer: 0,
      priority: cart.some(i => i.menuItem.category === 'Rice' && i.menuItem.isSpecial) ? 'High' : 'Normal',
      orderType: orderType || 'Takeaway',
      refundStatus: 'None'
    };
    
    // Deduct stock for inventory on items sold
    // Simplified rule: Chicken Rice uses 100g chicken, Egg rice uses 2 eggs, veg rice uses 100g rice, Chilli chicken uses exact weight in g.
    cart.forEach(item => {
      const qty = item.quantity;
      if (item.menuItem.category === 'Rice') {
        if (item.menuItem.name.includes('Chicken')) {
          state.adjustStock('i-1', 'Used', 0.1 * qty, `POS sale: ${orderId}`); // Chicken
          state.adjustStock('i-2', 'Used', 0.1 * qty, `POS sale: ${orderId}`); // Rice
        } else if (item.menuItem.name.includes('Egg')) {
          state.adjustStock('i-3', 'Used', 2 * qty, `POS sale: ${orderId}`); // 2 eggs
          state.adjustStock('i-2', 'Used', 0.1 * qty, `POS sale: ${orderId}`); // Rice
        } else {
          state.adjustStock('i-2', 'Used', 0.1 * qty, `POS sale: ${orderId}`); // Rice
        }
      } else if (item.menuItem.category === 'Chilli Chicken') {
        const grams = item.menuItem.weightGrams || 100;
        state.adjustStock('i-1', 'Used', (grams / 1000) * qty, `POS sale: ${orderId}`);
      } else if (item.menuItem.category === 'Extras') {
        if (item.menuItem.name.includes('Water Bottle 1L')) {
          state.adjustStock('i-5', 'Used', 1 * qty, `POS sale: ${orderId}`);
        } else if (item.menuItem.name.includes('Omelette')) {
          const eggs = item.menuItem.name.includes('Large') ? 3 : item.menuItem.name.includes('Medium') ? 2 : 1;
          state.adjustStock('i-3', 'Used', eggs * qty, `POS sale: ${orderId}`);
        }
      }
    });
    
    // Update customer spending metrics if exists
    if (customerName) {
      const match = state.customers.find(c => c.name.toLowerCase() === customerName.toLowerCase());
      if (match) {
        set((state) => ({
          customers: state.customers.map(c => c.id === match.id ? {
            ...c,
            visitCount: c.visitCount + 1,
            totalSpent: c.totalSpent + grandTotal,
            loyaltyPoints: c.loyaltyPoints + Math.floor(grandTotal / 10),
            lastVisitDate: new Date().toISOString().split('T')[0]
          } : c)
        }));
      }
    }
    
    // Add Notification
    state.addNotification('new_order', 'New Order Placed', `Order ${orderId} placed for ₹${grandTotal.toFixed(0)}.`);
    
    // Persist to Firestore
    saveOrder(newOrder).catch(console.error);

    set((state) => ({
      orders: [newOrder, ...state.orders],
      cart: [] // Clear shopping cart
    }));
    
    return newOrder;
  },
  updateOrderStatus: (id, status) => set((state) => {
    const updatedOrders = state.orders.map((order) => {
      if (order.id === id) {
        // Trigger alerts when ready
        if (status === 'Ready') {
          state.addNotification('new_order', 'Order Ready', `Order ${id} is ready for pick-up/delivery.`);
        }
        return { ...order, status };
      }
      return order;
    });
    // Persist status change to Firestore
    updateOrder(id, { status }).catch(console.error);
    return { orders: updatedOrders };
  }),
  // Phase 13: Void order with reason
  voidOrder: (id, reason) => set((state) => {
    const updatedOrders = state.orders.map(order => {
      if (order.id === id) {
        state.addNotification('report', 'Order Voided', `Order ${id} was voided. Reason: ${reason}`);
        return { ...order, status: 'Cancelled' as const, cancellationReason: reason };
      }
      return order;
    });
    updateOrder(id, { status: 'Cancelled', cancellationReason: reason }).catch(console.error);
    return { orders: updatedOrders };
  }),
  // Phase 13: Refund order
  refundOrder: (id) => set((state) => {
    const updatedOrders = state.orders.map(order => {
      if (order.id === id) {
        state.addNotification('payment', 'Order Refunded', `Order ${id} has been marked as Refunded.`);
        return { ...order, paymentStatus: 'Refunded' as const, refundStatus: 'Refunded' as const };
      }
      return order;
    });
    updateOrder(id, { paymentStatus: 'Refunded', refundStatus: 'Refunded' }).catch(console.error);
    return { orders: updatedOrders };
  }),
  incrementOrderTimers: () => set((state) => ({
    orders: state.orders.map((order) => {
      if (order.status !== 'Delivered' && order.status !== 'Cancelled') {
        return { ...order, timer: order.timer + 1 };
      }
      return order;
    })
  })),
  
  // Expenses
  expenses: INITIAL_EXPENSES,
  addExpense: (expense) => set((state) => {
    const newExpense: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      recordedBy: state.currentUser?.name || 'Owner',
      date: new Date().toISOString().split('T')[0]
    };
    
    // Deduct from supplier outstanding if matching supplier
    if (expense.category === 'Chicken Purchase') {
      const sup = state.suppliers.find(s => s.name.includes('Chicken') || s.name.includes('Broiler'));
      if (sup) {
        state.updateSupplierOutstanding(sup.id, -expense.amount);
      }
    } else if (expense.category === 'Rice Purchase') {
      const sup = state.suppliers.find(s => s.name.includes('Rice'));
      if (sup) {
        state.updateSupplierOutstanding(sup.id, -expense.amount);
      }
    }
    
    // Add stock automatically to inventory if it is a major purchase
    if (expense.category === 'Chicken Purchase') {
      state.adjustStock('i-1', 'Purchased', expense.amount / 150, 'Chicken Purchase Stock addition'); // e.g. ₹150 per kg
    } else if (expense.category === 'Rice Purchase') {
      state.adjustStock('i-2', 'Purchased', expense.amount / 50, 'Rice Purchase Stock addition'); // e.g. ₹50 per kg
    } else if (expense.category === 'Eggs') {
      state.adjustStock('i-3', 'Purchased', Math.floor(expense.amount / 4), 'Egg Purchase Stock addition'); // e.g. ₹4 per egg
    }
    
    state.addNotification('expense', 'Expense Added', `Expense category "${expense.category}" of ₹${expense.amount} registered.`);
    
    // Persist to Firestore
    saveExpense(newExpense).catch(console.error);

    return { expenses: [newExpense, ...state.expenses] };
  }),
  deleteExpense: (id) => set((state) => {
    deleteExpenseFromDB(id).catch(console.error);
    return { expenses: state.expenses.filter((e) => e.id !== id) };
  }),
  
  // Inventory
  inventory: INITIAL_INVENTORY,
  inventoryLogs: [],
  adjustStock: (itemId, type, quantity, notes) => set((state) => {
    const updatedInventory = state.inventory.map((item) => {
      if (item.id === itemId) {
        const purchasedDiff = type === 'Purchased' ? quantity : 0;
        const usedDiff = type === 'Used' ? quantity : 0;
        const remaining = item.remaining + purchasedDiff - usedDiff;
        
        // Low Stock triggers
        if (remaining <= item.lowStockThreshold) {
          state.addNotification('low_stock', 'Low Stock Warning', `${item.name} is running low (Remaining: ${remaining.toFixed(1)} ${item.unit}).`);
        }
        
        const updatedItem = {
          ...item,
          purchased: item.purchased + purchasedDiff,
          used: item.used + usedDiff,
          remaining
        };
        // Persist inventory item to Firestore
        saveInventoryItem(updatedItem).catch(console.error);
        return updatedItem;
      }
      return item;
    });
    
    const targetItem = state.inventory.find(i => i.id === itemId);
    const newLog: InventoryLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      itemId,
      itemName: targetItem?.name || 'Unknown',
      type,
      quantity,
      date: new Date().toISOString(),
      notes
    };
    // Persist log to Firestore
    saveInventoryLog(newLog).catch(console.error);
    
    return {
      inventory: updatedInventory,
      inventoryLogs: [newLog, ...state.inventoryLogs]
    };
  }),
  
  // Suppliers
  suppliers: INITIAL_SUPPLIERS,
  addSupplier: (supplier) => set((state) => {
    const newSupplier = { ...supplier, id: `s-${Date.now()}` };
    saveSupplier(newSupplier).catch(console.error);
    return { suppliers: [...state.suppliers, newSupplier] };
  }),
  updateSupplierOutstanding: (id, amount) => set((state) => {
    const updatedSuppliers = state.suppliers.map(s => s.id === id ? { ...s, outstandingBalance: Math.max(0, s.outstandingBalance + amount) } : s);
    const updated = updatedSuppliers.find(s => s.id === id);
    if (updated) saveSupplier(updated).catch(console.error);
    return { suppliers: updatedSuppliers };
  }),
  
  // Customers
  customers: INITIAL_CUSTOMERS,
  addCustomer: (customer) => set((state) => {
    const newCustomer = {
      ...customer,
      id: `c-${Date.now()}`,
      visitCount: 1,
      totalSpent: 0,
      loyaltyPoints: 0,
      lastVisitDate: new Date().toISOString().split('T')[0]
    };
    saveCustomer(newCustomer).catch(console.error);
    return { customers: [...state.customers, newCustomer] };
  }),
  addLoyaltyPoints: (phone, amountSpent) => set((state) => {
    const updatedCustomers = state.customers.map(c => c.phone === phone ? {
      ...c,
      loyaltyPoints: c.loyaltyPoints + Math.floor(amountSpent / 10)
    } : c);
    const updated = updatedCustomers.find(c => c.phone === phone);
    if (updated) saveCustomer(updated).catch(console.error);
    return { customers: updatedCustomers };
  }),
  
  // Employees
  employees: INITIAL_EMPLOYEES,
  updateEmployeeAttendance: (id, attendanceStatus) => set((state) => {
    const updatedEmployees = state.employees.map(emp => emp.id === id ? { ...emp, attendanceStatus } : emp);
    const updated = updatedEmployees.find(e => e.id === id);
    if (updated) saveEmployee(updated).catch(console.error);
    return { employees: updatedEmployees };
  }),
  
  // Notifications
  notifications: INITIAL_NOTIFICATIONS,
  addNotification: (type, title, message) => set((state) => {
    const newNotification: Notification = {
      id: `n-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    saveNotification(newNotification).catch(console.error);
    return { notifications: [newNotification, ...state.notifications] };
  }),
  markNotificationAsRead: (id) => set((state) => {
    markNotificationReadInDB(id).catch(console.error);
    return { notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n) };
  }),
  markAllNotificationsAsRead: () => set((state) => {
    // Update each notification in Firestore
    state.notifications.forEach(n => {
      if (!n.isRead) markNotificationReadInDB(n.id).catch(console.error);
    });
    return { notifications: state.notifications.map(n => ({ ...n, isRead: true })) };
  }),
  clearNotifications: () => {
    clearAllNotificationsInDB().catch(console.error);
    set({ notifications: [] });
  },

  // Override updateSettings to also persist to Firestore
  updateSettings: (newSettings) => set((state) => {
    const merged = { ...state.settings, ...newSettings };
    saveSettings(merged).catch(console.error);
    return { settings: merged };
  }),
}));
