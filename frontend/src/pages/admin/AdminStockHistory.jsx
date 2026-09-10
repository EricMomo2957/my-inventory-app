import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { History, ArrowUpRight, ArrowDownRight, RefreshCw, Layers } from 'lucide-react';

export default function AdminStockHistory() {
  const { isDark } = useTheme();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = () => {
    setLoading(true);
    fetch('http://localhost:3000/api/stock-history')
      .then(res => res.json())
      .then(data => {
        setHistory(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching history:", err);
        setHistory([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-300 p-8 space-y-7 ${
      isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Stock Movement & Audit Trail
          </h1>
          <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Immutable transaction records for inventory restocks, deductions, and sales
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold ${
            isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
          }`}>
            {history.length} Total Logs
          </div>
          
          <button 
            onClick={fetchHistory}
            className={`p-2 rounded-xl border transition-colors ${
              isDark ? 'border-slate-800 bg-slate-800 hover:bg-slate-700 text-slate-200' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
            title="Refresh Logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className={`rounded-2xl border overflow-hidden shadow-xs transition-colors ${
        isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`text-[11px] font-bold uppercase tracking-wider border-b ${
              isDark ? 'bg-slate-900/60 text-slate-400 border-slate-800' : 'bg-[#fcfdfd] text-slate-500 border-slate-100'
            }`}>
              <th className="py-4 px-6">Product Ref</th>
              <th className="py-4 px-6">Staff / Actor</th>
              <th className="py-4 px-6">Action Type</th>
              <th className="py-4 px-6 text-center">Amount Shift</th>
              <th className="py-4 px-6 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className={`divide-y text-xs font-medium ${
            isDark ? 'divide-slate-800/80' : 'divide-slate-100'
          }`}>
            {loading ? (
              <tr>
                <td colSpan="5" className="py-16 text-center text-slate-400 font-bold uppercase tracking-wider text-xs">
                  Loading Audit Logs...
                </td>
              </tr>
            ) : history.length > 0 ? (
              history.map((log) => {
                const isRestock = log.action_type === 'restock' || (log.change_amount > 0);
                return (
                  <tr key={log.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/70'}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-mono text-[10px]">
                          #{log.product_id || '—'}
                        </div>
                        <span className="font-mono text-xs text-slate-400">
                          {log.product_name ? log.product_name : `Product #${log.product_id}`}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#00684a]/10 text-[#00684a] dark:text-emerald-400 flex items-center justify-center text-xs font-extrabold">
                          {log.user_name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {log.user_name || 'System / Staff'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                        isRestock 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800' 
                          : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800'
                      }`}>
                        {isRestock ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {isRestock ? 'Restock / Inflow' : 'Sale / Deduction'}
                      </span>
                    </td>
                    <td className={`py-4 px-6 text-center font-extrabold ${
                      isRestock ? 'text-[#00684a] dark:text-emerald-400' : 'text-red-500'
                    }`}>
                      {isRestock ? '+' : '-'}{Math.abs(log.change_amount || 1)}
                    </td>
                    <td className="py-4 px-6 text-right text-xs text-slate-400 font-medium">
                      {new Date(log.created_at || Date.now()).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="py-16 text-center text-slate-400 text-xs">
                  No stock movement history recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}