import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext'; // Ensure this path matches your project

export default function AdminSetting() {
  const { isDark, toggleTheme } = useTheme(); // Hook into your theme context

  const [profile, setProfile] = useState({
    fullName: localStorage.getItem('fullName') || 'Administrator',
    email: localStorage.getItem('userEmail') || 'admin@pro.com',
    adminId: localStorage.getItem('adminId') || 'ADM-1029',
    department: localStorage.getItem('department') || 'Main Management',
    profileImage: localStorage.getItem('profileImage') || null,
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

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
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <header className="p-8 border-b border-slate-200 dark:border-slate-800/50">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Account Settings</h1>
        <p className="text-slate-500 text-sm font-medium">Manage your administrative profile and security</p>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-4xl text-white font-black border-4 border-slate-50 dark:border-slate-800 overflow-hidden">
                  {profile.profileImage ? (
                    <img src={profile.profileImage} alt="Admin" className="w-full h-full object-cover" />
                  ) : profile.fullName.charAt(0)}
                </div>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{profile.fullName}</h2>
              <p className="text-sm text-blue-500 font-bold uppercase tracking-widest">{profile.department}</p>
            </div>

            {/* Appearance Section */}
            <section className="bg-white dark:bg-[#111827] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span>🎨</span> Appearance
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Dark Mode</span>
                <button 
                  onClick={toggleTheme}
                  className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${isDark ? 'bg-blue-600 justify-end' : 'bg-slate-200 justify-start'}`}
                >
                  <div className="w-6 h-6 bg-white rounded-full shadow-sm" />
                </button>
              </div>
            </section>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white dark:bg-[#111827] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6"><span>👤</span> General Information</h3>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white outline-none" value={profile.fullName} onChange={(e) => setProfile({...profile, fullName: e.target.value})} />
                  <input type="email" disabled className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-400 cursor-not-allowed" value={profile.email} />
                </div>
                <button type="submit" className="px-8 py-4 bg-[#4361ee] text-white rounded-2xl font-bold hover:bg-blue-500 transition-colors">Save Changes</button>
              </form>
            </section>

            <section className="bg-white dark:bg-[#111827] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6"><span>🔒</span> Security & Password</h3>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <input type="password" placeholder="Current Password" className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white outline-none" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="password" placeholder="New Password" className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white outline-none" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} />
                  <input type="password" placeholder="Confirm New Password" className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white outline-none" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} />
                </div>
                <button type="submit" className="px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors">Update Password</button>
              </form>
            </section>

            <section className="bg-red-500/5 rounded-[2.5rem] p-8 border border-red-500/20">
              <h3 className="text-lg font-black text-red-600 mb-2"><span>⚠️</span> Danger Zone</h3>
              <button onClick={handleDeleteAccount} className="px-8 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-colors">Delete Account</button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}