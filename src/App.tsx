import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useRestaurantStore } from './store/restaurantStore';
import { useFirebaseSync } from './firebase/useFirebaseSync';
import { MainLayout } from './components/MainLayout';
import { Dashboard } from './views/Dashboard';
import { POSBilling } from './views/POSBilling';
import { OrdersList } from './views/OrdersList';
import { KitchenDisplay } from './views/KitchenDisplay';
import { MenuManagement } from './views/MenuManagement';
import { SalesAndExpenses } from './views/SalesAndExpenses';
import { Inventory } from './views/Inventory';
import { SuppliersAndCustomers } from './views/SuppliersAndCustomers';
import { Employees } from './views/Employees';
import { QRPayments } from './views/QRPayments';
import { ReportsAndAnalytics } from './views/ReportsAndAnalytics';
import { Settings } from './views/Settings';

/** Minimal full-screen Firebase connection spinner */
const FirebaseLoader: React.FC<{ error: string | null }> = ({ error }) => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    gap: '24px',
    fontFamily: "'Inter', sans-serif",
  }}>
    {error ? (
      <>
        <div style={{ fontSize: 48 }}>⚠️</div>
        <h2 style={{ color: '#f87171', margin: 0, fontSize: 20, fontWeight: 600 }}>Firebase Connection Failed</h2>
        <p style={{ color: '#94a3b8', margin: 0, maxWidth: 400, textAlign: 'center', fontSize: 14, lineHeight: 1.6 }}>
          {error}
        </p>
        <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>
          Check your Firebase project settings and internet connection.
        </p>
      </>
    ) : (
      <>
        {/* Animated fire spinner */}
        <div style={{
          width: 64, height: 64, fontSize: 48,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'spin 1s linear infinite',
        }}>🔥</div>
        <h2 style={{ color: '#f97316', margin: 0, fontSize: 20, fontWeight: 700 }}>
          Palani Andavar Fast Food
        </h2>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: 14 }}>
          Connecting to database…
        </p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </>
    )}
  </div>
);

/** Redirects browser to the static landing page (public/landing/index.html) */
const LandingRedirect: React.FC = () => {
  React.useEffect(() => {
    window.location.replace('/landing/index.html');
  }, []);
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#120b07',
      color: '#f4b23d',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 16,
    }}>
      Loading…
    </div>
  );
};

/**
 * Guards all dashboard/POS routes.
 * If currentUser is null (not logged in), redirects to the landing page.
 * Wraps <MainLayout> so it sits between the guard and the child routes.
 */
const ProtectedLayout: React.FC = () => {
  const { currentUser } = useRestaurantStore();

  if (!currentUser) {
    // Not authenticated — bounce back to landing page
    return <LandingRedirect />;
  }

  return <MainLayout />;
};

export const App: React.FC = () => {
  const { isDarkMode } = useRestaurantStore();

  // Initialize Firebase real-time sync — loads all data from Firestore on mount
  const { isLoading, error } = useFirebaseSync();

  // Keep dark/light theme classes synchronized on mount/reload
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Show loading screen while connecting to Firebase
  if (isLoading) {
    return <FirebaseLoader error={null} />;
  }

  // Show error screen if Firebase failed to connect
  if (error) {
    return <FirebaseLoader error={error} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page — redirects browser to the static HTML landing page */}
        <Route path="/" element={<LandingRedirect />} />

        {/* /login redirects straight to dashboard (landing page handles auth) */}
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />

        {/* Protected Dashboard & POS routes — redirects to landing if not logged in */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pos" element={<POSBilling />} />
          <Route path="/orders" element={<OrdersList />} />
          <Route path="/kitchen" element={<KitchenDisplay />} />
          <Route path="/menu" element={<MenuManagement />} />
          <Route path="/sales" element={<SalesAndExpenses />} />
          <Route path="/expenses" element={<SalesAndExpenses />} /> {/* same tabbed view */}
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/suppliers" element={<SuppliersAndCustomers />} />
          <Route path="/customers" element={<SuppliersAndCustomers />} /> {/* same CRM view */}
          <Route path="/employees" element={<Employees />} />
          <Route path="/reports" element={<ReportsAndAnalytics />} />
          <Route path="/analytics" element={<ReportsAndAnalytics />} /> {/* same analytics tab */}
          <Route path="/qr-payments" element={<QRPayments />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Catch-all — send to landing page */}
        <Route path="*" element={<LandingRedirect />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
