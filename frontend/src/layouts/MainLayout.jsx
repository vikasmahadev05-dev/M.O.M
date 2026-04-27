import React from 'react';
import Sidebar from '../components/sidebar/Sidebar';
import MobileNav from '../components/mobilenav/MobileNav';
import { Toaster } from 'sonner';
import AssistantWidget from '../components/assistant/AssistantWidget';

import useReminderChecker from '../hooks/useReminderChecker.jsx';

const MainLayout = ({ children }) => {
  useReminderChecker(); // Initialize the global reminder listener
  return (
    <div className="flex bg-[var(--bg-primary)] min-h-screen pb-20 md:pb-0 relative">
      {/* Column 1: Sticky Sidebar (Hidden on mobile) */}
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-visible w-full max-w-5xl mx-auto px-[var(--container-px)] py-6 md:py-10">
          {children}
        </div>
      </main>

      {/* Mobile Navigation (Instagram Style) */}
      <MobileNav />

      {/* AI Assistant Widget (Global) */}
      <AssistantWidget />

      {/* Global Notifications */}
      <Toaster position="bottom-right" expand={true} richColors />
    </div>
  );
};



export default MainLayout;

