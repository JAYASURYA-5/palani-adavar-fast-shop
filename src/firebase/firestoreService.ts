/**
 * Firestore Service for Palani Andavar Fast Food
 * Handles all database operations: orders, expenses, inventory, etc.
 */

import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import type {
  Order,
  Expense,
  InventoryItem,
  InventoryLog,
  Supplier,
  Customer,
  Employee,
  MenuItem,
  Notification,
  RestaurantSettings,
} from '../store/restaurantStore';

// ─── Collection Names ──────────────────────────────────────────────────────────
const COLLECTIONS = {
  ORDERS: 'orders',
  EXPENSES: 'expenses',
  INVENTORY: 'inventory',
  INVENTORY_LOGS: 'inventoryLogs',
  SUPPLIERS: 'suppliers',
  CUSTOMERS: 'customers',
  EMPLOYEES: 'employees',
  MENU: 'menu',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
} as const;

// ─── Helper: Strip undefined fields (Firestore doesn't allow undefined) ────────
function stripUndefined<T extends object>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

// ─── Error type alias ──────────────────────────────────────────────────────────
type OnError = (error: Error) => void;

// ══════════════════════════════════════════════════════════════════════════════
//  ORDERS
// ══════════════════════════════════════════════════════════════════════════════

/** Save a new order to Firestore */
export async function saveOrder(order: Order): Promise<void> {
  const ref = doc(db, COLLECTIONS.ORDERS, order.id);
  await setDoc(ref, { ...stripUndefined(order), _createdAt: serverTimestamp() });
}

/** Update specific fields of an existing order */
export async function updateOrder(id: string, fields: Partial<Order>): Promise<void> {
  const ref = doc(db, COLLECTIONS.ORDERS, id);
  await updateDoc(ref, { ...stripUndefined(fields as object), _updatedAt: serverTimestamp() });
}

/** Real-time listener for all orders */
export function listenToOrders(
  callback: (orders: Order[]) => void,
  onError?: OnError
): Unsubscribe {
  const q = query(collection(db, COLLECTIONS.ORDERS), orderBy('timestamp', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((d) => {
        const data = d.data();
        const { _createdAt, _updatedAt, ...rest } = data;
        return rest as Order;
      });
      callback(orders);
    },
    (error) => {
      console.error('[Firestore] listenToOrders error:', error.code, error.message);
      onError?.(error);
    }
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  EXPENSES
// ══════════════════════════════════════════════════════════════════════════════

/** Save a new expense to Firestore */
export async function saveExpense(expense: Expense): Promise<void> {
  const ref = doc(db, COLLECTIONS.EXPENSES, expense.id);
  await setDoc(ref, { ...stripUndefined(expense), _createdAt: serverTimestamp() });
}

/** Delete an expense from Firestore */
export async function deleteExpenseFromDB(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.EXPENSES, id));
}

/** Real-time listener for all expenses */
export function listenToExpenses(
  callback: (expenses: Expense[]) => void,
  onError?: OnError
): Unsubscribe {
  const q = query(collection(db, COLLECTIONS.EXPENSES), orderBy('date', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const expenses = snapshot.docs.map((d) => {
        const { _createdAt, ...rest } = d.data();
        return rest as Expense;
      });
      callback(expenses);
    },
    (error) => {
      console.error('[Firestore] listenToExpenses error:', error.code, error.message);
      onError?.(error);
    }
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  INVENTORY
// ══════════════════════════════════════════════════════════════════════════════

/** Save / update an inventory item */
export async function saveInventoryItem(item: InventoryItem): Promise<void> {
  const ref = doc(db, COLLECTIONS.INVENTORY, item.id);
  await setDoc(ref, stripUndefined(item), { merge: true });
}

/** Save inventory log entry */
export async function saveInventoryLog(log: InventoryLog): Promise<void> {
  const ref = doc(db, COLLECTIONS.INVENTORY_LOGS, log.id);
  await setDoc(ref, { ...stripUndefined(log), _createdAt: serverTimestamp() });
}

/** Real-time listener for inventory */
export function listenToInventory(
  callback: (items: InventoryItem[]) => void,
  onError?: OnError
): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTIONS.INVENTORY),
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as InventoryItem);
      callback(items);
    },
    (error) => {
      console.error('[Firestore] listenToInventory error:', error.code, error.message);
      onError?.(error);
    }
  );
}

/** Real-time listener for inventory logs */
export function listenToInventoryLogs(
  callback: (logs: InventoryLog[]) => void,
  onError?: OnError
): Unsubscribe {
  const q = query(collection(db, COLLECTIONS.INVENTORY_LOGS), orderBy('date', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const logs = snapshot.docs.map((d) => {
        const { _createdAt, ...rest } = d.data();
        return rest as InventoryLog;
      });
      callback(logs);
    },
    (error) => {
      console.error('[Firestore] listenToInventoryLogs error:', error.code, error.message);
      onError?.(error);
    }
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  SUPPLIERS
// ══════════════════════════════════════════════════════════════════════════════

/** Save a supplier */
export async function saveSupplier(supplier: Supplier): Promise<void> {
  const ref = doc(db, COLLECTIONS.SUPPLIERS, supplier.id);
  await setDoc(ref, stripUndefined(supplier), { merge: true });
}

/** Real-time listener for suppliers */
export function listenToSuppliers(
  callback: (suppliers: Supplier[]) => void,
  onError?: OnError
): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTIONS.SUPPLIERS),
    (snapshot) => {
      callback(snapshot.docs.map((d) => d.data() as Supplier));
    },
    (error) => {
      console.error('[Firestore] listenToSuppliers error:', error.code, error.message);
      onError?.(error);
    }
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  CUSTOMERS
// ══════════════════════════════════════════════════════════════════════════════

/** Save a customer */
export async function saveCustomer(customer: Customer): Promise<void> {
  const ref = doc(db, COLLECTIONS.CUSTOMERS, customer.id);
  await setDoc(ref, stripUndefined(customer), { merge: true });
}

/** Real-time listener for customers */
export function listenToCustomers(
  callback: (customers: Customer[]) => void,
  onError?: OnError
): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTIONS.CUSTOMERS),
    (snapshot) => {
      callback(snapshot.docs.map((d) => d.data() as Customer));
    },
    (error) => {
      console.error('[Firestore] listenToCustomers error:', error.code, error.message);
      onError?.(error);
    }
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  EMPLOYEES
// ══════════════════════════════════════════════════════════════════════════════

