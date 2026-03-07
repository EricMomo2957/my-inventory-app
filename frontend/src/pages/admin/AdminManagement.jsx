import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function AdminManagement() {
  const { isDark } = useTheme();

  return (
    // We set the background color directly here to ensure the page has a solid base
    <div className={`p-8 space-y-8 min-h-screen transition-colors duration-500 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      {/* Header Section */}
      <header className="flex justify-between items-end">
        <div>
          {/* Explicit color injection based on isDark state */}
          <h1 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Admin Management
          </h1>
          <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Restricted Area: Administrators Only
          </p>
        </div>
        <button className="bg-orange-500 hover:bg-orange-400 text-white px-6 py-2.5 rounded-xl font-bold shadow-xl shadow-orange-600/20 active:scale-95 transition-all">
          + New User
        </button>
      </header>
      
      {/* Management Card */}
      <div className={`rounded-[2.5rem] border p-8 shadow-xl transition-colors duration-500 ${isDark ? 'bg-[#111827] border-orange-500/20' : 'bg-white border-slate-200'}`}>
        <div className={`flex items-center gap-4 p-4 rounded-2xl border ${isDark ? 'text-orange-500 bg-orange-500/10 border-orange-500/20' : 'text-orange-600 bg-orange-50 border-orange-100'}`}>
          <span className="text-2xl">🛡️</span>
          <p className="text-sm font-bold">
            You are currently managing system permissions and high-level security roles.
          </p>
        </div>
        
        <div className="mt-8">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2 mb-4">Security Overview</h3>
            <div className={`p-4 border border-dashed rounded-2xl text-sm italic ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                Manage user access, API keys, and security audits from this dashboard.
            </div>
        </div>
      </div>
    </div>
  );
}