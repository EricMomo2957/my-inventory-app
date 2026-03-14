import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function AdminSetting() {
  const { isDark, toggleTheme } = useTheme();

  const [profile, setProfile] = useState({
    fullName: localStorage.getItem('fullName') || 'Administrator',
    email: localStorage.getItem('userEmail') || 'admin@pro.com',
    adminId: localStorage.getItem('adminId') || 'ADM-1029',
    department: localStorage.getItem('department') || 'Main Management',
    profileImage: localStorage.getItem('profileImage') || null,
  });

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    localStorage.setItem('fullName', profile.fullName);
    localStorage.setItem('department', profile.department);
    alert('Profile updated successfully!');
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("New passwords don't match!");
      return;
    }
    alert('Password updated successfully!');
    setPasswords({ current: '', new: '' , confirm: '' });
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure? This action cannot be undone.")) {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#0b1120]' : 'bg-slate-50'}`}>
      {/* Hero Header Section */}
      <div className={`p-8 pb-32 ${isDark ? 'bg-gradient-to-br from-indigo-900/20 to-transparent' : 'bg-gradient-to-br from-orange-500/10 to-transparent'}`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl bg-orange-500 flex items-center justify-center text-5xl text-white font-black shadow-2xl overflow-hidden border-4 border-white dark:border-slate-800">
              {profile.profileImage ? (
                <img src={profile.profileImage} alt="Admin" className="w-full h-full object-cover" />
              ) : profile.fullName.charAt(0)}
            </div>
            <button className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg text-xs">📸</button>
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h1 className={`text-4xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile.fullName}</h1>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <span className="px-3 py-1 bg-orange-500/20 text-orange-500 rounded-lg text-xs font-black uppercase tracking-widest">{profile.department}</span>
              <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>{profile.adminId}</span>
            </div>
          </div>

          <div className={`p-4 rounded-3xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white/50 border-slate-200'} backdrop-blur-md`}>
            <div className="flex items-center gap-4">
               <span className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Dark Mode</span>
               <button onClick={toggleTheme} className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${isDark ? 'bg-orange-500' : 'bg-slate-300'}`}>
                 <div className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform ${isDark ? 'translate-x-6' : 'translate-x-0'}`} />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="max-w-6xl mx-auto px-8 -mt-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* General Information */}
          <section className={`p-8 rounded-[2.5rem] border shadow-2xl transition-all ${isDark ? 'bg-[#111827] border-slate-800 shadow-black/40' : 'bg-white border-slate-100 shadow-slate-200'}`}>
            <h3 className={`text-xl font-black mb-8 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <span className="p-2 bg-blue-500/10 text-blue-500 rounded-xl text-base">👤</span> General Info
            </h3>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Full Name</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" value={profile.fullName} onChange={(e) => setProfile({...profile, fullName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Email (Read Only)</label>
                <input type="email" disabled className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-400 cursor-not-allowed italic" value={profile.email} />
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]">Save Profile Changes</button>
            </form>
          </section>

          {/* Security */}
          <section className={`p-8 rounded-[2.5rem] border shadow-2xl transition-all ${isDark ? 'bg-[#111827] border-slate-800 shadow-black/40' : 'bg-white border-slate-100 shadow-slate-200'}`}>
            <h3 className={`text-xl font-black mb-8 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <span className="p-2 bg-orange-500/10 text-orange-500 rounded-xl text-base">🔒</span> Security
            </h3>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <input type="password" placeholder="Current Password" className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/50 transition-all" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="password" placeholder="New Password" className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/50 transition-all" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} />
                <input type="password" placeholder="Confirm Password" className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/50 transition-all" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold hover:opacity-90 transition-all active:scale-[0.98]">Update Password</button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
               <h4 className="text-red-500 text-sm font-black uppercase tracking-tighter mb-4">Danger Zone</h4>
               <button onClick={handleDeleteAccount} className="w-full py-3 border-2 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl font-bold transition-all">Delete My Account</button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}