/** Save an employee (used for attendance update sync) */
export async function saveEmployee(employee: Employee): Promise<void> {
  const ref = doc(db, COLLECTIONS.EMPLOYEES, employee.id);
  await setDoc(ref, stripUndefined(employee), { merge: true });
}

/** Bootstrap initial employees if collection is empty */
export async function bootstrapEmployees(employees: Employee[]): Promise<void> {
  const snapshot = await getDocs(collection(db, COLLECTIONS.EMPLOYEES));
  if (snapshot.empty) {
    const batch = writeBatch(db);
    employees.forEach((emp) => {
      batch.set(doc(db, COLLECTIONS.EMPLOYEES, emp.id), stripUndefined(emp));
    });
    await batch.commit();
  }
}

/** Real-time listener for employees */
export function listenToEmployees(
  callback: (employees: Employee[]) => void,
  onError?: OnError
): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTIONS.EMPLOYEES),
    (snapshot) => {
      callback(snapshot.docs.map((d) => d.data() as Employee));
    },
    (error) => {
      console.error('[Firestore] listenToEmployees error:', error.code, error.message);
      onError?.(error);
    }
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MENU
// ══════════════════════════════════════════════════════════════════════════════

/** Save a menu item */
export async function saveMenuItem(item: MenuItem): Promise<void> {
  const ref = doc(db, COLLECTIONS.MENU, item.id);
  await setDoc(ref, stripUndefined(item), { merge: true });
}

/** Delete a menu item */
export async function deleteMenuItemFromDB(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.MENU, id));
}

/** Bootstrap initial menu if collection is empty */
export async function bootstrapMenu(menu: MenuItem[]): Promise<void> {
  const snapshot = await getDocs(collection(db, COLLECTIONS.MENU));
  if (snapshot.empty) {
    const batch = writeBatch(db);
    menu.forEach((item) => {
      batch.set(doc(db, COLLECTIONS.MENU, item.id), stripUndefined(item));
    });
    await batch.commit();
  }
}

/** Real-time listener for menu */
export function listenToMenu(
  callback: (menu: MenuItem[]) => void,
  onError?: OnError
): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTIONS.MENU),
    (snapshot) => {
      callback(snapshot.docs.map((d) => d.data() as MenuItem));
    },
    (error) => {
      console.error('[Firestore] listenToMenu error:', error.code, error.message);
      onError?.(error);
    }
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════════

/** Save a notification */
export async function saveNotification(notification: Notification): Promise<void> {
  const ref = doc(db, COLLECTIONS.NOTIFICATIONS, notification.id);
  await setDoc(ref, { ...stripUndefined(notification), _createdAt: serverTimestamp() });
}

/** Update notification read status */
export async function markNotificationReadInDB(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id), { isRead: true });
}

/** Clear all notifications */
export async function clearAllNotificationsInDB(): Promise<void> {
  const snapshot = await getDocs(collection(db, COLLECTIONS.NOTIFICATIONS));
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

/** Real-time listener for notifications */
export function listenToNotifications(
  callback: (notifications: Notification[]) => void,
  onError?: OnError
): Unsubscribe {
  const q = query(collection(db, COLLECTIONS.NOTIFICATIONS), orderBy('timestamp', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs.map((d) => {
        const { _createdAt, ...rest } = d.data();
        return rest as Notification;
      });
      callback(notifications);
    },
    (error) => {
      console.error('[Firestore] listenToNotifications error:', error.code, error.message);
      onError?.(error);
    }
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  SETTINGS
// ══════════════════════════════════════════════════════════════════════════════

/** Save restaurant settings */
export async function saveSettings(settings: RestaurantSettings): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.SETTINGS, 'restaurant'), stripUndefined(settings), { merge: true });
}

/** Get restaurant settings once */
export async function getSettings(): Promise<RestaurantSettings | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'restaurant'));
  return snap.exists() ? (snap.data() as RestaurantSettings) : null;
}

// ══════════════════════════════════════════════════════════════════════════════
//  BOOTSTRAP INVENTORY (first-time setup)
// ══════════════════════════════════════════════════════════════════════════════

/** Bootstrap initial inventory if empty */
export async function bootstrapInventory(items: InventoryItem[]): Promise<void> {
  const snapshot = await getDocs(collection(db, COLLECTIONS.INVENTORY));
  if (snapshot.empty) {
    const batch = writeBatch(db);
    items.forEach((item) => {
      batch.set(doc(db, COLLECTIONS.INVENTORY, item.id), stripUndefined(item));
    });
    await batch.commit();
  }
}
