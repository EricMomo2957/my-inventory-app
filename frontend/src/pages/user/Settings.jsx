import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const [fontSize, setFontSize] = useState('Medium');
  const [threshold, setThreshold] = useState(10);

  // Modal States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  // Form States
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match!");
      return;
    }
    // Logic to call your API /api/users/update-password
    console.log("Changing password...", passwords);
    setIsPasswordModalOpen(false);
    setPasswords({ current: '', new: '', confirm: '' });
    alert("Password updated successfully!");
  };

  const handleDeactivation = () => {
    // Logic to call your API /api/users/deactivate
    console.log("Account deactivated");
    setIsDeactivateModalOpen(false);
    // Usually, you would redirect to login here: window.location.href = '/login';
  };

  return (
    <div className="p-6 min-h-screen bg-slate-50 dark:bg-[#0b1120] text-slate-600 dark:text-slate-300 transition-colors duration-300 overflow-y-auto flex flex-col items-center">
      
      <div className="w-full max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Settings</h1>
        </header>

        <div className="space-y-6 pb-12">
          
          {/* DISPLAY CARD */}
          <section className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
            <div className="bg-slate-100 dark:bg-[#1e293b]/30 px-6 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Display</h3>
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

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800/50">
                <div>
                  <p className="text-slate-900 dark:text-white font-bold">Dark Mode</p>
                  <p className="text-xs text-slate-500">Switch between light and dark themes.</p>
                </div>
                <button 
                  onClick={toggleTheme}
                  className={`w-12 h-6 rounded-full transition-all relative ${isDark ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${isDark ? 'translate-x-7' : 'translate-x-1'}`}></div>
                </button>
              </div>
            </div>
          </section>

          {/* INVENTORY PREFERENCES */}
          <section className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
            <div className="bg-slate-100 dark:bg-[#1e293b]/30 px-6 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Inventory Preferences</h3>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-slate-900 dark:text-white font-bold">Low Stock Threshold</p>
                  <p className="text-xs text-slate-500">Current threshold: <span className="text-blue-500 dark:text-blue-400 font-bold">{threshold} units</span></p>
                </div>
                <input 
                  type="number" 
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-20 bg-slate-50 dark:bg-[#0b1120] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg px-3 py-2 text-center outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </section>

          {/* LANGUAGE */}
          <section className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
            <div className="bg-slate-100 dark:bg-[#1e293b]/30 px-6 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Language</h3>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-slate-900 dark:text-white font-bold">Interface Language</p>
                  <p className="text-xs text-slate-500">Select your preferred language.</p>
                </div>
                <button className="bg-slate-100 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                  English
                </button>
              </div>
            </div>
          </section>

          {/* ACCOUNT MANAGEMENT */}
          <section className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
            <div className="bg-slate-100 dark:bg-[#1e293b]/30 px-6 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Account Management</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-slate-900 dark:text-white font-bold">Change Password</p>
                  <p className="text-xs text-slate-500">Ensure your account stays secure.</p>
                </div>
                <button 
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="bg-slate-100 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Change Password
                </button>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800/50">
                <div>
                  <p className="text-slate-900 dark:text-white font-bold">Deactivate Account</p>
                  <p className="text-xs text-slate-500">Permanently remove your access.</p>
                </div>
                <button 
                  onClick={() => setIsDeactivateModalOpen(true)}
                  className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 dark:hover:bg-red-500 hover:text-white transition-all"
                >
                  Deactivate Account
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* PASSWORD CHANGE MODAL */}
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

      {/* DEACTIVATE MODAL */}
      {isDeactivateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-red-900/50 w-full max-w-sm rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-white mb-2">Are you sure?</h3>
            <p className="text-slate-400 text-sm mb-8">This action is permanent. You will lose access to the inventory system immediately.</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleDeactivation} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs uppercase">Yes, Deactivate My Account</button>
              <button onClick={() => setIsDeactivateModalOpen(false)} className="w-full py-3 bg-slate-800 text-white rounded-lg font-bold text-xs uppercase">I've changed my mind</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}