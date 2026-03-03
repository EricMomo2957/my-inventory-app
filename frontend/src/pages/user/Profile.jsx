import React, { useState, useMemo, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function UserProfile() {
  const { isDark } = useTheme();

  // --- State Management ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Local state for the form, initialized from localStorage
  // Ensure these keys ('userName', 'userEmail', etc.) match your login logic
  const [formData, setFormData] = useState({
    full_name: localStorage.getItem('userName') || 'User Member',
    email: localStorage.getItem('userEmail') || 'user@example.com',
    department: localStorage.getItem('userDept') || 'General Department',
    userId: localStorage.getItem('userId') || '00'
  });

  // Memoize data for the display cards
  const displayData = useMemo(() => ({
    ...formData,
    role: localStorage.getItem('userRole') || 'User'
  }), [formData]);

  // --- Handlers ---
  const handleSave = useCallback(() => {
    // Update LocalStorage to persist changes locally
    localStorage.setItem('userName', formData.full_name);
    localStorage.setItem('userEmail', formData.email);
    localStorage.setItem('userDept', formData.department);
    
    // Close modal
    setIsModalOpen(false);
    
    console.log("User Profile Updated locally");
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={`w-full min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <main className="p-6 lg:p-10 max-w-7xl mx-auto">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Header Section */}
          <header className="mb-10">
            <h1 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              My Profile
            </h1>
            <p className="text-slate-500 font-medium">View and manage your account information</p>
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
                  {displayData.full_name.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            <h2 className={`text-3xl font-black tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {displayData.full_name}
            </h2>
            <p className="text-[#4361ee] font-black text-xs uppercase tracking-[0.2em] mb-8">{displayData.role}</p>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all active:scale-95 border ${
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
                <DetailRow label="Full Name" value={displayData.full_name} isDark={isDark} />
                <DetailRow label="Email Address" value={displayData.email} isDark={isDark} />
                <DetailRow label="User ID" value={`#${displayData.userId}`} isDark={isDark} />
                <DetailRow label="Department" value={displayData.department} isDark={isDark} />
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
                <button className="w-full mt-6 py-4 bg-[#4361ee] hover:bg-[#3651d4] text-white rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-xl shadow-[#4361ee]/20 active:scale-95">
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- EDIT PROFILE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`w-full max-w-lg p-8 rounded-3xl shadow-2xl border transition-all transform animate-in zoom-in-95 duration-300 ${
            isDark ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-white text-slate-900'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black italic uppercase tracking-tight">Edit Profile</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-red-500 transition-colors text-2xl">×</button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Full Name</label>
                <input 
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className={`w-full px-5 py-3 rounded-xl border outline-none ${
                    isDark ? 'bg-[#0b1120] border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Email Address</label>
                <input 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-5 py-3 rounded-xl border outline-none ${
                    isDark ? 'bg-[#0b1120] border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Department</label>
                <input 
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`w-full px-5 py-3 rounded-xl border outline-none ${
                    isDark ? 'bg-[#0b1120] border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-4 bg-[#4361ee] text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, isDark }) {
  return (
    <div className={`group border-b pb-4 last:border-0 ${isDark ? 'border-slate-800/50' : 'border-slate-100'}`}>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-[#4361ee] transition-colors">{label}</p>
      <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{value}</p>
    </div>
  );
}