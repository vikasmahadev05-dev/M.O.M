import React from 'react';
import { 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  Shield, 
  Palette,
  ChevronRight
} from 'lucide-react';

const SettingItem = ({ icon, title, description, color }) => (
  <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group">
    <div className="flex items-center gap-4">
      <div className={`p-2.5 rounded-xl ${color}`}>
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-sm text-[var(--text-main)]">{title}</h4>
        <p className="text-xs text-[var(--text-muted)] font-medium">{description}</p>
      </div>
    </div>
    <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
  </div>
);

import { playSound, isSoundEnabled } from '../utils/sound';

const Profile = () => {
  const triggerTestNotification = () => {
    // 1. Play Sound (Using central utility)
    playSound();

    // 2. Trigger Haptic (Vibration)
    const canVibrate = !!navigator.vibrate;
    if (canVibrate) {
      navigator.vibrate([200, 100, 200]);
    }

    // 3. Show Toast
    import('sonner').then(({ toast }) => {
      const soundStatus = isSoundEnabled();
      toast.custom((t) => (
        <div className="bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-100 w-80 space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Test Notification</p>
            <h3 className="text-lg font-black text-slate-800 leading-tight">System Check</h3>
            <p className="text-xs font-bold text-slate-400">
              {!soundStatus ? "Sound is currently DISABLED in settings." : "Sound triggered via central system."}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              {canVibrate ? "Vibration triggered!" : "Vibration not supported on this device."}
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t)}
            className="w-full py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100"
          >
            Dismiss Test
          </button>
        </div>
      ), { duration: 5000 });
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* Header / Brand */}
      <header className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full bg-[var(--pastel-purple)] flex items-center justify-center border-4 border-white shadow-xl mx-auto overflow-hidden">
             <img 
               src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
               alt="Vikas Sharma"
               className="w-full h-full object-cover"
             />
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-slate-100 hover:scale-110 transition-transform">
            <Settings size={16} className="text-[var(--text-muted)]" />
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)]">Vikas Sharma</h1>
          <p className="text-sm text-[var(--text-muted)] font-medium">Product Manager • vikas@mom.app</p>
        </div>
      </header>

      {/* Testing Section */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] px-2">Testing & Verification</h3>
        <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-sm text-[var(--text-main)]">Ringing & Vibration</h4>
            <p className="text-xs text-[var(--text-muted)] font-medium">Verify your audio and haptic feedback is working correctly.</p>
          </div>
          <button 
            onClick={triggerTestNotification}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
          >
            Run Test
          </button>
        </div>
      </section>

      {/* Settings Sections */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] px-2">Account Settings</h3>
        <div className="glass-card overflow-hidden divide-y divide-[var(--border)]">
          <SettingItem 
            icon={<User size={18} />} 
            title="Personal Information" 
            description="Manage your profile details and bio"
            color="bg-blue-50 text-blue-500"
          />
          <SettingItem 
            icon={<Bell size={18} />} 
            title="Notifications" 
            description="Control how you receive alerts"
            color="bg-orange-50 text-orange-500"
          />
          <SettingItem 
            icon={<Shield size={18} />} 
            title="Security" 
            description="Password and authentication"
            color="bg-purple-50 text-purple-500"
          />
          <SettingItem 
            icon={<Palette size={18} />} 
            title="Appearance" 
            description="Customize your theme and colors"
            color="bg-pink-50 text-pink-500"
          />
        </div>
      </section>

      {/* Logout Section */}
      <section className="pt-6">
        <button className="w-full p-4 bg-red-50 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-red-100 transition-all group overflow-hidden relative">
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Sign Out of M.O.M</span>
          <div className="absolute inset-0 bg-red-500/5 opacity-0 group-active:opacity-100 transition-opacity"></div>
        </button>
        <p className="text-center text-[10px] text-slate-300 mt-6 font-bold uppercase tracking-widest">
          Version 1.0.4 • Made with ✨ by M.O.M Team
        </p>
      </section>
    </div>
  );
};

export default Profile;
