import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ClerkSidenav = () => {
  const location = useLocation();

  // Updated paths to match standard routing and your file names
  const menuItems = [
    { name: 'Dashboard', path: '/clerk/dashboard', icon: '📊' },
    { name: 'Inventory', path: '/clerk/dashboard', icon: '📦' }, // Usually Inventory is the Dashboard view
    { name: 'Manage Orders', path: '/clerk/orders', icon: '🛒' },
    { name: 'Settings', path: '/clerk/settings', icon: '⚙️' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 h-screen bg-[#0b1120] border-r border-slate-800 flex flex-col sticky top-0">
      {/* Logo Section */}
      <div className="p-8">
        <Link to="/clerk/dashboard" className="text-xl font-black text-white flex items-center gap-2">
          <span className="bg-[#4361ee] p-1.5 rounded-lg text-lg">📦</span>
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
            C
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-white text-xs font-black truncate">Clerk Staff</p>
            <p className="text-slate-500 text-[10px] truncate">staff@pro.com</p>
          </div>
        </div>
        
        <Link 
          to="/login" 
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 text-red-400 font-bold text-xs hover:bg-red-500/10 rounded-lg transition-colors"
        >
          🚪 Logout
        </Link>
      </div>
    </aside>
  );
};

export default ClerkSidenav;