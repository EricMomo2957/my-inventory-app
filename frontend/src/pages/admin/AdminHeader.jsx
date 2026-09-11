import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  AlertTriangle, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Sparkles,
  Layers
} from 'lucide-react';

export default function AdminHeader({ 
  title = "System Dashboard", 
  subtitle,
  searchValue = "", 
  onSearchChange,
  activeAlerts = []
}) {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const adminName = localStorage.getItem('fullName') || localStorage.getItem('userName') || 'Administrator';
  const role = localStorage.getItem('userRole') || 'ADMIN';
  const adminEmail = localStorage.getItem('userEmail') || 'admin@mindstock.com';
  const profileImage = localStorage.getItem('userPhoto') || localStorage.getItem('profileImage');

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <header className={`sticky top-0 z-30 px-6 py-3.5 border-b backdrop-blur-md transition-colors duration-200 ${
      isDark 
        ? 'bg-[#0f172a]/95 border-slate-800/90 text-slate-100' 
        : 'bg-white/95 border-slate-200/80 text-slate-800 shadow-xs'
    }`}>
      <div className="flex items-center justify-between gap-4">
        
        {/* Left Section: Breadcrumb & Title */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="hidden sm:flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00684a]/10 text-[#00684a] dark:text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Desk</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-tight truncate leading-none">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[11px] text-slate-400 font-medium hidden md:block mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Center / Search Bar */}
        {onSearchChange && (
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
            <div className={`w-full relative flex items-center rounded-xl border transition-all ${
              isDark 
                ? 'bg-slate-800/60 border-slate-700/80 focus-within:border-[#00684a]' 
                : 'bg-slate-50 border-slate-200 focus-within:border-[#00684a] focus-within:bg-white'
            }`}>
              <Search className="w-4 h-4 ml-3.5 text-slate-400 shrink-0" />
              <input 
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search inventory, staff, movements..."
                className="w-full bg-transparent px-3 py-2 text-xs font-medium focus:outline-none placeholder-slate-400 text-slate-900 dark:text-slate-100"
              />
              <kbd className="hidden sm:inline-block mr-2.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-200 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600">
                Ctrl+K
              </kbd>
            </div>
          </div>
        )}

        {/* Right Section: Controls, Alerts, Theme, Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Live Date Pill */}
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
            isDark 
              ? 'bg-slate-800/80 border-slate-700/80 text-slate-300' 
              : 'bg-slate-50 border-slate-200/80 text-slate-600'
          }`}>
            <CalendarIcon className="w-3.5 h-3.5 text-[#00684a] dark:text-emerald-400" />
            <span>{currentDateFormatted}</span>
          </div>

          {/* System Status indicator */}
          <div className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold ${
            isDark 
              ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400' 
              : 'bg-emerald-50 border-emerald-200 text-[#00684a]'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Sync</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`p-2 rounded-xl border transition-colors relative ${
                isDark 
                  ? 'border-slate-800 hover:bg-slate-800 text-slate-300' 
                  : 'border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
              title="System Alerts"
            >
              <Bell className="w-4 h-4" />
              {activeAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {activeAlerts.length}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className={`absolute right-0 mt-2 w-80 rounded-2xl border shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 ${
                isDark ? 'bg-[#0f172a] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider">Alerts & Notices</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-bold">
                    {activeAlerts.length} Attention
                  </span>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {activeAlerts.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      ✨ All systems optimal. No alerts.
                    </div>
                  ) : (
                    activeAlerts.map((alert, idx) => (
                      <div key={idx} className={`p-2.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                        isDark ? 'bg-amber-950/20 border-amber-900/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}>
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-bold">{alert.name || alert.title || 'Low Stock'}</p>
                          <p className="text-[11px] opacity-80">{alert.message || `${alert.quantity} remaining in stock`}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-colors ${
              isDark 
                ? 'border-slate-800 hover:bg-slate-800 text-slate-300' 
                : 'border-slate-200 hover:bg-slate-100 text-slate-600'
            }`}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-xl border transition-all ${
                isDark 
                  ? 'border-slate-800 hover:bg-slate-800 bg-slate-900/60' 
                  : 'border-slate-200 hover:bg-slate-50 bg-white'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-[#00684a] text-white flex items-center justify-center font-bold text-xs overflow-hidden shadow-xs">
                {profileImage ? (
                  <img 
                    src={profileImage.startsWith('http') ? profileImage : `http://localhost:3000${profileImage}`} 
                    alt="User" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  adminName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold leading-tight truncate max-w-[100px]">{adminName}</p>
                <p className="text-[10px] text-[#00684a] dark:text-emerald-400 font-semibold uppercase tracking-wider">{role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isProfileOpen && (
              <div className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 ${
                isDark ? 'bg-[#0f172a] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-xs font-bold truncate">{adminName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{adminEmail}</p>
                </div>

                <button 
                  onClick={() => { setIsProfileOpen(false); navigate('/admin/view-profile'); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>View Profile</span>
                </button>

                <button 
                  onClick={() => { setIsProfileOpen(false); navigate('/admin/settings'); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>System Settings</span>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
