import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function AdminStockHistory() {
  const { isDark } = useTheme();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/stock-history')
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching history:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-300 ${
      isDark ? 'bg-[#0b1120]' : 'bg-[#f8fafc]'
    }`}>
      {/* Header Section */}
      <header className={`p-8 border-b transition-colors duration-300 ${
        isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Stock Movement
            </h1>
            <p className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Audit logs for all inventory changes
            </p>
          </div>
          <div className={`px-4 py-2 rounded-xl border text-xs font-bold ${
            isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            {history.length} Total Logs
          </div>
        </div>
      </header>

      {/* Table Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className={`rounded-3xl border overflow-hidden shadow-sm transition-colors duration-300 ${
          isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <table className="w-full text-left border-collapse">
            <thead className={`text-[10px] font-black uppercase tracking-widest border-b transition-colors ${
              isDark ? 'bg-slate-900/80 text-slate-500 border-slate-800' : 'bg-slate-50 text-slate-400 border-slate-100'
            }`}>
              <tr>
                <th className="p-6">Product ID</th>
                <th className="p-6">User / Admin</th>
                <th className="p-6">Action Type</th>
                <th className="p-6 text-center">Amount Change</th>
                <th className="p-6 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors ${isDark ? 'divide-slate-800' : 'divide-slate-50'}`}>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                    Loading History Data...
                  </td>
                </tr>
              ) : history.length > 0 ? (
                history.map((log) => (
                  <tr key={log.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/50'}`}>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-lg font-mono text-xs ${
                        isDark ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'
                      }`}>
                        #{log.product_id}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-black">
                          {log.user_name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                          {log.user_name}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        log.action_type === 'restock' 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {log.action_type === 'restock' ? '⬆ Restock' : '⬇ Sale/Removal'}
                      </span>
                    </td>
                    <td className={`p-6 text-center font-black ${
                      log.action_type === 'restock' ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {log.action_type === 'restock' ? '+' : '-'}{log.change_amount}
                    </td>
                    <td className={`p-6 text-right text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {new Date(log.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                    No movement logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}