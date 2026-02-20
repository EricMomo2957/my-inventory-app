import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ClerkSidenav = () => {
  const location = useLocation();

  // Updated paths to match the filenames in your clerk folder
  const menuItems = [
    { name: 'Dashboard', path: '/clerk/ClerkDashboard', icon: '📊' },
    { name: 'Calendar', path: '/clerk/clerkCalendar', icon: '📅' },
    { name: 'Manage Orders', path: '/clerk/order', icon: '🛒' },
    { name: 'Profile', path: '/clerk/clerkProfile', icon: '👤' },
    { name: 'Settings', path: '/clerk/clerkSetting', icon: '⚙️' },
  ];

  const isActive = (path) => location.pathname === path;

  const userName = localStorage.getItem('userName') || 'Clerk Staff';
  const userEmail = localStorage.getItem('userEmail') || 'staff@pro.com';

  return (
    <aside className="w-64 h-screen bg-[#0b1120] border-r border-slate-800 flex flex-col sticky top-0 z-50">
      {/* Logo Section */}
      <div className="p-8">
        <Link to="/clerk/dashboard" className="text-xl font-black text-white flex items-center gap-2">
          <div className="bg-[#4361ee] p-1.5 rounded-lg flex items-center justify-center">
             <span className="text-lg">📦</span>
          </div>
          <span>Clerk<span className="text-[#4361ee]">Pro</span></span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive(item.path)
                ? 'bg-[#4361ee] text-white shadow-lg shadow-[#4361ee]/20'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <span className={`text-lg ${isActive(item.path) ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
              {item.icon}
            </span>
            <span className="font-bold text-sm tracking-wide">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* User Info / Logout Section */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-[#111827]/50 p-4 rounded-2xl border border-slate-800/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#4361ee] to-purple-600 flex items-center justify-center text-white font-bold border-2 border-[#0b1120]">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-white text-xs font-black truncate">{userName}</p>
            <p className="text-slate-500 text-[10px] truncate">{userEmail}</p>
          </div>
        </div>
        
        <Link 
          to="/login" 
          onClick={() => localStorage.clear()} 
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 text-red-400 font-bold text-xs hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
        >
          🚪 Logout
        </Link>
      </div>
    </aside>
  );
};

export default ClerkSidenav;