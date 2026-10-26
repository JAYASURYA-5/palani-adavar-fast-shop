import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { QuickWidgets } from './QuickWidgets';
import { useRestaurantStore } from '../store/restaurantStore';

export const MainLayout: React.FC = () => {
  const { currentUser } = useRestaurantStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  // Authentication Guard: Redirect to Login if no active user exists
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden transition-colors duration-250">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header 
          setIsMobileOpen={setIsMobileSidebarOpen}
          toggleCalculator={() => setShowCalculator(!showCalculator)}
        />
        <main className="flex-1 overflow-hidden relative">
          <Outlet />
        </main>
      </div>

      {/* Floating Calculator & Quick Actions */}
      <QuickWidgets 
        showCalculator={showCalculator}
        setShowCalculator={setShowCalculator}
      />

    </div>
  );
};
export default MainLayout;
