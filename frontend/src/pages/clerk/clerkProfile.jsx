import React, { useState, useMemo } from 'react';
import ClerkSidenav from './ClerkSidenav';

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
    <div className={`flex min-h-screen w-full transition-colors duration-300 ${isDarkMode ? 'bg-[#0b1120] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Sidebar Navigation */}
      <ClerkSidenav />

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
          
          {/* Top Profile Header Section */}
          <div className={`relative p-8 rounded-2xl flex flex-col items-center justify-center text-center ${isDarkMode ? 'bg-[#111827]/50 border border-slate-800' : 'bg-white shadow-sm'}`}>
             {/* Circular Avatar with Ring */}
            <div className="relative group mb-4">
              <div className="w-32 h-32 rounded-full border-[3px] border-blue-600/30 p-1 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 text-3xl font-black relative overflow-hidden">
                  {userData.full_name.charAt(0).toUpperCase()}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-[10px] text-white">CHANGE</span>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-black tracking-tight">{userData.full_name}</h2>
            <p className="text-slate-500 font-bold text-sm mb-6 lowercase">{userData.role}</p>
            
            <button className="px-6 py-2 bg-transparent border border-slate-700 hover:bg-slate-800 text-slate-200 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all">
              Edit Profile & Photo
            </button>
          </div>

          {/* Bottom Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: Profile Details */}
            <div className={`p-8 rounded-2xl border ${isDarkMode ? 'bg-[#111827]/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className="text-lg font-black mb-8">Profile Details</h3>
              
              <div className="space-y-6">
                <DetailRow label="Full Name" value={userData.full_name} />
                <DetailRow label="Email" value={userData.email} />
                <DetailRow label="User ID" value={userData.userId} />
                <DetailRow label="Department" value={userData.department} />
                <DetailRow label="Role" value={userData.role} />
              </div>
            </div>

            {/* Right: Security Settings */}
            <div className={`p-8 rounded-2xl border ${isDarkMode ? 'bg-[#111827]/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className="text-lg font-black mb-8">Security</h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">New Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter new password"
                    className={`w-full px-4 py-3 rounded-lg border outline-none transition-all ${isDarkMode ? 'bg-[#0f172a] border-slate-800 focus:border-blue-500 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confirm New Password</label>
                  <input 
                    type="password" 
                    placeholder="Repeat new password"
                    className={`w-full px-4 py-3 rounded-lg border outline-none transition-all ${isDarkMode ? 'bg-[#0f172a] border-slate-800 focus:border-blue-500 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                <button className="w-full mt-4 py-3 bg-[#1e293b] hover:bg-blue-600 text-white rounded-lg text-xs font-black tracking-widest uppercase transition-all shadow-lg">
                  Update Password
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// Helper component for the detail rows
function DetailRow({ label, value }) {
  return (
    <div className="border-b border-slate-800/50 pb-4">
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-200">{value}</p>
    </div>
  );
}