import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, reset, googleLogin } from '../store/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight, Sparkles, BrainCircuit } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';


const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      // Error handling can be done with a toast or inline message
    }

    if (isSuccess || user) {
      navigate('/');
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const userData = { email, password };
    dispatch(login(userData));
  };

  const handleGoogleSuccess = (credentialResponse) => {
    dispatch(googleLogin(credentialResponse.credential));
  };


  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fdfaf7] relative overflow-hidden font-sans">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[var(--pastel-blue)] opacity-20 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[var(--pastel-pink)] opacity-20 blur-[100px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md px-6 py-12 relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-16 h-16 bg-white shadow-xl rounded-2xl flex items-center justify-center mb-6 border border-slate-100"
          >
            <BrainCircuit size={32} className="text-[var(--accent)]" />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-[#1a1a1a] tracking-tight mb-2">M.O.M</h1>
          <p className="text-slate-500 font-medium">Mind Over Matter • Your digital sanctuary</p>
        </div>

        <div className="glass-card bg-white/70 backdrop-blur-xl p-8 border border-white/50 shadow-2xl rounded-[2.5rem]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">Welcome Back</h2>
            <p className="text-sm text-slate-500">Sign in to continue your journey</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--accent)] transition-colors" size={18} />
                <input
                  type="email"
                  name="email"
                  value={email}
                  placeholder="name@example.com"
                  onChange={onChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)] transition-all placeholder:text-slate-300 font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center pr-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Password</label>
                <Link to="/forgot-password" size="sm" className="text-xs font-bold text-[var(--accent)] hover:opacity-80">Forgot?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--accent)] transition-colors" size={18} />
                <input
                  type="password"
                  name="password"
                  value={password}
                  placeholder="••••••••"
                  onChange={onChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)] transition-all placeholder:text-slate-300 font-medium"
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {isError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-500 font-medium flex items-center gap-2"
                >
                  <Sparkles size={14} />
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              type="submit"
              className="w-full py-4 bg-[#1a1a1a] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10 disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>


          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center w-full">
            <GoogleLogin
               onSuccess={handleGoogleSuccess}
               onError={() => console.log('Login Failed')}
               theme="filled_blue"
               shape="pill"
               width="250"
            />
          </div>




          <p className="mt-8 text-center text-sm text-slate-400 font-medium">
            New to M.O.M?{' '}
            <Link to="/register" className="text-[var(--accent)] font-bold hover:underline">Create an account</Link>
          </p>
        </div>
        
        <p className="mt-8 text-center text-xs text-slate-400">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
