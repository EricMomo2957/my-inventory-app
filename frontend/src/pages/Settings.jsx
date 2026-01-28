import React, { useState } from 'react';

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [fontSize, setFontSize] = useState('Medium');
  const [threshold, setThreshold] = useState(10);

  return (
    <div className="p-6 h-screen bg-[#0b1120] text-slate-300 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-white">Settings</h1>
      </header>

      <div className="max-w-4xl space-y-6 pb-12">
        
        {/* DISPLAY CARD */}
        <section className="bg-[#111827] rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="bg-[#1e293b]/30 px-6 py-3 border-b border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Display</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-bold">Font Size</p>
                <p className="text-xs text-slate-500">Adjust the interface text size.</p>
              </div>
              <select 
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="bg-[#0b1120] border border-slate-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500"
              >
                <option>Small</option>
                <option>Medium</option>
                <option>Large</option>
              </select>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-800/50">
              <div>
                <p className="text-white font-bold">Dark Mode</p>
                <p className="text-xs text-slate-500">Switch between light and dark themes.</p>
              </div>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-blue-600' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${darkMode ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </section>

        {/* INVENTORY PREFERENCES */}
        <section className="bg-[#111827] rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="bg-[#1e293b]/30 px-6 py-3 border-b border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Inventory Preferences</h3>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-bold">Low Stock Threshold</p>
                <p className="text-xs text-slate-500">Current threshold: <span className="text-blue-400 font-bold">{threshold} units</span></p>
              </div>
              <input 
                type="number" 
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-20 bg-[#0b1120] border border-slate-700 text-white text-sm rounded-lg px-3 py-2 text-center outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </section>

        {/* LANGUAGE */}
        <section className="bg-[#111827] rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="bg-[#1e293b]/30 px-6 py-3 border-b border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Language</h3>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-bold">Interface Language</p>
                <p className="text-xs text-slate-500">Select your preferred language.</p>
              </div>
              <button className="bg-[#1e293b] border border-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-700 transition-all">
                English
              </button>
            </div>
          </div>
        </section>

        {/* ACCOUNT MANAGEMENT */}
        <section className="bg-[#111827] rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="bg-[#1e293b]/30 px-6 py-3 border-b border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Account Management</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-bold">Change Password</p>
                <p className="text-xs text-slate-500">Ensure your account stays secure.</p>
              </div>
              <button className="bg-[#1e293b] border border-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-700 transition-all">
                Change Password
              </button>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-800/50">
              <div>
                <p className="text-white font-bold">Deactivate Account</p>
                <p className="text-xs text-slate-500">Permanently remove your access.</p>
              </div>
              <button className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-500 hover:text-white transition-all">
                Deactivate Account
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}