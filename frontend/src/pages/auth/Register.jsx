import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Warehouse, ShieldCheck, User, Lock, ArrowRight } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    role: 'clerk',
    department: 'Warehouse Operations',
    password: ''
  });
  
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('landingTheme') === 'dark');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/register', formData);
      
      if (response.data.success || response.status === 201) {
        alert("Staff account created successfully! You may now sign in.");
        navigate('/login');
      }
    } catch (err) {
      console.error("Staff Registration Error:", err);
      setError(err.response?.data?.message || "Registration failed. Please verify connection to server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 font-sans transition-colors duration-500 relative ${
      isDarkMode ? 'bg-[#0b1120] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Decorative Emerald Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 right-0 w-[45%] h-[45%] rounded-full blur-[130px] opacity-15 ${
          isDarkMode ? 'bg-[#00684a]' : 'bg-emerald-300'
        }`}></div>
        <div className={`absolute bottom-0 left-0 w-[45%] h-[45%] rounded-full blur-[130px] opacity-15 ${
          isDarkMode ? 'bg-emerald-600' : 'bg-teal-300'
        }`}></div>
      </div>

      <div className={`relative w-full max-w-lg p-8 md:p-10 rounded-3xl shadow-2xl border transition-all duration-300 ${
        isDarkMode 
          ? 'bg-[#0f172a]/90 border-slate-800 backdrop-blur-xl' 
          : 'bg-white/95 border-slate-200 backdrop-blur-xl'
      }`}>
        
        <header className="text-center mb-8">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#00684a] text-white flex items-center justify-center shadow-lg shadow-[#00684a]/25 mb-3">
            <Warehouse className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#00684a] dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Internal Staff Onboarding</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Register <span className="text-[#00684a]">Staff Account</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Create authorized credentials for warehouse personnel</p>
        </header>

        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name Field */}
          <div className="md:col-span-2 space-y-1.5">
            <label className={`block text-[10px] font-black uppercase tracking-wider ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Full Name *
            </label>
            <input 
              type="text" 
              required 
              value={formData.full_name}
              placeholder="e.g., Alex Johnson"
              className={`w-full px-4 py-3 rounded-xl border outline-none text-sm font-medium transition-all ${
                isDarkMode 
                  ? 'bg-[#0b1120] border-slate-800 text-white focus:border-[#00684a]' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-[#00684a]'
              }`}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
          </div>

          {/* Username Field */}
          <div className="space-y-1.5">
            <label className={`block text-[10px] font-black uppercase tracking-wider ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Username *
            </label>
            <input 
              type="text" 
              required 
              value={formData.username}
              placeholder="alexj"
              className={`w-full px-4 py-3 rounded-xl border outline-none text-sm font-medium transition-all ${
                isDarkMode 
                  ? 'bg-[#0b1120] border-slate-800 text-white focus:border-[#00684a]' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-[#00684a]'
              }`}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          {/* Role Field - ADMIN and CLERK only */}
          <div className="space-y-1.5">
            <label className={`block text-[10px] font-black uppercase tracking-wider ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Staff Role *
            </label>
            <select 
              required 
              className={`w-full px-4 py-3 rounded-xl border outline-none text-sm font-semibold cursor-pointer ${
                isDarkMode ? 'bg-[#0b1120] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              value={formData.role}
            >
              <option value="clerk">👷 Warehouse Clerk</option>
              <option value="admin">👑 Administrator (Manager)</option>
            </select>
          </div>

          {/* Department Field */}
          <div className="md:col-span-2 space-y-1.5">
            <label className={`block text-[10px] font-black uppercase tracking-wider ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Department
            </label>
            <input 
              type="text" 
              value={formData.department}
              placeholder="e.g., Warehouse Logistics / Inventory Desk"
              className={`w-full px-4 py-3 rounded-xl border outline-none text-sm font-medium transition-all ${
                isDarkMode 
                  ? 'bg-[#0b1120] border-slate-800 text-white focus:border-[#00684a]' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-[#00684a]'
              }`}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
            />
          </div>

          {/* Password Field */}
          <div className="md:col-span-2 space-y-1.5">
            <label className={`block text-[10px] font-black uppercase tracking-wider ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Password *
            </label>
            <input 
              type="password" 
              required 
              value={formData.password}
              placeholder="••••••••"
              className={`w-full px-4 py-3 rounded-xl border outline-none text-sm font-medium transition-all ${
                isDarkMode 
                  ? 'bg-[#0b1120] border-slate-800 text-white focus:border-[#00684a]' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-[#00684a]'
              }`}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="md:col-span-2 w-full py-3.5 mt-2 bg-[#00684a] hover:bg-[#005a3f] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#00684a]/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "Creating Staff Account..." : "Create Staff Account"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Already an authorized staff member? <Link to="/login" className="text-[#00684a] dark:text-emerald-400 font-bold hover:underline">Sign In here</Link>
          </p>
        </div>
      </div>

      {/* Dark Mode Toggle */}
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