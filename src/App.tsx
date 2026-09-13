import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { PinAuthModal } from './components/common/PinAuthModal';
import { ToastContainer } from './components/common/ToastContainer';
import { ReceiptModal } from './components/common/ReceiptModal';
import { CmsModalPreviewer } from './components/common/CmsModalPreviewer';

import { POSView } from './components/pos/POSView';
import { ShiftManagement } from './components/shift/ShiftManagement';
import { ROSAnalytics } from './components/dashboard/ROSAnalytics';
import { InventoryManagement } from './components/inventory/InventoryManagement';
import { HRManagement } from './components/hr/HRManagement';
import { AccountingManagement } from './components/accounting/AccountingManagement';
import { AuditLogView } from './components/audit/AuditLogView';
import { SettingsView } from './components/settings/SettingsView';

const MainLayout: React.FC = () => {
  const { activeTab, cmsSettings } = useApp();
  const isSidebarRight = cmsSettings.sidebar?.position === 'right';

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <div className={`flex-1 h-[calc(100vh-4rem)] flex overflow-hidden ${isSidebarRight ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Auto-Collapsible Sidebar */}
        <Sidebar />

        {/* Tab View Container */}
        <main className="flex-1 h-full overflow-hidden flex flex-col">
          {activeTab === 'pos' && <POSView />}
          {activeTab === 'shift' && <ShiftManagement />}
          {activeTab === 'dashboard' && <ROSAnalytics />}
          {activeTab === 'inventory' && <InventoryManagement />}
          {activeTab === 'hr' && <HRManagement />}
          {activeTab === 'accounting' && <AccountingManagement />}
          {activeTab === 'audit' && <AuditLogView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Overlays & Modals */}
      <PinAuthModal />
      <ReceiptModal />
      <CmsModalPreviewer />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
