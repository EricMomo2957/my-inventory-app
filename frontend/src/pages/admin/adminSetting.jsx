import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function AdminSetting() {
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');

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

  const tabs = [
    { id: 'profile', label: 'General Profile', icon: '👤' },
    { id: 'security', label: 'Security & Privacy', icon: '🔒' },
    { id: 'appearance', label: 'Interface Settings', icon: '🎨' },
  ];

  return (
    // Changed: p-4/p-8 to p-0 so it can touch the edges if needed, though kept a small margin for aesthetics
    <div className={`min-h-[calc(100vh-2rem)] m-4 flex items-stretch justify-center transition-colors duration-500 ${isDark ? 'bg-[#0b1120]' : 'bg-slate-100'}`}>
      
      {/* Changed: max-w-5xl to max-w-[1400px] and min-h-[80vh] to expand the box */}
      <div className={`w-full max-w-425 min-h-187.5 flex flex-col md:flex-row rounded-[2.5rem] shadow-2xl border overflow-hidden transition-all duration-500 ${isDark ? 'bg-[#111827] border-slate-800 shadow-black/50' : 'bg-white border-white shadow-slate-300'}`}>
        
        {/* Sidebar Navigation - Widened slightly to md:w-80 */}
        <aside className={`w-full md:w-80 p-10 flex flex-col justify-between ${isDark ? 'bg-slate-900/60' : 'bg-slate-50'}`}>
          <div>
            <div className="flex items-center gap-5 mb-12">
              <div className="w-16 h-16 rounded-3xl bg-orange-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-orange-500/20">
                {profile.fullName.charAt(0)}
              </div>
              <div>
                <h2 className={`font-black text-lg leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile.fullName}</h2>
                <p className="text-[11px] uppercase tracking-[0.2em] text-orange-500 font-bold mt-1">{profile.department}</p>
              </div>
            </div>

            <nav className="space-y-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl text-sm font-black transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/40 translate-x-2' 
                      : `hover:bg-slate-200/50 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="pt-10">
            <button onClick={handleDeleteAccount} className="w-full py-4 rounded-2xl border-2 border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">
              Delete Account
            </button>
          </div>
        </aside>

        {/* Dynamic Content Area - Expanded padding for a "spacious" feel */}
        <main className="flex-1 p-10 md:p-20 overflow-y-auto">
          {activeTab === 'profile' && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className={`text-4xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>General Profile</h3>
              <p className="text-slate-500 font-medium mb-12">Manage your administrative identity and profile details.</p>
              
              <form onSubmit={handleProfileUpdate} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">Display Name</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-[#0b1120] border-2 border-slate-200 dark:border-slate-800 focus:border-orange-500 rounded-2xl p-5 text-slate-900 dark:text-white outline-none transition-all shadow-sm" value={profile.fullName} onChange={(e) => setProfile({...profile, fullName: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">Email Address (Fixed)</label>
                  <input type="email" disabled className="w-full bg-slate-100/50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-slate-400 cursor-not-allowed italic font-medium" value={profile.email} />
                </div>
                <button type="submit" className="px-12 py-5 bg-orange-500 text-white rounded-2xl font-black shadow-2xl shadow-orange-500/30 hover:bg-orange-600 hover:-translate-y-1 active:translate-y-0 transition-all">Save Profile Changes</button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className={`text-4xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Security Settings</h3>
              <p className="text-slate-500 font-medium mb-12">Update your password to keep your administrative account secure.</p>
              
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Verification</label>
                   <input type="password" placeholder="Current Password" className="w-full bg-slate-50 dark:bg-[#0b1120] border-2 border-slate-200 dark:border-slate-800 focus:border-orange-500 rounded-2xl p-5 text-slate-900 dark:text-white outline-none transition-all" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-slate-50 dark:bg-[#0b1120] border-2 border-slate-200 dark:border-slate-800 focus:border-orange-500 rounded-2xl p-5 text-slate-900 dark:text-white outline-none transition-all" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirm</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-slate-50 dark:bg-[#0b1120] border-2 border-slate-200 dark:border-slate-800 focus:border-orange-500 rounded-2xl p-5 text-slate-900 dark:text-white outline-none transition-all" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className={`mt-4 px-12 py-5 rounded-2xl font-black shadow-xl transition-all hover:-translate-y-1 active:translate-y-0 ${isDark ? 'bg-white text-slate-900 shadow-white/10' : 'bg-slate-900 text-white shadow-slate-900/20'}`}>Update Security Access</button>
              </form>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className={`text-4xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Appearance</h3>
              <p className="text-slate-500 font-medium mb-12">Customize the visual interface of the Inventory Pro system.</p>
              
              <div className={`p-10 rounded-[2.5rem] border flex items-center justify-between transition-all ${isDark ? 'bg-[#0b1120] border-slate-800 shadow-inner' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${isDark ? 'bg-slate-800 text-yellow-400' : 'bg-white text-blue-600 shadow-sm'}`}>
                    {isDark ? '🌙' : '☀️'}
                  </div>
                  <div>
                    <h4 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Dark Theme</h4>
                    <p className="text-sm text-slate-500 font-medium">Toggle between light and dark UI</p>
                  </div>
                </div>
                <button onClick={toggleTheme} className={`w-20 h-10 rounded-full transition-all flex items-center px-2 ${isDark ? 'bg-orange-500 shadow-lg shadow-orange-500/40' : 'bg-slate-300'}`}>
                  <div className={`w-7 h-7 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDark ? 'translate-x-9' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}