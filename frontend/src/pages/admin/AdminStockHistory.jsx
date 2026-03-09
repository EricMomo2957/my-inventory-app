import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function AdminStockHistory() {
  const { isDark } = useTheme();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch stock history from the database
  const fetchStockHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/stock-history');
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching stock history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockHistory();
  }, []);

  return (
    <div className={`p-8 space-y-8 min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#0b1120]' : 'bg-slate-50'}`}>
      
      {/* Header Section */}
      <header>
        <h1 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Stock Movement Audit
        </h1>
        <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Tracking inventory updates by Admin and Clerk accounts
        </p>
      </header>

      {/* History Table Card */}
      <div className={`rounded-3xl border p-6 shadow-sm transition-colors duration-500 ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className={`${isDark ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-50 text-slate-500'} font-black uppercase tracking-widest text-[10px]`}>
              <tr>
                <th className="p-4 px-6">Timestamp</th>
                <th className="p-4 px-6">Staff Member</th>
                <th className="p-4 px-6">Product ID</th>
                <th className="p-4 px-6">Action</th>
                <th className="p-4 px-6 text-right">Adjustment</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-500 font-bold animate-pulse">
                    Retrieving Audit Logs...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-500 italic">
                    No stock movements recorded yet.
                  </td>
                </tr>
              ) : (
                history.map((log) => (
                  <tr key={log.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50 text-slate-300' : 'hover:bg-slate-50 text-slate-600'}`}>
                    <td className="p-4 px-6 text-[11px] font-mono">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold">
                          {log.user_name?.substring(0, 1).toUpperCase()}
                        </div>
                        <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {log.user_name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 px-6 font-medium text-orange-500">
                      #{log.product_id}
                    </td>
                    <td className="p-4 px-6">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ${
                        log.action_type === 'RESTOCK' 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {log.action_type || 'UPDATE'}
                      </span>
                    </td>
                    <td className={`p-4 px-6 text-right font-black ${log.change_amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {log.change_amount > 0 ? `+${log.change_amount}` : log.change_amount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}