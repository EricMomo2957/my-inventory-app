import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const [fontSize, setFontSize] = useState('Medium');
  
  // 1. Initialize threshold from localStorage or default to 10
  const [threshold, setThreshold] = useState(() => {
    return localStorage.getItem('lowStockThreshold') || 10;
  });

  // Modal States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  // Form States
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  // 2. Persist Threshold Changes
  const handleThresholdChange = (val) => {
    setThreshold(val);
    localStorage.setItem('lowStockThreshold', val);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match!");
      return;
    }
    console.log("Changing password...", passwords);
    setIsPasswordModalOpen(false);
    setPasswords({ current: '', new: '', confirm: '' });
    alert("Password updated successfully!");
  };

  const handleDeactivation = () => {
    console.log("Account deactivated");
    setIsDeactivateModalOpen(false);
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-300 overflow-y-auto flex flex-col items-center ${
      isDark ? 'bg-[#0b1120] text-slate-300' : 'bg-slate-50 text-slate-600'
    }`}>
      
      <div className="w-full max-w-4xl">
        <header className="mb-8">
          <h1 className={`text-3xl font-black uppercase tracking-tighter ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Settings
          </h1>
        </header>

        <div className="space-y-6 pb-12">
          
          {/* DISPLAY CARD */}
          <section className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
            <div className="bg-slate-100 dark:bg-[#1e293b]/30 px-6 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Display & Theme</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-slate-900 dark:text-white font-bold">Font Size</p>
                  <p className="text-xs text-slate-500">Adjust the interface text size.</p>
                </div>
                <select 
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="bg-slate-50 dark:bg-[#0b1120] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option>Small</option>
                  <option>Medium</option>
                  <option>Large</option>
                </select>
              </div>

              {/* DARK MODE TOGGLE */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800/50">
                <div>
                  <p className="text-slate-900 dark:text-white font-bold">Dark Mode</p>
                  <p className="text-xs text-slate-500">Currently using: <span className="text-blue-500 font-black uppercase">{isDark ? 'Dark' : 'Light'}</span></p>
                </div>
                <button 
                  onClick={toggleTheme}
                  className={`w-14 h-7 rounded-full transition-all relative ${isDark ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${isDark ? 'translate-x-8' : 'translate-x-1'}`}>
                    {isDark ? '🌙' : '☀️'}
                  </div>
                </button>
              </div>
            </div>
          </section>

          {/* INVENTORY PREFERENCES */}
          <section className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
            <div className="bg-slate-100 dark:bg-[#1e293b]/30 px-6 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Inventory Engine</h3>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-slate-900 dark:text-white font-bold">Low Stock Threshold</p>
                  <p className="text-xs text-slate-500">Alert triggers when stock falls below <span className="text-blue-500 font-bold">{threshold}</span>.</p>
                </div>
                <input 
                  type="number" 
                  value={threshold}
                  onChange={(e) => handleThresholdChange(e.target.value)}
                  className="w-20 bg-slate-50 dark:bg-[#0b1120] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg px-3 py-2 text-center outline-none focus:border-blue-500 transition-all font-bold"
                />
              </div>
            </div>
          </section>

          {/* ACCOUNT MANAGEMENT */}
          <section className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
            <div className="bg-slate-100 dark:bg-[#1e293b]/30 px-6 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Security</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-slate-900 dark:text-white font-bold">Change Password</p>
                  <p className="text-xs text-slate-500">Keep your account secure.</p>
                </div>
                <button 
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="bg-slate-100 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
                >
                  Manage Security
                </button>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800/50">
                <div>
                  <p className="text-slate-900 dark:text-white font-bold">Account Deactivation</p>
                  <p className="text-xs text-slate-500">This will delete your local profile data.</p>
                </div>
                <button 
                  onClick={() => setIsDeactivateModalOpen(true)}
                  className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 dark:hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* --- MODALS --- */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-slate-800 w-full max-w-md rounded-2xl p-8 shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-6">Security Update</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
               <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Current Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                />
              </div>
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-[10px] font-black text-blue-500 uppercase mb-1">New Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-blue-500 uppercase mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                />
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="flex-1 py-3 bg-slate-800 text-white rounded-lg font-bold text-xs uppercase">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeactivateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           <div className="bg-[#111827] border border-red-900/50 w-full max-w-sm rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">!</div>
            <h3 className="text-xl font-black text-white mb-2">Are you sure?</h3>
            <p className="text-slate-400 text-sm mb-8">This action is permanent. You will lose access to the inventory system immediately.</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleDeactivation} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs uppercase transition-colors">Yes, Deactivate My Account</button>
              <button onClick={() => setIsDeactivateModalOpen(false)} className="w-full py-3 bg-slate-800 text-white rounded-lg font-bold text-xs uppercase">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}