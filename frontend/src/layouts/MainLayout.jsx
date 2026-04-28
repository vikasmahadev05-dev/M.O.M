import React from 'react';
import Sidebar from '../components/sidebar/Sidebar';
import MobileNav from '../components/mobilenav/MobileNav';
import { Toaster } from 'sonner';
import AssistantWidget from '../components/assistant/AssistantWidget';

import useReminderChecker from '../hooks/useReminderChecker.jsx';

import Grainient from '../components/ui/Grainient';
import WavyBackground from '../components/ui/WavyBackground';

const MainLayout = ({ children }) => {
  useReminderChecker(); // Initialize the global reminder listener
  return (
    <div className="flex bg-transparent min-h-screen pb-20 md:pb-0 relative overflow-hidden">
      {/* --- PREMIUM BACKGROUND SYSTEM --- */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {/* 1. Base Grainy Texture */}
        <div className="absolute inset-0 opacity-[0.15]">
          <Grainient
            color1="#ffffff"
            color2="#F8F6F1"
            color3="#ffffff"
            timeSpeed={0.05}
            zoom={1}
            grainAmount={0.05}
            grainScale={2}
          />
        </div>

        {/* 2. Reference-matched Wavy Blobs & Dotted Grid */}
        <WavyBackground />
      </div>
      {/* Column 1: Sticky Sidebar (Hidden on mobile) */}
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 main-container">
        <div className="flex-1 overflow-visible w-full">
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

