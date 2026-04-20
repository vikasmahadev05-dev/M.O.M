import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, CheckSquare, StickyNote, User, Wallet } from 'lucide-react';

const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: <LayoutDashboard size={22} />, label: 'Home', path: '/' },
    { icon: <Calendar size={22} />, label: 'Calendar', path: '/calendar' },
    { icon: <CheckSquare size={22} />, label: 'To-Do', path: '/todo' },
    { icon: <Wallet size={22} />, label: 'Money', path: '/finance' },
    { icon: <StickyNote size={22} />, label: 'Notes', path: '/notes' },
    { icon: <User size={22} />, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-[var(--border)] px-4 py-3 flex items-center justify-between z-50">
      {navItems.map((item, i) => {
        const isActive = location.pathname === item.path;
        return (
          <button 
            key={i}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};



export default MobileNav;

