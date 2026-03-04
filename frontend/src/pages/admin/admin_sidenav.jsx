import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext'; // Ensure path matches your structure

export default function AdminSideNav() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Retrieve admin info from localStorage (stored during login)
  const adminName = localStorage.getItem('userName') || 'Administrator';
  const adminEmail = localStorage.getItem('userEmail') || 'admin@pro.com';
  const adminPhoto = localStorage.getItem('userPhoto');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'User Management', path: '/admin/management', icon: '👥' },
    { name: 'Calendar', path: '/admin/calendar', icon: '📅' },
    { name: 'Profile', path: '/admin/profile', icon: '👤' },
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
      <nav className="flex-1 px-4 space-y-2">
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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full border-2 border-blue-500/20 overflow-hidden flex items-center justify-center bg-blue-600 text-white font-black">
              {adminPhoto ? (
                <img src={adminPhoto} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                adminName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="overflow-hidden">
              <p className={`text-xs font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {adminName}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{adminEmail}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </div>
    </aside>
  );
}