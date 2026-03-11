import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export default function AdminSideNav() {
  const { isDark } = useTheme();

  // 1. Robust Auth Check: Look for any available ID key
  const adminId = localStorage.getItem('adminId') || localStorage.getItem('userId') || localStorage.getItem('id');
  const adminName = localStorage.getItem('fullName') || localStorage.getItem('userName') || 'Administrator';
  const department = localStorage.getItem('department');
  const profileImage = localStorage.getItem('profileImage');

  // 2. Modified Auth Guard: 
  // If no ID is found, we can still render the nav but show "Guest" 
  // to prevent the "vanishing" effect if a key name changes.
  const isAuthenticated = !!adminId;

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login'; 
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'User Management', path: '/admin/users', icon: '👥' },
    { name: 'Stock History', path: '/admin/history', icon: '📜' },
    { name: 'Analytics', path: '/admin/reports', icon: '📈' },
    { name: 'Inquiries', path: '/admin/inquiries', icon: '📩' },
    { name: 'Calendar', path: '/calendar', icon: '📅' },
    { name: 'Profile', path: '/Profile', icon: '👤' },
    { name: 'Settings', path: '/admin/settings', icon: '⚙️' }, 
  ];

  return (
    <aside className={`w-64 min-h-screen flex flex-col transition-colors duration-300 border-r ${
      isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-white border-slate-200'
    }`}>
      
      {/* Brand Header */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-blue-500/20">
            📦
          </div>
          <h1 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Admin<span className="text-blue-600">Pro</span>
          </h1>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
          Admin Menu
        </p>
        
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all
              ${isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                : `${isDark ? 'text-slate-400 hover:bg-slate-800/50' : 'text-slate-600 hover:bg-slate-100'}`
              }
            `}
          >
            <span className="text-lg">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile Section */}
      <div className="p-4 mt-auto">
        <div className={`p-4 rounded-3xl border ${
          isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 overflow-hidden flex items-center justify-center bg-blue-600 text-white font-black shrink-0">
                {profileImage ? (
                  <img src={profileImage} alt="Admin" className="w-full h-full object-cover" />
                ) : (
                  adminName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="overflow-hidden">
                <p className={`text-xs font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {isAuthenticated ? adminName : "Guest Admin"}
                </p>
                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter">
                  ID: {adminId || 'N/A'}
                </p>
              </div>
            </div>
            
            <div className={`px-3 py-1.5 rounded-xl text-[9px] font-bold text-center uppercase border ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
            }`}>
              Dept: {department || 'Management'}
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 flex items-center justify-center gap-2"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </div>
    </aside>
  );
}