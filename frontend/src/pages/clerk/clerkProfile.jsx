import React, { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext'; // Import your global theme hook

export default function ClerkProfile() {
  // Use context instead of local state for instant updates
  const { isDark } = useTheme();

  const userData = useMemo(() => ({
    full_name: localStorage.getItem('userName') || 'System Administrator',
    email: localStorage.getItem('userEmail') || 'admin@inventory.com',
    role: localStorage.getItem('userRole') || 'admin',
    userId: localStorage.getItem('userId') || '11',
    department: localStorage.getItem('userDept') || 'IT Department'
  }), []);

  return (
    <div className={`w-full min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <main className="p-6 lg:p-10 max-w-7xl mx-auto">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Header Section */}
          <header className="mb-10">
            <h1 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Clerk Profile
            </h1>
            <p className="text-slate-500 font-medium">Manage your personal information and security credentials</p>
          </header>

          {/* Top Profile Card */}
          <div className={`relative p-10 rounded-3xl flex flex-col items-center justify-center text-center backdrop-blur-md transition-all ${
            isDark 
              ? 'bg-[#111827]/40 border border-slate-800 shadow-2xl' 
              : 'bg-white border border-slate-200 shadow-xl'
          }`}>
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-[#4361ee]/20 p-1 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-linear-to-br from-[#4361ee] to-purple-600 flex items-center justify-center text-white text-4xl font-black relative overflow-hidden shadow-2xl">
                  {userData.full_name.charAt(0).toUpperCase()}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                    <span className="text-[10px] font-black tracking-tighter">UPDATE PHOTO</span>
                  </div>
                </div>
              </div>
            </div>

            <h2 className={`text-3xl font-black tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {userData.full_name}
            </h2>
            <p className="text-[#4361ee] font-black text-xs uppercase tracking-[0.2em] mb-8">{userData.role}</p>
            
            <button className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all active:scale-95 border ${
              isDark 
                ? 'bg-slate-800/50 hover:bg-slate-700 border-slate-700 text-white' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}>
              Edit Profile Settings
            </button>
          </div>

          {/* Bottom Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left: Profile Details */}
            <div className={`p-8 rounded-3xl border backdrop-blur-md ${isDark ? 'bg-[#111827]/40 border-slate-800' : 'bg-white border-slate-200 shadow-lg'}`}>
              <div className="flex items-center gap-3 mb-8">
                <span className="text-xl">📋</span>
                <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Account Details</h3>
              </div>
              
              <div className="space-y-6">
                <DetailRow label="Full Name" value={userData.full_name} isDark={isDark} />
                <DetailRow label="Email Address" value={userData.email} isDark={isDark} />
                <DetailRow label="System ID" value={`#${userData.userId}`} isDark={isDark} />
                <DetailRow label="Assigned Dept" value={userData.department} isDark={isDark} />
              </div>
            </div>

            {/* Right: Security Settings */}
            <div className={`p-8 rounded-3xl border backdrop-blur-md ${isDark ? 'bg-[#111827]/40 border-slate-800' : 'bg-white border-slate-200 shadow-lg'}`}>
              <div className="flex items-center gap-3 mb-8">
                <span className="text-xl">🔒</span>
                <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Security & Access</h3>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className={`w-full px-5 py-4 rounded-xl border outline-none focus:ring-4 transition-all ${
                      isDark 
                        ? 'bg-[#0b1120] border-slate-800 focus:border-[#4361ee] focus:ring-[#4361ee]/10 text-white' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#4361ee] focus:ring-[#4361ee]/5'
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Verify Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className={`w-full px-5 py-4 rounded-xl border outline-none focus:ring-4 transition-all ${
                      isDark 
                        ? 'bg-[#0b1120] border-slate-800 focus:border-[#4361ee] focus:ring-[#4361ee]/10 text-white' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#4361ee] focus:ring-[#4361ee]/5'
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

// Pass isDark down to the DetailRow for text color adjustment
function DetailRow({ label, value, isDark }) {
  return (
    <div className={`group border-b pb-4 last:border-0 ${isDark ? 'border-slate-800/50' : 'border-slate-100'}`}>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-[#4361ee] transition-colors">{label}</p>
      <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{value}</p>
    </div>
  );
}