import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

function NavItem({ icon, label, to, isCollapsed, color = "text-slate-400", onClick }) {
  return (
    <NavLink 
      to={to}
      onClick={onClick}
      className={({ isActive }) => `
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-black transition-all duration-200 
        ${isActive 
          ? 'bg-[#4361ee]/10 text-[#4361ee]' 
          : `hover:bg-slate-800/50 hover:text-white ${color}`
        }
        ${isCollapsed ? 'justify-center px-0' : ''}
      `}
    >
      <span className={`text-lg transition-transform ${isCollapsed ? 'scale-110' : 'w-6 flex justify-center'}`}>
        {icon}
      </span>
      {!isCollapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

export default function UserSidenav({ user, onLogout, setCurrentView }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Generates initials for the avatar (e.g., "SA" for System Administrator)
  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() 
    : "U";

  return (
    <aside className={`bg-[#0b1120] border-r border-slate-800/50 flex flex-col shrink-0 h-screen transition-all duration-300 ease-in-out sticky top-0 z-50 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Brand Header */}
      <div className={`p-7 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-2`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4361ee] rounded-xl flex items-center justify-center shadow-lg text-xl">📦</div>
            <h2 className="text-lg font-black text-white tracking-tight">Inventory</h2>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
        >
          {isCollapsed ? '➡️' : '⬅️'}
        </button>
      </div>
      
      {/* User Info Card - Styled after your Profile Screenshot */}
      <div className={`${isCollapsed ? 'flex justify-center' : 'mx-4'} mb-6`}>
        <div className={`p-4 bg-[#1e293b]/50 border border-slate-800/50 rounded-[1.25rem] flex items-center gap-3 overflow-hidden ${isCollapsed ? 'w-12 h-12 p-0 justify-center' : ''}`}>
          <div className="w-10 h-10 bg-[#4361ee] shrink-0 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-inner">
            {initials}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black text-white truncate">{user?.name || "User"}</span>
              <small className="text-[10px] text-slate-500 uppercase tracking-widest font-black truncate">{user?.role || "Member"}</small>
            </div>
          )}
        </div>
      </div>

      {/* Navigation - Connected to your user folder files */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {!isCollapsed && <p className="px-3 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 mt-4">Main Menu</p>}
        
        {/* Dashboard Actions */}
        <NavItem 
          icon="📦" 
          label="Catalog" 
          to="/user_dashboard" 
          isCollapsed={isCollapsed} 
          onClick={() => setCurrentView?.('all')} 
        />
        <NavItem 
          icon="📅" 
          label="Calendar" 
          to="/user_calendar" // Keeps user on dashboard but swaps view
          isCollapsed={isCollapsed} 
          onClick={() => setCurrentView?.('calendar')} 
        />
        
        
        {!isCollapsed && <p className="px-3 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 mt-8">Account</p>}
        
        {/* Individual Pages in User Folder */}
        <NavItem icon="📜" label="My Orders" to="/Orders" isCollapsed={isCollapsed} />
        <NavItem icon="👤" label="Profile" to="/Profile" isCollapsed={isCollapsed} />
        <NavItem icon="⚙️" label="Settings" to="/Settings" isCollapsed={isCollapsed} />
        <NavItem icon="📦" label="user_dashboard" to="/user_dashboard" isCollapsed={isCollapsed} />
        <NavItem icon="📅" label="user-calendar" to="/user-calendar" isCollapsed={isCollapsed} />
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-800/50 mt-auto">
        <button 
          onClick={onLogout} 
          className={`w-full flex items-center gap-2 py-3 text-sm font-black text-red-400 bg-red-400/5 rounded-2xl hover:bg-red-500 hover:text-white transition-all duration-200 ${isCollapsed ? 'justify-center' : 'px-3'}`}
        >
          <span>🚪</span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}