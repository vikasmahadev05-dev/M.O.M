import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  StickyNote, 
  Wallet,
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <CheckSquare size={20} />, label: 'To-Do', path: '/todo' },
    { icon: <Calendar size={20} />, label: 'Calendar', path: '/calendar' },
    { icon: <StickyNote size={20} />, label: 'Notes', path: '/notes' },
    { icon: <Wallet size={20} />, label: 'Moneytoring', path: '/finance' },
  ];



  return (
    <aside className="hidden md:flex w-68 h-screen bg-[var(--sidebar-bg)] border-r border-[var(--border)] flex-col p-6 sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-[var(--accent)] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-100">
          M
        </div>
        <span className="font-bold text-xl tracking-tight text-[var(--text-main)]">M.O.M</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <button 
              key={index} 
              onClick={() => navigate(item.path)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && <ChevronRight size={16} />}
            </button>
          );
        })}
      </nav>


      {/* Profile Card */}
      <div className="mt-auto pt-6 border-t border-[var(--border)]">
        <div 
          onClick={() => navigate('/profile')}
          className={`flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group ${location.pathname === '/profile' ? 'bg-indigo-50/50' : ''}`}
        >
          <div className="w-12 h-12 rounded-full bg-[var(--pastel-purple)] flex items-center justify-center border-2 border-white overflow-hidden shadow-sm">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 overflow-hidden text-left">
            <p className="font-semibold text-sm text-[var(--text-main)] truncate">Vikas Sharma</p>
            <p className="text-xs text-[var(--text-muted)] truncate">Product Manager</p>
          </div>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;
