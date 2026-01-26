import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Enhanced NavItem using NavLink for routing
 * It automatically applies active styles based on the current URL
 */
function NavItem({ icon, label, to, color = "text-slate-400" }) {
  return (
    <NavLink 
      to={to}
      className={({ isActive }) => `
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-black transition-all duration-200 
        ${isActive 
          ? 'bg-[#4361ee]/10 text-[#4361ee]' 
          : `hover:bg-slate-800/50 hover:text-white ${color}`
        }
      `}
    >
      <span className="text-lg w-6 flex justify-center">{icon}</span>
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

export function Sidenav({ user, onLogout }) {
  // Safe check for user initials
  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() 
    : "??";

  return (
    <aside className="w-64 bg-[#0b1120] border-r border-slate-800/50 flex flex-col shrink-0 h-screen">
      {/* Brand Logo */}
      <div className="p-7 flex items-center gap-3">
        <div className="w-11 h-11 bg-[#4361ee] rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-xl">
          📦
        </div>
        <h2 className="text-xl font-black text-white tracking-tight">Inventory Pro</h2>
      </div>
      
      {/* User Card */}
      <div className="mx-4 mb-6 p-4 bg-[#1e293b]/50 border border-slate-800/50 rounded-[1.25rem] flex items-center gap-3">
        <div className="w-10 h-10 bg-[#4361ee] rounded-xl flex items-center justify-center text-white font-black text-xs">
          {initials}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-black text-white truncate leading-tight">
            {user.name}
          </span>
          <small className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-0.5">
            {user.role}
          </small>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 mt-4">
          Main Menu
        </p>
        <NavItem icon="🏠" label="Dashboard" to="/" />
        <NavItem icon="🛒" label="Customer Orders" to="/orders" />
        <NavItem icon="📅" label="Calendar" to="/calendar" />
        
        <p className="px-3 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 mt-8">
          User Account
        </p>
        <NavItem icon="👤" label="Profile" to="/profile" />
        <NavItem icon="⚙️" label="Settings" to="/settings" />
        
        {user.role === "Administrator" && (
          <NavItem 
            icon="🛡️" 
            label="Admin Management" 
            to="/admin" 
            color="text-orange-500" 
          />
        )}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-800/50 mt-auto">
        <button 
          onClick={onLogout} 
          className="w-full flex items-center justify-center gap-2 px-3 py-3 text-sm font-black text-red-400 bg-red-400/5 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-95"
        >
          <span className="text-base">🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}