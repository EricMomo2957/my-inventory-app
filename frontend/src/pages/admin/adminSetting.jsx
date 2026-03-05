import React, { useState } from 'react';

export default function AdminSetting() {
  // Pull existing info from localStorage (simulating DB fetch)
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
    // Logic to save to DB would go here
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

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <header className="p-8 border-b border-slate-200 dark:border-slate-800/50">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Account Settings</h1>
        <p className="text-slate-500 text-sm font-medium">Manage your administrative profile and security</p>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-4xl text-white font-black border-4 border-slate-50 dark:border-slate-800 overflow-hidden">
                  {profile.profileImage ? (
                    <img src={profile.profileImage} alt="Admin" className="w-full h-full object-cover" />
                  ) : profile.fullName.charAt(0)}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-[#4361ee] text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                  📷
                </button>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{profile.fullName}</h2>
              <p className="text-sm text-blue-500 font-bold uppercase tracking-widest">{profile.department}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Admin ID</p>
                <p className="text-slate-900 dark:text-slate-300 font-mono font-bold">{profile.adminId}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Forms */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* General Information */}
            <section className="bg-white dark:bg-[#111827] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span>👤</span> General Information
              </h3>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white focus:border-[#4361ee] outline-none"
                      value={profile.fullName}
                      onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Email Address</label>
                    <input 
                      type="email" 
                      disabled
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-400 cursor-not-allowed"
                      value={profile.email}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Department</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white focus:border-[#4361ee] outline-none"
                    value={profile.department}
                    onChange={(e) => setProfile({...profile, department: e.target.value})}
                  />
                </div>
                <button type="submit" className="px-8 py-4 bg-[#4361ee] text-white rounded-2xl font-bold shadow-lg hover:bg-blue-500 transition-colors active:scale-95">
                  Save Changes
                </button>
              </form>
            </section>

            {/* Security */}
            <section className="bg-white dark:bg-[#111827] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span>🔒</span> Security & Password
              </h3>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Current Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white focus:border-[#4361ee] outline-none"
                    value={passwords.current}
                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2">New Password</label>
                    <input 
                      type="password" 
                      placeholder="Enter new password"
                      className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white focus:border-[#4361ee] outline-none"
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Confirm New Password</label>
                    <input 
                      type="password" 
                      placeholder="Repeat new password"
                      className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white focus:border-[#4361ee] outline-none"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    />
                  </div>
                </div>
                <button type="submit" className="px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors active:scale-95">
                  Update Password
                </button>
              </form>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}