import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext'; // Ensure this path is correct

/**
 * UI COMPONENTS: Profile Stats Card
 */
function ProfileStat({ label, value, icon, color }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${color} bg-white dark:bg-slate-800 shadow-sm`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-lg font-black text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

export default function AdminProfile() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme(); // Integrated Theme Hook

  const adminData = {
    name: localStorage.getItem('userName') || "Administrator",
    role: "System Superuser",
    email: localStorage.getItem('userEmail') || "admin@pro.com",
    joined: "Jan 2026",
    status: "Active",
    avatar: `https://ui-avatars.com/api/?name=${localStorage.getItem('userName') || 'Admin'}&background=4361ee&color=fff&size=256`
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header with Background Pattern */}
      <div className="relative h-48 bg-linear-to-r from-indigo-600 to-[#4361ee]">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      <div className="px-8 -mt-20 space-y-8 pb-12">
        {/* Main Profile Card */}
        <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-8">
          <div className="relative">
            <img 
              src={adminData.avatar} 
              alt="Profile" 
              className="w-40 h-40 rounded-4xl border-8 border-white dark:border-[#111827] shadow-xl object-cover"
            />
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white dark:border-[#111827]"></div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">{adminData.name}</h1>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full self-center">
                {adminData.role}
              </span>
            </div>
            <p className="text-slate-500 font-medium mb-4">{adminData.email}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <button 
                onClick={() => navigate('/admin/profile')} 
                className="px-6 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold text-sm hover:scale-105 transition-transform"
              >
                Edit Profile
              </button>
              
              {/* Theme Toggle Button */}
              <button 
                onClick={toggleTheme}
                className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats and Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2">Quick Stats</h3>
            <div className="grid grid-cols-1 gap-4">
              <ProfileStat label="Member Since" value={adminData.joined} icon="📅" color="text-blue-500" />
              <ProfileStat label="Actions Logged" value="1,284" icon="⚡" color="text-amber-500" />
              <ProfileStat label="System Status" value="Healthy" icon="🛡️" color="text-emerald-500" />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2">Administrative Bio</h3>
            <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Senior Administrator responsible for system-wide inventory management, user auditing, and operational oversight. 
                Currently overseeing the Q1 Harvest inventory cycle and managing cross-departmental permissions for clerks and users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}