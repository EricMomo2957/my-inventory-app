import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login({ setIsLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('landingTheme') === 'dark');
  const [error, setError] = useState('');
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
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      const response = await axios.post('http://localhost:3000/api/login', { 
        username, 
        password 
      });
      
      if (response.data.success) {
        const { user } = response.data;
        
        // --- Storage for Auth & Protected Routes ---
        localStorage.setItem('userToken', 'dummy-token'); // Triggers isLoggedIn check in App.js
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userName', user.full_name);
        localStorage.setItem('userId', user.id);

        setIsLoggedIn(true);

        // --- Role-Based Redirection ---
        if (user.role === 'clerk' || user.role === 'manager') {
          navigate('/clerk-dashboard');
        } else if (user.role === 'user') {
          navigate('/user-dashboard');
        } else if (user.role === 'admin' || user.role === 'Administrator') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      // Display backend error message or default fallback
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 font-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#0b1120]' : 'bg-slate-50'}`}>
      
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-400'}`}></div>
        <div className={`absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${isDarkMode ? 'bg-indigo-600' : 'bg-indigo-400'}`}></div>
      </div>

      <div className={`relative w-full max-w-md p-10 rounded-4xl shadow-2xl border transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-900/80 border-slate-800 backdrop-blur-xl' 
          : 'bg-white/80 border-white backdrop-blur-xl'
      }`}>
        
        <header className="mb-10 text-center">
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-blue-500/10 border border-blue-500/20">
            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Secure Access</span>
          </div>
          <h1 className={`text-4xl font-black mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Inventory<span className="text-blue-600">Pro</span>
          </h1>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-50' } text-sm font-medium`}>
            Enter your credentials to manage stock
          </p>
        </header>

        {/* Error Feedback */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
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
                  ? 'bg-slate-800/50 border-slate-700 text-white focus:border-blue-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-blue-500'
              }`}
              placeholder="Enter username"
              required
            />
          </div>

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
                  ? 'bg-slate-800/50 border-slate-700 text-white focus:border-blue-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-blue-500'
              }`}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/25 transition-all active:scale-[0.97]"
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

        <div className="space-y-4 text-center">
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Don't have an account? <Link to="/register" className="text-blue-500 font-bold hover:underline">Register</Link>
          </p>
        </div>
      </div>
      
      {/* Theme Toggle Button */}
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed bottom-6 right-6 p-3 rounded-full bg-slate-800 text-white shadow-lg hover:scale-110 transition-transform"
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>
    </div>
  );
}