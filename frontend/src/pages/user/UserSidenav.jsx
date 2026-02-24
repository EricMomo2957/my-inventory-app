import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext'; // Path from your Profile.jsx

function NavItem({ icon, label, to, isCollapsed, isDark, onClick }) {
  return (
    <NavLink 
      to={to}
      onClick={onClick}
      className={({ isActive }) => `
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-black transition-all duration-200 
        ${isActive 
          ? 'bg-[#4361ee]/10 text-[#4361ee]' 
          : isDark 
            ? 'text-slate-400 hover:bg-slate-800/50 hover:text-white' 
            : 'text-slate-500 hover:bg-slate-100 hover:text-[#4361ee]'
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

export default function UserSidenav({ onLogout }) {
  const { isDark } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // SYNC WITH LOCALSTORAGE (Matches Profile.jsx logic)
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : { full_name: 'User', role: 'Member', profile_image: '' };
  });

  // Listen for storage changes to update image/name instantly if changed in Profile
  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('user');
      if (saved) setUserData(JSON.parse(saved));
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  const initials = userData.full_name 
    ? userData.full_name.split(' ').map(n => n[0]).join('').toUpperCase() 
    : "U";

  return (
    <aside className={`flex flex-col shrink-0 h-screen transition-all duration-300 ease-in-out sticky top-0 z-50 border-r ${
      isCollapsed ? 'w-20' : 'w-64'
    } ${
      isDark ? 'bg-[#0b1120] border-slate-800/50' : 'bg-white border-slate-200'
    }`}>
      
      {/* Brand Header */}
      <div className={`p-7 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-2`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4361ee] rounded-xl flex items-center justify-center shadow-lg text-xl shadow-blue-500/20">📦</div>
            <h2 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Inventory</h2>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}
        >
          {isCollapsed ? '➡️' : '⬅️'}
        </button>
      </div>
      
      {/* User Info Card - Displays Real Profile Image */}
      <div className={`${isCollapsed ? 'flex justify-center' : 'mx-4'} mb-6`}>
        <div className={`p-3 border rounded-[1.25rem] flex items-center gap-3 overflow-hidden transition-all ${
          isCollapsed ? 'w-12 h-12 p-0 justify-center' : ''
        } ${
          isDark ? 'bg-[#1e293b]/50 border-slate-800/50' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="w-10 h-10 bg-[#4361ee] shrink-0 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-inner overflow-hidden border-2 border-white/10">
            {userData.profile_image ? (
              <img 
                src={`http://localhost:3000${userData.profile_image}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className={`text-sm font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {userData.full_name}
              </span>
              <small className="text-[10px] text-slate-500 uppercase tracking-widest font-black truncate">
                {userData.role}
              </small>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {!isCollapsed && (
          <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 mt-4">Main Menu</p>
        )}
        
        <NavItem icon="🏠" label="Dashboard" to="/user_dashboard" isCollapsed={isCollapsed} isDark={isDark} />
        
        {/* NEWLY ADDED: Favorites Link */}
        <NavItem icon="❤️" label="Favorites" to="/Favorite" isCollapsed={isCollapsed} isDark={isDark} />
        
        <NavItem icon="📅" label="Calendar" to="/user_calendar" isCollapsed={isCollapsed} isDark={isDark} />
        
        {!isCollapsed && (
          <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 mt-8">Account</p>
        )}
        
        <NavItem icon="📜" label="My Orders" to="/Orders" isCollapsed={isCollapsed} isDark={isDark} />
        <NavItem icon="👤" label="Profile" to="/Profile" isCollapsed={isCollapsed} isDark={isDark} />
        <NavItem icon="⚙️" label="Settings" to="/Settings" isCollapsed={isCollapsed} isDark={isDark} />
      </nav>

      {/* Logout Button */}
      <div className={`p-4 border-t mt-auto ${isDark ? 'border-slate-800/50' : 'border-slate-100'}`}>
        <button 
          onClick={onLogout} 
          className={`w-full flex items-center gap-2 py-3 text-sm font-black transition-all duration-200 
            bg-red-500/5 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white 
            ${isCollapsed ? 'justify-center' : 'px-4'}`}
        >
          <span>🚪</span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}