import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    role: '',
    password: ''
  });
  
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('landingTheme') === 'dark');
  const navigate = useNavigate();

  // Sync dark mode with your Landing Page theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('landingTheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('landingTheme', 'light');
    }
  }, [isDarkMode]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // In your app.js, userRoutes are mounted at /api/users
      // Ensure your backend has a POST route at /api/users/register
      const response = await axios.post('http://localhost:3000/api/users/register', formData);
      
      if (response.data.success || response.status === 201) {
        alert("Account initialized successfully!");
        navigate('/login');
      }
    } catch (err) {
      console.error("Registration Error:", err);
      // Provides feedback if user already exists or server is down
      alert(err.response?.data?.message || "Connection failed. Please check if your backend is running.");
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 font-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#0b1120]' : 'bg-slate-50'}`}>
      
      {/* Decorative Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 right-0 w-[50%] h-[50%] rounded-full blur-[120px] opacity-10 ${isDarkMode ? 'bg-indigo-500' : 'bg-blue-300'}`}></div>
        <div className={`absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full blur-[120px] opacity-10 ${isDarkMode ? 'bg-blue-500' : 'bg-indigo-300'}`}></div>
      </div>

      <div className={`relative w-full max-w-lg p-8 md:p-12 rounded-[2.5rem] shadow-2xl border transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-900/80 border-slate-800 backdrop-blur-xl' 
          : 'bg-white/80 border-white backdrop-blur-xl'
      }`}>
        
        <header className="text-center mb-10">
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Join the System</span>
          </div>
          <h1 className={`text-3xl md:text-4xl font-black mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Create <span className="text-indigo-600">Account</span>
          </h1>
        </header>

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name Field */}
          <div className="md:col-span-2 space-y-2">
            <label className={`block text-[11px] font-black uppercase tracking-widest ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Full Name</label>
            <input 
              type="text" 
              required 
              value={formData.full_name}
              placeholder="e.g. Eric Cartman"
              className={`w-full px-5 py-3.5 rounded-2xl border outline-none transition-all text-sm ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500'}`}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
          </div>

          {/* Username Field */}
          <div className="space-y-2">
            <label className={`block text-[11px] font-black uppercase tracking-widest ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Username</label>
            <input 
              type="text" 
              required 
              value={formData.username}
              className={`w-full px-5 py-3.5 rounded-2xl border outline-none transition-all text-sm ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500'}`}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          {/* Role Field */}
          <div className="space-y-2">
            <label className={`block text-[11px] font-black uppercase tracking-widest ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Access Role</label>
            <select 
              required 
              className={`w-full px-5 py-3.5 rounded-2xl border outline-none transition-all text-sm appearance-none cursor-pointer ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              value={formData.role}
            >
              <option value="" disabled>Select Role</option>
              <option value="admin">Administrator</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          {/* Password Field */}
          <div className="md:col-span-2 space-y-2">
            <label className={`block text-[11px] font-black uppercase tracking-widest ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Secure Password</label>
            <input 
              type="password" 
              required 
              value={formData.password}
              className={`w-full px-5 py-3.5 rounded-2xl border outline-none transition-all text-sm ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500'}`}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            className="md:col-span-2 w-full py-4 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/25 transition-all active:scale-[0.97] mt-4"
          >
            Initialize Account
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Already part of the team? <Link to="/login" className="text-indigo-500 font-black hover:underline">Login here</Link>
          </p>
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed bottom-6 right-6 p-3 rounded-full bg-slate-800 text-white shadow-lg md:block hidden z-50 transition-transform active:scale-90"
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>
    </div>
  );
}