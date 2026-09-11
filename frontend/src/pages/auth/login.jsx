import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, User, Lock, ArrowRight, Warehouse, KeyRound, Building2 } from 'lucide-react';

export default function Login({ setIsLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('landingTheme') === 'dark');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Sync theme with document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('landingTheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('landingTheme', 'light');
    }
  }, [isDarkMode]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError(''); 
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/login', { 
        username, 
        password 
      });
      
      if (response.data.success) {
        const { user } = response.data;
        
        // --- Storage for Auth & Protected Routes ---
        localStorage.setItem('userToken', 'dummy-token'); 
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userName', user.full_name || user.username);
        localStorage.setItem('userEmail', user.email || '');
        localStorage.setItem('userDept', user.department || '');
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userPhoto', user.profile_image || '');

        setIsLoggedIn(true);

        // --- Role-Based Redirection strictly for Internal IMS ---
        if (user.role === 'clerk' || user.role === 'manager' || user.role === 'staff') {
          navigate('/clerk/ClerkDashboard');
        } else if (user.role === 'admin' || user.role === 'Administrator') {
          navigate('/dashboard');
        } else {
          // Default fallback for any staff member
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed. Please verify staff credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (roleType) => {
    if (roleType === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else if (roleType === 'clerk') {
      setUsername('clerk');
      setPassword('clerk123');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 font-sans transition-colors duration-500 relative ${
      isDarkMode ? 'bg-[#0b1120] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Background Decorative Emerald Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[10%] -left-[10%] w-[45%] h-[45%] rounded-full blur-[130px] opacity-20 ${
          isDarkMode ? 'bg-[#00684a]' : 'bg-emerald-300'
        }`}></div>
        <div className={`absolute -bottom-[10%] -right-[10%] w-[45%] h-[45%] rounded-full blur-[130px] opacity-15 ${
          isDarkMode ? 'bg-emerald-600' : 'bg-teal-300'
        }`}></div>
      </div>

      <div className={`relative w-full max-w-md p-8 sm:p-10 rounded-3xl shadow-2xl border transition-all duration-300 ${
        isDarkMode 
          ? 'bg-[#0f172a]/90 border-slate-800 backdrop-blur-xl' 
          : 'bg-white/95 border-slate-200 backdrop-blur-xl'
      }`}>
        
        {/* Header Branding */}
        <header className="mb-8 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[#00684a] text-white flex items-center justify-center shadow-lg shadow-[#00684a]/25 mb-4">
            <Warehouse className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#00684a] dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Internal Enterprise Portal</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Mind<span className="text-[#00684a]">Stock</span>
          </h1>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-xs font-medium mt-1`}>
            Authorized Staff Sign-In for MindStock Operations
          </p>
        </header>

        {/* Quick Staff Credentials Presets */}
        <div className="mb-6 bg-slate-100 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-2 text-center">
            Quick Staff Access (Click to autofill)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className={`p-2 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                username === 'admin' 
                  ? 'bg-[#00684a] text-white border-[#00684a] shadow-sm' 
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#00684a]'
              }`}
            >
              <span className="font-extrabold block">👑 Admin</span>
              <span className="text-[10px] opacity-75">Manager</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('clerk')}
              className={`p-2 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                username === 'clerk' 
                  ? 'bg-[#00684a] text-white border-[#00684a] shadow-sm' 
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#00684a]'
              }`}
            >
              <span className="font-extrabold block">👷 Clerk</span>
              <span className="text-[10px] opacity-75">Warehouse Ops</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className={`block text-[10px] font-black uppercase tracking-wider ml-1 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Staff Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-xl border outline-none transition-all text-sm font-medium ${
                  isDarkMode 
                    ? 'bg-[#0b1120] border-slate-800 text-white focus:border-[#00684a]' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-[#00684a]'
                }`}
                placeholder="Enter staff username"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={`block text-[10px] font-black uppercase tracking-wider ml-1 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-xl border outline-none transition-all text-sm font-medium ${
                  isDarkMode 
                    ? 'bg-[#0b1120] border-slate-800 text-white focus:border-[#00684a]' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-[#00684a]'
                }`}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 mt-2 bg-[#00684a] hover:bg-[#005a3f] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#00684a]/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "Authenticating..." : "Sign In to IMS Portal"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
          <Link 
            to="/" 
            className="text-xs font-semibold text-slate-500 hover:text-[#00684a] dark:hover:text-emerald-400 transition-colors"
          >
            ← Return to System Overview
          </Link>
        </div>
      </div>
      
      {/* Dark/Light toggle button */}
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed bottom-6 right-6 p-3 rounded-2xl bg-slate-800 text-white shadow-xl hover:scale-110 transition-transform cursor-pointer"
        title="Toggle Theme"
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>
    </div>
  );
}