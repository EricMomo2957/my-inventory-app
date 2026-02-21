import React, { useState, useMemo } from 'react';

// REMOVED: ClerkSidenav import (Handled by App.jsx)

export default function ClerkProfile() {
  const [isDarkMode] = useState(() => localStorage.getItem('landingTheme') === 'dark');

  const userData = useMemo(() => ({
    full_name: localStorage.getItem('userName') || 'System Administrators',
    email: localStorage.getItem('userEmail') || 'admin@inventory.com',
    role: localStorage.getItem('userRole') || 'admin',
    userId: localStorage.getItem('userId') || '11',
    department: localStorage.getItem('userDept') || 'IT Department'
  }), []);

  return (
    // REMOVED: flex and min-h-screen classes to prevent layout breaking
    <div className={`w-full transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      
      {/* Main Content Area - Padding adjusted for global layout */}
      <main className="p-6 lg:p-10 max-w-7xl mx-auto">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Header Section */}
          <header className="mb-10">
            <h1 className="text-3xl font-black tracking-tight text-white">Clerk Profile</h1>
            <p className="text-slate-500 font-medium">Manage your personal information and security credentials</p>
          </header>

          {/* Top Profile Card - Glassmorphism Style */}
          <div className={`relative p-10 rounded-3xl flex flex-col items-center justify-center text-center backdrop-blur-md transition-all ${
            isDarkMode 
              ? 'bg-[#111827]/40 border border-slate-800 shadow-2xl' 
              : 'bg-white/80 border border-slate-200 shadow-xl'
          }`}>
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-full border-[4px] border-[#4361ee]/20 p-1 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#4361ee] to-purple-600 flex items-center justify-center text-white text-4xl font-black relative overflow-hidden shadow-2xl">
                  {userData.full_name.charAt(0).toUpperCase()}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                    <span className="text-[10px] font-black tracking-tighter">UPDATE PHOTO</span>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-black tracking-tight text-white mb-1">{userData.full_name}</h2>
            <p className="text-[#4361ee] font-black text-xs uppercase tracking-[0.2em] mb-8">{userData.role}</p>
            
            <button className="px-8 py-3 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-[10px] font-black tracking-widest uppercase transition-all active:scale-95">
              Edit Profile Settings
            </button>
          </div>

          {/* Bottom Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left: Profile Details */}
            <div className={`p-8 rounded-3xl border backdrop-blur-md ${isDarkMode ? 'bg-[#111827]/40 border-slate-800' : 'bg-white border-slate-200 shadow-lg'}`}>
              <div className="flex items-center gap-3 mb-8">
                <span className="text-xl">📋</span>
                <h3 className="text-lg font-black text-white">Account Details</h3>
              </div>
              
              <div className="space-y-6">
                <DetailRow label="Full Name" value={userData.full_name} />
                <DetailRow label="Email Address" value={userData.email} />
                <DetailRow label="System ID" value={`#${userData.userId}`} />
                <DetailRow label="Assigned Dept" value={userData.department} />
              </div>
            </div>

            {/* Right: Security Settings */}
            <div className={`p-8 rounded-3xl border backdrop-blur-md ${isDarkMode ? 'bg-[#111827]/40 border-slate-800' : 'bg-white border-slate-200 shadow-lg'}`}>
              <div className="flex items-center gap-3 mb-8">
                <span className="text-xl">🔒</span>
                <h3 className="text-lg font-black text-white">Security & Access</h3>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className={`w-full px-5 py-4 rounded-xl border outline-none focus:ring-4 transition-all ${
                      isDarkMode 
                        ? 'bg-[#0b1120] border-slate-800 focus:border-[#4361ee] focus:ring-[#4361ee]/10 text-white' 
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Verify Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className={`w-full px-5 py-4 rounded-xl border outline-none focus:ring-4 transition-all ${
                      isDarkMode 
                        ? 'bg-[#0b1120] border-slate-800 focus:border-[#4361ee] focus:ring-[#4361ee]/10 text-white' 
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                <button className="w-full mt-6 py-4 bg-[#4361ee] hover:bg-[#3651d4] text-white rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-xl shadow-[#4361ee]/20 active:scale-95">
                  Save Security Changes
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="group border-b border-slate-800/50 pb-4 last:border-0">
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-[#4361ee] transition-colors">{label}</p>
      <p className="text-sm font-bold text-slate-200">{value}</p>
    </div>
  );
}