import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  ArrowRight, 
  Warehouse, 
  KeyRound, 
  Building2, 
  ArrowLeft, 
  Mail, 
  Eye, 
  EyeOff, 
  Sun, 
  Moon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Login({ setIsLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('landingTheme') === 'dark');
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

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

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
        
        // Storage for Auth & Protected Routes
        localStorage.setItem('userToken', 'dummy-token'); 
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userName', user.full_name || user.username);
        localStorage.setItem('userEmail', user.email || '');
        localStorage.setItem('userDept', user.department || '');
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userPhoto', user.profile_image || '');

        setIsLoggedIn(true);

        // Role-Based Redirection strictly for Internal IMS
        if (user.role === 'clerk' || user.role === 'manager' || user.role === 'staff') {
          navigate('/clerk/ClerkDashboard');
        } else if (user.role === 'admin' || user.role === 'Administrator') {
          navigate('/dashboard');
        } else {
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
    <div className={`min-h-screen flex flex-col justify-between p-4 sm:p-6 font-sans transition-colors duration-500 relative overflow-y-auto ${
      isDarkMode ? 'bg-[#070c18] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      
      {/* Background Decorative Emerald Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[140px] opacity-25 ${
          isDarkMode ? 'bg-[#00684a]' : 'bg-emerald-300'
        }`}></div>
        <div className={`absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full blur-[140px] opacity-15 ${
          isDarkMode ? 'bg-emerald-600' : 'bg-teal-300'
        }`}></div>
      </div>

      {/* Top Bar: Back to Home & Theme Toggle */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between relative z-10 mb-2">
        <Link
          to="/"
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all ${
            isDarkMode 
              ? 'border-slate-800 bg-[#0f172a]/80 hover:bg-slate-800 text-slate-300 hover:text-white' 
              : 'border-slate-200 bg-white/80 hover:bg-slate-100 text-slate-700 shadow-xs'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <button
          onClick={toggleTheme}
          className={`p-2 rounded-xl border text-xs font-bold transition-all ${
            isDarkMode 
              ? 'border-slate-800 bg-[#0f172a]/80 text-amber-400 hover:bg-slate-800' 
              : 'border-slate-200 bg-white/80 text-slate-600 hover:bg-slate-100 shadow-xs'
          }`}
          title="Toggle Light / Dark Mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      {/* Center Auth Area */}
      <div className="w-full max-w-md mx-auto my-auto relative z-10 flex flex-col items-center py-2">
        
        {/* Brand Header */}
        <div className="text-center mb-3 sm:mb-4">
          <div className="inline-flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#00684a] text-white flex items-center justify-center font-black text-lg shadow-md shadow-[#00684a]/30">
              <Warehouse className="w-4 h-4" />
            </div>
            <span className={`text-xl sm:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Mind<span className="text-[#00684a] dark:text-emerald-400">Stock</span>
            </span>
          </div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Precision Control • Enterprise Warehouse Management
          </p>
        </div>

        {/* Main Glassmorphic Card */}
        <div className={`w-full p-6 sm:p-8 rounded-3xl border shadow-2xl backdrop-blur-xl relative transition-all duration-300 ${
          isDarkMode 
            ? 'bg-[#0f172a]/95 border-slate-800/90 shadow-black/70' 
            : 'bg-white border-slate-200 shadow-xl shadow-slate-200/70'
        }`}>
          
          {/* Top Emerald Glowing Accent Halo */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-[2px] bg-linear-to-r from-transparent via-[#00684a] dark:via-emerald-400 to-transparent blur-[1px]"></div>

          {/* Card Title & Subtitle */}
          <div className="text-center mb-4">
            <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Staff Portal Login
            </h2>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-400 mt-0.5">
              Please enter your credentials to access your account.
            </p>
          </div>

          {/* Quick Staff Selectors */}
          <div className={`mb-4 p-2 rounded-xl border flex items-center justify-between gap-2 ${
            isDarkMode ? 'bg-[#070c18]/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1.5">
              Quick Role:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  username === 'admin' 
                    ? 'bg-[#00684a] text-white shadow-xs' 
                    : isDarkMode ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300' : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                👑 Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('clerk')}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  username === 'clerk' 
                    ? 'bg-[#00684a] text-white shadow-xs' 
                    : isDarkMode ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300' : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                👷 Clerk
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            
            {/* Username / Email */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 pl-1">
                EMAIL ADDRESS / USERNAME
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter staff username or email"
                  required
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-[#070c18] border-slate-800 text-white focus:border-[#00684a]' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-[#00684a]'
                  }`}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 pl-1">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm font-medium outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-[#070c18] border-slate-800 text-white focus:border-[#00684a]' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-[#00684a]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-500" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end pt-0.5">
              <Link 
                to="/forgot-password" 
                className="text-xs font-bold text-[#00684a] dark:text-emerald-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-1 bg-[#00684a] hover:bg-[#00583e] text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-[#00684a]/25 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isLoading ? "Authenticating..." : "Login"}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#00684a] dark:text-emerald-400 font-black hover:underline ml-1">
              Create one
            </Link>
          </div>

        </div>
      </div>

      {/* Bottom Security Footer */}
      <footer className="w-full text-center space-y-0.5 relative z-10 py-3">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00684a] dark:text-emerald-400" />
          <span>Protected by MindStock Automated Multi-Key Encryption protocol.</span>
        </div>
        <p className="text-[10px] text-slate-500">
          For support, contact <span className="underline text-slate-400">support@mindstock.com</span>
        </p>
      </footer>

    </div>
  );
}