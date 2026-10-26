import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useRestaurantStore } from './store/restaurantStore';
import { MainLayout } from './components/MainLayout';
import { Login } from './views/Login';
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

export const App: React.FC = () => {
  const { isDarkMode } = useRestaurantStore();

  // Keep dark/light theme classes synchronized on mount/reload
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Unprotected Auth route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard POS routes */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pos" element={<POSBilling />} />
          <Route path="/orders" element={<OrdersList />} />
          <Route path="/kitchen" element={<KitchenDisplay />} />
          <Route path="/menu" element={<MenuManagement />} />
          <Route path="/sales" element={<SalesAndExpenses />} />
          <Route path="/expenses" element={<SalesAndExpenses />} /> {/* Redirects to same tabbed sales/expense view */}
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/suppliers" element={<SuppliersAndCustomers />} />
          <Route path="/customers" element={<SuppliersAndCustomers />} /> {/* Redirects to same tabbed CRM view */}
          <Route path="/employees" element={<Employees />} />
          <Route path="/reports" element={<ReportsAndAnalytics />} />
          <Route path="/analytics" element={<ReportsAndAnalytics />} /> {/* Redirects to same analytics tab */}
          <Route path="/qr-payments" element={<QRPayments />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Catch-all redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
