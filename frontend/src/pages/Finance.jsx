import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Filter,
  IndianRupee,
  Coffee,
  ShoppingBag,
  Zap,
  Tag
} from 'lucide-react';

const SpendChart = () => {
  const data = [45, 82, 53, 91, 38, 77, 60];
  const max = Math.max(...data);
  return (
    <div className="flex items-end justify-between h-32 gap-2 mt-4 px-2">
      {data.map((h, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
          <div className="w-full relative flex items-end justify-center h-full">
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: `${(h / max) * 100}%` }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="w-full bg-indigo-100 rounded-t-lg group-hover:bg-[var(--accent)] transition-colors relative"
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                ₹{h}
              </div>
            </motion.div>
          </div>
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase italic">
            {['M','T','W','T','F','S','S'][i]}
          </span>
        </div>
      ))}
    </div>
  );
};

const Finance = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('All');

  const transactions = [
    { id: 1, title: 'Starbucks Coffee', category: 'Food', amount: -6.50, date: 'Today', icon: <Coffee /> },
    { id: 2, title: 'Amazon Shopping', category: 'Shopping', amount: -120.00, date: 'Yesterday', icon: <ShoppingBag /> },
    { id: 3, title: 'Monthly Salary', category: 'Income', amount: 4500.00, date: '3 days ago', icon: <IndianRupee /> },
    { id: 4, title: 'Electricity Bill', category: 'Utilities', amount: -85.20, date: 'Last week', icon: <Zap /> },
  ];

  const subscriptions = [
    { name: 'Netflix', price: 15.99, date: 'Oct 24', color: 'bg-red-50 text-red-500' },
    { name: 'Spotify', price: 9.99, date: 'Oct 28', color: 'bg-green-50 text-green-500' },
    { name: 'iCloud', price: 0.99, date: 'Nov 02', color: 'bg-blue-50 text-blue-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)] tracking-tight">Moneytoring</h1>
          <p className="text-[var(--text-muted)] mt-1 italic italic">"A penny saved is a penny earned, dear!" — M.O.M</p>
        </div>
        <div className="flex gap-3">
           <button className="p-3 bg-white border border-[var(--border)] rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
             <Filter size={20} className="text-[var(--text-muted)]" />
           </button>
           <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-[var(--accent)] text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={20} />
            <span>Add Transaction</span>
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left Column: Stats & Charts (Col Span 3) */}
        <div className="xl:col-span-3 space-y-8">
          
          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 p-6 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-[var(--accent)]">
                  <Wallet size={20} />
                </div>
                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Available</span>
              </div>
              <div className="text-3xl font-black text-[var(--text-main)] tracking-tighter">₹12,450.00</div>
              <p className="text-[10px] text-green-500 font-bold mt-2 uppercase tracking-widest">+ ₹1,200 this month</p>
            </div>

            <div className="bg-white/80 p-6 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                  <TrendingDown size={20} />
                </div>
                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Spent</span>
              </div>
              <div className="text-3xl font-black text-[var(--text-main)] tracking-tighter">₹3,120.40</div>
              <p className="text-[10px] text-red-400 font-bold mt-2 uppercase tracking-widest">52% of ₹6k budget</p>
            </div>

            {/* Weekly Spend Visual */}
            <div className="bg-white/80 p-6 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50 overflow-hidden">
               <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-2">Weekly Trends</span>
               <SpendChart />
            </div>
          </div>

          {/* Transactions Ledger */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--text-main)] px-2">Recent Activity</h2>
            <div className="bg-white/60 backdrop-blur-md border border-white rounded-[2.5rem] overflow-hidden shadow-sm">
              {transactions.map((t, i) => (
                <div key={t.id} className={`flex items-center gap-4 p-5 hover:bg-white/80 transition-colors ${i !== transactions.length - 1 ? 'border-b border-slate-100/50' : ''}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-600'}`}>
                    {t.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[var(--text-main)] text-sm">{t.title}</p>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide">{t.category} • {t.date}</p>
                  </div>
                  <div className={`text-base font-black ${t.amount > 0 ? 'text-green-500' : 'text-[var(--text-main)]'}`}>
                    {t.amount > 0 ? '+₹' : '-₹'}{Math.abs(t.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Analytics & Subscriptions (Col Span 1) */}
        <div className="space-y-8">
          {/* Financial Health / Mom's Advice */}
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-center">
                 <h3 className="text-lg font-black italic">M.O.M Review</h3>
                 <Zap size={20} className="text-yellow-300 fill-yellow-300" />
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/20" />
                    <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="220" strokeDashoffset="44" className="text-yellow-300" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-base font-black">A-</span>
                </div>
                <div>
                   <p className="text-xs font-bold leading-tight">Your health score is Great!</p>
                   <p className="text-[10px] opacity-70 mt-1">"You're making Mom proud, Vikas!"</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                You saved **₹800** last week by reducing dining out. Keep this up for your new car goal!
              </p>
            </div>
          </div>

          {/* Subscription Manager */}
          <div className="bg-white/80 p-6 rounded-[2.5rem] border border-white shadow-sm space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-[var(--text-main)]">Recurring Bills</h3>
              <Plus size={16} className="text-[var(--text-muted)] cursor-pointer" />
            </div>
            <div className="space-y-3">
              {subscriptions.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${s.color}`}>
                    {s.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[var(--text-main)]">{s.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Next: {s.date}</p>
                  </div>
                  <div className="text-xs font-black text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">
                    ₹{s.price}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white/80 p-6 rounded-[2.5rem] border border-white shadow-sm">
            <h3 className="font-bold text-[var(--text-main)] mb-6 px-1">Categories</h3>
            <div className="space-y-5">
              {[
                { name: 'Food', percent: 35, color: '#818cf8', icon: <Coffee size={12} /> },
                { name: 'Shopping', percent: 25, color: '#f472b6', icon: <ShoppingBag size={12} /> },
                { name: 'Utilities', percent: 20, color: '#fbbf24', icon: <Zap size={12} /> },
                { name: 'Others', percent: 20, color: '#94a3b8', icon: <Tag size={12} /> },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.color}15`, color: c.color }}>
                    {c.icon}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                      <span>{c.name}</span>
                      <span>{c.percent}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${c.percent}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full rounded-full" 
                        style={{ backgroundColor: c.color }}
                      ></motion.div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tighter">Record Cost</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-1">How much?</label>
                  <div className="flex items-center gap-2 text-5xl font-black text-[var(--accent)] border-b-2 border-slate-100 pb-4 focus-within:border-[var(--accent)] transition-colors">
                    <span>₹</span>
                    <input type="number" placeholder="0.00" autoFocus className="bg-transparent outline-none w-full placeholder:text-slate-100" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block ml-1">For What?</label>
                    <input type="text" placeholder="e.g. Coffee" className="w-full bg-slate-50 px-5 py-4 rounded-2xl outline-none focus:ring-2 ring-indigo-100 border border-transparent transition-all font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block ml-1">Category</label>
                    <select className="w-full bg-slate-50 px-5 py-4 rounded-2xl outline-none appearance-none cursor-pointer font-bold border border-transparent">
                      <option>Food</option>
                      <option>Shopping</option>
                      <option>Utilities</option>
                      <option>Health</option>
                    </select>
                  </div>
                </div>

                <button className="w-full bg-[var(--accent)] text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4">
                  Complete Transaction
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Finance;
