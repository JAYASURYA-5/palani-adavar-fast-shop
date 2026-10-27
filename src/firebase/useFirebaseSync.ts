/**
 * useFirebaseSync Hook
 * Initializes real-time Firestore listeners and syncs data into the Zustand store.
 * - Errors from onSnapshot are caught and surfaced (previously silent failures).
 * - All data is automatically re-fetched on every page refresh via onSnapshot.
 * Call this hook once at the top-level App component.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRestaurantStore } from '../store/restaurantStore';
import {
  listenToOrders,
  listenToExpenses,
  listenToInventory,
  listenToInventoryLogs,
  listenToSuppliers,
  listenToCustomers,
  listenToEmployees,
  listenToMenu,
  listenToNotifications,
  bootstrapMenu,
  bootstrapEmployees,
  bootstrapInventory,
  getSettings,
} from '../firebase/firestoreService';

export interface FirebaseSyncStatus {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useFirebaseSync(): FirebaseSyncStatus {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track if bootstrap has been done to avoid re-running on hot reloads
  const bootstrapped = useRef(false);
  // Track active unsubscribers so we can clean them up
  const unsubscribersRef = useRef<(() => void)[]>([]);

  // ─── Zustand store setters (bypass action side-effects) ───────────────────
  const setOrders       = (v: ReturnType<typeof useRestaurantStore.getState>['orders'])       => useRestaurantStore.setState({ orders: v });
  const setExpenses     = (v: ReturnType<typeof useRestaurantStore.getState>['expenses'])     => useRestaurantStore.setState({ expenses: v });
  const setInventory    = (v: ReturnType<typeof useRestaurantStore.getState>['inventory'])    => useRestaurantStore.setState({ inventory: v });
  const setInventoryLogs= (v: ReturnType<typeof useRestaurantStore.getState>['inventoryLogs'])=> useRestaurantStore.setState({ inventoryLogs: v });
  const setSuppliers    = (v: ReturnType<typeof useRestaurantStore.getState>['suppliers'])    => useRestaurantStore.setState({ suppliers: v });
  const setCustomers    = (v: ReturnType<typeof useRestaurantStore.getState>['customers'])    => useRestaurantStore.setState({ customers: v });
  const setEmployees    = (v: ReturnType<typeof useRestaurantStore.getState>['employees'])    => useRestaurantStore.setState({ employees: v });
  const setMenu         = (v: ReturnType<typeof useRestaurantStore.getState>['menu'])         => useRestaurantStore.setState({ menu: v });
  const setNotifications= (v: ReturnType<typeof useRestaurantStore.getState>['notifications'])=> useRestaurantStore.setState({ notifications: v });
  const updateSettings  = useRestaurantStore((s) => s.updateSettings);

  useEffect(() => {
    let isMounted = true;

    const handleError = (label: string) => (err: Error) => {
      if (!isMounted) return;
      console.error(`[Firebase Sync] ${label}:`, err.message);
      // Only surface the first error to avoid overwriting with repeated errors
      setError((prev) => prev ?? `${label}: ${err.message} — Check Firestore rules or project ID.`);
      setIsConnected(false);
    };

    const init = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // ── 1. Bootstrap static data on first app launch ─────────────────────
        // Only writes to Firestore if the collections are empty (new project)
        if (!bootstrapped.current) {
          bootstrapped.current = true;
          const store = useRestaurantStore.getState();
          await Promise.all([
            bootstrapMenu(store.menu),
            bootstrapEmployees(store.employees),
            bootstrapInventory(store.inventory),
          ]);

          // Load persisted settings from Firestore
          const savedSettings = await getSettings();
          if (savedSettings && isMounted) {
            updateSettings(savedSettings);
          }
        }

        // ── 2. Attach real-time listeners (auto re-fetch on every page refresh)
        // Each onSnapshot fires immediately with current Firestore data,
        // then fires again whenever data changes.

        const unsubs = [
          listenToOrders(
            (orders)        => { if (isMounted) setOrders(orders); },
            handleError('Orders')
          ),
          listenToExpenses(
            (expenses)      => { if (isMounted) setExpenses(expenses); },
            handleError('Expenses')
          ),
          listenToInventory(
            (inventory)     => { if (isMounted) setInventory(inventory); },
            handleError('Inventory')
          ),
          listenToInventoryLogs(
            (logs)          => { if (isMounted) setInventoryLogs(logs); },
            handleError('InventoryLogs')
          ),
          listenToSuppliers(
            (suppliers)     => { if (isMounted) setSuppliers(suppliers); },
            handleError('Suppliers')
          ),
          listenToCustomers(
            (customers)     => { if (isMounted) setCustomers(customers); },
            handleError('Customers')
          ),
          listenToEmployees(
            (employees)     => { if (isMounted) setEmployees(employees); },
            handleError('Employees')
          ),
          listenToMenu(
            (menu)          => { if (isMounted) setMenu(menu); },
            handleError('Menu')
          ),
          listenToNotifications(
            (notifications) => { if (isMounted) setNotifications(notifications); },
            handleError('Notifications')
          ),
        ];

        unsubscribersRef.current = unsubs;

        if (isMounted) {
          setIsConnected(true);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[Firebase] Initialization error:', err);
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to connect to Firebase';
          setError(msg + ' — Ensure Firestore is enabled and the project ID is correct.');
          setIsLoading(false);
          setIsConnected(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
      // Unsubscribe all real-time listeners on unmount
      unsubscribersRef.current.forEach((unsub) => unsub());
      unsubscribersRef.current = [];
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { isConnected, isLoading, error };
}
