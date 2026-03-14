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
    <div className={`min-h-screen p-4 md:p-8 flex items-center justify-center transition-colors duration-500 ${isDark ? 'bg-[#0b1120]' : 'bg-slate-100'}`}>
      <div className={`w-full max-w-5xl flex flex-col md:flex-row rounded-[3rem] shadow-2xl border overflow-hidden transition-all duration-500 ${isDark ? 'bg-[#111827] border-slate-800 shadow-black/50' : 'bg-white border-white shadow-slate-300'}`}>
        
        {/* Sidebar Navigation */}
        <aside className={`w-full md:w-72 p-8 flex flex-col justify-between ${isDark ? 'bg-slate-900/40' : 'bg-slate-50'}`}>
          <div>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
                {profile.fullName.charAt(0)}
              </div>
              <div>
                <h2 className={`font-black text-sm leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile.fullName}</h2>
                <p className="text-[10px] uppercase tracking-widest text-orange-500 font-bold">{profile.department}</p>
              </div>
            </div>

            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                      : `hover:bg-slate-200/50 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-10">
            <button onClick={handleDeleteAccount} className="w-full py-3 rounded-2xl border-2 border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-xs font-black uppercase tracking-widest transition-all">
              Delete Account
            </button>
          </div>
        </aside>

        {/* Dynamic Content Area */}
        <main className="flex-1 p-8 md:p-12 overflow-y-auto">
          {activeTab === 'profile' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>General Profile</h3>
              <p className="text-slate-500 text-sm mb-8">Update your public identity and work department.</p>
              
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="group space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Display Name</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-[#0b1120] border-2 border-transparent focus:border-orange-500 rounded-2xl p-4 text-slate-900 dark:text-white outline-none transition-all" value={profile.fullName} onChange={(e) => setProfile({...profile, fullName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                  <input type="email" disabled className="w-full bg-slate-100/50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-400 cursor-not-allowed italic" value={profile.email} />
                </div>
                <button type="submit" className="px-10 py-4 bg-orange-500 text-white rounded-2xl font-black shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all">Save Changes</button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Security Settings</h3>
              <p className="text-slate-500 text-sm mb-8">Ensure your account stays protected with a strong password.</p>
              
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <input type="password" placeholder="Current Password" className="w-full bg-slate-50 dark:bg-[#0b1120] border-2 border-transparent focus:border-orange-500 rounded-2xl p-4 text-slate-900 dark:text-white outline-none transition-all" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="password" placeholder="New Password" className="w-full bg-slate-50 dark:bg-[#0b1120] border-2 border-transparent focus:border-orange-500 rounded-2xl p-4 text-slate-900 dark:text-white outline-none transition-all" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} />
                  <input type="password" placeholder="Confirm" className="w-full bg-slate-50 dark:bg-[#0b1120] border-2 border-transparent focus:border-orange-500 rounded-2xl p-4 text-slate-900 dark:text-white outline-none transition-all" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} />
                </div>
                <button type="submit" className={`px-10 py-4 rounded-2xl font-black transition-all ${isDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}>Update Security</button>
              </form>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Appearance</h3>
              <p className="text-slate-500 text-sm mb-8">Customize how Inventory Pro looks on your device.</p>
              
              <div className={`p-8 rounded-4xl border flex items-center justify-between ${isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Dark Theme</h4>
                  <p className="text-xs text-slate-500">Switch between light and dark modes</p>
                </div>
                <button onClick={toggleTheme} className={`w-16 h-9 rounded-full transition-all flex items-center px-1.5 ${isDark ? 'bg-orange-500' : 'bg-slate-300'}`}>
                  <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform ${isDark ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}