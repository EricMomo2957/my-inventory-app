import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function AdminStockHistory() {
  const { isDark } = useTheme();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch stock history
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

  // Helper function for styling action types
  const getActionStyles = (type) => {
    switch (type?.toUpperCase()) {
      case 'RESTOCK': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'SALE': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'DELETE': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    }
  };

  return (
    <div className={`p-8 space-y-8 min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#0b1120]' : 'bg-slate-50'}`}>
      
      <header>
        <h1 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Stock Movement Audit</h1>
        <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Detailed tracking of all product adjustments in the inventory system.
        </p>
      </header>

      <div className={`rounded-3xl border shadow-sm ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className={`${isDark ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-50 text-slate-500'} font-black uppercase tracking-widest text-[10px]`}>
              <tr>
                <th className="p-5">Timestamp</th>
                <th className="p-5">Staff Member</th>
                <th className="p-5">Product ID</th>
                <th className="p-5">Action Type</th>
                <th className="p-5 text-right">Adjustment</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center font-bold animate-pulse text-slate-500">Loading Logs...</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-500 italic">No history found.</td></tr>
              ) : (
                history.map((log) => (
                  <tr key={log.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                    <td className="p-5 text-[11px] font-mono whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">
                          {log.user_name?.charAt(0).toUpperCase()}
                        </div>
                        <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{log.user_name}</span>
                      </div>
                    </td>
                    <td className="p-5 font-bold text-orange-500">#{log.product_id}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getActionStyles(log.action_type)}`}>
                        {log.action_type || 'UPDATE'}
                      </span>
                    </td>
                    <td className={`p-5 text-right font-black text-base ${log.change_amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
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