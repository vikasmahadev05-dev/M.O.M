import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  StickyNote, 
  Wallet,
  LogOut,
  ChevronRight,
  Share2
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <CheckSquare size={20} />, label: 'To-Do', path: '/todo' },
    { icon: <Calendar size={20} />, label: 'Calendar', path: '/calendar' },
    { icon: <StickyNote size={20} />, label: 'Notes', path: '/notes' },
    { icon: <Wallet size={20} />, label: 'Moneytoring', path: '/finance' },
    { icon: <Share2 size={20} />, label: 'Knowledge Graph', path: '/graph' },
  ];

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ 
        x: 0, 
        opacity: 1,
        y: [0, -4, 0] // Subtle float animation
      }}
      transition={{
        x: { duration: 0.8, ease: "easeOut" },
        opacity: { duration: 0.8 },
        y: { duration: 4, repeat: Infinity, ease: "easeInOut" } // Infinite subtle float
      }}
      className="hidden md:flex flex-col w-[240px] h-[calc(100vh-48px)] fixed top-6 left-6 bg-white/40 backdrop-blur-2xl border border-white rounded-[3rem] p-6 shadow-2xl shadow-slate-200/50 z-[100]"
    >
      {/* Logo Section */}
      <div className="flex items-center gap-4 mb-12 px-2">
        <div className="w-12 h-12 bg-[#fbbf24] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-amber-200/50 animate-pulse">
          M
        </div>
        <div className="flex flex-col">
          <span className="font-black text-2xl tracking-tight text-slate-800 leading-none">M.O.M</span>
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Life Architect</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-3">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <button 
              key={index} 
              onClick={() => navigate(item.path)}
              className={`
                group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300
                ${isActive 
                  ? 'bg-white shadow-xl shadow-slate-200/40 text-amber-600 scale-105' 
                  : 'text-slate-400 hover:text-slate-800 hover:bg-white/50'}
              `}
            >
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </div>
              <span className="flex-1 text-left font-black text-[11px] uppercase tracking-widest">{item.label}</span>
              {isActive && (
                <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-6 bg-amber-500 rounded-full" />
              )}
              {isActive && <ChevronRight size={14} strokeWidth={3} className="text-amber-400" />}
            </button>
          );
        })}
      </nav>

      {/* Profile Section - Unified Card Theme */}
      <div className="mt-auto pt-8">
        <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white shadow-sm hover:shadow-xl hover:shadow-amber-900/[0.03] transition-all duration-500 group">
          {/* User Avatar */}
          <div 
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm shrink-0 cursor-pointer group-hover:scale-110 transition-transform duration-500"
          >
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'Felix'}`} 
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate('/profile')}>
            <p className="font-black text-[10px] text-slate-800 truncate leading-tight uppercase tracking-wide">
              {user?.username || 'Vikas M'}
            </p>
            <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400 mt-0.5 leading-none">
              Member
            </p>
          </div>

          {/* Logout Button */}
          <button 
            onClick={onLogout}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all duration-300"
            title="Sign Out"
          >
            <LogOut size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
