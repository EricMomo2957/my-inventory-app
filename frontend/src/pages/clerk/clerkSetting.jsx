import React, { useState, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext'; 

export default function ClerkSetting() {
  const { isDark, toggleTheme } = useTheme();

  const [receiptAutoPrint, setReceiptAutoPrint] = useState(true);
  const [scannerBeep, setScannerBeep] = useState(true);

  const [employeeId] = useState(() => Math.floor(1000 + Math.random() * 9000));

  const userData = useMemo(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : { name: 'Clerk' };
    } catch (error) {
      console.error("Error parsing user data:", error);
      return { name: 'Clerk' };
    }
  }, []);

  return (
    // The "dark" class here ensures this specific component reacts, 
    // but the global fix must happen in your Context Provider.
    <div className={`p-6 min-h-screen transition-colors duration-300 flex flex-col items-center ${isDark ? 'dark bg-[#0b1120]' : 'bg-slate-50'}`}>
      <div className="w-full max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Clerk Settings</h1>
        </header>

        <div className="space-y-6">
          {/* PROFILE SECTION */}
          <section className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="bg-slate-100 dark:bg-[#1e293b]/30 px-6 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Profile</h3>
            </div>
            <div className="p-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-linear-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black">
                {userData.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-slate-900 dark:text-white font-bold text-lg">{userData.name}</p>
                <p className="text-xs text-slate-500">Employee ID: #STF-{employeeId}</p>
              </div>
            </div>
          </section>

          {/* PREFERENCES SECTION */}
          <section className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="bg-slate-100 dark:bg-[#1e293b]/30 px-6 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Preferences</h3>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="flex justify-between items-center">
                <p className="font-bold text-slate-900 dark:text-white">Auto-Print Receipts</p>
                <button 
                  onClick={() => setReceiptAutoPrint(!receiptAutoPrint)}
                  className={`w-12 h-6 rounded-full transition-all relative ${receiptAutoPrint ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${receiptAutoPrint ? 'translate-x-7' : 'translate-x-1'}`}></div>
                </button>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800/50">
                <p className="font-bold text-slate-900 dark:text-white">Scanner Beep</p>
                <button 
                  onClick={() => setScannerBeep(!scannerBeep)}
                  className={`w-12 h-6 rounded-full transition-all relative ${scannerBeep ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${scannerBeep ? 'translate-x-7' : 'translate-x-1'}`}></div>
                </button>
              </div>

              {/* Dark Mode Toggle */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800/50">
                <p className="font-bold text-slate-900 dark:text-white">Dark Mode</p>
                <button 
                  onClick={toggleTheme}
                  className={`w-12 h-6 rounded-full transition-all relative ${isDark ? 'bg-indigo-600' : 'bg-slate-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDark ? 'translate-x-7' : 'translate-x-1'}`}></div>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}