import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, reset } from '../store/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Loader2, ArrowRight, Sparkles, BrainCircuit } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { username, email, password, confirmPassword } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isSuccess || user) {
      navigate('/');
    }
    dispatch(reset());
  }, [user, isSuccess, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
    } else {
      const userData = { username, email, password };
      dispatch(register(userData));
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fdfaf7] relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[var(--pastel-purple)] opacity-20 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[var(--pastel-green)] opacity-20 blur-[100px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md px-6 py-6 relative z-10"
      >
        <div className="flex flex-col items-center mb-6">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: -5 }}
            className="w-14 h-14 bg-white shadow-xl rounded-2xl flex items-center justify-center mb-4 border border-slate-100"
          >
            <BrainCircuit size={28} className="text-[var(--accent)]" />
          </motion.div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a] tracking-tight">Create Sanctuary</h1>
        </div>

        <div className="glass-card bg-white/70 backdrop-blur-xl p-8 border border-white/50 shadow-2xl rounded-[2.5rem]">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--accent)] transition-colors" size={18} />
                <input
                  type="text"
                  name="username"
                  value={username}
                  placeholder="How should we call you?"
                  onChange={onChange}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:outline-none focus:border-[var(--accent)] transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--accent)] transition-colors" size={18} />
                <input
                  type="email"
                  name="email"
                  value={email}
                  placeholder="name@example.com"
                  onChange={onChange}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:outline-none focus:border-[var(--accent)] transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--accent)] transition-colors" size={18} />
                  <input
                    type="password"
                    name="password"
                    value={password}
                    placeholder="••••••"
                    onChange={onChange}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:outline-none focus:border-[var(--accent)] transition-all font-medium"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Confirm</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--accent)] transition-colors" size={18} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    placeholder="••••••"
                    onChange={onChange}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:outline-none focus:border-[var(--accent)] transition-all font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-500 font-medium"
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              type="submit"
              className="w-full py-4 bg-[#1a1a1a] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg mt-4 disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : (
                <>
                  Join M.O.M
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--accent)] font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
