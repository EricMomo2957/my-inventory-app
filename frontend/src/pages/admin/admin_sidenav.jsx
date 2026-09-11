import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { 
  LayoutDashboard, 
  PackagePlus,
  Scale,
  CalendarDays, 
  Users, 
  History, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  PackageCheck,
  MapPin,
  Building2,
  FileText,
  Zap,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

export default function AdminSideNav() {
  const { isDark } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const adminName = localStorage.getItem('fullName') || localStorage.getItem('userName') || 'Admin';
  const role = localStorage.getItem('userRole') || 'ADMIN';
  const profileImage = localStorage.getItem('userPhoto') || localStorage.getItem('profileImage');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login'; 
  };

  const menuItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Warehouse Map', path: '/admin/location-map', icon: MapPin },
    { name: 'Categories', path: '/admin/categories', icon: Building2 },
    { name: 'Stock In (Receive)', path: '/admin/stock-in', icon: PackagePlus },
    { name: 'Purchase Orders', path: '/admin/purchase-orders', icon: FileText },
    { name: 'Suppliers', path: '/admin/suppliers', icon: Building2 },
    { name: 'Damaged & RTV', path: '/admin/damaged-items', icon: Zap },
    { name: 'Reorder Desk', path: '/admin/reorder-requisition', icon: Zap },
    { name: 'ABC Analytics', path: '/admin/abc-analytics', icon: TrendingUp },
    { name: 'Cycle Count Audit', path: '/admin/cycle-count', icon: Scale },
    { name: 'Audit Reports', path: '/admin/report-studio', icon: FileSpreadsheet },
    { name: 'Stock Movement', path: '/admin/history', icon: History },
    { name: 'Staff Management', path: '/admin/users', icon: Users },
    { name: 'Inquiries', path: '/admin/inquiries', icon: MessageSquare },
    { name: 'Calendar', path: '/calendar', icon: CalendarDays },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} min-h-screen flex flex-col transition-all duration-300 border-r shrink-0 select-none ${
      isDark ? 'bg-[#0f172a] border-slate-800 text-slate-200' : 'bg-white border-slate-100 text-slate-700'
    }`}>
      
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00684a] text-white flex items-center justify-center shadow-md shadow-[#00684a]/20">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Mind<span className="text-[#00684a]">Stock</span>
              </h1>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto w-9 h-9 rounded-xl bg-[#00684a] text-white flex items-center justify-center shadow-md shadow-[#00684a]/20">
            <PackageCheck className="w-5 h-5" />
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg border text-slate-400 hover:text-slate-600 transition-colors ${
            isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-100 hover:bg-slate-50'
          }`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User Card Chip */}
      <div className="px-4 mb-4">
        {!collapsed ? (
          <div className={`p-3 rounded-2xl flex items-center gap-3 border transition-colors ${
            isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-[#e6f4ea]/70 border-[#ccebd7]'
          }`}>
            <div className="w-10 h-10 rounded-full bg-[#00684a]/10 text-[#00684a] dark:text-emerald-400 flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 border border-[#00684a]/20">
              {profileImage ? (
                <img src={profileImage.startsWith('http') ? profileImage : `http://localhost:3000${profileImage}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                adminName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-bold truncate leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {adminName}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-bold text-[#00684a] dark:text-emerald-400 tracking-wider uppercase">
                  {role}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-[#00684a]/10 text-[#00684a] flex items-center justify-center font-bold text-sm">
              {adminName.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              title={collapsed ? item.name : undefined}
              className={({ isActive }) => `
                flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                ${isActive 
                  ? 'bg-[#00684a] text-white shadow-sm shadow-[#00684a]/30' 
                  : `${isDark ? 'text-slate-400 hover:bg-slate-800/70 hover:text-white' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'}`
                }
                ${collapsed ? 'justify-center px-0' : ''}
              `}
            >
              <Icon className={`w-5 h-5 shrink-0 ${collapsed ? 'w-5 h-5' : ''}`} />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section: Log Out & Brand Tag */}
      <div className="p-3 border-t mt-auto border-slate-100 dark:border-slate-800/80">
        <button 
          onClick={handleLogout}
          title={collapsed ? "Log Out" : undefined}
          className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all ${
            collapsed ? 'justify-center px-0' : ''
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>

        {!collapsed && (
          <div className="mt-3 pt-3 px-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="text-xs">📦</span> By MindStock
            </span>
            <span className="text-[10px] font-mono">v1.2</span>
          </div>
        )}
      </div>
    </aside>
  );
}