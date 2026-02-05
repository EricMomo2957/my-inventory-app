import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login({ setIsLoggedIn }) {
  const [username, setUsername] = useState('admin_user');
  const [password, setPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('landingTheme') === 'dark');
  const navigate = useNavigate();

  // Sync dark mode class for the login container
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('userToken', 'secure-entry-granted');
    setIsLoggedIn(true);
    navigate('/dashboard');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 font-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#0b1120]' : 'bg-slate-50'}`}>
      
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-400'}`}></div>
        <div className={`absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${isDarkMode ? 'bg-indigo-600' : 'bg-indigo-400'}`}></div>
      </div>

      <div className={`relative w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl border transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-900/80 border-slate-800 backdrop-blur-xl' 
          : 'bg-white/80 border-white backdrop-blur-xl'
      }`}>
        
        {/* Logo and Header */}
        <header className="mb-10 text-center">
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-blue-500/10 border border-blue-500/20">
            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Secure Access</span>
          </div>
          <h1 className={`text-4xl font-black mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Inventory<span className="text-blue-600">Pro</span>
          </h1>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm font-medium`}>
            Enter your credentials to manage stock
          </p>
        </header>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username Input */}
          <div className="space-y-2">
            <label className={`block text-[11px] font-black uppercase tracking-widest ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
              Username
            </label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-5 py-4 rounded-2xl border outline-none transition-all text-sm font-medium ${
                isDarkMode 
                  ? 'bg-slate-800/50 border-slate-700 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
              }`}
              placeholder="admin_user"
              required
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className={`block text-[11px] font-black uppercase tracking-widest ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
              Password
            </label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-5 py-4 rounded-2xl border outline-none transition-all text-sm font-medium ${
                isDarkMode 
                  ? 'bg-slate-800/50 border-slate-700 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
              }`}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end pr-1">
            <Link 
              to="/forgot-password" 
              className={`text-[10px] font-bold uppercase tracking-widest hover:text-blue-500 transition-colors ${
                isDarkMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Forgot Password?
            </Link>
          </div>

          {/* LINT FIX: Changed bg-gradient-to-r to bg-linear-to-r */}
          <button 
            type="submit"
            className="w-full py-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/25 transition-all active:scale-[0.97] transform hover:-translate-y-0.5"
          >
            Sign In to Dashboard
          </button>
        </form>

        <div className="relative my-10">
          <div className={`absolute inset-0 flex items-center ${isDarkMode ? 'opacity-10' : 'opacity-20'}`}>
            <div className="w-full border-t border-slate-400"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em]">
            <span className={`px-4 ${isDarkMode ? 'bg-[#151d2e] text-slate-500' : 'bg-white text-slate-400'}`}>OR</span>
          </div>
        </div>

        {/* Footer Links */}
        <div className="space-y-4 text-center">
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Don't have an account? <Link to="/register" className="text-blue-500 font-bold hover:underline">Register</Link>
          </p>
          <div className={`inline-block p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-blue-50/50 border-blue-100'}`}>
            <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} italic`}>
              Just here to buy?{' '}
              <Link to="/order" className="text-blue-600 font-black hover:underline not-italic">
                Place an Order
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed bottom-6 right-6 p-3 rounded-full bg-slate-800 text-white shadow-lg md:block hidden"
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>
    </div>
  );
}