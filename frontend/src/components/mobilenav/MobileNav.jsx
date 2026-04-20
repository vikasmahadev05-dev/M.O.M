import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, CheckSquare, StickyNote, User, Wallet, Share2 } from 'lucide-react';

const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: <LayoutDashboard size={22} />, label: 'Home', path: '/' },
    { icon: <Calendar size={22} />, label: 'Calendar', path: '/calendar' },
    { icon: <CheckSquare size={22} />, label: 'To-Do', path: '/todo' },
    { icon: <Wallet size={22} />, label: 'Money', path: '/finance' },
    { icon: <StickyNote size={22} />, label: 'Notes', path: '/notes' },
    { icon: <Share2 size={22} />, label: 'Graph', path: '/graph' },
  ];

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl px-2 py-3 flex items-center justify-around z-[100] animate-in slide-in-from-bottom-10 duration-500">
      {navItems.map((item, i) => {
        const isActive = location.pathname === item.path;
        return (
          <button 
            key={i}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${isActive ? 'text-[var(--accent)] scale-110' : 'text-slate-400'}`}
          >
            <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-indigo-50' : ''}`}>
              {React.cloneElement(item.icon, { size: 20 })}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-40'}`}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};



export default MobileNav;

