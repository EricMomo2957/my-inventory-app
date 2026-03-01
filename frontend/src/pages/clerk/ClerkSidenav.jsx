import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

const ClerkSidenav = ({ user, onLogout }) => {
  const location = useLocation();
  
  // Initialize state directly from localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('landingTheme') === 'dark');

  // Memoized sync function to prevent unnecessary re-renders
  const syncTheme = useCallback(() => {
    const currentTheme = localStorage.getItem('landingTheme');
    const shouldBeDark = currentTheme === 'dark';
    
    // Only update state if it actually changed
    setIsDarkMode((prev) => {
      if (prev !== shouldBeDark) return shouldBeDark;
      return prev;
    });

    // Ensure the root document carries the 'dark' class for Tailwind 'dark:' variants
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    // Initial sync on mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    syncTheme();

    // Listen for storage events (triggered by other tabs/windows)
    window.addEventListener('storage', syncTheme);
    
    // Faster polling (200ms) to ensure immediate reaction in the same tab
    const interval = setInterval(syncTheme, 200); 

    return () => {
      window.removeEventListener('storage', syncTheme);
      clearInterval(interval);
    };
  }, [syncTheme]);

  const menuItems = [
    { name: 'Dashboard', path: '/clerk/ClerkDashboard', icon: '📊' },
    { name: 'Manage Orders', path: '/clerk/order', icon: '🛒' },
    { name: 'Calendar', path: '/clerk/clerkCalendar', icon: '📅' },
    { name: 'Profile', path: '/clerk/clerkProfile', icon: '👤' },
    { name: 'Settings', path: '/clerk/clerkSetting', icon: '⚙️' },
  ];

  const isActive = (path) => location.pathname === path;

  const userName = user?.name || localStorage.getItem('userName') || 'Clerk Staff';
  const userEmail = localStorage.getItem('userEmail') || 'staff@pro.com';

  return (
    <aside className={`w-64 h-screen border-r flex flex-col sticky top-0 z-50 transition-all duration-500 ease-in-out ${
      isDarkMode 
        ? 'bg-[#0b1120] border-slate-800' 
        : 'bg-white border-slate-200'
    }`}>
      
      {/* Logo Section */}
      <div className="p-8">
        <Link to="/clerk/ClerkDashboard" className="text-xl font-black flex items-center gap-2">
          <div className="bg-[#4361ee] p-1.5 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
             <span className="text-lg">📦</span>
          </div>
          <span className={`transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Clerk<span className="text-[#4361ee]">Pro</span>
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1.5">
        <p className={`px-4 text-[10px] font-black uppercase tracking-widest mb-2 opacity-60 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Main Menu</p>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive(item.path)
                ? 'bg-[#4361ee] text-white shadow-lg shadow-blue-500/40'
                : isDarkMode 
                  ? 'text-slate-400 hover:bg-slate-800/50 hover:text-white' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#4361ee]'
            }`}
          >
            <span className={`text-lg transition-transform duration-200 group-hover:scale-110 ${isActive(item.path) ? 'opacity-100' : 'opacity-70'}`}>
              {item.icon}
            </span>
            <span className="font-bold text-sm tracking-wide">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* User Info / Logout Section */}
      <div className={`p-4 border-t transition-colors duration-300 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all duration-300 ${
          isDarkMode 
            ? 'bg-[#111827]/50 border-slate-800/50' 
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`w-10 h-10 rounded-full bg-linear-to-br from-[#4361ee] to-[#3a0ca3] flex items-center justify-center text-white font-bold border-2 shadow-inner ${
            isDarkMode ? 'border-slate-800' : 'border-white'
          }`}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className={`text-xs font-black truncate transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {userName}
            </p>
            <p className="text-slate-500 text-[10px] truncate font-medium">{userEmail}</p>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 text-red-500 font-bold text-[11px] uppercase tracking-wider hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20 active:scale-95"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default ClerkSidenav;